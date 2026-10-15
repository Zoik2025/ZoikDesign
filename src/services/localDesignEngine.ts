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
    return { line1: 'GRAN FINAL', line2: 'MATCHDAY LIVE', line3: 'EN VIVO 4K' };
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
function getFitFontSize(text: string, maxWidth: number, preferredSize: number, minSize = 24): number {
  if (!text) return preferredSize;
  const estimatedCharWidth = preferredSize * 0.65;
  const totalEstimatedWidth = text.length * estimatedCharWidth;
  if (totalEstimatedWidth > maxWidth) {
    const fitted = Math.floor(maxWidth / (text.length * 0.65));
    return Math.max(minSize, fitted);
  }
  return preferredSize;
}

/**
 * Genera textura procedimental de fibra de carbono deportiva / malla técnica de estadio
 */
function createCarbonFiberCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, 24, 24);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 12, 12);
    ctx.fillRect(12, 12, 12, 12);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(12, 0);
    ctx.moveTo(12, 24);
    ctx.lineTo(24, 12);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.beginPath();
    ctx.arc(6, 6, 1.5, 0, Math.PI * 2);
    ctx.arc(18, 18, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
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

  if (requestedStyle === 'sports-impact') return 'sports-impact';
  if (requestedStyle === 'split-left-right') return 'sports-impact';
  if (requestedStyle === 'hero-center') return 'hero-center';
  if (requestedStyle === 'minimal-editorial') return 'luxury-editorial';
  if (requestedStyle === 'promo-bold') return 'promo-bold';
  if (requestedStyle === 'story-vertical') return 'story-vertical';
  if (requestedStyle === 'cyber-tech') return 'cyber-tech';

  return 'sports-impact';
}

