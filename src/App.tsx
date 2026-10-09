import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import saveAs from 'file-saver';
import confetti from 'canvas-confetti';
import type { BrandKit, DocumentConfig, EditorTool, CompositionStyle } from './types';
import { getSavedBrands, saveBrandToStorage } from './data/defaultBrands';
import { getLocalPcFonts } from './data/systemFonts';
import type { SystemFontInfo } from './data/systemFonts';
import { resolveMarketingCopy } from './services/copyWriter';
import { resolveVisualAsset } from './services/imageService';

import { Header } from './components/Header';
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
  // Brand State
  const [brands, setBrands] = useState<BrandKit[]>(getSavedBrands());
  const [currentBrand, setCurrentBrand] = useState<BrandKit>(brands[0]);

  // Document Config State (Illustrator / Photoshop style)
  const [docConfig, setDocConfig] = useState<DocumentConfig>({
    title: 'Pieza_Zoik_01',
    width: 1080,
    height: 1080,
    displayValueWidth: 1080,
    displayValueHeight: 1080,
    unit: 'px',
    colorMode: 'RGB',
    dpi: 300,
    orientation: 'portrait',
  });

  // Creative & AI Generation State
  const [briefPrompt, setBriefPrompt] = useState<string>('');
  const [visualSubjectPrompt, setVisualSubjectPrompt] = useState<string>('');
  const [visualProvider, setVisualProvider] = useState<'dalle' | 'freepik' | 'curated-render'>('curated-render');
  const [compositionStyle, setCompositionStyle] = useState<CompositionStyle>('hero-center');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active Tool & Canvas State
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [selectedFabricObject, setSelectedFabricObject] = useState<fabric.Object | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

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

  // Modals
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
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

  // Global Keyboard Shortcuts (Illustrator & Photoshop emulation)
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
      } else if (e.key === 't' || e.key === 'T') {
        setActiveTool('text');
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  // Illustrator Tool: Add Text Layer
  const handleAddText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText('NUEVO TEXTO', {
      left: canvas.getWidth() * 0.35,
      top: canvas.getHeight() * 0.45,
      fontSize: 36,
      fontWeight: '800',
      fill: currentBrand.colors.textPrimary,
      fontFamily: currentBrand.typography.headlineFont,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    canvas.renderAll();
  };

  // Illustrator Tool: Add Shape
  const handleAddShape = (shapeType: 'rect' | 'circle') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shape: fabric.Object;
    if (shapeType === 'rect') {
      shape = new fabric.Rect({
        left: canvas.getWidth() * 0.35,
        top: canvas.getHeight() * 0.45,
        width: 180,
        height: 120,
        rx: 10,
        ry: 10,
        fill: currentBrand.colors.primary,
      });
    } else {
      shape = new fabric.Circle({
        left: canvas.getWidth() * 0.35,
        top: canvas.getHeight() * 0.45,
        radius: 70,
        fill: currentBrand.colors.accent,
      });
    }
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  // Master AI Art Director Generation: Creates genuine professional layout on Canvas
  const handleGenerate = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    try {
      // 1. Resolve Marketing Copy (AI or smart local extractor)
      const copy = await resolveMarketingCopy(briefPrompt, currentBrand, apiSettings);

      // 2. Resolve Visual Product Asset (DALL-E or curated keyword photography)
      const asset = await resolveVisualAsset(visualSubjectPrompt, briefPrompt, visualProvider, apiSettings);

      const w = canvas.getWidth();
      const h = canvas.getHeight();

      canvas.clear();
      canvas.setBackgroundColor(currentBrand.colors.backgroundDark, canvas.renderAll.bind(canvas));

      const isVertical = h > w * 1.1;

      // 3. Render according to compositionStyle
      if (compositionStyle === 'split-left-right') {
        // --- LAYOUT SPLIT LEFT-RIGHT ---
        // Right background ambient glow
        const glow = new fabric.Circle({
          left: w * 0.55,
          top: h * 0.15,
          radius: w * 0.28,
          fill: currentBrand.colors.primary,
          opacity: 0.28,
          selectable: true,
        });
        canvas.add(glow);

        // Left: Logo
        const logoSymbol = new fabric.Rect({
          left: w * 0.07,
          top: h * 0.07,
          width: 36,
          height: 36,
          rx: 8,
          ry: 8,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const logoChar = new fabric.IText(currentBrand.logo.symbolText || 'Z', {
          left: w * 0.07 + 11,
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
          fontSize: 15,
          fontWeight: '800',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 80,
          selectable: true,
        });
        canvas.add(logoSymbol, logoChar, logoText);

        // Left: Promo Pill
        const pill = new fabric.Rect({
          left: w * 0.07,
          top: h * 0.22,
          width: 170,
          height: 30,
          rx: 6,
          ry: 6,
          fill: currentBrand.colors.accent,
          selectable: true,
        });
        const pillText = new fabric.IText(copy.badgeText, {
          left: w * 0.07 + 14,
          top: h * 0.22 + 7,
          fontSize: 11,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(pill, pillText);

        // Left: Headline H1
        const headline = new fabric.IText(copy.headline, {
          left: w * 0.07,
          top: h * 0.30,
          fontSize: Math.round(w * 0.048),
          fontWeight: '900',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(headline);

        // Left: Subtitle H2
        const subtitle = new fabric.IText(copy.subtitle, {
          left: w * 0.07,
          top: h * 0.52,
          fontSize: Math.round(w * 0.019),
          fontWeight: '400',
          fill: currentBrand.colors.textSecondary,
          fontFamily: currentBrand.typography.bodyFont,
          selectable: true,
        });
        canvas.add(subtitle);

        // Left: CTA Button
        const ctaBg = new fabric.Rect({
          left: w * 0.07,
          top: h * 0.70,
          width: 180,
          height: 44,
          rx: 10,
          ry: 10,
          fill: '#ffffff',
          selectable: true,
        });
        const ctaText = new fabric.IText(copy.ctaText, {
          left: w * 0.07 + 22,
          top: h * 0.70 + 13,
          fontSize: 13,
          fontWeight: '800',
          fill: '#0f172a',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(ctaBg, ctaText);

        // Left: Website Footer
        const urlText = new fabric.IText(`● ${currentBrand.website}`, {
          left: w * 0.07,
          top: h * 0.88,
          fontSize: 12,
          fontWeight: '600',
          fill: currentBrand.colors.textSecondary,
          fontFamily: currentBrand.typography.bodyFont,
          selectable: true,
        });
        canvas.add(urlText);

        // Right: Hero Asset Image
        fabric.Image.fromURL(asset.url, (img) => {
          img.scaleToWidth(w * 0.44);
          img.set({
            left: w * 0.50,
            top: h * 0.20,
            selectable: true,
          });
          canvas.add(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });

      } else if (compositionStyle === 'minimal-editorial') {
        // --- LAYOUT MINIMAL EDITORIAL ---
        // Centered Top Logo
        const logoSymbol = new fabric.Rect({
          left: w * 0.5 - 18,
          top: h * 0.05,
          width: 36,
          height: 36,
          rx: 8,
          ry: 8,
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
          top: h * 0.10,
          originX: 'center',
          fontSize: 13,
          fontWeight: '800',
          fill: currentBrand.colors.textSecondary,
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 160,
          selectable: true,
        });
        canvas.add(logoSymbol, logoChar, logoText);

        // Centered Product Asset
        fabric.Image.fromURL(asset.url, (img) => {
          img.scaleToWidth(w * 0.42);
          img.set({
            left: (w - (w * 0.42)) / 2,
            top: h * 0.20,
            selectable: true,
          });
          canvas.add(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });

        // Subtle Badge
        const pillText = new fabric.IText(`— ${copy.badgeText} —`, {
          left: w * 0.5,
          top: h * 0.65,
          originX: 'center',
          fontSize: 11,
          fontWeight: '800',
          fill: currentBrand.colors.accent,
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 120,
          selectable: true,
        });
        canvas.add(pillText);

        // Elegant Headline
        const headline = new fabric.IText(copy.headline, {
          left: w * 0.5,
          top: h * 0.70,
          originX: 'center',
          fontSize: Math.round(w * 0.044),
          fontWeight: '900',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          textAlign: 'center',
          selectable: true,
        });
        canvas.add(headline);

        // Subtitle
        const subtitle = new fabric.IText(copy.subtitle, {
          left: w * 0.5,
          top: h * 0.79,
          originX: 'center',
          fontSize: Math.round(w * 0.018),
          fontWeight: '400',
          fill: currentBrand.colors.textSecondary,
          fontFamily: currentBrand.typography.bodyFont,
          textAlign: 'center',
          selectable: true,
        });
        canvas.add(subtitle);

        // Sleek CTA
        const ctaBg = new fabric.Rect({
          left: (w - 180) / 2,
          top: h * 0.86,
          width: 180,
          height: 38,
          rx: 19,
          ry: 19,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const ctaText = new fabric.IText(copy.ctaText, {
          left: w * 0.5,
          top: h * 0.86 + 11,
          originX: 'center',
          fontSize: 12,
          fontWeight: '800',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(ctaBg, ctaText);

        // Bottom URL
        const urlText = new fabric.IText(currentBrand.website, {
          left: w * 0.5,
          top: h * 0.94,
          originX: 'center',
          fontSize: 11,
          fontWeight: '500',
          fill: 'rgba(255,255,255,0.4)',
          fontFamily: currentBrand.typography.bodyFont,
          selectable: true,
        });
        canvas.add(urlText);

      } else {
        // --- LAYOUT HERO-CENTER (DEFAULT) ---
        // Ambient glow
        const glow = new fabric.Circle({
          left: w * 0.75,
          top: h * 0.08,
          radius: w * 0.28,
          fill: currentBrand.colors.primary,
          opacity: 0.35,
          selectable: true,
        });
        canvas.add(glow);

        // Top Brand Logo
        const logoSymbol = new fabric.Rect({
          left: w * 0.06,
          top: h * 0.05,
          width: 38,
          height: 38,
          rx: 8,
          ry: 8,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const logoChar = new fabric.IText(currentBrand.logo.symbolText || 'Z', {
          left: w * 0.06 + 12,
          top: h * 0.05 + 8,
          fontSize: 18,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        const logoText = new fabric.IText(currentBrand.name.toUpperCase(), {
          left: w * 0.06 + 48,
          top: h * 0.05 + 10,
          fontSize: 15,
          fontWeight: '800',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 80,
          selectable: true,
        });
        canvas.add(logoSymbol, logoChar, logoText);

        // Top Tag
        const tagBg = new fabric.Rect({
          left: w * 0.68,
          top: h * 0.05,
          width: 140,
          height: 28,
          rx: 14,
          ry: 14,
          fill: 'rgba(255,255,255,0.08)',
          stroke: 'rgba(255,255,255,0.2)',
          strokeWidth: 1,
          selectable: true,
        });
        const tagText = new fabric.IText(`COLECCIÓN ${new Date().getFullYear()}`, {
          left: w * 0.68 + 14,
          top: h * 0.05 + 6,
          fontSize: 11,
          fontWeight: '700',
          fill: currentBrand.colors.accent,
          fontFamily: currentBrand.typography.bodyFont,
          selectable: true,
        });
        canvas.add(tagBg, tagText);

        // Hero Image
        fabric.Image.fromURL(asset.url, (img) => {
          img.scaleToWidth(w * 0.46);
          img.set({
            left: (w - (w * 0.46)) / 2,
            top: h * 0.18,
            selectable: true,
          });
          canvas.add(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });

        // Offer Pill
        const pill = new fabric.Rect({
          left: w * 0.06,
          top: isVertical ? h * 0.60 : h * 0.62,
          width: 180,
          height: 32,
          rx: 6,
          ry: 6,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const pillText = new fabric.IText(copy.badgeText, {
          left: w * 0.06 + 18,
          top: (isVertical ? h * 0.60 : h * 0.62) + 7,
          fontSize: 12,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(pill, pillText);

        // Headline H1
        const headline = new fabric.IText(copy.headline, {
          left: w * 0.06,
          top: isVertical ? h * 0.66 : h * 0.68,
          fontSize: Math.round(w * 0.046),
          fontWeight: '900',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(headline);

        // Subtitle H2
        const subtitle = new fabric.IText(copy.subtitle, {
          left: w * 0.06,
          top: isVertical ? h * 0.77 : h * 0.78,
          fontSize: Math.round(w * 0.02),
          fontWeight: '400',
          fill: currentBrand.colors.textSecondary,
          fontFamily: currentBrand.typography.bodyFont,
          selectable: true,
        });
        canvas.add(subtitle);

        // CTA Button
        const ctaBg = new fabric.Rect({
          left: w * 0.68,
          top: isVertical ? h * 0.86 : h * 0.88,
          width: 170,
          height: 42,
          rx: 10,
          ry: 10,
          fill: '#ffffff',
          selectable: true,
        });
        const ctaText = new fabric.IText(copy.ctaText, {
          left: w * 0.68 + 22,
          top: (isVertical ? h * 0.86 : h * 0.88) + 12,
          fontSize: 13,
          fontWeight: '800',
          fill: '#0f172a',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(ctaBg, ctaText);

        // Footer URL
        const urlText = new fabric.IText(`● ${currentBrand.website}`, {
          left: w * 0.06,
          top: isVertical ? h * 0.92 : h * 0.90,
          fontSize: 12,
          fontWeight: '600',
          fill: currentBrand.colors.textSecondary,
          fontFamily: currentBrand.typography.bodyFont,
          selectable: true,
        });
        canvas.add(urlText);
      }

      canvas.renderAll();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: [currentBrand.colors.primary, currentBrand.colors.secondary, '#a855f7'],
      });
    } catch (err) {
      console.error('Error generando pieza:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Harmonious Color Shuffle on Canvas
  const handleShuffleColors = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const bgColors = [currentBrand.colors.backgroundDark, '#18181b', '#1e1b4b', '#172554', '#121214'];
    const nextBg = bgColors[Math.floor(Math.random() * bgColors.length)];
    canvas.setBackgroundColor(nextBg, canvas.renderAll.bind(canvas));
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
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#121214] text-white font-sans select-none">
      
      {/* 1. TOP HEADER (ILLUSTRATOR PRO CLEAN STYLE) */}
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

      {/* 2. MAIN 3-PANEL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* VERTICAL TOOLBAR (ILLUSTRATOR STYLE) */}
        <IllustratorToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onOpenBrandEcosystem={() => setIsBrandEcosystemOpen(true)}
          onShuffleColors={handleShuffleColors}
        />

        {/* LEFT PANEL: BRAND KIT & AI CREATIVE DIRECTOR */}
        <BrandKitSidebar
          brand={currentBrand}
          onEditBrand={() => setIsBrandModalOpen(true)}
          onOpenBrandEcosystem={() => setIsBrandEcosystemOpen(true)}
          briefPrompt={briefPrompt}
          onChangeBrief={setBriefPrompt}
          visualSubjectPrompt={visualSubjectPrompt}
          onChangeVisualSubject={setVisualSubjectPrompt}
          visualProvider={visualProvider}
          onChangeVisualProvider={setVisualProvider}
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

      {/* 3. MODALS */}
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
        initialBrand={currentBrand}
      />

      <BrandEcosystemModal
        isOpen={isBrandEcosystemOpen}
        onClose={() => setIsBrandEcosystemOpen(false)}
        brand={currentBrand}
        onUpdateBrand={handleSaveBrand}
        onSelectSampleForInspiration={(sampleUrl) => {
          // Paste sample into canvas directly!
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
