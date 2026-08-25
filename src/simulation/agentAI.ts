import { 
  AgentEntity, 
  AgentRole, 
  AgentActionState, 
  AgentMemory, 
  CompanyState, 
  SimulationTime 
} from '../types/simulator';
import { soundFx } from './soundEngine';

const FIRST_NAMES_MALE = ['Marcus', 'David', 'Lucas', 'Alex', 'James', 'Leo', 'Ethan', 'Oliver', 'Gabriel', 'Noah'];
const FIRST_NAMES_FEMALE = ['Sophia', 'Elena', 'Chloe', 'Mia', 'Zoe', 'Aria', 'Maya', 'Grace', 'Lily', 'Stella'];
const LAST_NAMES = ['Vance', 'Sterling', 'Mercer', 'Chen', 'Kim', 'Patel', 'Novak', 'Hayes', 'Sinclair', 'Torres'];

const AVATAR_COLORS: Record<AgentRole, string> = {
  founder: '#f59e0b',    // Amber / Gold
  manager: '#3b82f6',    // Royal Blue
  supervisor: '#8b5cf6', // Purple
  cashier: '#10b981',    // Emerald Green
  restocker: '#06b6d4',  // Cyan
  cleaner: '#64748b',    // Slate
  accountant: '#ec4899', // Rose Pink
  resident: '#94a3b8',   // Light Slate
  customer: '#f97316',   // Orange
};

export function createAgent(
  id: string,
  role: AgentRole,
  homePos: { x: number; y: number; z: number },
  workPos: { x: number; y: number; z: number },
  day: number,
  customName?: string,
  presetTraits?: Partial<AgentEntity['traits']>
): AgentEntity {
  const gender: 'male' | 'female' = Math.random() > 0.5 ? 'female' : 'male';
  const firstName = customName ? customName.split(' ')[0] : (gender === 'female' 
    ? FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)] 
    : FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)]);
  const lastName = customName && customName.split(' ')[1] ? customName.split(' ')[1] : LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const name = customName || `${firstName} ${lastName}`;

  const traits = {
    ambition: Math.floor(Math.random() * 50) + 40,
    honesty: Math.floor(Math.random() * 50) + 45,
    diligence: Math.floor(Math.random() * 45) + 45,
    intelligence: Math.floor(Math.random() * 45) + 45,
    sociability: Math.floor(Math.random() * 50) + 40,
    patience: Math.floor(Math.random() * 50) + 40,
    leadership: role === 'founder' ? 85 : Math.floor(Math.random() * 40) + 30,
    ...presetTraits,
  };

  const skills = {
    restocking: role === 'restocker' ? 20 : (role === 'founder' ? 15 : 5),
    restockingXP: 0,
    cashiering: role === 'cashier' ? 20 : (role === 'founder' ? 15 : 5),
    cashieringXP: 0,
    accounting: role === 'accountant' ? 25 : (role === 'founder' ? 10 : 5),
    accountingXP: 0,
    cleaning: role === 'cleaner' ? 25 : 5,
    cleaningXP: 0,
    management: role === 'founder' ? 30 : (role === 'manager' ? 25 : 5),
    managementXP: 0,
  };

  const initialMemories: AgentMemory[] = [
    {
      id: `mem-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      day,
      type: 'learning',
      description: role === 'founder' 
        ? `Founded company with zero formal procedures. Starting from scratch!`
        : `Joined company as ${role}. Excited to learn the ropes.`,
      impactScore: 5,
    }
  ];

  return {
    id,
    name,
    gender,
    avatarColor: AVATAR_COLORS[role],
    role,
    currentAction: 'idle',
    thoughtBubble: role === 'founder' ? 'Planning initial inventory strategy...' : 'Ready for my shift.',
    position: { ...homePos },
    targetPosition: null,
    homePosition: { ...homePos },
    workPosition: { ...workPos },
    salary: role === 'founder' ? 0 : (role === 'manager' ? 120 : (role === 'supervisor' ? 90 : 60)),
    funds: role === 'founder' ? 500 : 150,
    traits,
    skills,
    needs: {
      energy: 95,
      hunger: 90,
      social: 80,
      wealthSatisfaction: 75,
      comfort: 80,
    },
    stress: 15,
    morale: 85,
    loyalty: 80,
    trustInLeadership: 80,
    memories: initialMemories,
    relationships: {},
    knowledgeBase: {
      knowsShelfLocation: role === 'founder',
      knowsCashRegister: role === 'founder',
      knowsInventoryWholesale: role === 'founder',
      knowsBookkeeping: role === 'founder',
      knowsTeamCoordination: role === 'founder' || role === 'manager',
    },
    hireDay: day,
    totalSalesMade: 0,
    totalShelvesRestocked: 0,
    totalAuditsDone: 0,
    isAskingPlayer: false,
  };
}

// Reinforcement learning reward and XP updater
export function awardAgentXP(agent: AgentEntity, skillKey: keyof AgentEntity['skills'], xpGain: number, memoryText?: string, day: number = 1) {
  const currentSkill = agent.skills[skillKey] as number;
  const currentXP = (agent.skills[`${skillKey}XP` as keyof AgentEntity['skills']] as number) || 0;
  
  const newXP = currentXP + xpGain;
  const xpThreshold = (currentSkill + 1) * 35;

  if (newXP >= xpThreshold && currentSkill < 100) {
    (agent.skills[skillKey] as number) = Math.min(100, currentSkill + 1);
    (agent.skills[`${skillKey}XP` as keyof AgentEntity['skills']] as number) = 0;
    
    agent.memories.unshift({
      id: `mem-lvl-${Date.now()}`,
      timestamp: Date.now(),
      day,
      type: 'learning',
      description: `Skill increased: ${skillKey.toUpperCase()} reached Level ${agent.skills[skillKey]}!`,
      impactScore: 6,
    });
    
    agent.morale = Math.min(100, agent.morale + 5);
    soundFx.playPromotion();
  } else {
    (agent.skills[`${skillKey}XP` as keyof AgentEntity['skills']] as number) = newXP;
  }

  if (memoryText) {
    agent.memories.unshift({
      id: `mem-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      day,
      type: 'success',
      description: memoryText,
      impactScore: 3,
    });
    if (agent.memories.length > 25) agent.memories.pop();
  }
}

