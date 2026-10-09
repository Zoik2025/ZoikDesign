import React, { useState } from 'react';
import type { BrandKit } from '../types';
import { X, Save, Palette, Type, Sparkles } from 'lucide-react';
import { FONT_CATALOG, PALETTE_PRESETS, loadGoogleFont } from '../data/typographyAndColors';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBrand: (newBrand: BrandKit) => void;
  initialBrand?: BrandKit;
}

export const BrandKitModal: React.FC<BrandKitModalProps> = ({
  isOpen,
  onClose,
  onSaveBrand,
  initialBrand,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(initialBrand?.name || '');
  const [tagline, setTagline] = useState(initialBrand?.tagline || '');
  const [industry, setIndustry] = useState(initialBrand?.industry || 'Comercio & Servicios');
  const [tone, setTone] = useState<BrandKit['tone']>(initialBrand?.tone || 'modern');
  
  // Colors
  const [primaryColor, setPrimaryColor] = useState(initialBrand?.colors.primary || '#6366f1');
  const [secondaryColor, setSecondaryColor] = useState(initialBrand?.colors.secondary || '#06b6d4');
  const [accentColor, setAccentColor] = useState(initialBrand?.colors.accent || '#8b5cf6');
  const [bgColor, setBgColor] = useState(initialBrand?.colors.backgroundDark || '#0b0f19');
  const [textColor, setTextColor] = useState(initialBrand?.colors.textPrimary || '#ffffff');

  // Fonts
  const [headlineFont, setHeadlineFont] = useState(initialBrand?.typography.headlineFont || 'Space Grotesk');
  const [bodyFont, setBodyFont] = useState(initialBrand?.typography.bodyFont || 'Plus Jakarta Sans');

  // Logo & Web
  const [logoSymbol, setLogoSymbol] = useState(initialBrand?.logo.symbolText || 'Z');
  const [website, setWebsite] = useState(initialBrand?.website || 'mimarca.com');

  const handleApplyPreset = (preset: typeof PALETTE_PRESETS[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setAccentColor(preset.accent);
    setBgColor(preset.backgroundDark);
    setTextColor(preset.textPrimary);
  };

  const handleHeadlineFontChange = (font: string) => {
    setHeadlineFont(font);
    loadGoogleFont(font);
  };

  const handleBodyFontChange = (font: string) => {
    setBodyFont(font);
    loadGoogleFont(font);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const brandToSave: BrandKit = {
      id: initialBrand?.id || `brand-${Date.now()}`,
      name: name.trim(),
      tagline: tagline.trim(),
      industry: industry.trim(),
      tone,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        backgroundDark: bgColor,
        backgroundLight: '#f8fafc',
        textPrimary: textColor,
        textSecondary: '#94a3b8',
      },
      typography: {
        headlineFont,
        bodyFont,
        accentFont: 'Space Grotesk',
      },
      logo: {
        symbolText: logoSymbol.trim().toUpperCase() || name.substring(0, 1).toUpperCase(),
        fullText: name.trim().toUpperCase(),
      },
      website: website.trim(),
      contactHandle: `@${name.toLowerCase().replace(/\s+/g, '')}`,
    };

    onSaveBrand(brandToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#121624] border border-[#232c45] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-[#21283d] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">
              {initialBrand ? 'Editar Manual de Marca' : 'Crear Nuevo Manual de Marca'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[78vh] overflow-y-auto custom-scroll text-xs">
          
          {/* General info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nombre de la Marca *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Nova Studio"
                className="w-full bg-[#171d2f] border border-[#26314c] focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Industria o Rubro</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Ej: Moda, Café, Fitness..."
                className="w-full bg-[#171d2f] border border-[#26314c] focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Eslogan o Propuesta de Valor</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej: Diseños de alto impacto visual"
              className="w-full bg-[#171d2f] border border-[#26314c] focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Tono y Personalidad de Marca</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as BrandKit['tone'])}
              className="w-full bg-[#171d2f] border border-[#26314c] focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
            >
              <option value="modern">Moderno & Vanguardista</option>
              <option value="minimal">Minimalista & Sobrio</option>
              <option value="bold">Atrevido & Enérgico (Bold)</option>
              <option value="elegant">Elegante & Premium</option>
              <option value="cyber">Cyberpunk & Futurista</option>
              <option value="playful">Divertido & Juvenil</option>
            </select>
          </div>

          {/* PALETAS DE TENDENCIA RÁPIDAS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Paletas de Color de Tendencia</span>
              </span>
              <span className="text-[10px] text-slate-500">1-Clic</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PALETTE_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className="p-1.5 rounded-lg bg-[#171d2f] hover:bg-[#1d253b] border border-[#26314c] text-left transition flex items-center justify-between"
                >
                  <span className="text-[10px] text-slate-300 truncate mr-1">{p.name}</span>
                  <div className="flex space-x-0.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accent }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.backgroundDark }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PALETA DE COLORES EDITABLE */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Ajuste Fino de la Paleta Cromática
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Color Primario</label>
                <div className="flex items-center space-x-1.5 bg-[#171d2f] p-1.5 rounded-lg border border-[#26314c]">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 bg-transparent text-[11px] font-mono text-white focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Color Secundario</label>
                <div className="flex items-center space-x-1.5 bg-[#171d2f] p-1.5 rounded-lg border border-[#26314c]">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 bg-transparent text-[11px] font-mono text-white focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Color Acento</label>
                <div className="flex items-center space-x-1.5 bg-[#171d2f] p-1.5 rounded-lg border border-[#26314c]">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-16 bg-transparent text-[11px] font-mono text-white focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Fondo Oscuro</label>
                <div className="flex items-center space-x-1.5 bg-[#171d2f] p-1.5 rounded-lg border border-[#26314c]">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-16 bg-transparent text-[11px] font-mono text-white focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Texto Principal</label>
                <div className="flex items-center space-x-1.5 bg-[#171d2f] p-1.5 rounded-lg border border-[#26314c]">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-16 bg-transparent text-[11px] font-mono text-white focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TIPOGRAFÍAS */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center space-x-1">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tipografías Corporativas</span>
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Titulares (H1 / Display)</label>
                <select
                  value={headlineFont}
                  onChange={(e) => handleHeadlineFontChange(e.target.value)}
                  className="w-full bg-[#171d2f] border border-[#26314c] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <optgroup label="Display & Bold">
                    {FONT_CATALOG.filter(f => f.category === 'Display & Bold').map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Luxury & Editorial Serif">
                    {FONT_CATALOG.filter(f => f.category === 'Luxury Serif').map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Modern Sans">
                    {FONT_CATALOG.filter(f => f.category === 'Modern Sans').map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Cyber & Tech">
                    {FONT_CATALOG.filter(f => f.category === 'Cyber & Tech').map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Copys (Lectura / Cuerpo)</label>
                <select
                  value={bodyFont}
                  onChange={(e) => handleBodyFontChange(e.target.value)}
                  className="w-full bg-[#171d2f] border border-[#26314c] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <optgroup label="Modern Sans">
                    {FONT_CATALOG.filter(f => f.category === 'Modern Sans').map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Display & Bold">
                    {FONT_CATALOG.filter(f => f.category === 'Display & Bold').map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Luxury Serif">
                    {FONT_CATALOG.filter(f => f.category === 'Luxury Serif').map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* LOGO SYMBOL & WEBSITE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Símbolo / Inicial del Logo</label>
              <input
                type="text"
                maxLength={3}
                value={logoSymbol}
                onChange={(e) => setLogoSymbol(e.target.value)}
                placeholder="Z"
                className="w-full bg-[#171d2f] border border-[#26314c] focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none font-bold uppercase"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Sitio Web / Enlace</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="mimarca.com"
                className="w-full bg-[#171d2f] border border-[#26314c] focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-3 border-t border-[#21283d] flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Manual de Marca</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
