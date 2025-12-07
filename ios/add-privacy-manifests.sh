#!/bin/bash

# Script to add privacy manifests to Google Sign-In frameworks
# This ensures Apple's privacy requirements are met

set -e

PRIVACY_MANIFEST='<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>C617.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>'

echo "🔍 Adding privacy manifests to Google Sign-In frameworks..."

# Function to add privacy manifest to a framework
add_privacy_manifest() {
    local framework_path="$1"
    local framework_name=$(basename "$framework_path")

    if [ -d "$framework_path" ]; then
        echo "✅ Found $framework_name"

        # Add to framework root
        echo "$PRIVACY_MANIFEST" > "$framework_path/PrivacyInfo.xcprivacy"
        echo "  ✅ Added PrivacyInfo.xcprivacy to root"

        # Add to Resources if it exists
        if [ -d "$framework_path/Resources" ]; then
            echo "$PRIVACY_MANIFEST" > "$framework_path/Resources/PrivacyInfo.xcprivacy"
            echo "  ✅ Added PrivacyInfo.xcprivacy to Resources"
        fi
    fi
}

# Search for frameworks in common locations
FRAMEWORKS=("GoogleSignIn.framework" "GTMAppAuth.framework" "GTMSessionFetcher.framework")

for framework in "${FRAMEWORKS[@]}"; do
    echo ""
    echo "Searching for $framework..."

    # Search in Pods directory
    found=false

    # Check in Pods build products
    if [ -d "App/Pods" ]; then
        # Find all instances of the framework
        while IFS= read -r -d '' framework_path; do
            add_privacy_manifest "$framework_path"
            found=true
        done < <(find "App/Pods" -name "$framework" -type d -print0 2>/dev/null)
    fi

    if [ "$found" = false ]; then
        echo "⚠️  $framework not found"
    fi
done

echo ""
echo "✅ Privacy manifest injection complete!"
