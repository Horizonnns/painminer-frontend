# painminer / front — правила разработки

Интерфейс к painminer: смотреть находки, размечать их в кластеры болей,
запускать прогоны. Бэкенд — Python CLI + SQLite в соседнем `../back`,
общение только через его HTTP-слой.

## Стек
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 — токены в `app/globals.css`, блок `@theme`
- React Query (`@tanstack/react-query`) — серверные данные
- Zustand — клиентское состояние, когда понадобится (пока не нужен)
- FSD (Feature-Sliced Design)
- Иконки — `lucide-react`
- Тесты — vitest на чистой логике (`npm test`)

## Архитектура (FSD)
- `app/` — роутинг Next и провайдеры
- `views/` — pages layer, композиция экранов
- `widgets/` — крупные UI-блоки
- `features/` — бизнес-фичи
- `entities/` — доменные сущности
- `shared/` — переиспользуемое

Импорты только вниз: views → widgets → features → entities → shared.
НИКОГДА обратных импортов.

**Почему `views/`, а не `pages/`:** каталог `pages/` в корне Next занимает
Pages Router и превращает содержимое в маршруты. Слой переименован, роль та же.

## Бэкенд
- База URL: `NEXT_PUBLIC_API_URL`, по умолчанию `http://127.0.0.1:8765/api`
- Поднимается командой `painminer serve` в `../back`
- Контракт и формы данных: `../front/docs/superpowers/specs/2026-08-23-painminer-ui-design.md`
- Прогресс прогона приходит по SSE: `GET /runs/{id}/events`

## Соглашения по коду
- Константы → `shared/config/constants.ts`
- Строки/тексты → `shared/config/messages.ts` (не хардкодить)
- Типы API → `shared/api/types.ts` (не писать inline-типы), зеркалят
  `../back/painminer/api/schemas.py`
- Запросы → только через `shared/api/client.ts`, обёрнутые в хуки React Query
  в `entities/<name>/api/queries.ts`
- Бизнес-логика → `features/<name>/model/`, UI → `features/<name>/ui/`
- Компонент > ~150 строк — разбить

## UI / дизайн
- Только Tailwind, без inline styles (исключение — вычисляемая ширина полосок)
- Цвета только из токенов `@theme` (см. DESIGN_SYSTEM.md), не хардкод
- Шкала отступов: 4, 8, 12, 16, 24, 32
- Все состояния обязательны: loading (скелетон), empty, error + retry
- Доступность: семантика, ARIA где нужно, контраст AA

## Приватность
В интерфейсе нет и не должно быть автора сообщения — ни имени, ни username,
ни id. Собираем формулировки проблем, а не профили участников чатов.
Ссылка на сообщение в Telegram — единственный путь к первоисточнику.

## Что НЕ делать
- Не создавать UI-примитивы, если есть в `shared/ui/` (см. DESIGN_SYSTEM.md)
- Не дублировать логику — сначала проверить `shared/lib/`
- Не хардкодить строки — брать из `shared/config/messages.ts`
- Не писать inline-типы — все типы в `shared/api/types.ts`
- Не ходить в API мимо `shared/api/client.ts`
- Не показывать авторов сообщений
