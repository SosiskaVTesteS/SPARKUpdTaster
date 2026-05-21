/**
 * SPARK — chats.js
 * ─────────────────────────────────────────────────────────────────
 * Модули:
 *  1. MOCK_DATA        — заглушки чатов и сообщений
 *  2. ChatPanelEngine  — открытие/закрытие всплывающей панели
 *  3. TabEngine        — переключение вкладок Личные/Групповые
 *  4. ScreenEngine     — навигация между экранами (список ↔ комната)
 *  5. RoomEngine       — отрисовка комнаты и отправка сообщений
 *  6. FabEngine        — анимация FAB
 *  7. InputEngine      — поведение поля ввода (placeholder, высота)
 *  8. Init             — точка входа
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. MOCK DATA
   ─────────────────────────────────────────────────────────────
   Структура chat:
     id, type ('direct'|'group'), name, avatarBg, avatarLabel,
     online (bool, только direct), unread (int), lastMsg, lastTime,
     messages: [{ id, from ('me'|'them'), text, time, status? }]
   ═══════════════════════════════════════════════════════════════ */

const MOCK_DATA = {
  chats: {
    1: {
      id: 1, type: 'direct',
      name: '@alex_ventures',
      avatarBg: 'linear-gradient(145deg,#f59e42 0%,#e8673a 100%)',
      avatarLabel: 'А',
      online: true,
      unread: 3,
      lastMsg: 'окей, жду тебя в обсерватории',
      lastTime: '14:37',
      messages: [
        { id: 1, from: 'them', text: 'Привет! Как идут дела с проектом?', time: '14:30' },
        { id: 2, from: 'me',   text: 'Почти готово, осталось только дописать модуль уведомлений.', time: '14:31', status: 'read' },
        { id: 3, from: 'them', text: 'Звучит хорошо. Когда можешь показать?', time: '14:33' },
        { id: 4, from: 'me',   text: 'Сегодня вечером, часов в 18-19. Тебе удобно?', time: '14:34', status: 'read' },
        { id: 5, from: 'them', text: 'Да, подходит. Встретимся в обсерватории.', time: '14:36' },
        { id: 6, from: 'them', text: 'окей, жду тебя в обсерватории', time: '14:37' },
      ]
    },
    2: {
      id: 2, type: 'direct',
      name: '@maria_builds',
      avatarBg: 'linear-gradient(145deg,#38d9a9 0%,#1a9c7e 100%)',
      avatarLabel: 'М',
      online: false,
      unread: 0,
      lastMsg: 'понял, до связи 👋',
      lastTime: 'вчера',
      messages: [
        { id: 1, from: 'me',   text: 'Макс, видел новый дизайн лендинга?', time: '10:15', status: 'read' },
        { id: 2, from: 'them', text: 'Да, глянул. Мне нравится, особенно анимации.', time: '10:18' },
        { id: 3, from: 'me',   text: 'Отлично. Тогда начинаем верстать завтра.', time: '10:20', status: 'read' },
        { id: 4, from: 'them', text: 'понял, до связи 👋', time: '10:21' },
      ]
    },
    3: {
      id: 3, type: 'direct',
      name: '@nova_dev',
      avatarBg: 'linear-gradient(145deg,#818cf8 0%,#4f46e5 100%)',
      avatarLabel: 'N',
      online: true,
      unread: 1,
      lastMsg: 'можешь глянуть мой проект?',
      lastTime: '11:02',
      messages: [
        { id: 1, from: 'them', text: 'Привет! Я тут делаю новый компонент для ленты.', time: '10:58' },
        { id: 2, from: 'me',   text: 'О, интересно. Что именно?', time: '11:00', status: 'sent' },
        { id: 3, from: 'them', text: 'можешь глянуть мой проект?', time: '11:02' },
      ]
    },
    4: {
      id: 4, type: 'group',
      name: 'SPARK Core Team',
      avatarBg: 'linear-gradient(145deg,#a78bfa 0%,#6d28d9 100%)',
      avatarLabel: null, // группа — иконка
      online: null,
      unread: 5,
      lastMsg: 'деплой прошёл успешно',
      lastTime: '09:15',
      messages: [
        { id: 1, from: 'them', fromName: 'Алина', fromBg: 'linear-gradient(135deg,#3b4a6b 0%,#1e2a45 100%)', fromLabel: 'АК', text: 'Всем привет! Сегодня деплоим v2.1.', time: '09:00' },
        { id: 2, from: 'them', fromName: 'Макс', fromBg: 'linear-gradient(135deg,#4a3b2a 0%,#2e2010 100%)', fromLabel: 'МО', text: 'Готов, тесты прошли. Можно начинать.', time: '09:05' },
        { id: 3, from: 'me',   text: 'Отлично. Запускаем!', time: '09:10', status: 'read' },
        { id: 4, from: 'them', fromName: 'Алина', fromBg: 'linear-gradient(135deg,#3b4a6b 0%,#1e2a45 100%)', fromLabel: 'АК', text: 'деплой прошёл успешно', time: '09:15' },
        { id: 5, from: 'them', fromName: 'Макс', fromBg: 'linear-gradient(135deg,#4a3b2a 0%,#2e2010 100%)', fromLabel: 'МО', text: '🎉', time: '09:15' },
      ]
    },
    5: {
      id: 5, type: 'group',
      name: 'Дизайн 2.0',
      avatarBg: 'linear-gradient(145deg,#fb923c 0%,#c2410c 100%)',
      avatarLabel: null,
      online: null,
      unread: 0,
      lastMsg: 'обновил макеты в фигме',
      lastTime: 'вчера',
      messages: [
        { id: 1, from: 'them', fromName: 'Макс', fromBg: 'linear-gradient(135deg,#4a3b2a 0%,#2e2010 100%)', fromLabel: 'МО', text: 'Запилил новые варианты карточек. Гляньте в Figma.', time: 'вчера' },
        { id: 2, from: 'me',   text: 'Видел, выглядит чисто. Мне нравится вариант B.', time: 'вчера', status: 'read' },
        { id: 3, from: 'them', fromName: 'Макс', fromBg: 'linear-gradient(135deg,#4a3b2a 0%,#2e2010 100%)', fromLabel: 'МО', text: 'обновил макеты в фигме', time: 'вчера' },
      ]
    },
  }
};