/**
 * MOTOR PROPIO DE DISEÑO EDITORIAL & ESTUDIO DE ALTA DEFINICIÓN (CAMINO 1)
 * Diseña composiciones de agencia profesional (luces volumétricas, destellos lens flare,
 * texturas de fibra de carbono, escudos 3D metálicos, sombras de contacto en suelo y tipografía 3D)
 * 100% SVG editable en Fabric.js y libre de costos de API.
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
  const cta = copyInput.ctaText?.trim() || 'VER TRANSMISIÓN';

  // ========================================================
  // 1. BASE DE COLOR OSCURO DE ESTUDIO
  // ========================================================
  const baseBg = new fabric.Rect({
    left: 0,
    top: 0,
    width: w,
    height: h,
    fill: brand.colors.backgroundDark || '#050811',
    selectable: false,
    evented: false,
  });
  canvas.add(baseBg);

  // ========================================================
  // 2. TEXTURA TÉCNICA DE ESTADIO (FIBRA DE CARBONO / MALLA)
  // ========================================================
  try {
    const carbonCanvas = createCarbonFiberCanvas();
    const pattern = new fabric.Pattern({
      source: carbonCanvas as any,
      repeat: 'repeat',
    });
    const textureRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: w,
      height: h,
      fill: pattern,
      opacity: 0.35,
      selectable: false,
      evented: false,
    });
    canvas.add(textureRect);
  } catch (err) {
    console.warn('Error aplicando textura de carbono:', err);
  }

  // ========================================================
  // 3. ILUMINACIÓN VOLUMÉTRICA DE ESTADIO (REFLECTORES, HALOS & FLARES)
  // ========================================================
  buildAtmosphericLighting(canvas, brand, w, h, archetype, variationSeed);

  // Marcas técnicas de estudio y rejilla
  buildStudioGridAccents(canvas, brand, w, h, archetype);

  // ========================================================
  // 4. SUJETO PROTAGONISTA (FOTO DE ATLETA/PRODUCTO O ESCUDO 3D DORADO)
  // ========================================================
  if (copyInput.subjectImageUrl) {
    await renderSubjectImage(canvas, copyInput.subjectImageUrl, w, h, archetype);
  } else {
    renderProceduralHeroMotif(canvas, brand, w, h, archetype, headline.line2 || brand.name);
  }

  // ========================================================
  // 5. CABECERA OFICIAL DE MARCA (LOGO + BADGE)
  // ========================================================
  renderBrandHeader(canvas, brand, w, h, archetype);

  // ========================================================
  // 6. TIPOGRAFÍA PUBLICITARIA 3D & RIBBONS ANGULARES
  // ========================================================
  renderTypographyBlock(canvas, brand, w, h, archetype, headline, subtitle, badge);

  // ========================================================
  // 7. BOTÓN CTA EN RELIEVE & SELLOS DE CONFIANZA
  // ========================================================
  renderCtaAndMicroTrust(canvas, brand, w, h, archetype, cta);

  // ========================================================
  // 8. PIE DE PÁGINA (WEB / TRANSMISIÓN OFICIAL)
  // ========================================================
  renderFooterBar(canvas, brand, w, h, archetype);

  canvas.renderAll();
}

/**
 * Genera iluminación envolvente de estadio, conos de reflectores,
 * niebla volumétrica y destellos anamórficos lens flare
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

  // 1. REFLECTORES CONICALES DE ESTADIO (DESDE ESQUINAS SUPERIORES HACIA EL CENTRO)
  if (archetype === 'sports-impact' || archetype === 'hero-center') {
    // Haz de luz izquierdo (Top-Left Floodlight Beam)
    const leftBeam = new fabric.Polygon([
      { x: -50, y: -50 },
      { x: w * 0.18, y: -50 },
      { x: w * 0.72, y: h * 0.95 },
      { x: w * 0.38, y: h * 0.95 },
    ], {
      fill: new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: w * 0.5, y2: h * 0.8 },
        colorStops: [
          { offset: 0, color: 'rgba(255, 255, 255, 0.22)' },
          { offset: 0.3, color: sColor.replace(')', ', 0.15)').replace('rgb', 'rgba') },
          { offset: 1, color: 'transparent' },
        ],
      }),
      selectable: false,
      evented: false,
    });

    // Haz de luz derecho (Top-Right Floodlight Beam)
    const rightBeam = new fabric.Polygon([
      { x: w + 50, y: -50 },
      { x: w * 0.82, y: -50 },
      { x: w * 0.28, y: h * 0.95 },
      { x: w * 0.62, y: h * 0.95 },
    ], {
      fill: new fabric.Gradient({
        type: 'linear',
        coords: { x1: w, y1: 0, x2: w * 0.5, y2: h * 0.8 },
        colorStops: [
          { offset: 0, color: 'rgba(255, 255, 255, 0.18)' },
          { offset: 0.35, color: pColor.replace(')', ', 0.12)').replace('rgb', 'rgba') },
          { offset: 1, color: 'transparent' },
        ],
      }),
      selectable: false,
      evented: false,
    });

    canvas.add(leftBeam, rightBeam);
  }

  // 2. HALO RADIAL DE ALTA INTENSIDAD (DETRÁS DEL HERO SUBJECT)
  const isCentered = archetype === 'hero-center' || archetype === 'story-vertical' || archetype === 'luxury-editorial';
  const glowX = isCentered ? w * 0.5 : w * (0.68 + (variationSeed % 2 === 1 ? -0.04 : 0.03));
  const glowY = isCentered ? h * 0.44 : h * 0.45;
  const glowRadius = Math.round(w * 0.45);

  const mainRadialSpotlight = new fabric.Circle({
    left: glowX,
    top: glowY,
    radius: glowRadius,
    originX: 'center',
    originY: 'center',
    fill: new fabric.Gradient({
      type: 'radial',
      coords: {
        r1: 0,
        r2: glowRadius,
        x1: glowRadius,
        y1: glowRadius,
        x2: glowRadius,
        y2: glowRadius,
      },
      colorStops: [
        { offset: 0, color: 'rgba(255, 255, 255, 0.45)' },
        { offset: 0.25, color: sColor },
        { offset: 0.55, color: pColor },
        { offset: 1, color: 'transparent' },
      ],
    }),
    opacity: 0.4,
    selectable: false,
    evented: false,
  });
  canvas.add(mainRadialSpotlight);

  // 3. NIEBLA Y HUMO VOLUMÉTRICO EN EL SUELO (STADIUM FOG MACHINE)
  const fog1 = new fabric.Circle({
    left: glowX - 80,
    top: h * 0.72,
    radius: Math.round(w * 0.36),
    originX: 'center',
    originY: 'center',
    fill: 'rgba(255, 255, 255, 0.08)',
    shadow: new fabric.Shadow({
      color: 'rgba(56, 139, 255, 0.18)',
      blur: 80,
    }),
    selectable: false,
    evented: false,
  });

  const fog2 = new fabric.Circle({
    left: glowX + 90,
    top: h * 0.78,
    radius: Math.round(w * 0.4),
    originX: 'center',
    originY: 'center',
    fill: 'rgba(255, 255, 255, 0.06)',
    shadow: new fabric.Shadow({
      color: 'rgba(13, 102, 208, 0.22)',
      blur: 90,
    }),
    selectable: false,
    evented: false,
  });
  canvas.add(fog1, fog2);

  // 4. DESTELLO ANAMÓRFICO (ANAMORPHIC LENS FLARE STREAK)
  const flareStreak = new fabric.Rect({
    left: 0,
    top: glowY - 10,
    width: w,
    height: 4,
    fill: new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: w, y2: 0 },
      colorStops: [
        { offset: 0, color: 'transparent' },
        { offset: 0.35, color: 'rgba(56, 139, 255, 0.45)' },
        { offset: 0.5, color: 'rgba(255, 255, 255, 0.95)' },
        { offset: 0.65, color: 'rgba(56, 139, 255, 0.45)' },
        { offset: 1, color: 'transparent' },
      ],
    }),
    selectable: false,
    evented: false,
  });

  // Centro de estrella del flare (Starburst center)
  const starburstCenter = new fabric.Circle({
    left: glowX,
    top: glowY - 8,
    radius: 12,
    originX: 'center',
    originY: 'center',
    fill: '#ffffff',
    shadow: new fabric.Shadow({
      color: '#388bff',
      blur: 24,
    }),
    selectable: false,
    evented: false,
  });
  canvas.add(flareStreak, starburstCenter);

  // 5. CORTES ANGULARES DE VELOCIDAD DEPORTIVA (NIKE / FOX SPORTS VELOCITY STRIPES)
  if (archetype === 'sports-impact') {
    const slash1 = new fabric.Polygon([
      { x: w * 0.35, y: 0 },
      { x: w * 0.62, y: 0 },
      { x: w * 0.32, y: h },
      { x: w * 0.05, y: h },
    ], {
      fill: sColor,
      opacity: 0.12,
      selectable: false,
      evented: false,
    });

    const slash2 = new fabric.Polygon([
      { x: w * 0.58, y: 0 },
      { x: w * 0.88, y: 0 },
      { x: w * 0.58, y: h },
      { x: w * 0.28, y: h },
    ], {
      fill: pColor,
      opacity: 0.08,
      selectable: false,
      evented: false,
    });

    canvas.add(slash1, slash2);
  }
}

/**
 * Rejilla y marcas técnicas de estudio publicitario
 */
