# Script simple para ejecutar push
cd "c:\Users\Noel Pacheco\Desktop\Proyectos Cursor\Proyectos\El-Rincon-de-las-Tablas"

Write-Host "Verificando estado..." -ForegroundColor Yellow
git status

Write-Host "`nVerificando commits..." -ForegroundColor Yellow
git log --oneline -3

Write-Host "`nVerificando remoto..." -ForegroundColor Yellow
git remote -v

Write-Host "`nEjecutando push..." -ForegroundColor Green
git push -u origin main

Write-Host "`nPush completado. Verifica en GitHub:" -ForegroundColor Cyan
Write-Host "https://github.com/NoelVentura/Rincondelantojo-" -ForegroundColor Yellow

