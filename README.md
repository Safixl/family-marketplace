# «Дейлики» — RPG-мотивация ребёнка (ранее «Семейный магазин»)

Веб-приложение, превращающее домашние дела, учёбу и хобби в MMORPG: **родитель** выступает в роли
Гейм-Мастера (создаёт квесты, магазины и ачивки), **ребёнок** — игрок с уровнем, прокачкой 6 навыков,
двумя инвентарями и достижениями в стиле World of Warcraft.

## Механики

| Механика | Описание |
|---|---|
| 🎮 RPG-профиль | Общий уровень персонажа: 50% опыта навыков + опыт ачивок + опыт квестов. Уровень открывает бонусы |
| 🧩 6 навыков | Математика, Чтение, Логика, Иностранный язык, Спорт/Хобби, Порядок в комнате (гексагон + прокачка) |
| ⚡ Дейлики | Ежедневные задания под возраст ребёнка: логика (1 ответ = 1 IQ-коин, Full Clear +2 XP), язык (1 слово = 1 лингво-миля), спорт (10 мин = 1 очко, 2000 шагов = 1 очко), математика (1 верный = 1 балл) |
| 📜 Квесты ГМа | Дейлики (повторяемые) и сюжетные квесты с наградой [валюта магазина + общий XP]. Ребёнок отправляет заявку с фото, родитель подтверждает в ленте верификации |
| 🏆 Ачивки WoW | Многоуровневые (Бронза/Серебро/Золото), стрики (дней подряд), скрытые награды, титулы персонажа, pop-up со звуком «дзынь!» |
| 🎒 2 инвентаря | «Гардероб Героя» (скины, рамки, питомцы, фоны аватара) и «Сумка Снадобья» (купоны: «Поход в парк», «+2 часа PS5» — активация с подтверждением родителя) |
| ❄️ Сезонные ивенты | Магазин с жетонами на ограниченное время. Жетоны зарабатываются ТОЛЬКО через сезонные квесты ГМа (FOMO-эффект) |
| 🏦 Инвест-фонд | Пиастры на депозите под 5-10% в неделю — обучение финансовой грамотности |
| 👶 Возраст | Задаётся в профиле ребёнка (5–16): от него зависит сложность дейликов и масштаб ценников |

## Стек

| Слой      | Технологии                                                            |
|-----------|------------------------------------------------------------------------|
| Backend   | Java 17, Spring Boot 3 (Web, Security, Data JPA, Validation), PostgreSQL 16 |
| Frontend  | React 18 + TypeScript, Vite, Tailwind CSS, Lucide Icons                |
| Инфра     | Docker Compose (postgres + backend + frontend/nginx)                  |

## Структура

```
family-marketplace/
├── docker-compose.yml
├── backend/          # Spring Boot + Gradle wrapper
│   └── src/main/resources/db/init.sql  # схема БД (выполняется автоматически)
└── frontend/         # React SPA на Vite
```

## Быстрый старт (Docker)

```bash
docker compose up --build
```

- Фронтенд: http://localhost (nginx проксирует `/api` на backend)
- Backend API: https://likely-discerning-maggot.cloudpub.ru/api
- PostgreSQL: `localhost:5432`, база `familymarket`, пользователь `familymarket`

> Для доступа с других устройств в локальной сети откройте `http://<IP-машины>`.

### Переменные окружения

| Переменная      | По умолчанию                                           | Описание                        |
|-----------------|--------------------------------------------------------|---------------------------------|
| `DB_URL`        | `jdbc:postgresql://postgres:5432/familymarket`         | JDBC-строка                     |
| `DB_USER`       | `familymarket`                                         | Пользователь БД                 |
| `DB_PASSWORD`   | `familymarket`                                         | Пароль БД                       |
| `JWT_SECRET`    | dev-значение (⚠️ смените в проде!)                      | Секрет подписи HS256 (≥ 32 байт) |
| `CORS_ORIGINS`  | `http://localhost,http://localhost:5173`               | Разрешённые origin через запятую |

## Запуск в dev-режиме

1. **PostgreSQL** (любым способом, например Docker):
   ```bash
   docker compose up postgres
   ```
2. **Backend**:
   ```bash
   cd backend
   ./gradlew bootRun
   ```
3. **Frontend** (Vite dev-сервер проксирует `/api` на `https://likely-discerning-maggot.cloudpub.ru`):
   ```bash
   cd frontend
   npm install
   npm run dev
   # http://localhost:5173
   ```

## Как это работает

1. Родитель регистрируется по email/паролю → получает JWT (Bearer).
2. В разделе «Дети» создаёт ребенка и получает **ключ доступа** вида `ABCD-EFGH-IJKL`.
3. Ребенок входит на экране входа по ключу (заголовок `X-Access-Key`, без пароля).
4. Родитель создаёт магазин с **кастомной валютой** (название + эмодзи), добавляет товары
   (цена, лимит на ребенка) и начисляет валюту в разделе «Обзор».
5. Ребенок видит витрину активных магазинов, заказывает товары.
6. Заказ создаётся со статусом `PENDING` (баланс не списывается). Родитель подтверждает
   (транзакционное списание → `PAID`) или отклоняет (`REJECTED`).
7. Достижения родитель создаёт и выдаёт детям; при выдаче можно начислить награду
   в выбранный магазин.

## REST API (основные маршруты)

**Аутентификация**
- `POST /api/auth/register`, `POST /api/auth/login` — родитель (→ JWT)
- `POST /api/child/session` — вход ребенка по `{accessKey}`

**Родитель** (`Authorization: Bearer <JWT>`)
- `/api/parent/children` (+`/{id}`, `PUT`, `DELETE`, `POST /{id}/regenerate-key`)
- `/api/parent/stores` (+`/{id}`), `/api/parent/stores/{storeId}/products`, `/api/parent/products/{id}`
- `/api/parent/balances`, `POST /api/parent/balances/adjust`
- `/api/parent/achievements` (+`/{id}`, `POST /grant`)
- `/api/parent/purchases` (`?status=`), `POST /purchases/{id}/approve|reject`

**Ребенок** (`X-Access-Key: <ключ>`)
- `/api/child/stores`, `/api/child/stores/{id}/products`
- `POST /api/child/purchases`, `GET /api/child/purchases`, `GET /api/child/profile`

## Безопасность

- Пароли родителя хешируются BCrypt.
- JWT HS256, срок жизни 7 дней (настраивается `JWT_EXPIRATION_MS`).
- «Сессия» ребенка stateless и жёстко привязана к ключу: перегенерация ключа или
  деактивация ребенка мгновенно отключает доступ.
- CORS разрешён только для origins из `CORS_ORIGINS`.

## Сборка без Docker

```bash
cd backend && ./gradlew bootJar          # jar в build/libs/
cd frontend && npm run build             # статика в dist/