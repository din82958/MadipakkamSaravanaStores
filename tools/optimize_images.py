"""Make light WebP copies of the store photos for phones.

Usage:
    python tools/optimize_images.py           # only creates copies that are missing
    python tools/optimize_images.py --force   # rebuild every copy

For every images/<store>/<n>.jpg it writes:
    images/<store>/<n>.webp         1400 px wide – full-screen photo viewer
    images/<store>/thumbs/<n>.webp   720 px wide – cards and gallery tiles
    images/<store>/mini/<n>.webp     240 px wide – round shortcut icons
The original .jpg files are kept as a fallback. Needs Pillow:  pip install pillow
"""
import glob
import os
import sys

from PIL import Image, ImageOps

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIZES = [('', 1400, 74), ('thumbs', 720, 70), ('mini', 240, 72)]   # (folder, max width, quality)
FORCE = '--force' in sys.argv


def main():
    made = total = 0
    for jpg in sorted(glob.glob(os.path.join(SITE, 'images', '*', '*.jpg'))):
        store_dir, name = os.path.split(jpg)
        stem = os.path.splitext(name)[0]
        with Image.open(jpg) as src:
            img = ImageOps.exif_transpose(src).convert('RGB')
            for folder, width, quality in SIZES:
                out_dir = os.path.join(store_dir, folder) if folder else store_dir
                out = os.path.join(out_dir, stem + '.webp')
                if os.path.exists(out) and not FORCE:
                    continue
                os.makedirs(out_dir, exist_ok=True)
                copy = img.copy()
                if copy.width > width:
                    copy = copy.resize((width, round(copy.height * width / copy.width)), Image.LANCZOS)
                copy.save(out, 'WEBP', quality=quality, method=6)
                made += 1
                total += os.path.getsize(out)
                print(f'{os.path.relpath(out, SITE):40s} {os.path.getsize(out) // 1024:5d} KB')
    if made:
        print(f'\nMade {made} copies, {total // 1024} KB in all.')
    else:
        print('All copies already exist (use --force to rebuild).')


if __name__ == '__main__':
    main()
