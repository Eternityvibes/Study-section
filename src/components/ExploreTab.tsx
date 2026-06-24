/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  Award, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  MapPin, 
  Clock, 
  HelpCircle,
  Cloud,
  CloudLightning,
  UploadCloud,
  DownloadCloud,
  Lock,
  RefreshCw,
  LogOut,
  Info
} from 'lucide-react';
import { AppState, Course, TimetableEntry } from '../types';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  extractFolderId, 
  saveBackupToDrive, 
  downloadBackupFromDrive 
} from '../lib/drive';
import { User } from 'firebase/auth';

interface ExploreTabProps {
  appState: AppState;
  onUpdateCourses?: (courses: Course[]) => void;
  onUpdateTimetable?: (timetable: TimetableEntry[]) => void;
  onRestoreState?: (state: AppState) => void;
  googleUser: User | null;
  googleToken: string | null;
  syncStatus: 'idle' | 'syncing' | 'connected' | 'error' | 'disconnected';
  syncError: string | null;
  autoUpload: boolean;
  folderUrl: string;
  onGoogleSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onBackup: () => Promise<void>;
  onRestore: () => Promise<void>;
  onToggleAutoUpload: (checked: boolean) => void;
  onUpdateFolderUrl: (url: string) => void;
}

const GRADE_POINTS: Record<string, number> = {
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D": 1.0,
  "F": 0.0,
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export default function ExploreTab({ 
  appState, 
  onUpdateCourses, 
  onUpdateTimetable, 
  onRestoreState,
  googleUser,
  googleToken,
  syncStatus,
  syncError,
  autoUpload,
  folderUrl,
  onGoogleSignIn,
  onSignOut,
  onBackup,
  onRestore,
  onToggleAutoUpload,
  onUpdateFolderUrl
}: ExploreTabProps) {
  const { xp, streak, sessions, todos, learned, water, transactions, profile, courses, timetable = [] } = appState;

  // Google Drive state (legacy, now driven by props from App)
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local state for adding class slots
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('custom');
  const [newDay, setNewDay] = useState<typeof DAYS_OF_WEEK[number]>('Monday');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newLocation, setNewLocation] = useState('');

  // Local state for target GPA
  const [targetGpa, setTargetGpa] = useState<number>(3.8);

  // GPA calculation
  let totalPoints = 0;
  let totalCredits = 0;
  let gradedCoursesCount = 0;

  courses.forEach(c => {
    if (c.grade && GRADE_POINTS[c.grade] !== undefined) {
      totalPoints += GRADE_POINTS[c.grade] * c.credits;
      totalCredits += c.credits;
      gradedCoursesCount++;
    }
  });

  const cumulativeGpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

  // Academic Garden Sprout growth stage selection
  let sproutEmoji = "🌱";
  let sproutTitle = "Tiny Sprout";
  let sproutDesc = "A quiet seedling drinking in warm spring rain, waiting to rise.";
  let sproutColor = "border-emerald-600/20 bg-emerald-600/5 text-emerald-800 dark:text-emerald-300";

  if (gradedCoursesCount === 0) {
    sproutEmoji = "🌰";
    sproutTitle = "Dormant Acorn";
    sproutDesc = "Plant your first course grades below to awaken your academic soil!";
    sproutColor = "border-amber-600/20 bg-amber-600/5 text-amber-800 dark:text-amber-200";
  } else if (cumulativeGpa >= 3.7) {
    sproutEmoji = "🌸";
    sproutTitle = "Blooming Sage Orchid";
    sproutDesc = "A glorious blooming forest orchid, radiating academic mastery and pristine focus!";
    sproutColor = "border-rose-600/20 bg-rose-600/5 text-rose-800 dark:text-rose-200";
  } else if (cumulativeGpa >= 3.2) {
    sproutEmoji = "🪴";
    sproutTitle = "Lush Forest Fern";
    sproutDesc = "A thriving, beautiful fern filling your scholarly cottage conservatory with fresh life.";
    sproutColor = "border-teal-600/20 bg-teal-600/5 text-teal-800 dark:text-teal-200";
  } else if (cumulativeGpa >= 2.5) {
    sproutEmoji = "🌿";
    sproutTitle = "Hearty Green Ivy";
    sproutDesc = "Strong, resilient ivy climbing the ancient brick walls of the university library.";
    sproutColor = "border-emerald-600/20 bg-emerald-600/5 text-emerald-800 dark:text-emerald-200";
  }

  // Handle grade change
  const handleGradeChange = (courseId: number, grade: string) => {
    if (!onUpdateCourses) return;
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return { ...c, grade: grade === "none" ? undefined : grade };
      }
      return c;
    });
    onUpdateCourses(updated);
  };

  // Handle adding class slot
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateTimetable) return;

    let finalName = newCourseName.trim();
    if (selectedCourseId !== 'custom') {
      const matched = courses.find(c => c.id.toString() === selectedCourseId);
      if (matched) finalName = matched.name;
    }

    if (!finalName) return;

    const newEntry: TimetableEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      courseName: finalName,
      day: newDay,
      time: newTime,
      location: newLocation.trim() || undefined
    };

    onUpdateTimetable([...timetable, newEntry]);
    
    // reset form
    setNewCourseName('');
    setNewLocation('');
    setShowAddForm(false);
  };

  // Handle deleting class slot
  const handleDeleteClass = (id: number) => {
    if (!onUpdateTimetable) return;
    onUpdateTimetable(timetable.filter(t => t.id !== id));
  };

  // Cozy personal milestones checklist
  const rewards = [
    { e: "🍂", label: "Steady Scholar", desc: "Keep a 3+ study streak active", done: streak >= 3, color: "text-amber-600" },
    { e: "🎻", label: "Vintage Hours", desc: "Complete 5 focus sessions", done: sessions.length >= 5, color: "text-rose-600" },
    { e: "📜", label: "Curiosity Spark", desc: "Log 3 or more concepts in the Vault", done: learned.length >= 3, color: "text-purple-600" },
    { e: "🍄", label: "Folk Forest Sage", desc: "Unlock a course Grade of A or A-", done: courses.some(c => c.grade === 'A' || c.grade === 'A-'), color: "text-emerald-600" },
    { e: "💧", label: "Aqua Sage", desc: "Drink at least 4 water cups", done: water >= 4, color: "text-sky-600" },
    { e: "☕", label: "Budget Scribe", desc: "Log a book or tuition ledger item", done: transactions.length > 0, color: "text-amber-800" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="serif text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            🏡 Academic Cabin & Timetable
          </h2>
          <p className="text-xs text-[var(--muted)]">Your cozy personal university life sanctuary. Calculate GPA, garden your scholastic grades, and map your weekly lecture schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-[var(--surface-hover)] px-3 py-1.5 border border-[var(--border)] rounded-full text-[var(--text)] font-medium flex items-center gap-1.5">
            🎓 {profile.uni || "University"} • {profile.degree || "Undergrad"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: GPA & Sprout Garden */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Garden Sprout & GPA Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
              <span>Academic Garden & Sprout</span>
            </h3>

            {/* Growth Display Box */}
            <div className={`border rounded-xl p-4 flex items-start gap-4 transition-all duration-300 ${sproutColor}`}>
              <span className="text-5xl shrink-0 select-none">{sproutEmoji}</span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm tracking-tight">{sproutTitle}</h4>
                <p className="text-xs leading-relaxed opacity-90">{sproutDesc}</p>
              </div>
            </div>

            {/* GPA Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-3 text-center">
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">Cumulative GPA</span>
                <p className="serif text-2xl font-bold text-[var(--accent)] mt-1">
                  {gradedCoursesCount > 0 ? cumulativeGpa.toFixed(2) : "N/A"}
                </p>
                <span className="text-[10px] text-[var(--muted-dark)]">{gradedCoursesCount} of {courses.length} courses graded</span>
              </div>

              <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-3 text-center">
                <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">Target Goal GPA</span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <input 
                    type="number" 
                    step="0.05" 
                    min="1.0" 
                    max="4.0" 
                    value={targetGpa} 
                    onChange={(e) => setTargetGpa(parseFloat(e.target.value) || 4.0)}
                    className="w-12 bg-transparent text-center font-bold text-sm border-b border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent)] text-[var(--text)]"
                  />
                  <span className="text-xs text-[var(--muted)]">/ 4.00</span>
                </div>
                <span className="text-[10px] text-[var(--muted-dark)]">
                  {gradedCoursesCount > 0 && cumulativeGpa >= targetGpa ? "🎯 Target Achieved!" : "Keep blooming!"}
                </span>
              </div>
            </div>
          </div>

          {/* GPA Course Gradebook List */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-[var(--accent)]" />
                <span>Scholar Gradebook</span>
              </h3>
              <span className="text-[10px] bg-[var(--accent-dim)] text-[var(--accent)] font-bold px-2 py-0.5 rounded-full">
                Semester courses
              </span>
            </div>

            {courses.length === 0 ? (
              <p className="text-xs text-[var(--muted)] py-4 text-center">No active courses. Add courses in the study tab!</p>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="p-3 border border-[var(--border)] rounded-xl bg-[var(--surface-hover)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xl shrink-0">{course.emoji}</span>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-[var(--text)] truncate">{course.name}</h4>
                        <p className="text-[10px] text-[var(--muted)]">{course.credits} Credits • {course.prof || "No prof listed"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[var(--muted-dark)] hidden sm:inline">Letter Grade:</span>
                      <select
                        value={course.grade || 'none'}
                        onChange={(e) => handleGradeChange(course.id, e.target.value)}
                        className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg px-2 py-1 text-xs text-[var(--text)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                      >
                        <option value="none">In Progress</option>
                        <option value="A">A (4.00)</option>
                        <option value="A-">A- (3.70)</option>
                        <option value="B+">B+ (3.30)</option>
                        <option value="B">B (3.00)</option>
                        <option value="B-">B- (2.70)</option>
                        <option value="C+">C+ (2.30)</option>
                        <option value="C">C (2.00)</option>
                        <option value="C-">C- (1.70)</option>
                        <option value="D">D (1.00)</option>
                        <option value="F">F (0.00)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Google Drive Cloud Sync Cabin */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
                <Cloud className="w-4.5 h-4.5 text-[var(--accent)]" />
                <span>Google Drive Sync Cabin</span>
              </h3>
              <span className="text-[9px] font-bold text-[var(--accent)] uppercase bg-[var(--accent-dim)] px-2.5 py-0.5 rounded-full">
                Workspace cloud
              </span>
            </div>

            {!googleUser ? (
              <div className="space-y-3.5">
                <p className="text-xs text-[var(--muted-dark)] leading-relaxed">
                  Safeguard your entire university journey! Automatically sync and back up your complete tracker state (courses, timetables, milestones, water metrics, budget ledgers, and logs) directly to your personal Google Drive.
                </p>

                <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-3 flex gap-2">
                  <Info className="w-4.5 h-4.5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[var(--muted)] leading-normal">
                    This integration uses secure Google Auth. Your data is saved as a single JSON file named <strong>university_life_tracker_backup.json</strong> inside your chosen folder.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={syncStatus === 'syncing'}
                  className="w-full flex items-center justify-center gap-3 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border-strong)] transition-all font-semibold rounded-xl py-2 px-4 shadow-xs cursor-pointer select-none disabled:opacity-50"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                  <span className="text-xs">{syncStatus === 'syncing' ? 'Syncing...' : 'Connect Google Drive Cabin'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-2.5">
                  <div className="flex items-center gap-2 truncate">
                    {googleUser.photoURL ? (
                      <img src={googleUser.photoURL} alt="Google User" referrerPolicy="no-referrer" className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10px] flex items-center justify-center font-bold">
                        {googleUser.displayName?.[0] || googleUser.email?.[0] || 'G'}
                      </div>
                    )}
                    <div className="truncate leading-none">
                      <span className="text-[11px] font-bold text-[var(--text)] block truncate">{googleUser.displayName || "Google Scholar"}</span>
                      <span className="text-[9px] text-[var(--muted)] truncate block">{googleUser.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={onSignOut}
                    className="text-[10px] text-red-500 hover:underline flex items-center gap-1 font-semibold pl-2 shrink-0 cursor-pointer"
                    title="Disconnect Google Account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[var(--muted-dark)] uppercase tracking-wider flex items-center gap-1">
                    <span>📂 PASTE GOOGLE DRIVE FOLDER LINK</span>
                    <HelpCircle className="w-3 h-3 text-[var(--muted)] cursor-help" title="Copy a folder link from your browser's address bar. Leave empty to back up to the root folder." />
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://drive.google.com/drive/folders/... (Optional)"
                    value={folderUrl}
                    onChange={(e) => onUpdateFolderUrl(e.target.value)}
                    className="w-full text-xs bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl px-3 py-2 text-[var(--text)] placeholder-[var(--muted-dark)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  <p className="text-[9px] text-[var(--muted)] leading-tight">
                    Leave empty to save in Drive root, or paste a specific Google Drive folder link to save inside that directory.
                  </p>
                </div>

                {/* Auto-sync Toggle */}
                <label className="flex items-start gap-2.5 bg-[var(--surface-hover)] p-2.5 border border-[var(--border)] rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoUpload}
                    onChange={(e) => onToggleAutoUpload(e.target.checked)}
                    className="mt-0.5 rounded accent-[var(--accent)] cursor-pointer"
                  />
                  <div className="leading-tight">
                    <span className="text-xs font-semibold text-[var(--text)] block">Enable Real-time Auto-Upload</span>
                    <span className="text-[9px] text-[var(--muted)]">Syncs your actions, study hours, habits, and budgets automatically.</span>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={onBackup}
                    disabled={syncStatus === 'syncing'}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer select-none"
                  >
                    {syncStatus === 'syncing' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5" />
                    )}
                    <span>{syncStatus === 'syncing' ? "Syncing..." : "Force Backup"}</span>
                  </button>

                  <button
                    onClick={onRestore}
                    disabled={syncStatus === 'syncing'}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border-strong)] disabled:opacity-50 text-[var(--text)] rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer select-none"
                  >
                    {syncStatus === 'syncing' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <DownloadCloud className="w-3.5 h-3.5" />
                    )}
                    <span>{syncStatus === 'syncing' ? "Syncing..." : "Force Restore"}</span>
                  </button>
                </div>
              </div>
            )}

            {syncStatus === 'connected' && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] leading-relaxed">
                🎉 Connected to Google Drive! Your university tracker state is safe.
              </div>
            )}

            {syncStatus === 'error' && syncError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[10px] leading-relaxed">
                ⚠️ <strong>Backup Cabin Error:</strong> {syncError}
              </div>
            )}
          </div>


        </div>

        {/* Right Side: Timetable & Achievements */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Weekly Timetable Grid */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-[var(--accent)]" />
                <span>Weekly Lecture Timetable</span>
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs bg-[var(--accent-dim)] hover:bg-[var(--accent)] hover:text-white text-[var(--accent)] border border-[var(--accent-border)] font-semibold rounded-lg px-2.5 py-1 flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class</span>
              </button>
            </div>

            {/* Quick Add Class Slot Form */}
            {showAddForm && (
              <form onSubmit={handleAddClass} className="p-4 border border-[var(--accent-border)] rounded-xl bg-[var(--accent-dim)] space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">Select Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="custom">-- Custom Name --</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id.toString()}>{c.emoji} {c.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedCourseId === 'custom' && (
                    <div className="space-y-1 col-span-1">
                      <label className="block text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">Custom Course Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Physics Lab"
                        required
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        className="w-full bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg px-2 py-1.5 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">Day</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value as any)}
                      className="w-full bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      {DAYS_OF_WEEK.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg px-2 py-1.5 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Hall C"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg px-2 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--muted-dark)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 font-semibold"
                  >
                    Plant Class
                  </button>
                </div>
              </form>
            )}

            {/* List classes by Day */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {DAYS_OF_WEEK.map(day => {
                const daySlots = timetable.filter(t => t.day === day);
                if (daySlots.length === 0) return null;

                return (
                  <div key={day} className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-0.5">{day}</h4>
                    <div className="space-y-1.5">
                      {daySlots.map(slot => (
                        <div key={slot.id} className="p-2 border border-[var(--border)] bg-[var(--surface-hover)] rounded-xl flex items-center justify-between gap-3 text-xs group">
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-[var(--text)]">{slot.courseName}</span>
                              <div className="flex items-center gap-3 text-[10px] text-[var(--muted-dark)] mt-0.5">
                                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {slot.time}</span>
                                {slot.location && (
                                  <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {slot.location}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteClass(slot.id)}
                            className="text-[var(--muted)] hover:text-red-600 transition-all opacity-40 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Remove from Timetable"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {timetable.length === 0 && (
                <div className="text-center py-8 border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface-hover)]">
                  <span className="text-3xl">📅</span>
                  <h4 className="font-semibold text-xs text-[var(--text)] mt-2">No Scheduled Classes</h4>
                  <p className="text-[10px] text-[var(--muted)] px-4 mt-1">Your weekly timetable is empty. Click "+ Add Class" to seed your lecture schedule!</p>
                </div>
              )}
            </div>
          </div>

          {/* Cozy Scholar Milestones (Personal Achievements) */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h3 className="serif text-base font-semibold text-[var(--text)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-[var(--accent)]" />
              <span>🏆 Trophy Achievements Room</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {rewards.map((badge) => {
                return (
                  <div 
                    key={badge.label}
                    className={`
                      border rounded-xl p-3 text-center space-y-1 transition-all duration-150 flex flex-col justify-center items-center
                      ${badge.done 
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' 
                        : 'border-[var(--border)] bg-[var(--surface-hover)] opacity-40'}
                    `}
                  >
                    <span className="text-3xl block select-none">{badge.e}</span>
                    <h4 className="text-xs font-bold text-[var(--text)] tracking-tight truncate w-full">{badge.label}</h4>
                    <p className="text-[9px] text-[var(--muted-dark)] leading-normal mt-0.5 truncate w-full">{badge.desc}</p>
                    {badge.done && (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-1">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        <span>UNLOCKED</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
