import React, { useState } from 'react';
import type { DocumentConfig, DocumentUnit, ColorMode } from '../types';
import { X, FilePlus, Smartphone, Printer, Layout, Check } from 'lucide-react';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDocument: (config: DocumentConfig) => void;
}

interface PresetOption {
  id: string;
  category: 'social' | 'print';
  name: string;
  sub: string;
  valW: number;
  valH: number;
  unit: DocumentUnit;
  colorMode: ColorMode;
  dpi: number;
}

const PRESETS: PresetOption[] = [
  // Redes / Web
  { id: 'ig-post', category: 'social', name: 'Post Instagram', sub: '1080 × 1080 px', valW: 1080, valH: 1080, unit: 'px', colorMode: 'RGB', dpi: 72 },
  { id: 'ig-story', category: 'social', name: 'Story / Reel / TikTok', sub: '1080 × 1920 px', valW: 1080, valH: 1920, unit: 'px', colorMode: 'RGB', dpi: 72 },
  { id: 'ig-portrait', category: 'social', name: 'Retrato Instagram', sub: '1080 × 1350 px', valW: 1080, valH: 1350, unit: 'px', colorMode: 'RGB', dpi: 72 },
  { id: 'web-banner', category: 'social', name: 'Banner Web / LinkedIn', sub: '1200 × 630 px', valW: 1200, valH: 630, unit: 'px', colorMode: 'RGB', dpi: 72 },
  { id: 'fhd', category: 'social', name: 'Full HD Landscape', sub: '1920 × 1080 px', valW: 1920, valH: 1080, unit: 'px', colorMode: 'RGB', dpi: 72 },
  
  // Impresión
  { id: 'a4', category: 'print', name: 'Hoja A4', sub: '21 × 29.7 cm', valW: 21, valH: 29.7, unit: 'cm', colorMode: 'CMYK', dpi: 300 },
  { id: 'letter', category: 'print', name: 'Carta (Letter)', sub: '21.59 × 27.94 cm', valW: 21.59, valH: 27.94, unit: 'cm', colorMode: 'CMYK', dpi: 300 },
  { id: 'flyer-a5', category: 'print', name: 'Volante / Flyer A5', sub: '14.8 × 21 cm', valW: 14.8, valH: 21, unit: 'cm', colorMode: 'CMYK', dpi: 300 },
  { id: 'tarjeta', category: 'print', name: 'Tarjeta Presentación', sub: '9 × 5 cm', valW: 9, valH: 5, unit: 'cm', colorMode: 'CMYK', dpi: 300 },
  { id: 'pendon', category: 'print', name: 'Pendón / Valla Exterior', sub: '1 × 2 metros', valW: 1, valH: 2, unit: 'm', colorMode: 'CMYK', dpi: 150 },
];

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  onCreateDocument,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'social' | 'print'>('social');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ig-post');

  // Form state
  const [title, setTitle] = useState('Pieza_Zoik_01');
  const [valW, setValW] = useState<number>(1080);
  const [valH, setValH] = useState<number>(1080);
  const [unit, setUnit] = useState<DocumentUnit>('px');
  const [colorMode, setColorMode] = useState<ColorMode>('RGB');
  const [dpi, setDpi] = useState<number>(72);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const handleSelectPreset = (p: PresetOption) => {
    setSelectedPresetId(p.id);
    setValW(p.valW);
    setValH(p.valH);
    setUnit(p.unit);
    setColorMode(p.colorMode);
    setDpi(p.dpi);
    setOrientation(p.valW > p.valH ? 'landscape' : 'portrait');
  };

  const handleSwapOrientation = (target: 'portrait' | 'landscape') => {
    setOrientation(target);
    if (target === 'landscape' && valW < valH) {
      setValW(valH);
      setValH(valW);
    } else if (target === 'portrait' && valW > valH) {
      setValW(valH);
      setValH(valW);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert display values to pixels for Fabric.js
    let pixelW = valW;
    let pixelH = valH;

    if (unit === 'cm') {
      pixelW = Math.round((valW / 2.54) * (dpi || 96));
      pixelH = Math.round((valH / 2.54) * (dpi || 96));
    } else if (unit === 'mm') {
      pixelW = Math.round((valW / 25.4) * (dpi || 96));
      pixelH = Math.round((valH / 25.4) * (dpi || 96));
    } else if (unit === 'm') {
      pixelW = Math.round(((valW * 100) / 2.54) * (dpi || 96));
      pixelH = Math.round(((valH * 100) / 2.54) * (dpi || 96));
    } else if (unit === 'in') {
      pixelW = Math.round(valW * (dpi || 96));
      pixelH = Math.round(valH * (dpi || 96));
    }

    // Limit maximum canvas pixel size to avoid GPU memory overflow on huge billboards
    const maxDimension = 3840;
    if (pixelW > maxDimension || pixelH > maxDimension) {
      const ratio = pixelW / pixelH;
      if (pixelW > pixelH) {
        pixelW = maxDimension;
        pixelH = Math.round(maxDimension / ratio);
      } else {
        pixelH = maxDimension;
        pixelW = Math.round(maxDimension * ratio);
      }
    }

    const config: DocumentConfig = {
      title: title.trim() || 'Nuevo_Diseno',
      width: Math.max(200, pixelW),
      height: Math.max(200, pixelH),
      displayValueWidth: valW,
      displayValueHeight: valH,
      unit,
      colorMode,
      dpi,
      orientation,
    };

    onCreateDocument(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#18181b] border-2 border-purple-500/40 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#27272a] bg-[#141416] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <FilePlus className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Nuevo Documento</h3>
              <p className="text-xs text-zinc-400 font-sans">Elige un ajuste preestablecido o define dimensiones personalizadas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY (TWO COLUMNS: PRESETS ON LEFT, DETAILS ON RIGHT) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: PRESETS */}
          <div className="flex-1 p-5 border-r border-[#27272a] overflow-y-auto custom-scroll space-y-4">
            
            {/* TABS */}
            <div className="flex space-x-2 border-b border-[#27272a] pb-3">
              <button
                onClick={() => setActiveTab('social')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'social'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Web / Móvil / Redes</span>
              </button>

              <button
                onClick={() => setActiveTab('print')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'print'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Impresión / Papelería</span>
              </button>
            </div>

            {/* PRESETS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESETS.filter(p => p.category === activeTab).map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/20 shadow-md shadow-purple-950/40 ring-1 ring-purple-500'
                        : 'border-[#27272a] bg-[#202024] hover:bg-[#28282e] text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="h-14 rounded-lg bg-[#141416] border border-[#2e2e34] mb-2 flex items-center justify-center text-zinc-500">
                        <Layout className={`w-5 h-5 ${isSelected ? 'text-purple-400' : 'text-zinc-600'}`} />
                      </div>
                      <h4 className="font-bold text-xs text-white leading-tight truncate">{p.name}</h4>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{p.sub}</p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-[#2a2a30] flex items-center justify-between text-[10px] text-zinc-500">
                      <span>{p.colorMode}</span>
                      <span>{p.dpi} DPI</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT: DOCUMENT SPECS INSPECTOR */}
          <form onSubmit={handleCreate} className="w-80 p-5 bg-[#141416] flex flex-col justify-between overflow-y-auto custom-scroll text-xs">
            <div className="space-y-4">
              <span className="font-extrabold text-white text-xs tracking-wider uppercase block pb-2 border-b border-[#27272a]">
                Detalles del Ajuste
              </span>

              {/* Title */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Nombre del Archivo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#202024] border border-[#2e2e34] focus:border-purple-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Width & Height & Units */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Anchura</label>
                  <input
                    type="number"
                    step="any"
                    value={valW}
                    onChange={(e) => setValW(Number(e.target.value))}
                    className="w-full bg-[#202024] border border-[#2e2e34] focus:border-purple-500 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Altura</label>
                  <input
                    type="number"
                    step="any"
                    value={valH}
                    onChange={(e) => setValH(Number(e.target.value))}
                    className="w-full bg-[#202024] border border-[#2e2e34] focus:border-purple-500 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Units Dropdown */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Unidad de Medida</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as DocumentUnit)}
                  className="w-full bg-[#202024] border border-[#2e2e34] rounded-lg p-2.5 text-xs text-white focus:outline-none font-semibold"
                >
                  <option value="px">Píxeles (px)</option>
                  <option value="cm">Centímetros (cm)</option>
                  <option value="mm">Milímetros (mm)</option>
                  <option value="m">Metros (m)</option>
                  <option value="in">Pulgadas (in)</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Orientación</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwapOrientation('portrait')}
                    className={`py-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                      orientation === 'portrait'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-[#202024] border-[#2e2e34] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>Vertical</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwapOrientation('landscape')}
                    className={`py-2 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                      orientation === 'landscape'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-[#202024] border-[#2e2e34] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>Horizontal</span>
                  </button>
                </div>
              </div>

              {/* Color Mode: RGB vs CMYK */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Modo de Color</label>
                <select
                  value={colorMode}
                  onChange={(e) => setColorMode(e.target.value as ColorMode)}
                  className="w-full bg-[#202024] border border-[#2e2e34] rounded-lg p-2.5 text-xs text-white focus:outline-none font-semibold"
                >
                  <option value="RGB">Color RGB (Pantallas / Redes / Web)</option>
                  <option value="CMYK">Color CMYK (Imprenta / Separación 4 Tintas)</option>
                </select>
              </div>

              {/* Resolution / DPI */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Efectos de Rasterizado / Resolución</label>
                <select
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                  className="w-full bg-[#202024] border border-[#2e2e34] rounded-lg p-2.5 text-xs text-white focus:outline-none font-semibold font-mono"
                >
                  <option value={300}>Alta (300 ppp / DPI) - Impresión</option>
                  <option value={150}>Media (150 ppp / DPI)</option>
                  <option value={72}>Pantalla (72 ppp / DPI) - Web</option>
                </select>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-[#27272a] space-y-2 mt-4">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition"
              >
                <Check className="w-4 h-4" />
                <span>Crear Mesa de Trabajo</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition"
              >
                Cancelar
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
