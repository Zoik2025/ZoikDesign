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
 * Extrae todas las fuentes tipográficas mencionadas en el SVG
 * para cargarlas de Google Fonts dinámicamente.
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
 * Analiza el copy, las imágenes de referencia de marca y la foto del producto/sujeto.
 */
export async function designPieceWithOpenAiSvg({
  canvas,
  docConfig,
  copyInput,
  brand,
  apiKey,
  compositionStyle = 'split-left-right',
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

  onProgress?.('Analizando referencias visuales de la marca con OpenAI GPT-4o Vision...');

  // 1. Mensaje de Sistema con directrices de Director de Arte y SVG
  const systemPrompt = `You are a legendary Senior Art Director and master of SVG vector advertising design.
Your task is to generate a complete, high-impact commercial advertising poster/flyer as pure, valid, standalone SVG.

CANVAS DIMENSIONS:
- Width: ${width}px
- Height: ${height}px
- viewBox: "0 0 ${width} ${height}"

USER COPY (CRITICAL - USE EXACTLY AS GIVEN):
${headline ? `- Main Headline (H1): "${headline}"` : '- No headline specified.'}
${subtitle ? `- Subtitle / Body Copy: "${subtitle}"` : ''}
${badgeText ? `- Promotional Badge: "${badgeText}"` : ''}
${ctaText ? `- Call to Action (CTA) Button: "${ctaText}"` : ''}
Do NOT invent placeholder text. If a text field is not provided, do not render that element.

BRAND IDENTITY & REFERENCE IMAGES:
- Brand Name: "${brand.name || 'Brand'}"
- Primary Brand Color: "${brand.colors?.primary || '#0d66d0'}"
- Secondary Accent: "${brand.colors?.accent || '#00d2ff'}"
- Dark Background: "${brand.colors?.backgroundDark || '#0b0f19'}"
- Brand Headline Font: "${brand.typography?.headlineFont || 'Montserrat'}"

STYLE & COMPOSITION GUIDELINES:
1. REFERENCE HARMONY: If reference images are attached, look at how the brand normally designs its pieces. Replicate its color balance, glow effects, geometric angles, badge styles, and typographic impact.
2. BACKGROUND: Highly polished, dark or vibrant background with <defs> gradients (<linearGradient>, <radialGradient>). Add subtle vector geometry, glowing light spots, diagonal tech accents, or framed borders.
3. TYPOGRAPHY:
   - Headline: Maximum visual impact (<text> tags with font-weight="900" or "bold", font-size appropriate for width, clean letter-spacing). If headline is long, split into 2 or 3 readable lines with tspan or distinct text tags.
   - Subtitle: High legibility, elegant font size (24-36px), complementary color with good contrast.
4. BADGE / PROMO: Eye-catching pill (<rect rx="20">) or badge with bright gradient and high-contrast text.
5. CTA BUTTON: Prominent button (<rect rx="30">) with drop-shadow effect, distinct background color, and centered bold text.
6. HERO VISUAL: Leave a focal area for the product/subject or create an artistic vector emblem/crest/lighting glow.
${copyInput.subjectImageUrl ? `- NOTE: The user has a subject photo. If appropriate, place an <image href="${copyInput.subjectImageUrl}" x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.25)}" width="${Math.round(width * 0.8)}" height="${Math.round(height * 0.5)}" preserveAspectRatio="xMidYMid meet" /> in the hero position, or design the background and typography so the subject sits harmoniously in the center.` : ''}

CRITICAL OUTPUT FORMAT:
- Output MUST be 100% valid SVG code.
- Starts with <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
- Ends with </svg>
- Output ONLY the raw SVG code (or wrapped in \`\`\`svg ... \`\`\`).
- No markdown conversational intros or outros.`;

  // 2. Construir contenido de usuario con texto y referencias visuales (Vision)
  const userContent: Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }> = [];

  let userPrompt = `Generate the advertising SVG for canvas ${width}x${height} (${docConfig.orientation || 'portrait'}, style: ${compositionStyle}, variation: ${variationSeed}).\n`;
  userPrompt += `Headline: "${headline || 'Tu Marca Aquí'}"\n`;
  if (subtitle) userPrompt += `Subtitle: "${subtitle}"\n`;
  if (badgeText) userPrompt += `Badge: "${badgeText}"\n`;
  if (ctaText) userPrompt += `CTA: "${ctaText}"\n`;

  userContent.push({ type: 'text', text: userPrompt });

  // Piezas de referencia visual de la marca (hasta 3 imágenes para velocidad y fidelidad)
  const refImages = (brand.referencePieces || [])
    .map(p => p.imageUrl)
    .filter(url => Boolean(url) && (url.startsWith('http') || url.startsWith('data:image/')));

  if (refImages.length > 0) {
    userContent.push({
      type: 'text',
      text: `These ${refImages.length} images are examples of how this brand normally looks. Emulate this brand's visual identity, typography rhythm, lighting, and layout conventions:`,
    });

    for (const refUrl of refImages.slice(0, 3)) {
      userContent.push({
        type: 'image_url',
        image_url: { url: refUrl, detail: 'low' },
      });
    }
  }

  // Foto del sujeto/producto del usuario (si existe)
  if (copyInput.subjectImageUrl && (copyInput.subjectImageUrl.startsWith('http') || copyInput.subjectImageUrl.startsWith('data:image/'))) {
    userContent.push({
      type: 'text',
      text: `Here is the photo of the protagonist subject/product to integrate:`,
    });
    userContent.push({
      type: 'image_url',
      image_url: { url: copyInput.subjectImageUrl, detail: 'low' },
    });
  }

  onProgress?.('Generando diseño vectorial SVG con OpenAI...');

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

  onProgress?.('Cargando capas vectoriales en el lienzo interactivo...');

  // Precargar las fuentes tipográficas utilizadas en el SVG
  extractAndLoadFontsFromSvg(cleanSvg);

  // 3. Cargar el SVG generado en el canvas de Fabric.js
  await new Promise<void>((resolve, reject) => {
    try {
      fabric.loadSVGFromString(cleanSvg, (objects, options) => {
        try {
          canvas.clear();

          // Ajustar fondo si el SVG tiene color o dimensiones
          if (options.width && options.height) {
            // El canvas ya tiene dimensiones configuradas por docConfig
          }

          // Si el primer objeto es un rect que cubre todo el lienzo, podemos usarlo como background
          const validObjects = (objects || []).filter(Boolean);

          validObjects.forEach((obj) => {
            // Promover elementos de texto estándar a IText para que el usuario pueda hacer doble clic y editarlos
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

          // Si el usuario tenía una foto de sujeto y no se incluyó como imagen en el SVG, añadirla al centro
          const hasImageInSvg = validObjects.some(o => o.type === 'image');
          if (copyInput.subjectImageUrl && !hasImageInSvg) {
            fabric.Image.fromURL(copyInput.subjectImageUrl, (img) => {
              img.scaleToWidth(width * 0.65);
              if (img.getScaledHeight() > height * 0.55) {
                img.scaleToHeight(height * 0.55);
              }
              img.set({
                left: (width - img.getScaledWidth()) / 2,
                top: (height - img.getScaledHeight()) / 2 + 30,
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
