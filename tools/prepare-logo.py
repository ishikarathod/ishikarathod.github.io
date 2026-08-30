#!/usr/bin/env python3
"""
Prepare a raw logo image for the site.

Logos usually arrive as screenshots: an opaque white (or dark) plate baked in,
a stray border pixel or two, and wildly different padding. Dropping those
straight into the page gives you visible boxes and marks that all read at
different sizes. This script fixes all of that:

  1. shaves a few border pixels, which is where screenshot edges live
  2. keys the plate out into real transparency, un-premultiplying so the
     brand colours survive and antialiased edges stay smooth
  3. trims hard to the mark, leaving no padding of its own, so the page's CSS
     can size it with object-fit and it fills whatever box it is given
  4. writes a full-colour RGBA PNG

Usage:
    python3 tools/prepare-logo.py raw/acme.png assets/img/logos/acme.png
    python3 tools/prepare-logo.py raw/acme.png assets/img/logos/acme.png --invert

Pass --dark-plate when the artwork sits on a dark background rather than white.
Pass --flip-neutrals with it when that artwork is the light-on-dark variant of
the logo: it darkens the white/grey parts so the mark reads on a light page,
while leaving the coloured parts (a blue bird, a red box) untouched.
Requires Pillow and numpy.
"""
import argparse
import numpy as np
from PIL import Image

MAX_W, MAX_H = 900, 460     # generous raster; CSS does the fitting
CROP = 3                    # border pixels to discard before measuring


def prepare(src, dst, dark_plate=False, flip_neutrals=False, crop=CROP):
    im = Image.open(src).convert('RGBA')
    if crop:
        im = im.crop((crop, crop, im.width - crop, im.height - crop))

    a = np.array(im).astype(float)
    rgb, alpha0 = a[..., :3], a[..., 3]

    if dark_plate:
        # artwork on a dark plate: the plate is the darkest thing present, so
        # brightness becomes coverage
        plate = np.array([rgb[0].mean(axis=0), rgb[-1].mean(axis=0),
                          rgb[:, 0].mean(axis=0), rgb[:, -1].mean(axis=0)]).mean(axis=0)
        cover = (rgb.max(axis=2) - plate.max()) / max(255.0 - plate.max(), 1.0)
    else:
        # artwork on a white plate: distance from white becomes coverage
        plate = np.array([255.0, 255.0, 255.0])
        cover = (255.0 - rgb.min(axis=2)) / 255.0

    cover = np.clip(cover * 1.06, 0, 1)      # a touch of bite on soft edges
    cover[cover < 0.05] = 0

    # un-premultiply: recover the mark's own colour from what the plate showed
    safe = np.maximum(cover, 1e-4)[..., None]
    colour = (rgb - plate * (1.0 - safe)) / safe
    colour = np.clip(colour, 0, 255)

    if flip_neutrals:
        # white wordmark -> dark wordmark, colour marks left alone. Saturation
        # tells the two apart: neutrals have almost none.
        mx = colour.max(axis=2)
        mn = colour.min(axis=2)
        sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-4), 0.0)
        neutral = (sat < 0.22)[..., None]
        colour = np.where(neutral, 255.0 - colour, colour)

    out = np.zeros_like(a)
    out[..., :3] = colour
    out[..., 3] = cover * 255.0 * (alpha0 / 255.0)
    img = Image.fromarray(out.astype(np.uint8), 'RGBA')

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    scale = min(MAX_W / img.width, MAX_H / img.height, 1.0)
    if scale < 1.0:
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)

    img.save(dst, optimize=True)
    print(f'{dst}: size={img.size} aspect={img.width / img.height:.2f}')


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('src')
    p.add_argument('dst')
    p.add_argument('--dark-plate', action='store_true',
                   help='artwork sits on a dark background rather than white')
    p.add_argument('--flip-neutrals', action='store_true',
                   help='with --dark-plate: darken the white parts so the mark reads on a light page')
    p.add_argument('--crop', type=int, default=CROP,
                   help=f'border pixels to discard first (default {CROP})')
    args = p.parse_args()
    prepare(args.src, args.dst, args.dark_plate, args.flip_neutrals, args.crop)
