# Дизайн-система painminer

Минимализм и сдержанная тёмная тема. Это рабочий инструмент с высокой
плотностью данных, а не витрина: глубина строится границей в 1px и разницей
фонов на 2–4%, теней и градиентов нет.

Источник правды по значениям — блок `@theme` в `app/globals.css`.
Tailwind v4 генерирует классы прямо из токенов: `--color-surface` → `bg-surface`.

## Цвета

| Токен | Значение | Роль |
|---|---|---|
| `bg` | `#0e0e0f` | фон страницы |
| `surface` | `#141416` | карточки, таблицы |
| `raised` | `#1a1a1d` | кнопки, скелетоны, наведение |
| `border` | `#26262a` | границы блоков |
| `divider` | `#202024` | разделители внутри блока |
| `text` | `#ececee` | основной текст |
| `muted` | `#9a9aa2` | вторичный текст |
| `faint` | `#6b6b73` | подписи, метаданные |
| `accent` | `#c8944f` | единственный цветной акцент, тёплая охра |
| `accent-hi` | `#d8a868` | наведение на акценте |
| `ok` | `#4e9a6b` | статус «в порядке» |
| `bad` | `#b4564f` | ошибки и недоступные чаты |

Акцент — один на весь интерфейс. Статусы показываем точкой (`StatusDot`) и
тонкой рамкой, а не заливкой: цвет не должен спорить с текстом находок.
Подложка акцента — `bg-accent/10`, граница — `border-accent/40`.

## Типографика
- Inter — текст, JetBrains Mono — числа, score, лента прогона
- H1: `text-2xl font-semibold` · H2: `text-sm font-medium` · Body: `text-sm`
- Метаданные: `text-xs text-faint`
- Всем числам — `tabular-nums`, иначе цифры пляшут по ширине

## Отступы и радиусы
- Шкала: 4, 8, 12, 16, 24, 32 — только из неё
- Радиусы: `rounded-md` (8px) для контролов, `rounded-lg` (12px) для карточек
- Ширина контента: `max-w-6xl`

## Компоненты (проверять СНАЧАЛА здесь — не плодить дубликаты)
- `Button` — `shared/ui/Button` (primary, secondary, ghost, danger; sm, md)
- `Input`, `Field` — `shared/ui/Input`
- `Card`, `CardHeader` — `shared/ui/Card`
- `Badge`, `StatusDot` — `shared/ui/Badge`
- `Skeleton`, `SkeletonList` — `shared/ui/Skeleton`
- `StateBlock`, `ErrorState` — `shared/ui/StateBlock`
- `ScoreBadge`, `FindingRow` — `entities/finding/ui`
- `ChatStatusBadge` — `entities/chat/ui`

Появятся по мере надобности: `Modal`, `Table`, `Select`, `Toast`.

## Состояния (обязательны для каждого экрана с данными)
- loading — `SkeletonList`, скелетон повторяет форму будущего контента
- empty — `StateBlock`: что произошло + что сделать дальше
- error — `ErrorState`: текст ошибки из `ApiError.humanMessage` + «Повторить»

## Score
Моноширинное число, под ним тонкая полоса доли от максимума в выборке
(`scoreRatio`). Полоса охряная, фон — `divider`. Так топ читается взглядом,
без сортировочных стрелок и лишнего цвета.
