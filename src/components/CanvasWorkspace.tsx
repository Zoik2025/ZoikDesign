import React, { useState } from 'react';
import type { BrandKit, CanvasFormat, DesignLayer } from '../types';
import { RefreshCw, Grid, ZoomIn, ZoomOut } from 'lucide-react';

interface CanvasWorkspaceProps {
  brand: BrandKit;
  format: CanvasFormat;
  layers: DesignLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string | null) => void;
  onShuffleColors: () => void;
  artboardRef: React.RefObject<HTMLDivElement>;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  brand,
  format,
  layers,
  selectedLayerId,
  onSelectLayer,
  onShuffleColors,
  artboardRef,
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Calculate Artboard dimensions to fit comfortably in viewport
  const maxViewHeight = 520;
  const maxViewWidth = 560;
  
  let artboardWidth = maxViewWidth;
  let artboardHeight = maxViewWidth * (format.height / format.width);

  if (artboardHeight > maxViewHeight) {
    artboardHeight = maxViewHeight;
    artboardWidth = maxViewHeight * (format.width / format.height);
  }

  // Handle background layer
  const bgLayer = layers.find(l => l.type === 'background');
  const decorLayer = layers.find(l => l.type === 'decoration');
  const logoLayer = layers.find(l => l.type === 'logo');
  const catTagLayer = layers.find(l => l.id === 'layer-category-tag');
  const heroLayer = layers.find(l => l.type === 'visual-asset');
  const pillLayer = layers.find(l => l.id === 'layer-offer-pill');
  const headlineLayer = layers.find(l => l.type === 'headline');
  const subtitleLayer = layers.find(l => l.type === 'subtitle');
  const ctaLayer = layers.find(l => l.type === 'cta-button');
  const footerLayer = layers.find(l => l.type === 'footer-url');

  return (
    <main 
      className="flex-1 relative flex flex-col items-center justify-center p-6 overflow-auto bg-[#101012]"
      onClick={() => onSelectLayer(null)}
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      
      {/* FLOATING CANVAS TOOLBAR (ILLUSTRATOR PRO STYLE) */}
      <div 
        className="absolute top-4 bg-[#18181b]/95 backdrop-blur-md border border-[#27272a] rounded-xl px-3 py-1.5 flex items-center space-x-3 shadow-2xl z-20 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onShuffleColors}
          className="flex items-center space-x-1.5 text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 rounded-lg hover:bg-purple-500/10 transition"
          title="Reasignar armónicamente los colores del manual de marca"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Intercambiar Colores de Marca</span>
        </button>

        <div className="w-px h-4 bg-zinc-700" />

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition ${
            showGrid ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white'
          }`}
          title="Activar cuadrícula y regla de tercios"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Reglas</span>
        </button>

        <div className="w-px h-4 bg-zinc-700" />

        {/* Zoom controls */}
        <div className="flex items-center space-x-1 text-zinc-400">
          <button 
            onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.1))} 
            className="p-1 hover:text-white"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-white text-[11px] w-10 text-center font-bold">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button 
            onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))} 
            className="p-1 hover:text-white"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* THE ARTBOARD CONTAINER */}
      <div
        ref={artboardRef}
        id="zoik-artboard"
        onClick={(e) => e.stopPropagation()}
        className="relative transition-all duration-300 ease-out shadow-2xl rounded-2xl overflow-hidden border-2 border-[#27272a] hover:border-purple-500/50 select-none"
        style={{
          width: `${artboardWidth * zoomLevel}px`,
          height: `${artboardHeight * zoomLevel}px`,
          backgroundColor: bgLayer?.fill || brand.colors.backgroundDark,
        }}
      >
        
        {/* RULE OF THIRDS GRID OVERLAY */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-40 border border-purple-500/20">
            <div className="absolute top-1/3 inset-x-0 border-b border-purple-400/30 border-dashed" />
            <div className="absolute top-2/3 inset-x-0 border-b border-purple-400/30 border-dashed" />
            <div className="absolute left-1/3 inset-y-0 border-r border-purple-400/30 border-dashed" />
            <div className="absolute left-2/3 inset-y-0 border-r border-purple-400/30 border-dashed" />
          </div>
        )}

        {/* LAYER 1: DECORATIVE GLOW & VECTORS */}
        {decorLayer?.visible && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl opacity-35 transition-colors duration-500"
              style={{ backgroundColor: brand.colors.primary }}
            />
            <div 
              className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-20 transition-colors duration-500"
              style={{ backgroundColor: brand.colors.secondary }}
            />
            <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M -50 350 Q 150 250 550 480" 
                stroke={brand.colors.primary} 
                strokeWidth="1.5" 
                strokeDasharray="6 6" 
                fill="none" 
              />
            </svg>
          </div>
        )}

        {/* LAYER 2: BRAND LOGO */}
        {logoLayer?.visible && (
          <div 
            onClick={() => onSelectLayer(logoLayer.id)}
            className={`absolute top-6 left-6 z-30 cursor-pointer flex items-center space-x-2 transition ${
              selectedLayerId === logoLayer.id ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-transparent p-1 rounded-lg' : ''
            }`}
          >
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md border border-white/20"
              style={{ backgroundColor: logoLayer.badgeBg || brand.colors.primary }}
            >
              {brand.logo.symbolText}
            </div>
            <span 
              className="text-xs font-black tracking-wider uppercase drop-shadow"
              style={{ 
                color: logoLayer.fill || brand.colors.textPrimary,
                fontFamily: `'${brand.typography.headlineFont}', sans-serif`
              }}
            >
              {logoLayer.content || brand.name}
            </span>
          </div>
        )}

        {/* LAYER 3: TOP CATEGORY TAG */}
        {catTagLayer?.visible && (
          <div 
            onClick={() => onSelectLayer(catTagLayer.id)}
            className={`absolute top-6 right-6 z-30 cursor-pointer ${
              selectedLayerId === catTagLayer.id ? 'ring-2 ring-purple-400 rounded-full' : ''
            }`}
          >
            <span 
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-sm"
              style={{
                backgroundColor: catTagLayer.badgeBg || 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.15)',
                color: catTagLayer.fill || brand.colors.accent,
                fontFamily: `'${brand.typography.bodyFont}', sans-serif`
              }}
            >
              {catTagLayer.content}
            </span>
          </div>
        )}

        {/* LAYER 4: HERO VISUAL ASSET */}
        {heroLayer?.visible && (
          <div 
            onClick={() => onSelectLayer(heroLayer.id)}
            className={`absolute inset-x-0 top-20 bottom-32 flex items-center justify-center cursor-pointer pointer-events-auto transition ${
              selectedLayerId === heroLayer.id ? 'ring-2 ring-purple-400 ring-offset-4 ring-offset-transparent rounded-2xl m-8' : ''
            }`}
          >
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full blur-2xl opacity-30"
                style={{ backgroundColor: heroLayer.fill || brand.colors.primary }}
              />
              <svg 
                className="w-48 h-48 drop-shadow-2xl transition-transform hover:scale-102"
                viewBox="0 0 200 200" 
                fill="none" 
                dangerouslySetInnerHTML={{ __html: heroLayer.svgIcon || '' }}
              />
            </div>
          </div>
        )}

        {/* LAYER 5 & 6 & 7: TYPOGRAPHY HIERARCHY */}
        <div className="absolute bottom-6 inset-x-6 z-30 flex flex-col justify-end pointer-events-auto">
          
          {/* Promo Pill */}
          {pillLayer?.visible && (
            <div 
              onClick={() => onSelectLayer(pillLayer.id)}
              className={`mb-2 self-start cursor-pointer transition ${
                selectedLayerId === pillLayer.id ? 'ring-2 ring-purple-400 rounded' : ''
              }`}
            >
              <span 
                className="inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow-sm"
                style={{
                  backgroundColor: pillLayer.badgeBg || brand.colors.primary,
                  color: pillLayer.fill || '#ffffff',
                  fontFamily: `'${brand.typography.headlineFont}', sans-serif`
                }}
              >
                {pillLayer.content}
              </span>
            </div>
          )}

          {/* Headline H1 */}
          {headlineLayer?.visible && (
            <h1 
              onClick={() => onSelectLayer(headlineLayer.id)}
              className={`text-2xl sm:text-3xl leading-tight tracking-tight drop-shadow-md cursor-pointer transition p-1 -m-1 rounded ${
                selectedLayerId === headlineLayer.id ? 'ring-2 ring-purple-400 bg-purple-500/10' : 'hover:outline hover:outline-dashed hover:outline-purple-400/50'
              }`}
              style={{
                color: headlineLayer.fill || brand.colors.textPrimary,
                fontFamily: `'${headlineLayer.fontFamily || brand.typography.headlineFont}', sans-serif`,
                fontWeight: headlineLayer.fontWeight || '800',
                fontSize: headlineLayer.fontSize ? `${headlineLayer.fontSize}px` : undefined,
                letterSpacing: headlineLayer.letterSpacing !== undefined ? `${headlineLayer.letterSpacing}px` : undefined,
                textTransform: headlineLayer.textTransform || 'none',
                textAlign: headlineLayer.textAlign || 'left',
              }}
            >
              {headlineLayer.content}
            </h1>
          )}

          {/* Subtitle H2 */}
          {subtitleLayer?.visible && (
            <p 
              onClick={() => onSelectLayer(subtitleLayer.id)}
              className={`text-xs mt-1.5 max-w-md leading-relaxed drop-shadow cursor-pointer transition p-1 -m-1 rounded ${
                selectedLayerId === subtitleLayer.id ? 'ring-2 ring-purple-400 bg-purple-500/10' : 'hover:outline hover:outline-dashed hover:outline-purple-400/50'
              }`}
              style={{
                color: subtitleLayer.fill || brand.colors.textSecondary,
                fontFamily: `'${subtitleLayer.fontFamily || brand.typography.bodyFont}', sans-serif`,
                fontWeight: subtitleLayer.fontWeight || '400',
                fontSize: subtitleLayer.fontSize ? `${subtitleLayer.fontSize}px` : undefined,
                letterSpacing: subtitleLayer.letterSpacing !== undefined ? `${subtitleLayer.letterSpacing}px` : undefined,
                textTransform: subtitleLayer.textTransform || 'none',
                textAlign: subtitleLayer.textAlign || 'left',
              }}
            >
              {subtitleLayer.content}
            </p>
          )}

          {/* Footer Bar with CTA Button & Website */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            {footerLayer?.visible && (
              <div 
                onClick={() => onSelectLayer(footerLayer.id)}
                className={`flex items-center space-x-1.5 text-[11px] cursor-pointer p-0.5 rounded ${
                  selectedLayerId === footerLayer.id ? 'ring-2 ring-purple-400' : ''
                }`}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: brand.colors.secondary }}
                />
                <span 
                  style={{
                    color: footerLayer.fill || brand.colors.textSecondary,
                    fontFamily: `'${brand.typography.bodyFont}', sans-serif`
                  }}
                >
                  {footerLayer.content}
                </span>
              </div>
            )}

            {ctaLayer?.visible && (
              <button 
                onClick={() => onSelectLayer(ctaLayer.id)}
                className={`font-bold text-xs px-4 py-1.5 rounded-lg shadow-lg transition transform active:scale-95 ${
                  selectedLayerId === ctaLayer.id ? 'ring-2 ring-purple-400' : ''
                }`}
                style={{
                  backgroundColor: ctaLayer.badgeBg || '#ffffff',
                  color: ctaLayer.fill || '#0f172a',
                  fontFamily: `'${brand.typography.headlineFont}', sans-serif`
                }}
              >
                {ctaLayer.content}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Format Info Pill under artboard */}
      <div className="mt-3 text-[11px] text-zinc-400 font-medium flex items-center space-x-2 bg-[#18181b] px-3 py-1 rounded-full border border-[#27272a]">
        <span className="text-white font-semibold">{format.name}</span>
        <span>•</span>
        <span className="font-mono">{format.width} x {format.height} px</span>
        <span>•</span>
        <span className="text-purple-400 font-semibold">Mesa de Trabajo Vectorial</span>
      </div>
    </main>
  );
};
