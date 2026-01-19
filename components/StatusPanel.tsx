
import React, { useState, useEffect } from 'react';

interface Props {
  url: string;
}

export const StatusPanel: React.FC<Props> = ({ url }) => {
  const [latency, setLatency] = useState(42);
  const [uptime, setUptime] = useState(99.98);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(30, Math.min(65, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex flex-col gap-1">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Uptime</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{uptime}%</span>
          <span className="text-[10px] text-green-500 font-bold">+0.01%</span>
        </div>
        <div className="mt-4 flex gap-1 h-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className={`flex-1 rounded-full ${i === 18 ? 'bg-yellow-500/50' : 'bg-green-500/30'}`} />
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex flex-col gap-1">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Edge Latency</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{latency}</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">ms</span>
        </div>
        <span className="text-[9px] text-zinc-600 mt-2 font-mono italic">Primary Node: US-EAST-1</span>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex flex-col gap-1">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">SSL Security</span>
        <div className="flex items-center gap-3 mt-1">
          <div className="p-2 bg-green-500/10 rounded-xl">
             <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
             </svg>
          </div>
          <div>
            <span className="block text-xs font-black text-white uppercase tracking-tight">Verified</span>
            <span className="block text-[9px] text-zinc-500 uppercase font-bold">256-Bit Encrypted</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex flex-col gap-1">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Daily Scans</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">1.2K</span>
          <span className="text-[10px] text-yellow-500 font-bold">Trending</span>
        </div>
        <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500 w-[65%] shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
        </div>
      </div>
    </div>
  );
};
