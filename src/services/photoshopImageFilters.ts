import { fabric } from 'fabric';

export interface PhotoshopImageAdjustments {
  brightness: number; // -100 a 100
  contrast: number;   // -100 a 100
  saturation: number; // -100 a 100
  vibrance: number;   // -100 a 100
  hue: number;        // -180 a 180
  blur: number;       // 0 a 100
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  blendMode: string;  // 'source-over' | 'multiply' | 'screen' | 'overlay' | etc.
  opacity: number;    // 0 a 100
}

export const DEFAULT_ADJUSTMENTS: PhotoshopImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  vibrance: 0,
  hue: 0,
  blur: 0,
  grayscale: false,
  sepia: false,
  invert: false,
  blendMode: 'source-over',
  opacity: 100,
};

export interface PhotoshopPreset {
  id: string;
  name: string;
  icon: string;
  adjustments: Partial<PhotoshopImageAdjustments>;
}

export const PHOTOSHOP_PRESETS: PhotoshopPreset[] = [
  {
    id: 'original',
    name: 'Original',
    icon: '✨',
    adjustments: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      vibrance: 0,
      hue: 0,
      blur: 0,
      grayscale: false,
      sepia: false,
      invert: false,
    },
  },
  {
    id: 'teal-orange',
    name: 'Teal & Orange (Cine)',
    icon: '🎬',
    adjustments: {
      contrast: 25,
      saturation: 20,
      vibrance: 20,
      hue: -10,
      brightness: 5,
    },
  },
  {
    id: 'vibrant-pop',
    name: 'Pop Vibrante',
    icon: '🔥',
    adjustments: {
      contrast: 20,
      saturation: 45,
      vibrance: 35,
      brightness: 4,
    },
  },
  {
    id: 'noir-bw',
    name: 'Noir (B&W)',
    icon: '🕶️',
    adjustments: {
      grayscale: true,
      contrast: 38,
      brightness: -5,
    },
  },
  {
    id: 'warm-vintage',
    name: 'Cálido Vintage',
    icon: '🌅',
    adjustments: {
      sepia: true,
      contrast: 15,
      brightness: 8,
      saturation: -10,
    },
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    icon: '⚡',
    adjustments: {
      contrast: 40,
      saturation: 50,
      hue: 85,
      brightness: 5,
    },
  },
  {
    id: 'editorial-fade',
    name: 'Editorial Fade',
    icon: '📖',
    adjustments: {
      contrast: -15,
      brightness: 12,
      saturation: -20,
    },
  },
];

export const PHOTOSHOP_BLEND_MODES = [
  { label: 'Normal', value: 'source-over' },
  { label: 'Multiplicar (Multiply)', value: 'multiply' },
  { label: 'Trama (Screen)', value: 'screen' },
  { label: 'Superponer (Overlay)', value: 'overlay' },
  { label: 'Luz Suave (Soft Light)', value: 'soft-light' },
  { label: 'Luz Intensa (Hard Light)', value: 'hard-light' },
  { label: 'Oscurecer (Darken)', value: 'darken' },
  { label: 'Aclarar (Lighten)', value: 'lighten' },
  { label: 'Esquivar Color (Color Dodge)', value: 'color-dodge' },
  { label: 'Quemar Color (Color Burn)', value: 'color-burn' },
  { label: 'Diferencia (Difference)', value: 'difference' },
  { label: 'Exclusión (Exclusion)', value: 'exclusion' },
];

/**
 * Aplica la cadena completa de filtros y modos de fusión de Photoshop a una imagen en Fabric.js
 */
