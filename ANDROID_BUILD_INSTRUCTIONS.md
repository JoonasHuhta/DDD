# 📱 Complete Android APK Build Guide for Dopamine Dealer Dan

## Current Status
✅ **Android project configured with Capacitor**
✅ **Web assets ready to sync**
✅ **Package ID: com.metaman.dopaminedan**
✅ **All game features working (tower, black market, Dan, etc.)**

## Method 1: Direct Android Studio Build (RECOMMENDED - 5 minutes)

### Step 1: Download Android Studio
1. Go to: https://developer.android.com/studio
2. Download and install (includes Java, Gradle, Android SDK)
3. Accept all license agreements during setup

### Step 2: Build Your APK
```bash
# Sync your web app to Android
npx cap sync android

# Open Android Studio with your project
npx cap open android
```

### Step 3: In Android Studio
1. **Wait for Gradle sync** to complete (bottom status bar)
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. **Find your APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
4. **Install on phone**: Copy APK to your Android device and install

## Method 2: Command Line Build (If Android SDK installed)

```bash
# Sync web assets
npx cap sync android

# Build APK directly
cd android
./gradlew assembleDebug
```

Your APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Method 3: GitHub Actions (Automatic Cloud Build)

### Step 1: Create GitHub Repository
1. Go to: https://github.com/new
2. Name: "dopamine-dealer-dan" 
3. Create repository (public or private)

### Step 2: Upload Your Code
1. **Download your project** as ZIP from Replit
2. **Extract and upload** to your GitHub repository
3. **GitHub Actions will automatically build** your APK (check "Actions" tab)
4. **Download APK** from "Artifacts" section

## What's Included in Your APK
✅ **Complete game**: Tower building, income, departments
✅ **Black Market**: Dopamine Dealer Dan with van arrivals
✅ **Lawsuits & Campaigns**: All game mechanics
✅ **Mobile optimized**: Touch controls, responsive UI  
✅ **Android native**: Proper app icon, permissions, package name

## Installation
1. **Enable "Unknown Sources"** in Android Settings → Security
2. **Copy APK** to your phone
3. **Tap to install**
4. **Launch "Dopamine Dealer Dan"** from app drawer

## Troubleshooting

**Build fails?**
- Make sure Android Studio is fully updated
- Accept all SDK licenses: `sdkmanager --licenses`
- Clean build: `./gradlew clean`

**APK won't install?**
- Enable "Install unknown apps" for your browser/file manager
- Check if you have enough storage space

Your Android app is fully configured and ready to build with any of these methods!