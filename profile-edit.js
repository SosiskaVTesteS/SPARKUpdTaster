/* ══════════════════════════════════════════════════════════
   SPARK — profile-edit.js
   Модули:
     1. AvatarPreview  — предпросмотр аватара по URL
     2. CharCounters   — счётчики символов для инпутов
     3. LiveSync       — синхронизация никнейма под аватаром
     4. Validation     — валидация формы при сабмите
     5. FormSubmit     — имитация сохранения + сброс ошибок
   ══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────
   Утилиты
────────────────────────────────────────────────────────*/
const $ = (id) => document.getElementById(id);
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ──────────────────────────────────────────────────────
   Элементы DOM
────────────────────────────────────────────────────────*/
const form            = $('profileForm');
const inputAvatar     = $('inputAvatar');
const inputUsername   = $('inputUsername');
const inputBio        = $('inputBio');
const avatarPreview   = $('avatarPreview');
const avatarImg       = $('avatarImg');
const usernameDisplay = $('usernameDisplay');
const usernameCount   = $('usernameCount');
const bioCount        = $('bioCount');
const saveBtn         = $('saveBtn');

/* Сообщения об ошибках */
const errUsername = $('err-username');
const errBio      = $('err-bio');

/* Конфигурация валидируемых полей */
const FIELDS = [
  {
    input:    inputUsername,
    errorEl:  errUsername,
    message:  'поле терминала, обязательное для заполнения',
    minLen:   2,
    maxLen:   32,
  },
  {
    input:    inputBio,
    errorEl:  errBio,
    message:  'поле терминала, обязательное для заполнения',
    minLen:   3,
    maxLen:   280,
  },
];

/* ──────────────────────────────────────────────────────
   1. AVATAR PREVIEW
   Обновляем изображение аватара по введённому URL.
   Дебаунс 500мс — не дёргаем сеть при каждом символе.
────────────────────────────────────────────────────────*/
let avatarDebounce = null;

inputAvatar.addEventListener('input', () => {
  clearTimeout(avatarDebounce);
  avatarDebounce = setTimeout(updateAvatar, 500);
});

function updateAvatar() {
  const url = inputAvatar.value.trim();

  if (!url) {
    /* Возвращаем SVG-заглушку */
    avatarImg.style.display = 'none';
    avatarImg.src = '';
    return;
  }

  /* Пробуем загрузить изображение */
  const testImg = new Image();

  testImg.onload = () => {
    avatarImg.src = url;
    avatarImg.style.display = 'block';
  };

  testImg.onerror = () => {
    /* URL не работает — тихо возвращаем заглушку */
    avatarImg.style.display = 'none';
    avatarImg.src = '';
  };

  testImg.src = url;
}

/* ──────────────────────────────────────────────────────
   2. CHAR COUNTERS
   Счётчики символов для никнейма и bio.
────────────────────────────────────────────────────────*/
function updateCounter(input, counterEl, max) {
  const len = input.value.length;
  counterEl.textContent = `${len}/${max}`;

  /* Меняем цвет при приближении к лимиту */
  counterEl.style.color = len >= max * 0.9
    ? 'var(--red)'
    : len >= max * 0.75
      ? 'var(--gold)'
      : 'var(--text-dim)';
}

inputUsername.addEventListener('input', () => {
  updateCounter(inputUsername, usernameCount, 32);
});

inputBio.addEventListener('input', () => {
  updateCounter(inputBio, bioCount, 280);
});

/* ──────────────────────────────────────────────────────
   3. LIVE SYNC — никнейм под аватаром
   Обновляем в реальном времени при вводе.
────────────────────────────────────────────────────────*/
inputUsername.addEventListener('input', () => {
  const val = inputUsername.value.trim();
  usernameDisplay.textContent = val || 'искатель_001';
});

/* ──────────────────────────────────────────────────────
   4. VALIDATION
────────────────────────────────────────────────────────*/

/**
 * Показывает ошибку для поля.
 * @param {HTMLElement} input   — элемент инпута / textarea
 * @param {HTMLElement} errorEl — элемент сообщения об ошибке
 * @param {string}      message — текст ошибки
 */
function showError(input, errorEl, message) {
  input.classList.add('is-error');
  input.classList.remove('is-valid');
  errorEl.textContent = `⚠ ${message}`;
  errorEl.classList.add('is-visible');
}

/**
 * Убирает ошибку с поля.
 */
function clearError(input, errorEl) {
  input.classList.remove('is-error');
  errorEl.textContent = '';
  errorEl.classList.remove('is-visible');
}

