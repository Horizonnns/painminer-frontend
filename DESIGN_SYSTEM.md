# Дизайн-система [Проект]

<!-- Кладётся в корень репо как DESIGN_SYSTEM.md. Источник правды по визуалу.
     Заменить [плейсхолдеры] реальными значениями. Значения в Tailwind-классах
     должны совпадать с tailwind.config.ts. -->

## Цвета
- Primary: [bg-brand-500 (#5B4FFF)]
- Success: [bg-green-500]
- Error: [bg-red-500]
- Warning: [bg-amber-500]
- Текст/фон/границы: [из палитры проекта]

## Типографика
- H1: [text-3xl font-semibold]
- H2: [text-2xl font-semibold]
- H3: [text-xl font-medium]
- Body: [text-sm]
- Caption: [text-xs text-gray-500]

## Отступы
- Шкала: [4, 8, 12, 16, 24, 32] — только из шкалы, не произвольные значения

## Компоненты (проверять СНАЧАЛА здесь — не плодить дубликаты)
- Button — `shared/ui/Button` (варианты: [primary, secondary, ghost, danger])
- Input — `shared/ui/Input`
- Modal — `shared/ui/Modal`
- Table — `shared/ui/Table`
- [Select, Checkbox, Toast, Card — по мере роста]

## Состояния (обязательны для каждого экрана с данными)
- loading — [скелетон / спиннер]
- empty — [иллюстрация + текст + действие]
- error — [сообщение + retry]

## Иконки
- Источник: [lucide-react], размер по умолчанию [16 / 20]
