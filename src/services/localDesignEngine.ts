import { fabric } from 'fabric';
import type { BrandKit, DocumentConfig, PieceCopyInput, CompositionStyle } from '../types';

export type DesignArchetype =
  | 'sports-impact'
  | 'hero-center'
  | 'cyber-tech'
  | 'luxury-editorial'
  | 'promo-bold'
  | 'story-vertical'
  | 'minimal-modern';

export interface GenerateLocalDesignParams {
  canvas: fabric.Canvas;
  brand: BrandKit;
  docConfig: DocumentConfig;
  copyInput: PieceCopyInput;
  style?: CompositionStyle;
  variationSeed?: number;
}

export interface HeadlineHierarchy {
  line1: string;
  line2: string;
  line3: string;
}

/**
 * Divide el titular en 1, 2 o 3 líneas optimizadas ópticamente
 * para resaltar la palabra clave de mayor impacto.
 */
export function parseHeadlineHierarchy(headline: string): HeadlineHierarchy {
  const clean = headline.trim().toUpperCase();
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return { line1: 'NUEVA', line2: 'COLECCIÓN', line3: 'EXCLUSIVA' };
  }
  if (words.length === 1) {
    return { line1: '', line2: words[0], line3: '' };
  }
  if (words.length === 2) {
    return { line1: words[0], line2: words[1], line3: '' };
  }
  if (words.length === 3) {
    return { line1: words[0], line2: words[1], line3: words[2] };
  }
  if (words.length === 4) {
    return {
      line1: `${words[0]} ${words[1]}`,
      line2: words[2],
      line3: words[3],
    };
  }
  // 5 o más palabras
  const line1 = words.slice(0, 2).join(' ');
  const line2 = words[2];
  const line3 = words.slice(3).join(' ');
  return { line1, line2, line3 };
}

/**
 * Calcula tamaño de fuente dinámico para evitar desbordes en el lienzo
 */
function getFitFontSize(text: string, maxWidth: number, preferredSize: number, minSize = 22): number {
  if (!text) return preferredSize;
  const estimatedCharWidth = preferredSize * 0.62;
  const totalEstimatedWidth = text.length * estimatedCharWidth;
  if (totalEstimatedWidth > maxWidth) {
    const fitted = Math.floor((maxWidth / (text.length * 0.62)));
    return Math.max(minSize, fitted);
  }
  return preferredSize;
}

/**
 * Resuelve el arquetipo de diseño considerando formato, estilo y semilla de variación
 */
export function resolveArchetype(
  w: number,
  h: number,
  requestedStyle?: CompositionStyle,
  variationSeed = 0
): DesignArchetype {
  // Si la proporción es vertical extrema (9:16)
  if (h >= w * 1.5) {
    return 'story-vertical';
  }

  const ARCHETYPES_LIST: DesignArchetype[] = [
    'sports-impact',
    'hero-center',
    'cyber-tech',
    'luxury-editorial',
    'promo-bold',
    'minimal-modern',
  ];

  if (variationSeed > 0) {
    return ARCHETYPES_LIST[variationSeed % ARCHETYPES_LIST.length];
  }

  if (requestedStyle === 'split-left-right') return 'sports-impact';
  if (requestedStyle === 'hero-center') return 'hero-center';
  if (requestedStyle === 'minimal-editorial') return 'luxury-editorial';
  if (requestedStyle === 'promo-bold') return 'promo-bold';
  if (requestedStyle === 'story-vertical') return 'story-vertical';

  // Por defecto según proporción
  if (w >= h * 1.3) return 'sports-impact';
  return 'sports-impact';
}

/**
 * MOTOR PROPIO DE DISEÑO EDITORIAL & VECTORIAL
 * Genera composiciones profesionales de agencia (100% SVG y editables)
 * sin depender de APIs externas ni cuotas por generación.
 */
