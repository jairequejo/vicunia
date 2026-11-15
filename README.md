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
- App de inventario (Vicuña · Mundo Suni): <http://localhost:8080/>

---

## 📂 Cómo está ordenado el proyecto

```
vicunia/
├── web/                       Web pública de Vicunia (lo que ve el cliente)
│   ├── index.html             Landing: foto a 3D, clicker, lápiz, cómo funciona, galería, FAQ
│   ├── styles.css             Tokens de color, componentes y responsive
│   ├── js/
│   │   ├── config.js          WhatsApp y redes oficiales
│   │   ├── main.js            Estado de la página, formulario de foto, exportaciones
│   │   ├── clicker3d.js       Visor del clicker sobre la malla real de producción
│   │   ├── geo-manifest.js    Índices de la malla del clicker
│   │   ├── palette.js         Filamentos, colores base, formas y teclas
│   │   ├── pencil.js          Vista 3D del lápiz (Three.js)
│   │   └── pencil-geo.js      Generador real de nombres (motor JSCAD)
│   ├── vendor/                Three.js, addons, JSCAD y la malla comprimida del clicker
│   └── img/                   Fotos reales de producto y logo de la marca
│
├── identidad-vicunia/         Identidad y comunicación
│   ├── README.md              Paleta, tono, promesa y reglas de uso del logo
│   ├── muestra.html           Muestra visual de la identidad
│   ├── tarjeta-producto.svg   Plantilla de tarjeta para el empaque
│   └── video/                 Proyecto de reels (Remotion). Los renders no se versionan
│
├── index.html · app.js · styles.css · google-apps-script.js
│                              App "Vicuña" de inventario y costos (Mundo Suni)
│                              Instrucciones: docs/inventario-mundo-suni.md
├── server.js                  Servidor estático local en el puerto 8080
├── docs/                      Documentación de apoyo
│
├── calculadora_costos.py      Costos y precio sugerido por pieza
├── banners_ideas_vicunia.py   Banners de campaña (SVG + PNG)
├── whatsapp_dummys*.py        Guías de armado para WhatsApp
├── imprimir_dummys_a3.py      Pliegos A3 de instrucciones
├── dummy13_caratula_*.py      Carátulas A4 y de libro
└── adaptar_dummys_a4.py       Adaptación de PDFs a A4
```

Los scripts de producción escriben en `output/`, `outputs/` y `tmp/`; esas carpetas y los renders de video están en `.gitignore` porque se regeneran.

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

No se publican precios en la web: se confirman por WhatsApp según tamaño, colores y plazo.
