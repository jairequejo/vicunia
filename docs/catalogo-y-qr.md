# Catálogo y rutas QR de Vicunia

## Recorrido para clientes

1. La portada conserva su presentación y los configuradores actuales (clicker y lápiz en 3D, figura desde la foto).
2. El catálogo (`catalogo.html`) muestra todas las líneas en un solo lugar, con filtros: todo, figuras, nombres, clickers, lápices, dummys, Navidad, eventos y Cajamarca. Cada tarjeta abre la ficha de esa línea.
3. Un QR en una tienda o puesto lleva a la **ficha de ese producto**, no a una lista genérica. Abajo aparecen el resto de líneas y el botón **Ver catálogo completo**.
4. En la ficha, la persona personaliza la pieza con la misma lógica del clicker y del lápiz: nombre o letras, diseño o silueta, color del esqueleto y de la carcasa, tamaño, cantidad y forma de entrega (recoger en Cajamarca o envío).
5. El botón de WhatsApp abre el chat con un borrador que ya trae todos esos datos. No se envía nada automáticamente: la persona revisa y envía.

## Destinos para los QR

Usar estos caminos solo cuando la web esté publicada en su dominio definitivo y se haya comprobado que cada URL abre correctamente desde un teléfono:

| Cartel | Ruta relativa | QR generado |
| --- | --- | --- |
| Diseña tu clicker | `producto.html?tipo=clicker` | `web/img/qr-clicker.png` |
| Tu lápiz con nombre | `producto.html?tipo=lapiz` | `web/img/qr-lapiz.png` |
| Pide tu dummy | `producto.html?tipo=dummy` | `web/img/qr-dummy.png` |
| Tu foto en figura 3D | `producto.html?tipo=figuras` | `web/img/qr-figuras.png` |
| Ver el catálogo completo | `catalogo.html` | `web/img/qr-catalogo.png` |

Estas rutas son relativas a la carpeta pública de la web; en el servidor local llevan el prefijo `/web/`. El QR impreso debe contener la URL pública completa, con dominio y HTTPS. Evitar imprimir códigos de `localhost` o de una URL provisional.

Para regenerarlos:

```bash
pip install qrcode pillow
python3 tools/generar-qr.py https://vicunia.pe
```

Los carteles imprimibles están en `web/poster.html` (botón «Imprimir los carteles»).

## Qué se muestra ahora y qué se deja para después

La ficha enseña las decisiones relevantes y las deja escritas en el borrador de WhatsApp. El catálogo no guarda datos, calcula precios, comprueba existencias ni tramita pedidos: el precio y el plazo se confirman por WhatsApp antes de imprimir.

Para una fase posterior, el pedido puede seguir este orden: elegir producto → personalizar → indicar cantidad → escoger recojo o envío → revisar resumen → abrir WhatsApp con el resumen. La ubicación exacta de recojo, costos y plazos se confirman antes de implementar opciones cerradas.

## Revisión de contenido antes de publicar

Las líneas nuevas del catálogo son propuestas por encargo. Antes de presentarlas como productos terminados, añadir fotos reales, medidas, colores disponibles, materiales, plazo y condiciones de cada una. En Navidad, los adornos con nombre se distinguen de figuras chibi o esferas de personajes.
