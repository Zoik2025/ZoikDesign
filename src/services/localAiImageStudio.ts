import { removeImageBackground } from './backgroundRemover';
import type { ApiSettings } from '../types';

export interface AiStudioGenerationOptions {
  prompt: string;
  category?: string;
  cutoutBackground?: boolean;
  aspectRatio?: '9:16' | '4:5' | '1:1' | '16:9';
  selectedEngine?: 'dalle' | 'local-sd' | 'direct';
  localEndpoint?: string;
  apiSettings?: ApiSettings;
}

export interface AiStudioGenerationResult {
  originalUrl: string;
  cutoutUrl?: string;
  displayUrl: string;
  promptUsed: string;
  engineUsed: 'neural-diffusion' | 'local-sd' | 'dalle' | 'studio-fallback';
  title: string;
  isCutout: boolean;
  aspectRatio: string;
}

export interface PromptInspirationPreset {
  id: string;
  category: string;
  icon: string;
  label: string;
  prompt: string;
  aspectRatio: '9:16' | '4:5' | '1:1' | '16:9';
  title: string;
}

export const PROMPT_INSPIRATION_PRESETS: PromptInspirationPreset[] = [
  {
    id: 'dominican-celebration',
    category: 'Personas & Emoción',
    icon: '✨',
    label: 'Mujer Celebrando',
    prompt: 'Mujer celebrando con su celular en la mano alzada, feliz y viendo al cielo con dicha y felicidad, luz de sol caribeña',
    aspectRatio: '9:16',
    title: 'Mujer Celebrando con Celular',
  },
  {
    id: 'sports-football',
    category: 'Deportes',
    icon: '⚽',
    label: 'Fútbol / Delantero',
    prompt: 'Delantero de fútbol celebrando gol eufórico bajo los reflectores de estadio en noche de final',
    aspectRatio: '4:5',
    title: 'Delantero Celebrando Gol',
  },
  {
    id: 'sports-trophy',
    category: 'Deportes',
    icon: '🏆',
    label: 'Trofeo de Campeón',
    prompt: 'Trofeo copa dorada de campeonato con chispas de oro y reflectores oscuros dramáticos',
    aspectRatio: '1:1',
    title: 'Trofeo Copa Dorada',
  },
  {
    id: 'sneaker-futuristic',
    category: 'Sneakers & Moda',
    icon: '👟',
    label: 'Zapatilla Neón Tech',
    prompt: 'Zapatilla deportiva running futurista flotando con salpicaduras de luz neón y textura de carbono',
    aspectRatio: '1:1',
    title: 'Zapatilla Deportiva Red Tech',
  },
  {
    id: 'streetwear-hoodie',
    category: 'Sneakers & Moda',
    icon: '👕',
    label: 'Moda Urbana',
    prompt: 'Modelo joven con sudadera oversize urbana negra en estudio minimalista con luz de borde cinematográfica',
    aspectRatio: '9:16',
    title: 'Modelo Streetwear Minimal',
  },
  {
    id: 'food-burger',
    category: 'Gastronomía',
    icon: '🍔',
    label: 'Hamburguesa Artesanal',
    prompt: 'Hamburguesa gourmet doble carne con queso cheddar fundido y humo caliente sobre fondo oscuro',
    aspectRatio: '1:1',
    title: 'Hamburguesa Gourmet Humo',
  },
  {
    id: 'car-sport',
    category: 'Automotriz',
    icon: '🏎️',
    label: 'Superdeportivo Nocturno',
    prompt: 'Superdeportivo negro brillante en asfalto mojado de noche con faros encendidos y estelas de luz',
    aspectRatio: '16:9',
    title: 'Superdeportivo Stealth',
  },
  {
    id: 'luxury-watch',
    category: 'Lujo & Joyería',
    icon: '⌚',
    label: 'Reloj Suizo de Oro',
    prompt: 'Reloj cronógrafo suizo de oro y cristal de zafiro sobre pedestal de mármol negro con reflejos dorados',
    aspectRatio: '1:1',
    title: 'Cronógrafo Suizo Oro y Zafiro',
  },
];

/**
 * Limpia y traduce prompts en español conversacional
 * a un prompt en inglés enriquecido para redes neuronales de difusión.
 */
