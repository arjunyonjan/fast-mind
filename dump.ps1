$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$files = Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js,*.jsx,*.css,*.json,*.mjs,*.cjs | Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.git|dist|build|\.env|package-lock' }
$output = foreach ($file in $files) { "=== $($file.FullName) ===`n$(Get-Content $file.FullName -Raw)`n" }
$output | Out-File "code-dump-$timestamp.txt" -Encoding utf8
Write-Host "Saved: code-dump-$timestamp.txt"
