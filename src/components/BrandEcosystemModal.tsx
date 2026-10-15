import React, { useRef, useState } from 'react';
import type { BrandKit, BrandReferencePiece } from '../types';
import { 
  X, Upload, Trash2, Layers, Plus, 
  Check, Info, Sparkles, Image as ImageIcon 
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
  const [editingRefId, setEditingRefId] = useState<string | null>(null);

  if (!isOpen) return null;

  const referencePieces: BrandReferencePiece[] = brand.referencePieces || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPieces: BrandReferencePiece[] = [...referencePieces];

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const piece: BrandReferencePiece = {
            id: `ref-${Date.now()}-${index}`,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            imageUrl: event.target.result as string,
            format: '4:5',
            layoutStructure: 'split-left-right',
            hierarchyNotes: 'Titular H1 destacado, producto en segundo tercio, badge y botón inferior.',
          };
          newPieces.unshift(piece);
          onUpdateBrand({
            ...brand,
            referencePieces: newPieces,
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleUpdatePiece = (id: string, updates: Partial<BrandReferencePiece>) => {
    const updated = referencePieces.map(piece => {
      if (piece.id === id) {
        return { ...piece, ...updates };
      }
      return piece;
    });
    onUpdateBrand({
      ...brand,
      referencePieces: updated,
    });
  };

  const handleDeletePiece = (id: string) => {
    const updated = referencePieces.filter(piece => piece.id !== id);
    onUpdateBrand({
      ...brand,
      referencePieces: updated,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#262626] border border-[#3e3e3e] rounded-lg w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] text-xs text-[#d4d4d8]">
        
        {/* HEADER: ILLUSTRATOR MINIMALIST WORKSTATION */}
        <div className="px-5 py-3 border-b border-[#383838] bg-[#1e1e1e] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-[#2e2e2e] border border-[#444444] flex items-center justify-center text-zinc-300">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-sm">Piezas de Referencia del Kit de Marca</h3>
                <span className="text-[10px] bg-[#333333] text-zinc-300 px-2 py-0.5 rounded border border-[#444444] font-semibold">
                  {brand.name}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                La IA analiza estas imágenes de ejemplo para determinar cómo organizar titulares, jerarquías y productos.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#333333] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto custom-scroll space-y-5 flex-1 bg-[#222222]">
          
          {/* UPLOAD STRIP */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded border border-dashed border-[#444444] bg-[#282828] gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded bg-[#333333] flex items-center justify-center text-white shrink-0 border border-[#444444]">
                <Upload className="w-4 h-4 text-[#388bff]" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Subir piezas de referencia de tu marca</h4>
                <p className="text-[11px] text-zinc-400">
                  Sube diseños previos (JPG, PNG, SVG). Servirán de guía visual para las nuevas piezas generadas.
                </p>
              </div>
            </div>

            <input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded bg-[#0d66d0] hover:bg-[#1070e5] text-white font-semibold transition shrink-0 flex items-center space-x-1.5 shadow-sm text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Referencias</span>
            </button>
          </div>

          {/* REFERENCE PIECES GRID */}
          <div>
            <div className="flex items-center justify-between text-zinc-400 font-semibold mb-2.5 text-xs">
              <span>Biblioteca de Estilo & Jerarquías ({referencePieces.length})</span>
              <span className="text-[11px] text-zinc-500 font-mono">Guías Activas para IA</span>
            </div>

            {referencePieces.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 border border-[#333333] rounded bg-[#262626]">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No hay piezas de referencia en este manual de marca aún.</p>
                <p className="text-[11px] text-zinc-400 mt-1">Sube 2 o 3 imágenes para que la IA entienda el estilo visual de tu marca.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {referencePieces.map((piece) => (
                  <div 
                    key={piece.id}
                    className="bg-[#282828] border border-[#383838] rounded p-3 flex flex-col justify-between hover:border-[#4a4a4a] transition"
                  >
                    <div className="flex space-x-3 mb-2.5">
                      {/* Image Thumbnail */}
                      <img 
                        src={piece.imageUrl} 
                        alt={piece.title} 
                        className="w-20 h-24 rounded object-cover bg-black border border-[#444444] shrink-0"
                      />

                      {/* Info & Structure Metadata */}
                      <div className="flex-1 space-y-1.5 overflow-hidden">
                        <input
                          type="text"
                          value={piece.title}
                          onChange={(e) => handleUpdatePiece(piece.id, { title: e.target.value })}
                          className="w-full bg-[#1e1e1e] border border-[#3e3e3e] focus:border-[#0d66d0] rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none"
                          placeholder="Nombre de la referencia"
                        />

                        {/* Layout Structure Archetype */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-zinc-400 font-medium">Estructura:</span>
                          <select
                            value={piece.layoutStructure}
                            onChange={(e) => handleUpdatePiece(piece.id, { layoutStructure: e.target.value as any })}
                            className="bg-[#1e1e1e] border border-[#3e3e3e] text-zinc-200 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
                          >
                            <option value="hero-split">Hero Split (Texto izq / Foto der)</option>
                            <option value="hero-center">Hero Central (Producto al centro)</option>
                            <option value="minimal-editorial">Editorial Minimal (Tipografía limpia)</option>
                            <option value="promo-bold">Promo Bold (Titular masivo & badge)</option>
                            <option value="story-vertical">Story 9:16 (Composición vertical)</option>
                          </select>
                        </div>

                        {/* Format selector */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-zinc-400 font-medium">Formato:</span>
                          <select
                            value={piece.format || '4:5'}
                            onChange={(e) => handleUpdatePiece(piece.id, { format: e.target.value as any })}
                            className="bg-[#1e1e1e] border border-[#3e3e3e] text-zinc-200 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
                          >
                            <option value="4:5">Retrato (4:5)</option>
                            <option value="1:1">Cuadrado (1:1)</option>
                            <option value="9:16">Story (9:16)</option>
                            <option value="16:9">Panorámico (16:9)</option>
                            <option value="custom">Personalizado</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Hierarchy notes */}
                    <div className="pt-2 border-t border-[#333333]">
                      <span className="text-[10px] text-zinc-400 block mb-1">
                        Reglas de Jerarquía que transmite a la IA:
                      </span>
                      <textarea
                        rows={2}
                        value={piece.hierarchyNotes || ''}
                        onChange={(e) => handleUpdatePiece(piece.id, { hierarchyNotes: e.target.value })}
                        className="w-full bg-[#1e1e1e] border border-[#3e3e3e] focus:border-[#0d66d0] rounded p-1.5 text-[11px] text-zinc-300 placeholder-zinc-500 focus:outline-none resize-none"
                        placeholder="Ej: Titular superior grande, producto al centro con sombra, badge de precio..."
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 mt-1">
                      <button
                        onClick={() => {
                          onSelectSampleForInspiration(piece.imageUrl);
                          onClose();
                        }}
                        className="text-[11px] text-[#388bff] hover:underline"
                        title="Pegar esta imagen de muestra en el lienzo de trabajo"
                      >
                        Insertar muestra en lienzo
                      </button>

                      <button
                        onClick={() => handleDeletePiece(piece.id)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-[#333333] transition"
                        title="Eliminar esta pieza de referencia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-2.5 bg-[#1e1e1e] border-t border-[#383838] flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Los cambios se guardan automáticamente en este kit de marca.
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-[#333333] hover:bg-[#3e3e3e] text-white font-semibold transition text-xs"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
