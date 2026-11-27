# SkillMap

SkillMap — веб-приложение с картами навыков. React/Vite-клиент, Express API и SQLite находятся в одном репозитории. В production Express раздаёт собранный интерфейс и API с одного адреса.

## Разработка

Нужен Node.js 22 или новее.

1. Установите зависимости: `npm ci`.
2. Запустите API в первом терминале: `npm run server:dev`.
3. Запустите интерфейс во втором: `npm run dev`.

Vite проксирует запросы `/api` на локальный backend. SQLite-файл по умолчанию создаётся в `data/skillmap.sqlite`; справочные данные добавляются в базу при первом запуске.

Полезные команды:

- `npm test` — тесты API.
- `npm run lint` — проверка кода.
- `npm run build` — сборка frontend.
- `npm start` — production-сервер (сначала выполните `npm run build`).

## Один Docker-контейнер

На сервере с Docker Compose:

```bash
docker compose up -d --build
```

Приложение будет доступно на порту 3000. Данные SQLite сохраняются в Docker volume `skillmap_data` и переживают пересоздание контейнера.

Чтобы создать администратора при первом старте, задайте `BOOTSTRAP_ADMIN_EMAIL` и `BOOTSTRAP_ADMIN_PASSWORD` в `.env` перед запуском. Пароль должен быть не короче 12 символов. Обычная регистрация создаёт только пользователя. Не добавляйте `.env` в Git.

По умолчанию `HTTPS_ENABLED=false`: приложение можно открыть по обычному HTTP, не ломая загрузку frontend-ассетов. При этом `COOKIE_SECURE=true` остаётся включённым, поэтому вход и регистрация требуют HTTPS. Для production поставьте HTTPS reverse proxy перед контейнером, оставьте `COOKIE_SECURE=true` и задайте `HTTPS_ENABLED=true`, чтобы включить HSTS и принудительное HTTPS для ресурсов. Для локальной проверки авторизации через HTTP задайте `COOKIE_SECURE=false`; не используйте это значение на публичном сервере.

Резервная копия базы — файл `skillmap.sqlite` внутри volume. Перед копированием остановите контейнер, чтобы исключить копирование незавершённых изменений:

```bash
docker compose stop
docker run --rm -v skillmap_skillmap_data:/data -v "${PWD}:/backup" alpine \
  cp /data/skillmap.sqlite /backup/skillmap.sqlite
docker compose start
```

Имя volume зависит от имени каталога Compose-проекта. Его можно проверить командой `docker volume ls`.

## API

- Swagger UI: `/api/docs`; OpenAPI JSON: `/api/openapi.json`.
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/professions`, `GET /api/professions/:id`, `GET /api/professions/:id/skills`
- `GET /api/me/maps`, `PUT /api/me/maps/:professionId`
- `PUT /api/me/maps/:professionId/skills/:skillId`, `DELETE /api/me/maps/:professionId`
- `GET /api/admin/summary` — только для роли администратора

Пароли хешируются bcrypt; идентификаторы сессий хранятся в базе только в хешированном виде и передаются в `httpOnly` cookie.
