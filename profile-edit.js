/* ══════════════════════════════════════════════════════════
   SPARK — profile-edit.js  (v2)
   Обязательные поля: только никнейм. Bio — необязательно.
   ══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────
   Утилиты
────────────────────────────────────────────────────────*/
const $ = (id) => document.getElementById(id);

/* ──────────────────────────────────────────────────────
   Элементы DOM
────────────────────────────────────────────────────────*/
const form            = $('profileForm');
const inputAvatar     = $('inputAvatar');
const inputUsername   = $('inputUsername');
const inputBio        = $('inputBio');
const avatarImg       = $('avatarImg');
const usernameDisplay = $('usernameDisplay');
const usernameCount   = $('usernameCount');
const bioCount        = $('bioCount');
const saveBtn         = $('saveBtn');
const errUsername     = $('err-username');

/* ──────────────────────────────────────────────────────
   Конфигурация обязательных полей
   Bio убран из списка — теперь необязательное.
────────────────────────────────────────────────────────*/
const REQUIRED_FIELDS = [
  {
    input:   inputUsername,
    errorEl: errUsername,
    message: 'поле терминала, обязательное для заполнения',
    minLen:  2,
    maxLen:  32,
  },
];

/* ──────────────────────────────────────────────────────
   1. AVATAR PREVIEW — дебаунс 500мс
────────────────────────────────────────────────────────*/
let avatarDebounce = null;

inputAvatar.addEventListener('input', () => {
  clearTimeout(avatarDebounce);
  avatarDebounce = setTimeout(updateAvatar, 500);
});

function updateAvatar() {
  const url = inputAvatar.value.trim();

  if (!url) {
    avatarImg.style.display = 'none';
    avatarImg.src = '';
    return;
  }

  const testImg = new Image();
  testImg.onload  = () => { avatarImg.src = url; avatarImg.style.display = 'block'; };
  testImg.onerror = () => { avatarImg.style.display = 'none'; avatarImg.src = ''; };
  testImg.src = url;
}

/* ──────────────────────────────────────────────────────
   2. CHAR COUNTERS
────────────────────────────────────────────────────────*/
function updateCounter(input, counterEl, max) {
  const len = input.value.length;
  counterEl.textContent = `${len}/${max}`;
  counterEl.style.color =
    len >= max * 0.9 ? 'var(--red)'  :
    len >= max * 0.75 ? 'var(--gold)' :
    'var(--text-dim)';
}

inputUsername.addEventListener('input', () => updateCounter(inputUsername, usernameCount, 32));
inputBio.addEventListener('input',      () => updateCounter(inputBio, bioCount, 280));

/* ──────────────────────────────────────────────────────
   3. LIVE SYNC — никнейм под аватаром
────────────────────────────────────────────────────────*/
inputUsername.addEventListener('input', () => {
  usernameDisplay.textContent = inputUsername.value.trim() || 'искатель_001';
});

/* ──────────────────────────────────────────────────────
   4. VALIDATION
────────────────────────────────────────────────────────*/
function showError(input, errorEl, message) {
  input.classList.add('is-error');
  input.classList.remove('is-valid');
  errorEl.textContent = `⚠ ${message}`;
  errorEl.classList.add('is-visible');
}

function clearError(input, errorEl) {
  input.classList.remove('is-error');
  errorEl.textContent = '';
  errorEl.classList.remove('is-visible');
}

function markValid(input) {
  input.classList.add('is-valid');
  input.classList.remove('is-error');
}

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

function validateAll() {
  let isValid = true;
  let firstInvalid = null;

  REQUIRED_FIELDS.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
      if (!firstInvalid) firstInvalid = field.input;
    }
  });

  if (firstInvalid) firstInvalid.focus();
  return isValid;
}

/* Сброс ошибки при наборе */
REQUIRED_FIELDS.forEach(({ input, errorEl }) => {
  input.addEventListener('input', () => {
    if (input.classList.contains('is-error')) clearError(input, errorEl);
  });
});

/* ──────────────────────────────────────────────────────
   5. FORM SUBMIT
────────────────────────────────────────────────────────*/
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateAll()) return;

  setBtnState('loading');
  await delay(900);

  const profileData = {
    avatar:    inputAvatar.value.trim()   || null,
    username:  inputUsername.value.trim(),
    bio:       inputBio.value.trim()      || null,
    updatedAt: new Date().toISOString(),
  };

  console.group('%c✦ SPARK :: Profile Updated', 'color: #5af7c2; font-weight: bold;');
  console.log('%cПрофиль успешно обновлён', 'color: #EFBF04;');
  console.table(profileData);
  console.groupEnd();

  setBtnState('success');
  setTimeout(() => setBtnState('default'), 2500);

  REQUIRED_FIELDS.forEach(({ input, errorEl }) => clearError(input, errorEl));
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

  saveBtn.classList.remove('is-loading', 'is-success');

  if (state === 'loading') {
    saveBtn.classList.add('is-loading');
    textEl.textContent = BTN_LABELS.loading;
    iconEl.innerHTML   = spinnerSVG();
  } else if (state === 'success') {
    saveBtn.classList.add('is-success');
    textEl.textContent = BTN_LABELS.success;
    iconEl.innerHTML   = checkSVG();
  } else {
    textEl.textContent = BTN_LABELS.default;
    iconEl.innerHTML   = checkSVG();
  }
}

function spinnerSVG() {
  return `<svg viewBox="0 0 20 20" fill="none" width="15" height="15"
    style="animation:spin 0.7s linear infinite">
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-dasharray="30" stroke-dashoffset="15"/>
  </svg>`;
}

function checkSVG() {
  return `<svg viewBox="0 0 20 20" fill="none" width="15" height="15">
    <path d="M4 10l5 5 7-8" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

/* ──────────────────────────────────────────────────────
   INIT
────────────────────────────────────────────────────────*/
(function init() {
  updateCounter(inputUsername, usernameCount, 32);
  updateCounter(inputBio, bioCount, 280);
})();
