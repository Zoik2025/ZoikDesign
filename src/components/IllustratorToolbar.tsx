import React from 'react';
import type { EditorTool } from '../types';
import { 
  MousePointer, Type, Square, 
  Sparkles, Layers, Palette 
} from 'lucide-react';

interface IllustratorToolbarProps {
  activeTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  onAddText: () => void;
  onAddShape: (shapeType: 'rect' | 'circle') => void;
  onOpenBrandEcosystem: () => void;
  onShuffleColors: () => void;
}

export const IllustratorToolbar: React.FC<IllustratorToolbarProps> = ({
  activeTool,
  onSelectTool,
  onAddText,
  onAddShape,
  onOpenBrandEcosystem,
  onShuffleColors,
}) => {
  return (
    <aside className="w-12 bg-[#1e1e1e] border-r border-[#333333] flex flex-col items-center py-2.5 space-y-1 shrink-0 z-20 select-none">
      
      {/* 1. SELECCIÓN (V) */}
      <button
        onClick={() => onSelectTool('select')}
        className={`w-8 h-8 rounded flex items-center justify-center transition ${
          activeTool === 'select'
            ? 'bg-[#0d66d0] text-white shadow-sm'
            : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
        }`}
        title="Selección (V)"
      >
        <MousePointer className="w-4 h-4" />
      </button>

      {/* 2. TEXTO (T) */}
      <button
        onClick={() => {
          onSelectTool('text');
          onAddText();
        }}
        className={`w-8 h-8 rounded flex items-center justify-center transition ${
          activeTool === 'text'
            ? 'bg-[#0d66d0] text-white shadow-sm'
            : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
        }`}
        title="Texto (T) - Añadir Texto al Lienzo"
      >
        <Type className="w-4 h-4" />
      </button>

      {/* 3. FORMAS VECTORIALES (U) */}
      <button
        onClick={() => {
          onSelectTool('shape-rect');
          onAddShape('rect');
        }}
        className={`w-8 h-8 rounded flex items-center justify-center transition ${
          activeTool === 'shape-rect' || activeTool === 'shape-circle'
            ? 'bg-[#0d66d0] text-white shadow-sm'
            : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
        }`}
        title="Formas (U) - Añadir Rectángulo"
      >
        <Square className="w-4 h-4" />
      </button>

      {/* 4. IA MAGIC WAND (W) */}
      <button
        onClick={() => onSelectTool('ai-wand')}
        className={`w-8 h-8 rounded flex items-center justify-center transition ${
          activeTool === 'ai-wand'
            ? 'bg-[#0d66d0] text-white shadow-sm'
            : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
        }`}
        title="Generador de Pieza IA (W)"
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {/* SEPARATOR */}
      <div className="w-5 h-px bg-[#333333] my-1" />

      {/* 5. REFERENCIAS DE MARCA (B) */}
      <button
        onClick={onOpenBrandEcosystem}
        className="w-8 h-8 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#2d2d2d] transition"
        title="Piezas de Referencia de la Marca (B)"
      >
        <Layers className="w-4 h-4" />
      </button>

      {/* 6. SHUFFLE PALETTE */}
      <button
        onClick={onShuffleColors}
        className="w-8 h-8 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#2d2d2d] transition"
        title="Alternar Colores de la Marca"
      >
        <Palette className="w-4 h-4" />
      </button>

    </aside>
  );
};
