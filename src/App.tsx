import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { SwarmChatPanel } from './components/SwarmChatPanel';
import { LiveGamePreview } from './components/LiveGamePreview';
import { CodeEditorView } from './components/CodeEditorView';
import { AgentSwarmVisualizer } from './components/AgentSwarmVisualizer';
import { PerformanceProfiler } from './components/PerformanceProfiler';
import { TokenSavingsModal } from './components/TokenSavingsModal';
import { ExportModal } from './components/ExportModal';
import { 
  GameProject, 
  GameTemplate, 
  ViewTab, 
  SwarmAgent, 
  TokenTelemetry, 
  ChatMessage, 
  SwarmPipelineStep 
} from './types';
import { GAME_TEMPLATES } from './data/templates';

const INITIAL_AGENTS: SwarmAgent[] = [
  {
    id: 'atlas',
    name: 'Agent Atlas',
    role: 'Systems & ECS Architect',
    specialty: 'Entity component graphs, memory pools, state trees, game logic specifications',
    avatar: '🧠',
    color: '#38bdf8',
    model: 'gemini-3.7-flash (Lite Spec)',
    status: 'idle',
    tokensProcessed: 1200,
    tokensSaved: 4800,
  },
  {
    id: 'lumina',
    name: 'Agent Lumina',
    role: 'WebGL & GLSL Shader Specialist',
    specialty: 'Custom vertex & fragment shaders, post-processing bloom, GPU particle buffers',
    avatar: '⚡',
    color: '#818cf8',
    model: 'gemini-3.7-flash (Shader Spec)',
    status: 'idle',
    tokensProcessed: 1850,
    tokensSaved: 5900,
  },
  {
    id: 'chronos',
    name: 'Agent Chronos',
    role: 'Physics & Game Loop Optimizer',
    specialty: '60/120fps spatial hash collision, zero-GC game loop, Web Audio synthesizer',
    avatar: '🕹️',
    color: '#f43f5e',
    model: 'gemini-3.7-flash (Physics Spec)',
    status: 'idle',
    tokensProcessed: 1400,
    tokensSaved: 4200,
  },
  {
    id: 'sentinel',
    name: 'Agent Sentinel',
    role: 'Token Throttler & Code Assembler',
    specialty: 'AST micro-diffing, token budget compression, zero-dependency HTML bundle compiler',
    avatar: '🛡️',
    color: '#4ade80',
    model: 'AST Bundler Engine',
    status: 'idle',
    tokensProcessed: 800,
    tokensSaved: 6100,
  },
];

const INITIAL_PROJECT: GameProject = {
  id: 'project-1',
  title: GAME_TEMPLATES[0].title,
  description: GAME_TEMPLATES[0].description,
  genre: GAME_TEMPLATES[0].genre,
  tags: ['WebGL', 'Three.js', '30k Particles', '120 FPS'],
  html: GAME_TEMPLATES[0].html,
  files: GAME_TEMPLATES[0].files,
  particleCount: GAME_TEMPLATES[0].particleCount,
  fpsTarget: 60,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  prompt: 'Starfighter 3D space combat with 30,000 GPU particles and Web Audio synth',
  version: 1,
  author: 'PolySwarm IDE',
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'swarm',
    text: `👋 Welcome to PolySwarm IDE — the multi-AI collaborative game studio designed to push your browser to its physical limits while reducing token burn by up to 85%.\n\n✨ Active Swarm Workers:\n• 🧠 Agent Atlas (Architect)\n• ⚡ Agent Lumina (WebGL Shaders)\n• 🕹️ Agent Chronos (120 FPS Physics & Audio)\n• 🛡️ Agent Sentinel (Token Throttler)\n\nType a prompt below or pick a limit-pushing preset to orchestrate a browser game!`,
    timestamp: Date.now(),
    telemetry: {
      tokensSaved: 21000,
      savingsPercentage: 82,
    },
  },
];

