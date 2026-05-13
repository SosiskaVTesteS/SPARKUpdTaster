document.addEventListener('DOMContentLoaded', () => {
    // 1. Находим все наши секции с планетами
    const sections = document.querySelectorAll('.step-section');

    // 2. Настройки для "глаз" (Observer)
    const options = {
        root: null, // следим относительно окна браузера
        threshold: 0.6 // планета считается "активной", когда видна на 60%
    };

    // 3. Создаем логику: что делать, когда планета в фокусе
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Добавляем класс active, когда доскроллили
                entry.target.classList.add('active');
                
                // Для красоты: можно менять цвет фона или свечение всей страницы
                const color = getComputedStyle(entry.target.querySelector('.planet-sphere')).boxShadow;
                console.log('Текущий этап активен:', entry.target.id);
            } else {
                // Убираем класс, когда пролистали дальше (по желанию)
                entry.target.classList.remove('active');
            }
        });
    }, options);

    // 4. Запускаем слежку за каждой секцией
    sections.forEach(section => {
        observer.observe(section);
    });
});
    desc:  'Социальные платформы, B2B SaaS и экономика доверия. Предсказуемые метрики роста, умеренный риск. Идеальная точка входа для консервативных инвесторов.',
    metrics: [
      ['Активных идей',    '742'],
      ['Объём SPK / 24ч',  '52 180'],
      ['Средний ROI',      '+44%'],
      ['Новых сегодня',    '24'],
      ['Топ-тег',          'B2B SaaS'],
    ],
  },
  fin: {
    name:  'Финансы',
    trend: '↑ 55% за последний месяц',
    desc:  'Венчурные инструменты, криптовалютные стратегии и токеномика следующего поколения. Самая быстрорастущая зона — волатильность высокая, потенциал огромный.',
    metrics: [
      ['Активных идей',    '934'],
      ['Объём SPK / 24ч',  '118 540'],
      ['Средний ROI',      '+88%'],
      ['Новых сегодня',    '51'],
      ['Топ-тег',          'Venture'],
    ],
  },
};

