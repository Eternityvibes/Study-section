/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Heart, 
  Droplet, 
  Moon, 
  Smile, 
  Plus, 
  CheckCircle2, 
  PlusCircle, 
  Trash2,
  Bookmark
} from 'lucide-react';
import { Habit, SleepRecord, MoodRecord } from '../types';

interface HealthTabProps {
  habits: Habit[];
  habitLog: Record<string, string[]>;
  water: number;
  sleepLog: SleepRecord[];
  moodLog: MoodRecord[];
  onAddHabit: (name: string, emoji: string) => void;
  onDeleteHabit: (id: string) => void;
  onToggleHabit: (id: string, date: string) => void;
  onAddSleep: (hrs: number) => void;
  onAddMood: (emoji: string, label: string, note?: string) => void;
  onIncrementWater: () => void;
  onResetWater: () => void;
}

export default function HealthTab({
  habits,
  habitLog,
  water,
  sleepLog,
  moodLog,
  onAddHabit,
  onDeleteHabit,
  onToggleHabit,
  onAddSleep,
  onAddMood,
  onIncrementWater,
  onResetWater
}: HealthTabProps) {
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  // Form inputs
  const [hName, setHName] = useState("");
  const [hEmoji, setHEmoji] = useState("🏃");

  const [selectedEmoji, setSelectedEmoji] = useState("😄");
  const [selectedLabel, setSelectedLabel] = useState("Amazing");
  const [moodNote, setMoodNote] = useState("");

  const today = new Date().toDateString();
  const todayHabitsDone = habitLog[today] || [];

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hName.trim()) return;
    onAddHabit(hName, hEmoji);
    setHName("");
    setHEmoji("🏃");
    setShowHabitModal(false);
  };

  const handleLogSleep = () => {
    const hrsIn = prompt("How many hours of sleep did you get last night?");
    if (hrsIn === null) return;
    const hrs = parseFloat(hrsIn);
    if (isNaN(hrs) || hrs <= 0 || hrs > 24) {
      alert("Please enter a valid hour amount between 0 and 24.");
      return;
    }
    onAddSleep(hrs);
  };

  const handleAddMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMood(selectedEmoji, selectedLabel, moodNote || undefined);
    setSelectedEmoji("😄");
    setSelectedLabel("Amazing");
    setMoodNote("");
    setShowMoodModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="serif text-2xl font-bold text-[var(--text)]">Health & Mindfulness</h2>
        <p className="text-xs text-[var(--muted)]">Inspect sleep patterns, track hydration, record mood triggers, and check off daily health habits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hydration Tracker */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
              <Droplet className="w-4.5 h-4.5 text-sky-500 fill-sky-500/20" />
              <span>💧 Hydration Journal</span>
            </h3>
            <span className="text-xs font-semibold text-[var(--muted-dark)]">{water}/8 glasses</span>
          </div>

          <div className="flex flex-wrap gap-2.5 py-2">
            {Array.from({ length: 8 }).map((_, idx) => {
              const isFilled = idx < water;
              return (
                <button
                  key={idx}
                  onClick={onIncrementWater}
                  className={`
                    w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all duration-150 cursor-pointer hover:scale-105
                    ${isFilled 
                      ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/20 text-sky-500 shadow-xs' 
                      : 'border-[var(--border-strong)] bg-[var(--surface-hover)] text-gray-300 dark:text-gray-700'}
                  `}
                >
                  💧
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">Tap a glass to register 250ml water</span>
            <button 
              onClick={onResetWater}
              className="text-xs text-rose-500 font-bold hover:underline"
            >
              Reset Hydration
            </button>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-2 shrink-0">
            <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
              <Moon className="w-4.5 h-4.5 text-indigo-500" />
              <span>😴 Sleep Quality Logger</span>
            </h3>
            <button 
              onClick={handleLogSleep}
              className="btn btn-ghost py-1 px-3 text-xs border-[var(--border-strong)]"
            >
              Log Hours
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[140px]">
            {sleepLog.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--muted)]">No sleep durations recorded yet</div>
            ) : (
              sleepLog.map((sleep, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-[var(--border)] last:border-none">
                  <div className="text-xs font-semibold text-[var(--text)]">Sleep Period</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[var(--muted)]">{sleep.date}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      sleep.hrs >= 7.5 ? 'bg-emerald-500/10 text-emerald-500' :
                      sleep.hrs >= 6.0 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {sleep.hrs} hrs
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Habit Tracker Section */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
            <Heart className="w-4.5 h-4.5 text-[var(--accent)]" />
            <span>🏃 Daily Habits Tracker</span>
          </h3>
          <button 
            onClick={() => setShowHabitModal(true)}
            className="btn btn-ghost py-1 px-2.5 text-xs border-[var(--border-strong)] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Habit</span>
          </button>
        </div>

        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="text-center py-6 text-xs text-[var(--muted)]">No daily habits configured yet</div>
          ) : (
            habits.map((habit) => {
              const isDone = todayHabitsDone.includes(habit.id);
              return (
                <div key={habit.id} className="flex items-center justify-between gap-3 p-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{habit.emoji}</span>
                    <span className="text-xs font-semibold text-[var(--text)]">{habit.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleHabit(habit.id, today)}
                      className={`
                        px-3 py-1 rounded-full text-xs font-bold border transition-all duration-150 cursor-pointer
                        ${isDone 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                          : 'bg-[var(--surface)] border-[var(--border-strong)] text-[var(--muted-dark)] hover:border-[var(--accent)]'}
                      `}
                    >
                      {isDone ? "✓ Done today" : "Mark done"}
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="text-[var(--muted-dark)] hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mood Journal Section */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
            <Smile className="w-4.5 h-4.5 text-amber-500 fill-amber-500/10" />
            <span>😊 Daily Mood Journal</span>
          </h3>
          <button 
            onClick={() => setShowMoodModal(true)}
            className="btn btn-ghost py-1 px-3 text-xs border-[var(--border-strong)]"
          >
            Log Today's Mood
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moodLog.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-[var(--muted)]">No mood logs saved yet</div>
          ) : (
            moodLog.slice(0, 4).map((mood, idx) => (
              <div key={idx} className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-3 text-center space-y-1">
                <span className="text-3xl block">{mood.emoji}</span>
                <span className="text-xs font-bold text-[var(--text)] block">{mood.label}</span>
                {mood.note && <p className="text-[10px] text-[var(--muted-dark)] italic leading-relaxed truncate">{mood.note}</p>}
                <span className="text-[9px] text-[var(--muted)] font-mono block">{mood.date}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- FORM MODALS --- */}

      {/* 1. Habit Modal */}
      {showHabitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeUp">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="serif text-base font-semibold text-[var(--text)] mb-3">Create Daily Habit</h3>
            <form onSubmit={handleAddHabitSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Habit Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Meditate for 10 minutes" 
                  value={hName}
                  onChange={(e) => setHName(e.target.value)}
                  className="inp text-xs" 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Emoji Icon</label>
                <select 
                  value={hEmoji}
                  onChange={(e) => setHEmoji(e.target.value)}
                  className="inp text-xs"
                >
                  <option>🏃</option><option>🧘</option><option>📖</option><option>🥗</option>
                  <option>🌅</option><option>🚴</option><option>🛌</option><option>💊</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowHabitModal(false)} 
                  className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary py-1.5 px-3 text-xs">Establish Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Mood Modal */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeUp">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="serif text-base font-semibold text-[var(--text)] mb-4">Log Today's Mood</h3>
            
            <div className="flex justify-center gap-2.5 pb-4 border-b border-[var(--border)]">
              {[
                { e: "😄", l: "Amazing" },
                { e: "😊", l: "Good" },
                { e: "😐", l: "Okay" },
                { e: "😔", l: "Low" },
                { e: "😫", l: "Stressed" },
              ].map((moodItem) => (
                <button
                  key={moodItem.l}
                  type="button"
                  onClick={() => {
                    setSelectedEmoji(moodItem.e);
                    setSelectedLabel(moodItem.l);
                  }}
                  className={`
                    w-12 h-14 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer
                    ${selectedEmoji === moodItem.e 
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)]' 
                      : 'border-[var(--border)] hover:border-[var(--border-strong)]'}
                  `}
                >
                  <span className="text-xl">{moodItem.e}</span>
                  <span className="text-[9px] font-bold text-[var(--muted-dark)]">{moodItem.l}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleAddMoodSubmit} className="space-y-4 pt-4">
              <div className="form-group">
                <label className="form-label">Annotations / Mood triggers</label>
                <input 
                  type="text" 
                  placeholder="Record why you feel this way (optional)..." 
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="inp text-xs" 
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowMoodModal(false)} 
                  className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary py-1.5 px-3 text-xs">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
