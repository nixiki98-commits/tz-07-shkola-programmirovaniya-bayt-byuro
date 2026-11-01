/*
 * schedule.js — таблица групп на schedule.html с фильтром по курсу, дню и формату.
 * Событие schedule_filter отправляет analytics.js при изменении любого списка.
 */
(function () {
  'use strict';

  var COURSE_NAMES = { python: 'Python с нуля', web: 'Веб-разработка', gamedev: 'Игры на Godot', ai: 'Основы ИИ' };
  var DAY_NAMES = { mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб' };

  // Группы: два занятия в неделю по 90 минут. Время — из расписания школы (ТЗ, раздел 2)
  var GROUPS = [
    { course: 'python',  days: ['mon', 'thu'], time: ['16:00', '16:00'], format: 'offline', seats: 3 },
    { course: 'python',  days: ['tue', 'fri'], time: ['19:30', '19:30'], format: 'online',  seats: 6 },
    { course: 'python',  days: ['wed', 'sat'], time: ['17:45', '10:00'], format: 'offline', seats: 2 },
    { course: 'web',     days: ['mon', 'thu'], time: ['17:45', '17:45'], format: 'offline', seats: 4 },
    { course: 'web',     days: ['wed', 'sat'], time: ['19:30', '12:00'], format: 'online',  seats: 7 },
    { course: 'gamedev', days: ['tue', 'fri'], time: ['16:00', '16:00'], format: 'offline', seats: 1 },
    { course: 'gamedev', days: ['wed', 'sat'], time: ['16:00', '14:00'], format: 'offline', seats: 5 },
    { course: 'gamedev', days: ['mon', 'thu'], time: ['19:30', '19:30'], format: 'online',  seats: 8 },
    { course: 'ai',      days: ['tue', 'fri'], time: ['17:45', '17:45'], format: 'offline', seats: 4 },
    { course: 'ai',      days: ['mon', 'sat'], time: ['19:30', '12:00'], format: 'online',  seats: 6 }
  ];

  var body = document.getElementById('groups-body');
  var empty = document.getElementById('groups-empty');
  var cta = document.getElementById('schedule-cta');
  var fCourse = document.getElementById('f-course');
  var fDay = document.getElementById('f-day');
  var fFormat = document.getElementById('f-format');
  if (!body) return;

  function render() {
    var course = fCourse.value, day = fDay.value, format = fFormat.value;
    var rows = GROUPS.filter(function (g) {
      return (course === 'all' || g.course === course) &&
             (day === 'all' || g.days.indexOf(day) !== -1) &&
             (format === 'all' || g.format === format);
    });

    body.textContent = '';
    rows.forEach(function (g) {
      var tr = document.createElement('tr');
      var cells = [
        COURSE_NAMES[g.course],
        g.days.map(function (d) { return DAY_NAMES[d]; }).join(', '),
        g.time[0] === g.time[1] ? g.time[0] : DAY_NAMES[g.days[0]] + ' ' + g.time[0] + ', ' + DAY_NAMES[g.days[1]] + ' ' + g.time[1],
        g.format === 'online' ? 'Онлайн' : 'Очно, ул. Инженерная',
        String(g.seats)
      ];
      cells.forEach(function (text, i) {
        var td = document.createElement('td');
        td.textContent = text;
        if (i === 2) td.className = 'mono';
        if (i === 4) td.className = 'seats' + (g.seats <= 2 ? ' seats--low' : '');
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    empty.hidden = rows.length > 0;

    // Кнопка «Записаться в группу» подставляет выбранный курс в форму
    cta.href = course === 'all' ? 'contacts.html' : 'contacts.html?course=' + course;
  }

  [fCourse, fDay, fFormat].forEach(function (sel) { sel.addEventListener('change', render); });
  render();
})();
