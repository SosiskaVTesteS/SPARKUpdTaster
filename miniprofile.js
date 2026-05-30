/**
 * SPARK — miniprofile.js
 * ─────────────────────────────────────────────────────────────
 * Модули:
 *  1. MOCK_USERS     — заглушки пользователей (заменить на API)
 *  2. MiniProfile    — открытие / закрытие / заполнение карточки
 *  3. Init           — точка входа
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. MOCK USERS
   ─────────────────────────────────────────────────────────
   В продакшне заменить на fetch('/api/users/:id')
   Поля:
     id, name, handle, online (bool),
     rank: 'seed' | 'angel' | 'venture',
     rankIcon, rankLabel,
     ideas (int), invested (string), rankNum (string),
     avatarLabel (string), theme: 'violet' | 'teal' | 'pink'
   ═══════════════════════════════════════════════════════════ */

const MOCK_USERS = {
  1: {
    id:          1,
    name:        'Alex Kravtsov',
    handle:      '@alex_ventures',
    online:      true,
    rank:        'venture',
    rankIcon:    '⚡',
    rankLabel:   'Venture',
    ideas:       24,
    invested:    '12.4k',
    rankNum:     '#7',
    avatarLabel: 'АК',
    theme:       'violet',
  },
  2: {
    id:          2,
    name:        'Maria Orlova',
    handle:      '@maria_builds',
    online:      false,
    rank:        'seed',
    rankIcon:    '🌱',
    rankLabel:   'Seed',
    ideas:       3,
    invested:    '840',
    rankNum:     '#204',
    avatarLabel: 'МО',
    theme:       'teal',
  },
  3: {
    id:          3,
    name:        'Nova Dev',
    handle:      '@nova_dev',
    online:      true,
    rank:        'angel',
    rankIcon:    '✦',
    rankLabel:   'Angel',
    ideas:       11,
    invested:    '5.2k',
    rankNum:     '#38',
    avatarLabel: 'NV',
    theme:       'pink',
  },
};

/* ═══════════════════════════════════════════════════════════
   2. MINI PROFILE ENGINE
   ═══════════════════════════════════════════════════════════ */

