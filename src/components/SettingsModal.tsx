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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#121624] border border-[#232c45] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-[#21283d] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Conexiones de API & IA</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-200 leading-relaxed">
              Tus claves de API se guardan de forma local en tu PC y se comunican directamente con los servidores oficiales de OpenAI y Freepik. Zoik Design nunca almacena tus credenciales en servidores externos.
            </p>
          </div>

          {/* OpenAI API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-300">OpenAI API Key (GPT-4o & DALL-E)</label>
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-indigo-400 hover:underline flex items-center space-x-0.5"
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
              className="w-full bg-[#171d2f] border border-[#26314c] focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none"
            />
          </div>

          {/* Freepik API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-300">Freepik API Key (Vectores & Stock)</label>
              <a 
                href="https://developer.freepik.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-indigo-400 hover:underline flex items-center space-x-0.5"
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
              className="w-full bg-[#171d2f] border border-[#26314c] focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none"
            />
          </div>

          {/* Live Switch */}
          <div className="pt-2 border-t border-[#21283d]">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-[#171d2f] border border-[#26314c]">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="font-semibold text-white block text-xs">Activar Llamadas en Vivo a OpenAI</span>
                  <span className="text-[10px] text-slate-400 block">Si está desactivado, usa el Director de Arte Algorítmico local (sin consumo de tokens)</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableLive}
                onChange={(e) => setEnableLive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-[#101422] border-[#26314c] focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

          {/* FOOTER */}
          <div className="pt-3 border-t border-[#21283d] flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 transition"
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
