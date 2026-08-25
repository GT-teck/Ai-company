import { 
  CompanyState, 
  CompanyTierInfo, 
  InventoryItem, 
  PlayerDilemma, 
  AgentEntity, 
  SimulationTime, 
  VotingBallot,
  ExpansionTier,
  CashTransaction,
  AIExperimentReport,
  AutonomousUpgradeMilestone
} from '../types/simulator';
import { soundFx } from './soundEngine';
import { createAgent } from './agentAI';

export const COMPANY_TIERS: Record<ExpansionTier, CompanyTierInfo> = {
  1: {
    tier: 1,
    name: 'Corner Kiosk',
    subtitle: 'Modest roadside stand. Single founder operations.',
    costToUpgrade: 4000,
    maxEmployees: 3,
    maxShelves: 2,
    unlockedFeatures: ['Basic Groceries', 'Manual Cashier', 'Local Delivery'],
    buildingColor: '#38bdf8',
    buildingHeight: 3.5,
  },
  2: {
    tier: 2,
    name: 'Neighborhood Mini-Mart',
    subtitle: 'Dedicated retail building with stockroom and dual checkout lanes.',
    costToUpgrade: 12000,
    maxEmployees: 8,
    maxShelves: 4,
    unlockedFeatures: ['Electronics Aisle', 'Supervisor Role', 'Automated Wholesale', 'Break Room'],
    buildingColor: '#6366f1',
    buildingHeight: 6,
  },
  3: {
    tier: 3,
    name: 'Commercial Superstore',
    subtitle: 'Sprawling multi-department store with logistics bay & office suites.',
    costToUpgrade: 35000,
    maxEmployees: 16,
    maxShelves: 8,
    unlockedFeatures: ['Luxury Goods', 'Accountant Department', 'Employee Training Workshops', 'Overtime Bonuses'],
    buildingColor: '#8b5cf6',
    buildingHeight: 9,
  },
  4: {
    tier: 4,
    name: 'Corporate Plaza & R&D Hub',
    subtitle: 'Multi-story corporate headquarters with automated robotics and research labs.',
    costToUpgrade: 95000,
    maxEmployees: 30,
    maxShelves: 14,
    unlockedFeatures: ['Stock Market IPO', 'Self-Checkout Kiosks', 'R&D Innovation Lab', 'Dividend Payouts'],
    buildingColor: '#ec4899',
    buildingHeight: 14,
  },
  5: {
    tier: 5,
    name: 'Mega-Corp Metropolis Tower',
    subtitle: 'Sky-scraping enterprise commanding global supply chains and high-frequency algorithms.',
    costToUpgrade: 250000,
    maxEmployees: 60,
    maxShelves: 20,
    unlockedFeatures: ['Global Franchise Empire', 'AI Board of Directors', 'Market Manipulation Shield', 'Zero Friction Logistics'],
    buildingColor: '#f59e0b',
    buildingHeight: 22,
  },
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-cereal',
    name: 'Organic Cereals & Snacks',
    category: 'groceries',
    wholesaleCost: 6,
    retailPrice: 15,
    stockOnShelf: 18,
    stockInWarehouse: 60,
    maxShelfCapacity: 30,
    demandRate: 1.2,
  },
  {
    id: 'inv-drinks',
    name: 'Electrolyte Energy Drinks',
    category: 'groceries',
    wholesaleCost: 3,
    retailPrice: 8,
    stockOnShelf: 24,
    stockInWarehouse: 80,
    maxShelfCapacity: 40,
    demandRate: 1.5,
  },
  {
    id: 'inv-gadgets',
    name: 'Smart Watches & Earbuds',
    category: 'electronics',
    wholesaleCost: 45,
    retailPrice: 110,
    stockOnShelf: 8,
    stockInWarehouse: 20,
    maxShelfCapacity: 15,
    demandRate: 0.8,
  },
  {
    id: 'inv-apparel',
    name: 'Designer Casual Hoodies',
    category: 'luxury',
    wholesaleCost: 28,
    retailPrice: 75,
    stockOnShelf: 10,
    stockInWarehouse: 30,
    maxShelfCapacity: 20,
    demandRate: 0.9,
  },
];

