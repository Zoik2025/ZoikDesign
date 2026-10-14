import type { BrandKit } from '../types';

// Sin marcas prediseñadas: Todo inicia desde cero para que el usuario configure su propio ecosistema
export const DEFAULT_BRANDS: BrandKit[] = [];

const STORAGE_KEY = 'zoik_brand_kits_v4_scratch';

export function createEmptyBrand(name: string = 'Mi Marca'): BrandKit {
  return {
    id: `brand-${Date.now()}`,
    name,
    tagline: 'Eslogan y propuesta de valor',
    industry: 'Diseño & Comercio',
    tone: 'modern',
    colors: {
      primary: '#0d66d0',
      secondary: '#388bff',
      accent: '#f59e0b',
      backgroundDark: '#121212',
      backgroundLight: '#f4f4f5',
      textPrimary: '#ffffff',
      textSecondary: '#a1a1aa',
    },
    typography: {
      headlineFont: 'Montserrat',
      bodyFont: 'Inter',
      accentFont: 'Space Grotesk',
    },
    logo: {
      symbolText: name.charAt(0).toUpperCase() || 'M',
      fullText: name.toUpperCase(),
    },
    website: '',
    contactHandle: '',
    referencePieces: [],
  };
}

export function getSavedBrands(): BrandKit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
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

export function deleteBrandFromStorage(brandId: string): BrandKit[] {
  const current = getSavedBrands();
  const updated = current.filter(b => b.id !== brandId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
