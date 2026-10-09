import type { CanvasFormat } from '../types';

export const CANVAS_FORMATS: CanvasFormat[] = [
  {
    id: 'instagram-square',
    name: 'Instagram Post',
    label: 'Post Cuadrado (1:1)',
    width: 1080,
    height: 1080,
    category: 'social',
    aspectRatioLabel: '1:1',
  },
  {
    id: 'instagram-story',
    name: 'Story / Reel / TikTok',
    label: 'Historia Vertical (9:16)',
    width: 1080,
    height: 1920,
    category: 'social',
    aspectRatioLabel: '9:16',
  },
  {
    id: 'web-banner',
    name: 'Banner Web / LinkedIn',
    label: 'Banner Horizontal (1.91:1)',
    width: 1200,
    height: 630,
    category: 'banner',
    aspectRatioLabel: '1.91:1',
  },
  {
    id: 'instagram-portrait',
    name: 'Instagram Portrait',
    label: 'Retrato (4:5)',
    width: 1080,
    height: 1350,
    category: 'social',
    aspectRatioLabel: '4:5',
  },
  {
    id: 'youtube-thumb',
    name: 'Full HD Landscape',
    label: 'YouTube / Pantalla (16:9)',
    width: 1920,
    height: 1080,
    category: 'banner',
    aspectRatioLabel: '16:9',
  },
];