export function createInitialCompany(): CompanyState {
  return {
    name: 'Apex Dynamics',
    ticker: 'APEX',
    tier: 1,
    cash: 4250,
    totalRevenue: 1200,
    dailyRevenue: 280,
    dailyExpenses: 60,
    netDailyProfit: 220,
    hourlyRevenue: 45,
    inventory: [...INITIAL_INVENTORY],
    inventoryOrderPending: 0,
    customerSatisfaction: 88,
    brandReputation: 48,
    employeeMoraleAvg: 86,
    totalCustomersServed: 14,
    stockPrice: 24.50,
    stockPriceHistory: [
      { time: Date.now() - 60000 * 5, price: 23.80, volume: 1200 },
      { time: Date.now() - 60000 * 4, price: 24.10, volume: 1500 },
      { time: Date.now() - 60000 * 3, price: 23.95, volume: 900 },
      { time: Date.now() - 60000 * 2, price: 24.30, volume: 1800 },
      { time: Date.now() - 60000 * 1, price: 24.50, volume: 2200 },
    ],
    marketCap: 245000,
    sharesOutstanding: 10000,
    dividendYield: 2.4,
    peRatio: 14.8,
    foundedDay: 1,
    workShiftHour: 8,
    wageBonusPercentage: 0,
    policyAutomatedRestock: true,
    policyOvertimePay: false,
    policyFreeStaffMeals: false,
    policyTrainingWorkshops: false,
    transactions: [
      {
        id: 'tx-seed-1',
        timestamp: Date.now() - 3600000 * 2,
        day: 1,
        timeString: '07:30',
        type: 'sale',
        amount: 180,
        description: 'Morning Rush: Cereals & Energy Drinks sold',
        balanceAfter: 4310,
      },
      {
        id: 'tx-seed-2',
        timestamp: Date.now() - 3600000 * 1,
        day: 1,
        timeString: '08:00',
        type: 'wholesale',
        amount: -60,
        description: 'Wholesale Restock: 10 units of Groceries',
        balanceAfter: 4250,
      },
    ],
    activeExperiments: [],
    completedReports: [
      {
        id: 'rep-init-1',
        day: 1,
        timeString: '06:30',
        suggesterAgentId: 'agent-founder',
        suggesterName: 'Sophia Vance',
        suggesterRole: 'founder',
        approverAgentId: 'agent-res-1',
        approverName: 'Marcus Sterling',
        approverRole: 'resident',
        title: 'Morning Display Restructure',
        category: 'merchandising' as any,
        hypothesis: 'Placing energy drinks right beside the register will capture impulse buyers during morning commute.',
        dialogueSuggestion: 'Sophia suggested: "Let us position the cold energy drinks right next to the checkout counter during the morning rush."',
        dialogueAgreement: 'Marcus said: "Sure, we will try this for the morning shift and track checkout rates!"',
        status: 'completed',
        progress: 100,
        durationHours: 2,
        elapsedHours: 2,
        outcomeType: 'positive',
        financialDelta: 165,
        moraleDelta: 8,
        reputationDelta: 4,
        reportSummary: 'Outcome: POSITIVE (+ $165.00 sales, +8% team morale). Impulse purchase conversion rate rose by 34%.',
        lessonsLearned: 'Sophia and Marcus learned that front-facing beverage placement directly boosts morning revenue without adding staffing burden.',
        xpAwarded: 25,
        createdAt: Date.now() - 10000,
      }
    ],
    upgradeMilestones: [],
  };
}

export function addCashTransaction(
  company: CompanyState,
  type: CashTransaction['type'],
  amount: number,
  description: string,
  timeString: string,
  day: number,
  agentName?: string
) {
  const newTx: CashTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: Date.now(),
    day,
    timeString,
    type,
    amount,
    description,
    agentName,
    balanceAfter: Math.max(0, company.cash + amount),
  };

  company.transactions = [newTx, ...(company.transactions || [])].slice(0, 80);
}

