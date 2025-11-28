
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';

export const Settings: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'disconnected' | 'connected' | 'checking'>('disconnected');
  const [testMsg, setTestMsg] = useState('');
  const [isError, setIsError] = useState(false);
  
  // Check if Env Vars are active
  const hasEnvVars = !!(process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL);

  useEffect(() => {
    // Load current manual settings if any
    const stored = localStorage.getItem('supabaseConfig');
    if (stored) {
      const config = JSON.parse(stored);
      setUrl(config.url);
      setKey(config.key);
    }
    
    if (supabaseService.isConnected()) {
      setStatus('connected');
    }
  }, []);

  const runConnectionTest = async () => {
    setStatus('checking');
    setTestMsg("Testing connection...");
    setIsError(false);

    const result = await supabaseService.testConnection();
    if (result.success) {
      setStatus('connected');
      setTestMsg(result.message);
      setIsError(false);
    } else {
      setStatus('disconnected');
      setTestMsg(result.message);
      setIsError(true);
    }
  };

  const handleConnect = async () => {
    // Save settings
    localStorage.setItem('supabaseConfig', JSON.stringify({ url, key }));
    
    // Re-init service
    supabaseService.init();
    
    // Run Test
    await runConnectionTest();
    
    if (!isError) {
      // If success, reload to fetch data
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('supabaseConfig');
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
        <Database className="text-orange-500" /> Data Settings
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card title="Cloud Connection">
          <div className="space-y-4">
            {hasEnvVars && (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex items-center gap-2">
                 <InfoIcon /> 
                 <span>Using credentials from <strong>.env</strong> file.</span>
              </div>
            )}

            <div className={`p-4 rounded-xl flex items-center gap-3 transition-colors ${
              status === 'connected' ? 'bg-emerald-50 text-emerald-800' : 
              status === 'checking' ? 'bg-amber-50 text-amber-800' :
              'bg-stone-100 text-stone-500'
            }`}>
               {status === 'connected' ? <CheckCircle size={24} /> : status === 'checking' ? <RefreshCw className="animate-spin" size={24}/> : <AlertCircle size={24} />}
               <div>
                 <div className="font-bold">
                   {status === 'connected' ? 'Connected to Supabase' : status === 'checking' ? 'Testing Connection...' : 'Disconnected / Local Mode'}
                 </div>
                 <div className="text-xs opacity-80">
                   {status === 'connected' ? 'Data is synced with cloud.' : 'Data is saved only on this device.'}
                 </div>
               </div>
            </div>

            {testMsg && (
              <div className={`text-xs p-2 rounded ${isError ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                <strong>Status:</strong> {testMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-stone-500">Supabase URL</label>
              <input 
                value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full p-2 border rounded-lg"
                disabled={hasEnvVars && status === 'connected'} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-stone-500">Supabase Anon Key</label>
              <input 
                value={key} onChange={e => setKey(e.target.value)}
                type="password"
                placeholder="eyJh..."
                className="w-full p-2 border rounded-lg"
                disabled={hasEnvVars && status === 'connected'}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleConnect} className="flex-1 bg-stone-900 text-white py-2 rounded-lg font-bold hover:bg-black">
                {status === 'connected' && !hasEnvVars ? 'Update & Test' : 'Connect & Test'}
              </button>
              {status === 'connected' && !hasEnvVars && (
                <button onClick={handleDisconnect} className="px-4 border border-rose-200 text-rose-600 rounded-lg font-bold hover:bg-rose-50">
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card title="Database Schema (SQL)">
           <div className="text-sm text-stone-500 mb-2">Run this in your Supabase SQL Editor to create the required tables.</div>
           <div className="bg-stone-900 text-stone-300 p-4 rounded-xl text-xs font-mono overflow-x-auto h-64 select-all">
<pre>{`create table menu_items (
  id text primary key,
  name text,
  category text,
  price numeric,
  my_share numeric,
  shero_share numeric
);

create table sales (
  id text primary key,
  date text,
  menu_item_id text,
  item_name text,
  category text,
  quantity integer,
  total_amount numeric,
  total_my_share numeric,
  total_shero_share numeric,
  notes text
);

create table expenses (
  id text primary key,
  date text,
  category text,
  amount numeric,
  notes text
);`}</pre>
           </div>
        </Card>

      </div>
    </div>
  );
};

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);