// Peer-to-peer Knowledge Sharing & Mentorship
export function executeKnowledgeSharing(teacher: AgentEntity, student: AgentEntity, day: number): boolean {
  if (teacher.id === student.id) return false;
  
  let taughtSkill: keyof AgentEntity['skills'] | null = null;

  if (teacher.skills.restocking > student.skills.restocking + 5) taughtSkill = 'restocking';
  else if (teacher.skills.cashiering > student.skills.cashiering + 5) taughtSkill = 'cashiering';
  else if (teacher.skills.accounting > student.skills.accounting + 5) taughtSkill = 'accounting';
  else if (teacher.skills.management > student.skills.management + 5) taughtSkill = 'management';

  if (!taughtSkill) return false;

  const xpTransfer = Math.floor(15 * (teacher.traits.sociability / 100) * (student.traits.intelligence / 100));
  awardAgentXP(student, taughtSkill, xpTransfer, `Learned ${taughtSkill} techniques from ${teacher.name}`, day);

  student.relationships[teacher.id] = {
    targetAgentId: teacher.id,
    trustScore: Math.min(100, (student.relationships[teacher.id]?.trustScore || 50) + 8),
    mentorshipCount: (student.relationships[teacher.id]?.mentorshipCount || 0) + 1,
    lastInteraction: Date.now(),
  };

  teacher.morale = Math.min(100, teacher.morale + 3);
  teacher.thoughtBubble = `Mentored ${student.name} in ${taughtSkill}. Team cohesion +1!`;
  student.thoughtBubble = `Thanked ${teacher.name} for the coaching session.`;

  return true;
}

