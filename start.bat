@echo off
chcp 65001 >nul
title ХНУПС Маркет - Запуск
echo ===================================================
echo     Запуск проекту "ХНУПС Маркет"
echo ===================================================
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ПОМИЛКА] Node.js не знайдено в системі!
    echo Переконайтеся, що Node.js встановлено у "C:\Program Files\nodejs"
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/2] Встановлення залежностей (npm install)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ПОМИЛКА] Не вдалося встановити залежності!
        pause
        exit /b 1
    )
)

echo [2/2] Запуск сервера розробки...
echo.
echo ===================================================
echo  Локальна адреса: http://localhost:8080
echo  Логін користувача: user@atb.com  / 123456
echo  Логін адміна:      admin@atb.com / admin123
echo ===================================================
echo.

start http://localhost:8080
call npm run dev
pause