// Generate Autonomous AI Innovation Experiment & Trial
export function generateAutonomousExperiment(
  company: CompanyState,
  agents: AgentEntity[],
  time: SimulationTime
): AIExperimentReport | null {
  const staff = agents.filter(a => a.role !== 'customer');
  if (staff.length < 1) return null;

  const suggester = staff[Math.floor(Math.random() * staff.length)];
  const peers = staff.filter(a => a.id !== suggester.id);
  const approver = peers.length > 0 ? peers[Math.floor(Math.random() * peers.length)] : suggester;

  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  const timeStr = `${pad(time.hour)}:${pad(time.minute)}`;

  interface ExperimentTemplate {
    title: string;
    category: AIExperimentReport['category'];
    hypothesis: string;
    suggestionText: string;
    agreementText: string;
    durationHours: number;
    baseOutcome: 'positive' | 'negative' | 'neutral';
    baseFinancial: number;
    positiveSummary: string;
    negativeSummary: string;
    positiveLesson: string;
    negativeLesson: string;
  }

  const templates: ExperimentTemplate[] = [
    {
      title: 'Dynamic Happy-Hour Price Surge & Discount',
      category: 'pricing',
      hypothesis: 'Discounting slow-moving shelf items by 15% during peak hours will accelerate cash turnover.',
      suggestionText: `${suggester.name} suggested: "Let us test dynamic 15% happy-hour discounts on grocery items to clear inventory before close."`,
      agreementText: `${approver.name} said: "Sure, we will try! I'll adjust shelf price tags and monitor customer basket size."`,
      durationHours: 3,
      baseOutcome: 'positive',
      baseFinancial: 320,
      positiveSummary: 'Outcome: SUCCESS (+ $320 revenue, +6% customer satisfaction). Total item turnover spiked by 28%.',
      negativeSummary: 'Outcome: MARGIN SQUEEZE (- $45 net margin). Customer rush cleared shelves too quickly before warehouse replenishment.',
      positiveLesson: `${suggester.name} and ${approver.name} learned that price elasticity is high in late afternoons, creating quick cashflow.`,
      negativeLesson: `${suggester.name} noted that discount timing must be strictly synced with warehouse stock levels.`,
    },
    {
      title: 'Express 5-Items-or-Less Self Checkout Lane',
      category: 'tech',
      hypothesis: 'Designating register #2 as rapid self-service will clear long customer lines.',
      suggestionText: `${suggester.name} suggested: "What if we test an express self-checkout system for small purchases of 5 items or less?"`,
      agreementText: `${approver.name} said: "Sure, we will try! I will supervise the scanner and assist shoppers."`,
      durationHours: 4,
      baseOutcome: 'positive',
      baseFinancial: 240,
      positiveSummary: 'Outcome: EXCELLENT (+ $240 revenue, +15% throughput). Average queue wait time dropped from 4 minutes to 45 seconds.',
      negativeSummary: 'Outcome: MINOR SHRINKAGE (- $80 discrepancy). Unsupervised barcode scans caused minor inventory mismatch.',
      positiveLesson: `The team discovered that fast checkout reduces customer abandonment, significantly boosting repeat visits.`,
      negativeLesson: `The team recognized that self-service stations require dedicated cashier spot-checks to prevent shrinkage.`,
    },
    {
      title: 'Supplier Bulk Volume Negotiation Pilot',
      category: 'logistics',
      hypothesis: 'Consolidating warehouse deliveries into bulk 50-unit orders will reduce wholesale unit fees.',
      suggestionText: `${suggester.name} suggested: "Let's bundle our next three wholesale restocks into a single consolidated supplier freight."`,
      agreementText: `${approver.name} said: "Sure, we will try! I will prepare warehouse shelving pallets for the larger shipment."`,
      durationHours: 3,
      baseOutcome: 'positive',
      baseFinancial: 190,
      positiveSummary: 'Outcome: COST SAVINGS (+ $190 freight savings). Unit wholesale procurement cost dropped by 18%.',
      negativeSummary: 'Outcome: AISLE CONGESTION (- $60 operational delay). Overfilled pallets temporarily slowed down restocking routes.',
      positiveLesson: `${suggester.name} learned that freight consolidation creates substantial margins once storage capacity expands.`,
      negativeLesson: `${approver.name} noted that pallet storage requires organized aisle zoning before placing bulk orders.`,
    },
    {
      title: 'Complimentary Coffee & Ambient Atmosphere',
      category: 'customer_service',
      hypothesis: 'Offering complimentary fresh artisan coffee and soothing ambient music will lengthen shopper stay duration.',
      suggestionText: `${suggester.name} suggested: "Let us set up a complimentary coffee brewer and play curated acoustic playlists in store."`,
      agreementText: `${approver.name} said: "Sure, we will try! I will keep the coffee station tidy and greet guests."`,
      durationHours: 3,
      baseOutcome: 'positive',
      baseFinancial: 280,
      positiveSummary: 'Outcome: STELLAR (+ $280 auxiliary sales, +12% brand reputation). Shoppers stayed 40% longer and browsed luxury aisles.',
      negativeSummary: 'Outcome: MESS SPILL (- $30 cleanup expense). Coffee cups left near merchandise required extra floor sweeping.',
      positiveLesson: `The AI staff observed that hospitable store ambiance directly encourages premium gadget and apparel purchases.`,
      negativeLesson: `Staff realized that complimentary amenities must include dedicated waste disposal bins throughout aisles.`,
    },
    {
      title: 'Peer-to-Peer Cross-Training Sprint',
      category: 'staff_wellness',
      hypothesis: 'Pairing cashiers and restockers in 1-on-1 mentorship shifts will eliminate single-point operational bottlenecks.',
      suggestionText: `${suggester.name} suggested: "Let us run a cross-training sprint where frontline staff shadow management and accounting."`,
      agreementText: `${approver.name} said: "Sure, we will try! I will mentor the junior staff on ledger reconciliation today."`,
      durationHours: 2,
      baseOutcome: 'positive',
      baseFinancial: 120,
      positiveSummary: 'Outcome: HIGH PRODUCTIVITY (+15% staff morale, +40 Skill XP). Operational agility and error rates improved across all shifts.',
      negativeSummary: 'Outcome: TEMPORARY SLOWDOWN (- $20 short-term delay). Mentorship conversations briefly paused register operations.',
      positiveLesson: `The organization verified that internal cross-training creates a resilient, high-morale autonomous workforce.`,
      negativeLesson: `Staff learned to schedule mentorship intervals during low-traffic mid-day windows rather than morning rush.`,
    },
  ];

  const picked = templates[Math.floor(Math.random() * templates.length)];

  return {
    id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    day: time.day,
    timeString: timeStr,
    suggesterAgentId: suggester.id,
    suggesterName: suggester.name,
    suggesterRole: suggester.role,
    approverAgentId: approver.id,
    approverName: approver.name,
    approverRole: approver.role,
    title: picked.title,
    category: picked.category,
    hypothesis: picked.hypothesis,
    dialogueSuggestion: picked.suggestionText,
    dialogueAgreement: picked.agreementText,
    status: 'running',
    progress: 0,
    durationHours: picked.durationHours,
    elapsedHours: 0,
    outcomeType: picked.baseOutcome,
    financialDelta: picked.baseFinancial,
    moraleDelta: 8,
    reputationDelta: 5,
    reportSummary: picked.positiveSummary,
    lessonsLearned: picked.positiveLesson,
    xpAwarded: 30,
    createdAt: Date.now(),
  };
}

