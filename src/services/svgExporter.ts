import type { BrandKit, CanvasFormat, DesignLayer } from '../types';
import saveAs from 'file-saver';

interface ExportParams {
  brand: BrandKit;
  format: CanvasFormat;
  layers: DesignLayer[];
  filename?: string;
}

/**
 * Genera y descarga un archivo SVG vectorial 100% limpio y editable
 * compatible con Adobe Illustrator, Figma, CorelDraw e Inkscape.
 */
export function exportToCleanSVG({ brand, format, layers, filename }: ExportParams): void {
  const { width, height } = format;
  const safeFilename = filename || `${brand.name.toLowerCase().replace(/\s+/g, '-')}-${format.id}.svg`;

  // Build SVG XML
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Paleta Corporativa de ${brand.name} -->
    <linearGradient id="brandGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${brand.colors.primary}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${brand.colors.secondary}" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${brand.colors.primary}"/>
      <stop offset="100%" stop-color="${brand.colors.secondary}"/>
    </linearGradient>
    <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${brand.colors.accent}"/>
      <stop offset="100%" stop-color="${brand.colors.primary}"/>
    </linearGradient>
    <linearGradient id="coffeeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="sportGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${brand.colors.primary}"/>
      <stop offset="100%" stop-color="${brand.colors.secondary}"/>
    </linearGradient>
    <filter id="glowBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur"/>
    </filter>
  </defs>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(brand.typography.headlineFont)}:wght@700;800;900&amp;family=${encodeURIComponent(brand.typography.bodyFont)}:wght@400;600&amp;display=swap');
    .headline-font { font-family: '${brand.typography.headlineFont}', sans-serif; font-weight: 800; }
    .body-font { font-family: '${brand.typography.bodyFont}', sans-serif; }
  </style>
