
import React, { useMemo } from 'react';
import { SaleEntry, ExpenseEntry } from '../../types';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, IndianRupee, Wallet } from 'lucide-react';

interface DashboardProps {
  sales: SaleEntry[];
  expenses: ExpenseEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ sales, expenses }) => {
  
  const metrics = useMemo(() => {
    const totalOrders = sales.reduce((sum, s) => sum + s.quantity, 0);
    const totalSalesValue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalMyShare = sales.reduce((sum, s) => sum + s.totalMyShare, 0);
    const totalSheroShare = sales.reduce((sum, s) => sum + s.totalSheroShare, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalMyShare - totalExpenses;

    return { totalOrders, totalSalesValue, totalMyShare, totalSheroShare, totalExpenses, netProfit };
  }, [sales, expenses]);

  // Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const days: Record<string, { date: string, myShare: number, sheroShare: number, expense: number }> = {};
    
    // Init last 7 days
    for (let i = 6; i >= 0; i--) {
       const d = new Date();
       d.setDate(d.getDate() - i);
       const dateStr = d.toISOString().split('T')[0];
       days[dateStr] = { 
         date: d.toLocaleDateString('en-US', { weekday: 'short' }), 
         myShare: 0, 
         sheroShare: 0, 
         expense: 0 
       };
    }

    sales.forEach(s => {
      if (days[s.date]) {
        days[s.date].myShare += s.totalMyShare;
        days[s.date].sheroShare += s.totalSheroShare;
      }
    });

    expenses.forEach(e => {
      if (days[e.date]) {
        days[e.date].expense += e.amount;
      }
    });

    return Object.values(days);
  }, [sales, expenses]);

  // Top Items
  const topItems = useMemo(() => {
     const counts: Record<string, number> = {};
     sales.forEach(s => {
       counts[s.itemName] = (counts[s.itemName] || 0) + s.quantity;
     });
     return Object.entries(counts)
       .sort((a,b) => b[1] - a[1])
       .slice(0, 5)
       .map(([name, count]) => ({ name, count }));
  }, [sales]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h2 className="text-3xl font-bold text-stone-800">Business Dashboard</h2>
        <p className="text-stone-500">Overview of your home kitchen performance.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-1 text-stone-500 text-sm font-bold uppercase">
             <ShoppingBag size={16} className="text-orange-500" /> Total Orders
           </div>
           <div className="text-2xl font-bold text-stone-900">{metrics.totalOrders}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-1 text-stone-500 text-sm font-bold uppercase">
             <IndianRupee size={16} className="text-emerald-600" /> My Revenue
           </div>
           <div className="text-2xl font-bold text-emerald-700">{formatCurrency(metrics.totalMyShare)}</div>
           <div className="text-[10px] text-stone-400">Total "My Share"</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-1 text-stone-500 text-sm font-bold uppercase">
             <Wallet size={16} className="text-rose-500" /> Expenses
           </div>
           <div className="text-2xl font-bold text-rose-700">{formatCurrency(metrics.totalExpenses)}</div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-sm ${metrics.netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
           <div className={`flex items-center gap-2 mb-1 text-sm font-bold uppercase ${metrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
             <TrendingUp size={16} /> Net Profit
           </div>
           <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
             {formatCurrency(metrics.netProfit)}
           </div>
           <div className="text-[10px] opacity-70">Revenue - Expenses</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART */}
        <div className="lg:col-span-2">
           <Card title="Last 7 Days (Shares vs Expenses)">
             <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#78716c'}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#78716c'}} tickFormatter={(val) => `${val}`} />
                   <Tooltip 
                     cursor={{fill: '#f5f5f4'}}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   />
                   <Legend iconType="circle" />
                   <Bar name="My Share" dataKey="myShare" stackId="a" fill="#059669" barSize={20} />
                   <Bar name="Shero Share" dataKey="sheroShare" stackId="a" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                   <Bar name="Expense" dataKey="expense" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={20} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </Card>
        </div>

        {/* TOP ITEMS */}
        <div className="lg:col-span-1">
           <Card title="Popular Dishes">
             <div className="space-y-4">
               {topItems.length === 0 ? (
                 <div className="text-stone-400 text-sm text-center py-10">No sales data yet.</div>
               ) : (
                 topItems.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-2 border-b border-stone-50 last:border-0">
                     <div className="flex items-center gap-3">
                       <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-bold">
                         {idx + 1}
                       </span>
                       <span className="font-medium text-stone-800">{item.name}</span>
                     </div>
                     <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                       {item.count} sold
                     </span>
                   </div>
                 ))
               )}
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
