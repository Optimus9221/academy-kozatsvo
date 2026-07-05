# После деплоя — что сделать вручную (~15 мин)

Код уже в репозитории. Локально на вашем ПК поднята БД Docker (порт **5433**) и применена схема.

---

## 1. Обновить схему БД на Neon (обязательно)

Новые таблицы: `contact_messages`, `events`, `faq_items`, `audit_logs`, координаты филий.

**Вариант А — скрипт в Cursor (проще всего):**

```powershell
cd C:\Users\Gamer_1\academy-kozatsvo
.\scripts\deploy-db.cmd
```

Или, если PowerShell ругается на политику выполнения:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-db.ps1
```

Один раз разрешить скрипты для вашего пользователя:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Когда спросит — вставьте **DATABASE_URL** из Neon (Pooled connection, с `-pooler` в хосте).

Чтобы ещё и демо-данные (FAQ, событие, координаты):

```powershell
.\scripts\deploy-db.ps1 -Seed
```

> `-Seed` **очищает** все таблицы и заливает демо заново. На проде используйте только если БД пустая или это тест.

**Вариант Б — GitHub Actions:**

1. GitHub → репозиторий `academy-kozatsvo` → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** → имя `DATABASE_URL`, значение — строка Neon
3. **Actions** → **Deploy database schema** → **Run workflow**

---

## 2. Vercel — переменные окружения

[vercel.com](https://vercel.com) → проект `academy-kozatsvo` → **Settings** → **Environment Variables** (Production):

| Переменная | Где взять |
|------------|-----------|
| `DATABASE_URL` | Neon → Connection string → **Pooled** |
| `JWT_SECRET` | уже должен быть; если нет — случайная строка 32+ символов |
| `NEXT_PUBLIC_SITE_URL` | `https://academy-kozatsvo.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | шаг 3 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | шаг 4 |
| `TURNSTILE_SECRET_KEY` | шаг 4 |

После добавления/изменения → **Deployments** → последний деплой → **Redeploy**.

---

## 3. Vercel Blob (загрузки в админке)

1. Vercel → проект → **Storage** → **Create Database** → **Blob**
2. Подключить к проекту
3. Скопировать `BLOB_READ_WRITE_TOKEN` в Environment Variables (шаг 2)
4. Redeploy

Без Blob загрузки в админке на Vercel не сохраняются.

---

## 4. Cloudflare Turnstile (формы «Приєднатися» и «Контакти»)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → **Add site**
2. Домен: `academy-kozatsvo.vercel.app` (и свой домен, если будет)
3. Скопировать **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. **Secret Key** → `TURNSTILE_SECRET_KEY`
5. Redeploy на Vercel

Без Turnstile на production формы **не отправятся** (защита включена).

---

## 5. Картинки (hero, галерея)

В репозитории только логотип. Варианты:

- Загрузить через **админку** (после настройки Blob)
- Или положить файлы в `public/images/` на ПК и сделать `git push`

Имена из seed: `hero-cossacks-proposal-v2.jpg`, `news-*.jpg`, `gallery/photo-01.jpg` …

---

## 6. Пароли админки

Если делали `-Seed` — смените пароли:

```powershell
$env:DATABASE_URL="ВАША_NEON_СТРОКА"
npm run db:change-password -- admin@academy.ua НовыйПароль
```

Или в админке: `/uk/admin/account`

---

## Локальная разработка (уже настроено)

```powershell
cd C:\Users\Gamer_1\academy-kozatsvo
docker compose up -d    # Postgres на порту 5433
npm run dev             # http://localhost:3000/uk
```

`.env` на ПК указывает на `localhost:5433`.
