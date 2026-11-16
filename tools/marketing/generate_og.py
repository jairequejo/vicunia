import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent.parent
IMG_DIR = str(ROOT / "web" / "img")
ASSETS_DIR = str(ROOT / "identidad-vicunia")

# Colors matching Vicunia's palette
BG_COLOR = (233, 237, 252) # #E9EDFC
BG_GRADIENT = (246, 228, 241) # #F6E4F1
PANEL_BG = (248, 249, 255) # #F8F9FF
TEXT_MAIN = (34, 36, 70) # #222446
TEXT_MUTED = (93, 96, 134) # #5D6086
ACCENT = (90, 79, 224) # #5A4FE0
BORDER = (214, 218, 242) # #D6DAF2
WHITE = (255, 255, 255)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def create_base_canvas():
    img = Image.new("RGB", (1200, 630), BG_COLOR)
    draw = ImageDraw.Draw(img)
    # Subtle soft radial / linear gradient
    for x in range(1200):
        factor = x / 1200.0
        r = int(BG_COLOR[0] * (1 - factor * 0.4) + BG_GRADIENT[0] * (factor * 0.4))
        g = int(BG_COLOR[1] * (1 - factor * 0.4) + BG_GRADIENT[1] * (factor * 0.4))
        b = int(BG_COLOR[2] * (1 - factor * 0.4) + BG_GRADIENT[2] * (factor * 0.4))
        draw.line([(x, 0), (x, 630)], fill=(r, g, b))
    
    # Outer elegant subtle border
    draw.rectangle([(16, 16), (1183, 613)], outline=BORDER, width=2)
    return img

def add_header(img, title_badge="VICUNIA · CAJAMARCA"):
    draw = ImageDraw.Draw(img)
    font_badge = ImageFont.truetype(FONT_BOLD, 22)
    
    # Load rainbow llama logo if exists
    logo_path = os.path.join(ASSETS_DIR, "logo-redes-vicunia.png")
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert("RGBA")
        logo.thumbnail((90, 90), Image.Resampling.LANCZOS)
        img.paste(logo, (60, 50), logo)
        
    draw.text((165, 62), title_badge, fill=ACCENT, font=font_badge)
    font_sub = ImageFont.truetype(FONT_REGULAR, 18)
    draw.text((165, 96), "Impresión 3D Artesanal & Personalizada · Cajamarca, Perú", fill=TEXT_MUTED, font=font_sub)

def generate_og_vicunia():
    img = create_base_canvas()
    add_header(img)
    draw = ImageDraw.Draw(img)
    
    font_h1 = ImageFont.truetype(FONT_BOLD, 50)
    font_p = ImageFont.truetype(FONT_REGULAR, 24)
    font_chip = ImageFont.truetype(FONT_BOLD, 20)
    
    # Main headline
    draw.text((60, 185), "Tu foto en figura 3D,\nclickers y lápices", fill=TEXT_MAIN, font=font_h1, spacing=12)
    draw.text((60, 330), "Diseña en vivo tecla por tecla con 17 colores reales.\nSwitch mecánico de clic satisfactorio y envío a todo el Perú.", fill=TEXT_MUTED, font=font_p, spacing=10)
    
    # Chips
    chips = ["✨ Vista 3D en vivo", "🎨 17 Colores Reales", "⌨️ Switch Mecánico", "📦 Envíos Perú"]
    cx = 60
    cy = 460
    for chip in chips:
        w = draw.textlength(chip, font=font_chip) + 30
        draw.rounded_rectangle([(cx, cy), (cx + w, cy + 44)], radius=12, fill=WHITE, outline=BORDER, width=1)
        draw.text((cx + 15, cy + 10), chip, fill=TEXT_MAIN, font=font_chip)
        cx += w + 16
        if cx > 680:
            cx = 60
            cy += 56
            
    # Right-side visual card
    rw, rh = 430, 480
    rx, ry = 710, 75
    draw.rounded_rectangle([(rx, ry), (rx + rw, ry + rh)], radius=24, fill=WHITE, outline=BORDER, width=2)
    
    # Paste clicker / photo product
    prod_path = os.path.join(IMG_DIR, "real-blackwhite.webp")
    if os.path.exists(prod_path):
        prod = Image.open(prod_path).convert("RGBA")
        prod = prod.resize((390, 440), Image.Resampling.LANCZOS)
        # Crop or paste
        img.paste(prod, (rx + 20, ry + 20), prod)
        
    out_path = os.path.join(IMG_DIR, "og-vicunia.jpg")
    img.convert("RGB").save(out_path, "JPEG", quality=92, optimize=True)
    print("Generated:", out_path)