function buildStudioGridAccents(
  canvas: fabric.Canvas,
  brand: BrandKit,
  w: number,
  h: number,
  archetype: DesignArchetype
) {
  const margin = Math.round(w * 0.04);

  // Marcas de registro clásicas de estudio fotográfico
  const cross1 = new fabric.IText('+', {
    left: margin,
    top: margin,
    fontSize: 20,
    fontWeight: '300',
    fill: 'rgba(255, 255, 255, 0.3)',
    fontFamily: 'monospace',
    selectable: false,
    evented: false,
  });

  const cross2 = new fabric.IText('+', {
    left: w - margin - 14,
    top: margin,
    fontSize: 20,
    fontWeight: '300',
    fill: 'rgba(255, 255, 255, 0.3)',
    fontFamily: 'monospace',
    selectable: false,
    evented: false,
  });

  // Badge de estudio superior derecho
  const techBadge = new fabric.IText('MATCHDAY • 2026 // STUDIO ENGINE', {
    left: w - margin,
    top: margin + 4,
    originX: 'right',
    fontSize: 11,
    fontWeight: '800',
    fill: 'rgba(255, 255, 255, 0.45)',
    fontFamily: 'monospace',
    charSpacing: 80,
    selectable: false,
    evented: false,
  });

  canvas.add(cross1, cross2, techBadge);
}

