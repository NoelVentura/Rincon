# Script para subir archivos a GitHub
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SUBIR ARCHIVOS A GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ruta = "c:\Users\Noel Pacheco\Desktop\Proyectos Cursor\Proyectos\El-Rincon-de-las-Tablas"
Set-Location $ruta

# Verificar archivos
Write-Host "Verificando archivos..." -ForegroundColor Yellow
$archivos = @("charolas.html", "arma.html", "contacto.html", "nosotros.html", "pedido.html", "index.html", ".nojekyll")
$todosExisten = $true
foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "  [OK] $archivo" -ForegroundColor Green
    } else {
        Write-Host "  [FALTA] $archivo" -ForegroundColor Red
        $todosExisten = $false
    }
}

if (-not $todosExisten) {
    Write-Host ""
    Write-Host "ERROR: Faltan algunos archivos. Verifica que existan." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Inicializando Git..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "  Repositorio ya existe" -ForegroundColor Cyan
} else {
    git init
    Write-Host "  Repositorio inicializado" -ForegroundColor Green
}

Write-Host ""
Write-Host "Configurando remoto..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/NoelVentura/Rincondelantojo-.git
$remote = git remote get-url origin
Write-Host "  Remoto: $remote" -ForegroundColor Green

Write-Host ""
Write-Host "Agregando archivos..." -ForegroundColor Yellow
git add charolas.html arma.html contacto.html nosotros.html pedido.html index.html .nojekyll
if (Test-Path images) {
    git add images/ -f
    Write-Host "  [OK] Carpeta images/" -ForegroundColor Green
}
if (Test-Path videos) {
    git add videos/ -f
    Write-Host "  [OK] Carpeta videos/" -ForegroundColor Green
}

Write-Host ""
Write-Host "Archivos preparados:" -ForegroundColor Yellow
git diff --cached --name-only | ForEach-Object { Write-Host "  + $_" -ForegroundColor White }

Write-Host ""
Write-Host "Haciendo commit..." -ForegroundColor Yellow
git commit -m "Sitio web completo: HTML, imágenes y videos"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Commit realizado" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] No se pudo hacer commit" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Configurando rama main..." -ForegroundColor Yellow
git branch -M main

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LISTO PARA SUBIR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ejecuta ahora:" -ForegroundColor Yellow
Write-Host "  git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE: Si te pide credenciales:" -ForegroundColor Yellow
Write-Host "  - Usuario: NoelVentura" -ForegroundColor White
Write-Host "  - Contraseña: Usa un Personal Access Token" -ForegroundColor White
Write-Host "    (NO uses tu contraseña normal de GitHub)" -ForegroundColor Red
Write-Host ""

