"""Diseño único para compartir el instructivo visual de dummys por WhatsApp."""

from pathlib import Path
import pypdfium2 as pdfium
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = Path(r"C:\Users\Jair\Downloads\JORDANLANDIA.pdf")
DEST = Path(r"C:\Users\Jair\Downloads\vicunia-guia-dummy-rojo-afiche.png")
BRAND = {"cream": "#F5F2EB", "green": "#3C5846", "gold": "#D49D4F", "terracotta": "#C26753", "ink": "#232D27"}
FONT = Path(r"C:\Windows\Fonts")

def f(bold=False, size=48):
    return ImageFont.truetype(str(FONT / ("arialbd.ttf" if bold else "arial.ttf")), size)

doc = pdfium.PdfDocument(str(SOURCE))
pages = [p.render(scale=4).to_pil().convert("RGB") for p in doc]
halves = []
for page in pages:
    mid = page.width // 2
    halves.append((page.crop((0, 0, mid, page.height)), page.crop((mid, 0, page.width, page.height))))

def extract(page, side, box):
    x1, y1, x2, y2 = box
    return halves[page][side].crop((x1 * 2, y1 * 2, x2 * 2, y2 * 2))

def recolor_parts(img):
    """Make the orange dummy pieces red while retaining black parts and shading."""
    a = np.asarray(img.convert("RGB")).copy()
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    mask = (r > 68) & (r > g * 1.19) & (g > b * 1.08) & ((r.astype(np.int16) - b.astype(np.int16)) > 35)
    shade = np.clip(r.astype(np.float32) / 198, 0.28, 1.20)
    red = np.array([215, 24, 38], dtype=np.float32)
    recolored = np.clip(red[None, None, :] * shade[:, :, None], 0, 255).astype(np.uint8)
    a[mask] = recolored[mask]
    return Image.fromarray(a, "RGB")

def section(label, img, color, width=1860):
    img = recolor_parts(img)
    inset = 36
    available = width - 2 * inset
    image_width = min(available, img.width)
    image_height = round(img.height * image_width / img.width)
    img = img.resize((image_width, image_height), Image.Resampling.LANCZOS)
    card = Image.new("RGB", (width, image_height + 185), "white")
    d = ImageDraw.Draw(card)
    d.rounded_rectangle((0, 0, width - 1, card.height - 1), 26, outline="#D8C9B6", width=4)
    d.rounded_rectangle((43, 32, 126, 115), 38, fill=color)
    d.text((59, 48), label[:2], font=f(True, 44), fill="white")
    d.text((154, 49), label[4:], font=f(True, 51), fill=BRAND["ink"])
    d.line((43, 137, width - 43, 137), fill=color, width=5)
    card.paste(img, ((width - image_width) // 2, 152))
    return card

accessories = extract(1, 0, (20, 415, 800, 782))
ImageDraw.Draw(accessories).rectangle((510, 699, 610, 734), fill="white")

left = [
    section("01  CABEZA Y TORSO  ·  PASOS 1–7", extract(0, 0, (65, 20, 770, 400)), "#6B348F"),
    section("02  PIERNAS  ·  PASOS 8–13", extract(0, 0, (72, 402, 770, 798)), "#C94C1D"),
    section("03  PIES  ·  PASOS 14–17", extract(0, 0, (70, 798, 770, 1160)), "#E0961B"),
]
right = [
    section("04  BRAZOS  ·  PASOS 18–22", extract(1, 0, (20, 16, 800, 412)), "#2A6C3A"),
    section("05  ACCESORIOS  ·  PASOS 23–26", accessories, "#2B71CC"),
]

W = 4000
M = 100
G = 80
TOP = 665
gap = 52
left_height = sum(c.height for c in left) + gap * (len(left) - 1)
right_height = sum(c.height for c in right) + gap * (len(right) - 1)
H = TOP + max(left_height, right_height) + 155
out = Image.new("RGB", (W, H), BRAND["cream"])
ornament = Image.open(ROOT / "output" / "png" / "vicunia-ornamento-artesanal.png").convert("RGBA")
ornament = ornament.resize((W, H), Image.Resampling.LANCZOS)
out.paste(ornament, (0, 0), ornament)
d = ImageDraw.Draw(out)
d.rounded_rectangle((260, 75, 3710, 520), 26, fill="#FAF6EE", outline=BRAND["gold"], width=6)
logo = Image.open(ROOT / "favicon.png").convert("RGBA")
logo = logo.resize((250, 250), Image.Resampling.LANCZOS)
out.paste(logo, (320, 135), logo)
d.text((630, 121), "VICUNIA", font=f(True, 153), fill=BRAND["green"])
d.text((635, 296), "GUÍA DE ARMADO DEL DUMMY", font=f(True, 84), fill="#B64B30")
d.text((2940, 299), "26 PASOS", font=f(True, 67), fill=BRAND["green"])
d.line((325, 466, 3650, 466), fill=BRAND["gold"], width=9)

for x, cards in [(M, left), (M + 1860 + G, right)]:
    y = TOP
    for card in cards:
        d.rounded_rectangle((x + 13, y + 18, x + card.width + 13, y + card.height + 18), 26, fill="#D9D0C4")
        out.paste(card, (x, y))
        y += card.height + gap
out.save(DEST, "PNG", optimize=True)
print(DEST, out.size)