const MiniProfile = (() => {

  /* ── DOM-ссылки ─────────────────────────────────────── */
  let portal, overlay, card, closeBtn;
  let elAvatar, elStatusDot, elName, elHandle;
  let elStatusBadge, elStatusDot2, elStatusLabel;
  let elRankBadge, elRankIcon, elRankLabel;
  let elStatIdeas, elStatInvested, elStatRank;
  let elBtnMessage, elBtnProfile, elNebula;

  let isOpen       = false;
  let currentUser  = null;
  let triggerEl    = null; // элемент, который открыл карточку (для возврата фокуса)

  /* ── Получить данные пользователя ───────────────────── */
  async function fetchUser(userId) {
    // Сейчас — mock. В продакшне:
    // const res = await fetch(`/api/users/${userId}`);
    // return await res.json();
    return MOCK_USERS[userId] ?? null;
  }

  /* ── Заполнить карточку данными ─────────────────────── */
  function populate(user) {
    /* Аватарка */
    elAvatar.textContent = user.avatarLabel;

    /* Тема карточки (цвет рамки, туманности, кнопок) */
    card.dataset.theme = user.theme;

    /* Статус-точка на аватарке */
    elStatusDot.className = `mp-card__status-dot ${user.online ? 'online' : 'offline'}`;

    /* Имя и хендл */
    elName.textContent   = user.name;
    elHandle.textContent = user.handle;

    /* Статус-бейдж */
    elStatusBadge.className = `mp-badge mp-badge--status ${user.online ? 'online' : 'offline'}`;
    elStatusLabel.textContent = user.online ? 'В сети' : 'Офлайн';

    /* Ранг-бейдж */
    elRankBadge.className = `mp-badge mp-badge--rank ${user.rank}`;
    elRankIcon.textContent  = user.rankIcon;
    elRankLabel.textContent = user.rankLabel;

    /* Статистика */
    elStatIdeas.textContent    = user.ideas;
    elStatInvested.textContent = user.invested;
    elStatRank.textContent     = user.rankNum;

    /* Кнопки — добавляем data-user-id для обработчиков */
    elBtnMessage.dataset.userId = user.id;
    elBtnProfile.dataset.userId = user.id;
  }

  /* ── Открыть карточку ───────────────────────────────── */
  async function open(userId, triggerButton) {
    if (isOpen) await close(false); // если уже открыта — сначала закрыть

    triggerEl = triggerButton ?? null;

    const user = await fetchUser(userId);
    if (!user) {
      console.warn(`[MiniProfile] User ${userId} not found`);
      return;
    }

    currentUser = user;
    populate(user);

    /* Показываем портал */
    portal.setAttribute('aria-hidden', 'false');
    portal.classList.add('is-open');
    isOpen = true;

    /* Блокируем скролл страницы */
    document.body.style.overflow = 'hidden';

    /* Фокус на кнопку закрытия (доступность) */
    setTimeout(() => closeBtn.focus(), 320);
  }

  /* ── Закрыть карточку ───────────────────────────────── */
  function close(restoreFocus = true) {
    if (!isOpen) return;

    portal.classList.remove('is-open');
    portal.setAttribute('aria-hidden', 'true');
    isOpen      = false;
    currentUser = null;

    /* Восстановить скролл */
    document.body.style.overflow = '';

    /* Вернуть фокус на триггер */
    if (restoreFocus && triggerEl) {
      setTimeout(() => triggerEl.focus(), 280);
      triggerEl = null;
    }
  }

  /* ── Обработчики кнопок внутри карточки ────────────── */
  function onMessageClick() {
    const userId = +elBtnMessage.dataset.userId;
    console.log(`[MiniProfile] → Написать пользователю ID:${userId}`);
    // TODO: открыть чат с пользователем
    // ChatEngine.openDirect(userId);
    close();
  }

  function onProfileClick() {
    const userId = +elBtnProfile.dataset.userId;
    console.log(`[MiniProfile] → Открыть профиль ID:${userId}`);
    // TODO: перейти на страницу профиля
    // window.location.href = `/profile/${userId}`;
    close();
  }

  /* ── Инициализация ──────────────────────────────────── */
  function init() {
    /* Получаем DOM-элементы */
    portal        = document.getElementById('miniProfilePortal');
    overlay       = document.getElementById('mpOverlay');
    card          = document.getElementById('mpCard');
    closeBtn      = document.getElementById('mpClose');
    elNebula      = document.getElementById('mpNebula');

    elAvatar      = document.getElementById('mpAvatar');
    elStatusDot   = document.querySelector('.mp-card__status-dot');
    elName        = document.getElementById('mpUserName');
    elHandle      = document.getElementById('mpHandle');

    elStatusBadge = document.getElementById('mpStatusBadge');
    elStatusDot2  = elStatusBadge?.querySelector('.mp-badge__dot');
    elStatusLabel = document.getElementById('mpStatusLabel');

    elRankBadge   = document.getElementById('mpRankBadge');
    elRankIcon    = document.getElementById('mpRankIcon');
    elRankLabel   = document.getElementById('mpRankLabel');

    elStatIdeas    = document.getElementById('mpStatIdeas');
    elStatInvested = document.getElementById('mpStatInvested');
    elStatRank     = document.getElementById('mpStatRank');

    elBtnMessage  = document.getElementById('mpBtnMessage');
    elBtnProfile  = document.getElementById('mpBtnProfile');

    if (!portal) {
      console.warn('[MiniProfile] #miniProfilePortal not found');
      return;
    }

    /* Закрытие через overlay */
    overlay.addEventListener('click', () => close());

    /* Закрытие через кнопку × */
    closeBtn.addEventListener('click', () => close());

    /* Закрытие через Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) close();
    });

    /* Кнопки действий */
    elBtnMessage.addEventListener('click', onMessageClick);
    elBtnProfile.addEventListener('click', onProfileClick);

    /* Фокус-trap: Tab внутри карточки */
    card.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;

      const focusable = card.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* Подписываемся на все триггеры в документе */
    bindTriggers();

    /* MutationObserver — подхватывает новые триггеры (динамический контент) */
    const observer = new MutationObserver(() => bindTriggers());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ── Привязать обработчики ко всем .mp-trigger ──────── */
  function bindTriggers() {
    document.querySelectorAll('.mp-trigger:not([data-mp-bound])').forEach(btn => {
      btn.setAttribute('data-mp-bound', '');

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const userId = +btn.dataset.userId;
        if (!userId) return;
        open(userId, btn);
      });

      /* Клавиатурная доступность */
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  /* ── Публичный API ──────────────────────────────────── */
  return { init, open, close };

})();


/* ═══════════════════════════════════════════════════════════
   3. INIT
   ═══════════════════════════════════════════════════════════ */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MiniProfile.init());
} else {
  MiniProfile.init();
}
