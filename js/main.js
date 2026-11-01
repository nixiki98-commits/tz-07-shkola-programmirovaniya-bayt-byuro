/*
 * main.js — общее поведение сайта: мобильное меню, сохранение UTM-меток,
 * выбор возраста на главной, фильтр и карточки проектов.
 * События GA4 отправляет analytics.js — здесь вызовов gtag нет.
 */
(function () {
  'use strict';

  // ---------- Мобильное меню ----------
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
  }

  // ---------- UTM-метки: читаем из адреса и храним до отправки формы (ТЗ 6.3) ----------
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  try {
    var query = new URLSearchParams(window.location.search);
    var hasUtm = UTM_KEYS.some(function (key) { return query.get(key); });
    if (hasUtm) {
      UTM_KEYS.forEach(function (key) {
        sessionStorage.setItem(key, (query.get(key) || '').slice(0, 100));
      });
    }
  } catch (err) { /* sessionStorage недоступен — форма подставит значения по умолчанию */ }

  // ---------- Выбор возраста на главной ----------
  var ageButtons = document.querySelectorAll('[data-age]');
  var courseCards = document.querySelectorAll('.course[data-min]');
  var ageResult = document.querySelector('.age-result');
  var AGE_RANGE = { '12_13': [12, 13], '14_15': [14, 15], '16_17': [16, 17] };

  ageButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var range = AGE_RANGE[btn.dataset.age];
      var count = 0;
      ageButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      courseCards.forEach(function (card) {
        var fits = Number(card.dataset.min) <= range[1] && Number(card.dataset.max) >= range[0];
        card.classList.toggle('is-dim', !fits);
        if (fits) count += 1;
      });
      if (ageResult) ageResult.textContent = 'Подходит курсов: ' + count + ' из ' + courseCards.length + '.';
      var target = document.getElementById('courses');
      if (target) target.scrollIntoView({ block: 'start' });
    });
  });

  // ---------- Проекты учеников: фильтр по курсу и раскрытие карточки ----------
  var projectFilter = document.getElementById('project-filter');
  var projectCards = document.querySelectorAll('#project-list .project');
  var projectEmpty = document.getElementById('project-empty');

  function applyProjectFilter(course) {
    var shown = 0;
    projectCards.forEach(function (card) {
      var visible = course === 'all' || card.dataset.course === course;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    if (projectEmpty) projectEmpty.hidden = shown > 0;
  }

  if (projectFilter) {
    projectFilter.addEventListener('change', function () { applyProjectFilter(projectFilter.value); });
  }

  projectCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var about = card.querySelector('.project__about');
      var open = card.classList.toggle('is-open');
      if (about) about.hidden = !open;
    });
  });

  // Переход с главной по ссылке projects.html#p03 — раскрываем нужный проект
  if (projectCards.length && window.location.hash) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target && target.classList.contains('project')) {
      target.classList.add('is-open');
      var about = target.querySelector('.project__about');
      if (about) about.hidden = false;
    }
  }
})();
