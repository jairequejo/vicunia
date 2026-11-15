"""Carátula y guía de armado Dummy 13, A4 con división horizontal."""

from pathlib import Path
import shutil

import numpy as np
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
SOURCE = Path(r"C:\Users\Jair\Downloads\JORDANLANDIA.pdf")
OUT_PNG = ROOT / "output" / "png" / "vicunia-dummy13-caratula-instrucciones-A4.png"
OUT_PDF = ROOT / "output" / "pdf" / "vicunia-dummy13-caratula-instrucciones-A4.pdf"
DOWNLOADS = Path(r"C:\Users\Jair\Downloads")
FONT_DIR = Path(r"C:\Windows\Fonts")

W, H, HALF = 2100, 2970, 1485
BG = "#F5F2EC"
GREEN = "#375642"
DARK = "#203127"
RED = "#D71826"
MUTED = "#6A746D"
LINE = "#D7DDD5"
COLORS = ["#71368B", "#CE4B22", "#EBA51D", "#32834C", "#2675BD"]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / ("arialbd.ttf" if bold else "arial.ttf")), size)


def red_parts(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert("RGB")).copy()
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    warm = (r > 68) & (r > g * 1.19) & (g > b * 1.08) & ((r.astype(np.int16) - b.astype(np.int16)) > 35)
    shade = np.clip(r.astype(np.float32) / 198, 0.28, 1.20)
    red = np.array([215, 24, 38], dtype=np.float32)
    a[warm] = np.clip(red * shade[:, :, None], 0, 255).astype(np.uint8)[warm]
    return Image.fromarray(a, "RGB")


def panel_image(halves, page: int, box):
    x1, y1, x2, y2 = box
    return red_parts(halves[page].crop((x1 * 2, y1 * 2, x2 * 2, y2 * 2)))


def fit(img: Image.Image, box_w: int, box_h: int) -> Image.Image:
    scale = min(box_w / img.width, box_h / img.height)
    return img.resize((round(img.width * scale), round(img.height * scale)), Image.Resampling.LANCZOS)


