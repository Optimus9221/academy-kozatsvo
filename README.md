# Международная Академия Козацтва

Официальный сайт с публичной частью и админ-панелью.

## Стек

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes (REST)
- **БД:** SQLite + Prisma 7
- **Auth:** JWT (httpOnly cookie)

## Быстрый старт

```bash
cd academy-kozatsvo
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Сайт: [http://localhost:3000](http://localhost:3000)  
Админка: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@academy.ua | admin123 |
| Редактор | editor@academy.ua | editor123 |
| Модератор | moderator@academy.ua | moderator123 |

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
- **EDITOR** — управление контентом
- **MODERATOR** — работа с заявками

## Переменные окружения

```env
## Database

Local PostgreSQL (Docker):

```bash
docker compose up -d
npm run db:push
npm run db:seed
```

```env
DATABASE_URL="postgresql://academy:academy@localhost:5432/academy_kozatsvo"
```

Production: **Vercel + Neon** — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
JWT_SECRET="change-this-secret-in-production"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Команды

```bash
npm run dev          # разработка
npm run build        # сборка
npm run start        # production
npm run db:migrate   # миграции
npm run db:seed      # демо-данные
npm run db:reset     # сброс БД + seed
```

## Деплой

Проект готов к деплою на Vercel. Для production рекомендуется:

1. Заменить SQLite на PostgreSQL
2. Сменить `JWT_SECRET`
3. Настроить `NEXT_PUBLIC_SITE_URL`
4. Подключить reCAPTCHA на форме заявки (опционально)
