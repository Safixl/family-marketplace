# Family Marketplace — «Семейный магазин»

Веб-приложение, в котором **родитель** управляет магазинами, кастомной валютой, товарами, детьми и
достижениями, а **ребенок** заходит по уникальному текстовому ключу доступа (без регистрации) и покупает
товары за внутреннюю валюту.

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
- Backend API: http://localhost:8080/api
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
3. **Frontend** (Vite dev-сервер проксирует `/api` на `localhost:8080`):
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