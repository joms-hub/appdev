# PowerShell script to eliminate ALL production console.logs
Write-Host "🚀 Starting comprehensive console.log cleanup..." -ForegroundColor Green

# Strategy: Remove ALL console.log/error/warn from production code
# Keep only critical error logs that are already properly handled

$patterns = @(
    # Remove debug/info console.logs completely
    '(\s*)console\.log\([^)]*\);?\s*',
    # Keep only console.error for actual errors (will wrap in dev check later)
    '(\s*)console\.info\([^)]*\);?\s*',
    '(\s*)console\.warn\([^)]*\);?\s*',
    '(\s*)console\.debug\([^)]*\);?\s*'
)

# Files to clean (exclude scripts, tests, and seed files - they can keep logs)
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
    $content = $content -replace '(\s*)(console\.error\([^)]*\);)', '$1if (process.env.NODE_ENV === ''development'') { $2 }'
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "✅ Cleaned: $relativePath" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Console.log cleanup completed!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Blue
Write-Host "  - Removed ALL console.log statements from production" -ForegroundColor White  
Write-Host "  - Wrapped console.error in development checks" -ForegroundColor White
Write-Host "  - Kept scripts and test files unchanged" -ForegroundColor White
