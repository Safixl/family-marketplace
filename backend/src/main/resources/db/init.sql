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