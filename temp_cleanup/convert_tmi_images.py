from pathlib import Path
from PIL import Image, ImageOps
import html

root = Path(r"c:\Users\Admin\Documents\BerntoutGlobal XXL\Tmi PDF's")
out_root = root / "_converted_webp"
preview_path = root / "preview_converted.html"

image_exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif", ".tif", ".tiff"}

all_images = []
for p in root.rglob("*"):
    if not p.is_file():
        continue
    if p.suffix.lower() not in image_exts:
        continue
    if ".zip" in p.name.lower():
        continue
    if out_root in p.parents:
        continue
    all_images.append(p)

converted = []
errors = []

for src in all_images:
    try:
        rel = src.relative_to(root)
        dst = out_root / rel.with_suffix(".webp")
        dst.parent.mkdir(parents=True, exist_ok=True)

        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA" if "A" in im.getbands() else "RGB")

            # Strip metadata by writing a new image from pixel data only.
            data = list(im.getdata())
            clean = Image.new(im.mode, im.size)
            clean.putdata(data)
            clean.save(dst, format="WEBP", quality=88, method=6)

        converted.append((src, dst))
    except Exception as e:
        errors.append((str(src), str(e)))

cards = []
for src, dst in converted:
    src_rel = src.relative_to(root).as_posix()
    dst_rel = dst.relative_to(root).as_posix()
    cards.append(
        f"""<article class=\"card\"><h3>{html.escape(src_rel)}</h3><img src=\"{html.escape(dst_rel)}\" loading=\"lazy\" alt=\"{html.escape(src_rel)}\"><p>{html.escape(dst_rel)}</p></article>"""
    )

html_doc = f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>TMI Converted Image Preview</title>
  <style>
    :root {{ --panel:#121212; --line:#2a2a2a; --text:#f5f5f5; --muted:#a1a1aa; --accent:#22d3ee; }}
    * {{ box-sizing:border-box; }}
    body {{ margin:0; font-family:Segoe UI, Arial, sans-serif; background:radial-gradient(circle at top,#111,#070707); color:var(--text); }}
    header {{ position:sticky; top:0; background:rgba(0,0,0,.8); backdrop-filter:blur(6px); border-bottom:1px solid var(--line); padding:14px 20px; z-index:2; }}
    h1 {{ margin:0 0 6px; font-size:20px; }}
    p.meta {{ margin:0; color:var(--muted); font-size:13px; }}
    main {{ padding:18px; display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }}
    .card {{ background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden; }}
    .card h3 {{ margin:0; padding:10px 12px; font-size:12px; color:var(--accent); border-bottom:1px solid var(--line); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }}
    .card img {{ width:100%; height:180px; object-fit:cover; display:block; background:#000; }}
    .card p {{ margin:0; padding:8px 12px; font-size:11px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }}
    .errors {{ padding:0 18px 20px; color:#fca5a5; font-size:13px; }}
  </style>
</head>
<body>
  <header>
    <h1>TMI Converted Image Preview</h1>
    <p class=\"meta\">Converted: {len(converted)} images | Errors: {len(errors)} | Zips ignored by design</p>
  </header>
  <main>{''.join(cards)}</main>
  <section class=\"errors\">{('<br>'.join(html.escape(f'{s} :: {e}') for s, e in errors)) if errors else ''}</section>
</body>
</html>"""

preview_path.write_text(html_doc, encoding="utf-8")

print(f"FOUND={len(all_images)}")
print(f"CONVERTED={len(converted)}")
print(f"ERRORS={len(errors)}")
print(f"OUT={out_root}")
print(f"PREVIEW={preview_path}")
