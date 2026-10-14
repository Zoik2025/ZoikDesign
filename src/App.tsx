import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import saveAs from 'file-saver';
import type { BrandKit, DocumentConfig, EditorTool, CompositionStyle } from './types';
import { getSavedBrands, saveBrandToStorage } from './data/defaultBrands';
import { getLocalPcFonts } from './data/systemFonts';
import type { SystemFontInfo } from './data/systemFonts';
import { resolveMarketingCopy } from './services/copyWriter';
import { resolveVisualAsset } from './services/imageService';

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
  // Brand State
  const [brands, setBrands] = useState<BrandKit[]>(getSavedBrands());
  const [currentBrand, setCurrentBrand] = useState<BrandKit>(brands[0]);

  // Document Config State (Adobe Illustrator style)
  const [docConfig, setDocConfig] = useState<DocumentConfig>({
    title: 'Pieza_Zoik_01',
    width: 1080,
    height: 1350, // Default 4:5 Portrait
    displayValueWidth: 1080,
    displayValueHeight: 1350,
    unit: 'px',
    colorMode: 'RGB',
    dpi: 300,
    orientation: 'portrait',
  });

  // Creative & AI Generation State
  const [briefPrompt, setBriefPrompt] = useState<string>('');
  const [visualSubjectPrompt, setVisualSubjectPrompt] = useState<string>('');
  const [visualProvider, setVisualProvider] = useState<'dalle' | 'freepik' | 'curated-render'>('curated-render');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | undefined>(undefined);
  const [compositionStyle, setCompositionStyle] = useState<CompositionStyle>('split-left-right');
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

  // Global Keyboard Shortcuts (Illustrator emulation)
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
        rx: 8,
        ry: 8,
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

      // Determine Layout Structure guided by Brand Reference Pieces or format
      let effectiveStyle = compositionStyle;
      if (selectedReferenceId && currentBrand.referencePieces) {
        const foundRef = currentBrand.referencePieces.find(r => r.id === selectedReferenceId);
        if (foundRef) effectiveStyle = foundRef.layoutStructure;
      } else if (h >= w * 1.5) {
        effectiveStyle = 'story-vertical';
      } else if (w >= h * 1.4) {
        effectiveStyle = 'split-left-right';
      }

      // RENDER ARCHETYPE 1: SPLIT LEFT-RIGHT
      if (effectiveStyle === 'split-left-right') {
        // Left: Logo
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
          fontSize: 14,
          fontWeight: '800',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 60,
          selectable: true,
        });
        canvas.add(logoSymbol, logoChar, logoText);

        // Promo Pill
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

        // Headline H1
        const headline = new fabric.IText(copy.headline, {
          left: w * 0.07,
          top: h * 0.30,
          fontSize: Math.round(w * 0.046),
          fontWeight: '900',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(headline);

        // Subtitle H2
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

        // CTA Button
        const ctaBg = new fabric.Rect({
          left: w * 0.07,
          top: h * 0.70,
          width: 180,
          height: 42,
          rx: 6,
          ry: 6,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const ctaText = new fabric.IText(copy.ctaText, {
          left: w * 0.07 + 24,
          top: h * 0.70 + 12,
          fontSize: 12,
          fontWeight: '800',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(ctaBg, ctaText);

        // Website Footer
        const urlText = new fabric.IText(`● ${currentBrand.website}`, {
          left: w * 0.07,
          top: h * 0.88,
          fontSize: 11,
          fontWeight: '600',
          fill: currentBrand.colors.textSecondary,
          fontFamily: currentBrand.typography.bodyFont,
          selectable: true,
        });
        canvas.add(urlText);

        // Right Hero Asset Image
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

      // RENDER ARCHETYPE 2: STORY VERTICAL (9:16)
      } else if (effectiveStyle === 'story-vertical') {
        // Top Center Logo
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

        // Center Floating Hero Image
        fabric.Image.fromURL(asset.url, (img) => {
          img.scaleToWidth(w * 0.60);
          img.set({
            left: (w - (w * 0.60)) / 2,
            top: h * 0.16,
            selectable: true,
          });
          canvas.add(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });

        // Badge
        const pillText = new fabric.IText(`— ${copy.badgeText} —`, {
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

        // Headline
        const headline = new fabric.IText(copy.headline, {
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

        // Subtitle
        const subtitle = new fabric.IText(copy.subtitle, {
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

        // CTA Button
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
        const ctaText = new fabric.IText(copy.ctaText, {
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

        // Bottom Handle
        const urlText = new fabric.IText(currentBrand.website, {
          left: w * 0.5,
          top: h * 0.93,
          originX: 'center',
          fontSize: 11,
          fontWeight: '500',
          fill: 'rgba(255,255,255,0.4)',
          fontFamily: currentBrand.typography.bodyFont,
          selectable: true,
        });
        canvas.add(urlText);

      // RENDER ARCHETYPE 3: MINIMAL EDITORIAL
      } else if (effectiveStyle === 'minimal-editorial') {
        const logoText = new fabric.IText(currentBrand.name.toUpperCase(), {
          left: w * 0.5,
          top: h * 0.08,
          originX: 'center',
          fontSize: 13,
          fontWeight: '800',
          fill: currentBrand.colors.textSecondary,
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 160,
          selectable: true,
        });
        canvas.add(logoText);

        fabric.Image.fromURL(asset.url, (img) => {
          img.scaleToWidth(w * 0.44);
          img.set({
            left: (w - (w * 0.44)) / 2,
            top: h * 0.18,
            selectable: true,
          });
          canvas.add(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });

        const pillText = new fabric.IText(`— ${copy.badgeText} —`, {
          left: w * 0.5,
          top: h * 0.63,
          originX: 'center',
          fontSize: 11,
          fontWeight: '800',
          fill: currentBrand.colors.accent,
          fontFamily: currentBrand.typography.headlineFont,
          charSpacing: 120,
          selectable: true,
        });
        canvas.add(pillText);

        const headline = new fabric.IText(copy.headline, {
          left: w * 0.5,
          top: h * 0.68,
          originX: 'center',
          fontSize: Math.round(w * 0.044),
          fontWeight: '900',
          fill: currentBrand.colors.textPrimary,
          fontFamily: currentBrand.typography.headlineFont,
          textAlign: 'center',
          selectable: true,
        });
        canvas.add(headline);

        const subtitle = new fabric.IText(copy.subtitle, {
          left: w * 0.5,
          top: h * 0.77,
          originX: 'center',
          fontSize: Math.round(w * 0.018),
          fontWeight: '400',
          fill: currentBrand.colors.textSecondary,
          fontFamily: currentBrand.typography.bodyFont,
          textAlign: 'center',
          selectable: true,
        });
        canvas.add(subtitle);

        const ctaBg = new fabric.Rect({
          left: (w - 180) / 2,
          top: h * 0.85,
          width: 180,
          height: 38,
          rx: 4,
          ry: 4,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const ctaText = new fabric.IText(copy.ctaText, {
          left: w * 0.5,
          top: h * 0.85 + 11,
          originX: 'center',
          fontSize: 12,
          fontWeight: '800',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(ctaBg, ctaText);

      // RENDER ARCHETYPE 4: HERO CENTER (DEFAULT)
      } else {
        // Top Brand Header
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

        // Center Product Asset
        fabric.Image.fromURL(asset.url, (img) => {
          img.scaleToWidth(w * 0.48);
          img.set({
            left: (w - (w * 0.48)) / 2,
            top: h * 0.16,
            selectable: true,
          });
          canvas.add(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });

        // Offer Pill
        const pill = new fabric.Rect({
          left: w * 0.06,
          top: h * 0.60,
          width: 170,
          height: 30,
          rx: 4,
          ry: 4,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const pillText = new fabric.IText(copy.badgeText, {
          left: w * 0.06 + 16,
          top: h * 0.60 + 7,
          fontSize: 11,
          fontWeight: '900',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(pill, pillText);

        // Headline H1
        const headline = new fabric.IText(copy.headline, {
          left: w * 0.06,
          top: h * 0.66,
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
          top: h * 0.77,
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
          top: h * 0.86,
          width: 170,
          height: 42,
          rx: 6,
          ry: 6,
          fill: currentBrand.colors.primary,
          selectable: true,
        });
        const ctaText = new fabric.IText(copy.ctaText, {
          left: w * 0.68 + 22,
          top: h * 0.86 + 12,
          fontSize: 12,
          fontWeight: '800',
          fill: '#ffffff',
          fontFamily: currentBrand.typography.headlineFont,
          selectable: true,
        });
        canvas.add(ctaBg, ctaText);

        // Footer URL
        const urlText = new fabric.IText(`● ${currentBrand.website}`, {
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

      canvas.renderAll();
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

    const bgColors = [currentBrand.colors.backgroundDark, '#18181b', '#1e1e1e', '#121214', '#262626'];
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
          docConfig={docConfig}
          onChangeDocConfig={setDocConfig}
          onOpenNewDocumentModal={() => setIsNewDocModalOpen(true)}
          briefPrompt={briefPrompt}
          onChangeBrief={setBriefPrompt}
          visualSubjectPrompt={visualSubjectPrompt}
          onChangeVisualSubject={setVisualSubjectPrompt}
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
        initialBrand={currentBrand}
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
