import { fabric } from 'fabric';
import type { BrandKit, DocumentConfig, PieceCopyInput, CompositionStyle } from '../types';
import { loadGoogleFont } from '../data/typographyAndColors';

export interface OpenAiSvgDesignParams {
  canvas: fabric.Canvas;
  docConfig: DocumentConfig;
  copyInput: PieceCopyInput;
  brand: BrandKit;
  apiKey: string;
  compositionStyle?: CompositionStyle;
  selectedReferenceId?: string;
  variationSeed?: number;
  onProgress?: (status: string) => void;
}

export interface OpenAiSvgDesignResult {
  success: boolean;
  rawSvg?: string;
  error?: string;
  tokenUsage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Redimensiona y comprime una imagen a JPEG optimizado (máx 1024px) para OpenAI Vision.
 * NO activa crossOrigin en URIs de tipo data: para evitar bloqueos del navegador.
 */
async function resizeImageForVision(dataUrl: string, maxDim = 1024): Promise<string> {
  if (!dataUrl) return dataUrl;
  if (!dataUrl.startsWith('data:image')) return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    if (dataUrl.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      try {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(dataUrl);
        }
      } catch (err) {
        console.warn('Fallo redimensionando imagen para visión, usando original:', err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Extrae todas las fuentes tipográficas mencionadas en el SVG
 * para cargarlas de Google Fonts dinámicamente en el DOM.
 */
function extractAndLoadFontsFromSvg(svgCode: string): void {
  try {
    const fontMatches = svgCode.match(/font-family="([^"]+)"/g) || [];
    const styleMatches = svgCode.match(/font-family:\s*([^;"]+)/g) || [];
    
    const fontNames = new Set<string>();

    for (const match of fontMatches) {
      const clean = match.replace('font-family="', '').replace('"', '').split(',')[0].trim().replace(/['"]/g, '');
      if (clean && clean.toLowerCase() !== 'sans-serif' && clean.toLowerCase() !== 'serif' && clean.toLowerCase() !== 'monospace') {
        fontNames.add(clean);
      }
    }

    for (const match of styleMatches) {
      const clean = match.replace(/font-family:\s*/, '').split(',')[0].trim().replace(/['"]/g, '');
      if (clean && clean.toLowerCase() !== 'sans-serif' && clean.toLowerCase() !== 'serif' && clean.toLowerCase() !== 'monospace') {
        fontNames.add(clean);
      }
    }

    fontNames.forEach(font => {
      loadGoogleFont(font);
    });
  } catch (e) {
    console.warn('Error precargando fuentes del SVG:', e);
  }
}

/**
 * Limpia la respuesta de OpenAI para extraer únicamente el bloque <svg>...</svg>
 */
export function extractCleanSvg(rawContent: string): string {
  let cleaned = rawContent.trim();

  // Eliminar bloques ```xml o ```svg o ```
  cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/m, '');
  cleaned = cleaned.replace(/\n?```$/m, '');

  const startIdx = cleaned.indexOf('<svg');
  const endIdx = cleaned.lastIndexOf('</svg>');

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 6);
  }

  return cleaned.trim();
}

/**
 * Diseña una pieza publicitaria completa en formato SVG nativo utilizando GPT-4o Vision.
 * Analiza el copy, las imágenes de referencia de marca (con detail: high) y el sujeto.
 */
export async function designPieceWithOpenAiSvg({
  canvas,
  docConfig,
  copyInput,
  brand,
  apiKey,
  compositionStyle = 'split-left-right',
  selectedReferenceId,
  variationSeed = 0,
  onProgress,
}: OpenAiSvgDesignParams): Promise<OpenAiSvgDesignResult> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Se requiere una clave API de OpenAI activa.');
  }

  const { width, height } = docConfig;
  const headline = (copyInput.headline || '').trim();
  const subtitle = (copyInput.subtitle || '').trim();
  const badgeText = (copyInput.badgeText || '').trim();
  const ctaText = (copyInput.ctaText || '').trim();

  onProgress?.('Analizando referencias visuales de la marca con GPT-4o Vision...');

  // Determinar piezas de referencia a usar
  const allRefs = (brand.referencePieces || []).filter(
    p => Boolean(p.imageUrl) && (p.imageUrl.startsWith('http') || p.imageUrl.startsWith('data:image/'))
  );

  let targetRefs = allRefs;
  if (selectedReferenceId) {
    const matched = allRefs.filter(r => r.id === selectedReferenceId);
    if (matched.length > 0) {
      targetRefs = matched;
    }
  }

  const hasReferences = targetRefs.length > 0;

  // 1. Mensaje de Sistema con directrices avanzadas de Director de Arte publicitario
  const systemPrompt = `You are a world-class Executive Creative Director & Master SVG Vector Artist for sports betting, gaming, high-impact retail, and modern commercial campaigns.
Your job is to generate an explosive, award-winning, agency-grade advertising poster as 100% pure, valid SVG.

CANVAS SPECIFICATIONS:
- Width: ${width}px
- Height: ${height}px
- viewBox: "0 0 ${width} ${height}"

USER COPY (CRITICAL - USE EXACTLY):
- Headline: "${headline || 'GRAN EVENTO'}"
${subtitle ? `- Subtitle / Bajada: "${subtitle}"` : ''}
${badgeText ? `- Promotional Badge: "${badgeText}"` : ''}
${ctaText ? `- Call to Action (CTA) Button: "${ctaText}"` : ''}

${hasReferences ? `
=========================================================
CRITICAL ART DIRECTION & VISUAL TRUTH (HIGHEST PRIORITY):
The user attached authentic reference image(s) showing EXACTLY how their brand looks.
DO NOT use generic blue backgrounds or flat basic shapes.
YOU MUST DEEPLY REPLICATE THE EXACT AESTHETIC SEEN IN THE REFERENCE IMAGE:
1. PALETTE & VIBRANCY: Extract the authentic dominant and neon accent colors from the reference (e.g. electric magenta, neon cyan, glowing lime/yellow, stadium golds, deep dark charcoals). Create rich SVG <defs> with <linearGradient> and <radialGradient> using these exact extracted colors.
2. LIGHTING & ATMOSPHERE: Replicate the explosive lighting: radial glow halos (<radialGradient>), stadium spotlight beams, lens flare orbs, neon edge lines, and dark atmospheric gradients.
3. DYNAMIC GEOMETRY: Incorporate angled slants, skewed containers (e.g. transform="skewX(-8)" or "skewX(-10)"), glowing borders, diagonal speed accents, and tech geometric motifs.
=========================================================
` : `
STYLE GUIDELINES:
Create a rich, dark atmospheric sports/gaming background with radial gradients, glowing spotlight beams, and high-contrast neon accents.
`}

CRITICAL HEADLINE & TYPOGRAPHY RULES (NEVER OVERFLOW):
- The canvas width is ${width}px. A headline with more than 3 words WILL OVERFLOW if placed on a single horizontal line.
- You MUST SPLIT the headline into 2, 3, or 4 stacked lines of massive, commanding typography.
  Example for "SUELTA EL CONTROL UN CHIN: LLUEVEN GANADORES":
  Line 1: <text x="50%" y="28%" font-size="88px" font-weight="900" text-anchor="middle" fill="#ffffff" transform="skewX(-8)">SUELTA EL</text>
  Line 2: <text x="50%" y="36%" font-size="88px" font-weight="900" text-anchor="middle" fill="url(#neonGradient)" transform="skewX(-8)">CONTROL UN CHIN:</text>
  Line 3: <text x="50%" y="44%" font-size="88px" font-weight="900" text-anchor="middle" fill="url(#neonGradient)" transform="skewX(-8)">LLUEVEN GANADORES</text>
- Two-Tone Contrast: Keep Line 1 in crisp pure white (#ffffff), and Lines 2/3 in the vivid neon gradient or accent color extracted from the reference image.
- Subtitle: Position below the headline with elegant contrast, font-weight="700", font-size="36px" to "44px".
- CTA Button: Large, high-impact pill (<rect rx="35">) with bright gradient fill, drop-shadow/glow, and bold contrasting text centered inside.

OUTPUT FORMAT RULES:
- Output MUST be 100% valid standalone SVG starting with <svg and ending with </svg>.
- Do NOT output any conversational text or markdown explanation.
- Return ONLY the SVG code.`;

  // 2. Construir contenido de usuario con Vision en detail: high
  const userContent: Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }> = [];

  let userPrompt = `Generate the commercial advertising SVG poster for canvas ${width}x${height} (${docConfig.orientation || 'portrait'}, style: ${compositionStyle}, variation: ${variationSeed}).\n`;
  userPrompt += `Headline: "${headline}"\n`;
  if (subtitle) userPrompt += `Subtitle: "${subtitle}"\n`;
  if (badgeText) userPrompt += `Badge: "${badgeText}"\n`;
  if (ctaText) userPrompt += `CTA Button: "${ctaText}"\n`;

  userContent.push({ type: 'text', text: userPrompt });

  // Piezas de referencia visual de la marca (enviadas con detail: high para captar colores y estilo exactos)
  if (hasReferences) {
    userContent.push({
      type: 'text',
      text: `Here is the visual reference image showing our exact brand identity and visual style. Analyze its color scheme, lighting glows, typographic slant, and layout mood, and replicate this authentic aesthetic in the SVG:`,
    });

    for (const ref of targetRefs.slice(0, 2)) {
      const optimizedUrl = await resizeImageForVision(ref.imageUrl, 1024);
      userContent.push({
        type: 'image_url',
        image_url: { url: optimizedUrl, detail: 'high' },
      });
    }
  }

  // Foto del sujeto/protagonista (si existe)
  if (copyInput.subjectImageUrl && (copyInput.subjectImageUrl.startsWith('http') || copyInput.subjectImageUrl.startsWith('data:image/'))) {
    userContent.push({
      type: 'text',
      text: `Here is the photo of the hero subject/product to feature in the design:`,
    });
    const optimizedSubject = await resizeImageForVision(copyInput.subjectImageUrl, 1024);
    userContent.push({
      type: 'image_url',
      image_url: { url: optimizedSubject, detail: 'high' },
    });
  }

  onProgress?.('Sintetizando vectores y composición con OpenAI GPT-4o...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 3500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Error de OpenAI: ${msg}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content || '';
  const tokenUsage = data?.usage;

  const cleanSvg = extractCleanSvg(rawText);

  if (!cleanSvg || !cleanSvg.startsWith('<svg')) {
    throw new Error('La respuesta de OpenAI no contenía un SVG válido.');
  }

  onProgress?.('Inyectando capas vectoriales en el lienzo interactivo...');

  // Precargar las fuentes tipográficas del SVG
  extractAndLoadFontsFromSvg(cleanSvg);

  // 3. Cargar el SVG generado en el canvas de Fabric.js
  await new Promise<void>((resolve, reject) => {
    try {
      fabric.loadSVGFromString(cleanSvg, (objects, options) => {
        try {
          canvas.clear();

          const validObjects = (objects || []).filter(Boolean);

          validObjects.forEach((obj) => {
            // Promover elementos de texto a IText para edición directa con doble clic
            if (obj.type === 'text') {
              const t = obj as fabric.Text;
              const itext = new fabric.IText(t.text || '', {
                left: t.left,
                top: t.top,
                fontSize: t.fontSize,
                fontFamily: t.fontFamily || brand.typography?.headlineFont || 'Montserrat',
                fontWeight: t.fontWeight,
                fontStyle: t.fontStyle,
                fill: t.fill,
                stroke: t.stroke,
                strokeWidth: t.strokeWidth,
                textAlign: t.textAlign,
                originX: t.originX,
                originY: t.originY,
                scaleX: t.scaleX,
                scaleY: t.scaleY,
                angle: t.angle,
                skewX: (t as any).skewX || 0,
                skewY: (t as any).skewY || 0,
                selectable: true,
                editable: true,
              });
              canvas.add(itext);
            } else {
              obj.set({
                selectable: true,
              });
              canvas.add(obj);
            }
          });

          // Si el usuario tenía una foto de sujeto, integrarla centrada en el área hero
          if (copyInput.subjectImageUrl) {
            fabric.Image.fromURL(copyInput.subjectImageUrl, (img) => {
              img.scaleToWidth(width * 0.6);
              if (img.getScaledHeight() > height * 0.5) {
                img.scaleToHeight(height * 0.5);
              }
              img.set({
                left: (width - img.getScaledWidth()) / 2,
                top: (height - img.getScaledHeight()) / 2 + 20,
                selectable: true,
              });
              canvas.add(img);
              canvas.renderAll();
              resolve();
            }, { crossOrigin: 'anonymous' });
          } else {
            canvas.renderAll();
            resolve();
          }
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });

  return {
    success: true,
    rawSvg: cleanSvg,
    tokenUsage,
  };
}
