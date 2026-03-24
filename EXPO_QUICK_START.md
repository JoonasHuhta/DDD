# 🚀 Build APK with Expo EAS - Quick Start

## Ready to Build Your "Dopamine Dealer Dan" Android App!

Everything is configured and ready. Follow these steps:

## Step 1: Create Expo Account (2 minutes)
1. Go to **https://expo.dev/signup**
2. Sign up with email/GitHub (free account)
3. Verify your email

## Step 2: Login and Build (3 commands)
```bash
# Login to your Expo account
eas login

# Configure project (one-time setup)
eas build:configure

# Build your APK (takes 5-10 minutes)
eas build --platform android --profile development
```

## Step 3: Download and Install
- Expo will give you a download link
- Download the APK to your phone
- Install it (enable "Unknown sources" if needed)
- Enjoy your native Android game!

## What Happens During Build:
1. **Upload**: Your code goes to Expo's servers
2. **Build**: They compile it with Android SDK in the cloud  
3. **Package**: Creates an APK file
4. **Notify**: Sends you download link

## Build Profiles Available:
- **development**: Debug APK for testing (recommended first)
- **preview**: Optimized APK for sharing
- **production**: App Bundle for Google Play Store

## Free Tier Includes:
- 30 builds per month
- All build profiles
- Download links for 30 days

---

**Your app details:**
- Package: com.metaman.dopaminedan
- Name: "Dopamine Dealer Dan" 
- All game features included

**Ready?** Just run: `eas login` then `eas build --platform android --profile development`