@echo off
chcp 65001 >nul
title Відправка проекту на GitHub
echo ===================================================
echo     Відправка проекту на GitHub (HNUPS-Market)
echo ===================================================
echo.

set "PATH=C:\Program Files\Git\cmd;%PATH%"

git remote remove origin 2>nul
git remote add origin https://github.com/Dim4ik555342323/HNUPS-Market.git

echo Відправка гілки main на GitHub...
echo.
echo * Увага: якщо з'явиться вікно браузера "Git Credential Manager",
echo   натисніть кнопку "Sign in with your browser" для підтвердження.
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo  [УСПІХ] Проект успішно завантажено на GitHub!
    echo  https://github.com/Dim4ik555342323/HNUPS-Market
    echo ===================================================
) else (
    echo.
    echo [УВАГА] Пуш не завершився. Перевірте авторизацію GitHub у вікні.
)

echo.
pause
