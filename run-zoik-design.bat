@echo off
title Zoik Design - Estudio Grafico & Generador con IA
color 0b

echo ========================================================
echo       ZOIK DESIGN - DESKTOP CREATIVE ENGINE v1.0
echo ========================================================
echo.
echo Iniciando el motor de Zoik Design en tu PC...
echo.

cd /d "C:\Users\User\ZoikDesignApp"
start "" http://localhost:3000
npm run dev -- --host --port 3000

pause