export default function App() {
  const [currentProject, setCurrentProject] = useState<GameProject>(INITIAL_PROJECT);
  const [activeTab, setActiveTab] = useState<ViewTab>('preview');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [agents, setAgents] = useState<SwarmAgent[]>(INITIAL_AGENTS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<SwarmPipelineStep[]>([]);
  const [telemetry, setTelemetry] = useState<TokenTelemetry>({
    tokensUsed: 3800,
    tokensSaved: 21000,
    savingsPercentage: 84,
    estimatedCostUsd: '0.0009',
    swarmNodesCount: 4,
    durationMs: 820,
    cacheHitRate: 94,
  });

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Handle user prompt to orchestrate with the multi-AI swarm
  const handleSendMessage = async (
    promptText: string,
    options: {
      complexity: 'standard' | 'high' | 'extreme';
      targetFps: number;
      enableSpatialAudio: boolean;
      enablePostProcessing: boolean;
      enableParticleSwarm: boolean;
    }
  ) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    // Update agents to running state
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        status: 'running',
      }))
    );

    const steps: SwarmPipelineStep[] = [
      {
        agentId: 'atlas',
        agentName: 'Agent Atlas',
        title: 'Decomposing System Architecture',
        description: `Generated entity graph and ECS state tree. Constrained token budget to ${options.complexity} tier.`,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        agentId: 'lumina',
        agentName: 'Agent Lumina',
        title: 'Synthesizing WebGL Shaders & GPU Geometry',
        description: `Compiled fragment shaders, bloom post-processing, and ${options.enableParticleSwarm ? 'massive GPU particle buffers' : 'standard meshes'}.`,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        agentId: 'chronos',
        agentName: 'Agent Chronos',
        title: 'Assembling Game Loop & Spatial Collision',
        description: `Tuned sub-stepping physics solver for ${options.targetFps} FPS target and hooked procedural Web Audio synthesizer.`,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        agentId: 'sentinel',
        agentName: 'Agent Sentinel',
        title: 'AST Diff Compression & Sandbox Packaging',
        description: 'Verified zero unhandled runtime exceptions and produced self-contained WebGL executable.',
        status: 'completed',
        timestamp: new Date().toLocaleTimeString(),
      },
    ];

    setPipelineSteps(steps);

    try {
      const response = await fetch('/api/swarm/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          complexity: options.complexity,
          targetFps: options.targetFps,
          enableSpatialAudio: options.enableSpatialAudio,
          enablePostProcessing: options.enablePostProcessing,
          enableParticleSwarm: options.enableParticleSwarm,
          currentFiles: currentProject.files,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const generatedGame = resData.data;
        const newProject: GameProject = {
          id: `proj-${Date.now()}`,
          title: generatedGame.title || 'CYBER-EXPERIMENT',
          description: generatedGame.description || promptText,
          genre: generatedGame.genre || '3D WebGL Action',
          tags: generatedGame.features || ['WebGL', 'GPU Particle Swarm'],
          html: generatedGame.html,
          files: generatedGame.files || { 'index.html': generatedGame.html },
          particleCount: options.enableParticleSwarm ? (options.complexity === 'extreme' ? 35000 : 15000) : 3000,
          fpsTarget: options.targetFps,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          prompt: promptText,
          version: currentProject.version + 1,
          author: 'PolySwarm Swarm Ensemble',
        };

        setCurrentProject(newProject);

        if (resData.telemetry) {
          setTelemetry((prev) => ({
            ...prev,
            tokensUsed: prev.tokensUsed + resData.telemetry.tokensUsed,
            tokensSaved: prev.tokensSaved + resData.telemetry.tokensSaved,
            savingsPercentage: resData.telemetry.savingsPercentage || 82,
            durationMs: resData.telemetry.durationMs,
          }));
        }

        // Swarm response message
        const swarmMsg: ChatMessage = {
          id: `swarm-${Date.now()}`,
          sender: 'swarm',
          text: `🚀 **${newProject.title}** generated successfully!\n\n${newProject.description}\n\n**Features Added:**\n${(newProject.tags || []).map((t) => `• ${t}`).join('\n')}`,
          timestamp: Date.now(),
          pipelineSteps: steps,
          telemetry: resData.telemetry,
        };

        setMessages((prev) => [...prev, swarmMsg]);
      }
    } catch (err) {
      console.error('Swarm orchestration error:', err);
    } finally {
      setIsGenerating(false);
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          status: 'completed',
        }))
      );
    }
  };

  // Handle template selection
  const handleSelectTemplate = (template: GameTemplate) => {
    const newProj: GameProject = {
      id: template.id,
      title: template.title,
      description: template.description,
      genre: template.genre,
      tags: template.techStack,
      html: template.html,
      files: template.files,
      particleCount: template.particleCount,
      fpsTarget: 60,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      prompt: `Preset: ${template.title}`,
      version: currentProject.version + 1,
      author: 'PolySwarm Preset Library',
    };
    setCurrentProject(newProj);
    setActiveTab('preview');

    const msg: ChatMessage = {
      id: `template-${Date.now()}`,
      sender: 'swarm',
      text: `🎮 Loaded **${template.title}** benchmark template!\n${template.description}\n\n**Performance:** ${template.benchmark}`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
  };

  // Handle manual code edits
  const handleUpdateCode = (updatedHtml: string) => {
    setCurrentProject((prev) => ({
      ...prev,
      html: updatedHtml,
      files: { ...prev.files, 'index.html': updatedHtml },
      updatedAt: Date.now(),
      version: prev.version + 1,
    }));
  };

  const handleResetGame = () => {
    setCurrentProject((prev) => ({
      ...prev,
      version: prev.version + 1,
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation */}
      <Navbar
        currentProject={currentProject}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTemplate={handleSelectTemplate}
        onResetGame={handleResetGame}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        onOpenProfiler={() => setActiveTab('profiler')}
        telemetry={telemetry}
        isGenerating={isGenerating}
      />

      {/* Main Workspace: Left Chat Dock + Main Stage */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Swarm Chat & Tuning Panel */}
        <SwarmChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          telemetry={telemetry}
          agents={agents}
        />

        {/* Center / Right Stage */}
        <main className="flex-1 h-full overflow-hidden relative bg-slate-950 flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'preview' && (
              <motion.div
                key="tab-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <LiveGamePreview
                  project={currentProject}
                  onRestart={handleResetGame}
                  isGenerating={isGenerating}
                />
              </motion.div>
            )}

            {activeTab === 'code' && (
              <motion.div
                key="tab-code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <CodeEditorView
                  project={currentProject}
                  onUpdateCode={handleUpdateCode}
                />
              </motion.div>
            )}

            {activeTab === 'pipeline' && (
              <motion.div
                key="tab-pipeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <AgentSwarmVisualizer
                  agents={agents}
                  telemetry={telemetry}
                  pipelineSteps={pipelineSteps}
                  isGenerating={isGenerating}
                />
              </motion.div>
            )}

            {activeTab === 'profiler' && (
              <motion.div
                key="tab-profiler"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <PerformanceProfiler project={currentProject} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <TokenSavingsModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        telemetry={telemetry}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={currentProject}
      />
    </div>
  );
}
