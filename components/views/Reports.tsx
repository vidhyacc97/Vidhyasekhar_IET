
import React from 'react';
import { SaleEntry, ExpenseEntry } from '../../types';
import { Card } from '../ui/Card';
import { Download } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface ReportsProps {
  sales: SaleEntry[];
  expenses: ExpenseEntry[];
}

export const Reports: React.FC<ReportsProps> = ({ sales, expenses }) => {
  
  const downloadSalesCSV = () => {
    const headers = ["Date", "Item Name", "Category", "Qty", "Unit Price", "My Share/Unit", "Shero Share/Unit", "Total Amount", "Total My Share", "Total Shero Share", "Notes"];
    const rows = sales.map(s => [
      s.date, s.itemName, s.category, s.quantity, 
      s.unitPrice, s.unitMyShare, s.unitSheroShare,
      s.totalAmount, s.totalMyShare, s.totalSheroShare, s.notes || ''
    ]);
    generateCSV(headers, rows, "sales_report.csv");
  };

  const downloadExpenseCSV = () => {
    const headers = ["Date", "Category", "Amount", "Notes"];
    const rows = expenses.map(e => [e.date, e.category, e.amount, e.notes || '']);
    generateCSV(headers, rows, "expenses_report.csv");
  };

  const generateCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
         <h2 className="text-2xl font-bold text-stone-800">Business Reports</h2>
         <p className="text-stone-500">Export detailed logs for Excel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Sales Report">
           <div className="p-4 bg-stone-50 rounded-xl mb-4 text-sm text-stone-600">
             Contains detailed breakdown of every order including split shares.
           </div>
           <button onClick={downloadSalesCSV} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white font-medium rounded-xl hover:bg-black transition-colors">
             <Download size={20} /> Download Sales CSV
           </button>
        </Card>

        <Card title="Expenses Report">
           <div className="p-4 bg-stone-50 rounded-xl mb-4 text-sm text-stone-600">
             Detailed log of all operational costs and vendor payments.
           </div>
           <button onClick={downloadExpenseCSV} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition-colors">
             <Download size={20} /> Download Expenses CSV
           </button>
        </Card>
      </div>
    </div>
  );
};