export function optimizeAndTranslatePrompt(rawPrompt: string, overrideAspectRatio?: '9:16' | '4:5' | '1:1' | '16:9'): {
  englishPrompt: string;
  width: number;
  height: number;
  aspectRatio: string;
  cleanTitle: string;
} {
  let text = rawPrompt.trim();
  const lower = text.toLowerCase();

  // 1. Detectar proporción de aspecto
  let width = 768;
  let height = 1024;
  let aspectRatio = '4:5';

  if (overrideAspectRatio) {
    aspectRatio = overrideAspectRatio;
    if (overrideAspectRatio === '9:16') {
      width = 576;
      height = 1024;
    } else if (overrideAspectRatio === '16:9') {
      width = 1024;
      height = 576;
    } else if (overrideAspectRatio === '1:1') {
      width = 768;
      height = 768;
    } else if (overrideAspectRatio === '4:5') {
      width = 768;
      height = 960;
    }
  } else if (lower.includes('9:16') || lower.includes('story') || lower.includes('reel') || lower.includes('tiktok') || lower.includes('historia')) {
    width = 576;
    height = 1024;
    aspectRatio = '9:16';
  } else if (lower.includes('16:9') || lower.includes('panor[aá]mico') || lower.includes('horizontal') || lower.includes('banner') || lower.includes('youtube')) {
    width = 1024;
    height = 576;
    aspectRatio = '16:9';
  } else if (lower.includes('1:1') || lower.includes('cuadrad') || lower.includes('feed') || lower.includes('post')) {
    width = 768;
    height = 768;
    aspectRatio = '1:1';
  } else if (lower.includes('4:5') || lower.includes('retrato')) {
    width = 768;
    height = 960;
    aspectRatio = '4:5';
  }

  // 2. Limpieza de introducciones conversacionales en español
  let cleaned = text
    .replace(/^haremos una imagen en la que vemos a\s+/i, '')
    .replace(/^haremos una imagen de\s+/i, '')
    .replace(/^genera una imagen de\s+/i, '')
    .replace(/^crea una imagen de\s+/i, '')
    .replace(/^diseña una imagen de\s+/i, '')
    .replace(/^vemos a\s+/i, '')
    .replace(/^una imagen de\s+/i, '')
    .replace(/quiero que la imagen vaya en formato\s+[0-9:]+\.?/gi, '')
    .replace(/en formato\s+[0-9:]+\.?/gi, '')
    .replace(/formato\s+[0-9:]+\.?/gi, '')
    .replace(/quiero que ella se vea\s+/gi, '')
    .replace(/quiero que el se vea\s+/gi, '')
    .replace(/quiero que se vea\s+/gi, '')
    .replace(/quiero que\s+/gi, '')
    .trim();

  const cleanTitle = cleaned.slice(0, 42) || 'Imagen Generada por IA';

  // 3. Diccionario semántico de traducción español -> inglés para modelos de difusión
  const replacements: [RegExp, string][] = [
    [/\bmujer dominicana\b/gi, 'gorgeous Dominican woman'],
    [/\bdominicana\b/gi, 'Dominican woman'],
    [/\bmujer\b/gi, 'woman'],
    [/\bhombree?\b/gi, 'man'],
    [/\bjoven\b/gi, 'young person'],
    [/\bchica\b/gi, 'young woman'],
    [/\bcelebrando\b/gi, 'celebrating joyfully with excitement'],
    [/\bcon su celular en la mano alzada\b/gi, 'raising her smartphone up in hand'],
    [/\bcelular en la mano\b/gi, 'holding smartphone in hand'],
    [/\bcelular\b|\bm[oó]vil\b|\btel[eé]fono\b/gi, 'smartphone'],
    [/\bmano alzada\b/gi, 'raising hand up in triumph'],
    [/\bmanos alzadas\b/gi, 'raising hands in triumph'],
    [/\bfeliz\b/gi, 'radiant beaming smile'],
    [/\bfelicidad\b/gi, 'pure happiness'],
    [/\bdicha y felicidad\b/gi, 'pure bliss, euphoria and happiness'],
    [/\bdicha\b/gi, 'pure joy and bliss'],
    [/\bviendo al cielo\b/gi, 'looking up towards the sunlit blue sky'],
    [/\bal cielo\b/gi, 'towards the sunlit sky'],
    [/\bcielo\b/gi, 'bright blue sky with soft white clouds'],
    [/\bfutbolista\b/gi, 'professional football player'],
    [/\batleta\b/gi, 'athletic fitness competitor'],
    [/\bbal[oó]n\b/gi, 'soccer ball'],
    [/\bgol\b/gi, 'scoring winning goal'],
    [/\bestadio\b/gi, 'stadium arena floodlights'],
    [/\bzapatillas?\b|\btenis\b/gi, 'athletic running sneakers floating'],
    [/\bauto\b|\bcoche\b/gi, 'sleek black sports supercar'],
    [/\bhamburguesa\b/gi, 'gourmet double cheeseburger with steam'],
    [/\breloj\b/gi, 'luxury Swiss chronograph watch'],
    [/\bperfume\b/gi, 'luxury amber glass perfume bottle'],
    [/\bauriculares?\b|\baud[ií]fonos\b/gi, 'matte black wireless studio headphones'],
    [/\bcomputadora\b|\blaptop\b/gi, 'slim titanium laptop'],
    [/\blluvia\b/gi, 'cinematic rain droplets at night'],
    [/\bne[oó]n\b/gi, 'glowing vibrant neon rim light'],
  ];

  let englishText = cleaned;
  for (const [regex, replacement] of replacements) {
    englishText = englishText.replace(regex, replacement);
  }

  // 4. Enriquecimiento publicitario y de realismo
  const englishPrompt = `${englishText}, cinematic commercial photography, natural warm sunlight, lens flare, sharp focus, 8k resolution, highly detailed, expressive eyes, authentic emotion`;

  return { englishPrompt, width, height, aspectRatio, cleanTitle };
}

