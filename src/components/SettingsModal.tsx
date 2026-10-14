import React, { useState } from 'react';
import type { ApiSettings } from '../types';
import { X, Key, ShieldCheck, Cpu, ExternalLink, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSaveSettings: (settings: ApiSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  if (!isOpen) return null;

  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey || '');
  const [freepikKey, setFreepikKey] = useState(settings.freepikApiKey || '');
  const [enableLive, setEnableLive] = useState(settings.enableLiveOpenAi ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      openaiApiKey: openaiKey.trim(),
      freepikApiKey: freepikKey.trim(),
      enableLiveOpenAi: enableLive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#262626] border border-[#3e3e3e] rounded-lg w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-xs text-[#d4d4d8]">
        
        {/* HEADER */}
        <div className="px-5 py-3 border-b border-[#383838] bg-[#1e1e1e] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-[#388bff]" />
            <h3 className="font-bold text-sm text-white">Preferencias de API & IA</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#333333] transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="bg-[#1e1e1e] border border-[#383838] rounded p-3 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#388bff] shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Tus claves de API se guardan de forma local en tu ordenador y se comunican directamente con OpenAI y Freepik. Zoik Design nunca almacena tus credenciales en servidores externos.
            </p>
          </div>

          {/* OpenAI API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-zinc-300">OpenAI API Key (GPT-4o & DALL-E)</label>
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-[#388bff] hover:underline flex items-center space-x-0.5"
              >
                <span>Obtener clave</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-[#1e1e1e] border border-[#383838] focus:border-[#0d66d0] rounded p-2 text-xs text-white font-mono focus:outline-none"
            />
          </div>

          {/* Freepik API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-zinc-300">Freepik API Key (Vectores & Stock)</label>
              <a 
                href="https://developer.freepik.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-[#388bff] hover:underline flex items-center space-x-0.5"
              >
                <span>Portal Desarrolladores</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={freepikKey}
              onChange={(e) => setFreepikKey(e.target.value)}
              placeholder="FPSX..."
              className="w-full bg-[#1e1e1e] border border-[#383838] focus:border-[#0d66d0] rounded p-2 text-xs text-white font-mono focus:outline-none"
            />
          </div>

          {/* Live Switch */}
          <div className="pt-2 border-t border-[#383838]">
            <label className="flex items-center justify-between cursor-pointer p-2.5 rounded bg-[#1e1e1e] border border-[#383838]">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#388bff]" />
                <div>
                  <span className="font-semibold text-white block text-xs">Activar Llamadas en Vivo a OpenAI</span>
                  <span className="text-[10px] text-zinc-400 block">Si está desactivado, usa el Director de Arte Algorítmico local (sin consumo de tokens)</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableLive}
                onChange={(e) => setEnableLive(e.target.checked)}
                className="w-4 h-4 rounded bg-[#262626] border-[#383838] cursor-pointer"
              />
            </label>
          </div>

          {/* FOOTER */}
          <div className="pt-3 border-t border-[#383838] flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded bg-[#333333] hover:bg-[#3e3e3e] text-zinc-300 font-medium text-xs transition"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#0d66d0] hover:bg-[#1070e5] text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Configuración</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
