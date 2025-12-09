# Script para subir archivos a GitHub
# Ejecuta este script en PowerShell

Write-Host "=== Subiendo archivos a GitHub ===" -ForegroundColor Green

# Cambiar al directorio del proyecto
Set-Location "c:\Users\Noel Pacheco\Desktop\Proyectos Cursor\Proyectos\El-Rincon-de-las-Tablas"

Write-Host "`n1. Agregando archivos al staging..." -ForegroundColor Yellow
git add charolas.html nosotros.html contacto.html

Write-Host "`n2. Verificando estado..." -ForegroundColor Yellow
git status

Write-Host "`n3. Haciendo commit..." -ForegroundColor Yellow
git commit -m "Actualizar archivos HTML: charolas.html, nosotros.html, contacto.html"

Write-Host "`n4. Verificando configuración del remoto..." -ForegroundColor Yellow
git remote -v

Write-Host "`n5. Subiendo a GitHub..." -ForegroundColor Yellow
Write-Host "   (Si te pide credenciales, usa tu usuario de GitHub y un Personal Access Token como contraseña)" -ForegroundColor Cyan
git push -u origin main

Write-Host "`n=== Proceso completado ===" -ForegroundColor Green
Write-Host "Verifica en: https://github.com/NoelVentura/El-Rincon-del-Antojo-" -ForegroundColor Cyan