/**
 * Genera una imagen neuronal real a partir del prompt del usuario:
 * 1. Prioridad: Servidor local de difusión si existe (localhost:7860).
 * 2. Si no, genera directamente a través del motor neuronal de difusión en tiempo real.
 * 3. Si hay API key de OpenAI y está activada, soporta DALL-E 3.
 * 4. Soporta recorte alfa transparente o fondo de escena completo (9:16, 1:1, etc.).
 */
export async function generateStudioImage({
  prompt,
  category: _category,
  cutoutBackground = false,
  aspectRatio: overrideAspectRatio,
  selectedEngine = 'direct',
  localEndpoint = 'http://127.0.0.1:7860',
  apiSettings,
}: AiStudioGenerationOptions): Promise<AiStudioGenerationResult> {
  const { englishPrompt, width, height, aspectRatio, cleanTitle } = optimizeAndTranslatePrompt(prompt, overrideAspectRatio);

  const NEGATIVE_PROMPT = '(watermark, logo, text, branding, signature:1.6), (deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), mutated hands, mutated fingers, extra fingers, missing fingers, poorly drawn face, bad anatomy, plastic skin, blurry, artifact';

  // 1. SI EL USUARIO ELIGIÓ ESPECÍFICAMENTE MOTOR DE OPENAI
  if (selectedEngine === 'dalle') {
    if (!apiSettings?.openaiApiKey) {
      throw new Error('Se requiere una clave de OpenAI (API Key) para usar este motor. Puedes ingresarla en Preferencias (ícono en la barra superior).');
    }

    const sizeStr = width > height ? '1536x1024' : (height > width ? '1024x1536' : '1024x1024');
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiSettings.openaiApiKey}`,
      },
      body: JSON.stringify({
        prompt: englishPrompt,
        n: 1,
        size: sizeStr,
        model: 'gpt-image-1.5',
      }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson?.error?.message || `Error con OpenAI API: ${res.statusText}`);
    }

    const d = await res.json();
    let imgDataUrl = '';
    if (d.data?.[0]?.b64_json) {
      imgDataUrl = `data:image/png;base64,${d.data[0].b64_json}`;
    } else if (d.data?.[0]?.url) {
      imgDataUrl = d.data[0].url;
    } else {
      throw new Error('OpenAI no devolvió los datos de la imagen generada.');
    }

    let cutoutUrl = imgDataUrl;
    if (cutoutBackground) {
      cutoutUrl = await processCutoutFromUrl(imgDataUrl);
    }
    return {
      originalUrl: imgDataUrl,
      cutoutUrl,
      displayUrl: cutoutBackground ? cutoutUrl : imgDataUrl,
      promptUsed: englishPrompt,
      engineUsed: 'dalle',
      title: cleanTitle,
      isCutout: cutoutBackground,
      aspectRatio,
    };
  }

  // 2. SI EL USUARIO ELIGIÓ SERVIDOR LOCAL (OPCIÓN 3: GPU RTX 3050 - Forge / Automatic1111)
  if (selectedEngine === 'local-sd') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // Dar 60s a la GPU local

      const localCheck = await fetch(`${localEndpoint}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: englishPrompt,
          negative_prompt: NEGATIVE_PROMPT,
          steps: 25,
          width,
          height,
          cfg_scale: 7,
          sampler_name: 'DPM++ 2M Karras',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!localCheck.ok) {
        throw new Error(`El servidor local respondió con estado ${localCheck.status}`);
      }

      const data = await localCheck.json();
      if (!data.images || !data.images[0]) {
        throw new Error('El servidor local no devolvió ninguna imagen en la respuesta.');
      }

      const base64Url = `data:image/png;base64,${data.images[0]}`;
      let cutoutUrl = base64Url;
      if (cutoutBackground) {
        cutoutUrl = await processCutoutFromUrl(base64Url);
      }

      return {
        originalUrl: base64Url,
        cutoutUrl,
        displayUrl: cutoutBackground ? cutoutUrl : base64Url,
        promptUsed: englishPrompt,
        engineUsed: 'local-sd',
        title: cleanTitle,
        isCutout: cutoutBackground,
        aspectRatio,
      };
    } catch (err: any) {
      throw new Error(`No se pudo conectar al servidor local en ${localEndpoint}. Asegúrate de iniciar Stable Diffusion Forge o Automatic1111 con el parámetro --api en tu tarjeta NVIDIA RTX 3050.`);
    }
  }

  // 3. MOTOR AUTOMÁTICO / DIRECTO:
  // Si hay OpenAI Key configurada y activada, usar DALL-E 3 de forma transparente
  if (apiSettings?.enableLiveOpenAi && apiSettings?.openaiApiKey) {
    try {
      const sizeStr = width > height ? '1536x1024' : (height > width ? '1024x1536' : '1024x1024');
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiSettings.openaiApiKey}`,
        },
        body: JSON.stringify({
          prompt: englishPrompt,
          n: 1,
          size: sizeStr,
          model: 'gpt-image-1.5',
        }),
      });

      if (res.ok) {
        const d = await res.json();
        let imgDataUrl = '';
        if (d.data?.[0]?.b64_json) {
          imgDataUrl = `data:image/png;base64,${d.data[0].b64_json}`;
        } else if (d.data?.[0]?.url) {
          imgDataUrl = d.data[0].url;
        }

        if (imgDataUrl) {
          let cutoutUrl = imgDataUrl;
          if (cutoutBackground) {
            cutoutUrl = await processCutoutFromUrl(imgDataUrl);
          }
          return {
            originalUrl: imgDataUrl,
            cutoutUrl,
            displayUrl: cutoutBackground ? cutoutUrl : imgDataUrl,
            promptUsed: englishPrompt,
            engineUsed: 'dalle',
            title: cleanTitle,
            isCutout: cutoutBackground,
            aspectRatio,
          };
        }
      }
    } catch (openAiErr) {
      console.warn('Llamada a OpenAI falló, recurriendo a motor directo:', openAiErr);
    }
  }

  // 4. MOTOR DE SÍNTESIS DIRECTO (CERO COSTO) CON ELIMINACIÓN DE MARCAS DE AGUA
  try {
    const randomSeed = Math.floor(Math.random() * 900000) + 100000;
    const encoded = encodeURIComponent(englishPrompt);
    const neuralUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${randomSeed}&model=turbo`;

    const imageResponse = await fetch(neuralUrl, { method: 'GET' });
    if (imageResponse.ok) {
      const blob = await imageResponse.blob();
      const rawBase64 = await blobToDataUrl(blob);

      // Eliminar permanentemente la franja inferior con marca de agua
      const cleanBase64 = await removeWatermarkBanner(rawBase64);

      let cutoutUrl: string | undefined = undefined;
      if (cutoutBackground) {
        try {
          cutoutUrl = await processCutoutFromUrl(cleanBase64);
        } catch {
          cutoutUrl = cleanBase64;
        }
      }

      return {
        originalUrl: cleanBase64,
        cutoutUrl,
        displayUrl: cutoutBackground && cutoutUrl ? cutoutUrl : cleanBase64,
        promptUsed: englishPrompt,
        engineUsed: 'neural-diffusion',
        title: cleanTitle,
        isCutout: cutoutBackground,
        aspectRatio,
      };
    }
  } catch (neuralErr) {
    console.warn('Error en conexión con motor de difusión:', neuralErr);
  }

  // 5. Fallback si no hay conexión
  const matchedPreset = PROMPT_INSPIRATION_PRESETS.find((p) => {
    const kws = p.prompt.toLowerCase().split(/\s+/).concat(p.title.toLowerCase().split(/\s+/));
    return kws.some((w) => w.length > 4 && prompt.toLowerCase().includes(w));
  }) || PROMPT_INSPIRATION_PRESETS[0];

  const fallbackUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=88';
  return {
    originalUrl: fallbackUrl,
    displayUrl: fallbackUrl,
    promptUsed: englishPrompt,
    engineUsed: 'studio-fallback',
    title: matchedPreset.title,
    isCutout: false,
    aspectRatio,
  };
}

/**
 * Convierte un Blob a DataURL base64
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Carga una imagen en memoria y le aplica el algoritmo de recorte inteligente
 */
async function processCutoutFromUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const transparentDataUrl = await removeImageBackground(img, 32);
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

/**
 * Elimina permanentemente la franja inferior con marca de agua recortando la base
 */
async function removeWatermarkBanner(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Si la imagen es muy pequeña no recortamos
      const bannerHeight = Math.round(img.height * 0.045); // ~4.5% inferior
      if (img.height <= bannerHeight * 2 || bannerHeight <= 0) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height - bannerHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(
        img,
        0, 0, img.width, img.height - bannerHeight,
        0, 0, img.width, img.height - bannerHeight
      );
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

