/*
 * analytics.js — все вызовы gtag('event', …) сайта «Байт-Бюро» (ТЗ, раздел 4.3).
 * Кнопки и ссылки описываются атрибутами data-event и data-*, например:
 *   <a data-event="cta_click" data-button-name="hero_trial" data-page-section="hero">
 * Этот файл находит такие элементы и отправляет событие с нужными параметрами.
 * Имя, телефон и e-mail посетителя в GA4 не передаются.
 */
(function () {
  'use strict';

  // Какие параметры отправляет каждое событие (имя data-атрибута -> имя параметра GA4)
  var EVENT_PARAMS = {
    cta_click:        { buttonName: 'button_name', pageSection: 'page_section' },
    contact_click:    { contactType: 'contact_type' },
    messenger_click:  { messenger: 'messenger' },
    social_click:     { network: 'network', pageSection: 'page_section' },
    age_filter:       { ageGroup: 'age_group' },
    view_course:      { courseName: 'course_name' },
    project_view:     { projectId: 'project_id', courseName: 'course_name' },
    challenge_start:  { pageSection: 'page_section' }
  };

  // Значение параметра — строка не длиннее 100 символов
  function clip(value) {
    return String(value).slice(0, 100);
  }

  // Единая точка отправки: если тег не загрузился (блокировщик), сайт продолжает работать
  function send(name, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', name, params || {});
  }

  // Собирает параметры события из data-атрибутов элемента
  function paramsFrom(el) {
    var map = EVENT_PARAMS[el.dataset.event] || {};
    var params = {};
    Object.keys(map).forEach(function (attr) {
      if (el.dataset[attr] !== undefined) params[map[attr]] = clip(el.dataset[attr]);
    });
    return params;
  }

  // Клики по кнопкам и ссылкам с data-event
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-event]');
    if (!el || el.tagName === 'SELECT' || el.tagName === 'VIDEO') return;
    if (!EVENT_PARAMS[el.dataset.event]) return;
    send(el.dataset.event, paramsFrom(el));
  });

  // Изменение выпадающих списков: фильтр расписания и фильтр проектов
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.tagName !== 'SELECT' || !el.dataset.event) return;
    if (el.dataset.event === 'schedule_filter') {
      send('schedule_filter', { filter_type: clip(el.dataset.filter), filter_value: clip(el.value) });
    } else if (el.dataset.event === 'project_view') {
      send('project_view', { project_id: 'filter', course_name: clip(el.value) });
    }
  });

  // Запуск видео проекта (событие play не всплывает, поэтому слушаем на этапе перехвата)
  var videoSent = false;
  document.addEventListener('play', function (e) {
    var el = e.target;
    if (el.tagName !== 'VIDEO' || el.dataset.event !== 'video_play' || videoSent) return;
    videoSent = true;
    send('video_play', { video_title: clip(el.dataset.videoTitle || 'video') });
  }, true);

  // События, которые отправляют другие скрипты сайта
  window.bbAnalytics = {
    challengeComplete: function (score) {
      send('challenge_complete', { score: score });
    },
    promoCopy: function (code) {
      send('promo_copy', { promo_code: clip(code) });
    },
    formError: function (fieldName, errorType) {
      send('form_error', { field_name: clip(fieldName), error_type: clip(errorType) });
    },
    // Отправляется только после ответа приёмника {"ok": true}; done вызывается, когда событие ушло
    generateLead: function (course, ageGroup, source, done) {
      var finished = false;
      function finish() { if (!finished) { finished = true; if (done) done(); } }
      send('generate_lead', {
        lead_course: clip(course),
        lead_age_group: clip(ageGroup),
        lead_source: clip(source),
        event_callback: finish
      });
      setTimeout(finish, 1000); // если GA заблокирован, не держим посетителя на странице
    }
  };
})();
