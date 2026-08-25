export type AgentRole = 
  | 'founder' 
  | 'manager' 
  | 'supervisor' 
  | 'cashier' 
  | 'restocker' 
  | 'cleaner' 
  | 'accountant' 
  | 'resident' 
  | 'customer';

export type AgentActionState = 
  | 'idle' 
  | 'walking' 
  | 'stocking' 
  | 'cashiering' 
  | 'cleaning' 
  | 'accounting' 
  | 'managing' 
  | 'teaching' 
  | 'learning' 
  | 'asking_player' 
  | 'shopping' 
  | 'resting' 
  | 'eating' 
  | 'sleeping';

export interface AgentTraits {
  ambition: number;      // 0-100: Desire for promotions & higher salary
  honesty: number;       // 0-100: Reliable accounting & customer trust
  diligence: number;     // 0-100: Work speed & task completion rate
  intelligence: number;  // 0-100: Speed of learning from mistakes & player
  sociability: number;   // 0-100: Willingness to teach & boost team morale
  patience: number;      // 0-100: Tolerance for long lines & low wages
  leadership: number;    // 0-100: Inspires subordinates & coordinates tasks
}

export interface AgentSkills {
  restocking: number;       // Level 0-100
  restockingXP: number;
  cashiering: number;       // Level 0-100
  cashieringXP: number;
  accounting: number;       // Level 0-100
  accountingXP: number;
  cleaning: number;         // Level 0-100
  cleaningXP: number;
  management: number;       // Level 0-100
  managementXP: number;
}

export interface AgentNeeds {
  energy: number;      // 0-100 (100 = full energy, 0 = exhausted)
  hunger: number;      // 0-100 (100 = full, 0 = starving)
  social: number;      // 0-100 (100 = satisfied, 0 = lonely)
  wealthSatisfaction: number; // 0-100 based on current salary vs ambition
  comfort: number;     // 0-100 workplace & home comfort
}

export interface AgentMemory {
  id: string;
  timestamp: number;
  day: number;
  type: 'learning' | 'success' | 'mistake' | 'social' | 'player_guidance' | 'promotion' | 'vote';
  description: string;
  impactScore: number; // -10 to +10 emotional impact
}

export interface AgentRelationship {
  targetAgentId: string;
  trustScore: number;     // -100 to +100
  mentorshipCount: number;
  lastInteraction: number;
}

export interface AgentEntity {
  id: string;
  name: string;
  gender: 'male' | 'female';
  avatarColor: string;
  role: AgentRole;
  currentAction: AgentActionState;
  thoughtBubble: string;
  position: { x: number; y: number; z: number };
  targetPosition: { x: number; y: number; z: number } | null;
  homePosition: { x: number; y: number; z: number };
  workPosition: { x: number; y: number; z: number };
  salary: number;           // Daily wage ($)
  funds: number;            // Personal savings ($)
  traits: AgentTraits;
  skills: AgentSkills;
  needs: AgentNeeds;
  stress: number;           // 0-100
  morale: number;           // 0-100
  loyalty: number;          // 0-100
  trustInLeadership: number;// 0-100
  memories: AgentMemory[];
  relationships: Record<string, AgentRelationship>;
  knowledgeBase: {
    knowsShelfLocation: boolean;
    knowsCashRegister: boolean;
    knowsInventoryWholesale: boolean;
    knowsBookkeeping: boolean;
    knowsTeamCoordination: boolean;
  };
  assignedDepartment?: string;
  hireDay: number;
  totalSalesMade: number;
  totalShelvesRestocked: number;
  totalAuditsDone: number;
  isAskingPlayer: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'essentials' | 'electronics' | 'luxury' | 'groceries';
  wholesaleCost: number;
  retailPrice: number;
  stockOnShelf: number;
  stockInWarehouse: number;
  maxShelfCapacity: number;
  demandRate: number; // 0.1 to 2.0
}

export type ExpansionTier = 1 | 2 | 3 | 4 | 5;

export interface CompanyTierInfo {
  tier: ExpansionTier;
  name: string;
  subtitle: string;
  costToUpgrade: number;
  maxEmployees: number;
  maxShelves: number;
  unlockedFeatures: string[];
  buildingColor: string;
  buildingHeight: number;
}

