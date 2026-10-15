export type DocumentUnit = 'px' | 'cm' | 'mm' | 'm' | 'in';
export type ColorMode = 'RGB' | 'CMYK';

export interface DocumentConfig {
  title: string;
  width: number; // ancho real en píxeles para el canvas
  height: number; // alto real en píxeles para el canvas
  displayValueWidth: number; // valor introducido por el usuario (ej: 21)
  displayValueHeight: number; // valor introducido por el usuario (ej: 29.7)
  unit: DocumentUnit;
  colorMode: ColorMode;
  dpi: number; // 72, 150, 300
  orientation: 'portrait' | 'landscape';
}

export interface BrandReferencePiece {
  id: string;
  title: string;
  imageUrl: string;
  format?: '1:1' | '4:5' | '9:16' | '16:9' | 'custom';
  layoutStructure: 'hero-center' | 'split-left-right' | 'minimal-editorial' | 'promo-bold' | 'story-vertical';
  hierarchyNotes?: string;
}

export interface BrandKit {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  tone: 'modern' | 'minimal' | 'bold' | 'elegant' | 'cyber' | 'playful';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    backgroundDark: string;
    backgroundLight: string;
    textPrimary: string;
    textSecondary: string;
  };
  typography: {
    headlineFont: string;
    bodyFont: string;
    accentFont: string;
  };
  logo: {
    symbolText: string;
    fullText: string;
    imageUrl?: string;
    svgMarkup?: string;
  };
  website: string;
  contactHandle: string;
  samplePieces?: string[]; // Backwards compatibility
  referencePieces?: BrandReferencePiece[]; // Piezas de referencia que guían la estructura y jerarquías
}

export type EditorTool = 
  | 'select' 
  | 'direct-select' 
  | 'pen' 
  | 'text' 
  | 'shape-rect' 
  | 'shape-circle' 
  | 'line' 
  | 'eyedropper' 
  | 'hand' 
  | 'zoom' 
  | 'image-upload' 
  | 'remove-bg' 
  | 'ai-wand';

export interface PieceCopyInput {
  headline: string;
  subtitle: string;
  badgeText?: string;
  ctaText?: string;
  subjectImageUrl?: string; // Foto o imagen opcional del producto/sujeto
}

export interface CanvasFormat {
  id: string;
  name: string;
  label: string;
  width: number;
  height: number;
  category: 'social' | 'print' | 'banner';
  aspectRatioLabel: string;
}

export type CompositionStyle = 
  | 'hero-center' 
  | 'split-left-right' 
  | 'minimal-editorial' 
  | 'promo-bold' 
  | 'story-vertical'
  | 'cyber-tech'
  | 'sports-impact';

export interface DesignLayer {
  id: string;
  name: string;
  type: 'background' | 'decoration' | 'visual-asset' | 'logo' | 'headline' | 'subtitle' | 'badge' | 'cta-button' | 'footer-url';
  content?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  textShadow?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  imageUrl?: string;
  svgIcon?: string;
  visible: boolean;
  locked: boolean;
  badgeBg?: string;
  badgeColor?: string;
}

export interface ApiSettings {
  openaiApiKey: string;
  freepikApiKey: string;
  enableLiveOpenAi: boolean;
}
