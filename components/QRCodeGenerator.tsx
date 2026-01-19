
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QRConfig } from '../types';

interface Props {
  config: QRConfig;
}

export const QRCodeGenerator: React.FC<Props> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (config.background) {
      const img = new Image();
      img.src = config.background;
      img.onload = () => { bgImgRef.current = img; };
    } else {
      bgImgRef.current = null;
    }
  }, [config.background]);

  useEffect(() => {
    if (config.logo) {
      const img = new Image();
      img.src = config.logo;
      img.onload = () => { logoImgRef.current = img; };
    } else {
      logoImgRef.current = null;
    }
  }, [config.logo]);

  const drawShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, shape: string) => {
    ctx.beginPath();
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;

    switch (shape) {
      case 'circle':
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        break;
      case 'rounded':
        ctx.roundRect(x, y, size, size, size * 0.3);
        break;
      case 'square':
      default:
        ctx.rect(x, y, size, size);
        break;
    }
    ctx.fill();
  };

  const renderQR = async (time: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const qrData = QRCode.create(config.url || " ", { errorCorrectionLevel: config.errorCorrectionLevel });
      const { modules } = qrData;
      const count = modules.size;
      const cellSize = config.boxSize;
      
      // MANDATORY QUIET ZONE: Standard scanners (Google Lens, iOS) require 4 modules of quiet space.
      // This is the "White Border" that makes it scan 100% of the time.
      const margin = cellSize * 4.0; 
      const size = count * cellSize + margin * 2;

      if (canvas.width !== size) {
        canvas.width = size;
        canvas.height = size;
      }

      // 1. LIGHT PLATE BASE (Scanner Friendly Zone)
      ctx.fillStyle = '#FFFFFF'; 
      ctx.fillRect(0, 0, size, size);

      const qrAreaSize = count * cellSize;
      const t = time * 0.001;

      // 2. BRANDED DECK (The colored part inside the quiet zone)
      ctx.save();
      ctx.beginPath();
      // We clip the gradient/background slightly inside the quiet zone
      ctx.roundRect(margin - 4, margin - 4, qrAreaSize + 8, qrAreaSize + 8, 12);
      ctx.clip();

      if (bgImgRef.current) {
        ctx.drawImage(bgImgRef.current, margin, margin, qrAreaSize, qrAreaSize);
      } else {
        const gradientAngle = config.isAnimated ? t * 0.3 : 0;
        const cx = margin + qrAreaSize / 2;
        const cy = margin + qrAreaSize / 2;
        const x1 = cx + Math.cos(gradientAngle) * qrAreaSize / 2;
        const y1 = cy + Math.sin(gradientAngle) * qrAreaSize / 2;
        const x2 = cx - Math.cos(gradientAngle) * qrAreaSize / 2;
        const y2 = cy - Math.sin(gradientAngle) * qrAreaSize / 2;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, config.gradientStart); 
        gradient.addColorStop(1, config.gradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(margin, margin, qrAreaSize, qrAreaSize);
      }
      ctx.restore();

      // 3. NEURAL MODULES
      const logoPercent = 0.22; 
      const centerLimit = Math.floor(count * logoPercent / 2);
      const centerPos = Math.floor(count / 2);
      const skipRange = { start: centerPos - centerLimit, end: centerPos + centerLimit };

      for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
          if (modules.get(row, col)) {
            const x = margin + col * cellSize;
            const y = margin + row * cellSize;

            const isTopLeft = row < 7 && col < 7;
            const isTopRight = row < 7 && col >= count - 7;
            const isBottomLeft = row >= count - 7 && col < 7;

            if (row >= skipRange.start && row <= skipRange.end && col >= skipRange.start && col <= skipRange.end) continue;

            if (isTopLeft || isTopRight || isBottomLeft) {
              // High contrast eyes
              ctx.fillStyle = config.eyeColor;
              drawShape(ctx, x, y, cellSize, config.eyeShape);
            } else {
              const dx = col - centerPos;
              const dy = row - centerPos;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const shimmer = config.isAnimated ? Math.sin(t * 3 - dist * 0.4) * 0.08 + 0.92 : 1;
              
              ctx.save();
              ctx.globalAlpha = shimmer;
              ctx.fillStyle = config.moduleColor;
              const padding = cellSize * 0.15;
              drawShape(ctx, x + padding, y + padding, cellSize - padding * 2, config.moduleShape);
              ctx.restore();
            }
          }
        }
      }

      // 4. CENTER BRANDING (Optimized size for scanning)
      const centerX = size / 2;
      const centerY = size / 2;
      const logoVisualSize = qrAreaSize * logoPercent;

      // Isolation ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, (logoVisualSize * 1.2) / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();

      // Logo Clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, (logoVisualSize * 0.95) / 2, 0, Math.PI * 2);
      ctx.clip();

      if (logoImgRef.current) {
        const logoImg = logoImgRef.current;
        const ratio = logoImg.width / logoImg.height;
        let w = logoVisualSize, h = w / ratio;
        if (h > logoVisualSize) { h = logoVisualSize; w = h * ratio; }
        ctx.drawImage(logoImg, centerX - w / 2, centerY - h / 2, w, h);
      } else {
        ctx.fillStyle = config.eyeColor;
        ctx.fillRect(centerX - logoVisualSize/2, centerY - logoVisualSize/2, logoVisualSize, logoVisualSize);
        ctx.fillStyle = '#000';
        ctx.font = `bold ${logoVisualSize * 0.3}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('EMPIRE', centerX, centerY);
      }
      ctx.restore();

      // Eye Border
      ctx.strokeStyle = config.eyeColor;
      ctx.lineWidth = cellSize * 0.15;
      ctx.beginPath();
      ctx.arc(centerX, centerY, logoVisualSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      if (config.isAnimated) animationFrameRef.current = requestAnimationFrame(renderQR);
    } catch (err) { console.error('QR Render failed:', err); }
  };

  useEffect(() => {
    if (config.isAnimated) animationFrameRef.current = requestAnimationFrame(renderQR);
    else renderQR(0);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [config]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Empire_AI_QR_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-[3.2rem] blur-3xl opacity-40 group-hover:opacity-100 transition duration-1000"></div>
        
        <div className="relative p-6 bg-zinc-950 rounded-[3.5rem] border border-zinc-800/50 shadow-2xl transition-all">
          <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl p-1">
             <canvas ref={canvasRef} className="w-[300px] md:w-[420px] h-auto" />
          </div>
          
          <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-yellow-500/20 rounded-tl-2xl" />
          <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-yellow-500/20 rounded-br-2xl" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4 mt-12 w-full max-w-sm">
        <button onClick={downloadQR} className="w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black rounded-2xl shadow-2xl transform transition-all active:scale-95 flex items-center justify-center gap-4 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="tracking-widest uppercase italic">Export for App</span>
        </button>
        <div className="flex items-center gap-3 bg-zinc-900/40 px-6 py-2 rounded-full border border-zinc-800">
           <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]" />
           <p className="text-zinc-500 text-[9px] uppercase font-black tracking-[0.5em]">Mobile Ready</p>
        </div>
      </div>
    </div>
  );
};
