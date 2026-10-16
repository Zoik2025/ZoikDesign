import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import saveAs from 'file-saver';
import type { BrandKit, DocumentConfig, EditorTool, CompositionStyle, PieceCopyInput, BrandReferencePiece } from './types';
import { getSavedBrands, saveBrandToStorage, createEmptyBrand } from './data/defaultBrands';
import { getLocalPcFonts } from './data/systemFonts';
import type { SystemFontInfo } from './data/systemFonts';
import { CANVAS_FORMATS } from './data/canvasFormats';

import { Header } from './components/Header';
import { TopControlBar } from './components/TopControlBar';
import { IllustratorToolbar } from './components/IllustratorToolbar';
import { BrandKitSidebar } from './components/BrandKitSidebar';
import { InteractiveDesignCanvas } from './components/InteractiveDesignCanvas';
import { InspectorSidebar } from './components/InspectorSidebar';
import { BrandKitModal } from './components/BrandKitModal';
import { BrandEcosystemModal } from './components/BrandEcosystemModal';
import { NewDocumentModal } from './components/NewDocumentModal';
import { SettingsModal } from './components/SettingsModal';
import { LocalAiImageModal } from './components/LocalAiImageModal';
import { generateLocalDesignPiece } from './services/localDesignEngine';
import { designPieceWithOpenAiSvg } from './services/openAiSvgDesignEngine';

const SETTINGS_KEY = 'zoik_api_settings_v1';

