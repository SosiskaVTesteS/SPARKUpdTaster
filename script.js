/* ═══════════════════════════════════════════════════════
   SPARK Observatory — script.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── 1. STARFIELD ─────────────────────────────────── */
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [], W = 0, H = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = [];
    const n = Math.floor(W * H / 2600);
    for (let i = 0; i < n; i++) {
      const alpha = Math.random() * 0.45 + 0.08;
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.1 + 0.15,
        alpha, cur: alpha,
        state: 'idle',
        idle: Math.floor(Math.random() * 900 + 250),
        spd:  Math.random() * 0.013 + 0.004,
        peak: 0,
      });
    }
  }

  function tick() {
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
