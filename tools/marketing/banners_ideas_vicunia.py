"""Generate ten editable Vicunia concept banners and review assets."""

from pathlib import Path
from html import escape
from io import BytesIO
import zipfile

import cairosvg
from PIL import Image, ImageFont


ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "output" / "banners-ideas-2026-11-14"
OUT.mkdir(parents=True, exist_ok=True)

GREEN = "#183E36"
IVORY = "#F6F1E7"
CLAY = "#C26043"
GOLD = "#D8AC68"
SLATE = "#41504B"

IDEAS = [
    ("01", "MINI DE TU", "MASCOTA", "Su figura, su nombre y un video recuerdo.", "MASCOTAS", "pet"),
    ("02", "PINTA TU", "MASCOTA", "Una figura para crear juntos y conservar.", "KIT CREATIVO", "paint"),
    ("03", "AMIGURUMI", "+ TU NOMBRE", "Tejido y una base 3D hecha para esa persona.", "TEJIDO + 3D", "yarn"),
    ("04", "NAVIDAD CON", "TU MASCOTA", "Un adorno con su nombre y el año.", "RECUERDOS", "ornament"),
    ("05", "CHARMS CON", "HISTORIA", "Pequeños detalles para llevar contigo.", "ACCESORIOS", "charms"),
    ("06", "TU ESCRITORIO,", "A TU MODO", "Elige módulos según lo que usas cada día.", "ORGANIZACIÓN", "desk"),
    ("07", "LECTURAS CON", "DETALLE", "Marcapáginas y charms con tu estilo.", "LECTURA", "book"),
    ("08", "UNA MESA CON", "NOMBRE", "Detalles personalizados para cada invitado.", "EVENTOS", "table"),
    ("09", "CREA Y", "REGALA", "Un kit para pintar, compartir y regalar.", "KIT CREATIVO", "kit"),
    ("10", "CAJAMARCA", "CONTIGO", "Recuerdos de aquí, con un detalle tuyo.", "COLECCIÓN LOCAL", "cajamarca"),
]


def mark(x=68, y=38, scale=0.23):
    return f'''<g transform="translate({x} {y}) scale({scale})">
      <path d="M25 244V115C25 45 72 12 139 12s114 33 114 103v129" fill="none" stroke="{GREEN}" stroke-width="17" stroke-linecap="round"/>
      <circle cx="139" cy="82" r="15" fill="{GOLD}"/>
      <path d="M67 126l72 116 72-116" fill="none" stroke="{CLAY}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M89 166h100" stroke="{GREEN}" stroke-width="7" stroke-linecap="round"/>
    </g>'''


