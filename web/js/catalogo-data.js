/**
 * Catálogo de Vicunia: datos de cada línea y del armador.
 * Una sola fuente de verdad para el catálogo, la ficha de producto y el QR.
 *
 * `art` es una silueta plana (viewBox 0 0 64 64). Cada parte lleva `data-slot`
 * para poder pintarla con el color que eligió la persona:
 *   - carcasa   → el cuerpo de la pieza
 *   - esqueleto → la base, el soporte o el colgante
 *   - letra    → el texto grabado
 *   - teclas   → las teclas del clicker
 */

const ART = {
  funko: `
    <circle data-slot="carcasa" cx="32" cy="19" r="9.5" fill="currentColor"/>
    <rect data-slot="carcasa" x="20.5" y="30" width="23" height="14" rx="4.5" fill="currentColor"/>
    <rect data-slot="esqueleto" x="14" y="44" width="36" height="8" rx="2.5" fill="currentColor"/>`,

  sentado: `
    <circle data-slot="carcasa" cx="32" cy="20" r="9" fill="currentColor"/>
    <path data-slot="carcasa" d="M22 44c0-6 4.5-10 10-10s10 4 10 10z" fill="currentColor"/>
    <rect data-slot="esqueleto" x="16" y="44" width="32" height="8" rx="2.5" fill="currentColor"/>`,

  conPlaca: `
    <circle data-slot="carcasa" cx="32" cy="17" r="8.5" fill="currentColor"/>
    <rect data-slot="carcasa" x="22" y="27" width="20" height="12" rx="4" fill="currentColor"/>
    <rect data-slot="esqueleto" x="12" y="41" width="40" height="9" rx="2.5" fill="currentColor"/>`,

  medallion: `
    <circle data-slot="esqueleto" cx="32" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2.4"/>
    <circle data-slot="carcasa" cx="32" cy="36" r="17" fill="currentColor"/>`,

  nameplate: `
    <rect data-slot="carcasa" x="15" y="16" width="34" height="22" rx="4" fill="currentColor"/>
    <rect data-slot="esqueleto" x="10" y="38" width="44" height="15" rx="3" fill="currentColor"/>`,

  topper: `
    <circle data-slot="carcasa" cx="32" cy="24" r="15" fill="currentColor"/>
    <rect data-slot="esqueleto" x="30" y="39" width="4" height="14" rx="2" fill="currentColor"/>`,

  mug: `
    <path data-slot="carcasa" d="M15 22h28v18a10 10 0 0 1-10 10H25a10 10 0 0 1-10-10z" fill="currentColor"/>
    <path data-slot="esqueleto" d="M43 27h4.5a6 6 0 0 1 0 12H43" fill="none" stroke="currentColor" stroke-width="3.4"/>`,

  chalice: `
    <circle data-slot="carcasa" cx="32" cy="12" r="6" fill="currentColor"/>
    <path data-slot="carcasa" d="M22 20h20c0 8-4.5 13-10 13s-10-5-10-13z" fill="currentColor"/>
    <rect data-slot="esqueleto" x="30" y="33" width="4" height="12" fill="currentColor"/>
    <path data-slot="esqueleto" d="M23 45h18c0 3.6-4 6-9 6s-9-2.4-9-6z" fill="currentColor"/>`,

  cap: `
    <path data-slot="carcasa" d="M32 13 8 24l24 11 24-11z" fill="currentColor"/>
    <path data-slot="esqueleto" d="M18 29v9c0 4.5 6.3 7.5 14 7.5S46 42.5 46 38v-9z" fill="currentColor"/>
    <path data-slot="esqueleto" d="M50 27v11" fill="none" stroke="currentColor" stroke-width="2.6"/>`,

  sphere: `
    <circle data-slot="carcasa" cx="32" cy="38" r="17" fill="currentColor"/>
    <rect data-slot="esqueleto" x="27" y="16" width="10" height="4" rx="1.5" fill="currentColor"/>
    <circle data-slot="esqueleto" cx="32" cy="11" r="3" fill="none" stroke="currentColor" stroke-width="2.4"/>`,

  cilindro: `
    <ellipse data-slot="carcasa" cx="32" cy="20" rx="11" ry="3.6" fill="currentColor"/>
    <path data-slot="carcasa" d="M21 20v26c0 2 5 3.6 11 3.6s11-1.6 11-3.6V20z" fill="currentColor"/>
    <rect data-slot="esqueleto" x="27" y="13" width="10" height="4" rx="1.4" fill="currentColor"/>
    <circle data-slot="esqueleto" cx="32" cy="9" r="2.8" fill="none" stroke="currentColor" stroke-width="2.2"/>`,

  star: `
    <path data-slot="carcasa" d="M32 9l6.4 13 14.1 2-10.2 10 2.4 14L32 42.4 19.3 48l2.4-14-10.2-10 14.1-2z" fill="currentColor"/>
    <circle data-slot="esqueleto" cx="32" cy="5" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/>`,

  spheres: `
    <circle data-slot="carcasa" cx="20" cy="34" r="9" fill="currentColor"/>
    <circle data-slot="carcasa" cx="43" cy="29" r="7" fill="currentColor"/>
    <circle data-slot="carcasa" cx="31" cy="49" r="7" fill="currentColor"/>
    <circle data-slot="esqueleto" cx="20" cy="22" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle data-slot="esqueleto" cx="43" cy="19" r="2.2" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle data-slot="esqueleto" cx="31" cy="39" r="2.2" fill="none" stroke="currentColor" stroke-width="2"/>`,

  cathedral: `
    <rect data-slot="carcasa" x="12" y="26" width="10" height="28" fill="currentColor"/>
    <rect data-slot="carcasa" x="42" y="26" width="10" height="28" fill="currentColor"/>
    <path data-slot="carcasa" d="M22 54V33h20v21z" fill="currentColor"/>
    <path data-slot="esqueleto" d="M12 26l5-7 5 7zM42 26l5-7 5 7z" fill="currentColor"/>
    <rect data-slot="esqueleto" x="8" y="54" width="48" height="4" rx="1.5" fill="currentColor"/>`,

  arch: `
    <path data-slot="carcasa" d="M5 56V38C5 25.9 14.9 16 27 16h10c12.1 0 22 9.9 22 22v18h-9V38c0-7.2-5.8-13-13-13H27c-7.2 0-13 5.8-13 13v18z" fill="currentColor"/>
    <rect data-slot="esqueleto" x="3" y="56" width="58" height="4" rx="1.5" fill="currentColor"/>`,

  pin: `
    <path data-slot="carcasa" d="M32 57s16.5-13.5 16.5-25.5a16.5 16.5 0 1 0-33 0C15.5 43.5 32 57 32 57z" fill="currentColor"/>
    <circle data-slot="esqueleto" cx="32" cy="30.5" r="7.5" fill="none" stroke="currentColor" stroke-width="3"/>`,

  pen: `
    <rect data-slot="carcasa" x="27" y="11" width="10" height="9" rx="2.5" fill="currentColor"/>
    <path data-slot="carcasa" d="M27 20h10v26H27z" fill="currentColor"/>
    <path data-slot="esqueleto" d="M27 46h10l-5 10z" fill="currentColor"/>
    <rect data-slot="esqueleto" x="37" y="13" width="3" height="11" rx="1.5" fill="currentColor"/>`,

  marco: `
    <rect data-slot="esqueleto" x="9" y="12" width="46" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="3.4"/>`,

  base: `
    <rect data-slot="esqueleto" x="10" y="52" width="44" height="5" rx="2" fill="currentColor"/>`,

  etiqueta: `
    <rect data-slot="carcasa" x="10" y="22" width="44" height="20" rx="4" fill="currentColor"/>
    <circle data-slot="esqueleto" cx="20" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="2.4"/>`,

  marcoFoto: `
    <rect data-slot="esqueleto" x="10" y="14" width="44" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="3.4"/>
    <path data-slot="carcasa" d="M17 42l7.5-8 5.5 5.5L35.5 33 47 44H17z" fill="currentColor"/>`,

  /* Banda de color que se suma a la esfera y al adorno. */
  banda: `
    <rect data-slot="esqueleto" x="15" y="32" width="34" height="7" rx="3" fill="currentColor"/>`,

  /* Clicker: cuerpo, teclas y aro de colgar. */
  clicker: `
    <rect data-slot="carcasa" x="6" y="20" width="44" height="25" rx="6" fill="currentColor"/>
    <rect data-slot="teclas" x="11" y="25" width="9" height="7" rx="2" fill="currentColor"/>
    <rect data-slot="teclas" x="22.5" y="25" width="9" height="7" rx="2" fill="currentColor"/>
    <rect data-slot="teclas" x="34" y="25" width="9" height="7" rx="2" fill="currentColor"/>
    <rect data-slot="teclas" x="11" y="35" width="9" height="6" rx="2" fill="currentColor"/>
    <rect data-slot="teclas" x="22.5" y="35" width="9" height="6" rx="2" fill="currentColor"/>
    <rect data-slot="teclas" x="34" y="35" width="9" height="6" rx="2" fill="currentColor"/>
    <circle data-slot="esqueleto" cx="54" cy="32" r="5" fill="none" stroke="currentColor" stroke-width="2.6"/>`,

  /* Lápiz: la parte de adelante y la de atrás. */
  lapiz: `
    <g transform="rotate(-32 32 32)">
      <rect data-slot="carcasa" x="26" y="9" width="12" height="38" fill="currentColor"/>
      <rect data-slot="esqueleto" x="26" y="9" width="12" height="11" rx="2" fill="currentColor"/>
      <path data-slot="carcasa" d="M26 47h12l-6 10z" fill="currentColor"/>
    </g>`,

  /* Dummy articulado: esqueleto, armadura y base. */
  dummy: `
    <circle data-slot="carcasa" cx="32" cy="13" r="8" fill="currentColor"/>
    <rect data-slot="carcasa" x="24" y="23" width="16" height="18" rx="5" fill="currentColor"/>
    <path data-slot="esqueleto" d="M24 26 14 38M40 26l10 12M32 41v13" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <circle data-slot="esqueleto" cx="32" cy="30" r="3.5" fill="currentColor"/>
    <rect data-slot="esqueleto" x="20" y="54" width="24" height="5" rx="2" fill="currentColor"/>`,

  /* Figura estilo Funko con base. */
  figura: `
    <circle data-slot="carcasa" cx="32" cy="18" r="9.5" fill="currentColor"/>
    <rect data-slot="carcasa" x="21" y="29" width="22" height="15" rx="5" fill="currentColor"/>
    <rect data-slot="esqueleto" x="13" y="44" width="38" height="9" rx="3" fill="currentColor"/>`
};

