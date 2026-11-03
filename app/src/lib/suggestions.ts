/**
 * Ideas de foto según el momento del día, el tiempo y la hora dorada.
 * Lógica pura (sin dependencias nativas) para poder probarla fácilmente.
 */

export type Moment = 'manana' | 'mediodia' | 'tarde' | 'noche';

export type WeatherKind = 'sol' | 'nubes' | 'lluvia' | 'niebla' | 'nieve' | 'tormenta';

export interface Conditions {
  now: Date;
  weather?: WeatherKind;
  /** Inicio de la hora dorada de la tarde y puesta de sol (si hay ubicación). */
  goldenHourStart?: Date | null;
  sunset?: Date | null;
  /** Fin de la hora dorada de la mañana. */
  goldenHourEndMorning?: Date | null;
  sunrise?: Date | null;
}

export interface Suggestion {
  id: string;
  emoji: string;
  title: string;
  body: string;
  /** Consejos que la cámara irá mostrando mientras encuadras. */
  tips: string[];
}

const MIN = 60_000;

export function momentOf(date: Date): Moment {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'manana';
  if (h >= 12 && h < 17) return 'mediodia';
  if (h >= 17 && h < 22) return 'tarde';
  return 'noche';
}

export type GoldenState = 'manana' | 'tarde' | 'pronto' | null;

/** ¿Estamos en hora dorada (o empieza en menos de 45 min)? */
export function goldenState(c: Conditions): GoldenState {
  const t = c.now.getTime();
  if (c.sunrise && c.goldenHourEndMorning) {
    if (t >= c.sunrise.getTime() && t <= c.goldenHourEndMorning.getTime()) return 'manana';
  }
  if (c.goldenHourStart && c.sunset) {
    const start = c.goldenHourStart.getTime();
    if (t >= start && t <= c.sunset.getTime()) return 'tarde';
    if (t < start && start - t <= 45 * MIN) return 'pronto';
  }
  return null;
}

const IDEAS: Record<Moment, Suggestion[]> = {
  manana: [
    {
      id: 'desayuno',
      emoji: '☀️',
      title: '¿Qué tal una foto de tu desayuno?',
      body: 'Busca la ventana: la luz de la mañana hace que cualquier taza parezca de revista.',
      tips: ['Acércate a la ventana', 'Haz la foto desde arriba', 'Centra la taza', 'Quita lo que sobre de la mesa'],
    },
    {
      id: 'buenos-dias',
      emoji: '🌤️',
      title: 'Una foto de buenos días',
      body: 'El cielo desde tu ventana, tu calle o tu camino al trabajo.',
      tips: ['Deja el cielo en el tercio de arriba', 'Mantén el horizonte recto', 'Busca una línea que guíe la mirada'],
    },
    {
      id: 'camino',
      emoji: '🚶',
      title: 'Tu camino de hoy',
      body: 'Sal unos minutos y busca una calle bonita, una puerta o una planta con luz.',
      tips: ['Busca una puerta o fachada bonita', 'Colócala en una línea de la cuadrícula', 'Agáchate un poco para cambiar el punto de vista'],
    },
  ],
  mediodia: [
    {
      id: 'sombras',
      emoji: '🕶️',
      title: 'Juega con las sombras',
      body: 'Con el sol alto las sombras son muy marcadas: busca rejas, hojas o persianas.',
      tips: ['Busca una sombra con forma', 'Haz la foto desde arriba', 'Prueba a dejar mucho espacio vacío'],
    },
    {
      id: 'comida',
      emoji: '🥗',
      title: 'Tu comida, pero bonita',
      body: 'Si comes cerca de una ventana o en una terraza, es el momento.',
      tips: ['Busca luz de lado, no de frente', 'Acércate al plato', 'Centra el plato'],
    },
    {
      id: 'color',
      emoji: '🎨',
      title: 'Busca un color',
      body: 'Elige un color y sal a buscarlo: una pared, una flor, un coche…',
      tips: ['Llena el encuadre con el color', 'Acércate más', 'Mantén las líneas rectas'],
    },
  ],
  tarde: [
    {
      id: 'edificio',
      emoji: '🌇',
      title: 'Hay buena luz: un edificio o un parque',
      body: 'Un edificio, un parque o el atardecer quedarían genial ahora.',
      tips: ['Deja el horizonte en el tercio de abajo', 'Ponte de espaldas al sol para iluminar el edificio', 'Mantén el horizonte recto'],
    },
    {
      id: 'paseo',
      emoji: '🌳',
      title: 'Un paseo corto y una foto',
      body: 'Sal 10 minutos: el parque más cercano seguro que tiene un rincón bonito.',
      tips: ['Busca un camino que guíe la mirada', 'Agáchate para meter hojas en primer plano', 'Coloca lo importante en un cruce de líneas'],
    },
    {
      id: 'terraza',
      emoji: '☕',
      title: 'Un café en una terraza',
      body: 'Tu bebida con la calle de fondo, desenfocada.',
      tips: ['Acércate a la taza', 'Deja la calle de fondo', 'Centra la taza'],
    },
  ],
  noche: [
    {
      id: 'luces',
      emoji: '✨',
      title: 'Luces de la ciudad',
      body: 'Farolas, escaparates o luces de casa: la noche también tiene fotos.',
      tips: ['Apoya el móvil para que no tiemble', 'Busca una luz cálida', 'Deja zonas oscuras, no pasa nada'],
    },
    {
      id: 'rincon',
      emoji: '🕯️',
      title: 'Tu rincón favorito de casa',
      body: 'Una lámpara, un libro, una planta: algo que diga cómo ha sido tu día.',
      tips: ['Enciende una luz cálida cerca', 'Acércate al objeto', 'Quita lo que sobre del fondo'],
    },
  ],
};