/* ───────────────────────────────────────────────────────────────
   1. STARFIELD CANVAS
   State machine per star: idle → brightening → fading → idle
   Only ~16% of idle stars trigger a twinkle per cycle to keep
   the effect rare and organic.
─────────────────────────────────────────────────────────────── */
(function initStarfield() {
  const cvs = /** @type {HTMLCanvasElement} */ (document.getElementById('starfield'));
  const ctx = cvs.getContext('2d');
  let stars = [];
  let W = 0, H = 0;

  /* Build star pool sized to viewport area */
  function buildStars() {
    stars = [];
    const count = Math.floor(W * H / 2400);
    for (let i = 0; i < count; i++) {
      const alpha = Math.random() * 0.44 + 0.07;
      stars.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.05 + 0.15,
        alpha,               // resting opacity
        cur:   alpha,        // current rendered opacity
        state: 'idle',
        idle:  Math.floor(Math.random() * 1100 + 200),
        spd:   Math.random() * 0.012 + 0.004,
        peak:  0,
      });
    }
  }

  function resize() {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
    buildStars();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      /* ── state transitions ── */
      if (s.state === 'idle') {
        if (--s.idle <= 0) {
          if (Math.random() < 0.16) {
            s.state = 'up';
            s.peak  = Math.min(1, s.alpha + Math.random() * 0.50 + 0.14);
          } else {
            s.idle = Math.floor(Math.random() * 900 + 250);
          }
        }
      } else if (s.state === 'up') {
        s.cur += s.spd;
        if (s.cur >= s.peak) { s.cur = s.peak; s.state = 'down'; }
      } else {
        /* fading back — slightly slower than brightening */
        s.cur -= s.spd * 0.62;
        if (s.cur <= s.alpha) {
          s.cur  = s.alpha;
          s.state = 'idle';
          s.idle  = Math.floor(Math.random() * 950 + 300);
        }
      }

      /* ── draw ── */
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,202,255,${s.cur.toFixed(3)})`;
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  frame();
})();

/* ───────────────────────────────────────────────────────────────
   2. ORBIT RADIUS SCALING
   Reads each .sys cell's pixel dimensions at runtime.
   Computes the maximum allowed radius so no orbit ring
   overflows the grid cell (+ 16px safety margin).
   Writes scaled --or back to each .orb and sets --wrap-size
   on .sys-inner so the container matches the largest orbit.
   Also updates .sys-plate --plate-top for correct nameplate offset.
─────────────────────────────────────────────────────────────── */
function sizeOrbits() {
  document.querySelectorAll('.sys').forEach(sys => {
    const inner = sys.querySelector('.sys-inner');
    const plate = sys.querySelector('.sys-plate');
    if (!inner) return;

    /* Available radius = min(cellW, cellH) / 2 − margin */
    const cellW  = sys.offsetWidth;
    const cellH  = sys.offsetHeight;
    const avail  = Math.min(cellW, cellH) / 2 - 16;

    /* Find the largest base radius declared in HTML */
    const maxBaseR = parseFloat(inner.dataset.maxR || '110');

    /* Scale factor — never upscale beyond 1 */
    const scale = avail < maxBaseR ? avail / maxBaseR : 1;

    /* Apply scaled radius to every orbit */
    inner.querySelectorAll('.orb').forEach(orb => {
      const baseR = parseFloat(orb.dataset.baseR || '50');
      const r     = Math.round(baseR * scale);
      orb.style.setProperty('--or', `${r}px`);
    });

    /* Resize the inner container to fit the largest orbit */
    const wrapPx = Math.round(maxBaseR * scale * 2 + 12);
    inner.style.width  = `${wrapPx}px`;
    inner.style.height = `${wrapPx}px`;
    inner.style.setProperty('--wrap-size', `${wrapPx}px`);

    /* Nameplate: centre + half-wrap + 12px gap */
    if (plate) {
      plate.style.top = `calc(50% + ${Math.round(wrapPx / 2) + 12}px)`;
    }
  });
}

/* ───────────────────────────────────────────────────────────────
   3. PLANET LABEL BUBBLE INJECTION
   For every .orb that has a data-label, we inject a .pbub span
   as a sibling to .planet inside the orbit ring.
   The bubble inherits --od / --dl from its parent .orb so its
   counter-rotation animation stays perfectly in sync.
─────────────────────────────────────────────────────────────── */
function injectBubbles() {
  document.querySelectorAll('.orb[data-label]').forEach(orb => {
    /* Skip if already injected (resize guard) */
    if (orb.querySelector('.pbub')) return;

    const label = orb.dataset.label;
    if (!label) return;

    const bub = document.createElement('span');
    bub.className   = 'pbub';
    bub.textContent = label;

    /* Pass animation timing down via CSS vars on the bubble itself */
    const od    = orb.style.getPropertyValue('--od')    || '30s';
    const dl    = orb.style.getPropertyValue('--dl')    || '0s';
    bub.style.setProperty('--od', od);
    bub.style.setProperty('--dl', dl);

    /* Insert after .planet so CSS sibling selector .planet.tapped + .pbub works */
    const planet = orb.querySelector('.planet');
    if (planet) {
      planet.after(bub);
    } else {
      orb.appendChild(bub);
    }
  });
}

/* ───────────────────────────────────────────────────────────────
   4. FOCUS MECHANICS
   openSystem(el)  — fly system to viewport centre, dim siblings
   closeSystem()   — reverse everything
─────────────────────────────────────────────────────────────── */
const obs     = document.getElementById('obs');
const dimmer  = document.getElementById('dimmer');
const hint    = document.getElementById('hint');
const systems = document.querySelectorAll('.sys');

let focusedSys  = null;
let hintTimer   = null;

/**
 * Opens (focuses) a star system.
 * Computes the CSS translate needed to visually centre the system
 * in the viewport, compensating for the scale factor.
 * @param {HTMLElement} el — the .sys element to focus
 */
function openSystem(el) {
  /* Clicking the already-focused system closes it */
  if (focusedSys === el) { closeSystem(); return; }

  focusedSys = el;

  /* Viewport centre */
  const vx = window.innerWidth  / 2;
  const vy = window.innerHeight / 2;

  /* System's current centre */
  const rect = el.getBoundingClientRect();
  const ex   = rect.left + rect.width  / 2;
  const ey   = rect.top  + rect.height / 2;

  /* Scale factor differs by breakpoint */
  const sc = window.innerWidth <= 600 ? 1.15 : 1.35;

  /* Translate required BEFORE scale is applied
     (divide by scale because CSS applies scale after translate) */
  const tx = (vx - ex) / sc;
  const ty = (vy - ey) / sc;

  el.style.setProperty('--ftx', `${tx.toFixed(2)}px`);
  el.style.setProperty('--fty', `${ty.toFixed(2)}px`);
  el.style.setProperty('--fsc', String(sc));

  /* Apply state classes */
  systems.forEach(s => {
    if (s === el) {
      s.classList.add('focused');
      s.classList.remove('dimmed');
    } else {
      s.classList.add('dimmed');
      s.classList.remove('focused');
    }
  });

  dimmer.classList.add('on');
  hint.classList.add('gone');

  /* Render detail panel */
  renderDetail(el.dataset.key);
  openPanel();
}

/** Closes the currently focused system and resets all state. */
function closeSystem() {
  if (!focusedSys) return;

  /* Clear tapped planets */
  document.querySelectorAll('.planet.tapped').forEach(p => p.classList.remove('tapped'));

  focusedSys.classList.remove('focused');
  focusedSys.style.removeProperty('--ftx');
  focusedSys.style.removeProperty('--fty');
  focusedSys.style.removeProperty('--fsc');
  focusedSys = null;

  systems.forEach(s => s.classList.remove('dimmed', 'focused'));

  dimmer.classList.remove('on');
  closePanel();

  /* Re-show hint after a delay */
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => hint.classList.remove('gone'), 3500);
}

/* System click */
systems.forEach(sys => {
  sys.addEventListener('click', e => {
    e.stopPropagation();
    openSystem(sys);
  });
});

/* Clicking the dimmer closes */
dimmer.addEventListener('click', closeSystem);

/* ───────────────────────────────────────────────────────────────
   5. DETAIL PANEL
─────────────────────────────────────────────────────────────── */
const dpanel      = document.getElementById('dpanel');
const dpanelClose = document.getElementById('dpanel-close');
const dpanelBody  = document.getElementById('dpanel-body');

function openPanel() {
  dpanel.classList.add('open');
  dpanel.setAttribute('aria-hidden', 'false');
}

function closePanel() {
  dpanel.classList.remove('open');
  dpanel.setAttribute('aria-hidden', 'true');
}

/**
 * Renders system details into #dpanel-body.
 * @param {string} key — key in SYSTEMS object
 */
function renderDetail(key) {
  const d = SYSTEMS[key];
  if (!d) return;

  const metricsHTML = d.metrics
    .map(([label, value]) => `
      <div class="dp-row">
        <span>${label}</span>
        <span>${value}</span>
      </div>`)
    .join('');

  dpanelBody.innerHTML = `
    <h2>${d.name}</h2>
    <span class="dp-trend">${d.trend}</span>
    <p class="dp-desc">${d.desc}</p>
    <div class="dp-divider"></div>
    ${metricsHTML}
  `;
}

dpanelClose.addEventListener('click', e => {
  e.stopPropagation();
  closeSystem();
});

/* ───────────────────────────────────────────────────────────────
   6. PLANET TOOLTIPS
   Desktop: floating tooltip follows cursor while hovering a planet
            — only shows when the parent system is focused.
   Mobile:  tooltip content shown via .pbub bubble on tap.
            .planet.tapped class toggled; tap elsewhere clears it.
─────────────────────────────────────────────────────────────── */
const ptip = document.getElementById('ptip');

/** Move floating tooltip to cursor position */
function moveTip(x, y) {
  ptip.style.left = `${x + 16}px`;
  ptip.style.top  = `${y - 28}px`;
}

/* Attach events to all planets (works after bubbles are injected) */
function bindPlanetEvents() {
  document.querySelectorAll('.planet').forEach(planet => {
    const label = planet.closest('.orb')?.dataset.label || '';

    /* ── Desktop hover ── */
    planet.addEventListener('mouseenter', e => {
      const sys = planet.closest('.sys');
      if (!sys?.classList.contains('focused')) return;
      ptip.textContent = label;
      ptip.setAttribute('aria-label', label);
      ptip.classList.add('show');
      moveTip(e.clientX, e.clientY);
    });

    planet.addEventListener('mousemove', e => {
      if (ptip.classList.contains('show')) moveTip(e.clientX, e.clientY);
    });

    planet.addEventListener('mouseleave', () => {
      ptip.classList.remove('show');
    });

    /* ── Mobile tap ── */
    planet.addEventListener('touchstart', e => {
      e.stopPropagation();
      const sys = planet.closest('.sys');
      if (!sys?.classList.contains('focused')) return;

      const wasTapped = planet.classList.contains('tapped');

      /* Clear all tapped states first */
      document.querySelectorAll('.planet.tapped').forEach(p => p.classList.remove('tapped'));

      if (!wasTapped) planet.classList.add('tapped');
    }, { passive: true });
  });
}

/* Tap anywhere outside a planet clears tapped state */
document.addEventListener('touchstart', e => {
  if (!e.target.closest('.planet')) {
    document.querySelectorAll('.planet.tapped').forEach(p => p.classList.remove('tapped'));
  }
}, { passive: true });

/* ───────────────────────────────────────────────────────────────
   7. KEYBOARD NAVIGATION
─────────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSystem();
    return;
  }

  /* Enter / Space activate the focused (tab-focused) system */
  if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.classList.contains('sys')) {
    e.preventDefault();
    openSystem(/** @type {HTMLElement} */ (document.activeElement));
  }
});

/* ───────────────────────────────────────────────────────────────
   8. RESIZE HANDLER
   Debounced — runs sizing + recalculates focused system position.
─────────────────────────────────────────────────────────────── */
let resizeTimer = null;

function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    sizeOrbits();

    /* If a system is focused, recompute its fly-to position */
    if (focusedSys) {
      const vx   = window.innerWidth  / 2;
      const vy   = window.innerHeight / 2;
      const rect = focusedSys.getBoundingClientRect();

      /* Temporarily remove focused transform to get real position */
      focusedSys.style.transition = 'none';
      focusedSys.classList.remove('focused');

      requestAnimationFrame(() => {
        const r  = focusedSys.getBoundingClientRect();
        const ex = r.left + r.width  / 2;
        const ey = r.top  + r.height / 2;
        const sc = window.innerWidth <= 600 ? 1.15 : 1.35;

        focusedSys.style.setProperty('--ftx', `${((vx - ex) / sc).toFixed(2)}px`);
        focusedSys.style.setProperty('--fty', `${((vy - ey) / sc).toFixed(2)}px`);
        focusedSys.style.setProperty('--fsc', String(sc));

        focusedSys.classList.add('focused');

        /* Re-enable transitions after one frame */
        requestAnimationFrame(() => {
          focusedSys.style.removeProperty('transition');
        });
      });
    }
  }, 120);
}

window.addEventListener('resize', onResize, { passive: true });

/* ───────────────────────────────────────────────────────────────
   INIT — run after DOM is fully parsed
─────────────────────────────────────────────────────────────── */
(function init() {
  sizeOrbits();      /* 1. set orbit radii based on real cell sizes */
  injectBubbles();   /* 2. inject .pbub elements into orbit rings    */
  bindPlanetEvents();/* 3. attach hover/tap listeners to planets     */
})();  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      if (s.state === 'idle') {
        if (--s.idle <= 0 && Math.random() < 0.18) {
          s.state = 'up';
          s.peak  = Math.min(1, s.alpha + Math.random() * 0.5 + 0.15);
        } else if (s.idle <= 0) {
          s.idle = Math.floor(Math.random() * 700 + 250);
        }
      } else if (s.state === 'up') {
        s.cur += s.spd;
        if (s.cur >= s.peak) { s.cur = s.peak; s.state = 'down'; }
      } else {
        s.cur -= s.spd * 0.65;
        if (s.cur <= s.alpha) {
          s.cur = s.alpha; s.state = 'idle';
          s.idle = Math.floor(Math.random() * 900 + 300);
        }
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(215,205,255,${s.cur})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  tick();
})();

/* ── 2. INJECT PLANET BUBBLES ─────────────────────── */
/*
  Each .planet has data-label.
  We inject a .planet-bubble span inside the orbit (sibling to planet),
  positioned so it appears above the planet dot and counter-rotates.
  Because orbit rotates and planet counter-rotates, the bubble
  (inside orbit) also needs counter-rotation applied.
*/
document.querySelectorAll('.orbit').forEach(orbit => {
  const planet = orbit.querySelector('.planet');
  if (!planet) return;

  const label = planet.dataset.label;
  if (!label) return;

  // Bubble lives next to planet inside the same orbit div
  const bubble = document.createElement('span');
  bubble.className = 'planet-bubble';
  bubble.textContent = label;

  // Inherit the same animation timing as the planet
  const od    = orbit.style.getPropertyValue('--od')    || '30s';
  const delay = orbit.style.getPropertyValue('--delay') || '0s';
  bubble.style.setProperty('--od',    od);
  bubble.style.setProperty('--delay', delay);

  // Position at same spot as planet (top centre of orbit)
  bubble.style.position   = 'absolute';
  bubble.style.top        = '-32px';
  bubble.style.left       = '50%';

  orbit.appendChild(bubble);
});

/* ── 3. MOBILE ORBIT RADIUS SCALE ─────────────────── */
/*
  On mobile the system-wrap shrinks to 148×148px.
  Largest orbit --r=100px would overflow → scale all radii by 0.62.
*/
function scaleMobileOrbits() {
  const isMobile = window.innerWidth <= 600;
  document.querySelectorAll('.orbit').forEach(orbit => {
    const baseR = parseFloat(orbit.getAttribute('data-base-r') || orbit.style.getPropertyValue('--r') || '50');
    if (!orbit.getAttribute('data-base-r')) orbit.setAttribute('data-base-r', baseR);
    const r = isMobile ? baseR * 0.60 : baseR;
    orbit.style.setProperty('--r', `${r}px`);
  });
}
scaleMobileOrbits();
window.addEventListener('resize', scaleMobileOrbits, { passive: true });

/* ── 4. FOCUS MECHANICS ───────────────────────────── */
const systems     = document.querySelectorAll('.star-system');
const dimmer      = document.getElementById('dimmer');
const detailPanel = document.getElementById('detailPanel');
const detailContent = document.getElementById('detailContent');
const detailClose = document.getElementById('detailClose');
const hint        = document.getElementById('hint');

let focused = null;
let hintTimer = null;

const DATA = {
  tech: {
    name: 'Технологии',
    trend: '↑ 42 % за последний месяц',
    desc:  'Самая динамичная зона SPARK. ИИ-инструменты нового поколения, DeFi-протоколы и инфраструктура Web3 формируют ядро. Высокий риск — высокая доходность.',
    metrics: [
      ['Активных идей',   '1 247'],
      ['Объём SPK / 24ч', '84 320'],
      ['Средний ROI',     '+61 %'],
      ['Новых сегодня',   '38'],
    ],
  },
  social: {
    name: 'Социум',
    trend: '↑ 31 % за последний месяц',
    desc:  'Социальные платформы, B2B SaaS и экономика доверия. Предсказуемые метрики, умеренный риск. Лучший вход для консервативных инвесторов.',
    metrics: [
      ['Активных идей',   '742'],
      ['Объём SPK / 24ч', '52 180'],
      ['Средний ROI',     '+44 %'],
      ['Новых сегодня',   '24'],
    ],
  },
};

function openSystem(el) {
  const key = el.dataset.system;
  if (!DATA[key]) return;
  if (focused === el) { closeSystem(); return; }

  focused = el;

  // Compute translate-to-centre
  const rect = el.getBoundingClientRect();
  const ecx  = rect.left + rect.width  / 2;
  const ecy  = rect.top  + rect.height / 2;
  const vcx  = window.innerWidth  / 2;
  const vcy  = window.innerHeight / 2;
  const sc   = window.innerWidth <= 600 ? 1.2 : 1.35;
  el.style.setProperty('--ftx', `${(vcx - ecx) / sc}px`);
  el.style.setProperty('--fty', `${(vcy - ecy) / sc}px`);
  el.style.setProperty('--fsc', String(sc));

  systems.forEach(s => {
    if (s === el) { s.classList.add('focused'); s.classList.remove('dimmed'); }
    else          { s.classList.add('dimmed');  s.classList.remove('focused'); }
  });

  dimmer.classList.add('active');
  hint.classList.add('hidden');
  renderDetail(key);
  detailPanel.classList.add('open');
  detailPanel.setAttribute('aria-hidden', 'false');
}

function closeSystem() {
  if (!focused) return;
  focused.classList.remove('focused');
  focused.style.removeProperty('--ftx');
  focused.style.removeProperty('--fty');
  systems.forEach(s => s.classList.remove('dimmed', 'focused'));
  dimmer.classList.remove('active');
  detailPanel.classList.remove('open');
  detailPanel.setAttribute('aria-hidden', 'true');
  // clear any touch-active planets
  document.querySelectorAll('.planet.touch-active').forEach(p => p.classList.remove('touch-active'));
  focused = null;
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => hint.classList.remove('hidden'), 3000);
}

function renderDetail(key) {
  const d = DATA[key];
  detailContent.innerHTML = `
    <h2>${d.name}</h2>
    <p class="dp-trend">${d.trend}</p>
    <p class="dp-desc">${d.desc}</p>
    <div class="dp-metrics">
      ${d.metrics.map(([l,v]) => `
        <div class="dp-metric"><span>${l}</span><span>${v}</span></div>
      `).join('')}
    </div>`;
}

// Attach click to each system
systems.forEach(sys => {
  sys.addEventListener('click', e => { e.stopPropagation(); openSystem(sys); });
});

// Clicking dimmer closes
dimmer.addEventListener('click', closeSystem);
detailClose.addEventListener('click', closeSystem);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSystem(); });

/* ── 5. PLANET TOUCH / HOVER TOOLTIP ─────────────── */
/*
  Desktop: mouse moves over planet → tooltip follows cursor, shown always
           when system is focused (planet-bubble handles it via CSS).
  Mobile:  tap on planet → .touch-active toggled → CSS shows its bubble.
*/
const tooltip = document.getElementById('planetTooltip');

// Desktop hover
document.querySelectorAll('.planet').forEach(planet => {
  planet.addEventListener('mouseenter', e => {
    const sys = planet.closest('.star-system');
    if (!sys || !sys.classList.contains('focused')) return;
    tooltip.textContent = planet.dataset.label || '';
    tooltip.classList.add('show');
    moveTip(e);
  });
  planet.addEventListener('mousemove', moveTip);
  planet.addEventListener('mouseleave', () => tooltip.classList.remove('show'));

  // Mobile tap
  planet.addEventListener('touchstart', e => {
    e.stopPropagation();
    const sys = planet.closest('.star-system');
    if (!sys || !sys.classList.contains('focused')) return;
    // Toggle touch-active
    const wasActive = planet.classList.contains('touch-active');
    document.querySelectorAll('.planet.touch-active').forEach(p => p.classList.remove('touch-active'));
    if (!wasActive) planet.classList.add('touch-active');
  }, { passive: true });
});

function moveTip(e) {
  tooltip.style.left = `${e.clientX + 14}px`;
  tooltip.style.top  = `${e.clientY - 26}px`;
}

// Tapping elsewhere on mobile dismisses bubble
document.addEventListener('touchstart', e => {
  if (!e.target.closest('.planet')) {
    document.querySelectorAll('.planet.touch-active').forEach(p => p.classList.remove('touch-active'));
  }
}, { passive: true });

/* ── 6. PREVENT ORBIT OVERFLOW VIA JS GUARD ──────── */
/*
  After resize, re-check that no .system-wrap child has a computed
  orbit ring size exceeding the wrap container. Safety net.
*/
function guardOrbitOverflow() {
  document.querySelectorAll('.star-system').forEach(sys => {
    const wrap = sys.querySelector('.system-wrap');
    if (!wrap) return;
    const wrapW = wrap.offsetWidth;
    const maxR  = wrapW / 2 - 8; // 8px margin
    sys.querySelectorAll('.orbit').forEach(orbit => {
      const baseR = parseFloat(orbit.getAttribute('data-base-r') || 50);
      const isMobile = window.innerWidth <= 600;
      const desired  = isMobile ? baseR * 0.60 : baseR;
      const r = Math.min(desired, maxR);
      orbit.style.setProperty('--r', `${r}px`);
    });
  });
}
window.addEventListener('resize', guardOrbitOverflow, { passive: true });
// Run once after paint
requestAnimationFrame(guardOrbitOverflow);        speed: Math.random() * 0.012 + 0.004,
        // twinkle target peak
        peak: 0,
      });
      stars[i].cur = stars[i].alpha;
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      // Twinkle logic — pure JS state machine, no heavy calc
      if (s.state === 'idle') {
        s.idleFrames--;
        if (s.idleFrames <= 0) {
          // rare trigger: only ~15% of stars twinkle at any frame
          if (Math.random() < 0.15) {
            s.state = 'brightening';
            s.peak = Math.min(1, s.alpha + Math.random() * 0.5 + 0.2);
          } else {
            s.idleFrames = Math.floor(Math.random() * 600 + 200);
          }
        }
      } else if (s.state === 'brightening') {
        s.cur += s.speed;
        if (s.cur >= s.peak) {
          s.cur = s.peak;
          s.state = 'fading';
        }
      } else if (s.state === 'fading') {
        s.cur -= s.speed * 0.7;
        if (s.cur <= s.alpha) {
          s.cur = s.alpha;
          s.state = 'idle';
          s.idleFrames = Math.floor(Math.random() * 800 + 300);
        }
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 210, 255, ${s.cur})`;
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  resize();
  tick();
})();