/**
 * Renderiza sombras de contacto en el suelo (Floor Occlusion Shadows)
 * Crea el anclaje físico y tridimensional para cualquier atleta, producto o escudo.
 */
function renderFloorContactShadow(
  canvas: fabric.Canvas,
  centerX: number,
  bottomY: number,
  baseWidth: number
) {
  // 1. Sombra ambiental amplia y difusa
  const ambientShadow = new fabric.Ellipse({
    left: centerX,
    top: bottomY - 10,
    rx: Math.round(baseWidth * 0.52),
    ry: Math.round(baseWidth * 0.12),
    originX: 'center',
    originY: 'center',
    fill: 'rgba(0, 0, 0, 0.85)',
    shadow: new fabric.Shadow({
      color: 'rgba(0, 0, 0, 0.95)',
      blur: 38,
      offsetY: 8,
    }),
    selectable: false,
    evented: false,
  });

  // 2. Sombra de contacto oclusión profunda en el punto de apoyo
  const contactShadow = new fabric.Ellipse({
    left: centerX,
    top: bottomY - 4,
    rx: Math.round(baseWidth * 0.36),
    ry: Math.round(baseWidth * 0.05),
    originX: 'center',
    originY: 'center',
    fill: 'rgba(0, 0, 0, 0.98)',
    shadow: new fabric.Shadow({
      color: 'rgba(0, 0, 0, 1)',
      blur: 12,
    }),
    selectable: false,
    evented: false,
  });

  canvas.add(ambientShadow, contactShadow);
}

