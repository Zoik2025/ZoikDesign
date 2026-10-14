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
  /**
   * Master Graphic Design Engine:
   * Diseña la pieza gráfica con estándares de agencia profesional:
   * 1. Coordenadas reales basadas en docConfig (1080x1350, 1080x1920, 1080x1080)
   * 2. Integra la imagen de la pieza de referencia subida por el usuario como protagonista
   * 3. Tipografía publicitaria de alto impacto (H1 76-88px, jerarquías nítidas, sombras de contraste)
   * 4. Atmósfera con gradientes, luces de estadio y cortes angulares deportivos
   */
  const handleGenerate = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    try {
      // Dimensiones REALES del documento (NUNCA usar canvas.getWidth() que devuelve el tamaño de ventana escalado)
      const w = docConfig.width;
      const h = docConfig.height;

      canvas.clear();

      // Determinar estructura guiada por pieza de referencia o proporción
      let effectiveStyle = compositionStyle;
      let activeRef = selectedReferenceId && currentBrand.referencePieces
        ? currentBrand.referencePieces.find(r => r.id === selectedReferenceId)
        : (currentBrand.referencePieces && currentBrand.referencePieces.length > 0 ? currentBrand.referencePieces[0] : null);

      if (activeRef?.layoutStructure) {
        effectiveStyle = activeRef.layoutStructure;
      } else if (h >= w * 1.5) {
        effectiveStyle = 'story-vertical';
      } else if (w >= h * 1.4) {
        effectiveStyle = 'split-left-right';
      }

      const headlineStr = copyInput.headline.trim() || currentBrand.name.toUpperCase();
      const subtitleStr = copyInput.subtitle.trim();
      const badgeStr = copyInput.badgeText?.trim() || '';
      const ctaStr = copyInput.ctaText?.trim() || '';

      // 1. CAPA DE FONDO ATMOSFÉRICO (NO UN FONDO PLANO VACÍO)
      const bgRect = new fabric.Rect({
        left: 0,
        top: 0,
        width: w,
        height: h,
        fill: currentBrand.colors.backgroundDark || '#0b0f19',
        selectable: false,
        evented: false,
      });
      canvas.add(bgRect);

      // Luz ambiental / Resplandor de estadio detrás del elemento protagonista
      const ambientGlow = new fabric.Circle({
        left: effectiveStyle === 'split-left-right' ? w * 0.72 : w * 0.5,
        top: h * 0.42,
        radius: w * 0.36,
        fill: currentBrand.colors.primary,
        opacity: 0.22,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      canvas.add(ambientGlow);

      // Cortes vectoriales angulares deportivos (estilo transmisión deportiva / ESPN / Fox Sports)
      const poly1 = new fabric.Polygon([
        { x: w * 0.38, y: 0 },
        { x: w * 0.70, y: 0 },
        { x: w * 0.40, y: h },
        { x: w * 0.08, y: h }
      ], {
        fill: currentBrand.colors.secondary || '#388bff',
        opacity: 0.12,
        selectable: false,
        evented: false,
      });
      const poly2 = new fabric.Polygon([
        { x: w * 0.60, y: 0 },
        { x: w * 0.92, y: 0 },
        { x: w * 0.62, y: h },
        { x: w * 0.30, y: h }
      ], {
        fill: currentBrand.colors.primary || '#0d66d0',
        opacity: 0.08,
        selectable: false,
        evented: false,
      });
      canvas.add(poly1, poly2);

      // ==========================================
      // COMPOSICIÓN 1: SPLIT HORIZONTAL (4:5 / 1:1)
      // ==========================================
      if (effectiveStyle === 'split-left-right' || effectiveStyle === 'hero-split') {
        const marginX = Math.round(w * 0.075); // ~80px

        // 1. Logo de Marca
        const logoBadge = new fabric.Rect({
          left: marginX,
          top: Math.round(h * 0.05),
          width: 54,
          height: 54,
          rx: 12,
          ry: 12,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const logoChar = new fabric.IText(currentBrand.logo.symbolText || 'Z', {
          left: marginX + 15,
          top: Math.round(h * 0.05) + 10,
          fontSize: 26,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        const logoText = new fabric.IText(currentBrand.name.toUpperCase(), {
          left: marginX + 68,
          top: Math.round(h * 0.05) + 16,
          fontSize: 20,
          fontWeight: '800',
          fill: currentBrand.colors.textPrimary || '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 80,
          selectable: true,
        });
        canvas.add(logoBadge, logoChar, logoText);

        // 2. Badge / Etiqueta destacada
        let contentTop = Math.round(h * 0.15);
        if (badgeStr) {
          const pill = new fabric.Rect({
            left: marginX,
            top: contentTop,
            width: Math.min(320, badgeStr.length * 16 + 44),
            height: 44,
            rx: 8,
            ry: 8,
            fill: currentBrand.colors.accent || '#f59e0b',
            selectable: true,
          });
          const pillText = new fabric.IText(badgeStr.toUpperCase(), {
            left: marginX + 18,
            top: contentTop + 11,
            fontSize: 16,
            fontWeight: '900',
            fill: '#ffffff',
            fontFamily: currentBrand.typography.accentFont || currentBrand.typography.headlineFont,
            charSpacing: 60,
            selectable: true,
          });
          canvas.add(pill, pillText);
          contentTop += 64;
        } else {
          contentTop += 20;
        }

        // 3. Titular Principal (H1) — Tamaño real de cartel, envuelto automáticamente
        const headlineWidth = Math.round(w * 0.48); // ~520px
        const headline = new fabric.Textbox(headlineStr.toUpperCase(), {
          left: marginX,
          top: contentTop,
          width: headlineWidth,
          fontSize: 72,
          fontWeight: '900',
          fill: '#ffffff',
          lineHeight: 1.05,
          fontFamily: currentBrand.typography.headlineFont,
          shadow: new fabric.Shadow({
            color: 'rgba(0, 0, 0, 0.9)',
            blur: 16,
            offsetX: 0,
            offsetY: 4,
          }),
          selectable: true,
        });
        canvas.add(headline);

        // 4. Subtítulo / Bajada comercial
        const subTop = contentTop + (headline.height || 160) + 30;
        if (subtitleStr) {
          const subtitle = new fabric.Textbox(subtitleStr, {
            left: marginX,
            top: subTop,
            width: headlineWidth - 20,
            fontSize: 26,
            fontWeight: '500',
            fill: currentBrand.colors.textSecondary || '#cbd5e1',
            lineHeight: 1.35,
            fontFamily: currentBrand.typography.bodyFont,
            selectable: true,
          });
          canvas.add(subtitle);
        }

        // 5. Botón de Llamado a la Acción (CTA) — Grande y clickeable
        const ctaTop = Math.max(subTop + 140, Math.round(h * 0.68));
        const ctaBtnText = (ctaStr || 'APUESTA AHORA').toUpperCase() + '  →';
        const ctaWidth = Math.max(340, ctaBtnText.length * 15 + 60);

        const ctaBg = new fabric.Rect({
          left: marginX,
          top: ctaTop,
          width: ctaWidth,
          height: 72,
          rx: 14,
          ry: 14,
          fill: currentBrand.colors.primary,
          shadow: new fabric.Shadow({
            color: 'rgba(13, 102, 208, 0.45)',
            blur: 20,
            offsetX: 0,
            offsetY: 8,
          }),
          selectable: true,
        });
        const ctaTextObj = new fabric.IText(ctaBtnText, {
          left: marginX + 32,
          top: ctaTop + 22,
          fontSize: 22,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(ctaBg, ctaTextObj);

        // Feature / Beneficio rápido debajo del botón
        const featureText = new fabric.IText('⚡ CUOTAS MEJORADAS • PAGO INMEDIATO', {
          left: marginX,
          top: ctaTop + 90,
          fontSize: 14,
          fontWeight: '800',
          fill: '#94a3b8',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(featureText);

        // 6. Footer con sitio web o handle
        const urlText = new fabric.IText(`● ${currentBrand.website || '@' + currentBrand.name.toLowerCase().replace(/\s+/g, '')}`, {
          left: marginX,
          top: Math.round(h * 0.94),
          fontSize: 18,
          fontWeight: '600',
          fill: '#64748b',
          fontFamily: currentBrand.typography.bodyFont,
          selectable: true,
        });
        canvas.add(urlText);

        // 7. COLUMNA DERECHA: PROTAGONISTA VISUAL (IMAGEN DE REFERENCIA O EMBLEMA DEPORTIVO)
        if (activeRef?.imageUrl) {
          fabric.Image.fromURL(activeRef.imageUrl, (img) => {
            const targetWidth = Math.round(w * 0.48); // ~520px
            img.scaleToWidth(targetWidth);
            img.set({
              left: Math.round(w * 0.46),
              top: Math.round(h * 0.20),
              selectable: true,
              shadow: new fabric.Shadow({
                color: 'rgba(0, 0, 0, 0.75)',
                blur: 28,
                offsetX: 0,
                offsetY: 12,
              }),
            });
            canvas.add(img);
            canvas.renderAll();
          }, { crossOrigin: 'anonymous' });
        } else {
          // Si no hay imagen de referencia, construir emblema deportivo vectorial de alta energía
          const emblemRadius = Math.round(w * 0.20);
          const emblemCenter = { x: Math.round(w * 0.72), y: Math.round(h * 0.48) };

          const outerRing = new fabric.Circle({
            radius: emblemRadius,
            fill: 'transparent',
            stroke: currentBrand.colors.primary,
            strokeWidth: 4,
            strokeDashArray: [16, 8],
            originX: 'center',
            originY: 'center',
          });
          const shield = new fabric.Rect({
            width: Math.round(emblemRadius * 1.3),
            height: Math.round(emblemRadius * 1.3),
            rx: 24,
            ry: 24,
            fill: currentBrand.colors.secondary || '#388bff',
            opacity: 0.85,
            originX: 'center',
            originY: 'center',
          });
          const vsText = new fabric.IText('VS', {
            fontSize: 48,
            fontWeight: '900',
            fill: '#ffffff',
            originX: 'center',
            originY: 'center',
            fontFamily: currentBrand.typography.headlineFont,
          });
          const emblemGroup = new fabric.Group([outerRing, shield, vsText], {
            left: emblemCenter.x,
            top: emblemCenter.y,
            originX: 'center',
            originY: 'center',
            selectable: true,
          });
          canvas.add(emblemGroup);
        }

      // ==========================================
      // COMPOSICIÓN 2: STORY VERTICAL (9:16)
      // ==========================================
      } else if (effectiveStyle === 'story-vertical') {
        // Logo Centrado Superior
        const logoBadge = new fabric.Rect({
          left: Math.round(w * 0.5) - 30,
          top: Math.round(h * 0.05),
          width: 60,
          height: 60,
          rx: 14,
          ry: 14,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const logoChar = new fabric.IText(currentBrand.logo.symbolText || 'Z', {
          left: Math.round(w * 0.5) - 13,
          top: Math.round(h * 0.05) + 12,
          fontSize: 28,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        const logoText = new fabric.IText(currentBrand.name.toUpperCase(), {
          left: Math.round(w * 0.5),
          top: Math.round(h * 0.09),
          originX: 'center',
          fontSize: 18,
          fontWeight: '800',
          fill: currentBrand.colors.textSecondary || '#cbd5e1',
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 140,
          selectable: true,
        });
        canvas.add(logoBadge, logoChar, logoText);

        // Imagen protagonista central
        if (activeRef?.imageUrl) {
          fabric.Image.fromURL(activeRef.imageUrl, (img) => {
            img.scaleToWidth(Math.round(w * 0.72));
            img.set({
              left: (w - Math.round(w * 0.72)) / 2,
              top: Math.round(h * 0.15),
              selectable: true,
              shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 30, offsetY: 12 }),
            });
            canvas.add(img);
            canvas.renderAll();
          }, { crossOrigin: 'anonymous' });
        }

        // Tercio inferior: Titular masivo
        let lowerTop = Math.round(h * 0.60);
        if (badgeStr) {
          const pillText = new fabric.IText(`— ${badgeStr.toUpperCase()} —`, {
            left: Math.round(w * 0.5),
            top: lowerTop,
            originX: 'center',
            fontSize: 18,
            fontWeight: '900',
            fill: currentBrand.colors.accent || '#f59e0b',
            fontFamily: currentBrand.typography.headlineFont,
            charSpacing: 100,
            selectable: true,
          });
          canvas.add(pillText);
          lowerTop += 45;
        }

        const headline = new fabric.Textbox(headlineStr.toUpperCase(), {
          left: Math.round(w * 0.5),
          top: lowerTop,
          originX: 'center',
          width: Math.round(w * 0.84),
          textAlign: 'center',
          fontSize: 78,
          fontWeight: '900',
          fill: '#ffffff',
          lineHeight: 1.05,
          fontFamily: currentBrand.typography.headlineFont,
          shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 18, offsetY: 4 }),
          selectable: true,
        });
        canvas.add(headline);

        if (subtitleStr) {
          const subTop = lowerTop + (headline.height || 160) + 25;
          const subtitle = new fabric.Textbox(subtitleStr, {
            left: Math.round(w * 0.5),
            top: subTop,
            originX: 'center',
            width: Math.round(w * 0.78),
            textAlign: 'center',
            fontSize: 28,
            fontWeight: '500',
            fill: currentBrand.colors.textSecondary || '#cbd5e1',
            lineHeight: 1.35,
            fontFamily: currentBrand.typography.bodyFont,
            selectable: true,
          });
          canvas.add(subtitle);
        }

        // Botón CTA de ancho completo centrado
        const ctaBtnText = (ctaStr || 'APUESTA AHORA').toUpperCase() + '  →';
        const ctaWidth = Math.round(w * 0.70);
        const ctaTop = Math.round(h * 0.84);

        const ctaBg = new fabric.Rect({
          left: (w - ctaWidth) / 2,
          top: ctaTop,
          width: ctaWidth,
          height: 80,
          rx: 16,
          ry: 16,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const ctaTextObj = new fabric.IText(ctaBtnText, {
          left: Math.round(w * 0.5),
          top: ctaTop + 24,
          originX: 'center',
          fontSize: 24,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(ctaBg, ctaTextObj);

      // ==========================================
      // COMPOSICIÓN 3: HERO CENTER (EDITORIAL)
      // ==========================================
      } else {
        // Logo superior
        const logoBadge = new fabric.Rect({
          left: Math.round(w * 0.08),
          top: Math.round(h * 0.05),
          width: 50,
          height: 50,
          rx: 10,
          ry: 10,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const logoChar = new fabric.IText(currentBrand.logo.symbolText || 'Z', {
          left: Math.round(w * 0.08) + 14,
          top: Math.round(h * 0.05) + 10,
          fontSize: 24,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        const logoText = new fabric.IText(currentBrand.name.toUpperCase(), {
          left: Math.round(w * 0.08) + 62,
          top: Math.round(h * 0.05) + 14,
          fontSize: 18,
          fontWeight: '800',
          fill: currentBrand.colors.textPrimary || '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 70,
          selectable: true,
        });
        canvas.add(logoBadge, logoChar, logoText);

        // Titular superior
        const headline = new fabric.Textbox(headlineStr.toUpperCase(), {
          left: Math.round(w * 0.5),
          top: Math.round(h * 0.14),
          originX: 'center',
          width: Math.round(w * 0.84),
          textAlign: 'center',
          fontSize: 74,
          fontWeight: '900',
          fill: '#ffffff',
          lineHeight: 1.05,
          fontFamily: currentBrand.typography.headlineFont,
          shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.85)', blur: 16, offsetY: 4 }),
          selectable: true,
        });
        canvas.add(headline);

        // Imagen protagonista central
        if (activeRef?.imageUrl) {
          fabric.Image.fromURL(activeRef.imageUrl, (img) => {
            img.scaleToWidth(Math.round(w * 0.60));
            img.set({
              left: (w - Math.round(w * 0.60)) / 2,
              top: Math.round(h * 0.32),
              selectable: true,
              shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.7)', blur: 24, offsetY: 10 }),
            });
            canvas.add(img);
            canvas.renderAll();
          }, { crossOrigin: 'anonymous' });
        }

        // Subtítulo inferior
        if (subtitleStr) {
          const subtitle = new fabric.Textbox(subtitleStr, {
            left: Math.round(w * 0.5),
            top: Math.round(h * 0.74),
            originX: 'center',
            width: Math.round(w * 0.80),
            textAlign: 'center',
            fontSize: 26,
            fontWeight: '500',
            fill: currentBrand.colors.textSecondary || '#cbd5e1',
            lineHeight: 1.35,
            fontFamily: currentBrand.typography.bodyFont,
            selectable: true,
          });
          canvas.add(subtitle);
        }

        // Botón CTA
        const ctaBtnText = (ctaStr || 'APUESTA AHORA').toUpperCase() + '  →';
        const ctaWidth = 360;
        const ctaTop = Math.round(h * 0.84);

        const ctaBg = new fabric.Rect({
          left: (w - ctaWidth) / 2,
          top: ctaTop,
          width: ctaWidth,
          height: 72,
          rx: 14,
          ry: 14,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const ctaTextObj = new fabric.IText(ctaBtnText, {
          left: Math.round(w * 0.5),
          top: ctaTop + 22,
          originX: 'center',
          fontSize: 22,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(ctaBg, ctaTextObj);
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
