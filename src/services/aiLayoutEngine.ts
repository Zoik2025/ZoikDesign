import type { BrandKit, CanvasFormat, CompositionStyle, DesignLayer, ApiSettings } from '../types';

interface GenerateParams {
  brand: BrandKit;
  format: CanvasFormat;
  style: CompositionStyle;
  briefPrompt: string;
  visualSubjectPrompt: string;
  apiSettings: ApiSettings;
}

// Built-in Curated High-End Vector Assets (Renderable as SVG or canvas objects)
const VECTOR_HERO_ASSETS: Record<string, { svgMarkup: string; defaultColor: string }> = {
  cyber: {
    defaultColor: '#6366f1',
    svgMarkup: `
      <g filter="drop-shadow(0px 15px 25px rgba(99, 102, 241, 0.45))">
        <rect x="40" y="40" width="120" height="120" rx="28" fill="url(#heroGrad1)" stroke="#818cf8" stroke-width="2.5"/>
        <circle cx="100" cy="100" r="36" fill="#0f172a" stroke="#06b6d4" stroke-width="3"/>
        <path d="M100 74 L122 116 H78 Z" fill="url(#heroGrad2)"/>
        <circle cx="100" cy="100" r="10" fill="#ffffff" opacity="0.9"/>
      </g>
    `,
  },
  coffee: {
    defaultColor: '#d97706',
    svgMarkup: `
      <g filter="drop-shadow(0px 15px 25px rgba(217, 119, 6, 0.4))">
        <circle cx="100" cy="100" r="64" fill="url(#coffeeGrad1)" stroke="#f59e0b" stroke-width="3"/>
        <path d="M72 82 Q100 68 128 82 Q128 120 100 132 Q72 120 72 82 Z" fill="#451a03" stroke="#d97706" stroke-width="2"/>
        <path d="M128 92 C142 92 142 110 128 110" stroke="#f59e0b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M88 64 Q94 54 88 44 M100 64 Q106 54 100 44 M112 64 Q118 54 112 44" stroke="#fde68a" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
      </g>
    `,
  },
  sport: {
    defaultColor: '#ef4444',
    svgMarkup: `
      <g filter="drop-shadow(0px 15px 30px rgba(239, 68, 68, 0.45))">
        <polygon points="100,35 155,65 155,130 100,165 45,130 45,65" fill="url(#sportGrad1)" stroke="#f87171" stroke-width="3"/>
        <polygon points="100,55 138,76 138,122 100,146 62,122 62,76" fill="#18181b"/>
        <path d="M82 104 L96 118 L124 82" stroke="#22c55e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>
    `,
  },
  minimal: {
    defaultColor: '#6366f1',
    svgMarkup: `
      <g filter="drop-shadow(0px 12px 24px rgba(0,0,0,0.3))">
        <circle cx="100" cy="100" r="58" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="10 6"/>
        <rect x="65" y="65" width="70" height="70" rx="14" fill="#6366f1" transform="rotate(45 100 100)"/>
        <circle cx="100" cy="100" r="14" fill="#ffffff"/>
      </g>
    `,
  }
};

export async function generateDesignPiece(params: GenerateParams): Promise<DesignLayer[]> {
  const { brand, format, style, briefPrompt, visualSubjectPrompt, apiSettings } = params;

  // 1. Si el usuario configuró API Key de OpenAI y activó modo Live, podemos llamar a OpenAI
  if (apiSettings.enableLiveOpenAi && apiSettings.openaiApiKey) {
    try {
      const openAiResult = await callOpenAiDirector(params);
      if (openAiResult) return openAiResult;
    } catch (e) {
      console.warn('Fallo en OpenAI, recurriendo al Director de Arte Algorítmico integrado:', e);
    }
  }

  // 2. Director de Arte Algorítmico Local (Instantáneo, profesional y 100% fiel a marca)
  return generateAlgorithmicPiece(brand, format, style, briefPrompt, visualSubjectPrompt);
}