export async function generateLocalDesignPiece({
  canvas,
  brand,
  docConfig,
  copyInput,
  style,
  variationSeed = 0,
}: GenerateLocalDesignParams): Promise<void> {
  const w = docConfig.width;
  const h = docConfig.height;

  canvas.clear();

  const archetype = resolveArchetype(w, h, style, variationSeed);
  const headline = parseHeadlineHierarchy(copyInput.headline || brand.name);
  const subtitle = copyInput.subtitle?.trim() || '';
  const badge = copyInput.badgeText?.trim() || '';
  const cta = copyInput.ctaText?.trim() || 'COMPRAR AHORA';

  // ========================================================
  // 1. CAPA DE FONDO & ILUMINACIÓN ATMOSFÉRICA (SPOTLIGHTS)
  // ========================================================
  const bg = new fabric.Rect({
    left: 0,
    top: 0,
    width: w,
    height: h,
    fill: brand.colors.backgroundDark || '#090d16',
    selectable: false,
    evented: false,
  });
  canvas.add(bg);

  // Spotlight radial dependiente del arquetipo
  buildAtmosphericLighting(canvas, brand, w, h, archetype, variationSeed);

  // Marcas de registro técnico y rejilla de estudio
  buildStudioGridAccents(canvas, brand, w, h, archetype);

  // ========================================================
  // 2. HERO VISUAL (FOTO DE SUJETO O EMBLEMA VECTORIAL PROPIO)
  // ========================================================
  if (copyInput.subjectImageUrl) {
    await renderSubjectImage(canvas, copyInput.subjectImageUrl, w, h, archetype);
  } else {
    renderProceduralHeroMotif(canvas, brand, w, h, archetype, headline.line2 || brand.name);
  }

  // ========================================================
  // 3. LOGOTIPO DE MARCA (SELLO PROFESIONAL)
  // ========================================================
  renderBrandHeader(canvas, brand, w, h, archetype);

  // ========================================================
  // 4. TIPOGRAFÍA & BLOQUE ÓPTICO DE 2 TONOS (AGENCY HEADLINE)
  // ========================================================
  renderTypographyBlock(canvas, brand, w, h, archetype, headline, subtitle, badge);

  // ========================================================
  // 5. BOTÓN CTA & MICRO-PROPUESTA DE VALOR
  // ========================================================
  renderCtaAndMicroTrust(canvas, brand, w, h, archetype, cta);

  // ========================================================
  // 6. PIE DE PÁGINA (WEB O HANDLE DE MARCA)
  // ========================================================
  renderFooterBar(canvas, brand, w, h, archetype);

  canvas.renderAll();
}

/**
 * Genera iluminación envolvente, halos radiales y cortes angulares
 */
