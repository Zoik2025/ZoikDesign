import React, { useRef, useState } from 'react';
import { fabric } from 'fabric';
import type { BrandKit, DocumentConfig } from '../types';
import type { SystemFontInfo } from '../data/systemFonts';
import { FONT_CATALOG, loadGoogleFont } from '../data/typographyAndColors';
import { CANVAS_FORMATS } from '../data/canvasFormats';
import { removeImageBackground } from '../services/backgroundRemover';
import { 
  Download, Image as ImageIcon, Type, Square, 
  Trash2, MoveUp, MoveDown, Copy, 
  AlignLeft, AlignCenter, AlignRight,
  Scissors, RefreshCw, Upload, FilePlus,
  Eraser, Check
} from 'lucide-react';

interface TopControlBarProps {
  brand: BrandKit;
  docConfig: DocumentConfig;
  onChangeDocConfig: (newConfig: DocumentConfig) => void;
  fabricCanvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  localPcFonts: SystemFontInfo[];
  onOpenNewDocumentModal: () => void;
  onExportSVG: () => void;
  onExportPNG: () => void;
  onClearCanvas: () => void;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  brand,
  docConfig,
  onChangeDocConfig,
  fabricCanvas,
  selectedObject,
  localPcFonts,
  onOpenNewDocumentModal,
  onExportSVG,
  onExportPNG,
  onClearCanvas,
}) => {
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingBg, setIsProcessingBg] = useState(false);

  // Identify selected object type
  const isText = selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text');
  const isImage = selectedObject && (selectedObject.type === 'image');
  const isShape = selectedObject && (selectedObject.type === 'rect' || selectedObject.type === 'circle');

  // Object-specific values
  const textObj = isText ? (selectedObject as fabric.IText) : null;
  const currentFont = textObj ? textObj.fontFamily || brand.typography.headlineFont : brand.typography.headlineFont;
  const currentFontSize = textObj ? Math.round(textObj.fontSize || 32) : 32;
  const currentFontWeight = textObj ? String(textObj.fontWeight || '700') : '700';
  const currentFill = selectedObject ? String(selectedObject.fill || '#ffffff') : '#ffffff';
  const currentTextAlign = textObj ? (textObj.textAlign || 'left') : 'left';
  const currentOpacity = selectedObject ? Math.round((selectedObject.opacity ?? 1) * 100) : 100;

  // Handlers for Text
  const handleFontChange = (font: string) => {
    if (!textObj || !fabricCanvas) return;
    loadGoogleFont(font);
    textObj.set('fontFamily', font);
    fabricCanvas.renderAll();
  };

  const handleFontSizeChange = (delta: number) => {
    if (!textObj || !fabricCanvas) return;
    const newSize = Math.max(10, Math.min(240, (textObj.fontSize || 32) + delta));
    textObj.set('fontSize', newSize);
    fabricCanvas.renderAll();
  };

  const handleFontWeightChange = (weight: string) => {
    if (!textObj || !fabricCanvas) return;
    textObj.set('fontWeight', weight);
    fabricCanvas.renderAll();
  };

  const handleColorChange = (color: string) => {
    if (!selectedObject || !fabricCanvas) return;
    selectedObject.set('fill', color);
    fabricCanvas.renderAll();
  };

  const handleTextAlignChange = (align: 'left' | 'center' | 'right') => {
    if (!textObj || !fabricCanvas) return;
    textObj.set('textAlign', align);
    fabricCanvas.renderAll();
  };

  const handleToggleCase = () => {
    if (!textObj || !fabricCanvas || !textObj.text) return;
    const isUpper = textObj.text === textObj.text.toUpperCase();
    textObj.set('text', isUpper ? textObj.text.toLowerCase() : textObj.text.toUpperCase());
    fabricCanvas.renderAll();
  };

  // Handlers for Image Replacement
  const handleReplaceImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isImage || !fabricCanvas || !selectedObject) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const imgObj = selectedObject as fabric.Image;
      const originalLeft = imgObj.left;
      const originalTop = imgObj.top;
      const originalWidth = imgObj.getScaledWidth();

      fabric.Image.fromURL(dataUrl, (newImg) => {
        newImg.scaleToWidth(originalWidth);
        newImg.set({
          left: originalLeft,
          top: originalTop,
          selectable: true,
        });
        fabricCanvas.remove(selectedObject);
        fabricCanvas.add(newImg);
        fabricCanvas.setActiveObject(newImg);
        fabricCanvas.renderAll();
      }, { crossOrigin: 'anonymous' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Background removal on selected image
  const handleRemoveImageBg = async () => {
    if (!isImage || !fabricCanvas || !selectedObject || isProcessingBg) return;
    setIsProcessingBg(true);

    try {
      const imgObj = selectedObject as fabric.Image;
      const element = imgObj.getElement() as HTMLImageElement;
      const srcUrl = element?.src;
      if (!srcUrl) return;

      const cleanDataUrl = await removeImageBackground(srcUrl);
      const originalLeft = imgObj.left;
      const originalTop = imgObj.top;
      const originalWidth = imgObj.getScaledWidth();

      fabric.Image.fromURL(cleanDataUrl, (newImg) => {
        newImg.scaleToWidth(originalWidth);
        newImg.set({
          left: originalLeft,
          top: originalTop,
          selectable: true,
        });
        fabricCanvas.remove(selectedObject);
        fabricCanvas.add(newImg);
        fabricCanvas.setActiveObject(newImg);
        fabricCanvas.renderAll();
        setIsProcessingBg(false);
      }, { crossOrigin: 'anonymous' });
    } catch (err) {
      console.error('Error al quitar fondo:', err);
      setIsProcessingBg(false);
    }
  };

  // Layer hierarchy controls
  const handleBringForward = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.bringForward(selectedObject);
    fabricCanvas.renderAll();
  };

  const handleSendBackward = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.sendBackwards(selectedObject);
    fabricCanvas.renderAll();
  };

  const handleDuplicate = () => {
    if (!selectedObject || !fabricCanvas) return;
    selectedObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
        evented: true,
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
    });
  };

  const handleDelete = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.remove(selectedObject);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
  };

  const handleFormatSelect = (fmtId: string) => {
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

  const paletteColors = [
    brand.colors.primary,
    brand.colors.secondary,
    brand.colors.accent,
    brand.colors.textPrimary,
    brand.colors.backgroundDark,
    '#ffffff',
    '#000000',
  ];

  return (
    <div className="h-10 bg-[#262626] border-b border-[#383838] flex items-center justify-between px-3 text-xs select-none z-20 shrink-0 text-[#d4d4d8]">
      
      {/* LEFT: CONTEXT-SENSITIVE CONTROLS */}
      <div className="flex items-center space-x-2 overflow-x-auto custom-scroll py-0.5">
        
        {/* CASE 1: TEXT SELECTED */}
        {isText && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center space-x-1">
              <Type className="w-3.5 h-3.5 text-[#388bff]" />
              <span>Carácter:</span>
            </span>

            {/* Font selector */}
            <select
              value={currentFont}
              onChange={(e) => handleFontChange(e.target.value)}
              className="bg-[#1e1e1e] border border-[#3e3e3e] text-white px-2 py-1 rounded text-xs focus:outline-none focus:border-[#0d66d0] max-w-[130px] truncate"
            >
              <optgroup label="Fuentes del Sistema (PC)">
                {localPcFonts.slice(0, 15).map(f => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label="Catálogo Google Fonts">
                {FONT_CATALOG.map(f => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </optgroup>
            </select>

            {/* Font size */}
            <div className="flex items-center bg-[#1e1e1e] border border-[#3e3e3e] rounded overflow-hidden">
              <button 
                onClick={() => handleFontSizeChange(-2)} 
                className="px-1.5 py-1 hover:bg-[#333333] text-zinc-400 hover:text-white"
                title="Reducir tamaño"
              >
                -
              </button>
              <span className="px-1.5 font-mono text-[11px] text-white min-w-[28px] text-center">
                {currentFontSize}
              </span>
              <button 
                onClick={() => handleFontSizeChange(2)} 
                className="px-1.5 py-1 hover:bg-[#333333] text-zinc-400 hover:text-white"
                title="Aumentar tamaño"
              >
                +
              </button>
            </div>

            {/* Font weight */}
            <select
              value={currentFontWeight}
              onChange={(e) => handleFontWeightChange(e.target.value)}
              className="bg-[#1e1e1e] border border-[#3e3e3e] text-white px-1.5 py-1 rounded text-[11px] focus:outline-none"
            >
              <option value="400">Normal</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
              <option value="800">ExtraBold</option>
              <option value="900">Black</option>
            </select>

            {/* Alignments */}
            <div className="flex items-center bg-[#1e1e1e] border border-[#3e3e3e] rounded">
              <button
                onClick={() => handleTextAlignChange('left')}
                className={`p-1 hover:bg-[#333333] transition ${currentTextAlign === 'left' ? 'text-[#388bff]' : 'text-zinc-400'}`}
                title="Alinear Izquierda"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleTextAlignChange('center')}
                className={`p-1 hover:bg-[#333333] transition ${currentTextAlign === 'center' ? 'text-[#388bff]' : 'text-zinc-400'}`}
                title="Centrar"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleTextAlignChange('right')}
                className={`p-1 hover:bg-[#333333] transition ${currentTextAlign === 'right' ? 'text-[#388bff]' : 'text-zinc-400'}`}
                title="Alinear Derecha"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Color chips */}
            <div className="flex items-center space-x-1 pl-1">
              {paletteColors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleColorChange(c)}
                  className={`w-4 h-4 rounded border ${currentFill.toLowerCase() === c.toLowerCase() ? 'border-[#388bff] ring-1 ring-[#388bff]' : 'border-[#444444]'}`}
                  style={{ backgroundColor: c }}
                  title={`Color: ${c}`}
                />
              ))}
            </div>

            {/* Caps Toggle */}
            <button
              onClick={handleToggleCase}
              className="px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#3e3e3e] hover:bg-[#333333] text-[11px] font-semibold text-zinc-300"
              title="Alternar Mayúsculas / Minúsculas"
            >
              Aa
            </button>
          </div>
        )}

        {/* CASE 2: IMAGE SELECTED */}
        {isImage && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center space-x-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#388bff]" />
              <span>Imagen:</span>
            </span>

            {/* Change image from PC */}
            <input 
              ref={replaceImageInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleReplaceImageFile} 
            />
            <button
              onClick={() => replaceImageInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1e1e1e] hover:bg-[#333333] border border-[#3e3e3e] text-xs font-medium text-white transition"
              title="Seleccionar otra imagen desde tu PC para reemplazar este objeto"
            >
              <Upload className="w-3.5 h-3.5 text-[#388bff]" />
              <span>Cambiar Imagen...</span>
            </button>

            {/* Remove background */}
            <button
              onClick={handleRemoveImageBg}
              disabled={isProcessingBg}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border border-[#3e3e3e] text-xs font-medium transition ${
                isProcessingBg 
                  ? 'bg-[#333333] text-zinc-400 cursor-not-allowed' 
                  : 'bg-[#1e1e1e] hover:bg-[#333333] text-white'
              }`}
              title="Eliminar fondo blanco o sólido automáticamente"
            >
              <Scissors className="w-3.5 h-3.5 text-[#388bff]" />
              <span>{isProcessingBg ? 'Recortando...' : 'Eliminar Fondo'}</span>
            </button>

            <span className="text-[11px] text-zinc-500 font-mono pl-1">
              Opacidad: {currentOpacity}%
            </span>
          </div>
        )}

        {/* CASE 3: SHAPE SELECTED */}
        {isShape && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center space-x-1">
              <Square className="w-3.5 h-3.5 text-[#388bff]" />
              <span>Forma:</span>
            </span>

            {/* Color chips */}
            <div className="flex items-center space-x-1">
              {paletteColors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleColorChange(c)}
                  className={`w-4 h-4 rounded border ${currentFill.toLowerCase() === c.toLowerCase() ? 'border-[#388bff] ring-1 ring-[#388bff]' : 'border-[#444444]'}`}
                  style={{ backgroundColor: c }}
                  title={`Relleno: ${c}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* CASE 4: NOTHING SELECTED (CANVAS LEVEL CONTROLS) */}
        {!selectedObject && (
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Mesa:</span>
              <select
                value={
                  CANVAS_FORMATS.find(f => f.width === docConfig.width && f.height === docConfig.height)?.id || 'custom'
                }
                onChange={(e) => handleFormatSelect(e.target.value)}
                className="bg-[#1e1e1e] border border-[#3e3e3e] text-white px-2 py-1 rounded text-xs focus:outline-none"
              >
                {CANVAS_FORMATS.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.width}×{f.height})
                  </option>
                ))}
              </select>
            </div>

            <div className="h-3.5 w-px bg-[#3e3e3e]" />

            <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-mono">
              <span>{docConfig.width} × {docConfig.height} px</span>
              <span className="text-zinc-600">•</span>
              <span>{docConfig.colorMode}</span>
              <span className="text-zinc-600">•</span>
              <span>{docConfig.dpi} DPI</span>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT: UNIVERSAL ACTIONS (LAYER ORDER, CLEAR, EXPORT) */}
      <div className="flex items-center space-x-1.5 shrink-0 pl-2">
        
        {/* Layer order if an object is selected */}
        {selectedObject && (
          <div className="flex items-center space-x-1 pr-2 border-r border-[#3e3e3e]">
            <button
              onClick={handleBringForward}
              className="p-1 rounded hover:bg-[#333333] text-zinc-400 hover:text-white transition"
              title="Traer al frente (Capa superior)"
            >
              <MoveUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSendBackward}
              className="p-1 rounded hover:bg-[#333333] text-zinc-400 hover:text-white transition"
              title="Enviar al fondo (Capa inferior)"
            >
              <MoveDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDuplicate}
              className="p-1 rounded hover:bg-[#333333] text-zinc-400 hover:text-white transition"
              title="Duplicar capa seleccionada"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-[#333333] text-zinc-400 hover:text-rose-400 transition"
              title="Eliminar capa seleccionada (Supr)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          className="px-2 py-1 rounded hover:bg-[#333333] text-zinc-400 hover:text-white transition text-xs flex items-center space-x-1"
          title="Limpiar mesa de trabajo para empezar desde cero"
        >
          <Eraser className="w-3 h-3" />
          <span>Limpiar</span>
        </button>

        {/* New Document */}
        <button
          onClick={onOpenNewDocumentModal}
          className="px-2 py-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white transition text-xs flex items-center space-x-1"
          title="Crear nuevo lienzo o cambiar dimensiones (Ctrl+N)"
        >
          <FilePlus className="w-3 h-3 text-[#388bff]" />
          <span>Nuevo</span>
        </button>

        <div className="h-3.5 w-px bg-[#3e3e3e] mx-1" />

        {/* Export SVG */}
        <button
          onClick={onExportSVG}
          className="px-2.5 py-1 rounded bg-[#333333] hover:bg-[#3e3e3e] text-white font-medium transition text-xs flex items-center space-x-1"
          title="Exportar archivo SVG vectorial editable para Adobe Illustrator / Figma"
        >
          <Download className="w-3 h-3 text-[#388bff]" />
          <span>SVG</span>
        </button>

        {/* Export PNG */}
        <button
          onClick={onExportPNG}
          className="px-2.5 py-1 rounded bg-[#0d66d0] hover:bg-[#1070e5] text-white font-semibold transition text-xs flex items-center space-x-1 shadow-sm"
          title="Exportar archivo de alta resolución a 300 DPI"
        >
          <ImageIcon className="w-3 h-3" />
          <span>PNG 300 DPI</span>
        </button>

      </div>

    </div>
  );
};
