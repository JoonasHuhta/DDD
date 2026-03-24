# 🚀 Build APK with Expo EAS (Easiest Method!)

Expo EAS Build is perfect for building your "Dopamine Dealer Dan" Android APK in the cloud - no Android Studio needed!

## ✅ Setup Complete
I've configured your project for Expo EAS Build:
- `eas.json` - Build configuration
- `app.json` - App metadata and settings
- EAS CLI tools installed

## 🎯 Build Your APK (3 Simple Steps)

### Step 1: Create Expo Account
1. Go to https://expo.dev/signup
2. Create a free account

### Step 2: Login and Configure
```bash
# Login to your account
eas login

# Configure the project for building
eas build:configure
```

### Step 3: Build Your APK
```bash
# Build development APK (recommended first)
eas build --platform android --profile development

# Or build preview APK for testing  
eas build --platform android --profile preview
```

The build will take 5-10 minutes and you'll get a download link for your APK!

## 📱 What Happens Next

1. **EAS uploads your code** to Expo's build servers
2. **Builds your APK** in the cloud (takes 5-10 minutes)
3. **Sends you a link** to download the APK
4. **Install APK** on your Android device

## 💰 Pricing
- **Free tier**: 30 builds per month
- **Production builds**: Upgrade for unlimited builds
- Perfect for testing and initial releases!

## 🎮 Your App Details
- **Package**: com.metaman.dopaminedan  
- **Name**: "Dopamine Dealer Dan"
- **Version**: 1.0.0
- **Dark theme** with your game logo
- **Internet permissions** for server features

## 🔧 Build Profiles Available

### Development
- Quick APK for testing
- Debug mode enabled
- Perfect for initial testing

### Preview  
- Optimized APK for sharing
- Good for beta testing
- Smaller file size

### Production
- App Bundle (AAB) for Play Store
- Fully optimized
- Ready for publishing

## 🚀 Advanced: Automatic Builds

Set up automatic builds with GitHub:
```bash
# Connect to GitHub repo
eas build --platform android --auto-submit
```

## 📋 Troubleshooting

**"Not logged in"**: Run `npx expo login`
**"Build failed"**: Check the build logs in your Expo dashboard
**"APK won't install"**: Enable "Unknown sources" in Android settings

---

**Ready to build?** Just run:
```bash
eas build --platform android --profile development
```

Your APK will be ready in 5-10 minutes!