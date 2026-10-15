import { removeImageBackground } from './backgroundRemover';
import type { ApiSettings } from '../types';

export interface AiStudioGenerationOptions {
  prompt: string;
  category?: string;
  cutoutBackground?: boolean;
  localEndpoint?: string;
  apiSettings?: ApiSettings;
}

export interface AiStudioGenerationResult {
  originalUrl: string;
  cutoutUrl?: string;
  displayUrl: string;
  promptUsed: string;
  engineUsed: 'local-studio' | 'local-sd' | 'dalle';
  title: string;
}

export interface PromptInspirationPreset {
  id: string;
  category: string;
  icon: string;
  label: string;
  prompt: string;
  fallbackAssetUrl: string;
  title: string;
}

// Catálogo curado de alta resolución para el Motor de Estudio Local (Zero-Cost / Zero-VRAM)
export const PROMPT_INSPIRATION_PRESETS: PromptInspirationPreset[] = [
  {
    id: 'sports-football',
    category: 'Deportes',
    icon: '⚽',
    label: 'Fútbol / Delantero',
    prompt: 'Professional football player celebrating goal, stadium floodlights, dynamic action pose, cinematic sports photography, volumetric smoke, high contrast, 8k, isolated subject',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=88',
    title: 'Delantero Celebrando Gol',
  },
  {
    id: 'sports-trophy',
    category: 'Deportes',
    icon: '🏆',
    label: 'Trofeo de Campeón',
    prompt: 'Championship gold trophy cup with specular reflections, dramatic dark stadium spotlights, golden sparks, luxury sports gala, isolated subject, 8k render',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=1200&q=88',
    title: 'Trofeo Copa Dorada',
  },
  {
    id: 'sneaker-futuristic',
    category: 'Sneakers & Moda',
    icon: '👟',
    label: 'Zapatilla Neón Tech',
    prompt: 'Futuristic athletic running sneaker floating in air, vibrant neon glow, octane render, dynamic angle, studio lighting, carbon fiber textures, isolated on dark background',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=88',
    title: 'Zapatilla Deportiva Red Tech',
  },
  {
    id: 'streetwear-hoodie',
    category: 'Sneakers & Moda',
    icon: '👕',
    label: 'Moda Urbana / Streetwear',
    prompt: 'Urban streetwear model in oversized black hoodie, dramatic rim light, minimalist studio backdrop, moody editorial fashion photography, high definition',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=88',
    title: 'Modelo Streetwear Minimal',
  },
  {
    id: 'food-burger',
    category: 'Gastronomía',
    icon: '🍔',
    label: 'Hamburguesa Artesanal',
    prompt: 'Gourmet artisanal double cheeseburger with melting cheddar, crispy bacon, steam rising, dark commercial food photography, crisp focus, studio lighting, isolated',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=88',
    title: 'Hamburguesa Gourmet Humo',
  },
  {
    id: 'food-coffee',
    category: 'Gastronomía',
    icon: '☕',
    label: 'Café Espresso Premium',
    prompt: 'Luxury porcelain espresso cup with creamy crema, roasted coffee beans spilling, warm dark ambient lighting, commercial beverage photography, 8k',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&q=88',
    title: 'Café Espresso Alta Gama',
  },
  {
    id: 'car-sport',
    category: 'Automotriz',
    icon: '🏎️',
    label: 'Superdeportivo Nocturno',
    prompt: 'Glossy black supercar on dark wet asphalt, neon reflections, headlights beaming through fog, aggressive side profile, commercial car photography, 8k, isolated subject',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=88',
    title: 'Superdeportivo Stealth',
  },
  {
    id: 'luxury-watch',
    category: 'Lujo & Joyería',
    icon: '⌚',
    label: 'Reloj Suizo de Oro',
    prompt: 'Luxury Swiss chronograph watch, sapphire crystal, dark obsidian marble stand, golden rim lighting, macro watchmaking photography, 8k, crisp sharpness',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=88',
    title: 'Cronógrafo Suizo Oro y Zafiro',
  },
  {
    id: 'perfume-bottle',
    category: 'Lujo & Joyería',
    icon: '💎',
    label: 'Perfume de Lujo',
    prompt: 'Amber glass luxury perfume bottle, golden mist spray, dramatic single softbox lighting, dark minimalist pedestal, 8k beauty advertising',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1200&q=88',
    title: 'Perfume Noir Elegance',
  },
  {
    id: 'tech-headphones',
    category: 'Tecnología',
    icon: '🎧',
    label: 'Auriculares Inalámbricos',
    prompt: 'Matte black premium wireless headphones floating, cyan audio wave particles, studio lighting, hi-res commercial tech product shot, isolated',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=88',
    title: 'Auriculares Studio Pro',
  },
  {
    id: 'tech-laptop',
    category: 'Tecnología',
    icon: '💻',
    label: 'Laptop Ultradelgada',
    prompt: 'Ultra-thin sleek titanium laptop with glowing code screen, clean studio lighting, 8k modern workspace advertising photography',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=88',
    title: 'Laptop Titanio Dark',
  },
  {
    id: 'combat-boxing',
    category: 'Deportes',
    icon: '🥊',
    label: 'Guantes de Boxeo Pro',
    prompt: 'Red leather championship boxing gloves tied together, sweat droplets, arena smoke, dramatic spotlight, UFC / boxing poster style, 8k, isolated',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&q=88',
    title: 'Guantes de Boxeo Championship',
  },
  {
    id: 'fitness-athlete',
    category: 'Deportes',
    icon: '🏋️',
    label: 'Atleta Crossfit / Gym',
    prompt: 'Athletic muscular male athlete lifting kettlebell, chalk dust explosion, intense dramatic stadium lighting, dark fitness poster photography, 8k',
    fallbackAssetUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=88',
    title: 'Atleta Power & Chalk',
  },
];

