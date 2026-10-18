# Family Marketplace — План доработок (15 пунктов, 4 этапа)

Единый большой этап разбит на 4 логических подэтапа для удобства реализации и проверки.
Порядок внутри этапа — строго по нумерации пунктов.

## Этапы

| Этап | Содержание | Пункты ТЗ |
|---|---|---|
| 1 | Исправления и реструктуризация UI ребёнка | 1, 2, 3, 4, 5, 6, 8 |
| 2 | Лимиты экрана и карманные деньги | 7 |
| 3 | Новые механики навыков (квесты, чтение, математика, дом) | 9, 10, 11, 12 |
| 4 | Родительская сторона: достижения | 13 |

## Зафиксированные допущения (пользователь отклонил уточняющие вопросы — решения приняты на основе ТЗ)

1. **Лимиты (п.7).** Лимиты задаются на ребёнка в новой секции родителя «Лимиты» (`/parent/children/{id}/limits`).
   Увеличения лимитов — это товары: к `products` добавляются поля `effect_type` (`LIMIT_ONCE` / `LIMIT_PERMANENT`),
   `effect_limit` (TV/PC/CONSOLE/PHONE/TABLET/POCKET), `effect_value` (минуты или рубли). Эффект применяется
   автоматически при подтверждении покупки родителем (статус `PAID`).
2. **Карманные деньги (п.7).** Отдельный недельный лимит в рублях без собственного магазина: ребёнок жмёт
   «рука с монеткой» → создаётся запрос → родитель подтверждает → остаток недельного лимита уменьшается,
   выдача фиксируется в журнале. В понедельник 09:00 остаток восстанавливается (вычисляется на лету).
   Куда ребёнок тратит деньги в реальном мире — вне приложения.
3. **Математика (п.11).** Родитель создаёт карточку целиком: название, сложность (EASY/MEDIUM/HARD),
   список заданий с правильными ответами (JSON), время на выполнение, награда (валюта+XP), редкость
   (COMMON/RARE/UNCOMMON/EPIC/LEGENDARY → Серый/Зелёный/Синий/Фиолетовый/Оранжевый), порог % успешных ответов,
   флаг скрытой награды. Ребёнок берёт 1 карту в день, остальные блокируются.
4. **Помощь по дому (п.12).** Реализуется той же сущностью `task_cards` (skill=HOUSE), но без редкости и
   порога %: награда = `house_bonus` (+n к `living_score` в календаре, максимум +6/день суммарно).
5. **Инвентарь (п.6).** Вкладка показывает все неиспользованные покупки всех магазинов, сгруппированные
   по товару в стопки (product_id, количество). Никаких статусов в UI. «Использовать» — предмет исчезает или
   количество уменьшается на 1. Предметы гардероба (item_type=WARDROBE) живут в «Гардеробе» (в «Мой Герой»),
   в общий инвентарь не попадают.
6. **Формат времени лимитов.** Все лимиты (кроме карманных денег) задаются родителем в минутах, ребёнку
   показываются в «ч ч мин». Расход считается в секундах (`limit_usage`), полоска уменьшается в реальном
   времени на клиенте, бэкенд — источник истины (счётчик синхронизируется при start/stop и при опросе).

---

## Этап 1. Исправления и реструктуризация UI ребёнка

### 1.1. Попап достижения не исчезает (п.1)
Файлы: `frontend/src/components/child/AchievementPopup.tsx`, `frontend/src/components/ChildDashboard.tsx:216`.
Причина бага: эффект не сбрасывает `current`, когда в `achievements` нет «свежих» элементов (например, после
перезагрузки списка пустым), а повторные срабатывания эффекта сбрасывают таймер и попап «зависает».
Решение:
- переписать на очередь попапов (показывать по одному, следующий — после закрытия предыдущего);
- таймер автоскрытия хранить в `useRef`, очищать при unmount и при смене `current`;
- добавить гарантированный сброс `setCurrent(null)` при отсутствии свежих достижений;
- кнопка «закрыть» (×) и CSS-анимация появления/исчезновения (фейд), класс `wow-popup` оставить.

