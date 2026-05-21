from pathlib import Path
from PIL import Image, ImageOps
import json
from collections import defaultdict

# Configuration
ROOT = Path(r"c:\Users\Admin\Documents\BerntoutGlobal XXL\Tmi PDF's")
OUT_ROOT = ROOT / "_converted_webp_all"
PREVIEW_PATH = ROOT / "preview_converted_all.html"
MANIFEST_PATH = ROOT / "tmi_asset_manifest.json"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif", ".tif", ".tiff"}

# Folder category mapping
FOLDER_CATEGORIES = {
    "Profiles": "profiles",
    "The Musician's Index Magazine images": "magazine",
    "Host , Julius , and extra": "hosts",
    "game show and venue skins": "venues",
    "Venue Skins Plus Seating": "seating",
    "Tmi Homepage": "homepages",
    "_converted_webp": "magazine",  # Already converted
}

def get_category(path):
    """Determine category from folder path."""
    for folder, cat in FOLDER_CATEGORIES.items():
        if folder.lower() in str(path).lower():
            return cat
    
    # Heuristic: check for common names in path
    path_lower = str(path).lower()
    if "homepage" in path_lower or "home" in path_lower:
        return "homepages"
    if "profile" in path_lower:
        return "profiles"
    if "magazine" in path_lower or "article" in path_lower or "news" in path_lower:
        return "magazine"
    if "host" in path_lower or "julius" in path_lower:
        return "hosts"
    if "game" in path_lower or "show" in path_lower:
        return "games"
    if "venue" in path_lower or "arena" in path_lower or "stage" in path_lower:
        return "venues"
    if "seat" in path_lower or "audience" in path_lower:
        return "seating"
    if "avatar" in path_lower or "skin" in path_lower:
        return "avatars"
    if "ad" in path_lower or "sponsor" in path_lower:
        return "ads"
    
    return "other"

# Scan and convert
all_images = []
converted = []
errors = []
category_stats = defaultdict(int)

print("🔍 Scanning all folders under Tmi PDF's...")
for p in ROOT.rglob("*"):
    if not p.is_file():
        continue
    if p.suffix.lower() not in IMAGE_EXTS:
        continue
    if ".zip" in p.name.lower():
        continue
    if OUT_ROOT in p.parents:
        continue
    all_images.append(p)

print(f"📦 Found {len(all_images)} images to process.")

for src in all_images:
    try:
        rel = src.relative_to(ROOT)
        dst = OUT_ROOT / rel.with_suffix(".webp")
        dst.parent.mkdir(parents=True, exist_ok=True)

        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA" if "A" in im.getbands() else "RGB")

            # Strip metadata
            data = list(im.getdata())
            clean = Image.new(im.mode, im.size)
            clean.putdata(data)
            clean.save(dst, format="WEBP", quality=88, method=6)

        category = get_category(src)
        category_stats[category] += 1
        
        converted.append({
            "original_path": str(src.relative_to(ROOT)),
            "converted_path": str(dst.relative_to(ROOT)),
            "category": category,
            "build_status": "needs_review",
            "admin_proof": "missing",
        })
    except Exception as e:
        errors.append({
            "path": str(src.relative_to(ROOT)),
            "error": str(e)
        })

# Write manifest
manifest = {
    "timestamp": str(Path(__file__).stat().st_mtime),
    "total_images": len(all_images),
    "total_converted": len(converted),
    "total_errors": len(errors),
    "category_stats": dict(category_stats),
    "assets": converted,
    "errors": errors,
}

MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

# Generate preview
categories = sorted(set(a["category"] for a in converted))
category_items = {cat: [a for a in converted if a["category"] == cat] for cat in categories}

filter_buttons = "".join([
    f'<button onclick="filterCategory(\'all\')" class="filter-btn active">All ({len(converted)})</button>'
] + [
    f'<button onclick="filterCategory(\'{cat}\')" class="filter-btn">{cat.title()} ({len(items)})</button>'
    for cat, items in category_items.items()
])

cards = []
for asset in converted:
    cat = asset["category"]
    src_rel = asset["original_path"]
    dst_rel = asset["converted_path"]
    cards.append(f'''
    <article class="card" data-category="{cat}">
        <h3>{src_rel.split('/')[-1]}</h3>
        <img src="{dst_rel}" loading="lazy" alt="{src_rel}">
        <div class="meta">
            <p class="path">{src_rel}</p>
            <p class="category">Category: <strong>{cat.upper()}</strong></p>
            <p class="status">Status: <strong>Needs Review</strong></p>
        </div>
    </article>
    ''')

