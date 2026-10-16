export interface SystemFontInfo {
  name: string;
  source: 'local-pc' | 'google-font';
  category: string;
}

// Catálogo completo de fuentes estándar y tipografías preinstaladas en Windows
const WINDOWS_DEFAULT_FONTS = [
  'Arial',
  'Arial Black',
  'Arial Narrow',
  'Bahnschrift',
  'Book Antiqua',
  'Bookman Old Style',
  'Bradley Hand ITC',
  'Calibri',
  'Cambria',
  'Candara',
  'Century',
  'Century Gothic',
  'Comic Sans MS',
  'Consolas',
  'Constantia',
  'Corbel',
  'Courier New',
  'Dubai',
  'Ebrima',
  'Franklin Gothic Medium',
  'Freestyle Script',
  'French Script MT',
  'Gabriola',
  'Gadugi',
  'Garamond',
  'Georgia',
  'Haettenschweiler',
  'Impact',
  'Ink Free',
  'Javanese Text',
  'Juice ITC',
  'Kristen ITC',
  'Leelawadee UI',
  'Lucida Console',
  'Lucida Handwriting',
  'Lucida Sans Unicode',
  'Malgun Gothic',
  'Microsoft Sans Serif',
  'Microsoft YaHei',
  'Mistral',
  'Monotype Corsiva',
  'MV Boli',
  'Myanmar Text',
  'Nirmala UI',
  'Palatino Linotype',
  'Papyrus',
  'Pristina',
  'Segoe Print',
  'Segoe Script',
  'Segoe UI',
  'Segoe UI Variable',
  'Sitka Text',
  'Sylfaen',
  'Tahoma',
  'Tempus Sans ITC',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Yu Gothic',
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
            category: 'Fuente Local de tu PC (Windows)',
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
        category: 'Sistema Windows (PC)',
      });
    }
  }

  return result;
}
