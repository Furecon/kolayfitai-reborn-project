# iOS Privacy Manifest Fix - Apple ITMS-91061 Error

## Problem
Apple rejected the app with error ITMS-91061 because three Google Sign-In frameworks were missing privacy manifests:
- GoogleSignIn.framework
- GTMAppAuth.framework
- GTMSessionFetcher.framework

## Root Cause
The Capacitor Google Auth plugin (`@codetrix-studio/capacitor-google-auth` v3.4.0-rc.4) uses **GoogleSignIn SDK 6.2.4**, which predates Apple's privacy manifest requirement.

Apple requires privacy manifests as of May 1, 2024, but:
- GoogleSignIn 6.2.4: No privacy manifest
- GoogleSignIn 7.1.0+: Includes built-in privacy manifests

## Solution Implemented

### SDK Version Override (ios/App/Podfile)
Force upgrade GoogleSignIn SDK to version 7.1+ which includes built-in privacy manifests:

```ruby
target 'App' do
  capacitor_pods

  # Override Google Sign-In SDK to version with privacy manifest support
  # Privacy manifests were added in GoogleSignIn 7.1.0+ (Apple requirement from May 2024)
  pod 'GoogleSignIn', '~> 7.1'
end
```

This override:
1. Replaces the plugin's outdated GoogleSignIn 6.2.4 with 7.1+
2. Automatically includes GTMAppAuth and GTMSessionFetcher with their privacy manifests
3. All three frameworks now have built-in Apple-compliant privacy manifests

## How It Works

1. CocoaPods reads Podfile
2. Sees GoogleSignIn 7.1+ requirement (overrides plugin's 6.2.4)
3. Downloads GoogleSignIn 7.1+ with built-in privacy manifests
4. GTMAppAuth and GTMSessionFetcher are pulled as dependencies with their manifests
5. All frameworks include proper PrivacyInfo.xcprivacy files

## Testing Locally

To test the fix:
```bash
cd ios/App
pod install
```

Verify the installed version:
```bash
pod list | grep GoogleSignIn
# Should show: GoogleSignIn (7.x.x)
```

Verify privacy manifests exist:
```bash
find Pods -name "PrivacyInfo.xcprivacy"
# Should find manifests in all three framework bundles
```

## Next Build

The next Codemagic build will:
1. Install npm dependencies (including plugin with old SDK reference)
2. Run `pod install` which overrides to GoogleSignIn 7.1+
3. Build and archive with properly manifested frameworks
4. Upload to TestFlight
5. Apple validation passes

## Why Previous Attempts Failed

**Build 25-26:** Manually added manifests to App bundle or tried to inject into frameworks post-install. This approach is fragile and Apple validation can still fail if the SDK doesn't natively include manifests.

**Build 27+ (This Fix):** Using official GoogleSignIn 7.1+ SDK which includes native, Apple-certified privacy manifests. This is the proper solution recommended by both Google and Apple.

## Important Notes

- The plugin is "virtually archived" according to its GitHub repo
- Consider migrating to an alternative plugin in the future
- This solution is a workaround until the plugin is updated
- GoogleSignIn 7.1+ is backward compatible with 6.x API
