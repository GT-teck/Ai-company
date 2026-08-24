import React from 'react';
import { 
  Bot, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  ArrowRight,
  Layers,
  Database,
  CheckCircle2,
  TrendingDown,
  Clock
} from 'lucide-react';
import { SwarmAgent, TokenTelemetry, SwarmPipelineStep } from '../types';

interface AgentSwarmVisualizerProps {
  agents: SwarmAgent[];
  telemetry: TokenTelemetry;
  pipelineSteps?: SwarmPipelineStep[];
  isGenerating: boolean;
}

export const AgentSwarmVisualizer: React.FC<AgentSwarmVisualizerProps> = ({
  agents,
  telemetry,
  pipelineSteps = [],
  isGenerating,
}) => {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 bg-slate-950 text-slate-100 flex flex-col gap-6">
      {/* Top Banner: Multi-AI Swarm Architecture Overview */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                DISTRIBUTED AI ENSEMBLE
              </span>
              <span className="text-xs text-slate-400 font-mono">Token Throttler Active</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              PolySwarm Multi-AI Pipeline
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Instead of sending entire monolithic 10,000+ line codebases to expensive models on every edit, 
              PolySwarm breaks game generation into 4 ultra-specialized, lightweight AI workers. 
              This preserves your token budget by up to <span className="text-emerald-400 font-bold">85%</span> while producing 60–120 FPS games that push browser WebGL to its limits.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col">
              <span className="text-[10px] uppercase font-mono text-slate-400">Tokens Conserved</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {telemetry.tokensSaved.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-500/80 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> -{telemetry.savingsPercentage}% vs Monolith
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col">
              <span className="text-[10px] uppercase font-mono text-slate-400">Active Workers</span>
              <span className="text-lg font-black text-cyan-400 font-mono">
                4 / 4 Nodes
              </span>
              <span className="text-[10px] text-slate-400">Collaborative Swarm</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">Est. API Cost</span>
              <span className="text-lg font-black text-indigo-400 font-mono">
                ${telemetry.estimatedCostUsd}
              </span>
              <span className="text-[10px] text-slate-400">Micro-budget</span>
            </div>
          </div>
        </div>
      </div>

      {/* The 4 Worker Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const isRunning = isGenerating && agent.status === 'running';
          const isCompleted = agent.status === 'completed';

          return (
            <div
              key={agent.id}
              className={`rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between p-4 ${
                isRunning
                  ? 'bg-indigo-950/30 border-indigo-500/80 shadow-lg shadow-indigo-500/20'
                  : isCompleted
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-80'
              }`}
            >
              {/* Top Row: Icon + Status */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xl shadow-md">
                    {agent.avatar}
                  </div>
                  <div className="flex items-center gap-1">
                    {isRunning ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse">
                        <Activity className="w-3 h-3 animate-spin" /> Processing
                      </span>
                    ) : isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        Idle
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  {agent.name}
                </h3>
                <div className="text-[11px] font-medium text-cyan-400/90 font-mono mt-0.5">
                  {agent.role}
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-snug">
                  {agent.specialty}
                </p>
              </div>

              {/* Bottom Metrics */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-400">
                <span>Model: {agent.model}</span>
                <span className="text-emerald-400 font-semibold">+{agent.tokensSaved} tokens saved</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Pipeline Execution Trace */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">Swarm Execution Pipeline & Token Ledger</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {pipelineSteps.length > 0 ? `${pipelineSteps.length} stages recorded` : 'Ready for next prompt'}
          </span>
        </div>

        {pipelineSteps.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono bg-slate-950/50 rounded-lg border border-slate-800/50">
            Send a prompt in the chat dock to watch the 4 AI workers orchestrate your WebGL game in real time.
          </div>
        ) : (
          <div className="space-y-3">
            {pipelineSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start gap-3 text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{step.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{step.timestamp}</span>
                  </div>
                  <p className="text-slate-400 mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Why Token Throttling Works */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 text-xs text-slate-400 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            1. Micro-Prompting
          </h4>
          Instead of passing huge 15,000-token system contexts, each specialist receives a targeted 200-token modular task.
        </div>
        <div>
          <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            2. AST Diff Patching
          </h4>
          Edits only replace specific functions (like adding a bloom pass or particle velocity) rather than full rewrites.
        </div>
        <div>
          <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            3. Extreme Performance
          </h4>
          Worker 2 (Lumina) and Worker 3 (Chronos) specialize purely in WebGL shaders and 120 FPS math, outperforming generic code models.
        </div>
      </div>
    </div>
  );
};
