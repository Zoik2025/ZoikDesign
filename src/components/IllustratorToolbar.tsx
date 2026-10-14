import React, { useState } from 'react';
import type { EditorTool } from '../types';
import { 
  MousePointer2, MousePointer, PenTool, 
  Square, Circle, Type, Minus, Pipette, 
  Hand, ZoomIn, ArrowLeftRight, Sparkles
} from 'lucide-react';

interface IllustratorToolbarProps {
  activeTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  onAddText: () => void;
  onAddShape: (shapeType: 'rect' | 'circle' | 'line') => void;
  fillColor: string;
  strokeColor: string;
  onChangeFillColor: (color: string) => void;
  onChangeStrokeColor: (color: string) => void;
  onSwapFillStroke: () => void;
  onResetFillStroke: () => void;
}

export const IllustratorToolbar: React.FC<IllustratorToolbarProps> = ({
  activeTool,
  onSelectTool,
  onAddText,
  onAddShape,
  fillColor,
  strokeColor,
  onChangeFillColor,
  onChangeStrokeColor,
  onSwapFillStroke,
  onResetFillStroke,
}) => {
  const [activeSwatch, setActiveSwatch] = useState<'fill' | 'stroke'>('fill');

  return (
    <aside className="w-12 bg-[#1e1e1e] border-r border-[#333333] flex flex-col items-center py-2 shrink-0 z-20 select-none justify-between h-full">
      
      {/* 1. TOP TOOLS PANEL (ADOBE ILLUSTRATOR EMULATION) */}
      <div className="flex flex-col items-center space-y-1 w-full">
        
        {/* Selección (V) */}
        <button
          onClick={() => onSelectTool('select')}
          className={`w-8 h-8 rounded flex items-center justify-center transition group relative ${
            activeTool === 'select'
              ? 'bg-[#0d66d0] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
          }`}
          title="Herramienta Selección (V)"
        >
          <MousePointer2 className="w-4 h-4 fill-current" />
        </button>

        {/* Selección Directa (A) */}
        <button
          onClick={() => onSelectTool('direct-select')}
          className={`w-8 h-8 rounded flex items-center justify-center transition group relative ${
            activeTool === 'direct-select'
              ? 'bg-[#0d66d0] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
          }`}
          title="Selección Directa (A)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* Pluma (P) */}
        <button
          onClick={() => onSelectTool('pen')}
          className={`w-8 h-8 rounded flex items-center justify-center transition group relative ${
            activeTool === 'pen'
              ? 'bg-[#0d66d0] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
          }`}
          title="Herramienta Pluma (P)"
        >
          <PenTool className="w-4 h-4" />
        </button>

        {/* Texto (T) */}
        <button
          onClick={() => {
            onSelectTool('text');
            onAddText();
          }}
          className={`w-8 h-8 rounded flex items-center justify-center transition group relative ${
            activeTool === 'text'
              ? 'bg-[#0d66d0] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
          }`}
          title="Herramienta Texto (T) — Añadir Texto a la Mesa"
        >
          <Type className="w-4 h-4 font-black" />
        </button>

        {/* Rectángulo (M) */}
        <button
          onClick={() => {
            onSelectTool('shape-rect');
            onAddShape('rect');
          }}
          className={`w-8 h-8 rounded flex items-center justify-center transition group relative ${
            activeTool === 'shape-rect'
              ? 'bg-[#0d66d0] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
          }`}
          title="Herramienta Rectángulo (M)"
        >
          <Square className="w-4 h-4" />
        </button>

        {/* Elipse (L) */}
        <button
          onClick={() => {
            onSelectTool('shape-circle');
            onAddShape('circle');
          }}
          className={`w-8 h-8 rounded flex items-center justify-center transition group relative ${
            activeTool === 'shape-circle'
              ? 'bg-[#0d66d0] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
          }`}
          title="Herramienta Elipse (L)"
        >
          <Circle className="w-4 h-4" />
        </button>

        {/* Línea (\) */}
        <button
          onClick={() => {
            onSelectTool('line');
            onAddShape('line');
          }}
          className={`w-8 h-8 rounded flex items-center justify-center transition group relative ${
            activeTool === 'line'
              ? 'bg-[#0d66d0] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
          }`}
          title="Segmento de Línea (\)"
        >
          <Minus className="w-4 h-4 -rotate-45" />
        </button>

        {/* Separador */}
        <div className="w-6 h-px bg-[#333333] my-1" />

        {/* Cuentagotas / Eyedropper (I) */}
        <button
          onClick={() => onSelectTool('eyedropper')}
          className={`w-8 h-8 rounded flex items-center justify-center transition group relative ${
            activeTool === 'eyedropper'
              ? 'bg-[#0d66d0] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
          }`}
          title="Cuentagotas (I)"
        >
          <Pipette className="w-4 h-4" />
        </button>

        {/* Mano / Hand (H) */}
        <button
          onClick={() => onSelectTool('hand')}
          className={`w-8 h-8 rounded flex items-center justify-center transition group relative ${
            activeTool === 'hand'
              ? 'bg-[#0d66d0] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
          }`}
          title="Herramienta Mano (H)"
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Zoom (Z) */}
        <button
          onClick={() => onSelectTool('zoom')}
          className={`w-8 h-8 rounded flex items-center justify-center transition group relative ${
            activeTool === 'zoom'
              ? 'bg-[#0d66d0] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-[#2d2d2d]'
          }`}
          title="Herramienta Zoom (Z)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

      </div>

      {/* 2. BOTTOM: OVERLAPPING FILL & STROKE SWATCHES (ADOBE ILLUSTRATOR SIGNATURE) */}
      <div className="flex flex-col items-center pt-2 border-t border-[#333333] w-full">
        
        {/* Swap Fill/Stroke arrow */}
        <div className="w-8 flex justify-end mb-0.5">
          <button
            onClick={onSwapFillStroke}
            className="text-zinc-400 hover:text-white transition p-0.5"
            title="Intercambiar Relleno y Trazo (X)"
          >
            <ArrowLeftRight className="w-3 h-3 rotate-45" />
          </button>
        </div>

        {/* Overlapping boxes container */}
        <div className="relative w-8 h-8 mb-2">
          
          {/* Stroke Box (Behind) */}
          <label 
            onClick={() => setActiveSwatch('stroke')}
            className={`absolute bottom-0 right-0 w-5 h-5 rounded-sm border cursor-pointer shadow-md transition ${
              activeSwatch === 'stroke' ? 'z-10 ring-1 ring-[#388bff] border-white' : 'z-0 border-[#555555]'
            }`}
            style={{ 
              backgroundColor: strokeColor === 'transparent' ? '#1e1e1e' : strokeColor,
              borderWidth: strokeColor === 'transparent' ? '1px' : '3px',
              borderColor: strokeColor === 'transparent' ? '#ef4444' : strokeColor
            }}
            title={`Trazo: ${strokeColor}. Clic para cambiar.`}
          >
            <input 
              type="color" 
              value={strokeColor.startsWith('#') ? strokeColor : '#000000'} 
              onChange={(e) => onChangeStrokeColor(e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </label>

          {/* Fill Box (In front) */}
          <label 
            onClick={() => setActiveSwatch('fill')}
            className={`absolute top-0 left-0 w-5 h-5 rounded-sm border cursor-pointer shadow-md transition ${
              activeSwatch === 'fill' ? 'z-10 ring-1 ring-[#388bff] border-white' : 'z-0 border-[#555555]'
            }`}
            style={{ backgroundColor: fillColor === 'transparent' ? '#1e1e1e' : fillColor }}
            title={`Relleno: ${fillColor}. Clic para cambiar.`}
          >
            <input 
              type="color" 
              value={fillColor.startsWith('#') ? fillColor : '#ffffff'} 
              onChange={(e) => onChangeFillColor(e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>

        {/* Reset to Default (D) & None swatches */}
        <div className="flex items-center space-x-1.5 text-[9px] text-zinc-500">
          <button
            onClick={onResetFillStroke}
            className="w-3.5 h-3.5 border border-[#555555] bg-white flex items-center justify-center hover:border-white transition"
            title="Relleno y trazo por defecto (D)"
          >
            <div className="w-1.5 h-1.5 bg-black" />
          </button>
          <button
            onClick={() => {
              if (activeSwatch === 'fill') onChangeFillColor('transparent');
              else onChangeStrokeColor('transparent');
            }}
            className="w-3.5 h-3.5 border border-[#555555] bg-white relative overflow-hidden hover:border-white transition"
            title="Ninguno (Relleno/Trazo transparente)"
          >
            <div className="absolute inset-0 border-t border-red-500 rotate-45 top-1.5" />
          </button>
        </div>

      </div>

    </aside>
  );
};
