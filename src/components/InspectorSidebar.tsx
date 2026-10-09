import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import type { BrandKit } from '../types';
import { 
  AlignLeft, AlignCenter, AlignRight, 
  Sliders, Laptop, Type, Palette 
} from 'lucide-react';
import { FONT_CATALOG, loadGoogleFont, getContrastScore } from '../data/typographyAndColors';
import type { SystemFontInfo } from '../data/systemFonts';

interface InspectorSidebarProps {
  brand: BrandKit;
  fabricCanvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  localPcFonts: SystemFontInfo[];
}

const FONT_WEIGHTS = [
  { label: 'Normal (400)', value: '400' },
  { label: 'Seminegrita (600)', value: '600' },
  { label: 'Negrita (700)', value: '700' },
  { label: 'Extranegrita (800)', value: '800' },
  { label: 'Black (900)', value: '900' },
];

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  brand,
  fabricCanvas,
  selectedObject,
  localPcFonts,
}) => {
  const [customFontInput, setCustomFontInput] = useState('');
  
  // Local state mirrored from active object
  const [objText, setObjText] = useState('');
  const [objFont, setObjFont] = useState(brand.typography.headlineFont);
  const [objSize, setObjSize] = useState(32);
  const [objWeight, setObjWeight] = useState('700');
  const [objFill, setObjFill] = useState('#ffffff');
  const [objAlign, setObjAlign] = useState<'left' | 'center' | 'right'>('left');
  const [objSpacing, setObjSpacing] = useState(0);

  // Sync state whenever selectedObject changes
  useEffect(() => {
    if (!selectedObject) return;

    if (selectedObject.type === 'i-text' || selectedObject.type === 'text') {
      const itext = selectedObject as fabric.IText;
      setObjText(itext.text || '');
      setObjFont(itext.fontFamily || brand.typography.headlineFont);
      setObjSize(itext.fontSize || 32);
      setObjWeight(String(itext.fontWeight || '700'));
      setObjFill(String(itext.fill || '#ffffff'));
      setObjAlign((itext.textAlign as any) || 'left');
      setObjSpacing(Math.round((itext.charSpacing || 0) / 10));
    } else {
      setObjFill(String(selectedObject.fill || brand.colors.primary));
    }
  }, [selectedObject]);

  const updateActiveText = (text: string) => {
    setObjText(text);
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      (selectedObject as fabric.IText).set('text', text);
      fabricCanvas?.renderAll();
    }
  };

  const updateActiveFont = (fontName: string) => {
    setObjFont(fontName);
    loadGoogleFont(fontName);
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      (selectedObject as fabric.IText).set('fontFamily', fontName);
      fabricCanvas?.renderAll();
    }
  };

  const updateActiveSize = (size: number) => {
    setObjSize(size);
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      (selectedObject as fabric.IText).set('fontSize', size);
      fabricCanvas?.renderAll();
    }
  };

  const updateActiveWeight = (weight: string) => {
    setObjWeight(weight);
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      (selectedObject as fabric.IText).set('fontWeight', weight);
      fabricCanvas?.renderAll();
    }
  };

  const updateActiveFill = (fillColor: string) => {
    setObjFill(fillColor);
    if (selectedObject) {
      selectedObject.set('fill', fillColor);
      fabricCanvas?.renderAll();
    }
  };

  const updateActiveAlign = (align: 'left' | 'center' | 'right') => {
    setObjAlign(align);
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      (selectedObject as fabric.IText).set('textAlign', align);
      fabricCanvas?.renderAll();
    }
  };

  const updateActiveSpacing = (spacing: number) => {
    setObjSpacing(spacing);
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      (selectedObject as fabric.IText).set('charSpacing', spacing * 10);
      fabricCanvas?.renderAll();
    }
  };

  const handleApplyCustomFont = () => {
    if (!customFontInput.trim()) return;
    updateActiveFont(customFontInput.trim());
    setCustomFontInput('');
  };

  const isTextObj = selectedObject?.type === 'i-text' || selectedObject?.type === 'text';
  const contrastInfo = getContrastScore(objFill, brand.colors.backgroundDark);

  return (
    <aside className="w-80 border-l border-[#27272a] bg-[#18181b] flex flex-col shrink-0 overflow-y-auto select-none custom-scroll text-xs">
      
      {/* HEADER: PROPS */}
      <div className="p-4 border-b border-[#27272a] bg-[#141416] flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span>Propiedades del Objeto</span>
        </span>
        {selectedObject && (
          <span className="text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-mono uppercase">
            {selectedObject.type}
          </span>
        )}
      </div>

      <div className="p-4 space-y-4 flex-1">
        
        {selectedObject ? (
          <div className="space-y-4 bg-[#202024] p-3.5 rounded-xl border border-[#2e2e34]">
            
            {/* TEXT EDITING */}
            {isTextObj && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Contenido de Texto</label>
                  <textarea
                    value={objText}
                    onChange={(e) => updateActiveText(e.target.value)}
                    rows={2}
                    className="w-full bg-[#141416] border border-[#2a2a30] focus:border-purple-500 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 block mt-0.5">También puedes hacer doble clic sobre el texto en el lienzo para escribir.</span>
                </div>

                {/* FUENTE */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span className="font-semibold">Tipografía</span>
                    {localPcFonts.length > 0 && (
                      <span className="text-purple-400 flex items-center space-x-0.5 font-mono">
                        <Laptop className="w-2.5 h-2.5" />
                        <span>{localPcFonts.length} PC</span>
                      </span>
                    )}
                  </div>

                  <select
                    value={objFont}
                    onChange={(e) => updateActiveFont(e.target.value)}
                    className="w-full bg-[#141416] border border-[#2a2a30] rounded-lg p-2 text-xs text-white focus:outline-none font-semibold"
                  >
                    {localPcFonts.length > 0 && (
                      <optgroup label="💻 Fuentes Instaladas en tu PC (Windows)">
                        {localPcFonts.map(f => (
                          <option key={f.name} value={f.name}>💻 {f.name}</option>
                        ))}
                      </optgroup>
                    )}

                    <optgroup label="✨ Display & Titulares">
                      {FONT_CATALOG.filter(f => f.category === 'Display & Bold').map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </optgroup>

                    <optgroup label="✨ Modern Sans">
                      {FONT_CATALOG.filter(f => f.category === 'Modern Sans').map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </optgroup>

                    <optgroup label="✨ Luxury Serif">
                      {FONT_CATALOG.filter(f => f.category === 'Luxury Serif').map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* ESCRIBIR CUALQUIER FUENTE */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Cargar otra fuente del PC o Google</label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      value={customFontInput}
                      onChange={(e) => setCustomFontInput(e.target.value)}
                      placeholder="Ej: Arial, Futura, Cinzel..."
                      className="flex-1 bg-[#141416] border border-[#2a2a30] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={handleApplyCustomFont}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px]"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                {/* PESO & TAMAÑO */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Grosor</label>
                    <select
                      value={objWeight}
                      onChange={(e) => updateActiveWeight(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2a2a30] rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                    >
                      {FONT_WEIGHTS.map(w => (
                        <option key={w.value} value={w.value}>{w.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Tamaño: <strong className="text-white font-mono">{objSize}px</strong></label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={objSize}
                      onChange={(e) => updateActiveSize(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer mt-1"
                    />
                  </div>
                </div>

                {/* TRACKING & ALINEACIÓN */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                    <span>Espaciado de Letras (Tracking)</span>
                    <span className="font-mono text-white">{objSpacing} px</span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="10"
                    value={objSpacing}
                    onChange={(e) => updateActiveSpacing(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* ALINEACIÓN */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Alineación</label>
                  <div className="flex items-center space-x-1">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button
                        key={align}
                        onClick={() => updateActiveAlign(align)}
                        className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center transition ${
                          objAlign === align
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-[#141416] border-[#2a2a30] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                        {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                        {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* COLOR RELLENO */}
            <div className="pt-2 border-t border-zinc-700/40 space-y-2">
              <span className="text-[11px] font-bold text-zinc-200 flex items-center space-x-1">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>Color de Relleno</span>
              </span>

              {/* Muestras rápidas de la marca */}
              <div className="flex items-center space-x-1.5">
                <div 
                  onClick={() => updateActiveFill(brand.colors.primary)}
                  className="w-6 h-6 rounded-md border border-white/20 cursor-pointer shadow-sm hover:scale-110 transition"
                  style={{ backgroundColor: brand.colors.primary }}
                  title={`Primario: ${brand.colors.primary}`}
                />
                <div 
                  onClick={() => updateActiveFill(brand.colors.secondary)}
                  className="w-6 h-6 rounded-md border border-white/20 cursor-pointer shadow-sm hover:scale-110 transition"
                  style={{ backgroundColor: brand.colors.secondary }}
                  title={`Secundario: ${brand.colors.secondary}`}
                />
                <div 
                  onClick={() => updateActiveFill(brand.colors.accent)}
                  className="w-6 h-6 rounded-md border border-white/20 cursor-pointer shadow-sm hover:scale-110 transition"
                  style={{ backgroundColor: brand.colors.accent }}
                  title={`Acento: ${brand.colors.accent}`}
                />
                <div 
                  onClick={() => updateActiveFill(brand.colors.textPrimary)}
                  className="w-6 h-6 rounded-md border border-white/20 cursor-pointer shadow-sm hover:scale-110 transition"
                  style={{ backgroundColor: brand.colors.textPrimary }}
                  title={`Texto: ${brand.colors.textPrimary}`}
                />
                <div 
                  onClick={() => updateActiveFill(brand.colors.backgroundDark)}
                  className="w-6 h-6 rounded-md border border-white/20 cursor-pointer shadow-sm hover:scale-110 transition"
                  style={{ backgroundColor: brand.colors.backgroundDark }}
                  title={`Fondo: ${brand.colors.backgroundDark}`}
                />
              </div>

              {/* Color picker custom */}
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={objFill.startsWith('#') ? objFill : '#ffffff'}
                  onChange={(e) => updateActiveFill(e.target.value)}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={objFill}
                  onChange={(e) => updateActiveFill(e.target.value)}
                  className="flex-1 bg-[#141416] border border-[#2a2a30] rounded-lg px-2.5 py-1 text-xs text-white font-mono uppercase"
                />
              </div>

              {/* Contraste WCAG */}
              <div className="bg-[#141416] p-2 rounded-lg border border-[#2a2a30] flex items-center justify-between text-[10px]">
                <span className="text-zinc-400">Contraste vs Fondo:</span>
                <span className="font-mono text-white font-bold">{contrastInfo.ratio}:1 ({contrastInfo.level})</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-dashed border-[#2e2e34] text-center text-zinc-500">
              <Type className="w-6 h-6 mx-auto mb-2 opacity-40 text-purple-400" />
              <p>Selecciona cualquier objeto, texto o imagen en el lienzo para ajustar sus propiedades.</p>
              <p className="text-[10px] text-zinc-600 mt-1">Usa la herramienta Selección (V) para hacer clic o mover elementos libremente.</p>
            </div>

            {/* Fondo del lienzo */}
            <div className="bg-[#202024] p-3.5 rounded-xl border border-[#2e2e34] space-y-2.5">
              <span className="text-[11px] font-bold text-white block">Color de Fondo de la Mesa de Trabajo</span>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={brand.colors.backgroundDark}
                  onChange={(e) => {
                    fabricCanvas?.setBackgroundColor(e.target.value, fabricCanvas.renderAll.bind(fabricCanvas));
                  }}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <span className="text-zinc-400 font-mono">{brand.colors.backgroundDark}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
