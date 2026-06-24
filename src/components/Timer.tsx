/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, Timer as TimerIcon } from 'lucide-react';
import { Course, Session } from '../types';

interface TimerProps {
  courses: Course[];
  sessions: Session[];
  streak: number;
  onSessionComplete: (courseId: number | null, courseName: string, minutes: number) => void;
}

export default function Timer({
  courses,
  sessions,
  streak,
  onSessionComplete
}: TimerProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [isBreak, setIsBreak] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [focusLength, setFocusLength] = useState(25); // In minutes
  const [breakLength, setBreakLength] = useState(5);  // In minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);  // In seconds
  const [totalLength, setTotalLength] = useState(25 * 60);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset timer when presets change and timer is NOT active
    if (!isActive) {
      const length = isBreak ? breakLength : focusLength;
      setTimeLeft(length * 60);
      setTotalLength(length * 60);
    }
  }, [focusLength, breakLength, isBreak]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            handleCycleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleCycleComplete = () => {
    if (!isBreak) {
      // Completed focus cycle!
      const currentCourse = courses.find(c => c.id === Number(selectedCourseId));
      const cName = currentCourse ? currentCourse.name : "General Study";
      const cId = currentCourse ? currentCourse.id : null;
      
      onSessionComplete(cId, cName, focusLength);
      
      // Auto-switch to Break
      setIsBreak(true);
      setTimeLeft(breakLength * 60);
      setTotalLength(breakLength * 60);
    } else {
      // Completed break cycle!
      setIsBreak(false);
      setTimeLeft(focusLength * 60);
      setTotalLength(focusLength * 60);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(focusLength * 60);
    setTotalLength(focusLength * 60);
  };

  const skipPhase = () => {
    setIsActive(false);
    if (!isBreak) {
      // Skip focus but record it if they worked more than half of it (optional, let's keep simple)
      setIsBreak(true);
      setTimeLeft(breakLength * 60);
      setTotalLength(breakLength * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(focusLength * 60);
      setTotalLength(focusLength * 60);
    }
  };

  const setPreset = (focus: number, breakLen: number) => {
    if (isActive) return;
    setFocusLength(focus);
    setBreakLength(breakLen);
    setIsBreak(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Circular progress calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - timeLeft / totalLength);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Central Timer Box */}
      <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center justify-center relative">
        <div className="w-[220px] h-[220px] relative mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background ring */}
            <circle
              className="stroke-[var(--surface-active)]"
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              strokeWidth="10"
            />
            {/* Foreground progress */}
            <circle
              className="stroke-[var(--accent)] transition-all duration-300"
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="serif text-4xl font-semibold tracking-tight text-[var(--text)]">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] mt-1.5">
              {isBreak ? "Break" : "Focus"}
            </span>
          </div>
        </div>

        {/* Subject/Course Selection */}
        <div className="w-full max-w-[260px] mb-6">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] text-center mb-1.5">
            Subject focus
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value === "" ? "" : Number(e.target.value))}
            className="inp text-xs text-center justify-center"
          >
            <option value="">General Study Session</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.emoji} {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons Controls */}
        <div className="flex gap-3 mb-6 w-full max-w-[320px]">
          <button 
            onClick={resetTimer}
            className="btn btn-ghost flex-1 py-2 text-xs border-[var(--border-strong)] flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          
          <button 
            onClick={toggleTimer}
            className="btn btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isActive ? "Pause" : "Start"}</span>
          </button>

          <button 
            onClick={skipPhase}
            className="btn btn-ghost flex-1 py-2 text-xs border-[var(--border-strong)] flex items-center justify-center gap-1.5"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Skip</span>
          </button>
        </div>

        {/* Presets Tabs */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-6">
          {[
            { label: "25/5", focus: 25, b: 5 },
            { label: "50/10", focus: 50, b: 10 },
            { label: "15/3", focus: 15, b: 3 },
            { label: "90/20", focus: 90, b: 20 },
          ].map((preset) => {
            const isMatch = focusLength === preset.focus && breakLength === preset.b;
            return (
              <button
                key={preset.label}
                onClick={() => setPreset(preset.focus, preset.b)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
                  ${isMatch 
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm' 
                    : 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--muted-dark)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'}
                `}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* XP Quick stats */}
        <div className="grid grid-cols-3 gap-2 w-full border-t border-[var(--border)] pt-6 text-center">
          <div>
            <div className="serif text-xl font-medium text-[var(--accent)]">{sessions.length}</div>
            <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Completed</div>
          </div>
          <div className="border-x border-[var(--border)]">
            <div className="serif text-xl font-medium text-emerald-500">
              {sessions.reduce((acc, curr) => acc + curr.dur, 0)}
            </div>
            <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Minutes</div>
          </div>
          <div>
            <div className="serif text-xl font-medium text-amber-500">🔥 {streak}</div>
            <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Completed Logs Panel */}
      <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col h-[520px]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <h3 className="serif text-base font-semibold text-[var(--text)] flex items-center gap-2">
            <TimerIcon className="w-4 h-4 text-[var(--accent)]" />
            <span>Session Logs</span>
          </h3>
          <span className="text-xs text-[var(--muted)]">{sessions.length} sessions logged</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)] pr-1">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[var(--muted)]">
              <span className="text-3xl mb-2">⏱️</span>
              <p className="text-xs font-medium">No studied periods logged yet</p>
              <p className="text-[11px] text-[var(--muted-dark)] max-w-[200px] mt-1">Complete a focus timer session to log automatic academic hours</p>
            </div>
          ) : (
            sessions.map((sess) => (
              <div key={sess.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${sess.color}15`, color: sess.color }}
                  >
                    {sess.emoji}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text)]">{sess.subj}</div>
                    <div className="text-[10px] text-[var(--muted)]">{sess.date} · {sess.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[var(--accent)]">+{sess.dur * 1} min</div>
                  <div className="text-[10px] text-[var(--muted)]">{sess.dur}m focus</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
