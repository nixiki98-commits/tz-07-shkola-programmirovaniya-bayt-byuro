/**
 * Приёмник заявок «Байт-Бюро» (ТЗ, раздел 6.2).
 * Веб-приложение Apps Script: принимает JSON из формы сайта и дописывает строку в лист leads
 * таблицы «ByteBureau — Leads».
 *
 * Развёртывание: Развернуть → Новое развёртывание → Веб-приложение,
 *   «Выполнять как» — я, «Доступ» — все. URL вставить в js/form.js (APPS_SCRIPT_URL).
 * Один раз перед началом работы запустить setupSheet() из редактора.
 * Паролей и ключей в коде нет; идентификатор таблицы допускается ТЗ.
 */

var SHEET_ID = 'ВСТАВЬТЕ_ID_ТАБЛИЦЫ'; // часть адреса таблицы между /d/ и /edit
var SHEET_NAME = 'leads';

var HEADERS = ['request_id', 'created_at', 'name', 'phone', 'email', 'course', 'child_age',
               'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'status'];
var COURSES = ['python', 'web', 'gamedev', 'ai', 'winter_camp'];
var AGES = ['12_13', '14_15', '16_17'];
var STATUSES = ['new', 'contacted', 'trial_booked', 'trial_done', 'paid', 'lost'];
var UTM_DEFAULTS = { utm_source: 'direct', utm_medium: 'none', utm_campaign: 'not_set', utm_content: 'not_set' };
var MAX_LEN = 200;

/** Приём заявки */
function doPost(e) {
  var data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return reply_({ ok: false, error: 'bad_json' });
  }

  var check = validate_(data);
  if (!check.ok) return reply_(check);
  var lead = check.lead;

  // Блокировка: две заявки одновременно не запишутся в одну строку и не создадут дубль
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return reply_({ ok: false, error: 'busy' });
  }

  try {
    var sheet = getSheet_();
    if (isDuplicate_(sheet, lead.request_id)) {
      return reply_({ ok: false, error: 'duplicate' });
    }
    var row = [
      lead.request_id,
      new Date(),            // created_at ставит приёмник
      safe_(lead.name),
      lead.phone,
      safe_(lead.email),
      lead.course,
      lead.child_age,
      safe_(lead.utm_source),
      safe_(lead.utm_medium),
      safe_(lead.utm_campaign),
      safe_(lead.utm_content),
      'new'                  // status из браузера игнорируется
    ];
    var rowIndex = sheet.getLastRow() + 1;
    var range = sheet.getRange(rowIndex, 1, 1, HEADERS.length);
    range.setNumberFormat('@');                                       // всё как текст: +7… не станет числом
    sheet.getRange(rowIndex, 2).setNumberFormat('dd.mm.yyyy hh:mm:ss'); // кроме даты
    range.setValues([row]);
    return reply_({ ok: true, request_id: lead.request_id });
  } catch (err) {
    return reply_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

/** Проверка, что приёмник развёрнут: открыть URL в браузере */
function doGet() {
  return reply_({ ok: true, service: 'bytebureau-leads' });
}

/** Проверка полей. Возвращает {ok:true, lead} или {ok:false, error} */
function validate_(d) {
  var lead = {};
  var fields = ['request_id', 'name', 'phone', 'email', 'course', 'child_age',
                'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  for (var i = 0; i < fields.length; i++) {
    var value = d[fields[i]] === undefined || d[fields[i]] === null ? '' : String(d[fields[i]]).trim();
    if (value.length > MAX_LEN) return { ok: false, error: 'too_long_' + fields[i] };
    lead[fields[i]] = value;
  }

  if (!/^REQ-[0-9a-zA-Z-]{8,60}$/.test(lead.request_id)) return { ok: false, error: 'invalid_request_id' };
  if (lead.name.length < 2 || lead.name.length > 60) return { ok: false, error: 'invalid_name' };
  if (!/^\+7\d{10}$/.test(lead.phone)) return { ok: false, error: 'invalid_phone' };
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) return { ok: false, error: 'invalid_email' };
  if (COURSES.indexOf(lead.course) === -1) return { ok: false, error: 'invalid_course' };
  if (AGES.indexOf(lead.child_age) === -1) return { ok: false, error: 'invalid_child_age' };

  Object.keys(UTM_DEFAULTS).forEach(function (key) {
    if (!lead[key]) lead[key] = UTM_DEFAULTS[key];
  });
  return { ok: true, lead: lead };
}

/** Есть ли уже строка с таким request_id */
function isDuplicate_(sheet, requestId) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var found = sheet.getRange(2, 1, last - 1, 1)
    .createTextFinder(requestId).matchEntireCell(true).findNext();
  return found !== null;
}

/** Защита от формул: значение, начинающееся с = + - @, записываем как текст */
function safe_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Однократная настройка листа leads (запустить вручную из редактора):
 * заголовки, проверка данных для списков, условное форматирование.
 */
function setupSheet() {
  var sheet = getSheet_();
  var rows = 1000;
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  if (sheet.getMaxRows() < rows) sheet.insertRowsAfter(sheet.getMaxRows(), rows - sheet.getMaxRows());

  function listRule(values) {
    return SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  }
  sheet.getRange(2, 6, rows - 1, 1).setDataValidation(listRule(COURSES));   // course
  sheet.getRange(2, 7, rows - 1, 1).setDataValidation(listRule(AGES));      // child_age
  sheet.getRange(2, 12, rows - 1, 1).setDataValidation(listRule(STATUSES)); // status

  // Подсветка пустых обязательных ячеек (все столбцы, кроме email) в заполненных строках
  var required = [sheet.getRange('A2:D' + rows), sheet.getRange('F2:L' + rows)];
  var emptyRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(COUNTA($A2:$L2)>0, A2="")')
    .setBackground('#FCE4E2')
    .setRanges(required)
    .build();
  // Подсветка повторяющихся request_id
  var dupRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($A2<>"", COUNTIF($A$2:$A, $A2)>1)')
    .setBackground('#FFC845')
    .setRanges([sheet.getRange('A2:A' + rows)])
    .build();
  sheet.setConditionalFormatRules([emptyRule, dupRule]);
  sheet.autoResizeColumns(1, HEADERS.length);
}
