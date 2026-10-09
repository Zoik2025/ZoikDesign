import type { ApiSettings } from '../types';

export interface VisualAssetResult {
  url: string;
  source: 'dalle' | 'curated' | 'fallback';
  alt: string;
}

// Curated high-resolution studio assets with transparent or neutral backgrounds
const CURATED_ASSETS: { keywords: string[]; url: string; alt: string }[] = [
  {
    keywords: ['zapatilla', 'sneaker', 'calzado', 'running', 'deporte', 'sport', 'nike', 'tenis'],
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=85',
    alt: 'Zapatilla Deportiva Red Tech',
  },
  {
    keywords: ['café', 'cafe', 'coffee', 'taza', 'grano', 'espresso', 'barista', 'cappuccino'],
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=85',
    alt: 'Taza de Café Espresso Premium',
  },
  {
    keywords: ['hamburguesa', 'burger', 'comida', 'food', 'restaurante', 'snack', 'almuerzo'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=85',
    alt: 'Hamburguesa Gourmet Artesanal',
  },
  {
    keywords: ['auricular', 'audifono', 'headphone', 'audio', 'musica', 'sonido', 'sound'],
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85',
    alt: 'Auriculares de Estudio Inalámbricos',
  },
  {
    keywords: ['reloj', 'watch', 'smartwatch', 'cronografo', 'elegante', 'joya', 'lujo'],
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85',
    alt: 'Reloj Minimalista de Precisión',
  },
  {
    keywords: ['perfume', 'fragancia', 'cosmetica', 'belleza', 'skincare', 'crema', 'serum'],
    url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=85',
    alt: 'Frasco de Perfume de Lujo',
  },
  {
    keywords: ['computadora', 'laptop', 'tecnologia', 'macbook', 'pc', 'software', 'codigo', 'tech'],
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85',
    alt: 'Laptop Ultradelgada Tech',
  },
  {
    keywords: ['auto', 'car', 'coche', 'vehiculo', 'motor', 'carrera'],
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=85',
    alt: 'Vehículo Deportivo Futurista',
  },
  {
    keywords: ['ropa', 'moda', 'fashion', 'camiseta', 'prenda', 'textil', 'vestir'],
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=85',
    alt: 'Prenda de Moda Urbana',
  },
  {
    keywords: ['camara', 'fotografia', 'foto', 'lente', 'video', 'cine'],
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=85',
    alt: 'Cámara Fotográfica Profesional',
  },
];

const DEFAULT_ASSET = {
  url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=85',
  alt: 'Escultura 3D Abstracta Neón',
};

/**
 * Obtiene o genera la imagen para la pieza publicitaria
 */
export async function resolveVisualAsset(
  subjectPrompt: string,
  brief: string,
  provider: 'dalle' | 'freepik' | 'curated-render',
  apiSettings: ApiSettings
): Promise<VisualAssetResult> {
  const combinedText = `${subjectPrompt} ${brief}`.toLowerCase();

  // 1. OpenAI DALL-E si está configurado y seleccionado
  if (provider === 'dalle' && apiSettings.openaiApiKey) {
    try {
      const promptToUse = subjectPrompt.trim() 
        ? `${subjectPrompt}, commercial studio product photography, clean minimalist studio lighting, high resolution 8k, sharp focus, isolated on solid dark background`
        : `commercial product for ${brief || 'modern brand advertisement'}, studio product photography, elegant lighting, 8k, dark clean background`;

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSettings.openaiApiKey}`,
        },
        body: JSON.stringify({
          prompt: promptToUse,
          n: 1,
          size: '1024x1024',
          response_format: 'url',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data[0]?.url) {
          return {
            url: data.data[0].url,
            source: 'dalle',
            alt: subjectPrompt || 'Generado con OpenAI DALL-E',
          };
        }
      }
    } catch (err) {
      console.warn('Error al llamar a DALL-E, recurriendo a banco curado:', err);
    }
  }

  // 2. Coincidencia inteligente en banco curado por palabras clave
  for (const asset of CURATED_ASSETS) {
    for (const kw of asset.keywords) {
      if (combinedText.includes(kw)) {
        return {
          url: asset.url,
          source: 'curated',
          alt: asset.alt,
        };
      }
    }
  }

  // 3. Fallback de alta estética 3D
  return {
    url: DEFAULT_ASSET.url,
    source: 'fallback',
    alt: DEFAULT_ASSET.alt,
  };
}
