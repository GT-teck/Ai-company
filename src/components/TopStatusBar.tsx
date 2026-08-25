import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Coins, 
  Clock, 
  Play, 
  Pause, 
  FastForward, 
  Volume2, 
  VolumeX, 
  Sparkles,
  FlaskConical,
  BarChart3,
  Layers,
  Award,
  DollarSign,
  ArrowUpRight,
  Bot,
  Crown,
  HelpCircle
} from 'lucide-react';
import { CompanyState, SimulationTime } from '../types/simulator';

interface TopStatusBarProps {
  company: CompanyState;
  time: SimulationTime;
  activeTab: 'world' | 'hierarchy' | 'stock' | 'expansion' | 'experiments';
  onSelectTab: (tab: 'world' | 'hierarchy' | 'stock' | 'expansion' | 'experiments') => void;
  onSetSpeed: (speed: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenTreasury: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  company,
  time,
  activeTab,
  onSelectTab,
  onSetSpeed,
  isMuted,
  onToggleMute,
  onOpenTreasury,
}) => {
  const isProfitable = company.dailyRevenue >= company.dailyExpenses;
  const activeExpCount = company.activeExperiments ? company.activeExperiments.length : 0;

  // Format digital clock
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  const timeString = `${pad(time.hour)}:${pad(time.minute)}`;

  return (
    <header className="w-full bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-200 z-40 backdrop-blur-md sticky top-0 shadow-lg">
      {/* Brand & Ticker */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm text-white tracking-tight leading-none">
                {company.name}
              </h1>
              <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-800">
                {company.ticker}
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                Tier {company.tier}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Autonomous AI Enterprise Simulator
            </p>
          </div>
        </div>

        {/* FINANCIAL TELEMETRY - Clickable Treasury Pill */}
        <div className="hidden sm:flex items-center gap-2.5 border-l border-slate-800 pl-3">
          <button
            onClick={onOpenTreasury}
            className="flex items-center gap-2 bg-slate-950/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 px-2.5 py-1 rounded-xl transition-all group text-left cursor-pointer shadow-inner"
            title="Open Detailed Treasury & Cashflow Breakdown"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <span>Liquid Cash</span>
                <span className="text-[8px] text-indigo-400 font-normal group-hover:underline">Ledger &rarr;</span>
              </div>
              <div className="font-mono font-black text-emerald-400 text-xs tracking-tight">
                ${company.cash.toLocaleString()}
              </div>
            </div>
          </button>

          {/* Daily Net Profit Indicator */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800/80">
            <div className={`w-2 h-2 rounded-full ${isProfitable ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Daily Net</div>
              <div className={`font-mono font-bold text-xs ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfitable ? '+' : ''}${company.netDailyProfit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Stock Price */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Stock Share</div>
              <div className="font-mono font-extrabold text-indigo-300 text-xs">
                ${company.stockPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
        <button
          id="nav-tab-world"
          onClick={() => onSelectTab('world')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'world'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3D World</span>
        </button>

        <button
          id="nav-tab-hierarchy"
          onClick={() => onSelectTab('hierarchy')}
          className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'hierarchy'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-300" />
          <span>Founder & Org</span>
        </button>

        <button
          id="nav-tab-stock"
          onClick={() => onSelectTab('stock')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'stock'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Stock Market</span>
        </button>

        <button
          id="nav-tab-expansion"
          onClick={() => onSelectTab('expansion')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'expansion'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>AI Expansion</span>
        </button>

        <button
          id="nav-tab-experiments"
          onClick={() => onSelectTab('experiments')}
          className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'experiments'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>AI Lab & Reports</span>
          {activeExpCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-mono font-black animate-pulse">
              {activeExpCount} active
            </span>
          )}
        </button>
      </nav>

      {/* Time & Speed Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400 font-sans font-medium">Day {time.day}</span>
          <span className="font-bold text-indigo-300">{timeString}</span>
        </div>

        <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => onSetSpeed(0)}
            className={`p-1.5 rounded-lg transition-colors ${time.speed === 0 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Pause Simulation"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSetSpeed(1)}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${time.speed === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Normal Speed (1x)"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSetSpeed(2)}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${time.speed === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Fast Speed (2x)"
          >
            2x
          </button>
          <button
            onClick={() => onSetSpeed(5)}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${time.speed === 5 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title="Hyper Speed (5x)"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
};
