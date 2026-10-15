import React, { useRef, useState, useEffect } from 'react';
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
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  Scissors, Upload, FilePlus, Eraser,
  FlipHorizontal, FlipVertical, RotateCw, Wand2
} from 'lucide-react';
import { flipHorizontal, flipVertical, rotate90, PHOTOSHOP_BLEND_MODES } from '../services/photoshopImageFilters';

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

  // Transform coordinates (X, Y, W, H) in px
  const [objX, setObjX] = useState<number>(0);
  const [objY, setObjY] = useState<number>(0);
  const [objW, setObjW] = useState<number>(0);
  const [objH, setObjH] = useState<number>(0);

  // Sync transform metrics when selected object changes or moves
  useEffect(() => {
    if (!selectedObject) return;
    const updateMetrics = () => {
      setObjX(Math.round(selectedObject.left || 0));
      setObjY(Math.round(selectedObject.top || 0));
      setObjW(Math.round(selectedObject.getScaledWidth() || 0));
      setObjH(Math.round(selectedObject.getScaledHeight() || 0));
    };

    updateMetrics();

    if (fabricCanvas) {
      fabricCanvas.on('object:moving', updateMetrics);
      fabricCanvas.on('object:scaling', updateMetrics);
      fabricCanvas.on('object:modified', updateMetrics);
    }

    return () => {
      if (fabricCanvas) {
        fabricCanvas.off('object:moving', updateMetrics);
        fabricCanvas.off('object:scaling', updateMetrics);
        fabricCanvas.off('object:modified', updateMetrics);
      }
    };
  }, [selectedObject, fabricCanvas]);

  // Identify selected object type
  const isText = selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text');
  const isImage = selectedObject && (selectedObject.type === 'image');
  const isShape = selectedObject && (selectedObject.type === 'rect' || selectedObject.type === 'circle' || selectedObject.type === 'group' || selectedObject.type === 'path');

  // Object-specific values
  const textObj = isText ? (selectedObject as fabric.IText) : null;
  const currentFont = textObj ? textObj.fontFamily || brand.typography.headlineFont : brand.typography.headlineFont;
  const currentFontSize = textObj ? Math.round(textObj.fontSize || 32) : 32;
  const currentFontWeight = textObj ? String(textObj.fontWeight || '700') : '700';
  const currentFill = selectedObject ? String(selectedObject.fill || '#ffffff') : '#ffffff';
  const currentStroke = selectedObject ? String(selectedObject.stroke || '#000000') : '#000000';
  const currentStrokeWidth = selectedObject ? Number(selectedObject.strokeWidth || 0) : 0;
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
    const newSize = Math.max(8, Math.min(300, (textObj.fontSize || 32) + delta));
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

  const handleStrokeColorChange = (color: string) => {
    if (!selectedObject || !fabricCanvas) return;
    selectedObject.set('stroke', color);
    if (!selectedObject.strokeWidth) {
      selectedObject.set('strokeWidth', 2);
    }
    fabricCanvas.renderAll();
  };

  const handleStrokeWidthChange = (delta: number) => {
    if (!selectedObject || !fabricCanvas) return;
    const current = selectedObject.strokeWidth || 0;
    const nextW = Math.max(0, Math.min(60, current + delta));
    selectedObject.set('strokeWidth', nextW);
    fabricCanvas.renderAll();
  };

  const handleOpacityChange = (newVal: number) => {
    if (!selectedObject || !fabricCanvas) return;
    selectedObject.set('opacity', Math.max(0, Math.min(100, newVal)) / 100);
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

  // Illustrator Alignment Operators
  const handleAlign = (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
    if (!selectedObject || !fabricCanvas) return;
    const artW = docConfig.width;
    const artH = docConfig.height;

    switch (type) {
      case 'left':
        selectedObject.set('left', 0);
        break;
      case 'center-h':
        selectedObject.centerH();
        break;
      case 'right':
        selectedObject.set('left', artW - selectedObject.getScaledWidth());
        break;
      case 'top':
        selectedObject.set('top', 0);
        break;
      case 'center-v':
        selectedObject.centerV();
        break;
      case 'bottom':
        selectedObject.set('top', artH - selectedObject.getScaledHeight());
        break;
    }
    selectedObject.setCoords();
    fabricCanvas.renderAll();
  };

  // Transform input adjustments (X, Y, W, H)
  const handleSetX = (val: number) => {
    if (!selectedObject || !fabricCanvas) return;
    selectedObject.set('left', val);
    selectedObject.setCoords();
    fabricCanvas.renderAll();
  };

  const handleSetY = (val: number) => {
    if (!selectedObject || !fabricCanvas) return;
    selectedObject.set('top', val);
    selectedObject.setCoords();
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
      }, { crossOrigin: 'anonymous' });
    } catch (err) {
      console.error('Error recortando fondo:', err);
    } finally {
      setIsProcessingBg(false);
    }
  };

  // Layer ordering and duplication
  const handleBringForward = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.bringForward(selectedObject);
    fabricCanvas.renderAll();
  };

  const handleSendBackward = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.sendBackwards(selectedObject);
    fabricCanvas.renderAll();
  };

  const handleDuplicate = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 30,
        top: (cloned.top || 0) + 30,
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
    });
  };

  const handleDelete = () => {
    if (!fabricCanvas || !selectedObject) return;
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

  return (
    <div className="h-10 bg-[#242424] border-b border-[#333333] flex items-center justify-between px-3 text-xs select-none z-20 shrink-0 text-[#d4d4d8]">
      
      {/* LEFT: CONTEXT-SENSITIVE CONTROLS (ADOBE ILLUSTRATOR CONTROL STRIP) */}
      <div className="flex items-center space-x-2.5 overflow-x-auto custom-scroll py-0.5">
        
        {/* ============================================================== */}
        {/* CASE 1: TEXT SELECTED */}
        {/* ============================================================== */}
        {isText && (
          <div className="flex items-center space-x-2">
            
            {/* Swatches: Fill & Stroke (Classic Illustrator Popovers) */}
            <div className="flex items-center space-x-1 border-r border-[#3a3a3a] pr-2">
              <label 
                className="w-5 h-5 rounded-sm border border-[#555555] cursor-pointer shadow-sm relative overflow-hidden"
                style={{ backgroundColor: currentFill }}
                title={`Color de Relleno: ${currentFill}`}
              >
                <input 
                  type="color" 
                  value={currentFill.startsWith('#') ? currentFill : '#ffffff'} 
                  onChange={(e) => handleColorChange(e.target.value)} 
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>

              <label 
                className="w-5 h-5 rounded-sm border-2 cursor-pointer shadow-sm relative overflow-hidden bg-transparent"
                style={{ borderColor: currentStroke }}
                title={`Color de Trazo: ${currentStroke}`}
              >
                <input 
                  type="color" 
                  value={currentStroke.startsWith('#') ? currentStroke : '#000000'} 
                  onChange={(e) => handleStrokeColorChange(e.target.value)} 
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>

              <div className="flex items-center bg-[#1a1a1a] border border-[#3e3e3e] rounded px-1 py-0.5 text-[10px] font-mono text-zinc-300 ml-1">
                <span>{currentStrokeWidth} pt</span>
              </div>
            </div>

            {/* Typography Engine */}
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Carácter:
            </span>

            {/* Font selector */}
            <select
              value={currentFont}
              onChange={(e) => handleFontChange(e.target.value)}
              className="bg-[#1a1a1a] border border-[#3e3e3e] text-white px-2 py-1 rounded text-xs focus:outline-none focus:border-[#0d66d0] max-w-[140px] truncate"
            >
              <option value={brand.typography.headlineFont}>★ {brand.typography.headlineFont} (Marca)</option>
              <optgroup label="Fuentes del Sistema (PC)">
                {localPcFonts.slice(0, 15).map(f => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label="Google Fonts Pro">
                {FONT_CATALOG.map(f => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </optgroup>
            </select>

            {/* Weight selector */}
            <select
              value={currentFontWeight}
              onChange={(e) => handleFontWeightChange(e.target.value)}
              className="bg-[#1a1a1a] border border-[#3e3e3e] text-white px-1.5 py-1 rounded text-[11px] focus:outline-none"
            >
              <option value="400">Regular</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
              <option value="800">ExtraBold</option>
              <option value="900">Black</option>
            </select>

            {/* Font size stepper */}
            <div className="flex items-center bg-[#1a1a1a] border border-[#3e3e3e] rounded overflow-hidden">
              <button 
                onClick={() => handleFontSizeChange(-2)} 
                className="px-1.5 py-1 hover:bg-[#333333] text-zinc-400 hover:text-white"
                title="Reducir tamaño"
              >
                -
              </button>
              <span className="px-1.5 font-mono text-[11px] text-white min-w-[28px] text-center">
                {currentFontSize} pt
              </span>
              <button 
                onClick={() => handleFontSizeChange(2)} 
                className="px-1.5 py-1 hover:bg-[#333333] text-zinc-400 hover:text-white"
                title="Aumentar tamaño"
              >
                +
              </button>
            </div>

            {/* Alignments */}
            <div className="flex items-center bg-[#1a1a1a] border border-[#3e3e3e] rounded">
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

            {/* Caps Toggle */}
            <button
              onClick={handleToggleCase}
              className="px-2 py-1 rounded bg-[#1a1a1a] border border-[#3e3e3e] hover:bg-[#333333] text-[11px] font-semibold text-zinc-300 transition"
              title="Alternar Mayúsculas / Minúsculas"
            >
              Aa
            </button>

            {/* Opacity */}
            <div className="flex items-center space-x-1 pl-1 text-[11px] text-zinc-400 font-mono">
              <span>Opacidad:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={currentOpacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-12 bg-[#1a1a1a] border border-[#3e3e3e] text-white px-1 py-0.5 rounded text-[11px] text-center focus:outline-none"
              />
              <span>%</span>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 2: SHAPE OR VECTOR GROUP SELECTED */}
        {/* ============================================================== */}
        {isShape && !isText && (
          <div className="flex items-center space-x-2.5">
            
            {/* Fill & Stroke Swatches */}
            <div className="flex items-center space-x-1 border-r border-[#3a3a3a] pr-2.5">
              <span className="text-[10px] text-zinc-400 font-bold uppercase mr-1">Relleno:</span>
              <label 
                className="w-5 h-5 rounded-sm border border-[#555555] cursor-pointer shadow-sm relative overflow-hidden"
                style={{ backgroundColor: currentFill }}
                title={`Color de Relleno: ${currentFill}`}
              >
                <input 
                  type="color" 
                  value={currentFill.startsWith('#') ? currentFill : '#ffffff'} 
                  onChange={(e) => handleColorChange(e.target.value)} 
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>

              <span className="text-[10px] text-zinc-400 font-bold uppercase ml-2 mr-1">Trazo:</span>
              <label 
                className="w-5 h-5 rounded-sm border-2 cursor-pointer shadow-sm relative overflow-hidden bg-transparent"
                style={{ borderColor: currentStroke }}
                title={`Color de Trazo: ${currentStroke}`}
              >
                <input 
                  type="color" 
                  value={currentStroke.startsWith('#') ? currentStroke : '#000000'} 
                  onChange={(e) => handleStrokeColorChange(e.target.value)} 
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>

              <div className="flex items-center bg-[#1a1a1a] border border-[#3e3e3e] rounded overflow-hidden ml-1">
                <button onClick={() => handleStrokeWidthChange(-1)} className="px-1 text-zinc-400 hover:text-white">-</button>
                <span className="px-1.5 font-mono text-[10px] text-zinc-200">{currentStrokeWidth} pt</span>
                <button onClick={() => handleStrokeWidthChange(1)} className="px-1 text-zinc-400 hover:text-white">+</button>
              </div>
            </div>

            {/* Vector Alignment Cluster */}
            <div className="flex items-center space-x-0.5 border-r border-[#3a3a3a] pr-2.5">
              <span className="text-[10px] text-zinc-400 font-bold uppercase mr-1">Alinear:</span>
              <button 
                onClick={() => handleAlign('left')} 
                className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white" 
                title="Alinear a la izquierda de la mesa"
              >
                <AlignHorizontalJustifyStart className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleAlign('center-h')} 
                className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white" 
                title="Centrar horizontalmente"
              >
                <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleAlign('right')} 
                className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white" 
                title="Alinear a la derecha"
              >
                <AlignHorizontalJustifyEnd className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleAlign('top')} 
                className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white" 
                title="Alinear arriba"
              >
                <AlignVerticalJustifyStart className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleAlign('center-v')} 
                className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white" 
                title="Centrar verticalmente"
              >
                <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleAlign('bottom')} 
                className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white" 
                title="Alinear abajo"
              >
                <AlignVerticalJustifyEnd className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Numeric Transform (X, Y, W, H) */}
            <div className="flex items-center space-x-1.5 font-mono text-[11px] text-zinc-400">
              <span className="text-zinc-500">X:</span>
              <input 
                type="number" 
                value={objX} 
                onChange={(e) => handleSetX(Number(e.target.value))}
                className="w-12 bg-[#1a1a1a] border border-[#3e3e3e] text-white px-1 py-0.5 rounded text-[11px] text-center focus:outline-none" 
              />
              <span className="text-zinc-500">Y:</span>
              <input 
                type="number" 
                value={objY} 
                onChange={(e) => handleSetY(Number(e.target.value))}
                className="w-12 bg-[#1a1a1a] border border-[#3e3e3e] text-white px-1 py-0.5 rounded text-[11px] text-center focus:outline-none" 
              />
              <span className="text-zinc-500">W:</span>
              <span className="text-zinc-200">{objW}px</span>
              <span className="text-zinc-500">H:</span>
              <span className="text-zinc-200">{objH}px</span>
            </div>

            {/* Opacity */}
            <div className="flex items-center space-x-1 pl-1 text-[11px] text-zinc-400 font-mono">
              <span className="text-zinc-500">Opacidad:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={currentOpacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-11 bg-[#1a1a1a] border border-[#3e3e3e] text-white px-1 py-0.5 rounded text-[11px] text-center focus:outline-none"
              />
              <span>%</span>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* ============================================================== */}
        {/* CASE 3: IMAGE SELECTED (PHOTOSHOP SUITE INTEGRATION) */}
        {/* ============================================================== */}
        {isImage && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center space-x-1 border-r border-[#3a3a3a] pr-2">
              <span className="w-4 h-4 rounded bg-[#001e36] border border-[#0094ff] flex items-center justify-center font-bold text-[#0094ff] text-[8px] mr-1">
                Ps
              </span>
              <span>Imagen</span>
            </span>

            {/* Replace image */}
            <input 
              ref={replaceImageInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleReplaceImageFile} 
            />
            <button
              onClick={() => replaceImageInputRef.current?.click()}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-[#1a1a1a] hover:bg-[#333333] border border-[#3e3e3e] text-[11px] font-medium text-white transition"
              title="Cambiar imagen"
            >
              <Upload className="w-3 h-3 text-[#388bff]" />
              <span>Cambiar...</span>
            </button>

            {/* Remove background */}
            <button
              onClick={handleRemoveImageBg}
              disabled={isProcessingBg}
              className={`flex items-center space-x-1 px-2 py-1 rounded border border-[#3e3e3e] text-[11px] font-medium transition ${
                isProcessingBg 
                  ? 'bg-[#333333] text-zinc-400 cursor-not-allowed' 
                  : 'bg-[#1a1a1a] hover:bg-[#333333] text-white'
              }`}
              title="Eliminar fondo blanco o sólido automáticamente"
            >
              <Wand2 className="w-3 h-3 text-[#388bff]" />
              <span>{isProcessingBg ? 'Recortando...' : 'Quitar Fondo'}</span>
            </button>

            {/* Photoshop Blend Mode Selector */}
            <div className="flex items-center space-x-1 border-l border-[#3a3a3a] pl-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">Modo:</span>
              <select
                value={selectedObject.globalCompositeOperation || 'source-over'}
                onChange={(e) => {
                  selectedObject.set('globalCompositeOperation', e.target.value);
                  fabricCanvas?.renderAll();
                }}
                className="bg-[#1a1a1a] border border-[#3e3e3e] text-white px-2 py-1 rounded text-[11px] focus:outline-none"
                title="Modo de fusión de Photoshop (Blending Mode)"
              >
                {PHOTOSHOP_BLEND_MODES.map(bm => (
                  <option key={bm.value} value={bm.value}>{bm.label}</option>
                ))}
              </select>
            </div>

            {/* Photoshop Flip & Rotate Tools */}
            <div className="flex items-center space-x-0.5 border-l border-[#3a3a3a] pl-2">
              <button
                onClick={() => flipHorizontal(selectedObject as fabric.Image, fabricCanvas)}
                className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white"
                title="Voltear Horizontal (Flip H)"
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-[#388bff]" />
              </button>
              <button
                onClick={() => flipVertical(selectedObject as fabric.Image, fabricCanvas)}
                className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white"
                title="Voltear Vertical (Flip V)"
              >
                <FlipVertical className="w-3.5 h-3.5 text-[#388bff]" />
              </button>
              <button
                onClick={() => rotate90(selectedObject as fabric.Image, fabricCanvas)}
                className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white"
                title="Girar 90°"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {/* Alignment for image */}
            <div className="flex items-center space-x-0.5 border-l border-[#3a3a3a] pl-2">
              <button onClick={() => handleAlign('center-h')} className="p-1 rounded hover:bg-[#333333] text-zinc-300" title="Centrar horizontalmente">
                <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleAlign('center-v')} className="p-1 rounded hover:bg-[#333333] text-zinc-300" title="Centrar verticalmente">
                <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Opacity */}
            <div className="flex items-center space-x-1 pl-2 border-l border-[#3a3a3a] text-[11px] text-zinc-400 font-mono">
              <span className="text-zinc-500">Opacidad:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={currentOpacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-11 bg-[#1a1a1a] border border-[#3e3e3e] text-white px-1 py-0.5 rounded text-[11px] text-center focus:outline-none"
              />
              <span>%</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 4: NOTHING SELECTED (ARTBOARD CANVAS SETTINGS) */}
        {/* ============================================================== */}
        {!selectedObject && (
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Mesa:</span>
              <select
                value={
                  CANVAS_FORMATS.find(f => f.width === docConfig.width && f.height === docConfig.height)?.id || 'custom'
                }
                onChange={(e) => handleFormatSelect(e.target.value)}
                className="bg-[#1a1a1a] border border-[#3e3e3e] text-white px-2.5 py-1 rounded text-xs focus:outline-none"
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
              <span className="text-zinc-200 font-semibold">{docConfig.width} × {docConfig.height} px</span>
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
              title="Duplicar capa seleccionada (Ctrl+D)"
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
