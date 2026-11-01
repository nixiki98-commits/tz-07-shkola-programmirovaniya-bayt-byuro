# Таблица событий GA4 (ТЗ, раздел 4)

Все вызовы `gtag('event', …)` — в одном файле `js/analytics.js`, в функции `send()` (строка 31).
Кнопки и ссылки описываются атрибутами `data-event` и `data-*` в HTML; `analytics.js` находит их по клику (строка 49)
и берёт параметры по таблице `EVENT_PARAMS` (строки 14–23). Номера строк — на момент последнего коммита с этим файлом.

Ключевые события (Admin → Events → Key events): `generate_lead`, `contact_click`, `messenger_click`.

| № | Событие | Тип | Где задаётся (разметка / вызов) | Где отправляется | Параметры и пример значений |
|---|---|---|---|---|---|
| 1 | `page_view` | авто | тег Google в `<head>` каждой страницы | gtag.js | `page_location` = `https://…vercel.app/index.html`, `page_title` = «Байт-Бюро — школа…» |
| 2 | `scroll` | авто | расширенная статистика | gtag.js | `percent_scrolled` = `90` |
| 3 | `click` | авто | внешние ссылки: соцсети, Telegram, WhatsApp | gtag.js | `link_url` = `https://t.me/bytebureau_sales`, `outbound` = `true` |
| 4 | `file_download` | авто | `courses.html`, ссылка «Скачать программу (PDF)» | gtag.js | `file_name` = `/files/programma-kursov-bayt-byuro.pdf`, `file_extension` = `pdf` |
| 5 | `form_start` | авто | `contacts.html`, форма `#lead-form` | gtag.js | `form_id` = `lead-form` |
| 6 | `form_submit` | авто | `contacts.html`, форма `#lead-form` | gtag.js | `form_id` = `lead-form` |
| 7 | `generate_lead` ★ | рекоменд. | `js/form.js:130` — после ответа приёмника `{"ok": true}` | `js/analytics.js:87` | `lead_course` = `gamedev`, `lead_age_group` = `12_13`, `lead_source` = `instagram` |
| 8 | `cta_click` | своё | `index.html:63, 64, 206`; `courses.html:70, 79, 88, 97, 121`; `projects.html:147`; `schedule.html:95`; `challenge.html:82` | `js/analytics.js:49` | `button_name` = `hero_trial`, `page_section` = `hero` |
| 9 | `age_filter` | своё | `index.html:81–83` | `js/analytics.js:49` | `age_group` = `14_15` |
| 10 | `view_course` | своё | `index.html:95, 103, 111, 119`; `courses.html:67, 76, 85, 94` | `js/analytics.js:49` | `course_name` = `python` |
| 11 | `project_view` | своё | карточки: `index.html:135–175`, `projects.html:73–123`; фильтр: `projects.html:66` | клик `js/analytics.js:49`, фильтр `js/analytics.js:59` | `project_id` = `p05` (у фильтра `filter`), `course_name` = `gamedev` |
| 12 | `schedule_filter` | своё | `schedule.html:66, 69, 80` | `js/analytics.js:57` | `filter_type` = `day`, `filter_value` = `sat` |
| 13 | `challenge_start` | своё | `challenge.html:66` (кнопка «Начать»), `challenge.html:83` («Пройти ещё раз») | `js/analytics.js:49` | `page_section` = `challenge_intro` |
| 14 | `challenge_complete` | своё | `js/challenge.js:117` — после ответа на 5-ю задачу | `js/analytics.js:75` | `score` = `5` |
| 15 | `contact_click` ★ | своё | шапка и подвал всех страниц (`tel:`, `mailto:`), `contacts.html:122–123` | `js/analytics.js:49` | `contact_type` = `phone` / `email` |
| 16 | `messenger_click` ★ | своё | `contacts.html:128–129` | `js/analytics.js:49` | `messenger` = `telegram` / `whatsapp` |
| 17 | `social_click` | своё | подвал всех страниц, `thanks.html:79–82` | `js/analytics.js:49` | `network` = `vk`, `page_section` = `footer` / `thanks` |
| 18 | `form_error` | своё | `js/form.js:101` (ошибка поля), `js/form.js:137` (ошибка приёмника) | `js/analytics.js:81` | `field_name` = `phone`, `error_type` = `required` / `format` / `server` |
| 19 | `promo_copy` | по выбору | `js/challenge.js:147` — кнопка «Скопировать» | `js/analytics.js:78` | `promo_code` = `BUG500` |
| 20 | `video_play` | по выбору | `projects.html:140` — `<video data-event="video_play">` | `js/analytics.js:69` | `video_title` = «Кот и лазер — платформер на Godot» |

★ — ключевое событие.

## Пользовательские параметры (Admin → Custom definitions, Event scope)

| Параметр | Событие | Название в GA4 |
|---|---|---|
| `button_name` | `cta_click` | Button name |
| `page_section` | `cta_click`, `social_click` | Page section |
| `course_name` | `view_course`, `project_view` | Course name |
| `age_group` | `age_filter` | Age group |
| `score` | `challenge_complete` | Score |
| `lead_course` | `generate_lead` | Lead course |
| `messenger` | `messenger_click` | Messenger |

## Что не передаётся

Имя, телефон и e-mail посетителя в GA4 не уходят: в `generate_lead` — только курс, возрастная группа и источник,
в `form_error` — только имя поля и тип ошибки, адрес страницы после отправки (`thanks.html`) не содержит данных заявки.
