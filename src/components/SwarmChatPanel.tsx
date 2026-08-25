import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Zap, 
  Layers, 
  Cpu, 
  Sliders, 
  Flame, 
  Bot, 
  RotateCcw,
  Gauge,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, SwarmAgent, TokenTelemetry } from '../types';

interface SwarmChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string, options: {
    complexity: 'standard' | 'high' | 'extreme';
    targetFps: number;
    enableSpatialAudio: boolean;
    enablePostProcessing: boolean;
    enableParticleSwarm: boolean;
    isModificationMode?: boolean;
    detailLevel?: 'high' | 'ultra' | 'maximum';
  }) => void;
  isGenerating: boolean;
  telemetry: TokenTelemetry;
  agents: SwarmAgent[];
  currentProjectTitle: string;
}

export const SwarmChatPanel: React.FC<SwarmChatPanelProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  telemetry,
  agents,
  currentProjectTitle,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isModificationMode, setIsModificationMode] = useState(false);
  const [complexity, setComplexity] = useState<'standard' | 'high' | 'extreme'>('extreme');
  const [detailLevel, setDetailLevel] = useState<'high' | 'ultra' | 'maximum'>('maximum');
  const [targetFps, setTargetFps] = useState<number>(60);
  const [enableSpatialAudio, setEnableSpatialAudio] = useState(true);
  const [enablePostProcessing, setEnablePostProcessing] = useState(true);
  const [enableParticleSwarm, setEnableParticleSwarm] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const quickPromptChips = isModificationMode ? [
    'Add a multi-phase mothership boss with health bar',
    'Add 3 switchable weapons (Pulse, Missiles, EMP)',
    'Add XP orbs & mid-game perk upgrade selector',
    'Add circular radar minimap & combo counter',
    'Add synthwave bassline & dynamic explosion sound FX',
  ] : [
    '3D Space dogfight with 35k particles & synth audio',
    'Neon cyber racer with drifting & procedural highway',
    'Quantum bullet-hell boss fight with GPU physics',
    'Voxel raymarching universe with dynamic lighting',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onSendMessage(prompt.trim(), {
      complexity,
      targetFps,
      enableSpatialAudio,
      enablePostProcessing,
      enableParticleSwarm,
      isModificationMode,
      detailLevel,
    });
    setPrompt('');
  };

  const handleChipClick = (chipText: string) => {
    setPrompt(chipText);
  };

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-slate-950 border-r border-slate-800/80 shrink-0 select-none">
      {/* Header with Swarm Status */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Swarm Orchestrator</div>
            <div className="text-[10px] text-slate-400 font-mono">Multi-AI Limit Pushers</div>
          </div>
        </div>

        {/* Tuning Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono border transition-all ${
            showSettings
              ? 'bg-indigo-950 border-indigo-700 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3 h-3" />
          <span>Detail Tuning</span>
          {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Mode Switcher: New Game vs Make Changes / Refine */}
      <div className="p-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsModificationMode(false)}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            !isModificationMode
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>

        <button
          type="button"
          onClick={() => setIsModificationMode(true)}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            isModificationMode
              ? 'bg-gradient-to-r from-indigo-500 to-rose-600 text-white shadow-sm shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Make Changes</span>
        </button>
      </div>

      {isModificationMode && (
        <div className="px-3 py-1.5 bg-rose-950/30 border-b border-rose-900/30 text-[10px] font-mono text-rose-300 flex items-center justify-between">
          <span className="truncate">🎯 Modifying: <strong>{currentProjectTitle}</strong></span>
          <span className="shrink-0 text-rose-400 font-bold">Incremental Diff</span>
        </div>
      )}

      {/* Detail Tuning & Swarm Settings Drawer */}
      {showSettings && (
        <div className="p-3.5 bg-slate-900/95 border-b border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Game Detail Level</span>
            </span>
            <div className="flex gap-1 font-mono text-[10px]">
              {(['high', 'ultra', 'maximum'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDetailLevel(lvl)}
                  className={`px-2 py-0.5 rounded capitalize font-bold transition-all ${
                    detailLevel === lvl
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Complexity Tier</span>
            <div className="flex gap-1">
              {(['standard', 'high', 'extreme'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setComplexity(lvl)}
                  className={`px-2 py-0.5 rounded capitalize text-[10px] font-mono font-bold transition-all ${
                    complexity === lvl
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span className="text-[11px]">30,000+ GPU Particle Swarm</span>
              <input
                type="checkbox"
                checked={enableParticleSwarm}
                onChange={(e) => setEnableParticleSwarm(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span className="text-[11px]">Procedural Synth Bassline & SFX</span>
              <input
                type="checkbox"
                checked={enableSpatialAudio}
                onChange={(e) => setEnableSpatialAudio(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span className="text-[11px]">Bloom Post-Processing & Lighting</span>
              <input
                type="checkbox"
                checked={enablePostProcessing}
                onChange={(e) => setEnablePostProcessing(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 select-text">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1.5 ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {msg.sender === 'user' ? (
              <div className="bg-indigo-600/90 text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs max-w-[88%] shadow-md">
                {msg.text}
              </div>
            ) : (
              <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-sm p-3 text-xs text-slate-300 shadow-md">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>PolySwarm Output</span>
                  </div>
                  {msg.telemetry && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      -{msg.telemetry.savingsPercentage}% tokens
                    </span>
                  )}
                </div>

                <p className="leading-relaxed whitespace-pre-wrap text-slate-200">
                  {msg.text}
                </p>

                {/* Pipeline Steps if present */}
                {msg.pipelineSteps && msg.pipelineSteps.length > 0 && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
                      Swarm Execution Trace:
                    </span>
                    {msg.pipelineSteps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/60"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-slate-300">{step.agentName}:</span>
                        <span className="truncate">{step.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="bg-slate-900/90 border border-indigo-500/50 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-300 shadow-lg space-y-2 animate-pulse">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px]">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Coordinating Multi-AI Swarm...</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Atlas: Specifying Entity-Component Architecture</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Lumina: Compiling GLSL WebGL shaders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Chronos: Optimizing 120 FPS collision solver</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="p-2 border-t border-slate-800/60 bg-slate-950/40">
        <div className="text-[10px] uppercase font-mono text-slate-400 px-1 mb-1.5 font-bold flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-400" />
          <span>Push Browser Limits:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {quickPromptChips.slice(0, 3).map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="text-[10px] text-left px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors line-clamp-1"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Dock */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Prompt your game (e.g., 3D Cyberpunk racer with 50k particles)..."
            disabled={isGenerating}
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-600 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1 text-[10px] font-mono text-slate-500">
          <span>Swarm Throttler: -{telemetry.savingsPercentage}% burn</span>
          <span>Target: {targetFps} FPS</span>
        </div>
      </form>
    </div>
  );
};
