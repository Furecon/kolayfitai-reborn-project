# Google Authentication Setup Guide

## Overview
This app uses Google Sign-In for authentication on both web and mobile platforms. This guide will help you configure Google OAuth correctly.

## Prerequisites
1. A Google Cloud Console account
2. Access to your Supabase project dashboard

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API" or "Google Identity Platform"

### 1.2 Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (or Internal if for organization only)
3. Fill in the required information:
   - App name: **KolayFit**
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `email` and `profile`
5. Save and continue

### 1.3 Create OAuth 2.0 Credentials

#### For Web (Supabase)
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Add these to **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://your-supabase-project.supabase.co
   https://your-domain.com
   ```
5. Add these to **Authorized redirect URIs**:
   ```
   http://localhost:5173/auth/callback
   https://your-supabase-project.supabase.co/auth/v1/callback
   https://your-domain.com/auth/callback
   ```
6. Click **Create** and save your:
   - Client ID
   - Client Secret

#### For Android
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Choose **Android**
4. Package name: `com.kolayfitai.app`
5. Get SHA-1 certificate fingerprint:
   ```bash
   # For debug keystore
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

   # For release keystore (if you have one)
   keytool -list -v -keystore /path/to/your/keystore -alias your-alias
   ```
6. Enter the SHA-1 fingerprint
7. Click **Create**
8. Save the **Client ID** (this is your Android Client ID)

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Find **Google** and toggle it on
5. Enter your credentials:
   - **Client ID**: Your Web Client ID from Google Cloud Console
   - **Client Secret**: Your Web Client Secret
6. Click **Save**

### 2.2 Configure Redirect URLs
1. In Supabase, go to **Authentication** > **URL Configuration**
2. Add these to **Redirect URLs**:
   ```
   http://localhost:5173
   https://your-domain.com
   com.kolayfitai.app://oauth-callback
   ```

**CRITICAL**: The redirect URL MUST match your app's package name. In this project it's `com.kolayfitai.app` (NOT `com.kolayfit.app`).

## Step 3: Update Application Configuration

### 3.1 Update Environment Variables
Create or update your `.env` file with your Google Web Client ID:

```bash
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

**Important**:
- Copy `.env.example` to `.env` if you haven't already
- Replace `YOUR_WEB_CLIENT_ID.apps.googleusercontent.com` with your actual Web Client ID
- Use your **Web Client ID** (not Android Client ID)

### 3.2 Update Capacitor Config
Edit `capacitor.config.ts` and replace the placeholder with your actual Web Client ID:

```typescript
GoogleAuth: {
  scopes: ['profile', 'email'],
  serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace this!
  forceCodeForRefreshToken: true
}
```

**Note**: You need to update this in both `.env` and `capacitor.config.ts` for now.

### 3.3 Add google-services.json (Android)
1. Download `google-services.json` from your Firebase project (or create one in Firebase Console)
2. Place it in: `android/app/google-services.json`

**Note**: If you don't have Firebase set up:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Add your project or create a new one
3. Add an Android app with package name: `com.kolayfitai.app`
4. Download the `google-services.json` file

## Step 4: Sync and Build

### 4.1 Sync Capacitor
```bash
npm run cap:sync:android
```

### 4.2 Build the app
```bash
npm run build
```

### 4.3 Open in Android Studio
```bash
npm run cap:open:android
```

## Step 5: Testing

### Web Testing
1. Run the development server:
   ```bash
   npm run dev
   ```
2. Click "Google ile Giriş Yap"
3. You should be redirected to Google's OAuth page

### Mobile Testing
1. Build and run the app in Android Studio
2. Click "Google ile Giriş Yap"
3. The native Google Sign-In sheet should appear

## Troubleshooting

### Error: "idpiframe_initialization_failed"
- Make sure your domain is added to **Authorized JavaScript origins** in Google Cloud Console
- Clear browser cache and try again

### Error: "redirect_uri_mismatch"
- Check that all redirect URIs are added in Google Cloud Console
- Make sure they match exactly (including https/http)

### Error: "API key not valid"
- Check that Google+ API is enabled in Google Cloud Console
- Verify the API key configuration

### Android: Google Sign-In doesn't work
- Verify SHA-1 fingerprint is correct in Google Cloud Console
- Make sure `google-services.json` is in the correct location
- Check that package name matches: `com.kolayfitai.app`
- Try regenerating the debug keystore and updating the SHA-1
- Make sure you've synced Capacitor: `npm run cap:sync:android`

### Error: "requested path is invalid"
This error typically occurs due to Supabase configuration issues:

1. **Check Supabase Redirect URLs**:
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Make sure these URLs are added to **Redirect URLs**:
     ```
     http://localhost:5173
     https://your-domain.com
     com.kolayfitai.app://oauth-callback
     ```
   - **CRITICAL**: Use `com.kolayfitai.app` (with 'ai'), NOT `com.kolayfit.app`

2. **Check Google OAuth Provider in Supabase**:
   - Go to Authentication > Providers > Google
   - Make sure it's enabled
   - Verify Web Client ID and Secret are correct
   - Click Save

3. **Verify Google Cloud Console**:
   - Your **Web Client ID** should be added to Supabase
   - Your **Android Client ID** should have the correct SHA-1 fingerprint
   - Both should be from the same Google Cloud project

4. **Check package name consistency**:
   - `capacitor.config.ts`: `appId: 'com.kolayfitai.app'`
   - `AndroidManifest.xml`: package matches
   - Supabase redirect URL: `com.kolayfitai.app://oauth-callback`

### Error: "incompatible types: MainActivity cannot be converted to PluginCall"
- This error has been fixed. MainActivity no longer needs manual GoogleAuth initialization
- The plugin initializes automatically
- Just make sure you've updated your code to the latest version

### iOS: Not implemented (future)
For iOS support, you'll need to:
1. Create an iOS OAuth Client ID in Google Cloud Console
2. Add URL scheme to Info.plist
3. Configure additional settings in Xcode

## Security Notes

1. **Never commit**:
   - `google-services.json`
   - Client secrets
   - API keys

2. Add to `.gitignore`:
   ```
   google-services.json
   .env
   ```

3. Use environment variables for sensitive data in production

## Need Help?

- [Capacitor Google Auth Plugin Docs](https://github.com/CodetrixStudio/CapacitorGoogleAuth)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
