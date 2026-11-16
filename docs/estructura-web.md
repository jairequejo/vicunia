# Estructura del código de la web

La web está dividida en módulos con una sola responsabilidad cada uno. Todo lo
que se repite (tema, menú, enlaces de WhatsApp, muestras de color) vive en un
solo archivo y se importa desde donde se necesite.

## Mapa de módulos

```
web/js/
├── config.js        Datos de contacto: WhatsApp, Instagram, TikTok, Facebook.
├── dom.js           Helpers de DOM: $, $$, setText, setHTML, toggleHidden, alListo.
├── site.js          Lo común a toda página: tema, menú móvil, año del pie y
│                    enlaces `data-wa`. Se arranca con initSite().
├── seo.js           Título, descripción, Open Graph, Twitter, canónico y
│                    datos estructurados de Schema.org.
├── palette.js       Filamentos, colores base, símbolos y teclas del clicker.
├── catalogo-data.js Datos de cada línea del catálogo (textos, siluetas,
│                    colores por defecto). Es la fuente de verdad del catálogo.
├── catalogo.js      Filtros del catálogo (por línea) y lectura del ancla #.
├── producto.js      Ficha de producto: SEO, armador, recomendados y compartir.
├── main.js          Portada: estado del clicker y del lápiz, formulario de la
│                    foto, exportaciones y galería.
│
├── armador/         El personalizador, en piezas
│   ├── index.js     Une diseñador + entrega + resumen y expone la API.
│   ├── esquema.js   Esqueleto HTML del armador (la parte que no cambia).
│   ├── entrega.js   Recoger o envío, cantidad, notas y nombre del cliente.
│   ├── mensaje.js   Resumen en vivo y borrador del mensaje de WhatsApp.
│   └── ui.js        Muestras de color y nombres de filamento.
│
├── disenadores/     Un diseñador por tipo de línea
│   ├── carga.js     Elige el diseñador y carga lo justo (JSCAD, three).
│   ├── clicker.js   Clicker con la malla real de producción.
│   ├── lapiz.js     Nombre para lápiz con el motor real de letras.
│   └── plano.js     Siluetas de las líneas por encargo (con foto opcional).
│
├── clicker3d.js     Visor 3D del clicker (Three.js + malla de producción).
├── geo-manifest.js  Índices de la malla del clicker.
├── pencil.js        Visor 3D del lápiz (Three.js).
└── pencil-geo.js    Motor real de letras (JSCAD), en milímetros.
```

## Cómo arranca una página

1. `initSite()` deja lista la base común (tema, menú, año, WhatsApp).
2. El módulo de la página hace lo suyo:
   - `catalogo.js` → filtra las tarjetas y lee el ancla de la URL.
   - `producto.js` → pinta la SEO, arma el armador y los recomendados.
   - `main.js` → arma el estado del clicker y del lápiz.
3. En la ficha, `crearArmador()` hace esto:

```
crearArmador({ mount, producto, onChange })
   ├─ esquema.js      pinta el esqueleto
   ├─ entrega.js      recoge envío, cantidad, notas y cliente
   ├─ disenadores/    monta el diseñador de esa línea (clicker, lápiz o silueta)
   └─ mensaje.js      resumen en vivo + borrador de WhatsApp
```

## Reglas

- **Una sola fuente de verdad.** El tema, el menú y los enlaces de WhatsApp
  solo existen en `site.js`. Ninguna página los reimplementa.
- **Cada módulo hace una cosa.** Si un archivo necesita dos responsabilidades,
  se parte en dos.
- **Los datos aparte de la lógica.** El catálogo y sus textos viven en
  `catalogo-data.js`; el armador no sabe qué es un árbol de Navidad.
- **Nada de precios inventados.** El armador arma un borrador de WhatsApp con
  lo que eligió la persona; el precio y el plazo los confirma Vicunia.
- **Los enlaces de WhatsApp funcionan sin JavaScript.** El `href` lleva a la
  conversación y el `data-wa` añade el borrador.

## Cómo agregar una línea nueva al catálogo

1. Añadir el producto en `web/js/catalogo-data.js` con su texto, sus diseños
   (siluetas en SVG con `data-slot`), sus colores y sus medidas.
2. Añadir la tarjeta en `web/catalogo.html` con `data-cats="<línea>"` y el
   enlace `producto.html?tipo=<id>` dentro del título.
3. Si la línea necesita un diseñador nuevo (3D, medidas, Etc.), crear
   `web/js/disenadores/<id>.js` y registrarlo en `disenadores/carga.js`.
4. Si es una línea nueva de filtro, añadirla a `FILTROS` en `catalogo.js` y al
   botón correspondiente en `catalogo.html`.
