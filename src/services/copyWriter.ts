import type { BrandKit, ApiSettings } from '../types';

export interface GeneratedCopy {
  headline: string;
  subtitle: string;
  badgeText: string;
  ctaText: string;
}

export async function resolveMarketingCopy(
  brief: string,
  brand: BrandKit,
  apiSettings: ApiSettings
): Promise<GeneratedCopy> {
  const briefTrimmed = brief.trim();

  // 1. Si el usuario configuró OpenAI API Key y tiene modo Live activo
  if (apiSettings.enableLiveOpenAi && apiSettings.openaiApiKey) {
    try {
      const systemPrompt = `Eres un Director Creativo y Redactor Publicitario de élite para la marca "${brand.name}" (Rubro: ${brand.industry}, Tono: ${brand.tone}).
Genera textos comerciales persuasivos y de alto impacto.
Responde ÚNICAMENTE un JSON válido con este formato:
{
  "headline": "Titular en mayúsculas de 3 a 5 palabras impactantes",
  "subtitle": "Subtítulo de 10 a 18 palabras explicando beneficio",
  "badgeText": "Frase de oferta o badge de 2 a 4 palabras (ej: 40% OFF, NUEVA TEMPORADA)",
  "ctaText": "Texto de botón de llamado a la acción con flecha (ej: Comprar Ahora →)"
}`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSettings.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: briefTrimmed ? `Brief: ${briefTrimmed}` : `Campaña general para ${brand.name}` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const parsed = JSON.parse(json.choices[0].message.content);
        if (parsed.headline && parsed.subtitle) {
          return {
            headline: parsed.headline.toUpperCase(),
            subtitle: parsed.subtitle,
            badgeText: (parsed.badgeText || 'OFERTA EXCLUSIVA').toUpperCase(),
            ctaText: parsed.ctaText || 'Comenzar Ahora →',
          };
        }
      }
    } catch (e) {
      console.warn('Error llamando a OpenAI copywriter, usando redactor local:', e);
    }
  }

  // 2. Redactor Algorítmico Inteligente Local (Analiza el texto y extrae titulares reales)
  const lower = briefTrimmed.toLowerCase();

  // Detección de porcentaje u oferta
  const discountMatch = briefTrimmed.match(/(\d+%\s*(off|descuento)?)/i);
  let badgeText = discountMatch ? `${discountMatch[1].toUpperCase()} OFF` : 'EDICIÓN EXCLUSIVA';

  // Si el usuario escribió un texto explícito
  if (briefTrimmed.length > 5) {
    // Si contiene varias frases separadas por punto o coma
    const sentences = briefTrimmed.split(/[.,\n]/).map(s => s.trim()).filter(Boolean);

    let headline = '';
    let subtitle = '';

    if (sentences.length >= 2) {
      headline = sentences[0].toUpperCase();
      subtitle = sentences.slice(1).join('. ');
    } else {
      const words = briefTrimmed.split(/\s+/);
      if (words.length <= 6) {
        headline = briefTrimmed.toUpperCase();
        subtitle = `Calidad superior y diseño exclusivo por ${brand.name}.`;
      } else {
        headline = words.slice(0, 5).join(' ').toUpperCase();
        subtitle = briefTrimmed;
      }
    }

    // CTA Contextual
    let ctaText = 'Comprar Ahora →';
    if (lower.includes('curso') || lower.includes('software') || lower.includes('aprende')) {
      ctaText = 'Inscribirme Ahora →';
    } else if (lower.includes('reserva') || lower.includes('mesa') || lower.includes('hotel')) {
      ctaText = 'Reservar Ahora →';
    } else if (lower.includes('descubre') || lower.includes('coleccion') || lower.includes('catalogo')) {
      ctaText = 'Ver Catálogo →';
    }

    if (lower.includes('nuevo') || lower.includes('lanzamiento')) {
      badgeText = 'LANZAMIENTO 2026';
    } else if (lower.includes('limitad') || lower.includes('exclusiv')) {
      badgeText = 'EDICIÓN LIMITADA';
    }

    return {
      headline,
      subtitle: subtitle.endsWith('.') ? subtitle : `${subtitle}.`,
      badgeText,
      ctaText,
    };
  }

  // 3. Fallback personalizado por tono e industria de la marca
  if (brand.tone === 'elegant' || lower.includes('cafe')) {
    return {
      headline: 'SABORES QUE DESPIERTAN TU DÍA',
      subtitle: 'Granos de altura 100% arábica seleccionados y tostados artesanalmente.',
      badgeText: 'COSECHA SELECCIONADA',
      ctaText: 'Ordenar Ahora →',
    };
  } else if (brand.tone === 'bold' || lower.includes('sport')) {
    return {
      headline: 'SUPERA CADA LÍMITE',
      subtitle: 'Indumentaria técnica de alto rendimiento para atletas que buscan la victoria.',
      badgeText: 'NUEVA TEMPORADA 2026',
      ctaText: 'Ver Colección →',
    };
  } else if (brand.tone === 'cyber') {
    return {
      headline: 'CONECTA CON EL FUTURO',
      subtitle: 'Tecnología de última generación diseñada para acelerar tu potencial digital.',
      badgeText: 'NEXT-GEN TECH',
      ctaText: 'Explorar Ahora →',
    };
  }

  return {
    headline: brand.tagline ? brand.tagline.toUpperCase() : `DISEÑO DE IMPACTO CON ${brand.name.toUpperCase()}`,
    subtitle: `Estándares profesionales y estética de alta precisión para ${brand.industry}.`,
    badgeText: 'COLECCIÓN EXCLUSIVA',
    ctaText: 'Descubrir Más →',
  };
}
