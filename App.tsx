
import React, { useState, useEffect } from 'react';
import { QRCodeGenerator } from './components/QRCodeGenerator.tsx';
import { Controls } from './components/Controls.tsx';
import { StatusPanel } from './components/StatusPanel.tsx';
import { HistoryPanel } from './components/HistoryPanel.tsx';
import { QRConfig, HistoryItem } from './types.ts';

const App: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const viewMode = params.get('view');
  const assetId = params.get('id');

  const [config, setConfig] = useState<QRConfig>({
    url: 'https://empire-systems.ai',
    mode: 'url',
    photoAsset: null,
    logo: null,
    background: null,
    eyeColor: '#D4AF37',
    moduleColor: '#E5E7EB',
    boxSize: 20,
    isAnimated: true,
    eyeShape: 'rounded',
    moduleShape: 'rounded',
    gradientStart: '#020617',
    gradientEnd: '#000000',
    errorCorrectionLevel: 'H',
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('empire_qr_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDynamic, setIsDynamic] = useState(true);

  const [receiverAsset, setReceiverAsset] = useState<string | null>(null);
  useEffect(() => {
    if (viewMode === 'asset' && assetId) {
      const storedAsset = localStorage.getItem(`empire_asset_${assetId}`);
      if (storedAsset) {
        setReceiverAsset(storedAsset);
      }
    }
  }, [viewMode, assetId]);

  useEffect(() => {
    localStorage.setItem('empire_qr_history', JSON.stringify(history));
  }, [history]);

  const handleUpdateConfig = (newConfig: Partial<QRConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const saveToHistory = () => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      config: { ...config },
      timestamp: Date.now(),
      active: true
    };
    setHistory([newItem, ...history]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const toggleHistoryItem = (id: string) => {
    setHistory(history.map(item => item.id === id ? { ...item, active: !item.active } : item));
  };

  const loadHistoryItem = (itemConfig: QRConfig) => {
    setConfig(itemConfig);
  };

  // RENDER RECEIVER VIEW (For hosted assets)
  if (viewMode === 'asset') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 rounded-[3rem] border border-zinc-800 p-8 shadow-2xl animate-in fade-in zoom-in duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
             <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-zinc-600">ENCRYPTED LINK</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
             </div>
          </div>

          <div className="flex items-center gap-3 mb-10 border-b border-zinc-800 pb-6 mt-4">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-widest italic">Empire Secure View</h1>
              <p className="text-[9px] text-zinc-500 font-mono">ID: {assetId}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black min-h-[200px] flex items-center justify-center">
              {receiverAsset ? (
                <img src={receiverAsset} className="w-full h-auto" />
              ) : (
                <div className="text-center p-10">
                   <div className="w-10 h-10 border-2 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
                   <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Decrypting manuscript...</p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed text-center font-medium"> This asset is secured by Empire Private Cloud protocols. </p>
          </div>
          
          <div className="mt-12 text-center">
             <p className="text-[8px] text-zinc-800 font-black uppercase tracking-[0.4em]">Empire AI Systems</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 p-4 md:p-8 flex flex-col items-center selection:bg-yellow-500/30">
      <header className="max-w-6xl w-full mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-600 bg-clip-text text-transparent uppercase italic">
            Empire AI <span className="text-zinc-500 not-italic font-light">QR-X</span>
          </h1>
          <p className="mt-1 text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase">
            Global Systems Architecture • V 4.2
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-3">
          <button onClick={saveToHistory} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl transition-all border border-zinc-700">SNAPSHOT</button>
          <div className="h-8 w-px bg-zinc-800 mx-2" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Engine Mode</span>
            <span className="text-xs font-mono text-yellow-500 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              {config.mode.toUpperCase()} MATRIX
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-4 space-y-6">
          <Controls config={config} onUpdate={handleUpdateConfig} isDynamic={isDynamic} setIsDynamic={setIsDynamic} />
          <HistoryPanel history={history} onDelete={deleteHistoryItem} onToggle={toggleHistoryItem} onLoad={loadHistoryItem} />
        </div>

        <div className="xl:col-span-8 space-y-8 flex flex-col items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
            <div className="flex flex-col items-center gap-8">
              <div className="text-center">
                <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] mb-4">Neural Data Matrix</h2>
                <QRCodeGenerator config={config} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em]">Receiver Sightline</h2>
              <div className="w-[280px] h-[580px] bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-800 relative overflow-hidden shadow-2xl shadow-black group">
                <div className="absolute top-0 w-full h-6 bg-black flex justify-center items-end pb-1">
                  <div className="w-16 h-4 bg-zinc-800 rounded-full" />
                </div>
                
                <div className="p-6 pt-12 flex flex-col h-full bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider">Empire Secure Viewer</p>
                      <p className="text-[8px] text-zinc-600 font-mono">SCAN-DECRYPTOR</p>
                    </div>
                  </div>

                  <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                    {config.mode === 'text' ? (
                      <div className="h-full flex flex-col">
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex-1 overflow-y-auto custom-scrollbar">
                          <div className="flex items-center gap-2 mb-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                             <span className="text-[8px] font-mono text-zinc-500 uppercase">Message Decrypted</span>
                          </div>
                          <p className="text-xs font-mono text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                            {config.url || "Awaiting neural transmission..."}
                          </p>
                        </div>
                        <div className="mt-6 flex justify-between items-center">
                           <span className="text-[8px] text-zinc-600 font-black uppercase">Source: Direct Matrix</span>
                           <span className="text-[8px] text-zinc-600 font-mono">{config.url.length} chars</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-3xl bg-zinc-800 mb-6 flex items-center justify-center">
                           <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                           </svg>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Awaiting Link Redirect...</p>
                        <p className="text-[9px] text-zinc-800 mt-2 font-mono truncate w-full">{config.url}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-6 text-center">
                    <div className="p-3 bg-zinc-900 rounded-xl mb-4 border border-zinc-800">
                       <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">Protocol: Zero-Trust</p>
                    </div>
                    <p className="text-[8px] text-zinc-800 font-bold uppercase tracking-widest">© Empire AI Systems</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full mt-12">
             <StatusPanel url={config.url} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