/* ── Focus Mechanics ───────────────────────────────── */
const systems    = document.querySelectorAll('.star-system');
const dimmer     = document.getElementById('dimmer');
const detailPanel = document.getElementById('detailPanel');
const detailContent = document.getElementById('detailContent');
const detailClose = document.getElementById('detailClose');
const hint       = document.getElementById('hintLabel');
const observatory = document.getElementById('observatory');

const SYSTEM_DATA = {
  tech: {
    label: 'Технологии',
    trend: '↑ 42% за последний месяц',
    desc: 'Самая активная зона SPARK. Идеи в области ИИ-инструментов, децентрализованных протоколов и следующего поколения Web-инфраструктуры. Высокий риск — высокая доходность.',
    tags: ['AI Tools', 'DeFi', 'Infrastructure', 'Web3'],
    metrics: [
      { label: 'Активных идей', value: '1 247' },
      { label: 'Объём SPK за 24ч', value: '84 320' },
      { label: 'Средний ROI', value: '+61%' },
      { label: 'Новых сегодня', value: '38' },
    ]
  },
  eco: {
    label: 'Экология',
    trend: '↑ 18% за последний месяц',
    desc: 'Устойчивые технологии и проекты с положительным воздействием на окружающую среду. Стабильный рост и долгосрочные горизонты. Нишевые инвесторы, высокая лояльность.',
    tags: ['CleanEnergy', 'BioTech', 'AgriTech', 'Carbon'],
    metrics: [
      { label: 'Активных идей', value: '389' },
      { label: 'Объём SPK за 24ч', value: '21 500' },
      { label: 'Средний ROI', value: '+29%' },
      { label: 'Новых сегодня', value: '11' },
    ]
  },
  social: {
    label: 'Социум',
    trend: '↑ 31% за последний месяц',
    desc: 'Социальные платформы, B2B SaaS и проекты экономики доверия. Умеренный риск, предсказуемые метрики роста. Идеальная точка входа для консервативных инвесторов.',
    tags: ['B2B SaaS', 'Marketplace', 'DAO', 'EdTech'],
    metrics: [
      { label: 'Активных идей', value: '742' },
      { label: 'Объём SPK за 24ч', value: '52 180' },
      { label: 'Средний ROI', value: '+44%' },
      { label: 'Новых сегодня', value: '24' },
    ]
  }
};

