import React, { useState } from 'react';
import { 
  Sparkles, X, Wand2, Scissors, Image as ImageIcon, 
  Check, Download, Layers, ShieldCheck, Cpu, ArrowRight 
} from 'lucide-react';
import { 
  generateStudioImage, 
  PROMPT_INSPIRATION_PRESETS,
  type AiStudioGenerationResult 
} from '../services/localAiImageStudio';
import type { ApiSettings } from '../types';

interface LocalAiImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiSettings?: ApiSettings;
  onSetAsHeroSubject: (imageUrl: string, title?: string, isCutout?: boolean) => void;
  onInsertToCanvas: (imageUrl: string) => void;
}

export const LocalAiImageModal: React.FC<LocalAiImageModalProps> = ({
  isOpen,
  onClose,
  apiSettings,
  onSetAsHeroSubject,
  onInsertToCanvas,
}) => {
  const [prompt, setPrompt] = useState('Mujer celebrando con su celular en la mano alzada, feliz y viendo al cielo con dicha y felicidad, formato 9:16');
  const [cutoutBackground, setCutoutBackground] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '4:5' | '1:1' | '16:9'>('9:16');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [result, setResult] = useState<AiStudioGenerationResult | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [localEndpoint, setLocalEndpoint] = useState('http://127.0.0.1:7860');
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (p: typeof PROMPT_INSPIRATION_PRESETS[0]) => {
    setPrompt(p.prompt);
    setAspectRatio(p.aspectRatio);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationStep('Analizando y traduciendo prompt con Director de Arte...');

    try {
      setTimeout(() => setGenerationStep('Generando con red neuronal de difusión en tiempo real...'), 400);
      if (cutoutBackground) {
        setTimeout(() => setGenerationStep('Aplicando recorte inteligente de fondo...'), 3500);
      }

      const res = await generateStudioImage({
        prompt,
        cutoutBackground,
        aspectRatio,
        localEndpoint,
        apiSettings,
      });

      setResult(res);
      setShowOriginal(false);
    } catch (err) {
      console.error('Error generando imagen IA:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = (cutoutBackground && !showOriginal && result.cutoutUrl) ? result.cutoutUrl : result.originalUrl;
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoik-ai-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activeDisplayUrl = result 
    ? (cutoutBackground && !showOriginal && result.cutoutUrl) ? result.cutoutUrl : result.originalUrl
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between bg-[#1f1f23]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold tracking-tight">Estudio de Síntesis IA Neuronal</h2>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 mr-0.5 inline" />
                  <span>Difusión en Tiempo Real • Cero Costo</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Escribe cualquier descripción en español. El motor traduce y sintetiza la escena exacta con IA.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scroll flex-1">
          
          {/* PROMPT INPUT */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>¿Qué imagen deseas generar? (Escribe libremente)</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">Español o Inglés</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Ej: Haremos una imagen en la que vemos a una mujer dominicana celebrando con su celular en la mano alzada, feliz y viendo al cielo con dicha..."
              className="w-full bg-[#111113] border border-[#2e2e33] focus:border-indigo-500 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed transition shadow-inner"
            />

            {/* SELECTOR DE PROPORCIÓN / ASPECT RATIO */}
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="text-[10px] text-zinc-400 font-medium mr-1">Formato:</span>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  aspectRatio === '9:16'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[#222226] text-zinc-400 hover:text-white border border-[#2e2e33]'
                }`}
              >
                📱 9:16 (Story / Reel)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('4:5')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  aspectRatio === '4:5'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[#222226] text-zinc-400 hover:text-white border border-[#2e2e33]'
                }`}
              >
                📸 4:5 (Retrato)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  aspectRatio === '1:1'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[#222226] text-zinc-400 hover:text-white border border-[#2e2e33]'
                }`}
              >
                ⏹️ 1:1 (Cuadrado)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  aspectRatio === '16:9'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[#222226] text-zinc-400 hover:text-white border border-[#2e2e33]'
                }`}
              >
                🖥️ 16:9 (Panorámico)
              </button>
            </div>
          </div>

          {/* INSPIRATION CHIPS */}
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Ejemplos Rápidos de Inspiración (1-Clic)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_INSPIRATION_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className="px-2.5 py-1.5 rounded-md bg-[#222226] hover:bg-[#2b2b30] border border-[#333338] text-xs text-zinc-300 hover:text-white transition flex items-center space-x-1.5"
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* GENERATION CONTROLS */}
          <div className="bg-[#131316] border border-[#27272a] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={cutoutBackground}
                onChange={(e) => setCutoutBackground(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-zinc-800 border-zinc-700 focus:ring-0 focus:ring-offset-0"
              />
              <div className="flex items-center space-x-1.5">
                <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-200">
                  Recortar Fondo Automáticamente (PNG Transparente)
                </span>
              </div>
            </label>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center space-x-1"
            >
              <Cpu className="w-3 h-3 text-zinc-400" />
              <span>Servidor Local GPU (Opcional)</span>
            </button>
          </div>

          {/* ADVANCED SERVER SETTINGS */}
          {showAdvanced && (
            <div className="p-3 bg-[#111114] border border-[#2e2e33] rounded-lg space-y-2 text-xs">
              <label className="text-[11px] font-semibold text-zinc-300 block">
                URL de Servidor Difusor Local (Automatic1111 / Forge / SD DirectML)
              </label>
              <input
                type="text"
                value={localEndpoint}
                onChange={(e) => setLocalEndpoint(e.target.value)}
                placeholder="http://127.0.0.1:7860"
                className="w-full bg-[#1b1b1e] border border-[#38383e] rounded px-2.5 py-1.5 text-xs text-white"
              />
              <p className="text-[10px] text-zinc-400">
                Por defecto, Zoik Design utiliza el motor neuronal directo en la nube sin costo ni registro. Si tienes Automatic1111 en tu GPU, puedes ingresar su URL aquí.
              </p>
            </div>
          )}

          {/* GENERATE BUTTON */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-3 rounded-lg font-bold text-xs tracking-wide shadow-md flex items-center justify-center space-x-2 transition ${
              isGenerating || !prompt.trim()
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>{generationStep || 'Sintetizando imagen con red neuronal...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generar Imagen con IA Neuronal</span>
              </>
            )}
          </button>

          {/* PREVIEW OF RESULT */}
          {result && (
            <div className="bg-[#121215] border border-[#2b2b30] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white truncate max-w-sm">
                    {result.title}
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                    {result.aspectRatio}
                  </span>
                </div>
                
                {result.cutoutUrl && (
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    {showOriginal ? 'Ver Versión Recortada' : 'Ver Fondo Original'}
                  </button>
                )}
              </div>

              {/* IMAGE CANVAS PREVIEW */}
              <div 
                className="w-full h-80 rounded-lg border border-[#2e2e33] flex items-center justify-center overflow-hidden relative"
                style={{
                  backgroundImage: !showOriginal && cutoutBackground
                    ? 'repeating-conic-gradient(#202025 0% 25%, #18181d 0% 50%) 50% / 20px 20px'
                    : 'none',
                  backgroundColor: '#0a0a0d'
                }}
              >
                <img
                  src={activeDisplayUrl}
                  alt={result.title}
                  className="max-h-full max-w-full object-contain filter drop-shadow-2xl"
                />
              </div>

              {/* INTEGRATION ACTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => {
                    onSetAsHeroSubject(activeDisplayUrl, result.title, cutoutBackground && !showOriginal);
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{cutoutBackground && !showOriginal ? 'Usar como Protagonista' : 'Establecer como Fondo'}</span>
                </button>

                <button
                  onClick={() => {
                    onInsertToCanvas(activeDisplayUrl);
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-lg bg-[#27272e] hover:bg-[#33333d] border border-[#3e3e48] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Insertar como Capa</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="py-2.5 px-3 rounded-lg bg-[#27272e] hover:bg-[#33333d] border border-[#3e3e48] text-zinc-300 hover:text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PNG</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-[#27272a] bg-[#141416] flex items-center justify-between text-[11px] text-zinc-500">
          <span>Zoik Design • Síntesis Neuronal con Traducción de Director de Arte</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
