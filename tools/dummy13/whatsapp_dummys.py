"""Exporta la guía visual de dummys en láminas PNG para WhatsApp."""

from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = Path(r"C:\Users\Jair\Downloads\JORDANLANDIA.pdf")
OUT = ROOT / "output" / "png"
OUT.mkdir(parents=True, exist_ok=True)

CREAM = "#F5F2EB"
GREEN = "#3C5846"
GOLD = "#D49D4F"
TERRACOTTA = "#C26753"
INK = "#232D27"
FONT_DIR = Path(r"C:\Windows\Fonts")


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / name), size)


def make_sheet(page, half: str, section: str, variant: str, filename: str) -> None:
    rendered = page.render(scale=4).to_pil().convert("RGB")
    mid = rendered.width // 2
    diagram = rendered.crop((0, 0, mid, rendered.height) if half == "left" else (mid, 0, rendered.width, rendered.height))

    width = 1800
    top = 270
    left = (width - diagram.width) // 2
    height = top + diagram.height + 175
    sheet = Image.new("RGB", (width, height), CREAM)
    draw = ImageDraw.Draw(sheet)

    draw.rectangle((0, 0, width, 198), fill=GREEN)
    logo = Image.open(ROOT / "identidad-vicunia" / "logo-redes-vicunia.png").convert("RGBA")
    logo.thumbnail((140, 140), Image.Resampling.LANCZOS)
    sheet.paste(logo, (76, 29), logo)
    draw.text((245, 36), "VICUNIA", font=font("arialbd.ttf", 74), fill="white")
    draw.text((250, 124), "Guía visual de armado · dummys", font=font("arial.ttf", 35), fill=CREAM)

    draw.text((75, 217), section.upper(), font=font("arialbd.ttf", 34), fill=INK)
    if variant:
        bbox = draw.textbbox((0, 0), variant, font=font("arial.ttf", 29))
        draw.text((width - 75 - (bbox[2] - bbox[0]), 222), variant, font=font("arial.ttf", 29), fill=GREEN)

    draw.rounded_rectangle((left - 11, top - 11, left + diagram.width + 11, top + diagram.height + 11), radius=22, fill="white")
    sheet.paste(diagram, (left, top))

    y = top + diagram.height + 35
    draw.text((74, y), "Piezas y secuencia del instructivo original", font=font("arialbd.ttf", 28), fill=INK)
    draw.text((74, y + 43), "Fuente: JORDANLANDIA · Presentación visual: Vicuña", font=font("arial.ttf", 25), fill=GREEN)
    colors = [CREAM, GREEN, GOLD, TERRACOTTA, INK]
    sw = 95
    for i, color in enumerate(colors):
        draw.rounded_rectangle((width - 75 - (len(colors) - i) * (sw + 12), y + 11, width - 75 - (len(colors) - i) * (sw + 12) + sw, y + 70), radius=13, fill=color, outline="#D9D4C9", width=2)

    sheet.save(OUT / filename, "PNG", optimize=True)
    print(OUT / filename, sheet.size)


doc = pdfium.PdfDocument(str(SOURCE))
make_sheet(doc[0], "left", "Pasos 01–17", "Cuerpo, piernas y pies", "vicunia-dummys-pasos-01-17.png")
make_sheet(doc[1], "left", "Pasos 18–26", "Brazos y accesorios · ejemplo dorado", "vicunia-dummys-pasos-18-26-dorado.png")
make_sheet(doc[1], "right", "Pasos 18–26", "Brazos y accesorios · ejemplos azul y rojo", "vicunia-dummys-pasos-18-26-colores.png")