function generateAlgorithmicPiece(
  brand: BrandKit,
  format: CanvasFormat,
  style: CompositionStyle,
  brief: string,
  _visualSubject: string
): DesignLayer[] {
  const isVertical = format.height > format.width * 1.2;
  const isHorizontal = format.width > format.height * 1.3;

  // Smart Copy Extraction or Generation
  let headline = 'DOMINA EL FUTURO DIGITAL';
  let subtitle = 'Diseño algorítmico y estándares vectoriales de alta precisión para marcas líderes.';
  let badgeText = '40% OFF EXCLUSIVO';
  let ctaText = 'Comenzar Ahora →';

  const briefLower = (brief || '').toLowerCase();

  if (briefLower.includes('café') || briefLower.includes('cafe') || brand.tone === 'elegant') {
    headline = 'SABORES QUE DESPIERTAN TU DÍA';
    subtitle = 'Granos de altura 100% arábica tostados artesanalmente en lotes limitados.';
    badgeText = 'COSECHA SELECCIONADA';
    ctaText = 'Ordenar Ahora →';
  } else if (briefLower.includes('fitness') || briefLower.includes('deporte') || briefLower.includes('gym') || brand.tone === 'bold') {
    headline = 'SUPERA CADA LÍMITE';
    subtitle = 'Indumentaria técnica de compresión transpirable para atletas que buscan el máximo nivel.';
    badgeText = 'NUEVA TEMPORADA 2026';
    ctaText = 'Ver Colección →';
  } else if (briefLower.includes('descuento') || briefLower.includes('oferta') || briefLower.includes('promo')) {
    headline = 'OFERTA ESPECIAL POR TIEMPO LIMITADO';
    subtitle = 'Aprovecha las mejores ventajas exclusivas antes de que finalice la promoción.';
    badgeText = 'HASTA 50% OFF';
    ctaText = 'Reclamar Descuento →';
  } else if (brief && brief.trim().length > 10) {
    // Si el usuario escribió un brief personalizado, adaptamos titulares dinámicos
    const words = brief.trim().split(' ');
    if (words.length <= 6) {
      headline = brief.toUpperCase();
      subtitle = `Experimenta la nueva propuesta de ${brand.name}.`;
    } else {
      headline = words.slice(0, 5).join(' ').toUpperCase();
      subtitle = brief;
    }
  }

  // Select Hero Asset SVG
  let assetKey = 'cyber';
  if (brand.tone === 'elegant' || briefLower.includes('cafe')) assetKey = 'coffee';
  else if (brand.tone === 'bold' || briefLower.includes('sport')) assetKey = 'sport';
  else if (style === 'minimal-editorial') assetKey = 'minimal';

  const heroAsset = VECTOR_HERO_ASSETS[assetKey] || VECTOR_HERO_ASSETS.cyber;

  // Layers Array
  const layers: DesignLayer[] = [];

  // LAYER 0: BACKGROUND
  layers.push({
    id: 'layer-bg',
    name: 'Fondo Principal & Gradientes',
    type: 'background',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: brand.colors.backgroundDark,
    visible: true,
    locked: true,
  });

  // LAYER 1: DECORATIVE VECTORS (Geometric shapes & neon ambient glow)
  layers.push({
    id: 'layer-decorations',
    name: 'Formas Vectoriales & Luz Ambiental',
    type: 'decoration',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: brand.colors.primary,
    stroke: brand.colors.secondary,
    opacity: 0.35,
    visible: true,
    locked: true,
  });

  // LAYER 2: BRAND LOGO (Top-Left or Top-Center)
  layers.push({
    id: 'layer-brand-logo',
    name: 'Logotipo de Marca',
    type: 'logo',
    content: brand.logo.fullText,
    fontFamily: brand.typography.headlineFont,
    fill: brand.colors.textPrimary,
    x: isHorizontal ? 6 : (style === 'minimal-editorial' ? 50 : 6),
    y: 5,
    textAlign: style === 'minimal-editorial' && !isHorizontal ? 'center' : 'left',
    fontSize: 16,
    fontWeight: '800',
    visible: true,
    locked: false,
    badgeBg: brand.colors.primary,
    badgeColor: brand.colors.textPrimary,
  });

  // LAYER 3: CATEGORY / RELEASE BADGE
  layers.push({
    id: 'layer-category-tag',
    name: 'Etiqueta Superior',
    type: 'badge',
    content: `RELEASE ${new Date().getFullYear()}`,
    fontFamily: brand.typography.bodyFont,
    fill: brand.colors.accent,
    badgeBg: 'rgba(255, 255, 255, 0.08)',
    x: isHorizontal ? 80 : 72,
    y: 5.2,
    fontSize: 11,
    fontWeight: '700',
    visible: true,
    locked: false,
  });

  // LAYER 4: HERO VISUAL ASSET
  let assetY = 32;
  let assetX = 50;
  let assetSize = 38;

  if (style === 'split-left-right') {
    assetX = 72;
    assetY = 50;
    assetSize = 42;
  } else if (isVertical) {
    assetY = 34;
    assetSize = 45;
  } else if (isHorizontal) {
    assetX = 75;
    assetY = 50;
    assetSize = 50;
  }

  layers.push({
    id: 'layer-hero-visual',
    name: 'Elemento Visual Central (Asset Vectorial / IA)',
    type: 'visual-asset',
    x: assetX,
    y: assetY,
    width: assetSize,
    height: assetSize,
    fill: heroAsset.defaultColor,
    svgIcon: heroAsset.svgMarkup,
    visible: true,
    locked: false,
  });

  // LAYER 5: PROMOTIONAL OFFER PILL
  let promoY = isVertical ? 62 : (isHorizontal ? 24 : 64);
  let promoX = style === 'split-left-right' || isHorizontal ? 6 : (style === 'minimal-editorial' ? 50 : 6);

  layers.push({
    id: 'layer-offer-pill',
    name: 'Pill de Beneficio / Oferta',
    type: 'badge',
    content: badgeText,
    fontFamily: brand.typography.headlineFont,
    fill: '#ffffff',
    badgeBg: brand.colors.primary,
    x: promoX,
    y: promoY,
    fontSize: 12,
    fontWeight: '800',
    visible: true,
    locked: false,
  });

  // LAYER 6: HEADLINE (H1)
  let headlineY = isVertical ? 68 : (isHorizontal ? 32 : 70);
  let headlineX = promoX;
  let headlineAlign: 'left' | 'center' | 'right' = style === 'minimal-editorial' && !isHorizontal ? 'center' : 'left';
  let headlineSize = isVertical ? 32 : (isHorizontal ? 36 : 28);

  layers.push({
    id: 'layer-headline',
    name: 'Titular de Alto Impacto (H1)',
    type: 'headline',
    content: headline,
    fontFamily: brand.typography.headlineFont,
    fill: brand.colors.textPrimary,
    x: headlineX,
    y: headlineY,
    fontSize: headlineSize,
    fontWeight: '800',
    textAlign: headlineAlign,
    visible: true,
    locked: false,
  });

  // LAYER 7: SUBTITLE / COPY (H2)
  let subY = isVertical ? 78 : (isHorizontal ? 56 : 80);

  layers.push({
    id: 'layer-subtitle',
    name: 'Subtítulo Comercial & Argumento',
    type: 'subtitle',
    content: subtitle,
    fontFamily: brand.typography.bodyFont,
    fill: brand.colors.textSecondary,
    x: headlineX,
    y: subY,
    fontSize: isVertical ? 14 : 13,
    fontWeight: '400',
    textAlign: headlineAlign,
    visible: true,
    locked: false,
  });

  // LAYER 8: CTA BUTTON
  let ctaY = isVertical ? 88 : (isHorizontal ? 75 : 90);
  let ctaX = isHorizontal ? 6 : (style === 'minimal-editorial' ? 50 : 70);

  layers.push({
    id: 'layer-cta-button',
    name: 'Botón de Llamado a la Acción (CTA)',
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

  // LAYER 9: FOOTER URL / HANDLE
  layers.push({
    id: 'layer-footer-url',
    name: 'Sitio Web / Identificador',
    type: 'footer-url',
    content: brand.website,
    fontFamily: brand.typography.bodyFont,
    fill: brand.colors.textSecondary,
    x: isHorizontal ? 40 : 6,
    y: isVertical ? 95 : 91,
    fontSize: 11,
    fontWeight: '500',
    visible: true,
    locked: false,
  });

  return layers;
}

// Handler para llamada directa a OpenAI si el usuario provee su API key
async function callOpenAiDirector(params: GenerateParams): Promise<DesignLayer[] | null> {
  const { brand, format, briefPrompt, apiSettings } = params;
  
  const systemPrompt = `Eres un Director de Arte y Diseñador Gráfico de élite para la marca ${brand.name}.
Debes redactar copys comerciales impactantes para una pieza gráfica de formato ${format.name} (${format.width}x${format.height}).
Responde ÚNICAMENTE un JSON con:
{
  "headline": "Titular en mayúsculas de 3 a 5 palabras de impacto",
  "subtitle": "Subtítulo persuasivo de 12 a 20 palabras",
  "badgeText": "Frase de oferta o badge de 2 a 4 palabras",
  "ctaText": "Texto de botón CTA con flecha"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiSettings.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Brief de la pieza: ${briefPrompt || 'Promoción general de la marca'}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  // Aplicar los copys generados por OpenAI sobre la base algorítmica
  const baseLayers = generateAlgorithmicPiece(brand, format, params.style, briefPrompt, params.visualSubjectPrompt);
  
  return baseLayers.map(layer => {
    if (layer.id === 'layer-headline' && parsed.headline) {
      return { ...layer, content: parsed.headline.toUpperCase() };
    }
    if (layer.id === 'layer-subtitle' && parsed.subtitle) {
      return { ...layer, content: parsed.subtitle };
    }
    if (layer.id === 'layer-offer-pill' && parsed.badgeText) {
      return { ...layer, content: parsed.badgeText.toUpperCase() };
    }
    if (layer.id === 'layer-cta-button' && parsed.ctaText) {
      return { ...layer, content: parsed.ctaText };
    }
    return layer;
  });
}
