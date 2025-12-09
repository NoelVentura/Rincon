# Script completo para subir a GitHub
$ErrorActionPreference = "Continue"
Set-Location "c:\Users\Noel Pacheco\Desktop\Proyectos Cursor\Proyectos\El-Rincon-de-las-Tablas"

Write-Host "=== SUBIENDO ARCHIVOS A GITHUB ===" -ForegroundColor Green
Write-Host ""

# Verificar archivos
Write-Host "Archivos encontrados:" -ForegroundColor Yellow
Get-ChildItem -Filter "*.html" | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Cyan }
if (Test-Path ".nojekyll") { Write-Host "  - .nojekyll" -ForegroundColor Cyan }
if (Test-Path "images") { Write-Host "  - images/ ($((Get-ChildItem images -File).Count) archivos)" -ForegroundColor Cyan }
if (Test-Path "videos") { Write-Host "  - videos/ ($((Get-ChildItem videos -File).Count) archivos)" -ForegroundColor Cyan }

Write-Host ""
Write-Host "Inicializando repositorio..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "  Repositorio Git ya existe" -ForegroundColor Green
} else {
    git init
}

Write-Host ""
Write-Host "Configurando remoto..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/NoelVentura/Rincondelantojo-.git
git remote -v

Write-Host ""
Write-Host "Agregando archivos..." -ForegroundColor Yellow
git add charolas.html arma.html contacto.html nosotros.html pedido.html index.html .nojekyll
git add images/ -f
git add videos/ -f

Write-Host ""
Write-Host "Archivos en staging:" -ForegroundColor Yellow
git diff --cached --name-only | ForEach-Object { Write-Host "  + $_" -ForegroundColor Green }

Write-Host ""
Write-Host "Haciendo commit..." -ForegroundColor Yellow
git commit -m "Sitio web completo: HTML, imágenes y videos"

Write-Host ""
Write-Host "Configurando rama main..." -ForegroundColor Yellow
git branch -M main

Write-Host ""
Write-Host "=== LISTO PARA SUBIR ===" -ForegroundColor Green
Write-Host ""
Write-Host "Ejecuta el siguiente comando para subir:" -ForegroundColor Yellow
Write-Host "  git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si te pide credenciales:" -ForegroundColor Yellow
Write-Host "  - Usuario: tu usuario de GitHub" -ForegroundColor White
Write-Host "  - Contraseña: un Personal Access Token (no tu contraseña normal)" -ForegroundColor White
Write-Host ""

