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

    // Custom styling for object control handles (Adobe Illustrator style)
    fabric.Object.prototype.set({
      cornerColor: '#ffffff',
      cornerStrokeColor: '#0078d4',
      cornerSize: 8,
      cornerStyle: 'rect',
      transparentCorners: false,
      borderColor: '#0078d4',
      borderScaleFactor: 1.2,
      borderDashArray: [3, 3],
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
    if (activeTool === 'pen') {
      fabricCanvas.isDrawingMode = true;
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.width = 3;
        fabricCanvas.freeDrawingBrush.color = brand.colors.primary || '#0d66d0';
      }
      fabricCanvas.defaultCursor = 'crosshair';
    } else {
      fabricCanvas.isDrawingMode = false;
      if (activeTool === 'text') {
        fabricCanvas.defaultCursor = 'text';
      } else if (activeTool === 'shape-rect' || activeTool === 'shape-circle' || activeTool === 'line') {
        fabricCanvas.defaultCursor = 'crosshair';
      } else {
        fabricCanvas.defaultCursor = 'default';
      }
    }
  }, [activeTool, fabricCanvas, brand.colors.primary]);

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
    <main className="flex-1 relative flex flex-col items-center justify-center p-6 overflow-auto bg-[#1a1a1a] select-none">
      
      {/* THE FABRIC.JS ARTBOARD CONTAINER (CLEAN, NO FLOATING CLUTTER) */}
      <div 
        className="relative shadow-2xl rounded-sm overflow-hidden border border-[#3e3e3e] shrink-0 transition-all duration-200"
        style={{
          width: `${Math.round(docConfig.width * effectiveZoom)}px`,
          height: `${Math.round(docConfig.height * effectiveZoom)}px`,
        }}
      >
        <canvas ref={canvasElRef} />
      </div>

      {/* BOTTOM STATUS BAR (ADOBE ILLUSTRATOR SIGNATURE) */}
      <div className="mt-3 text-[11px] text-zinc-400 font-medium flex items-center justify-between bg-[#242424] px-4 py-1.5 rounded border border-[#333333] shadow-md w-auto max-w-full space-x-6">
        
        {/* Left: Zoom Controller */}
        <div className="flex items-center space-x-1.5 border-r border-[#3a3a3a] pr-4">
          <button 
            onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.1))} 
            className="p-1 rounded hover:bg-[#333333] text-zinc-400 hover:text-white transition"
            title="Reducir Zoom (Ctrl -)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setZoomLevel(1)}
            className="font-mono text-zinc-200 hover:text-white px-2 py-0.5 rounded hover:bg-[#333333] text-[11px] font-bold min-w-[50px] text-center transition"
            title="Clic para 100% (Tamaño Real)"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          <button 
            onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.1))} 
            className="p-1 rounded hover:bg-[#333333] text-zinc-400 hover:text-white transition"
            title="Aumentar Zoom (Ctrl +)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Document Dimensions & Color Profile */}
        <div className="flex items-center space-x-2 text-zinc-300">
          <span className="text-white font-semibold">{docConfig.title}</span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-zinc-300">{docConfig.width} × {docConfig.height} px</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300 font-medium">{docConfig.colorMode}</span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-zinc-400">{docConfig.dpi} DPI</span>
        </div>

        {/* Right: Quick Hint */}
        <div className="text-[10px] text-zinc-500 hidden md:block pl-2 border-l border-[#3a3a3a]">
          {selectedObject ? 'Objeto seleccionado • Usa las herramientas de arriba' : 'Doble clic en texto para editar'}
        </div>

      </div>

    </main>
  );
};