let focusedSystem = null;
let hintTimeout = null;

function openSystem(el) {
  const key = el.dataset.system;
  if (!key || focusedSystem === el) return;

  focusedSystem = el;

  // Compute offset from system center to viewport center
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const vx = window.innerWidth / 2;
  const vy = window.innerHeight / 2;
  const dx = (vx - cx) / 1.45;  // compensate for scale(1.45)
  const dy = (vy - cy) / 1.45;

  const isMobile = window.innerWidth <= 600;
  const scaleFactor = isMobile ? 1.25 : 1.45;
  el.style.setProperty('--focus-tx',   `${(vx - cx) / scaleFactor}px`);
  el.style.setProperty('--focus-ty',   `${(vy - cy) / scaleFactor}px`);
  el.style.setProperty('--focus-tx-m', `${(vx - cx) / scaleFactor}px`);
  el.style.setProperty('--focus-ty-m', `${(vy - cy) / scaleFactor}px`);

  // Apply classes
  systems.forEach(s => {
    if (s === el) {
      s.classList.add('focused');
      s.classList.remove('dimmed');
    } else {
      s.classList.add('dimmed');
      s.classList.remove('focused');
    }
  });

  dimmer.classList.add('active');
  hint.classList.add('hidden');

  // Show detail panel
  renderDetail(key);
  detailPanel.classList.add('open');
}

