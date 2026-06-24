/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  File, 
  Link as LinkIcon, 
  FileText, 
  UploadCloud,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Course, CourseResource } from '../types';

interface VaultTabProps {
  courses: Course[];
  onAddCourse: (name: string, prof: string, emoji: string, credits: number) => void;
  onDeleteCourse: (id: number) => void;
  onAddResource: (courseId: number, resource: Omit<CourseResource, 'id' | 'date'>) => void;
  onDeleteResource: (courseId: number, resourceId: number) => void;
}

export default function VaultTab({
  courses,
  onAddCourse,
  onDeleteCourse,
  onAddResource,
  onDeleteResource
}: VaultTabProps) {
  // Course creation states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCName, setNewCName] = useState("");
  const [newCProf, setNewCProf] = useState("");
  const [newCEmoji, setNewCEmoji] = useState("📚");
  const [newCCredits, setNewCCredits] = useState(3);

  // Resource creation states
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [showAddResource, setShowAddResource] = useState<number | null>(null);
  const [resTitle, setResTitle] = useState("");
  const [resType, setResType] = useState<'link' | 'pdf' | 'ppt' | 'note' | 'video'>('pdf');
  const [resUrl, setResUrl] = useState("");
  const [resDesc, setResDesc] = useState("");

  // Upload Simulator Drag and Drop state
  const [dragActive, setDragActive] = useState<Record<number, boolean>>({});
  const [uploadSuccess, setUploadSuccess] = useState<Record<number, string | null>>({});

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCName.trim()) return;
    onAddCourse(newCName, newCProf, newCEmoji, newCCredits);
    setNewCName("");
    setNewCProf("");
    setNewCEmoji("📚");
    setNewCCredits(3);
    setShowAddCourse(false);
  };

  const handleAddResSubmit = (courseId: number) => {
    if (!resTitle.trim()) return;
    onAddResource(courseId, {
      title: resTitle,
      type: resType,
      url: resUrl || "https://drive.google.com",
      desc: resDesc
    });
    // Reset
    setResTitle("");
    setResType("pdf");
    setResUrl("");
    setResDesc("");
    setShowAddResource(null);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent, courseId: number, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [courseId]: active }));
  };

  const handleDrop = (e: React.DragEvent, courseId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [courseId]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateFileUpload(file, courseId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, courseId: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      simulateFileUpload(file, courseId);
    }
  };

  const simulateFileUpload = (file: File, courseId: number) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    let type: 'pdf' | 'ppt' | 'note' | 'link' = 'pdf';
    
    if (extension === 'ppt' || extension === 'pptx') type = 'ppt';
    else if (extension === 'txt' || extension === 'doc' || extension === 'docx') type = 'note';

    setUploadSuccess(prev => ({ ...prev, [courseId]: `Uploading ${file.name}...` }));

    setTimeout(() => {
      onAddResource(courseId, {
        title: file.name,
        type: type,
        url: "#",
        desc: `Uploaded file - ${(file.size / (1024 * 1024)).toFixed(2)} MB`
      });
      setUploadSuccess(prev => ({ ...prev, [courseId]: `Success: ${file.name} uploaded!` }));
      setTimeout(() => {
        setUploadSuccess(prev => ({ ...prev, [courseId]: null }));
      }, 3000);
    }, 1500);
  };

  const getResIcon = (type: string) => {
    switch(type) {
      case 'link': return <LinkIcon className="w-4 h-4 text-sky-500" />;
      case 'pdf': return <FileText className="w-4 h-4 text-rose-500" />;
      case 'ppt': return <File className="w-4 h-4 text-amber-500" />;
      case 'note': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'video': return <File className="w-4 h-4 text-red-500" />;
      default: return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-2xl font-bold text-[var(--text)]">Reading Vault</h2>
          <p className="text-xs text-[var(--muted)]">Manage your university courses, standard slide decks, notes, and textbook links</p>
        </div>
        <button
          onClick={() => setShowAddCourse(!showAddCourse)}
          className="btn btn-primary self-start sm:self-center flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Add Course Form Modal */}
      {showAddCourse && (
        <form onSubmit={handleAddCourseSubmit} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-lg max-w-lg">
          <h3 className="serif text-base font-semibold mb-4 text-[var(--text)]">Establish New Course</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">Course Name</label>
              <input
                type="text"
                placeholder="e.g. Distributed Databases"
                value={newCName}
                onChange={(e) => setNewCName(e.target.value)}
                className="inp text-xs"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Professor / Lecturer</label>
              <input
                type="text"
                placeholder="e.g. Dr. Jane Doe"
                value={newCProf}
                onChange={(e) => setNewCProf(e.target.value)}
                className="inp text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="form-group">
              <label className="form-label">Icon Emoji</label>
              <select
                value={newCEmoji}
                onChange={(e) => setNewCEmoji(e.target.value)}
                className="inp text-xs"
              >
                <option>📚</option><option>💻</option><option>🧪</option><option>📐</option>
                <option>🌍</option><option>🎨</option><option>🧮</option><option>🔬</option>
                <option>📊</option><option>🏛️</option><option>🧠</option><option>💡</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Course Credits</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newCCredits}
                onChange={(e) => setNewCCredits(Number(e.target.value))}
                className="inp text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddCourse(false)}
              className="btn btn-ghost text-xs border-[var(--border-strong)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs"
            >
              Add Course
            </button>
          </div>
        </form>
      )}

      {/* Courses Accordion List */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-12 text-center text-[var(--muted)]">
            <span className="text-4xl mb-3 block">📖</span>
            <p className="text-sm font-semibold">No academic courses registered yet</p>
            <p className="text-xs text-[var(--muted-dark)] max-w-sm mx-auto mt-1">Add your semester subjects to start organizing lectures, slide uploads, and textbook links</p>
          </div>
        ) : (
          courses.map((course) => {
            const isExpanded = activeCourseId === course.id;
            const resLength = course.resources ? course.resources.length : 0;
            return (
              <div 
                key={course.id} 
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-200"
              >
                {/* Header Row */}
                <div 
                  onClick={() => setActiveCourseId(isExpanded ? null : course.id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-[var(--surface-hover)]"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
                      style={{ backgroundColor: `${course.color}15` }}
                    >
                      {course.emoji}
                    </div>
                    <div>
                      <h3 className="serif text-base font-semibold text-[var(--text)]">{course.name}</h3>
                      <p className="text-xs text-[var(--muted)]">
                        {course.prof ? `${course.prof} · ` : ''}{course.credits} Credits · {resLength} Resources
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShowAddResource(course.id)}
                      className="btn btn-ghost py-1 px-2.5 text-[11px] font-semibold border-[var(--border-strong)] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Resource</span>
                    </button>
                    <button
                      onClick={() => onDeleteCourse(course.id)}
                      className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-[var(--muted-dark)] ml-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Sub-Resource Panel (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] bg-[var(--surface-hover)] p-5 space-y-5 animate-fadeUp">
                    
                    {/* Inline Add Resource form */}
                    {showAddResource === course.id && (
                      <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                          <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">Add Resource / Document Reference</h4>
                          <button 
                            onClick={() => setShowAddResource(null)}
                            className="text-xs text-[var(--muted-dark)] hover:text-[var(--text)]"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-6">
                            <label className="form-label">Resource Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Chapter 3: Vector Spaces Slides"
                              value={resTitle}
                              onChange={(e) => setResTitle(e.target.value)}
                              className="inp text-xs"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="form-label">Type</label>
                            <select
                              value={resType}
                              onChange={(e) => setResType(e.target.value as any)}
                              className="inp text-xs"
                            >
                              <option value="pdf">📕 PDF Slide Deck</option>
                              <option value="ppt">📊 PowerPoint Presentation</option>
                              <option value="link">🔗 Hyperlink / Web Resource</option>
                              <option value="note">📝 Text Notes</option>
                              <option value="video">▶️ Lecture Recording</option>
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <label className="form-label">Reference Link (URL)</label>
                            <input
                              type="text"
                              placeholder="e.g. https://google.drive/..."
                              value={resUrl}
                              onChange={(e) => setResUrl(e.target.value)}
                              className="inp text-xs"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Brief Description (Optional)</label>
                          <input
                            type="text"
                            placeholder="Add core notes about this file..."
                            value={resDesc}
                            onChange={(e) => setResDesc(e.target.value)}
                            className="inp text-xs"
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddResource(null)}
                            className="btn btn-ghost py-1 px-3 text-xs border-[var(--border-strong)]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddResSubmit(course.id)}
                            className="btn btn-primary py-1 px-3 text-xs"
                          >
                            Add Reference
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Drag and Drop Simulator Box */}
                    <div 
                      onDragEnter={(e) => handleDrag(e, course.id, true)}
                      onDragOver={(e) => handleDrag(e, course.id, true)}
                      onDragLeave={(e) => handleDrag(e, course.id, false)}
                      onDrop={(e) => handleDrop(e, course.id)}
                      className={`
                        border-2 border-dashed rounded-xl p-6 text-center transition-all duration-150 relative
                        ${dragActive[course.id] 
                          ? 'border-[var(--accent)] bg-[var(--accent-dim)]' 
                          : 'border-[var(--border-strong)] hover:border-[var(--muted)]'}
                      `}
                    >
                      <input 
                        type="file" 
                        id={`file-upload-${course.id}`}
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, course.id)}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      />
                      
                      {uploadSuccess[course.id] ? (
                        <div className="flex flex-col items-center justify-center space-y-2 text-xs">
                          {uploadSuccess[course.id]?.startsWith("Success") ? (
                            <CheckCircle className="w-6 h-6 text-emerald-500 animate-bounce" />
                          ) : (
                            <UploadCloud className="w-6 h-6 text-[var(--accent)] animate-pulse" />
                          )}
                          <span className="font-semibold text-[var(--text)]">{uploadSuccess[course.id]}</span>
                        </div>
                      ) : (
                        <label 
                          htmlFor={`file-upload-${course.id}`}
                          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                        >
                          <UploadCloud className="w-8 h-8 text-[var(--muted-dark)]" />
                          <div className="text-xs font-semibold text-[var(--text)]">
                            Drag & drop course files here, or <span className="text-[var(--accent)] underline font-bold">browse</span>
                          </div>
                          <div className="text-[10px] text-[var(--muted)]">Supports PDF, DOC, PPT slides, notes (max 20MB)</div>
                        </label>
                      )}
                    </div>

                    {/* Resources List */}
                    <div className="space-y-2">
                      {!course.resources || course.resources.length === 0 ? (
                        <div className="text-center py-6 text-[var(--muted)] text-xs">
                          No referenced study documents yet. Upload a slide deck above or add standard web links.
                        </div>
                      ) : (
                        course.resources.map((res) => (
                          <div 
                            key={res.id}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 flex items-center justify-between gap-3 hover:shadow-xs transition-shadow duration-150"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[var(--surface-active)] rounded-lg">
                                {getResIcon(res.type)}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[var(--text)]">{res.title}</h4>
                                {res.desc && <p className="text-[11px] text-[var(--muted-dark)]">{res.desc}</p>}
                                <p className="text-[9px] text-[var(--muted)] uppercase font-mono tracking-wider mt-0.5">{res.type} · Registered {res.date}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {res.url && res.url !== "#" && (
                                <a 
                                  href={res.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-ghost py-1 px-2.5 text-[11px] border-[var(--border-strong)] flex items-center gap-1"
                                >
                                  <span>Open</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <button
                                onClick={() => onDeleteResource(course.id, res.id)}
                                className="p-1 text-rose-500 hover:text-rose-600 rounded-md hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