def generate_og_clicker():
    img = create_base_canvas()
    add_header(img, "DISEÑADOR 3D · CLICKERS CON NOMBRE")
    draw = ImageDraw.Draw(img)
    
    font_h1 = ImageFont.truetype(FONT_BOLD, 48)
    font_p = ImageFont.truetype(FONT_REGULAR, 24)
    font_chip = ImageFont.truetype(FONT_BOLD, 20)
    
    draw.text((60, 185), "Diseña tu Clicker\nMecánico con Nombre", fill=TEXT_MAIN, font=font_h1, spacing=12)
    draw.text((60, 320), "Elige tus letras, colores de base, teclas y símbolos.\nLlavero antiestrés con switch mecánico real (clic genuino).\nArgolla de aro simple para llevarlo contigo.", fill=TEXT_MUTED, font=font_p, spacing=10)
    
    chips = ["⌨️ Switch Mecánico Real", "🔤 Tus Letras en Relieve", "🤍 Argolla Aro Metálica", "🎁 Cajamarca y Envíos"]
    cx = 60
    cy = 470
    for chip in chips:
        w = draw.textlength(chip, font=font_chip) + 26
        draw.rounded_rectangle([(cx, cy), (cx + w, cy + 42)], radius=12, fill=WHITE, outline=BORDER, width=1)
        draw.text((cx + 13, cy + 10), chip, fill=TEXT_MAIN, font=font_chip)
        cx += w + 14
        
    rw, rh = 430, 480
    rx, ry = 710, 75
    draw.rounded_rectangle([(rx, ry), (rx + rw, ry + rh)], radius=24, fill=WHITE, outline=BORDER, width=2)
    
    prod_path = os.path.join(IMG_DIR, "real-blackwhite.webp")
    if os.path.exists(prod_path):
        prod = Image.open(prod_path).convert("RGBA")
        prod = prod.resize((390, 440), Image.Resampling.LANCZOS)
        img.paste(prod, (rx + 20, ry + 20), prod)
        
    out_path = os.path.join(IMG_DIR, "og-clicker.jpg")
    img.convert("RGB").save(out_path, "JPEG", quality=92, optimize=True)
    print("Generated:", out_path)

def generate_og_catalogo():
    img = create_base_canvas()
    add_header(img, "CATÁLOGO OFICIAL 2026 · VICUNIA")
    draw = ImageDraw.Draw(img)
    
    font_h1 = ImageFont.truetype(FONT_BOLD, 48)
    font_p = ImageFont.truetype(FONT_REGULAR, 24)
    font_chip = ImageFont.truetype(FONT_BOLD, 20)
    
    draw.text((60, 185), "Catálogo de Líneas 3D:\nRegalos y Nombres", fill=TEXT_MAIN, font=font_h1, spacing=12)
    draw.text((60, 320), "• Clickers con nombre y teclas mecánicas\n• Figuras Funko personalizadas desde tu foto\n• Nombres para lápices y lapiceros\n• Dummys articulados, esferas navideñas y recuerdos.", fill=TEXT_MUTED, font=font_p, spacing=10)
    
    chips = ["📍 Cajamarca", "📲 Pedidos por WhatsApp", "🎨 17 Colores Reales"]
    cx = 60
    cy = 490
    for chip in chips:
        w = draw.textlength(chip, font=font_chip) + 26
        draw.rounded_rectangle([(cx, cy), (cx + w, cy + 42)], radius=12, fill=WHITE, outline=BORDER, width=1)
        draw.text((cx + 13, cy + 10), chip, fill=TEXT_MAIN, font=font_chip)
        cx += w + 14

    rw, rh = 430, 480
    rx, ry = 710, 75
    draw.rounded_rectangle([(rx, ry), (rx + rw, ry + rh)], radius=24, fill=WHITE, outline=BORDER, width=2)
    
    prod_path = os.path.join(IMG_DIR, "colores-disponibles.webp")
    if os.path.exists(prod_path):
        prod = Image.open(prod_path).convert("RGBA")
        prod = prod.resize((390, 440), Image.Resampling.LANCZOS)
        img.paste(prod, (rx + 20, ry + 20), prod)
        
    out_path = os.path.join(IMG_DIR, "og-catalogo.jpg")
    img.convert("RGB").save(out_path, "JPEG", quality=92, optimize=True)
    print("Generated:", out_path)

