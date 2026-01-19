
import React, { useState } from 'react';
import { QRConfig } from '../types.ts';
import { ImageCropper } from './ImageCropper.tsx';
import { GoogleGenAI } from "@google/genai";

interface Props {
  config: QRConfig;
  onUpdate: (update: Partial<QRConfig>) => void;
  isDynamic: boolean;
  setIsDynamic: (val: boolean) => void;
}

export const Controls: React.FC<Props> = ({ config, onUpdate, isDynamic, setIsDynamic }) => {
  const [rawLogo, setRawLogo] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionError, setVisionError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (field === 'logo') {
          setRawLogo(result);
        } else {
          onUpdate({ [field]: result });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleVisionScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setVisionError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = (event.target?.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Data,
                },
              },
              {
                text: "Analyze this image and extract any text or URL intended for a QR code. Return ONLY the content string.",
              },
            ],
          },
        });

        const extractedText = response.text?.trim();
        if (extractedText) {
          onUpdate({ url: extractedText, mode: extractedText.startsWith('http') ? 'url' : 'text' });
        } else {
          setVisionError("No metadata found in image.");
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setVisionError("Neural processing failed.");
      setIsAnalyzing(false);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    onUpdate({ logo: croppedImage });
    setRawLogo(null);
  };

  const eyeShapes: { label: string; value: QRConfig['eyeShape'] }[] = [
    { label: 'Square', value: 'square' },
    { label: 'Rounded', value: 'rounded' },
    { label: 'Circle', value: 'circle' },
  ];

  const spectralPresets = [
    { name: 'Empire Gold', start: '#D4AF37', end: '#111111', eye: '#D4AF37', mod: '#E5E7EB' },
    { name: 'Cyber Neon', start: '#00f2ff', end: '#000000', eye: '#00f2ff', mod: '#ffffff' },
    { name: 'Deep Space', start: '#6d28d9', end: '#000000', eye: '#c084fc', mod: '#e9d5ff' },
    { name: 'Volcanic', start: '#ef4444', end: '#000000', eye: '#f87171', mod: '#fca5a5' },
    { name: 'Forest', start: '#22c55e', end: '#052e16', eye: '#4ade80', mod: '#bbf7d0' },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
      {rawLogo && (
        <ImageCropper 
          image={rawLogo} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setRawLogo(null)} 
        />
      )}

      {/* Protocol Selection */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Matrix Protocol</label>
        <div className="flex bg-black p-1 border-2 border-zinc-800 rounded-2xl gap-1">
          <button 
            onClick={() => onUpdate({ mode: 'url' })}
            className={`flex-1 py-3 text-[10px] font-black uppercase transition-all rounded-xl flex items-center justify-center gap-2 ${config.mode === 'url' ? 'bg-zinc-800 text-yellow-500 shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Hyperlink
          </button>
          <button 
            onClick={() => onUpdate({ mode: 'text' })}
            className={`flex-1 py-3 text-[10px] font-black uppercase transition-all rounded-xl flex items-center justify-center gap-2 ${config.mode === 'text' ? 'bg-zinc-800 text-yellow-500 shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Manuscript
          </button>
        </div>
      </div>

      {/* Data Entry */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            {config.mode === 'url' ? 'Redirect Target' : 'Secret Message'}
          </label>
          {config.mode === 'url' && (
            <button onClick={() => setIsDynamic(!isDynamic)} className="flex items-center gap-2">
               <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Dynamic</span>
               <div className={`w-8 h-4 rounded-full transition-all relative ${isDynamic ? 'bg-yellow-500' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDynamic ? 'left-4.5' : 'left-0.5'}`} />
               </div>
            </button>
          )}
        </div>
        {config.mode === 'url' ? (
          <input
            type="text"
            value={config.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            className="w-full bg-black border-2 border-zinc-800 rounded-2xl px-5 py-4 text-sm text-gray-100 focus:border-yellow-500 outline-none transition-all font-mono"
            placeholder="https://..."
          />
        ) : (
          <textarea
            value={config.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            className="w-full bg-black border-2 border-zinc-800 rounded-2xl px-5 py-4 text-sm text-gray-100 focus:border-yellow-500 outline-none transition-all font-mono resize-none h-32 custom-scrollbar"
            placeholder="Type your secret transmission..."
          />
        )}
      </div>

      <div className="h-px bg-zinc-800" />

      {/* Matrix Colors - IMPROVED VERSION */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Spectral Presets</label>
            <span className="text-[8px] font-mono text-zinc-700">NEURAL SCHEMES</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {spectralPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onUpdate({ 
                  gradientStart: preset.start, 
                  gradientEnd: preset.end,
                  eyeColor: preset.eye,
                  moduleColor: preset.mod
                })}
                className="group relative h-10 rounded-xl overflow-hidden border border-zinc-800 transition-all hover:scale-110 hover:border-white/20 active:scale-95 shadow-lg"
                title={preset.name}
              >
                <div 
                  className="absolute inset-0" 
                  style={{ background: `linear-gradient(135deg, ${preset.start}, ${preset.end})` }} 
                />
                <div 
                  className="absolute top-1 left-1 w-2 h-2 rounded-full border border-black/20" 
                  style={{ backgroundColor: preset.eye }} 
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Custom Spectrum Lab</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50 space-y-3">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">Canvas Gradient</span>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input 
                    type="color" 
                    value={config.gradientStart} 
                    onChange={(e) => onUpdate({ gradientStart: e.target.value })} 
                    className="w-full h-10 opacity-0 absolute cursor-pointer" 
                  />
                  <div className="h-10 rounded-lg border border-zinc-700 flex items-center justify-center text-[10px] font-mono text-zinc-400 pointer-events-none" style={{ backgroundColor: config.gradientStart }}>
                    {config.gradientStart.toUpperCase()}
                  </div>
                </div>
                <div className="relative flex-1">
                  <input 
                    type="color" 
                    value={config.gradientEnd} 
                    onChange={(e) => onUpdate({ gradientEnd: e.target.value })} 
                    className="w-full h-10 opacity-0 absolute cursor-pointer" 
                  />
                  <div className="h-10 rounded-lg border border-zinc-700 flex items-center justify-center text-[10px] font-mono text-zinc-400 pointer-events-none" style={{ backgroundColor: config.gradientEnd }}>
                    {config.gradientEnd.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50 space-y-3">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">Neural Components</span>
              <div className="flex items-center gap-2">
                <div className="relative flex-1" title="Eye Color">
                  <input 
                    type="color" 
                    value={config.eyeColor} 
                    onChange={(e) => onUpdate({ eyeColor: e.target.value })} 
                    className="w-full h-10 opacity-0 absolute cursor-pointer" 
                  />
                  <div className="h-10 rounded-lg border border-zinc-700 flex flex-col items-center justify-center pointer-events-none" style={{ backgroundColor: config.eyeColor }}>
                    <span className="text-[7px] text-black font-black bg-white/40 px-1 rounded-sm">EYE</span>
                  </div>
                </div>
                <div className="relative flex-1" title="Module Color">
                  <input 
                    type="color" 
                    value={config.moduleColor} 
                    onChange={(e) => onUpdate({ moduleColor: e.target.value })} 
                    className="w-full h-10 opacity-0 absolute cursor-pointer" 
                  />
                  <div className="h-10 rounded-lg border border-zinc-700 flex flex-col items-center justify-center pointer-events-none" style={{ backgroundColor: config.moduleColor }}>
                    <span className="text-[7px] text-black font-black bg-white/40 px-1 rounded-sm">MOD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-800" />

      {/* Geometry Lab */}
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Eye Geometry</label>
          <div className="grid grid-cols-3 gap-2">
            {eyeShapes.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdate({ eyeShape: opt.value })}
                className={`py-2 text-[9px] font-black uppercase transition-all rounded-xl border-2 ${config.eyeShape === opt.value ? 'bg-zinc-800 border-yellow-500 text-yellow-500 shadow-lg shadow-yellow-500/10' : 'bg-black border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Module Style</label>
          <div className="flex bg-black p-1 border-2 border-zinc-800 rounded-2xl">
            {['square', 'rounded', 'circle'].map((s) => (
              <button
                key={s}
                onClick={() => onUpdate({ moduleShape: s as any })}
                className={`flex-1 py-2 text-[10px] font-bold uppercase transition-all rounded-xl ${config.moduleShape === s ? 'bg-zinc-800 text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-800" />

      {/* Branding Engine */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Branding & Visuals</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="hidden" id="logo-uplink" />
            <label htmlFor="logo-uplink" className="flex flex-col items-center justify-center h-24 bg-black border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-yellow-500/50 hover:bg-zinc-950 transition-all gap-2 text-center px-2">
              {config.logo ? <img src={config.logo} className="w-8 h-8 object-contain rounded-lg" /> : <div className="w-6 h-6 rounded bg-zinc-800" />}
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">Logo Overlay</span>
            </label>
          </div>
          <div className="relative group">
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'background')} className="hidden" id="bg-uplink" />
            <label htmlFor="bg-uplink" className="flex flex-col items-center justify-center h-24 bg-black border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-yellow-500/50 hover:bg-zinc-950 transition-all gap-2 text-center px-2">
              {config.background ? <div className="w-8 h-8 rounded-lg bg-yellow-500/20" /> : <div className="w-6 h-6 border border-zinc-800" />}
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">Neural Canvas</span>
            </label>
          </div>
        </div>
      </div>

      {/* AI Extraction Tool */}
      <div className="pt-6 border-t border-zinc-800">
        <label className="text-[10px] font-bold text-yellow-500/50 uppercase tracking-[0.2em] mb-4 block">AI Scan (From Image)</label>
        <input type="file" accept="image/*" onChange={handleVisionScan} className="hidden" id="ai-vision-scan" />
        <label htmlFor="ai-vision-scan" className={`flex items-center justify-center gap-3 w-full py-4 bg-black border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-yellow-500/30 transition-all ${isAnalyzing ? 'opacity-50 cursor-wait' : ''}`}>
          {isAnalyzing ? (
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Neural OCR Uplink</span>
            </>
          )}
        </label>
        {visionError && <p className="text-[9px] text-red-500 font-bold text-center mt-2 uppercase">{visionError}</p>}
      </div>
    </div>
  );
};
