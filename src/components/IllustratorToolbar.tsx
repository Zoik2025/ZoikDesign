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
    <aside className="w-14 bg-[#141416] border-r border-[#26262a] flex flex-col items-center py-3 space-y-1.5 shrink-0 z-20 select-none">
      
      {/* 1. SELECCIÓN (V) */}
      <button
        onClick={() => onSelectTool('select')}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
          activeTool === 'select'
            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}
        title="Herramienta Selección (V)"
      >
        <MousePointer className="w-4 h-4" />
      </button>

      {/* 2. TEXTO (T) */}
      <button
        onClick={() => {
          onSelectTool('text');
          onAddText();
        }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
          activeTool === 'text'
            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}
        title="Herramienta Texto (T) - Añadir Texto al Lienzo"
      >
        <Type className="w-4 h-4" />
      </button>

      {/* 3. FORMAS VECTORIALES (U) */}
      <button
        onClick={() => {
          onSelectTool('shape-rect');
          onAddShape('rect');
        }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
          activeTool === 'shape-rect' || activeTool === 'shape-circle'
            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}
        title="Herramienta Formas (U) - Añadir Rectángulo / Badge"
      >
        <Square className="w-4 h-4" />
      </button>

      {/* 4. IA MAGIC WAND (W) */}
      <button
        onClick={() => onSelectTool('ai-wand')}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
          activeTool === 'ai-wand'
            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
            : 'text-zinc-400 hover:text-purple-400 hover:bg-zinc-800'
        }`}
        title="Generador & Director de Arte IA"
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {/* SEPARATOR */}
      <div className="w-6 h-px bg-[#26262a] my-2" />

      {/* 5. ECOSISTEMA DE MARCA (B) */}
      <button
        onClick={onOpenBrandEcosystem}
        className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-950/40 border border-purple-500/40 text-purple-400 hover:bg-purple-600 hover:text-white transition shadow-sm"
        title="Ecosistema de Marca - Subir Piezas de Referencia y Moodboard"
      >
        <Layers className="w-4 h-4" />
      </button>

      {/* 6. SHUFFLE PALETTE */}
      <button
        onClick={onShuffleColors}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        title="Intercambiar Colores Armónicos de Marca"
      >
        <Palette className="w-4 h-4" />
      </button>

    </aside>
  );
};
