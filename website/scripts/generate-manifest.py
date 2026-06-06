#!/usr/bin/env python3
"""扫描 posts 目录，自动生成 manifest.json（列出所有 .md 文件）。"""

import json
from pathlib import Path

POSTS_DIR = Path(__file__).resolve().parent.parent / "posts"
MANIFEST = POSTS_DIR / "manifest.json"

files = sorted(
    f.name for f in POSTS_DIR.glob("*.md"),
    key=lambda name: (POSTS_DIR / name).stat().st_mtime,
    reverse=True,
)

MANIFEST.write_text(json.dumps(files, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"已生成 {MANIFEST}，共 {len(files)} 篇文章")
