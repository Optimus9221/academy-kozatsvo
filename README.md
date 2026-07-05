# Международная Академия Козацтва

Официальный сайт с публичной частью и админ-панелью.

## Стек

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes (REST)
- **БД:** PostgreSQL + Prisma 7
- **Auth:** JWT (httpOnly cookie)
- **CAPTCHA:** Cloudflare Turnstile
- **Файлы:** Vercel Blob (загрузки в админке)

## Быстрый старт

```bash
cd academy-kozatsvo
npm install
docker compose up -d   # локальный PostgreSQL
npm run db:push
npm run db:seed
npm run dev
```

Сайт: [http://localhost:3000](http://localhost:3000)  
Админка: [http://localhost:3000/uk/admin/login](http://localhost:3000/uk/admin/login)

После `db:seed` используйте учётные данные из вывода команды seed. **Не используйте дефолтные пароли в production** — смените их сразу после первого входа (`npm run db:change-password`).

## Структура

### Публичные страницы

- `/` — главная
- `/about` — о академии
- `/news`, `/news/{slug}` — новости
- `/gallery`, `/gallery/{slug}` — галерея
- `/leadership` — руководство
- `/branches/ukraine`, `/branches/international` — представительства
- `/partners` — партнёры
- `/join/rules`, `/join/apply` — вступление
- `/legal/privacy` — политика конфиденциальности

### Админ-панель

- `/admin` — дашборд
- `/admin/news` — новости (CRUD)
- `/admin/gallery` — галерея (альбомы, фото/видео)
- `/admin/leadership` — руководство
- `/admin/branches/ukraine|international` — представительства
- `/admin/partners` — партнёры
- `/admin/join/rules` — правила вступления
- `/admin/applications` — заявки (статусы, CSV-экспорт)
- `/admin/settings` — настройки сайта

### Роли

- **ADMIN** — полный доступ
- **EDITOR** — управление контентом (без настроек, пользователей, аудита)
- **MODERATOR** — заявки и аккаунт

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения.

```env
DATABASE_URL="postgresql://academy:academy@localhost:5432/academy_kozatsvo"
JWT_SECRET="your-random-secret-at-least-32-chars"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Cloudflare Turnstile (опционально в dev)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""

# Vercel Blob — загрузки в production
BLOB_READ_WRITE_TOKEN=""

# Cron — публикация отложенных новостей
CRON_SECRET=""

# Email (SMTP)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
NOTIFY_EMAIL=""
```

Production: **Vercel + Neon** — см. [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Команды

```bash
npm run dev          # разработка
npm run build        # сборка (prisma generate + next build)
npm run start        # production
npm run db:push      # синхронизация схемы (dev)
npm run db:deploy    # prisma db push (production)
npm run db:migrate   # миграции
npm run db:seed      # демо-данные
npm run db:reset     # сброс БД + seed
npm test             # unit-тесты
```

## Деплой

Проект готов к деплою на Vercel. Для production:

1. PostgreSQL (Neon) — `DATABASE_URL`
2. Уникальный `JWT_SECRET` (32+ символов)
3. `NEXT_PUBLIC_SITE_URL` — URL сайта после деплоя
4. `BLOB_READ_WRITE_TOKEN` — для загрузок файлов
5. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` — капча на форме заявки
6. `CRON_SECRET` — для `/api/cron/publish-news`
7. Смените пароли всех seed-аккаунтов

Health check: `GET /api/health` → `{ "status": "ok", "db": "ok" }`.
