import React, { useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart2, 
  PieChart, 
  ShieldCheck, 
  Building,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { CompanyState, CompetitorCompany } from '../types/simulator';

interface StockMarketPanelProps {
  company: CompanyState;
  competitors: CompetitorCompany[];
  onIssueShares: () => void;
  onBuybackShares: () => void;
}

export const StockMarketPanel: React.FC<StockMarketPanelProps> = ({
  company,
  competitors,
  onIssueShares,
  onBuybackShares,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render Real-time Stock Chart on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const history = company.stockPriceHistory;
    if (history.length < 2) return;

    const prices = history.map((h) => h.price);
    const minPrice = Math.min(...prices) * 0.95;
    const maxPrice = Math.max(...prices) * 1.05;
    const range = maxPrice - minPrice || 1;

    // Draw Price Line with Neon Gradient
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = (i / (history.length - 1)) * (width - 20) + 10;
      const y = height - 20 - ((point.price - minPrice) / range) * (height - 40);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const isUp = history[history.length - 1].price >= history[0].price;
    ctx.strokeStyle = isUp ? '#10b981' : '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Area fill
    ctx.lineTo(width - 10, height - 10);
    ctx.lineTo(10, height - 10);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Volume bars
    const maxVol = Math.max(...history.map((h) => h.volume)) || 1;
    history.forEach((point, i) => {
      const x = (i / (history.length - 1)) * (width - 20) + 10;
      const barH = (point.volume / maxVol) * 20;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.fillRect(x - 2, height - barH - 5, 4, barH);
    });
  }, [company.stockPriceHistory]);

  const priceDelta = company.stockPriceHistory.length > 1 
    ? company.stockPrice - company.stockPriceHistory[0].price 
    : 0;
  const priceDeltaPct = company.stockPriceHistory.length > 1 && company.stockPriceHistory[0].price > 0
    ? (priceDelta / company.stockPriceHistory[0].price) * 100
    : 0;

  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto bg-slate-950 text-slate-100 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-white">{company.name}</h2>
            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-xs font-mono font-bold border border-indigo-800">
              ${company.ticker}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span>Market Cap: <strong className="text-white font-mono">${company.marketCap.toLocaleString()}</strong></span>
            <span>•</span>
            <span>P/E Ratio: <strong className="text-white font-mono">{company.peRatio}</strong></span>
            <span>•</span>
            <span>Dividend: <strong className="text-emerald-400 font-mono">{company.dividendYield}%</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-white">
              ${company.stockPrice.toFixed(2)}
            </div>
            <div className={`text-xs font-bold flex items-center justify-end gap-1 ${priceDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {priceDelta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{priceDelta >= 0 ? '+' : ''}{priceDelta.toFixed(2)} ({priceDeltaPct.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onIssueShares}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              title="Issue 2,000 new shares to raise instant capital"
            >
              Issue Shares
            </button>
            <button
              onClick={onBuybackShares}
              disabled={company.cash < 5000}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
              title="Spend $5,000 to buy back shares & boost stock price"
            >
              Stock Buyback
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Interactive Stock Chart Canvas */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex justify-between items-center text-xs">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Live Intraday Price & Trading Volume</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Real-time WebGL Engine</span>
        </div>

        <div className="w-full h-64 bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 relative">
          <canvas ref={canvasRef} width={800} height={256} className="w-full h-full" />
        </div>
      </div>

      {/* Competitor Exchange Table */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Building className="w-4 h-4 text-amber-400" />
          <span>Stock Exchange & Sector Competitors</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Share Price</th>
                <th className="py-2.5 px-3">Market Cap</th>
                <th className="py-2.5 px-3">Market Share</th>
                <th className="py-2.5 px-3">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {/* Player Company */}
              <tr className="bg-indigo-950/30 text-white font-semibold">
                <td className="py-3 px-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>{company.name} (You)</span>
                </td>
                <td className="py-3 px-3 font-mono text-indigo-300">${company.ticker}</td>
                <td className="py-3 px-3 font-mono text-emerald-400">${company.stockPrice.toFixed(2)}</td>
                <td className="py-3 px-3 font-mono">${company.marketCap.toLocaleString()}</td>
                <td className="py-3 px-3 font-mono">15.0%</td>
                <td className="py-3 px-3 font-mono text-emerald-400">+5.4%</td>
              </tr>

              {/* Competitors */}
              {competitors.map((c) => (
                <tr key={c.id} className="text-slate-300 hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-medium">{c.name}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">${c.ticker}</td>
                  <td className="py-3 px-3 font-mono text-white">${c.stockPrice.toFixed(2)}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">${c.marketCap.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{c.marketShare}%</td>
                  <td className={`py-3 px-3 font-mono ${c.growthRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {c.growthRate >= 0 ? '+' : ''}{c.growthRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
