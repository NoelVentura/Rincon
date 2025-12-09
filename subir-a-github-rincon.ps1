# Script para subir archivos a GitHub - Rincondelantojo
Write-Host "=== Subiendo archivos a GitHub ===" -ForegroundColor Green
Set-Location "c:\Users\Noel Pacheco\Desktop\Proyectos Cursor\Proyectos\El-Rincon-de-las-Tablas"

Write-Host "`n1. Verificando archivos..." -ForegroundColor Yellow
$archivos = @("charolas.html", "arma.html", "contacto.html", "nosotros.html", "pedido.html", "index.html", ".nojekyll")
foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "   ✓ $archivo encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $archivo NO encontrado" -ForegroundColor Red
    }
}

Write-Host "`n2. Inicializando repositorio Git..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "   .git ya existe" -ForegroundColor Cyan
} else {
    git init
    Write-Host "   Repositorio inicializado" -ForegroundColor Green
}

Write-Host "`n3. Configurando remoto..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/NoelVentura/Rincondelantojo-.git
Write-Host "   Remoto configurado: https://github.com/NoelVentura/Rincondelantojo-.git" -ForegroundColor Green

Write-Host "`n4. Agregando archivos..." -ForegroundColor Yellow
git add charolas.html arma.html contacto.html nosotros.html pedido.html index.html .nojekyll
if (Test-Path images) {
    git add images/ -f
    Write-Host "   ✓ Carpeta images/ agregada" -ForegroundColor Green
}
if (Test-Path videos) {
    git add videos/ -f
    Write-Host "   ✓ Carpeta videos/ agregada" -ForegroundColor Green
}

Write-Host "`n5. Verificando archivos en staging..." -ForegroundColor Yellow
$staged = git diff --cached --name-only
Write-Host "   Archivos preparados: $($staged.Count)" -ForegroundColor Cyan
$staged | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }

Write-Host "`n6. Haciendo commit..." -ForegroundColor Yellow
git commit -m "Sitio web completo: HTML, imágenes y videos"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Commit realizado" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error en commit" -ForegroundColor Red
}

Write-Host "`n7. Configurando rama main..." -ForegroundColor Yellow
git branch -M main

Write-Host "`n8. Subiendo a GitHub..." -ForegroundColor Yellow
Write-Host "   (Si te pide credenciales, usa tu usuario de GitHub y un Personal Access Token como contraseña)" -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== ¡Archivos subidos exitosamente! ===" -ForegroundColor Green
    Write-Host "`nRepositorio: https://github.com/NoelVentura/Rincondelantojo-" -ForegroundColor Cyan
    Write-Host "`nAhora configura GitHub Pages:" -ForegroundColor Yellow
    Write-Host "1. Ve a Settings > Pages" -ForegroundColor White
    Write-Host "2. Selecciona 'Deploy from a branch'" -ForegroundColor White
    Write-Host "3. Selecciona 'main' y '/ (root)'" -ForegroundColor White
    Write-Host "4. Guarda los cambios" -ForegroundColor White
} else {
    Write-Host "`n=== Error al subir archivos ===" -ForegroundColor Red
    Write-Host "Verifica tus credenciales de GitHub" -ForegroundColor Yellow
}