def generate_og_lapiz():
    img = create_base_canvas()
    add_header(img, "VICUNIA · NOMBRES PARA LÁPIZ")
    draw = ImageDraw.Draw(img)
    font_h1 = ImageFont.truetype(FONT_BOLD, 48)
    font_p = ImageFont.truetype(FONT_REGULAR, 24)
    font_chip = ImageFont.truetype(FONT_BOLD, 20)
    
    draw.text((60, 185), "Tu Lápiz con Nombre\nPersonalizado en 3D", fill=TEXT_MAIN, font=font_h1, spacing=12)
    draw.text((60, 320), "El detalle perfecto para útiles, oficinas o regalos.\nPieza impresa con tu nombre en relieve ajustable a tu lápiz.\nElige tus combinaciones de colores favoritas.", fill=TEXT_MUTED, font=font_p, spacing=10)
    
    chips = ["✎ Nombre en Relieve", "🎨 Bi-color a elección", "📏 Ajuste a tu lápiz", "🚚 Envíos Perú"]
    cx = 60
    cy = 470
    for chip in chips:
        w = draw.textlength(chip, font=font_chip) + 26
        draw.rounded_rectangle([(cx, cy), (cx + w, cy + 42)], radius=12, fill=WHITE, outline=BORDER, width=1)
        draw.text((cx + 13, cy + 10), chip, fill=TEXT_MAIN, font=font_chip)
        cx += w + 14
        
    rw, rh = 430, 480
    rx, ry = 710, 75
    draw.rounded_rectangle([(rx, ry), (rx + rw, ry + rh)], radius=24, fill=WHITE, outline=BORDER, width=2)
    
    prod_path = os.path.join(IMG_DIR, "real-golden.webp")
    if os.path.exists(prod_path):
        prod = Image.open(prod_path).convert("RGBA")
        prod = prod.resize((390, 440), Image.Resampling.LANCZOS)
        img.paste(prod, (rx + 20, ry + 20), prod)
        
    out_path = os.path.join(IMG_DIR, "og-lapiz.jpg")
    img.convert("RGB").save(out_path, "JPEG", quality=92, optimize=True)
    print("Generated:", out_path)

def generate_og_dummy():
    img = create_base_canvas()
    add_header(img, "VICUNIA · FIGURAS Y DUMMYS 3D")
    draw = ImageDraw.Draw(img)
    font_h1 = ImageFont.truetype(FONT_BOLD, 48)
    font_p = ImageFont.truetype(FONT_REGULAR, 24)
    font_chip = ImageFont.truetype(FONT_BOLD, 20)
    
    draw.text((60, 185), "Dummys Articulados\ny Figuras desde tu Foto", fill=TEXT_MAIN, font=font_h1, spacing=12)
    draw.text((60, 320), "Figuras con articulaciones móviles para posar y jugar.\nTambién convertimos fotos de mascotas o personas en estilo Funko.\nCoordinación directa y asesoría por WhatsApp.", fill=TEXT_MUTED, font=font_p, spacing=10)
    
    chips = ["🤖 100% Articulado", "🐾 Mascotas y Personas", "🎨 Filamentos Premium", "📦 Cajamarca"]
    cx = 60
    cy = 470
    for chip in chips:
        w = draw.textlength(chip, font=font_chip) + 26
        draw.rounded_rectangle([(cx, cy), (cx + w, cy + 42)], radius=12, fill=WHITE, outline=BORDER, width=1)
        draw.text((cx + 13, cy + 10), chip, fill=TEXT_MAIN, font=font_chip)
        cx += w + 14
        
    rw, rh = 430, 480
    rx, ry = 710, 75
    draw.rounded_rectangle([(rx, ry), (rx + rw, ry + rh)], radius=24, fill=WHITE, outline=BORDER, width=2)
    
    prod_path = os.path.join(IMG_DIR, "mini-orange.webp")
    if os.path.exists(prod_path):
        prod = Image.open(prod_path).convert("RGBA")
        prod = prod.resize((390, 440), Image.Resampling.LANCZOS)
        img.paste(prod, (rx + 20, ry + 20), prod)
        
    out_path = os.path.join(IMG_DIR, "og-dummy.jpg")
    img.convert("RGB").save(out_path, "JPEG", quality=92, optimize=True)
    print("Generated:", out_path)

if __name__ == "__main__":
    generate_og_vicunia()
    generate_og_clicker()
    generate_og_catalogo()
    generate_og_lapiz()
    generate_og_dummy()
