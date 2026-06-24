/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CircleDollarSign, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  Utensils, 
  Bus, 
  BookOpen, 
  Clapperboard, 
  Home, 
  HeartPulse, 
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { FinanceTransaction } from '../types';

interface FinanceTabProps {
  transactions: FinanceTransaction[];
  budget: number;
  savings: number;
  onAddTransaction: (txn: Omit<FinanceTransaction, 'id' | 'date'>) => void;
  onDeleteTransaction: (id: number) => void;
  onUpdateBudget: (amt: number) => void;
  onUpdateSavings: (amt: number) => void;
}

const CAT_EMOJIS: Record<string, string> = {
  Food: '🍜',
  Transport: '🚌',
  Books: '📚',
  Entertainment: '🎬',
  Health: '💊',
  Clothing: '👕',
  Rent: '🏠',
  Allowance: '💵',
  Other: '📦'
};

export default function FinanceTab({
  transactions,
  budget,
  savings,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateBudget,
  onUpdateSavings
}: FinanceTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form inputs
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [cat, setCat] = useState("Food");

  const [localBudget, setLocalBudget] = useState(budget);
  const [localSavings, setLocalSavings] = useState(savings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amt);
    if (!desc.trim() || isNaN(amountVal)) return;
    
    onAddTransaction({
      desc,
      amt: amountVal,
      type,
      cat
    });

    setDesc("");
    setAmt("");
    setCat("Food");
    setShowAddForm(false);
  };

  const handleUpdateBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBudget(localBudget);
  };

  const handleUpdateSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSavings(localSavings);
  };

  // Calculations for current month expenses
  const expenseTotal = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amt, 0);

  const incomeTotal = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amt, 0);

  const remainingBudget = Math.max(0, budget - expenseTotal);
  const spentPct = budget > 0 ? Math.min(100, Math.round((expenseTotal / budget) * 100)) : 0;

  // Categorical aggregation
  const catExpenses: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach((t) => {
      catExpenses[t.cat] = (catExpenses[t.cat] || 0) + t.amt;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-2xl font-bold text-[var(--text)]">Financial Ledger</h2>
          <p className="text-xs text-[var(--muted)]">Manage student expenditures, allocate monthly budgets, and track scholarship savings</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary self-start sm:self-center flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Grid: Financial KPI widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
          <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Monthly Budget</div>
          <div className="serif text-xl font-semibold text-[var(--text)]">₹{budget.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
          <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Total Expenses</div>
          <div className="serif text-xl font-semibold text-rose-500">₹{expenseTotal.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Remaining Cash</div>
          <div className="serif text-xl font-semibold text-emerald-500">₹{remainingBudget.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
          <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">Bank Savings</div>
          <div className="serif text-xl font-semibold text-purple-500">₹{savings.toLocaleString()}</div>
        </div>
      </div>

      {/* Grid: Form configurations, Categories & Transactions list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Setup Budget, Category progress */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Configure Panel */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h3 className="serif text-sm font-semibold text-[var(--text)] border-b border-[var(--border)] pb-2">Allocations Setup</h3>
            
            <form onSubmit={handleUpdateBudgetSubmit} className="flex items-end gap-2 text-xs">
              <div className="flex-1">
                <label className="form-label">Monthly Limit (₹)</label>
                <input 
                  type="number"
                  value={localBudget}
                  onChange={(e) => setLocalBudget(Number(e.target.value))}
                  className="inp text-xs"
                />
              </div>
              <button type="submit" className="btn btn-ghost border-[var(--border-strong)] py-2 text-xs">Save</button>
            </form>

            <form onSubmit={handleUpdateSavingsSubmit} className="flex items-end gap-2 text-xs">
              <div className="flex-1">
                <label className="form-label">Current Savings (₹)</label>
                <input 
                  type="number"
                  value={localSavings}
                  onChange={(e) => setLocalSavings(Number(e.target.value))}
                  className="inp text-xs"
                />
              </div>
              <button type="submit" className="btn btn-ghost border-[var(--border-strong)] py-2 text-xs">Save</button>
            </form>
          </div>

          {/* Budget Limit Progress & Category Split */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h3 className="serif text-sm font-semibold text-[var(--text)] border-b border-[var(--border)] pb-2">Budget split & warnings</h3>
            
            <div>
              <div className="flex justify-between items-center text-xs text-[var(--muted-dark)] font-semibold mb-1">
                <span>Budget Consumed</span>
                <span>{spentPct}%</span>
              </div>
              <div className="prog h7">
                <div 
                  className={`prog-fill ${spentPct > 85 ? 'bg-rose-500' : spentPct > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${spentPct}%` }}
                />
              </div>
              {spentPct > 85 && (
                <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-semibold mt-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Warning: Approaching monthly budget threshold limits!</span>
                </div>
              )}
            </div>

            {/* Category Expenses Bars */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Expenses By Category</span>
              {Object.keys(catExpenses).length === 0 ? (
                <div className="text-center py-4 text-xs text-[var(--muted)]">No category expenses yet</div>
              ) : (
                Object.entries(catExpenses).map(([c, amtVal]) => {
                  const pct = Math.min(100, Math.round((amtVal / budget) * 100));
                  return (
                    <div key={c} className="space-y-1">
                      <div className="flex justify-between text-xs text-[var(--text)]">
                        <span className="font-medium">{CAT_EMOJIS[c] || '📦'} {c}</span>
                        <span className="font-semibold text-rose-500">₹{amtVal.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="prog h3">
                        <div className="prog-fill bg-rose-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Ledger transactions history */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col h-[480px]">
          <h3 className="serif text-base font-semibold text-[var(--text)] pb-3 border-b border-[var(--border)] mb-4 flex items-center gap-2 shrink-0">
            <Wallet className="w-4.5 h-4.5 text-[var(--accent)]" />
            <span>Ledger History</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-[var(--muted)]">
                <CircleDollarSign className="w-10 h-10 mb-2 text-emerald-500" />
                <p className="text-xs font-semibold">Ledger is empty</p>
                <p className="text-[10px] text-[var(--muted-dark)]">Record custom transactions and incomes to monitor budget splits</p>
              </div>
            ) : (
              transactions.map((t) => {
                const isIncome = t.type === 'income';
                return (
                  <div key={t.id} className="txn-row">
                    <div className={`txn-ico ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[var(--text)] truncate">{t.desc}</h4>
                      <p className="text-[10px] text-[var(--muted)] font-mono">{CAT_EMOJIS[t.cat]} {t.cat}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isIncome ? '+' : '-'}₹{t.amt.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => onDeleteTransaction(t.id)}
                        className="text-rose-500 p-1 rounded hover:bg-rose-500/10 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Add Transaction Overlay Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeUp">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="serif text-base font-semibold text-[var(--text)] mb-4">Record Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Transaction description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Lunch at cafeteria" 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="inp text-xs" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 150" 
                    value={amt}
                    onChange={(e) => setAmt(e.target.value)}
                    className="inp text-xs" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Operation Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="inp text-xs"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="inp text-xs"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Books</option>
                  <option>Entertainment</option>
                  <option>Health</option>
                  <option>Clothing</option>
                  <option>Rent</option>
                  <option>Allowance</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="btn btn-ghost py-1.5 px-3 text-xs border-[var(--border-strong)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary py-1.5 px-3 text-xs">Record Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
