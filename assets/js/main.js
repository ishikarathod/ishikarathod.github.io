/* ==========================================================================
   Ishika Rathod — Portfolio interactions
   Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Screenshot / QA mode: ?stills=1 renders every section in its settled state
  // with motion off. Lets a headless capture photograph the page without
  // patching the stylesheet, which used to race with edits to the same file.
  var stills = /[?&]stills=1\b/.test(location.search);
  if (stills) document.documentElement.classList.add('stills');

  // ?stills=1#s=1200 jumps straight to an offset, so a capture can photograph
  // any band of the page without scripting the browser
  var stillsAt = stills && /#s=(\d+)/.exec(location.hash);
  // jump before anything else runs, so a capture has the whole budget to paint
  if (stillsAt) window.scrollTo(0, parseInt(stillsAt[1], 10));
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── Split [data-split] headings into per-word masks ─────────────────── */
  $$('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (word, i) {
      var w = document.createElement('span');
      w.className = 'w';
      w.style.setProperty('--i', i);
      var inner = document.createElement('i');
      inner.textContent = word;
      w.appendChild(inner);
      el.appendChild(w);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ── Index the children of every [data-stagger] group ────────────────── */
  $$('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--i', i);
    });
  });

  /* ── Loader ──────────────────────────────────────────────────────────── */
  var loader = $('#loader'),
      bar    = $('#loaderBar'),
      count  = $('#loaderCount'),
      pct    = 0;

  function finishLoad() {
    if (loader) {
      loader.classList.add('is-done');
      setTimeout(function () { loader.remove(); }, 1400);
    }
    document.body.style.overflow = '';
    var cover = $('.cover');
    if (cover) cover.classList.add('is-lit');

    // honour a deep link (/#experience) once the loader is out of the way
    var target = location.hash && location.hash.length > 1 && !stills ? $(location.hash) : null;
    if (target) {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 58, behavior: 'auto' });
    }
    requestAnimationFrame(onScroll);
  }

  if (reduced || stills || !loader) {
    finishLoad();
  } else {
    document.body.style.overflow = 'hidden';
    var DUR = 1100, t0 = performance.now();
    (function step(now) {
      var p = Math.min((now - t0) / DUR, 1);
      pct = Math.round(100 * (1 - Math.pow(1 - p, 2)));
      bar.style.width = pct + '%';
      count.textContent = pct < 100 ? String(pct).padStart(2, '0') : '100';
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(finishLoad, 220);
    })(t0);
    // safety net: never trap the page behind the loader
    setTimeout(function () {
      if (loader && !loader.classList.contains('is-done')) finishLoad();
    }, 3000);
  }

  /* ── Scroll-driven reveals, skill bars and counters ─────────────────
     Deliberately scroll-driven rather than IntersectionObserver-only: one
     sweep drives everything, and it degrades to "just show it" if anything
     goes wrong. `.reveal` is only hidden when the `js` class is present, so
     the page is fully readable with JavaScript off.                        */

  var reveals  = $$('.reveal, .reveal-clip, .reveal-scale, [data-stagger], [data-split], .slide__frame'),
      bars     = $$('.bar'),
      counters = $$('[data-count]');

  // plain .reveal items cascade in fours; the richer types carry their own timing
  $$('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = ((i % 4) * 0.07) + 's';
  });

  /* "Has this scrolled into view yet?" — anything already past the top counts,
     so jumping straight to a deep link doesn't leave earlier sections stuck
     un-revealed or their counters frozen at zero. */
  function inView(el, ratio) {
    var r = el.getBoundingClientRect();
    if (r.height === 0 && r.width === 0) return false;
    return r.top < window.innerHeight * (ratio == null ? 0.9 : ratio);
  }

  function animateCount(el) {
    var target = parseFloat(el.dataset.count),
        suffix = el.dataset.suffix || '',
        dec    = target % 1 !== 0 ? 2 : 0;

    if (reduced || stills) { el.textContent = target + suffix; return; }

    var dur = 1400, t0 = performance.now(), done = false;
    (function frame(now) {
      if (done) return;
      // clamp both ends: a clock that hands back an earlier timestamp than the
      // start (virtual time, tab suspension) must not run the count backwards
      var p = Math.max(0, Math.min((now - t0) / dur, 1)),
          eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(frame);
      else done = true;
    })(t0);
    setTimeout(function () { done = true; el.textContent = target.toFixed(dec) + suffix; }, dur + 300);
  }

  function sweep() {
    reveals = reveals.filter(function (el) {
      if (!inView(el)) return true;
      el.classList.add('is-in');
      return false;
    });
    bars = bars.filter(function (el) {
      if (!inView(el, 0.85)) return true;
      var fill = el.querySelector('i');
      if (fill) fill.style.width = el.dataset.level + '%';
      return false;
    });
    counters = counters.filter(function (el) {
      if (!inView(el, 0.85)) return true;
      animateCount(el);
      return false;
    });
  }

  // Last-resort safety net: nothing stays invisible for more than 4s.
  setTimeout(function () {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }, 4000);

  /* ── Parallax ─────────────────────────────────────────────────────────
     [data-parallax="0.12"] drifts against the scroll. Transforms only, so
     it never triggers layout.                                            */

  var floaters = $$('[data-parallax]').map(function (el) {
    return { el: el, rate: parseFloat(el.dataset.parallax) || 0 };
  });
  var coverPortrait = $('.cover__portrait');
  if (coverPortrait) floaters.push({ el: coverPortrait, rate: 0.06 });

  function parallax() {
    if (reduced) return;
    var vh = window.innerHeight;
    floaters.forEach(function (f) {
      var r = f.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var mid = r.top + r.height / 2 - vh / 2;
      f.el.style.setProperty('--py', (-mid * f.rate).toFixed(1) + 'px');
    });
  }

  /* ── Marquee reacts to scroll speed ──────────────────────────────────── */

  var marquee = $('#marquee'), mqY = 0, mqSkew = 0;

  function marqueeTilt(y) {
    if (!marquee || reduced) return;
    var v = Math.max(-9, Math.min(9, (y - mqY) * 0.14));
    mqY = y;
    mqSkew += (v - mqSkew) * 0.35;
    marquee.style.setProperty('--mq-skew', mqSkew.toFixed(2) + 'deg');
  }

  /* ── Nav: hide on scroll down, theme-match dark sections ─────────────── */
  var nav     = $('#nav'),
      runhead = $('#runhead'),
      lastY   = 0,
      onDarkChange = null;

  function drawerOpen() {
    var d = $('#drawer');
    return !!d && d.classList.contains('is-open');
  }

  function onScroll() {
    var y = window.pageYOffset;

    sweep();
    spy();
    parallax();
    marqueeTilt(y);
    timelineProgress();

    // decode any heading that has just come into view
    for (var i = scrambled.length - 1; i >= 0; i--) {
      if (inView(scrambled[i], 0.8)) { scramble(scrambled[i]); scrambled.splice(i, 1); }
    }

    nav.classList.toggle('is-stuck', y > 40);
    nav.classList.toggle('is-hidden', y > 420 && y > lastY && !drawerOpen());
    lastY = y;

    // which section sits behind the top chrome?
    var probe = document.elementsFromPoint(window.innerWidth / 2, 64)
      .filter(function (el) { return el.classList && el.classList.contains('slide'); })[0];
    var dark = !!(probe && probe.classList.contains('slide--dark'));
    if (!drawerOpen()) nav.classList.toggle('on-dark', dark);
    runhead.classList.toggle('on-dark', dark);
    if (onDarkChange) onDarkChange(dark);

    // progress bar
    var h = document.documentElement.scrollHeight - window.innerHeight;
    $('#progress').style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }

  /* Coalesce scroll work into one call per frame. rAF and a timer race each
     other so a throttled rAF (hidden tab, background window) can never leave
     the latch stuck closed and freeze every scroll-driven effect. */
  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    var run = function () {
      if (!scheduled) return;
      scheduled = false;
      onScroll();
    };
    requestAnimationFrame(run);
    setTimeout(run, 120);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });

  /* ── Active nav link ─────────────────────────────────────────────────── */
  var links    = $$('[data-nav]'),
      targets  = links.map(function (a) { return $(a.getAttribute('href')); });

  function spy() {
    var mid = window.pageYOffset + window.innerHeight * 0.4, active = -1;
    targets.forEach(function (sec, i) {
      if (sec && sec.offsetTop <= mid) active = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === active); });
  }

  /* ── Mobile drawer ───────────────────────────────────────────────────── */
  var burger = $('#burger'), drawer = $('#drawer');
  if (burger && drawer) {
  function setDrawer(open) {
    drawer.classList.toggle('is-open', open);
    nav.classList.toggle('on-dark', open || nav.classList.contains('on-dark'));
    nav.classList.toggle('over-drawer', open);
    if (open) nav.classList.add('on-dark');
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () {
    setDrawer(!drawer.classList.contains('is-open'));
  });
  $$('a', drawer).forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setDrawer(false);
  });
  }

  /* ── Local clock in the running header ───────────────────────────────── */
  var clock = $('#clock');
  if (clock) {
    (function tickClock() {
      clock.textContent = new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false
      });
      setTimeout(tickClock, 15000);
    })();
  }

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Contact form → opens the visitor's mail client ──────────────────── */
  var form = $('#contactForm'), note = $('#formNote');

  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form),
        get  = function (k) { return String(data.get(k) || '').trim(); };

    var invalid = ['name', 'email', 'message'].filter(function (k) {
      var field = form.elements[k];
      var bad = !get(k) || (k === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get(k)));
      field.classList.toggle('is-error', bad);
      return bad;
    });

    if (invalid.length) {
      note.textContent = 'Please complete the highlighted fields.';
      form.elements[invalid[0]].focus();
      return;
    }

    var body = [
      'Name: '    + get('name'),
      'Email: '   + get('email'),
      'Company: ' + (get('company') || 'n/a'),
      '',
      get('message')
    ].join('\n');

    window.location.href = 'mailto:ir289@cornell.edu'
      + '?subject=' + encodeURIComponent(get('subject') + ' — ' + get('name'))
      + '&body='    + encodeURIComponent(body);

    note.textContent = 'Opening your mail app…';
  });

  /* ── Missing logo files degrade to nothing, not a broken image ───────── */

  $$('.orglogo img').forEach(function (img) {
    function drop() {
      var slot = img.closest('.orglogo');
      if (slot) slot.remove(); else img.remove();
    }
    img.addEventListener('error', drop);
    // a cached failure can land before the listener is attached
    if (img.complete && img.naturalWidth === 0) drop();
  });

  /* ── Timeline rail fills as the section scrolls past ─────────────────── */

  var htl = $('#htl'), htlFill = $('#htlProgress');
  var scroller = htl ? htl.querySelector('.htl__scroller') : null;

  function timelineProgress() {
    if (!htl || !htlFill || !scroller) return;

    // when the track overflows, the rail tracks how far along it you are;
    // when it all fits, it fills as the section crosses the viewport instead
    var max = scroller.scrollWidth - scroller.clientWidth;
    var p;
    if (max > 8) {
      p = scroller.scrollLeft / max;
    } else {
      var r = htl.getBoundingClientRect();
      p = (window.innerHeight * 0.75 - r.top) / Math.max(r.height, 1);
    }
    htlFill.style.width = (Math.max(0, Math.min(p, 1)) * 100).toFixed(2) + '%';
  }

  if (scroller) scroller.addEventListener('scroll', timelineProgress, { passive: true });

  /* ── Scramble: a heading decodes itself once, on first sight ─────────── */

  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}=+*';

  function scramble(el) {
    if (reduced) return;
    var final = el.textContent, len = final.length, frame = 0;

    // the visual text is noise for a moment; keep the real sentence exposed to
    // assistive tech the whole time rather than letting it read gibberish
    el.setAttribute('aria-label', final);
    var lock  = new Array(len).fill(false);
    var order = final.split('').map(function (_, i) { return i; })
                     .sort(function () { return Math.random() - 0.5; });

    function step() {
      // reveal a few more real characters each frame, noise fills the rest
      var reveal = Math.floor(frame / 1.6);
      order.slice(0, reveal).forEach(function (i) { lock[i] = true; });

      el.textContent = final.split('').map(function (ch, i) {
        if (lock[i] || ch === ' ') return ch;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }).join('');

      frame++;
      if (reveal < len) {
        requestAnimationFrame(step);
      } else {
        el.textContent = final;
        el.removeAttribute('aria-label');
      }
    }
    requestAnimationFrame(step);
  }

  var scrambled = $$('[data-scramble]');

  /* ── Cards lean toward the pointer ───────────────────────────────────── */

  if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width  - 0.5;
        var py = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform =
          'perspective(700px) rotateX(' + (-py * 6).toFixed(2) + 'deg) rotateY(' +
          (px * 8).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ── Trailing cursor ─────────────────────────────────────────────────
     Dot tracks the pointer exactly; the ring eases in behind it on a rAF
     loop. Only runs where there is a real pointer and motion is welcome, so
     touch devices keep the native behaviour and nothing is lost.          */

  var cursor = $('#cursor');

  if (cursor && !reduced &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches) {

    var dot  = $('#cursorDot'),
        ring = $('#cursorRing'),
        mx = window.innerWidth / 2,  my = window.innerHeight / 2,
        rx = mx, ry = my,
        running = false;

    document.documentElement.classList.add('has-cursor');

    // stay hidden and centred until the pointer actually moves, so neither
    // layer can flash in the top-left corner before the first frame
    cursor.classList.add('is-out');
    dot.style.transform  = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';

    function loop() {
      // ring chases the pointer; the gap is what reads as the trail
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0)';

      if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) {
        requestAnimationFrame(loop);
      } else {
        running = false;           // settle, then stop burning frames
      }
    }

    function kick() {
      if (running) return;
      running = true;
      requestAnimationFrame(loop);
    }

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      cursor.classList.remove('is-out');

      // hovering something clickable opens the ring; over a text field the
      // custom cursor steps aside for the native I-beam
      var el   = e.target.closest ? e.target : null;
      var text = el && el.closest('input[type="text"], input[type="email"], textarea');
      var over = el && el.closest('a, button, .folio__tile, .magnetic, select, label');
      cursor.classList.toggle('is-text', !!text);
      cursor.classList.toggle('is-active', !!over && !text);

      kick();
    }, { passive: true });

    window.addEventListener('pointerdown', function () { cursor.classList.add('is-down'); }, { passive: true });
    window.addEventListener('pointerup',   function () { cursor.classList.remove('is-down'); }, { passive: true });
    document.addEventListener('mouseleave', function () { cursor.classList.add('is-out'); });
    document.addEventListener('mouseenter', function () { cursor.classList.remove('is-out'); });

    // keep the cursor readable when it crosses onto a dark section
    onDarkChange = function (dark) { cursor.classList.toggle('on-dark', dark); };
  }

  /* ── Magnetic buttons ────────────────────────────────────────────────── */

  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.4;
        el.style.setProperty('--mx', dx.toFixed(1) + 'px');
        el.style.setProperty('--my', dy.toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  }

  /* ── First paint ─────────────────────────────────────────────────────── */
  onScroll();

  /* ── Smooth anchor scroll that respects the fixed chrome ─────────────── */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var t = $(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.pageYOffset - 58;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();
