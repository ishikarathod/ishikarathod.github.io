# Ishika Rathod: Personal Portfolio

A single-page portfolio site built from scratch: **plain HTML, CSS and JavaScript.**
No framework, no build step, no `node_modules`.

Structure and section flow follow [sawad.framer.website](https://sawad.framer.website);
the visual language follows the black-and-white Swiss/editorial deck template
(running headers, hairline rules, corner slide labels, tight uppercase display type).

---

## Run it locally

```bash
cd ~/Desktop/my-site && ./serve.sh
```

Then open <http://localhost:5173>. Stop the server with `Ctrl+C`.

To use a different port: `./serve.sh 8080`

<details>
<summary>Alternatives</summary>

```bash
python3 -m http.server 5173
```

Opening `index.html` directly with a double-click also works, but a server is
better: it makes the résumé link, deep links and relative paths behave exactly
as they will in production.
</details>

---

## Files

```
my-site/
├── index.html                 # all page content lives here
├── serve.sh                   # local dev server (python3, no deps)
├── assets/
│   ├── css/style.css          # the whole design system, in 9 labelled sections
│   ├── js/main.js             # loader, reveals, nav, counters, form
│   ├── img/*.svg              # generated grayscale artwork (placeholders)
│   └── docs/Ishika_Rathod_Resume.pdf
└── .claude/launch.json        # dev-server config for the Claude Code preview pane
```

---

## Sections

| # | Section | Content |
|---|---------|---------|
| 01 | Cover | Cut-out portrait over the headline, annotations, 4 animated stats, skills marquee |
| 02 | Introduction | Professional summary, fact table, framed photo + taped polaroid |
| 03 | Education | Cornell MEng (Aug 2025  to  May 2026), MIT WPU B.Tech (Aug 2021  to  Jul 2025) |
| 04 | Experience | Hazen and Sawyer, ShipDelight, Zymr, Cornell TA |
| 05 | Skills | Proficiency bars + four toolkit columns |
| 06 | Portfolio | Six-tile selected-work grid |
| 07 to 09 | Projects One to Three | Bias detection, clinical NLP/LLM, market-entry model |
| 10 | Project Four | AMCIS 2025: Deep Learning for Customer Segmentation |
| 11 | Leadership | Four achievements |
| 12 | Contact | Details + message form |

All copy is drawn from the résumé in `assets/docs/`.

---

## Editing

**Text**: everything is in `index.html`, in the order it appears on the page.
Each section is marked with a banner comment (`<!-- ═══ 04 · EXPERIENCE ═══ -->`).

**Colours and type**: the tokens at the top of `style.css`:

```css
--paper:  #f4f3f0;   /* light sections   */
--ink:    #101010;   /* body text        */
--dark:   #111111;   /* dark sections    */
--ff-display: "Archivo", …    /* headlines */
--ff-text:    "Archivo Narrow", …
--ff-mono:    "JetBrains Mono", …   /* small caps labels */
```

## The cover cut-out

`assets/img/ishika-cutout.png` is background-removed from `IMG_3329`, which was
shot in snow. macOS subject-lifting leaves a soft matte several pixels wide, and
every one of those pixels carries bright snow, which showed as a white halo once
the cut-out sat on a dark cover.

Fixing it took three steps, in `tools/` terms a one-off but worth recording:
erode the matte inward, harden it with a steep alpha curve so there is little
soft edge left, then decontaminate what remains by solving the compositing
equation backwards against a bright background. Bright edge pixels went from
5.3% to 0.1%.

If the photograph is ever swapped, expect to redo this: any cut-out taken
against a bright background will fringe the same way.

## Screenshot mode

`?stills=1` renders the page with motion off and every animated element in its
settled state, so a headless capture photographs the finished page rather than a
half-finished transition. `?stills=1#s=2400` also jumps to a scroll offset.

This exists because the earlier approach, appending an override to `style.css`
for the duration of a capture and restoring it afterwards, raced with edits to
the same file and silently reverted work. A flag the page understands cannot do
that.

## Page structure

The home page is deliberately not a run of paragraphs. Each section has its own
shape:

- **Cover** carries the statement (`I turn messy data into something unique`)
  over a cut-out portrait. There is no plate behind her; a soft radial glow does
  the separating, which is what keeps a dark coat legible on a dark page.
- **Introduction** is a weighted left rail (identity, polaroid, facts, resume)
  beside the argument, a photograph and three cards (Find, Build, Translate).
  Both columns carry content, so the section no longer reads as mostly gap.
- **Experience** is a horizontal timeline: a rail across the top with cards
  hanging beneath it. Three fit on a wide screen; narrower, it becomes a
  snap carousel rather than collapsing into a list. The rail fills with the
  scroller when it overflows, and with the section otherwise.
- **Skills** is proficiency bars, a pull quote, and four cards describing how the
  work is done, with the full toolkit grouped underneath rather than listed as
  one run of commas off the resume.
- **Portfolio** is a grid of six tiles, each opening its own page.

If you add a role, copy one `.tl__item` in `index.html`. Each needs a date, one
metric worth leading with, the logo, and no more than three bullets: the format
stops working when a card turns into a paragraph.

## Colour

The whole site runs off five tones defined at the top of `style.css`:

| Token | Hex | Role |
|---|---|---|
| `--bone` | `#E5D7C4` | the main page surface |
| `--paper-soft` | `#D9C8AC` | alternating sections |
| `--card` | `#EFE5D6` | raised above the paper |
| `--cafe-noir` | `#4C3D19` | body ink |
| `--accent` | `#4A5530` | deep olive: headings, bars, icons |
| `--green-700` | `#354024` | Kombu: the cover and the closing section only |
| `--moss` / `--tan` | `#889063` / `#CFBB99` | decorative marks |

Beige carries the body of the site. The greens appear only on the cover and the
contact section, so those two read as bookends. The accent is a deep olive
rather than a warm tone, so the beige sections still point at the green ones.

Nothing else in the stylesheet hardcodes a colour, so retoning the site means
editing those five lines. The one exception is `--warn`, used only on a form
field in error: no palette tone reads as a warning against the dark green.

The palette also reaches past the stylesheet, into places that are easy to miss
when retoning: the favicon (an inline SVG in each page's `<head>`), the project
artwork in `assets/img`, and the logo marks.

Two deliberate departures from the raw swatches, both for readability:

- `--paper-soft` (the alternating section surface) is a Bone/Tan blend,
  `#D9C8AC`, not full Tan. The small mono labels sit at roughly 9.5px, and on
  pure Tan they fell to 2.2:1 contrast, which is well below readable. The blend
  keeps the section change visible while clearing 4.5:1.
- `--ink-soft` and `--ink-mute` are darker than a mid-tone would suggest, for
  the same reason. A warm light surface leaves little room for a light muted
  text tone, so the hierarchy leans on size and weight as much as colour.

Every text-on-surface pair in the site meets WCAG AA (4.5:1 for body, 3:1 for
large display type). Photographs are toned into the palette with the `--photo`
filter rather than running cold greyscale.

One ordering trap worth knowing: the portfolio thumbnails sit on a dark section
and are inverted. Filters apply in sequence, so `sepia()` before `invert()`
comes out cold blue. Those tiles invert first and are warmed afterwards.

## Motion

Beyond the reveals, the page runs: word-by-word heading masks, a one-time text
scramble on the introduction's opening line, bottom-up clip wipes on photos,
staggered grid children, a timeline rail that fills with scroll position, nodes
that pulse as their entry lands, section rules that draw themselves across,
pointer-leaning cards and buttons, parallax drift, and a marquee that skews with
scroll speed.

All of it is off under `prefers-reduced-motion`, and none of it is load-bearing:
with JavaScript disabled every section renders in its final state.

The scramble sets `aria-label` to the real sentence while it runs, so assistive
technology never reads the noise.

## Project artwork

`assets/img/p1..p6.svg` are generated placeholders standing in for real project
visuals, and they exist in two variants:

| File | Used by |
|---|---|
| `pN.svg` | the project case-study pages (ink marks on a light plate) |
| `pN-dark.svg` | the portfolio grid on the home page (bone marks on a dark plate) |

Both come from `tools/make-artwork.py`, seeded identically so the pair matches:

```bash
cd ~/Desktop/my-site && python3 tools/make-artwork.py assets/img
```

Two variants rather than one file recoloured by CSS, because filters apply in
sequence and inverting a warm image lands on a cold blue. Editing the palette
constants at the top of that script and re-running it retones every piece.

Swap these for real screenshots when you have them, and the script can go.

## Cursor

`main.js` draws a dot that tracks the pointer exactly and a ring that eases in
behind it, which is what reads as the trail. The ring opens up over anything
clickable and flips to bone over the dark sections.

It is only armed on devices with a real pointer (`hover: hover and pointer:
fine`) and where `prefers-reduced-motion` is not set, so touch and
reduced-motion users keep the native cursor. Text fields keep their I-beam,
since losing it while typing is worse than the effect is worth. Both layers are
`pointer-events: none`, so nothing on the page becomes harder to click, and the
rAF loop stops once the ring catches up rather than running forever.

## Company and university logos

The five marks live in `assets/img/logos/`: `hazen.png`, `shipdelight.png`,
`zymr.png`, `cornell.png`, `mitwpu.png`. Cornell is used twice, on the education
entry and on the Teaching Assistant role.

They are not the raw files. Logos generally arrive as screenshots with an opaque
white or dark plate baked in, a stray border pixel or two, and very different
padding, which renders as visible boxes. Each one has been run through
`tools/prepare-logo.py`, which keys out the plate and trims hard to the mark, so
the PNG has no padding of its own. Sizing is left entirely to CSS: the experience
cards use `object-fit: contain` inside `.exp__plate`, so every mark grows until it
hits the edge of the plate on one axis. A round seal and a wide wordmark therefore
both fill, without either being distorted.

To replace or add a logo, run the raw file through the same script rather than
dropping it in directly:

```bash
cd ~/Desktop/my-site && python3 tools/prepare-logo.py ~/Downloads/newlogo.png assets/img/logos/newlogo.png
```

Add `--invert` when the source is light artwork on a dark plate, as Zymr's was.
The script needs Pillow and numpy.

Marks keep their own brand colours. The script un-premultiplies as it keys the
plate out, so a navy wordmark stays navy rather than picking up a white halo.
Zymr needs `--dark-plate --flip-neutrals`: its source is the light-on-dark
variant, so the white wordmark is darkened for the light page while the blue
bird is left alone.

A logo file that is missing is removed from the DOM by `main.js`, so a gap in the
set leaves no broken image and no empty space.

**Photos**: four real images are in place:

| File | Where |
|---|---|
| `ishika-cutout.png` | cover: background removed, sits on the light panel |
| `photo-portrait.jpg` | introduction: the large framed photo |
| `photo-cornell.jpg` | introduction: the taped polaroid |
| `photo-campus.jpg` | education: the wide banner |

All render in their own colour through the `--photo` filter token in
`style.css`; change that one value to retone every photograph at once. The
cutout was made with macOS's own subject-lifting (Vision framework) from
`IMG_3329`; to redo it with a different photo, re-run the same extraction and
replace the PNG.

The remaining `p1 to p6.svg` / `proj-*.svg` files are generated abstract artwork
standing in for project visuals: swap in dashboard screenshots when you have
them. The portfolio tiles use `invert(1)` so light artwork reads on the dark
slide; remove that from `.folio__tile img` if you drop in photos.

**Cover headline**: `HI, I'M ISHIKA` lives in `.cover__title`; the italic word
is an `<em>` set in Instrument Serif. The light block behind the figure is
`.cover__panel`: its `top` percentage decides where the block meets her
shoulders, and `.cover__portrait`'s negative `margin-top` decides how far her
head rides up into the type.

**Stats**: the hero counters are driven by data attributes:

```html
<b data-count="940" data-suffix="K+">0</b>
```

**Skill bars**: `<div class="bar" data-level="92">`; the `data-level` drives the fill.

---

## The contact form

It is a static site, so there is no server to receive a POST. The form validates
in the browser and then opens the visitor's mail client pre-filled to
`ir289@cornell.edu`.

To collect submissions properly instead, sign up for a form endpoint (Formspree,
Basin, Netlify Forms) and replace the `mailto:` block at the bottom of
`main.js` with a `fetch()` to that endpoint.

---

## Notes on the JavaScript

`main.js` is ~230 lines, dependency-free, and deliberately defensive:

- **Reveals are scroll-driven, not `IntersectionObserver`-only.** One `sweep()`
  handles reveals, skill bars and counters together.
- **Animation vocabulary**: `.reveal` (fade + rise), `.reveal-clip` (bottom-up
  wipe, used on every photo), `.reveal-scale` (the polaroid), `[data-stagger]`
  (JS indexes children and CSS delays them), `[data-split]` (JS wraps each word
  of a heading in its own mask so headings type themselves in word by word),
  `[data-parallax="0.06"]` (transform-only drift), and `.magnetic` (buttons lean
  toward the pointer). The cover runs a timed entrance driven by `.is-lit`.
- **`.reveal` is only hidden when the `js` class is on `<html>`.** With
  JavaScript disabled the page is fully readable.
- **A 4-second safety net** reveals anything still hidden, and a 3-second net
  dismisses the loader, so a hiccup can never leave a blank page.
- **`prefers-reduced-motion` is honoured**: loader, reveals and marquee all
  switch off.
- Smooth scrolling is done in JS rather than CSS so anchor jumps clear the
  fixed header.

---

## Deploying

The site is fully static, so any host works. Since the résumé already points at
`ishikarathod.github.io`, GitHub Pages is the natural fit:

```bash
cd ~/Desktop/my-site && git init && git add -A && git commit -m "Portfolio site"
```

Then create a repo named `ishikarathod.github.io`, push to it, and enable Pages
on the `main` branch. The site is live at the repo URL within a minute.

---

## Browser support

Modern evergreen browsers. Uses CSS Grid, custom properties, `clamp()`,
`aspect-ratio`, `color-mix()` and the `translate` property. Google Fonts
(Archivo, Archivo Narrow, Instrument Serif, JetBrains Mono) load over the
network; Helvetica/Georgia stacks are the fallback.

CSS and JS are linked with a `?v=` content hash so a redeploy never serves a
stale cached copy. Regenerate the hashes after editing either file:

```bash
cd ~/Desktop/my-site && python3 -c "import re,hashlib;s=open('index.html').read();c=hashlib.md5(open('assets/css/style.css','rb').read()).hexdigest()[:8];j=hashlib.md5(open('assets/js/main.js','rb').read()).hexdigest()[:8];s=re.sub(r'style\.css\?v=[a-f0-9]+','style.css?v='+c,s);s=re.sub(r'main\.js\?v=[a-f0-9]+','main.js?v='+j,s);open('index.html','w').write(s);print(c,j)"
```
