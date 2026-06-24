/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  AlertCircle,
  Calendar,
  Briefcase,
  GraduationCap,
  User,
  Clock
} from 'lucide-react';
import { TodoTask } from '../types';

interface TodoTabProps {
  todos: TodoTask[];
  onAddTodo: (todo: Omit<TodoTask, 'id' | 'done'>) => void;
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
}

export default function TodoTab({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo
}: TodoTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all'); // all, shortterm, longterm, personal, work, college
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Form states
  const [name, setName] = useState("");
  const [cat, setCat] = useState<TodoTask['cat']>('college');
  const [term, setTerm] = useState<TodoTask['term']>('shortterm');
  const [pri, setPri] = useState<TodoTask['pri']>('med');
  const [due, setDue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTodo({
      name,
      cat,
      term,
      pri,
      due: due || undefined
    });

    // Reset
    setName("");
    setCat("college");
    setTerm("shortterm");
    setPri("med");
    setDue("");
    setShowAddForm(false);
  };

  const getCatIcon = (category: string) => {
    switch(category) {
      case 'personal': return <User className="w-3.5 h-3.5 text-sky-500" />;
      case 'work': return <Briefcase className="w-3.5 h-3.5 text-amber-500" />;
      case 'college': return <GraduationCap className="w-3.5 h-3.5 text-purple-500" />;
      default: return <Clock className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getPriorityBadgeColor = (prio: string) => {
    switch(prio) {
      case 'high': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'med': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-[var(--muted-dark)] border-gray-500/20';
    }
  };

  // Multiple filter conditions
  let filteredTodos = todos;

  // Filter 1: Completion Status
  if (statusFilter === 'pending') {
    filteredTodos = filteredTodos.filter(t => !t.done);
  } else if (statusFilter === 'completed') {
    filteredTodos = filteredTodos.filter(t => t.done);
  }

  // Filter 2: Category / Term Scope
  if (filterType === 'shortterm') {
    filteredTodos = filteredTodos.filter(t => t.term === 'shortterm');
  } else if (filterType === 'longterm') {
    filteredTodos = filteredTodos.filter(t => t.term === 'longterm');
  } else if (filterType === 'personal') {
    filteredTodos = filteredTodos.filter(t => t.cat === 'personal');
  } else if (filterType === 'work') {
    filteredTodos = filteredTodos.filter(t => t.cat === 'work');
  } else if (filterType === 'college') {
    filteredTodos = filteredTodos.filter(t => t.cat === 'college');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-2xl font-bold text-[var(--text)]">Task Planner</h2>
          <p className="text-xs text-[var(--muted)]">Organize your priorities across Personal, Work, and College scopes</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary self-start sm:self-center flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Priority Task</span>
        </button>
      </div>

      {/* Add Task Form Block */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-lg space-y-4 max-w-xl">
          <h3 className="serif text-base font-semibold text-[var(--text)]">Create Academic or Life Task</h3>

          <div className="form-group">
            <label className="form-label">Task description</label>
            <input
              type="text"
              placeholder="e.g. Read chapters 4 and 5 of Operating Systems standard manual"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="inp text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Classification / Scope</label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as any)}
                className="inp text-xs"
              >
                <option value="college">🎓 Academic / College</option>
                <option value="work">💼 Career / Work</option>
                <option value="personal">👤 Personal development</option>
                <option value="other">📦 General / Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Term Duration</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as any)}
                className="inp text-xs"
              >
                <option value="shortterm">⚡ Short-term (Immediate priorities)</option>
                <option value="longterm">🎯 Long-term (Weekly or monthly milestones)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                value={pri}
                onChange={(e) => setPri(e.target.value as any)}
                className="inp text-xs"
              >
                <option value="high">🔴 High priority</option>
                <option value="med">🟡 Medium priority</option>
                <option value="low">🟢 Low priority</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="inp text-xs"
              />
            </div>
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
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Control Filters Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        {/* Type / Term Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'shortterm', label: '⚡ Short-term' },
            { id: 'longterm', label: '🎯 Long-term' },
            { id: 'college', label: '🎓 College' },
            { id: 'work', label: '💼 Work' },
            { id: 'personal', label: '👤 Personal' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
                ${filterType === f.id 
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs' 
                  : 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--muted-dark)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'}
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Completion Status Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs shrink-0 self-end md:self-auto">
          <span className="text-[var(--muted-dark)] font-medium">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="inp py-1 px-3 w-[120px] text-xs cursor-pointer"
          >
            <option value="all">📁 All Items</option>
            <option value="pending">⏳ Pending</option>
            <option value="completed">✅ Done</option>
          </select>
        </div>
      </div>

      {/* Tasks Listing Grid */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 divide-y divide-[var(--border)]">
        {filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--muted)]">
            <span className="text-4xl mb-2">☑</span>
            <p className="text-sm font-semibold">No tasks listed under this filter</p>
            <p className="text-xs text-[var(--muted-dark)] max-w-xs mt-1">Excellent! Write standard objectives down and schedule deadlines to stay organized</p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div 
              key={todo.id}
              className={`
                py-4 flex items-start gap-3 justify-between transition-all duration-150
                ${todo.done ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button 
                  onClick={() => onToggleTodo(todo.id)}
                  className="mt-0.5 shrink-0 hover:scale-105 active:scale-95 transition-transform"
                >
                  {todo.done ? (
                    <div className="w-[18px] h-[18px] rounded bg-[var(--accent)] text-white flex items-center justify-center font-bold text-[10px]">
                      ✓
                    </div>
                  ) : (
                    <div className="w-[18px] h-[18px] rounded border border-[var(--border-strong)] hover:border-[var(--accent)] bg-[var(--surface)]" />
                  )}
                </button>

                <div className="min-w-0">
                  <p className={`
                    text-xs font-semibold text-[var(--text)] leading-relaxed truncate-3-lines
                    ${todo.done ? 'line-through text-[var(--muted)]' : ''}
                  `}>
                    {todo.name}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-[var(--muted)]">
                    <span className="flex items-center gap-1">
                      {getCatIcon(todo.cat)}
                      <span className="font-semibold uppercase tracking-wider">{todo.cat}</span>
                    </span>
                    <span>·</span>
                    <span className="font-semibold uppercase tracking-wider">{todo.term === 'longterm' ? '🎯 Long-term' : '⚡ Short-term'}</span>
                    {todo.due && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due {todo.due}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getPriorityBadgeColor(todo.pri)}`}>
                  {todo.pri}
                </span>
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="text-rose-500 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-500/10 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