`;

  // Render Layers in Order
  layers.forEach((layer) => {
    if (!layer.visible) return;

    const absX = (layer.x / 100) * width;
    const absY = (layer.y / 100) * height;

    if (layer.type === 'background') {
      svgContent += `
  <!-- CAPA: FONDO -->
  <g id="layer-background">
    <rect width="${width}" height="${height}" fill="${layer.fill || brand.colors.backgroundDark}" />
  </g>`;
    } else if (layer.type === 'decoration') {
      svgContent += `
  <!-- CAPA: DECORACIONES VECTORIALES -->
  <g id="layer-decorations" opacity="${layer.opacity || 0.35}">
    <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${width * 0.35}" fill="url(#brandGradient1)" filter="url(#glowBlur)"/>
    <circle cx="${width * 0.15}" cy="${height * 0.85}" r="${width * 0.25}" fill="${brand.colors.secondary}" opacity="0.2" filter="url(#glowBlur)"/>
    <path d="M-50,${height * 0.75} Q${width * 0.3},${height * 0.6} ${width + 50},${height * 0.9}" stroke="${brand.colors.primary}" stroke-width="2" stroke-dasharray="8 8" fill="none" opacity="0.4"/>
  </g>`;
    } else if (layer.type === 'logo') {
      svgContent += `
  <!-- CAPA: LOGOTIPO DE MARCA -->
  <g id="layer-brand-logo" transform="translate(${absX}, ${absY})">
    <rect x="-8" y="-18" width="34" height="34" rx="8" fill="${brand.colors.primary}"/>
    <text x="9" y="4" fill="#ffffff" font-size="14" font-weight="900" font-family="'${brand.typography.headlineFont}', sans-serif" text-anchor="middle" dominant-baseline="middle">${brand.logo.symbolText}</text>
    <text x="36" y="2" fill="${layer.fill || '#ffffff'}" font-size="15" font-weight="800" font-family="'${brand.typography.headlineFont}', sans-serif" letter-spacing="1.5">${escapeXml(layer.content || brand.name.toUpperCase())}</text>
  </g>`;
    } else if (layer.type === 'badge' && layer.id === 'layer-category-tag') {
      svgContent += `
  <!-- CAPA: BADGE CATEGORÍA -->
  <g id="layer-category-badge" transform="translate(${absX}, ${absY})">
    <rect x="-10" y="-14" width="160" height="26" rx="13" fill="${layer.badgeBg || 'rgba(255,255,255,0.1)'}" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="70" y="3" fill="${layer.fill || brand.colors.accent}" font-size="11" font-weight="700" font-family="'${brand.typography.bodyFont}', sans-serif" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">${escapeXml(layer.content || '')}</text>
  </g>`;
    } else if (layer.type === 'visual-asset') {
      const assetPixelSize = ((layer.width || 40) / 100) * Math.min(width, height);
      svgContent += `
  <!-- CAPA: ASSET VISUAL PRINCIPAL (VECTORIAL) -->
  <g id="layer-hero-asset" transform="translate(${absX - assetPixelSize / 2}, ${absY - assetPixelSize / 2}) scale(${assetPixelSize / 200})">
    ${layer.svgIcon || ''}
  </g>`;
    } else if (layer.type === 'badge' && layer.id === 'layer-offer-pill') {
      svgContent += `
  <!-- CAPA: PILL DE OFERTA -->
  <g id="layer-offer-pill" transform="translate(${absX}, ${absY})">
    <rect x="0" y="-16" width="180" height="30" rx="6" fill="${layer.badgeBg || brand.colors.primary}"/>
    <text x="90" y="3" fill="#ffffff" font-size="12" font-weight="900" font-family="'${brand.typography.headlineFont}', sans-serif" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.5">${escapeXml(layer.content || '')}</text>
  </g>`;
    } else if (layer.type === 'headline') {
      const scaledFontSize = Math.round(((layer.fontSize || 28) / 1080) * width);
      const font = layer.fontFamily || brand.typography.headlineFont;
      const weight = layer.fontWeight || '800';
      const tracking = layer.letterSpacing !== undefined ? layer.letterSpacing : 0;
      let text = layer.content || '';
      if (layer.textTransform === 'uppercase') text = text.toUpperCase();
      else if (layer.textTransform === 'lowercase') text = text.toLowerCase();

      svgContent += `
  <!-- CAPA: TITULAR H1 -->
  <g id="layer-headline">
    <text x="${absX}" y="${absY}" fill="${layer.fill || '#ffffff'}" font-size="${scaledFontSize}" font-family="'${font}', sans-serif" font-weight="${weight}" letter-spacing="${tracking}" text-anchor="${layer.textAlign === 'center' ? 'middle' : 'start'}">
      ${escapeXml(text)}
    </text>
  </g>`;
    } else if (layer.type === 'subtitle') {
      const scaledSubFontSize = Math.round(((layer.fontSize || 14) / 1080) * width);
      const font = layer.fontFamily || brand.typography.bodyFont;
      const weight = layer.fontWeight || '400';
      const tracking = layer.letterSpacing !== undefined ? layer.letterSpacing : 0;
      let text = layer.content || '';
      if (layer.textTransform === 'uppercase') text = text.toUpperCase();
      else if (layer.textTransform === 'lowercase') text = text.toLowerCase();

      svgContent += `
  <!-- CAPA: SUBTÍTULO / COPY -->
  <g id="layer-subtitle">
    <text x="${absX}" y="${absY}" fill="${layer.fill || brand.colors.textSecondary}" font-size="${scaledSubFontSize}" font-family="'${font}', sans-serif" font-weight="${weight}" letter-spacing="${tracking}" opacity="0.9" text-anchor="${layer.textAlign === 'center' ? 'middle' : 'start'}">
      ${escapeXml(text)}
    </text>
  </g>`;
    } else if (layer.type === 'cta-button') {
      svgContent += `
  <!-- CAPA: BOTÓN CTA -->
  <g id="layer-cta-button" transform="translate(${absX}, ${absY})">
    <rect x="0" y="-18" width="180" height="42" rx="10" fill="${layer.badgeBg || '#ffffff'}" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.25))"/>
    <text x="90" y="7" fill="${layer.fill || '#0f172a'}" font-size="13" font-weight="700" class="headline-font" text-anchor="middle" dominant-baseline="middle">${escapeXml(layer.content || 'Comenzar →')}</text>
  </g>`;
    } else if (layer.type === 'footer-url') {
      svgContent += `
  <!-- CAPA: IDENTIFICADOR / URL -->
  <g id="layer-footer-url">
    <circle cx="${absX - 8}" cy="${absY - 4}" r="3" fill="${brand.colors.secondary}"/>
    <text x="${absX}" y="${absY}" fill="${layer.fill || brand.colors.textSecondary}" font-size="12" class="body-font" opacity="0.8">
      ${escapeXml(layer.content || brand.website)}
    </text>
  </g>`;
    }
  });

  svgContent += `\n</svg>`;

  // Trigger Save
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, safeFilename);
}

/**
 * Exporta el diseño en formato PNG de alta resolución (hasta 300 DPI)
 */
export async function exportToHighResPNG(
  artboardElement: HTMLElement,
  format: CanvasFormat,
  dpi: number = 300,
  filename?: string
): Promise<void> {
  const safeFilename = filename || `zoik-export-${format.id}-${dpi}dpi.png`;
  
  // Calcular escala para alta resolución (300 DPI vs 72 DPI estándar de pantalla = ~4.16x)
  const scale = dpi === 300 ? 3.0 : (dpi === 150 ? 2.0 : 1.0);
  const targetWidth = format.width * scale;
  const targetHeight = format.height * scale;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Convert artboard HTML / SVG to an image via XMLSerializer
  const svgData = new XMLSerializer().serializeToString(artboardElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, safeFilename);
      }
    }, 'image/png');
  };
  img.src = url;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