export function applyPhotoshopAdjustments(
  img: fabric.Image,
  adj: PhotoshopImageAdjustments,
  canvas?: fabric.Canvas | null
): void {
  const filters: fabric.IBaseFilter[] = [];

  // 1. Brillo (-100..100 -> -1..1)
  if (adj.brightness !== 0) {
    filters.push(new fabric.Image.filters.Brightness({ brightness: adj.brightness / 100 }));
  }

  // 2. Contraste (-100..100 -> -1..1)
  if (adj.contrast !== 0) {
    filters.push(new fabric.Image.filters.Contrast({ contrast: adj.contrast / 100 }));
  }

  // 3. Saturación (-100..100 -> -1..1)
  if (adj.saturation !== 0) {
    filters.push(new fabric.Image.filters.Saturation({ saturation: adj.saturation / 100 }));
  }

  // 4. Intensidad / Vibrance (-100..100 -> -1..1)
  if (adj.vibrance !== 0 && (fabric.Image.filters as any).Vibrance) {
    filters.push(new (fabric.Image.filters as any).Vibrance({ vibrance: adj.vibrance / 100 }));
  }

  // 5. Tono / Rotación de Hue (-180..180 -> -1..1)
  if (adj.hue !== 0 && fabric.Image.filters.HueRotation) {
    filters.push(new fabric.Image.filters.HueRotation({ rotation: adj.hue / 180 }));
  }

  // 6. Desenfoque Gaussiano / Blur (0..100 -> 0..1)
  if (adj.blur > 0 && fabric.Image.filters.Blur) {
    filters.push(new fabric.Image.filters.Blur({ blur: adj.blur / 100 }));
  }

  // 7. Blanco y Negro / Grayscale
  if (adj.grayscale && fabric.Image.filters.Grayscale) {
    filters.push(new fabric.Image.filters.Grayscale());
  }

  // 8. Sepia
  if (adj.sepia && (fabric.Image.filters as any).Sepia) {
    filters.push(new (fabric.Image.filters as any).Sepia());
  }

  // 9. Invertir colores
  if (adj.invert && fabric.Image.filters.Invert) {
    filters.push(new fabric.Image.filters.Invert());
  }

  img.filters = filters;
  img.applyFilters();

  // Modo de fusión (GlobalCompositeOperation)
  img.set('globalCompositeOperation', adj.blendMode || 'source-over');

  // Opacidad
  img.set('opacity', Math.max(0, Math.min(100, adj.opacity)) / 100);

  if (canvas) {
    canvas.renderAll();
  }
}

/**
 * Voltear Horizontalmente (Photoshop Flip Horizontal)
 */
export function flipHorizontal(img: fabric.Image, canvas?: fabric.Canvas | null): boolean {
  const current = img.flipX || false;
  img.set('flipX', !current);
  if (canvas) canvas.renderAll();
  return !current;
}

/**
 * Voltear Verticalmente (Photoshop Flip Vertical)
 */
export function flipVertical(img: fabric.Image, canvas?: fabric.Canvas | null): boolean {
  const current = img.flipY || false;
  img.set('flipY', !current);
  if (canvas) canvas.renderAll();
  return !current;
}

/**
 * Girar 90 grados en sentido horario
 */
export function rotate90(img: fabric.Image, canvas?: fabric.Canvas | null): number {
  const currentAngle = img.angle || 0;
  const nextAngle = (currentAngle + 90) % 360;
  img.set('angle', nextAngle);
  if (canvas) canvas.renderAll();
  return nextAngle;
}

/**
 * Aplica sombra paralela de Photoshop (Drop Shadow)
 */
export function applyPhotoshopDropShadow(
  obj: fabric.Object,
  options: {
    enabled: boolean;
    color?: string;
    blur?: number;
    offsetX?: number;
    offsetY?: number;
  },
  canvas?: fabric.Canvas | null
): void {
  if (!options.enabled) {
    obj.set('shadow', undefined);
  } else {
    obj.set(
      'shadow',
      new fabric.Shadow({
        color: options.color || 'rgba(0, 0, 0, 0.75)',
        blur: options.blur !== undefined ? options.blur : 28,
        offsetX: options.offsetX !== undefined ? options.offsetX : 0,
        offsetY: options.offsetY !== undefined ? options.offsetY : 14,
      })
    );
  }
  if (canvas) canvas.renderAll();
}

/**
 * Aplica resplandor exterior de Photoshop (Outer Glow)
 */
export function applyPhotoshopOuterGlow(
  obj: fabric.Object,
  options: {
    enabled: boolean;
    color?: string;
    blur?: number;
  },
  canvas?: fabric.Canvas | null
): void {
  if (!options.enabled) {
    obj.set('shadow', undefined);
  } else {
    obj.set(
      'shadow',
      new fabric.Shadow({
        color: options.color || 'rgba(56, 139, 255, 0.85)',
        blur: options.blur !== undefined ? options.blur : 35,
        offsetX: 0,
        offsetY: 0,
      })
    );
  }
  if (canvas) canvas.renderAll();
}
