import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CompanySimulator3D } from './components/CompanySimulator3D';
import { TopStatusBar } from './components/TopStatusBar';
import { AgentInspectorModal } from './components/AgentInspectorModal';
import { StockMarketPanel } from './components/StockMarketPanel';
import { CompanyManagementPanel } from './components/CompanyManagementPanel';
import { CompanyExpansionPanel } from './components/CompanyExpansionPanel';
import { AIExperimentLabPanel } from './components/AIExperimentLabPanel';
import { CompanyTreasuryModal } from './components/CompanyTreasuryModal';
import { 
  AgentEntity, 
  AgentRole, 
  CompanyState, 
  SimulationTime, 
  CompetitorCompany,
  InventoryItem,
  AutonomousUpgradeMilestone,
  AIExperimentReport 
} from './types/simulator';
import { createAgent, updateAgentAI, awardAgentXP } from './simulation/agentAI';
import { 
  createInitialCompany, 
  processCustomerSale, 
  orderWholesaleRestock, 
  upgradeCompanyTier,
  generateAutonomousExperiment,
  tickAutonomousExperiments,
  checkAutonomousCompanyUpgrade,
  addCashTransaction 
} from './simulation/companyEngine';
import { INITIAL_COMPETITORS, updateStockMarketTick } from './simulation/stockMarket';
import { soundFx } from './simulation/soundEngine';
import { Sparkles, Trophy, X } from 'lucide-react';

