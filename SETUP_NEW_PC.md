# Перенос проекта на другой компьютер

Архив содержит исходный код, базу данных и настройки.  
`node_modules` и `.next` **не включены** — их нужно установить/собрать заново.

## Требования на новом ПК

1. **Node.js 20+** — https://nodejs.org/
2. **Cursor** — https://cursor.com/
3. (Опционально) **Git** — https://git-scm.com/

## Установка

### 1. Распакуйте архив

Распакуйте `academy-kozatsvo-portable.zip` в удобную папку, например:

```
C:\Projects\academy-kozatsvo
```

### 2. Откройте в Cursor

- Запустите Cursor
- **File → Open Folder**
- Выберите папку `academy-kozatsvo`

### 3. Установите зависимости

Откройте терминал в Cursor (`Ctrl + ~`) и выполните:

```bash
npm install
```

### 4. Проверьте переменные окружения

Файл `.env` уже включён в архив. При необходимости сверьте с `.env.example`.

Минимум для локальной разработки:

```env
## База данных

Локально — PostgreSQL через Docker (см. `docker-compose.yml`):

```env
DATABASE_URL="postgresql://academy:academy@localhost:5432/academy_kozatsvo"
```

```bash
docker compose up -d
npm run db:push
npm run db:seed
```

Продакшн — Neon + Vercel: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.
JWT_SECRET="change-this-secret-in-production"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 5. Подготовьте базу данных

База `dev.db` уже в архиве с демо-данными. Обычно достаточно:

```bash
npx prisma generate
```

Если база повреждена или нужны чистые данные:

```bash
npx prisma migrate dev
npm run db:seed
```

### 6. Запустите проект

```bash
npm run dev
```

Откройте в браузере: **http://localhost:3000**

Админка: **http://localhost:3000/admin/login**

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@academy.ua | admin123 |
| Редактор | editor@academy.ua | editor123 |
| Модератор | moderator@academy.ua | moderator123 |

## Что входит в архив

- Исходный код (`src/`)
- Схема и миграции Prisma (`prisma/`)
- База SQLite с данными (`dev.db`)
- Статические файлы (`public/`)
- Конфигурация проекта
- Файл `.env` для локальной разработки

## Что НЕ входит (создаётся автоматически)

- `node_modules/` — `npm install`
- `.next/` — `npm run dev` или `npm run build`
- `src/generated/prisma/` — `npx prisma generate`

## Возможные проблемы

**Ошибка при `npm install` (better-sqlite3)**  
На Windows может понадобиться [Build Tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/) с компонентом «Desktop development with C++».

**Порт 3000 занят**  
Запустите на другом порту: `npx next dev -p 3001`

**База не найдена**  
Убедитесь, что `dev.db` лежит в корне проекта рядом с `package.json`.