def draw_card(sheet, title, steps, image, box, accent):
    x, y, width, height = box
    d = ImageDraw.Draw(sheet)
    d.rounded_rectangle((x, y, x + width, y + height), radius=19, fill="white", outline=LINE, width=3)
    d.rounded_rectangle((x, y, x + width, y + 14), radius=7, fill=accent)
    d.text((x + 30, y + 33), title, font=font(37, True), fill=DARK)
    d.text((x + width - 30, y + 42), steps, anchor="ra", font=font(26, True), fill=accent)
    d.line((x + 29, y + 92, x + width - 29, y + 92), fill=LINE, width=2)
    im = fit(image, width - 46, height - 123)
    sheet.paste(im, (x + (width - im.width) // 2, y + 105 + (height - 123 - im.height) // 2))


def build():
    doc = pdfium.PdfDocument(str(SOURCE))
    halves = []
    for page in doc:
        im = page.render(scale=4).to_pil().convert("RGB")
        halves.append(im.crop((0, 0, im.width // 2, im.height)))

    sections = [
        ("CABEZA Y TORSO", "01–07", panel_image(halves, 0, (65, 20, 770, 400))),
        ("PIERNAS", "08–13", panel_image(halves, 0, (72, 402, 770, 798))),
        ("PIES", "14–17", panel_image(halves, 0, (70, 798, 770, 1160))),
        ("BRAZOS", "18–22", panel_image(halves, 1, (20, 16, 800, 412))),
        ("ACCESORIOS", "23–26", panel_image(halves, 1, (20, 415, 800, 782))),
    ]
    ImageDraw.Draw(sections[4][2]).rectangle((1020, 1398, 1220, 1468), fill="white")

    sheet = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(sheet)

    # Cubierta superior: marca, mensaje y fotografía del producto.
    for i, color in enumerate(COLORS):
        d.rectangle((i * W // 5, 0, (i + 1) * W // 5, 16), fill=color)
    d.polygon([(1030, 16), (2100, 16), (2100, HALF), (1430, HALF), (1065, 1095)], fill=GREEN)
    d.polygon([(1940, 16), (2100, 16), (2100, 270)], fill="#2A4535")
    d.line((1050, 1120, 1505, 1485), fill="#486952", width=6)

    logo = Image.open(ROOT / "favicon.png").convert("RGBA")
    logo = logo.resize((144, 144), Image.Resampling.LANCZOS)
    sheet.paste(logo, (94, 92), logo)
    d.text((262, 111), "VICUNIA", font=font(77, True), fill=GREEN)
    d.text((100, 318), "DUMMY", font=font(138, True), fill=DARK)
    d.text((92, 472), "13", font=font(333, True), fill=RED)
    d.rectangle((105, 902, 580, 911), fill=RED)
    d.text((105, 954), "ARMA TU FIGURA", font=font(55, True), fill=DARK)
    d.text((105, 1028), "PIEZA A PIEZA", font=font(55, True), fill=DARK)
    d.text((105, 1151), "Guía visual de armado", font=font(41), fill=MUTED)
    d.text((105, 1209), "26 pasos · 5 etapas", font=font(41, True), fill=GREEN)
    d.text((105, 1350), "FIGURA ARTICULADA", font=font(34, True), fill=MUTED)

    hero = Image.open(ROOT / "output" / "png" / "dummy13-producto-rojo.png").convert("RGBA")
    alpha = hero.getchannel("A")
    bbox = alpha.point(lambda p: 255 if p > 20 else 0).getbbox()
    hero = hero.crop(bbox)
    hero = fit(hero, 850, 1380)
    sheet.paste(hero, (1260 + (800 - hero.width) // 2, 75 + (1380 - hero.height) // 2), hero)

    # Mitad inferior: los 26 diagramas completos, agrupados en cinco etapas.
    d.rectangle((0, HALF, W, H), fill=BG)
    for i, color in enumerate(COLORS):
        d.rectangle((i * W // 5, HALF, (i + 1) * W // 5, HALF + 15), fill=color)
    d.text((78, HALF + 46), "INSTRUCCIONES DE ARMADO", font=font(60, True), fill=GREEN)
    d.text((W - 78, HALF + 65), "01—26", anchor="ra", font=font(43, True), fill=RED)
    d.line((78, HALF + 145, W - 78, HALF + 145), fill=LINE, width=3)

    xmargin, gutter = 68, 28
    wide = (W - 2 * xmargin - gutter) // 2
    narrow = (W - 2 * xmargin - 2 * gutter) // 3
    y1, h1 = HALF + 174, 616
    y2, h2 = y1 + h1 + 27, 566
    boxes = [
        (xmargin, y1, wide, h1),
        (xmargin + wide + gutter, y1, wide, h1),
        (xmargin, y2, narrow, h2),
        (xmargin + narrow + gutter, y2, narrow, h2),
        (xmargin + 2 * (narrow + gutter), y2, narrow, h2),
    ]
    for (title, steps, im), box, color in zip(sections, boxes, COLORS):
        draw_card(sheet, title, steps, im, box, color)
    d.text((W // 2, H - 48), "VICUNIA  ·  DUMMY 13", anchor="mm", font=font(28, True), fill=MUTED)

    # Guía de división, fina para que no invada ninguna de las dos mitades.
    d.line((0, HALF, W, HALF), fill="#91A094", width=3)
    OUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT_PNG, dpi=(254, 254), optimize=True)

    c = canvas.Canvas(str(OUT_PDF), pagesize=(210 * mm, 297 * mm))
    c.drawImage(str(OUT_PNG), 0, 0, width=210 * mm, height=297 * mm)
    c.setStrokeColorRGB(0.42, 0.50, 0.44)
    c.setLineWidth(0.45)
    c.setDash(2, 2)
    c.line(0, 148.5 * mm, 210 * mm, 148.5 * mm)
    c.save()

    shutil.copy2(OUT_PNG, DOWNLOADS / OUT_PNG.name)
    shutil.copy2(OUT_PDF, DOWNLOADS / OUT_PDF.name)
    print(OUT_PNG)
    print(OUT_PDF)


if __name__ == "__main__":
    build()