def visual(kind):
    if kind == "pet":
        return f'''<ellipse cx="910" cy="521" rx="164" ry="31" fill="{GREEN}" opacity=".10"/>
          <rect x="784" y="486" width="250" height="29" rx="10" fill="{GREEN}"/>
          <rect x="818" y="513" width="182" height="20" rx="5" fill="{GOLD}"/>
          <text x="909" y="529" text-anchor="middle" fill="{GREEN}" font-size="15" font-family="Arial" font-weight="700">LUNA</text>
          <path d="M822 359 Q822 271 906 265 Q992 269 992 358 L1009 475 Q911 506 805 473 Z" fill="url(#fur)" stroke="{GREEN}" stroke-width="8"/>
          <path d="M836 298 L815 239 Q799 215 789 249 L795 353 Z M977 296 L1001 238 Q1019 210 1023 252 L1010 349 Z" fill="{CLAY}" stroke="{GREEN}" stroke-width="7"/>
          <ellipse cx="902" cy="380" rx="76" ry="69" fill="{IVORY}"/>
          <circle cx="871" cy="357" r="8" fill="{GREEN}"/><circle cx="941" cy="357" r="8" fill="{GREEN}"/>
          <path d="M894 390 Q906 403 918 390 Q905 380 894 390 M904 401 Q890 417 877 407 M906 402 Q920 418 936 407" fill="none" stroke="{GREEN}" stroke-width="5" stroke-linecap="round"/>
          <rect x="1004" y="372" width="79" height="100" rx="12" fill="{IVORY}" stroke="{GREEN}" stroke-width="5"/>
          <circle cx="1043" cy="409" r="17" fill="{CLAY}"/><path d="M1038 400 L1053 409 L1038 418 Z" fill="{IVORY}"/>
          <text x="1044" y="452" text-anchor="middle" fill="{GREEN}" font-family="Arial" font-size="13" font-weight="700">VIDEO</text>'''
    if kind == "paint":
        return f'''<ellipse cx="917" cy="529" rx="180" ry="24" fill="{GREEN}" opacity=".1"/>
          <path d="M810 458 L995 458 L1029 510 L781 510 Z" fill="{GOLD}" stroke="{GREEN}" stroke-width="6"/>
          <path d="M832 374 Q834 300 903 298 Q972 300 975 373 L985 462 L823 462 Z" fill="{IVORY}" stroke="{GREEN}" stroke-width="7"/>
          <path d="M849 324 L833 265 L811 337 M956 324 L976 265 L991 337" fill="{IVORY}" stroke="{GREEN}" stroke-width="7" stroke-linejoin="round"/>
          <circle cx="874" cy="370" r="7" fill="{GREEN}"/><circle cx="934" cy="370" r="7" fill="{GREEN}"/>
          <path d="M893 395 Q904 404 915 395" fill="none" stroke="{GREEN}" stroke-width="5" stroke-linecap="round"/>
          <path d="M1025 323 L1052 455" stroke="{GREEN}" stroke-width="14" stroke-linecap="round"/>
          <path d="M1013 279 Q1038 286 1040 320 L1022 329 Q1003 297 1013 279" fill="{CLAY}"/>
          <circle cx="1054" cy="492" r="23" fill="{CLAY}"/><circle cx="1092" cy="491" r="17" fill="{GOLD}"/>
          <path d="M771 473 Q752 445 774 436 Q799 428 814 452 Q812 481 771 473" fill="{CLAY}"/>'''
    if kind == "yarn":
        return f'''<ellipse cx="909" cy="532" rx="175" ry="23" fill="{GREEN}" opacity=".1"/>
          <rect x="792" y="490" width="245" height="38" rx="11" fill="{GREEN}"/>
          <text x="914" y="517" text-anchor="middle" fill="{IVORY}" font-family="Arial" font-size="22" font-weight="700">PARA SOFÍA</text>
          <circle cx="909" cy="355" r="90" fill="{CLAY}" stroke="{GREEN}" stroke-width="7"/>
          <circle cx="904" cy="250" r="28" fill="{CLAY}" stroke="{GREEN}" stroke-width="6"/>
          <circle cx="846" cy="306" r="31" fill="{CLAY}" stroke="{GREEN}" stroke-width="6"/>
          <circle cx="972" cy="307" r="31" fill="{CLAY}" stroke="{GREEN}" stroke-width="6"/>
          <ellipse cx="909" cy="381" rx="53" ry="48" fill="{IVORY}"/>
          <circle cx="883" cy="350" r="7" fill="{GREEN}"/><circle cx="935" cy="350" r="7" fill="{GREEN}"/>
          <path d="M902 380 Q910 388 918 380 M905 388 Q892 403 880 390 M913 388 Q926 403 938 390" fill="none" stroke="{GREEN}" stroke-width="4" stroke-linecap="round"/>
          <path d="M841 424 Q814 471 844 487 M977 424 Q1003 469 973 489" fill="none" stroke="{CLAY}" stroke-width="29" stroke-linecap="round"/>
          <path d="M859 285 Q907 301 960 277 M840 348 Q907 365 981 343 M849 420 Q915 436 970 411" fill="none" stroke="{GOLD}" stroke-width="4" opacity=".72"/>'''
    if kind == "ornament":
        return f'''<path d="M907 180 L907 281" stroke="{GREEN}" stroke-width="5"/>
          <path d="M890 184 Q906 163 923 184" fill="none" stroke="{GREEN}" stroke-width="7"/>
          <rect x="887" y="269" width="40" height="26" rx="5" fill="{GOLD}" stroke="{GREEN}" stroke-width="5"/>
          <circle cx="907" cy="386" r="103" fill="url(#claygrad)" stroke="{GREEN}" stroke-width="8"/>
          <path d="M850 340 L841 310 L866 324 M962 340 L972 310 L948 324" fill="{IVORY}" stroke="{GREEN}" stroke-width="5"/>
          <circle cx="908" cy="374" r="58" fill="{IVORY}"/>
          <circle cx="885" cy="362" r="6" fill="{GREEN}"/><circle cx="930" cy="362" r="6" fill="{GREEN}"/>
          <path d="M899 385 Q908 393 917 385" fill="none" stroke="{GREEN}" stroke-width="4"/>
          <path d="M846 432 Q907 473 968 432" fill="none" stroke="{GOLD}" stroke-width="7"/>
          <text x="907" y="459" text-anchor="middle" fill="{IVORY}" font-family="Georgia" font-size="24" font-weight="700">LUNA · 2026</text>
          <path d="M775 263 l8 17 17 8 -17 7 -8 17 -8 -17 -17 -7 17 -8 Z M1046 442 l6 13 13 6 -13 6 -6 13 -6 -13 -13 -6 13 -6 Z" fill="{GOLD}"/>'''
    if kind == "charms":
        return f'''<path d="M786 265 Q910 170 1038 265" fill="none" stroke="{GREEN}" stroke-width="18" stroke-linecap="round"/>
          <path d="M783 260 Q914 175 1041 260" fill="none" stroke="{GOLD}" stroke-width="6"/>
          <path d="M839 252 L839 338 M913 221 L913 349 M989 246 L989 330" stroke="{GREEN}" stroke-width="5"/>
          <circle cx="839" cy="371" r="46" fill="{CLAY}" stroke="{GREEN}" stroke-width="6"/>
          <text x="839" y="386" text-anchor="middle" fill="{IVORY}" font-family="Georgia" font-weight="700" font-size="43">J</text>
          <path d="M912 340 C860 305 860 391 912 421 C964 391 964 305 912 340 Z" fill="{GOLD}" stroke="{GREEN}" stroke-width="6"/>
          <circle cx="897" cy="372" r="5" fill="{GREEN}"/><circle cx="927" cy="372" r="5" fill="{GREEN}"/>
          <path d="M908 385 Q913 390 918 385" fill="none" stroke="{GREEN}" stroke-width="4"/>
          <path d="M989 331 l18 37 40 6 -29 28 7 42 -36 -20 -36 20 7 -42 -29 -28 40 -6 Z" fill="{IVORY}" stroke="{GREEN}" stroke-width="6"/>
          <path d="M773 492 Q911 532 1045 492" fill="none" stroke="{CLAY}" stroke-width="9" stroke-linecap="round"/>'''
    if kind == "desk":
        return f'''<ellipse cx="915" cy="530" rx="196" ry="23" fill="{GREEN}" opacity=".12"/>
          <path d="M753 481 L1062 481 L1081 516 L733 516 Z" fill="{GREEN}"/>
          <rect x="774" y="371" width="107" height="112" rx="15" fill="{CLAY}" stroke="{GREEN}" stroke-width="6"/>
          <rect x="892" y="406" width="133" height="77" rx="14" fill="{GOLD}" stroke="{GREEN}" stroke-width="6"/>
          <rect x="895" y="270" width="104" height="145" rx="16" fill="{IVORY}" stroke="{GREEN}" stroke-width="8"/>
          <rect x="907" y="285" width="80" height="103" rx="7" fill="{SLATE}"/>
          <circle cx="945" cy="401" r="4" fill="{GREEN}"/>
          <path d="M798 262 L798 370 M817 278 L817 368 M844 246 L844 372" stroke="{GREEN}" stroke-width="11" stroke-linecap="round"/>
          <path d="M798 260 l-6 -24 h12 Z M817 276 l-6 -24 h12 Z M844 244 l-6 -24 h12 Z" fill="{GOLD}"/>
          <path d="M930 454 Q959 426 988 454" fill="none" stroke="{GREEN}" stroke-width="9" stroke-linecap="round"/>
          <circle cx="926" cy="457" r="10" fill="{GREEN}"/><circle cx="992" cy="457" r="10" fill="{GREEN}"/>'''
    if kind == "book":
        return f'''<ellipse cx="903" cy="518" rx="188" ry="27" fill="{GREEN}" opacity=".12"/>
          <path d="M756 291 Q827 273 902 312 L902 511 Q824 477 756 499 Z" fill="{IVORY}" stroke="{GREEN}" stroke-width="8"/>
          <path d="M902 312 Q980 273 1051 291 L1051 499 Q982 477 902 511 Z" fill="{GOLD}" stroke="{GREEN}" stroke-width="8"/>
          <path d="M785 340 Q836 329 877 350 M785 368 Q836 357 877 377 M785 396 Q836 385 877 404 M930 349 Q971 331 1022 340 M930 378 Q971 360 1022 369 M930 406 Q971 388 1022 397" stroke="{SLATE}" stroke-width="5" opacity=".46" fill="none"/>
          <path d="M960 197 L1003 197 L1003 370 L981 350 L960 370 Z" fill="{CLAY}" stroke="{GREEN}" stroke-width="5"/>
          <circle cx="981" cy="237" r="12" fill="{IVORY}"/>
          <path d="M1035 233 Q1074 218 1090 264 Q1083 299 1050 292 Q1015 279 1035 233" fill="{IVORY}" stroke="{GREEN}" stroke-width="5"/>
          <path d="M1050 292 L1050 356" stroke="{GREEN}" stroke-width="5"/>
          <circle cx="1050" cy="371" r="18" fill="{CLAY}" stroke="{GREEN}" stroke-width="4"/>'''
    if kind == "table":
        return f'''<ellipse cx="911" cy="522" rx="195" ry="27" fill="{GREEN}" opacity=".12"/>
          <ellipse cx="910" cy="436" rx="163" ry="75" fill="{GOLD}" stroke="{GREEN}" stroke-width="8"/>
          <ellipse cx="910" cy="426" rx="104" ry="53" fill="{IVORY}" stroke="{GREEN}" stroke-width="5"/>
          <path d="M848 300 L884 300 L891 416 L841 416 Z" fill="{IVORY}" stroke="{GREEN}" stroke-width="5"/>
          <path d="M852 352 L880 352" stroke="{CLAY}" stroke-width="14"/>
          <path d="M961 290 L1017 290 L1017 397 L961 397 Z" fill="{IVORY}" stroke="{GREEN}" stroke-width="5"/>
          <text x="989" y="352" text-anchor="middle" font-family="Georgia" font-size="20" font-weight="700" fill="{GREEN}">ANA</text>
          <path d="M773 450 Q784 353 814 332" fill="none" stroke="{GREEN}" stroke-width="8"/>
          <path d="M790 390 l-18 -18 M798 365 l17 -25" stroke="{GREEN}" stroke-width="6"/>
          <circle cx="814" cy="328" r="17" fill="{CLAY}"/>
          <path d="M1035 450 Q1050 352 1070 335" fill="none" stroke="{GREEN}" stroke-width="8"/>
          <circle cx="1070" cy="329" r="17" fill="{CLAY}"/>'''
    if kind == "kit":
        return f'''<ellipse cx="910" cy="525" rx="194" ry="28" fill="{GREEN}" opacity=".12"/>
          <path d="M764 348 L1054 348 L1034 501 L784 501 Z" fill="{GOLD}" stroke="{GREEN}" stroke-width="7"/>
          <path d="M764 348 L812 300 L1006 300 L1054 348 Z" fill="{IVORY}" stroke="{GREEN}" stroke-width="7"/>
          <rect x="838" y="380" width="145" height="87" rx="13" fill="{IVORY}" stroke="{GREEN}" stroke-width="5"/>
          <text x="910" y="414" text-anchor="middle" font-family="Georgia" font-size="24" font-weight="700" fill="{GREEN}">CREA</text>
          <text x="910" y="444" text-anchor="middle" font-family="Arial" font-size="17" font-weight="700" fill="{CLAY}">Y REGALA</text>
          <path d="M800 295 L785 222 M825 295 L825 235 M1021 295 L1044 221" stroke="{GREEN}" stroke-width="12" stroke-linecap="round"/>
          <path d="M777 215 Q783 195 797 215 L797 231 L778 231 Z M813 226 Q825 204 837 226 L837 244 L813 244 Z M1034 214 Q1044 196 1056 214 L1056 233 L1035 233 Z" fill="{CLAY}"/>
          <circle cx="769" cy="439" r="19" fill="{CLAY}"/><circle cx="1055" cy="441" r="17" fill="{IVORY}" stroke="{GREEN}" stroke-width="4"/>'''
    if kind == "cajamarca":
        return f'''<ellipse cx="905" cy="528" rx="185" ry="22" fill="{GREEN}" opacity=".1"/>
          <path d="M795 504 L795 293 Q795 236 852 236 L969 236 Q1026 236 1026 293 L1026 504 Z" fill="{IVORY}" stroke="{GREEN}" stroke-width="8"/>
          <path d="M822 474 L822 322 Q822 278 864 278 L957 278 Q999 278 999 322 L999 474 Z" fill="{GOLD}" stroke="{GREEN}" stroke-width="5"/>
          <circle cx="917" cy="340" r="35" fill="{IVORY}"/>
          <path d="M824 435 L873 368 L916 424 L950 385 L999 437 L999 473 L822 473 Z" fill="{GREEN}"/>
          <path d="M875 369 L902 405 L889 401 Z M950 386 L969 411 L955 407 Z" fill="{IVORY}"/>
          <path d="M845 458 Q920 417 984 458" fill="none" stroke="{CLAY}" stroke-width="9"/>
          <rect x="824" y="485" width="176" height="34" rx="8" fill="{CLAY}"/>
          <text x="912" y="509" text-anchor="middle" font-family="Georgia" font-size="21" font-weight="700" fill="{IVORY}">CAJAMARCA</text>
          <path d="M754 289 l8 17 17 8 -17 7 -8 17 -8 -17 -17 -7 17 -8 Z M1059 386 l6 13 13 6 -13 6 -6 13 -6 -13 -13 -6 13 -6 Z" fill="{CLAY}"/>'''
    raise ValueError(kind)


