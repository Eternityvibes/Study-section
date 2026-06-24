/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Layers, 
  CheckSquare, 
  Timer as TimerIcon, 
  Sparkles, 
  ChevronRight, 
  Award, 
  Droplet, 
  CircleDollarSign, 
  User, 
  BookOpen, 
  Volume2, 
  Upload, 
  FolderSync,
  Heart,
  Calendar as CalendarIcon
} from 'lucide-react';

import { AppState, INITIAL_STATE, Course, CourseResource, ResearchPaper, TodoTask, Achievement, Internship, CVFile, CareerGoal, CalendarEvent, Habit, Project, FinanceTransaction } from './types';
import { QUOTES } from './data/quotes';

// Component Imports
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import Timer from './components/Timer';
import VaultTab from './components/VaultTab';
import ResearchTab from './components/ResearchTab';
import TodoTab from './components/TodoTab';
import CareerTab from './components/CareerTab';
import ProjectsTab from './components/ProjectsTab';
import HealthTab from './components/HealthTab';
import FinanceTab from './components/FinanceTab';
import CalendarTab from './components/CalendarTab';
import ExploreTab from './components/ExploreTab';
import { initAuth, googleSignIn, logout, saveBackupToDrive, downloadBackupFromDrive, extractFolderId } from './lib/drive';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  // State Initialization
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('eternity_v4_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new subcomponents are supported
        return { ...INITIAL_STATE, ...parsed };
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  // Google Drive Cloud Sync state
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [autoUpload, setAutoUpload] = useState<boolean>(() => {
    return localStorage.getItem('eternity_gdrive_auto_sync') !== 'false';
  });
  const [folderUrl, setFolderUrl] = useState<string>(() => {
    return localStorage.getItem('eternity_gdrive_folder_url') || '';
  });

  // Track the last state JSON string we have pushed or pulled to avoid infinite loops
  const lastSyncedStateRef = useRef<string>('');

  // Initialize Google Drive Auth & Initial Pull
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        
        // Let's do an initial load from Google Drive!
        setSyncStatus('syncing');
        try {
          const folderId = extractFolderId(localStorage.getItem('eternity_gdrive_folder_url') || '');
          const remoteState = await downloadBackupFromDrive(token, folderId).catch((err) => {
            if (err.message?.includes('not found') || err.message?.includes('No backup file')) {
              return null;
            }
            throw err;
          });

          if (remoteState) {
            const remoteStr = JSON.stringify(remoteState);
            lastSyncedStateRef.current = remoteStr;
            setState(remoteState);
            setSyncStatus('connected');
            setSyncError(null);
            triggerToast("🎒 Loaded latest data from Google Drive!");
          } else {
            // Initialize backup on Drive with the current local state
            await saveBackupToDrive(token, folderId, state);
            lastSyncedStateRef.current = JSON.stringify(state);
            setSyncStatus('connected');
            setSyncError(null);
            triggerToast("☁️ Created initial Google Drive backup!");
          }
        } catch (err: any) {
          console.error('Failed to initialize Google Drive sync:', err);
          setSyncStatus('error');
          setSyncError(err.message || 'Failed to sync with Google Drive.');
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setSyncStatus('disconnected');
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Debounced Auto-upload to Google Drive on local state change
  useEffect(() => {
    if (!googleToken) return;
    if (!autoUpload) return;

    const stateStr = JSON.stringify(state);
    // Skip uploading if this state is identical to what we just synced
    if (stateStr === lastSyncedStateRef.current) return;

    setSyncStatus('syncing');

    const timer = setTimeout(async () => {
      try {
        const folderId = extractFolderId(folderUrl);
        await saveBackupToDrive(googleToken, folderId, state);
        lastSyncedStateRef.current = stateStr;
        setSyncStatus('connected');
        setSyncError(null);
      } catch (err: any) {
        console.error('Auto-sync to Google Drive failed:', err);
        setSyncStatus('error');
        setSyncError(err.message || 'Auto-upload failed');
      }
    }, 3000); // 3 seconds debounce to prevent high rate usage and avoid rate limiting

    return () => clearTimeout(timer);
  }, [state, googleToken, autoUpload, folderUrl]);

  const handleGoogleSignIn = async () => {
    setSyncError(null);
    setSyncStatus('syncing');
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setSyncStatus('connected');
        
        // Pull latest state on connection
        const folderId = extractFolderId(folderUrl);
        const remoteState = await downloadBackupFromDrive(res.accessToken, folderId).catch((err) => {
          if (err.message?.includes('not found') || err.message?.includes('No backup file')) {
            return null;
          }
          throw err;
        });

        if (remoteState) {
          const remoteStr = JSON.stringify(remoteState);
          lastSyncedStateRef.current = remoteStr;
          setState(remoteState);
          triggerToast("🎒 Connected & Loaded latest data from Drive!");
        } else {
          // Initialize backup on Drive
          await saveBackupToDrive(res.accessToken, folderId, state);
          lastSyncedStateRef.current = JSON.stringify(state);
          triggerToast("☁️ Connected & Initialized backup on Drive!");
        }
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncError(err.message || 'Authentication with Google failed.');
      triggerToast("❌ Google Drive connection failed");
    }
  };

  const handleSignOut = async () => {
    setSyncError(null);
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
      setSyncStatus('disconnected');
      triggerToast("🚪 Disconnected from Google Drive");
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || 'Logout failed.');
    }
  };

  const handleForcePush = async () => {
    if (!googleToken) return;
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const folderId = extractFolderId(folderUrl);
      await saveBackupToDrive(googleToken, folderId, state);
      lastSyncedStateRef.current = JSON.stringify(state);
      setSyncStatus('connected');
      triggerToast("⬆️ Data successfully pushed to Google Drive!");
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncError(err.message || 'Failed to push data to Google Drive.');
      triggerToast("❌ Failed to push data");
    }
  };

  const handleForcePull = async () => {
    if (!googleToken) return;
    const confirmPull = window.confirm(
      "Are you sure you want to pull data from Google Drive? This will completely overwrite your current local sessions and planner."
    );
    if (!confirmPull) return;

    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const folderId = extractFolderId(folderUrl);
      const remoteState = await downloadBackupFromDrive(googleToken, folderId);
      if (remoteState) {
        setState(remoteState);
        lastSyncedStateRef.current = JSON.stringify(remoteState);
        setSyncStatus('connected');
        triggerToast("⬇️ Data successfully pulled from Google Drive!");
      } else {
        throw new Error("No data found inside backup file.");
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncError(err.message || 'Failed to pull data from Google Drive.');
      triggerToast("❌ Failed to pull data");
    }
  };

  const handleToggleAutoUpload = (checked: boolean) => {
    setAutoUpload(checked);
    localStorage.setItem('eternity_gdrive_auto_sync', checked ? 'true' : 'false');
  };

  const handleUpdateFolderUrl = (url: string) => {
    setFolderUrl(url);
    localStorage.setItem('eternity_gdrive_folder_url', url);
  };


  const [quoteIndex, setQuoteIndex] = useState(() => {
    const today = new Date();
    // A daily index based on day, month and year so it genuinely changes daily
    const dayHash = today.getDate() + (today.getMonth() * 31) + (today.getFullYear() % 100) * 365;
    return dayHash % QUOTES.length;
  });

  const cycleQuote = () => {
    setQuoteIndex(prev => (prev + 1) % QUOTES.length);
  };

  const [currentTab, setCurrentTab] = useState("dashboard");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('eternity_v4_state', JSON.stringify(state));
  }, [state]);

  // Sync dark class on body/html
  useEffect(() => {
    if (state.dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.dark]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleTheme = () => {
    setState(prev => ({ ...prev, dark: !prev.dark }));
  };

  // ─── Pomodoro Timer Logging Callback ───
  const handleSessionComplete = (courseId: number | null, courseName: string, duration: number) => {
    const today = new Date().toDateString();
    
    // Check if daily streak should be updated
    let newStreak = state.streak;
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    
    if (state.lastDay !== today) {
      newStreak = (state.lastDay === yest.toDateString()) ? state.streak + 1 : 1;
    }

    // Accumulate Course Hours Studied if linked to a course
    const updatedCourses = state.courses.map((course) => {
      if (courseId !== null && course.id === courseId) {
        return { ...course, hours: course.hours + duration / 60 };
      }
      return course;
    });

    const newSession = {
      id: Date.now(),
      subj: courseName,
      emoji: courseId !== null ? (state.courses.find(c => c.id === courseId)?.emoji || "📚") : "📚",
      color: courseId !== null ? (state.courses.find(c => c.id === courseId)?.color || "#8b1a6b") : "#8b1a6b",
      dur: duration,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: today
    };

    setState(prev => ({
      ...prev,
      xp: prev.xp + 25, // completed Pomodoro yields 25 XP
      streak: newStreak,
      lastDay: today,
      courses: updatedCourses,
      sessions: [newSession, ...prev.sessions]
    }));

    triggerToast(`Focus complete! +25 XP awarded · Studied ${courseName}`);
  };

  // ─── Reading Vault (Courses) Callbacks ───
  const handleAddCourse = (name: string, prof: string, emoji: string, credits: number) => {
    const colors = ["#8b1a6b", "#6b4f9e", "#2a8a7a", "#b8791a", "#2d7a4a", "#c4426e", "#4a7ab8"];
    const nextColor = colors[state.courses.length % colors.length];
    
    const newCourse: Course = {
      id: Date.now(),
      name,
      prof: prof || undefined,
      emoji,
      credits,
      goal: 20,
      hours: 0,
      color: nextColor,
      resources: [],
      expanded: false
    };

    setState(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse]
    }));
    triggerToast(`Subject established: ${name}`);
  };

  const handleDeleteCourse = (id: number) => {
    if (!confirm("Are you sure you want to delete this course and all its resources?")) return;
    setState(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== id)
    }));
    triggerToast("Course deleted");
  };

  const handleAddCourseResource = (courseId: number, resource: Omit<CourseResource, 'id' | 'date'>) => {
    const newRes: CourseResource = {
      id: Date.now(),
      ...resource,
      date: new Date().toLocaleDateString()
    };

    const updated = state.courses.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          resources: [newRes, ...(course.resources || [])]
        };
      }
      return course;
    });

    setState(prev => ({ ...prev, courses: updated }));
    triggerToast(`Resource linked to course: ${resource.title}`);
  };

  const handleDeleteCourseResource = (courseId: number, resourceId: number) => {
    const updated = state.courses.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          resources: course.resources.filter(r => r.id !== resourceId)
        };
      }
      return course;
    });

    setState(prev => ({ ...prev, courses: updated }));
    triggerToast("Resource removed from course");
  };

  // ─── Research Hub Callbacks ───
  const handleAddPaper = (paper: Omit<ResearchPaper, 'id' | 'date'>) => {
    const newPaper: ResearchPaper = {
      id: Date.now(),
      ...paper,
      date: new Date().toLocaleDateString()
    };

    setState(prev => ({
      ...prev,
      papers: [newPaper, ...prev.papers]
    }));
    triggerToast(`Paper added to library: ${paper.title}`);
  };

  const handleDeletePaper = (id: number) => {
    setState(prev => ({
      ...prev,
      papers: prev.papers.filter(p => p.id !== id)
    }));
    triggerToast("Paper removed from library");
  };

  const handleUpdatePaperStatus = (id: number, status: ResearchPaper['status']) => {
    const updated = state.papers.map((p) => {
      if (p.id === id) {
        return { ...p, status };
      }
      return p;
    });

    setState(prev => ({ ...prev, papers: updated }));
    triggerToast(`Status updated to: ${status}`);
  };

  const handleUpdatePaperNotes = (id: number, notes: string) => {
    const updated = state.papers.map((p) => {
      if (p.id === id) {
        return { ...p, notes };
      }
      return p;
    });

    setState(prev => ({ ...prev, papers: updated }));
    triggerToast("Annotations updated");
  };

  // ─── To-Do Callbacks ───
  const handleAddTodo = (todo: Omit<TodoTask, 'id' | 'done'>) => {
    const newTodo: TodoTask = {
      id: Date.now(),
      ...todo,
      done: false
    };

    setState(prev => ({
      ...prev,
      todos: [newTodo, ...prev.todos]
    }));
    triggerToast(`Task created: ${todo.name}`);
  };

  const handleToggleTodo = (id: number) => {
    const target = state.todos.find(t => t.id === id);
    const becameDone = target ? !target.done : false;

    const updated = state.todos.map((t) => {
      if (t.id === id) {
        return { ...t, done: becameDone };
      }
      return t;
    });

    setState(prev => ({
      ...prev,
      xp: becameDone ? prev.xp + 15 : prev.xp, // yields +15 XP
      todos: updated
    }));

    if (becameDone) {
      triggerToast("Task complete! +15 XP awarded");
    }
  };

  const handleDeleteTodo = (id: number) => {
    setState(prev => ({
      ...prev,
      todos: prev.todos.filter(t => t.id !== id)
    }));
    triggerToast("Task removed");
  };

  // ─── Projects Callbacks ───
  const handleAddProject = (proj: Omit<Project, 'id' | 'milestones' | 'ptasks' | 'expanded'>) => {
    const newProj: Project = {
      id: Date.now(),
      ...proj,
      milestones: [],
      ptasks: [],
      expanded: true
    };

    setState(prev => ({
      ...prev,
      projects: [newProj, ...prev.projects]
    }));
    triggerToast(`Project initialized: ${proj.name}`);
  };

  const handleDeleteProject = (id: number) => {
    if (!confirm("Are you sure you want to delete this project workspace?")) return;
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
    triggerToast("Project deleted");
  };

  const handleAddProjectMilestone = (projectId: number, title: string, due?: string) => {
    const updated = state.projects.map((proj) => {
      if (proj.id === projectId) {
        const newMs = { id: Date.now(), title, due, done: false };
        return { ...proj, milestones: [...(proj.milestones || []), newMs] };
      }
      return proj;
    });

    setState(prev => ({ ...prev, projects: updated }));
    triggerToast(`Milestone scheduled: ${title}`);
  };

  const handleToggleProjectMilestone = (projectId: number, milestoneId: number) => {
    const updated = state.projects.map((proj) => {
      if (proj.id === projectId) {
        const nextMs = proj.milestones.map((m) => {
          if (m.id === milestoneId) {
            return { ...m, done: !m.done };
          }
          return m;
        });
        return { ...proj, milestones: nextMs };
      }
      return proj;
    });

    setState(prev => ({ ...prev, projects: updated }));
  };

  const handleDeleteProjectMilestone = (projectId: number, milestoneId: number) => {
    const updated = state.projects.map((proj) => {
      if (proj.id === projectId) {
        return { ...proj, milestones: proj.milestones.filter(m => m.id !== milestoneId) };
      }
      return proj;
    });

    setState(prev => ({ ...prev, projects: updated }));
    triggerToast("Milestone removed");
  };

  const handleAddProjectTask = (projectId: number, title: string) => {
    const updated = state.projects.map((proj) => {
      if (proj.id === projectId) {
        const newT = { id: Date.now(), title, done: false };
        return { ...proj, ptasks: [...(proj.ptasks || []), newT] };
      }
      return proj;
    });

    setState(prev => ({ ...prev, projects: updated }));
    triggerToast(`Project checklist task added: ${title}`);
  };

  const handleToggleProjectTask = (projectId: number, taskId: number) => {
    const updated = state.projects.map((proj) => {
      if (proj.id === projectId) {
        const nextT = proj.ptasks.map((t) => {
          if (t.id === taskId) {
            return { ...t, done: !t.done };
          }
          return t;
        });
        return { ...proj, ptasks: nextT };
      }
      return proj;
    });

    setState(prev => ({ ...prev, projects: updated }));
  };

  const handleDeleteProjectTask = (projectId: number, taskId: number) => {
    const updated = state.projects.map((proj) => {
      if (proj.id === projectId) {
        return { ...proj, ptasks: proj.ptasks.filter(t => t.id !== taskId) };
      }
      return proj;
    });
    setState(prev => ({ ...prev, projects: updated }));
  };

  const handleUpdateProjectStatus = (projectId: number, status: Project['status']) => {
    const updated = state.projects.map((p) => {
      if (p.id === projectId) {
        return { ...p, status };
      }
      return p;
    });

    setState(prev => ({ ...prev, projects: updated }));
    triggerToast(`Status changed to: ${status}`);
  };

  // ─── Career Callbacks ───
  const handleAddAchievement = (ach: Omit<Achievement, 'id'>) => {
    setState(prev => ({
      ...prev,
      achievements: [{ id: Date.now(), ...ach }, ...prev.achievements]
    }));
    triggerToast(`Achievement logged: ${ach.title}`);
  };

  const handleDeleteAchievement = (id: number) => {
    setState(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a.id !== id)
    }));
    triggerToast("Achievement removed");
  };

  const handleAddInternship = (intern: Omit<Internship, 'id'>) => {
    setState(prev => ({
      ...prev,
      internships: [{ id: Date.now(), ...intern }, ...prev.internships]
    }));
    triggerToast(`Experience recorded: ${intern.company}`);
  };

  const handleDeleteInternship = (id: number) => {
    setState(prev => ({
      ...prev,
      internships: prev.internships.filter(i => i.id !== id)
    }));
    triggerToast("Experience deleted");
  };

  const handleAddCV = (cv: Omit<CVFile, 'id' | 'date'>) => {
    const newCv: CVFile = {
      id: Date.now(),
      ...cv,
      date: new Date().toLocaleDateString()
    };
    setState(prev => ({
      ...prev,
      cvFiles: [newCv, ...prev.cvFiles]
    }));
    triggerToast(`CV linked to folder: ${cv.name}`);
  };

  const handleDeleteCV = (id: number) => {
    setState(prev => ({
      ...prev,
      cvFiles: prev.cvFiles.filter(c => c.id !== id)
    }));
    triggerToast("CV draft reference deleted");
  };

  const handleAddCareerGoal = (goal: Omit<CareerGoal, 'id'>) => {
    setState(prev => ({
      ...prev,
      careerGoals: [{ id: Date.now(), ...goal }, ...prev.careerGoals]
    }));
    triggerToast(`Target established: ${goal.title}`);
  };

  const handleDeleteCareerGoal = (id: number) => {
    setState(prev => ({
      ...prev,
      careerGoals: prev.careerGoals.filter(g => g.id !== id)
    }));
    triggerToast("Target removed");
  };

  const handleToggleGoal = (id: number) => {
    const updated = state.careerGoals.map((g) => {
      if (g.id === id) {
        return { ...g, status: g.status === 'done' ? 'active' : 'done' as any };
      }
      return g;
    });

    setState(prev => ({ ...prev, careerGoals: updated }));
  };

  // ─── Health Callbacks ───
  const handleAddHabit = (name: string, emoji: string) => {
    const newH: Habit = {
      id: 'h_' + Date.now(),
      name,
      emoji,
      color: "#8b1a6b"
    };

    setState(prev => ({
      ...prev,
      habits: [...prev.habits, newH]
    }));
    triggerToast(`Habit established: ${name}`);
  };

  const handleDeleteHabit = (id: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }));
    triggerToast("Habit deleted");
  };

  const handleToggleHabit = (id: string, date: string) => {
    const currentList = state.habitLog[date] || [];
    let nextList = [...currentList];
    const index = nextList.indexOf(id);

    let xpGain = 0;

    if (index > -1) {
      nextList.splice(index, 1);
    } else {
      nextList.push(id);
      xpGain = 5; // yields +5 XP
    }

    setState(prev => ({
      ...prev,
      xp: prev.xp + xpGain,
      habitLog: {
        ...prev.habitLog,
        [date]: nextList
      }
    }));

    if (xpGain > 0) {
      triggerToast("Habit complete! +5 XP awarded");
    }
  };

  const handleAddSleep = (hrs: number) => {
    setState(prev => ({
      ...prev,
      sleepLog: [{ hrs, date: new Date().toLocaleDateString() }, ...prev.sleepLog].slice(0, 30)
    }));
    triggerToast("Sleep hours logged");
  };

  const handleAddMood = (emoji: string, label: string, note?: string) => {
    setState(prev => ({
      ...prev,
      moodLog: [{ emoji, label, note, date: new Date().toLocaleDateString() }, ...prev.moodLog].slice(0, 30)
    }));
    triggerToast("Mind journal logged");
  };

  const handleIncrementWater = () => {
    setState(prev => ({
      ...prev,
      water: prev.water >= 8 ? 8 : prev.water + 1
    }));
    triggerToast("Water glass logged (+250ml)");
  };

  const handleResetWater = () => {
    setState(prev => ({ ...prev, water: 0 }));
    triggerToast("Hydration counts reset");
  };

  // ─── Finance Callbacks ───
  const handleAddTransaction = (txn: Omit<FinanceTransaction, 'id' | 'date'>) => {
    onAddTransactionSubmit(txn);
  };

  const onAddTodo = (todo: Omit<TodoTask, 'id' | 'done'>) => {
    const newTodo: TodoTask = {
      ...todo,
      id: Date.now(),
      done: false
    };
    setStateAndSave(prev => ({
      ...prev,
      todos: [newTodo, ...prev.todos]
    }));
  };

  const onAddPaper = (p: Omit<ResearchPaper, 'id' | 'date'>) => {
    const newPaper: ResearchPaper = {
      ...p,
      id: Date.now(),
      date: new Date().toLocaleDateString()
    };
    setStateAndSave(prev => ({
      ...prev,
      papers: [newPaper, ...prev.papers]
    }));
  };

  const onAddTransactionSubmit = (txn: Omit<FinanceTransaction, 'id' | 'date'>) => {
    const newTxn: FinanceTransaction = {
      id: Date.now(),
      desc: txn.desc,
      amt: txn.amt,
      type: txn.type,
      cat: txn.cat,
      date: new Date().toISOString()
    };

    setStateAndSave(prev => ({
      ...prev,
      transactions: [newTxn, ...prev.transactions]
    }));
    triggerToast("Ledger history updated");
  };

  const onDeleteTransaction = (id: number) => {
    setStateAndSave(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
    triggerToast("Ledger record deleted");
  };

  const onUpdateBudget = (amt: number) => {
    setStateAndSave(prev => ({ ...prev, budget: amt }));
    triggerToast(`Monthly spending cap configured to ₹${amt}`);
  };

  const onUpdateSavings = (amt: number) => {
    setStateAndSave(prev => ({ ...prev, savings: amt }));
    triggerToast(`Bank savings adjusted to ₹${amt}`);
  };

  // ─── Calendar Callbacks ───
  const handleAddEvent = (evt: Omit<CalendarEvent, 'id'>) => {
    const newE: CalendarEvent = {
      id: Date.now(),
      ...evt
    };
    setStateAndSave(prev => ({
      ...prev,
      events: [...prev.events, newE]
    }));
    triggerCongratulations("Scheduled event");
  };

  const handleDeleteEvent = (id: number) => {
    setStateAndSave(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
    triggerToast("Event removed");
  };

  // State utility helper
  const setStateAndSave = (updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      return next;
    });
  };

  // Trigger sound effect or trigger alert
  const triggerCongratulations = (msg: string) => {
    triggerToast(`Success: ${msg}`);
  };

  // Render Dashboard Landing
  const renderDashboardTab = () => {
    const now = new Date();
    const currentHour = now.getHours();
    let greeting = "Good morning";
    if (currentHour >= 12 && currentHour < 17) greeting = "Good afternoon";
    if (currentHour >= 17) greeting = "Good evening";

    const activeQuote = QUOTES[quoteIndex % QUOTES.length];
    const todaySessions = state.sessions.filter(s => s.date === now.toDateString());
    const totalTodayMins = todaySessions.reduce((acc, curr) => acc + curr.dur, 0);

    const pendingTodos = state.todos.filter(t => !t.done).slice(0, 4);

    // GPA calculation
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

    let totalPoints = 0;
    let totalCredits = 0;
    let gradedCount = 0;

    (state.courses || []).forEach(c => {
      if (c.grade && GRADE_POINTS[c.grade] !== undefined) {
        totalPoints += GRADE_POINTS[c.grade] * c.credits;
        totalCredits += c.credits;
        gradedCount++;
      }
    });

    const cumulativeGpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    let sproutEmoji = "🌱";
    let sproutTitle = "Tiny Sprout";
    if (gradedCount === 0) {
      sproutEmoji = "🌰";
      sproutTitle = "Acorn";
    } else if (cumulativeGpa >= 3.7) {
      sproutEmoji = "🌸";
      sproutTitle = "Orchid";
    } else if (cumulativeGpa >= 3.2) {
      sproutEmoji = "🪴";
      sproutTitle = "Fern";
    } else if (cumulativeGpa >= 2.5) {
      sproutEmoji = "🌿";
      sproutTitle = "Ivy";
    }

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
    const todayDayName = weekdays[now.getDay()];
    const todayClasses = (state.timetable || []).filter(t => t.day === todayDayName);

    return (
      <div className="space-y-6">
        {/* Greetings Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <h1 className="serif text-3xl font-bold tracking-tight text-[var(--text)]">
              {greeting}, {state.profile.name || "Scholar"}.
            </h1>
            <p className="text-xs text-[var(--muted)] mt-1 font-medium select-none">
              {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-xl text-xs shrink-0 shadow-xs">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-[var(--text)] block leading-none">{state.streak} Days Streak</span>
              <span className="text-[10px] text-[var(--muted)]">Keep studying to stay ahead</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inspiration quote panel */}
          <div className="md:col-span-2 bg-[var(--accent-dim)] border border-[var(--accent-border)] rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">🍂 COZY GENTLE WISDOM (CHANGES DAILY)</span>
                <button 
                  onClick={cycleQuote}
                  className="text-[10px] text-[var(--accent)] hover:underline font-bold flex items-center gap-1 opacity-80 hover:opacity-100 transition-all"
                  title="Reveal another piece of campus wisdom"
                >
                  ✨ Seek Next Wisdom
                </button>
              </div>
              <p 
                onClick={cycleQuote}
                title="Click to cycle quote"
                className="serif text-lg italic leading-relaxed text-[var(--text)] border-l-2 border-[var(--accent)] pl-4 py-1 hover:text-[var(--accent)] transition-colors duration-200 cursor-pointer selection:bg-[var(--accent-dim)] select-none"
              >
                {activeQuote.q}
              </p>
            </div>
            <p className="text-xs text-[var(--muted-dark)] font-semibold mt-4 flex items-center justify-between">
              <span>{activeQuote.a}</span>
              <span className="text-[10px] text-[var(--muted)] italic font-normal">Click quote to cycle</span>
            </p>
          </div>

          {/* Today's Lectures & Academic Sprout */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">📅 TODAY'S LECTURES ({todayDayName.toUpperCase()})</span>
                <button 
                  onClick={() => setCurrentTab("explore")}
                  className="text-[9px] bg-[var(--accent-dim)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white px-2 py-0.5 rounded-full font-bold transition-colors"
                >
                  Edit timetable
                </button>
              </div>

              {todayClasses.length === 0 ? (
                <div className="py-3 px-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-center">
                  <span className="text-xl block mb-1">☕</span>
                  <p className="text-[11px] font-medium text-[var(--text)]">No classes today!</p>
                  <p className="text-[9px] text-[var(--muted)]">Enjoy some cozy self-study & reading.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {todayClasses.map(cls => (
                    <div key={cls.id} className="p-2 border border-[var(--border)] bg-[var(--surface-hover)] rounded-xl flex items-center justify-between gap-2 text-xs">
                      <div className="truncate">
                        <h4 className="font-bold text-[var(--text)] text-[11px] truncate">{cls.courseName}</h4>
                        <div className="flex items-center gap-2 text-[9px] text-[var(--muted-dark)] mt-0.5">
                          <span>⏱️ {cls.time}</span>
                          {cls.location && <span className="truncate">📍 {cls.location}</span>}
                        </div>
                      </div>
                      <span className="text-lg">📚</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border)] pt-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--muted-dark)] uppercase tracking-wider">🎓 ACADEMIC GARDEN</span>
                <span className="text-[9px] text-[var(--muted)] italic font-semibold">{sproutTitle} stage</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl shrink-0 select-none">{sproutEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="serif text-sm font-bold text-[var(--text)]">
                      {gradedCount > 0 ? `${cumulativeGpa.toFixed(2)} GPA` : "No grades yet"}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">/ 4.00</span>
                  </div>
                  
                  {/* GPA Garden growth bar */}
                  <div className="prog h-2 mt-1">
                    <div 
                      className="prog-fill bg-[var(--accent)]" 
                      style={{ width: `${gradedCount > 0 ? (cumulativeGpa / 4.0) * 100 : 10}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's prioritary to-dos list */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
              <h3 className="serif text-base font-semibold text-[var(--text)]">🎯 Target Priorities</h3>
              <button onClick={() => setCurrentTab("todo")} className="text-xs text-[var(--accent)] font-bold hover:underline">
                View all tasks
              </button>
            </div>

            <div className="space-y-3">
              {pendingTodos.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted)] text-xs">
                  All priorities checked off! Click "View all tasks" to schedule more target lists.
                </div>
              ) : (
                pendingTodos.map((todo) => (
                  <div key={todo.id} className="flex justify-between items-center bg-[var(--surface-hover)] border border-[var(--border)] p-2.5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleToggleTodo(todo.id)} className="w-4.5 h-4.5 border border-[var(--border-strong)] rounded hover:border-[var(--accent)] flex items-center justify-center font-bold text-xs" />
                      <span className="text-xs font-semibold text-[var(--text)] truncate max-w-[200px]">{todo.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                      todo.pri === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      todo.pri === 'low' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {todo.pri}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's recent study feeds */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
              <h3 className="serif text-base font-semibold text-[var(--text)]">📋 Today's Study Log</h3>
              <span className="text-xs text-[var(--muted-dark)] font-semibold">{totalTodayMins} minutes study completed</span>
            </div>

            <div className="space-y-3">
              {todaySessions.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted)] text-xs">
                  No sessions registered today yet. Open the "Study Tracker" to kick off focus durations.
                </div>
              ) : (
                todaySessions.map((sess) => (
                  <div key={sess.id} className="flex justify-between items-center p-2.5 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{sess.emoji}</span>
                      <div>
                        <span className="text-xs font-semibold text-[var(--text)] block">{sess.subj}</span>
                        <span className="text-[9px] text-[var(--muted)] uppercase font-mono tracking-wider">{sess.time}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--accent)]">+{sess.dur} min</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    );
  };

  const renderActiveTab = () => {
    switch(currentTab) {
      case "dashboard":
        return renderDashboardTab();
      case "timer":
        return (
          <div className="space-y-6">
            <MusicPlayer />
            <Timer 
              courses={state.courses}
              sessions={state.sessions}
              streak={state.streak}
              onSessionComplete={handleSessionComplete}
            />
          </div>
        );
      case "vault":
        return (
          <VaultTab 
            courses={state.courses}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
            onAddResource={handleAddCourseResource}
            onDeleteResource={handleDeleteCourseResource}
          />
        );
      case "research":
        return (
          <ResearchTab 
            papers={state.papers}
            onAddPaper={onAddPaper}
            onDeletePaper={handleDeletePaper}
            onUpdateStatus={handleUpdatePaperStatus}
            onUpdateNotes={handleUpdatePaperNotes}
          />
        );
      case "todo":
        return (
          <TodoTab 
            todos={state.todos}
            onAddTodo={onAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        );
      case "projects":
        return (
          <ProjectsTab 
            projects={state.projects}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            onAddMilestone={handleAddProjectMilestone}
            onToggleMilestone={handleToggleProjectMilestone}
            onDeleteMilestone={handleDeleteProjectMilestone}
            onAddProjTask={handleAddProjectTask}
            onToggleProjTask={handleToggleProjectTask}
            onDeleteProjTask={handleDeleteProjectTask}
            onUpdateProjectStatus={handleUpdateProjectStatus}
          />
        );
      case "career":
        return (
          <CareerTab 
            achievements={state.achievements}
            internships={state.internships}
            cvFiles={state.cvFiles}
            careerGoals={state.careerGoals}
            onAddAchievement={handleAddAchievement}
            onDeleteAchievement={handleDeleteAchievement}
            onAddInternship={handleAddInternship}
            onDeleteInternship={handleDeleteInternship}
            onAddCV={handleAddCV}
            onDeleteCV={handleDeleteCV}
            onAddCareerGoal={handleAddCareerGoal}
            onDeleteCareerGoal={handleDeleteCareerGoal}
            onToggleGoal={handleToggleGoal}
          />
        );
      case "calendar":
        return (
          <CalendarTab 
            events={state.events}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        );
      case "explore":
        return (
          <ExploreTab 
            appState={state} 
            onUpdateCourses={(courses) => setState(prev => ({ ...prev, courses }))}
            onUpdateTimetable={(timetable) => setState(prev => ({ ...prev, timetable }))}
            onRestoreState={(newState) => {
              setState(newState);
              triggerToast("🎒 University life tracker state loaded and synced!");
            }}
            googleUser={googleUser}
            googleToken={googleToken}
            syncStatus={syncStatus}
            syncError={syncError}
            autoUpload={autoUpload}
            folderUrl={folderUrl}
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
            onBackup={handleForcePush}
            onRestore={handleForcePull}
            onToggleAutoUpload={handleToggleAutoUpload}
            onUpdateFolderUrl={handleUpdateFolderUrl}
          />
        );
      case "personal":
        return (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white text-3xl font-semibold flex items-center justify-center select-none uppercase shadow-md mx-auto">
                {state.profile.name ? state.profile.name[0] : 'E'}
              </div>
              <h2 className="serif text-xl font-semibold text-[var(--text)]">{state.profile.name}</h2>
              <p className="text-xs text-[var(--muted-dark)]">{state.profile.degree || "Academic scholar"}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider border-b border-[var(--border)] pb-1.5">Profile Settings</h3>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  value={state.profile.name}
                  onChange={(e) => setState(prev => ({ ...prev, profile: { ...prev.profile, name: e.target.value } }))}
                  className="inp text-xs" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">University / Institution</label>
                <input 
                  type="text" 
                  value={state.profile.uni || ""}
                  onChange={(e) => setState(prev => ({ ...prev, profile: { ...prev.profile, uni: e.target.value } }))}
                  className="inp text-xs" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Degree / Major</label>
                <input 
                  type="text" 
                  value={state.profile.degree || ""}
                  onChange={(e) => setState(prev => ({ ...prev, profile: { ...prev.profile, degree: e.target.value } }))}
                  className="inp text-xs" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <select 
                    value={state.profile.year || "Year 3"}
                    onChange={(e) => setState(prev => ({ ...prev, profile: { ...prev.profile, year: e.target.value } }))}
                    className="inp text-xs font-medium"
                  >
                    <option>Year 1</option>
                    <option>Year 2</option>
                    <option>Year 3</option>
                    <option>Year 4</option>
                    <option>Master's</option>
                    <option>Ph.D.</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Daily Study Target (hours)</label>
                  <input 
                    type="number" 
                    min="1"
                    max="24"
                    value={state.profile.goal}
                    onChange={(e) => setState(prev => ({ ...prev, profile: { ...prev.profile, goal: Number(e.target.value) } }))}
                    className="inp text-xs" 
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case "health":
        return (
          <HealthTab 
            habits={state.habits}
            habitLog={state.habitLog}
            water={state.water}
            sleepLog={state.sleepLog}
            moodLog={state.moodLog}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
            onToggleHabit={handleToggleHabit}
            onAddSleep={handleAddSleep}
            onAddMood={handleAddMood}
            onIncrementWater={handleIncrementWater}
            onResetWater={handleResetWater}
          />
        );
      case "finance":
        return (
          <FinanceTab 
            transactions={state.transactions}
            budget={state.budget}
            savings={state.savings}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={onDeleteTransaction}
            onUpdateBudget={onUpdateBudget}
            onUpdateSavings={onUpdateSavings}
          />
        );
      case "settings":
        return (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-xl mx-auto space-y-6">
            <h2 className="serif text-lg font-bold text-[var(--text)] border-b border-[var(--border)] pb-2">Workspace Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[var(--text)] block">Toggle Theme</span>
                  <span className="text-[10px] text-[var(--muted)]">Switch between elegant light and deep night modes</span>
                </div>
                <button 
                  onClick={handleToggleTheme}
                  className="btn btn-ghost py-1.5 px-3.5 border-[var(--border-strong)]"
                >
                  {state.dark ? "☀️ Light mode" : "🌙 Dark mode"}
                </button>
              </div>

              <div className="flex justify-between items-center text-xs pt-4 border-t border-[var(--border)]">
                <div>
                  <span className="font-bold text-[var(--text)] block">Export backup file</span>
                  <span className="text-[10px] text-[var(--muted)] font-medium">Download full workspace metadata records as a standard JSON</span>
                </div>
                <button 
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
                    const dlAnchorElem = document.createElement('a');
                    dlAnchorElem.setAttribute("href",     dataStr     );
                    dlAnchorElem.setAttribute("download", "eternity_workspace_backup.json");
                    dlAnchorElem.click();
                    triggerToast("Full workspace metadata exported!");
                  }}
                  className="btn btn-ghost py-1.5 px-3.5 border-[var(--border-strong)]"
                >
                  📥 Export
                </button>
              </div>

              <div className="flex justify-between items-center text-xs pt-4 border-t border-[var(--border)]">
                <div>
                  <span className="font-bold text-rose-500 block">Dangerous: Clear Workspace</span>
                  <span className="text-[10px] text-[var(--muted)]">Permanently clear all data and restore factory presets</span>
                </div>
                <button 
                  onClick={() => {
                    if (confirm("Dangerous Operation: This will wipe all schedules, budgets, and course-vault items. Proceed?")) {
                      localStorage.removeItem('eternity_v4_state');
                      setState(INITIAL_STATE);
                      triggerToast("Workspace cleared and reset to standards.");
                    }
                  }}
                  className="btn py-1.5 px-3.5 bg-rose-500 text-white hover:bg-rose-600 rounded font-bold shadow-xs"
                >
                  Clear Workspace
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased transition-colors duration-200">
      {/* Dynamic Master Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        profile={state.profile}
        isDark={state.dark}
        setIsDark={(val) => setState(prev => ({ ...prev, dark: val }))}
        todoCount={state.todos.filter(t => !t.done).length}
        syncStatus={syncStatus}
        syncError={syncError}
        syncUserEmail={googleUser?.email || null}
      />

      {/* Main Workspace Feed content */}
      <main className="flex-1 md:ml-[240px] p-5 md:p-8 max-w-5xl mx-auto w-full min-h-screen pb-16">
        {renderActiveTab()}
      </main>

      {/* Custom Global Floating Toast Notification */}
      {toastMessage && (
        <div className="toast show select-none">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
