
import React, { useState, useRef, useEffect } from 'react';
import { MenuItem } from '../../types';
import { Card } from '../ui/Card';
import { Plus, Edit2, Trash2, Search, Save, X, Utensils, FileSpreadsheet, Download, Clipboard, AlertCircle, ListPlus } from 'lucide-react';
import { formatCurrency, generateId } from '../../utils/format';
import { MENU_CATEGORIES } from '../../constants';

interface MenuManagerProps {
  menuItems: MenuItem[];
  onSave: (item: MenuItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBulkAdd: (items: MenuItem[]) => Promise<void>;
}

interface BulkItem {
  id: string; 
  name: string;
  category: string;
  price: string;
  myShare: string;
  sheroShare: string;
}

export const MenuManager: React.FC<MenuManagerProps> = ({ menuItems, onSave, onDelete, onBulkAdd }) => {
  const [mode, setMode] = useState<'list' | 'edit' | 'bulk'>('list');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [libReady, setLibReady] = useState(false);

  // Single Edit
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [myShare, setMyShare] = useState('');
  const [sheroShare, setSheroShare] = useState('');

  // Bulk
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkLib = () => {
      if (window.XLSX) setLibReady(true);
      else setTimeout(checkLib, 500);
    };
    checkLib();
  }, []);

  // ----------------------------------------------------------------
  // SINGLE EDIT
  // ----------------------------------------------------------------
  const handlePriceChange = (val: string) => {
    setPrice(val);
    const p = parseFloat(val);
    const m = parseFloat(myShare);
    if (!isNaN(p) && !isNaN(m)) setSheroShare((p - m).toFixed(2));
  };

  const handleMyShareChange = (val: string) => {
    setMyShare(val);
    const p = parseFloat(price);
    const m = parseFloat(val);
    if (!isNaN(p) && !isNaN(m)) setSheroShare((p - m).toFixed(2));
  };

  const resetForm = () => {
    setMode('list');
    setCurrentId(null);
    setName('');
    setCategory('');
    setPrice('');
    setMyShare('');
    setSheroShare('');
    setBulkItems([]);
  };

  const handleEdit = (item: MenuItem) => {
    setMode('edit');
    setCurrentId(item.id);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setMyShare(item.myShare.toString());
    setSheroShare(item.sheroShare.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this item?")) {
      await onDelete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !myShare) return;

    const newItem: MenuItem = {
      id: currentId || generateId(),
      name,
      category: category || 'Main Course',
      price: parseFloat(price),
      myShare: parseFloat(myShare),
      sheroShare: parseFloat(sheroShare) || (parseFloat(price) - parseFloat(myShare))
    };

    await onSave(newItem);
    resetForm();
  };

  // ----------------------------------------------------------------
  // BULK & EXCEL (Simplified for brevity as logic is same as before but calling onBulkAdd)
  // ----------------------------------------------------------------
  
  const initBulkMode = () => {
    setMode('bulk');
    setBulkItems([
      { id: '1', name: '', category: '', price: '', myShare: '', sheroShare: '' },
      { id: '2', name: '', category: '', price: '', myShare: '', sheroShare: '' },
      { id: '3', name: '', category: '', price: '', myShare: '', sheroShare: '' }
    ]);
  };

  const addBulkRow = () => {
     setBulkItems(prev => [...prev, { id: Math.random().toString(), name: '', category: '', price: '', myShare: '', sheroShare: '' }]);
  };

  const updateBulkItem = (id: string, field: keyof BulkItem, value: string) => {
    setBulkItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'price' || field === 'myShare') {
          const p = parseFloat(field === 'price' ? value : item.price);
          const m = parseFloat(field === 'myShare' ? value : item.myShare);
          if (!isNaN(p) && !isNaN(m)) updated.sheroShare = (p - m).toFixed(2);
        }
        return updated;
      }
      return item;
    }));
  };

  const handlePaste = (e: React.ClipboardEvent, rowIndex: number, field: keyof BulkItem) => {
     const clipboardData = e.clipboardData.getData('text');
     if (!clipboardData) return;
     if (clipboardData.includes('\t') || clipboardData.includes('\n')) {
       e.preventDefault();
       const rows = clipboardData.split(/\r\n|\n|\r/).filter(row => row.trim() !== '');
       const colOrder: (keyof BulkItem)[] = ['name', 'category', 'price', 'myShare', 'sheroShare'];
       const startColIdx = colOrder.indexOf(field);
       if (startColIdx === -1) return;

       setBulkItems(prev => {
         const newItems = [...prev];
         rows.forEach((rowStr, rIdx) => {
           const targetRowIdx = rowIndex + rIdx;
           if (!newItems[targetRowIdx]) {
              newItems[targetRowIdx] = { id: Math.random().toString(), name: '', category: '', price: '', myShare: '', sheroShare: '' };
           }
           const cells = rowStr.split('\t');
           cells.forEach((cell, cIdx) => {
             const tCol = startColIdx + cIdx;
             if (tCol < colOrder.length) newItems[targetRowIdx] = { ...newItems[targetRowIdx], [colOrder[tCol]]: cell.trim() };
           });
           // Re-calc
           const p = parseFloat(newItems[targetRowIdx].price);
           const m = parseFloat(newItems[targetRowIdx].myShare);
           if (!isNaN(p) && !isNaN(m)) newItems[targetRowIdx].sheroShare = (p - m).toFixed(2);
         });
         return newItems;
       });
     }
  };

  const saveBulkItems = async () => {
    const validItems = bulkItems.filter(i => i.name.trim() !== '' && i.price !== '');
    if (validItems.length === 0) return alert("No valid items");
    
    const newMenuItems: MenuItem[] = validItems.map(i => ({
      id: generateId(),
      name: i.name,
      category: i.category || 'Main Course',
      price: parseFloat(i.price),
      myShare: parseFloat(i.myShare),
      sheroShare: parseFloat(i.sheroShare) || 0
    }));
    await onBulkAdd(newMenuItems);
    resetForm();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !window.XLSX) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = window.XLSX.read(evt.target?.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(ws);
        const newItems: MenuItem[] = [];
        jsonData.forEach((row: any) => {
           // Basic mapping logic
           const name = row['Name'] || row['Dish Name'];
           const price = parseFloat(row['Price'] || row['Amount'] || 0);
           const myShare = parseFloat(row['My Share'] || 0);
           if (name && price) {
             newItems.push({
               id: generateId(),
               name: name,
               category: row['Category'] || 'Main Course',
               price,
               myShare: myShare || price,
               sheroShare: (row['Shero Share'] || (price - myShare) || 0)
             });
           }
        });
        if (newItems.length > 0 && window.confirm(`Add ${newItems.length} items?`)) {
          await onBulkAdd(newItems);
        }
      } catch (err) { alert("Error reading file"); }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredItems = menuItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
            <Utensils className="text-orange-500" /> Master Menu
          </h2>
        </div>
        
        {mode === 'list' && (
          <div className="flex gap-2 flex-wrap">
            <input type="file" accept=".xlsx" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={!libReady} className="px-3 py-2 bg-stone-100 rounded-lg text-sm flex gap-2"><FileSpreadsheet size={16}/> Import</button>
            <button onClick={initBulkMode} className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm flex gap-2"><ListPlus size={16} /> Bulk Add</button>
            <button onClick={() => setMode('edit')} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2"><Plus size={16} /> Add Dish</button>
          </div>
        )}
      </div>

      {mode === 'edit' && (
        <Card title={currentId ? "Edit Dish" : "Add New Dish"} className="border-l-4 border-l-orange-500">
           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dish Name" className="p-2 border rounded bg-white" required />
                 <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (e.g. Main Course)" className="p-2 border rounded bg-white" />
              </div>
              <div className="grid grid-cols-3 gap-4 bg-stone-50 p-4 rounded-xl">
                 <div><label className="text-xs">Price</label><input type="number" value={price} onChange={e => handlePriceChange(e.target.value)} className="w-full p-2 border rounded bg-white" required /></div>
                 <div><label className="text-xs text-emerald-700">My Share</label><input type="number" value={myShare} onChange={e => handleMyShareChange(e.target.value)} className="w-full p-2 border border-emerald-300 rounded bg-white text-emerald-800 font-bold" required /></div>
                 <div><label className="text-xs text-indigo-700">Shero Share</label><input type="number" value={sheroShare} onChange={e => setSheroShare(e.target.value)} className="w-full p-2 border border-indigo-300 rounded bg-white text-indigo-800 font-bold" required /></div>
              </div>
              <div className="flex gap-3">
                 <button type="submit" className="flex-1 bg-orange-600 text-white py-2 rounded font-bold">Save</button>
                 <button type="button" onClick={resetForm} className="px-4 border rounded">Cancel</button>
              </div>
           </form>
        </Card>
      )}

      {mode === 'bulk' && (
         <Card title="Bulk Add" className="overflow-x-auto">
            <div className="min-w-[700px]">
               <div className="bg-blue-50 text-blue-800 p-2 text-xs mb-4">Paste data from Excel (Name, Category, Price, My Share) into the first cell.</div>
               {bulkItems.map((item, i) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 mb-2">
                     <div className="col-span-4"><input value={item.name} onChange={e => updateBulkItem(item.id, 'name', e.target.value)} onPaste={e => handlePaste(e, i, 'name')} placeholder="Name" className="w-full p-2 border rounded bg-white" /></div>
                     <div className="col-span-2"><input value={item.category} onChange={e => updateBulkItem(item.id, 'category', e.target.value)} onPaste={e => handlePaste(e, i, 'category')} placeholder="Category" className="w-full p-2 border rounded bg-white" /></div>
                     <div className="col-span-2"><input value={item.price} onChange={e => updateBulkItem(item.id, 'price', e.target.value)} onPaste={e => handlePaste(e, i, 'price')} placeholder="Price" className="w-full p-2 border rounded bg-white" /></div>
                     <div className="col-span-2"><input value={item.myShare} onChange={e => updateBulkItem(item.id, 'myShare', e.target.value)} onPaste={e => handlePaste(e, i, 'myShare')} placeholder="Share" className="w-full p-2 border border-emerald-300 rounded bg-white text-emerald-800" /></div>
                     <div className="col-span-2"><input value={item.sheroShare} onChange={e => updateBulkItem(item.id, 'sheroShare', e.target.value)} placeholder="Comm" className="w-full p-2 border border-indigo-300 rounded bg-white text-indigo-800" /></div>
                  </div>
               ))}
               <div className="flex gap-3 mt-4">
                  <button onClick={addBulkRow} className="px-4 py-2 bg-stone-100 rounded text-sm"><Plus size={14}/> Add Row</button>
                  <button onClick={saveBulkItems} className="ml-auto px-6 py-2 bg-stone-900 text-white rounded font-bold">Save All</button>
                  <button onClick={resetForm} className="px-4 py-2 border rounded">Cancel</button>
               </div>
            </div>
         </Card>
      )}

      {/* LIST */}
      <div className="relative">
         <Search className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
         <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl" placeholder="Search..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filteredItems.map(item => (
            <div key={item.id} className="bg-white border p-4 rounded-xl shadow-sm group relative">
               <div className="font-bold text-lg mb-1">{item.name}</div>
               <div className="text-xs bg-stone-100 inline-block px-2 py-1 rounded">{item.category}</div>
               <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                  <div className="bg-stone-50 p-2 rounded"><div>Price</div><div className="font-bold">{formatCurrency(item.price)}</div></div>
                  <div className="bg-emerald-50 p-2 rounded text-emerald-800"><div>My Share</div><div className="font-bold">{formatCurrency(item.myShare)}</div></div>
                  <div className="bg-indigo-50 p-2 rounded text-indigo-800"><div>Partner</div><div className="font-bold">{formatCurrency(item.sheroShare)}</div></div>
               </div>
               <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border p-1 rounded">
                  <button onClick={() => handleEdit(item)} className="p-1 hover:text-orange-500"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-rose-500"><Trash2 size={16}/></button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};
