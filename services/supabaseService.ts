
import { MenuItem, SaleEntry, ExpenseEntry, SupabaseConfig } from '../types';

let supabaseClient: any = null;

export const supabaseService = {
  // Initialize: Check Env Vars -> LocalStorage
  init: () => {
    // 1. Try Environment Variables
    const envUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const envKey = process.env.SUPABASE_KEY || process.env.REACT_APP_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

    // 2. Try Local Storage Settings
    const storedConfigStr = localStorage.getItem('supabaseConfig');
    const storedConfig = storedConfigStr ? JSON.parse(storedConfigStr) : null;

    const url = envUrl || storedConfig?.url;
    const key = envKey || storedConfig?.key;

    if (url && key && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(url, key);
        console.log("Supabase Client Initialized");
        return true;
      } catch (e) {
        console.error("Failed to init Supabase", e);
        return false;
      }
    }
    return false;
  },

  isConnected: () => !!supabaseClient,

  // ---------------------------------------------
  // TEST CONNECTION
  // ---------------------------------------------
  async testConnection() {
    if (!supabaseClient) return { success: false, message: "Client not initialized" };
    try {
      // Try to fetch one row from menu_items to see if connection & permissions work
      const { data, error } = await supabaseClient.from('menu_items').select('id').limit(1);
      if (error) throw error;
      return { success: true, message: "Connection Successful!" };
    } catch (error: any) {
      console.error("Connection Test Failed:", error);
      return { success: false, message: error.message || "Unknown connection error" };
    }
  },

  // ---------------------------------------------
  // DATA METHODS
  // ---------------------------------------------

  async fetchMenu(): Promise<MenuItem[]> {
    if (!supabaseClient) return [];
    const { data, error } = await supabaseClient.from('menu_items').select('*');
    if (error) throw error;
    
    // Map DB fields to TypeScript Interface
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      price: Number(d.price),
      myShare: Number(d.my_share),
      sheroShare: Number(d.shero_share)
    }));
  },

  async upsertMenuItem(item: MenuItem) {
    if (!supabaseClient) return;
    const dbItem = {
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      my_share: item.myShare,
      shero_share: item.sheroShare
    };
    const { error } = await supabaseClient.from('menu_items').upsert(dbItem);
    if (error) throw error;
  },

  async deleteMenuItem(id: string) {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  },

  async fetchSales(): Promise<SaleEntry[]> {
    if (!supabaseClient) return [];
    const { data, error } = await supabaseClient.from('sales').select('*');
    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      date: d.date,
      menuItemId: d.menu_item_id,
      itemName: d.item_name,
      category: d.category,
      quantity: d.quantity,
      unitPrice: Number(d.total_amount) / (d.quantity || 1), 
      unitMyShare: Number(d.total_my_share) / (d.quantity || 1),
      unitSheroShare: Number(d.total_shero_share) / (d.quantity || 1),
      totalAmount: Number(d.total_amount),
      totalMyShare: Number(d.total_my_share),
      totalSheroShare: Number(d.total_shero_share),
      notes: d.notes
    }));
  },

  async upsertSale(sale: SaleEntry) {
    if (!supabaseClient) return;
    const dbSale = {
      id: sale.id,
      date: sale.date,
      menu_item_id: sale.menuItemId,
      item_name: sale.itemName,
      category: sale.category,
      quantity: sale.quantity,
      total_amount: sale.totalAmount,
      total_my_share: sale.totalMyShare,
      total_shero_share: sale.totalSheroShare,
      notes: sale.notes
    };
    const { error } = await supabaseClient.from('sales').upsert(dbSale);
    if (error) throw error;
  },

  async deleteSale(id: string) {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('sales').delete().eq('id', id);
    if (error) throw error;
  },

  async fetchExpenses(): Promise<ExpenseEntry[]> {
    if (!supabaseClient) return [];
    const { data, error } = await supabaseClient.from('expenses').select('*');
    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      date: d.date,
      category: d.category,
      amount: Number(d.amount),
      notes: d.notes
    }));
  },

  async upsertExpense(expense: ExpenseEntry) {
    if (!supabaseClient) return;
    const dbExp = {
      id: expense.id,
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      notes: expense.notes
    };
    const { error } = await supabaseClient.from('expenses').upsert(dbExp);
    if (error) throw error;
  },

  async deleteExpense(id: string) {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('expenses').delete().eq('id', id);
    if (error) throw error;
  }
};
