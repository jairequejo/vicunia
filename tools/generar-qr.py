#!/usr/bin/env python3
"""
Genera los códigos QR de Vicunia para los carteles de tiendas y puestos.

Uso:
    python3 tools/generar-qr.py [URL_BASE]

Por defecto usa https://vicunia.pe. Cuando la web esté publicada en otro
dominio, pasa la URL base como argumento y vuelve a ejecutar el script:

    python3 tools/generar-qr.py https://tudominio.pe

Requisitos: pip install qrcode pillow
Salida: web/img/qr-<linea>.png
"""
import os
import sys

import qrcode
from qrcode.constants import ERROR_CORRECT_M

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://vicunia.pe").rstrip("/")
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "web", "img")

# línea -> texto del cartel y ruta de la ficha
CARTELES = {
    "clicker": ("Diseña tu propio clicker", "producto.html?tipo=clicker"),
    "lapiz": ("Tu lápiz con nombre", "producto.html?tipo=lapiz"),
    "dummy": ("Pide tu propio dummy", "producto.html?tipo=dummy"),
    "figuras": ("Tu foto en figura 3D", "producto.html?tipo=figuras"),
    "catalogo": ("Ver el catálogo completo", "catalogo.html"),
}


def main() -> None:
    os.makedirs(DESTINO, exist_ok=True)
    for linea, (_, ruta) in CARTELES.items():
        url = f"{BASE}/{ruta}"
        qr = qrcode.QRCode(
            version=None,
            error_correction=ERROR_CORRECT_M,
            box_size=12,
            border=2,
        )
        qr.add_data(url)
        qr.make(fit=True)
        imagen = qr.make_image(fill_color="#222446", back_color="#FFFFFF").convert("RGB")
        ruta_png = os.path.join(DESTINO, f"qr-{linea}.png")
        imagen.save(ruta_png, "PNG", optimize=True)
        print(f"{ruta_png}  ->  {url}")


if __name__ == "__main__":
    main()
