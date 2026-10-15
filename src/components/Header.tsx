import React from 'react';
import type { BrandKit } from '../types';
import { 
  Settings, Plus, FolderOpen, Sparkles 
} from 'lucide-react';

interface HeaderProps {
  currentBrand?: BrandKit;
  brands: BrandKit[];
  onSelectBrand: (brand: BrandKit) => void;
  onOpenNewBrandModal: () => void;
  onOpenBrandEcosystem: () => void;
  onOpenNewDocumentModal: () => void;
  onExportSVG: () => void;
  onExportPNG: () => void;
  onOpenSettings: () => void;
  hasOpenAiKey: boolean;
  onOpenAiStudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBrand,
  brands,
  onSelectBrand,
  onOpenNewBrandModal,
  onOpenBrandEcosystem,
  onOpenSettings,
  hasOpenAiKey,
  onOpenAiStudio,
}) => {
  const noDragStyle = { WebkitAppRegion: 'no-drag' } as React.CSSProperties;

  return (
    <header 
      className="h-9 border-b border-[#2d2d2d] bg-[#1a1a1a] flex items-center justify-between px-3 z-30 shrink-0 select-none text-xs text-[#d4d4d8] pr-36"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      
      {/* 1. APP BRAND & WORKSPACE (MINIMALIST ADOBE CC / FIGMA STYLE) */}
      <div className="flex items-center space-x-2.5" style={noDragStyle}>
        
        {/* Minimalist Logo Mark */}
        <div className="w-5 h-5 rounded bg-[#2b2b2b] border border-[#444444] flex items-center justify-center shadow-sm">
          <span className="font-black text-[10px] text-[#388bff]">Z</span>
        </div>

        {/* Brand Kit Selector Pill */}
        <div className="flex items-center space-x-1.5 bg-[#242424] border border-[#383838] rounded px-2 py-0.5">
          {currentBrand && (
            <span 
              className="w-2 h-2 rounded-full shadow-sm ring-1 ring-white/20 shrink-0"
              style={{ backgroundColor: currentBrand.colors.primary }}
            />
          )}

          {brands.length > 0 && currentBrand ? (
            <select
              value={currentBrand.id}
              onChange={(e) => {
                const found = brands.find(b => b.id === e.target.value);
                if (found) onSelectBrand(found);
              }}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs pr-1"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#242424] text-white">
                  {b.name}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={onOpenNewBrandModal}
              className="text-xs text-white hover:underline font-semibold"
            >
              + Crear Kit de Marca
            </button>
          )}

          {currentBrand && (
            <button
              onClick={onOpenBrandEcosystem}
              className="p-0.5 rounded hover:bg-[#383838] text-zinc-400 hover:text-white transition"
              title="Piezas de Referencia de la Marca"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onOpenNewBrandModal}
            className="p-0.5 rounded hover:bg-[#383838] text-zinc-400 hover:text-white transition"
            title="Crear Nuevo Kit de Marca"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CENTER: DOCUMENT TAB (CLEAN STUDIO TAB) */}
      <div className="flex items-center space-x-2" style={noDragStyle}>
        <div className="flex items-center space-x-2 bg-[#222222] border border-[#333333] px-3 py-1 rounded text-zinc-300 text-[11px] font-medium shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-[#388bff]" />
          <span className="text-white font-semibold">Lienzo de Trabajo</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 font-mono">100% SVG Vectorial</span>
        </div>
      </div>

      {/* 3. RIGHT ACTIONS & PREFERENCES */}
      <div className="flex items-center space-x-2" style={noDragStyle}>
        {onOpenAiStudio && (
          <button 
            onClick={onOpenAiStudio}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-[11px] font-bold text-white shadow-sm transition"
            title="Estudio de Generación IA Local (Sujetos & Texturas)"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Estudio IA</span>
          </button>
        )}

        <button 
          onClick={onOpenSettings}
          className="flex items-center space-x-1.5 px-2 py-1 rounded bg-[#242424] hover:bg-[#2e2e2e] border border-[#383838] text-[11px] text-zinc-300 hover:text-white transition"
          title="Configuración de APIs y Preferencias"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${hasOpenAiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span>{hasOpenAiKey ? 'IA Online' : 'Motor Local'}</span>
          <Settings className="w-3 h-3 text-zinc-400 ml-0.5" />
        </button>
      </div>

    </header>
  );
};
