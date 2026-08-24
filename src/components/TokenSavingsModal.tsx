import React from 'react';
import { 
  X, 
  Sparkles, 
  TrendingDown, 
  Bot, 
  ShieldCheck, 
  Zap, 
  Layers,
  ArrowDownRight,
  DollarSign
} from 'lucide-react';
import { TokenTelemetry } from '../types';

interface TokenSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TokenTelemetry;
}

export const TokenSavingsModal: React.FC<TokenSavingsModalProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">PolySwarm Token Throttler</h3>
              <p className="text-[11px] text-slate-400 font-mono">Multi-AI Workload Distribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Main Stat Card */}
          <div className="rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/50 border border-emerald-800/40 p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block mb-0.5">
                Calculated Token Reduction
              </span>
              <div className="text-3xl font-black text-white font-mono">
                ~{telemetry.savingsPercentage}% LESS TOKENS
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Compared to sending 10k+ full files to monolithic frontier models
              </span>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400">Tokens Saved</span>
              <div className="text-xl font-bold text-emerald-400">
                +{telemetry.tokensSaved.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Breakdown Comparison Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] font-mono">
              Architecture Cost Comparison
            </h4>
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-[11px]">
              <div className="grid grid-cols-3 p-2.5 bg-slate-900/80 font-bold text-slate-400 border-b border-slate-800 text-[10px]">
                <div>APPROACH</div>
                <div>AVG TOKENS / EDIT</div>
                <div className="text-right">EST. COST</div>
              </div>
              <div className="grid grid-cols-3 p-2.5 border-b border-slate-900 text-rose-300/80">
                <div>Monolithic (GPT-4 / Opus)</div>
                <div>~14,000 tokens</div>
                <div className="text-right">~$0.21 / prompt</div>
              </div>
              <div className="grid grid-cols-3 p-2.5 bg-emerald-950/20 text-emerald-400 font-bold">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>PolySwarm (4 Workers)</span>
                </div>
                <div>~1,800 tokens</div>
                <div className="text-right text-emerald-300">~$0.0005 / prompt</div>
              </div>
            </div>
          </div>

          {/* How the 4 Workers Collaborate */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] font-mono">
              The 4 Swarm Principles That Conserve Your Tokens
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="font-bold text-cyan-400 block mb-1">1. Micro-Context Windows</span>
                Each worker gets isolated task specs instead of entire game files, shrinking prompt token size by 80%.
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="font-bold text-indigo-400 block mb-1">2. AST Incremental Patching</span>
                When adding features (e.g. bloom shader), only the shader block is regenerated and spliced into place.
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="font-bold text-emerald-400 block mb-1">3. Specialized Domain Prompts</span>
                Dedicated graphics and physics system instructions prevent hallucinations and failed compile loops.
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="font-bold text-amber-400 block mb-1">4. Zero Key Fallback Engine</span>
                Procedural math algorithms synthesize full games locally when offline or conserving quota.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
