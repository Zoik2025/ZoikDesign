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
    referencePieces: [
      {
        id: 'ref-zoik-1',
        title: 'Lanzamiento Tech — Split Horizontal (4:5)',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&q=80',
        format: '4:5',
        layoutStructure: 'split-left-right',
        hierarchyNotes: 'Titular H1 a la izquierda, badge superior morado, producto 3D a la derecha, botón CTA blanco abajo.',
      },
      {
        id: 'ref-zoik-2',
        title: 'Story Vertical 9:16 — Producto Flotante',
        imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=700&q=80',
        format: '9:16',
        layoutStructure: 'story-vertical',
        hierarchyNotes: 'Logo centrado superior, dispositivo futurista en tercio medio, titular y botón de compra en tercio inferior.',
      },
      {
        id: 'ref-zoik-3',
        title: 'Editorial Minimalista — Portada',
        imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=700&q=80',
        format: '1:1',
        layoutStructure: 'minimal-editorial',
        hierarchyNotes: 'Espacios negativos amplios, logotipo tipográfico centrado, producto estilizado, titular refinado.',
      },
    ],
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
    referencePieces: [
      {
        id: 'ref-aurora-1',
        title: 'Café de Origen — Hero Central',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&q=80',
        format: '4:5',
        layoutStructure: 'hero-center',
        hierarchyNotes: 'Taza y empaque protagonista en el centro, titular inferior en tonos crema, badge dorado de origen.',
      },
      {
        id: 'ref-aurora-2',
        title: 'Promoción Desayunos — Split Clásico',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&q=80',
        format: '1:1',
        layoutStructure: 'split-left-right',
        hierarchyNotes: 'Columna de copys a la izquierda, fotografía cálida a la derecha, botón con esquinas redondeadas.',
      },
    ],
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
    referencePieces: [
      {
        id: 'ref-apex-1',
        title: 'Campaña Atletas — Promo Bold',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
        format: '4:5',
        layoutStructure: 'promo-bold',
        hierarchyNotes: 'Titulares en Syne Extrabold, calzado deportivo suspendido con sombra, badge de descuento llamativo.',
      },
      {
        id: 'ref-apex-2',
        title: 'Reel Vertical — Nueva Temporada',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&q=80',
        format: '9:16',
        layoutStructure: 'story-vertical',
        hierarchyNotes: 'Composición dinámica para Stories, logotipo superior nítido, CTA de alto contraste abajo.',
      },
    ],
  },
];

const STORAGE_KEY = 'zoik_brand_kits_v2';

export function getSavedBrands(): BrandKit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BRANDS));
      return DEFAULT_BRANDS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_BRANDS;

    // Migrate any brand missing referencePieces
    const migrated = parsed.map(brand => {
      if (!brand.referencePieces || brand.referencePieces.length === 0) {
        const defaultMatch = DEFAULT_BRANDS.find(d => d.id === brand.id);
        return {
          ...brand,
          referencePieces: defaultMatch?.referencePieces || [
            {
              id: `ref-${Date.now()}-1`,
              title: `${brand.name} — Referencia Base`,
              imageUrl: brand.samplePieces?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&q=80',
              format: '4:5',
              layoutStructure: 'hero-center',
              hierarchyNotes: 'Distribución equilibrada según manual de marca',
            }
          ]
        };
      }
      return brand;
    });

    return migrated;
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