export default function App() {
  // 1. Simulation Core State
  const [company, setCompany] = useState<CompanyState>(() => createInitialCompany());
  const [competitors, setCompetitors] = useState<CompetitorCompany[]>(INITIAL_COMPETITORS);
  const [time, setTime] = useState<SimulationTime>({
    day: 1,
    hour: 8,
    minute: 0,
    speed: 1,
    isDaytime: true,
    sunIntensity: 2.0,
  });

  // 2. Agents Roster
  const [agents, setAgents] = useState<AgentEntity[]>(() => {
    const founder = createAgent('agent-founder', 'founder', { x: 26, y: 0, z: -16 }, { x: 3, y: 0, z: 0 }, 1, 'Sophia Vance', {
      ambition: 88,
      honesty: 85,
      diligence: 92,
      intelligence: 90,
      sociability: 75,
      leadership: 90,
    });

    const residents: AgentEntity[] = [
      createAgent('agent-res-1', 'resident', { x: 34, y: 0, z: -16 }, { x: 34, y: 0, z: -16 }, 1, 'Marcus Sterling'),
      createAgent('agent-res-2', 'resident', { x: 26, y: 0, z: -6 }, { x: 26, y: 0, z: -6 }, 1, 'Elena Chen'),
      createAgent('agent-res-3', 'resident', { x: 34, y: 0, z: -6 }, { x: 34, y: 0, z: -6 }, 1, 'Lucas Kim'),
      createAgent('agent-res-4', 'resident', { x: 26, y: 0, z: 18 }, { x: 26, y: 0, z: 18 }, 1, 'Chloe Mercer'),
      createAgent('agent-res-5', 'resident', { x: 34, y: 0, z: 18 }, { x: 34, y: 0, z: 18 }, 1, 'David Novak'),
      createAgent('agent-res-6', 'resident', { x: 26, y: 0, z: -10 }, { x: 26, y: 0, z: -10 }, 1, 'Maya Sinclair'),
    ];

    return [founder, ...residents];
  });

  // 3. UI and View State
  const [activeTab, setActiveTab] = useState<'world' | 'hierarchy' | 'stock' | 'expansion' | 'experiments'>('world');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [followCamera, setFollowCamera] = useState<boolean>(false);
  const [isTreasuryOpen, setIsTreasuryOpen] = useState<boolean>(false);
  const [milestoneToast, setMilestoneToast] = useState<AutonomousUpgradeMilestone | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null;

  // 4. Main Simulation Tick Loop
  useEffect(() => {
    if (time.speed === 0) return;

    const intervalMs = Math.max(80, Math.floor(600 / time.speed));
    const timer = setInterval(() => {
      // 1. Advance Clock
      setTime((prevTime) => {
        let newMin = prevTime.minute + 10;
        let newHour = prevTime.hour;
        let newDay = prevTime.day;

        if (newMin >= 60) {
          newMin = 0;
          newHour += 1;
        }

        if (newHour >= 24) {
          newHour = 0;
          newDay += 1;

          // Daily payroll and financial audit
          setCompany((prevComp) => {
            const employees = agents.filter((a) => a.role !== 'customer' && a.role !== 'resident');
            const totalWages = employees.reduce((acc, e) => acc + e.salary, 0);
            const netProfit = prevComp.dailyRevenue - prevComp.dailyExpenses - totalWages;

            if (totalWages > 0) {
              const pad = (n: number) => (n < 10 ? `0${n}` : n);
              addCashTransaction(
                prevComp,
                'wage',
                -totalWages,
                `Daily Staff Payroll: ${employees.length} employees paid`,
                `${pad(newHour)}:${pad(newMin)}`,
                prevTime.day
              );
            }

            return {
              ...prevComp,
              cash: Math.max(0, prevComp.cash - totalWages),
              dailyRevenue: 0,
              dailyExpenses: 0,
              netDailyProfit: netProfit,
            };
          });
        }

        const isDay = newHour >= 6 && newHour < 20;
        return {
          ...prevTime,
          minute: newMin,
          hour: newHour,
          day: newDay,
          isDaytime: isDay,
        };
      });

      // 2. Customer Shopping & Checkout Loop
      setCompany((prevComp) => {
        const cashiers = agents.filter((a) => a.role === 'cashier' || a.role === 'founder');
        const shoppers = agents.filter((a) => a.role === 'customer' || a.role === 'resident');
        
        if (shoppers.length > 0 && Math.random() < 0.4) {
          const shopper = shoppers[Math.floor(Math.random() * shoppers.length)];
          processCustomerSale(prevComp, shopper, cashiers, time);
        }

        // Automated restock policy check
        if (prevComp.policyAutomatedRestock) {
          prevComp.inventory.forEach((item) => {
            if (item.stockOnShelf < 4 && item.stockInWarehouse >= 10) {
              item.stockOnShelf += 10;
              item.stockInWarehouse -= 10;
            } else if (item.stockInWarehouse < 10 && prevComp.cash > item.wholesaleCost * 20) {
              orderWholesaleRestock(prevComp, item, 20, time);
            }
          });
        }

        // Tick active autonomous experiments
        tickAutonomousExperiments(prevComp, agents, time, (report) => {
          soundFx.playPromotion();
        });

        // Autonomous Company Upgrade Check!
        // The AI agents automatically evaluate cash reserves and upgrade the store tier
        const upgradeMilestone = checkAutonomousCompanyUpgrade(prevComp, agents, time);
        if (upgradeMilestone) {
          setMilestoneToast(upgradeMilestone);
          soundFx.playPromotion();
        }

        return { ...prevComp };
      });

      // 3. Autonomous Experiment Proposer (AI agents brainstorm and test hypotheses)
      setCompany((prevComp) => {
        const activeCount = prevComp.activeExperiments ? prevComp.activeExperiments.length : 0;
        if (activeCount < 2 && Math.random() < 0.06) {
          const newExp = generateAutonomousExperiment(prevComp, agents, time);
          if (newExp) {
            prevComp.activeExperiments = [...(prevComp.activeExperiments || []), newExp];
            soundFx.playNotification();
          }
        }
        return { ...prevComp };
      });

      // 4. Update Autonomous Agent Decisions
      setAgents((prevAgents) => {
        const storePos = { x: 3, y: 0, z: 0 };
        const whPos = { x: -24, y: 0, z: -10 };

        prevAgents.forEach((agent) => {
          updateAgentAI(agent, company, prevAgents, time, storePos, whPos);
        });
        return [...prevAgents];
      });

      // 5. Update Stock Market Tickers
      setCompany((prevComp) => {
        const employees = agents.filter((a) => a.role !== 'customer' && a.role !== 'resident');
        const avgMorale = employees.length > 0
          ? employees.reduce((acc, e) => acc + e.morale, 0) / employees.length
          : 80;

        updateStockMarketTick(prevComp, competitors, avgMorale);
        return { ...prevComp };
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [time.speed, company, agents, competitors]);

  // Agent Management Handlers
  const handlePromoteAgent = (agentId: string, newRole: AgentRole) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          const salary = newRole === 'manager' ? 120 : (newRole === 'supervisor' ? 90 : 60);
          awardAgentXP(a, 'management', 25, `Promoted to ${newRole.toUpperCase()}!`, time.day);
          return {
            ...a,
            role: newRole,
            salary,
            morale: Math.min(100, a.morale + 20),
            loyalty: Math.min(100, a.loyalty + 15),
          };
        }
        return a;
      })
    );
    soundFx.playPromotion();
  };

  const handleAdjustSalary = (agentId: string, newSalary: number) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          const moraleDelta = newSalary > a.salary ? 10 : -15;
          return {
            ...a,
            salary: newSalary,
            morale: Math.min(100, Math.max(10, a.morale + moraleDelta)),
            needs: { ...a.needs, wealthSatisfaction: Math.min(100, Math.round((newSalary / 100) * 80)) },
          };
        }
        return a;
      })
    );
    soundFx.playClick();
  };

  const handleSendTraining = (agentId: string) => {
    if (company.cash < 120) return;
    setCompany((prev) => {
      const pad = (n: number) => (n < 10 ? `0${n}` : n);
      addCashTransaction(
        prev,
        'training',
        -120,
        `Employee Skill Workshop`,
        `${pad(time.hour)}:${pad(time.minute)}`,
        time.day
      );
      return { ...prev, cash: prev.cash - 120 };
    });
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          awardAgentXP(a, 'restocking', 30, 'Attended Executive Fast-Track Workshop', time.day);
          awardAgentXP(a, 'cashiering', 30, undefined, time.day);
          awardAgentXP(a, 'management', 30, undefined, time.day);
          return { ...a, morale: Math.min(100, a.morale + 15) };
        }
        return a;
      })
    );
    soundFx.playPromotion();
  };

  const handleFireAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, role: 'resident', salary: 0, isAskingPlayer: false } : a))
    );
    setSelectedAgentId(null);
    soundFx.playClick();
  };

  const handleHireApplicant = (applicant: AgentEntity, role: AgentRole, customSalary?: number) => {
    const salary = customSalary || (role === 'manager' ? 120 : (role === 'supervisor' ? 95 : (role === 'accountant' ? 85 : 60)));
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === applicant.id) {
          return {
            ...a,
            role,
            salary,
            hireDay: time.day,
            morale: 95,
            loyalty: 90,
            stress: 10,
            isAskingPlayer: false,
            memories: [
              {
                id: `mem-${Date.now()}`,
                timestamp: Date.now(),
                day: time.day,
                type: 'learning',
                description: `Hired by Founder into ${company.name} as ${role} ($${salary}/day)!`,
                impactScore: 9,
              },
              ...a.memories,
            ],
          };
        }
        return a;
      })
    );
    soundFx.playPromotion();
  };

  const handleRecruitNewCandidates = () => {
    if (company.cash < 100) return;
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const now = Date.now();
    const newApplicants: AgentEntity[] = [
      createAgent(`agent-res-${now}-1`, 'resident', { x: 26, y: 0, z: -14 }, { x: 26, y: 0, z: -14 }, time.day),
      createAgent(`agent-res-${now}-2`, 'resident', { x: 34, y: 0, z: -14 }, { x: 34, y: 0, z: -14 }, time.day),
      createAgent(`agent-res-${now}-3`, 'resident', { x: 26, y: 0, z: 20 }, { x: 26, y: 0, z: 20 }, time.day),
      createAgent(`agent-res-${now}-4`, 'resident', { x: 34, y: 0, z: 20 }, { x: 34, y: 0, z: 20 }, time.day),
    ];
    setAgents((prev) => [...prev, ...newApplicants]);
    setCompany((prev) => {
      addCashTransaction(
        prev,
        'training',
        -100,
        'Talent Recruitment Campaign (4 Candidates)',
        `${pad(time.hour)}:${pad(time.minute)}`,
        time.day
      );
      return { ...prev, cash: prev.cash - 100 };
    });
    soundFx.playCashRegister();
  };

  const handleOrderWholesale = (item: InventoryItem, qty: number) => {
    orderWholesaleRestock(company, item, qty, time);
    setCompany({ ...company });
  };

  const handleTogglePolicy = (policyKey: keyof CompanyState) => {
    setCompany((prev) => ({
      ...prev,
      [policyKey]: !prev[policyKey],
    }));
    soundFx.playClick();
  };

  const handleIssueShares = () => {
    const cashRaised = company.stockPrice * 2000;
    setCompany((prev) => {
      const pad = (n: number) => (n < 10 ? `0${n}` : n);
      addCashTransaction(
        prev,
        'shares',
        cashRaised,
        `Treasury Equity Offering (+2,000 Shares)`,
        `${pad(time.hour)}:${pad(time.minute)}`,
        time.day
      );
      return {
        ...prev,
        cash: prev.cash + cashRaised,
        sharesOutstanding: prev.sharesOutstanding + 2000,
        stockPrice: Math.max(1, +(prev.stockPrice * 0.96).toFixed(2)),
        marketCap: Math.floor((prev.sharesOutstanding + 2000) * prev.stockPrice),
      };
    });
    soundFx.playCashRegister();
  };

  const handleBuybackShares = () => {
    if (company.cash < 5000) return;
    const sharesBought = Math.floor(5000 / company.stockPrice);
    setCompany((prev) => {
      const pad = (n: number) => (n < 10 ? `0${n}` : n);
      addCashTransaction(
        prev,
        'shares',
        -5000,
        `Corporate Share Buyback (${sharesBought} Shares)`,
        `${pad(time.hour)}:${pad(time.minute)}`,
        time.day
      );
      return {
        ...prev,
        cash: prev.cash - 5000,
        sharesOutstanding: Math.max(1000, prev.sharesOutstanding - sharesBought),
        stockPrice: +(prev.stockPrice * 1.05).toFixed(2),
        marketCap: Math.floor((prev.sharesOutstanding - sharesBought) * prev.stockPrice * 1.05),
      };
    });
    soundFx.playPromotion();
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.setMuted(next);
  };

  const handleTriggerNewExperiment = () => {
    const newExp = generateAutonomousExperiment(company, agents, time);
    if (newExp) {
      setCompany((prev) => ({
        ...prev,
        activeExperiments: [...(prev.activeExperiments || []), newExp],
      }));
      soundFx.playNotification();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header & Telemetry Bar */}
      <TopStatusBar
        company={company}
        time={time}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSetSpeed={(s) => setTime((t) => ({ ...t, speed: s }))}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenTreasury={() => setIsTreasuryOpen(true)}
      />

      {/* Main Viewport Stage */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'world' && (
          <CompanySimulator3D
            agents={agents}
            company={company}
            time={time}
            selectedAgentId={selectedAgentId}
            onSelectAgent={(id) => {
              setSelectedAgentId(id);
              if (id) soundFx.playClick();
            }}
            followCamera={followCamera}
          />
        )}

        {activeTab === 'hierarchy' && (
          <CompanyManagementPanel
            agents={agents}
            company={company}
            onSelectAgent={(id) => {
              setSelectedAgentId(id);
              soundFx.playClick();
            }}
            onHireApplicant={handleHireApplicant}
            onRecruitNewCandidates={handleRecruitNewCandidates}
            onPromoteAgent={handlePromoteAgent}
            onAdjustSalary={handleAdjustSalary}
            onSendTraining={handleSendTraining}
            onFireAgent={handleFireAgent}
            onOrderWholesale={handleOrderWholesale}
            onTogglePolicy={handleTogglePolicy}
          />
        )}

        {activeTab === 'stock' && (
          <StockMarketPanel
            company={company}
            competitors={competitors}
            onIssueShares={handleIssueShares}
            onBuybackShares={handleBuybackShares}
          />
        )}

        {activeTab === 'expansion' && (
          <CompanyExpansionPanel
            company={company}
          />
        )}

        {activeTab === 'experiments' && (
          <AIExperimentLabPanel
            company={company}
            agents={agents}
            time={time}
            onTriggerNewExperiment={handleTriggerNewExperiment}
          />
        )}
      </main>

      {/* Autonomous Upgrade Celebration Toast Banner */}
      {milestoneToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-6 duration-300">
          <div className="bg-gradient-to-r from-amber-600 via-indigo-600 to-purple-600 p-0.5 rounded-2xl shadow-2xl shadow-indigo-900/60 max-w-xl">
            <div className="bg-slate-950 px-5 py-3.5 rounded-[14px] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Autonomous Milestone Achieved!</span>
                  </div>
                  <p className="text-xs text-white font-medium mt-0.5">
                    {milestoneToast.announcement}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMilestoneToast(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Dialogues */}
      <AgentInspectorModal
        agent={selectedAgent}
        allAgents={agents}
        onClose={() => setSelectedAgentId(null)}
        onPromote={handlePromoteAgent}
        onAdjustSalary={handleAdjustSalary}
        onSendTraining={handleSendTraining}
        onFire={handleFireAgent}
        onHireApplicant={handleHireApplicant}
        followCamera={followCamera}
        onToggleFollowCamera={() => setFollowCamera((prev) => !prev)}
      />

      <CompanyTreasuryModal
        isOpen={isTreasuryOpen}
        onClose={() => setIsTreasuryOpen(false)}
        company={company}
        time={time}
      />
    </div>
  );
}