function closeSystem() {
  if (!focusedSystem) return;

  focusedSystem.classList.remove('focused');
  systems.forEach(s => {
    s.classList.remove('dimmed');
    s.classList.remove('focused');
    s.style.removeProperty('--focus-tx');
    s.style.removeProperty('--focus-ty');
    s.style.removeProperty('--focus-tx-m');
    s.style.removeProperty('--focus-ty-m');
  });

  dimmer.classList.remove('active');
  detailPanel.classList.remove('open');
  focusedSystem = null;

  // Re-show hint after delay
  clearTimeout(hintTimeout);
  hintTimeout = setTimeout(() => hint.classList.remove('hidden'), 2500);
}

function renderDetail(key) {
  const d = SYSTEM_DATA[key];
  if (!d) return;

  const tagsHTML = d.tags.map(t => `<span class="detail-tag">${t}</span>`).join('');
  const metricsHTML = d.metrics.map(m =>
    `<div class="detail-metric"><span>${m.label}</span><span>${m.value}</span></div>`
  ).join('');

  detailContent.innerHTML = `
    <h2>${d.label}</h2>
    <div class="detail-trend">${d.trend}</div>
    <p class="detail-desc">${d.desc}</p>
    <div class="detail-tags">${tagsHTML}</div>
    ${metricsHTML}
  `;
}

