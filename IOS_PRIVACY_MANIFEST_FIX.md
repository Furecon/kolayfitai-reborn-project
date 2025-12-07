# iOS Privacy Manifest Fix - Apple ITMS-91061 Error

## Problem
Apple rejected the app with error ITMS-91061 because three Google Sign-In frameworks were missing privacy manifests:
- GoogleSignIn.framework
- GTMAppAuth.framework
- GTMSessionFetcher.framework

## Solution Implemented

### 1. Podfile Hook (ios/App/Podfile)
Added a `post_install` hook that automatically injects privacy manifests into the framework bundles after CocoaPods installation:

```ruby
post_install do |installer|
  # Searches for frameworks in multiple locations
  # Copies PrivacyInfo.xcprivacy to each framework bundle
  # Also adds to Resources folder if it exists
end
```

### 2. Backup Shell Script (ios/add-privacy-manifests.sh)
Created a standalone script that can be run independently to add privacy manifests. This script:
- Searches for all three frameworks in the Pods directory
- Adds PrivacyInfo.xcprivacy to both root and Resources folder
- Provides detailed logging for verification

### 3. Codemagic Integration
Updated `codemagic.yaml` to run the shell script after pod install:
```yaml
- name: Add privacy manifests to frameworks
  script: |
    cd ios && bash add-privacy-manifests.sh
```

## Privacy Manifest Content
The manifest declares:
- No tracking (NSPrivacyTracking: false)
- No tracking domains
- No collected data types
- Only required API access:
  - UserDefaults (CA92.1) - For user preferences
  - FileTimestamp (C617.1) - For caching

## How It Works

1. When `pod install` runs, the Podfile's post_install hook executes
2. The hook searches for the three frameworks in common CocoaPods locations
3. Privacy manifest file is copied to each framework
4. Additionally, the shell script runs as a backup in Codemagic
5. Both framework root and Resources folder get the manifest

## Testing Locally

To test the fix locally:
```bash
cd ios/App
pod install
cd ..
bash add-privacy-manifests.sh
```

Then verify frameworks contain PrivacyInfo.xcprivacy:
```bash
find ios/App/Pods -name "PrivacyInfo.xcprivacy"
```

## Next Build

The next Codemagic build will:
1. Install CocoaPods dependencies
2. Podfile hook adds privacy manifests
3. Shell script runs as backup
4. Build and archive with manifests included
5. Upload to TestFlight
6. Apple validation should pass

## Why Previous Attempts Failed

**Build 25-26:** Added manifest to App bundle only, not to individual frameworks. Apple requires each third-party SDK to have its own manifest embedded.

**This Fix:** Manifests are now embedded directly into each framework bundle, meeting Apple's requirements.
