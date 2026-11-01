/*
 * challenge.js — «Задача дня»: 5 программ на Python, в каждой одна ошибка.
 * Пользователь выбирает строку с ошибкой, видит объяснение, в конце — результат.
 * При 5 верных ответах показывается промокод BUG500.
 */
(function () {
  'use strict';

  var PROMO = 'BUG500';

  // line — номер строки с ошибкой; options — номера строк, из которых выбирают
  var TASKS = [
    {
      code: ['score = 0', 'for i in range(5)', '    score += 10', 'print("Очки:", score)'],
      options: [1, 2, 4], line: 2,
      explain: 'После заголовка цикла for нужно двоеточие: for i in range(5): — без него Python выдаст SyntaxError.'
    },
    {
      code: ['name = input("Как зовут героя? ")', 'lives = 3', 'print("У героя " + name + " " + lives + " жизни")'],
      options: [1, 2, 3], line: 3,
      explain: 'Нельзя склеивать строку и число через +. Будет TypeError. Исправление: str(lives) или f-строка f"У героя {name} {lives} жизни".'
    },
    {
      code: ['items = ["меч", "щит", "зелье"]', 'print("Всего предметов:", len(items))', 'print("Первый предмет:", items[1])'],
      options: [1, 2, 3], line: 3,
      explain: 'Нумерация в списке начинается с нуля. items[1] — это «щит», а первый предмет — items[0].'
    },
    {
      code: ['def heal(hp):', '    hp = hp + 20', '    return hp', '', 'player_hp = 50', 'heal(player_hp)', 'print(player_hp)  # хотим увидеть 70'],
      options: [2, 3, 6], line: 6,
      explain: 'Функция возвращает новое значение, но его никуда не сохранили. Нужно player_hp = heal(player_hp).'
    },
    {
      code: ['level = 3', 'if level = 5:', '    print("Босс!")', 'else:', '    print("Обычный уровень")'],
      options: [1, 2, 4], line: 2,
      explain: 'Один знак = присваивает значение, а для сравнения нужно два: if level == 5:'
    }
  ];

  var intro = document.getElementById('challenge-intro');
  var box = document.getElementById('challenge-box');
  var taskEl = document.getElementById('task');
  var bar = document.getElementById('progress-bar');
  var result = document.getElementById('challenge-result');
  var resultText = document.getElementById('result-text');
  var promo = document.getElementById('promo');
  var copyBtn = document.getElementById('promo-copy');
  var copyStatus = document.getElementById('promo-status');
  var startBtn = document.getElementById('challenge-start');
  var retryBtn = document.getElementById('challenge-retry');
  if (!taskEl) return;

  var current = 0;
  var score = 0;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function showTask() {
    var task = TASKS[current];
    bar.style.width = (current / TASKS.length * 100) + '%';
    taskEl.textContent = '';
    taskEl.appendChild(el('div', 'task__num', 'Задача ' + (current + 1) + ' из ' + TASKS.length));
    taskEl.appendChild(el('h2', '', 'В какой строке ошибка?'));

    var pre = el('pre', 'task__code');
    task.code.forEach(function (line) { pre.appendChild(el('span', '', line || ' ')); });
    taskEl.appendChild(pre);

    var options = el('div', 'options');
    task.options.forEach(function (n) {
      var btn = el('button', 'option', 'Строка ' + n + ': ' + task.code[n - 1].trim());
      btn.type = 'button';
      btn.addEventListener('click', function () { answer(n, btn, options); });
      options.appendChild(btn);
    });
    taskEl.appendChild(options);
    options.querySelector('button').focus();
  }

  function answer(n, btn, options) {
    var task = TASKS[current];
    var right = n === task.line;
    if (right) score += 1;

    options.querySelectorAll('button').forEach(function (b) {
      b.disabled = true;
      if (b.textContent.indexOf('Строка ' + task.line + ':') === 0) b.classList.add('is-right');
    });
    if (!right) btn.classList.add('is-wrong');

    var explain = el('div', 'explain');
    explain.appendChild(el('strong', '', right ? 'Верно! ' : 'Не совсем. Ошибка в строке ' + task.line + '. '));
    explain.appendChild(document.createTextNode(task.explain));
    taskEl.appendChild(explain);

    var last = current === TASKS.length - 1;
    var next = el('button', 'btn btn--red', last ? 'Показать результат' : 'Следующая задача');
    next.type = 'button';
    next.style.marginTop = '16px';
    next.addEventListener('click', function () {
      if (last) finish();
      else { current += 1; showTask(); }
    });
    taskEl.appendChild(next);
    next.focus();
  }

  function finish() {
    bar.style.width = '100%';
    box.hidden = true;
    result.hidden = false;
    window.bbAnalytics && bbAnalytics.challengeComplete(score);
    if (score === TASKS.length) {
      resultText.textContent = 'Все 5 из 5! Ты нашёл каждую ошибку — держи промокод на интенсив «Игра за 7 дней».';
      promo.hidden = false;
    } else {
      resultText.textContent = 'Верно ' + score + ' из ' + TASKS.length + '. Промокод открывается за 5 верных ответов — попробуй ещё раз, объяснения уже знаешь.';
      promo.hidden = true;
    }
    var title = result.querySelector('h2');
    title.setAttribute('tabindex', '-1');
    title.focus();
  }

  function start() {
    current = 0;
    score = 0;
    intro.hidden = true;
    result.hidden = true;
    box.hidden = false;
    copyStatus.textContent = '';
    showTask();
  }

  startBtn.addEventListener('click', start);
  retryBtn.addEventListener('click', start);

  // Копирование промокода; запасной вариант — для браузеров без Clipboard API
  copyBtn.addEventListener('click', function () {
    function done() {
      copyStatus.textContent = 'Скопировано';
      window.bbAnalytics && bbAnalytics.promoCopy(PROMO);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(PROMO).then(done, function () { copyStatus.textContent = 'Выделите код и скопируйте вручную'; });
    } else {
      var area = document.createElement('textarea');
      area.value = PROMO;
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); done(); } catch (err) { copyStatus.textContent = 'Выделите код и скопируйте вручную'; }
      document.body.removeChild(area);
    }
  });
})();
