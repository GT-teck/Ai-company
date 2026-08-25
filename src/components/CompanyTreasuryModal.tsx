import React, { useState } from 'react';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  ShieldCheck, 
  Filter, 
  Building2, 
  Zap, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { CompanyState, SimulationTime, CashTransaction } from '../types/simulator';

interface CompanyTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyState;
  time: SimulationTime;
}

export const CompanyTreasuryModal: React.FC<CompanyTreasuryModalProps> = ({
  isOpen,
  onClose,
  company,
  time,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const isProfitable = company.dailyRevenue >= company.dailyExpenses;
  const netDaily = company.dailyRevenue - company.dailyExpenses;
  const burnRatePerHour = (company.dailyExpenses / 24).toFixed(1);
  const revenuePerHour = (company.dailyRevenue / Math.max(1, time.hour)).toFixed(1);
  
  // Calculate runway in days
  const dailyBurn = Math.max(1, company.dailyExpenses);
  const runwayDays = (company.cash / dailyBurn).toFixed(1);

  const transactions = company.transactions || [];
  const filteredTx = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="company-treasury-dialog"
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/40 flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Company Treasury & Cash Flow Monitor
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time capital reserves, operating cashflow, and autonomous ledger
              </p>
            </div>
          </div>

          <button
            id="close-treasury-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Financial Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Liquid Cash */}
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                <span>Liquid Cash Reserve</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-mono font-black text-emerald-400">
                ${company.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Runway: <strong className="text-white">{runwayDays} days</strong> of ops</span>
              </div>
            </div>

            {/* Daily Inflow */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                <span>Daily Revenue</span>
                <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-mono font-black text-cyan-300">
                +${company.dailyRevenue.toFixed(2)}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Pace: <strong className="text-white">${revenuePerHour}/hr</strong></span>
              </div>
            </div>

            {/* Daily Outflow */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                <span>Operating Expenses</span>
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-mono font-black text-rose-300">
                -${company.dailyExpenses.toFixed(2)}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Burn: <strong className="text-white">${burnRatePerHour}/hr</strong></span>
              </div>
            </div>

            {/* Net Daily Profit */}
            <div className={`bg-slate-950/90 border rounded-xl p-4 shadow-lg ${isProfitable ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                <span>Net Daily Cashflow</span>
                {isProfitable ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
              </div>
              <div className={`text-2xl font-mono font-black ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfitable ? '+' : ''}${netDaily.toFixed(2)}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Margin: <strong className="text-white">{company.dailyRevenue > 0 ? ((netDaily / company.dailyRevenue) * 100).toFixed(0) : 0}%</strong></span>
              </div>
            </div>
          </div>

          {/* Autonomous Capital Management Rules */}
          <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Autonomous Capital Governance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The AI leadership team oversees liquidity allocation. When company treasury reaches expansion thresholds (Cost + $1,200 emergency payroll buffer), AI executives automatically execute tier upgrades, restock inventory, and invest in innovation experiments.
            </p>
          </div>

          {/* Transaction Ledger */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Cash Ledger ({filteredTx.length} Entries)
                </h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {(['all', 'sale', 'wholesale', 'upgrade', 'experiment'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                      filterType === type 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
              {filteredTx.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No transaction records found for the selected filter.
                </div>
              ) : (
                filteredTx.map((tx) => {
                  const isPos = tx.amount > 0;
                  return (
                    <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-slate-900/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isPos ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {isPos ? '+' : '-'}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {tx.description}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Day {tx.day} @ {tx.timeString}</span>
                            {tx.agentName && <span>• Handled by: {tx.agentName}</span>}
                            <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">
                              {tx.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono font-bold text-sm ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '+' : ''}${tx.amount.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          Bal: ${tx.balanceAfter.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Treasury sync frequency: Real-time tick engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