/* ═══════════════════════════════════════════════════════════════
   2. CHAT PANEL ENGINE
   Открытие/закрытие панели при клике на кнопку «Чаты» в bottombar.
   ═══════════════════════════════════════════════════════════════ */

const ChatPanelEngine = (() => {
  let panel, overlay, trigger;
  let isOpen = false;

  function open() {
    isOpen = true;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-visible');
    trigger.setAttribute('aria-expanded', 'true');
    // Блокируем скролл страницы
    document.body.style.overflow = 'hidden';
  }

  function close() {
    isOpen = false;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // Возвращаемся на список при закрытии панели
    ScreenEngine.showList(false);
  }

  function toggle() {
    isOpen ? close() : open();
  }

  function init() {
    panel   = document.getElementById('chatPanel');
    overlay = document.getElementById('panelOverlay');
    trigger = document.getElementById('chatsTrigger');

    if (!panel || !overlay || !trigger) return;

    trigger.addEventListener('click', toggle);
    overlay.addEventListener('click', close);

    // Закрытие по Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  return { init, close, open };
})();

/* ═══════════════════════════════════════════════════════════════
   3. TAB ENGINE
   Переключение вкладок «Личные» / «Групповые».
   ═══════════════════════════════════════════════════════════════ */

const TabEngine = (() => {
  function init() {
    const tabs    = document.querySelectorAll('.tabs__tab');
    const panels  = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        // Обновляем кнопки
        tabs.forEach(t => {
          t.classList.toggle('is-active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });

        // Обновляем панели
        panels.forEach(p => {
          const isTarget = p.id === `tab${capitalize(target)}`;
          p.classList.toggle('is-active', isTarget);
          if (isTarget) {
            p.removeAttribute('hidden');
          } else {
            p.setAttribute('hidden', '');
          }
        });
      });
    });
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════
   4. SCREEN ENGINE
   Навигация: список ↔ комната чата.
   ═══════════════════════════════════════════════════════════════ */

const ScreenEngine = (() => {
  let screenList, screenRoom;

  function showRoom(chatId) {
    RoomEngine.load(chatId);

    screenList.classList.add('slide-out');
    screenRoom.classList.add('slide-in');
    screenRoom.setAttribute('aria-hidden', 'false');

    // Фокус на кнопку «Назад» для доступности
    setTimeout(() => {
      document.getElementById('backBtn')?.focus();
    }, 300);
  }

  function showList(animate = true) {
    if (!animate) {
      // Мгновенный сброс без анимации (при закрытии панели)
      screenList.classList.remove('slide-out');
      screenRoom.classList.remove('slide-in');
      screenRoom.setAttribute('aria-hidden', 'true');
      return;
    }

    screenList.classList.remove('slide-out');
    screenRoom.classList.remove('slide-in');
    screenRoom.setAttribute('aria-hidden', 'true');

    // Фокус на последний активный элемент
    const lastItem = document.querySelector('.chat-item[data-last-active]');
    if (lastItem) {
      lastItem.removeAttribute('data-last-active');
      setTimeout(() => lastItem.focus(), 300);
    }
  }

  function init() {
    screenList = document.getElementById('screenList');
    screenRoom = document.getElementById('screenRoom');

    if (!screenList || !screenRoom) return;

    // Клик по элементу чата
    document.querySelectorAll('.chat-item').forEach(item => {
      item.addEventListener('click', () => {
        item.setAttribute('data-last-active', '');
        showRoom(+item.dataset.chatId);
      });

      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    });

    // Кнопка «Назад»
    document.getElementById('backBtn')?.addEventListener('click', () => {
      showList(true);
    });
  }

  return { init, showRoom, showList };
})();

/* ═══════════════════════════════════════════════════════════════
   5. ROOM ENGINE
   Отрисовка комнаты чата по данным из MOCK_DATA.
   Также управляет отправкой нового сообщения (mock).
   ═══════════════════════════════════════════════════════════════ */

const RoomEngine = (() => {
  let currentChatId = null;

  /* ── Статусы сообщений ─────────────────────────────────── */
  const STATUS_MAP = {
    sending: { symbol: '○', label: 'Отправляется' },
    sent:    { symbol: '✓',  label: 'Отправлено' },
    read:    { symbol: '✓✓', label: 'Прочитано' },
  };

  /* ── Создать DOM-элемент аватара ──────────────────────── */
  function makeAvatar(bg, label, isSvgGroup = false) {
    const el = document.createElement('div');
    el.className = 'msg__avatar';
    el.style.background = bg;

    if (isSvgGroup) {
      el.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>`;
    } else {
      el.textContent = label ?? '??';
    }

    return el;
  }

  /* ── Создать один пузырь сообщения ───────────────────── */
  function buildMessage(msg, chat) {
    const isMe = msg.from === 'me';
    const wrap = document.createElement('div');
    wrap.className = `msg ${isMe ? 'msg--me' : 'msg--them'}`;

    // Аватар
    let avatarEl;
    if (isMe) {
      avatarEl = makeAvatar('#1a1a25', 'ВЫ');
      avatarEl.classList.add('msg__avatar--me');
    } else {
      // В групповых чатах — индивидуальный аватар отправителя
      const bg    = msg.fromBg    ?? chat.avatarBg;
      const label = msg.fromLabel ?? chat.avatarLabel;
      avatarEl = makeAvatar(bg, label, chat.type === 'group' && !msg.fromLabel && !chat.avatarLabel);
    }

    // Пузырь
    const bubble = document.createElement('div');
    bubble.className = `msg__bubble${isMe ? ' msg__bubble--me' : ''}`;

    const text = document.createElement('p');
    text.className = 'msg__text';
    text.textContent = msg.text;

    const meta = document.createElement('div');
    meta.className = 'msg__meta';

    const time = document.createElement('span');
    time.className = 'msg__time';
    time.textContent = msg.time;
    meta.appendChild(time);

    if (isMe && msg.status) {
      const statusInfo = STATUS_MAP[msg.status];
      const status = document.createElement('span');
      status.className = 'msg__status';
      status.dataset.status = msg.status;
      status.textContent = statusInfo.symbol;
      status.setAttribute('aria-label', statusInfo.label);
      meta.appendChild(status);
    }

    bubble.appendChild(text);
    bubble.appendChild(meta);

    // Сборка: аватар всегда снаружи пузыря
    if (isMe) {
      wrap.appendChild(bubble);
      wrap.appendChild(avatarEl);
    } else {
      wrap.appendChild(avatarEl);
      wrap.appendChild(bubble);
    }

    return wrap;
  }

  /* ── Обновить шапку комнаты ───────────────────────────── */
  function updateHeader(chat) {
    const avatar = document.getElementById('roomAvatar');
    const name   = document.getElementById('roomName');
    const meta   = document.getElementById('roomMeta');
    const status = document.getElementById('roomStatus');

    avatar.style.background = chat.avatarBg;

    if (chat.type === 'group') {
      avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>`;
      avatar.style.borderRadius = '10px';
      status.className = 'room-header__status group';
      meta.textContent = 'Групповой чат';
      meta.className = 'room-header__meta';
    } else {
      avatar.textContent = chat.avatarLabel;
      avatar.style.borderRadius = '50%';
      if (chat.online) {
        status.className = 'room-header__status online';
        meta.textContent = 'В сети';
        meta.className = 'room-header__meta online';
      } else {
        status.className = 'room-header__status offline';
        meta.textContent = 'Не в сети';
        meta.className = 'room-header__meta';
      }
    }

    name.textContent = chat.name;
  }

  /* ── Отрисовать сообщения ─────────────────────────────── */
  function renderMessages(chat) {
    const area = document.getElementById('messagesArea');
    area.innerHTML = '';

    // Разделитель даты
    const divider = document.createElement('div');
    divider.className = 'msg-date-divider';
    divider.textContent = 'Сегодня';
    area.appendChild(divider);

    chat.messages.forEach(msg => {
      area.appendChild(buildMessage(msg, chat));
    });

    // Прокрутить вниз
    requestAnimationFrame(() => {
      area.scrollTop = area.scrollHeight;
    });
  }

  /* ── Загрузить чат ────────────────────────────────────── */
  function load(chatId) {
    const chat = MOCK_DATA.chats[chatId];
    if (!chat) return;

    currentChatId = chatId;

    // Сбросить счётчик непрочитанных в списке
    clearUnread(chatId);

    updateHeader(chat);
    renderMessages(chat);

    // Сфокусировать поле ввода
    setTimeout(() => {
      document.getElementById('msgInput')?.focus();
    }, 320);
  }

  /* ── Очистить бейдж непрочитанных ────────────────────── */
  function clearUnread(chatId) {
    const item = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
    const badge = item?.querySelector('.chat-item__badge');
    if (badge) badge.remove();
    if (MOCK_DATA.chats[chatId]) MOCK_DATA.chats[chatId].unread = 0;
  }

  /* ── Отправить новое сообщение (mock) ────────────────── */
  function sendMessage(text) {
    if (!currentChatId || !text.trim()) return;

    const chat = MOCK_DATA.chats[currentChatId];
    if (!chat) return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

    const newMsg = {
      id: Date.now(),
      from: 'me',
      text: text.trim(),
      time,
      status: 'sending',
    };

    chat.messages.push(newMsg);

    const area = document.getElementById('messagesArea');
    const msgEl = buildMessage(newMsg, chat);
    area.appendChild(msgEl);

    // Скролл вниз
    requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });

    // Симуляция: через 800ms → "отправлено"
    setTimeout(() => {
      newMsg.status = 'sent';
      const statusEl = msgEl.querySelector('.msg__status');
      if (statusEl) {
        statusEl.dataset.status = 'sent';
        statusEl.textContent = STATUS_MAP.sent.symbol;
        statusEl.setAttribute('aria-label', STATUS_MAP.sent.label);
      }
    }, 800);

    // Симуляция: через 2.5s → "прочитано"
    setTimeout(() => {
      newMsg.status = 'read';
      const statusEl = msgEl.querySelector('.msg__status');
      if (statusEl) {
        statusEl.dataset.status = 'read';
        statusEl.textContent = STATUS_MAP.read.symbol;
        statusEl.setAttribute('aria-label', STATUS_MAP.read.label);
      }
    }, 2500);
  }

  function getCurrentChatId() { return currentChatId; }

  return { init: () => {}, load, sendMessage, getCurrentChatId };
})();

/* ═══════════════════════════════════════════════════════════════
   6. FAB ENGINE
   Анимация ripple при нажатии. Логика создания чата — позже.
   ═══════════════════════════════════════════════════════════════ */

const FabEngine = (() => {
  function init() {
    const fab = document.getElementById('fabBtn');
    if (!fab) return;

    fab.addEventListener('click', () => {
      // ripple-анимация
      fab.classList.remove('ripple');
      void fab.offsetWidth; // reflow для перезапуска анимации
      fab.classList.add('ripple');

      // TODO: открыть модальное окно создания чата
      console.log('[SPARK] FAB clicked — create chat modal (TODO)');
    });

    fab.addEventListener('animationend', () => {
      fab.classList.remove('ripple');
    });
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════
   7. INPUT ENGINE
   • Скрывает/показывает анимированный placeholder
   • Авто-высота textarea
   • Активирует кнопку отправки
   • Отправка по Enter (Shift+Enter — перенос строки)
   ═══════════════════════════════════════════════════════════════ */

const InputEngine = (() => {
  let input, placeholder, sendBtn;

  function updateState() {
    const hasText = input.value.length > 0;

    // placeholder
    placeholder.classList.toggle('is-hidden', hasText);

    // кнопка отправки
    sendBtn.classList.toggle('is-active', hasText);
    sendBtn.disabled = !hasText;

    // авто-высота textarea (до 4 строк)
    input.style.height = 'auto';
    const maxH = parseInt(getComputedStyle(input).lineHeight, 10) * 4;
    input.style.height = Math.min(input.scrollHeight, maxH) + 'px';
  }

  function sendCurrent() {
    const text = input.value;
    if (!text.trim()) return;

    RoomEngine.sendMessage(text);

    input.value = '';
    input.style.height = '';
    updateState();
    input.focus();
  }

  function init() {
    input       = document.getElementById('msgInput');
    placeholder = document.getElementById('inputPlaceholder');
    sendBtn     = document.getElementById('sendBtn');

    if (!input || !placeholder || !sendBtn) return;

    input.addEventListener('input', updateState);
    input.addEventListener('focus', updateState);
    input.addEventListener('blur',  updateState);

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendCurrent();
      }
    });

    sendBtn.addEventListener('click', sendCurrent);
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════
   8. INIT — точка входа
   ═══════════════════════════════════════════════════════════════ */

function init() {
  ChatPanelEngine.init();
  TabEngine.init();
  ScreenEngine.init();
  FabEngine.init();
  InputEngine.init();
  // RoomEngine не требует отдельного init — загружается при открытии чата
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