// Tick running experiments and evaluate realistic outcomes
export function tickAutonomousExperiments(
  company: CompanyState,
  agents: AgentEntity[],
  time: SimulationTime,
  onReportFinished?: (report: AIExperimentReport) => void
) {
  if (!company.activeExperiments || company.activeExperiments.length === 0) return;

  const updatedActive: AIExperimentReport[] = [];

  company.activeExperiments.forEach((exp) => {
    exp.elapsedHours += 0.25;
    exp.progress = Math.min(100, Math.round((exp.elapsedHours / exp.durationHours) * 100));

    if (exp.progress >= 100) {
      exp.status = 'completed';

      // Find participating agents
      const suggester = agents.find(a => a.id === exp.suggesterAgentId);
      const approver = agents.find(a => a.id === exp.approverAgentId);

      // Trait and skill weighted outcome roll
      const intelligenceBonus = suggester ? suggester.traits.intelligence / 200 : 0.4;
      const isSuccess = Math.random() < (0.65 + intelligenceBonus);

      if (isSuccess) {
        exp.outcomeType = 'positive';
        company.cash += exp.financialDelta;
        company.dailyRevenue += exp.financialDelta;
        company.brandReputation = Math.min(100, company.brandReputation + exp.reputationDelta);

        addCashTransaction(
          company,
          'experiment',
          exp.financialDelta,
          `AI Innovation Trial: ${exp.title}`,
          exp.timeString,
          time.day,
          suggester?.name
        );
      } else {
        exp.outcomeType = 'negative';
        const loss = Math.floor(exp.financialDelta * 0.4);
        exp.financialDelta = -loss;
        company.cash = Math.max(0, company.cash - loss);
        exp.reportSummary = `Outcome: INCONCLUSIVE / SUBOPTIMAL (- $${loss}.00 trial cost). The team analyzed the outcome and derived critical insights.`;
        exp.lessonsLearned = `${exp.suggesterName} and ${exp.approverName} documented the bottlenecks and adjusted operational rules to prevent recurrence.`;

        addCashTransaction(
          company,
          'experiment',
          -loss,
          `AI Trial Expense: ${exp.title}`,
          exp.timeString,
          time.day,
          suggester?.name
        );
      }

      // Award XP & memories to agents
      if (suggester) {
        suggester.skills.managementXP += exp.xpAwarded;
        suggester.morale = Math.min(100, suggester.morale + (isSuccess ? 10 : -4));
        suggester.memories.unshift({
          id: `mem-exp-${Date.now()}`,
          timestamp: Date.now(),
          day: time.day,
          type: isSuccess ? 'success' : 'learning',
          description: `Tested innovation: "${exp.title}". Result: ${exp.outcomeType.toUpperCase()}.`,
          impactScore: isSuccess ? 8 : -2,
        });
      }

      if (approver && approver.id !== suggester?.id) {
        approver.skills.managementXP += Math.round(exp.xpAwarded * 0.7);
        approver.morale = Math.min(100, approver.morale + (isSuccess ? 8 : -3));
      }

      company.completedReports = [exp, ...(company.completedReports || [])].slice(0, 50);
      soundFx.playPromotion();
      if (onReportFinished) onReportFinished(exp);
    } else {
      updatedActive.push(exp);
    }
  });

  company.activeExperiments = updatedActive;
}

