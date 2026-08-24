export type SwarmAgentId = 'atlas' | 'lumina' | 'chronos' | 'sentinel';

export interface SwarmAgent {
  id: SwarmAgentId;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  color: string;
  model: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  currentAction?: string;
  tokensProcessed: number;
  tokensSaved: number;
}

export interface SwarmPipelineStep {
  agentId: SwarmAgentId;
  agentName: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: string;
  outputSnippet?: string;
}

export interface TokenTelemetry {
  tokensUsed: number;
  tokensSaved: number;
  savingsPercentage: number;
  estimatedCostUsd: string;
  swarmNodesCount: number;
  durationMs: number;
  cacheHitRate: number;
}

export interface GameFiles {
  'index.html': string;
  'game.js'?: string;
  'audio.js'?: string;
  'shaders.glsl'?: string;
  'style.css'?: string;
  [filename: string]: string | undefined;
}

export interface GameProject {
  id: string;
  title: string;
  description: string;
  genre: string;
  tags: string[];
  html: string;
  files: GameFiles;
  particleCount: number;
  fpsTarget: number;
  createdAt: number;
  updatedAt: number;
  prompt: string;
  version: number;
  author: string;
}

export interface GameTemplate {
  id: string;
  title: string;
  genre: string;
  description: string;
  badge: string;
  particleCount: number;
  techStack: string[];
  benchmark: string;
  html: string;
  files: GameFiles;
  iconName: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'swarm' | 'agent';
  agentId?: SwarmAgentId;
  text: string;
  timestamp: number;
  pipelineSteps?: SwarmPipelineStep[];
  telemetry?: Partial<TokenTelemetry>;
  projectSnapshot?: Partial<GameProject>;
}

export type ViewTab = 'preview' | 'code' | 'pipeline' | 'profiler';
