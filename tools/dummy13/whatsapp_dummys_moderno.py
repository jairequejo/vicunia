"""Afiche moderno de una sola imagen para la guía de armado Vicuña."""

from pathlib import Path

import numpy as np
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = Path(r"C:\Users\Jair\Downloads\JORDANLANDIA.pdf")
DEST = Path(r"C:\Users\Jair\Downloads\vicunia-guia-dummy-rojo-moderno.png")
PROJECT_DEST = ROOT / "output" / "png" / DEST.name
FONT = Path(r"C:\Windows\Fonts")

BG = "#F6F4F0"
INK = "#232D27"
MUTED = "#6A6F69"
LINE = "#D8D8D0"
GREEN = "#3C5846"
COLORS = ["#6B348F", "#C94C1D", "#E0961B", "#2A6C3A", "#2B71CC"]


def font(size: int, bold: bool = False):
    return ImageFont.truetype(str(FONT / ("arialbd.ttf" if bold else "arial.ttf")), size)


doc = pdfium.PdfDocument(str(SOURCE))
pages = [p.render(scale=4).to_pil().convert("RGB") for p in doc]
halves = []
for page in pages:
    mid = page.width // 2
    halves.append(page.crop((0, 0, mid, page.height)))


def extract(page: int, box: tuple[int, int, int, int]) -> Image.Image:
    x1, y1, x2, y2 = box
    return halves[page].crop((2*x1, 2*y1, 2*x2, 2*y2))


def red_parts(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert("RGB")).copy()
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    warm = (r > 68) & (r > g * 1.19) & (g > b * 1.08) & ((r.astype(np.int16) - b.astype(np.int16)) > 35)
    shade = np.clip(r.astype(np.float32) / 198, 0.28, 1.20)
    red = np.array([215, 24, 38], dtype=np.float32)
    a[warm] = np.clip(red * shade[:, :, None], 0, 255).astype(np.uint8)[warm]
    return Image.fromarray(a, "RGB")


def card(number: str, label: str, image: Image.Image, accent: str, width: int = 1670) -> Image.Image:
    image = red_parts(image)
    max_w = width - 78
    if image.width > max_w:
        image = image.resize((max_w, round(image.height * max_w / image.width)), Image.Resampling.LANCZOS)
    height = image.height + 195
    result = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(result)
    draw.rounded_rectangle((1, 1, width-2, height-2), radius=16, outline=LINE, width=3)
    draw.rectangle((0, 0, width, 13), fill=accent)
    draw.text((54, 45), number, font=font(76, True), fill=accent)
    draw.text((203, 62), label, font=font(52, True), fill=INK)
    draw.line((54, 147, width-54, 147), fill=LINE, width=3)
    result.paste(image, ((width-image.width)//2, 170))
    return result


accessories = extract(1, (20, 415, 800, 782))
ImageDraw.Draw(accessories).rectangle((510, 699, 610, 734), fill="white")
cards = [
    card("01", "CABEZA Y TORSO   ·   1–7", extract(0, (65, 20, 770, 400)), COLORS[0]),
    card("02", "PIERNAS   ·   8–13", extract(0, (72, 402, 770, 798)), COLORS[1]),
    card("03", "PIES   ·   14–17", extract(0, (70, 798, 770, 1160)), COLORS[2]),
    card("04", "BRAZOS   ·   18–22", extract(1, (20, 16, 800, 412)), COLORS[3]),
    card("05", "ACCESORIOS   ·   23–26", accessories, COLORS[4]),
]

W, M, GAP, CARD_W = 3600, 100, 60, 1670
TOP, ROW_GAP = 520, 55
row1 = max(cards[0].height, cards[1].height)
row2 = max(cards[2].height, cards[3].height)
y1 = TOP
y2 = y1 + row1 + ROW_GAP
y3 = y2 + row2 + ROW_GAP
H = y3 + cards[4].height + 100

poster = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(poster)
for i, color in enumerate(COLORS):
    d.rectangle((i * W//5, 0, (i+1) * W//5, 13), fill=color)

logo = Image.open(ROOT / "favicon.png").convert("RGBA")
logo = logo.resize((185, 185), Image.Resampling.LANCZOS)
poster.paste(logo, (M, 102), logo)
d.text((340, 92), "VICUNIA", font=font(126, True), fill=GREEN)
d.text((344, 235), "GUÍA DE ARMADO DEL DUMMY", font=font(70, True), fill=INK)
d.text((W-M, 111), "01—26", anchor="ra", font=font(115, True), fill="#C94C1D")
d.text((W-M, 253), "DUMMY ROJO · PIEZAS NEGRAS", anchor="ra", font=font(42, True), fill=MUTED)
d.line((M, 425, W-M, 425), fill=LINE, width=4)
d.rectangle((M, 421, M+550, 429), fill=GREEN)

positions = [
    (M, y1), (M+CARD_W+GAP, y1),
    (M, y2), (M+CARD_W+GAP, y2),
    ((W-CARD_W)//2, y3),
]
for item, (x, y) in zip(cards, positions):
    poster.paste(item, (x, y))

DEST.parent.mkdir(parents=True, exist_ok=True)
PROJECT_DEST.parent.mkdir(parents=True, exist_ok=True)
poster.save(DEST, "PNG", optimize=True)
poster.save(PROJECT_DEST, "PNG", optimize=True)
print(DEST, poster.size)
