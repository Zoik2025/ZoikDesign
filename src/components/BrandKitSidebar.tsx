import React from 'react';
import type { BrandKit, BrandReferencePiece, CompositionStyle, DocumentConfig } from '../types';
import { CANVAS_FORMATS } from '../data/canvasFormats';
import { 
  Sparkles, Layers, Sliders, FolderOpen, 
  Settings2, Plus, ExternalLink, Image as ImageIcon
} from 'lucide-react';

interface BrandKitSidebarProps {
  brand: BrandKit;
  onEditBrand: () => void;
  onOpenBrandEcosystem: () => void;
  docConfig: DocumentConfig;
  onChangeDocConfig: (newDoc: DocumentConfig) => void;
  onOpenNewDocumentModal: () => void;
  briefPrompt: string;
  onChangeBrief: (val: string) => void;
  visualSubjectPrompt: string;
  onChangeVisualSubject: (val: string) => void;
  selectedReferenceId?: string;
  onSelectReferenceId: (id: string | undefined) => void;
  compositionStyle: CompositionStyle;
  onChangeCompositionStyle: (style: CompositionStyle) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const BrandKitSidebar: React.FC<BrandKitSidebarProps> = ({
  brand,
  onEditBrand,
  onOpenBrandEcosystem,
  docConfig,
  onChangeDocConfig,
  onOpenNewDocumentModal,
  briefPrompt,
  onChangeBrief,
  visualSubjectPrompt,
  onChangeVisualSubject,
  selectedReferenceId,
  onSelectReferenceId,
  compositionStyle,
  onChangeCompositionStyle,
  onGenerate,
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

  const quickPrompts = [
    'Nueva colección con 30% de descuento',
    'Lanzamiento exclusivo de temporada',
    'Edición limitada para clientes VIP',
    'Envío gratis por tiempo limitado',
  ];

  return (
    <aside className="w-80 border-r border-[#333333] bg-[#1e1e1e] flex flex-col shrink-0 overflow-y-auto select-none custom-scroll text-xs text-[#d4d4d8]">
      
      {/* 1. SECCIÓN: MANUAL DE MARCA ACTIVO */}
      <div className="p-3.5 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Kit de Marca Activo
          </span>
          <div className="flex items-center space-x-1.5">
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

        {/* Brand preview card */}
        <div className="bg-[#262626] border border-[#383838] rounded p-2.5">
          <div className="flex items-center space-x-2.5 mb-2">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center font-black text-white text-xs border border-white/20 shadow-sm shrink-0"
              style={{ backgroundColor: brand.colors.primary }}
            >
              {brand.logo.symbolText}
            </div>
            <div className="overflow-hidden flex-1">
              <h3 className="font-bold text-white text-xs truncate leading-tight">{brand.name}</h3>
              <p className="text-[10px] text-zinc-400 truncate">{brand.industry}</p>
            </div>
          </div>

          {/* Palette preview */}
          <div className="flex items-center space-x-1.5 pt-1 border-t border-[#333333]">
            <span className="text-[10px] text-zinc-400">Colores:</span>
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-sm border border-black/40" style={{ backgroundColor: brand.colors.primary }} title={`Primario: ${brand.colors.primary}`} />
              <span className="w-3.5 h-3.5 rounded-sm border border-black/40" style={{ backgroundColor: brand.colors.secondary }} title={`Secundario: ${brand.colors.secondary}`} />
              <span className="w-3.5 h-3.5 rounded-sm border border-black/40" style={{ backgroundColor: brand.colors.accent }} title={`Acento: ${brand.colors.accent}`} />
              <span className="w-3.5 h-3.5 rounded-sm border border-black/40" style={{ backgroundColor: brand.colors.backgroundDark }} title={`Fondo: ${brand.colors.backgroundDark}`} />
              <span className="w-3.5 h-3.5 rounded-sm border border-black/40" style={{ backgroundColor: brand.colors.textPrimary }} title={`Texto: ${brand.colors.textPrimary}`} />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono ml-auto truncate max-w-[80px]">
              {brand.typography.headlineFont}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN: FORMATO DE LA PIEZA */}
      <div className="p-3.5 border-b border-[#333333]">
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

      {/* 3. SECCIÓN: PROMPT / BRIEF DE LA PIEZA */}
      <div className="p-3.5 border-b border-[#333333]">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
          Prompt / Idea de la Pieza
        </label>
        
        <textarea
          value={briefPrompt}
          onChange={(e) => onChangeBrief(e.target.value)}
          rows={3}
          className="w-full bg-[#262626] border border-[#383838] focus:border-[#0d66d0] rounded p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none transition"
          placeholder="Escribe el mensaje o campaña (ej: Lanzamiento de nueva colección de verano con 30% OFF y cupón especial)"
        />

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onChangeBrief(q)}
              className="px-2 py-0.5 rounded bg-[#262626] border border-[#383838] hover:bg-[#333333] text-[10px] text-zinc-400 hover:text-white transition truncate max-w-full"
            >
              + {q}
            </button>
          ))}
        </div>

        {/* Optional Subject input */}
        <div className="mt-2.5">
          <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
            Producto o Motivo Visual (Opcional):
          </label>
          <input
            type="text"
            value={visualSubjectPrompt}
            onChange={(e) => onChangeVisualSubject(e.target.value)}
            className="w-full bg-[#262626] border border-[#383838] focus:border-[#0d66d0] rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
            placeholder="Ej: Zapatillas urbanas, café gourmet, dispositivo futurista"
          />
        </div>
      </div>

      {/* 4. SECCIÓN: PIEZAS DE REFERENCIA DEL KIT DE MARCA (GUÍA DE ESTRUCTURA) */}
      <div className="p-3.5 border-b border-[#333333] flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-[#388bff]" />
            <span>Guía de Referencia de Marca</span>
          </span>
          <button
            onClick={onOpenBrandEcosystem}
            className="text-[10px] text-[#388bff] hover:underline"
          >
            Ver todas ({referencePieces.length})
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 mb-2.5 leading-relaxed">
          Estas imágenes guían a la IA sobre cómo estructurar la pieza, jerarquizar titulares y posicionar el producto.
        </p>

        {/* Reference Pieces List */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scroll pr-1">
          {/* Option: Auto-selected based on reference library */}
          <button
            onClick={() => onSelectReferenceId(undefined)}
            className={`w-full p-2 rounded border text-left flex items-center space-x-2.5 transition ${
              !selectedReferenceId
                ? 'border-[#0d66d0] bg-[#0d66d0]/15 text-white'
                : 'border-[#383838] bg-[#262626] text-zinc-300 hover:bg-[#2d2d2d]'
            }`}
          >
            <div className="w-8 h-8 rounded bg-[#1e1e1e] border border-[#3e3e3e] flex items-center justify-center shrink-0 text-[10px] font-mono text-[#388bff]">
              AUTO
            </div>
            <div className="overflow-hidden flex-1">
              <span className="font-semibold text-xs block truncate">Automático (Según Manual)</span>
              <span className="text-[10px] text-zinc-400 block truncate">Adapta jerarquía según el formato</span>
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
                className="w-9 h-9 rounded object-cover bg-black shrink-0 border border-[#444444]"
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
          <div className="p-3 text-center border border-dashed border-[#3e3e3e] rounded bg-[#262626]">
            <p className="text-[11px] text-zinc-400 mb-2">No hay piezas de referencia subidas aún.</p>
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

      {/* 5. BOTÓN PRINCIPAL DE GENERACIÓN (ADOBE STYLE) */}
      <div className="p-3.5 bg-[#222222] border-t border-[#333333]">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-2.5 px-3 rounded font-bold text-xs tracking-wide shadow-sm flex items-center justify-center space-x-2 transition ${
            isGenerating
              ? 'bg-[#2d2d2d] text-zinc-500 cursor-not-allowed border border-[#3e3e3e]'
              : 'bg-[#0d66d0] hover:bg-[#1070e5] text-white'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Componiendo Pieza con IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generar Pieza Gráfica</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-zinc-500 text-center mt-1.5">
          Se creará en la mesa de trabajo con capas 100% editables.
        </p>
      </div>

    </aside>
  );
};
