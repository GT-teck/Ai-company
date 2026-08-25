import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Save, 
  Trash2, 
  Edit3, 
  Copy, 
  Download, 
  Upload, 
  History, 
  Clock, 
  Check, 
  Plus, 
  Play, 
  Sparkles, 
  X, 
  ChevronRight, 
  Layers, 
  FileJson, 
  Zap, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { GameProject, ProjectVersionCheckpoint } from '../types';

interface ProjectVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: GameProject;
  savedProjects: GameProject[];
  onSaveCurrentProject: (title?: string, description?: string) => void;
  onLoadProject: (project: GameProject) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: GameProject) => void;
  onNewProject: () => void;
  onRestoreCheckpoint: (checkpoint: ProjectVersionCheckpoint) => void;
  onImportProject: (importedProject: GameProject) => void;
}

export const ProjectVaultModal: React.FC<ProjectVaultModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  savedProjects,
  onSaveCurrentProject,
  onLoadProject,
  onDeleteProject,
  onDuplicateProject,
  onNewProject,
  onRestoreCheckpoint,
  onImportProject,
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'history' | 'edit'>('vault');
  const [editTitle, setEditTitle] = useState(currentProject.title);
  const [editDesc, setEditDesc] = useState(currentProject.description);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveCurrentProject(editTitle, editDesc);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleExportJson = (proj: GameProject) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(proj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v${proj.version}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && (parsed.html || parsed.files)) {
            const imported: GameProject = {
              id: `imported-${Date.now()}`,
              title: parsed.title || 'Imported Game Project',
              description: parsed.description || 'Imported from JSON',
              genre: parsed.genre || 'Custom Game',
              tags: parsed.tags || ['Imported', 'WebGL'],
              html: parsed.html || parsed.files?.['index.html'] || '',
              files: parsed.files || { 'index.html': parsed.html || '' },
              particleCount: parsed.particleCount || 10000,
              fpsTarget: parsed.fpsTarget || 60,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              prompt: parsed.prompt || 'Imported Game',
              version: 1,
              author: parsed.author || 'User Import',
              history: parsed.history || [],
              isSaved: true,
            };
            onImportProject(imported);
          }
        } catch (err) {
          alert('Failed to parse JSON project file.');
        }
      };
    }
  };

  const filteredProjects = savedProjects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Project Vault & Save Manager</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-950 text-indigo-400 border border-indigo-800 font-semibold">
                  {savedProjects.length} Saved Projects
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Persistent storage, live version checkpoints & project switching
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewProject();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-medium">
            <button
              onClick={() => setActiveTab('vault')}
              className={`pb-2.5 px-3 border-b-2 transition-all font-semibold flex items-center gap-1.5 ${
                activeTab === 'vault'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>All Saved Projects ({savedProjects.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-2.5 px-3 border-b-2 transition-all font-semibold flex items-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Save & Rename Current</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 px-3 border-b-2 transition-all font-semibold flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Version Checkpoints ({currentProject.history?.length || 1})</span>
            </button>
          </div>

          {/* Import / Export JSON Buttons */}
          <div className="flex items-center gap-2 pb-2">
            <label className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors">
              <Upload className="w-3 h-3 text-cyan-400" />
              <span>Import .json</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
            <button
              onClick={() => handleExportJson(currentProject)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              title="Backup current project to JSON"
            >
              <Download className="w-3 h-3 text-indigo-400" />
              <span>Backup .json</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: ALL SAVED PROJECTS */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              {/* Search & Active Project Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Search saved projects by title, genre, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Currently Editing:</span>
                  <span className="font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {currentProject.title} (v{currentProject.version})
                  </span>
                </div>
              </div>

              {/* Grid of Saved Projects */}
              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <FolderPlus className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400">No saved projects found matching your search.</p>
                  <button
                    onClick={handleSave}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Current Game Now</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredProjects.map((proj) => {
                    const isCurrent = proj.id === currentProject.id;
                    return (
                      <div
                        key={proj.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-slate-950/90 border-cyan-500/70 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                                {isCurrent && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-cyan-400 font-mono">{proj.genre}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              v{proj.version}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                            {proj.description || proj.prompt}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(proj.tags || []).slice(0, 4).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(proj.updatedAt).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {!isCurrent && (
                              <button
                                onClick={() => {
                                  onLoadProject(proj);
                                  onClose();
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-all"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Load</span>
                              </button>
                            )}

                            <button
                              onClick={() => onDuplicateProject(proj)}
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="Duplicate project"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleExportJson(proj)}
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="Export project to JSON"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Delete project "${proj.title}"?`)) {
                                  onDeleteProject(proj.id);
                                }
                              }}
                              className="p-1.5 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVE & RENAME CURRENT PROJECT */}
          {activeTab === 'edit' && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Save className="w-4 h-4 text-cyan-400" />
                  Save & Update Project Metadata
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1">
                      Game Description & Gameplay Mechanics
                    </label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-slate-400">
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Current Version</span>
                      <span className="text-white font-bold">v{currentProject.version}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Total Particle Density</span>
                      <span className="text-cyan-400 font-bold">{currentProject.particleCount.toLocaleString()} GPU Particles</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-emerald-400">
                    {savedFeedback && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved to Vault!
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleSave}
                    className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Project</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERSION HISTORY / CHECKPOINTS */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Iteration Checkpoints</h4>
                  <p className="text-slate-400 text-[11px]">
                    Revert to any previous state created during this session.
                  </p>
                </div>
              </div>

              {(!currentProject.history || currentProject.history.length === 0) ? (
                <div className="p-6 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400">
                  <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p>Current version (v{currentProject.version}) is the baseline.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentProject.history.slice().reverse().map((cp, idx) => (
                    <div
                      key={cp.id}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          v{cp.version}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200 text-xs">
                            {cp.summary || `Iteration v${cp.version}`}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Prompt: "{cp.prompt}"
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(cp.timestamp).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`Restore version v${cp.version}?`)) {
                              onRestoreCheckpoint(cp);
                              onClose();
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Revert</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auto-persistence enabled in local vault</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
