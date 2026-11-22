# «Дейлики» — RPG-мотивация ребёнка (ранее «Семейный магазин»)

Веб-приложение, превращающее домашние дела, учёбу и хобби в MMORPG: **родитель** выступает в роли
Гейм-Мастера (создаёт квесты, магазины и ачивки), **ребёнок** — игрок с уровнем, прокачкой 6 навыков,
двумя инвентарями и достижениями в стиле World of Warcraft.

## Механики

| Механика | Описание |
|---|---|
| 🎮 RPG-профиль | Общий уровень персонажа: 50% опыта навыков + опыт ачивок + опыт квестов. Уровень открывает бонусы |
| 🧩 6 навыков | Математика, Чтение, Логика, Иностранный язык, Спорт/Хобби, Хозяйственность (гексагон + прокачка) |
| ⚡ Дейлики | Ежедневные задания под возраст ребёнка: логика (1 ответ = 1 IQ-коин, Full Clear +2 XP), язык (1 слово = 1 лингво-миля), спорт (10 мин = 1 очко, 2000 шагов = 1 очко), математика (1 верный = 1 балл) |
| 📜 Квесты ГМа | Дейлики (повторяемые) и сюжетные квесты с наградой [валюта магазина + общий XP]. Ребёнок отправляет заявку с фото, родитель подтверждает в ленте верификации |
| 🏆 Ачивки WoW | Многоуровневые (Бронза/Серебро/Золото), стрики (дней подряд), скрытые награды, титулы персонажа, pop-up со звуком «дзынь!» |
| 🎒 2 инвентаря | «Гардероб Героя» (скины, рамки, питомцы, фоны аватара) и «Сумка Снадобья» (купоны: «Поход в парк», «+2 часа PS5» — активация с подтверждением родителя) |
| ❄️ Сезонные ивенты | Магазин с жетонами на ограниченное время. Жетоны зарабатываются ТОЛЬКО через сезонные квесты ГМа (FOMO-эффект) |
| 🏦 Инвест-фонд | Матриксы на депозите под 5-10% в неделю — обучение финансовой грамотности |
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

## Лимит доверия и анти-читинг

### Лимит доверия

Переключатель находится в разделе «Дети» в карточке ребёнка.

- **Включён** — ребёнок может брать карточки по математике, логике и иностранному языку
  без подтверждения родителя: карточка сразу получает статус `APPROVED`.
- **Выключен** — ребёнок нажимает «Взять карточку», карточка уходит родителю в `REQUESTED`;
  после одобрения её можно начать.

API: `PUT /api/parent/children/{id}/trust-limit` с телом `{ "enabled": true }`.

### Анти-читинг в карточках с таймером

- Ответы сохраняются на сервере как черновик (`answers_json`) с задержкой 400 мс.
- При сворачивании приложения/браузера (`visibilitychange`, `pagehide`, `freeze`) тест
  **моментально завершается** с уже введёнными ответами через `fetch(..., { keepalive: true })`.
- При возврате (`visibilitychange` или `pageshow`) выполняется страховочный сабмит и
  перезагрузка карточки — на случай, если keepalive-запрос не дошёл.
- `blur` сохраняет только черновик, чтобы показ клавиатуры на iOS не завершал тест.
- Если время истекло, сервер проверяет последний черновик и начисляет XP по фактическому
  результату; без ответов карточка получает 0%.
- Кнопка «Свернуть» во время активного теста убрана: таймер нельзя остановить вручную.
- Ограничение iOS: скриншот веб-приложение обнаружить не может, но уход со страницы
  (сворачивание, переключение приложения, блокировка) обнаруживается.

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
- `PUT /api/parent/children/{id}/trust-limit` — лимит доверия
- `/api/parent/stores` (+`/{id}`), `/api/parent/stores/{storeId}/products`, `/api/parent/products/{id}`
- `/api/parent/balances`, `POST /api/parent/balances/adjust`
- `/api/parent/achievements` (+`/{id}`, `POST /grant`)
- `/api/parent/purchases` (`?status=`), `POST /purchases/{id}/approve|reject`

**Ребенок** (`X-Access-Key: <ключ>`)
- `/api/child/stores`, `/api/child/stores/{id}/products`
- `POST /api/child/purchases`, `GET /api/child/purchases`, `GET /api/child/profile`
- `/api/child/{math,logic,lang}-cards` — карточки дня; `.../{id}/request|revoke|start|submit`
- `PUT /api/child/{math,logic,lang}-cards/{id}/answers` — черновик ответов для анти-читинга
- `/api/parent/lang-card-approvals` (+`/{id}/approve|reject`) — подтверждение карточек языка

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
```

## PWA и установка на iPhone

Приложение собирается как PWA: манифест, иконки, splash-экраны и Service Worker.

| Файл | Назначение |
|---|---|
| `frontend/public/manifest.webmanifest` | имя, `standalone`, `orientation: any`, иконки |
| `frontend/public/icons/` | иконки 180/192/512/1024 и maskable |
| `frontend/public/splash/` | splash-экраны iPhone 12+ в портрете и ландшафте |
| `frontend/public/sw.js` | кэш оболочки; запросы `/api` не кэшируются |
| `frontend/scripts/generate-icons.mjs` | генерация PNG и splash из SVG |

Перегенерировать иконки и splash после изменения `public/icon.svg` / `public/icon-mark.svg`:

```bash
cd frontend
npm run icons
```

### Как установить на iPhone

1. Открыть HTTPS-адрес приложения в Safari.
2. Нажать «Поделиться» → «На экран Домой».
3. Запустить с иконки: приложение откроется без адресной строки (standalone), в портрете и ландшафте.

> Service Worker и полноценная установка требуют HTTPS (или `localhost`). По локальному IP через HTTP Safari может добавить ярлык, но Service Worker не зарегистрируется.

## Локальный запуск без Docker (macOS)

1. PostgreSQL (отдельный кластер в `/tmp`, порт `5433`):
   ```bash
   initdb -D /tmp/fm-pgdata -U "$USER" --auth=trust
   pg_ctl -D /tmp/fm-pgdata -l /tmp/fm-postgres.log -o "-p 5433" start
   psql -p 5433 -d postgres -c "CREATE ROLE familymarket LOGIN PASSWORD 'familymarket';" || true
   createdb -p 5433 -O familymarket familymarket || true
   ```
   По умолчанию backend использует `jdbc:postgresql://localhost:5433/familymarket` с пользователем/паролем `familymarket`. Свои креды можно положить в `backend/.env`.

2. Backend:
   ```bash
   cd backend
   ./gradlew bootRun
   ```

3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev -- --host
   # http://localhost:5173 и http://<IP-машины>:5173
   ```

### Проверка PWA и Service Worker

```bash
cd frontend
npm run build
npm run preview -- --host
# http://localhost:4173
```

Service Worker регистрируется только в production/preview. Для отладки на dev-сервере:

```bash
VITE_ENABLE_SW=1 npm run dev -- --host
```

### Проверка на iPhone

- Поднимите HTTPS-туннель на порт `5173` (dev) или `4173` (preview), например через cloudpub/ngrok.
- Откройте ссылку в Safari и проверьте:
  - нет горизонтального скролла и обрезанных кнопок;
  - нижняя навигация не перекрывает контент;
  - при повороте в ландшафт все разделы доступны (у ребёнка — верхнее меню, у родителя — нижнее меню и «Ещё»);
  - «На экран Домой» → иконка, splash, standalone, корректный статус-бар.
- Ограничения iOS: установка только через Safari → «Поделиться» → «На экран Домой»; Service Worker требует HTTPS; Web Push без отдельной настройки недоступен.