import type { BrandKit, CanvasFormat, CompositionStyle, DesignLayer, PieceCopyInput } from '../types';

export interface GeneratePieceParams {
  brand: BrandKit;
  format: CanvasFormat;
  style: CompositionStyle;
  copyInput: PieceCopyInput;
}

// Catálogo de composiciones vectoriales puras (100% SVG geométrico y editable)
const VECTOR_GRAPHIC_MOTIFS: Record<string, { svgMarkup: string; colorRole: 'primary' | 'secondary' | 'accent' }> = {
  modern: {
    colorRole: 'primary',
    svgMarkup: `
      <g filter="drop-shadow(0px 16px 32px rgba(0,0,0,0.35))">
        <circle cx="100" cy="100" r="72" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="12 6" opacity="0.6"/>
        <rect x="52" y="52" width="96" height="96" rx="24" fill="currentColor" opacity="0.85"/>
        <circle cx="100" cy="100" r="28" fill="#ffffff" opacity="0.95"/>
        <path d="M78 100 L94 116 L124 84" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>
    `,
  },
  bold: {
    colorRole: 'accent',
    svgMarkup: `
      <g filter="drop-shadow(0px 20px 40px rgba(0,0,0,0.4))">
        <polygon points="100,24 168,62 168,138 100,176 32,138 32,62" fill="currentColor" opacity="0.9"/>
        <polygon points="100,48 148,74 148,126 100,152 52,126 52,74" fill="#0d0d0d"/>
        <circle cx="100" cy="100" r="22" fill="#ffffff" opacity="0.9"/>
      </g>
    `,
  },
  minimal: {
    colorRole: 'primary',
    svgMarkup: `
      <g filter="drop-shadow(0px 12px 24px rgba(0,0,0,0.25))">
        <circle cx="100" cy="100" r="76" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>
        <circle cx="100" cy="100" r="54" fill="none" stroke="currentColor" stroke-width="3"/>
        <line x1="40" y1="100" x2="160" y2="100" stroke="currentColor" stroke-width="2"/>
        <line x1="100" y1="40" x2="100" y2="160" stroke="currentColor" stroke-width="2"/>
        <circle cx="100" cy="100" r="12" fill="#ffffff"/>
      </g>
    `,
  },
  elegant: {
    colorRole: 'secondary',
    svgMarkup: `
      <g filter="drop-shadow(0px 15px 30px rgba(0,0,0,0.3))">
        <circle cx="100" cy="100" r="68" fill="none" stroke="currentColor" stroke-width="2"/>
        <rect x="60" y="60" width="80" height="80" rx="16" fill="currentColor" transform="rotate(45 100 100)" opacity="0.75"/>
        <circle cx="100" cy="100" r="18" fill="#ffffff" opacity="0.9"/>
      </g>
    `,
  },
  cyber: {
    colorRole: 'primary',
    svgMarkup: `
      <g filter="drop-shadow(0px 18px 36px rgba(0,0,0,0.4))">
        <rect x="42" y="42" width="116" height="116" rx="26" fill="currentColor" opacity="0.8"/>
        <circle cx="100" cy="100" r="38" fill="#0d0d0d" stroke="#ffffff" stroke-width="2.5"/>
        <polygon points="100,74 122,118 78,118" fill="currentColor"/>
      </g>
    `,
  },
};

/**
 * Motor de Diseño Gráfico Asistido por IA
 * La IA NO inventa ni propone copy: respeta 100% el texto asignado por el usuario.
 * Su rol es estructurar la pieza gráfica, aplicar jerarquías visuales, tipografías del manual,
 * paleta de marca y distribución espacial vectorial (SVG).
 */
