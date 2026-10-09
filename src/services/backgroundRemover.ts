/**
 * Algoritmo de eliminación de fondo (Magic Background Cutout) tipo Photoshop.
 * Analiza las esquinas y los bordes de la imagen para muestrear el color del fondo
 * y convierte esos píxeles a canal alfa transparente con tolerancia y suavizado.
 */
export async function removeImageBackground(imageElement: HTMLImageElement, tolerance: number = 28): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(imageElement.src);
      return;
    }

    ctx.drawImage(imageElement, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = canvas.width;
    const height = canvas.height;

    // 1. Muestrear los colores de las cuatro esquinas (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
    const corners = [
      getPixel(data, 0, 0, width),
      getPixel(data, width - 1, 0, width),
      getPixel(data, 0, height - 1, width),
      getPixel(data, width - 1, height - 1, width),
    ];

    // 2. Determinar el color de fondo predominante
    const bgR = Math.round(corners.reduce((acc, c) => acc + c.r, 0) / corners.length);
    const bgG = Math.round(corners.reduce((acc, c) => acc + c.g, 0) / corners.length);
    const bgB = Math.round(corners.reduce((acc, c) => acc + c.b, 0) / corners.length);

    // 3. Floodfill / Umbral de distancia euclídea para eliminar el fondo
    const tolSq = tolerance * tolerance * 3;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const distSq = (r - bgR) * (r - bgR) + (g - bgG) * (g - bgG) + (b - bgB) * (b - bgB);

      if (distSq < tolSq) {
        // Píxel coincide con el fondo -> Hacerlo transparente
        data[i + 3] = 0;
      } else if (distSq < tolSq * 1.5) {
        // Zona de borde -> Suavizado suave (feathering)
        const factor = (distSq - tolSq) / (tolSq * 0.5);
        data[i + 3] = Math.round(data[i + 3] * factor);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    resolve(canvas.toDataURL('image/png'));
  });
}

function getPixel(data: Uint8ClampedArray, x: number, y: number, width: number) {
  const idx = (y * width + x) * 4;
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3],
  };
}
