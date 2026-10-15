import React from 'react';
import type { BrandKit, CompositionStyle, DocumentConfig, PieceCopyInput } from '../types';
import { CANVAS_FORMATS } from '../data/canvasFormats';
import { 
  Sparkles, Layers, FolderOpen, 
  Settings2, Plus, Type, CheckCircle2,
  Sliders, Info, Image as ImageIcon, Upload,
  Shuffle
} from 'lucide-react';

interface BrandKitSidebarProps {
  brand: BrandKit;
  onEditBrand: () => void;
  onOpenBrandEcosystem: () => void;
  docConfig: DocumentConfig;
  onChangeDocConfig: (newDoc: DocumentConfig) => void;
  onOpenNewDocumentModal: () => void;
  copyInput: PieceCopyInput;
  onChangeCopyInput: (newCopy: PieceCopyInput) => void;
  selectedReferenceId?: string;
  onSelectReferenceId: (id: string | undefined) => void;
  compositionStyle: CompositionStyle;
  onChangeCompositionStyle: (style: CompositionStyle) => void;
  onGenerate: () => void;
  onGenerateVariation?: () => void;
  variationSeed?: number;
  isGenerating: boolean;
}

export const BrandKitSidebar: React.FC<BrandKitSidebarProps> = ({
  brand,
  onEditBrand,
  onOpenBrandEcosystem,
  docConfig,
  onChangeDocConfig,
  onOpenNewDocumentModal,
  copyInput,
  onChangeCopyInput,
  selectedReferenceId,
  onSelectReferenceId,
  compositionStyle,
  onChangeCompositionStyle,
  onGenerate,
  onGenerateVariation,
  variationSeed = 0,
  isGenerating,
}) => {
  const referencePieces = brand.referencePieces || [];

  const handleSelectFormat = (fmtId: string) => {
    const found = CANVAS_FORMATS.find(f => f.id === fmtId);
    if (!found) return;
    onChangeDocConfig({
      ...docConfig,
      width: found.width,
      height: found.height,
      displayValueWidth: found.width,
      displayValueHeight: found.height,
      unit: 'px',
      orientation: found.height > found.width ? 'portrait' : 'landscape',
    });
  };

  return (
    <aside className="w-80 border-r border-[#333333] bg-[#1e1e1e] flex flex-col shrink-0 overflow-y-auto select-none custom-scroll text-xs text-[#d4d4d8]">
      
      {/* 1. SECCIÓN: MARCA ACTIVA (MINIMALISTA, SIN BARRAS DE COLOR MOLESTAS) */}
      <div className="p-3 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Kit de Marca Activo
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenBrandEcosystem}
              className="text-[11px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-[#2d2d2d] transition flex items-center space-x-1"
              title="Gestionar piezas de referencia"
            >
              <FolderOpen className="w-3 h-3 text-[#388bff]" />
              <span>Referencias ({referencePieces.length})</span>
            </button>
            <button
              onClick={onEditBrand}
              className="text-[11px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-[#2d2d2d] transition"
            >
              Editar
            </button>
          </div>
        </div>

        {/* Brand preview card compacta */}
        <div className="bg-[#262626] border border-[#383838] rounded p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div 
              className="w-7 h-7 rounded flex items-center justify-center font-black text-white text-xs border border-white/20 shrink-0"
              style={{ backgroundColor: brand.colors.primary }}
            >
              {brand.logo.symbolText || 'Z'}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-white text-xs truncate leading-tight">{brand.name}</h3>
              <p className="text-[10px] text-zinc-400 truncate">{brand.industry}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 shrink-0 pl-2">
            {brand.typography.headlineFont}
          </span>
        </div>
      </div>

      {/* 2. SECCIÓN: FORMATO DE LA PIEZA */}
      <div className="p-3 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Formato de la Pieza
          </span>
          <button
            onClick={onOpenNewDocumentModal}
            className="text-[10px] text-[#388bff] hover:underline"
          >
            Personalizado...
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleSelectFormat('instagram-portrait')}
            className={`p-2 rounded border text-left transition ${
              docConfig.width === 1080 && docConfig.height === 1350
                ? 'border-[#0d66d0] bg-[#0d66d0]/15 text-white font-semibold'
                : 'border-[#383838] bg-[#262626] text-zinc-300 hover:bg-[#2d2d2d]'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-medium">Retrato</span>
              <span className="text-[10px] text-zinc-400 font-mono">4:5</span>
            </div>
            <span className="text-[10px] text-zinc-500 block">1080 × 1350 px</span>
          </button>

          <button
            onClick={() => handleSelectFormat('instagram-square')}
            className={`p-2 rounded border text-left transition ${
              docConfig.width === 1080 && docConfig.height === 1080
                ? 'border-[#0d66d0] bg-[#0d66d0]/15 text-white font-semibold'
                : 'border-[#383838] bg-[#262626] text-zinc-300 hover:bg-[#2d2d2d]'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-medium">Cuadrado</span>
              <span className="text-[10px] text-zinc-400 font-mono">1:1</span>
            </div>
            <span className="text-[10px] text-zinc-500 block">1080 × 1080 px</span>
          </button>

          <button
            onClick={() => handleSelectFormat('instagram-story')}
            className={`p-2 rounded border text-left transition ${
              docConfig.width === 1080 && docConfig.height === 1920
                ? 'border-[#0d66d0] bg-[#0d66d0]/15 text-white font-semibold'
                : 'border-[#383838] bg-[#262626] text-zinc-300 hover:bg-[#2d2d2d]'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-medium">Story / Reel</span>
              <span className="text-[10px] text-zinc-400 font-mono">9:16</span>
            </div>
            <span className="text-[10px] text-zinc-500 block">1080 × 1920 px</span>
          </button>

          <button
            onClick={() => handleSelectFormat('youtube-thumb')}
            className={`p-2 rounded border text-left transition ${
              docConfig.width === 1920 && docConfig.height === 1080
                ? 'border-[#0d66d0] bg-[#0d66d0]/15 text-white font-semibold'
                : 'border-[#383838] bg-[#262626] text-zinc-300 hover:bg-[#2d2d2d]'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-medium">Panorámico</span>
              <span className="text-[10px] text-zinc-400 font-mono">16:9</span>
            </div>
            <span className="text-[10px] text-zinc-500 block">1920 × 1080 px</span>
          </button>
        </div>
      </div>

      {/* 3. SECCIÓN: COPY REAL DE LA PIEZA (LA IA NO INVENTA TEXTO, SE LO DA EL USUARIO) */}
      <div className="p-3 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-1">
            <Type className="w-3.5 h-3.5 text-[#388bff]" />
            <span>Copywriting de la Pieza</span>
          </label>
          <span className="text-[10px] text-zinc-500">100% tu copy</span>
        </div>
        
        <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
          Ingresa los textos exactos. La IA diseñará la jerarquía visual y composición vectorial en base a este copy.
        </p>

        {/* Titular Principal */}
        <div className="mb-2">
          <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
            Titular Principal (H1) *
          </label>
          <input
            type="text"
            value={copyInput.headline}
            onChange={(e) => onChangeCopyInput({ ...copyInput, headline: e.target.value })}
            placeholder="Ej: NUEVA COLECCIÓN DEPORTIVA"
            className="w-full bg-[#262626] border border-[#383838] focus:border-[#0d66d0] rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>

        {/* Subtítulo / Bajada */}
        <div className="mb-2">
          <label className="block text-[10px] font-semibold text-zinc-300 mb-1">
            Subtítulo / Bajada de Texto
          </label>
          <textarea
            value={copyInput.subtitle}
            onChange={(e) => onChangeCopyInput({ ...copyInput, subtitle: e.target.value })}
            rows={2}
            placeholder="Ej: Máximo rendimiento y transpirabilidad con materiales sostenibles."
            className="w-full bg-[#262626] border border-[#383838] focus:border-[#0d66d0] rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none"
          />
        </div>

        {/* Grid: Badge y Botón */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
              Badge / Oferta (Opcional)
            </label>
            <input
              type="text"
              value={copyInput.badgeText || ''}
              onChange={(e) => onChangeCopyInput({ ...copyInput, badgeText: e.target.value })}
              placeholder="Ej: 30% OFF"
              className="w-full bg-[#262626] border border-[#383838] focus:border-[#0d66d0] rounded px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
              Botón / CTA
            </label>
            <input
              type="text"
              value={copyInput.ctaText || ''}
              onChange={(e) => onChangeCopyInput({ ...copyInput, ctaText: e.target.value })}
              placeholder="Ej: COMPRAR AHORA"
              className="w-full bg-[#262626] border border-[#383838] focus:border-[#0d66d0] rounded px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 3.1 PROTAGONISTA VISUAL / FOTO DEL PRODUCTO */}
        <div className="mt-2.5 pt-2.5 border-t border-[#333333]">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold text-zinc-300 flex items-center space-x-1">
              <ImageIcon className="w-3 h-3 text-[#388bff]" />
              <span>Foto del Producto o Sujeto (Opcional)</span>
            </label>
            {copyInput.subjectImageUrl && (
              <button
                onClick={() => onChangeCopyInput({ ...copyInput, subjectImageUrl: undefined })}
                className="text-[10px] text-red-400 hover:underline"
              >
                Quitar foto
              </button>
            )}
          </div>

          {copyInput.subjectImageUrl ? (
            <div className="flex items-center space-x-2 bg-[#222222] border border-[#3e3e3e] p-1.5 rounded">
              <img 
                src={copyInput.subjectImageUrl} 
                alt="Sujeto" 
                className="w-9 h-9 object-cover rounded bg-black/40 border border-[#444444]" 
              />
              <div className="flex-1 overflow-hidden">
                <span className="text-[11px] text-white block truncate font-medium">Foto cargada</span>
                <span className="text-[9px] text-emerald-400 block truncate">Se integrará con iluminación y sombras</span>
              </div>
            </div>
          ) : (
            <label className="flex items-center justify-center p-2 border border-dashed border-[#3e3e3e] hover:border-[#0d66d0] rounded bg-[#242424] cursor-pointer transition text-zinc-400 hover:text-white group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        onChangeCopyInput({ ...copyInput, subjectImageUrl: ev.target.result as string });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
                className="hidden" 
              />
              <Upload className="w-3.5 h-3.5 mr-1.5 text-zinc-500 group-hover:text-[#388bff]" />
              <span className="text-[10px]">Subir foto de producto / atleta</span>
            </label>
          )}
          <span className="text-[9px] text-zinc-500 block mt-1">
            Si no subes una foto, la IA diseñará una composición y emblema vectorial de alto impacto.
          </span>
        </div>
      </div>

      {/* 4. SECCIÓN: GUÍA DE ESTRUCTURA Y REFERENCIAS DE MARCA */}
      <div className="p-3 border-b border-[#333333] flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-[#388bff]" />
            <span>Guía de Estructura de Marca</span>
          </span>
          <button
            onClick={onOpenBrandEcosystem}
            className="text-[10px] text-[#388bff] hover:underline"
          >
            Gestionar ({referencePieces.length})
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
          Las piezas de referencia guían la paleta, pesos visuales y estructura del diseño (no se pegan como imagen sobre la pieza).
        </p>

        {/* Reference Pieces List */}
        <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scroll pr-1">
          {/* Automático */}
          <button
            onClick={() => onSelectReferenceId(undefined)}
            className={`w-full p-2 rounded border text-left flex items-center space-x-2.5 transition ${
              !selectedReferenceId
                ? 'border-[#0d66d0] bg-[#0d66d0]/15 text-white'
                : 'border-[#383838] bg-[#262626] text-zinc-300 hover:bg-[#2d2d2d]'
            }`}
          >
            <div className="w-7 h-7 rounded bg-[#1e1e1e] border border-[#3e3e3e] flex items-center justify-center shrink-0 text-[10px] font-bold text-[#388bff]">
              AI
            </div>
            <div className="overflow-hidden flex-1">
              <span className="font-semibold text-xs block truncate">Distribución Inteligente</span>
              <span className="text-[10px] text-zinc-400 block truncate">Equilibra según el formato seleccionado</span>
            </div>
          </button>

          {/* User's Reference Pieces */}
          {referencePieces.map((ref) => (
            <button
              key={ref.id}
              onClick={() => {
                onSelectReferenceId(ref.id);
                onChangeCompositionStyle(ref.layoutStructure);
              }}
              className={`w-full p-1.5 rounded border text-left flex items-center space-x-2 transition ${
                selectedReferenceId === ref.id
                  ? 'border-[#0d66d0] bg-[#0d66d0]/15 text-white'
                  : 'border-[#383838] bg-[#262626] text-zinc-300 hover:bg-[#2d2d2d]'
              }`}
            >
              <img 
                src={ref.imageUrl} 
                alt={ref.title} 
                className="w-8 h-8 rounded object-cover bg-black shrink-0 border border-[#444444]"
              />
              <div className="overflow-hidden flex-1">
                <span className="font-medium text-xs block truncate">{ref.title}</span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  Estructura: {ref.layoutStructure}
                </span>
              </div>
            </button>
          ))}
        </div>

        {referencePieces.length === 0 && (
          <div className="p-2.5 mt-2 text-center border border-dashed border-[#3e3e3e] rounded bg-[#262626]">
            <p className="text-[11px] text-zinc-400 mb-1.5">No hay piezas de referencia subidas.</p>
            <button
              onClick={onOpenBrandEcosystem}
              className="px-2.5 py-1 rounded bg-[#333333] hover:bg-[#3e3e3e] text-white text-xs font-medium inline-flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Subir pieza de ejemplo</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. ARQUETIPOS DE ESTILO (MOTOR PROPIO) */}
      <div className="p-3 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Arquetipo Visual
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {compositionStyle}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onChangeCompositionStyle('split-left-right')}
            className={`px-1.5 py-1 rounded text-[10px] font-medium border text-center truncate transition ${
              compositionStyle === 'split-left-right' || compositionStyle === 'sports-impact'
                ? 'border-[#0d66d0] bg-[#0d66d0]/20 text-white font-bold'
                : 'border-[#383838] bg-[#262626] text-zinc-400 hover:text-white'
            }`}
          >
            ⚡ Matchday
          </button>
          <button
            onClick={() => onChangeCompositionStyle('hero-center')}
            className={`px-1.5 py-1 rounded text-[10px] font-medium border text-center truncate transition ${
              compositionStyle === 'hero-center'
                ? 'border-[#0d66d0] bg-[#0d66d0]/20 text-white font-bold'
                : 'border-[#383838] bg-[#262626] text-zinc-400 hover:text-white'
            }`}
          >
            🎯 Hero Center
          </button>
          <button
            onClick={() => onChangeCompositionStyle('cyber-tech')}
            className={`px-1.5 py-1 rounded text-[10px] font-medium border text-center truncate transition ${
              compositionStyle === 'cyber-tech'
                ? 'border-[#0d66d0] bg-[#0d66d0]/20 text-white font-bold'
                : 'border-[#383838] bg-[#262626] text-zinc-400 hover:text-white'
            }`}
          >
            💻 Cyber Tech
          </button>
          <button
            onClick={() => onChangeCompositionStyle('minimal-editorial')}
            className={`px-1.5 py-1 rounded text-[10px] font-medium border text-center truncate transition ${
              compositionStyle === 'minimal-editorial'
                ? 'border-[#0d66d0] bg-[#0d66d0]/20 text-white font-bold'
                : 'border-[#383838] bg-[#262626] text-zinc-400 hover:text-white'
            }`}
          >
            💎 Luxury
          </button>
          <button
            onClick={() => onChangeCompositionStyle('promo-bold')}
            className={`px-1.5 py-1 rounded text-[10px] font-medium border text-center truncate transition ${
              compositionStyle === 'promo-bold'
                ? 'border-[#0d66d0] bg-[#0d66d0]/20 text-white font-bold'
                : 'border-[#383838] bg-[#262626] text-zinc-400 hover:text-white'
            }`}
          >
            🏷️ Promo Bold
          </button>
          <button
            onClick={() => onChangeCompositionStyle('story-vertical')}
            className={`px-1.5 py-1 rounded text-[10px] font-medium border text-center truncate transition ${
              compositionStyle === 'story-vertical'
                ? 'border-[#0d66d0] bg-[#0d66d0]/20 text-white font-bold'
                : 'border-[#383838] bg-[#262626] text-zinc-400 hover:text-white'
            }`}
          >
            📱 Story 9:16
          </button>
        </div>
      </div>

      {/* 6. BOTÓN PRINCIPAL DE DISEÑO & VARIACIONES (MOTOR LOCAL SVG) */}
      <div className="p-3 bg-[#222222] border-t border-[#333333] space-y-2">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onGenerate}
            disabled={isGenerating || !copyInput.headline.trim()}
            className={`flex-1 py-2.5 px-3 rounded font-bold text-xs tracking-wide shadow-sm flex items-center justify-center space-x-2 transition ${
              isGenerating || !copyInput.headline.trim()
                ? 'bg-[#2d2d2d] text-zinc-500 cursor-not-allowed border border-[#3e3e3e]'
                : 'bg-[#0d66d0] hover:bg-[#1070e5] text-white'
            }`}
            title="Generar diseño vectorial completo con el motor interno"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Diseñando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Diseñar Pieza</span>
              </>
            )}
          </button>

          {onGenerateVariation && (
            <button
              onClick={onGenerateVariation}
              disabled={isGenerating || !copyInput.headline.trim()}
              className={`py-2.5 px-3 rounded font-bold text-xs border transition flex items-center space-x-1.5 shrink-0 ${
                isGenerating || !copyInput.headline.trim()
                  ? 'bg-[#2d2d2d] text-zinc-500 border-[#383838] cursor-not-allowed'
                  : 'bg-[#2a2a2a] hover:bg-[#333333] text-amber-400 hover:text-amber-300 border-[#444444]'
              }`}
              title="Generar una variación alternativa (cambia iluminación, pesos y arquetipo)"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Var #{variationSeed + 1}</span>
            </button>
          )}
        </div>

        <p className="text-[10px] text-zinc-400 text-center">
          Motor propio local • Capas vectoriales 100% editables en el lienzo
        </p>
      </div>

    </aside>
  );
};
