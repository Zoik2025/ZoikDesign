import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import type { BrandKit, DocumentConfig, EditorTool } from '../types';
import { removeImageBackground } from '../services/backgroundRemover';
import { 
  Image as ImageIcon, Type, Square, Circle, 
  Trash2, MoveUp, MoveDown, Wand2, ZoomIn, ZoomOut 
} from 'lucide-react';

interface InteractiveDesignCanvasProps {
  brand: BrandKit;
  docConfig: DocumentConfig;
  activeTool?: EditorTool;
  onSelectTool?: (tool: EditorTool) => void;
  onObjectSelected: (obj: fabric.Object | null) => void;
  canvasRefOut: React.MutableRefObject<fabric.Canvas | null>;
}

export const InteractiveDesignCanvas: React.FC<InteractiveDesignCanvasProps> = ({
  brand,
  docConfig,
  activeTool = 'select',
  onSelectTool,
  onObjectSelected,
  canvasRefOut,
}) => {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const activeToolRef = useRef<EditorTool>(activeTool);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Calculate container scaling to fit artboard comfortably in view
  const maxViewHeight = 560;
  const maxViewWidth = 720;
  let baseScale = 1;
  if (docConfig.height > maxViewHeight || docConfig.width > maxViewWidth) {
    baseScale = Math.min(maxViewHeight / docConfig.height, maxViewWidth / docConfig.width);
  }
  const effectiveZoom = baseScale * zoomLevel;

  // Initialize Fabric Canvas once
  useEffect(() => {
    if (!canvasElRef.current) return;

    const initialZoom = baseScale * zoomLevel;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: Math.round(docConfig.width * initialZoom),
      height: Math.round(docConfig.height * initialZoom),
      backgroundColor: docConfig.colorMode === 'CMYK' ? '#ffffff' : (brand.colors.backgroundDark || '#141416'),
      preserveObjectStacking: true,
      selection: true,
    });
    canvas.setZoom(initialZoom);

    // Custom styling for object control handles (Illustrator Purple style)
    fabric.Object.prototype.set({
      cornerColor: '#a855f7',
      cornerStrokeColor: '#ffffff',
      cornerSize: 9,
      cornerStyle: 'circle',
      transparentCorners: false,
      borderColor: '#a855f7',
      borderScaleFactor: 1.5,
      borderDashArray: [4, 4],
    });

    // Selection listeners
    canvas.on('selection:created', (e) => {
      const active = e.selected?.[0] || null;
      setSelectedObject(active);
      onObjectSelected(active);
    });

    canvas.on('selection:updated', (e) => {
      const active = e.selected?.[0] || null;
      setSelectedObject(active);
      onObjectSelected(active);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      onObjectSelected(null);
    });

    // Tool click placement handler (Illustrator-style click to create text/shape)
    canvas.on('mouse:down', (opt) => {
      const currentTool = activeToolRef.current;
      if (!currentTool || currentTool === 'select') return;

      // If clicked on an existing object, let normal selection handle it
      if (opt.target) return;

      const pointer = canvas.getPointer(opt.e);

      if (currentTool === 'text') {
        const text = new fabric.IText('Escribe tu texto...', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 32,
          fontWeight: '800',
          fill: brand.colors.textPrimary,
          fontFamily: brand.typography.headlineFont,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        canvas.renderAll();
        onSelectTool?.('select');
      } else if (currentTool === 'shape-rect') {
        const rect = new fabric.Rect({
          left: pointer.x - 75,
          top: pointer.y - 45,
          width: 150,
          height: 90,
          rx: 10,
          ry: 10,
          fill: brand.colors.primary,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        onSelectTool?.('select');
      } else if (currentTool === 'shape-circle') {
        const circle = new fabric.Circle({
          left: pointer.x - 45,
          top: pointer.y - 45,
          radius: 45,
          fill: brand.colors.accent,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
        onSelectTool?.('select');
      }
    });

    // Keyboard Shortcuts (Delete / Backspace to remove object)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText(canvas)) {
        const active = canvas.getActiveObject();
        if (active) {
          canvas.remove(active);
          canvas.discardActiveObject();
          canvas.renderAll();
          setSelectedObject(null);
          onObjectSelected(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Clipboard Paste Listener (Ctrl+V to paste image directly on canvas)
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                addImageToCanvas(canvas, event.target.result as string);
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);

    setFabricCanvas(canvas);
    canvasRefOut.current = canvas;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
      canvas.dispose();
    };
  }, []);

  // Update canvas dimensions, zoom, or background when config changes
  useEffect(() => {
    if (!fabricCanvas) return;
    const currentZoom = baseScale * zoomLevel;
    fabricCanvas.setZoom(currentZoom);
    fabricCanvas.setDimensions({
      width: Math.round(docConfig.width * currentZoom),
      height: Math.round(docConfig.height * currentZoom),
    });
    const bgColor = docConfig.colorMode === 'CMYK' ? '#ffffff' : (brand.colors.backgroundDark || '#141416');
    fabricCanvas.setBackgroundColor(bgColor, fabricCanvas.renderAll.bind(fabricCanvas));
    fabricCanvas.calcOffset();
    fabricCanvas.renderAll();
  }, [docConfig.width, docConfig.height, docConfig.colorMode, brand.colors.backgroundDark, baseScale, zoomLevel, fabricCanvas]);

  // Sync cursor and activeToolRef with activeTool
  useEffect(() => {
    activeToolRef.current = activeTool;
    if (!fabricCanvas) return;
    if (activeTool === 'text') {
      fabricCanvas.defaultCursor = 'text';
    } else if (activeTool === 'shape-rect' || activeTool === 'shape-circle') {
      fabricCanvas.defaultCursor = 'crosshair';
    } else {
      fabricCanvas.defaultCursor = 'default';
    }
  }, [activeTool, fabricCanvas]);

  function isEditingText(canvas: fabric.Canvas): boolean {
    const active = canvas.getActiveObject();
    return Boolean(active && (active as any).isEditing);
  }

  // ADD IMAGE HELPER
  function addImageToCanvas(canvas: fabric.Canvas, src: string) {
    fabric.Image.fromURL(src, (img) => {
      img.scaleToWidth(docConfig.width * 0.45);
      img.set({
        left: docConfig.width * 0.28,
        top: docConfig.height * 0.28,
        selectable: true,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  }

  // TOOL ACTIONS
  const handleAddText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.IText('Nuevo Texto', {
      left: docConfig.width * 0.35,
      top: docConfig.height * 0.45,
      fontSize: Math.round(docConfig.width * 0.04),
      fontWeight: '700',
      fill: brand.colors.textPrimary,
      fontFamily: brand.typography.headlineFont,
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    fabricCanvas.renderAll();
  };

  const handleAddRect = () => {
    if (!fabricCanvas) return;
    const rect = new fabric.Rect({
      left: docConfig.width * 0.35,
      top: docConfig.height * 0.45,
      width: Math.round(docConfig.width * 0.25),
      height: Math.round(docConfig.height * 0.15),
      rx: 10,
      ry: 10,
      fill: brand.colors.primary,
    });
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    fabricCanvas.renderAll();
  };

  const handleAddCircle = () => {
    if (!fabricCanvas) return;
    const radius = Math.round(docConfig.width * 0.08);
    const circle = new fabric.Circle({
      left: docConfig.width * 0.35,
      top: docConfig.height * 0.45,
      radius,
      fill: brand.colors.accent,
    });
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
    fabricCanvas.renderAll();
  };

  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fabricCanvas || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        addImageToCanvas(fabricCanvas, event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // PHOTOSHOP MAGIC CUTOUT: REMOVE BACKGROUND
  const handleRemoveBackground = async () => {
    if (!fabricCanvas || !selectedObject || selectedObject.type !== 'image') return;
    const imgObj = selectedObject as fabric.Image;
    const domImg = imgObj.getElement() as HTMLImageElement;

    if (!domImg) return;

    setIsRemovingBg(true);
    try {
      const cutoutDataUrl = await removeImageBackground(domImg, 32);
      
      // Replace image source on canvas
      imgObj.setSrc(cutoutDataUrl, () => {
        fabricCanvas.renderAll();
        setIsRemovingBg(false);
      });
    } catch (err) {
      console.error('Error al quitar fondo:', err);
      setIsRemovingBg(false);
    }
  };

  const handleDeleteSelected = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.remove(selectedObject);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    setSelectedObject(null);
    onObjectSelected(null);
  };

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

  return (
    <main className="flex-1 relative flex flex-col items-center justify-center p-6 overflow-auto bg-[#101012] select-none">
      
      {/* FLOATING WORKSTATION CONTEXT TOOLBAR */}
      <div className="absolute top-4 bg-[#18181b]/95 backdrop-blur-md border border-[#27272a] rounded-xl px-3 py-1.5 flex items-center space-x-2 shadow-2xl z-20 text-xs">
        
        {/* ADD TEXT */}
        <button
          onClick={handleAddText}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition"
          title="Añadir Texto Editable al Lienzo (T)"
        >
          <Type className="w-3.5 h-3.5 text-purple-400" />
          <span>+ Texto</span>
        </button>

        {/* UPLOAD / PASTE IMAGE */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleUploadImageFile}
          className="hidden"
        />
        <button
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition"
          title="Subir o pegar imagen de tu PC (Ctrl+V)"
        >
          <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>+ Imagen</span>
        </button>

        {/* SHAPES */}
        <button
          onClick={handleAddRect}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
          title="Añadir Rectángulo"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleAddCircle}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
          title="Añadir Círculo"
        >
          <Circle className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-zinc-700 mx-1" />

        {/* ACTIONS ON SELECTED OBJECT */}
        {selectedObject && (
          <>
            {selectedObject.type === 'image' && (
              <button
                onClick={handleRemoveBackground}
                disabled={isRemovingBg}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-md shadow-purple-600/30"
                title="Quitar fondo de la imagen automáticamente (Photoshop Cutout)"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isRemovingBg ? 'Recortando...' : '🪄 Quitar Fondo'}</span>
              </button>
            )}

            <button
              onClick={handleBringForward}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800"
              title="Traer capa adelante"
            >
              <MoveUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSendBackward}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800"
              title="Enviar capa atrás"
            >
              <MoveDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteSelected}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40"
              title="Eliminar elemento (Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-zinc-700 mx-1" />
          </>
        )}

        {/* ZOOM */}
        <div className="flex items-center space-x-1 text-zinc-400">
          <button onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))} className="p-1 hover:text-white">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-white text-[11px] font-bold w-10 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button onClick={() => setZoomLevel(prev => Math.min(1.8, prev + 0.1))} className="p-1 hover:text-white">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* THE FABRIC.JS ARTBOARD CONTAINER */}
      <div 
        className="relative shadow-2xl rounded-xl overflow-hidden border-2 border-[#27272a] hover:border-purple-500/50 shrink-0 transition-all duration-200"
        style={{
          width: `${Math.round(docConfig.width * effectiveZoom)}px`,
          height: `${Math.round(docConfig.height * effectiveZoom)}px`,
        }}
      >
        <canvas ref={canvasElRef} />
      </div>

      {/* BOTTOM STATUS BAR (ILLUSTRATOR STYLE) */}
      <div className="mt-3 text-[11px] text-zinc-400 font-medium flex items-center space-x-2.5 bg-[#18181b] px-4 py-1.5 rounded-full border border-[#27272a] shadow">
        <span className="text-white font-bold">{docConfig.title}</span>
        <span>•</span>
        <span className="font-mono">{docConfig.displayValueWidth} × {docConfig.displayValueHeight} {docConfig.unit}</span>
        <span>•</span>
        <span className="text-purple-400 font-bold">{docConfig.colorMode}</span>
        <span>•</span>
        <span className="font-mono">{docConfig.dpi} DPI</span>
        <span>•</span>
        <span className="text-zinc-500">Haz doble clic en cualquier texto para escribir</span>
      </div>

    </main>
  );
};
