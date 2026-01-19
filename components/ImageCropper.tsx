
import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';

interface Props {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<Props> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1);
  const [cropShape, setCropShape] = useState<'rect' | 'round'>('round');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: Point) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);

  // The correct prop name for react-easy-crop is onCropComplete
  const onCropCompleteInternal = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (error) => reject(error));
      // Ensure cross-origin images don't taint the canvas if they are from an external URL
      if (!url.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = url;
    });

  const getCroppedImg = async () => {
    try {
      if (!croppedAreaPixels) {
        console.warn('Waiting for crop area to be ready...');
        return;
      }

      const img = await createImage(image);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size to the cropped pixel dimensions
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // If circular crop, apply clipping path to the canvas
      if (cropShape === 'round') {
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2,
          0,
          Math.PI * 2
        );
        ctx.clip();
      }

      // Draw the specific portion of the source image onto our canvas
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Convert canvas to base64 and pass to parent
      const base64Image = canvas.toDataURL('image/png');
      onCropComplete(base64Image);
    } catch (err) {
      console.error('Failed to crop image:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[95vh]">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur">
          <div>
            <h3 className="text-xl font-bold text-white">Brand Your Identity</h3>
            <p className="text-xs text-zinc-500 mt-1">Adjust your logo for the Empire AI QR Engine</p>
          </div>
          <button onClick={onCancel} className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 bg-zinc-950 min-h-[350px] md:min-h-[400px]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteInternal}
            showGrid={true}
          />
        </div>

        <div className="p-8 space-y-6 bg-zinc-900">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 w-full md:w-auto">
              <button
                onClick={() => { setAspect(1); setCropShape('round'); }}
                className={`flex-1 md:px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${cropShape === 'round' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Circular
              </button>
              <button
                onClick={() => { setAspect(1); setCropShape('rect'); }}
                className={`flex-1 md:px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${cropShape === 'rect' && aspect === 1 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Square
              </button>
              <button
                onClick={() => { setAspect(16 / 9); setCropShape('rect'); }}
                className={`flex-1 md:px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${aspect === 16 / 9 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Wide
              </button>
            </div>

            <div className="flex items-center gap-4 w-full md:w-64">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.01}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="flex-1 cropper-range appearance-none bg-transparent cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-all border border-zinc-700/50"
            >
              Discard
            </button>
            <button
              onClick={getCroppedImg}
              className="flex-[2] py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black rounded-xl font-extrabold shadow-xl shadow-yellow-600/10 transition-all transform active:scale-[0.98]"
            >
              Set Branded Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
