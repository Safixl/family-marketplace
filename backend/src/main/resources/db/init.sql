-- Схема Family Marketplace
-- Выполняется автоматически при старте приложения (spring.sql.init), идемпотентно.

CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS children (
    id           BIGSERIAL PRIMARY KEY,
    parent_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    avatar_emoji VARCHAR(16)  NOT NULL DEFAULT '😊',
    access_key   VARCHAR(64)  NOT NULL UNIQUE,
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stores (
    id            BIGSERIAL PRIMARY KEY,
    parent_id     BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name          VARCHAR(150) NOT NULL,
    description   VARCHAR(2000),
    currency_name VARCHAR(50)  NOT NULL DEFAULT 'монета',
    currency_icon VARCHAR(16)  NOT NULL DEFAULT '🪙',
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Тип шаблона магазина: READING / MATH / HOME / LOGIC / LANG / SPORT / NULL (обычный магазин)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS template_type VARCHAR(32);
-- Магазин «Гардероб Героя»: покупки попадают в Инвентарь А (цифровая кастомизация)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS wardrobe BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS products (
    id              BIGSERIAL PRIMARY KEY,
    store_id        BIGINT        NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    name            VARCHAR(150)  NOT NULL,
    description     VARCHAR(2000),
    price           NUMERIC(12,2) NOT NULL,
    limit_per_child INT,
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS balances (
    id         BIGSERIAL PRIMARY KEY,
    child_id   BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    store_id   BIGINT        NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_balances_child_store UNIQUE (child_id, store_id)
);

CREATE TABLE IF NOT EXISTS achievements (
    id            BIGSERIAL PRIMARY KEY,
    parent_id     BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name          VARCHAR(150)  NOT NULL,
    description   VARCHAR(2000),
    icon          VARCHAR(64)   NOT NULL DEFAULT '🏆',
    reward_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Цель достижения: NONE / READING_BOOKS / READING_PAGES / MATH_TASKS / HOUSE_DAYS /
-- POINTS_EARNED / MATH_STREAK / HOUSE_CLEAN_STREAK / HOUSE_HELP_STREAK / HOME_PURCHASES
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS target_type VARCHAR(32) NOT NULL DEFAULT 'NONE';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS target_value INT NOT NULL DEFAULT 0;
-- Многоуровневые достижения: общий ключ группы + номер уровня
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS group_key VARCHAR(64);
-- Направление развития (навык): MATH / READING / LOGIC / LANG / SPORT / HOUSE
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS skill VARCHAR(32);
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 0;
-- Скрытая награда (видна ребёнку только после достижения цели)
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS hidden_reward BOOLEAN NOT NULL DEFAULT FALSE;
-- Магазин, в который автоматически начисляется награда при достижении
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS reward_store_id BIGINT REFERENCES stores (id) ON DELETE SET NULL;

-- Вишлист ребёнка (пункты, которые он хочет)
CREATE TABLE IF NOT EXISTS wishlist_items (
    id         BIGSERIAL PRIMARY KEY,
    child_id   BIGINT       NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    title      VARCHAR(500) NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- Ссылка, цена и степень желания (1..5) в вишлисте
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS link VARCHAR(1000);
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS price NUMERIC(12,2);
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS desire INT NOT NULL DEFAULT 3;
CREATE INDEX IF NOT EXISTS idx_wishlist_child ON wishlist_items (child_id);

CREATE TABLE IF NOT EXISTS child_achievements (
    id             BIGSERIAL PRIMARY KEY,
    child_id       BIGINT      NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    achievement_id BIGINT      NOT NULL REFERENCES achievements (id) ON DELETE CASCADE,
    unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_child_achievements UNIQUE (child_id, achievement_id)
);

-- Уведомления родителя: запросы/отбивки ребёнка, требующие ответа, и события (исчерпание лимита)
CREATE TABLE IF NOT EXISTS parent_notifications (
    id         BIGSERIAL PRIMARY KEY,
    parent_id  BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    child_id   BIGINT       REFERENCES children (id) ON DELETE CASCADE,
    type       VARCHAR(40)  NOT NULL,   -- QUEST / CARD_REVEAL / CARD_HELP / HOUSE_CHECK / POCKET / READING_DONE / BOOK_REQUEST / LIMIT_TV ...
    title      VARCHAR(255) NOT NULL,
    payload    VARCHAR(2000),
    ref_type   VARCHAR(40),
    ref_id     BIGINT,
    status     VARCHAR(20)  NOT NULL DEFAULT 'NEW',  -- NEW / DONE
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_parent_notif_parent ON parent_notifications (parent_id, status);

-- Активированные навыки детей: какие направления включены конкретному ребёнку
CREATE TABLE IF NOT EXISTS skill_activations (
    id         BIGSERIAL PRIMARY KEY,
    child_id   BIGINT      NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    skill      VARCHAR(40) NOT NULL,   -- READING / MATH / LOGIC / LANG / SPORT / HOME
    store_id   BIGINT      REFERENCES stores (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_skill_activations UNIQUE (child_id, skill)
);
CREATE INDEX IF NOT EXISTS idx_skill_activations_child ON skill_activations (child_id);

-- Достижения, которые ребёнок отслеживает (появляются на главной)
CREATE TABLE IF NOT EXISTS child_tracked_achievements (
    id             BIGSERIAL PRIMARY KEY,
    child_id       BIGINT      NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    achievement_id BIGINT      NOT NULL REFERENCES achievements (id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_child_tracked UNIQUE (child_id, achievement_id)
);
CREATE INDEX IF NOT EXISTS idx_child_tracked_child ON child_tracked_achievements (child_id);

CREATE TABLE IF NOT EXISTS purchases (
    id           BIGSERIAL PRIMARY KEY,
    child_id     BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    store_id     BIGINT        NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    product_id   BIGINT        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    amount       NUMERIC(12,2) NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMPTZ
);

-- Инвентарь ребёнка: купленные, но ещё не использованные товары.
-- Статус: AVAILABLE (доступен) / ACTIVATION_PENDING (запрос на активацию) / ACTIVATED (использован)
CREATE TABLE IF NOT EXISTS inventory_items (
    id          BIGSERIAL PRIMARY KEY,
    child_id    BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    store_id    BIGINT        NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    product_id  BIGINT        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    purchase_id BIGINT        NOT NULL REFERENCES purchases (id) ON DELETE CASCADE,
    status      VARCHAR(20)   NOT NULL DEFAULT 'AVAILABLE',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_inventory_child ON inventory_items (child_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items (status);

-- Каталог книг магазина «Чтение» (личные книги ребёнка)
CREATE TABLE IF NOT EXISTS reading_books (
    id         BIGSERIAL PRIMARY KEY,
    store_id   BIGINT        NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    child_id   BIGINT        REFERENCES children (id) ON DELETE CASCADE,
    name       VARCHAR(255)  NOT NULL,
    author     VARCHAR(255),
    series     VARCHAR(255),
    genre      VARCHAR(100),
    pages      INT           NOT NULL DEFAULT 0,
    multiplier NUMERIC(5,2)  NOT NULL DEFAULT 1,
    active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Отметки о прочитанных книгах: PENDING (ждёт подтверждения) / APPROVED / REJECTED
CREATE TABLE IF NOT EXISTS reading_logs (
    id         BIGSERIAL PRIMARY KEY,
    child_id   BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    book_id    BIGINT        NOT NULL REFERENCES reading_books (id) ON DELETE CASCADE,
    points     NUMERIC(12,2) NOT NULL DEFAULT 0,
    status     VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    read_at    DATE          NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Заявки ребёнка на книги (название или ссылка на книгу, которую он читает)
CREATE TABLE IF NOT EXISTS reading_requests (
    id          BIGSERIAL PRIMARY KEY,
    child_id    BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    store_id    BIGINT        NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    title       VARCHAR(500)  NOT NULL,
    status      VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- Задачи магазина «Математика» (личные задачи ребёнка)
CREATE TABLE IF NOT EXISTS math_tasks (
    id          BIGSERIAL PRIMARY KEY,
    store_id    BIGINT        NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    child_id    BIGINT        REFERENCES children (id) ON DELETE CASCADE,
    title       VARCHAR(255)  NOT NULL,
    description VARCHAR(2000),
    answer      VARCHAR(255)  NOT NULL,
    points      NUMERIC(12,2) NOT NULL DEFAULT 0,
    active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Попытки решения задач
CREATE TABLE IF NOT EXISTS math_attempts (
    id           BIGSERIAL PRIMARY KEY,
    task_id      BIGINT        NOT NULL REFERENCES math_tasks (id) ON DELETE CASCADE,
    child_id     BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    answer       VARCHAR(255)  NOT NULL,
    correct      BOOLEAN       NOT NULL DEFAULT FALSE,
    points       NUMERIC(12,2) NOT NULL DEFAULT 0,
    attempted_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Календарь магазина «Дом»: оценки по дням (комната -2..+2, помощь -3..+6)
-- Баллы начисляются 1-го числа следующего месяца (settled = TRUE после начисления)
CREATE TABLE IF NOT EXISTS house_days (
    id           BIGSERIAL PRIMARY KEY,
    store_id     BIGINT        NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    child_id     BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    day          DATE          NOT NULL,
    room_score   INT           NOT NULL DEFAULT 0,
    living_score INT           NOT NULL DEFAULT 0,
    points       NUMERIC(12,2) NOT NULL DEFAULT 0,
    settled      BOOLEAN       NOT NULL DEFAULT FALSE,
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_house_days UNIQUE (store_id, child_id, day)
);
ALTER TABLE house_days ADD COLUMN IF NOT EXISTS comment VARCHAR(2000);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_children_parent        ON children (parent_id);
CREATE INDEX IF NOT EXISTS idx_children_access_key    ON children (access_key);
CREATE INDEX IF NOT EXISTS idx_stores_parent          ON stores (parent_id);
CREATE INDEX IF NOT EXISTS idx_products_store         ON products (store_id);
CREATE INDEX IF NOT EXISTS idx_balances_child         ON balances (child_id);
CREATE INDEX IF NOT EXISTS idx_balances_store         ON balances (store_id);
CREATE INDEX IF NOT EXISTS idx_achievements_parent    ON achievements (parent_id);
CREATE INDEX IF NOT EXISTS idx_child_ach_child        ON child_achievements (child_id);
CREATE INDEX IF NOT EXISTS idx_child_ach_achievement  ON child_achievements (achievement_id);
CREATE INDEX IF NOT EXISTS idx_purchases_child        ON purchases (child_id);
CREATE INDEX IF NOT EXISTS idx_purchases_store        ON purchases (store_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status       ON purchases (status);
CREATE INDEX IF NOT EXISTS idx_reading_books_store    ON reading_books (store_id);
CREATE INDEX IF NOT EXISTS idx_reading_books_child    ON reading_books (child_id);
CREATE INDEX IF NOT EXISTS idx_reading_logs_child     ON reading_logs (child_id);
CREATE INDEX IF NOT EXISTS idx_reading_logs_book      ON reading_logs (book_id);
CREATE INDEX IF NOT EXISTS idx_reading_requests_child ON reading_requests (child_id);
CREATE INDEX IF NOT EXISTS idx_math_tasks_store       ON math_tasks (store_id);
CREATE INDEX IF NOT EXISTS idx_math_tasks_child       ON math_tasks (child_id);
CREATE INDEX IF NOT EXISTS idx_math_attempts_task     ON math_attempts (task_id);
CREATE INDEX IF NOT EXISTS idx_math_attempts_child    ON math_attempts (child_id);
CREATE INDEX IF NOT EXISTS idx_house_days_store       ON house_days (store_id);
CREATE INDEX IF NOT EXISTS idx_house_days_child       ON house_days (child_id);

-- ============================================================
-- «Дейлики» — RPG-механики: квесты ГМа, сезонные ивенты,
-- ежедневные дейлики, депозиты, кастомизация аватара, титулы
-- ============================================================

-- Возраст ребёнка (5-16): влияет на сложность дейликов и масштаб цен
ALTER TABLE children ADD COLUMN IF NOT EXISTS age INT;

-- Тип инвентаря: COUPON (купон-снадобье) / WARDROBE (цифровая кастомизация)
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(20) NOT NULL DEFAULT 'COUPON';

-- Общий опыт за ачивку и титул персонажа
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS xp_reward INT NOT NULL DEFAULT 0;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS title VARCHAR(100);
-- Дефолтный XP достижений: ступени 10…860, одиночные 130 (миграция старых комплектов, идемпотентно)
UPDATE achievements SET xp_reward = CASE
    WHEN level = 0 THEN 130
    WHEN level = 1 THEN 10
    WHEN level = 2 THEN 25
    WHEN level = 3 THEN 50
    WHEN level = 4 THEN 85
    WHEN level = 5 THEN 130
    WHEN level = 6 THEN 190
    WHEN level = 7 THEN 270
    WHEN level = 8 THEN 370
    WHEN level = 9 THEN 500
    WHEN level = 10 THEN 660
    WHEN level >= 11 THEN 860
    ELSE xp_reward
END
WHERE skill IN ('READING','MATH','HOUSE') AND group_key IS NOT NULL;

-- Дедупликация дефолтных достижений: гонка при первом обращении могла создать несколько комплектов
-- (оставляем самую старую запись по каждому parent_id + group_key + level)
DELETE FROM achievements
WHERE id IN (
    SELECT id FROM (
        SELECT id, row_number() OVER (PARTITION BY parent_id, group_key, level ORDER BY id) AS rn
        FROM achievements
        WHERE group_key IS NOT NULL
    ) t
    WHERE t.rn > 1
);
-- Уникальность дефолтных достижений (защита от повторной гонки)
CREATE UNIQUE INDEX IF NOT EXISTS uq_achievements_parent_group_level
    ON achievements (parent_id, group_key, level);

-- Сезонные ивенты: ограниченное время, валюта-жетоны
CREATE TABLE IF NOT EXISTS seasonal_events (
    id          BIGSERIAL PRIMARY KEY,
    parent_id   BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    description VARCHAR(2000),
    token_name  VARCHAR(50)  NOT NULL DEFAULT 'жетон',
    token_icon  VARCHAR(16)  NOT NULL DEFAULT '🎟️',
    starts_at   DATE         NOT NULL,
    ends_at     DATE         NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Сезонный магазин: обычный магазин, привязанный к ивенту
ALTER TABLE stores ADD COLUMN IF NOT EXISTS seasonal_event_id BIGINT REFERENCES seasonal_events (id) ON DELETE SET NULL;

-- Квесты ГМа: DAILY (дейлик) / STORY (сюжетный) / SEASONAL (сезонный)
CREATE TABLE IF NOT EXISTS quests (
    id                BIGSERIAL PRIMARY KEY,
    parent_id         BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    child_id          BIGINT        REFERENCES children (id) ON DELETE CASCADE,
    type              VARCHAR(20)   NOT NULL DEFAULT 'STORY',
    title             VARCHAR(255)  NOT NULL,
    description       VARCHAR(2000),
    icon              VARCHAR(64)   NOT NULL DEFAULT '📜',
    reward_store_id   BIGINT        REFERENCES stores (id) ON DELETE SET NULL,
    reward_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    xp_reward         INT           NOT NULL DEFAULT 0,
    seasonal_event_id BIGINT        REFERENCES seasonal_events (id) ON DELETE SET NULL,
    repeatable        BOOLEAN       NOT NULL DEFAULT FALSE,
    active            BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quests_parent ON quests (parent_id);
CREATE INDEX IF NOT EXISTS idx_quests_child  ON quests (child_id);
CREATE INDEX IF NOT EXISTS idx_quests_type   ON quests (type);

-- Заявки ребёнка на выполнение квеста: PENDING / APPROVED / REJECTED
CREATE TABLE IF NOT EXISTS quest_submissions (
    id          BIGSERIAL PRIMARY KEY,
    quest_id    BIGINT        NOT NULL REFERENCES quests (id) ON DELETE CASCADE,
    child_id    BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    status      VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    comment     VARCHAR(1000),
    photo_url   VARCHAR(1000),
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_quest_submissions_quest  ON quest_submissions (quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_submissions_child  ON quest_submissions (child_id);
CREATE INDEX IF NOT EXISTS idx_quest_submissions_status ON quest_submissions (status);

-- Депозиты «Личный инвест-фонд»: пиастры под процент (5-10% в неделю)
CREATE TABLE IF NOT EXISTS deposits (
    id               BIGSERIAL PRIMARY KEY,
    child_id         BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    store_id         BIGINT        NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
    rate             NUMERIC(5,2)  NOT NULL DEFAULT 5,
    last_interest_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_deposit_child_store UNIQUE (child_id, store_id)
);
CREATE INDEX IF NOT EXISTS idx_deposits_child ON deposits (child_id);

-- Каталог предметов кастомизации аватара (Гардероб Героя)
-- Категории: SKIN (скин) / FRAME (рамка) / PET (питомец) / BACKGROUND (фон)
CREATE TABLE IF NOT EXISTS avatar_items (
    id          BIGSERIAL PRIMARY KEY,
    parent_id   BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    category    VARCHAR(32)  NOT NULL DEFAULT 'SKIN',
    icon        VARCHAR(64)  NOT NULL DEFAULT '🎨',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Выданные ребёнку предметы кастомизации (equipped — надето сейчас)
CREATE TABLE IF NOT EXISTS child_avatar_items (
    id          BIGSERIAL PRIMARY KEY,
    child_id    BIGINT      NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    item_id     BIGINT      NOT NULL REFERENCES avatar_items (id) ON DELETE CASCADE,
    equipped    BOOLEAN     NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_child_avatar_item UNIQUE (child_id, item_id)
);
CREATE INDEX IF NOT EXISTS idx_child_avatar_child ON child_avatar_items (child_id);

-- Журнал ежедневных дейликов (LOGIC / LANG / SPORT / MATH)
-- full_clear = идеальное прохождение блока без ошибок (+2 XP)
CREATE TABLE IF NOT EXISTS daily_logs (
    id         BIGSERIAL PRIMARY KEY,
    child_id   BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    skill      VARCHAR(32)   NOT NULL,
    day        DATE          NOT NULL,
    payload    VARCHAR(4000),
    points     NUMERIC(12,2) NOT NULL DEFAULT 0,
    xp         INT           NOT NULL DEFAULT 0,
    full_clear BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_daily_log UNIQUE (child_id, skill, day)
);
CREATE INDEX IF NOT EXISTS idx_daily_logs_child ON daily_logs (child_id);

-- ============================================================
-- Миграция существующих таблиц (идемпотентно)
-- Выполняется в конце скрипта, чтобы все таблицы уже существовали
-- ============================================================
ALTER TABLE children ADD COLUMN IF NOT EXISTS theme VARCHAR(32) NOT NULL DEFAULT 'rainbow';
ALTER TABLE children ADD COLUMN IF NOT EXISTS home_widgets VARCHAR(500) NOT NULL DEFAULT '["balances","stats","achievements","orders"]';
ALTER TABLE reading_books ADD COLUMN IF NOT EXISTS child_id BIGINT REFERENCES children (id) ON DELETE CASCADE;
ALTER TABLE reading_logs ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'APPROVED';
ALTER TABLE math_tasks ADD COLUMN IF NOT EXISTS child_id BIGINT REFERENCES children (id) ON DELETE CASCADE;
ALTER TABLE house_days ADD COLUMN IF NOT EXISTS room_score INT NOT NULL DEFAULT 0;
ALTER TABLE house_days ADD COLUMN IF NOT EXISTS living_score INT NOT NULL DEFAULT 0;
ALTER TABLE house_days ADD COLUMN IF NOT EXISTS settled BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- Лимиты экрана и карманные деньги (Этап 2)
-- ============================================================

-- Базовые лимиты ребёнка (минуты в день; карманные деньги — рубли в неделю)
CREATE TABLE IF NOT EXISTS child_limits (
    child_id        BIGINT PRIMARY KEY REFERENCES children (id) ON DELETE CASCADE,
    tv_minutes      INT NOT NULL DEFAULT 0,
    pc_minutes      INT NOT NULL DEFAULT 0,
    console_minutes INT NOT NULL DEFAULT 0,
    phone_minutes   INT NOT NULL DEFAULT 0,
    tablet_minutes  INT NOT NULL DEFAULT 0,
    pocket_weekly   INT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Расход лимита по дням: used_seconds — потрачено, extended_seconds — одноразовые
-- увеличения на сегодня (могут превышать базовый лимит), running — идёт ли счётчик.
CREATE TABLE IF NOT EXISTS limit_usage (
    id               BIGSERIAL PRIMARY KEY,
    child_id         BIGINT       NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    limit_type       VARCHAR(20)  NOT NULL,   -- TV / PC / CONSOLE / PHONE / TABLET
    day              DATE         NOT NULL,
    used_seconds     INT          NOT NULL DEFAULT 0,
    extended_seconds INT          NOT NULL DEFAULT 0,
    running          BOOLEAN      NOT NULL DEFAULT FALSE,
    started_at       TIMESTAMPTZ,
    CONSTRAINT uq_limit_usage UNIQUE (child_id, limit_type, day)
);
CREATE INDEX IF NOT EXISTS idx_limit_usage_child ON limit_usage (child_id);

-- Заморозка лимита родителем: ребёнок не может запустить счётчик (кнопка «обледенела»)
CREATE TABLE IF NOT EXISTS limit_freeze (
    id         BIGSERIAL   PRIMARY KEY,
    child_id   BIGINT      NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    limit_type VARCHAR(20) NOT NULL,
    frozen     BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_limit_freeze UNIQUE (child_id, limit_type)
);
-- для уже созданной таблицы без id (миграция)
ALTER TABLE limit_freeze ADD COLUMN IF NOT EXISTS id BIGSERIAL;

-- Трекер тарификации: журнал запусков/остановок счётчиков для контроля родителя
CREATE TABLE IF NOT EXISTS limit_events (
    id         BIGSERIAL PRIMARY KEY,
    child_id   BIGINT      NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    limit_type VARCHAR(20) NOT NULL,
    action     VARCHAR(20) NOT NULL,   -- START / STOP
    seconds    INT         NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_limit_events_child ON limit_events (child_id);

-- Эффекты товаров: увеличение лимита (одноразовое на день / постоянное)
ALTER TABLE products ADD COLUMN IF NOT EXISTS effect_type VARCHAR(20) NOT NULL DEFAULT 'NONE';
ALTER TABLE products ADD COLUMN IF NOT EXISTS effect_limit VARCHAR(20);
ALTER TABLE products ADD COLUMN IF NOT EXISTS effect_value INT NOT NULL DEFAULT 0;

-- Запросы ребёнка на выдачу карманных денег
CREATE TABLE IF NOT EXISTS pocket_requests (
    id          BIGSERIAL PRIMARY KEY,
    child_id    BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    amount      NUMERIC(12,2) NOT NULL,
    status      VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_pocket_requests_child ON pocket_requests (child_id);

-- Журнал выдач карманных денег (week_start — понедельник 09:00 МСК)
CREATE TABLE IF NOT EXISTS pocket_disbursements (
    id         BIGSERIAL PRIMARY KEY,
    child_id   BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    amount     NUMERIC(12,2) NOT NULL,
    week_start DATE          NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pocket_disb_child ON pocket_disbursements (child_id);

-- Одноразовые увеличения недельного лимита карманных денег (покупка-эффект)
CREATE TABLE IF NOT EXISTS pocket_extensions (
    id         BIGSERIAL PRIMARY KEY,
    child_id   BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    week_start DATE          NOT NULL,
    amount     NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_pocket_ext UNIQUE (child_id, week_start)
);
CREATE INDEX IF NOT EXISTS idx_pocket_ext_child ON pocket_extensions (child_id);

-- ============================================================
-- Квесты-стадии (Этап 3): (!) принятие → (?) выполнение → спячка/готово
-- ============================================================
ALTER TABLE quests ADD COLUMN IF NOT EXISTS basic_description VARCHAR(2000);
ALTER TABLE quests ADD COLUMN IF NOT EXISTS accept_description VARCHAR(2000);
ALTER TABLE quests ADD COLUMN IF NOT EXISTS duration_minutes INT;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS cooldown_hours INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS child_quest_states (
    id                BIGSERIAL PRIMARY KEY,
    child_id          BIGINT      NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    quest_id          BIGINT      NOT NULL REFERENCES quests (id) ON DELETE CASCADE,
    status            VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE/ACTIVE/SUBMITTED/SLEEPING/DONE
    accepted_at       TIMESTAMPTZ,
    starts_at         TIMESTAMPTZ,
    next_available_at TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ,
    CONSTRAINT uq_child_quest UNIQUE (child_id, quest_id)
);
CREATE INDEX IF NOT EXISTS idx_child_quest_child ON child_quest_states (child_id);

-- ============================================================
-- Чтение: закладки страниц и дейлик страниц (Этап 3)
-- ============================================================

-- Текущая страница книги (закладка ребёнка)
CREATE TABLE IF NOT EXISTS reading_bookmarks (
    id         BIGSERIAL PRIMARY KEY,
    child_id   BIGINT      NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    book_id    BIGINT      NOT NULL REFERENCES reading_books (id) ON DELETE CASCADE,
    page       INT         NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_bookmark UNIQUE (child_id, book_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_child ON reading_bookmarks (child_id);

-- История отметок страниц по дням: по ней считается дейлик чтения (сумма дельт)
CREATE TABLE IF NOT EXISTS reading_page_marks (
    id         BIGSERIAL PRIMARY KEY,
    child_id   BIGINT      NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    book_id    BIGINT      NOT NULL REFERENCES reading_books (id) ON DELETE CASCADE,
    page       INT         NOT NULL,
    day        DATE        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_marks_child ON reading_page_marks (child_id, day);

-- Настройки дейлика чтения: сколько страниц в день и награда (задаёт родитель)
CREATE TABLE IF NOT EXISTS reading_settings (
    child_id      BIGINT PRIMARY KEY REFERENCES children (id) ON DELETE CASCADE,
    store_id      BIGINT        NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    pages_target  INT           NOT NULL DEFAULT 20,
    reward_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    xp_reward     INT           NOT NULL DEFAULT 0,
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Запросы ребёнка на проверку комнаты (клик по сегодняшнему дню в календаре)
CREATE TABLE IF NOT EXISTS house_check_requests (
    id          BIGSERIAL PRIMARY KEY,
    child_id    BIGINT      NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    store_id    BIGINT      NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
    day         DATE        NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    room_score  INT         NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    CONSTRAINT uq_house_check UNIQUE (child_id, day)
);
CREATE INDEX IF NOT EXISTS idx_house_check_child ON house_check_requests (child_id);

-- ============================================================
-- Карточки с заданиями (Этап 3): математика + помощь по дому
-- ============================================================

CREATE TABLE IF NOT EXISTS task_cards (
    id               BIGSERIAL PRIMARY KEY,
    parent_id        BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    store_id         BIGINT        REFERENCES stores (id) ON DELETE SET NULL,
    child_id         BIGINT        REFERENCES children (id) ON DELETE CASCADE,
    skill            VARCHAR(20)   NOT NULL,                    -- MATH / HOUSE
    title            VARCHAR(255)  NOT NULL,
    description      VARCHAR(2000),
    icon             VARCHAR(64)   NOT NULL DEFAULT '🎴',
    difficulty       VARCHAR(20)   NOT NULL DEFAULT 'EASY',     -- EASY / MEDIUM / HARD
    tasks_json       VARCHAR(8000) NOT NULL,                    -- [{"q":"...","a":"..."}]
    duration_minutes INT           NOT NULL,
    reward_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    reward_store_id  BIGINT        REFERENCES stores (id) ON DELETE SET NULL,
    xp_reward        INT           NOT NULL DEFAULT 0,
    house_bonus      INT           NOT NULL DEFAULT 0,          -- для HOUSE: +n к living_score
    rarity           VARCHAR(20)   NOT NULL DEFAULT 'COMMON',   -- COMMON/RARE/UNCOMMON/EPIC/LEGENDARY
    hidden_reward    BOOLEAN       NOT NULL DEFAULT FALSE,
    success_percent  INT           NOT NULL DEFAULT 80,         -- порог успешных ответов для награды
    active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_cards_parent ON task_cards (parent_id);
CREATE INDEX IF NOT EXISTS idx_task_cards_skill  ON task_cards (skill);

CREATE TABLE IF NOT EXISTS child_task_cards (
    id             BIGSERIAL PRIMARY KEY,
    child_id       BIGINT        NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    card_id        BIGINT        NOT NULL REFERENCES task_cards (id) ON DELETE CASCADE,
    day            DATE          NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'PENDING_PARENT', -- PENDING_PARENT/REVEALED/IN_PROGRESS/DONE/FAILED
    started_at     TIMESTAMPTZ,
    submitted_at   TIMESTAMPTZ,
    answers_json   VARCHAR(8000),
    result_percent INT,
    CONSTRAINT uq_child_card UNIQUE (child_id, card_id, day)
);
CREATE INDEX IF NOT EXISTS idx_child_task_cards_child ON child_task_cards (child_id);

-- ============================================================
-- Динамическая генерация математических карточек (ТЗ)
-- ============================================================

-- Темы математики (расширяемый пул на уровне БД)
CREATE TABLE IF NOT EXISTS math_topics (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(32)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    grade_label VARCHAR(50)  NOT NULL,
    sort_order  INT          NOT NULL DEFAULT 0
);

-- Настройки тем для родителя (тумблер Active + базовая сложность)
CREATE TABLE IF NOT EXISTS math_topic_settings (
    id              BIGSERIAL PRIMARY KEY,
    parent_id       BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    topic_id        BIGINT      NOT NULL REFERENCES math_topics (id) ON DELETE CASCADE,
    active          BOOLEAN     NOT NULL DEFAULT TRUE,
    base_difficulty VARCHAR(16) NOT NULL DEFAULT 'MEDIUM', -- EASY/MEDIUM/HIGH/HARD (потолок «Сложный»)
    CONSTRAINT uq_math_topic_settings_parent_topic UNIQUE (parent_id, topic_id)
);

-- Сгенерированная карточка (история для анти-дублей 30 дней)
CREATE TABLE IF NOT EXISTS math_cards (
    id          BIGSERIAL PRIMARY KEY,
    child_id    BIGINT       NOT NULL REFERENCES children (id) ON DELETE CASCADE,
    card_date   DATE         NOT NULL,
    final_level VARCHAR(16)  NOT NULL,                  -- EASY..OLYMPIAD
    label       VARCHAR(50)  NOT NULL,
    description VARCHAR(500) NOT NULL,
    task_count  INT          NOT NULL,
    task_types  VARCHAR(200) NOT NULL,
    minutes     INT          NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_math_cards_child_date ON math_cards (child_id, card_date);
-- Жизненный цикл карточки: CREATED/REQUESTED/APPROVED/IN_PROGRESS/SUCCESS/FAILED
ALTER TABLE math_cards ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'CREATED';
ALTER TABLE math_cards ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE math_cards ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
ALTER TABLE math_cards ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE math_cards ADD COLUMN IF NOT EXISTS result_percent INT;
ALTER TABLE math_cards ADD COLUMN IF NOT EXISTS xp_reward INT NOT NULL DEFAULT 0; -- награда за успех
ALTER TABLE math_cards ADD COLUMN IF NOT EXISTS xp_earned INT NOT NULL DEFAULT 0; -- фактически начислено в навык

-- Задачи карточки
CREATE TABLE IF NOT EXISTS math_card_tasks (
    id         BIGSERIAL PRIMARY KEY,
    card_id    BIGINT       NOT NULL REFERENCES math_cards (id) ON DELETE CASCADE,
    topic_code VARCHAR(32)  NOT NULL,
    task_type  VARCHAR(16)  NOT NULL,   -- CALC / EQUATION / TEXT
    text       VARCHAR(500) NOT NULL,
    answer     VARCHAR(100) NOT NULL
);

-- Попытки ответов на задачи карточки
CREATE TABLE IF NOT EXISTS math_card_attempts (
    id           BIGSERIAL PRIMARY KEY,
    task_id      BIGINT      NOT NULL REFERENCES math_card_tasks (id) ON DELETE CASCADE,
    answer       VARCHAR(100) NOT NULL,
    correct      BOOLEAN     NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Статичные олимпиадные карточки (структурированы по классам)
CREATE TABLE IF NOT EXISTS math_olympiad_cards (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    grade_label VARCHAR(50)  NOT NULL,
    minutes     INT          NOT NULL DEFAULT 60,
    CONSTRAINT uq_math_olympiad_title UNIQUE (title)
);
CREATE TABLE IF NOT EXISTS math_olympiad_tasks (
    id        BIGSERIAL PRIMARY KEY,
    card_id   BIGINT       NOT NULL REFERENCES math_olympiad_cards (id) ON DELETE CASCADE,
    task_type VARCHAR(16)  NOT NULL,
    text      VARCHAR(500) NOT NULL,
    answer    VARCHAR(100) NOT NULL
);

-- Сид тем (идемпотентно)
INSERT INTO math_topics (code, name, grade_label, sort_order) VALUES
    ('ADD_SUB', 'Сложение / Вычитание', '3 класс', 1),
    ('MUL_DIV', 'Умножение / Деление', '3 класс', 2),
    ('EQUATIONS', 'Уравнения', '3-4 класс', 3),
    ('VARIABLES', 'Задачи с переменными', '4-5 класс', 4),
    ('FRACTIONS', 'Дроби', '5 класс', 5),
    ('NEGATIVE', 'Минусовые числа', '6 класс', 6),
    ('DECIMALS', 'Десятичные дроби', '6 класс', 7),
    ('ROOTS', 'Корни', '7-8 класс', 8),
    ('SQUARES_CUBES', 'Квадраты / Кубы', '7-8 класс', 9)
ON CONFLICT (code) DO NOTHING;