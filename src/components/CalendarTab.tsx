/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Clock, 
  GraduationCap, 
  Flame, 
  AlertCircle,
  Bell
} from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarTabProps {
  events: CalendarEvent[];
  onAddEvent: (evt: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: number) => void;
}

const TYPE_EMOJIS: Record<string, string> = {
  exam: '📝',
  assignment: '📋',
  event: '🎉',
  deadline: '⚠️'
};

const TYPE_COLORS: Record<string, string> = {
  exam: 'border-rose-500/20 bg-rose-500/5 text-rose-500',
  assignment: 'border-amber-500/20 bg-amber-500/5 text-amber-500',
  event: 'border-sky-500/20 bg-sky-500/5 text-sky-500',
  deadline: 'border-purple-500/20 bg-purple-500/5 text-purple-500'
};

export default function CalendarTab({
  events,
  onAddEvent,
  onDeleteEvent
}: CalendarTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toDateString());

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<CalendarEvent['type']>('exam');
  const [note, setNote] = useState("");

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onAddEvent({
      title,
      date,
      type,
      note: note || undefined
    });

    setTitle("");
    setDate("");
    setNote("");
    setShowAddForm(false);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleMonthNav = (dir: number) => {
    let nextMonth = currentMonth + dir;
    let nextYear = currentYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    } else if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  // Calendar rendering computations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysGrid: Array<{ d: number | null; dateStr: string | null; isToday: boolean; hasEvent: boolean }> = [];
  const today = new Date();

  // Padding preceding days
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push({ d: null, dateStr: null, isToday: false, hasEvent: false });
  }

  // Days in month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const loopDate = new Date(currentYear, currentMonth, d);
    const loopDateStr = loopDate.toDateString();
    
    const isToday = loopDate.getDate() === today.getDate() &&
                    loopDate.getMonth() === today.getMonth() &&
                    loopDate.getFullYear() === today.getFullYear();

    const formattedIso = loopDate.toISOString().split('T')[0];
    const hasEvent = events.some(e => e.date === formattedIso);

    daysGrid.push({
      d,
      dateStr: loopDateStr,
      isToday,
      hasEvent
    });
  }

  // Filter events for selected date
  const selectedIso = new Date(selectedDateStr).toISOString().split('T')[0];
  const dayEvents = events.filter(e => e.date === selectedIso);

  // Sorting ascending upcoming calendar metrics
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-2xl font-bold text-[var(--text)]">Curiosity Inbox Calendar</h2>
          <p className="text-xs text-[var(--muted)]">Inspect exam schedules, syllabus deadlines, homework count-downs, and extracurricular alerts</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary self-start sm:self-center flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Academic Event</span>
        </button>
      </div>

      {/* Grid: Calendar Frame & Alerts list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar widget container */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
          
          {/* Header navigation bar */}
          <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
            <button 
              onClick={() => handleMonthNav(-1)}
              className="p-1 text-[var(--muted-dark)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-[var(--border-strong)] rounded-lg text-sm"
            >
              ‹ Pre
            </button>
            <h3 className="serif text-sm font-bold text-[var(--text)]">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button 
              onClick={() => handleMonthNav(1)}
              className="p-1 text-[var(--muted-dark)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-[var(--border-strong)] rounded-lg text-sm"
            >
              Next ›
            </button>
          </div>

          {/* Grid Layout structure */}
          <div>
            {/* Days columns headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Days cells layout */}
            <div className="grid grid-cols-7 gap-1">
              {daysGrid.map((cell, idx) => {
                if (cell.d === null) {
                  return <div key={idx} className="aspect-square opacity-20" />;
                }
                const isSelected = selectedDateStr === cell.dateStr;
                return (
                  <button
                    key={idx}
                    onClick={() => cell.dateStr && setSelectedDateStr(cell.dateStr)}
                    className={`
                      aspect-square rounded-xl text-xs font-semibold flex flex-col items-center justify-center relative cursor-pointer hover:bg-[var(--surface-active)] transition-all duration-150
                      ${cell.isToday ? 'bg-[var(--accent)] text-white shadow-xs' : 'text-[var(--text)]'}
                      ${isSelected && !cell.isToday ? 'border-2 border-[var(--accent)] font-bold bg-[var(--accent-dim)]' : ''}
                    `}
                  >
                    <span>{cell.d}</span>
                    {cell.hasEvent && (
                      <span className={`
                        w-1.5 h-1.5 rounded-full absolute bottom-1.5
                        ${cell.isToday ? 'bg-white' : 'bg-[var(--accent)]'}
                      `} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected date events and upcoming list drawer */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col h-[400px]">
          <h3 className="serif text-base font-semibold text-[var(--text)] pb-3 border-b border-[var(--border)] mb-4 flex items-center gap-2 shrink-0">
            <Bell className="w-4.5 h-4.5 text-[var(--accent)]" />
            <span>{new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} Alerts</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {dayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-[var(--muted)]">
                <AlertCircle className="w-8 h-8 mb-1.5 text-[var(--muted-dark)]" />
                <p className="text-xs font-semibold">No alerts scheduled</p>
                <p className="text-[10px] text-[var(--muted-dark)] max-w-[200px] mt-0.5">There are no academic entries, submissions, or deadlines on this day</p>
              </div>
            ) : (
              dayEvents.map((evt) => (
                <div key={evt.id} className={`border rounded-xl p-3 flex items-start justify-between gap-3 ${TYPE_COLORS[evt.type]}`}>
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg">{TYPE_EMOJIS[evt.type]}</span>
                    <div>
                      <h4 className="text-xs font-bold leading-relaxed">{evt.title}</h4>
                      {evt.note && <p className="text-[10px] opacity-80 leading-relaxed mt-0.5">{evt.note}</p>}
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteEvent(evt.id)}
                    className="text-rose-500 p-1 hover:bg-rose-500/10 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Upcoming Event Feeds banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <h3 className="serif text-sm font-semibold text-[var(--text)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>⏰ Pending count-downs & critical exam alerts</span>
        </h3>
        
        {upcomingEvents.length === 0 ? (
          <p className="text-xs text-[var(--muted)] py-4 text-center">No upcoming tasks or exam deadlines scheduled</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingEvents.map((evt) => {
              const diffDays = Math.ceil((new Date(evt.date).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
              const displayCountdown = diffDays === 0 ? "Today" : diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`;
              return (
                <div key={evt.id} className="border border-[var(--border)] rounded-xl p-3 bg-[var(--surface-hover)] flex justify-between items-center gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text)] truncate">{evt.title}</h4>
                    <span className="text-[9px] text-[var(--muted)] font-mono">{evt.type} · {evt.date}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    diffDays === 0 ? 'bg-rose-500/10 text-rose-500 animate-pulse' :
                    diffDays === 1 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {displayCountdown}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Setup event overlay modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeUp">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="serif text-base font-semibold text-[var(--text)] mb-4">Add Calendar Event</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Event Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. CS101 Final Exam" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="inp text-xs" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Scheduled Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="inp text-xs" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="inp text-xs font-semibold"
                  >
                    <option value="exam">📝 Midterm / Final Exam</option>
                    <option value="assignment">📋 Homework Assignment</option>
                    <option value="deadline">⚠️ Milestone Deadline</option>
                    <option value="event">🎉 Extracurricular / Event</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Notes</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dynamic Programming, 30% total grade weighting..." 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="inp text-xs" 
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary py-1.5 px-3 text-xs">Schedule Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
