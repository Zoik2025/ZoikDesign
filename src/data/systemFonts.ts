export interface SystemFontInfo {
  name: string;
  source: 'local-pc' | 'google-font';
  category: string;
}

// Catálogo de fuentes estándar preinstaladas en Windows
const WINDOWS_DEFAULT_FONTS = [
  'Segoe UI',
  'Bahnschrift',
  'Century Gothic',
  'Franklin Gothic Medium',
  'Arial',
  'Calibri',
  'Trebuchet MS',
  'Tahoma',
  'Verdana',
  'Georgia',
  'Palatino Linotype',
  'Impact',
  'Arial Black',
  'Candara',
  'Corbel',
  'Consolas',
  'Cambria',
];

/**
 * Escanea de forma automática las fuentes instaladas en la PC del usuario (Windows).
 * Si el navegador o Electron soporta `queryLocalFonts`, enumera el 100% de las fuentes de C:\Windows\Fonts.
 */
export async function getLocalPcFonts(): Promise<SystemFontInfo[]> {
  const result: SystemFontInfo[] = [];
  const seen = new Set<string>();

  // 1. Intentar usar la API nativa de Chromium / Electron (Local Font Access API)
  if (typeof window !== 'undefined' && 'queryLocalFonts' in window) {
    try {
      const localFonts: any[] = await (window as any).queryLocalFonts();
      for (const font of localFonts) {
        const family = font.family;
        if (family && !seen.has(family)) {
          seen.add(family);
          result.push({
            name: family,
            source: 'local-pc',
            category: 'Fuente Local de Windows',
          });
        }
      }
    } catch (e) {
      console.warn('Permiso o acceso a fuentes locales rechazado/no disponible:', e);
    }
  }

  // 2. Si no se pudieron escanear o para complementar, incluir las fuentes estándar de Windows
  for (const winFont of WINDOWS_DEFAULT_FONTS) {
    if (!seen.has(winFont)) {
      seen.add(winFont);
      result.push({
        name: winFont,
        source: 'local-pc',
        category: 'Sistema Windows',
      });
    }
  }

  return result;
}
