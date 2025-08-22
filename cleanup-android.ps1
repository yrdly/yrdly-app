# Android Development Cleanup Script
# This script safely removes unnecessary Android development files to free up disk space

Write-Host "🧹 Starting Android Development Cleanup..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Function to get directory size
function Get-DirectorySize {
    param([string]$Path)
    if (Test-Path $Path) {
        $size = (Get-ChildItem -Path $Path -Recurse -Force | Measure-Object -Property Length -Sum).Sum
        return [math]::Round($size / 1MB, 2)
    }
    return 0
}

# Function to safely remove directory
function Remove-DirectorySafely {
    param([string]$Path, [string]$Description)
    if (Test-Path $Path) {
        $size = Get-DirectorySize $Path
        Write-Host "📁 $Description" -ForegroundColor Yellow
        Write-Host "   Location: $Path" -ForegroundColor Gray
        Write-Host "   Size: $size MB" -ForegroundColor Gray
        
        $response = Read-Host "   Remove this directory? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            try {
                Remove-Item -Path $Path -Recurse -Force
                Write-Host "   ✅ Removed successfully!" -ForegroundColor Green
                return $size
            }
            catch {
                Write-Host "   ❌ Error removing: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "   ⏭️  Skipped" -ForegroundColor Blue
        }
    }
    return 0
}

# Show current disk usage
Write-Host "📊 Current Disk Usage:" -ForegroundColor Cyan
$androidDir = "C:\Users\USER\.android"
$gradleDir = "C:\Users\USER\.gradle"
$androidSize = Get-DirectorySize $androidDir
$gradleSize = Get-DirectorySize $gradleDir

Write-Host "   .android directory: $androidSize MB" -ForegroundColor White
Write-Host "   .gradle directory: $gradleSize MB" -ForegroundColor White
Write-Host "   Total: $($androidSize + $gradleSize) MB" -ForegroundColor White
Write-Host ""

# Clean Android build directories
Write-Host "🔨 Cleaning Android Build Directories..." -ForegroundColor Cyan
$totalFreed = 0

# Clean project build directory
if (Test-Path "android\build") {
    $buildSize = Get-DirectorySize "android\build"
    Write-Host "   android\build: $buildSize MB" -ForegroundColor Gray
    $response = Read-Host "   Remove build directory? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        try {
            Remove-Item -Path "android\build" -Recurse -Force
            Write-Host "   ✅ Build directory removed!" -ForegroundColor Green
            $totalFreed += $buildSize
        }
        catch {
            Write-Host "   ❌ Error removing build directory" -ForegroundColor Red
        }
    }
}

# Clean app build directory
if (Test-Path "android\app\build") {
    $appBuildSize = Get-DirectorySize "android\app\build"
    Write-Host "   android\app\build: $appBuildSize MB" -ForegroundColor Gray
    $response = Read-Host "   Remove app build directory? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        try {
            Remove-Item -Path "android\app\build" -Recurse -Force
            Write-Host "   ✅ App build directory removed!" -ForegroundColor Green
            $totalFreed += $appBuildSize
        }
        catch {
            Write-Host "   ❌ Error removing app build directory" -ForegroundColor Red
        }
    }
}

# Clean out directory
if (Test-Path "out") {
    $outSize = Get-DirectorySize "out"
    Write-Host "   out directory: $outSize MB" -ForegroundColor Gray
    $response = Read-Host "   Remove out directory? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        try {
            Remove-Item -Path "out" -Recurse -Force
            Write-Host "   ✅ Out directory removed!" -ForegroundColor Green
            $totalFreed += $outSize
        }
        catch {
            Write-Host "   ❌ Error removing out directory" -ForegroundColor Red
        }
    }
}

