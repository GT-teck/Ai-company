import React from 'react';
import { 
  Bot, 
  Sparkles, 
  Play, 
  Code2, 
  Activity, 
  Download, 
  Maximize2, 
  RotateCcw,
  Layers,
  Zap,
  HelpCircle,
  ExternalLink,
  FolderArchive,
  Save
} from 'lucide-react';
import { GameProject, GameTemplate, ViewTab, TokenTelemetry } from '../types';
import { GAME_TEMPLATES } from '../data/templates';

interface NavbarProps {
  currentProject: GameProject;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onSelectTemplate: (template: GameTemplate) => void;
  onResetGame: () => void;
  onOpenExport: () => void;
  onOpenTokenModal: () => void;
  onOpenProfiler: () => void;
  onOpenVault: () => void;
  telemetry: TokenTelemetry;
  isGenerating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  activeTab,
  setActiveTab,
  onSelectTemplate,
  onResetGame,
  onOpenExport,
  onOpenTokenModal,
  onOpenProfiler,
  onOpenVault,
  telemetry,
  isGenerating,
}) => {
  return (
    <header className="h-14 bg-slate-950/90 border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-30 backdrop-blur-md">
      {/* Left: Brand + Project Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
                POLY<span className="text-white">SWARM</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">
                v2.5 IDE
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Project Name Badge */}
        <div className="flex items-center gap-2 max-w-[200px] md:max-w-xs">
          <span className="text-xs font-semibold text-slate-200 truncate" title={currentProject.title}>
            {currentProject.title}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-400 font-mono hidden md:inline-block">
            {currentProject.genre}
          </span>
        </div>
      </div>

      {/* Center: View Switcher Tabs */}
      <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner">
        <button
          id="tab-preview"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'preview'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Game Play</span>
        </button>

        <button
          id="tab-code"
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'code'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code Editor</span>
        </button>

        <button
          id="tab-pipeline"
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'pipeline'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Swarm</span>
        </button>

        <button
          id="tab-profiler"
          onClick={() => setActiveTab('profiler')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all hidden lg:flex ${
            activeTab === 'profiler'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>GPU Profiler</span>
        </button>
      </div>

      {/* Right Actions: Templates, Token Savings Badge, Export */}
      <div className="flex items-center gap-2">
        {/* Token Savings Indicator */}
        <button
          id="btn-token-savings"
          onClick={onOpenTokenModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/40 transition-colors text-xs font-mono"
          title="Multi-AI token savings telemetry"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-semibold hidden sm:inline">-{telemetry.savingsPercentage}% Tokens</span>
          <span className="text-[10px] text-emerald-300/70 hidden lg:inline">Saved</span>
        </button>

        {/* Templates Dropdown Menu */}
        <div className="relative group">
          <button
            id="btn-templates-menu"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Extreme Presets</span>
          </button>
          
          <div className="absolute right-0 top-full mt-1.5 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-1 font-bold">
              Browser Limit Pushers
            </div>
            {GAME_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl)}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex flex-col gap-0.5 group/item"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 group-hover/item:text-cyan-400">
                    {tmpl.title}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 font-mono">
                    {tmpl.badge}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 line-clamp-1">
                  {tmpl.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Project Vault / Save Button */}
        <button
          id="btn-project-vault"
          onClick={onOpenVault}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-200 hover:text-cyan-300 transition-colors text-xs font-medium"
          title="Project Vault: Save, Load, Fork, Checkpoints & JSON Export"
        >
          <FolderArchive className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Vault</span>
          {currentProject.history && currentProject.history.length > 0 && (
            <span className="text-[9px] px-1 py-0.2 rounded-full bg-cyan-950 text-cyan-300 font-mono font-bold">
              v{currentProject.version || 1}
            </span>
          )}
        </button>

        {/* Export / Download */}
        <button
          id="btn-export"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
};
