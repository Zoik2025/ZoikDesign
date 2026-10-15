import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import type { BrandKit } from '../types';
import { 
  AlignLeft, AlignCenter, AlignRight, 
  Sliders, Laptop, Type, Palette,
  Sun, Contrast, Droplet, RotateCw, FlipHorizontal, FlipVertical, Wand2, Sparkles, Layers,
  Scissors
} from 'lucide-react';
import { FONT_CATALOG, loadGoogleFont, getContrastScore } from '../data/typographyAndColors';
import type { SystemFontInfo } from '../data/systemFonts';
import type { PhotoshopImageAdjustments, PhotoshopPreset } from '../services/photoshopImageFilters';
import { 
  DEFAULT_ADJUSTMENTS, 
  PHOTOSHOP_PRESETS, PHOTOSHOP_BLEND_MODES,
  applyPhotoshopAdjustments, flipHorizontal, flipVertical, rotate90, 
  applyPhotoshopDropShadow, applyPhotoshopOuterGlow 
} from '../services/photoshopImageFilters';
import { removeImageBackground } from '../services/backgroundRemover';

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

  // Photoshop Image Adjustments State
  const [imageAdj, setImageAdj] = useState<PhotoshopImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [dropShadowEnabled, setDropShadowEnabled] = useState(false);
  const [dropShadowColor, setDropShadowColor] = useState('rgba(0, 0, 0, 0.75)');
  const [dropShadowBlur, setDropShadowBlur] = useState(25);
  const [dropShadowOffsetY, setDropShadowOffsetY] = useState(12);
  const [outerGlowEnabled, setOuterGlowEnabled] = useState(false);
  const [outerGlowColor, setOuterGlowColor] = useState(brand.colors.primary);
  const [outerGlowBlur, setOuterGlowBlur] = useState(30);
  const [isCuttingOut, setIsCuttingOut] = useState(false);

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
    } else if (selectedObject.type === 'image') {
      const img = selectedObject as fabric.Image;
      const shadow = img.shadow as fabric.Shadow;
      if (shadow) {
        setDropShadowEnabled(true);
        setDropShadowColor(shadow.color || 'rgba(0, 0, 0, 0.75)');
        setDropShadowBlur(shadow.blur || 25);
        setDropShadowOffsetY(shadow.offsetY || 12);
      } else {
        setDropShadowEnabled(false);
      }
      setImageAdj(prev => ({
        ...prev,
        blendMode: img.globalCompositeOperation || 'source-over',
        opacity: Math.round((img.opacity ?? 1) * 100),
      }));
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

  const handleAdjustmentChange = (key: keyof PhotoshopImageAdjustments, val: any) => {
    const next = { ...imageAdj, [key]: val };
    setImageAdj(next);
    if (selectedObject && selectedObject.type === 'image') {
      applyPhotoshopAdjustments(selectedObject as fabric.Image, next, fabricCanvas);
    }
  };

  const handleApplyPreset = (preset: PhotoshopPreset) => {
    const next: PhotoshopImageAdjustments = {
      ...imageAdj,
      ...preset.adjustments,
    };
    setImageAdj(next);
    if (selectedObject && selectedObject.type === 'image') {
      applyPhotoshopAdjustments(selectedObject as fabric.Image, next, fabricCanvas);
    }
  };

  const handleResetAdjustments = () => {
    setImageAdj(DEFAULT_ADJUSTMENTS);
    if (selectedObject && selectedObject.type === 'image') {
      applyPhotoshopAdjustments(selectedObject as fabric.Image, DEFAULT_ADJUSTMENTS, fabricCanvas);
    }
  };

  const handleAutoCutout = async () => {
    if (!selectedObject || selectedObject.type !== 'image' || !fabricCanvas) return;
    setIsCuttingOut(true);
    try {
      const imgObj = selectedObject as fabric.Image;
      const el = imgObj.getElement() as HTMLImageElement;
      if (el) {
        const transparentDataUrl = await removeImageBackground(el, 30);
        fabric.Image.fromURL(transparentDataUrl, (newImg) => {
          newImg.set({
            left: imgObj.left,
            top: imgObj.top,
            scaleX: imgObj.scaleX,
            scaleY: imgObj.scaleY,
            angle: imgObj.angle,
            flipX: imgObj.flipX,
            flipY: imgObj.flipY,
            shadow: imgObj.shadow,
            globalCompositeOperation: imgObj.globalCompositeOperation,
            opacity: imgObj.opacity,
          });
          fabricCanvas.remove(imgObj);
          fabricCanvas.add(newImg);
          fabricCanvas.setActiveObject(newImg);
          fabricCanvas.renderAll();
        }, { crossOrigin: 'anonymous' });
      }
    } catch (err) {
      console.error('Error auto recortando imagen:', err);
    } finally {
      setIsCuttingOut(false);
    }
  };

  const handleFlipH = () => {
    if (!selectedObject || selectedObject.type !== 'image') return;
    flipHorizontal(selectedObject as fabric.Image, fabricCanvas);
  };

  const handleFlipV = () => {
    if (!selectedObject || selectedObject.type !== 'image') return;
    flipVertical(selectedObject as fabric.Image, fabricCanvas);
  };

  const handleRotate = () => {
    if (!selectedObject || selectedObject.type !== 'image') return;
    rotate90(selectedObject as fabric.Image, fabricCanvas);
  };

  const handleToggleDropShadow = (enabled: boolean) => {
    setDropShadowEnabled(enabled);
    if (selectedObject) {
      applyPhotoshopDropShadow(
        selectedObject,
        { enabled, color: dropShadowColor, blur: dropShadowBlur, offsetY: dropShadowOffsetY },
        fabricCanvas
      );
    }
  };

  const handleChangeShadowBlur = (blur: number) => {
    setDropShadowBlur(blur);
    if (selectedObject) {
      applyPhotoshopDropShadow(
        selectedObject,
        { enabled: true, color: dropShadowColor, blur, offsetY: dropShadowOffsetY },
        fabricCanvas
      );
    }
  };

  const handleChangeShadowOffsetY = (offsetY: number) => {
    setDropShadowOffsetY(offsetY);
    if (selectedObject) {
      applyPhotoshopDropShadow(
        selectedObject,
        { enabled: true, color: dropShadowColor, blur: dropShadowBlur, offsetY },
        fabricCanvas
      );
    }
  };

  const handleToggleOuterGlow = (enabled: boolean) => {
    setOuterGlowEnabled(enabled);
    if (selectedObject) {
      applyPhotoshopOuterGlow(
        selectedObject,
        { enabled, color: outerGlowColor, blur: outerGlowBlur },
        fabricCanvas
      );
    }
  };

  const handleChangeGlowBlur = (blur: number) => {
    setOuterGlowBlur(blur);
    if (selectedObject) {
      applyPhotoshopOuterGlow(
        selectedObject,
        { enabled: true, color: outerGlowColor, blur },
        fabricCanvas
      );
    }
  };

  const handleChangeGlowColor = (color: string) => {
    setOuterGlowColor(color);
    if (selectedObject) {
      applyPhotoshopOuterGlow(
        selectedObject,
        { enabled: true, color, blur: outerGlowBlur },
        fabricCanvas
      );
    }
  };

  const isTextObj = selectedObject?.type === 'i-text' || selectedObject?.type === 'text';
  const isImageObj = selectedObject?.type === 'image';
  const contrastInfo = getContrastScore(objFill, brand.colors.backgroundDark);

  return (
    <aside className="w-80 border-l border-[#333333] bg-[#1e1e1e] flex flex-col shrink-0 overflow-y-auto select-none custom-scroll text-xs text-[#d4d4d8]">
      
      {/* HEADER: PROPS */}
      <div className="p-3.5 border-b border-[#333333] bg-[#262626] flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#388bff]" />
          <span>Propiedades del Objeto</span>
        </span>
        {selectedObject && (
          <span className="text-[10px] bg-[#333333] text-zinc-200 px-2 py-0.5 rounded border border-[#444444] font-mono uppercase">
            {selectedObject.type}
          </span>
        )}
      </div>

      <div className="p-3.5 space-y-3.5 flex-1">
        
        {selectedObject ? (
          <div className="space-y-3.5 bg-[#262626] p-3 rounded border border-[#383838]">
            
            {/* TEXT EDITING */}
            {isTextObj && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Contenido de Texto</label>
                  <textarea
                    value={objText}
                    onChange={(e) => updateActiveText(e.target.value)}
                    rows={2}
                    className="w-full bg-[#1e1e1e] border border-[#383838] focus:border-[#0d66d0] rounded p-2 text-xs text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 block mt-0.5">También puedes hacer doble clic sobre el texto en el lienzo para escribir.</span>
                </div>

                {/* FUENTE */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span className="font-semibold">Tipografía</span>
                    {localPcFonts.length > 0 && (
                      <span className="text-[#388bff] flex items-center space-x-0.5 font-mono">
                        <Laptop className="w-2.5 h-2.5" />
                        <span>{localPcFonts.length} PC</span>
                      </span>
                    )}
                  </div>

                  <select
                    value={objFont}
                    onChange={(e) => updateActiveFont(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#383838] focus:border-[#0d66d0] rounded p-1.5 text-xs text-white focus:outline-none font-semibold"
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

            {/* PHOTOSHOP IMAGE SUITE (IF SELECTED OBJECT IS AN IMAGE) */}
            {isImageObj && (
              <div className="space-y-3.5">
                {/* Photoshop Header Badge */}
                <div className="flex items-center justify-between bg-[#1a2333] border border-[#234578] p-2 rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded bg-[#001e36] border border-[#0094ff] flex items-center justify-center font-bold text-[#0094ff] text-[10px] shadow-sm">
                      Ps
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-white block leading-tight">Photoshop Suite</span>
                      <span className="text-[9px] text-[#70b5ff]">Ajustes y Modos de Fusión</span>
                    </div>
                  </div>
                  <button
                    onClick={handleResetAdjustments}
                    className="text-[10px] text-zinc-400 hover:text-white underline"
                    title="Restablecer filtros a valores originales"
                  >
                    Restablecer
                  </button>
                </div>

                {/* 1. Acciones Rápidas (Cutout & Transforms) */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Acciones Rápidas
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={handleAutoCutout}
                      disabled={isCuttingOut}
                      className="flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded bg-[#0d66d0] hover:bg-[#1070e5] text-white font-semibold text-[11px] shadow-sm col-span-2 disabled:bg-zinc-700 transition"
                      title="Elimina el fondo sólido de la imagen automáticamente"
                    >
                      {isCuttingOut ? (
                        <span>Recortando sujeto...</span>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>🪄 Quitar Fondo (Auto Cutout)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleFlipH}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded bg-[#1e1e1e] hover:bg-[#333333] border border-[#3e3e3e] text-[11px] text-zinc-200 transition"
                      title="Voltear horizontalmente (Efecto espejo)"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5 text-[#388bff]" />
                      <span>Voltear H</span>
                    </button>

                    <button
                      onClick={handleFlipV}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded bg-[#1e1e1e] hover:bg-[#333333] border border-[#3e3e3e] text-[11px] text-zinc-200 transition"
                      title="Voltear verticalmente"
                    >
                      <FlipVertical className="w-3.5 h-3.5 text-[#388bff]" />
                      <span>Voltear V</span>
                    </button>

                    <button
                      onClick={handleRotate}
                      className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded bg-[#1e1e1e] hover:bg-[#333333] border border-[#3e3e3e] text-[11px] text-zinc-200 col-span-2 transition"
                      title="Girar 90 grados a la derecha"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Girar 90° en Sentido Horario</span>
                    </button>
                  </div>
                </div>

                {/* 2. Modos de Fusión (Photoshop Blending Modes) & Opacidad */}
                <div className="pt-2 border-t border-[#383838]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Modo de Fusión (Blend Mode)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {imageAdj.blendMode}
                    </span>
                  </div>
                  <select
                    value={imageAdj.blendMode}
                    onChange={(e) => handleAdjustmentChange('blendMode', e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#3e3e3e] focus:border-[#0d66d0] rounded p-1.5 text-xs text-white focus:outline-none mb-2 font-medium"
                  >
                    {PHOTOSHOP_BLEND_MODES.map(bm => (
                      <option key={bm.value} value={bm.value}>{bm.label}</option>
                    ))}
                  </select>

                  <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                    <span>Opacidad de Capa</span>
                    <span className="font-mono text-white">{imageAdj.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imageAdj.opacity}
                    onChange={(e) => handleAdjustmentChange('opacity', Number(e.target.value))}
                    className="w-full accent-[#0d66d0] cursor-pointer"
                  />
                </div>

                {/* 3. Filtros y LUTs de Color (Presets) */}
                <div className="pt-2 border-t border-[#383838]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Presets & LUTs de Color
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {PHOTOSHOP_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className="p-1.5 rounded bg-[#1e1e1e] hover:bg-[#333333] border border-[#3e3e3e] hover:border-[#0d66d0] text-[10px] text-zinc-300 hover:text-white transition text-center truncate"
                        title={preset.name}
                      >
                        <span className="mr-1">{preset.icon}</span>
                        <span>{preset.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Ajustes de Imagen (Sliders precisos) */}
                <div className="pt-2 border-t border-[#383838] space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Ajustes de Imagen (Image &gt; Adjustments)
                  </span>

                  {/* Brillo */}
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                      <span className="flex items-center space-x-1"><Sun className="w-3 h-3 text-amber-400" /><span>Brillo</span></span>
                      <span className="font-mono text-white">{imageAdj.brightness > 0 ? `+${imageAdj.brightness}` : imageAdj.brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={imageAdj.brightness}
                      onChange={(e) => handleAdjustmentChange('brightness', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Contraste */}
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                      <span className="flex items-center space-x-1"><Contrast className="w-3 h-3 text-blue-400" /><span>Contraste</span></span>
                      <span className="font-mono text-white">{imageAdj.contrast > 0 ? `+${imageAdj.contrast}` : imageAdj.contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={imageAdj.contrast}
                      onChange={(e) => handleAdjustmentChange('contrast', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Saturación */}
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                      <span className="flex items-center space-x-1"><Droplet className="w-3 h-3 text-pink-400" /><span>Saturación</span></span>
                      <span className="font-mono text-white">{imageAdj.saturation > 0 ? `+${imageAdj.saturation}` : imageAdj.saturation}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={imageAdj.saturation}
                      onChange={(e) => handleAdjustmentChange('saturation', Number(e.target.value))}
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>

                  {/* Tono / Hue */}
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                      <span>Tono (Hue Rotation)</span>
                      <span className="font-mono text-white">{imageAdj.hue}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={imageAdj.hue}
                      onChange={(e) => handleAdjustmentChange('hue', Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Desenfoque / Blur */}
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                      <span>Desenfoque Gaussiano</span>
                      <span className="font-mono text-white">{imageAdj.blur}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imageAdj.blur}
                      onChange={(e) => handleAdjustmentChange('blur', Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Toggles Rápidos */}
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <label className={`p-1.5 rounded border text-center cursor-pointer transition text-[10px] font-medium flex items-center justify-center space-x-1 ${
                      imageAdj.grayscale ? 'bg-[#0d66d0] border-[#0d66d0] text-white font-bold' : 'bg-[#1e1e1e] border-[#3e3e3e] text-zinc-400'
                    }`}>
                      <input
                        type="checkbox"
                        checked={imageAdj.grayscale}
                        onChange={(e) => handleAdjustmentChange('grayscale', e.target.checked)}
                        className="hidden"
                      />
                      <span>B&amp;W</span>
                    </label>

                    <label className={`p-1.5 rounded border text-center cursor-pointer transition text-[10px] font-medium flex items-center justify-center space-x-1 ${
                      imageAdj.sepia ? 'bg-[#0d66d0] border-[#0d66d0] text-white font-bold' : 'bg-[#1e1e1e] border-[#3e3e3e] text-zinc-400'
                    }`}>
                      <input
                        type="checkbox"
                        checked={imageAdj.sepia}
                        onChange={(e) => handleAdjustmentChange('sepia', e.target.checked)}
                        className="hidden"
                      />
                      <span>Sepia</span>
                    </label>

                    <label className={`p-1.5 rounded border text-center cursor-pointer transition text-[10px] font-medium flex items-center justify-center space-x-1 ${
                      imageAdj.invert ? 'bg-[#0d66d0] border-[#0d66d0] text-white font-bold' : 'bg-[#1e1e1e] border-[#3e3e3e] text-zinc-400'
                    }`}>
                      <input
                        type="checkbox"
                        checked={imageAdj.invert}
                        onChange={(e) => handleAdjustmentChange('invert', e.target.checked)}
                        className="hidden"
                      />
                      <span>Invertir</span>
                    </label>
                  </div>
                </div>

                {/* 5. Estilos de Capa (Photoshop Layer Styles FX) */}
                <div className="pt-2 border-t border-[#383838] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Estilos de Capa (Layer Styles / FX)
                  </span>

                  {/* Sombra Paralela */}
                  <div className="bg-[#1e1e1e] border border-[#383838] p-2 rounded space-y-1.5">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[11px] font-semibold text-white">🌑 Sombra Paralela (Drop Shadow)</span>
                      <input
                        type="checkbox"
                        checked={dropShadowEnabled}
                        onChange={(e) => handleToggleDropShadow(e.target.checked)}
                        className="accent-[#0d66d0]"
                      />
                    </label>
                    {dropShadowEnabled && (
                      <div className="pt-1.5 border-t border-[#333333] space-y-1.5">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Desenfoque (Blur)</span>
                          <span className="font-mono text-white">{dropShadowBlur}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={dropShadowBlur}
                          onChange={(e) => handleChangeShadowBlur(Number(e.target.value))}
                          className="w-full accent-[#0d66d0] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Desplazamiento Y</span>
                          <span className="font-mono text-white">{dropShadowOffsetY}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={dropShadowOffsetY}
                          onChange={(e) => handleChangeShadowOffsetY(Number(e.target.value))}
                          className="w-full accent-[#0d66d0] cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Resplandor Exterior */}
                  <div className="bg-[#1e1e1e] border border-[#383838] p-2 rounded space-y-1.5">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[11px] font-semibold text-white">✨ Resplandor Exterior (Outer Glow)</span>
                      <input
                        type="checkbox"
                        checked={outerGlowEnabled}
                        onChange={(e) => handleToggleOuterGlow(e.target.checked)}
                        className="accent-[#0d66d0]"
                      />
                    </label>
                    {outerGlowEnabled && (
                      <div className="pt-1.5 border-t border-[#333333] space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span>Color de Luz</span>
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="color"
                              value={outerGlowColor.startsWith('#') ? outerGlowColor : brand.colors.primary}
                              onChange={(e) => handleChangeGlowColor(e.target.value)}
                              className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                            />
                            <span className="font-mono text-white text-[10px]">{outerGlowColor}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Radio del Halo</span>
                          <span className="font-mono text-white">{outerGlowBlur}px</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="70"
                          value={outerGlowBlur}
                          onChange={(e) => handleChangeGlowBlur(Number(e.target.value))}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* COLOR RELLENO (FOR VECTORS AND TEXT OBJECTS) */}
            {!isImageObj && (
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
            )}

          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="p-6 rounded border border-dashed border-[#383838] text-center text-zinc-500 bg-[#262626]">
              <Type className="w-5 h-5 mx-auto mb-2 opacity-50 text-zinc-400" />
              <p>Selecciona cualquier objeto, texto o imagen en el lienzo para ajustar sus propiedades.</p>
              <p className="text-[10px] text-zinc-500 mt-1">Usa la herramienta Selección (V) para hacer clic o mover elementos libremente.</p>
            </div>

            {/* Fondo del lienzo */}
            <div className="bg-[#262626] p-3 rounded border border-[#383838] space-y-2">
              <span className="text-[11px] font-bold text-white block">Color de Fondo de la Mesa de Trabajo</span>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={brand.colors.backgroundDark}
                  onChange={(e) => {
                    fabricCanvas?.setBackgroundColor(e.target.value, fabricCanvas.renderAll.bind(fabricCanvas));
                  }}
                  className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
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
