$baseUrl = "http://127.0.0.1:8000"

Write-Host "--- 1. Registro de Usuario ---" -ForegroundColor Cyan
$regData = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
}
$user = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body ($regData | ConvertTo-Json) -ContentType "application/json"
Write-Host "Usuario registrado: $($user.username)"

Write-Host "`n--- 2. Login ---" -ForegroundColor Cyan
$loginData = @{
    correo = "test@example.com"
    password = "password123"
}
$tokenRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
$token = $tokenRes.access_token
Write-Host "Token obtenido correctamente"

$headers = @{ Authorization = "Bearer $token" }

Write-Host "`n--- 3. Crear Cliente (Éxito) ---" -ForegroundColor Cyan
$clienteData = @{
    nombre = "Pepe Prueba"
    cedula = "12345"
    telefono = "555-1234"
}
$cliente = Invoke-RestMethod -Uri "$baseUrl/clientes/" -Method Post -Headers $headers -Body ($clienteData | ConvertTo-Json) -ContentType "application/json"
Write-Host "Cliente creado: $($cliente.nombre) (ID: $($cliente.id))"

Write-Host "`n--- 4. Crear Cliente (Duplicado) - DEBE FALLAR ---" -ForegroundColor Cyan
try {
    $duplicate = Invoke-RestMethod -Uri "$baseUrl/clientes/" -Method Post -Headers $headers -Body ($clienteData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "ERROR: Se permitió crear un duplicado" -ForegroundColor Red
} catch {
    Write-Host "CORRECTO: Falló con mensaje: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n--- 5. Actualizar Cliente (PUT) ---" -ForegroundColor Cyan
$updateData = @{
    nombre = "Pepe Editado"
    telefono = "555-9999"
}
$updated = Invoke-RestMethod -Uri "$baseUrl/clientes/$($cliente.id)" -Method Put -Headers $headers -Body ($updateData | ConvertTo-Json) -ContentType "application/json"
Write-Host "Cliente actualizado: $($updated.nombre) - Tel: $($updated.telefono)"

Write-Host "`n--- 6. Listar Usuarios (GET Users) ---" -ForegroundColor Cyan
$usersList = Invoke-RestMethod -Uri "$baseUrl/auth/users" -Method Get -Headers $headers
Write-Host "Usuarios en DB: $($usersList.count)"
$usersList | ForEach-Object { Write-Host "- $($_.username) ($($_.email))" }

Write-Host "`n--- 7. Cambio de Contraseña (PUT) ---" -ForegroundColor Cyan
$pwData = @{
    current_password = "password123"
    new_password = "newpassword456"
}
$pwRes = Invoke-RestMethod -Uri "$baseUrl/auth/change-password" -Method Put -Headers $headers -Body ($pwData | ConvertTo-Json) -ContentType "application/json"
Write-Host "Resultado: $($pwRes.message)"
