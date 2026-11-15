"""Dos hojas A3 apaisadas: tres y dos guías completas con cortes verticales."""

from io import BytesIO
from pathlib import Path

import numpy as np
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parent
SOURCE = Path(r"C:\Users\Jair\Downloads\JORDANLANDIA.pdf")
DOWNLOADS = Path(r"C:\Users\Jair\Downloads")
OUT = ROOT / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)
PYTHON_FONT = Path(r"C:\Windows\Fonts\arialbd.ttf")
BG = "#FAF9F5"
INK = "#232D27"
RED = "#D71826"
COLORS = ["#6B348F", "#C94C1D", "#E0961B", "#2A6C3A", "#2B71CC"]


def bold(n):
    return ImageFont.truetype(str(PYTHON_FONT), n)


doc = pdfium.PdfDocument(str(SOURCE))
left_halves = []
for page in doc:
    rendered = page.render(scale=4).to_pil().convert("RGB")
    left_halves.append(rendered.crop((0, 0, rendered.width // 2, rendered.height)))


def crop(page, box):
    x1, y1, x2, y2 = box
    return left_halves[page].crop((x1*2, y1*2, x2*2, y2*2))


def recolor(im):
    a = np.asarray(im.convert("RGB")).copy()
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    warm = (r > 68) & (r > g * 1.19) & (g > b * 1.08) & ((r.astype(np.int16) - b.astype(np.int16)) > 35)
    shade = np.clip(r.astype(np.float32) / 198, 0.28, 1.20)
    red = np.array([215, 24, 38], dtype=np.float32)
    a[warm] = np.clip(red * shade[:, :, None], 0, 255).astype(np.uint8)[warm]
    return Image.fromarray(a, "RGB")


accessories = crop(1, (20, 415, 800, 782))
ImageDraw.Draw(accessories).rectangle((510, 699, 610, 734), fill="white")
sections = [
    ("01  CABEZA Y TORSO  /  1-7", crop(0, (65, 20, 770, 400))),
    ("02  PIERNAS  /  8-13", crop(0, (72, 402, 770, 798))),
    ("03  PIES  /  14-17", crop(0, (70, 798, 770, 1160))),
    ("04  BRAZOS  /  18-22", crop(1, (20, 16, 800, 412))),
    ("05  ACCESORIOS  /  23-26", accessories),
]


def three_up_panel():
    w, h = 1400, 2970
    panel = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(panel)
    d.rectangle((0, 0, w, 12), fill=RED)
    logo = Image.open(ROOT / "favicon.png").convert("RGBA")
    logo = logo.resize((76, 76), Image.Resampling.LANCZOS)
    panel.paste(logo, (155, 38), logo)
    d.text((250, 36), "VICUNIA", font=bold(54), fill=INK)
    d.text((250, 88), "GUIA DE ARMADO DEL DUMMY", font=bold(29), fill=RED)
    d.line((140, 133, 1260, 133), fill="#B8B9B3", width=3)

    max_img_w = 980
    header_h = 43
    gap = 9
    y = 153
    for idx, (label, raw) in enumerate(sections):
        im = recolor(raw)
        im_h = round(im.height * max_img_w / im.width)
        im = im.resize((max_img_w, im_h), Image.Resampling.LANCZOS)
        x = (w - max_img_w) // 2
        d.rectangle((x, y, x + max_img_w, y + header_h), fill=COLORS[idx])
        d.text((x + 13, y + 7), label, font=bold(29), fill="white")
        panel.paste(im, (x, y + header_h))
        y += header_h + im_h + gap
    if y > h - 4:
        raise ValueError(f"Three-up guide overflows: {y} > {h}")
    return panel


def pdf_path(name):
    return OUT / name


def make_three_up(panel):
    p = pdf_path("vicunia-dummys-A3-tres-copias.pdf")
    pw, ph = landscape(A3)
    c = canvas.Canvas(str(p), pagesize=(pw, ph), pageCompression=1)
    image = ImageReader(panel)
    for i in range(3):
        c.drawImage(image, i * 140 * mm, 0, width=140*mm, height=297*mm, mask="auto")
    c.setStrokeColor(HexColor("#333333"))
    c.setLineWidth(0.7)
    for i in (1, 2):
        x = i * 140 * mm
        c.line(x, 0, x, ph)
    c.showPage()
    c.save()
    return p


def make_two_up():
    p = pdf_path("vicunia-dummys-A3-dos-copias.pdf")
    art = Image.open(DOWNLOADS / "vicunia-guia-dummy-rojo-moderno.png").convert("RGB")
    pw, ph = landscape(A3)
    c = canvas.Canvas(str(p), pagesize=(pw, ph), pageCompression=1)
    panel_w = 210 * mm
    usable_w = 198 * mm
    img_h = usable_w * art.height / art.width
    y = (ph - img_h) / 2
    image = ImageReader(art)
    for i in range(2):
        c.drawImage(image, i * panel_w + (panel_w - usable_w)/2, y, width=usable_w, height=img_h, mask="auto")
    c.setStrokeColor(HexColor("#333333"))
    c.setLineWidth(0.7)
    c.line(panel_w, 0, panel_w, ph)
    c.showPage()
    c.save()
    return p


panel = three_up_panel()
paths = [make_three_up(panel), make_two_up()]
for path in paths:
    copy = DOWNLOADS / path.name
    copy.write_bytes(path.read_bytes())
    print(copy)