// Check and execute Autonomous AI Company Expansion Upgrades
export function checkAutonomousCompanyUpgrade(
  company: CompanyState,
  agents: AgentEntity[],
  time: SimulationTime
): AutonomousUpgradeMilestone | null {
  if (company.tier >= 5) return null;

  const nextTier = (company.tier + 1) as ExpansionTier;
  const tierInfo = COMPANY_TIERS[nextTier];

  // AI Upgrade Decision Rule:
  // Must have enough cash for upgrade cost PLUS a healthy safety buffer for payroll & restock ($1,200)
  const safetyBuffer = 1200;
  if (company.cash < tierInfo.costToUpgrade + safetyBuffer) {
    return null;
  }

  // Find leadership decision maker
  const leader = agents.find(a => a.role === 'founder' || a.role === 'manager') || agents[0];
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  const timeStr = `${pad(time.hour)}:${pad(time.minute)}`;

  // Execute Autonomous Upgrade!
  const cost = tierInfo.costToUpgrade;
  company.cash -= cost;
  company.tier = nextTier;
  company.brandReputation = Math.min(100, company.brandReputation + 25);
  company.sharesOutstanding += 5000;
  company.marketCap = Math.floor(company.sharesOutstanding * company.stockPrice);

  addCashTransaction(
    company,
    'upgrade',
    -cost,
    `Autonomous Enterprise Expansion: Upgraded to Tier ${nextTier} (${tierInfo.name})`,
    timeStr,
    time.day,
    leader.name
  );

  const milestone: AutonomousUpgradeMilestone = {
    id: `ms-${Date.now()}`,
    day: time.day,
    timeString: timeStr,
    fromTier: (nextTier - 1) as ExpansionTier,
    toTier: nextTier,
    tierName: tierInfo.name,
    cost,
    decisionLeader: leader.name,
    unlockedFeatures: tierInfo.unlockedFeatures,
    announcement: `Autonomous Upgrade: ${leader.name} and the AI team voted to expand to Tier ${nextTier} (${tierInfo.name})! Unlocked ${tierInfo.unlockedFeatures.join(', ')}.`,
  };

  company.upgradeMilestones = [milestone, ...(company.upgradeMilestones || [])];

  // Boost all employee morale
  agents.forEach(a => {
    a.morale = Math.min(100, a.morale + 20);
    a.memories.unshift({
      id: `mem-upg-${Date.now()}`,
      timestamp: Date.now(),
      day: time.day,
      type: 'promotion',
      description: `Company autonomously expanded to ${tierInfo.name}!`,
      impactScore: 10,
    });
  });

  soundFx.playPromotion();
  return milestone;
}

