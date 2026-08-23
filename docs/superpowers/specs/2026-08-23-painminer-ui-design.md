# painminer UI — дизайн

Дата: 2026-08-23
Статус: утверждён

## Задача

Дать painminer интерфейс: смотреть находки, размечать их в кластеры болей,
запускать прогоны и читать аналитику — не выходя из браузера. CLI остаётся
полноценным, интерфейс — вторая точка входа к тем же данным.

## Границы

Локальный однопользовательский инструмент на машине разработчика.
Сервер слушает только `127.0.0.1`, наружу не публикуется, аутентификации нет —
её роль выполняет то, что порт недоступен извне.

**Не входит в задачу:** многопользовательский режим, профили авторов сообщений,
отправка чего-либо в Telegram.

**Отдельно про авторов.** В API и на экранах нет ни имени, ни username, ни id
автора сообщения — только текст, метрики, ссылка и чат. Цель инструмента —
агрегированные формулировки проблем, а не досье на участников чатов.

## Архитектура

```
painminer/
├── back/     Python: CLI + SQLite + HTTP-слой (FastAPI)
└── front/    Next.js: интерфейс поверх HTTP-слоя
```

Фронт не знает о SQLite: только `http://127.0.0.1:8765/api`.

FastAPI и uvicorn ставятся опциональным экстра `.[api]`, чтобы CLI остался
на четырёх зависимостях, как задумано изначально.

### Вход в Telegram

**Решение пересмотрено 2026-08-23 по просьбе владельца проекта.** Изначально
логин оставался только в терминале; теперь есть и страница `/login`.

Вход идёт шагами: телефон → код → пароль двухфакторной защиты, если он включён.
Между шагами в памяти процесса живёт один клиент Telethon (в нём `phone_code_hash`),
поэтому перезапуск сервера обрывает незавершённый вход.

Что это значит по безопасности:

* номер, код и пароль идут по локальному HTTP на `127.0.0.1` и оттуда в Telegram;
  наружу порт не смотрит;
* ничего из этого не логируется и не сохраняется — пароль живёт один вызов;
* на диске остаётся только session-файл, равносильный доступу к аккаунту;
* `painminer login` в терминале продолжает работать как равноценная замена.

Эндпоинты `/api/auth/*` возвращают `stage` (`phone` / `code` / `password` /
`done` / `unknown`), и интерфейс просто отображает текущий шаг.

### Прогон

`scan` живёт asyncio-задачей в процессе сервера. Прогресс идёт через уже
существующий колбэк `scan_niche(on_step=...)` в очередь, из неё — в SSE.
Одновременный прогон один: второй запрос получает `409 run_in_progress` с id
текущего. Отмена (`POST /runs/{id}/stop`) идёт тем же путём, что Ctrl+C:
задача снимается, собранное коммитится.

### Работа с SQLite

`Storage` открывается на каждый запрос — открытие дешёвое, а соединение
sqlite3 нельзя делить между потоками пула FastAPI. У фоновой задачи прогона
своё соединение. Режим WAL уже включён, читатели не блокируются писателем.

## API

Базовый префикс `/api`. Ошибки единым телом:
`{"error": {"code": "...", "message": "..."}}`,
коды: `not_found`, `config_error`, `no_session`, `run_in_progress`,
`telegram_error`, а для входа — `no_credentials`, `phone_invalid`,
`code_invalid`, `code_expired`, `password_invalid`, `flood_wait`, `no_pending`.

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/niches` | список ниш со счётчиками |
| POST | `/niches` | `init` — создать YAML |
| GET | `/niches/{n}/config` | конфиг после слияния с дефолтами |
| PUT | `/niches/{n}/config` | правка queries, noise_patterns, settings |
| GET | `/niches/{n}/summary` | сводка для дашборда |
| GET | `/niches/{n}/findings` | находки: фильтры, сортировка, пагинация |
| GET | `/niches/{n}/report` | топ, разбивка по чатам, n-граммы, деньги |
| GET | `/niches/{n}/chats` | чаты со статусами |
| POST | `/niches/{n}/chats` | дозапись чатов в YAML |
| DELETE | `/niches/{n}/chats/{ref}` | убрать чат из YAML |
| GET | `/niches/{n}/discover?keyword=` | поиск публичных групп |
| POST | `/messages/{id}/notes` | кластер, вердикт, комментарий |
| POST | `/niches/{n}/runs` | запустить прогон → `run_id` |
| GET | `/runs/{id}` | состояние прогона |
| GET | `/runs/{id}/events` | SSE-поток прогресса |
| POST | `/runs/{id}/stop` | мягкая отмена |
| GET | `/auth/status` | этап входа и владелец сессии |
| POST | `/auth/phone` | выслать код на номер |
| POST | `/auth/code` | подтвердить код |
| POST | `/auth/password` | пароль двухфакторной защиты |
| POST | `/auth/cancel` | сбросить незавершённый вход |

### Формы данных

```ts
NicheBrief   { name, chats, findings, hits, last_scanned_at }
NicheConfig  { niche, chats[], queries[], noise_patterns[], settings }
Settings     { days_back, limit_per_query, min_length, pause_seconds }

