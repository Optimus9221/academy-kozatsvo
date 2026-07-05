# Быстрый деплой — что сделать вам (≈10 минут)

Код уже подготовлен и **закоммичен локально** (`Prepare academy site for Vercel + Neon deployment`).

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
gh repo create Optimus9221/academy-kozatsvo --public --source=. --remote=origin --push
```

Если репозиторий уже создан вручную на github.com:

```powershell
git remote add origin https://github.com/Optimus9221/academy-kozatsvo.git
git push -u origin master
```

---

## Шаг 2. Neon — новая БД (3 мин)

1. [console.neon.tech](https://console.neon.tech) → **New Project** → имя `academy-kozatsvo`
2. **Connection details** → вкладка **Pooled connection**
3. Скопируйте строку (должен быть `-pooler` в хосте)
4. **Пришлите мне эту строку в чат** (или вставьте в `.env` локально и напишите «готово»)

Пример вида:
`postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require`

---

## Шаг 3. Vercel (5 мин)

Токен Vercel на этом ПК просрочен — нужен повторный вход:

```powershell
cd C:\Users\Gamer_1\academy-kozatsvo
npx vercel login
```

### Вариант А — через сайт (проще)

1. [vercel.com/new](https://vercel.com/new) → Import `Optimus9221/academy-kozatsvo`
2. **Environment Variables** (Production):

| Name | Value |
|------|--------|
| `DATABASE_URL` | строка Neon из шага 2 |
| `JWT_SECRET` | `53vfZPJpXwX5q3rjx3RYEX3WvzWC/gxP8H5NdypachQ=` |
| `NEXT_PUBLIC_SITE_URL` | пока оставьте пустым, обновите после деплоя |

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

## Шаг 4. Данные в БД (я сделаю, когда будет DATABASE_URL)

После шага 2 выполню у вас:

```powershell
cd C:\Users\Gamer_1\academy-kozatsvo
$env:DATABASE_URL="ВАША_СТРОКА_NEON"
npm run db:push
npm run db:seed
```

Или запустите: `scripts\setup-prod-db.bat` (предварительно `set DATABASE_URL=...`).

**Админка:** `/uk/admin/login` → `admin@academy.ua` / `admin123`

---

## После первого деплоя

1. Скопируйте URL вида `https://academy-kozatsvo-xxx.vercel.app`
2. Vercel → Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` = этот URL
3. **Redeploy**

---

## Что уже готово в проекте

- PostgreSQL + Neon
- Фото галереи в `public/images/gallery/`
- Статут, контакты, Кремнєв в seed
- Инструкция: `docs/DEPLOYMENT.md`
