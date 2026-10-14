import React, { useState } from 'react';
import type { BrandKit } from '../types';
import { 
  Download, Layers, Settings, Plus, Image as ImageIcon, 
  FolderOpen, FilePlus 
} from 'lucide-react';

interface HeaderProps {
  currentBrand: BrandKit;
  brands: BrandKit[];
  onSelectBrand: (brand: BrandKit) => void;
  onOpenNewBrandModal: () => void;
  onOpenBrandEcosystem: () => void;
  onOpenNewDocumentModal: () => void;
  onExportSVG: () => void;
  onExportPNG: () => void;
  onOpenSettings: () => void;
  hasOpenAiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentBrand,
  brands,
  onSelectBrand,
  onOpenNewBrandModal,
  onOpenBrandEcosystem,
  onOpenNewDocumentModal,
  onExportSVG,
  onExportPNG,
  onOpenSettings,
  hasOpenAiKey,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <header className="h-10 border-b border-[#333333] bg-[#1e1e1e] flex items-center justify-between px-3 z-30 shrink-0 select-none text-xs text-[#d4d4d8]">
      
      {/* 1. APP LOGO & ILLUSTRATOR DESKTOP MENU */}
      <div className="flex items-center space-x-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-[#2a2a2a] border border-[#404040] flex items-center justify-center shadow-sm">
            <span className="font-black text-xs text-white">Z</span>
          </div>
          <span className="font-bold tracking-tight text-white text-xs">
            Zoik <span className="text-[#a1a1aa] font-normal">Design</span>
          </span>
        </div>

        <div className="h-3.5 w-px bg-[#333333] mx-1" />

        {/* Illustrator Top Menu Bar */}
        <div className="flex items-center space-x-0.5 text-zinc-300 font-medium">
          
          {/* Archivo */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'archivo' ? null : 'archivo')}
              className={`px-2 py-1 rounded hover:bg-[#2d2d2d] transition ${activeMenu === 'archivo' ? 'bg-[#2d2d2d] text-white' : ''}`}
            >
              Archivo
            </button>
            {activeMenu === 'archivo' && (
              <div 
                className="absolute left-0 mt-1 w-48 bg-[#262626] border border-[#3e3e3e] rounded shadow-2xl py-1 z-50 text-xs"
                onClick={() => setActiveMenu(null)}
              >
                <button 
                  onClick={onOpenNewDocumentModal}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d66d0] hover:text-white flex items-center justify-between"
                >
                  <span>Nuevo Documento...</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Ctrl+N</span>
                </button>
                <div className="h-px bg-[#383838] my-1" />
                <button 
                  onClick={onExportSVG}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d66d0] hover:text-white flex items-center justify-between"
                >
                  <span>Exportar SVG Vectorial</span>
                  <span className="text-[10px] text-zinc-400 font-mono">.SVG</span>
                </button>
                <button 
                  onClick={onExportPNG}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0d66d0] hover:text-white flex items-center justify-between"
                >
                  <span>Exportar Imagen HD</span>
                  <span className="text-[10px] text-zinc-400 font-mono">300 DPI</span>
                </button>
              </div>
            )}
          </div>

          {/* Ajustes */}
          <button 
            onClick={onOpenSettings}
            className="px-2 py-1 rounded hover:bg-[#2d2d2d] transition text-zinc-400 hover:text-white"
          >
            Preferencias
          </button>
        </div>

        <div className="h-3.5 w-px bg-[#333333] mx-1" />

        {/* Brand Selector + Compact Folder Icon for Reference Pieces */}
        <div className="flex items-center space-x-1.5 bg-[#262626] border border-[#383838] rounded px-2 py-0.5">
          <span 
            className="w-2 h-2 rounded-full shadow-sm ring-1 ring-white/20"
            style={{ backgroundColor: currentBrand.colors.primary }}
          />
          <select
            value={currentBrand.id}
            onChange={(e) => {
              const found = brands.find(b => b.id === e.target.value);
              if (found) onSelectBrand(found);
            }}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs pr-1"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#262626] text-white">
                {b.name}
              </option>
            ))}
          </select>

          {/* Compact folder icon for Brand Reference Pieces */}
          <button
            onClick={onOpenBrandEcosystem}
            className="p-1 rounded hover:bg-[#383838] text-zinc-400 hover:text-white transition"
            title="Piezas de Referencia de la Marca (Guía para la IA)"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenNewBrandModal}
            className="p-1 rounded hover:bg-[#383838] text-zinc-400 hover:text-white transition"
            title="Crear Nuevo Kit de Marca"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. RIGHT ACTIONS & PREFERENCES */}
      <div className="flex items-center space-x-2">
        
        {/* Status indicator */}
        <button 
          onClick={onOpenSettings}
          className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#262626] border border-[#383838] text-[11px] text-zinc-400 hover:text-white transition"
          title="Configuración de APIs y Modelo"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${hasOpenAiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span>{hasOpenAiKey ? 'IA Online' : 'Local'}</span>
          <Settings className="w-3 h-3 text-zinc-400 ml-0.5" />
        </button>

      </div>
    </header>
  );
};
