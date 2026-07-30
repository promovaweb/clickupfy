#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
from pathlib import Path


def classification_from(path: Path) -> dict[str, str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    try:
        start = lines.index("## Classificação") + 1
    except ValueError:
        return {}

    rows: dict[str, str] = {}
    for line in lines[start:]:
        stripped = line.strip()
        if not stripped:
            if rows:
                break
            continue
        if not stripped.startswith("|"):
            if rows:
                break
            continue

        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if len(cells) != 2:
            continue
        field, value = cells
        if field.casefold() == "campo" or set(field) <= {"-", ":"}:
            continue
        rows[field.casefold()] = value
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("pages", nargs="+", type=Path)
    args = parser.parse_args()

    root = args.root.resolve()
    extracted = {}
    for page in args.pages:
        metadata = classification_from(page)
        if metadata:
            extracted[page.resolve().relative_to(root).as_posix()] = metadata
    print(
        json.dumps(
            extracted,
            ensure_ascii=False,
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
