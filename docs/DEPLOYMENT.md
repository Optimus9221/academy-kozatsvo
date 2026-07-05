# Деплой: Vercel + Neon + GitHub

Тестовый прод по той же схеме, что и сайт с iPhone: репозиторий на GitHub → Vercel → отдельная БД в Neon.

## 1. Neon — новая база

1. Открой [console.neon.tech](https://console.neon.tech)
2. **New Project** → имя, например `academy-kozatsvo`
3. Скопируй **Connection string** (лучше **Pooled** — с `-pooler` в хосте)
4. Добавь `?sslmode=require` в конец, если его нет

Пример:

```text
postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

## 2. GitHub — репозиторий

```bash
cd academy-kozatsvo
git add .
git commit -m "Prepare for Vercel + Neon deployment"
git remote add origin https://github.com/YOUR_USER/academy-kozatsvo.git
git push -u origin main
```

> Не коммитьте `.env` и секреты. Все ключи только в Vercel / Neon.

## 3. Vercel — проект

1. [vercel.com](https://vercel.com) → **Add New → Project**
2. Импортируй репозиторий `academy-kozatsvo`
3. **Root Directory** — корень репозитория (если монорепо — укажи папку)
4. Framework: **Next.js** (определится автоматически)
5. **Environment Variables** (Production):

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | Строка подключения Neon (pooled) |
| `JWT_SECRET` | Случайная строка 32+ символов (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | После первого деплоя: `https://ваш-проект.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — для загрузок в админке |
| `CRON_SECRET` | Случайная строка для `/api/cron/publish-news` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile (опционально) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile (опционально) |

Опционально: `SMTP_*` — уведомления о заявках.

6. **Deploy**

Схему БД применяйте отдельно: `npm run db:deploy` с production `DATABASE_URL`.

## 4. Начальные данные (один раз)

После успешного деплоя локально с URL продакшн-БД:

```bash
# В .env временно подставьте DATABASE_URL от Neon
npm run db:seed
```

**Сразу смените пароли** всех seed-аккаунтов: `npm run db:change-password`

## 5. Проверка

- Сайт: `https://ваш-проект.vercel.app/uk`
- Админка: `https://ваш-проект.vercel.app/uk/admin/login`
- Health: `https://ваш-проект.vercel.app/api/health`

Обновите `NEXT_PUBLIC_SITE_URL` в Vercel на этот URL и сделайте **Redeploy**, если меняли после первого деплоя.

### Cron — отложенная публикация новостей

В Vercel → Settings → Cron Jobs добавьте вызов:

```
GET /api/cron/publish-news
Authorization: Bearer <CRON_SECRET>
```

Рекомендуемое расписание: каждые 15 минут.

---

## Локальная разработка с PostgreSQL

```bash
docker compose up -d
```

В `.env`:

```env
DATABASE_URL="postgresql://academy:academy@localhost:5432/academy_kozatsvo"
```

```bash
npm run db:push
npm run db:seed
npm run dev
```

## Загрузка файлов в админке

На Vercel файлы в `public/uploads/` **не сохраняются** между деплоями. Статика в `public/images/` и `public/documents/` в репозитории работает. Новые загрузки через админку требуют **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`).

## Email и CAPTCHA

- **SMTP** — уведомления о заявках (`SMTP_*`, `NOTIFY_EMAIL`)
- **Turnstile** — капча на формах (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`)

Без ключей Turnstile в dev капча отключается.
