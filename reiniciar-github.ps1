# Script para reiniciar el repositorio de GitHub desde cero
# Ejecuta este script en PowerShell

Write-Host "=== Reiniciando repositorio de GitHub ===" -ForegroundColor Green
Set-Location "c:\Users\Noel Pacheco\Desktop\Proyectos Cursor\Proyectos\El-Rincon-de-las-Tablas"

Write-Host "`n1. Eliminando conexión remota existente..." -ForegroundColor Yellow
git remote remove origin 2>$null

Write-Host "`n2. Inicializando repositorio Git..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "   .git ya existe, limpiando..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force .git
}
git init

Write-Host "`n3. Creando archivo .nojekyll..." -ForegroundColor Yellow
New-Item -ItemType File -Path .nojekyll -Force | Out-Null

Write-Host "`n4. Agregando archivos principales..." -ForegroundColor Yellow
git add index.html nosotros.html contacto.html pedido.html arma.html .nojekyll images/ -f

Write-Host "`n5. Haciendo commit inicial..." -ForegroundColor Yellow
git commit -m "Inicio: Sitio web El Rincón del Antojo"

Write-Host "`n6. Creando rama master..." -ForegroundColor Yellow
git branch -M master

Write-Host "`n7. Configurando remoto..." -ForegroundColor Yellow
git remote add origin https://github.com/NoelVentura/El-Rincon-del-Antojo-.git

Write-Host "`n8. Subiendo a GitHub..." -ForegroundColor Yellow
Write-Host "   (Si te pide credenciales, usa tu usuario de GitHub y un Personal Access Token como contraseña)" -ForegroundColor Cyan
git push -u origin master --force

Write-Host "`n=== Proceso completado ===" -ForegroundColor Green
Write-Host "`nAhora ve a GitHub y configura GitHub Pages:" -ForegroundColor Cyan
Write-Host "1. Ve a Settings > Pages" -ForegroundColor White
Write-Host "2. Selecciona 'Deploy from a branch'" -ForegroundColor White
Write-Host "3. Selecciona 'master' y '/ (root)'" -ForegroundColor White
Write-Host "4. Guarda los cambios" -ForegroundColor White
Write-Host "`nTu sitio estará disponible en:" -ForegroundColor Cyan
Write-Host "https://noelventura.github.io/El-Rincon-del-Antojo-/" -ForegroundColor Yellow