function buildAtmosphericLighting(
  canvas: fabric.Canvas,
  brand: BrandKit,
  w: number,
  h: number,
  archetype: DesignArchetype,
  variationSeed: number
) {
  const pColor = brand.colors.primary || '#0d66d0';
  const sColor = brand.colors.secondary || '#388bff';
  const aColor = brand.colors.accent || '#f59e0b';

  if (archetype === 'sports-impact') {
    // Halo focal detrás del sujeto
    const glowX = w * (0.68 + (variationSeed % 2 === 1 ? -0.05 : 0.04));
    const glowY = h * 0.44;

    const outerGlow = new fabric.Circle({
      left: glowX,
      top: glowY,
      radius: Math.round(w * 0.42),
      fill: pColor,
      opacity: 0.26,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    const innerGlow = new fabric.Circle({
      left: glowX,
      top: glowY,
      radius: Math.round(w * 0.22),
      fill: sColor,
      opacity: 0.18,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });
    canvas.add(outerGlow, innerGlow);

    // Cortes angulares de velocidad (Nike/Fox Sports style)
    const poly1 = new fabric.Polygon([
      { x: w * 0.38, y: 0 },
      { x: w * 0.72, y: 0 },
      { x: w * 0.42, y: h },
      { x: w * 0.08, y: h },
    ], {
      fill: sColor,
      opacity: 0.14,
      selectable: false,
      evented: false,
    });

    const poly2 = new fabric.Polygon([
      { x: w * 0.60, y: 0 },
      { x: w * 0.94, y: 0 },
      { x: w * 0.64, y: h },
      { x: w * 0.30, y: h },
    ], {
      fill: pColor,
      opacity: 0.08,
      selectable: false,
      evented: false,
    });

    canvas.add(poly1, poly2);
  } else if (archetype === 'hero-center') {
    // Halo central tipo domo de estadio
    const centerGlow = new fabric.Circle({
      left: w * 0.5,
      top: h * 0.45,
      radius: Math.round(w * 0.46),
      fill: pColor,
      opacity: 0.24,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });
    const subGlow = new fabric.Circle({
      left: w * 0.5,
      top: h * 0.38,
      radius: Math.round(w * 0.25),
      fill: aColor,
      opacity: 0.14,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });
    canvas.add(centerGlow, subGlow);
  } else if (archetype === 'cyber-tech') {
    // Luces neón duales (cian + magenta/acento) en esquinas opuestas
    const glow1 = new fabric.Circle({
      left: w * 0.85,
      top: h * 0.25,
      radius: Math.round(w * 0.35),
      fill: sColor,
      opacity: 0.22,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    const glow2 = new fabric.Circle({
      left: w * 0.15,
      top: h * 0.75,
      radius: Math.round(w * 0.3),
      fill: aColor,
      opacity: 0.16,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    canvas.add(glow1, glow2);
  } else if (archetype === 'luxury-editorial') {
    // Resplandor cálido sutil central
    const luxGlow = new fabric.Circle({
      left: w * 0.5,
      top: h * 0.5,
      radius: Math.round(w * 0.36),
      fill: aColor,
      opacity: 0.09,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    canvas.add(luxGlow);
  } else if (archetype === 'promo-bold') {
    // Fondo de alto impacto con franja angular de color
    const bannerAngle = new fabric.Polygon([
      { x: 0, y: h * 0.2 },
      { x: w, y: h * 0.08 },
      { x: w, y: h * 0.65 },
      { x: 0, y: h * 0.78 },
    ], {
      fill: pColor,
      opacity: 0.18,
      selectable: false,
    });
    canvas.add(bannerAngle);
  } else if (archetype === 'story-vertical') {
    const verticalGlow = new fabric.Circle({
      left: w * 0.5,
      top: h * 0.36,
      radius: Math.round(w * 0.45),
      fill: pColor,
      opacity: 0.25,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    canvas.add(verticalGlow);
  }
}

/**
 * Rejilla y marcas de registro de estudio
 */
function buildStudioGridAccents(
  canvas: fabric.Canvas,
  brand: BrandKit,
  w: number,
  h: number,
  archetype: DesignArchetype
) {
  const margin = Math.round(w * 0.04);

  if (archetype === 'cyber-tech') {
    // Rejilla de coordenadas y esquinas HUD
    const tag1 = new fabric.IText(`[SYS.ONLINE // 2026]`, {
      left: margin,
      top: margin,
      fontSize: 12,
      fontWeight: '700',
      fill: 'rgba(255, 255, 255, 0.35)',
      fontFamily: 'monospace',
      selectable: false,
    });
    const tag2 = new fabric.IText(`LAT: 40.7128° N // ZOIK ENGINE`, {
      left: w - margin,
      top: margin,
      originX: 'right',
      fontSize: 12,
      fontWeight: '700',
      fill: 'rgba(255, 255, 255, 0.35)',
      fontFamily: 'monospace',
      selectable: false,
    });
    canvas.add(tag1, tag2);
  } else if (archetype === 'luxury-editorial') {
    // Doble marco perimetral fino
    const frame = new fabric.Rect({
      left: margin,
      top: margin,
      width: w - margin * 2,
      height: h - margin * 2,
      fill: 'transparent',
      stroke: brand.colors.accent || '#f59e0b',
      strokeWidth: 1.5,
      opacity: 0.45,
      selectable: false,
    });
    canvas.add(frame);
  } else {
    // Cruces de registro clásicas de estudio editorial
    const cross1 = new fabric.IText('+', {
      left: margin,
      top: margin,
      fontSize: 18,
      fontWeight: '300',
      fill: 'rgba(255, 255, 255, 0.25)',
      fontFamily: 'monospace',
      selectable: false,
    });
    const cross2 = new fabric.IText('+', {
      left: w - margin - 12,
      top: margin,
      fontSize: 18,
      fontWeight: '300',
      fill: 'rgba(255, 255, 255, 0.25)',
      fontFamily: 'monospace',
      selectable: false,
    });
    canvas.add(cross1, cross2);
  }
}

/**
 * Renderiza la imagen del producto/sujeto subida por el usuario
 */
function renderSubjectImage(
  canvas: fabric.Canvas,
  imageUrl: string,
  w: number,
  h: number,
  archetype: DesignArchetype
): Promise<void> {
  return new Promise((resolve) => {
    fabric.Image.fromURL(
      imageUrl,
      (img) => {
        let targetWidth = Math.round(w * 0.48);
        let left = Math.round(w * 0.48);
        let top = Math.round(h * 0.22);

        if (archetype === 'hero-center') {
          targetWidth = Math.round(w * 0.58);
          left = Math.round((w - targetWidth) / 2);
          top = Math.round(h * 0.30);
        } else if (archetype === 'story-vertical') {
          targetWidth = Math.round(w * 0.74);
          left = Math.round((w - targetWidth) / 2);
          top = Math.round(h * 0.16);
        } else if (archetype === 'promo-bold') {
          targetWidth = Math.round(w * 0.50);
          left = Math.round(w * 0.46);
          top = Math.round(h * 0.26);
        }

        img.scaleToWidth(targetWidth);
        img.set({
          left,
          top,
          selectable: true,
          shadow: new fabric.Shadow({
            color: 'rgba(0, 0, 0, 0.88)',
            blur: 32,
            offsetX: 0,
            offsetY: 16,
          }),
        });

        canvas.add(img);
        canvas.renderAll();
        resolve();
      },
      { crossOrigin: 'anonymous' }
    );
  });
}

/**
 * Genera motivo visual vectorial procedimental cuando no hay foto de producto
 */
function renderProceduralHeroMotif(
  canvas: fabric.Canvas,
  brand: BrandKit,
  w: number,
  h: number,
  archetype: DesignArchetype,
  keyword: string
) {
  const pColor = brand.colors.primary || '#0d66d0';
  const sColor = brand.colors.secondary || '#388bff';
  const aColor = brand.colors.accent || '#f59e0b';

  let centerX = Math.round(w * 0.72);
  let centerY = Math.round(h * 0.48);

  if (archetype === 'hero-center') {
    centerX = Math.round(w * 0.50);
    centerY = Math.round(h * 0.46);
  } else if (archetype === 'story-vertical') {
    centerX = Math.round(w * 0.50);
    centerY = Math.round(h * 0.36);
  } else if (archetype === 'luxury-editorial') {
    centerX = Math.round(w * 0.50);
    centerY = Math.round(h * 0.44);
  }

  if (archetype === 'luxury-editorial') {
    // Sello circular de alta gama con monograma
    const sealOuter = new fabric.Circle({
      radius: 170,
      fill: 'transparent',
      stroke: aColor,
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    });
    const sealInner = new fabric.Circle({
      radius: 145,
      fill: '#121216',
      stroke: 'rgba(255, 255, 255, 0.25)',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
    });
    const monoChar = new fabric.IText(brand.logo.symbolText || 'Z', {
      top: -30,
      fontSize: 88,
      fontWeight: '300',
      fill: '#ffffff',
      fontFamily: brand.typography.headlineFont,
      originX: 'center',
      originY: 'center',
    });
    const label = new fabric.IText('EDICIÓN LIMITADA • 2026', {
      top: 55,
      fontSize: 13,
      fontWeight: '700',
      fill: aColor,
      charSpacing: 180,
      originX: 'center',
      originY: 'center',
    });

    const luxGroup = new fabric.Group([sealOuter, sealInner, monoChar, label], {
      left: centerX,
      top: centerY,
      originX: 'center',
      originY: 'center',
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.85)', blur: 24, offsetY: 10 }),
      selectable: true,
    });
    canvas.add(luxGroup);
    return;
  }

  if (archetype === 'cyber-tech') {
    // Núcleo de nodo cibernético con HUD giratorio
    const ring1 = new fabric.Circle({
      radius: 190,
      fill: 'transparent',
      stroke: sColor,
      strokeWidth: 2,
      strokeDashArray: [14, 8],
      originX: 'center',
      originY: 'center',
    });
    const ring2 = new fabric.Circle({
      radius: 145,
      fill: 'transparent',
      stroke: pColor,
      strokeWidth: 3,
      strokeDashArray: [6, 12],
      originX: 'center',
      originY: 'center',
    });
    const hex = new fabric.Rect({
      width: 170,
      height: 170,
      rx: 20,
      ry: 20,
      fill: '#080d18',
      stroke: aColor,
      strokeWidth: 3,
      angle: 45,
      originX: 'center',
      originY: 'center',
    });
    const coreText = new fabric.IText(brand.logo.symbolText || '01', {
      fontSize: 66,
      fontWeight: '900',
      fill: '#ffffff',
      fontFamily: 'monospace',
      originX: 'center',
      originY: 'center',
    });
    const cyberTag = new fabric.IText('CORE // SYSTEM V2', {
      top: 70,
      fontSize: 12,
      fontWeight: '800',
      fill: sColor,
      charSpacing: 140,
      originX: 'center',
      originY: 'center',
      fontFamily: 'monospace',
    });

    const cyberGroup = new fabric.Group([ring1, ring2, hex, coreText, cyberTag], {
      left: centerX,
      top: centerY,
      originX: 'center',
      originY: 'center',
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 28, offsetY: 12 }),
      selectable: true,
    });
    canvas.add(cyberGroup);
    return;
  }

  // Por defecto: Emblema Deportivo / Campeonato de Gran Calibre
  const outerRing = new fabric.Circle({
    radius: 195,
    fill: 'transparent',
    stroke: pColor,
    strokeWidth: 3.5,
    strokeDashArray: [14, 8],
    originX: 'center',
    originY: 'center',
  });
  const innerRing = new fabric.Circle({
    radius: 160,
    fill: 'transparent',
    stroke: 'rgba(255, 255, 255, 0.35)',
    strokeWidth: 1.5,
    originX: 'center',
    originY: 'center',
  });

  const shieldBg = new fabric.Rect({
    width: 200,
    height: 200,
    rx: 32,
    ry: 32,
    fill: '#0e1320',
    stroke: sColor,
    strokeWidth: 4,
    angle: 45,
    originX: 'center',
    originY: 'center',
  });

  const stars = new fabric.IText('★   ★   ★', {
    top: -64,
    fontSize: 22,
    fontWeight: '900',
    fill: aColor,
    originX: 'center',
    originY: 'center',
  });

  const trophyInitial = new fabric.IText(brand.logo.symbolText || 'VS', {
    top: -10,
    fontSize: 54,
    fontWeight: '900',
    fill: '#ffffff',
    fontFamily: brand.typography.headlineFont,
    originX: 'center',
    originY: 'center',
  });

  const bannerRect = new fabric.Rect({
    top: 56,
    width: 230,
    height: 40,
    rx: 8,
    ry: 8,
    fill: pColor,
    originX: 'center',
    originY: 'center',
  });
  const bannerText = new fabric.IText('MATCHDAY LIVE', {
    top: 56,
    fontSize: 14,
    fontWeight: '900',
    fill: '#ffffff',
    charSpacing: 80,
    fontFamily: brand.typography.headlineFont,
    originX: 'center',
    originY: 'center',
  });

  const emblemGroup = new fabric.Group([
    outerRing, innerRing, shieldBg, stars, trophyInitial, bannerRect, bannerText
  ], {
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center',
    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.85)', blur: 30, offsetY: 14 }),
    selectable: true,
  });
  canvas.add(emblemGroup);
}

/**
 * Renderiza el encabezado con el logo oficial del kit de marca
 */
function renderBrandHeader(
  canvas: fabric.Canvas,
  brand: BrandKit,
  w: number,
  h: number,
  archetype: DesignArchetype
) {
  const isCentered = archetype === 'hero-center' || archetype === 'story-vertical' || archetype === 'luxury-editorial';
  const marginX = Math.round(w * 0.08);
  const topY = Math.round(h * 0.052);

  if (isCentered) {
    const badgeW = 56;
    const badgeH = 56;
    const logoBadge = new fabric.Rect({
      left: Math.round(w * 0.5) - badgeW / 2,
      top: topY,
      width: badgeW,
      height: badgeH,
      rx: 14,
      ry: 14,
      fill: brand.colors.primary,
      selectable: true,
    });
    const logoChar = new fabric.IText(brand.logo.symbolText || 'Z', {
      left: Math.round(w * 0.5),
      top: topY + 11,
      originX: 'center',
      fontSize: 28,
      fontWeight: '900',
      fill: '#ffffff',
      fontFamily: brand.typography.headlineFont,
      selectable: true,
    });
    const logoText = new fabric.IText(brand.name.toUpperCase(), {
      left: Math.round(w * 0.5),
      top: topY + badgeH + 12,
      originX: 'center',
      fontSize: 17,
      fontWeight: '800',
      fill: brand.colors.textPrimary || '#ffffff',
      fontFamily: brand.typography.headlineFont,
      charSpacing: 110,
      selectable: true,
    });
    canvas.add(logoBadge, logoChar, logoText);
  } else {
    const logoBadge = new fabric.Rect({
      left: marginX,
      top: topY,
      width: 52,
      height: 52,
      rx: 12,
      ry: 12,
      fill: brand.colors.primary,
      selectable: true,
    });
    const logoChar = new fabric.IText(brand.logo.symbolText || 'Z', {
      left: marginX + 15,
      top: topY + 10,
      fontSize: 26,
      fontWeight: '900',
      fill: '#ffffff',
      fontFamily: brand.typography.headlineFont,
      selectable: true,
    });
    const logoText = new fabric.IText(brand.name.toUpperCase(), {
      left: marginX + 66,
      top: topY + 15,
      fontSize: 20,
      fontWeight: '800',
      fill: brand.colors.textPrimary || '#ffffff',
      fontFamily: brand.typography.headlineFont,
      charSpacing: 80,
      selectable: true,
    });
    canvas.add(logoBadge, logoChar, logoText);
  }
}

/**
 * Renderiza el titular de 2 tonos, subtítulo y badge con escala de cartel
 */
function renderTypographyBlock(
  canvas: fabric.Canvas,
  brand: BrandKit,
  w: number,
  h: number,
  archetype: DesignArchetype,
  headline: HeadlineHierarchy,
  subtitle: string,
  badgeText: string
) {
  const isCentered = archetype === 'hero-center' || archetype === 'story-vertical' || archetype === 'luxury-editorial';
  const marginX = Math.round(w * 0.08);

  let currentY = Math.round(h * 0.15);
  if (archetype === 'story-vertical') {
    currentY = Math.round(h * 0.58);
  }

  // 1. Badge / Oferta destacada
  if (badgeText) {
    const badgeStr = `★  ${badgeText.toUpperCase()}  ★`;
    const badgeW = Math.min(320, badgeStr.length * 14 + 40);

    if (isCentered) {
      const pill = new fabric.Rect({
        left: Math.round(w * 0.5) - badgeW / 2,
        top: currentY,
        width: badgeW,
        height: 42,
        rx: 10,
        ry: 10,
        fill: brand.colors.accent || '#f59e0b',
        selectable: true,
      });
      const pillText = new fabric.IText(badgeStr, {
        left: Math.round(w * 0.5),
        top: currentY + 11,
        originX: 'center',
        fontSize: 14,
        fontWeight: '900',
        fill: '#ffffff',
        fontFamily: brand.typography.headlineFont,
        charSpacing: 60,
        selectable: true,
      });
      canvas.add(pill, pillText);
    } else {
      const pill = new fabric.Rect({
        left: marginX,
        top: currentY,
        width: badgeW,
        height: 42,
        rx: 8,
        ry: 8,
        fill: brand.colors.accent || '#f59e0b',
        selectable: true,
      });
      const pillText = new fabric.IText(badgeStr, {
        left: marginX + 16,
        top: currentY + 11,
        fontSize: 14,
        fontWeight: '900',
        fill: '#ffffff',
        fontFamily: brand.typography.headlineFont,
        charSpacing: 60,
        selectable: true,
      });
      canvas.add(pill, pillText);
    }
    currentY += 62;
  } else {
    currentY += 20;
  }

  // 2. Titular Principal con Jerarquía Óptica de 2 Tonos
  const shadow = new fabric.Shadow({
    color: 'rgba(0, 0, 0, 0.95)',
    blur: 20,
    offsetX: 0,
    offsetY: 6,
  });

  const availableWidth = isCentered ? Math.round(w * 0.86) : Math.round(w * 0.44);

  // Line 1: Pre-title (blanco, peso sólido)
  if (headline.line1) {
    const s1 = getFitFontSize(headline.line1, availableWidth, 62, 28);
    const t1 = new fabric.IText(headline.line1, {
      left: isCentered ? Math.round(w * 0.5) : marginX,
      top: currentY,
      originX: isCentered ? 'center' : 'left',
      fontSize: s1,
      fontWeight: '900',
      fill: '#ffffff',
      fontFamily: brand.typography.headlineFont,
      shadow,
      selectable: true,
    });
    canvas.add(t1);
    currentY += (t1.height || 66) + 4;
  }

  // Line 2: Dominant Power Word (acento vibrante, escala gigante)
  if (headline.line2) {
    const s2 = getFitFontSize(headline.line2, availableWidth, 88, 36);
    const t2 = new fabric.IText(headline.line2, {
      left: isCentered ? Math.round(w * 0.5) : marginX,
      top: currentY,
      originX: isCentered ? 'center' : 'left',
      fontSize: s2,
      fontWeight: '900',
      fill: brand.colors.accent || '#f59e0b',
      fontFamily: brand.typography.headlineFont,
      shadow,
      selectable: true,
    });
    canvas.add(t2);
    currentY += (t2.height || 92) + 6;
  }

  // Line 3: Cierre o palabra final
  if (headline.line3) {
    const s3 = getFitFontSize(headline.line3, availableWidth, 52, 24);
    const t3 = new fabric.IText(headline.line3, {
      left: isCentered ? Math.round(w * 0.5) : marginX,
      top: currentY,
      originX: isCentered ? 'center' : 'left',
      fontSize: s3,
      fontWeight: '900',
      fill: '#ffffff',
      fontFamily: brand.typography.headlineFont,
      charSpacing: 70,
      shadow,
      selectable: true,
    });
    canvas.add(t3);
    currentY += (t3.height || 56) + 20;
  } else {
    currentY += 16;
  }

  // 3. Subtítulo / Bajada de texto
  if (subtitle) {
    const subWidth = isCentered ? Math.round(w * 0.78) : Math.round(w * 0.42);
    const subObj = new fabric.Textbox(subtitle, {
      left: isCentered ? Math.round(w * 0.5) : marginX,
      top: currentY,
      originX: isCentered ? 'center' : 'left',
      width: subWidth,
      textAlign: isCentered ? 'center' : 'left',
      fontSize: archetype === 'story-vertical' ? 24 : 22,
      fontWeight: '500',
      fill: brand.colors.textSecondary || '#cbd5e1',
      lineHeight: 1.35,
      fontFamily: brand.typography.bodyFont,
      selectable: true,
    });
    canvas.add(subObj);
  }
}

/**
 * Renderiza el botón CTA y los micro-beneficios
 */
function renderCtaAndMicroTrust(
  canvas: fabric.Canvas,
  brand: BrandKit,
  w: number,
  h: number,
  archetype: DesignArchetype,
  ctaText: string
) {
  const isCentered = archetype === 'hero-center' || archetype === 'story-vertical' || archetype === 'luxury-editorial';
  const marginX = Math.round(w * 0.08);
  const btnText = `${ctaText.toUpperCase()}  →`;

  let ctaTop = Math.round(h * 0.74);
  let ctaWidth = Math.max(340, btnText.length * 15 + 60);

  if (archetype === 'story-vertical') {
    ctaTop = Math.round(h * 0.85);
    ctaWidth = Math.round(w * 0.76);
  }

  const ctaBg = new fabric.Rect({
    left: isCentered ? Math.round(w * 0.5) - ctaWidth / 2 : marginX,
    top: ctaTop,
    width: ctaWidth,
    height: 72,
    rx: 14,
    ry: 14,
    fill: brand.colors.primary,
    shadow: new fabric.Shadow({
      color: 'rgba(13, 102, 208, 0.45)',
      blur: 24,
      offsetX: 0,
      offsetY: 8,
    }),
    selectable: true,
  });

  const ctaTextObj = new fabric.IText(btnText, {
    left: isCentered ? Math.round(w * 0.5) : marginX + 28,
    top: ctaTop + 22,
    originX: isCentered ? 'center' : 'left',
    fontSize: 22,
    fontWeight: '900',
    fill: '#ffffff',
    fontFamily: brand.typography.headlineFont,
    selectable: true,
  });

  canvas.add(ctaBg, ctaTextObj);

  // Micro-beneficios / Sello de confianza
  const trustText = archetype === 'cyber-tech'
    ? '⚡ 100% SECURE PROTOCOL • INSTANT SETUP'
    : '⚡ GARANTÍA OFICIAL • PAGO INMEDIATO • ATENCIÓN 24/7';

  const trustObj = new fabric.IText(trustText, {
    left: isCentered ? Math.round(w * 0.5) : marginX,
    top: ctaTop + 90,
    originX: isCentered ? 'center' : 'left',
    fontSize: 13,
    fontWeight: '800',
    fill: '#94a3b8',
    fontFamily: brand.typography.headlineFont,
    selectable: true,
  });
  canvas.add(trustObj);
}

/**
 * Renderiza el pie de página con sitio web o handle oficial
 */
function renderFooterBar(
  canvas: fabric.Canvas,
  brand: BrandKit,
  w: number,
  h: number,
  archetype: DesignArchetype
) {
  const isCentered = archetype === 'hero-center' || archetype === 'story-vertical' || archetype === 'luxury-editorial';
  const marginX = Math.round(w * 0.08);
  const handleOrUrl = brand.website || `@${brand.name.toLowerCase().replace(/\s+/g, '')}`;

  const footerText = new fabric.IText(`● ${handleOrUrl}`, {
    left: isCentered ? Math.round(w * 0.5) : marginX,
    top: Math.round(h * 0.94),
    originX: isCentered ? 'center' : 'left',
    fontSize: 17,
    fontWeight: '600',
    fill: '#64748b',
    fontFamily: brand.typography.bodyFont,
    selectable: true,
  });
  canvas.add(footerText);
}