### 1.2. Объединение вкладок «Квесты» и «Дейлики» (п.2)
- В `ChildDashboard.tsx:45` тип `Tab` и `TABS` — заменить `dailies` + `quests` на одну вкладку
  `quests` с лейблом «Квесты и Дейлики», иконка `ScrollText`.
- Создать `frontend/src/components/child/ChildQuestsDailiesTab.tsx`: секция «Дейлики на сегодня»
  (текущий `ChildDailiesTab`) + секция «Квесты ГМа» (текущий `ChildQuestsTab`).
- Удалить старые вкладки из TABS, старые компоненты оставить как внутренние части нового экрана.

### 1.3. «Мой Герой»: кликабельный портрет (п.3)
- В шапке `ChildDashboard.tsx` портрет (`child.avatarEmoji`) становится кнопкой, рядом подпись «Мой Герой».
- Клик открывает панель/модальное окно `MyHeroPanel.tsx` с 4 секциями, перенесёнными сюда:
  `ChildDepositsTab` (Банк), `ChildWardrobeTab` (Гардероб), `ChildWishlistTab` (Вишлист), `ChildOrdersTab` (Заказы).
- Из `TABS` и `main` убрать вкладки `wardrobe`, `deposit`, `wishlist`, `orders` и их обработку.
- Компоненты-вкладки не удалять — переиспользовать внутри панели.

### 1.4. Настройки — шестерёнка в шапке (п.4)
- Убрать вкладку `settings` из `TABS` и `main`.
- В шапке рядом с кнопкой «Выйти» (`ChildDashboard.tsx:231`) добавить кнопку-шестерёнку (`Settings` из lucide).
- Клик открывает `ChildSettingsTab` как модальное окно/панель (тема + виджеты главной).

### 1.5. Убрать «Твой путь», маркер «Неизвестная награда» (п.5)
- Убрать `<RankLadder />` из `ChildHomeTab.tsx:88` (компонент `RankLadder.tsx` больше не используется на главной).
- В `LevelBar.tsx` добавить логику: если `level + 1` равен минимальному уровню следующего ранга
  (`RANKS` из `lib/rpg.ts`), над шкалой показать шильдик
  «Неизвестная награда за достижения N-уровня», где N = `min` следующего ранга.
- Реализовать через `RANKS.find(r => r.min === level + 1)`.

### 1.6. Вкладка «Инвентарь» — стопки без статусов (п.6)
Бэкенд:
- `init.sql`: `inventory_items` — удалить зависимость от статуса (оставить колонки для обратной совместимости,
  новые записи — только `AVAILABLE`); при «использовании» запись удаляется.
- `InventoryService`: 
  - `childInventory(childId)` → агрегирует по `product_id`: `{productId, productName, storeId, storeName, icon?, price, currency, count}`;
  - `use(childId, productId)` → удаляет одну запись (или все сразу по UI) и применяет эффект товара
    (см. Этап 2 — эффекты; на Этапе 1 — просто списание);
  - для гардероба (`WARDROBE`) — предметы не попадают в этот список (см. допущение 5).
  - новые DTO `InventoryStackDto` (без полей статуса).
- `InventoryController`: `GET /child/inventory` → стопки; `POST /child/inventory/{productId}/use`.
Фронтенд:
- Новая вкладка `inventory` в `TABS` (иконка `Package`) → `ChildInventoryTab.tsx`
  (переиспользовать карточки, показывать количество ×N, кнопку «Использовать»).
- `InventoryTab.tsx` внутри модулей навыка — переключить на общий список/стопки.

### 1.7. Вкладка «Магазины» (п.8)
- `ChildShopsTab` уже существует (`ChildShopsTab.tsx`), но не подключена в `ChildDashboard`.
- Добавить вкладку `shops` (иконка `Store`), в `main` рендерить `ChildShopsTab` с данными `stores/products`.

