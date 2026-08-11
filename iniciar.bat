@echo off
title Biglee Burguer - Servidor
cd /d "C:\Users\arthu\OneDrive\Documentos\Projetos\Biglee Burguer\Back-End"

echo.
echo ========================================
echo   BIGLEE BURGUER - INICIANDO SERVIDOR
echo ========================================
echo.
echo  Servidor rodando em http://localhost:3000
echo.
echo  Cliente: http://localhost:3000/cliente/cardapio.html
echo  Admin:   http://localhost:3000/admin/login.html
echo.
echo  Login admin: admin@bigleeburger.com / admin123
echo.
echo  Para parar: feche esta janela ou Ctrl+C
echo ========================================
echo.

start "" http://localhost:3000/cliente/cardapio.html
node src/server.js
