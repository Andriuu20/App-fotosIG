/**
 * Frases y canciones SIN IA: un banco dentro de la app, elegido según la idea
 * de foto que se sugirió. Gratis y sin servidor. Si más adelante se configura
 * el servidor con IA, se usa este banco como respaldo cuando falle.
 */
import type { Cancion, CaptionResult, Frase } from './caption';

type Categoria =
  | 'cafe'
  | 'manana'
  | 'color'
  | 'atardecer'
  | 'paseo'
  | 'lluvia'
  | 'nubes'
  | 'noche'
  | 'casa'
  | 'general';

interface Banco {
  positiva: string[];
  graciosa: string[];
  poetica: string[];
  canciones: [titulo: string, artista: string][];
}

/** Id de la sugerencia (ver suggestions.ts) → categoría del banco. */
const CATEGORIA_DE: Record<string, Categoria> = {
  desayuno: 'cafe',
  terraza: 'cafe',
  comida: 'cafe',
  'buenos-dias': 'manana',
  camino: 'paseo',
  paseo: 'paseo',
  sombras: 'color',
  color: 'color',
  edificio: 'atardecer',
  'hora-dorada': 'atardecer',
  'hora-dorada-pronto': 'atardecer',
  reflejos: 'lluvia',
  'ventana-lluvia': 'lluvia',
  'retrato-nubes': 'nubes',
  luces: 'noche',
  rincon: 'casa',
};

