from pathlib import Path
from pypdf import PdfReader

pdfs = [
    Path(r"C:\Users\Admin\Documents\The Musician's Index Magazine images.pdf"),
    Path(r"C:\Users\Admin\Downloads\tmi add on.pdf"),
]
out_dir = Path(r"C:\Users\Admin\Documents\BerntoutGlobal XXL\temp_cleanup\pdf_extracts")
out_dir.mkdir(parents=True, exist_ok=True)

for pdf in pdfs:
    reader = PdfReader(str(pdf))
    text_parts = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        text_parts.append(f"\n\n===== PAGE {i} =====\n{text}")
    out_file = out_dir / (pdf.stem + ".txt")
    out_file.write_text("".join(text_parts), encoding="utf-8")
    print(f"EXTRACTED: {pdf} -> {out_file} (pages={len(reader.pages)})")