### Итог Этапа 1: набор вкладок ребёнка
`Главная` · `Квесты и Дейлики` · `Магазины` · `Инвентарь` · `Навыки` · `Достижения`
(+ шестерёнка настроек и «Мой Герой» в шапке).

---

## Этап 2. Лимиты экрана и карманные деньги (п.7)

### 2.1. БД и сущности
Миграции в `init.sql`:
```sql
CREATE TABLE IF NOT EXISTS child_limits (
  child_id BIGINT PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE,
  tv_minutes INT NOT NULL DEFAULT 0,
  pc_minutes INT NOT NULL DEFAULT 0,
  console_minutes INT NOT NULL DEFAULT 0,
  phone_minutes INT NOT NULL DEFAULT 0,
  tablet_minutes INT NOT NULL DEFAULT 0,
  pocket_weekly INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS limit_usage (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  limit_type VARCHAR(20) NOT NULL,          -- TV / PC / CONSOLE / PHONE / TABLET
  day DATE NOT NULL,
  used_seconds INT NOT NULL DEFAULT 0,
  extended_seconds INT NOT NULL DEFAULT 0,  -- одноразовые увеличения на сегодня
  running BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  CONSTRAINT uq_limit_usage UNIQUE (child_id, limit_type, day)
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS effect_type VARCHAR(20) NOT NULL DEFAULT 'NONE';
ALTER TABLE products ADD COLUMN IF NOT EXISTS effect_limit VARCHAR(20);
ALTER TABLE products ADD COLUMN IF NOT EXISTS effect_value INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS pocket_requests (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pocket_disbursements (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
Новый пакет `com.familymarket.limit`: `ChildLimit`, `LimitUsage`, `PocketRequest`, `PocketDisbursement`,
репозитории, `LimitService`, `LimitController` (родитель) + `ChildLimitController` (ребёнок).
`Product.java` — поля `effectType/effectLimit/effectValue`; DTO `ProductDto/ProductUpsertRequest` расширить.

### 2.2. Бэкенд лимитов
- **Дневной сброс 09:00:** вычисляется на лету — день лимита «сегодня» = `now` в Europe/Moscow;
  если `now >= 09:00`, рабочий день = сегодня, иначе — вчера. При старте нового дня
  `limit_usage` строка создаётся с нулями (`used=0, extended=0`).
- **Остаток лимита** = `base + extended - used` (минуты), может быть > базового (одноразовое увеличение),
  отрицательным — нет (полоска на 0).
- `POST /child/limits/{type}/start` — `running=true, started_at=now`.
- `POST /child/limits/{type}/stop` — `used += now - started_at`.
- `GET /child/limits` — базовые лимиты, `used`, `extended`, остаток, `running` для каждого типа +
  карманные деньги: `weeklyLimit`, `spentThisWeek` (сумма `pocket_disbursements` за текущую неделю,
  неделя начинается в понедельник 09:00 МСК), `remaining`.
- **Применение эффектов (покупка):** в `PurchaseService.approve` (статус `PAID`):
  - `LIMIT_ONCE`: `limit_usage(today).extended_seconds += effect_value * 60`;
  - `LIMIT_PERMANENT`: `child_limits.{type} += effect_value`.
- **Карманные деньги:** `POST /child/pocket/request {amount}` → `pocket_requests(PENDING)`;
  `GET /parent/pocket-requests`; `POST /parent/pocket-requests/{id}/approve` → проверка остатка недели,
  создание `pocket_disbursements`, статус `APPROVED`; `reject` — `REJECTED`.

### 2.3. Родительский UI лимитов
- В `ChildrenTab` (или отдельной секции карточки ребёнка) — редактор лимитов:
  5 ползунков/инпутов в минутах + карманные деньги (₽/неделю) + список запросов карманных денег
  с кнопками «Выдать»/«Отклонить».
- В форме товара (`StoresTab`/`StoreView` родителя через `ProductsManager`) — блок «Эффект товара»:
  тип (нет/на день/постоянно), лимит (ТВ/ПК/приставка/телефон/планшет/карманные деньги), величина.

### 2.4. UI ребёнка — главный экран (п.7 + редизайн)
`ChildHomeTab.tsx` перекомпоновать:
- Левая колонка (≈40%): уменьшенная полоска опыта (компактный `LevelBar compact`, маркер из п.1.5) +
  блок «Лимиты дня»: 5 полосок (ТВ, Компьютер, Приставка, Телефон, Планшет) в формате «ч ч мин»
  с кнопкой `Play`/`Pause` (тикер 1 сек локально, синхронизация start/stop) + полоска «Карманные деньги,
  ₽/неделю» с кнопкой «рука с монеткой» (запрос выдачи).
- Правая колонка (≈60%): «Карта навыков» (`SkillHexagon`) — переносится сюда целиком.
- Ниже — остальные виджеты главной (балансы, статистика, достижения) и календарь уборки (Этап 3.5).
- Новый компонент `LimitsPanel.tsx` + хук `useLimitTicker` (локальный отсчёт + `POST stop`).

---

## Этап 3. Новые механики навыков

### 3.1. Квесты-стадии (!) → (?) (п.9)
БД:
```sql
ALTER TABLE quests ADD COLUMN IF NOT EXISTS basic_description VARCHAR(2000); -- описание на этапе (!)
ALTER TABLE quests ADD COLUMN IF NOT EXISTS accept_description VARCHAR(2000); -- описание на этапе (?)
ALTER TABLE quests ADD COLUMN IF NOT EXISTS duration_minutes INT;             -- таймер выполнения (опционально)
ALTER TABLE quests ADD COLUMN IF NOT EXISTS cooldown_hours INT NOT NULL DEFAULT 0; -- повторное взятие для повторяемых

