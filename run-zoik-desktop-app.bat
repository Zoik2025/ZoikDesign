@echo off
title Zoik Design - Aplicacion Nativa de Escritorio
color 0b

echo ========================================================
echo       ZOIK DESIGN - DESKTOP NATIVE APP (PC)
echo ========================================================
echo.
echo Iniciando Zoik Design como aplicacion nativa de PC...
echo.

cd /d "C:\Users\User\ZoikDesignApp"
npx electron electron/main.cjs
