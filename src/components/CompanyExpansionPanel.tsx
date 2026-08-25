import React from 'react';
import { Award, CheckCircle, Lock, Sparkles, Building2, Bot, ShieldCheck, Zap, History } from 'lucide-react';
import { CompanyState, ExpansionTier } from '../types/simulator';
import { COMPANY_TIERS } from '../simulation/companyEngine';

interface CompanyExpansionPanelProps {
  company: CompanyState;
}

export const CompanyExpansionPanel: React.FC<CompanyExpansionPanelProps> = ({
  company,
}) => {
  const currentTierInfo = COMPANY_TIERS[company.tier];
  const nextTier = (company.tier + 1) as ExpansionTier;
  const nextTierInfo = company.tier < 5 ? COMPANY_TIERS[nextTier] : null;

  // Calculate autonomous readiness
  const upgradeCost = nextTierInfo ? nextTierInfo.costToUpgrade : 0;
  const safetyBuffer = 1200;
  const targetFunds = upgradeCost + safetyBuffer;
  const progressPercent = nextTierInfo 
    ? Math.min(100, Math.round((company.cash / targetFunds) * 100))
    : 100;

  const milestones = company.upgradeMilestones || [];

  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto bg-slate-950 text-slate-100 space-y-6">
      {/* Current Tier Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded bg-indigo-900 text-indigo-300 border border-indigo-700">
              Active Tier {company.tier} / 5
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <Bot className="w-3 h-3 text-emerald-400" />
              AUTONOMOUS UPGRADES ENABLED
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5">{currentTierInfo.name}</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">{currentTierInfo.subtitle}</p>
        </div>

        {nextTierInfo ? (
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2 min-w-[280px]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Next AI Upgrade Target</span>
              <span className="font-mono font-bold text-amber-400">Tier {nextTier} (${nextTierInfo.costToUpgrade.toLocaleString()})</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Savings: ${company.cash.toFixed(0)} / ${targetFunds.toLocaleString()}</span>
              <span className="text-emerald-400 font-bold">{progressPercent}% Ready</span>
            </div>
            <p className="text-[10px] text-indigo-300 italic">
              AI leadership will automatically trigger the expansion vote once reserves clear the safety buffer.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-800">
            <CheckCircle className="w-5 h-5" />
            <span>Maximum Enterprise Tier Achieved!</span>
          </div>
        )}
      </div>

      {/* Autonomous Upgrade History Milestones */}
      {milestones.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Autonomous Expansion Milestones ({milestones.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {milestones.map((m) => (
              <div key={m.id} className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-900/80 border border-indigo-700 flex items-center justify-center font-black text-indigo-300 text-xs">
                    T{m.toTier}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Expanded to Tier {m.toTier}: {m.tierName}
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {m.announcement}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <div className="text-slate-400">Day {m.day} @ {m.timeString}</div>
                  <div className="text-rose-400 font-bold">-${m.cost.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier Roadmap Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Enterprise Evolution Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {([1, 2, 3, 4, 5] as ExpansionTier[]).map((t) => {
            const info = COMPANY_TIERS[t];
            const isUnlocked = company.tier >= t;
            const isCurrent = company.tier === t;

            return (
              <div
                key={t}
                className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-xl shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                    : isUnlocked
                    ? 'bg-slate-900/90 border-slate-700'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Tier {t}
                    </span>
                    {isUnlocked ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-base">{info.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{info.subtitle}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Max Staff Capacity:</span>
                      <strong className="text-white font-mono">{info.maxEmployees} Agents</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Shelf Aisles:</span>
                      <strong className="text-white font-mono">{info.maxShelves} Displays</strong>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unlocked Modules:</div>
                    <ul className="space-y-1">
                      {info.unlockedFeatures.map((f) => (
                        <li key={f} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center font-mono">
                    <span>Autonomous Upgrade Cost:</span>
                    <strong className="text-amber-400 font-bold">${info.costToUpgrade.toLocaleString()}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

