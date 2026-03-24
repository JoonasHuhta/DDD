# 📱 Build APK with Android Studio - Complete Guide

## Step 1: Download Your Project Files

### From Replit:
1. Click the **3 dots menu** (⋯) next to "Files" in the left sidebar
2. Select **"Download as ZIP"**
3. Save the ZIP file to your computer
4. **Extract the ZIP** to a folder (like `dopamine-dealer-dan-project`)

## Step 2: Install Android Studio

### Download:
- Go to: **https://developer.android.com/studio**
- Click **"Download Android Studio"**
- Choose your operating system (Windows/Mac/Linux)

### Installation:
1. Run the installer
2. Choose **"Standard"** installation
3. Accept all license agreements
4. Wait for SDK download (takes 10-15 minutes)

## Step 3: Open Your Project

### In Terminal/Command Prompt:
Navigate to your extracted project folder:
```bash
cd path/to/your/dopamine-dealer-dan-project
```

### Sync Web Assets to Android:
```bash
npm install
npx cap sync android
```

### Open in Android Studio:
```bash
npx cap open android
```

This opens Android Studio with your project automatically loaded.

## Step 4: Build APK in Android Studio

### Wait for Setup:
- Android Studio will open and show **"Gradle sync in progress"**
- Wait for this to complete (bottom status bar shows progress)
- May take 5-10 minutes on first load

### Build APK:
1. Go to menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete (see progress in bottom panel)
3. When done, you'll see: **"APK(s) generated successfully"**

## Step 5: Find Your APK

### Location:
Your APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Quick Access:
- Android Studio will show a **"locate"** link when build completes
- Click it to open the folder containing your APK

## Step 6: Install on Android Device

### Enable Installation:
1. On your Android phone: **Settings → Security → Unknown Sources**
2. Enable **"Allow installation from unknown sources"**

### Install:
1. Copy `app-debug.apk` to your phone
2. Tap the APK file
3. Tap **"Install"**
4. Launch **"Dopamine Dealer Dan"** from your app drawer

## Your APK Includes:
✅ Complete tower building game
✅ Black market with Dopamine Dealer Dan
✅ Van arrivals with horn sounds  
✅ All lawsuits and campaigns
✅ Touch-optimized mobile controls
✅ Package: com.metaman.dopaminedan

## Troubleshooting:

**Build fails?**
- Make sure you ran `npm install` first
- Try: **Build → Clean Project**, then rebuild

**Android Studio won't open project?**
- Make sure you ran `npx cap sync android` first
- Check that `android` folder exists in your project

**APK won't install?**
- Enable "Install unknown apps" for your file manager
- Make sure you have enough storage space

The whole process takes about 20-30 minutes including Android Studio download.