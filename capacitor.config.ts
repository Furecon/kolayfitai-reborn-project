
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kolayfit.app',
  appName: 'KolayFit',
  webDir: 'dist',
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ffffff'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '680638175809-io601sibqsp2dnoeonuaki31cp93mgik.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    deepLinks: [
      {
        host: 'oauth-callback',
        scheme: 'com.kolayfit.app'
      }
    ]
  },
  ios: {
    scheme: 'com.kolayfit.app',
    deepLinks: [
      {
        host: 'oauth-callback',
        scheme: 'com.kolayfit.app'
      }
    ]
  }
};

export default config;
