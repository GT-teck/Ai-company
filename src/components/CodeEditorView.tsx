import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Play, 
  Download, 
  Search, 
  Sparkles, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { GameProject } from '../types';

interface CodeEditorViewProps {
  project: GameProject;
  onUpdateCode: (updatedHtml: string) => void;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  project,
  onUpdateCode,
}) => {
  const [activeFile, setActiveFile] = useState<'index.html' | 'game.js' | 'audio.js' | 'shaders.glsl'>('index.html');
  const [codeContent, setCodeContent] = useState(project.html);
  const [hasCopied, setHasCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Keep code synced if project changes from swarm
  React.useEffect(() => {
    setCodeContent(project.html);
    setIsDirty(false);
  }, [project.html]);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleApplyChanges = () => {
    onUpdateCode(codeContent);
    setIsDirty(false);
  };

  const fileTabs: Array<'index.html' | 'game.js' | 'audio.js' | 'shaders.glsl'> = [
    'index.html',
    'game.js',
    'audio.js',
    'shaders.glsl',
  ];

  const lines = codeContent.split('\n');

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col overflow-hidden select-none">
      {/* File Tabs & Actions Toolbar */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          {fileTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFile(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeFile === tab
                  ? 'bg-slate-950 text-cyan-400 border border-slate-800 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{tab}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={handleApplyChanges}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all animate-bounce"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Apply & Run</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            title="Copy Code"
          >
            {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{hasCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs select-text">
        {/* Line Numbers */}
        <div className="w-12 bg-slate-950 py-3 text-right pr-3 select-none text-slate-600 border-r border-slate-900 shrink-0 font-mono text-[11px] overflow-hidden">
          {lines.map((_, i) => (
            <div key={i} className="leading-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          value={codeContent}
          onChange={(e) => {
            setCodeContent(e.target.value);
            setIsDirty(true);
          }}
          spellCheck={false}
          className="flex-1 p-3 bg-slate-950 text-slate-200 resize-none focus:outline-none leading-5 font-mono selection:bg-indigo-500/30 whitespace-pre overflow-auto"
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-slate-900 border-t border-slate-800 px-3 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>HTML / WebGL / Three.js</span>
          <span>{lines.length} lines</span>
        </div>
        <div>
          {isDirty ? (
            <span className="text-amber-400">● Unsaved Changes</span>
          ) : (
            <span className="text-emerald-400">● Synced with Engine</span>
          )}
        </div>
      </div>
    </div>
  );
};
