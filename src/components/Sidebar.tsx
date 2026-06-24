/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckSquare, 
  Calendar, 
  Compass, 
  Award, 
  Briefcase, 
  FileText, 
  User, 
  Heart, 
  CircleDollarSign, 
  Settings, 
  Moon, 
  Sun,
  Timer,
  Menu,
  X,
  Layers,
  GraduationCap
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  profile: UserProfile;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  todoCount: number;
  syncStatus?: 'idle' | 'syncing' | 'connected' | 'error' | 'disconnected';
  syncError?: string | null;
  supabaseSyncCode?: string | null;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  profile,
  isDark,
  setIsDark,
  todoCount,
  syncStatus = 'disconnected',
  syncError = null,
  supabaseSyncCode = null
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = [
    {
      title: "Study",
      items: [
        { id: "timer", label: "Study Tracker", icon: Timer },
        { id: "vault", label: "Reading Vault", icon: BookOpen },
        { id: "research", label: "Research Hub", icon: Layers },
        { id: "todo", label: "To-Do", icon: CheckSquare, badge: todoCount },
      ]
    },
    {
      title: "Work",
      items: [
        { id: "projects", label: "Projects", icon: Briefcase },
        { id: "career", label: "Career", icon: Award },
      ]
    },
    {
      title: "Mind",
      items: [
        { id: "calendar", label: "Curiosity Inbox", icon: Calendar },
        { id: "explore", label: "Academics", icon: GraduationCap },
      ]
    },
    {
      title: "Life",
      items: [
        { id: "personal", label: "Personal", icon: User },
        { id: "health", label: "Health", icon: Heart },
        { id: "finance", label: "Finances", icon: CircleDollarSign },
      ]
    }
  ];

  const handleNav = (id: string) => {
    setCurrentTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="flex md:hidden items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-40">
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-1.5 border border-[var(--border-strong)] rounded-lg text-[var(--text)]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="serif text-lg font-semibold text-[var(--accent)] tracking-tight flex items-center gap-1.5">🌿 Eternity</span>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-1.5 border border-[var(--border-strong)] rounded-lg text-[var(--muted-dark)]"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-[240px] bg-[var(--surface)] border-r border-[var(--border)]
        flex flex-col h-screen overflow-y-auto transition-transform duration-300 md:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Logo */}
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
          <span className="serif text-xl font-semibold tracking-tight text-[var(--accent)] flex items-center gap-2">
            🌿 Eternity
          </span>
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-[var(--muted-dark)] hover:text-[var(--text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Home Dashboard Button */}
        <div className="px-3 pt-4">
          <button
            onClick={() => handleNav("dashboard")}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 text-left
              ${currentTab === "dashboard" 
                ? 'bg-[var(--accent-dim)] text-[var(--accent)] font-medium border-l-2 border-[var(--accent)] rounded-l-none' 
                : 'text-[var(--muted-dark)] hover:text-[var(--text)] hover:bg-[var(--surface-active)]'}
            `}
          >
            <span className="text-base">⌂</span>
            <span>Dashboard</span>
          </button>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-4">
          {sections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <span className="block px-4 py-1 text-[10px] font-bold tracking-wider text-[var(--muted)] uppercase">
                {sec.title}
              </span>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-150 text-left relative
                      ${isActive 
                        ? 'bg-[var(--accent-dim)] text-[var(--accent)] font-medium border-l-2 border-[var(--accent)] rounded-l-none' 
                        : 'text-[var(--muted-dark)] hover:text-[var(--text)] hover:bg-[var(--surface-active)]'}
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute right-4 px-1.5 py-0.5 text-[9px] font-bold bg-[var(--accent)] text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Real-time Sync Status indicator */}
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-hover)]/30 flex items-center justify-between text-[10px] select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            {syncStatus === 'connected' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-[var(--text)] font-semibold truncate" title="Connected to Supabase and syncing in real-time">Cloud Synced</span>
              </>
            )}
            {syncStatus === 'syncing' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                <span className="text-[var(--text)] font-semibold truncate animate-pulse" title="Uploading or downloading state updates">Syncing...</span>
              </>
            )}
            {syncStatus === 'error' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span className="text-red-500 font-bold truncate animate-pulse" title={syncError || 'Sync failed. Click Academics -> Supabase Sync Cabin to view details.'}>Sync Error</span>
              </>
            )}
            {syncStatus === 'disconnected' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0"></span>
                <span className="text-[var(--muted)] font-medium truncate" title="Local storage only. Click Academics -> Supabase Sync Cabin to set up.">Local Only</span>
              </>
            )}
          </div>
          {supabaseSyncCode && (
            <span className="font-mono text-[9px] text-[var(--muted)] bg-[var(--surface)] px-1 py-0.5 rounded border border-[var(--border)] uppercase truncate max-w-[80px]" title={`Active Sync Code: ${supabaseSyncCode}`}>
              {supabaseSyncCode.replace('SYNC-', '')}
            </span>
          )}
        </div>

        {/* Bottom Profile Footer */}
        <div className="mt-auto p-4 border-t border-[var(--border)] flex items-center gap-3 bg-[var(--surface-hover)]">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center font-semibold text-white text-xs select-none shadow-sm uppercase">
            {profile.name ? profile.name[0] : 'E'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[var(--text)] truncate">{profile.name}</div>
            <div className="text-[10px] text-[var(--muted)] truncate">{profile.degree || 'Scholar'}</div>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="w-7 h-7 flex items-center justify-center border border-[var(--border-strong)] rounded-lg text-[var(--muted-dark)] hover:text-[var(--text)] hover:bg-[var(--surface-active)]"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>
    </>
  );
}
