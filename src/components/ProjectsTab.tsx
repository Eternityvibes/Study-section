/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Layers, 
  CheckCircle, 
  Calendar, 
  FolderPlus, 
  Play, 
  Pause, 
  Check, 
  Circle,
  FolderClosed
} from 'lucide-react';
import { Project, ProjectMilestone, ProjectTask } from '../types';

interface ProjectsTabProps {
  projects: Project[];
  onAddProject: (proj: Omit<Project, 'id' | 'milestones' | 'ptasks' | 'expanded'>) => void;
  onDeleteProject: (id: number) => void;
  onAddMilestone: (projectId: number, title: string, due?: string) => void;
  onToggleMilestone: (projectId: number, milestoneId: number) => void;
  onDeleteMilestone: (projectId: number, milestoneId: number) => void;
  onAddProjTask: (projectId: number, title: string) => void;
  onToggleProjTask: (projectId: number, taskId: number) => void;
  onDeleteProjTask: (projectId: number, taskId: number) => void;
  onUpdateProjectStatus: (projectId: number, status: Project['status']) => void;
}

export default function ProjectsTab({
  projects,
  onAddProject,
  onDeleteProject,
  onAddMilestone,
  onToggleMilestone,
  onDeleteMilestone,
  onAddProjTask,
  onToggleProjTask,
  onDeleteProjTask,
  onUpdateProjectStatus
}: ProjectsTabProps) {
  // Modal toggle states
  const [showAddProject, setShowAddProject] = useState(false);
  const [activeProjectForMilestone, setActiveProjectForMilestone] = useState<number | null>(null);
  const [activeProjectForTask, setActiveProjectForTask] = useState<number | null>(null);

  // Form inputs
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pStatus, setPStatus] = useState<Project['status']>('active');
  const [pDue, setPDue] = useState("");

  const [mTitle, setMTitle] = useState("");
  const [mDue, setMDue] = useState("");

  const [tTitle, setTTitle] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    onAddProject({
      name: pName,
      desc: pDesc || undefined,
      status: pStatus,
      due: pDue || undefined
    });
    setPName("");
    setPDesc("");
    setPDue("");
    setShowAddProject(false);
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectForMilestone || !mTitle.trim()) return;
    onAddMilestone(activeProjectForMilestone, mTitle, mDue || undefined);
    setMTitle("");
    setMDue("");
    setActiveProjectForMilestone(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectForTask || !tTitle.trim()) return;
    onAddProjTask(activeProjectForTask, tTitle);
    setTTitle("");
    setActiveProjectForTask(null);
  };

  // Status mapping
  const STATUS_ST: Record<Project['status'], string> = {
    planning: '📋 Planning',
    active: '🚀 Active',
    paused: '⏸ Paused',
    done: '✅ Completed'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-2xl font-bold text-[var(--text)]">Project Center</h2>
          <p className="text-xs text-[var(--muted)]">Track developmental checklists, schedule milestones, and inspect coding directories</p>
        </div>
        <button
          onClick={() => setShowAddProject(!showAddProject)}
          className="btn btn-primary self-start sm:self-center flex items-center gap-1.5 shadow-md"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Project Workspace</span>
        </button>
      </div>

      {/* Add Project Form Modal */}
      {showAddProject && (
        <form onSubmit={handleCreateProject} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-lg max-w-xl space-y-4">
          <h3 className="serif text-base font-semibold text-[var(--text)]">Create Project Workspace</h3>
          
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input 
              type="text" 
              placeholder="e.g. Distributed Consensus Engine" 
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              className="inp text-xs" 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Core Objective</label>
            <textarea 
              placeholder="Record structural aims, key dependencies, and technological stacks..." 
              value={pDesc}
              onChange={(e) => setPDesc(e.target.value)}
              className="inp text-xs min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select 
                value={pStatus}
                onChange={(e) => setPStatus(e.target.value as any)}
                className="inp text-xs"
              >
                <option value="planning">📋 Planning / Wireframing</option>
                <option value="active">🚀 Active Development</option>
                <option value="paused">⏸ Paused / On Hold</option>
                <option value="done">✅ Completed Project</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Target Date</label>
              <input 
                type="date" 
                value={pDue}
                onChange={(e) => setPDue(e.target.value)}
                className="inp text-xs" 
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setShowAddProject(false)} 
              className="btn btn-ghost text-xs border-[var(--border-strong)]"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs">Establish Project</button>
          </div>
        </form>
      )}

      {/* Projects Cards List */}
      <div className="space-y-6">
        {projects.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-12 text-center text-[var(--muted)]">
            <FolderClosed className="w-10 h-10 mb-3 block text-amber-500 mx-auto" />
            <p className="text-sm font-semibold">No active projects registered</p>
            <p className="text-xs text-[var(--muted-dark)] max-w-sm mx-auto mt-1">Add software, research, or writing projects to track checklists and milestones</p>
          </div>
        ) : (
          projects.map((project) => {
            // Calculate completion dynamics:
            // Total metrics = total milestones + total task list checkboxes
            const msTotal = project.milestones ? project.milestones.length : 0;
            const msDone = project.milestones ? project.milestones.filter(m => m.done).length : 0;
            
            const taskTotal = project.ptasks ? project.ptasks.length : 0;
            const taskDone = project.ptasks ? project.ptasks.filter(t => t.done).length : 0;

            const totalPoints = msTotal + taskTotal;
            const donePoints = msDone + taskDone;
            const progressPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

            return (
              <div 
                key={project.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 md:p-6 space-y-4 hover:shadow-xs transition-shadow duration-200"
              >
                {/* Project Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h3 className="serif text-base font-bold text-[var(--text)]">{project.name}</h3>
                    {project.desc && <p className="text-xs text-[var(--muted-dark)] leading-relaxed mt-1 max-w-xl">{project.desc}</p>}
                    
                    <div className="flex flex-wrap items-center gap-2.5 mt-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border bg-[var(--surface-active)] text-[var(--text)]`}>
                        {STATUS_ST[project.status]}
                      </span>
                      {project.due && (
                        <span className="text-[10px] text-[var(--muted)] flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Target: {project.due}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button 
                      onClick={() => setActiveProjectForMilestone(project.id)}
                      className="btn btn-ghost py-1 px-2.5 text-[10px] border-[var(--border-strong)]"
                    >
                      + Milestone
                    </button>
                    <button 
                      onClick={() => setActiveProjectForTask(project.id)}
                      className="btn btn-ghost py-1 px-2.5 text-[10px] border-[var(--border-strong)]"
                    >
                      + Checklist
                    </button>
                    
                    <select
                      value={project.status}
                      onChange={(e) => onUpdateProjectStatus(project.id, e.target.value as any)}
                      className="inp text-[10px] py-1 px-2 w-auto"
                    >
                      <option value="planning">📋 Planning</option>
                      <option value="active">🚀 Active</option>
                      <option value="paused">⏸ Paused</option>
                      <option value="done">✅ Done</option>
                    </select>

                    <button 
                      onClick={() => onDeleteProject(project.id)}
                      className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Archive Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar Widget */}
                <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-[var(--muted-dark)] mb-1">
                    <span>Dynamic Completion Metrics</span>
                    <span>{donePoints}/{totalPoints} Items ({progressPct}%)</span>
                  </div>
                  <div className="prog h5">
                    <div 
                      className={`prog-fill ${progressPct === 100 ? 'bg-emerald-500' : 'bg-[var(--accent)]'}`} 
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Project Columns: Milestones & Todo Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  
                  {/* Column 1: Milestones Checklist */}
                  <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface-hover)] space-y-3">
                    <h4 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">🚩 Key Milestones</h4>
                    
                    {project.milestones.length === 0 ? (
                      <p className="text-[11px] text-[var(--muted-dark)] italic">No milestones registered. Schedule milestones to outline development phases.</p>
                    ) : (
                      <div className="space-y-2">
                        {project.milestones.map((m) => (
                          <div key={m.id} className="flex items-center justify-between gap-2 text-xs bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button 
                                onClick={() => onToggleMilestone(project.id, m.id)}
                                className="shrink-0"
                              >
                                {m.done ? (
                                  <div className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">
                                    ✓
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded border border-[var(--border-strong)] hover:border-emerald-500 bg-[var(--surface)]" />
                                )}
                              </button>
                              <span className={`font-semibold truncate ${m.done ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'}`}>
                                {m.title}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 shrink-0">
                              {m.due && <span className="text-[9px] font-mono text-[var(--muted-dark)]">Due {m.due}</span>}
                              <button 
                                onClick={() => onDeleteMilestone(project.id, m.id)}
                                className="text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Todo Checklist */}
                  <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface-hover)] space-y-3">
                    <h4 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">☑ Development Task Checklist</h4>
                    
                    {project.ptasks.length === 0 ? (
                      <p className="text-[11px] text-[var(--muted-dark)] italic">No tasks. Establish checklist items to check off fast priorities.</p>
                    ) : (
                      <div className="space-y-2">
                        {project.ptasks.map((t) => (
                          <div key={t.id} className="flex items-center justify-between gap-2 text-xs bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button 
                                onClick={() => onToggleProjTask(project.id, t.id)}
                                className="shrink-0"
                              >
                                {t.done ? (
                                  <div className="w-4 h-4 rounded bg-[var(--accent)] text-white flex items-center justify-center font-bold text-[9px]">
                                    ✓
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded border border-[var(--border-strong)] hover:border-[var(--accent)] bg-[var(--surface)]" />
                                )}
                              </button>
                              <span className={`font-medium truncate ${t.done ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'}`}>
                                {t.title}
                              </span>
                            </div>
                            
                            <button 
                              onClick={() => onDeleteProjTask(project.id, t.id)}
                              className="text-rose-500 hover:bg-rose-500/10 p-1 rounded shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- FLOATING POPUPS FOR MILESTONE & TASKS ADDITION --- */}

      {/* 1. Add Milestone Modal */}
      {activeProjectForMilestone && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeUp">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="serif text-base font-semibold text-[var(--text)] mb-3">Add Project Milestone</h3>
            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Milestone Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Complete wireframes & review UI" 
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  className="inp text-xs" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Target Date</label>
                <input 
                  type="date" 
                  value={mDue}
                  onChange={(e) => setMDue(e.target.value)}
                  className="inp text-xs" 
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveProjectForMilestone(null)} 
                  className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary py-1.5 px-3 text-xs">Add Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Project Task Modal */}
      {activeProjectForTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeUp">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="serif text-base font-semibold text-[var(--text)] mb-3">Add Project Task Checklist</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Task description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Integrate Redis Cache library" 
                  value={tTitle}
                  onChange={(e) => setTTitle(e.target.value)}
                  className="inp text-xs" 
                  required
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveProjectForTask(null)} 
                  className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary py-1.5 px-3 text-xs">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
