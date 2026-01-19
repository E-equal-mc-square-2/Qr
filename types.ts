
export interface QRConfig {
  url: string; // Used for both the URL and the raw text content
  mode: 'url' | 'text';
  photoAsset: string | null; // Keep for legacy/background compatibility
  logo: string | null;
  background: string | null;
  eyeColor: string;
  moduleColor: string;
  boxSize: number;
  isAnimated: boolean;
  eyeShape: 'square' | 'rounded' | 'circle';
  moduleShape: 'square' | 'rounded' | 'circle';
  gradientStart: string;
  gradientEnd: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface HistoryItem {
  id: string;
  config: QRConfig;
  timestamp: number;
  active: boolean;
}

export enum QRCodeErrorCorrection {
  LOW = 'L',
  MEDIUM = 'M',
  QUARTILE = 'Q',
  HIGH = 'H'
}
