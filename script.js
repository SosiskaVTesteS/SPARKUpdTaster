/* =====================================================
   SPARK Observatory — script.js
   Starfield, twinkling, focus mechanics, detail panel
   ===================================================== */

/* ── Starfield Canvas ──────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');

  let stars = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = [];
    const count = Math.floor((W * H) / 2800);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.15,
        // base opacity
        alpha: Math.random() * 0.55 + 0.1,
        // current rendered opacity
        cur: 0,
        // twinkle state: 'idle' | 'fading' | 'brightening'
        state: 'idle',
        // countdown until next twinkle (frames)
        idleFrames: Math.floor(Math.random() * 800 + 200),
        // twinkle speed
        speed: Math.random() * 0.012 + 0.004,
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
