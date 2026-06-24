/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, 
  Briefcase, 
  FolderOpen, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Target, 
  Calendar,
  Sparkles,
  TrendingUp,
  AwardIcon,
  CircleDot
} from 'lucide-react';
import { Achievement, Internship, CVFile, CareerGoal } from '../types';

interface CareerTabProps {
  achievements: Achievement[];
  internships: Internship[];
  cvFiles: CVFile[];
  careerGoals: CareerGoal[];
  onAddAchievement: (ach: Omit<Achievement, 'id'>) => void;
  onDeleteAchievement: (id: number) => void;
  onAddInternship: (intern: Omit<Internship, 'id'>) => void;
  onDeleteInternship: (id: number) => void;
  onAddCV: (cv: Omit<CVFile, 'id' | 'date'>) => void;
  onDeleteCV: (id: number) => void;
  onAddCareerGoal: (goal: Omit<CareerGoal, 'id'>) => void;
  onDeleteCareerGoal: (id: number) => void;
  onToggleGoal: (id: number) => void;
}

export default function CareerTab({
  achievements,
  internships,
  cvFiles,
  careerGoals,
  onAddAchievement,
  onDeleteAchievement,
  onAddInternship,
  onDeleteInternship,
  onAddCV,
  onDeleteCV,
  onAddCareerGoal,
  onDeleteCareerGoal,
  onToggleGoal
}: CareerTabProps) {
  // Modal toggle states
  const [showAchModal, setShowAchForm] = useState(false);
  const [showInternModal, setShowInternForm] = useState(false);
  const [showCvModal, setShowCvForm] = useState(false);
  const [showGoalModal, setShowGoalForm] = useState(false);

  // Form inputs
  const [achTitle, setAchTitle] = useState("");
  const [achDesc, setAchDesc] = useState("");
  const [achCat, setAchCat] = useState("🏆 Award");
  const [achDate, setAchDate] = useState("");

  const [intCompany, setIntCompany] = useState("");
  const [intRole, setIntRole] = useState("");
  const [intStart, setIntStart] = useState("");
  const [intEnd, setIntEnd] = useState("");
  const [intDesc, setIntDesc] = useState("");
  const [intStatus, setIntStatus] = useState<'completed' | 'ongoing' | 'upcoming'>('completed');

  const [cvName, setCvName] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [cvNote, setCvNote] = useState("");

  const [cgTitle, setCgTitle] = useState("");
  const [cgDate, setCgDate] = useState("");

  const handleAddAch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle.trim()) return;
    onAddAchievement({
      title: achTitle,
      desc: achDesc || undefined,
      cat: achCat,
      date: achDate || undefined
    });
    setAchTitle("");
    setAchDesc("");
    setAchDate("");
    setShowAchForm(false);
  };

  const handleAddIntern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intCompany.trim()) return;
    onAddInternship({
      company: intCompany,
      role: intRole || undefined,
      start: intStart || undefined,
      end: intEnd || undefined,
      desc: intDesc || undefined,
      status: intStatus
    });
    setIntCompany("");
    setIntRole("");
    setIntStart("");
    setIntEnd("");
    setIntDesc("");
    setShowInternForm(false);
  };

  const handleAddCv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvName.trim()) return;
    onAddCV({
      name: cvName,
      url: cvUrl || undefined,
      note: cvNote || undefined
    });
    setCvName("");
    setCvUrl("");
    setCvNote("");
    setShowCvForm(false);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cgTitle.trim()) return;
    onAddCareerGoal({
      title: cgTitle,
      date: cgDate || undefined,
      status: 'active'
    });
    setCgTitle("");
    setCgDate("");
    setShowGoalForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="serif text-2xl font-bold text-[var(--text)]">Career Portfolio</h2>
        <p className="text-xs text-[var(--muted)]">Log milestones, store CV drafts, monitor internships, and schedule professional checkmarks</p>
      </div>

      {/* Grid: Achievements & Internships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Achievements Log Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4 shrink-0">
            <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-[var(--accent)]" />
              <span>🏆 Accomplishments</span>
            </h3>
            <button 
              onClick={() => setShowAchForm(true)}
              className="p-1 rounded bg-[var(--accent-dim)] text-[var(--accent)] hover:opacity-85"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {achievements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-[var(--muted)]">
                <Sparkles className="w-8 h-8 mb-2 text-yellow-500 animate-pulse" />
                <p className="text-xs font-semibold">No accomplishments recorded yet</p>
                <p className="text-[10px] text-[var(--muted-dark)] max-w-[200px] mt-0.5">Won a hackathon? Earned a certification? Click + to log standard credentials!</p>
              </div>
            ) : (
              achievements.map((ach) => (
                <div key={ach.id} className="border border-[var(--border)] rounded-xl p-3 flex items-start justify-between gap-3 bg-[var(--surface-hover)]">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-[var(--surface-active)] border border-[var(--border-strong)] text-[var(--text)] rounded-sm">
                      {ach.cat}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--text)] mt-1.5">{ach.title}</h4>
                    {ach.desc && <p className="text-[11px] text-[var(--muted-dark)] mt-0.5 leading-relaxed">{ach.desc}</p>}
                    {ach.date && <p className="text-[9px] font-mono text-[var(--muted)] mt-1">Conferred {ach.date}</p>}
                  </div>
                  <button 
                    onClick={() => onDeleteAchievement(ach.id)}
                    className="text-rose-500 hover:text-rose-600 p-1 rounded-md hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Internships Log Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4 shrink-0">
            <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-[var(--accent)]" />
              <span>💼 Internships / Experience</span>
            </h3>
            <button 
              onClick={() => setShowInternForm(true)}
              className="p-1 rounded bg-[var(--accent-dim)] text-[var(--accent)] hover:opacity-85"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {internships.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-[var(--muted)]">
                <Briefcase className="w-8 h-8 mb-2 text-sky-500" />
                <p className="text-xs font-semibold">No internship contracts logged yet</p>
                <p className="text-[10px] text-[var(--muted-dark)] max-w-[200px] mt-0.5">Record previous corporate placements or pending job acceptances</p>
              </div>
            ) : (
              internships.map((intern) => (
                <div key={intern.id} className="border border-[var(--border)] rounded-xl p-4 flex flex-col gap-2 bg-[var(--surface-hover)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text)]">{intern.role || "Intern"}</h4>
                      <p className="text-[11px] text-[var(--muted-dark)] font-semibold">{intern.company}</p>
                    </div>
                    <button 
                      onClick={() => onDeleteInternship(intern.id)}
                      className="text-rose-500 hover:text-rose-600 p-1 rounded-md hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {intern.desc && <p className="text-xs text-[var(--muted-dark)] leading-relaxed italic">{intern.desc}</p>}
                  <div className="flex justify-between items-center mt-1 border-t border-[var(--border)] pt-2 text-[10px]">
                    <span className="text-[var(--muted)] font-mono">{intern.start || 'N/A'} {intern.end ? `→ ${intern.end}` : '→ Present'}</span>
                    <span className={`px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
                      intern.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      intern.status === 'ongoing' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {intern.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Grid: CV Folders & Career Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Virtual CV Folder */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4 shrink-0">
            <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
              <FolderOpen className="w-4.5 h-4.5 text-amber-500" />
              <span>📁 Academic Resume Folder</span>
            </h3>
            <button 
              onClick={() => setShowCvForm(true)}
              className="p-1 rounded bg-[var(--accent-dim)] text-[var(--accent)] hover:opacity-85"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {cvFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-[var(--muted)]">
                <FolderOpen className="w-8 h-8 mb-2 text-amber-400" />
                <p className="text-xs font-semibold">Folder is currently empty</p>
                <p className="text-[10px] text-[var(--muted-dark)] max-w-[200px] mt-0.5">Upload multiple CV drafts or customized cover letters</p>
              </div>
            ) : (
              cvFiles.map((cv) => (
                <div key={cv.id} className="bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text)]">{cv.name}</h4>
                      {cv.note && <p className="text-[11px] text-[var(--muted-dark)]">{cv.note}</p>}
                      <p className="text-[9px] text-[var(--muted)] font-mono mt-0.5">Archived {cv.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {cv.url && (
                      <a 
                        href={cv.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded"
                        title="Download/Open Reference"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button 
                      onClick={() => onDeleteCV(cv.id)}
                      className="text-rose-500 p-1.5 rounded hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Career Goals Log Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4 shrink-0">
            <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
              <Target className="w-4.5 h-4.5 text-[var(--accent)]" />
              <span>🎯 Professional Ambitions</span>
            </h3>
            <button 
              onClick={() => setShowGoalForm(true)}
              className="p-1 rounded bg-[var(--accent-dim)] text-[var(--accent)] hover:opacity-85"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {careerGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-[var(--muted)]">
                <Target className="w-8 h-8 mb-2 text-rose-400" />
                <p className="text-xs font-semibold">No career targets scheduled</p>
                <p className="text-[10px] text-[var(--muted-dark)] max-w-[200px] mt-0.5">Establish long-term milestones (e.g., publishing research or graduate school target dates)</p>
              </div>
            ) : (
              careerGoals.map((goal) => (
                <div key={goal.id} className="border border-[var(--border)] rounded-xl p-3 flex items-start justify-between gap-3 bg-[var(--surface-hover)]">
                  <div className="flex items-start gap-2.5">
                    <button 
                      onClick={() => onToggleGoal(goal.id)}
                      className="mt-0.5 shrink-0"
                    >
                      {goal.status === 'done' ? (
                        <div className="w-[16px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">
                          ✓
                        </div>
                      ) : (
                        <div className="w-[16px] h-[18px] rounded-full border border-[var(--border-strong)] hover:border-emerald-500 bg-[var(--surface)]" />
                      )}
                    </button>
                    <div>
                      <h4 className={`text-xs font-bold text-[var(--text)] ${goal.status === 'done' ? 'line-through text-[var(--muted)]' : ''}`}>{goal.title}</h4>
                      {goal.date && <p className="text-[9px] text-[var(--muted)] mt-0.5 font-mono">Target: {goal.date}</p>}
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteCareerGoal(goal.id)}
                    className="text-rose-500 hover:text-rose-600 p-1 rounded-md hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* --- FORMS AND POPUPS MODALS --- */}

      {/* 1. Achievements Modal */}
      {showAchModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeUp">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full max-w-md">
            <h3 className="serif text-base font-semibold text-[var(--text)] mb-4">Record Achievement Card</h3>
            <form onSubmit={handleAddAch} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Achievement Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Won Campus Hackathon" 
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  className="inp text-xs" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Brief Description</label>
                <textarea 
                  placeholder="Summarize the core credentials, award values, or projects..." 
                  value={achDesc}
                  onChange={(e) => setAchDesc(e.target.value)}
                  className="inp text-xs min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    value={achCat}
                    onChange={(e) => setAchCat(e.target.value)}
                    className="inp text-xs"
                  >
                    <option>🏆 Award</option>
                    <option>📜 Certification</option>
                    <option>🎤 Presentation</option>
                    <option>📝 Publication</option>
                    <option>⭐ General</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Conferred Date</label>
                  <input 
                    type="date" 
                    value={achDate}
                    onChange={(e) => setAchDate(e.target.value)}
                    className="inp text-xs" 
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAchForm(false)} 
                  className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary py-1.5 px-3 text-xs">Add Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Internships Modal */}
      {showInternModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeUp">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full max-w-md">
            <h3 className="serif text-base font-semibold text-[var(--text)] mb-4">Add Internship Log</h3>
            <form onSubmit={handleAddIntern} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Google DeepMind" 
                    value={intCompany}
                    onChange={(e) => setIntCompany(e.target.value)}
                    className="inp text-xs" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Research Intern" 
                    value={intRole}
                    onChange={(e) => setIntRole(e.target.value)}
                    className="inp text-xs" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Start Period</label>
                  <input 
                    type="month" 
                    value={intStart}
                    onChange={(e) => setIntStart(e.target.value)}
                    className="inp text-xs" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Period (blank if Present)</label>
                  <input 
                    type="month" 
                    value={intEnd}
                    onChange={(e) => setIntEnd(e.target.value)}
                    className="inp text-xs" 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Key Operations / Duties</label>
                <textarea 
                  placeholder="Record core programming models studied, key operations, or teams..." 
                  value={intDesc}
                  onChange={(e) => setIntDesc(e.target.value)}
                  className="inp text-xs min-h-[80px]"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Placement Status</label>
                <select 
                  value={intStatus}
                  onChange={(e) => setIntStatus(e.target.value as any)}
                  className="inp text-xs"
                >
                  <option value="completed">✅ Completed Placement</option>
                  <option value="ongoing">🚀 Active / Ongoing</option>
                  <option value="upcoming">📅 Future / Upcoming Offer</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowInternForm(false)} 
                  className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary py-1.5 px-3 text-xs">Add Internship</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CV Modal */}
      {showCvModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeUp">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full max-w-md">
            <h3 className="serif text-base font-semibold text-[var(--text)] mb-4">Link CV Draft Version</h3>
            <form onSubmit={handleAddCv} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Document Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. CV_2026_Standard_Standard.pdf" 
                  value={cvName}
                  onChange={(e) => setCvName(e.target.value)}
                  className="inp text-xs" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cloud Reference Link (URL)</label>
                <input 
                  type="text" 
                  placeholder="e.g. https://drive.google.com/..." 
                  value={cvUrl}
                  onChange={(e) => setCvUrl(e.target.value)}
                  className="inp text-xs" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Development Notes / Target Positions</label>
                <input 
                  type="text" 
                  placeholder="e.g. Hand-tailored research version with GPA" 
                  value={cvNote}
                  onChange={(e) => setCvNote(e.target.value)}
                  className="inp text-xs" 
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCvForm(false)} 
                  className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary py-1.5 px-3 text-xs">Archive Draft</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Career Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeUp">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full max-w-md">
            <h3 className="serif text-base font-semibold text-[var(--text)] mb-4">Establish Career Target</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Ambition Objective</label>
                <input 
                  type="text" 
                  placeholder="e.g. Earn software developer placement" 
                  value={cgTitle}
                  onChange={(e) => setCgTitle(e.target.value)}
                  className="inp text-xs" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Target Date</label>
                <input 
                  type="date" 
                  value={cgDate}
                  onChange={(e) => setCgDate(e.target.value)}
                  className="inp text-xs" 
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowGoalForm(false)} 
                  className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary py-1.5 px-3 text-xs">Add Target</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
