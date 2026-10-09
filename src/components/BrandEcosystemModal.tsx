import React, { useRef } from 'react';
import type { BrandKit } from '../types';
import { 
  X, Upload, Sparkles, Image as ImageIcon, Trash2, 
  Layers, Plus 
} from 'lucide-react';

interface BrandEcosystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: BrandKit;
  onUpdateBrand: (updated: BrandKit) => void;
  onSelectSampleForInspiration: (sampleUrl: string) => void;
}

export const BrandEcosystemModal: React.FC<BrandEcosystemModalProps> = ({
  isOpen,
  onClose,
  brand,
  onUpdateBrand,
  onSelectSampleForInspiration,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const samplePieces = brand.samplePieces || [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&q=80',
    'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=500&q=80',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newSamples = [...samplePieces];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newSamples.unshift(event.target.result as string);
          onUpdateBrand({
            ...brand,
            samplePieces: newSamples,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteSample = (index: number) => {
    const updated = samplePieces.filter((_, i) => i !== index);
    onUpdateBrand({
      ...brand,
      samplePieces: updated,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#18181b] border-2 border-purple-500/30 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl shadow-purple-900/20 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* HEADER: ILLUSTRATOR PRO WORKSTATION STYLE */}
        <div className="px-6 py-4 border-b border-[#27272a] bg-[#141416] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-white text-base tracking-tight">Ecosistema Visual de Marca</h3>
                <span className="text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold uppercase">
                  {brand.name}
                </span>
              </div>
              <p className="text-xs text-zinc-400">Piezas de referencia, estilo corporativo y activos visuales de entrenamiento</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto custom-scroll space-y-6 text-xs flex-1 bg-[#18181b]">
          
          {/* UPLOAD DROPZONE / ACTION BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-dashed border-purple-500/40 bg-purple-950/10 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Subir Piezas Gráficas de Ejemplo</h4>
                <p className="text-zinc-400 text-xs">Añade imágenes de campañas anteriores, posts, volantes o guías de estilo para esta marca.</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center space-x-1.5 transition transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Subir Imágenes desde PC</span>
              </button>
            </div>
          </div>

          {/* BRAND ASSET SPECS BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#202024] border border-[#2e2e33]">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Paleta Corporativa</span>
              <div className="flex items-center space-x-1.5">
                <div className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: brand.colors.primary }} />
                <div className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: brand.colors.secondary }} />
                <div className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: brand.colors.accent }} />
                <div className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: brand.colors.backgroundDark }} />
                <span className="text-zinc-300 font-mono text-[11px] ml-1">{brand.colors.primary}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Tipografías Definidas</span>
              <span className="font-bold text-white block truncate">{brand.typography.headlineFont}</span>
              <span className="text-[11px] text-zinc-400 block truncate">{brand.typography.bodyFont}</span>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Total de Piezas en Ecosistema</span>
              <span className="text-sm font-extrabold text-purple-400">{samplePieces.length} Referencias Activas</span>
            </div>
          </div>

          {/* GALLERY OF SAMPLE PIECES */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-white flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>Piezas de Referencia en el Ecosistema ({samplePieces.length})</span>
              </span>
              <span className="text-[11px] text-zinc-400">Haz clic en una pieza para tomarla como referencia</span>
            </div>

            {samplePieces.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[#2e2e33] rounded-2xl text-zinc-500">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay piezas de ejemplo subidas aún para esta marca.</p>
                <p className="text-[11px] text-zinc-600 mt-1">Sube tus diseños de Illustrator, Photoshop o Canva para entrenar el estilo visual.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {samplePieces.map((imgUrl, idx) => (
                  <div 
                    key={idx}
                    className="group relative rounded-xl overflow-hidden border border-[#2e2e33] hover:border-purple-500 bg-[#121214] aspect-square transition shadow-sm"
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Referencia ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    />

                    {/* Gradient Overlay & Actions on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2.5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteSample(idx)}
                          className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white shadow-sm transition"
                          title="Eliminar del ecosistema"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            onSelectSampleForInspiration(imgUrl);
                            onClose();
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center space-x-1 shadow transition"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Inspirar IA con Esta Pieza</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 border-t border-[#27272a] bg-[#141416] flex justify-between items-center text-xs">
          <span className="text-zinc-400 text-[11px]">Las piezas subidas se almacenan localmente en tu PC para esta marca.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition"
          >
            Listo / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
