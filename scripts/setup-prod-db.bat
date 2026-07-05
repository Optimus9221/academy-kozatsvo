@echo off
REM One-time production setup after Vercel + Neon are connected.
REM Usage: set DATABASE_URL=postgresql://... from Neon, then run this script.

if "%DATABASE_URL%"=="" (
  echo ERROR: Set DATABASE_URL to your Neon connection string first.
  exit /b 1
)

echo Pushing schema to Neon...
call npm run db:push
if errorlevel 1 exit /b 1

echo Seeding database...
call npm run db:seed
if errorlevel 1 exit /b 1

echo Done. Admin: /uk/admin/login — admin@academy.ua / admin123
