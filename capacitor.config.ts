import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.metaman.dopaminedan',
  appName: 'Dopamine Dealer Dan',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  android: {
    // Enhanced Android APK optimization
    backgroundColor: '#1a1a2e',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#1a1a2e",
      androidSplashResourceName: "splash",
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e'
    },
    Keyboard: {
      resize: 'ionic',
      resizeOnFullScreen: false
    }
  }
};

export default config;
