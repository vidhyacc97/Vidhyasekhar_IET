
import React, { useState, useMemo } from 'react';
import { ExpenseEntry } from '../../types';
import { Card } from '../ui/Card';
import { Calendar, Plus, Trash2, Wallet, Edit2, Save, X, Info } from 'lucide-react';
import { formatCurrency, generateId } from '../../utils/format';
import { EXPENSE_CATEGORIES } from '../../constants';

interface ExpensesProps {
  expenses: ExpenseEntry[];
  onSave: (exp: ExpenseEntry) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const Expenses: React.FC<ExpensesProps> = ({ expenses, onSave, onDelete }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('daily');
  const [editingId, setEditingId] = useState<string | null>(null);

  const todaysTotal = expenses.filter(e => e.date === new Date().toISOString().split('T')[0]).reduce((sum, e) => sum + e.amount, 0);

  // Grouping Logic... (Reusing existing logic for brevity)
  const getWeekStart = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const monthlyData = useMemo(() => {
    const grouped: Record<string, any> = {};
    expenses.forEach(e => {
      const k = e.date.substring(0, 7);
      if(!grouped[k]) grouped[k] = { total: 0, count: 0 };
      grouped[k].total += e.amount;
      grouped[k].count++;
    });
    return Object.entries(grouped).sort((a,b)=>b[0].localeCompare(a[0])).map(([k,v]) => ({ id: k, label: k, ...v }));
  }, [expenses]);

  const weeklyData = useMemo(() => {
    const grouped: Record<string, any> = {};
    expenses.forEach(e => {
      const k = getWeekStart(e.date);
      if(!grouped[k]) grouped[k] = { total: 0, count: 0 };
      grouped[k].total += e.amount;
      grouped[k].count++;
    });
    return Object.entries(grouped).sort((a,b)=>b[0].localeCompare(a[0])).map(([k,v]) => ({ id: k, label: k, ...v }));
  }, [expenses]);

  const dailyList = useMemo(() => [...expenses].sort((a,b) => b.date.localeCompare(a.date)), [expenses]);
  const activeData = viewMode === 'monthly' ? monthlyData : weeklyData;

  const resetForm = () => {
    setEditingId(null);
    setAmount('');
    setNotes('');
    setCategory(EXPENSE_CATEGORIES[0]);
  };

  const handleEdit = (exp: ExpenseEntry) => {
    setEditingId(exp.id);
    setDate(exp.date);
    setCategory(exp.category);
    setAmount(exp.amount.toString());
    setNotes(exp.notes || '');
    setViewMode('daily');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    const exp: ExpenseEntry = {
      id: editingId || generateId(),
      date,
      category,
      amount: parseFloat(amount),
      notes
    };
    await onSave(exp);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this expense?')) {
      await onDelete(id);
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20 md:pb-0">
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl shadow-sm">
           <div className="text-rose-900 font-bold uppercase text-xs">Today's Spend</div>
           <div className="text-3xl font-bold text-rose-700">{formatCurrency(todaysTotal)}</div>
        </div>
        <Card title={editingId ? "Edit Expense" : "Log New Expense"} action={editingId && <button onClick={resetForm} className="text-xs flex gap-1"><X size={14}/> Cancel</button>}>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div><label className="text-xs font-bold text-stone-500 uppercase">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border rounded-xl bg-stone-50" /></div>
             <div><label className="text-xs font-bold text-stone-500 uppercase">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border rounded-xl bg-white">{EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
             <div><label className="text-xs font-bold text-stone-500 uppercase">Amount</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 border rounded-xl font-bold text-lg" placeholder="0.00" required /></div>
             <div><label className="text-xs font-bold text-stone-500 uppercase">Notes</label><input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Vendor etc." /></div>
             <button type="submit" className={`w-full py-4 font-bold rounded-xl text-white ${editingId ? 'bg-stone-800' : 'bg-rose-600'}`}>{editingId ? 'Update Expense' : 'Add Expense'}</button>
           </form>
        </Card>
      </div>
      <div className="xl:col-span-8 space-y-6">
        <Card title={viewMode === 'daily' ? 'Transactions' : 'Summary'} action={
          <div className="flex bg-stone-100 rounded p-1">
             {['monthly', 'weekly', 'daily'].map(m => (
               <button key={m} onClick={() => setViewMode(m as any)} className={`px-3 py-1 text-xs uppercase font-bold rounded ${viewMode === m ? 'bg-white shadow' : 'text-stone-500'}`}>{m}</button>
             ))}
          </div>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-stone-50 border-b">
                 <tr>
                    <th className="px-4 py-3">{viewMode === 'daily' ? 'Date' : 'Period'}</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                  {viewMode === 'daily' ? dailyList.map(e => (
                     <tr key={e.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3">{e.date}</td>
                        <td className="px-4 py-3">
                           <div className="font-bold">{e.category}</div>
                           <div className="text-xs text-stone-400">{e.notes}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-rose-700">{formatCurrency(e.amount)}</td>
                        <td className="px-4 py-3 text-right">
                           <button onClick={() => handleEdit(e)} className="p-1 hover:text-orange-500"><Edit2 size={14}/></button>
                           <button onClick={() => handleDelete(e.id)} className="p-1 hover:text-rose-500 ml-2"><Trash2 size={14}/></button>
                        </td>
                     </tr>
                  )) : activeData.map((d: any) => (
                     <tr key={d.id}>
                        <td className="px-4 py-3 font-bold">{d.label}</td>
                        <td className="px-4 py-3">{d.count} transactions</td>
                        <td className="px-4 py-3 text-right font-bold text-rose-700">{formatCurrency(d.total)}</td>
                        <td></td>
                     </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
