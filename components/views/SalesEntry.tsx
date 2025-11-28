
import React, { useState, useMemo } from 'react';
import { MenuItem, SaleEntry } from '../../types';
import { Card } from '../ui/Card';
import { Calendar, Plus, ShoppingBag, Trash2, Edit2, X, Save } from 'lucide-react';
import { formatCurrency, generateId } from '../../utils/format';

interface SalesEntryProps {
  sales: SaleEntry[];
  menuItems: MenuItem[];
  onSave: (sale: SaleEntry) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const SalesEntry: React.FC<SalesEntryProps> = ({ sales, menuItems, onSave, onDelete }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedItem = useMemo(() => menuItems.find(i => i.id === selectedItemId), [selectedItemId, menuItems]);
  const displayedSales = useMemo(() => sales.filter(s => s.date === date).sort((a,b) => b.id.localeCompare(a.id)), [sales, date]);
  const todaysTotals = useMemo(() => displayedSales.reduce((acc, curr) => ({
      amount: acc.amount + curr.totalAmount,
      myShare: acc.myShare + curr.totalMyShare,
      sheroShare: acc.sheroShare + curr.totalSheroShare
    }), { amount: 0, myShare: 0, sheroShare: 0 }), [displayedSales]);

  const resetForm = () => {
    setEditingId(null);
    setSelectedItemId('');
    setQuantity('1');
    setNotes('');
  };

  const handleEdit = (sale: SaleEntry) => {
    setEditingId(sale.id);
    setDate(sale.date);
    setSelectedItemId(sale.menuItemId);
    setQuantity(sale.quantity.toString());
    setNotes(sale.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !date) return;
    
    const qty = parseInt(quantity) || 1;
    const saleData: SaleEntry = {
      id: editingId || generateId(),
      date,
      menuItemId: selectedItem.id,
      itemName: selectedItem.name,
      category: selectedItem.category,
      quantity: qty,
      unitPrice: selectedItem.price,
      unitMyShare: selectedItem.myShare,
      unitSheroShare: selectedItem.sheroShare,
      totalAmount: selectedItem.price * qty,
      totalMyShare: selectedItem.myShare * qty,
      totalSheroShare: selectedItem.sheroShare * qty,
      notes
    };

    await onSave(saleData);
    if (!editingId) {
      setSelectedItemId('');
      setQuantity('1');
      setNotes('');
    } else {
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this order?')) {
      await onDelete(id);
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20 md:pb-0">
      <div className="xl:col-span-5 space-y-6">
        <Card title={editingId ? "Edit Order" : "Add Daily Orders"} action={editingId && <button onClick={resetForm} className="text-xs flex gap-1"><X size={14}/> Cancel</button>}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border rounded-xl bg-white text-stone-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Select Dish</label>
              <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} className="w-full p-3 border rounded-xl bg-white text-stone-900" required>
                <option value="">-- Choose Item --</option>
                {menuItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            {selectedItem && (
              <div className="bg-stone-50 p-4 rounded-xl text-sm space-y-2 border">
                 <div className="flex justify-between"><span className="text-stone-600">Price</span><span className="font-bold">{formatCurrency(selectedItem.price)}</span></div>
                 <div className="flex justify-between"><span className="text-emerald-700 font-bold">My Share</span><span className="font-bold text-emerald-700">{formatCurrency(selectedItem.myShare)}</span></div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
               <div><label className="block text-xs font-bold text-stone-600 uppercase mb-1">QTY</label><input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full p-3 border rounded-xl text-center text-xl bg-white text-stone-900" required /></div>
               <div className="col-span-2"><label className="block text-xs font-bold text-stone-600 uppercase mb-1">TOTAL MY SHARE</label><div className="w-full p-3 bg-white border-2 border-emerald-500 text-emerald-700 rounded-xl font-bold text-xl">{selectedItem ? formatCurrency(selectedItem.myShare * (parseInt(quantity)||1)) : formatCurrency(0)}</div></div>
            </div>
            <div><label className="block text-xs font-bold text-stone-600 uppercase mb-1">Notes</label><input value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 border rounded-xl bg-white text-stone-900" /></div>
            <button type="submit" disabled={!selectedItem} className={`w-full py-4 font-bold rounded-xl text-white ${editingId ? 'bg-stone-800' : 'bg-orange-600'}`}>{editingId ? 'Update Order' : 'ADD ORDER'}</button>
          </form>
        </Card>
      </div>
      <div className="xl:col-span-7 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border text-center"><div>Orders</div><div className="text-2xl font-bold">{displayedSales.length}</div></div>
          <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-100 text-center text-emerald-800"><div>My Share</div><div className="text-2xl font-bold">{formatCurrency(todaysTotals.myShare)}</div></div>
          <div className="bg-indigo-50 p-4 rounded-xl border-2 border-indigo-100 text-center text-indigo-800"><div>Shero Share</div><div className="text-2xl font-bold">{formatCurrency(todaysTotals.sheroShare)}</div></div>
        </div>
        <Card title={`Orders for ${date}`}>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
             {displayedSales.map(sale => (
               <div key={sale.id} className="bg-white border p-4 rounded-xl flex justify-between items-center">
                  <div>
                     <div className="font-bold text-lg">{sale.itemName} <span className="text-sm bg-stone-800 text-white px-2 rounded-full">x{sale.quantity}</span></div>
                     <div className="text-xs text-emerald-700 font-bold">My Share: {formatCurrency(sale.totalMyShare)}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                     <div className="font-bold text-lg mr-2">{formatCurrency(sale.totalAmount)}</div>
                     <button onClick={() => handleEdit(sale)} className="p-2 bg-stone-50 rounded hover:text-orange-600"><Edit2 size={16}/></button>
                     <button onClick={() => handleDelete(sale.id)} className="p-2 bg-stone-50 rounded hover:text-rose-600"><Trash2 size={16}/></button>
                  </div>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
