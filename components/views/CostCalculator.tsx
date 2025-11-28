
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Calculator, Plus, Trash2, Scale, ChefHat, ArrowRight, Package, Flame, Utensils, Box, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface CalculatedItem {
  id: string;
  type: 'ingredient' | 'packaging' | 'utility';
  name: string;
  cost: number;
  details: string;
}

type CalculatorMode = 'ingredient' | 'packaging' | 'utility';

export const CostCalculator: React.FC = () => {
  const [items, setItems] = useState<CalculatedItem[]>([]);
  const [mode, setMode] = useState<CalculatorMode>('ingredient');
  
  // --------------------------------------------------------
  // SHARED INPUTS
  // --------------------------------------------------------
  const [itemName, setItemName] = useState('');
  
  // --------------------------------------------------------
  // INGREDIENT STATE
  // --------------------------------------------------------
  const [ingPrice, setIngPrice] = useState('');     // e.g. 100
  const [ingMarketWeight, setIngMarketWeight] = useState('1'); // e.g. 1
  const [ingMarketUnit, setIngMarketUnit] = useState<'kg'|'g'|'l'|'ml'>('kg'); // e.g. kg
  
  const [ingUsageAmount, setIngUsageAmount] = useState(''); // e.g. 2
  const [ingUsageUnit, setIngUsageUnit] = useState<'kg'|'g'|'l'|'ml'|'tbsp'|'tsp'|'cup'|'pcs'>('tbsp'); // e.g. tbsp

  // --------------------------------------------------------
  // PACKAGING STATE
  // --------------------------------------------------------
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgCount, setPkgCount] = useState(''); // e.g., 100 pcs in a pack
  const [pkgUsed, setPkgUsed] = useState('');   // e.g., 5 pcs used

  // --------------------------------------------------------
  // GAS / UTILITY STATE
  // --------------------------------------------------------
  const [utilPrice, setUtilPrice] = useState('');    // e.g., 1100 for cylinder
  const [utilDuration, setUtilDuration] = useState(''); // e.g., lasts 20 days
  const [utilUsed, setUtilUsed] = useState('1');      // e.g., used for 1 day

  // --------------------------------------------------------
  // CONVERSION LOGIC
  // --------------------------------------------------------
  const UNIT_MULTIPLIERS: Record<string, number> = {
    kg: 1000,
    g: 1,
    l: 1000,
    ml: 1,
    tbsp: 15, // approx g/ml
    tsp: 5,   // approx g/ml
    cup: 240, // approx g/ml
    pcs: 1
  };

  const calculateIngredientCost = () => {
    const price = parseFloat(ingPrice) || 0;
    const marketWeight = parseFloat(ingMarketWeight) || 1;
    const usage = parseFloat(ingUsageAmount) || 0;

    // Convert everything to base units (g or ml)
    const marketBase = marketWeight * UNIT_MULTIPLIERS[ingMarketUnit];
    const usageBase = usage * UNIT_MULTIPLIERS[ingUsageUnit];
    
    if (marketBase === 0) return 0;
    
    const pricePerBaseUnit = price / marketBase;
    return pricePerBaseUnit * usageBase;
  };

  const calculatePackagingCost = () => {
    const price = parseFloat(pkgPrice) || 0;
    const count = parseFloat(pkgCount) || 1;
    const used = parseFloat(pkgUsed) || 0;
    if (count === 0) return 0;
    return (price / count) * used;
  };

  const calculateUtilityCost = () => {
    const price = parseFloat(utilPrice) || 0;
    const duration = parseFloat(utilDuration) || 1;
    const used = parseFloat(utilUsed) || 0;
    if (duration === 0) return 0;
    return (price / duration) * used;
  };

  const getCurrentCost = () => {
    switch(mode) {
      case 'ingredient': return calculateIngredientCost();
      case 'packaging': return calculatePackagingCost();
      case 'utility': return calculateUtilityCost();
      default: return 0;
    }
  };

  const getDetailsString = () => {
    if (mode === 'ingredient') {
      const usageBase = (parseFloat(ingUsageAmount) || 0) * UNIT_MULTIPLIERS[ingUsageUnit];
      const marketBase = (parseFloat(ingMarketWeight) || 0) * UNIT_MULTIPLIERS[ingMarketUnit];
      return `${ingUsageAmount} ${ingUsageUnit} (≈${usageBase}g) from ${ingMarketWeight}${ingMarketUnit} pack`;
    }
    if (mode === 'packaging') {
      return `${pkgUsed} used from pack of ${pkgCount}`;
    }
    if (mode === 'utility') {
      return `${utilUsed} days used (Total life: ${utilDuration} days)`;
    }
    return '';
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = getCurrentCost();
    if (cost <= 0) return;

    const newItem: CalculatedItem = {
      id: Math.random().toString(36).substring(7),
      type: mode,
      name: itemName || (mode === 'ingredient' ? 'Unknown Ingredient' : mode === 'packaging' ? 'Box/Bag' : 'Gas/Utility'),
      cost: cost,
      details: getDetailsString()
    };

    setItems([...items, newItem]);
    
    // Reset specific fields but keep market prices for convenience if adding similar items
    setItemName('');
    if (mode === 'ingredient') setIngUsageAmount('');
    if (mode === 'packaging') setPkgUsed('');
    // if (mode === 'utility') // usually utility is added once
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
            <Calculator className="text-orange-500" /> Cost Calculator
          </h2>
          <p className="text-stone-500">Calculate exact cost per spoon, item, or day.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CALCULATOR INPUT AREA */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-0 overflow-hidden">
            {/* TABS */}
            <div className="flex border-b border-stone-200">
              <button 
                onClick={() => setMode('ingredient')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'ingredient' ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                <Utensils size={16} /> Ingredients
              </button>
              <button 
                onClick={() => setMode('packaging')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'packaging' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                <Box size={16} /> Packaging
              </button>
              <button 
                onClick={() => setMode('utility')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'utility' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-500' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                <Flame size={16} /> Utilities
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-6">
              
              {/* ITEM NAME */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder={mode === 'ingredient' ? "e.g. Toor Dal" : mode === 'packaging' ? "e.g. Plastic Container" : "e.g. Gas Cylinder"}
                  className="w-full p-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50"
                />
              </div>

              {/* MODE SPECIFIC INPUTS */}
              {mode === 'ingredient' && (
                <div className="space-y-6">
                  {/* Market Price Section */}
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                    <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                       <Scale size={16} /> Step 1: Market Price
                    </h4>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-stone-500">Price (₹)</label>
                        <input type="number" value={ingPrice} onChange={e => setIngPrice(e.target.value)} placeholder="100" className="w-full p-2 border rounded-lg" />
                      </div>
                      <div className="flex items-center pb-2 text-stone-400 font-bold">/</div>
                      <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-stone-500">Weight</label>
                        <input type="number" value={ingMarketWeight} onChange={e => setIngMarketWeight(e.target.value)} placeholder="1" className="w-full p-2 border rounded-lg" />
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-stone-500">Unit</label>
                        <select value={ingMarketUnit} onChange={e => setIngMarketUnit(e.target.value as any)} className="w-full p-2 border rounded-lg bg-white">
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="l">L</option>
                          <option value="ml">ml</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Usage Section */}
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                       <ChefHat size={16} /> Step 2: How much used?
                    </h4>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                         <label className="text-[10px] uppercase font-bold text-stone-500">Quantity</label>
                         <input type="number" value={ingUsageAmount} onChange={e => setIngUsageAmount(e.target.value)} placeholder="2" className="w-full p-2 border rounded-lg" />
                      </div>
                      <div className="flex-1">
                         <label className="text-[10px] uppercase font-bold text-stone-500">Measure</label>
                         <select value={ingUsageUnit} onChange={e => setIngUsageUnit(e.target.value as any)} className="w-full p-2 border rounded-lg bg-white">
                           <option value="tbsp">Tablespoon (approx 15g)</option>
                           <option value="tsp">Teaspoon (approx 5g)</option>
                           <option value="cup">Cup (approx 240g)</option>
                           <option value="g">Grams (g)</option>
                           <option value="ml">Milliliters (ml)</option>
                           <option value="kg">Kilograms (kg)</option>
                           <option value="l">Liters (L)</option>
                           <option value="pcs">Pieces</option>
                         </select>
                      </div>
                    </div>
                    {ingUsageAmount && (
                       <div className="mt-2 text-xs text-emerald-600 font-medium">
                         ≈ {parseFloat(ingUsageAmount) * UNIT_MULTIPLIERS[ingUsageUnit]} grams/ml used
                       </div>
                    )}
                  </div>
                </div>
              )}

              {mode === 'packaging' && (
                <div className="space-y-6">
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-800 mb-3">Bulk Purchase Info</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-500">Total Price</label>
                        <input type="number" value={pkgPrice} onChange={e => setPkgPrice(e.target.value)} placeholder="200" className="w-full p-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-500">Total Count</label>
                        <input type="number" value={pkgCount} onChange={e => setPkgCount(e.target.value)} placeholder="100" className="w-full p-2 border rounded-lg" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="text-sm font-bold text-emerald-800 mb-3">Usage</h4>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-500">Used Count</label>
                      <input type="number" value={pkgUsed} onChange={e => setPkgUsed(e.target.value)} placeholder="5" className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                </div>
              )}

              {mode === 'utility' && (
                <div className="space-y-6">
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                    <h4 className="text-sm font-bold text-purple-800 mb-3">Bill Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-500">Total Bill Cost</label>
                        <input type="number" value={utilPrice} onChange={e => setUtilPrice(e.target.value)} placeholder="1100" className="w-full p-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-500">Lasts For (Days)</label>
                        <input type="number" value={utilDuration} onChange={e => setUtilDuration(e.target.value)} placeholder="20" className="w-full p-2 border rounded-lg" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="text-sm font-bold text-emerald-800 mb-3">Current Usage</h4>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-500">Days for this batch</label>
                      <input type="number" value={utilUsed} onChange={e => setUtilUsed(e.target.value)} placeholder="1" className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                </div>
              )}

              {/* LIVE RESULT PREVIEW */}
              <div className="flex items-center justify-between bg-stone-900 text-white p-4 rounded-xl">
                 <div className="flex items-center gap-2">
                   <ArrowRight className="text-orange-500" />
                   <span className="font-medium text-sm text-stone-300">Calculated Cost</span>
                 </div>
                 <div className="text-2xl font-bold">
                   {formatCurrency(getCurrentCost())}
                 </div>
              </div>

              <button
                type="submit"
                disabled={getCurrentCost() <= 0}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} /> Add to List
              </button>
            </form>
          </Card>
        </div>

        {/* LIST & TOTAL */}
        <div className="lg:col-span-5">
           <Card title="Calculated Costs List" className="h-full">
             <div className="flex flex-col h-full">
               <div className="flex-1 space-y-3 mb-6">
                 {items.length === 0 ? (
                   <div className="text-center text-stone-400 py-10 text-sm">
                     List is empty. <br/> Use the calculator to add items.
                   </div>
                 ) : (
                   items.map(item => (
                     <div key={item.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg border border-stone-100 group">
                       <div>
                         <div className="flex items-center gap-2">
                           {item.type === 'ingredient' && <Utensils size={12} className="text-orange-500" />}
                           {item.type === 'packaging' && <Box size={12} className="text-blue-500" />}
                           {item.type === 'utility' && <Flame size={12} className="text-purple-500" />}
                           <div className="font-bold text-stone-800">{item.name}</div>
                         </div>
                         <div className="text-xs text-stone-500 ml-5">{item.details}</div>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="font-bold text-stone-800">{formatCurrency(item.cost)}</div>
                         <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-rose-500 transition-colors">
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                   ))
                 )}
               </div>

               <div className="border-t border-stone-100 pt-6 mt-auto">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-stone-500 font-medium">Total Cost</span>
                 </div>
                 <div className="text-4xl font-bold text-stone-900">
                   {formatCurrency(totalCost)}
                 </div>
                 <p className="text-xs text-stone-400 mt-2">
                   Use this total as your "Ingredients" or "Daily Expense" entry.
                 </p>
               </div>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
