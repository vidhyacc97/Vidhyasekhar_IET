
declare global {
  interface Window {
    XLSX: any;
    supabase: any; // Access global script
  }
}

export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string; // Main Group
  subCategory?: string; // Sub-Group
  price: number; // Total Amount
  myShare: number;
  sheroShare: number;
}

export interface SaleEntry {
  id: string;
  date: string;
  menuItemId: string;
  itemName: string; // Snapshot for history
  category: string;
  quantity: number;
  
  // Snapshots of financial data at time of sale
  unitPrice: number;
  unitMyShare: number;
  unitSheroShare: number;
  
  // Computed totals
  totalAmount: number;
  totalMyShare: number;
  totalSheroShare: number;
  
  notes?: string;
}

export interface ExpenseEntry {
  id: string;
  date: string;
  category: string;
  amount: number;
  vendor?: string;
  paymentMode?: string;
  notes?: string;
}

// For AI Analysis
export interface BusinessSummary {
  period: string;
  totalSalesValue: number;
  totalMyShare: number;
  totalSheroShare: number;
  totalExpenses: number;
  netProfit: number;
  topItems: {name: string, count: number, earnings: number}[];
}