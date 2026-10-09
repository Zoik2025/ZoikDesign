export interface FontOption {
  name: string;
  category: 'Display & Bold' | 'Modern Sans' | 'Luxury Serif' | 'Cyber & Tech';
  sampleText?: string;
}

export const FONT_CATALOG: FontOption[] = [
  // Display & Bold
  { name: 'Space Grotesk', category: 'Display & Bold' },
  { name: 'Syne', category: 'Display & Bold' },
  { name: 'Bebas Neue', category: 'Display & Bold' },
  { name: 'Anton', category: 'Display & Bold' },
  { name: 'Oswald', category: 'Display & Bold' },
  { name: 'Outfit', category: 'Display & Bold' },
  { name: 'Montserrat', category: 'Display & Bold' },
  { name: 'Archivo Black', category: 'Display & Bold' },
  
  // Modern Sans
  { name: 'Plus Jakarta Sans', category: 'Modern Sans' },
  { name: 'Inter', category: 'Modern Sans' },
  { name: 'Poppins', category: 'Modern Sans' },
  { name: 'DM Sans', category: 'Modern Sans' },
  { name: 'Manrope', category: 'Modern Sans' },
  { name: 'Work Sans', category: 'Modern Sans' },
  { name: 'Roboto', category: 'Modern Sans' },

  // Luxury & Editorial Serif
  { name: 'Playfair Display', category: 'Luxury Serif' },
  { name: 'Cinzel', category: 'Luxury Serif' },
  { name: 'Cormorant Garamond', category: 'Luxury Serif' },
  { name: 'Lora', category: 'Luxury Serif' },
  { name: 'Bodoni Moda', category: 'Luxury Serif' },
  { name: 'Prata', category: 'Luxury Serif' },

  // Cyber & Tech
  { name: 'Orbitron', category: 'Cyber & Tech' },
  { name: 'Chakra Petch', category: 'Cyber & Tech' },
  { name: 'Bruno Ace SC', category: 'Cyber & Tech' },
  { name: 'Share Tech Mono', category: 'Cyber & Tech' },
];

export interface PalettePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  backgroundDark: string;
  textPrimary: string;
}

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    id: 'neo-cyber',
    name: 'Neo Cyber (Zoik)',
    primary: '#6366f1',
    secondary: '#06b6d4',
    accent: '#8b5cf6',
    backgroundDark: '#0b0f19',
    textPrimary: '#ffffff',
  },
  {
    id: 'sunset-vibrant',
    name: 'Atardecer Vibrante',
    primary: '#f43f5e',
    secondary: '#fb923c',
    accent: '#facc15',
    backgroundDark: '#181119',
    textPrimary: '#ffffff',
  },
  {
    id: 'luxury-emerald',
    name: 'Esmeralda & Dorado',
    primary: '#10b981',
    secondary: '#d97706',
    accent: '#f59e0b',
    backgroundDark: '#062118',
    textPrimary: '#fef3c7',
  },
  {
    id: 'dark-monochrome',
    name: 'Monocromo Minimal',
    primary: '#e2e8f0',
    secondary: '#94a3b8',
    accent: '#38bdf8',
    backgroundDark: '#0f172a',
    textPrimary: '#f8fafc',
  },
  {
    id: 'coffee-artisan',
    name: 'Café & Cacao Artesanal',
    primary: '#d97706',
    secondary: '#b45309',
    accent: '#f59e0b',
    backgroundDark: '#1c130e',
    textPrimary: '#fef3c7',
  },
  {
    id: 'high-voltage',
    name: 'Alta Energía Eléctrica',
    primary: '#ec4899',
    secondary: '#3b82f6',
    accent: '#84cc16',
    backgroundDark: '#09090b',
    textPrimary: '#ffffff',
  },
];

/**
 * Carga dinámicamente cualquier tipografía de Google Fonts en el DOM en tiempo de ejecución
 */
const loadedFonts = new Set<string>();

export function loadGoogleFont(fontName: string): void {
  if (!fontName || loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);

  try {
    const linkId = `google-font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,400&display=swap`;
    document.head.appendChild(link);
  } catch (e) {
    console.warn(`No se pudo cargar la fuente: ${fontName}`, e);
  }
}

/**
 * Calcula el ratio de contraste entre dos colores HEX según WCAG 2.1
 */
export function getContrastScore(hex1: string, hex2: string): { ratio: number; level: string; color: string } {
  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const rounded = Math.round(ratio * 10) / 10;

    if (rounded >= 7) {
      return { ratio: rounded, level: 'AAA Excelente', color: '#10b981' };
    } else if (rounded >= 4.5) {
      return { ratio: rounded, level: 'AA Bueno', color: '#06b6d4' };
    } else if (rounded >= 3) {
      return { ratio: rounded, level: 'AA Grande', color: '#f59e0b' };
    } else {
      return { ratio: rounded, level: 'Bajo Contraste', color: '#ef4444' };
    }
  } catch {
    return { ratio: 4.5, level: 'AA Bueno', color: '#06b6d4' };
  }
}

function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
