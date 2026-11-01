# Что настроить вручную

Код сайта готов. Ниже — части ТЗ, которые делаются в аккаунтах Google, Instagram, ManyChat и DataLens
и которые нельзя выполнить из репозитория. Порядок — по этапам раздела 9.

## Этап 1. GitHub и Vercel (день 4)

1. Создать **публичный** репозиторий `tz-07-shkola-programmirovaniya-bayt-byuro` на GitHub (пустой, без README).
2. В папке проекта: `git remote add origin https://github.com/<логин>/tz-07-shkola-programmirovaniya-bayt-byuro.git` и `git push -u origin main`.
3. vercel.com → Add New → Project → Import этот репозиторий. Framework Preset — **Other**, Build Command пустая. Deploy.
4. Если адрес получился не `tz-07-shkola-programmirovaniya-bayt-byuro.vercel.app`, заменить его поиском по всем файлам
   (VS Code: Ctrl+Shift+H) и закоммитить.

## Этап 2. GA4 (день 8)

1. analytics.google.com → Admin → Create → Property: «БАЙТ-БЮРО — сайт», часовой пояс (GMT+03:00) Москва, валюта — российский рубль.
2. Data streams → Web → адрес Vercel. Enhanced measurement включено, в шестерёнке включить **Form interactions**.
3. Скопировать Measurement ID `G-…` и заменить `G-XXXXXXXXXX` во всех HTML (Ctrl+Shift+H). Коммит, push.
4. Admin → Custom definitions → Create custom dimension (Event scope): `button_name`, `page_section`, `course_name`,
   `age_group`, `score`, `lead_course`, `messenger`.
5. Admin → Events: отметить как Key event `generate_lead`, `contact_click`, `messenger_click` (появятся после первых срабатываний;
   можно создать заранее через Key events → New key event). Других ключевых событий не должно быть.
6. Поставить расширение Google Analytics Debugger, открыть сайт, вызвать все 20 событий и сделать снимки
   DebugView в `screens/ga4/<имя_события>.png`.
7. Admin → Property access management → добавить e-mail Заказчика с ролью Viewer.

## Этап 3. Заявки (день 11)

1. Создать Google Таблицу «ByteBureau — Leads». ID таблицы — часть адреса между `/d/` и `/edit`.
2. Расширения → Apps Script → вставить `apps-script/Code.gs`, в `SHEET_ID` вписать ID таблицы.
3. В редакторе выбрать функцию `setupSheet` → Выполнить → разрешить доступ. Появятся заголовки, списки и подсветка.
4. Развернуть → Новое развёртывание → Веб-приложение; выполнять как «Я», доступ «Все». Скопировать URL `…/exec`.
5. Вставить URL в `js/form.js` (`APPS_SCRIPT_URL`), коммит, push. Отправить тестовую заявку.
6. Проверить повтор (И-05): в консоли браузера на любой странице сайта выполнить
   `fetch('URL', {method:'POST', body: JSON.stringify({...данные заявки с тем же request_id...})}).then(r=>r.json()).then(console.log)` —
   ответ `{"ok":false,"error":"duplicate"}`.
7. Открыть доступ на просмотр по e-mail Заказчика. Провести одну заявку по статусам до `paid`, другую — в `lost`.
8. Лист `utm`: Файл → Импорт → `docs/utm.csv`. В столбец `full_url` (J2) вставить формулу и протянуть вниз
   (русская локаль, разделитель `;`):

   ```
   ="https://tz-07-shkola-programmirovaniya-bayt-byuro.vercel.app/"&ЕСЛИОШИБКА(ЛЕВСИМВ(I2;ПОИСК("#";I2)-1);I2)&"?utm_source="&D2&"&utm_medium="&E2&"&utm_campaign="&F2&"&utm_content="&G2&ЕСЛИ(H2="";"";"&utm_term="&H2)&ЕСЛИОШИБКА(ПСТР(I2;ПОИСК("#";I2);100);"")
   ```

   После публикаций заполнить `short_url`, `published_url`, `published_date` и снова выгрузить лист в `docs/utm.csv`.

## Этап 4. Каналы (день 15)

1. Создать от имени школы: профессиональный аккаунт Instagram, сообщество ВКонтакте, Telegram-канал, YouTube-канал.
   Поменять ссылки в подвале сайта (в HTML ищите `bytebureau_school`, `bytebureau_parents`, `bytebureau_sales`) на реальные.
2. В `docs/utm.csv` заменить `nick_partnera_1` и `nick_partnera_2` на ники двух однокурсников латиницей.
3. Короткие ссылки для ВК и Telegram: vk.cc/clck.ru. Проверить, что после перехода в адресе все 5 меток.
4. Напечатать `docs/afisha.pdf` (QR-код уже ведёт на ссылку U-12).
5. ManyChat: автоматизация «IG · Winter Camp 2026 · Game Reel» по разделу 7 ТЗ, кнопка — полная ссылка U-02;
   вторая ветка на слово ИГРЫ — ссылка U-03. Перевести в Live, проверить со второго аккаунта (пауза 2 минуты).
6. Проверить каждую ссылку по 5.5, снимки — в `screens/utm/` и `screens/instagram/`.

## Этап 5. Отчёты (день 19)

Через 24–48 часов после проверок: отчёты и исследования по 8.1–8.3 (снимки в `screens/reports/`, `screens/explore/`,
CSV в `docs/reports/`), дашборд DataLens по 8.4 (`screens/datalens/`), записка `docs/report.md`.
Lighthouse: Chrome → F12 → Lighthouse → Mobile → снимок в `screens/lighthouse/`.
