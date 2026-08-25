import React, { useState } from 'react';
import { 
  X, 
  User, 
  Brain, 
  Zap, 
  Heart, 
  BookOpen, 
  Award, 
  ArrowUpRight, 
  DollarSign, 
  ShieldAlert, 
  Sparkles,
  Camera,
  Crown,
  UserPlus,
  Briefcase,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { AgentEntity, AgentRole } from '../types/simulator';

interface AgentInspectorModalProps {
  agent: AgentEntity | null;
  allAgents?: AgentEntity[];
  onClose: () => void;
  onPromote: (agentId: string, newRole: AgentRole) => void;
  onAdjustSalary: (agentId: string, newSalary: number) => void;
  onSendTraining: (agentId: string) => void;
  onFire: (agentId: string) => void;
  onHireApplicant?: (applicant: AgentEntity, role: AgentRole) => void;
  followCamera: boolean;
  onToggleFollowCamera: () => void;
}

export const AgentInspectorModal: React.FC<AgentInspectorModalProps> = ({
  agent,
  allAgents = [],
  onClose,
  onPromote,
  onAdjustSalary,
  onSendTraining,
  onFire,
  onHireApplicant,
  followCamera,
  onToggleFollowCamera,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'traits' | 'needs' | 'memories' | 'actions' | 'executive'>('skills');

  if (!agent) return null;

  const isFounder = agent.role === 'founder';
  const employees = allAgents.filter((a) => a.role !== 'customer' && a.role !== 'resident');
  const residents = allAgents.filter((a) => a.role === 'resident');

  const roleColors: Record<AgentRole, string> = {
    founder: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    manager: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    supervisor: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    cashier: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    restocker: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    cleaner: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
    accountant: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
    resident: 'bg-slate-700/20 text-slate-400 border-slate-700/50',
    customer: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-4 border-b border-slate-800 flex items-start justify-between ${
          isFounder ? 'bg-gradient-to-r from-amber-950/80 to-slate-950' : 'bg-slate-950/80'
        }`}>
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 relative"
              style={{ backgroundColor: agent.avatarColor }}
            >
              {isFounder ? (
                <Crown className="w-6 h-6 text-amber-300" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{agent.name}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${roleColors[agent.role]}`}>
                  {isFounder ? '👑 Founder & CEO' : agent.role}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Wage: <strong className="text-emerald-400 font-mono">${agent.salary}/day</strong></span>
                <span>•</span>
                <span>Morale: <strong className="text-indigo-300 font-mono">{agent.morale}%</strong></span>
                <span>•</span>
                <span>Stress: <strong className="text-rose-400 font-mono">{agent.stress}%</strong></span>
                <span>•</span>
                <span>Savings: <strong className="text-amber-300 font-mono">${agent.funds}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFollowCamera}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                followCamera 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Lock 3D Follow-Cam"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">{followCamera ? 'Tracking' : 'Follow'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Thought Bubble */}
        <div className="bg-indigo-950/40 border-b border-indigo-900/50 px-4 py-2 flex items-center gap-2 text-xs text-indigo-200">
          <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="italic">"{agent.thoughtBubble}"</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950 px-4 gap-1 overflow-x-auto">
          {isFounder && (
            <button
              onClick={() => setActiveTab('executive')}
              className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'executive' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Executive Authority</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'skills' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Skills & XP</span>
          </button>

          <button
            onClick={() => setActiveTab('traits')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'traits' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Traits</span>
          </button>

          <button
            onClick={() => setActiveTab('needs')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'needs' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Needs</span>
          </button>

          <button
            onClick={() => setActiveTab('memories')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'memories' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Memories</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'actions' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Management</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-200 space-y-4">
          {/* TAB: FOUNDER EXECUTIVE AUTHORITY */}
          {activeTab === 'executive' && isFounder && (
            <div className="space-y-4">
              {/* Team Role Management */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  <span>Reassign Staff Roles</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {employees.filter((e) => e.role !== 'founder').map((emp) => (
                    <div key={emp.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">(${emp.salary}/day)</span>
                      </div>

                      <div className="flex gap-1 text-[10px]">
                        {(['cashier', 'restocker', 'cleaner', 'accountant', 'supervisor', 'manager'] as AgentRole[]).map((r) => (
                          <button
                            key={r}
                            disabled={emp.role === r}
                            onClick={() => onPromote(emp.id, r)}
                            className={`px-1.5 py-0.5 rounded font-semibold capitalize transition-all ${
                              emp.role === r
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'bg-slate-950 text-slate-400 hover:text-white'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Hire Candidate */}
              {onHireApplicant && residents.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>Quick Hire from Town Candidates</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                    {residents.slice(0, 4).map((r) => (
                      <div key={r.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
                        <div className="flex justify-between font-bold text-white">
                          <span>{r.name}</span>
                          <span className="text-indigo-400 text-[10px]">Amb: {r.traits.ambition}</span>
                        </div>
                        <div className="flex gap-1 text-[10px]">
                          <button
                            onClick={() => onHireApplicant(r, 'cashier')}
                            className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          >
                            + Cashier
                          </button>
                          <button
                            onClick={() => onHireApplicant(r, 'restocker')}
                            className="flex-1 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                          >
                            + Restocker
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Skills increase autonomously as the agent restocks shelves, serves checkout lines, audits financial books, and manages teams.
              </p>
              
              {[
                { name: 'Restocking & Logistics', key: 'restocking', color: 'bg-cyan-500', val: agent.skills.restocking, xp: agent.skills.restockingXP },
                { name: 'Cashiering & Customer Care', key: 'cashiering', color: 'bg-emerald-500', val: agent.skills.cashiering, xp: agent.skills.cashieringXP },
                { name: 'Accounting & Ledger', key: 'accounting', color: 'bg-pink-500', val: agent.skills.accounting, xp: agent.skills.accountingXP },
                { name: 'Facility Cleaning', key: 'cleaning', color: 'bg-slate-400', val: agent.skills.cleaning, xp: agent.skills.cleaningXP },
                { name: 'Corporate Management', key: 'management', color: 'bg-indigo-500', val: agent.skills.management, xp: agent.skills.managementXP },
              ].map((s) => (
                <div key={s.key} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{s.name}</span>
                    <span className="font-mono font-bold text-white">Level {s.val} ({s.xp % 100}/100 XP)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${s.color} h-full transition-all duration-300`} style={{ width: `${s.xp % 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'traits' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Ambition', val: agent.traits.ambition, desc: 'Desire for promotion & higher salary' },
                { name: 'Diligence', val: agent.traits.diligence, desc: 'Work speed & focus on assigned duties' },
                { name: 'Honesty', val: agent.traits.honesty, desc: 'Reliable accounting & customer trust' },
                { name: 'Intelligence', val: agent.traits.intelligence, desc: 'Speed of learning from trials & player' },
                { name: 'Sociability', val: agent.traits.sociability, desc: 'Team bonding & customer friendliness' },
                { name: 'Leadership', val: agent.traits.leadership, desc: 'Inspires coworkers & coordinates workflow' },
              ].map((t) => (
                <div key={t.name} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{t.name}</span>
                    <span className="font-mono font-bold text-indigo-400">{t.val}/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'needs' && (
            <div className="space-y-3">
              {[
                { name: 'Physical Energy', val: agent.needs.energy, color: 'bg-amber-400' },
                { name: 'Satiety / Hunger', val: agent.needs.hunger, color: 'bg-emerald-400' },
                { name: 'Social Connection', val: agent.needs.social, color: 'bg-blue-400' },
                { name: 'Compensation Satisfaction', val: agent.needs.wealthSatisfaction, color: 'bg-purple-400' },
                { name: 'Workplace Comfort', val: agent.needs.comfort, color: 'bg-pink-400' },
              ].map((n) => (
                <div key={n.name} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{n.name}</span>
                    <span className="font-mono font-bold text-white">{n.val}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${n.color} h-full transition-all`} style={{ width: `${n.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'memories' && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {agent.memories.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No memories recorded yet.</p>
              ) : (
                agent.memories.map((m) => (
                  <div key={m.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex items-start gap-2.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                      Day {m.day}
                    </span>
                    <p className="text-slate-300 leading-relaxed">{m.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              {/* Promotion / Role Change */}
              {agent.role !== 'founder' ? (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                    <span>Assign Role / Promotion</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Reassign {agent.name} to a new department or management tier.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['manager', 'supervisor', 'cashier', 'restocker', 'cleaner', 'accountant'] as AgentRole[]).map((r) => (
                      <button
                        key={r}
                        disabled={agent.role === r}
                        onClick={() => onPromote(agent.id, r)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          agent.role === r
                            ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/40 text-xs text-amber-300">
                  👑 As Founder & CEO, this agent holds supreme leadership authority over company strategy and personnel.
                </div>
              )}

              {/* Adjust Salary */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Daily Wage Adjustment</span>
                  </h4>
                  <span className="font-mono font-bold text-emerald-400 text-sm">${agent.salary} / day</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="5"
                  value={agent.salary}
                  onChange={(e) => onAdjustSalary(agent.id, Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Training Workshop */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSendTraining(agent.id)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Send to Fast-Track Workshop (-$120)</span>
                </button>

                {agent.role !== 'founder' && (
                  <button
                    onClick={() => onFire(agent.id)}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Discharge</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
