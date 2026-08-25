import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Crown, 
  ShieldCheck, 
  Award, 
  Briefcase, 
  Package, 
  Vote, 
  DollarSign, 
  TrendingUp,
  Brain,
  CheckCircle,
  Clock,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  Flame,
  Star,
  CheckCircle2,
  ChevronRight,
  Zap
} from 'lucide-react';
import { AgentEntity, AgentRole, CompanyState, InventoryItem } from '../types/simulator';

interface CompanyManagementPanelProps {
  agents: AgentEntity[];
  company: CompanyState;
  onSelectAgent: (agentId: string) => void;
  onHireApplicant: (applicant: AgentEntity, role: AgentRole, customSalary?: number) => void;
  onRecruitNewCandidates?: () => void;
  onPromoteAgent: (agentId: string, newRole: AgentRole) => void;
  onAdjustSalary: (agentId: string, newSalary: number) => void;
  onSendTraining: (agentId: string) => void;
  onFireAgent: (agentId: string) => void;
  onOrderWholesale: (item: InventoryItem, qty: number) => void;
  onTogglePolicy: (policyKey: keyof CompanyState) => void;
}

export const CompanyManagementPanel: React.FC<CompanyManagementPanelProps> = ({
  agents,
  company,
  onSelectAgent,
  onHireApplicant,
  onRecruitNewCandidates,
  onPromoteAgent,
  onAdjustSalary,
  onSendTraining,
  onFireAgent,
  onOrderWholesale,
  onTogglePolicy,
}) => {
  const [activeTab, setActiveTab] = useState<'founder' | 'roster' | 'hiring' | 'orgchart' | 'inventory' | 'policies'>('founder');
  const [hiringFilterRole, setHiringFilterRole] = useState<AgentRole | 'all'>('all');
  const [candidateSearch, setCandidateSearch] = useState<string>('');

  const employees = agents.filter((a) => a.role !== 'customer' && a.role !== 'resident');
  const residents = agents.filter((a) => a.role === 'resident');

  // Hierarchy breakdown
  const founder = employees.find((a) => a.role === 'founder') || agents.find((a) => a.role === 'founder');
  const managers = employees.filter((a) => a.role === 'manager');
  const supervisors = employees.filter((a) => a.role === 'supervisor');
  const frontline = employees.filter((a) => ['cashier', 'restocker', 'cleaner', 'accountant'].includes(a.role));

  const averageMorale = employees.length > 0 
    ? Math.round(employees.reduce((acc, e) => acc + e.morale, 0) / employees.length) 
    : 0;

  const averageTrust = employees.length > 0 
    ? Math.round(employees.reduce((acc, e) => acc + e.trustInLeadership, 0) / employees.length) 
    : 0;

  const roleColors: Record<AgentRole, { bg: string; text: string; border: string }> = {
    founder: { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-500/50' },
    manager: { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-500/50' },
    supervisor: { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-500/50' },
    cashier: { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-500/50' },
    restocker: { bg: 'bg-cyan-950/80', text: 'text-cyan-300', border: 'border-cyan-500/50' },
    cleaner: { bg: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-700' },
    accountant: { bg: 'bg-pink-950/80', text: 'text-pink-300', border: 'border-pink-500/50' },
    resident: { bg: 'bg-slate-950', text: 'text-slate-400', border: 'border-slate-800' },
    customer: { bg: 'bg-orange-950/80', text: 'text-orange-300', border: 'border-orange-500/50' },
  };

  const roleSalaryGuide: Record<string, number> = {
    cashier: 60,
    restocker: 60,
    cleaner: 50,
    accountant: 80,
    supervisor: 110,
    manager: 150,
  };

  const filteredCandidates = residents.filter((r) => {
    if (!candidateSearch) return true;
    return r.name.toLowerCase().includes(candidateSearch.toLowerCase());
  });

  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto bg-slate-950 text-slate-100 space-y-6">
      {/* Top Founder Executive Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 p-5 rounded-2xl border border-amber-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-400/40">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-900 text-amber-300 border border-amber-700 uppercase tracking-wider">
                Founder Executive Office
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              {founder ? founder.name : 'Executive Leader'} (Founder & CEO)
            </h2>
            <p className="text-xs text-slate-300">
              Staff: <strong className="text-white font-mono">{employees.length}</strong> • Avg Morale: <strong className="text-emerald-400 font-mono">{averageMorale}%</strong> • Trust: <strong className="text-indigo-400 font-mono">{averageTrust}%</strong> • Liquid Capital: <strong className="text-emerald-400 font-mono">${company.cash.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            id="tab-founder-desk"
            onClick={() => setActiveTab('founder')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'founder' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Founder Desk</span>
          </button>

          <button
            id="tab-staff-roster"
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'roster' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Roles ({employees.length})</span>
          </button>

          <button
            id="tab-hiring"
            onClick={() => setActiveTab('hiring')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'hiring' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Hire Staff ({residents.length})</span>
          </button>

          <button
            id="tab-org-chart"
            onClick={() => setActiveTab('orgchart')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'orgchart' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Org Chart</span>
          </button>

          <button
            id="tab-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory</span>
          </button>

          <button
            id="tab-policies"
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'policies' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Bylaws</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FOUNDER'S EXECUTIVE DESK (Role Assignments & Direct Controls) */}
      {activeTab === 'founder' && (
        <div className="space-y-6">
          {/* QUICK STAFF ROLE REASSIGNMENT & PROMOTION MATRIX */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  <span>Executive Role Reassignments & Promotions</span>
                </h3>
                <p className="text-xs text-slate-400">
                  As Founder, you have direct authority to reassign any employee between departments and roles.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('roster')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <span>View Full Roster ({employees.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {employees.map((emp) => {
                if (emp.role === 'founder') return null;
                return (
                  <div 
                    key={emp.id}
                    className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-xs">{emp.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Wage: <strong className="text-emerald-400 font-mono">${emp.salary}/day</strong></span>
                          <span>•</span>
                          <span>Morale: <strong className="text-white font-mono">{emp.morale}%</strong></span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${roleColors[emp.role].bg} ${roleColors[emp.role].text} border ${roleColors[emp.role].border}`}>
                        {emp.role}
                      </span>
                    </div>

                    {/* Role Quick Selector */}
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Reassign Role:</div>
                      <div className="grid grid-cols-3 gap-1 text-[10px]">
                        {(['cashier', 'restocker', 'cleaner', 'accountant', 'supervisor', 'manager'] as AgentRole[]).map((r) => (
                          <button
                            key={r}
                            disabled={emp.role === r}
                            onClick={() => onPromoteAgent(emp.id, r)}
                            className={`py-1 px-1 rounded font-semibold capitalize border transition-all text-center ${
                              emp.role === r
                                ? 'bg-indigo-600 border-indigo-500 text-white font-black'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. RAPID RECRUITMENT SHORTCUT */}
          <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Need Additional Workforce?</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                There are <strong className="text-white font-mono">{residents.length}</strong> town residents looking for employment in the neighborhood.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('hiring')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>Open Hiring Pool & Applicants &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF ROSTER & ROLE MANAGEMENT */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Full Company Employee Roster ({employees.length})</h3>
              <p className="text-xs text-slate-400">
                Inspect skills, promote to management, adjust daily wages, or reassign departments.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('hiring')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Hire New Staff</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.map((emp) => (
              <div 
                key={emp.id}
                className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md"
                      style={{ backgroundColor: emp.avatarColor }}
                    >
                      {emp.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{emp.name}</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${roleColors[emp.role].bg} ${roleColors[emp.role].text} border ${roleColors[emp.role].border}`}>
                          {emp.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Current Task: <span className="text-indigo-300 italic">{emp.thoughtBubble}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectAgent(emp.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Skill Ratings */}
                <div className="grid grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded-xl text-[10px]">
                  <div>
                    <span className="text-slate-500">Restock</span>
                    <div className="font-bold text-cyan-400 font-mono">Lvl {emp.skills.restocking}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Cashier</span>
                    <div className="font-bold text-emerald-400 font-mono">Lvl {emp.skills.cashiering}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Accounting</span>
                    <div className="font-bold text-pink-400 font-mono">Lvl {emp.skills.accounting}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Mgmt</span>
                    <div className="font-bold text-indigo-400 font-mono">Lvl {emp.skills.management}</div>
                  </div>
                </div>

                {/* Role Reassignment Buttons */}
                {emp.role !== 'founder' ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between">
                      <span>Change Role Assignment:</span>
                      <span className="text-emerald-400 font-mono">${emp.salary}/day</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-[10px]">
                      {(['cashier', 'restocker', 'cleaner', 'accountant', 'supervisor', 'manager'] as AgentRole[]).map((r) => (
                        <button
                          key={r}
                          disabled={emp.role === r}
                          onClick={() => onPromoteAgent(emp.id, r)}
                          className={`py-1 rounded font-semibold capitalize border transition-all ${
                            emp.role === r
                              ? 'bg-indigo-600 border-indigo-500 text-white font-black'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => onSendTraining(emp.id)}
                        className="flex-1 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Fast-Track Workshop (-$120)</span>
                      </button>

                      <button
                        onClick={() => onFireAgent(emp.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold"
                      >
                        Discharge
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40 text-xs text-amber-300 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Company Founder & Owner — Overall Executive Authority</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HIRING & APPLICANTS POOL */}
      {activeTab === 'hiring' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Neighborhood Hiring & Applicant Pool</h3>
              <p className="text-xs text-slate-400">
                Interview residents from the city and appoint them directly into open company roles.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidate..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {onRecruitNewCandidates && (
                <button
                  onClick={onRecruitNewCandidates}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                  title="Run job advertisement to recruit fresh talent"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Advertise Vacancies (-$100)</span>
                </button>
              )}
            </div>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-800 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Unemployed Candidates in Pool</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All neighborhood residents are currently employed or occupied. Click "Advertise Vacancies" to attract candidates from surrounding districts.
              </p>
              {onRecruitNewCandidates && (
                <button
                  onClick={onRecruitNewCandidates}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Post Job Advertisement (-$100)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCandidates.map((r) => (
                <div key={r.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md"
                        style={{ backgroundColor: r.avatarColor }}
                      >
                        {r.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{r.name}</h4>
                        <p className="text-xs text-slate-400">Neighborhood Candidate</p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                      Ambition: {r.traits.ambition}/100
                    </span>
                  </div>

                  {/* Traits Matrix */}
                  <div className="grid grid-cols-4 gap-2 text-[11px] bg-slate-950 p-2.5 rounded-xl">
                    <div>
                      <span className="text-slate-500">Diligence</span>
                      <div className="font-bold text-white font-mono">{r.traits.diligence}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Honesty</span>
                      <div className="font-bold text-white font-mono">{r.traits.honesty}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Intelligence</span>
                      <div className="font-bold text-white font-mono">{r.traits.intelligence}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Leadership</span>
                      <div className="font-bold text-indigo-400 font-mono">{r.traits.leadership}</div>
                    </div>
                  </div>

                  {/* Hire Role Assignment Buttons */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Hire Direct Into Position:
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => onHireApplicant(r, 'cashier', 60)}
                        className="py-1.5 px-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex flex-col items-center"
                      >
                        <span>🛒 Cashier</span>
                        <span className="text-[9px] text-emerald-200 font-mono font-normal">$60/day</span>
                      </button>

                      <button
                        onClick={() => onHireApplicant(r, 'restocker', 60)}
                        className="py-1.5 px-2 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex flex-col items-center"
                      >
                        <span>📦 Restocker</span>
                        <span className="text-[9px] text-cyan-200 font-mono font-normal">$60/day</span>
                      </button>

                      <button
                        onClick={() => onHireApplicant(r, 'cleaner', 50)}
                        className="py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all flex flex-col items-center"
                      >
                        <span>🧹 Cleaner</span>
                        <span className="text-[9px] text-slate-300 font-mono font-normal">$50/day</span>
                      </button>

                      <button
                        onClick={() => onHireApplicant(r, 'accountant', 80)}
                        className="py-1.5 px-2 rounded-lg bg-pink-600/90 hover:bg-pink-500 text-white text-xs font-bold transition-all flex flex-col items-center"
                      >
                        <span>📊 Accountant</span>
                        <span className="text-[9px] text-pink-200 font-mono font-normal">$80/day</span>
                      </button>

                      <button
                        onClick={() => onHireApplicant(r, 'supervisor', 110)}
                        className="py-1.5 px-2 rounded-lg bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-bold transition-all flex flex-col items-center"
                      >
                        <span>🛡️ Supervisor</span>
                        <span className="text-[9px] text-purple-200 font-mono font-normal">$110/day</span>
                      </button>

                      <button
                        onClick={() => onHireApplicant(r, 'manager', 150)}
                        className="py-1.5 px-2 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold transition-all flex flex-col items-center"
                      >
                        <span>💼 Manager</span>
                        <span className="text-[9px] text-blue-200 font-mono font-normal">$150/day</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORG CHART */}
      {activeTab === 'orgchart' && (
        <div className="space-y-6">
          {/* Level 1: Founder / CEO */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-4 h-4" />
              <span>Founder & Executive Leadership</span>
            </h3>
            {founder && (
              <div 
                onClick={() => onSelectAgent(founder.id)}
                className="bg-slate-900 hover:bg-slate-800/80 p-4 rounded-xl border border-amber-500/40 cursor-pointer transition-all shadow-lg flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center font-bold text-amber-300">
                    {founder.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {founder.name} (Founder & CEO)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Leadership: <strong className="text-white font-mono">{founder.traits.leadership}/100</strong> • Morale: <strong className="text-emerald-400 font-mono">{founder.morale}%</strong>
                    </p>
                  </div>
                </div>
                <span className="text-xs text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Inspect Founder &rarr;
                </span>
              </div>
            )}
          </div>

          {/* Level 2: Managers */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span>General & Operations Managers ({managers.length})</span>
            </h3>
            {managers.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                No managers appointed yet. Promote capable staff or hire a manager directly.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {managers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectAgent(m.id)}
                    className="bg-slate-900 hover:bg-slate-800 p-3.5 rounded-xl border border-blue-500/30 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs">{m.name}</h4>
                      <p className="text-[11px] text-slate-400">Wage: ${m.salary}/day • Skill: Lvl {m.skills.management}</p>
                    </div>
                    <span className="text-[11px] text-blue-400 font-semibold">Inspect</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Level 3: Floor Supervisors */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Floor Supervisors ({supervisors.length})</span>
            </h3>
            {supervisors.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                No supervisors currently assigned. Promote experienced restockers or cashiers.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {supervisors.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => onSelectAgent(s.id)}
                    className="bg-slate-900 hover:bg-slate-800 p-3 rounded-xl border border-purple-500/30 cursor-pointer transition-all"
                  >
                    <h4 className="font-bold text-white text-xs">{s.name}</h4>
                    <p className="text-[11px] text-slate-400">Wage: ${s.salary}/day</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Level 4: Frontline Staff */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Frontline Operations ({frontline.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {frontline.map((f) => (
                <div
                  key={f.id}
                  onClick={() => onSelectAgent(f.id)}
                  className="bg-slate-900 hover:bg-slate-800 p-3 rounded-xl border border-slate-800 cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-white group-hover:text-indigo-300">{f.name}</span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {f.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Wage: <strong className="text-emerald-400 font-mono">${f.salary}/day</strong> • Morale: <strong className="text-white font-mono">{f.morale}%</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INVENTORY & SUPPLY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.inventory.map((item) => (
              <div key={item.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Retail Price</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">${item.retailPrice}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500">Shelf Stock</span>
                    <div className="font-mono font-bold text-white text-sm">
                      {item.stockOnShelf} / {item.maxShelfCapacity}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Warehouse Stock</span>
                    <div className="font-mono font-bold text-cyan-400 text-sm">
                      {item.stockInWarehouse} units
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-slate-400 font-mono">Cost: ${item.wholesaleCost}/ea</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOrderWholesale(item, 10)}
                      disabled={company.cash < item.wholesaleCost * 10}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                    >
                      +10 Units (${item.wholesaleCost * 10})
                    </button>
                    <button
                      onClick={() => onOrderWholesale(item, 25)}
                      disabled={company.cash < item.wholesaleCost * 25}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                    >
                      +25 Units (${item.wholesaleCost * 25})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: POLICIES & BYLAWS */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'policyAutomatedRestock',
                name: 'Automated Warehouse Procurement',
                desc: 'Store automatically orders 20 wholesale units when inventory runs dry.',
                active: company.policyAutomatedRestock,
              },
              {
                key: 'policyOvertimePay',
                name: '1.5x Overtime Pay Guarantee',
                desc: 'Staff receives overtime bonus for late shifts. Morale +20%, Expenses +15%.',
                active: company.policyOvertimePay,
              },
              {
                key: 'policyFreeStaffMeals',
                name: 'Catered Daily Staff Meals',
                desc: 'Provides free warm lunch daily. Drastically reduces staff hunger and stress.',
                active: company.policyFreeStaffMeals,
              },
              {
                key: 'policyTrainingWorkshops',
                name: 'Sponsored Skill Workshops',
                desc: 'Subsidizes regular staff skill growth by +50%. Costs $150/week.',
                active: company.policyTrainingWorkshops,
              },
            ].map((p) => (
              <div
                key={p.key}
                className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 shadow-lg"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{p.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                </div>
                <button
                  onClick={() => onTogglePolicy(p.key as keyof CompanyState)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    p.active
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.active ? 'Active Enacted' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