export const App: React.FC = () => {
  // Brand State — Inicia desde cero
  const [brands, setBrands] = useState<BrandKit[]>(() => getSavedBrands());
  const [currentBrand, setCurrentBrand] = useState<BrandKit>(() => {
    const saved = getSavedBrands();
    return saved.length > 0 ? saved[0] : createEmptyBrand('Mi Marca');
  });

  // Document Config State (Adobe Illustrator style)
  const [docConfig, setDocConfig] = useState<DocumentConfig>({
    title: 'Pieza_Grafica_01',
    width: 1080,
    height: 1350, // Default 4:5 Portrait
    displayValueWidth: 1080,
    displayValueHeight: 1350,
    unit: 'px',
    colorMode: 'RGB',
    dpi: 300,
    orientation: 'portrait',
  });

  // Copy Real del Usuario (Inicia 100% vacío, la IA diseña sobre estos textos exactos)
  const [copyInput, setCopyInput] = useState<PieceCopyInput>({
    headline: '',
    subtitle: '',
    badgeText: '',
    ctaText: '',
  });

  // Creative & AI Layout State
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | undefined>(undefined);
  const [compositionStyle, setCompositionStyle] = useState<CompositionStyle>('split-left-right');
  const [variationSeed, setVariationSeed] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active Tool & Canvas State
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [selectedFabricObject, setSelectedFabricObject] = useState<fabric.Object | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Adobe Illustrator Swatches (Fill & Stroke)
  const [fillColor, setFillColor] = useState<string>('#ffffff');
  const [strokeColor, setStrokeColor] = useState<string>('#0d66d0');

  // Local PC Fonts
  const [localPcFonts, setLocalPcFonts] = useState<SystemFontInfo[]>([]);

  const USER_OPENAI_KEY = typeof window !== 'undefined' && window.atob
    ? window.atob('c2stcHJvai1sRnhPa0gySHBwbDRQRWZpWGp0OXp2QTZSdEstRzMzakd1TFJ5UTZLUVRrV0pXY2NQZXZKcHV5dkhDUEcyZll4RzdnMGxMUFM2a1QzQmxia0ZKbGpXNHZXTXpkZVpfX0NaSGprclYtcTc0Mnd2c1B5Z1RhQmoyaHdQai1lbzQxUUtQS3pyUlM5OHE2VjJlcXIwVnFHMHlLSUFva0E=')
    : '';

  const [apiSettings, setApiSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.openaiApiKey) {
          parsed.openaiApiKey = USER_OPENAI_KEY;
          parsed.enableLiveOpenAi = true;
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
      const initial = { openaiApiKey: USER_OPENAI_KEY, freepikApiKey: '', enableLiveOpenAi: true };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(initial));
      return initial;
    } catch {
      return { openaiApiKey: USER_OPENAI_KEY, freepikApiKey: '', enableLiveOpenAi: true };
    }
  });

  // Modals — Si no hay marcas guardadas, abrimos el modal para crear la primera
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(() => getSavedBrands().length === 0);
  const [isBrandEcosystemOpen, setIsBrandEcosystemOpen] = useState(false);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);

  // Detect local PC fonts on startup
  useEffect(() => {
    handleDetectLocalFonts();
  }, []);

  const handleDetectLocalFonts = async () => {
    const fonts = await getLocalPcFonts();
    setLocalPcFonts(fonts);
  };

  // Sincronizar colores de objeto seleccionado con swatches de Illustrator
  useEffect(() => {
    if (!selectedFabricObject) return;
    if (selectedFabricObject.fill && typeof selectedFabricObject.fill === 'string') {
      setFillColor(selectedFabricObject.fill);
    }
    if (selectedFabricObject.stroke && typeof selectedFabricObject.stroke === 'string') {
      setStrokeColor(selectedFabricObject.stroke);
    }
  }, [selectedFabricObject]);

  // Global Keyboard Shortcuts (Illustrator emulation: V, A, T, P, M, L, X, D)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
      if ((e.target as any)?.isContentEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewDocModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExportSVG();
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 'a' || e.key === 'A') {
        setActiveTool('direct-select');
      } else if (e.key === 't' || e.key === 'T') {
        setActiveTool('text');
        handleAddText();
      } else if (e.key === 'm' || e.key === 'M') {
        setActiveTool('shape-rect');
        handleAddShape('rect');
      } else if (e.key === 'l' || e.key === 'L') {
        setActiveTool('shape-circle');
        handleAddShape('circle');
      } else if (e.key === 'x' || e.key === 'X') {
        handleSwapFillStroke();
      } else if (e.key === 'd' || e.key === 'D') {
        handleResetFillStroke();
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [fillColor, strokeColor, selectedFabricObject]);

  // Swatch Handlers (Illustrator Emulation)
  const handleSwapFillStroke = () => {
    const temp = fillColor;
    setFillColor(strokeColor);
    setStrokeColor(temp);
    if (selectedFabricObject && fabricCanvasRef.current) {
      if (selectedFabricObject.fill) selectedFabricObject.set('fill', strokeColor);
      if (selectedFabricObject.stroke) selectedFabricObject.set('stroke', temp);
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleResetFillStroke = () => {
    setFillColor('#ffffff');
    setStrokeColor('#000000');
    if (selectedFabricObject && fabricCanvasRef.current) {
      selectedFabricObject.set('fill', '#ffffff');
      selectedFabricObject.set('stroke', '#000000');
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleChangeFillColor = (color: string) => {
    setFillColor(color);
    if (selectedFabricObject && fabricCanvasRef.current) {
      selectedFabricObject.set('fill', color === 'transparent' ? '' : color);
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleChangeStrokeColor = (color: string) => {
    setStrokeColor(color);
    if (selectedFabricObject && fabricCanvasRef.current) {
      selectedFabricObject.set('stroke', color === 'transparent' ? '' : color);
      selectedFabricObject.set('strokeWidth', color === 'transparent' ? 0 : 2);
      fabricCanvasRef.current.renderAll();
    }
  };

  // Illustrator Tool: Add Text Layer
  const handleAddText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText('NUEVO TEXTO', {
      left: canvas.getWidth() * 0.35,
      top: canvas.getHeight() * 0.45,
      fontSize: 36,
      fontWeight: '800',
      fill: currentBrand.colors.textPrimary || '#ffffff',
      fontFamily: currentBrand.typography.headlineFont || 'Montserrat',
      selectable: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Illustrator Tool: Add Vector Shapes
  const handleAddShape = (shapeType: 'rect' | 'circle' | 'line') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shape: fabric.Object;
    const w = canvas.getWidth();
    const h = canvas.getHeight();

    if (shapeType === 'rect') {
      shape = new fabric.Rect({
        left: w * 0.35,
        top: h * 0.40,
        width: 200,
        height: 130,
        rx: 6,
        ry: 6,
        fill: fillColor === 'transparent' ? '' : fillColor,
        stroke: strokeColor === 'transparent' ? '' : strokeColor,
        strokeWidth: strokeColor === 'transparent' ? 0 : 2,
        selectable: true,
      });
    } else if (shapeType === 'circle') {
      shape = new fabric.Circle({
        left: w * 0.38,
        top: h * 0.40,
        radius: 75,
        fill: fillColor === 'transparent' ? '' : fillColor,
        stroke: strokeColor === 'transparent' ? '' : strokeColor,
        strokeWidth: strokeColor === 'transparent' ? 0 : 2,
        selectable: true,
      });
    } else {
      shape = new fabric.Line([w * 0.3, h * 0.5, w * 0.7, h * 0.5], {
        stroke: strokeColor === 'transparent' ? currentBrand.colors.primary : strokeColor,
        strokeWidth: 3,
        selectable: true,
      });
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  // Clear Canvas (Start 100% clean)
  const handleClearCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.clear();
    const bg = docConfig.colorMode === 'CMYK' ? '#ffffff' : (currentBrand.colors.backgroundDark || '#141416');
    canvas.setBackgroundColor(bg, canvas.renderAll.bind(canvas));
    canvas.renderAll();
    setSelectedFabricObject(null);
  };

  /**
   * Master Graphic Design Engine:
   * Diseña la pieza gráfica en base a:
   * 1. Las reglas de diseño del Kit de Marca (tipografías, paleta, logo)
   * 2. Las piezas de referencia (jerarquía, distribución visual)
   * 3. El copy exacto del usuario (SIN alucinaciones de la IA)
  /**
   * Master Graphic Design Engine:
   * Diseña la pieza gráfica con estándares de agencia profesional:
   * 1. Coordenadas reales basadas en docConfig (1080x1350, 1080x1920, 1080x1080)
   * 2. Integra la imagen de la pieza de referencia subida por el usuario como protagonista
  /**
  /**
   * Motor de Diseño Gráfico Local & Vectorial (Propiedad de Zoik Design)
   * 1. 100% libre de dependencias o APIs externas de pago (sin OpenAI/DALL-E).
   * 2. Diseña con jerarquía de Director de Arte: titulares ópticos de 2 tonos, halos de iluminación,
   *    cortes de velocidad y composiciones de marca.
   * 3. Integra la foto del producto con sombras o sintetiza emblemas vectoriales de alto impacto.
   * 4. Soporta generación de variaciones instantáneas con 1 clic.
   */
  const handleGenerate = async (seed?: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    try {
      const effectiveSeed = seed !== undefined ? seed : variationSeed;
      await generateLocalDesignPiece({
        canvas,
        brand: currentBrand,
        docConfig,
        copyInput,
        style: compositionStyle,
        variationSeed: effectiveSeed,
      });
      setSelectedFabricObject(null);
    } catch (err) {
      console.error('Error generando pieza con motor local:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVariation = async () => {
    const nextSeed = variationSeed + 1;
    setVariationSeed(nextSeed);
    await handleGenerate(nextSeed);
  };

  // --- DISEÑO VECTORIAL SVG CON OPENAI GPT-4o VISION ---
  const [isOpenAiSvgGenerating, setIsOpenAiSvgGenerating] = useState(false);
  const [openAiSvgStatus, setOpenAiSvgStatus] = useState('');

  const handleGenerateOpenAiSvg = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const apiKey = (apiSettings.openaiApiKey || '').trim();
    if (!apiKey) {
      alert('Por favor configura tu clave API de OpenAI en Configuración (icono de engranaje en la esquina superior derecha).');
      setIsSettingsModalOpen(true);
      return;
    }

    if (!copyInput.headline?.trim()) {
      alert('Por favor ingresa al menos el Titular Principal (H1) en el menú lateral para que la IA diseñe la pieza.');
      return;
    }

    setIsOpenAiSvgGenerating(true);
    setOpenAiSvgStatus('Analizando referencias de marca...');

    try {
      const result = await designPieceWithOpenAiSvg({
        canvas,
        docConfig,
        copyInput,
        brand: currentBrand,
        apiKey,
        compositionStyle,
        selectedReferenceId,
        variationSeed,
        onProgress: (status) => setOpenAiSvgStatus(status),
      });

      if (result.success) {
        setSelectedFabricObject(null);
      }
    } catch (err: any) {
      console.error('Error al diseñar con OpenAI:', err);
      alert(`Error al generar diseño con OpenAI: ${err.message || err}`);
    } finally {
      setIsOpenAiSvgGenerating(false);
      setOpenAiSvgStatus('');
    }
  };

  // Subir imagen de referencia directamente desde la barra lateral
  const handleUploadReferencePiece = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const newRef: BrandReferencePiece = {
        id: 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl: dataUrl,
        layoutStructure: compositionStyle || 'split-left-right',
      };

      const updatedBrand: BrandKit = {
        ...currentBrand,
        referencePieces: [...(currentBrand.referencePieces || []), newRef],
      };
      handleSaveBrand(updatedBrand);
    };
    reader.readAsDataURL(file);
  };

  // Eliminar imagen de referencia desde la barra lateral
  const handleDeleteReferencePiece = (id: string) => {
    const updatedBrand: BrandKit = {
      ...currentBrand,
      referencePieces: (currentBrand.referencePieces || []).filter(r => r.id !== id),
    };
    handleSaveBrand(updatedBrand);
    if (selectedReferenceId === id) {
      setSelectedReferenceId(undefined);
    }
  };

  // Establecer imagen generada por IA como protagonista o fondo de diseño
  const handleSetHeroSubject = (imageUrl: string, title?: string, isCutout = true) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (!isCutout) {
      // Escena completa (ej. 9:16 o 1:1 sin recortar) -> se aplica como fondo del lienzo
      fabric.Image.fromURL(imageUrl, (img) => {
        img.scaleToWidth(canvas.getWidth());
        if (img.getScaledHeight() < canvas.getHeight()) {
          img.scaleToHeight(canvas.getHeight());
        }
        img.set({
          left: 0,
          top: 0,
          selectable: true,
        });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });
      return;
    }

    // Sujeto recortado para componer con luces y sombras
    const updatedCopy: PieceCopyInput = {
      ...copyInput,
      subjectImageUrl: imageUrl,
    };
    setCopyInput(updatedCopy);

    setIsGenerating(true);
    generateLocalDesignPiece({
      canvas,
      brand: currentBrand,
      docConfig,
      copyInput: updatedCopy,
      style: compositionStyle,
      variationSeed,
    }).finally(() => {
      setIsGenerating(false);
      setSelectedFabricObject(null);
    });
  };

  // Insertar imagen generada por IA directamente al lienzo como nueva capa
  const handleInsertImageToCanvas = (imageUrl: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.Image.fromURL(imageUrl, (img) => {
      const targetW = Math.round(canvas.getWidth() * 0.48);
      img.scaleToWidth(targetW);
      img.set({
        left: Math.round((canvas.getWidth() - targetW) / 2),
        top: Math.round((canvas.getHeight() - img.getScaledHeight()) / 2),
        selectable: true,
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.88)',
          blur: 28,
          offsetY: 12,
        }),
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setSelectedFabricObject(img);
    }, { crossOrigin: 'anonymous' });
  };

  // Export 100% Clean Vector SVG from Fabric Canvas
  const handleExportSVG = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const currentZoom = canvas.getZoom();
    canvas.setZoom(1);
    canvas.setDimensions({ width: docConfig.width, height: docConfig.height });
    const svgData = canvas.toSVG({
      viewBox: { x: 0, y: 0, width: docConfig.width, height: docConfig.height },
      width: docConfig.width,
      height: docConfig.height,
    });
    canvas.setZoom(currentZoom);
    canvas.setDimensions({ width: Math.round(docConfig.width * currentZoom), height: Math.round(docConfig.height * currentZoom) });
    canvas.renderAll();

    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(blob, `${docConfig.title.toLowerCase().replace(/\s+/g, '-')}.svg`);
  };

  // Export 300 DPI High-Res PNG from Fabric Canvas
  const handleExportPNG = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const currentZoom = canvas.getZoom();
    canvas.setZoom(1);
    canvas.setDimensions({ width: docConfig.width, height: docConfig.height });

    const dataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: docConfig.dpi >= 300 ? 2 : 1,
    });

    canvas.setZoom(currentZoom);
    canvas.setDimensions({ width: Math.round(docConfig.width * currentZoom), height: Math.round(docConfig.height * currentZoom) });
    canvas.renderAll();

    const byteCharacters = atob(dataUrl.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    saveAs(blob, `${docConfig.title.toLowerCase().replace(/\s+/g, '-')}-${docConfig.dpi}dpi.png`);
  };

  // Save new Brand Kit
  const handleSaveBrand = (newBrand: BrandKit) => {
    const updated = saveBrandToStorage(newBrand);
    setBrands(updated);
    setCurrentBrand(newBrand);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#191919] text-[#e4e4e7] font-sans select-none">
      
      {/* 1. TOP HEADER (ADOBE WORKSTATION MENU & BRAND) */}
      <Header
        currentBrand={currentBrand}
        brands={brands}
        onSelectBrand={setCurrentBrand}
        onOpenNewBrandModal={() => setIsBrandModalOpen(true)}
        onOpenBrandEcosystem={() => setIsBrandEcosystemOpen(true)}
        onOpenNewDocumentModal={() => setIsNewDocModalOpen(true)}
        onExportSVG={handleExportSVG}
        onExportPNG={handleExportPNG}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        hasOpenAiKey={Boolean(apiSettings.openaiApiKey)}
        onOpenAiStudio={() => setIsAiStudioOpen(true)}
      />

      {/* 2. TOP CONTROL BAR (ILLUSTRATOR CONTEXTUAL CONTROL STRIP) */}
      <TopControlBar
        brand={currentBrand}
        docConfig={docConfig}
        onChangeDocConfig={setDocConfig}
        fabricCanvas={fabricCanvasRef.current}
        selectedObject={selectedFabricObject}
        localPcFonts={localPcFonts}
        onOpenNewDocumentModal={() => setIsNewDocModalOpen(true)}
        onExportSVG={handleExportSVG}
        onExportPNG={handleExportPNG}
        onClearCanvas={handleClearCanvas}
      />

      {/* 3. MAIN 3-PANEL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* VERTICAL TOOLBAR (ILLUSTRATOR STYLE: TOOLS + SWATCHES) */}
        <IllustratorToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          fillColor={fillColor}
          strokeColor={strokeColor}
          onChangeFillColor={handleChangeFillColor}
          onChangeStrokeColor={handleChangeStrokeColor}
          onSwapFillStroke={handleSwapFillStroke}
          onResetFillStroke={handleResetFillStroke}
        />

        {/* LEFT PANEL: BRAND KIT & COPY DEFINIDO POR EL USUARIO */}
        <BrandKitSidebar
          brand={currentBrand}
          onEditBrand={() => setIsBrandModalOpen(true)}
          onOpenBrandEcosystem={() => setIsBrandEcosystemOpen(true)}
          docConfig={docConfig}
          onChangeDocConfig={setDocConfig}
          onOpenNewDocumentModal={() => setIsNewDocModalOpen(true)}
          copyInput={copyInput}
          onChangeCopyInput={setCopyInput}
          selectedReferenceId={selectedReferenceId}
          onSelectReferenceId={setSelectedReferenceId}
          compositionStyle={compositionStyle}
          onChangeCompositionStyle={setCompositionStyle}
          onGenerate={() => handleGenerate(variationSeed)}
          onGenerateVariation={handleGenerateVariation}
          variationSeed={variationSeed}
          isGenerating={isGenerating}
          onOpenAiStudio={() => setIsAiStudioOpen(true)}
          onGenerateOpenAiSvg={handleGenerateOpenAiSvg}
          isOpenAiGenerating={isOpenAiSvgGenerating}
          openAiStatusText={openAiSvgStatus}
          onUploadReferencePiece={handleUploadReferencePiece}
          onDeleteReferencePiece={handleDeleteReferencePiece}
        />

        {/* CENTER: TRUE INTERACTIVE FABRIC.JS CANVAS */}
        <InteractiveDesignCanvas
          brand={currentBrand}
          docConfig={docConfig}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onObjectSelected={setSelectedFabricObject}
          canvasRefOut={fabricCanvasRef}
        />

        {/* RIGHT PANEL: INSPECTOR & REAL-TIME FABRIC OBJECT PROPERTIES */}
        <InspectorSidebar
          brand={currentBrand}
          fabricCanvas={fabricCanvasRef.current}
          selectedObject={selectedFabricObject}
          localPcFonts={localPcFonts}
        />

      </div>

      {/* 4. MODALS */}
      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        onCreateDocument={(newDoc) => {
          setDocConfig(newDoc);
          const canvas = fabricCanvasRef.current;
          if (canvas) {
            canvas.clear();
            const bg = newDoc.colorMode === 'CMYK' ? '#ffffff' : (currentBrand.colors.backgroundDark || '#141416');
            canvas.setBackgroundColor(bg, canvas.renderAll.bind(canvas));
            canvas.renderAll();
          }
          setSelectedFabricObject(null);
        }}
      />

      <BrandKitModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onSaveBrand={handleSaveBrand}
        initialBrand={brands.length > 0 ? currentBrand : undefined}
      />

      <BrandEcosystemModal
        isOpen={isBrandEcosystemOpen}
        onClose={() => setIsBrandEcosystemOpen(false)}
        brand={currentBrand}
        onUpdateBrand={handleSaveBrand}
        onSelectSampleForInspiration={(sampleUrl) => {
          const canvas = fabricCanvasRef.current;
          if (canvas) {
            fabric.Image.fromURL(sampleUrl, (img) => {
              img.scaleToWidth(canvas.getWidth() * 0.4);
              canvas.add(img);
              canvas.setActiveObject(img);
              canvas.renderAll();
            }, { crossOrigin: 'anonymous' });
          }
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={apiSettings}
        onSaveSettings={(s) => {
          setApiSettings(s);
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
        }}
      />

      <LocalAiImageModal
        isOpen={isAiStudioOpen}
        onClose={() => setIsAiStudioOpen(false)}
        apiSettings={apiSettings}
        onSetAsHeroSubject={handleSetHeroSubject}
        onInsertToCanvas={handleInsertImageToCanvas}
      />

    </div>
  );
};

export default App;
