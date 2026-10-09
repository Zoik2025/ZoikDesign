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
    <header className="h-12 border-b border-[#27272a] bg-[#141416] flex items-center justify-between px-3 z-30 shrink-0 select-none text-xs">
      
      {/* 1. APP LOGO & ILLUSTRATOR DESKTOP MENU */}
      <div className="flex items-center space-x-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-600/30 border border-purple-400/30">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-white text-sm">
            Zoik<span className="text-purple-400">Design</span>
          </span>
        </div>

        <div className="h-4 w-px bg-[#27272a] mx-1" />

        {/* Illustrator Top Menu Bar */}
        <div className="flex items-center space-x-1 text-zinc-300 font-medium">
          
          {/* Archivo */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'archivo' ? null : 'archivo')}
              className={`px-2.5 py-1 rounded hover:bg-zinc-800 transition ${activeMenu === 'archivo' ? 'bg-zinc-800 text-white' : ''}`}
            >
              Archivo
            </button>
            {activeMenu === 'archivo' && (
              <div 
                className="absolute left-0 mt-1 w-48 bg-[#1c1c20] border border-[#2e2e34] rounded-xl shadow-2xl py-1 z-50 text-xs"
                onClick={() => setActiveMenu(null)}
              >
                <button 
                  onClick={onOpenNewDocumentModal}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-600 hover:text-white flex items-center justify-between"
                >
                  <span>Nuevo Documento...</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Ctrl+N</span>
                </button>
                <div className="h-px bg-zinc-800 my-1" />
                <button 
                  onClick={onExportSVG}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-600 hover:text-white flex items-center justify-between"
                >
                  <span>Exportar SVG Vectorial</span>
                  <span className="text-[10px] text-zinc-400 font-mono">.SVG</span>
                </button>
                <button 
                  onClick={onExportPNG}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-600 hover:text-white flex items-center justify-between"
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
            className="px-2.5 py-1 rounded hover:bg-zinc-800 transition"
          >
            Preferencias
          </button>
        </div>

        <div className="h-4 w-px bg-[#27272a] mx-1" />

        {/* Brand Selector + Compact Folder Icon for Ecosystem */}
        <div className="flex items-center space-x-1.5 bg-[#1c1c20] border border-[#2e2e34] rounded-lg px-2 py-1">
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
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs pr-1"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#18181b] text-white">
                {b.name}
              </option>
            ))}
          </select>

          {/* Compact folder icon for Brand Ecosystem */}
          <button
            onClick={onOpenBrandEcosystem}
            className="p-1 rounded hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 transition"
            title="Abrir Ecosistema de Marca (Subir referencias y piezas)"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenNewBrandModal}
            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
            title="Crear Nueva Marca"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* NEW DOCUMENT BUTTON (ILLUSTRATOR STYLE) */}
        <button
          onClick={onOpenNewDocumentModal}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition"
          title="Crear nuevo lienzo o cambiar dimensiones (Ctrl+N)"
        >
          <FilePlus className="w-3.5 h-3.5 text-purple-400" />
          <span>Nuevo Lienzo</span>
        </button>
      </div>

      {/* 2. RIGHT ACTIONS & EXPORT */}
      <div className="flex items-center space-x-2">
        
        {/* Status indicator */}
        <button 
          onClick={onOpenSettings}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#1c1c20] border border-[#2e2e34] text-[11px] text-zinc-400 hover:text-white transition"
          title="Configurar OpenAI / Freepik"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${hasOpenAiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span>{hasOpenAiKey ? 'IA Online' : 'Local'}</span>
          <Settings className="w-3 h-3 text-zinc-400 ml-0.5" />
        </button>

        {/* Export SVG */}
        <button
          onClick={onExportSVG}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#222228] hover:bg-[#2c2c34] border border-[#34343e] font-semibold text-white transition shadow-sm"
          title="Descargar SVG vectorial editable"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>Exportar SVG</span>
        </button>

        {/* Export HD */}
        <button
          onClick={onExportPNG}
          className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-purple-600/30 transition transform active:scale-95"
          title="Descargar imagen a 300 DPI"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Descargar HD (300 DPI)</span>
        </button>

      </div>
    </header>
  );
};
