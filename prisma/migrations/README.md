# Migrations

Production and Vercel use `prisma db push` during build (see `package.json`).

For local schema changes:

```bash
npm run db:push
```

To add formal migrations later with PostgreSQL:

```bash
npx prisma migrate dev --name your_change
```
