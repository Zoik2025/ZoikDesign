import React, { useRef } from 'react';
import type { BrandKit, BrandReferencePiece, CompositionStyle, DocumentConfig, PieceCopyInput } from '../types';
import { CANVAS_FORMATS } from '../data/canvasFormats';
import { 
  Sparkles, Layers, FolderOpen, 
  Plus, Type, Image as ImageIcon, Upload,
  Shuffle, Trash2, Cpu, Check, HelpCircle
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
  onOpenAiStudio?: () => void;
  // OpenAI SVG Generator
  onGenerateOpenAiSvg?: () => void;
  isOpenAiGenerating?: boolean;
  openAiStatusText?: string;
  onUploadReferencePiece?: (file: File) => void;
  onDeleteReferencePiece?: (id: string) => void;
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
  onOpenAiStudio,
  onGenerateOpenAiSvg,
  isOpenAiGenerating = false,
  openAiStatusText = '',
  onUploadReferencePiece,
  onDeleteReferencePiece,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onUploadReferencePiece) {
      for (let i = 0; i < files.length; i++) {
        onUploadReferencePiece(files[i]);
      }
    }
    e.target.value = '';
  };

  return (
    <aside className="w-80 border-r border-[#2d2d30] bg-[#141416] flex flex-col shrink-0 overflow-y-auto select-none custom-scroll text-xs text-[#d4d4d8]">
      
      {/* 1. SECCIÓN: GUÍA VISUAL DE MARCA (REFERENCIAS REALES) */}
      <div className="p-3 border-b border-[#252528] bg-[#18181b]/60">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-white">
              Referencias de tu Marca
            </h2>
          </div>
          <button
            onClick={onEditBrand}
            className="text-[10px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-[#27272a] transition"
            title="Manual de marca opcional"
          >
            Manual (Opcional)
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 mb-2.5 leading-relaxed">
          Sube ejemplos de cómo se ve tu marca normalmente (posts, flyers, anuncios). La IA los usará de guía para igualar su estilo, colores y jerarquías.
        </p>

        {/* Botón rápido de subir referencias */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          multiple
          onChange={handleFileChange} 
          className="hidden" 
        />

        <div className="flex items-center space-x-1.5 mb-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-1.5 px-2.5 rounded bg-[#202024] hover:bg-[#28282e] border border-[#333338] hover:border-[#388bff] text-white text-[11px] font-medium flex items-center justify-center space-x-1.5 transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-[#388bff]" />
            <span>+ Subir pieza de ejemplo</span>
          </button>
          
          <button
            type="button"
            onClick={onOpenBrandEcosystem}
            className="p-1.5 rounded bg-[#202024] hover:bg-[#28282e] border border-[#333338] text-zinc-400 hover:text-white transition"
            title="Ver galería completa de referencias"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Galería de piezas de referencia */}
        {referencePieces.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scroll pr-1">
            {/* Opción Automática */}
            <button
              type="button"
              onClick={() => onSelectReferenceId(undefined)}
              className={`w-full p-2 rounded-lg border text-left flex items-center space-x-2 transition ${
                !selectedReferenceId
                  ? 'border-[#388bff] bg-[#388bff]/10 text-white'
                  : 'border-[#2d2d32] bg-[#1a1a1e] text-zinc-400 hover:text-zinc-200 hover:bg-[#222226]'
              }`}
            >
              <div className="w-6 h-6 rounded bg-[#27272a] flex items-center justify-center font-bold text-[10px] text-[#388bff] shrink-0">
                AI
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="text-[11px] font-semibold block truncate">Emular todas las referencias</span>
                <span className="text-[9px] text-zinc-500 block truncate">Sintetiza la identidad global de la marca</span>
              </div>
              {!selectedReferenceId && <Check className="w-3.5 h-3.5 text-[#388bff] shrink-0" />}
            </button>

            {/* Lista de referencias */}
            {referencePieces.map((ref) => (
              <div
                key={ref.id}
                className={`group flex items-center space-x-2 p-1.5 rounded-lg border transition ${
                  selectedReferenceId === ref.id
                    ? 'border-[#388bff] bg-[#388bff]/10 text-white'
                    : 'border-[#2d2d32] bg-[#1a1a1e] text-zinc-400 hover:text-zinc-200 hover:bg-[#222226]'
                }`}
              >
                <img 
                  src={ref.imageUrl} 
                  alt={ref.title} 
                  onClick={() => {
                    onSelectReferenceId(ref.id);
                    onChangeCompositionStyle(ref.layoutStructure);
                  }}
                  className="w-8 h-8 rounded object-cover bg-black shrink-0 border border-[#3e3e44] cursor-pointer"
                />
                <div 
                  className="flex-1 overflow-hidden cursor-pointer"
                  onClick={() => {
                    onSelectReferenceId(ref.id);
                    onChangeCompositionStyle(ref.layoutStructure);
                  }}
                >
                  <span className="text-[11px] font-medium block truncate text-zinc-200">{ref.title}</span>
                  <span className="text-[9px] text-zinc-500 block truncate font-mono">
                    {ref.layoutStructure}
                  </span>
                </div>
                {onDeleteReferencePiece && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReferencePiece(ref.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition"
                    title="Eliminar referencia"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2.5 text-center border border-dashed border-[#333338] rounded-lg bg-[#18181b]/40">
            <p className="text-[10px] text-zinc-500">
              No has subido ejemplos aún. Sube 1 o 2 imágenes para que la IA sepa el estilo de tu marca.
            </p>
          </div>
        )}
      </div>

      {/* 2. SECCIÓN: FORMATO DEL LIENZO */}
      <div className="p-3 border-b border-[#252528]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Formato del Lienzo
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
            className={`p-2 rounded-lg border text-left transition ${
              docConfig.width === 1080 && docConfig.height === 1350
                ? 'border-[#388bff] bg-[#388bff]/15 text-white font-semibold'
                : 'border-[#2d2d32] bg-[#1a1a1e] text-zinc-300 hover:bg-[#222226]'
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
            className={`p-2 rounded-lg border text-left transition ${
              docConfig.width === 1080 && docConfig.height === 1080
                ? 'border-[#388bff] bg-[#388bff]/15 text-white font-semibold'
                : 'border-[#2d2d32] bg-[#1a1a1e] text-zinc-300 hover:bg-[#222226]'
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
            className={`p-2 rounded-lg border text-left transition ${
              docConfig.width === 1080 && docConfig.height === 1920
                ? 'border-[#388bff] bg-[#388bff]/15 text-white font-semibold'
                : 'border-[#2d2d32] bg-[#1a1a1e] text-zinc-300 hover:bg-[#222226]'
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
            className={`p-2 rounded-lg border text-left transition ${
              docConfig.width === 1920 && docConfig.height === 1080
                ? 'border-[#388bff] bg-[#388bff]/15 text-white font-semibold'
                : 'border-[#2d2d32] bg-[#1a1a1e] text-zinc-300 hover:bg-[#222226]'
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

      {/* 3. SECCIÓN: COPYWRITING DE LA PIEZA (VACÍO POR DEFECTO, 100% PERSONALIZADO) */}
      <div className="p-3 border-b border-[#252528]">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-1">
            <Type className="w-3.5 h-3.5 text-[#388bff]" />
            <span>Copywriting de la Pieza</span>
          </label>
          <span className="text-[9px] text-zinc-500">Sin plantillas prediseñadas</span>
        </div>

        {/* Titular Principal */}
        <div className="mb-2">
          <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
            Titular Principal (H1) *
          </label>
          <input
            type="text"
            value={copyInput.headline || ''}
            onChange={(e) => onChangeCopyInput({ ...copyInput, headline: e.target.value })}
            placeholder="Escribe el titular de tu pieza..."
            className="w-full bg-[#1c1c20] border border-[#2e2e34] focus:border-[#388bff] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition"
          />
        </div>

        {/* Subtítulo / Bajada */}
        <div className="mb-2">
          <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
            Subtítulo / Bajada (Opcional)
          </label>
          <textarea
            value={copyInput.subtitle || ''}
            onChange={(e) => onChangeCopyInput({ ...copyInput, subtitle: e.target.value })}
            rows={2}
            placeholder="Subtítulo o texto explicativo..."
            className="w-full bg-[#1c1c20] border border-[#2e2e34] focus:border-[#388bff] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none transition"
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
              placeholder="Ej: 50% OFF"
              className="w-full bg-[#1c1c20] border border-[#2e2e34] focus:border-[#388bff] rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
              Botón / CTA (Opcional)
            </label>
            <input
              type="text"
              value={copyInput.ctaText || ''}
              onChange={(e) => onChangeCopyInput({ ...copyInput, ctaText: e.target.value })}
              placeholder="Ej: COMPRAR AHORA"
              className="w-full bg-[#1c1c20] border border-[#2e2e34] focus:border-[#388bff] rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* 3.1 PROTAGONISTA VISUAL / FOTO DEL PRODUCTO */}
        <div className="mt-2.5 pt-2.5 border-t border-[#252528]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-semibold text-zinc-300 flex items-center space-x-1">
              <ImageIcon className="w-3 h-3 text-[#388bff]" />
              <span>Protagonista Visual / Foto del Sujeto</span>
            </label>
            {copyInput.subjectImageUrl && (
              <button
                type="button"
                onClick={() => onChangeCopyInput({ ...copyInput, subjectImageUrl: undefined })}
                className="text-[10px] text-red-400 hover:underline"
              >
                Quitar foto
              </button>
            )}
          </div>

          {copyInput.subjectImageUrl ? (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 bg-[#1c1c20] border border-[#2e2e34] p-2 rounded-lg">
                <img 
                  src={copyInput.subjectImageUrl} 
                  alt="Sujeto" 
                  className="w-10 h-10 object-contain rounded bg-black/50 border border-[#3e3e44]" 
                />
                <div className="flex-1 overflow-hidden">
                  <span className="text-[11px] text-white block truncate font-medium">Sujeto Activo</span>
                  <span className="text-[9px] text-emerald-400 block truncate font-medium">● Integrado en el diseño</span>
                </div>
              </div>
              {onOpenAiStudio && (
                <button
                  type="button"
                  onClick={onOpenAiStudio}
                  className="w-full py-1 px-2 rounded-lg bg-[#24242a] hover:bg-[#2c2c34] text-zinc-300 hover:text-white border border-[#36363e] text-[10px] font-medium flex items-center justify-center space-x-1.5 transition"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Generar otro sujeto con IA</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {onOpenAiStudio && (
                <button
                  type="button"
                  onClick={onOpenAiStudio}
                  className="flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-sm group"
                  title="Generar persona o producto con IA"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300 group-hover:scale-110 transition" />
                  <span>Generar IA</span>
                </button>
              )}
              <label className="flex items-center justify-center p-2 border border-dashed border-[#333338] hover:border-[#388bff] rounded-lg bg-[#1a1a1e] cursor-pointer transition text-zinc-300 hover:text-white">
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
                <Upload className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                <span className="text-[10px]">Subir Foto</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 4. SECCIÓN: ESTILO / ARQUETIPO VISUAL */}
      <div className="p-3 border-b border-[#252528]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Arquetipo de Estructura
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {compositionStyle}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'split-left-right', label: '⚡ Matchday' },
            { id: 'hero-center', label: '🎯 Hero Center' },
            { id: 'cyber-tech', label: '💻 Cyber Tech' },
            { id: 'minimal-editorial', label: '💎 Luxury' },
            { id: 'promo-bold', label: '🏷️ Promo Bold' },
            { id: 'story-vertical', label: '📱 Story 9:16' },
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeCompositionStyle(item.id as CompositionStyle)}
              className={`px-1.5 py-1 rounded text-[10px] font-medium border text-center truncate transition ${
                compositionStyle === item.id
                  ? 'border-[#388bff] bg-[#388bff]/20 text-white font-bold'
                  : 'border-[#2d2d32] bg-[#1a1a1e] text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. SECCIÓN DE DISEÑO: OPENAI SVG MASTER + MOTOR INTERNO */}
      <div className="p-3 bg-[#18181c] border-t border-[#252528] mt-auto space-y-2">
        {/* BOTÓN PRINCIPAL: DISEÑAR CON OPENAI SVG (GPT-4o Vision) */}
        {onGenerateOpenAiSvg && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={onGenerateOpenAiSvg}
              disabled={isOpenAiGenerating || isGenerating || !copyInput.headline?.trim()}
              className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs tracking-wide shadow-md flex items-center justify-center space-x-2 transition ${
                isOpenAiGenerating || isGenerating || !copyInput.headline?.trim()
                  ? 'bg-[#27272a] text-zinc-500 cursor-not-allowed border border-[#333338]'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-indigo-900/30'
              }`}
              title="Diseñar pieza vectorial completa con OpenAI GPT-4o Vision analizando tus referencias"
            >
              {isOpenAiGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="truncate">{openAiStatusText || 'Diseñando con OpenAI...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Diseñar con OpenAI (SVG)</span>
                </>
              )}
            </button>

            <span className="text-[9px] text-zinc-500 block text-center leading-tight">
              ⚡ Diseña con GPT-4o Vision basándose en tus referencias visuales y copy
            </span>
          </div>
        )}

        {/* MOTOR INTERNO ZOIK (OFFLINE) + VARIACIONES */}
        <div className="flex items-center space-x-1.5 pt-1 border-t border-[#252528]">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || isOpenAiGenerating || !copyInput.headline?.trim()}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-semibold text-[11px] border transition flex items-center justify-center space-x-1.5 ${
              isGenerating || isOpenAiGenerating || !copyInput.headline?.trim()
                ? 'bg-[#202024] text-zinc-600 border-[#2d2d32] cursor-not-allowed'
                : 'bg-[#222228] hover:bg-[#2a2a32] text-zinc-300 hover:text-white border-[#33333a]'
            }`}
            title="Diseñar con motor local sin conexión"
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Local...</span>
              </>
            ) : (
              <>
                <Cpu className="w-3 h-3 text-[#388bff]" />
                <span>Motor Interno</span>
              </>
            )}
          </button>

          {onGenerateVariation && (
            <button
              type="button"
              onClick={onGenerateVariation}
              disabled={isGenerating || isOpenAiGenerating || !copyInput.headline?.trim()}
              className={`py-1.5 px-2 rounded-lg font-semibold text-[11px] border transition flex items-center space-x-1 shrink-0 ${
                isGenerating || isOpenAiGenerating || !copyInput.headline?.trim()
                  ? 'bg-[#202024] text-zinc-600 border-[#2d2d32] cursor-not-allowed'
                  : 'bg-[#222228] hover:bg-[#2a2a32] text-amber-400 hover:text-amber-300 border-[#33333a]'
              }`}
              title="Generar una variación alternativa"
            >
              <Shuffle className="w-3 h-3 text-amber-400" />
              <span>Var #{variationSeed + 1}</span>
            </button>
          )}
        </div>
      </div>

    </aside>
  );
};
