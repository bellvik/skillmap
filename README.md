# SkillMap

Веб-приложение для карт профессиональных навыков. Стек: React/Vite, Express, SQLite.

## Локальный запуск

Нужен Node.js 22 или новее.

```bash
npm ci
npm run server:dev
```

В другом терминале запустите frontend:

```bash
npm run dev
```

Откройте `http://localhost:5173`. API работает на порту 3000, локальная база создаётся в `data/skillmap.sqlite`.

Проверки: `npm test`, `npm run lint`, `npm run build`.

## Docker

```bash
docker compose up -d --build
```

Приложение будет доступно на `http://localhost:3000` (по умолчанию). SQLite хранится в Docker volume `skillmap_data` и сохраняется при пересоздании контейнера.

Чтобы создать администратора при первом запуске, задайте `BOOTSTRAP_ADMIN_EMAIL` и `BOOTSTRAP_ADMIN_PASSWORD` в `.env`. Пароль должен содержать не менее 12 символов и не более 72 байт в UTF-8. Не добавляйте `.env` в Git.

Для публичного сервера настройте HTTPS reverse proxy; задайте `HTTPS_ENABLED=true` и оставьте `COOKIE_SECURE=true`. Для локальной проверки авторизации по HTTP можно временно задать `COOKIE_SECURE=false` — не используйте это на публичном сервере.

## Деплой

GitHub Actions запускает проверки для pull request и push в `main`; после успешного push в `main` (или ручного запуска workflow) приложение развёртывается на VPS. Для SSH нужен repository secret `VPS_SSH_PRIVATE_KEY` с отдельным deploy-ключом. Не используйте личный ключ администратора и не сохраняйте ключ в репозитории.

## API и резервная копия

Документация API: `/api/docs`; OpenAPI JSON: `/api/openapi.json`.

Для копии базы остановите контейнер, скопируйте файл и запустите контейнер снова:

```bash
docker compose stop
docker run --rm -v skillmap_skillmap_data:/data -v "${PWD}:/backup" alpine \
  cp /data/skillmap.sqlite /backup/skillmap.sqlite
docker compose start
```

Если каталог проекта называется не `skillmap`, имя Docker volume будет другим; проверьте его через `docker volume ls`.