/**
 * Помечает поле как успешно заполненное.
 */
function markValid(input) {
  input.classList.add('is-valid');
  input.classList.remove('is-error');
}

/**
 * Валидирует одно поле.
 * @returns {boolean} true — поле валидно
 */
function validateField({ input, errorEl, message, minLen }) {
  const val = input.value.trim();

  if (!val || val.length < (minLen || 1)) {
    showError(input, errorEl, message);
    return false;
  }

  clearError(input, errorEl);
  markValid(input);
  return true;
}

/**
 * Валидирует все обязательные поля.
 * @returns {boolean} true — вся форма валидна
 */
function validateAll() {
  let isValid = true;
  let firstInvalid = null;

  FIELDS.forEach(field => {
    const ok = validateField(field);
    if (!ok) {
      isValid = false;
      if (!firstInvalid) firstInvalid = field.input;
    }
  });

  /* Фокус на первом невалидном поле для удобства */
  if (firstInvalid) {
    firstInvalid.focus();
  }

  return isValid;
}

/* Сброс ошибки при изменении поля (inline validation) */
FIELDS.forEach(({ input, errorEl }) => {
  input.addEventListener('input', () => {
    if (input.classList.contains('is-error')) {
      clearError(input, errorEl);
    }
  });
});

/* ──────────────────────────────────────────────────────
   5. FORM SUBMIT — имитация сохранения
────────────────────────────────────────────────────────*/
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  /* Валидация */
  if (!validateAll()) return;

  /* Состояние загрузки */
  setBtnState('loading');

  /* Имитируем сетевой запрос */
  await delay(900);

  /* Собираем данные профиля */
  const profileData = {
    avatar:    inputAvatar.value.trim()   || null,
    username:  inputUsername.value.trim(),
    bio:       inputBio.value.trim(),
    updatedAt: new Date().toISOString(),
    uid:       '0x4F2A',   // в реальном проекте — из сессии
  };

  /* ── Имитация успешного сохранения ── */
  console.group('%c✦ SPARK :: Profile Updated', 'color: #5af7c2; font-weight: bold;');
  console.log('%cПрофиль успешно обновлён', 'color: #a88f62;');
  console.table(profileData);
  console.groupEnd();

  /* Состояние успеха */
  setBtnState('success');

  /* Сброс состояния через 2.5 с */
  setTimeout(() => setBtnState('default'), 2500);

  /* Сброс всех визуальных ошибок (если ещё есть) */
  FIELDS.forEach(({ input, errorEl }) => clearError(input, errorEl));
});

/* ──────────────────────────────────────────────────────
   Утилиты кнопки
────────────────────────────────────────────────────────*/
const BTN_LABELS = {
  default: 'Сохранить конфигурацию',
  loading: 'Сохранение',
  success: 'Конфигурация обновлена',
};

function setBtnState(state) {
  const textEl = saveBtn.querySelector('.btn-save__text');
  const iconEl = saveBtn.querySelector('.btn-save__icon');

  /* Сброс классов */
  saveBtn.classList.remove('is-loading', 'is-success');

  if (state === 'loading') {
    saveBtn.classList.add('is-loading');
    textEl.textContent = BTN_LABELS.loading;
    iconEl.innerHTML = spinnerSVG();
  } else if (state === 'success') {
    saveBtn.classList.add('is-success');
    textEl.textContent = BTN_LABELS.success;
    iconEl.innerHTML = checkSVG();
  } else {
    textEl.textContent = BTN_LABELS.default;
    iconEl.innerHTML = arrowSVG();
  }
}

/* SVG-иконки */
function spinnerSVG() {
  return `<svg viewBox="0 0 20 20" fill="none" width="15" height="15" style="animation: spin 0.7s linear infinite">
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
      stroke-dasharray="30" stroke-dashoffset="15"/>
  </svg>`;
}

function checkSVG() {
  return `<svg viewBox="0 0 20 20" fill="none" width="15" height="15">
    <path d="M4 10l5 5 7-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function arrowSVG() {
  return `<svg viewBox="0 0 20 20" fill="none" width="15" height="15">
    <path d="M4 10l5 5 7-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/* Промис-задержка */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ──────────────────────────────────────────────────────
   INIT — инициализация счётчиков при старте
────────────────────────────────────────────────────────*/
(function init() {
  updateCounter(inputUsername, usernameCount, 32);
  updateCounter(inputBio, bioCount, 280);
})();
