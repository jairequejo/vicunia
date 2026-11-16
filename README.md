# Vicunia 🦙

**Un detalle tuyo, hecho en Cajamarca.**
Regalos personalizados con impresión 3D: figuras a partir de una foto, clickers de nombres y lápices con el nombre en relieve.

Este repositorio contiene la marca, la web pública y las herramientas de producción. No hay backend: todo lo que ve el cliente es estático y los pedidos llegan por WhatsApp.

---

## 🚀 Arrancar la web en local

La web usa módulos ES, `fetch` y `DecompressionStream`, así que **necesita un servidor HTTP**; abrir el `index.html` con doble clic no funciona.

```bash
node server.js
```

- Web pública (Vicunia): <http://localhost:8080/web/>
- App de inventario (Vicuña · Mundo Suni): <http://localhost:8080/mundo-suni/>
- Presentación de marca: <http://localhost:8080/identidad-vicunia/brand_presentation.html>

---

## 📂 Cómo está ordenado el proyecto

```
vicunia/
├── web/                       Web pública de Vicunia (lo que ve el cliente)
│   ├── index.html             Landing: foto a 3D, clicker, lápiz, cómo funciona, galería, FAQ
│   ├── catalogo.html          Catálogo de líneas con filtros (la tarjeta es el botón)
│   ├── producto.html          Ficha de cada línea (destino de los QR) con el armador
│   ├── poster.html            Carteles con QR listos para imprimir
│   ├── styles.css             Tokens de color, componentes y responsive
│   ├── js/
│   │   ├── config.js          WhatsApp y redes oficiales
│   │   ├── dom.js             Helpers de DOM compartidos ($, $$, setText…)
│   │   ├── site.js            Tema, menú, año y enlaces de WhatsApp (común a todas)
│   │   ├── seo.js             Título, Open Graph, Twitter, canónico y datos estructurados
│   │   ├── palette.js         Filamentos, colores base, formas y teclas
│   │   ├── catalogo-data.js   Datos de cada línea: textos, siluetas y colores
│   │   ├── catalogo.js        Filtros del catálogo
│   │   ├── producto.js        Ficha de producto: SEO, armador y recomendados
│   │   ├── main.js            Portada: arranca sus cuatro piezas
│   │   ├── muestras.js        Muestras de color compartidas (portada y ficha)
│   │   ├── portada/           Los editores de la portada, cada uno aparte
│   │   │   ├── clicker.js       Clicker: estado, teclas, colores y visor 3D
│   │   │   ├── lapiz.js         Lápiz: nombre, colores, medidas y STL
│   │   │   ├── foto.js          Formulario de la foto y pedido por WhatsApp
│   │   │   ├── galeria.js       Galería de trabajos
│   │   │   └── comun.js         Aviso, sonido de clic y descargas
│   │   ├── armador/           El personalizador de la ficha, en piezas
│   │   │   ├── index.js         Une diseñador + entrega + resumen y expone la API
│   │   │   ├── esquema.js       Esqueleto HTML del armador
│   │   │   ├── entrega.js       Recoger o envío, cantidad, notas y nombre del cliente
│   │   │   └── mensaje.js       Resumen en vivo y borrador de WhatsApp
│   │   ├── disenadores/       Un diseñador por tipo de línea
│   │   │   ├── carga.js         Carga bajo demanda (JSCAD y three solo si hacen falta)
│   │   │   ├── clicker.js       Clicker con la malla real de producción
│   │   │   ├── lapiz.js         Nombre para lápiz con el motor real de letras
│   │   │   └── plano.js         Siluetas de las líneas por encargo
│   │   ├── clicker3d.js       Visor del clicker sobre la malla real de producción
│   │   ├── geo-manifest.js    Índices de la malla del clicker
│   │   ├── pencil.js          Vista 3D del lápiz (Three.js)
│   │   └── pencil-geo.js      Generador real de nombres (motor JSCAD)
│   ├── vendor/                Three.js, addons, JSCAD y la malla comprimida del clicker
│   └── img/                   Fotos reales de producto, logo y códigos QR
│
├── mundo-suni/                App histórica de inventario y pedidos (Mundo Suni)
│   ├── index.html             Interfaz de la app (móvil y local-first)
│   ├── app.js                 Lógica de inventario, pedidos y costeo
│   ├── styles.css             Tema Cozy Craft
│   ├── google-apps-script.js  Webhook de respaldo a Google Sheets
│   └── favicon.png
│
├── identidad-vicunia/         Identidad, comunicación y manual visual
│   ├── README.md              Paleta, tono, promesa y reglas de uso del logo
│   ├── brand_presentation.html Presentación interactiva de la marca
│   ├── muestra.html           Muestra visual de la identidad
│   ├── tarjeta-producto.svg   Plantilla de tarjeta para el empaque
│   ├── logo-redes-vicunia.png Logo a color para redes y avisos
│   ├── vicunia.svg            Logo histórico / vectorial
│   ├── colores-*.png          Gráficos de paletas disponibles
│   └── video/                 Proyecto de reels (Remotion). Los renders no se versionan
│
├── tools/                     Herramientas de producción y marketing
│   ├── generar-qr.py          Genera los códigos QR de los carteles
│   ├── calculadora_costos.py  Costos y precio sugerido por pieza (PLA, luz, MO)
│   ├── marketing/             Creatividades y redes sociales
│   │   ├── banners_ideas_vicunia.py   Banners de campaña (SVG + PNG)
│   │   └── generate_og.py             Generador de imágenes Open Graph
│   └── dummy13/               Instructivos, carátulas y guías de Dummy 13
│       ├── dummy13_caratula_a4.py     Carátula A4 con división horizontal
│       ├── dummy13_caratula_libro.py  Carátula libro (2 páginas A5)
│       ├── imprimir_dummys_a3.py      Pliegos A3 de instrucciones
│       ├── adaptar_dummys_a4.py       Adaptación de PDFs a A4
│       └── whatsapp_dummys*.py        Guías de armado para WhatsApp
│
├── docs/                      Documentación de apoyo y arquitectura
│   ├── estructura-web.md      Mapa de módulos y flujo de la web pública
│   ├── catalogo-y-qr.md       Recorrido comercial y destinos de QR
│   ├── inventario-mundo-suni.md Instrucciones de la app de inventario
│   └── coordinacion-antigravity.md Historial de relevo técnico
│
└── server.js                  Servidor estático local en el puerto 8080
```