error_section = ""
if errors:
    error_section = f'''
    <section class="errors">
        <h2>Errors ({len(errors)})</h2>
        {''.join(f'<p>{e["path"]} :: {e["error"]}</p>' for e in errors)}
    </section>
    '''

html_doc = f'''<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TMI Full Folder Conversion Preview</title>
    <style>
        :root {{ --panel:#121212; --line:#2a2a2a; --text:#f5f5f5; --muted:#a1a1aa; --accent:#22d3ee; }}
        * {{ box-sizing:border-box; margin:0; padding:0; }}
        body {{ font-family:Segoe UI, Arial, sans-serif; background:radial-gradient(circle at top,#111,#070707); color:var(--text); }}
        header {{ position:sticky; top:0; background:rgba(0,0,0,.9); backdrop-filter:blur(6px); border-bottom:1px solid var(--line); padding:20px; z-index:10; }}
        h1 {{ font-size:24px; margin-bottom:12px; }}
        .stats {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-bottom:16px; font-size:12px; color:var(--muted); }}
        .stat-box {{ background:var(--panel); border:1px solid var(--line); padding:10px; border-radius:8px; }}
        .stat-value {{ font-size:18px; font-weight:bold; color:var(--accent); }}
        .filters {{ display:flex; gap:8px; flex-wrap:wrap; margin-top:16px; }}
        .filter-btn {{ padding:8px 12px; background:var(--panel); border:1px solid var(--line); border-radius:6px; cursor:pointer; color:var(--text); font-size:12px; transition:all 0.2s; }}
        .filter-btn:hover {{ border-color:var(--accent); }}
        .filter-btn.active {{ background:var(--accent); color:#000; border-color:var(--accent); }}
        main {{ padding:20px; display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }}
        .card {{ background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden; transition:all 0.3s; cursor:pointer; }}
        .card:hover {{ border-color:var(--accent); box-shadow:0 0 20px rgba(34,211,238,0.2); transform:translateY(-2px); }}
        .card h3 {{ padding:10px 12px; font-size:13px; color:var(--accent); border-bottom:1px solid var(--line); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }}
        .card img {{ width:100%; height:200px; object-fit:cover; display:block; background:#000; }}
        .card .meta {{ padding:10px 12px; font-size:11px; }}
        .card .path {{ color:var(--muted); margin-bottom:6px; word-break:break-all; }}
        .card .category {{ color:var(--accent); margin-bottom:4px; }}
        .card .status {{ color:#fca5a5; }}
        .errors {{ padding:20px; background:rgba(252,165,165,0.05); border-top:1px solid #fca5a5; }}
        .errors h2 {{ margin-bottom:12px; color:#fca5a5; }}
        .errors p {{ font-size:12px; margin-bottom:6px; color:var(--muted); }}
        .hidden {{ display:none !important; }}
    </style>
</head>
<body>
    <header>
        <h1>🎬 TMI Full Folder Conversion Preview</h1>
        <p style="color:var(--muted); font-size:13px;">All converted images from Tmi PDF's folder (zips ignored)</p>
        
        <div class="stats">
            <div class="stat-box">
                <div class="stat-value">{len(converted)}</div>
                <div>Converted</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{len(all_images)}</div>
                <div>Total Found</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{len(errors)}</div>
                <div>Errors</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{len(categories)}</div>
                <div>Categories</div>
            </div>
        </div>

        <div class="filters">
            {filter_buttons}
        </div>
    </header>

    <main id="gallery">
        {''.join(cards)}
    </main>

    {error_section}

    <script>
        function filterCategory(cat) {{
            const cards = document.querySelectorAll('.card');
            const btns = document.querySelectorAll('.filter-btn');
            
            btns.forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            
            cards.forEach(c => {{
                if (cat === 'all' || c.dataset.category === cat) {{
                    c.classList.remove('hidden');
                }} else {{
                    c.classList.add('hidden');
                }}
            }});
        }}
    </script>
</body>
</html>'''

PREVIEW_PATH.write_text(html_doc, encoding="utf-8")

print(f"\n✅ Conversion complete!")
print(f"📊 Stats: {len(converted)} converted, {len(errors)} errors")
print(f"📂 Output: {OUT_ROOT}")
print(f"📄 Manifest: {MANIFEST_PATH}")
print(f"👁️  Preview: {PREVIEW_PATH}")
print(f"\n🏷️  Categories:")
for cat, count in sorted(category_stats.items()):
    print(f"   {cat}: {count}")
