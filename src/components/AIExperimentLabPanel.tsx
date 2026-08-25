import React, { useState } from 'react';
import { 
  Sparkles, 
  FlaskConical, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Lightbulb, 
  MessageSquareQuote, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Clock, 
  DollarSign, 
  Filter, 
  ArrowRight,
  Zap,
  PlayCircle
} from 'lucide-react';
import { AIExperimentReport, CompanyState, SimulationTime, AgentEntity } from '../types/simulator';

interface AIExperimentLabPanelProps {
  company: CompanyState;
  agents: AgentEntity[];
  time: SimulationTime;
  onTriggerNewExperiment: () => void;
}

export const AIExperimentLabPanel: React.FC<AIExperimentLabPanelProps> = ({
  company,
  agents,
  time,
  onTriggerNewExperiment,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterOutcome, setFilterOutcome] = useState<string>('all');

  const activeExperiments = company.activeExperiments || [];
  const completedReports = company.completedReports || [];

  // Metrics
  const totalCompleted = completedReports.length;
  const positiveCount = completedReports.filter(r => r.outcomeType === 'positive').length;
  const successRate = totalCompleted > 0 ? Math.round((positiveCount / totalCompleted) * 100) : 100;
  const netFinancialImpact = completedReports.reduce((acc, r) => acc + (r.financialDelta || 0), 0);
  const totalXp = completedReports.reduce((acc, r) => acc + (r.xpAwarded || 0), 0);

  // Filtering
  const filteredReports = completedReports.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterOutcome !== 'all' && r.outcomeType !== filterOutcome) return false;
    return true;
  });

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Autonomous AI Innovation Lab
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-300 border border-indigo-700">
                  AUTONOMOUS LEARNING
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                AI staff autonomously propose hypotheses, vote to test them in live shifts, and deliver outcome reports so the team learns and improves operations.
              </p>
            </div>
          </div>

          <button
            id="trigger-brainstorm-btn"
            onClick={onTriggerNewExperiment}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Spark Innovation Hypothesis</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Total Trials Run</span>
            <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-mono font-black text-white">
            {totalCompleted + activeExperiments.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {activeExperiments.length} active in-flight
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Success Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-black text-emerald-400">
            {successRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {positiveCount} of {totalCompleted} trials approved
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Net Trial Profit</span>
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className={`text-xl font-mono font-black ${netFinancialImpact >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
            {netFinancialImpact >= 0 ? '+' : ''}${netFinancialImpact.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Generated directly from experiments
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Knowledge XP Gained</span>
            <Brain className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-black text-amber-300">
            +{totalXp} XP
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Upskilled autonomous workforce
          </div>
        </div>
      </div>

      {/* Active Running Experiments */}
      {activeExperiments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
              Live In-Progress Trials ({activeExperiments.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeExperiments.map((exp) => (
              <div 
                key={exp.id}
                className="bg-slate-900/90 border-2 border-amber-500/40 rounded-xl p-4 shadow-xl relative overflow-hidden space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                    {exp.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>{exp.progress}% Progress</span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-white">
                  {exp.title}
                </h4>

                {/* Dialogue Quotes */}
                <div className="space-y-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-indigo-900/80 text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      💡
                    </div>
                    <p className="text-slate-200 italic">
                      {exp.dialogueSuggestion}
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      🤝
                    </div>
                    <p className="text-emerald-300 font-medium italic">
                      {exp.dialogueAgreement}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${exp.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Experiment Reports Feed */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Autonomous Trial Reports & Lessons Learned ({filteredReports.length})
            </h3>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 px-1 font-bold">OUTCOME:</span>
              {(['all', 'positive', 'negative'] as const).map((outcome) => (
                <button
                  key={outcome}
                  onClick={() => setFilterOutcome(outcome)}
                  className={`px-2 py-0.5 rounded capitalize text-[11px] font-medium transition-all ${
                    filterOutcome === outcome 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {outcome === 'all' ? 'All' : outcome === 'positive' ? 'Success' : 'Suboptimal'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <FlaskConical className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-400 font-medium">
              No experiment reports recorded yet under the current filter.
            </p>
            <button
              onClick={onTriggerNewExperiment}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch First Autonomous Experiment</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const isSuccess = report.outcomeType === 'positive';
              return (
                <div 
                  key={report.id}
                  className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl transition-all space-y-3.5 ${
                    isSuccess ? 'border-emerald-500/30 hover:border-emerald-500/50' : 'border-rose-500/30 hover:border-rose-500/50'
                  }`}
                >
                  {/* Top Row: Meta & Outcome Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                        isSuccess ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-rose-950 text-rose-300 border-rose-700'
                      }`}>
                        {isSuccess ? '✓ Trial Succeeded' : '✗ Suboptimal Outcome'}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {report.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>Day {report.day} @ {report.timeString}</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${isSuccess ? 'bg-emerald-950/60 text-emerald-400' : 'bg-rose-950/60 text-rose-400'}`}>
                        {report.financialDelta >= 0 ? '+' : ''}${report.financialDelta.toFixed(2)}
                      </span>
                      <span className="text-amber-400 font-bold">
                        +{report.xpAwarded} XP
                      </span>
                    </div>
                  </div>

                  {/* Suggestion & Agreement Dialogue Box */}
                  <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/80 space-y-2 text-xs leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-900/80 text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        💡
                      </div>
                      <div className="text-slate-200">
                        <strong className="text-indigo-300">{report.suggesterName}</strong> ({report.suggesterRole}): {report.dialogueSuggestion}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        🤝
                      </div>
                      <div className="text-emerald-300">
                        <strong className="text-emerald-200">{report.approverName}</strong> ({report.approverRole}): {report.dialogueAgreement}
                      </div>
                    </div>
                  </div>

                  {/* Report Outcome & Lessons Learned */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-slate-400 uppercase text-[10px] mb-1 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Outcome Analysis</span>
                      </div>
                      <p className="text-slate-200">
                        {report.reportSummary}
                      </p>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-slate-400 uppercase text-[10px] mb-1 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-amber-400" />
                        <span>What They Learned</span>
                      </div>
                      <p className="text-amber-200/90">
                        {report.lessonsLearned}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