const GOLDEN: Suggestion = {
  id: 'hora-dorada',
  emoji: '🌅',
  title: '¡Es la hora dorada!',
  body: 'La luz más bonita del día dura poco. Sal y haz una foto del cielo, una calle o un retrato.',
  tips: ['Ponte de lado al sol', 'Deja el horizonte en el tercio de abajo', 'Mantén el horizonte recto', 'Prueba un contraluz'],
};

const GOLDEN_SOON: Suggestion = {
  id: 'hora-dorada-pronto',
  emoji: '⏳',
  title: 'La hora dorada empieza pronto',
  body: 'En menos de una hora la luz se vuelve dorada. Buen momento para salir a dar una vuelta.',
  tips: ['Busca un sitio con vistas al oeste', 'Deja el horizonte en el tercio de abajo', 'Mantén el horizonte recto'],
};

const RAIN: Suggestion[] = [
  {
    id: 'reflejos',
    emoji: '🌧️',
    title: 'Llueve: busca reflejos',
    body: 'Los charcos y los cristales mojados dan fotos preciosas. Paraguas en mano y a buscar uno.',
    tips: ['Busca un charco con luces', 'Acerca el móvil al suelo', 'Gira la foto si hace falta'],
  },
  {
    id: 'ventana-lluvia',
    emoji: '☔',
    title: 'Gotas en la ventana',
    body: 'Una bebida caliente y la ventana con gotas: plan perfecto para hoy.',
    tips: ['Enfoca las gotas tocando la pantalla', 'Deja la calle desenfocada', 'Acércate al cristal'],
  },
];

const CLOUDY: Suggestion = {
  id: 'retrato-nubes',
  emoji: '☁️',
  title: 'Día nublado = luz suave',
  body: 'Las nubes hacen de difusor gigante: perfecto para retratos, flores y detalles.',
  tips: ['Acércate a los detalles', 'Busca colores vivos', 'Evita meter mucho cielo blanco'],
};

/** Número estable por día para que la idea no cambie en cada render. */
function daySeed(date: Date): number {
  return date.getFullYear() * 1000 + date.getMonth() * 40 + date.getDate();
}

/**
 * Devuelve la lista de ideas para este momento, ordenada de más a menos
 * recomendable. `offset` permite pedir "otra idea".
 */
export function suggestionsFor(c: Conditions): Suggestion[] {
  const result: Suggestion[] = [];
  const golden = goldenState(c);
  const rainy = c.weather === 'lluvia' || c.weather === 'tormenta';

  if (golden === 'manana' || golden === 'tarde') {
    if (!rainy) result.push(GOLDEN);
  } else if (golden === 'pronto' && !rainy) {
    result.push(GOLDEN_SOON);
  }
  if (rainy) result.push(...RAIN);
  if (c.weather === 'nubes' || c.weather === 'niebla') result.push(CLOUDY);

  const base = IDEAS[momentOf(c.now)];
  const start = daySeed(c.now) % base.length;
  for (let i = 0; i < base.length; i++) result.push(base[(start + i) % base.length]);
  return result;
}

/** Textos de las notificaciones suaves de mañana y tarde. */
export const NOTIFICATION_TEXT = {
  manana: { title: '☀️ Buenos días', body: '¿Qué tal una foto de tu desayuno o de buenos días?' },
  tarde: {
    title: '🌇 Hay buena luz',
    body: 'Una foto de un edificio, un parque o el atardecer quedaría genial.',
  },
} as const;
