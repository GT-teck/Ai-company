import { CompanyState, CompetitorCompany } from '../types/simulator';

export const INITIAL_COMPETITORS: CompetitorCompany[] = [
  {
    id: 'comp-omnicorp',
    name: 'OmniCorp Retail',
    ticker: 'OMNI',
    stockPrice: 142.50,
    marketCap: 14250000,
    marketShare: 42,
    growthRate: 3.2,
    history: [138.2, 139.5, 140.8, 141.2, 142.5],
  },
  {
    id: 'comp-vanguard',
    name: 'Vanguard Superstores',
    ticker: 'VNGD',
    stockPrice: 88.30,
    marketCap: 8830000,
    marketShare: 31,
    growthRate: 1.8,
    history: [86.5, 87.0, 87.8, 88.0, 88.3],
  },
  {
    id: 'comp-horizon',
    name: 'Horizon Logistics & Mart',
    ticker: 'HZN',
    stockPrice: 46.10,
    marketCap: 4610000,
    marketShare: 18,
    growthRate: -0.4,
    history: [47.5, 47.1, 46.8, 46.4, 46.1],
  },
];

export function updateStockMarketTick(
  company: CompanyState,
  competitors: CompetitorCompany[],
  averageEmployeeMorale: number
): void {
  // 1. Calculate fundamental valuation index
  const profitFactor = Math.max(0.5, (company.dailyRevenue - company.dailyExpenses) / 200);
  const satisfactionFactor = company.customerSatisfaction / 80;
  const moraleFactor = averageEmployeeMorale / 80;
  const reputationFactor = company.brandReputation / 50;
  const tierMultiplier = 1 + (company.tier - 1) * 0.45;

  const targetPrice = 20 * tierMultiplier * (profitFactor * 0.4 + satisfactionFactor * 0.2 + moraleFactor * 0.2 + reputationFactor * 0.2);

  // Smooth lerp with small market noise
  const noise = (Math.random() - 0.48) * 0.4;
  const newPrice = Math.max(2.5, +(company.stockPrice + (targetPrice - company.stockPrice) * 0.08 + noise).toFixed(2));

  company.stockPrice = newPrice;
  company.marketCap = Math.floor(company.sharesOutstanding * newPrice);
  company.peRatio = +(newPrice / Math.max(0.5, (company.totalRevenue / 1000))).toFixed(1);

  // Push to history
  const history = company.stockPriceHistory;
  const volume = Math.floor(Math.random() * 1500) + 800;
  history.push({ time: Date.now(), price: newPrice, volume });
  if (history.length > 40) history.shift();

  // 2. Update competitors
  competitors.forEach((c) => {
    const compNoise = (Math.random() - 0.49) * 0.6;
    c.stockPrice = Math.max(5.0, +(c.stockPrice + compNoise + (c.growthRate * 0.02)).toFixed(2));
    c.history.push(c.stockPrice);
    if (c.history.length > 40) c.history.shift();
  });
}