// Process Customer Shopping & Checkout Transaction
export function processCustomerSale(
  company: CompanyState, 
  customer: AgentEntity, 
  cashiers: AgentEntity[], 
  time: SimulationTime
): number {
  const availableItems = company.inventory.filter(i => i.stockOnShelf > 0);
  if (availableItems.length === 0) {
    company.customerSatisfaction = Math.max(20, company.customerSatisfaction - 0.5);
    return 0;
  }

  const chosenItem = availableItems[Math.floor(Math.random() * availableItems.length)];
  const qty = Math.min(chosenItem.stockOnShelf, Math.floor(Math.random() * 2) + 1);

  chosenItem.stockOnShelf -= qty;
  const saleAmount = chosenItem.retailPrice * qty;

  company.cash += saleAmount;
  company.dailyRevenue += saleAmount;
  company.totalRevenue += saleAmount;
  company.totalCustomersServed += 1;
  company.customerSatisfaction = Math.min(100, company.customerSatisfaction + 0.2);

  // Credit cashier
  let cashierName = 'Self-Service';
  if (cashiers.length > 0) {
    const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];
    cashier.totalSalesMade += qty;
    cashier.morale = Math.min(100, cashier.morale + 0.5);
    cashierName = cashier.name;
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  const timeStr = `${pad(time.hour)}:${pad(time.minute)}`;

  addCashTransaction(
    company,
    'sale',
    saleAmount,
    `Customer Purchase: ${qty}x ${chosenItem.name}`,
    timeStr,
    time.day,
    cashierName
  );

  soundFx.playCashRegister();
  return saleAmount;
}

// Automatic Warehouse Restock ordering
export function orderWholesaleRestock(
  company: CompanyState, 
  item: InventoryItem, 
  qty: number,
  time?: SimulationTime
): boolean {
  const cost = item.wholesaleCost * qty;
  if (company.cash < cost) return false;

  company.cash -= cost;
  company.dailyExpenses += cost;
  item.stockInWarehouse += qty;

  if (time) {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const timeStr = `${pad(time.hour)}:${pad(time.minute)}`;
    addCashTransaction(
      company,
      'wholesale',
      -cost,
      `Wholesale Restock: +${qty} ${item.name}`,
      timeStr,
      time.day
    );
  }

  soundFx.playRestock();
  return true;
}

// Upgrade Company Expansion Tier
export function upgradeCompanyTier(company: CompanyState): boolean {
  if (company.tier >= 5) return false;
  const nextTier = (company.tier + 1) as ExpansionTier;
  const tierInfo = COMPANY_TIERS[nextTier];

  if (company.cash < tierInfo.costToUpgrade) return false;

  company.cash -= tierInfo.costToUpgrade;
  company.tier = nextTier;
  company.brandReputation = Math.min(100, company.brandReputation + 20);
  company.sharesOutstanding += 5000;
  company.marketCap = company.sharesOutstanding * company.stockPrice;

  soundFx.playPromotion();
  return true;
}