// Event listeners
systems.forEach(sys => {
  sys.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sys.classList.contains('focused')) {
      closeSystem();
    } else {
      openSystem(sys);
    }
  });
});

dimmer.addEventListener('click', closeSystem);
detailClose.addEventListener('click', closeSystem);

// ESC key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSystem();
});

// Hide hint on first interaction
setTimeout(() => {
  hint.style.transition = 'opacity 1s';
}, 3000);

/* ── Planet positioning fix ────────────────────────── */
// CSS counter-rotation approach: planet is at top of orbit ring
// We position it using translate to radius, letting orbit ring rotate.
// Override planet transform to just sit at the top of each orbit.
document.querySelectorAll('.orbit').forEach(orbitEl => {
  const planet = orbitEl.querySelector('.planet');
  if (!planet) return;

  // Get orbit radius from computed size
  // Planet angle is a visual offset baked into CSS var,
  // we apply it as initial rotation delay via inline style.
  const angleStr = planet.style.getPropertyValue('--planet-angle') || '0deg';
  const angleDeg = parseFloat(angleStr) || 0;

  // Convert angle to orbit animation delay offset
  // Full rotation = orbit-duration, angleDeg/360 * duration = time offset
  const durationStr = orbitEl.style.getPropertyValue('--orbit-duration') || '30s';
  const duration = parseFloat(durationStr) || 30;
  const delayStr = orbitEl.style.getPropertyValue('--orbit-delay') || '0s';
  const existingDelay = parseFloat(delayStr) || 0;
  const angleDelay = -(angleDeg / 360) * duration;

  orbitEl.style.animationDelay = `${existingDelay + angleDelay}s`;
  planet.style.setProperty('--planet-angle', '0deg');
});

/* ── Fix planet position at top of orbit ─────────── */
// Each planet sits at the topmost point of its orbit ring.
// The orbit ring rotates; planet is positioned at top center.
document.querySelectorAll('.planet').forEach(p => {
  p.style.transform = 'translateX(-50%) translateY(-50%)';
  p.style.top = '0';
  p.style.left = '50%';
});