/**
 * Renderiza la imagen fotográfica del sujeto / atleta con iluminación de borde y sombras de suelo
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
        let targetWidth = Math.round(w * 0.54);
        let left = Math.round(w * 0.46);
        let top = Math.round(h * 0.20);

        if (archetype === 'hero-center') {
          targetWidth = Math.round(w * 0.65);
          left = Math.round((w - targetWidth) / 2);
          top = Math.round(h * 0.26);
        } else if (archetype === 'story-vertical') {
          targetWidth = Math.round(w * 0.82);
          left = Math.round((w - targetWidth) / 2);
          top = Math.round(h * 0.14);
        } else if (archetype === 'promo-bold') {
          targetWidth = Math.round(w * 0.56);
          left = Math.round(w * 0.42);
          top = Math.round(h * 0.24);
        }

        img.scaleToWidth(targetWidth);
        const scaledHeight = img.getScaledHeight();

        // 1. Sombras de oclusión en el suelo debajo del sujeto
        const subjectCenterX = left + targetWidth / 2;
        const subjectFloorY = top + scaledHeight;
        renderFloorContactShadow(canvas, subjectCenterX, subjectFloorY, targetWidth);

        // 2. Imagen con sombra dramática de estudio
        img.set({
          left,
          top,
          selectable: true,
          shadow: new fabric.Shadow({
            color: 'rgba(0, 0, 0, 0.95)',
            blur: 40,
            offsetX: 0,
            offsetY: 20,
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
 * Renderiza el Escudo de Campeonato 3D Metálico cuando no hay foto de producto.
 * Construido con degradados metálicos oro/titanio, biseles pulidos, estrellas y cinta deportiva 3D.
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

  const isCentered = archetype === 'hero-center' || archetype === 'story-vertical' || archetype === 'luxury-editorial';
  const centerX = isCentered ? Math.round(w * 0.50) : Math.round(w * 0.70);
  const centerY = isCentered ? Math.round(h * 0.44) : Math.round(h * 0.48);

  // Sombras de suelo del escudo
  renderFloorContactShadow(canvas, centerX, centerY + 220, 360);

  // 1. ANILLO EXTERIOR DE ENERGÍA Y LUZ
  const outerPulseRing = new fabric.Circle({
    radius: 215,
    fill: 'transparent',
    stroke: sColor,
    strokeWidth: 3,
    strokeDashArray: [16, 10],
    originX: 'center',
    originY: 'center',
  });

  const innerPulseRing = new fabric.Circle({
    radius: 185,
    fill: 'transparent',
    stroke: 'rgba(255, 255, 255, 0.4)',
    strokeWidth: 1.5,
    strokeDashArray: [6, 14],
    originX: 'center',
    originY: 'center',
  });

  // 2. ESCUDO HERALDICO DEPORTIVO 3D (PATH DE ALTA DEFINICIÓN)
  // Trayectoria de escudo convex con punta inferior
  const shieldPathData = 'M 0 -170 L 140 -170 C 140 -60 110 90 0 160 C -110 90 -140 -60 -140 -170 Z';

  const shieldBase = new fabric.Path(shieldPathData, {
    originX: 'center',
    originY: 'center',
    fill: new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: -170, x2: 0, y2: 160 },
      colorStops: [
        { offset: 0, color: '#162035' },
        { offset: 0.5, color: '#090e1a' },
        { offset: 1, color: '#04070d' },
      ],
    }),
    stroke: (new fabric.Gradient({
      type: 'linear',
      coords: { x1: -140, y1: -170, x2: 140, y2: 160 },
      colorStops: [
        { offset: 0, color: '#fff3b0' },
        { offset: 0.35, color: '#ffd700' },
        { offset: 0.7, color: '#b8860b' },
        { offset: 1, color: '#fff3b0' },
      ],
    }) as any),
    strokeWidth: 6,
  });

  // Escudo interior con bisel y brillo especular
  const innerShield = new fabric.Path('M 0 -150 L 120 -150 C 120 -50 95 75 0 135 C -95 75 -120 -50 -120 -150 Z', {
    originX: 'center',
    originY: 'center',
    fill: '#080d18',
    stroke: 'rgba(255, 255, 255, 0.25)',
    strokeWidth: 2,
  });

  // 3. ESTRELLAS DE CAMPEONATO SUPERIORES (5 ESTRELLAS DORADAS)
  const starsText = new fabric.IText('★   ★   ★   ★   ★', {
    top: -110,
    fontSize: 22,
    fontWeight: '900',
    fill: new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 180, y2: 0 },
      colorStops: [
        { offset: 0, color: '#ffe57f' },
        { offset: 0.5, color: '#ffd700' },
        { offset: 1, color: '#ffb300' },
      ],
    }),
    originX: 'center',
    originY: 'center',
    shadow: new fabric.Shadow({ color: '#ffb300', blur: 14 }),
  });

  // 4. MONOGRAMA / EMBLEMA CENTRAL
  const crestSymbol = new fabric.IText(brand.logo.symbolText || 'VS', {
    top: -25,
    fontSize: 68,
    fontWeight: '900',
    fill: '#ffffff',
    fontFamily: brand.typography.headlineFont,
    originX: 'center',
    originY: 'center',
    shadow: new fabric.Shadow({
      color: 'rgba(0, 0, 0, 0.9)',
      blur: 16,
      offsetY: 6,
    }),
  });

  // 5. CINTA PUBLICITARIA 3D / MATCHDAY RIBBON (CON DOBLECES LATERALES)
  // Dobleces posteriores oscuros (3D Folds)
  const ribbonFoldLeft = new fabric.Polygon([
    { x: -145, y: 55 },
    { x: -120, y: 35 },
    { x: -120, y: 75 },
  ], {
    fill: '#785108',
    originX: 'center',
    originY: 'center',
  });

  const ribbonFoldRight = new fabric.Polygon([
    { x: 145, y: 55 },
    { x: 120, y: 35 },
    { x: 120, y: 75 },
  ], {
    fill: '#785108',
    originX: 'center',
    originY: 'center',
  });

  // Cinta frontal principal
  const ribbonFront = new fabric.Polygon([
    { x: -130, y: 35 },
    { x: 130, y: 35 },
    { x: 120, y: 75 },
    { x: -120, y: 75 },
  ], {
    fill: new fabric.Gradient({
      type: 'linear',
      coords: { x1: -130, y1: 35, x2: 130, y2: 75 },
      colorStops: [
        { offset: 0, color: '#ffca28' },
        { offset: 0.5, color: '#ffd54f' },
        { offset: 1, color: '#ffa000' },
      ],
    }),
    stroke: '#ffffff',
    strokeWidth: 1.5,
    originX: 'center',
    originY: 'center',
  });

  const ribbonText = new fabric.IText('★ MATCHDAY LIVE ★', {
    top: 55,
    fontSize: 13,
    fontWeight: '900',
    fill: '#0f172a',
    charSpacing: 80,
    fontFamily: brand.typography.headlineFont,
    originX: 'center',
    originY: 'center',
  });

  // Sub-etiqueta de serie oficial
  const seriesTag = new fabric.IText('OFFICIAL CHAMPIONSHIP SERIES', {
    top: 100,
    fontSize: 10,
    fontWeight: '800',
    fill: 'rgba(255, 255, 255, 0.65)',
    charSpacing: 120,
    originX: 'center',
    originY: 'center',
  });

  const crestGroup = new fabric.Group([
    outerPulseRing,
    innerPulseRing,
    shieldBase,
    innerShield,
    starsText,
    crestSymbol,
    ribbonFoldLeft,
    ribbonFoldRight,
    ribbonFront,
    ribbonText,
    seriesTag,
  ], {
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center',
    shadow: new fabric.Shadow({
      color: 'rgba(0, 0, 0, 0.95)',
      blur: 40,
      offsetY: 20,
    }),
    selectable: true,
  });

  canvas.add(crestGroup);
}

/**
 * Renderiza el encabezado oficial del kit de marca
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
    const badgeW = 60;
    const badgeH = 60;
    const logoBadge = new fabric.Rect({
      left: Math.round(w * 0.5) - badgeW / 2,
      top: topY,
      width: badgeW,
      height: badgeH,
      rx: 16,
      ry: 16,
      fill: brand.colors.primary,
      stroke: 'rgba(255, 255, 255, 0.25)',
      strokeWidth: 2,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.7)', blur: 14, offsetY: 4 }),
      selectable: true,
    });
    const logoChar = new fabric.IText(brand.logo.symbolText || 'Z', {
      left: Math.round(w * 0.5),
      top: topY + 12,
      originX: 'center',
      fontSize: 30,
      fontWeight: '900',
      fill: '#ffffff',
      fontFamily: brand.typography.headlineFont,
      selectable: true,
    });
    const logoText = new fabric.IText(brand.name.toUpperCase(), {
      left: Math.round(w * 0.5),
      top: topY + badgeH + 12,
      originX: 'center',
      fontSize: 18,
      fontWeight: '900',
      fill: brand.colors.textPrimary || '#ffffff',
      fontFamily: brand.typography.headlineFont,
      charSpacing: 120,
      selectable: true,
    });
    canvas.add(logoBadge, logoChar, logoText);
  } else {
    const logoBadge = new fabric.Rect({
      left: marginX,
      top: topY,
      width: 56,
      height: 56,
      rx: 14,
      ry: 14,
      fill: brand.colors.primary,
      stroke: 'rgba(255, 255, 255, 0.25)',
      strokeWidth: 2,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.7)', blur: 14, offsetY: 4 }),
      selectable: true,
    });
    const logoChar = new fabric.IText(brand.logo.symbolText || 'Z', {
      left: marginX + 16,
      top: topY + 11,
      fontSize: 28,
      fontWeight: '900',
      fill: '#ffffff',
      fontFamily: brand.typography.headlineFont,
      selectable: true,
    });
    const logoText = new fabric.IText(brand.name.toUpperCase(), {
      left: marginX + 72,
      top: topY + 16,
      fontSize: 22,
      fontWeight: '900',
      fill: brand.colors.textPrimary || '#ffffff',
      fontFamily: brand.typography.headlineFont,
      charSpacing: 90,
      selectable: true,
    });
    canvas.add(logoBadge, logoChar, logoText);
  }
}

/**
 * Renderiza la tipografía publicitaria con inclinación deportiva (Sports Slant),
 * relieve 3D con sombras en oclusión y ribbons angulares de alto impacto.
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

  let currentY = Math.round(h * 0.16);
  if (archetype === 'story-vertical') {
    currentY = Math.round(h * 0.56);
  }

  // 1. BADGE ANGULAR DEPORTIVO (MATCHDAY PILL)
  if (badgeText) {
    const badgeStr = `★  ${badgeText.toUpperCase()}  ★`;
    const badgeW = Math.min(340, badgeStr.length * 15 + 46);

    const badgePolygon = new fabric.Polygon([
      { x: 0, y: 0 },
      { x: badgeW, y: 0 },
      { x: badgeW - 14, y: 44 },
      { x: -14, y: 44 },
    ], {
      left: isCentered ? Math.round(w * 0.5) - badgeW / 2 : marginX,
      top: currentY,
      fill: new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: badgeW, y2: 44 },
        colorStops: [
          { offset: 0, color: '#f59e0b' },
          { offset: 1, color: '#d97706' },
        ],
      }),
      stroke: '#ffffff',
      strokeWidth: 1.5,
      shadow: new fabric.Shadow({
        color: 'rgba(245, 158, 11, 0.55)',
        blur: 20,
        offsetY: 6,
      }),
      selectable: true,
    });

    const badgeTextObj = new fabric.IText(badgeStr, {
      left: isCentered ? Math.round(w * 0.5) : marginX + 18,
      top: currentY + 11,
      originX: isCentered ? 'center' : 'left',
      fontSize: 15,
      fontWeight: '900',
      fill: '#ffffff',
      fontStyle: 'italic',
      fontFamily: brand.typography.headlineFont,
      charSpacing: 60,
      selectable: true,
    });

    canvas.add(badgePolygon, badgeTextObj);
    currentY += 66;
  } else {
    currentY += 24;
  }

  // Sombra 3D profunda para los titulares
  const extrusionShadow = new fabric.Shadow({
    color: 'rgba(0, 0, 0, 0.98)',
    blur: 26,
    offsetX: 0,
    offsetY: 10,
  });

  const availableWidth = isCentered ? Math.round(w * 0.86) : Math.round(w * 0.44);

  // LINE 1: Pre-title (Blanco sólido con inclinación deportiva)
  if (headline.line1) {
    const s1 = getFitFontSize(headline.line1, availableWidth, 64, 28);
    const t1 = new fabric.IText(headline.line1, {
      left: isCentered ? Math.round(w * 0.5) : marginX,
      top: currentY,
      originX: isCentered ? 'center' : 'left',
      fontSize: s1,
      fontWeight: '900',
      fontStyle: 'italic',
      fill: '#ffffff',
      fontFamily: brand.typography.headlineFont,
      shadow: extrusionShadow,
      selectable: true,
    });
    canvas.add(t1);
    currentY += (t1.height || 68) + 6;
  }

  // LINE 2: POWER WORD (Dentro de cinta angular de impacto o degradado de oro)
  if (headline.line2) {
    const s2 = getFitFontSize(headline.line2, availableWidth - 20, 92, 38);
    
    // Angled Slash Ribbon detrás de la palabra clave
    const ribbonW = Math.min(availableWidth + 40, headline.line2.length * (s2 * 0.65) + 50);
    const ribbonH = s2 + 24;

    const ribbonBackdrop = new fabric.Polygon([
      { x: 18, y: 0 },
      { x: ribbonW, y: 0 },
      { x: ribbonW - 18, y: ribbonH },
      { x: 0, y: ribbonH },
    ], {
      left: isCentered ? Math.round(w * 0.5) - ribbonW / 2 : marginX - 10,
      top: currentY - 6,
      fill: new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: ribbonW, y2: ribbonH },
        colorStops: [
          { offset: 0, color: brand.colors.accent || '#f59e0b' },
          { offset: 1, color: '#ffd54f' },
        ],
      }),
      shadow: new fabric.Shadow({
        color: 'rgba(245, 158, 11, 0.45)',
        blur: 24,
        offsetY: 8,
      }),
      selectable: true,
    });

    const t2 = new fabric.IText(headline.line2, {
      left: isCentered ? Math.round(w * 0.5) : marginX + 10,
      top: currentY + 4,
      originX: isCentered ? 'center' : 'left',
      fontSize: s2,
      fontWeight: '900',
      fontStyle: 'italic',
      fill: '#090e1a', // Letra oscura sobre fondo dorado/vibrante para máximo contraste
      fontFamily: brand.typography.headlineFont,
      selectable: true,
    });

    canvas.add(ribbonBackdrop, t2);
    currentY += ribbonH + 16;
  }

  // LINE 3: Cierre de titular (Blanco con tracking amplio)
  if (headline.line3) {
    const s3 = getFitFontSize(headline.line3, availableWidth, 54, 26);
    const t3 = new fabric.IText(headline.line3, {
      left: isCentered ? Math.round(w * 0.5) : marginX,
      top: currentY,
      originX: isCentered ? 'center' : 'left',
      fontSize: s3,
      fontWeight: '900',
      fontStyle: 'italic',
      fill: '#ffffff',
      fontFamily: brand.typography.headlineFont,
      charSpacing: 80,
      shadow: extrusionShadow,
      selectable: true,
    });
    canvas.add(t3);
    currentY += (t3.height || 58) + 24;
  } else {
    currentY += 16;
  }

  // 3. Subtítulo / Bajada descriptiva
  if (subtitle) {
    const subWidth = isCentered ? Math.round(w * 0.78) : Math.round(w * 0.42);
    const subObj = new fabric.Textbox(subtitle, {
      left: isCentered ? Math.round(w * 0.5) : marginX,
      top: currentY,
      originX: isCentered ? 'center' : 'left',
      width: subWidth,
      textAlign: isCentered ? 'center' : 'left',
      fontSize: archetype === 'story-vertical' ? 24 : 22,
      fontWeight: '600',
      fill: brand.colors.textSecondary || '#cbd5e1',
      lineHeight: 1.38,
      fontFamily: brand.typography.bodyFont,
      selectable: true,
    });
    canvas.add(subObj);
  }
}

/**
 * Renderiza el botón CTA en relieve deportivo y sellos de confianza
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
  const btnText = `${ctaText.toUpperCase()}  ➔`;

  let ctaTop = Math.round(h * 0.75);
  let ctaWidth = Math.max(360, btnText.length * 16 + 60);

  if (archetype === 'story-vertical') {
    ctaTop = Math.round(h * 0.86);
    ctaWidth = Math.round(w * 0.78);
  }

  const ctaBg = new fabric.Rect({
    left: isCentered ? Math.round(w * 0.5) - ctaWidth / 2 : marginX,
    top: ctaTop,
    width: ctaWidth,
    height: 74,
    rx: 16,
    ry: 16,
    fill: new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: ctaWidth, y2: 74 },
      colorStops: [
        { offset: 0, color: brand.colors.primary || '#0d66d0' },
        { offset: 1, color: brand.colors.secondary || '#388bff' },
      ],
    }),
    stroke: 'rgba(255, 255, 255, 0.35)',
    strokeWidth: 2,
    shadow: new fabric.Shadow({
      color: 'rgba(13, 102, 208, 0.6)',
      blur: 28,
      offsetY: 10,
    }),
    selectable: true,
  });

  const ctaTextObj = new fabric.IText(btnText, {
    left: isCentered ? Math.round(w * 0.5) : marginX + 32,
    top: ctaTop + 23,
    originX: isCentered ? 'center' : 'left',
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    fill: '#ffffff',
    fontFamily: brand.typography.headlineFont,
    selectable: true,
  });

  canvas.add(ctaBg, ctaTextObj);

  // Micro-beneficios / Sello de confianza de estadio
  const trustText = '⚡ TRANSMISIÓN EN DIRECTO 4K • ACCESO EXCLUSIVO • BOLETOS LIMITADOS';

  const trustObj = new fabric.IText(trustText, {
    left: isCentered ? Math.round(w * 0.5) : marginX,
    top: ctaTop + 92,
    originX: isCentered ? 'center' : 'left',
    fontSize: 12,
    fontWeight: '800',
    fill: '#94a3b8',
    fontFamily: brand.typography.headlineFont,
    charSpacing: 70,
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

  const footerText = new fabric.IText(`● ${handleOrUrl}  |  ZOIK STUDIO ENGINE`, {
    left: isCentered ? Math.round(w * 0.5) : marginX,
    top: Math.round(h * 0.94),
    originX: isCentered ? 'center' : 'left',
    fontSize: 15,
    fontWeight: '700',
    fill: '#64748b',
    fontFamily: brand.typography.bodyFont,
    charSpacing: 50,
    selectable: true,
  });
  canvas.add(footerText);
}
