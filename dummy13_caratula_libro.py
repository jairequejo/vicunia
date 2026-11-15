"""Dummy 13: A4 horizontal, dos páginas A5 verticales con fondo blanco."""

from pathlib import Path
import shutil

import pypdfium2 as pdfium
from PIL import Image, ImageDraw
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from dummy13_caratula_a4 import (
    COLORS, DARK, GREEN, LINE, MUTED, RED, ROOT, SOURCE,
    draw_card, fit, font, panel_image,
)


W, H, HALF = 2970, 2100, 1485
OUT_PNG = ROOT / "output" / "png" / "vicunia-dummy13-caratula-libro-A4.png"
OUT_PDF = ROOT / "output" / "pdf" / "vicunia-dummy13-caratula-libro-A4.pdf"
DOWNLOADS = Path(r"C:\Users\Jair\Downloads")


def build(brand="vicunia"):
    if brand not in {"vicunia", "encanta2"}:
        raise ValueError(brand)
    is_encanta2 = brand == "encanta2"
    out_png = (ROOT / "output" / "png" / "encanta2-dummy13-caratula-libro-A4.png") if is_encanta2 else OUT_PNG
    out_pdf = (ROOT / "output" / "pdf" / "encanta2-dummy13-caratula-libro-A4.pdf") if is_encanta2 else OUT_PDF
    card_colors = ["#694287", "#E00012", "#287EB0", "#694287", "#287EB0"] if is_encanta2 else COLORS
    brand_ink = "#523673" if is_encanta2 else GREEN
    source = pdfium.PdfDocument(str(SOURCE))
    halves = []
    for page in source:
        image = page.render(scale=4).to_pil().convert("RGB")
        halves.append(image.crop((0, 0, image.width // 2, image.height)))

    sections = [
        ("CABEZA Y TORSO", "01–07", panel_image(halves, 0, (65, 20, 770, 400))),
        ("PIERNAS", "08–13", panel_image(halves, 0, (72, 402, 770, 798))),
        ("PIES", "14–17", panel_image(halves, 0, (70, 798, 770, 1160))),
        ("BRAZOS", "18–22", panel_image(halves, 1, (20, 16, 800, 412))),
        ("ACCESORIOS", "23–26", panel_image(halves, 1, (20, 415, 800, 782))),
    ]
    ImageDraw.Draw(sections[4][2]).rectangle((1020, 1398, 1220, 1468), fill="white")

    sheet = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(sheet)

    # Página izquierda: guía completa y lectura vertical.
    d.text((58, 44), "INSTRUCCIONES DE ARMADO", font=font(52, True), fill=brand_ink)
    d.text((58, 108), "DUMMY 13  ·  26 PASOS", font=font(29, True), fill=MUTED)
    d.line((58, 165, HALF - 58, 165), fill=LINE, width=3)
    d.rectangle((58, 163, 422, 170), fill=RED)

    margin, gap = 58, 22
    narrow = (HALF - 2 * margin - gap) // 2
    wide = HALF - 2 * margin
    y1, y2, y3 = 194, 754, 1314
    card_h, bottom_h = 536, 722
    boxes = [
        (margin, y1, narrow, card_h),
        (margin + narrow + gap, y1, narrow, card_h),
        (margin, y2, narrow, card_h),
        (margin + narrow + gap, y2, narrow, card_h),
        (margin, y3, wide, bottom_h),
    ]
    for (title, steps, image), box, color in zip(sections, boxes, card_colors):
        draw_card(sheet, title, steps, image, box, color)

    # Página derecha: carátula de empaque, tinta solo en texto y producto.
    right = HALF + 88
    if is_encanta2:
        logo = Image.open(Path(r"C:\Users\Jair\AppData\Local\Temp\codex-clipboard-5a87cd7e-f95d-41e0-811c-f9e49001d7c5.png")).convert("RGB")
        logo = logo.crop((28, 250, 686, 429))
        logo = fit(logo, 1120, 245)
        sheet.paste(logo, (right, 47))
        rule_y, title_y, number_y = 331, 375, 535
        rule_colors = ["#E00012", "#694287", "#287EB0"]
    else:
        logo = Image.open(ROOT / "favicon.png").convert("RGBA")
        logo = logo.resize((125, 125), Image.Resampling.LANCZOS)
        sheet.paste(logo, (right, 70), logo)
        d.text((right + 148, 83), "VICUNIA", font=font(72, True), fill=GREEN)
        rule_y, title_y, number_y = 223, 298, 451
        rule_colors = COLORS
    d.line((right, rule_y, W - 88, rule_y), fill=LINE, width=3)
    for i, color in enumerate(rule_colors):
        d.rectangle((right + i * 90, rule_y - 3, right + (i + 1) * 90, rule_y + 5), fill=color)

    d.text((right, title_y), "DUMMY", font=font(140, True), fill=DARK)
    d.text((right - 9, number_y), "13", font=font(275, True), fill=RED)
    d.text((right + 3, 870), "FIGURA", font=font(44, True), fill=brand_ink)
    d.text((right + 3, 927), "ARTICULADA", font=font(44, True), fill=brand_ink)
    d.line((right, 1030, right + 332, 1030), fill=RED, width=8)
    d.text((right + 3, 1074), "Ármalo pieza", font=font(36), fill=DARK)
    d.text((right + 3, 1123), "a pieza", font=font(36), fill=DARK)

    hero = Image.open(ROOT / "output" / "png" / "dummy13-producto-rojo.png").convert("RGBA")
    bbox = hero.getchannel("A").point(lambda p: 255 if p > 20 else 0).getbbox()
    hero = hero.crop(bbox)
    hero = fit(hero, 710, 1500)
    sheet.paste(hero, (W - 150 - hero.width, 380), hero)

    d.line((right, H - 176, W - 88, H - 176), fill=LINE, width=3)
    d.text((right, H - 133), "GUÍA VISUAL DE ARMADO", font=font(37, True), fill=DARK)
    d.text((right, H - 80), "26 pasos  ·  5 etapas", font=font(31), fill=MUTED)

    # Línea guía central para doblar la hoja como un libro.
    d.line((HALF, 0, HALF, H), fill="#A5ADA6", width=2)
    out_png.parent.mkdir(parents=True, exist_ok=True)
    out_pdf.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_png, dpi=(254, 254), optimize=True)
    pdf = canvas.Canvas(str(out_pdf), pagesize=(297 * mm, 210 * mm))
    pdf.drawImage(str(out_png), 0, 0, width=297 * mm, height=210 * mm)
    pdf.setStrokeColorRGB(0.55, 0.60, 0.56)
    pdf.setLineWidth(0.4)
    pdf.setDash(2, 2)
    pdf.line(148.5 * mm, 0, 148.5 * mm, 210 * mm)
    pdf.save()
    shutil.copy2(out_png, DOWNLOADS / out_png.name)
    shutil.copy2(out_pdf, DOWNLOADS / out_pdf.name)
    print(out_png)
    print(out_pdf)


if __name__ == "__main__":
    import sys
    build(sys.argv[1] if len(sys.argv) > 1 else "vicunia")
