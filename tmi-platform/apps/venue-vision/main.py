from __future__ import annotations

import argparse
from pathlib import Path

from scanner import discover_assets, process_asset


def default_input_root() -> Path:
    # Repo root
    return Path(__file__).resolve().parents[2]


def default_output_root() -> Path:
    return (
        Path(__file__).resolve().parents[2]
        / "apps"
        / "web"
        / "src"
        / "data"
        / "venues"
        / "generated"
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Venue Intelligence Engine V1: scan venue visual assets into runtime metadata.",
    )
    parser.add_argument("--input-root", type=Path, default=default_input_root())
    parser.add_argument("--output-root", type=Path, default=default_output_root())
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    if not args.input_root.exists():
        raise SystemExit(f"Input root not found: {args.input_root}")

    assets = discover_assets(args.input_root)
    if args.limit and args.limit > 0:
        assets = assets[: args.limit]

    if not assets:
        raise SystemExit(f"No supported venue assets found under: {args.input_root}")

    output_paths = [process_asset(asset, args.output_root, args.input_root) for asset in assets]
    for path in output_paths:
        print(path)

    print(f"Approved. Generated {len(output_paths)} venue metadata files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
