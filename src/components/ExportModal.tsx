import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Code, 
  Share2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { GameProject } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GameProject;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [copiedType, setCopiedType] = useState<'html' | 'embed' | null>(null);

  if (!isOpen) return null;

  const handleDownloadHtml = () => {
    const element = document.createElement('a');
    const file = new Blob([project.html], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(project.html);
    setCopiedType('html');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const embedCode = `<iframe src="${window.location.origin}" width="100%" height="600" frameborder="0" allow="pointer-lock" allowfullscreen></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedType('embed');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <Download className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Export & Publish Game</h3>
              <p className="text-[11px] text-slate-400 font-mono">Zero-dependency standalone format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* Primary Action: Download Standalone HTML */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/40 border border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-white text-sm">Standalone HTML Package</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Contains full WebGL shaders, Three.js runtime, audio synth, and CSS. Double click to play offline!
              </p>
            </div>
            <button
              onClick={handleDownloadHtml}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download .HTML</span>
            </button>
          </div>

          {/* Copy Raw Code */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Raw Game HTML & Scripts</span>
              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors"
              >
                {copiedType === 'html' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'html' ? 'Copied' : 'Copy All Code'}</span>
              </button>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-400 truncate border border-slate-800/60">
              {project.html.slice(0, 100)}...
            </div>
          </div>

          {/* Embed Snippet */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Embed iFrame Snippet</span>
              <button
                onClick={handleCopyEmbed}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors"
              >
                {copiedType === 'embed' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'embed' ? 'Copied' : 'Copy Snippet'}</span>
              </button>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-400 truncate border border-slate-800/60">
              {embedCode}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
