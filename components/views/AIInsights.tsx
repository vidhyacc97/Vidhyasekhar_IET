
import React, { useState } from 'react';
import { SaleEntry, ExpenseEntry, BusinessSummary } from '../../types';
import { Card } from '../ui/Card';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateBusinessInsights } from '../../services/geminiService';

interface AIInsightsProps {
  sales: SaleEntry[];
  expenses: ExpenseEntry[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ sales, expenses }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
      setError("API Key not found.");
      return;
    }

    if (sales.length === 0) {
      setError("Please add sales data before generating insights.");
      return;
    }

    setLoading(true);
    setError(null);
    
    // Prepare Data
    const totalMyShare = sales.reduce((sum, s) => sum + s.totalMyShare, 0);
    const totalSheroShare = sales.reduce((sum, s) => sum + s.totalSheroShare, 0);
    const totalSalesValue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalMyShare - totalExpenses;

    const itemCounts: Record<string, any> = {};
    sales.forEach(s => {
       if(!itemCounts[s.itemName]) itemCounts[s.itemName] = { name: s.itemName, count: 0, earnings: 0 };
       itemCounts[s.itemName].count += s.quantity;
       itemCounts[s.itemName].earnings += s.totalMyShare;
    });

    const topItems = Object.values(itemCounts).sort((a: any, b: any) => b.earnings - a.earnings).slice(0, 5);

    const summary: BusinessSummary = {
      period: 'All Time',
      totalSalesValue,
      totalMyShare,
      totalSheroShare,
      totalExpenses,
      netProfit,
      topItems
    };

    const result = await generateBusinessInsights(summary);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Sparkles className="text-amber-500" />
            AI Business Consultant
          </h2>
          <p className="text-stone-500">Analyze your menu, profit margins, and sales trends.</p>
        </div>
      </div>

      <div className="flex-1">
        {!insight ? (
          <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
            <div className="bg-amber-100 p-4 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-stone-800 mb-2">Grow your Food Business</h3>
            <p className="text-stone-500 max-w-md mb-6">
              I will analyze your "My Share" earnings versus Expenses, identify your most profitable dishes, and suggest ways to optimize your menu.
            </p>
            {error ? (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-lg flex items-center gap-2 mb-4">
                <AlertCircle size={20} />
                {error}
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-stone-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? 'Analyzing Business...' : 'Generate Insights'}
              </button>
            )}
          </Card>
        ) : (
          <Card className="min-h-[400px]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-100">
               <h3 className="font-semibold text-lg text-stone-800">Consultant Report</h3>
               <button onClick={handleGenerate} className="text-stone-500 hover:text-amber-600 text-sm flex items-center gap-1">
                 <RefreshCw size={14} /> Refresh
               </button>
            </div>
            <div className="prose prose-stone max-w-none">
              <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
