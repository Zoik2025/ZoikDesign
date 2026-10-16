export interface FontOption {
  name: string;
  category: 'Display & Bold' | 'Modern Sans' | 'Luxury Serif' | 'Cyber & Tech' | 'Script & Creative';
  sampleText?: string;
}

export const FONT_CATALOG: FontOption[] = [
  // Display & Bold (Titulares de alto impacto)
  { name: 'Montserrat', category: 'Display & Bold' },
  { name: 'Bebas Neue', category: 'Display & Bold' },
  { name: 'Oswald', category: 'Display & Bold' },
  { name: 'Anton', category: 'Display & Bold' },
  { name: 'Space Grotesk', category: 'Display & Bold' },
  { name: 'Syne', category: 'Display & Bold' },
  { name: 'Archivo Black', category: 'Display & Bold' },
  { name: 'Righteous', category: 'Display & Bold' },
  { name: 'Russo One', category: 'Display & Bold' },
  { name: 'Outfit', category: 'Display & Bold' },
  { name: 'Bangers', category: 'Display & Bold' },
  { name: 'Alfa Slab One', category: 'Display & Bold' },
  { name: 'Titan One', category: 'Display & Bold' },
  { name: 'Paytone One', category: 'Display & Bold' },
  { name: 'Black Han Sans', category: 'Display & Bold' },
  { name: 'Abril Fatface', category: 'Display & Bold' },
  { name: 'Bungee', category: 'Display & Bold' },
  { name: 'Rubik Mono One', category: 'Display & Bold' },
  { name: 'Ultra', category: 'Display & Bold' },
  { name: 'Passion One', category: 'Display & Bold' },
  { name: 'Chango', category: 'Display & Bold' },
  { name: 'Teko', category: 'Display & Bold' },
  { name: 'Fugaz One', category: 'Display & Bold' },
  { name: 'Shrikhand', category: 'Display & Bold' },

  // Modern Sans (Cuerpo, subtítulos y UI moderna)
  { name: 'Inter', category: 'Modern Sans' },
  { name: 'Poppins', category: 'Modern Sans' },
  { name: 'Roboto', category: 'Modern Sans' },
  { name: 'Plus Jakarta Sans', category: 'Modern Sans' },
  { name: 'DM Sans', category: 'Modern Sans' },
  { name: 'Work Sans', category: 'Modern Sans' },
  { name: 'Manrope', category: 'Modern Sans' },
  { name: 'Lato', category: 'Modern Sans' },
  { name: 'Open Sans', category: 'Modern Sans' },
  { name: 'Nunito', category: 'Modern Sans' },
  { name: 'Rubik', category: 'Modern Sans' },
  { name: 'Raleway', category: 'Modern Sans' },
  { name: 'Barlow', category: 'Modern Sans' },
  { name: 'Urbanist', category: 'Modern Sans' },
  { name: 'Kanit', category: 'Modern Sans' },
  { name: 'Fira Sans', category: 'Modern Sans' },
  { name: 'Mulish', category: 'Modern Sans' },
  { name: 'Quicksand', category: 'Modern Sans' },
  { name: 'Public Sans', category: 'Modern Sans' },
  { name: 'Figtree', category: 'Modern Sans' },
  { name: 'Lexend', category: 'Modern Sans' },
  { name: 'Albert Sans', category: 'Modern Sans' },
  { name: 'Red Hat Display', category: 'Modern Sans' },
  { name: 'Sora', category: 'Modern Sans' },
  { name: 'Epilogue', category: 'Modern Sans' },

  // Luxury & Editorial Serif (Moda, perfumería, inmobiliaria, lujo)
  { name: 'Playfair Display', category: 'Luxury Serif' },
  { name: 'Cinzel', category: 'Luxury Serif' },
  { name: 'Cinzel Decorative', category: 'Luxury Serif' },
  { name: 'Cormorant Garamond', category: 'Luxury Serif' },
  { name: 'Bodoni Moda', category: 'Luxury Serif' },
  { name: 'Lora', category: 'Luxury Serif' },
  { name: 'Prata', category: 'Luxury Serif' },
  { name: 'Merriweather', category: 'Luxury Serif' },
  { name: 'Libre Baskerville', category: 'Luxury Serif' },
  { name: 'EB Garamond', category: 'Luxury Serif' },
  { name: 'Marcellus', category: 'Luxury Serif' },
  { name: 'DM Serif Display', category: 'Luxury Serif' },
  { name: 'Castoro', category: 'Luxury Serif' },
  { name: 'Spectral', category: 'Luxury Serif' },
  { name: 'Rozha One', category: 'Luxury Serif' },
  { name: 'Italianno', category: 'Luxury Serif' },
  { name: 'Oranienbaum', category: 'Luxury Serif' },
  { name: 'Yeseva One', category: 'Luxury Serif' },
  { name: 'Fraunces', category: 'Luxury Serif' },

  // Cyber & Tech (Futurista, gaming, cripto, e-sports)
  { name: 'Orbitron', category: 'Cyber & Tech' },
  { name: 'Chakra Petch', category: 'Cyber & Tech' },
  { name: 'Bruno Ace SC', category: 'Cyber & Tech' },
  { name: 'Share Tech Mono', category: 'Cyber & Tech' },
  { name: 'Exo 2', category: 'Cyber & Tech' },
  { name: 'Rajdhani', category: 'Cyber & Tech' },
  { name: 'Audiowide', category: 'Cyber & Tech' },
  { name: 'Michroma', category: 'Cyber & Tech' },
  { name: 'Syncopate', category: 'Cyber & Tech' },
  { name: 'Electrolize', category: 'Cyber & Tech' },
  { name: 'Nova Square', category: 'Cyber & Tech' },
  { name: 'Faster One', category: 'Cyber & Tech' },
  { name: 'VT323', category: 'Cyber & Tech' },
  { name: 'Major Mono Display', category: 'Cyber & Tech' },
  { name: 'Press Start 2P', category: 'Cyber & Tech' },
  { name: 'Wallpoet', category: 'Cyber & Tech' },

  // Script & Creative (Caligráficas, urbanas, artesanales)
  { name: 'Dancing Script', category: 'Script & Creative' },
  { name: 'Pacifico', category: 'Script & Creative' },
  { name: 'Caveat', category: 'Script & Creative' },
  { name: 'Great Vibes', category: 'Script & Creative' },
  { name: 'Satisfy', category: 'Script & Creative' },
  { name: 'Permanent Marker', category: 'Script & Creative' },
  { name: 'Sacramento', category: 'Script & Creative' },
  { name: 'Alex Brush', category: 'Script & Creative' },
  { name: 'Yellowtail', category: 'Script & Creative' },
  { name: 'Shadows Into Light', category: 'Script & Creative' },
  { name: 'Kalam', category: 'Script & Creative' },
  { name: 'Courgette', category: 'Script & Creative' },
  { name: 'Allura', category: 'Script & Creative' },
  { name: 'Kaushan Script', category: 'Script & Creative' },
  { name: 'Parisienne', category: 'Script & Creative' },
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
  if (!fontName) return;
  const cleanName = fontName.trim();
  if (loadedFonts.has(cleanName)) return;
  loadedFonts.add(cleanName);

  try {
    const linkId = `google-font-${cleanName.toLowerCase().replace(/\s+/g, '-')}`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,400&display=swap`;
    document.head.appendChild(link);
  } catch (e) {
    console.warn(`No se pudo cargar la fuente: ${cleanName}`, e);
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