Los scripts de producción escriben en `output/` y `tmp/`; esas carpetas y los renders de video están en `.gitignore` porque se regeneran.

---

## 🎨 Paleta

Proporción 60 · 25 · 10 · 5: el lienzo manda, el índigo sostiene la lectura, el violeta cierra la venta y los acentos viven en detalles.

| Rol | Color | Hex |
|---|---|---|
| Fondo principal | Lavanda | `#E9EDFC` |
| Fondo secundario | Rosa nube | `#F6E4F1` |
| Texto y estructura | Índigo tinta | `#222446` |
| Acción y botones | Violeta | `#5A4FE0` |
| Badges «Personalizado» | Rosado intenso | `#F0357E` |
| Reseñas y avisos | Amarillo | `#FFC24D` |
| Etiquetas técnicas | Celeste glaciar | `#C0E4FF` |

Reglas rápidas: nunca texto amarillo sobre lavanda, nunca rosado como fondo de sección completa, y el celeste se usa solo para datos técnicos (medidas, envíos, estados). El modo oscuro usa una base ciruela con los mismos acentos.

---

## 📱 Contacto oficial

- WhatsApp de pedidos: [+51 907 677 175](https://wa.me/51907677175)
- Instagram: [@vicuniacax](https://www.instagram.com/vicuniacax)
- TikTok: [@vicuniacax](https://www.tiktok.com/@vicuniacax)
- Facebook: [Vicunia](https://www.facebook.com/profile.php?id=61590919520057)

Los enlaces viven en `web/js/config.js`; si cambian, se edita solo ese archivo.

---

## 📦 Productos

1. **Figura 3D desde una foto** — el cliente envía la foto por WhatsApp (perro, persona, pareja) y se convierte en figura impresa.
2. **Clicker de nombre** — visor 3D con la malla real, 1 a 9 teclas, 17 filamentos y 15 formas de tecla. Incluye argolla metálica estándar.
3. **Lápiz con nombre** — hasta 24 caracteres, una o dos caras de color, medidas ajustables y descarga de STL.

El catálogo amplía estas líneas con ideas por encargo: dummy con colores de esqueleto y carcasa, Navidad con nombre, recuerdos para eventos y siluetas de Cajamarca. Cada tarjeta del catálogo es un botón: al tocarla se abre la ficha de esa línea, que usa la misma lógica del clicker y del lápiz —nombre, diseño o silueta, color del esqueleto y de la carcasa, tamaño, cantidad y si se recoge en Cajamarca o se envía— y deja el pedido escrito en WhatsApp. El clicker y el lápiz de la ficha usan el visor 3D real (malla de producción y motor de letras). No hay pedido automatizado ni precios publicados.

No se publican precios en la web: se confirman por WhatsApp según tamaño, colores y plazo.

---

## 📎 Carteles con QR para tiendas y puestos

`web/poster.html` trae los carteles listos para imprimir (clicker, lápiz, dummy, figura desde foto y catálogo), cada uno con su código QR. Los QR se generan con:

```bash
pip install qrcode pillow
python3 tools/generar-qr.py https://vicunia.pe
```

Si la web cambia de dominio, vuelve a correr el script con la URL nueva y vuelve a imprimir los carteles: un QR con una URL provisional lleva a nadie a ningún lado.
