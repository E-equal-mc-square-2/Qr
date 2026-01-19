
import React from 'react';
import { QRConfig, HistoryItem } from '../types';

interface Props {
  history: HistoryItem[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onLoad: (config: QRConfig) => void;
}

export const HistoryPanel: React.FC<Props> = ({ history, onDelete, onToggle, onLoad }) => {
  if (history.length === 0) return null;

  return (
    <div className="p-6 bg-zinc-900/30 rounded-2xl border border-zinc-800 backdrop-blur-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Generation History</h3>
        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{history.length} ITEMS</span>
      </div>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {history.map((item) => (
          <div 
            key={item.id} 
            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-4 ${item.active ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-950/20 border-zinc-900 grayscale opacity-50'}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-zinc-800">
                <div className="w-6 h-6 rounded-sm" style={{ background: `linear-gradient(135deg, ${item.config.gradientStart}, ${item.config.gradientEnd})` }} />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-mono text-zinc-300 truncate">{item.config.url}</p>
                <p className="text-[8px] text-zinc-600 font-bold uppercase">{new Date(item.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => onToggle(item.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${item.active ? 'text-green-500 hover:bg-green-500/10' : 'text-zinc-600 hover:bg-zinc-800'}`}
                title={item.active ? "Deactivate" : "Activate"}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button 
                onClick={() => onLoad(item.config)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-yellow-500 hover:bg-yellow-500/10 transition-all"
                title="Restore"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button 
                onClick={() => onDelete(item.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-all"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