export async function generateDesignPiece(params: GeneratePieceParams): Promise<DesignLayer[]> {
  const { brand, format, style, copyInput } = params;

  const isVertical = format.height > format.width * 1.2;
  const isHorizontal = format.width > format.height * 1.3;

  // 1. Textos exactos suministrados por el usuario
  const headlineText = copyInput.headline.trim() || brand.name.toUpperCase();
  const subtitleText = copyInput.subtitle.trim();
  const badgeText = copyInput.badgeText?.trim() || '';
  const ctaText = copyInput.ctaText?.trim() || '';

  // 2. Motivo gráfico vectorial
  const motifKey = brand.tone in VECTOR_GRAPHIC_MOTIFS ? brand.tone : 'modern';
  const motif = VECTOR_GRAPHIC_MOTIFS[motifKey];
  const motifColor = brand.colors[motif.colorRole] || brand.colors.primary;

  const layers: DesignLayer[] = [];

  // LAYER 0: FONDO VECTORIAL (RECTÁNGULO BASE)
  layers.push({
    id: 'layer-bg',
    name: 'Fondo de Mesa (Marca)',
    type: 'background',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: brand.colors.backgroundDark,
    visible: true,
    locked: true,
  });

  // LAYER 1: DECORACIONES VECTORIALES Y LUCES AMBIENTALES
  layers.push({
    id: 'layer-decorations',
    name: 'Acentos Gráficos Vectoriales',
    type: 'decoration',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: brand.colors.primary,
    stroke: brand.colors.secondary,
    opacity: 0.25,
    visible: true,
    locked: true,
  });

  // LAYER 2: LOGOTIPO DE MARCA (CON FORMA DEL MANUAL)
  const isCentered = style === 'minimal-editorial' && !isHorizontal;
  layers.push({
    id: 'layer-brand-logo',
    name: `Logo — ${brand.name}`,
    type: 'logo',
    content: brand.logo.fullText || brand.name.toUpperCase(),
    fontFamily: brand.typography.headlineFont,
    fill: brand.colors.textPrimary,
    x: isCentered ? 50 : 6,
    y: 5,
    textAlign: isCentered ? 'center' : 'left',
    fontSize: 16,
    fontWeight: '800',
    visible: true,
    locked: false,
    badgeBg: brand.colors.primary,
    badgeColor: brand.colors.textPrimary,
  });

  // LAYER 3: ELEMENTO VECTORIAL CENTRAL (ASSET SVG EDITABLE)
  let assetY = 32;
  let assetX = 50;
  let assetSize = 36;

  if (style === 'split-left-right') {
    assetX = 74;
    assetY = 50;
    assetSize = 42;
  } else if (isVertical) {
    assetY = 34;
    assetSize = 44;
  } else if (isHorizontal) {
    assetX = 76;
    assetY = 50;
    assetSize = 48;
  }

  layers.push({
    id: 'layer-hero-visual',
    name: 'Motivo Vectorial SVG',
    type: 'visual-asset',
    x: assetX,
    y: assetY,
    width: assetSize,
    height: assetSize,
    fill: motifColor,
    svgIcon: motif.svgMarkup,
    visible: true,
    locked: false,
  });

  // LAYER 4: BADGE / ETIQUETA DESTACADA (SI FUE INGRESADA POR EL USUARIO)
  let promoY = isVertical ? 60 : (isHorizontal ? 22 : 62);
  let promoX = style === 'split-left-right' || isHorizontal ? 6 : (isCentered ? 50 : 6);

  if (badgeText) {
    layers.push({
      id: 'layer-offer-pill',
      name: `Badge — ${badgeText}`,
      type: 'badge',
      content: badgeText.toUpperCase(),
      fontFamily: brand.typography.accentFont || brand.typography.headlineFont,
      fill: '#ffffff',
      badgeBg: brand.colors.primary,
      x: promoX,
      y: promoY,
      fontSize: 12,
      fontWeight: '800',
      visible: true,
      locked: false,
    });
  }

  // LAYER 5: TITULAR PRINCIPAL (H1) — EXACTO DEL USUARIO
  let headlineY = badgeText ? (isVertical ? 67 : (isHorizontal ? 32 : 69)) : promoY;
  let headlineAlign: 'left' | 'center' | 'right' = isCentered ? 'center' : 'left';
  let headlineSize = isVertical ? 32 : (isHorizontal ? 36 : 28);

  layers.push({
    id: 'layer-headline',
    name: 'Titular H1 (Copy Real)',
    type: 'headline',
    content: headlineText,
    fontFamily: brand.typography.headlineFont,
    fill: brand.colors.textPrimary,
    x: promoX,
    y: headlineY,
    fontSize: headlineSize,
    fontWeight: '800',
    textAlign: headlineAlign,
    visible: true,
    locked: false,
  });

  // LAYER 6: SUBTÍTULO / BAJADA (SI FUE INGRESADA POR EL USUARIO)
  if (subtitleText) {
    let subY = isVertical ? headlineY + 11 : (isHorizontal ? headlineY + 18 : headlineY + 12);
    layers.push({
      id: 'layer-subtitle',
      name: 'Subtítulo / Bajada',
      type: 'subtitle',
      content: subtitleText,
      fontFamily: brand.typography.bodyFont,
      fill: brand.colors.textSecondary,
      x: promoX,
      y: subY,
      fontSize: isVertical ? 14 : 13,
      fontWeight: '400',
      textAlign: headlineAlign,
      visible: true,
      locked: false,
    });
  }

  // LAYER 7: BOTÓN CTA (SI FUE INGRESADO POR EL USUARIO)
  if (ctaText) {
    let ctaY = isVertical ? 88 : (isHorizontal ? 75 : 88);
    let ctaX = isHorizontal ? 6 : (isCentered ? 50 : 70);

    layers.push({
      id: 'layer-cta-button',
      name: `Botón CTA — ${ctaText}`,
      type: 'cta-button',
      content: ctaText,
      fontFamily: brand.typography.headlineFont,
      fill: '#0f172a',
      badgeBg: '#ffffff',
      x: ctaX,
      y: ctaY,
      fontSize: 13,
      fontWeight: '700',
      visible: true,
      locked: false,
    });
  }

  // LAYER 8: SITIO WEB O RED SOCIAL DE LA MARCA (FOOTER)
  if (brand.website || brand.contactHandle) {
    layers.push({
      id: 'layer-footer-url',
      name: 'Identificador / Web de Marca',
      type: 'footer-url',
      content: brand.website || brand.contactHandle,
      fontFamily: brand.typography.bodyFont,
      fill: brand.colors.textSecondary,
      x: isHorizontal ? 40 : 6,
      y: isVertical ? 96 : 92,
      fontSize: 11,
      fontWeight: '500',
      visible: true,
      locked: false,
    });
  }

  return layers;
}