CREATE TABLE IF NOT EXISTS child_quest_states (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  quest_id BIGINT NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',  -- AVAILABLE / ACTIVE / SUBMITTED / SLEEPING / DONE
  accepted_at TIMESTAMPTZ,
  starts_at TIMESTAMPTZ,
  next_available_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CONSTRAINT uq_child_quest UNIQUE (child_id, quest_id)
);
```
Бэкенд (`QuestService` + новый `ChildQuestState` репозиторий):
- `GET /child/quests` → квесты со статусом ребёнка и полями стадий:
  - `AVAILABLE` (!) — базовая карточка: icon, title, `basicDescription`, награда; кнопка «Взять квест»;
  - `ACTIVE` (?) — ребёнок взял: показывается `acceptDescription`, таймер (`durationMinutes`,
    обратный отсчёт), кнопка «Выполнено → на проверку» (`POST /child/quests/{id}/submit`);
  - `SUBMITTED` — на проверке (как сейчас `PENDING`);
  - `SLEEPING` — повторяемый после одобрения: в карточке таймер «до повторного взятия»
    (`next_available_at`), кнопка заблокирована;
  - `DONE` — одноразовый после одобрения: скрывается из списка.
- `POST /child/quests/{id}/accept` — из `AVAILABLE` в `ACTIVE` (создаёт state, `starts_at=now`),
  для повторяемого проверяется `next_available_at`.
- `submit` — проверка: статус `ACTIVE` (нельзя отправлять повторно); одноразовый запрет повторной подачи.
- `approve` родителем: одноразовый → `DONE`; повторяемый → `SLEEPING` с `next_available_at = now + cooldown_hours`.
- Родительский UI (`QuestsTab`): поля «Описание для принятия (этап !)», «Описание выполнения (этап ?)»,
  «Время на выполнение (мин)», «Перерыв между выполнениями (ч)» (для повторяемых).
Фронтенд ребёнка: переписать `ChildQuestsTab` под стадии (бейджи `!` / `?` / таймеры на карточках,
цветные состояния). Объединённая вкладка «Квесты и Дейлики» (п.1.2) использует новую версию.

### 3.2. Чтение: закладки страниц + дейлик (п.10)
БД:
```sql
CREATE TABLE IF NOT EXISTS reading_bookmarks (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  book_id BIGINT NOT NULL REFERENCES reading_books(id) ON DELETE CASCADE,
  page INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_bookmark UNIQUE (child_id, book_id)
);
```
- **Закладки страниц:** `POST /child/books/{id}/bookmark {page}` — сохраняет текущую страницу.
  Разница «сегодняшняя отметка − последняя предыдущая отметка» по той же книге засчитывается в дейлик чтения
  (пример ТЗ: 113 → 213 = +100 страниц). При смене книги счётчик начинается с текущей страницы новой книги.
  Хранить историю отметок за день можно как отдельную таблицу
  `reading_page_marks (child_id, book_id, page, day, created_at)` — по ней считается сумма дельт за день.
- **Дейлик READING** (`DailyService` + `DailySkillDto`): цель «страниц в день» и награду (валюта магазина
  Чтение + XP) задаёт родитель — хранить в `child_limits`-подобной таблице или в настройках магазина
  (новая таблица `reading_settings (child_id, store_id, pages_target, reward_amount, xp_reward)`,
  редактирование — в родительском `BooksManager`).
  Выполнение: `pages_today >= pages_target` → очки начисляются (1 раз в день), дейлик `completed=true`.
- **Подтверждение прочтения книги:** существующий flow `POST /child/books/{id}/read` → `reading_logs`
  (PENDING) → родитель подтверждает в `BooksManager` → баллы зачисляются. Улучшить UX: в
  `ChildReadingView` карточка книги с кнопкой «Я прочитал» и строкой «указать текущую страницу»
  (инпут + сохранение закладки), в статистике — прогресс чтения (страница X из N).
- `ChildReadingView` и `SkillsGrid` config READING (`lib/skills.ts`) — обновить `loadQuests`/`loadStats`
  для дейлика страниц.

### 3.3. Математика: «Карточки с заданиями» (п.11)
БД (`task_cards` + `child_task_cards` — см. допущение 3):
```sql
CREATE TABLE IF NOT EXISTS task_cards (
  id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,
  child_id BIGINT REFERENCES children(id) ON DELETE CASCADE,
  skill VARCHAR(20) NOT NULL,                      -- MATH / HOUSE
  title VARCHAR(255) NOT NULL,
  description VARCHAR(2000),
  icon VARCHAR(64) NOT NULL DEFAULT '🎴',
  difficulty VARCHAR(20) NOT NULL DEFAULT 'EASY',  -- EASY / MEDIUM / HARD
  tasks_json VARCHAR(8000) NOT NULL,               -- [{"q":"1+1","a":"2"}, ...]
  duration_minutes INT NOT NULL,
  reward_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  reward_store_id BIGINT REFERENCES stores(id) ON DELETE SET NULL,
  xp_reward INT NOT NULL DEFAULT 0,
  house_bonus INT NOT NULL DEFAULT 0,              -- для HOUSE: +n к living_score
  rarity VARCHAR(20) NOT NULL DEFAULT 'COMMON',    -- COMMON/RARE/UNCOMMON/EPIC/LEGENDARY
  hidden_reward BOOLEAN NOT NULL DEFAULT FALSE,    -- скрытая награда (стейк редкости)
  success_percent INT NOT NULL DEFAULT 80,         -- порог успешных ответов для награды
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS child_task_cards (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  card_id BIGINT NOT NULL REFERENCES task_cards(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PARENT', -- PENDING_PARENT/REVEALED/IN_PROGRESS/DONE/FAILED
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  answers_json VARCHAR(8000),
  result_percent INT,
  CONSTRAINT uq_child_card UNIQUE (child_id, card_id, day)
);
```
Бэкенд (`com.familymarket.taskcard`):
- Родитель: `GET/POST/PUT/DELETE /parent/task-cards?skill=MATH` (создание карточки: список заданий-формы,
  сложность, время, награда, редкость, порог %, флаг скрытой награды).
- Ребёнок:
  - `GET /child/task-cards?skill=MATH` — доступные карточки: сложность, награда (или «???» при
    `hidden_reward` + намёк на редкость цветом), время; блокировка «взято 1 в день»;
  - `POST /child/task-cards/{id}/take` — запрос родителю (`PENDING_PARENT`), остальные карточки
    блокируются на день;
  - `POST /parent/task-card-requests/{id}/approve|reject` — родитель подтверждает/отклоняет;
  - после одобрения карта раскрывается (`REVEALED`): виден список заданий, стартует таймер
    (`durationMinutes`) → `POST /child/task-cards/{id}/submit {answers}` до истечения;
  - подсчёт `result_percent`; награда выдается если `result_percent >= success_percent`
    (для `hidden_reward` — только сообщение о редкости награды);
  - `DONE`/`FAILED` → карточка становится недоступной на сегодня.
- Редкость → цвет в UI: COMMON — серый, RARE — зелёный, UNCOMMON — синий, EPIC — фиолетовый,
  LEGENDARY — оранжевый.
- В модуле математики вкладку «Запросы» (`SkillModule` TAB `requests`) переименовать в
  «Карточки с заданиями» (`lib/skills.ts` MATH: `requestTitle`), контент — новый компонент
  `TaskCardsTab` (на базе `RequestsTab`).

### 3.4. Дом: проверка комнаты, календарь на главной (п.12)
БД:
```sql
CREATE TABLE IF NOT EXISTS house_check_requests (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  room_score INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT uq_house_check UNIQUE (child_id, day)
);
```
- **Календарь уборки на главной:** секция «Календарь уборки» в `ChildHomeTab` (компактный вид
  `ChildHouseView`, месяц с оценками комнаты `room_score`).
- **Напоминалка:** если сегодня нет `room_score > 0` и не было запроса — баннер «Убери комнату!»,
  кнопка «Отметить убранной». 
- **Клик на сегодняшний день:** календарь становится интерактивным: клик по сегодняшней ячейке →
  `POST /child/stores/{id}/house/check-request` → запрос родителю.
- **Родитель:** `GET /parent/house-check-requests`, `approve` → `house_days(day).room_score = +1`
  (плюсовая оценка), `reject` → `REJECTED`.
- **Дейлик HOUSE:** факт проверенной комнаты (room_score>0 сегодня) или помощь (living_score>0) →
  дейлик выполнен; реализуется в `DailyService` (skill=HOUSE): запись в `daily_logs` при подтверждении,
  награда — из настроек (валюта магазина Дом + XP).
- **Модуль «Порядок в комнате»:** убрать вкладку «Архив» (календарь переезжает на главную),
  «Запросы» → «Помощь по дому» (`SkillModule` для HOUSE: TABS = Помощь по дому / Магазин / Покупки /
  Статистика; `lib/skills.ts` HOUSE: `requestTitle='Помощь по дому'`).

### 3.5. Дом: «Помощь по дому» — карточки (п.12)
- Использует `task_cards` (skill=HOUSE): родитель создаёт карточку (title, description, difficulty,
  duration_minutes, `house_bonus` 1..6, active), ребёнку карточки видны только когда `active=true`.
- Механика: карточки можно брать без ограничения по числу в день, но **одна активная одновременно**
  (взял одну — остальные блокируются до завершения). `POST /child/house-help/{id}/accept` →
  `ACTIVE` + таймер; `POST /child/house-help/{id}/submit` → отчёт родителю
  (`child_task_cards.status=PENDING_PARENT` или выделенная колонка `house_bonus`).
- `POST /parent/house-help-requests/{id}/approve` → в `house_days(living_score)` добавить
  `house_bonus` (автоматически +n в календаре), суммарный `living_score` за день ≤ 6.
- Родительский UI: в модальном окне навыка «Дом» или `HouseCalendar` (родительская версия) —
  список карточек с кнопками создать/редактировать/активировать + очередь подтверждений.

---

## Этап 4. Родительская сторона: достижения (п.13)

### 4.1. Кнопка «+ ещё уровень» и тиры вместо цифр
Бэкенд:
- `POST /parent/achievements/{id}/add-level` — создаёт следующую ступень достижения:
  - базовое достижение (level=0, groupKey=null) → генерируем `group_key` (uuid/slug от имени),
    копируем icon/награду/цель, `level = 1`;
  - у существующей группы — `level = max(level в группе)+1`, копия полей, `levelName`-тир;
  - ответом возвращает созданное достижение и обновлённую группу.
- В `AchievementUpsertRequest`/форме: убрать обязательность `groupKey` и `level` (при создании
  одиночного — `groupKey=null`, `level=0`).
- Маппинг тиров (`levelName` в `ChildAchievementGroupDto` и пр.): 1 → Бронза, 2 → Серебро, 3 → Золото,
  4 → Платина, 5 → Изумруд, 6+ → Алмаз; **одиночные (level=0) → Золото**.
- `AchievementService.checkProgress`/`groupByLevel` — работа с тирами без изменения логики (level как раньше).

Фронтенд (`AchievementsTab.tsx`, `ChildAchievementsTab.tsx`, `ChildHomeTab upcoming`, `lib/achievementTiers.ts`):
- В форме: убрать поля «Группа» и «Уровень».
- На карточке достижения — кнопка «+» → модалка «Новый уровень достижения» (имя по умолчанию
  «{Имя} · {Тир}», цель и награда предзаполнены из предыдущей ступени, можно изменить) →
  `POST /parent/achievements/{id}/add-level`.
- Все места отображения уровня (карточки, попап, ближайшие достижения): «Ур. 1» → «Бронза»,
  «Ур. 3» → «Золото», одиночные — «Золото» с золотой рамкой.
- `tierForLevel`: адаптировать для level=0 → Золото (одиночные), а цепочку Бронза/Серебро/Золото/… сохранить.

---

## Зона влияния изменений (файлы)

**Бэкенд (новое):** `com.familymarket.limit` (ChildLimit, LimitUsage, PocketRequest, PocketDisbursement,
репозитории, LimitService, Controllers), `com.familymarket.taskcard` (TaskCard, ChildTaskCard, репозитории,
TaskCardService, Controllers), `com.familymarket.quest.ChildQuestState`, `com.familymarket.reading.Bookmark`
(+ репозиторий), `com.familymarket.house.HouseCheckRequest` (+ репозиторий).
**Бэкенд (правки):** `init.sql`, `Product.java`, `PurchaseService` (эффекты), `Quest*`, `Reading*`,
`DailyService` (skills READING/HOUSE), `MathService` (интеграция карточек), `House*`,
`AchievementService` (+addLevel), DTO (InventoryStackDto, LimitDto, TaskCardDto, ...), `SecurityConfig`
(новые маршруты под существующими паттернами `/parent/**`, `/child/**`).
**Фронтенд (новое):** `MyHeroPanel.tsx`, `ChildInventoryTab.tsx`, `LimitsPanel.tsx` (+ хук),
`ChildQuestsDailiesTab.tsx`, `TaskCardsTab.tsx`, `HouseHelpTab.tsx`, тип-хелперы `lib/limits.ts`.
**Фронтенд (правки):** `ChildDashboard.tsx` (навигация), `ChildHomeTab.tsx` (редизайн),
`AchievementPopup.tsx`, `LevelBar.tsx`, `ChildQuestsTab.tsx`, `ChildDailiesTab.tsx`,
`ChildReadingView.tsx`, `ChildHouseView.tsx`, `SkillModule.tsx`/`lib/skills.ts` (вкладки),
`api/types.ts`, `QuestsTab.tsx` (родитель), `AchievementsTab.tsx` (родитель),
`InventoryTab.tsx`→стопки, менеджеры родителя (BooksManager, HouseCalendar, ChildrenTab).

## Проверка по завершении (для каждого этапа)

- `backend`: `./gradlew bootRun` поднимается, `init.sql` идемпотентен (повторный запуск без ошибок).
- `frontend`: `npm run dev` без ошибок типов/TSC; ручная проверка сценариев этапа (детский ключ + родитель).
- Миграции не ломают существующие данные (старые `inventory_items`, `quest_submissions`, `achievements`).