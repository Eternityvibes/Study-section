/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Bookmark, 
  BookOpen, 
  CheckCircle, 
  Edit,
  Save
} from 'lucide-react';
import { ResearchPaper } from '../types';

interface ResearchTabProps {
  papers: ResearchPaper[];
  onAddPaper: (paper: Omit<ResearchPaper, 'id' | 'date'>) => void;
  onDeletePaper: (id: number) => void;
  onUpdateStatus: (id: number, status: ResearchPaper['status']) => void;
  onUpdateNotes: (id: number, notes: string) => void;
}

export default function ResearchTab({
  papers,
  onAddPaper,
  onDeletePaper,
  onUpdateStatus,
  onUpdateNotes
}: ResearchTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  
  // New paper form states
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [type, setType] = useState<ResearchPaper['type']>('paper');
  const [status, setStatus] = useState<ResearchPaper['status']>('unread');
  const [url, setUrl] = useState("");
  const [paperNotes, setPaperNotes] = useState("");

  // Edit notes state
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddPaper({
      title,
      authors: authors || undefined,
      type,
      status,
      url: url || undefined,
      notes: paperNotes || undefined
    });

    // Reset
    setTitle("");
    setAuthors("");
    setType("paper");
    setStatus("unread");
    setUrl("");
    setPaperNotes("");
    setShowAddForm(false);
  };

  const handleEditNotes = (paper: ResearchPaper) => {
    setEditingNotesId(paper.id);
    setNotesDraft(paper.notes || "");
  };

  const handleSaveNotes = (id: number) => {
    onUpdateNotes(id, notesDraft);
    setEditingNotesId(null);
  };

  // Calculations for progress bar
  const total = papers.length;
  const done = papers.filter(p => p.status === 'done').length;
  const reading = papers.filter(p => p.status === 'reading').length;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

  const filteredPapers = filterType === 'all' 
    ? papers 
    : papers.filter(p => p.type === filterType);

  const getTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'paper': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/60';
      case 'link': return 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-900/60';
      case 'pdf': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/60';
      case 'doc': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60';
      case 'note': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'done': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'reading': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'unread': return 'bg-gray-500/10 text-[var(--muted-dark)] border-gray-500/20';
      default: return 'bg-gray-500/10 text-[var(--muted-dark)] border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-2xl font-bold text-[var(--text)]">Research Hub</h2>
          <p className="text-xs text-[var(--muted)]">Track academic papers, journals, literature review pieces, and bookmarks</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary self-start sm:self-center flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Literature / Paper</span>
        </button>
      </div>

      {/* Progress Bar Summary */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-[var(--muted-dark)] uppercase tracking-wider">Reading Completion Rate</span>
          <span className="text-sm font-bold text-[var(--accent)]">{progressPct}%</span>
        </div>
        <div className="prog h8 mb-4">
          <div 
            className="prog-fill bg-[var(--accent)]" 
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex gap-6 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[var(--muted)]" />
            <span className="text-[var(--text)] font-semibold">{total} Total Items</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-[var(--text)] font-semibold">{reading} Reading</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-[var(--text)] font-semibold">{done} Completed</span>
          </div>
        </div>
      </div>

      {/* New Paper Form Modal */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-lg space-y-4 max-w-xl">
          <h3 className="serif text-base font-semibold text-[var(--text)]">Register Research Resource</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Paper / Resource Title</label>
              <input
                type="text"
                placeholder="e.g. Attention Is All You Need"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="inp text-xs"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Authors / Research Laboratory</label>
              <input
                type="text"
                placeholder="e.g. Vaswani et al. (Google Brain)"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="inp text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Resource Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="inp text-xs"
              >
                <option value="paper">📄 Scientific Paper</option>
                <option value="pdf">📕 PDF Slide Deck</option>
                <option value="link">🔗 Reference Hyperlink</option>
                <option value="doc">💼 General Doc</option>
                <option value="note">📝 Self Written Note</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="inp text-xs"
              >
                <option value="unread">📕 Unread / Backlog</option>
                <option value="reading">📖 Reading Now</option>
                <option value="done">✅ Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Paper Link (URL)</label>
              <input
                type="text"
                placeholder="e.g. https://arxiv.org/abs/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="inp text-xs"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Notes / Objectives</label>
            <textarea
              placeholder="Record initial theories, research gaps, questions, or methodologies..."
              value={paperNotes}
              onChange={(e) => setPaperNotes(e.target.value)}
              className="inp text-xs min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn btn-ghost text-xs border-[var(--border-strong)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs"
            >
              Add Paper
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'paper', label: '📄 Papers' },
          { id: 'pdf', label: '📕 PDFs' },
          { id: 'link', label: '🔗 Links' },
          { id: 'doc', label: '💼 Docs' },
          { id: 'note', label: '📝 Notes' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`
              px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
              ${filterType === f.id 
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs' 
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted-dark)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'}
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lit review cards */}
      <div className="space-y-4">
        {filteredPapers.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-12 text-center text-[var(--muted)]">
            <span className="text-4xl mb-3 block">🔬</span>
            <p className="text-sm font-semibold">No research references matching filters</p>
            <p className="text-xs text-[var(--muted-dark)] mt-1">Populate literature to begin structured analyses and citation logging</p>
          </div>
        ) : (
          filteredPapers.map((paper) => (
            <div 
              key={paper.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:shadow-xs transition-shadow duration-150"
            >
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getTypeBadgeColor(paper.type)}`}>
                    {paper.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeColor(paper.status)}`}>
                    {paper.status}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] font-mono">{paper.date}</span>
                </div>

                <div>
                  <h3 className="serif text-base font-semibold text-[var(--text)] leading-snug">{paper.title}</h3>
                  {paper.authors && (
                    <p className="text-xs text-[var(--muted-dark)] font-medium mt-0.5">By {paper.authors}</p>
                  )}
                </div>

                {/* Literature Review Notes Box */}
                <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-3">
                  <div className="flex justify-between items-center border-b border-[var(--border)] pb-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-dark)]">Literature Review & Annotation</span>
                    {editingNotesId === paper.id ? (
                      <button 
                        onClick={() => handleSaveNotes(paper.id)}
                        className="text-[10px] text-emerald-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEditNotes(paper)}
                        className="text-[10px] text-[var(--accent)] font-bold hover:underline flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {editingNotesId === paper.id ? (
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      className="w-full text-xs bg-[var(--surface)] border border-[var(--border-strong)] rounded p-2 text-[var(--text)] focus:outline-hidden min-h-[60px]"
                    />
                  ) : (
                    <p className="text-xs text-[var(--text)] italic leading-relaxed">
                      {paper.notes ? paper.notes : "No review annotations created yet. Click edit to add findings, methodology notes, or summary citations."}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Controls and Action buttons */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 border-t md:border-t-0 border-[var(--border)] pt-4 md:pt-0 shrink-0">
                <div className="flex items-center gap-2">
                  {paper.url && (
                    <a 
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)] flex items-center gap-1.5"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => onDeletePaper(paper.id)}
                    className="p-2 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Status Setter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[var(--muted-dark)] text-[10px] font-bold uppercase">Status</span>
                  <select
                    value={paper.status}
                    onChange={(e) => onUpdateStatus(paper.id, e.target.value as any)}
                    className="inp text-[11px] py-1 px-2.5 w-auto"
                  >
                    <option value="unread">📕 Unread</option>
                    <option value="reading">📖 Reading</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