def make_svg(number, line1, line2, description, category, kind):
    title_size = 67
    serif = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
    while max(ImageFont.truetype(serif, title_size).getlength(line) for line in (line1, line2)) > 530:
        title_size -= 1
    desc_size = 25 if len(description) < 44 else 23
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="Vicunia: {escape(line1 + ' ' + line2)}">
      <defs>
        <linearGradient id="bg" x2="1" y2="1"><stop stop-color="{IVORY}"/><stop offset="1" stop-color="#E9E2D2"/></linearGradient>
        <linearGradient id="fur" x2="1" y2="1"><stop stop-color="#E3B778"/><stop offset="1" stop-color="{CLAY}"/></linearGradient>
        <linearGradient id="claygrad" x2="1" y2="1"><stop stop-color="#DA8567"/><stop offset="1" stop-color="{CLAY}"/></linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)"/>
      <path d="M705 0H1200V675H705 Q775 525 682 341 Q615 150 705 0" fill="{GREEN}"/>
      <circle cx="920" cy="347" r="223" fill="{IVORY}" opacity=".98"/>
      <circle cx="1098" cy="97" r="14" fill="{GOLD}"/>
      <circle cx="733" cy="180" r="8" fill="{GOLD}"/>
      <path d="M1120 553 Q1080 592 1047 571" fill="none" stroke="{GOLD}" stroke-width="6" stroke-linecap="round"/>
      {visual(kind)}
      {mark()}
      <text x="142" y="92" font-family="Georgia,serif" font-size="40" font-weight="700" letter-spacing="4" fill="{GREEN}">VICUNIA</text>
      <text x="73" y="185" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2.2" fill="{CLAY}">IDEA {number} / {escape(category)}</text>
      <text x="70" y="282" font-family="Georgia,serif" font-size="{title_size}" font-weight="700" fill="{GREEN}">{escape(line1)}</text>
      <text x="70" y="358" font-family="Georgia,serif" font-size="{title_size}" font-weight="700" fill="{GREEN}">{escape(line2)}</text>
      <path d="M74 391 H152" stroke="{GOLD}" stroke-width="6" stroke-linecap="round"/>
      <text x="73" y="444" font-family="Arial,sans-serif" font-size="{desc_size}" fill="{SLATE}">{escape(description)}</text>
      <rect x="72" y="481" width="288" height="53" rx="26" fill="{CLAY}"/>
      <text x="216" y="515" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="1" fill="{IVORY}">¿TE GUSTARÍA? ESCRÍBENOS</text>
      <path d="M72 592 H638" stroke="{GOLD}" stroke-width="2"/>
      <text x="72" y="623" font-family="Arial,sans-serif" font-size="17" letter-spacing=".6" fill="{SLATE}">UN DETALLE TUYO, HECHO EN CAJAMARCA</text>
      <text x="1057" y="628" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="1.3" fill="{IVORY}">CONCEPTO · VICUNIA</text>
    </svg>'''


for idea in IDEAS:
    number, line1, line2, description, category, kind = idea
    slug = kind.replace("_", "-")
    svg = make_svg(*idea)
    (OUT / f"vicunia-idea-{number}-{slug}.svg").write_text(svg, encoding="utf-8")
    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(OUT / f"vicunia-idea-{number}-{slug}.png"), output_width=1200, output_height=675)

thumb_w = 600
thumb_h = 338
gap = 25
margin = 35
sheet = Image.new("RGB", (margin * 2 + 2 * thumb_w + gap, margin * 2 + 5 * thumb_h + 4 * gap), IVORY)
for index, idea in enumerate(IDEAS):
    number, *_, kind = idea
    im = Image.open(OUT / f"vicunia-idea-{number}-{kind}.png").convert("RGB")
    im = im.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
    x = margin + (index % 2) * (thumb_w + gap)
    y = margin + (index // 2) * (thumb_h + gap)
    sheet.paste(im, (x, y))
sheet.save(OUT / "vista-general-vicunia-10-ideas.png")

with zipfile.ZipFile(OUT / "vicunia-10-banners-png-svg.zip", "w", zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(OUT.glob("vicunia-idea-*")):
        archive.write(path, path.name)

print(f"Generated {len(IDEAS)} banners in {OUT}")