const T = (etiqueta, placeholder, max, requerido = true) => ({ etiqueta, placeholder, max, requerido });

/**
 * Cada línea del catálogo. `slots` son los colores que puede elegir quien
 * encarga: el esqueleto (base o soporte) y la carcasa (el cuerpo), y a veces
 * el color de la letra.
 */
export const PRODUCTOS = {
  clicker: {
    id: 'clicker',
    nombre: 'Clicker con tu nombre',
    linea: 'Clickers',
    categoria: 'Clickers con nombre',
    estado: 'listo',
    modo: 'clicker',
    resumen: 'Llavero con teclas que suenan, de 2 a 10 teclas.',
    descripcion: 'Switch mecánico real, teclas con tu nombre en relieve y 17 colores de filamento. Lleva un aro metálico estándar para colgarlo.',
    ogImage: 'img/og-clicker.jpg',
    texto: T('Nombre o palabra', 'Ej. TUYO', 10),
    textoExtra: T('Símbolo junto al nombre', 'Ej. corazón', 12, false),
    disenos: [
      { id: 'teclas', nombre: 'Tecla por tecla', art: ART.clicker },
      { id: 'iniciales', nombre: 'Solo iniciales', art: ART.clicker },
      { id: 'simbolo', nombre: 'Símbolo y letra', art: ART.clicker }
    ],
    slots: [
      { key: 'carcasa', label: 'Cuerpo del clicker', hint: 'La carcasa que sostiene las teclas', porDefecto: 'violeta' },
      { key: 'teclas', label: 'Teclas', hint: 'El color de las teclas', porDefecto: 'blanco' },
      { key: 'esqueleto', label: 'Aro de colgar', hint: 'El aro metálico estándar', porDefecto: 'negro' }
    ],
    medidas: ['2 a 4 teclas', '5 a 6 teclas', '7 a 10 teclas'],
    diseno3d: { label: 'Diseñar mi clicker en 3D', href: 'index.html#disena' }
  },

  lapiz: {
    id: 'lapiz',
    nombre: 'Nombre para lápiz',
    linea: 'Lápices',
    categoria: 'Lápices con nombre',
    estado: 'listo',
    modo: 'lapiz',
    resumen: 'El nombre en relieve que se adapta al grosor de tu lápiz.',
    descripcion: 'Se imprime en una o dos piezas de color. Ajustamos el diámetro interior al lápiz o lapicero que uses.',
    ogImage: 'img/og-lapiz.jpg',
    texto: T('Nombre', 'Ej. KAREN', 24),
    textoExtra: null,
    disenos: [
      { id: 'nombre', nombre: 'Nombre completo', art: ART.lapiz },
      { id: 'apodo', nombre: 'Apodo corto', art: ART.lapiz },
      { id: 'doble', nombre: 'Dos piezas de color', art: ART.lapiz }
    ],
    slots: [
      { key: 'carcasa', label: 'Parte de adelante', hint: 'La mitad frontal del nombre', porDefecto: 'lavanda' },
      { key: 'esqueleto', label: 'Parte de atrás', hint: 'La mitad posterior', porDefecto: 'rosa-pastel' }
    ],
    medidas: ['Grueso 8 mm', 'Grueso 10 mm', 'Grueso 12 mm'],
    diseno3d: { label: 'Diseñar mi lápiz en 3D', href: 'index.html#lapices' }
  },

  dummy: {
    id: 'dummy',
    nombre: 'Dummy a tu estilo',
    linea: 'Dummys',
    categoria: 'Dummys articulados',
    estado: 'encargo',
    resumen: 'Figura articulada para combinar a tu gusto.',
    descripcion: 'Impresión 3D con combinaciones de color para el esqueleto y la armadura. Disponibilidad y accesorios se confirman antes de imprimir.',
    ogImage: 'img/og-dummy.jpg',
    texto: T('Nombre en la base', 'Ej. HÉROE', 18),
    textoExtra: T('Frase o fecha', 'Ej. Cumple 2026', 22, false),
    disenos: [
      { id: 'limpio', nombre: 'Sin accesorios', art: ART.dummy },
      { id: 'espada', nombre: 'Con espada', art: ART.dummy },
      { id: 'escudo', nombre: 'Con escudo', art: ART.dummy }
    ],
    slots: [
      { key: 'esqueleto', label: 'Color del esqueleto', hint: 'La estructura interior articulada', porDefecto: 'negro' },
      { key: 'carcasa', label: 'Color de la armadura', hint: 'Las piezas exteriores', porDefecto: 'violeta' },
      { key: 'letra', label: 'Letra de la base', hint: 'El nombre grabado', porDefecto: 'blanco' }
    ],
    medidas: ['Pequeño (10 cm)', 'Mediano (13 cm)', 'Grande (16 cm)']
  },

  figuras: {
    id: 'figuras',
    nombre: 'Figura 3D desde tu foto',
    linea: 'Figuras',
    categoria: 'Figuras personalizadas',
    estado: 'listo',
    resumen: 'Tu foto convertida en figura 3D estilo Funko.',
    descripcion: 'Modelamos tu foto y te enviamos la propuesta antes de imprimir. La foto se queda en tu equipo hasta que la adjuntes en el chat.',
    ogImage: 'img/og-vicunia.jpg',
    foto: true,
    texto: T('Nombre en la base', 'Ej. FIRULAIS', 18),
    textoExtra: T('Frase o fecha', 'Ej. 12 de mayo', 24, false),
    disenos: [
      { id: 'funko', nombre: 'Estilo Funko', art: ART.figura },
      { id: 'sentado', nombre: 'Sentada con base', art: ART.sentado },
      { id: 'placa', nombre: 'Con placa de nombre', art: ART.conPlaca }
    ],
    slots: [
      { key: 'esqueleto', label: 'Color de la base', hint: 'El pie y el soporte', porDefecto: 'negro' },
      { key: 'carcasa', label: 'Color de la figura', hint: 'El cuerpo y la cabeza', porDefecto: 'arena' },
      { key: 'letra', label: 'Letra de la base', hint: 'El nombre grabado', porDefecto: 'blanco' }
    ],
    medidas: ['Pequeña (8 cm)', 'Mediana (12 cm)', 'Grande (16 cm)'],
    diseno3d: { label: 'Enviar mi foto', href: 'index.html#sube' }
  },

  esfera: {
    id: 'esfera',
    nombre: 'Esfera navideña con nombre',
    linea: 'Navidad',
    categoria: 'Navidad con nombre',
    estado: 'temporada',
    resumen: 'Esfera para el árbol con el nombre de cada uno de la familia.',
    descripcion: 'Se puede sumar el año o una fecha especial en la misma pieza.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre', 'Ej. Familia Rojas', 16),
    textoExtra: T('Año o fecha', 'Ej. 2026', 16, false),
    disenos: [
      { id: 'nombre', nombre: 'Nombre grande', art: ART.sphere },
      { id: 'inicial', nombre: 'Inicial grande', art: ART.sphere },
      { id: 'banda', nombre: 'Con banda de color', art: ART.sphere, extra: ART.banda }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / esfera', hint: 'El cuerpo de la esfera', porDefecto: 'rosado' },
      { key: 'esqueleto', label: 'Esqueleto / colgante', hint: 'El tapón y el aro', porDefecto: 'blanco' }
    ],
    medidas: ['6 cm', '7.5 cm', '9 cm']
  },

  adorno: {
    id: 'adorno',
    nombre: 'Adorno circular con nombre',
    linea: 'Navidad',
    categoria: 'Navidad con nombre',
    estado: 'temporada',
    resumen: 'Un círculo colgante con el nombre como protagonista.',
    descripcion: 'Para el árbol, la puerta o una ventana. Se entrega con su aro para colgar.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre', 'Ej. Ana y Pedro', 16),
    textoExtra: T('Año o mensaje', 'Ej. Navidad 2026', 20, false),
    disenos: [
      { id: 'nombre', nombre: 'Nombre alrededor', art: ART.cilindro },
      { id: 'banda', nombre: 'Con banda de color', art: ART.cilindro, extra: ART.banda }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / cuerpo', hint: 'El cuerpo del adorno', porDefecto: 'lavanda' },
      { key: 'esqueleto', label: 'Esqueleto / colgante', hint: 'El aro y la base', porDefecto: 'blanco' }
    ],
    medidas: ['8 cm', '10 cm', '12 cm']
  },

  estrella: {
    id: 'estrella',
    nombre: 'Adorno en forma de estrella',
    linea: 'Navidad',
    categoria: 'Navidad con nombre',
    estado: 'temporada',
    resumen: 'Estrella con nombre o inicial para la punta del árbol.',
    descripcion: 'También sirve para regalar en diciembre a la familia y a los padrinos.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre o inicial', 'Ej. M', 14),
    textoExtra: T('Año', 'Ej. 2026', 10, false),
    disenos: [
      { id: 'nombre', nombre: 'Nombre en la estrella', art: ART.star },
      { id: 'puntos', nombre: 'Con puntos', art: ART.star, extra: ART.banda }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / estrella', hint: 'El cuerpo de la estrella', porDefecto: 'seda' },
      { key: 'esqueleto', label: 'Esqueleto / colgante', hint: 'El aro superior', porDefecto: 'blanco' }
    ],
    medidas: ['7 cm', '9 cm', '11 cm']
  },

  set: {
    id: 'set',
    nombre: 'Set de esferas para la familia',
    linea: 'Navidad',
    categoria: 'Navidad con nombre',
    estado: 'temporada',
    resumen: 'Cuatro esferas con los nombres de la casa, en colores combinados.',
    descripcion: 'Se entregan listas para colgar.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombres', 'Ej. Ana, Pedro, Sofi y Leo', 40),
    textoExtra: T('Año', 'Ej. 2026', 10, false),
    disenos: [
      { id: 'cuatro', nombre: 'Cuatro esferas', art: ART.spheres },
      { id: 'tres', nombre: 'Tres esferas', art: ART.spheres }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / esferas', hint: 'Los cuerpos de las esferas', porDefecto: 'azul-hielo' },
      { key: 'esqueleto', label: 'Esqueleto / colgantes', hint: 'Los aros', porDefecto: 'blanco' }
    ],
    medidas: ['Set de 4 (6 cm)', 'Set de 4 (7.5 cm)']
  },

  bautizo: {
    id: 'bautizo',
    nombre: 'Recuerdo de bautizo',
    linea: 'Eventos',
    categoria: 'Recuerdos para eventos',
    estado: 'encargo',
    resumen: 'Un detalle para los invitados, con el nombre y la fecha del bautizo.',
    descripcion: 'También hacemos la versión grande para la mesa.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre', 'Ej. Mateo Jesús', 20),
    textoExtra: T('Fecha del bautizo', 'Ej. 12 de mayo de 2026', 24, false),
    disenos: [
      { id: 'llavero', nombre: 'Llavero con medallón', art: ART.medallion },
      { id: 'placa', nombre: 'Placa de nombre', art: ART.nameplate },
      { id: 'topper', nombre: 'Topper para mesa', art: ART.topper },
      { id: 'figura', nombre: 'Figurita', art: ART.funko }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / cuerpo', hint: 'La parte principal del recuerdo', porDefecto: 'blanco' },
      { key: 'esqueleto', label: 'Esqueleto / base', hint: 'La base, el aro o el soporte', porDefecto: 'arena' },
      { key: 'letra', label: 'Letra grabada', hint: 'El texto del nombre', porDefecto: 'lavanda' }
    ],
    medidas: ['Llavero (6 cm)', 'Mediano (10 cm)', 'Grande (14 cm)']
  },

  comunion: {
    id: 'comunion',
    nombre: 'Recuerdo de primera comunión',
    linea: 'Eventos',
    categoria: 'Recuerdos para eventos',
    estado: 'encargo',
    resumen: 'Recuerdos con nombre, fecha y el símbolo que elijas.',
    descripcion: 'Se coordinan por cantidad con anticipación.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre', 'Ej. María José', 20),
    textoExtra: T('Fecha', 'Ej. 8 de junio', 24, false),
    disenos: [
      { id: 'llavero', nombre: 'Llavero con símbolo', art: ART.chalice },
      { id: 'topper', nombre: 'Topper para mesa', art: ART.topper },
      { id: 'placa', nombre: 'Placa de nombre', art: ART.nameplate },
      { id: 'figura', nombre: 'Figurita', art: ART.funko }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / cuerpo', hint: 'La parte principal del recuerdo', porDefecto: 'blanco' },
      { key: 'esqueleto', label: 'Esqueleto / base', hint: 'La base, el aro o el soporte', porDefecto: 'seda' },
      { key: 'letra', label: 'Letra grabada', hint: 'El texto del nombre', porDefecto: 'rosado' }
    ],
    medidas: ['Llavero (6 cm)', 'Mediano (10 cm)', 'Grande (14 cm)']
  },

  promocion: {
    id: 'promocion',
    nombre: 'Recuerdo de promoción',
    linea: 'Eventos',
    categoria: 'Recuerdos para eventos',
    estado: 'encargo',
    resumen: 'Llaveros, placas o figuras con el nombre del salón y la promoción.',
    descripcion: 'Para cerrar el año escolar.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre', 'Ej. Joselyn Ramón', 22),
    textoExtra: T('Salón y año', 'Ej. 5to A · 2026', 24, false),
    disenos: [
      { id: 'llavero', nombre: 'Llavero', art: ART.medallion },
      { id: 'placa', nombre: 'Placa de escritorio', art: ART.nameplate },
      { id: 'figura', nombre: 'Figura', art: ART.funko },
      { id: 'topper', nombre: 'Topper de mesa', art: ART.topper }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / cuerpo', hint: 'La parte principal del recuerdo', porDefecto: 'azul' },
      { key: 'esqueleto', label: 'Esqueleto / base', hint: 'La base, el aro o el soporte', porDefecto: 'blanco' },
      { key: 'letra', label: 'Letra grabada', hint: 'El texto del nombre', porDefecto: 'seda' }
    ],
    medidas: ['Llavero (6 cm)', 'Mediano (10 cm)', 'Grande (14 cm)']
  },

  chocolatada: {
    id: 'chocolatada',
    nombre: 'Recuerdo para chocolatada',
    linea: 'Eventos',
    categoria: 'Recuerdos para eventos',
    estado: 'encargo',
    resumen: 'Toppers y detalles con el nombre del evento, del colegio o de la familia.',
    descripcion: 'Listos para repartir en la chocolatada.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre o mensaje', 'Ej. 5to A · ¡Gracias!', 24),
    textoExtra: T('Fecha o colegio', 'Ej. Colegio San José', 24, false),
    disenos: [
      { id: 'vaso', nombre: 'Topper para vaso', art: ART.mug },
      { id: 'topper', nombre: 'Topper redondo', art: ART.topper },
      { id: 'etiqueta', nombre: 'Etiqueta', art: ART.etiqueta },
      { id: 'figura', nombre: 'Figurita', art: ART.funko }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / cuerpo', hint: 'La parte principal del topper', porDefecto: 'rosa-pastel' },
      { key: 'esqueleto', label: 'Esqueleto / base', hint: 'La base o el palo', porDefecto: 'naranja' },
      { key: 'letra', label: 'Letra grabada', hint: 'El texto del mensaje', porDefecto: 'rojo' }
    ],
    medidas: ['Pequeño (5 cm)', 'Mediano (7 cm)', 'Grande (9 cm)']
  },

  plaza: {
    id: 'plaza',
    nombre: 'Silueta de la Plaza de Armas',
    linea: 'Cajamarca',
    categoria: 'Recuerdos de Cajamarca',
    estado: 'encargo',
    resumen: 'La Catedral y la plaza en una pieza de perfil para escritorio o recuerdo.',
    descripcion: 'Sale bien en un solo color.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre del lugar (opcional)', 'Ej. Plaza de Armas', 20, false),
    textoExtra: T('Fecha o frase', 'Ej. Cajamarca 2026', 24, false),
    disenos: [
      { id: 'silueta', nombre: 'Silueta', art: ART.cathedral },
      { id: 'base', nombre: 'Con base', art: ART.cathedral, extra: ART.base },
      { id: 'marco', nombre: 'En marco', art: ART.marco }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / silueta', hint: 'El perfil del lugar', porDefecto: 'arena' },
      { key: 'esqueleto', label: 'Esqueleto / base', hint: 'La base o el marco', porDefecto: 'negro' },
      { key: 'letra', label: 'Letra grabada', hint: 'El texto del lugar', porDefecto: 'negro' }
    ],
    medidas: ['12 cm', '16 cm', '20 cm']
  },

  otuzco: {
    id: 'otuzco',
    nombre: 'Silueta de la Ventanilla de Otuzco',
    linea: 'Cajamarca',
    categoria: 'Recuerdos de Cajamarca',
    estado: 'encargo',
    resumen: 'El arco de piedra de Otuzco en una silueta de escritorio.',
    descripcion: 'Con el nombre del lugar si lo quieres.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre del lugar (opcional)', 'Ej. Ventanilla de Otuzco', 24, false),
    textoExtra: T('Fecha o frase', 'Ej. Otuzco 2026', 24, false),
    disenos: [
      { id: 'silueta', nombre: 'Silueta', art: ART.arch },
      { id: 'base', nombre: 'Con base', art: ART.arch, extra: ART.base },
      { id: 'marco', nombre: 'En marco', art: ART.marco }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / silueta', hint: 'El perfil del lugar', porDefecto: 'arena' },
      { key: 'esqueleto', label: 'Esqueleto / base', hint: 'La base o el marco', porDefecto: 'negro' },
      { key: 'letra', label: 'Letra grabada', hint: 'El texto del lugar', porDefecto: 'negro' }
    ],
    medidas: ['12 cm', '16 cm', '20 cm']
  },

  lugar: {
    id: 'lugar',
    nombre: 'Tu rincón de Cajamarca',
    linea: 'Cajamarca',
    categoria: 'Recuerdos de Cajamarca',
    estado: 'encargo',
    resumen: 'Tu barrio, tu chacra o tu negocio convertidos en silueta.',
    descripcion: 'Mándanos una foto o un dibujo y lo modelamos.',
    ogImage: 'img/og-catalogo.jpg',
    foto: true,
    texto: T('Nombre del lugar', 'Ej. Mi chacra en Llacta', 22, false),
    textoExtra: T('Frase o fecha', 'Ej. Cajamarca 2026', 24, false),
    disenos: [
      { id: 'pin', nombre: 'Ubicación', art: ART.pin },
      { id: 'marco', nombre: 'En marco', art: ART.marcoFoto },
      { id: 'base', nombre: 'Con base', art: ART.pin, extra: ART.base }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / silueta', hint: 'El perfil del lugar', porDefecto: 'arena' },
      { key: 'esqueleto', label: 'Esqueleto / base', hint: 'La base o el marco', porDefecto: 'negro' },
      { key: 'letra', label: 'Letra grabada', hint: 'El texto del lugar', porDefecto: 'negro' }
    ],
    medidas: ['12 cm', '16 cm', '20 cm']
  },

  lapicero: {
    id: 'lapicero',
    nombre: 'Nombre para lapicero o pluma',
    linea: 'Nombres',
    categoria: 'Nombres personalizados',
    estado: 'encargo',
    resumen: 'Ajustamos el diámetro interior a la medida de tu lapicero.',
    descripcion: 'Para lapiceros, plumones y plumas de distinto grosor.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre', 'Ej. KAREN', 14),
    textoExtra: null,
    disenos: [
      { id: 'lapicero', nombre: 'Lapicero', art: ART.pen },
      { id: 'corto', nombre: 'Nombre corto', art: ART.pen },
      { id: 'doble', nombre: 'Dos piezas', art: ART.pen }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / cuerpo', hint: 'La parte que abraza el lapicero', porDefecto: 'violeta' },
      { key: 'letra', label: 'Letra grabada', hint: 'El texto del nombre', porDefecto: 'blanco' }
    ],
    medidas: ['Grueso 8 mm', 'Grueso 10 mm', 'Grueso 12 mm']
  },

  placa: {
    id: 'placa',
    nombre: 'Placa de escritorio con nombre',
    linea: 'Nombres',
    categoria: 'Nombres personalizados',
    estado: 'encargo',
    resumen: 'Para el escritorio, el aula o el negocio, con el nombre en relieve.',
    descripcion: 'La base y el color los eliges tú.',
    ogImage: 'img/og-catalogo.jpg',
    texto: T('Nombre', 'Ej. Lic. Jair Requejo', 22),
    textoExtra: T('Cargo o empresa', 'Ej. Vicunia', 22, false),
    disenos: [
      { id: 'horizontal', nombre: 'Horizontal', art: ART.nameplate },
      { id: 'vertical', nombre: 'Vertical', art: ART.nameplate },
      { id: 'marco', nombre: 'En marco', art: ART.marco }
    ],
    slots: [
      { key: 'carcasa', label: 'Carcasa / placa', hint: 'La cara con el nombre', porDefecto: 'negro' },
      { key: 'esqueleto', label: 'Esqueleto / base', hint: 'La base o el marco', porDefecto: 'arena' },
      { key: 'letra', label: 'Letra grabada', hint: 'El texto del nombre', porDefecto: 'seda' }
    ],
    medidas: ['Pequeña (10 cm)', 'Mediana (14 cm)', 'Grande (18 cm)']
  }
};

/** Líneas del catálogo, en el orden en que se muestran los filtros. */
export const LINEAS = [
  { id: 'todo', nombre: 'Todo' },
  { id: 'figuras', nombre: 'Figuras' },
  { id: 'nombres', nombre: 'Nombres' },
  { id: 'clickers', nombre: 'Clickers' },
  { id: 'lapices', nombre: 'Lápices' },
  { id: 'dummys', nombre: 'Dummys' },
  { id: 'navidad', nombre: 'Navidad' },
  { id: 'eventos', nombre: 'Eventos' },
  { id: 'cajamarca', nombre: 'Cajamarca' }
];
