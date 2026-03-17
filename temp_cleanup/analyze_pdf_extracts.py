from pathlib import Path
import re

files = {
    "images": Path(r"C:\Users\Admin\Documents\BerntoutGlobal XXL\temp_cleanup\pdf_extracts\The Musician's Index Magazine images.txt"),
    "addon": Path(r"C:\Users\Admin\Documents\BerntoutGlobal XXL\temp_cleanup\pdf_extracts\tmi add on.txt"),
}
keywords = [
    "google","seo","schema","structured data","sitemap","robots","canonical",
    "core web vitals","lcp","cls","inp","search console","analytics","ga4",
    "billboard","julius","onboarding","artist article","auto-create",
    "sponsor","advertiser","media kit"
]

for label, path in files.items():
    text = path.read_text(encoding="utf-8", errors="ignore")
    print(f"\\n=== {label.upper()} ({path.name}) ===")
    for kw in keywords:
        c = len(re.findall(re.escape(kw), text, flags=re.IGNORECASE))
        if c:
            print(f"{kw}: {c}")

out = Path(r"C:\Users\Admin\Documents\BerntoutGlobal XXL\temp_cleanup\pdf_extracts\keyword_hits.txt")
with out.open("w", encoding="utf-8") as f:
    for label, path in files.items():
        text = path.read_text(encoding="utf-8", errors="ignore")
        f.write(f"\\n=== {label.upper()} | {path.name} ===\\n")
        for kw in keywords:
            for m in re.finditer(re.escape(kw), text, flags=re.IGNORECASE):
                start = max(0, m.start()-120)
                end = min(len(text), m.end()+120)
                snippet = text[start:end].replace("\n", " ")
                f.write(f"[{kw}] ...{snippet}...\\n")
print(f"\\nWROTE: {out}")
