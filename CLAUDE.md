# [Проект] — правила разработки

<!-- Кладётся в корень репо как CLAUDE.md. Автозагружается каждую сессию.
     Заменить все [плейсхолдеры] на реальные значения проекта. -->

## Стек
- [Next.js 16 (App Router) / другой] + TypeScript
- [Tailwind CSS / …]
- [Zustand — клиентское состояние; React Query — серверные данные]
- [FSD (Feature-Sliced Design) / другая архитектура]

## Архитектура (FSD)
- `app/` — роутинг [Next.js]
- `pages/` — pages layer (композиция экранов)
- `widgets/` — крупные UI-блоки
- `features/` — бизнес-фичи
- `entities/` — доменные сущности
- `shared/` — переиспользуемое

Импорты только вниз: pages → widgets → features → entities → shared.
НИКОГДА обратных импортов.

## Соглашения по коду
- Константы → `shared/config/constants.ts`
- Строки/тексты → `shared/config/messages.ts` (не хардкодить)
- Типы API → `shared/api/types.ts` (не писать inline-типы)
- Запросы → React Query hooks в `entities/[name]/api/`
- Бизнес-логика → `features/[name]/model/`, UI → `features/[name]/ui/`
- Компонент > ~150 строк — разбить

## UI / дизайн
- Только Tailwind, без inline styles
- Цвета из `tailwind.config.ts`, не хардкод (см. DESIGN_SYSTEM.md)
- Иконки из [lucide-react]
- Шкала отступов: [4, 8, 12, 16, 24, 32]
- Все состояния обязательны: loading, empty, error
- Доступность: семантика, ARIA где нужно, контраст AA

## Готовность к API
- Все данные через типизированные хуки (`useProducts`, `useOrders`)
- Хуки готовы с типами, пока возвращают mock из `shared/api/mock/[entity].ts`
- Замена моков на бэк = замена только `queryFn`, экраны не трогаются

## Что НЕ делать
- Не создавать UI-примитивы, если есть в `shared/ui/` (см. DESIGN_SYSTEM.md)
- Не дублировать логику — сначала проверить `shared/lib/`
- Не хардкодить строки — брать из `shared/config/messages.ts`
- Не писать inline-типы — все типы в отдельных файлах
- [проектные запреты]
