/*
 * form.js — форма заявки на contacts.html (ТЗ, раздел 6.3).
 * Проверяет поля, заполняет скрытые поля (request_id и UTM-метки),
 * отправляет заявку в Apps Script через fetch без перезагрузки страницы.
 */
(function () {
  'use strict';

  // Адрес веб-приложения Apps Script (Развернуть → Веб-приложение → URL)
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/ВСТАВЬТЕ_ID_РАЗВЁРТЫВАНИЯ/exec';

  var form = document.getElementById('lead-form');
  if (!form) return;

  var submitBtn = document.getElementById('submit-btn');
  var statusBox = document.getElementById('form-status');
  var COURSES = ['python', 'web', 'gamedev', 'ai', 'winter_camp'];
  var AGES = ['12_13', '14_15', '16_17'];
  var UTM_DEFAULTS = { utm_source: 'direct', utm_medium: 'none', utm_campaign: 'not_set', utm_content: 'not_set' };

  // Уникальный номер заявки: REQ- + UUID
  function makeRequestId() {
    if (window.crypto && crypto.randomUUID) return 'REQ-' + crypto.randomUUID();
    return 'REQ-' + Date.now().toString(16) + '-' + Math.random().toString(16).slice(2, 10);
  }

  // UTM-метки: сначала из адреса этой страницы, затем из sessionStorage, иначе значения по умолчанию
  function readUtm() {
    var query = new URLSearchParams(window.location.search);
    var utm = {};
    Object.keys(UTM_DEFAULTS).forEach(function (key) {
      var stored = null;
      try { stored = sessionStorage.getItem(key); } catch (err) { stored = null; }
      utm[key] = query.get(key) || stored || UTM_DEFAULTS[key];
    });
    return utm;
  }

  function fillHidden() {
    document.getElementById('request_id').value = makeRequestId();
    var utm = readUtm();
    Object.keys(utm).forEach(function (key) { document.getElementById(key).value = utm[key]; });
  }

  // Курс из ссылки вида contacts.html?course=gamedev
  var preset = new URLSearchParams(window.location.search).get('course');
  if (preset && COURSES.indexOf(preset) !== -1) form.course.value = preset;
  fillHidden();

  // Телефон приводим к виду +7XXXXXXXXXX; вернёт null, если номер не похож на российский
  function normalizePhone(raw) {
    var digits = raw.replace(/\D/g, '');
    if (digits.length === 11 && (digits[0] === '8' || digits[0] === '7')) digits = digits.slice(1);
    if (digits.length !== 10) return null;
    return '+7' + digits;
  }

  function setError(field, message) {
    var box = field.closest('.field');
    var errorEl = document.getElementById(field.id + '-error');
    box.classList.toggle('has-error', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errorEl) errorEl.textContent = message || '';
    if (message) field.setAttribute('aria-describedby', field.id + '-error');
  }

  // Возвращает список ошибок [{field, type, message}]
  function validate() {
    var errors = [];
    var name = form.name.value.trim();
    var phoneRaw = form.phone.value.trim();
    var email = form.email.value.trim();

    if (!name) errors.push({ field: form.name, type: 'required', message: 'Напишите, как к вам обращаться.' });
    else if (name.length < 2 || name.length > 60) errors.push({ field: form.name, type: 'length', message: 'Имя — от 2 до 60 символов.' });

    if (!phoneRaw) errors.push({ field: form.phone, type: 'required', message: 'Укажите телефон, чтобы мы могли перезвонить.' });
    else if (!normalizePhone(phoneRaw)) errors.push({ field: form.phone, type: 'format', message: 'Номер в формате +7 и 10 цифр, например +7 900 123-45-67.' });

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push({ field: form.email, type: 'format', message: 'Проверьте e-mail: в нём должны быть @ и домен, например mama@mail.ru.' });

    if (COURSES.indexOf(form.course.value) === -1) errors.push({ field: form.course, type: 'required', message: 'Выберите курс.' });
    if (AGES.indexOf(form.child_age.value) === -1) errors.push({ field: form.child_age, type: 'required', message: 'Выберите возраст ребёнка.' });
    if (!form.consent.checked) errors.push({ field: form.consent, type: 'required', message: 'Без согласия на обработку данных мы не можем принять заявку.' });
    return errors;
  }

  // Ошибка исчезает, как только поле исправили
  form.addEventListener('input', function (e) { if (e.target.id) setError(e.target, ''); });
  form.addEventListener('change', function (e) { if (e.target.id) setError(e.target, ''); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusBox.textContent = '';
    [form.name, form.phone, form.email, form.course, form.child_age, form.consent].forEach(function (f) { setError(f, ''); });

    var errors = validate();
    if (errors.length) {
      errors.forEach(function (err) {
        setError(err.field, err.message);
        window.bbAnalytics && bbAnalytics.formError(err.field.name, err.type);
      });
      errors[0].field.focus();
      return;
    }

    var data = {
      request_id: form.request_id.value,
      name: form.name.value.trim(),
      phone: normalizePhone(form.phone.value),
      email: form.email.value.trim(),
      course: form.course.value,
      child_age: form.child_age.value,
      utm_source: form.utm_source.value,
      utm_medium: form.utm_medium.value,
      utm_campaign: form.utm_campaign.value,
      utm_content: form.utm_content.value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';

    // Тело как text/plain — так браузер не делает предварительный CORS-запрос к Apps Script
    fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) })
      .then(function (res) { return res.json(); })
      .then(function (answer) {
        if (answer && answer.ok === true) {
          try { sessionStorage.setItem('bb_last_request_id', data.request_id); } catch (err) { /* не критично */ }
          var go = function () { window.location.href = 'thanks.html'; };
          if (window.bbAnalytics) bbAnalytics.generateLead(data.course, data.child_age, data.utm_source, go);
          else go();
        } else {
          throw new Error((answer && answer.error) || 'server');
        }
      })
      .catch(function (err) {
        window.bbAnalytics && bbAnalytics.formError('form', 'server');
        statusBox.textContent = err.message === 'duplicate'
          ? 'Эта заявка уже отправлена. Мы скоро перезвоним.'
          : 'Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз или позвоните: +7 (900) 707-01-01.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';
      });
  });
})();
