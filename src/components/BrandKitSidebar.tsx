import React from 'react';
import type { BrandKit, CompositionStyle } from '../types';
import { 
  Wand2, Sparkles, Palette, ShieldCheck, FolderOpen 
} from 'lucide-react';

interface BrandKitSidebarProps {
  brand: BrandKit;
  onEditBrand: () => void;
  onOpenBrandEcosystem: () => void;
  briefPrompt: string;
  onChangeBrief: (val: string) => void;
  visualSubjectPrompt: string;
  onChangeVisualSubject: (val: string) => void;
  visualProvider: 'dalle' | 'freepik' | 'curated-render';
  onChangeVisualProvider: (provider: 'dalle' | 'freepik' | 'curated-render') => void;
  compositionStyle: CompositionStyle;
  onChangeCompositionStyle: (style: CompositionStyle) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const BrandKitSidebar: React.FC<BrandKitSidebarProps> = ({
  brand,
  onEditBrand,
  onOpenBrandEcosystem,
  briefPrompt,
  onChangeBrief,
  visualSubjectPrompt,
  onChangeVisualSubject,
  visualProvider,
  onChangeVisualProvider,
  compositionStyle,
  onChangeCompositionStyle,
  onGenerate,
  isGenerating,
}) => {
  const sampleCount = brand.samplePieces?.length || 0;

  return (
    <aside className="w-80 border-r border-[#27272a] bg-[#18181b] flex flex-col shrink-0 overflow-y-auto select-none custom-scroll">
      
      {/* 1. BRAND IDENTITY CARD */}
      <div className="p-4 border-b border-[#27272a]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Manual de Marca Activo</span>
          </span>
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={onOpenBrandEcosystem}
              className="p-1 rounded text-purple-400 hover:text-white hover:bg-purple-900/50 transition flex items-center space-x-1"
              title={`Ecosistema de Marca (${sampleCount} referencias subidas)`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono text-purple-300">({sampleCount})</span>
            </button>
            <button 
              onClick={onEditBrand}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              Editar
            </button>
          </div>
        </div>

        <div className="bg-[#202024] border border-[#2e2e34] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-md border border-white/20"
              style={{ backgroundColor: brand.colors.primary }}
            >
              {brand.logo.symbolText}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-white truncate leading-tight">{brand.name}</h3>
              <p className="text-[11px] text-zinc-400 truncate">{brand.industry}</p>
            </div>
          </div>

          {/* PALETA CROMÁTICA */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
              <span className="flex items-center space-x-1">
                <Palette className="w-3 h-3 text-zinc-400" />
                <span>Paleta de la Marca</span>
              </span>
              <span className="text-purple-400 font-mono text-[10px]">WCAG AA OK</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              <div 
                className="h-7 rounded-md border border-white/20 shadow-sm cursor-pointer transition transform hover:scale-105"
                style={{ backgroundColor: brand.colors.primary }}
                title={`Primario: ${brand.colors.primary}`}
              />
              <div 
                className="h-7 rounded-md border border-white/20 shadow-sm cursor-pointer transition transform hover:scale-105"
                style={{ backgroundColor: brand.colors.secondary }}
                title={`Secundario: ${brand.colors.secondary}`}
              />
              <div 
                className="h-7 rounded-md border border-white/20 shadow-sm cursor-pointer transition transform hover:scale-105"
                style={{ backgroundColor: brand.colors.accent }}
                title={`Acento: ${brand.colors.accent}`}
              />
              <div 
                className="h-7 rounded-md border border-white/20 shadow-sm cursor-pointer transition transform hover:scale-105"
                style={{ backgroundColor: brand.colors.backgroundDark }}
                title={`Fondo: ${brand.colors.backgroundDark}`}
              />
              <div 
                className="h-7 rounded-md border border-white/20 shadow-sm cursor-pointer transition transform hover:scale-105"
                style={{ backgroundColor: brand.colors.textPrimary }}
                title={`Texto: ${brand.colors.textPrimary}`}
              />
            </div>
          </div>

          {/* TIPOGRAFÍA */}
          <div className="bg-[#141416] p-2.5 rounded-lg border border-[#27272a] flex items-center justify-between text-xs mb-3">
            <div>
              <span className="text-[10px] text-zinc-400 block font-semibold">Titular H1</span>
              <span className="font-bold text-white text-xs truncate max-w-[110px] block">
                {brand.typography.headlineFont}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block font-semibold">Cuerpo</span>
              <span className="text-zinc-300 text-xs truncate max-w-[110px] block">
                {brand.typography.bodyFont}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ASISTENTE CREATIVO DE IA */}
      <div className="p-4 flex-1 flex flex-col space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>1. Brief de Campaña & Copys</span>
            </span>
            <span className="text-purple-400 text-[10px] font-mono">Auto Writer</span>
          </label>
          <textarea
            value={briefPrompt}
            onChange={(e) => onChangeBrief(e.target.value)}
            rows={3}
            className="w-full bg-[#202024] border border-[#2e2e34] focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none transition"
            placeholder="Ej: Lanzamiento de nueva colección con 40% OFF por temporada. Estilo minimalista y profesional."
          />
          <span className="text-[10px] text-zinc-500 mt-1 block">
            La IA redactará Titular, Subtítulo persuasivo, Badge y CTA.
          </span>
        </div>

        {/* Generador Visual */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            2. Activo Visual (Imagen / Vector)
          </label>
          
          <div className="grid grid-cols-2 gap-1.5 mb-2 text-xs">
            <button
              onClick={() => onChangeVisualProvider('curated-render')}
              className={`p-2 rounded-lg border text-left flex items-center space-x-1.5 transition ${
                visualProvider === 'curated-render'
                  ? 'border-purple-500/50 bg-purple-500/15 text-purple-300 font-semibold'
                  : 'border-[#2e2e34] bg-[#202024] text-zinc-400 hover:bg-[#28282e]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${visualProvider === 'curated-render' ? 'bg-purple-400' : 'bg-zinc-600'}`} />
              <span>Vector 3D SVG</span>
            </button>

            <button
              onClick={() => onChangeVisualProvider('dalle')}
              className={`p-2 rounded-lg border text-left flex items-center space-x-1.5 transition ${
                visualProvider === 'dalle'
                  ? 'border-purple-500/50 bg-purple-500/15 text-purple-300 font-semibold'
                  : 'border-[#2e2e34] bg-[#202024] text-zinc-400 hover:bg-[#28282e]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${visualProvider === 'dalle' ? 'bg-purple-400' : 'bg-zinc-600'}`} />
              <span>OpenAI DALL-E</span>
            </button>
          </div>

          <input
            type="text"
            value={visualSubjectPrompt}
            onChange={(e) => onChangeVisualSubject(e.target.value)}
            className="w-full bg-[#202024] border border-[#2e2e34] focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
            placeholder="Ej: Futuristic concept device, subtle neon glow"
          />
        </div>

        {/* MASTER GENERATION BUTTON */}
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wide shadow-lg flex items-center justify-center space-x-2 transition transform active:scale-98 ${
            isGenerating
              ? 'bg-purple-900 text-zinc-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 border border-purple-400/30'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Componiendo con IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generar Pieza Automática</span>
            </>
          )}
        </button>

        {/* COMPOSITION STYLES */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-semibold">
            <span>Reglas de Composición</span>
            <span className="text-[10px] text-zinc-500 font-mono">Illustrator Layouts</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onChangeCompositionStyle('hero-center')}
              className={`p-2 rounded-lg border text-center transition ${
                compositionStyle === 'hero-center'
                  ? 'border-purple-500 bg-purple-500/15 text-white font-semibold'
                  : 'border-[#2e2e34] bg-[#202024] text-zinc-400 hover:bg-[#28282e]'
              }`}
            >
              <div className="h-8 bg-[#141416] rounded mb-1 flex items-center justify-center text-[10px] text-zinc-400 font-mono">
                [ ● ]
              </div>
              <span className="text-[11px] block truncate">Central</span>
            </button>

            <button
              onClick={() => onChangeCompositionStyle('split-left-right')}
              className={`p-2 rounded-lg border text-center transition ${
                compositionStyle === 'split-left-right'
                  ? 'border-purple-500 bg-purple-500/15 text-white font-semibold'
                  : 'border-[#2e2e34] bg-[#202024] text-zinc-400 hover:bg-[#28282e]'
              }`}
            >
              <div className="h-8 bg-[#141416] rounded mb-1 flex items-center justify-center text-[10px] text-zinc-400 font-mono">
                [ ◨ ]
              </div>
              <span className="text-[11px] block truncate">Dividido</span>
            </button>

            <button
              onClick={() => onChangeCompositionStyle('minimal-editorial')}
              className={`p-2 rounded-lg border text-center transition ${
                compositionStyle === 'minimal-editorial'
                  ? 'border-purple-500 bg-purple-500/15 text-white font-semibold'
                  : 'border-[#2e2e34] bg-[#202024] text-zinc-400 hover:bg-[#28282e]'
              }`}
            >
              <div className="h-8 bg-[#141416] rounded mb-1 flex items-center justify-center text-[10px] text-zinc-400 font-mono">
                [ ─ ]
              </div>
              <span className="text-[11px] block truncate">Minimal</span>
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
};
