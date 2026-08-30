#!/usr/bin/env python3
"""
Generate the abstract project artwork in the site palette.

These are placeholders standing in for real project visuals (dashboards, model
output). They are generated rather than drawn so they can be regenerated in the
palette whenever the palette changes, instead of quietly staying the colour they
were first exported at.

Two variants are written for each piece:

    pN.svg        marks in ink, for the light pages (project case studies)
    pN-dark.svg   marks in bone, for the dark portfolio grid on the home page

Writing both avoids recolouring with CSS filters. Filters apply in sequence and
inverting a warm image lands on a cold blue, so the honest fix is a file per
context rather than a filter chain.

Usage:
    python3 tools/make-artwork.py assets/img
"""
import math
import random
import sys
import os

# palette, mirroring :root in style.css
CAFE = '#4C3D19'
KOMBU = '#354024'
MOSS = '#889063'
TAN = '#CFBB99'
BONE = '#E5D7C4'

LIGHT = dict(plate='#DFD2BC', mark=CAFE, accent=MOSS, rule=CAFE)
DARK = dict(plate='#2C3720', mark=BONE, accent=MOSS, rule=BONE)

W, H = 800, 600


def wrap(body, p):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}" role="img">\n'
        f'<rect width="{W}" height="{H}" fill="{p["plate"]}"/>\n{body}\n</svg>\n'
    )


def scatter(p, rnd):
    b = ''
    for _ in range(90):
        x, y = rnd.uniform(60, 740), rnd.uniform(60, 540)
        r = rnd.uniform(4, 16)
        col = p['accent'] if rnd.random() < 0.28 else p['mark']
        b += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{col}" opacity="{rnd.uniform(.18,.72):.2f}"/>'
    b += f'<line x1="60" y1="540" x2="740" y2="540" stroke="{p["rule"]}" stroke-width="3" opacity=".55"/>'
    b += f'<line x1="60" y1="60" x2="60" y2="540" stroke="{p["rule"]}" stroke-width="3" opacity=".55"/>'
    return b


def grid(p, rnd):
    b = ''
    for i in range(14):
        for j in range(10):
            o = abs(math.sin(i * 0.7) * math.cos(j * 0.6))
            col = p['accent'] if (i + j) % 7 == 0 else p['mark']
            b += f'<rect x="{70+i*48}" y="{70+j*46}" width="42" height="40" fill="{col}" opacity="{o*0.7:.2f}"/>'
    return b


def bars(p, rnd):
    b = ''
    for i in range(12):
        h = 60 + 380 * abs(math.sin(i / 2.1))
        col = p['accent'] if i % 4 == 0 else p['mark']
        b += f'<rect x="{70+i*56}" y="{560-h:.0f}" width="38" height="{h:.0f}" fill="{col}" opacity="{0.35+0.07*(i%5):.2f}"/>'
    b += f'<line x1="50" y1="562" x2="750" y2="562" stroke="{p["rule"]}" stroke-width="4" opacity=".6"/>'
    return b


def flow(p, rnd):
    nodes = [(160, 180), (400, 120), (400, 300), (640, 180), (240, 440), (560, 440)]
    b = ''
    for a, c in [(0, 1), (0, 2), (1, 3), (2, 3), (0, 4), (4, 5), (5, 3)]:
        x1, y1 = nodes[a]
        x2, y2 = nodes[c]
        b += (f'<path d="M{x1},{y1} C{(x1+x2)/2},{y1} {(x1+x2)/2},{y2} {x2},{y2}" '
              f'fill="none" stroke="{p["mark"]}" stroke-width="3" opacity=".5"/>')
    for i, (x, y) in enumerate(nodes):
        fill = p['mark'] if i % 3 == 0 else (p['accent'] if i % 3 == 1 else p['plate'])
        b += f'<circle cx="{x}" cy="{y}" r="{34 if i%2 else 46}" fill="{fill}" stroke="{p["mark"]}" stroke-width="3"/>'
    return b


def wave(p, rnd):
    b = ''
    for k in range(7):
        d = f'M 40,{300+k*8}'
        for i in range(1, 80):
            x = 40 + i * 9
            y = 300 + k * 8 + 90 * math.sin(i / 9.0 + k * 0.5) * math.exp(-i / 120)
            d += f' L {x:.0f},{y:.0f}'
        col = p['accent'] if k == 3 else p['mark']
        b += f'<path d="{d}" fill="none" stroke="{col}" stroke-width="2.5" opacity="{0.75-k*0.08:.2f}"/>'
    return b


def rings(p, rnd):
    b = ''
    for i in range(9):
        col = p['accent'] if i % 3 == 0 else p['mark']
        b += (f'<circle cx="400" cy="300" r="{40+i*28}" fill="none" stroke="{col}" '
              f'stroke-width="{9-i*0.8:.1f}" opacity="{0.7-i*0.06:.2f}"/>')
    b += f'<circle cx="400" cy="300" r="26" fill="{p["mark"]}"/>'
    return b


PIECES = [('p1', scatter), ('p2', grid), ('p3', bars),
          ('p4', flow), ('p5', wave), ('p6', rings)]


def main(outdir):
    for name, fn in PIECES:
        for suffix, palette in (('', LIGHT), ('-dark', DARK)):
            rnd = random.Random(7)          # same seed so both variants match
            path = os.path.join(outdir, f'{name}{suffix}.svg')
            open(path, 'w').write(wrap(fn(palette, rnd), palette))
            print('wrote', path)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'assets/img')
