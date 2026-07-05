# Быстрый деплой — что сделать вам (≈10 минут)

Код уже подготовлен для Vercel + Neon.

Ниже — только то, что нельзя сделать без вашего входа в аккаунты.

---

## Шаг 1. GitHub (5 мин)

В терминале Cursor:

```powershell
gh auth login
```

Выберите: **GitHub.com → HTTPS → Login with browser**.

Затем:

```powershell
cd C:\Users\Gamer_1\academy-kozatsvo
gh repo create YOUR_GITHUB_USER/academy-kozatsvo --public --source=. --remote=origin --push
```

Если репозиторий уже создан вручную на github.com:

```powershell
git remote add origin https://github.com/YOUR_GITHUB_USER/academy-kozatsvo.git
git push -u origin master
```

---

## Шаг 2. Neon — новая БД (3 мин)

1. [console.neon.tech](https://console.neon.tech) → **New Project** → имя `academy-kozatsvo`
2. **Connection details** → вкладка **Pooled connection**
3. Скопируйте строку (должен быть `-pooler` в хосте)
4. Сохраните в Vercel Environment Variables как `DATABASE_URL` (не коммитьте в git)

Пример вида:
`postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

---

## Шаг 3. Vercel (5 мин)

```powershell
cd C:\Users\Gamer_1\academy-kozatsvo
npx vercel login
```

### Вариант А — через сайт (проще)

1. [vercel.com/new](https://vercel.com/new) → Import `YOUR_GITHUB_USER/academy-kozatsvo`
2. **Environment Variables** (Production):

| Name | Value |
|------|--------|
| `DATABASE_URL` | строка Neon из шага 2 |
| `JWT_SECRET` | случайная строка 32+ символов (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | пока оставьте пустым, обновите после деплоя |
| `BLOB_READ_WRITE_TOKEN` | токен из Vercel → Storage → Blob |
| `CRON_SECRET` | случайная строка для cron-эндпоинта |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | ключ Cloudflare Turnstile (опционально) |
| `TURNSTILE_SECRET_KEY` | секрет Turnstile (опционально) |

3. **Deploy**

### Вариант Б — из терминала (после `vercel login`)

```powershell
cd C:\Users\Gamer_1\academy-kozatsvo
npx vercel link
npx vercel env add DATABASE_URL production
npx vercel env add JWT_SECRET production
npx vercel --prod
```

---

## Шаг 4. Данные в БД

После настройки `DATABASE_URL`:

```powershell
cd C:\Users\Gamer_1\academy-kozatsvo
$env:DATABASE_URL="YOUR_NEON_DATABASE_URL"
npm run db:deploy
npm run db:seed
```

**Сразу смените пароли** всех seed-аккаунтов: `npm run db:change-password`

Админка: `/uk/admin/login`

---

## После первого деплоя

1. Скопируйте URL вида `https://academy-kozatsvo-xxx.vercel.app`
2. Vercel → Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` = этот URL
3. **Redeploy**

---

## Что уже готово в проекте

- PostgreSQL + Neon
- CI (lint, prisma validate, build)
- Health check `/api/health`
- Security headers в `vercel.json`
- Cron `/api/cron/publish-news` для отложенной публикации новостей
- Инструкция: `docs/DEPLOYMENT.md`