const BANCO: Record<Categoria, Banco> = {
  cafe: {
    positiva: [
      'Los pequeños placeres también cuentan ☕',
      'Hoy empiezo despacio y con ganas',
      'Momentos simples, días bonitos',
    ],
    graciosa: [
      'Primero café, luego ya hablamos',
      'Mi relación más estable: el café',
      'Esto no es un desayuno, es terapia',
    ],
    poetica: [
      'El aroma de las cosas que no tienen prisa',
      'Una taza caliente y el mundo en pausa',
      'Hay mañanas que caben en una taza',
    ],
    canciones: [
      ['Coffee', 'beabadoobee'],
      ['Banana Pancakes', 'Jack Johnson'],
      ['Sunday Morning', 'Maroon 5'],
      ['La Vie en rose', 'Édith Piaf'],
    ],
  },
  manana: {
    positiva: [
      'Buenos días a quien se levanta con ganas ☀️',
      'Día nuevo, oportunidades nuevas',
      'Hoy va a ser un buen día',
    ],
    graciosa: [
      'Despierta desde hace 5 minutos, guapa desde hace 2',
      'Modo mañana: cargando…',
      'Me he levantado pronto y quería que lo supierais',
    ],
    poetica: [
      'La luz de la mañana lo perdona todo',
      'Cada amanecer es una página en blanco',
      'El día aún no sabe todo lo que va a pasar',
    ],
    canciones: [
      ['Here Comes the Sun', 'The Beatles'],
      ['Lovely Day', 'Bill Withers'],
      ['Walking on Sunshine', 'Katrina and the Waves'],
      ['Color Esperanza', 'Diego Torres'],
    ],
  },
  color: {
    positiva: [
      'La vida es mejor a todo color 🎨',
      'Busca la luz, aunque sea en los detalles',
      'Lo bonito está en lo que casi nadie mira',
    ],
    graciosa: [
      'Mi paleta de colores favorita: esta',
      'Fotógrafa profesional de cosas random',
      'Sí, he parado en mitad de la calle para esto',
    ],
    poetica: [
      'Las sombras también dibujan',
      'El sol escribe con luz sobre las paredes',
      'Hay colores que se sienten antes de verse',
    ],
    canciones: [
      ['Yellow', 'Coldplay'],
      ['Amarillo', 'J Balvin'],
      ['Bonito', 'Jarabe de Palo'],
      ['Flowers', 'Miley Cyrus'],
    ],
  },
  atardecer: {
    positiva: [
      'Hoy el cielo se ha lucido 🌅',
      'Cerrar el día así no tiene precio',
      'Gracias por tanto, atardecer',
    ],
    graciosa: [
      'El cielo haciendo horas extra',
      'Ni filtro ni nada, el sol hace su trabajo',
      'Cuando el atardecer te pilla con el móvil a mano',
    ],
    poetica: [
      'Todo lo dorado acaba en calma',
      'El sol se despide sin prisa',
      'Hay luces que solo duran un rato, por eso brillan tanto',
    ],
    canciones: [
      ['Golden Hour', 'JVKE'],
      ['Sunset Lover', 'Petit Biscuit'],
      ['Sunflower', 'Post Malone & Swae Lee'],
      ['Golden', 'Harry Styles'],
    ],
  },
  paseo: {
    positiva: [
      'Salir a caminar siempre es buena idea 🌳',
      'Un paseo y todo se ve mejor',
      'Respirar, caminar, mirar alrededor',
    ],
    graciosa: [
      'He salido a dar una vuelta y he vuelto con 47 fotos',
      'Mis pasos de hoy: los justos para esta foto',
      'Explorando mi barrio como si fuera de turismo',
    ],
    poetica: [
      'Los caminos bonitos no tienen prisa',
      'A veces perderse es la mejor manera de encontrarse',
      'Cada paso, un pequeño descubrimiento',
    ],
    canciones: [
      ['Vivir Mi Vida', 'Marc Anthony'],
      ['La Bicicleta', 'Carlos Vives & Shakira'],
      ['Sweet Disposition', 'The Temper Trap'],
      ['Feeling Good', 'Michael Bublé'],
    ],
  },
  lluvia: {
    positiva: [
      'Hasta los días grises tienen su encanto 🌧️',
      'Después de la lluvia, siempre sale algo bonito',
      'Lluvia, manta y calma',
    ],
    graciosa: [
      'Pronóstico: 100 % de probabilidad de quedarme en casa',
      'Mi pelo y la lluvia no se llevan bien',
      'Día perfecto para no hacer nada',
    ],
    poetica: [
      'La ciudad se mira en sus charcos',
      'Cada gota cuenta una historia en el cristal',
      'Hay días que llueven por dentro y por fuera',
    ],
    canciones: [
      ['Have You Ever Seen the Rain', 'Creedence Clearwater Revival'],
      ['Set Fire to the Rain', 'Adele'],
      ['Purple Rain', 'Prince'],
      ['Riders on the Storm', 'The Doors'],
    ],
  },
  nubes: {
    positiva: [
      'Los días suaves también son bonitos ☁️',
      'Sin sol, pero con buena energía',
      'Detalles que alegran el día',
    ],
    graciosa: [
      'El cielo en modo ahorro de energía',
      'Hoy el sol ha teletrabajado',
      'Nublado fuera, soleado dentro',
    ],
    poetica: [
      'La luz más tierna es la que se filtra entre las nubes',
      'El cielo también necesita descansar',
      'Lo gris también tiene matices',
    ],
    canciones: [
      ['Lovely Day', 'Bill Withers'],
      ['Better Together', 'Jack Johnson'],
      ['Bonito', 'Jarabe de Palo'],
    ],
  },
  noche: {
    positiva: [
      'La noche también tiene su luz ✨',
      'Las mejores historias empiezan de noche',
      'Brillar aunque sea de noche',
    ],
    graciosa: [
      'Debería estar durmiendo, pero mira qué luces',
      'Modo búho activado',
      'Mi ritmo de sueño y yo no estamos de acuerdo',
    ],
    poetica: [
      'La ciudad se enciende cuando el cielo se apaga',
      'Cada luz es una historia que no conocemos',
      'La noche guarda lo que el día no se atreve a decir',
    ],
    canciones: [
      ['Blinding Lights', 'The Weeknd'],
      ['Midnight City', 'M83'],
      ['Night Changes', 'One Direction'],
      ['Fly Me to the Moon', 'Frank Sinatra'],
    ],
  },
  casa: {
    positiva: [
      'Mi rincón favorito del mundo 🕯️',
      'Hogar es donde todo está en calma',
      'Disfrutar de lo que ya tengo',
    ],
    graciosa: [
      'Plan de hoy: este sofá y yo',
      'Mi lugar seguro tiene enchufe y mantita',
      'Hoy no salgo, que se está muy bien aquí',
    ],
    poetica: [
      'Hay luces que saben a casa',
      'Lo pequeño también puede ser inmenso',
      'Los días se guardan en los rincones',
    ],
    canciones: [
      ['Home', 'Edward Sharpe & The Magnetic Zeros'],
      ['Banana Pancakes', 'Jack Johnson'],
      ['Better Together', 'Jack Johnson'],
    ],
  },
  general: {
    positiva: [
      'Guardando momentos bonitos ✨',
      'Hoy toca disfrutar de lo simple',
      'Cosas que me alegran el día',
    ],
    graciosa: [
      'Foto sin contexto, pero con mucho estilo',
      'No sé qué es, pero quedaba bonito',
      'Postureo nivel experto',
    ],
    poetica: [
      'Lo bonito ocurre cuando te paras a mirar',
      'Instantes que se quedan',
      'Hay momentos que piden ser recordados',
    ],
    canciones: [
      ['Here Comes the Sun', 'The Beatles'],
      ['Vivir Mi Vida', 'Marc Anthony'],
      ['Sunflower', 'Post Malone & Swae Lee'],
      ['Flowers', 'Miley Cyrus'],
    ],
  },
};

function pick<T>(list: T[], n: number, rand: () => number): T[] {
  const copy = [...list];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
}

/** 3 frases (positiva, graciosa, poética) y 3 canciones según la idea de foto. */
export function offlineCaptions(suggestionId?: string, rand: () => number = Math.random): CaptionResult {
  const categoria = (suggestionId && CATEGORIA_DE[suggestionId]) || 'general';
  const banco = BANCO[categoria];
  const frases: Frase[] = [
    { tono: 'positiva', texto: pick(banco.positiva, 1, rand)[0] },
    { tono: 'graciosa', texto: pick(banco.graciosa, 1, rand)[0] },
    { tono: 'poetica', texto: pick(banco.poetica, 1, rand)[0] },
  ];
  const canciones: Cancion[] = pick(banco.canciones, 3, rand).map(([titulo, artista]) => ({
    titulo,
    artista,
    motivo: '',
  }));
  return { frases, canciones };
}

export const _test = { BANCO, CATEGORIA_DE };
