"""Escala las dos planchas A3 a A4 apaisado preservando los cortes verticales."""

from pathlib import Path
from shutil import copy2

from pypdf import PdfReader, PdfWriter, Transformation
from pypdf._page import PageObject
from reportlab.lib.pagesizes import A4, landscape


ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)
DOWNLOADS = Path(r"C:\Users\Jair\Downloads")
A4_LANDSCAPE = landscape(A4)


for count in ("tres", "dos"):
    source = DOWNLOADS / f"vicunia-dummys-A3-{count}-copias.pdf"
    page = PdfReader(str(source)).pages[0]
    source_w = float(page.mediabox.width)
    source_h = float(page.mediabox.height)
    target_w, target_h = A4_LANDSCAPE
    transform = Transformation().scale(target_w / source_w, target_h / source_h)
    target = PageObject.create_blank_page(width=target_w, height=target_h)
    target.merge_transformed_page(page, transform, over=True)
    writer = PdfWriter()
    writer.add_page(target)
    result = OUT / f"vicunia-dummys-A4-{count}-copias.pdf"
    with result.open("wb") as stream:
        writer.write(stream)
    copy2(result, DOWNLOADS / result.name)
    print(DOWNLOADS / result.name)
