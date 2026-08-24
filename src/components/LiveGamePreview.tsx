import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Activity,
  Gauge,
  Camera,
  Smartphone
} from 'lucide-react';
import { GameProject } from '../types';

interface LiveGamePreviewProps {
  project: GameProject;
  onRestart: () => void;
  isGenerating: boolean;
}

export const LiveGamePreview: React.FC<LiveGamePreviewProps> = ({
  project,
  onRestart,
  isGenerating,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(60);
  const [frameTimeMs, setFrameTimeMs] = useState(16.6);
  const [keyCounter, setKeyCounter] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showTelemetryHUD, setShowTelemetryHUD] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRestart = () => {
    setKeyCounter((prev) => prev + 1);
    onRestart();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen error:', err);
      });
      setIsFullscreen(false);
    }
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([project.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // FPS ticker simulation based on animation frames
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const measure = (now: number) => {
      frameCount++;
      const delta = now - lastTime;
      if (delta >= 800) {
        const measuredFps = Math.round((frameCount * 1000) / delta);
        setFps(Math.min(120, Math.max(30, measuredFps)));
        setFrameTimeMs(Number((1000 / measuredFps).toFixed(1)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
        {/* Left: Performance Telemetry Pill */}
        {showTelemetryHUD && (
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 shadow-lg text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${fps >= 55 ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              <span className="font-bold text-white">{fps} FPS</span>
            </div>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{frameTimeMs}ms</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-cyan-400 hidden sm:inline">
              {(project.particleCount || 25000).toLocaleString()} Particles
            </span>
          </div>
        )}

        {/* Right: Quick Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 p-1 rounded-xl shadow-lg">
          <button
            onClick={() => setShowTelemetryHUD(!showTelemetryHUD)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="Toggle Performance HUD"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="Restart Game Engine"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenInNewTab}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors hidden sm:inline-flex"
            title="Open in Dedicated Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Play Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sandboxed Game Iframe */}
      <iframe
        key={`${project.id}-${keyCounter}-${project.version}`}
        ref={iframeRef}
        srcDoc={project.html}
        title={project.title}
        sandbox="allow-scripts allow-same-origin allow-pointer-lock"
        className="w-full h-full border-0 bg-slate-950"
      />

      {/* Loading Overlay during Swarm compilation */}
      {isGenerating && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30 pointer-events-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-spin">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-white tracking-tight">
            Swarm Agents Compiling WebGL Shaders...
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Optimizing for 60–120 FPS frame latency
          </div>
        </div>
      )}
    </div>
  );
};