# Clean .next directory
if (Test-Path ".next") {
    $nextSize = Get-DirectorySize ".next"
    Write-Host "   .next directory: $nextSize MB" -ForegroundColor Gray
    $response = Read-Host "   Remove .next directory? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        try {
            Remove-Item -Path ".next" -Recurse -Force
            Write-Host "   ✅ .next directory removed!" -ForegroundColor Green
            $totalFreed += $nextSize
        }
        catch {
            Write-Host "   ❌ Error removing .next directory" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🏠 Cleaning User Home Directories..." -ForegroundColor Cyan

# Clean .android directory (SAFE - only removes build artifacts)
$androidBuildDir = "C:\Users\USER\.android\build-cache"
if (Test-Path $androidBuildDir) {
    $buildCacheSize = Get-DirectorySize $androidBuildDir
    Write-Host "   .android\build-cache: $buildCacheSize MB" -ForegroundColor Gray
    $response = Read-Host "   Remove Android build cache? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        try {
            Remove-Item -Path $androidBuildDir -Recurse -Force
            Write-Host "   ✅ Android build cache removed!" -ForegroundColor Green
            $totalFreed += $buildCacheSize
        }
        catch {
            Write-Host "   ❌ Error removing Android build cache" -ForegroundColor Red
        }
    }
}

# Clean .gradle directory (SAFE - only removes caches)
$gradleCachesDir = "C:\Users\USER\.gradle\caches"
if (Test-Path $gradleCachesDir) {
    $gradleCacheSize = Get-DirectorySize $gradleCachesDir
    Write-Host "   .gradle\caches: $gradleCacheSize MB" -ForegroundColor Gray
    $response = Read-Host "   Remove Gradle caches? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        try {
            Remove-Item -Path $gradleCachesDir -Recurse -Force
            Write-Host "   ✅ Gradle caches removed!" -ForegroundColor Green
            $totalFreed += $gradleCacheSize
        }
        catch {
            Write-Host "   ❌ Error removing Gradle caches" -ForegroundColor Red
        }
    }
}

# Clean Gradle daemon logs
$gradleDaemonDir = "C:\Users\USER\.gradle\daemon"
if (Test-Path $gradleDaemonDir) {
    $daemonSize = Get-DirectorySize $gradleDaemonDir
    Write-Host "   .gradle\daemon: $daemonSize MB" -ForegroundColor Gray
    $response = Read-Host "   Remove Gradle daemon logs? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        try {
            Remove-Item -Path $gradleDaemonDir -Recurse -Force
            Write-Host "   ✅ Gradle daemon logs removed!" -ForegroundColor Green
            $totalFreed += $daemonSize
        }
        catch {
            Write-Host "   ❌ Error removing Gradle daemon logs" -ForegroundColor Red
        }
    }
}

# Clean Gradle wrapper distribution
$gradleWrapperDir = "C:\Users\USER\.gradle\wrapper\dists"
if (Test-Path $gradleWrapperDir) {
    $wrapperSize = Get-DirectorySize $gradleWrapperDir
    Write-Host "   .gradle\wrapper\dists: $wrapperSize MB" -ForegroundColor Gray
    Write-Host "   ⚠️  WARNING: This contains Gradle distributions. Only remove if you want to re-download." -ForegroundColor Yellow
    $response = Read-Host "   Remove Gradle wrapper distributions? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        try {
            Remove-Item -Path $gradleWrapperDir -Recurse -Force
            Write-Host "   ✅ Gradle wrapper distributions removed!" -ForegroundColor Green
            $totalFreed += $wrapperSize
        }
        catch {
            Write-Host "   ❌ Error removing Gradle wrapper distributions" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📊 Cleanup Summary:" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Total space freed: $totalFreed MB" -ForegroundColor Green
Write-Host ""

# Show remaining sizes
Write-Host "📁 Remaining Directory Sizes:" -ForegroundColor Cyan
$remainingAndroidSize = Get-DirectorySize $androidDir
$remainingGradleSize = Get-DirectorySize $gradleDir
Write-Host "   .android: $remainingAndroidSize MB" -ForegroundColor White
Write-Host "   .gradle: $remainingGradleSize MB" -ForegroundColor White
Write-Host "   Total remaining: $($remainingAndroidSize + $remainingGradleSize) MB" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Run 'npm run build:mobile' to rebuild your app" -ForegroundColor White
Write-Host "2. Run 'npx cap sync android' to sync with Capacitor" -ForegroundColor White
Write-Host "3. Your app will work exactly the same after cleanup!" -ForegroundColor White

Write-Host ""
Write-Host "✨ Cleanup completed! Your app is safe and ready to rebuild." -ForegroundColor Green