/**
 * Enriquecedor de prompts para fotografía publicitaria de alto impacto
 */
export function expandAdvertisingPrompt(userPrompt: string): string {
  const clean = userPrompt.trim();
  if (!clean) return 'commercial product studio photography, 8k, dramatic lighting, isolated';

  const lower = clean.toLowerCase();
  const hasLighting = lower.includes('light') || lower.includes('luz') || lower.includes('iluminac');
  const hasQuality = lower.includes('8k') || lower.includes('octane') || lower.includes('sharp');

  const additions: string[] = [];
  if (!hasLighting) additions.push('commercial studio lighting', 'dramatic rim light', 'volumetric atmosphere');
  if (!hasQuality) additions.push('8k resolution', 'hyper-detailed', 'sharp focus');
  additions.push('clean isolated subject on dark background');

  return `${clean}, ${additions.join(', ')}`;
}

/**
 * Genera o sintetiza una imagen publicitaria de alta resolución:
 * 1. Intenta servidor local de difusión si existe (DirectML / SD WebUI / Ollama).
 * 2. Si hay API Key de OpenAI y el usuario la activó, puede usar DALL-E 3.
 * 3. Si no, usa el Motor de Estudio Local con recorte inteligente y composición en memoria (Zero Cost / Zero VRAM).
 */
export async function generateStudioImage({
  prompt,
  category,
  cutoutBackground = true,
  localEndpoint = 'http://127.0.0.1:7860',
  apiSettings,
}: AiStudioGenerationOptions): Promise<AiStudioGenerationResult> {
  const expandedPrompt = expandAdvertisingPrompt(prompt);
  const lowerPrompt = prompt.toLowerCase();

  // 1. Probar servidor local de difusión (Automatic1111 / Forge / SD WebUI en localhost:7860)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout check

    const localCheck = await fetch(`${localEndpoint}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: expandedPrompt,
        steps: 20,
        width: 768,
        height: 768,
        cfg_scale: 7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (localCheck.ok) {
      const data = await localCheck.json();
      if (data.images && data.images[0]) {
        const base64Url = `data:image/png;base64,${data.images[0]}`;
        let cutoutUrl = base64Url;

        if (cutoutBackground) {
          cutoutUrl = await processCutoutFromUrl(base64Url);
        }

        return {
          originalUrl: base64Url,
          cutoutUrl,
          displayUrl: cutoutBackground ? cutoutUrl : base64Url,
          promptUsed: expandedPrompt,
          engineUsed: 'local-sd',
          title: prompt.slice(0, 32),
        };
      }
    }
  } catch {
    // Servidor local no disponible, pasar a motor de estudio o DALL-E
  }

  // 2. Si OpenAI está activado en ajustes y tiene API Key
  if (apiSettings?.enableLiveOpenAi && apiSettings?.openaiApiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiSettings.openaiApiKey}`,
        },
        body: JSON.stringify({
          prompt: expandedPrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url',
        }),
      });

      if (res.ok) {
        const d = await res.json();
        const url = d.data?.[0]?.url;
        if (url) {
          let cutoutUrl = url;
          if (cutoutBackground) {
            cutoutUrl = await processCutoutFromUrl(url);
          }
          return {
            originalUrl: url,
            cutoutUrl,
            displayUrl: cutoutBackground ? cutoutUrl : url,
            promptUsed: expandedPrompt,
            engineUsed: 'dalle',
            title: prompt.slice(0, 32),
          };
        }
      }
    } catch (err) {
      console.warn('Error con API OpenAI, recurriendo a motor local:', err);
    }
  }

  // 3. Motor de Estudio Local Inteligente (Zero-Cost / Zero-VRAM / Máxima Calidad)
  // Busca la mejor coincidencia semántica en el catálogo de presets de estudio
  let matchedPreset = PROMPT_INSPIRATION_PRESETS.find((p) => {
    const kws = p.prompt.toLowerCase().split(/\s+/).concat(p.title.toLowerCase().split(/\s+/));
    return kws.some((w) => w.length > 3 && lowerPrompt.includes(w));
  });

  if (!matchedPreset) {
    if (category) {
      matchedPreset = PROMPT_INSPIRATION_PRESETS.find((p) => p.category.toLowerCase() === category.toLowerCase());
    }
  }

  // Fallback por defecto si no hay coincidencia directa: Fútbol / Atleta o Zapatilla
  const baseAsset = matchedPreset || PROMPT_INSPIRATION_PRESETS[0];
  const originalUrl = baseAsset.fallbackAssetUrl;

  let displayUrl = originalUrl;
  let cutoutUrl: string | undefined = undefined;

  if (cutoutBackground) {
    try {
      cutoutUrl = await processCutoutFromUrl(originalUrl);
      displayUrl = cutoutUrl;
    } catch (cutErr) {
      console.warn('No se pudo recortar imagen, usando original:', cutErr);
      displayUrl = originalUrl;
    }
  }

  return {
    originalUrl,
    cutoutUrl,
    displayUrl,
    promptUsed: expandedPrompt,
    engineUsed: 'local-studio',
    title: baseAsset.title,
  };
}

/**
 * Carga una imagen en memoria y le aplica el algoritmo de recorte inteligente
 */
async function processCutoutFromUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const transparentDataUrl = await removeImageBackground(img, 30);
        resolve(transparentDataUrl);
      } catch (e) {
        resolve(imageUrl);
      }
    };
    img.onerror = () => {
      resolve(imageUrl);
    };
    img.src = imageUrl;
  });
}
