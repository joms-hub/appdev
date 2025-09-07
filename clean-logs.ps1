# PowerShell script to eliminate ALL production console.logs
Write-Host "Starting comprehensive console.log cleanup..." -ForegroundColor Green

# Files to clean (exclude scripts, tests, and seed files)
$targetFiles = Get-ChildItem -Recurse -Include "*.ts","*.tsx" -Exclude "*test*","*spec*","seed.ts","*.disabled.*" | 
    Where-Object { 
        $_.FullName -notmatch '\\scripts\\' -and 
        $_.FullName -notmatch '\\test-' -and
        $_.FullName -notmatch 'prisma\\seed' -and
        $_.FullName -notmatch 'fix-console-logs'
    }

foreach ($file in $targetFiles) {
    $relativePath = $file.FullName.Replace((Get-Location), "")
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove debug console.logs completely
    $content = $content -replace '\s*console\.log\([^)]*\);\s*\n?', ''
    
    # Wrap console.error in development checks  
    $content = $content -replace '(\s*)(console\.error\([^)]*\);)', '$1if (process.env.NODE_ENV === "development") { $2 }'
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Cleaned: $relativePath" -ForegroundColor Yellow
    }
}

Write-Host "Console.log cleanup completed!" -ForegroundColor Green
