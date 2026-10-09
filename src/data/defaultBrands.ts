import type { BrandKit } from '../types';

export const DEFAULT_BRANDS: BrandKit[] = [
  {
    id: 'zoik-tech',
    name: 'Zoik Tech & Studios',
    tagline: 'Diseño Algorítmico & Futuro Creativo',
    industry: 'Tecnología & Diseño 2026',
    tone: 'cyber',
    colors: {
      primary: '#6366f1', // Indigo Vibrant
      secondary: '#06b6d4', // Cyan Neon
      accent: '#8b5cf6', // Violet
      backgroundDark: '#0b0f19', // Deep Space Navy
      backgroundLight: '#f8fafc',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
    },
    typography: {
      headlineFont: 'Space Grotesk',
      bodyFont: 'Plus Jakarta Sans',
      accentFont: 'Syne',
    },
    logo: {
      symbolText: 'Z',
      fullText: 'ZOIK STUDIOS',
    },
    website: 'zoikdesign.com',
    contactHandle: '@zoikdesign',
  },
  {
    id: 'aurora-coffee',
    name: 'Aurora Coffee Roasters',
    tagline: 'Café de Especialidad Tostado en Origen',
    industry: 'Gastronomía & Lifestyle Gourmet',
    tone: 'elegant',
    colors: {
      primary: '#d97706', // Ámbar Tostado
      secondary: '#b45309', // Caramelo Oscuro
      accent: '#f59e0b', // Dorado Miel
      backgroundDark: '#1c130e', // Café Espresso Profundo
      backgroundLight: '#fef3c7',
      textPrimary: '#fef3c7',
      textSecondary: '#d6c7b2',
    },
    typography: {
      headlineFont: 'Outfit',
      bodyFont: 'Plus Jakarta Sans',
      accentFont: 'Space Grotesk',
    },
    logo: {
      symbolText: '☕',
      fullText: 'AURORA COFFEE',
    },
    website: 'auroracoffee.store',
    contactHandle: '@auroracoffee',
  },
  {
    id: 'apex-fitwear',
    name: 'Apex Athletic Pro',
    tagline: 'Rendimiento Extremo para Atletas',
    industry: 'Sportswear & Fitness High-Tech',
    tone: 'bold',
    colors: {
      primary: '#ef4444', // Rojo Deportivo
      secondary: '#f97316', // Naranja Aceleración
      accent: '#22c55e', // Verde Neón
      backgroundDark: '#09090b', // Negro Carbón
      backgroundLight: '#f4f4f5',
      textPrimary: '#ffffff',
      textSecondary: '#a1a1aa',
    },
    typography: {
      headlineFont: 'Syne',
      bodyFont: 'Plus Jakarta Sans',
      accentFont: 'Space Grotesk',
    },
    logo: {
      symbolText: '▲',
      fullText: 'APEX PRO',
    },
    website: 'apexfitwear.io',
    contactHandle: '@apexfitwear',
  },
];

const STORAGE_KEY = 'zoik_brand_kits_v1';

export function getSavedBrands(): BrandKit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BRANDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BRANDS;
  } catch {
    return DEFAULT_BRANDS;
  }
}

export function saveBrandToStorage(brand: BrandKit): BrandKit[] {
  const current = getSavedBrands();
  const existingIdx = current.findIndex(b => b.id === brand.id);
  let updated: BrandKit[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = brand;
  } else {
    updated = [brand, ...current];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