// Autonomous Agent Decision Step
export function updateAgentAI(
  agent: AgentEntity,
  company: CompanyState,
  allAgents: AgentEntity[],
  time: SimulationTime,
  storePosition: { x: number; y: number; z: number },
  warehousePosition: { x: number; y: number; z: number }
): void {
  // 1. Decay needs
  agent.needs.energy = Math.max(0, agent.needs.energy - 0.05 * time.speed);
  agent.needs.hunger = Math.max(0, agent.needs.hunger - 0.04 * time.speed);
  agent.needs.social = Math.max(0, agent.needs.social - 0.03 * time.speed);

  // 2. Day/Night Sleep schedule for non-working hours
  const isWorkingHours = time.hour >= 8 && time.hour < 20;

  if (!isWorkingHours && agent.role !== 'customer') {
    if (agent.needs.energy < 85) {
      agent.currentAction = 'sleeping';
      agent.thoughtBubble = 'Resting at home for tomorrow...';
      agent.needs.energy = Math.min(100, agent.needs.energy + 0.3 * time.speed);
      agent.needs.hunger = Math.max(20, agent.needs.hunger - 0.01 * time.speed);
      agent.stress = Math.max(0, agent.stress - 0.1 * time.speed);
      agent.targetPosition = { ...agent.homePosition };
      return;
    }
  }

  // 3. Low energy / hunger override
  if (agent.needs.energy < 20) {
    agent.currentAction = 'resting';
    agent.thoughtBubble = 'Taking a quick break to recover energy.';
    agent.needs.energy = Math.min(100, agent.needs.energy + 0.2 * time.speed);
    agent.stress = Math.max(0, agent.stress - 0.08 * time.speed);
    return;
  }

  if (agent.needs.hunger < 25) {
    agent.currentAction = 'eating';
    agent.thoughtBubble = 'Grabbing a meal.';
    agent.needs.hunger = Math.min(100, agent.needs.hunger + 0.5 * time.speed);
    return;
  }

  // 4. Role-specific behavior tree
  switch (agent.role) {
    case 'founder':
    case 'manager': {
      // Check if shelves are empty and founder must learn to restock or order stock
      const hasEmptyShelf = company.inventory.some(i => i.stockOnShelf < 5);
      const hasWarehouseStock = company.inventory.some(i => i.stockInWarehouse > 0);

      if (hasEmptyShelf && hasWarehouseStock) {
        agent.currentAction = 'stocking';
        agent.thoughtBubble = 'Autonomous AI Restocking shelves...';
        agent.targetPosition = { ...storePosition };
        awardAgentXP(agent, 'restocking', 1, undefined, time.day);
      } else if (Math.random() < 0.2) {
        // Attempt mentorship
        const subordinate = allAgents.find(a => a.id !== agent.id && a.role !== 'customer' && a.role !== 'resident');
        if (subordinate) {
          executeKnowledgeSharing(agent, subordinate, time.day);
          agent.currentAction = 'teaching';
        }
      } else {
        agent.currentAction = 'managing';
        agent.thoughtBubble = 'Auditing financial records and market share.';
        agent.targetPosition = { x: storePosition.x + 2, y: storePosition.y, z: storePosition.z - 2 };
        awardAgentXP(agent, 'management', 1, undefined, time.day);
      }
      break;
    }

    case 'restocker': {
      agent.currentAction = 'stocking';
      agent.thoughtBubble = 'Transferring goods from warehouse to store shelves.';
      agent.targetPosition = { ...storePosition };
      awardAgentXP(agent, 'restocking', 2, undefined, time.day);
      break;
    }

    case 'cashier': {
      agent.currentAction = 'cashiering';
      agent.thoughtBubble = 'Serving customer checkout line.';
      agent.targetPosition = { x: storePosition.x - 2, y: storePosition.y, z: storePosition.z + 1 };
      awardAgentXP(agent, 'cashiering', 2, undefined, time.day);
      break;
    }

    case 'accountant': {
      agent.currentAction = 'accounting';
      agent.thoughtBubble = 'Balancing daily ledger & tax compliance.';
      agent.targetPosition = { x: storePosition.x + 3, y: storePosition.y, z: storePosition.z + 2 };
      awardAgentXP(agent, 'accounting', 2, undefined, time.day);
      break;
    }

    case 'cleaner': {
      agent.currentAction = 'cleaning';
      agent.thoughtBubble = 'Sanitizing aisles and checkout counters.';
      agent.targetPosition = { x: storePosition.x + (Math.random() * 4 - 2), y: storePosition.y, z: storePosition.z + (Math.random() * 4 - 2) };
      awardAgentXP(agent, 'cleaning', 2, undefined, time.day);
      break;
    }

    case 'customer': {
      agent.currentAction = 'shopping';
      agent.thoughtBubble = 'Browsing goods on display.';
      agent.targetPosition = { x: storePosition.x + (Math.random() * 6 - 3), y: storePosition.y, z: storePosition.z + (Math.random() * 6 - 3) };
      break;
    }

    case 'resident': {
      agent.currentAction = 'walking';
      agent.thoughtBubble = 'Going for a walk around the neighborhood.';
      if (Math.random() < 0.05) {
        agent.thoughtBubble = 'Considering applying for a job at the company!';
      }
      break;
    }
  }

  // 5. Update agent position smoothly towards target
  if (agent.targetPosition) {
    const dx = agent.targetPosition.x - agent.position.x;
    const dz = agent.targetPosition.z - agent.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 0.3) {
      const speed = 0.08 * (agent.traits.diligence / 50) * time.speed;
      agent.position.x += (dx / dist) * Math.min(dist, speed);
      agent.position.z += (dz / dist) * Math.min(dist, speed);
    }
  }
}