Finding      { message_id, chat_id, chat_title, chat_username, tg_msg_id,
               date, text, replies, reactions, link, queries[],
               cluster, verdict, score, has_money, is_question }

FindingsPage { items[], total, limit, offset,
               facets: { chats[], queries[], clusters[] } }

ChatRow      { id, tg_id, username, title, members, status,
               added_at, last_scanned_at, findings, queries[] }

ReportData   { counts, top[], per_chat[], bigrams[], trigrams[], money[] }
Candidate    { tg_id, title, username, members, kind }

RunState     { run_id, niche, status, started_at, finished_at,
               done, total, current, stats, errors[] }
```

`status` прогона: `running | done | failed | stopped`.
`verdict`: `yes | no | maybe | null`.
`score`, `has_money`, `is_question` считает бэкенд — формула живёт в одном
месте, `scoring.py`, и фронт её не дублирует.

Фильтры находок: `chat`, `query`, `verdict`, `cluster`, `money=true`,
`question=true`, `search`, `sort=score|date|replies`, `limit`, `offset`.

### SSE

```
event: step   data: {done, total, current}
event: stats  data: {new_messages, hits, skipped_*, flood_waits, ...}
event: done   data: RunState
event: error  data: {code, message}
```

## Интерфейс

### Экраны

- `/` — список ниш: находки, чаты, дата последнего скана.
- `/n/[niche]` — дашборд: сводка, топ-10 находок, свежие «деньги», состояние чатов.
- `/n/[niche]/findings` — ядро: фильтры слева, список в центре, панель разметки
  справа (кластер с автодополнением, вердикт, комментарий, ссылка в Telegram).
  Разметка с горячими клавишами и оптимистичным обновлением.
- `/n/[niche]/report` — биграммы, триграммы, «упоминания денег», разбивка по чатам.
- `/n/[niche]/chats` — таблица чатов со статусами и панель discover; каналы
  помечены и по умолчанию не отмечаются.
- `/n/[niche]/scan` — параметры прогона, живой прогресс, лента событий, сводка.
- `/n/[niche]/settings` — запросы, шумовые паттерны, settings.
- `/login` — вход в Telegram: телефон, код, пароль двухфакторки.

### Структура (FSD)

```
app/       роутинг Next, провайдеры (React Query, Toast)
views/     композиция экранов (слой pages переименован: pages/ занимает Next)
widgets/   FindingsList, FiltersPanel, NotePanel, ScanConsole,
           NgramPanel, MoneyPanel, ChatsTable, DiscoverPanel
features/  annotate-finding, filter-findings, run-scan,
           discover-chats, edit-niche-config
entities/  niche, finding, chat, run — хуки, типы, ScoreBadge, VerdictChip, StatusDot
shared/    ui, api (client + types), config (constants, messages), lib
```

Импорты только вниз. Строки — в `shared/config/messages.ts`, типы API — в
`shared/api/types.ts`, запросы — хуками React Query в `entities/*/api/`.

### Визуал: графит и тёплая охра

```
Фон          #0E0E0F      Поверхности   #141416 / #1A1A1D
Границы      #26262A      Разделители   #202024
Текст        #ECECEE / #9A9AA2 / #6B6B73
Акцент       #C8944F      hover #D8A868, подложка 12% альфы
Статусы      #4E9A6B / #B4564F — точками, не заливками
```

Теней и градиентов нет: глубина — граница 1px и разница фонов на 2–4%.
Радиусы 8/12, шкала отступов 4/8/12/16/24/32. Inter для текста, JetBrains Mono
для чисел, score и ленты прогона. Score — моноширинное число плюс тонкая охряная
полоса относительной величины. Плотность высокая: рабочий инструмент.

Для каждого экрана с данными обязательны три состояния: loading (скелетон),
empty (текст + действие), error (сообщение + retry).

## Тесты

Бэкенд: pytest через `TestClient` — фильтры находок, разметка, конфиг,
запуск прогона и SSE с замоканным Telegram-клиентом. Сеть не нужна,
`TG_API_ID` не нужен.

Фронт: vitest на чистую логику — сборка фильтров в query-строку, форматтеры,
сортировки. Компонентных тестов нет.

## Порядок сборки

1. API-слой в `back/` + команда `serve` + тесты
2. Каркас Next: Tailwind-токены, `shared/ui`, провайдеры, FSD-скелет
3. Ниши + дашборд
4. Находки и разметка
5. Отчёт
6. Чаты и discover
7. Прогон со стримом
8. Настройки + заполненные `CLAUDE.md` и `DESIGN_SYSTEM.md`

## Решения, зафиксированные при обсуждении

- Реальный API с первого дня вместо моков.
- Next.js с App Router, а не Vite, — чтобы соблюсти `front/CLAUDE.md`.
- `front/` — отдельный git-репозиторий, история `back/` не переносится.
- Логин в Telegram: сначала только терминал, затем добавлена страница `/login`
  (см. раздел выше).
