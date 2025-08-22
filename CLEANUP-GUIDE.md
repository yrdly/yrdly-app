# 🧹 Android Development Cleanup Guide

## **What's Safe to Delete (Will Free Up Space):**

### **1. Project Build Directories (SAFE)**
- `android/build/` - Android build cache
- `android/app/build/` - App build cache  
- `out/` - Capacitor output directory
- `.next/` - Next.js build cache

### **2. User Home Directories (SAFE)**
- `C:\Users\USER\.android\build-cache\` - Android build cache
- `C:\Users\USER\.gradle\caches\` - Gradle dependency cache
- `C:\Users\USER\.gradle\daemon\` - Gradle daemon logs
- `C:\Users\USER\.gradle\wrapper\dists\` - Gradle distributions (⚠️ will re-download)

## **What to NEVER Delete (Will Break Your App):**

### **❌ Critical Files (NEVER DELETE):**
- `android/app/src/` - Your app source code
- `android/app/google-services.json` - Firebase configuration
- `android/gradle/` - Gradle wrapper files
- `android/local.properties` - SDK paths
- `android/build.gradle` - Build configuration
- `android/app/build.gradle` - App configuration

## **Quick Manual Cleanup Commands:**

### **Option 1: Run the Cleanup Script (Recommended)**
```powershell
.\cleanup-android.ps1
```

### **Option 2: Manual Cleanup**
```powershell
# Clean project build directories
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "out" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# Clean user home directories
Remove-Item -Path "C:\Users\USER\.android\build-cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "C:\Users\USER\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "C:\Users\USER\.gradle\daemon" -Recurse -Force -ErrorAction SilentlyContinue
```

## **After Cleanup - Rebuild Your App:**

```bash
# 1. Build the mobile app
npm run build:mobile

# 2. Sync with Capacitor
npx cap sync android

# 3. Run on device/emulator
npx cap run android
```

## **Expected Space Savings:**

- **Project build directories**: 100-500 MB
- **Android build cache**: 200-1000 MB  
- **Gradle caches**: 500-2000 MB
- **Gradle daemon logs**: 50-200 MB
- **Total potential savings**: 850-3700 MB

## **Why This is Safe:**

✅ **Build directories** are regenerated every time you build
✅ **Caches** are automatically recreated when needed
✅ **Source code** and configuration files are never touched
✅ **Your app** will work exactly the same after cleanup

## **If Something Goes Wrong:**

1. **Don't panic** - we only deleted cache files
2. **Run the build commands** above - they'll recreate everything
3. **Check your source code** - it should all still be there
4. **Contact me** if you need help rebuilding

---

**💡 Pro Tip**: Run this cleanup monthly to keep your disk space healthy!
