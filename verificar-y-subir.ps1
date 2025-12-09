# Script para verificar y subir index.html a GitHub
Write-Host "=== Verificando y subiendo index.html ===" -ForegroundColor Green

Set-Location "c:\Users\Noel Pacheco\Desktop\Proyectos Cursor\Proyectos\El-Rincon-de-las-Tablas"

Write-Host "`n1. Verificando archivo index.html..." -ForegroundColor Yellow
if (Test-Path "index.html") {
    Write-Host "   ✓ index.html existe" -ForegroundColor Green
} else {
    Write-Host "   ✗ index.html NO existe" -ForegroundColor Red
    exit
}

Write-Host "`n2. Verificando rama actual..." -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "   Rama actual: $branch" -ForegroundColor Cyan

Write-Host "`n3. Cambiando a rama master..." -ForegroundColor Yellow
git checkout master 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Creando rama master desde main..." -ForegroundColor Yellow
    git checkout -b master 2>&1 | Out-Null
}

Write-Host "`n4. Agregando archivos..." -ForegroundColor Yellow
git add index.html .nojekyll
Write-Host "   ✓ Archivos agregados" -ForegroundColor Green

Write-Host "`n5. Verificando estado..." -ForegroundColor Yellow
git status --short

Write-Host "`n6. Haciendo commit..." -ForegroundColor Yellow
git commit -m "Agregar index.html y .nojekyll para GitHub Pages" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Commit realizado" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Puede que no haya cambios nuevos" -ForegroundColor Yellow
}

Write-Host "`n7. Subiendo a GitHub..." -ForegroundColor Yellow
git push origin master 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Push completado" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error en el push" -ForegroundColor Red
}

Write-Host "`n8. Verificando archivos en el repositorio..." -ForegroundColor Yellow
git ls-files | Select-String -Pattern "index.html|\.nojekyll"

Write-Host "`n=== Proceso completado ===" -ForegroundColor Green
Write-Host "Verifica en: https://github.com/NoelVentura/El-Rincon-del-Antojo-/tree/master" -ForegroundColor Cyan
Write-Host "Sitio: https://noelventura.github.io/El-Rincon-del-Antojo-/" -ForegroundColor Cyan


