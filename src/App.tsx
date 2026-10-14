import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import saveAs from 'file-saver';
import type { BrandKit, DocumentConfig, EditorTool, CompositionStyle, PieceCopyInput } from './types';
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

  // Copy Real del Usuario (La IA diseña sobre estos textos, NO los inventa)
  const [copyInput, setCopyInput] = useState<PieceCopyInput>({
    headline: 'NUEVA COLECCIÓN EXCLUSIVA',
    subtitle: 'Calidad superior, diseño de vanguardia y garantía total en cada detalle.',
    badgeText: '30% OFF',
    ctaText: 'COMPRAR AHORA',
  });

  // Creative & AI Layout State
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | undefined>(undefined);
  const [compositionStyle, setCompositionStyle] = useState<CompositionStyle>('split-left-right');
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

  // Settings State
  const [apiSettings, setApiSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : { openaiApiKey: '', freepikApiKey: '', enableLiveOpenAi: false };
    } catch {
      return { openaiApiKey: '', freepikApiKey: '', enableLiveOpenAi: false };
    }
  });

  // Modals — Si no hay marcas guardadas, abrimos el modal para crear la primera
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(() => getSavedBrands().length === 0);
  const [isBrandEcosystemOpen, setIsBrandEcosystemOpen] = useState(false);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
   * 4. 100% Vectores SVG editables en el lienzo
   */
  const handleGenerate = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    try {
      const w = canvas.getWidth();
      const h = canvas.getHeight();

      canvas.clear();
      canvas.setBackgroundColor(currentBrand.colors.backgroundDark, canvas.renderAll.bind(canvas));

      // Determinar estructura guiada por pieza de referencia o proporción
      let effectiveStyle = compositionStyle;
      if (selectedReferenceId && currentBrand.referencePieces) {
        const foundRef = currentBrand.referencePieces.find(r => r.id === selectedReferenceId);
        if (foundRef) effectiveStyle = foundRef.layoutStructure;
      } else if (h >= w * 1.5) {
        effectiveStyle = 'story-vertical';
      } else if (w >= h * 1.4) {
        effectiveStyle = 'split-left-right';
      }

      const headlineStr = copyInput.headline.trim() || currentBrand.name.toUpperCase();
      const subtitleStr = copyInput.subtitle.trim();
      const badgeStr = copyInput.badgeText?.trim() || '';
      const ctaStr = copyInput.ctaText?.trim() || '';

      // COMPOSICIÓN 1: SPLIT HORIZONTAL (IZQUIERDA COPY / DERECHA ELEMENTO VECTORIAL)
      if (effectiveStyle === 'split-left-right') {
        // Logo de Marca
        const logoSymbol = new fabric.Rect({
          left: w * 0.07,
          top: h * 0.07,
          width: 36,
          height: 36,
          rx: 6,
          ry: 6,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const logoChar = new fabric.IText(currentBrand.logo.symbolText || 'Z', {
          left: w * 0.07 + 10,
          top: h * 0.07 + 7,
          fontSize: 18,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        const logoText = new fabric.IText(currentBrand.name.toUpperCase(), {
          left: w * 0.07 + 46,
          top: h * 0.07 + 10,
          fontSize: 14,
          fontWeight: '800',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 60,
          selectable: true,
        });
        canvas.add(logoSymbol, logoChar, logoText);

        // Badge / Oferta si existe
        if (badgeStr) {
          const pill = new fabric.Rect({
            left: w * 0.07,
            top: h * 0.22,
            width: Math.min(220, badgeStr.length * 11 + 30),
            height: 30,
            rx: 6,
            ry: 6,
            fill: currentBrand.colors.accent,
            selectable: true,
          });
          const pillText = new fabric.IText(badgeStr.toUpperCase(), {
            left: w * 0.07 + 14,
            top: h * 0.22 + 7,
            fontSize: 11,
            fontWeight: '900',
            fill: '#ffffff',
            fontFamily: currentBrand.typography.accentFont || currentBrand.typography.headlineFont,
            selectable: true,
          });
          canvas.add(pill, pillText);
        }

        // Titular Principal H1 (Exacto del usuario)
        const headline = new fabric.IText(headlineStr, {
          left: w * 0.07,
          top: badgeStr ? h * 0.30 : h * 0.24,
          fontSize: Math.round(w * 0.046),
          fontWeight: '900',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(headline);

        // Subtítulo si existe
        if (subtitleStr) {
          const subtitle = new fabric.IText(subtitleStr, {
            left: w * 0.07,
            top: badgeStr ? h * 0.52 : h * 0.46,
            fontSize: Math.round(w * 0.019),
            fontWeight: '400',
            fill: currentBrand.colors.textSecondary,
            fontFamily: currentBrand.typography.bodyFont,
            selectable: true,
          });
          canvas.add(subtitle);
        }

        // Botón CTA si existe
        if (ctaStr) {
          const ctaBg = new fabric.Rect({
            left: w * 0.07,
            top: h * 0.70,
            width: Math.max(180, ctaStr.length * 11 + 40),
            height: 42,
            rx: 6,
            ry: 6,
            fill: currentBrand.colors.primary,
            selectable: true,
          });
          const ctaText = new fabric.IText(ctaStr, {
            left: w * 0.07 + 22,
            top: h * 0.70 + 12,
            fontSize: 12,
            fontWeight: '800',
            fill: '#ffffff',
            fontFamily: currentBrand.typography.headlineFont,
            selectable: true,
          });
          canvas.add(ctaBg, ctaText);
        }

        // Web o identificador de marca
        if (currentBrand.website || currentBrand.contactHandle) {
          const urlText = new fabric.IText(`● ${currentBrand.website || currentBrand.contactHandle}`, {
            left: w * 0.07,
            top: h * 0.88,
            fontSize: 11,
            fontWeight: '600',
            fill: currentBrand.colors.textSecondary,
            fontFamily: currentBrand.typography.bodyFont,
            selectable: true,
          });
          canvas.add(urlText);
        }

        // Elemento gráfico vectorial a la derecha (Composición SVG editable)
        const vectorGroup = new fabric.Group([
          new fabric.Circle({
            radius: w * 0.18,
            fill: 'transparent',
            stroke: currentBrand.colors.primary,
            strokeWidth: 2,
            strokeDashArray: [12, 6],
            originX: 'center',
            originY: 'center',
          }),
          new fabric.Rect({
            width: w * 0.22,
            height: w * 0.22,
            rx: 24,
            ry: 24,
            fill: currentBrand.colors.secondary,
            opacity: 0.8,
            originX: 'center',
            originY: 'center',
          }),
          new fabric.Circle({
            radius: w * 0.06,
            fill: '#ffffff',
            originX: 'center',
            originY: 'center',
          }),
        ], {
          left: w * 0.72,
          top: h * 0.50,
          originX: 'center',
          originY: 'center',
          selectable: true,
        });
        canvas.add(vectorGroup);

      // COMPOSICIÓN 2: STORY VERTICAL (9:16)
      } else if (effectiveStyle === 'story-vertical') {
        // Logo Centrado Superior
        const logoSymbol = new fabric.Rect({
          left: w * 0.5 - 18,
          top: h * 0.05,
          width: 36,
          height: 36,
          rx: 6,
          ry: 6,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const logoChar = new fabric.IText(currentBrand.logo.symbolText || 'Z', {
          left: w * 0.5 - 7,
          top: h * 0.05 + 7,
          fontSize: 18,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        const logoText = new fabric.IText(currentBrand.name.toUpperCase(), {
          left: w * 0.5,
          top: h * 0.09,
          originX: 'center',
          fontSize: 12,
          fontWeight: '800',
          fill: currentBrand.colors.textSecondary,
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 140,
          selectable: true,
        });
        canvas.add(logoSymbol, logoChar, logoText);

        // Motivo Vectorial Central
        const vectorGroup = new fabric.Group([
          new fabric.Circle({
            radius: w * 0.24,
            fill: 'transparent',
            stroke: currentBrand.colors.primary,
            strokeWidth: 3,
            originX: 'center',
            originY: 'center',
          }),
          new fabric.Rect({
            width: w * 0.28,
            height: w * 0.28,
            rx: 28,
            ry: 28,
            fill: currentBrand.colors.accent,
            opacity: 0.85,
            originX: 'center',
            originY: 'center',
          }),
          new fabric.Circle({
            radius: w * 0.08,
            fill: '#ffffff',
            originX: 'center',
            originY: 'center',
          }),
        ], {
          left: w * 0.5,
          top: h * 0.34,
          originX: 'center',
          originY: 'center',
          selectable: true,
        });
        canvas.add(vectorGroup);

        // Badge si existe
        if (badgeStr) {
          const pillText = new fabric.IText(`— ${badgeStr.toUpperCase()} —`, {
            left: w * 0.5,
            top: h * 0.58,
            originX: 'center',
            fontSize: 11,
            fontWeight: '800',
            fill: currentBrand.colors.accent,
            fontFamily: currentBrand.typography.headlineFont,
            charSpacing: 100,
            selectable: true,
          });
          canvas.add(pillText);
        }

        // Titular Principal H1
        const headline = new fabric.IText(headlineStr, {
          left: w * 0.5,
          top: h * 0.63,
          originX: 'center',
          fontSize: Math.round(w * 0.052),
          fontWeight: '900',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          textAlign: 'center',
          selectable: true,
        });
        canvas.add(headline);

        // Subtítulo
        if (subtitleStr) {
          const subtitle = new fabric.IText(subtitleStr, {
            left: w * 0.5,
            top: h * 0.74,
            originX: 'center',
            fontSize: Math.round(w * 0.024),
            fontWeight: '400',
            fill: currentBrand.colors.textSecondary,
            fontFamily: currentBrand.typography.bodyFont,
            textAlign: 'center',
            selectable: true,
          });
          canvas.add(subtitle);
        }

        // Botón CTA
        if (ctaStr) {
          const ctaBg = new fabric.Rect({
            left: (w - 200) / 2,
            top: h * 0.83,
            width: 200,
            height: 44,
            rx: 6,
            ry: 6,
            fill: currentBrand.colors.primary,
            selectable: true,
          });
          const ctaText = new fabric.IText(ctaStr, {
            left: w * 0.5,
            top: h * 0.83 + 13,
            originX: 'center',
            fontSize: 13,
            fontWeight: '800',
            fill: '#ffffff',
            fontFamily: currentBrand.typography.headlineFont,
            selectable: true,
          });
          canvas.add(ctaBg, ctaText);
        }

      // COMPOSICIÓN 3: HERO CENTER (EDITORIAL Y EQUILIBRADO)
      } else {
        // Logo de Marca Top Left
        const logoSymbol = new fabric.Rect({
          left: w * 0.06,
          top: h * 0.05,
          width: 34,
          height: 34,
          rx: 6,
          ry: 6,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const logoChar = new fabric.IText(currentBrand.logo.symbolText || 'Z', {
          left: w * 0.06 + 10,
          top: h * 0.05 + 6,
          fontSize: 17,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        const logoText = new fabric.IText(currentBrand.name.toUpperCase(), {
          left: w * 0.06 + 42,
          top: h * 0.05 + 9,
          fontSize: 14,
          fontWeight: '800',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 60,
          selectable: true,
        });
        canvas.add(logoSymbol, logoChar, logoText);

        // Motivo Vectorial Central
        const vectorGroup = new fabric.Group([
          new fabric.Circle({
            radius: w * 0.20,
            fill: 'transparent',
            stroke: currentBrand.colors.primary,
            strokeWidth: 2.5,
            originX: 'center',
            originY: 'center',
          }),
          new fabric.Rect({
            width: w * 0.24,
            height: w * 0.24,
            rx: 20,
            ry: 20,
            fill: currentBrand.colors.secondary,
            opacity: 0.85,
            originX: 'center',
            originY: 'center',
          }),
          new fabric.Circle({
            radius: w * 0.07,
            fill: '#ffffff',
            originX: 'center',
            originY: 'center',
          }),
        ], {
          left: w * 0.5,
          top: h * 0.36,
          originX: 'center',
          originY: 'center',
          selectable: true,
        });
        canvas.add(vectorGroup);

        // Badge
        if (badgeStr) {
          const pill = new fabric.Rect({
            left: w * 0.06,
            top: h * 0.60,
            width: Math.min(220, badgeStr.length * 11 + 30),
            height: 30,
            rx: 4,
            ry: 4,
            fill: currentBrand.colors.primary,
            selectable: true,
          });
          const pillText = new fabric.IText(badgeStr.toUpperCase(), {
            left: w * 0.06 + 14,
            top: h * 0.60 + 7,
            fontSize: 11,
            fontWeight: '900',
            fill: '#ffffff',
            fontFamily: currentBrand.typography.headlineFont,
            selectable: true,
          });
          canvas.add(pill, pillText);
        }

        // Titular Principal H1
        const headline = new fabric.IText(headlineStr, {
          left: w * 0.06,
          top: badgeStr ? h * 0.66 : h * 0.60,
          fontSize: Math.round(w * 0.046),
          fontWeight: '900',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(headline);

        // Subtítulo
        if (subtitleStr) {
          const subtitle = new fabric.IText(subtitleStr, {
            left: w * 0.06,
            top: badgeStr ? h * 0.77 : h * 0.71,
            fontSize: Math.round(w * 0.02),
            fontWeight: '400',
            fill: currentBrand.colors.textSecondary,
            fontFamily: currentBrand.typography.bodyFont,
            selectable: true,
          });
          canvas.add(subtitle);
        }

        // Botón CTA
        if (ctaStr) {
          const ctaBg = new fabric.Rect({
            left: w * 0.68,
            top: h * 0.86,
            width: Math.max(170, ctaStr.length * 10 + 36),
            height: 42,
            rx: 6,
            ry: 6,
            fill: currentBrand.colors.primary,
            selectable: true,
          });
          const ctaText = new fabric.IText(ctaStr, {
            left: w * 0.68 + 20,
            top: h * 0.86 + 12,
            fontSize: 12,
            fontWeight: '800',
            fill: '#ffffff',
            fontFamily: currentBrand.typography.headlineFont,
            selectable: true,
          });
          canvas.add(ctaBg, ctaText);
        }

        // Footer URL
        if (currentBrand.website || currentBrand.contactHandle) {
          const urlText = new fabric.IText(`● ${currentBrand.website || currentBrand.contactHandle}`, {
            left: w * 0.06,
            top: h * 0.91,
            fontSize: 11,
            fontWeight: '600',
            fill: currentBrand.colors.textSecondary,
            fontFamily: currentBrand.typography.bodyFont,
            selectable: true,
          });
          canvas.add(urlText);
        }
      }

      canvas.renderAll();
    } catch (err) {
      console.error('Error generando pieza:', err);
    } finally {
      setIsGenerating(false);
    }
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
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
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

    </div>
  );
};

export default App;
