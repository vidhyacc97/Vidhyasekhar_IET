
import React, { useMemo, useState } from 'react';
import { SaleEntry } from '../../types';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/format';
import { TrendingUp, PieChart, Info, Calendar, List } from 'lucide-react';

interface ReceivablesProps {
  sales: SaleEntry[];
}

export const Receivables: React.FC<ReceivablesProps> = ({ sales }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  
  // Helper to get Monday of the week
  const getWeekStart = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  // Group by Month
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { total: number, myShare: number, sheroShare: number, count: number }> = {};
    
    sales.forEach(s => {
      const monthKey = s.date.substring(0, 7); // YYYY-MM
      if (!grouped[monthKey]) {
        grouped[monthKey] = { total: 0, myShare: 0, sheroShare: 0, count: 0 };
      }
      grouped[monthKey].total += s.totalAmount;
      grouped[monthKey].myShare += s.totalMyShare;
      grouped[monthKey].sheroShare += s.totalSheroShare;
      grouped[monthKey].count += 1;
    });

    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0])) // Descending months
      .map(([month, data]) => ({
        label: new Date(month + '-01').toLocaleDateString(undefined, { year: 'numeric', month: 'long' }),
        ...data
      }));
  }, [sales]);

  // Group by Week
  const weeklyData = useMemo(() => {
    const grouped: Record<string, { total: number, myShare: number, sheroShare: number, count: number }> = {};
    
    sales.forEach(s => {
      const weekStart = getWeekStart(s.date);
      if (!grouped[weekStart]) {
        grouped[weekStart] = { total: 0, myShare: 0, sheroShare: 0, count: 0 };
      }
      grouped[weekStart].total += s.totalAmount;
      grouped[weekStart].myShare += s.totalMyShare;
      grouped[weekStart].sheroShare += s.totalSheroShare;
      grouped[weekStart].count += 1;
    });

    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0])) // Descending weeks
      .map(([weekStart, data]) => {
        const endDate = new Date(weekStart);
        endDate.setDate(endDate.getDate() + 6);
        return {
          label: `${new Date(weekStart).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - ${endDate.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}`,
          ...data
        };
      });
  }, [sales]);

  // Detailed Daily List
  const dailyList = useMemo(() => {
    return [...sales].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      // Secondary sort by creation time/ID (assuming ID has some chronological correlation or just specific order)
      return b.id.localeCompare(a.id);
    });
  }, [sales]);

  const totalMyShare = sales.reduce((sum, s) => sum + s.totalMyShare, 0);
  const totalSheroShare = sales.reduce((sum, s) => sum + s.totalSheroShare, 0);

  const activeData = viewMode === 'monthly' ? monthlyData : weeklyData;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-stone-800">Receivables & Splits</h2>
          <p className="text-stone-500">Track earnings vs partner commissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-700 text-white p-6 rounded-2xl shadow-lg border border-emerald-800">
           <div className="flex items-center gap-2 mb-2 opacity-80">
             <TrendingUp size={20} />
             <span className="text-sm font-medium uppercase tracking-wider">Total My Earnings</span>
           </div>
           <div className="text-4xl font-bold mb-4">{formatCurrency(totalMyShare)}</div>
           <p className="text-emerald-100 text-xs font-medium">
             This is your net revenue after deducting partner share. 
             If Shero collects payment, they owe you this amount.
           </p>
        </div>

        <div className="bg-indigo-700 text-white p-6 rounded-2xl shadow-lg border border-indigo-800">
           <div className="flex items-center gap-2 mb-2 opacity-80">
             <PieChart size={20} />
             <span className="text-sm font-medium uppercase tracking-wider">Total Partner Share</span>
           </div>
           <div className="text-4xl font-bold mb-4">{formatCurrency(totalSheroShare)}</div>
           <p className="text-indigo-100 text-xs font-medium">
             This is the commission/fee portion. 
             If you collect payment, you owe them this amount.
           </p>
        </div>
      </div>

      <Card title={
          viewMode === 'monthly' ? "Monthly Breakdown" : 
          viewMode === 'weekly' ? "Weekly Breakdown" : 
          "Daily Order Breakdown"
        } 
        action={
          <div className="flex bg-stone-100 rounded-lg p-1 border border-stone-200">
            <button 
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'monthly' ? 'bg-white shadow text-stone-900 ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'weekly' ? 'bg-white shadow text-stone-900 ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'daily' ? 'bg-white shadow text-stone-900 ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Daily
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 text-stone-600 uppercase font-bold text-xs border-b border-stone-200">
              {viewMode === 'daily' ? (
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Order Name</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right text-emerald-700">My Share</th>
                  <th className="px-4 py-3 text-right text-indigo-700">Shero Share</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-3">{viewMode === 'monthly' ? 'Month' : 'Week Range'}</th>
                  <th className="px-4 py-3 text-right">Orders</th>
                  <th className="px-4 py-3 text-right">Total Collected</th>
                  <th className="px-4 py-3 text-right text-emerald-700">My Share</th>
                  <th className="px-4 py-3 text-right text-indigo-700">Shero Share</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-stone-100">
              {viewMode === 'daily' ? (
                // DAILY MODE: List individual orders
                dailyList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                       No sales data recorded yet.
                    </td>
                  </tr>
                ) : (
                  dailyList.map((entry) => (
                    <tr key={entry.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-4 font-bold text-stone-600 whitespace-nowrap">
                         {new Date(entry.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </td>
                      <td className="px-4 py-4 font-bold text-stone-800">
                        {entry.itemName}
                        {entry.notes && <span className="block text-[10px] font-normal text-stone-400 italic">{entry.notes}</span>}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-stone-600">
                        {entry.quantity}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-stone-900">
                        {formatCurrency(entry.totalAmount)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-emerald-700 bg-emerald-50/30">
                        {formatCurrency(entry.totalMyShare)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-indigo-700 bg-indigo-50/30">
                        {formatCurrency(entry.totalSheroShare)}
                      </td>
                    </tr>
                  ))
                )
              ) : (
                // AGGREGATE MODES (Weekly/Monthly)
                activeData.length === 0 ? (
                   <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                         No sales data recorded yet.
                      </td>
                   </tr>
                ) : (
                  activeData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-4 font-bold text-stone-800 flex items-center gap-2">
                        <Calendar size={14} className="text-stone-400" />
                        {row.label}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-stone-600">
                        {row.count}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-stone-900">
                        {formatCurrency(row.total)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-emerald-700 bg-emerald-50/30">
                        {formatCurrency(row.myShare)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-indigo-700 bg-indigo-50/30">
                        {formatCurrency(row.sheroShare)}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-900 flex items-start gap-3 shadow-sm">
         <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
         <div>
            <span className="font-bold">Note on Settlements:</span> The "Receivables" calculation depends on who collects the cash from the customer. 
            If all payments go to the app, check the <span className="font-bold text-emerald-700 border-b border-emerald-300">My Share</span> column for what is owed to you.
         </div>
      </div>
    </div>
  );
};