export interface AIExperimentReport {
  id: string;
  day: number;
  timeString: string;
  suggesterAgentId: string;
  suggesterName: string;
  suggesterRole: AgentRole;
  approverAgentId: string;
  approverName: string;
  approverRole: AgentRole;
  title: string;
  category: 'pricing' | 'logistics' | 'customer_service' | 'staff_wellness' | 'marketing' | 'tech' | 'operations';
  hypothesis: string;
  dialogueSuggestion: string;
  dialogueAgreement: string;
  status: 'running' | 'completed';
  progress: number; // 0-100%
  durationHours: number;
  elapsedHours: number;
  outcomeType: 'positive' | 'negative' | 'neutral';
  financialDelta: number; // +$ or -$
  moraleDelta: number;    // +% or -%
  reputationDelta: number;// + or -
  reportSummary: string;
  lessonsLearned: string;
  xpAwarded: number;
  createdAt: number;
}

export interface CashTransaction {
  id: string;
  timestamp: number;
  day: number;
  timeString: string;
  type: 'sale' | 'wage' | 'wholesale' | 'upgrade' | 'experiment' | 'dividend' | 'training' | 'shares';
  amount: number; // positive = income, negative = expense
  description: string;
  agentName?: string;
  balanceAfter: number;
}

export interface AutonomousUpgradeMilestone {
  id: string;
  day: number;
  timeString: string;
  fromTier: ExpansionTier;
  toTier: ExpansionTier;
  tierName: string;
  cost: number;
  decisionLeader: string;
  unlockedFeatures: string[];
  announcement: string;
}

export interface CompanyState {
  name: string;
  ticker: string;
  tier: ExpansionTier;
  cash: number;
  totalRevenue: number;
  dailyRevenue: number;
  dailyExpenses: number;
  netDailyProfit: number;
  hourlyRevenue: number;
  inventory: InventoryItem[];
  inventoryOrderPending: number;
  customerSatisfaction: number; // 0-100%
  brandReputation: number;       // 0-100
  employeeMoraleAvg: number;     // 0-100
  totalCustomersServed: number;
  stockPrice: number;
  stockPriceHistory: { time: number; price: number; volume: number }[];
  marketCap: number;
  sharesOutstanding: number;
  dividendYield: number;
  peRatio: number;
  foundedDay: number;
  workShiftHour: number; // 8 to 20
  wageBonusPercentage: number;
  policyAutomatedRestock: boolean;
  policyOvertimePay: boolean;
  policyFreeStaffMeals: boolean;
  policyTrainingWorkshops: boolean;
  transactions: CashTransaction[];
  activeExperiments: AIExperimentReport[];
  completedReports: AIExperimentReport[];
  upgradeMilestones: AutonomousUpgradeMilestone[];
}

export interface PlayerDilemma {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: AgentRole;
  title: string;
  question: string;
  context: string;
  options: {
    id: string;
    text: string;
    description: string;
    cost: number;
    traitEffects?: Partial<AgentTraits>;
    moraleImpact: number;
    reputationImpact: number;
    policyUpdate?: string;
  }[];
  createdAt: number;
}

export interface VotingBallot {
  id: string;
  day: number;
  title: string;
  description: string;
  candidateOrLeaderId: string;
  votesYes: number;
  votesNo: number;
  votedAgentIds: string[];
  passed?: boolean;
}

export interface CompetitorCompany {
  id: string;
  name: string;
  ticker: string;
  stockPrice: number;
  marketCap: number;
  marketShare: number;
  growthRate: number;
  history: number[];
}

export interface WorldBuilding {
  id: string;
  name: string;
  type: 'company' | 'residence' | 'warehouse' | 'stock_exchange' | 'park' | 'store';
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color: string;
  accentColor: string;
  level: number;
  residents?: string[];
}

export interface SimulationTime {
  day: number;
  hour: number;
  minute: number;
  speed: number; // 0 (paused), 1, 2, 5
  isDaytime: boolean;
  sunIntensity: number;
}
