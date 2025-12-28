$routes = @(
    "http://localhost:3001/",
    "http://localhost:3001/sign-in",
    "http://localhost:3001/sign-up",
    "http://localhost:3001/editor/test-project-id",
    "http://localhost:3001/api/trpc/healthCheck"
)

Write-Host ""
Write-Host "=== Testing All Routes ===" -ForegroundColor Cyan

foreach ($route in $routes) {
    Write-Host ""
    Write-Host "Testing: $route" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $route -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        Write-Host "  Status: $($response.StatusCode) - OK" -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  Status: $statusCode - ERROR" -ForegroundColor Red
        Write-Host "  Message: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan

