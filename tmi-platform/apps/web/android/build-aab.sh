#!/bin/bash
echo "=== TMI Android AAB Build Script ==="
echo "Cleaning previous build artifacts..."
./gradlew clean

echo "Building Release App Bundle (versionCode 9, versionName 1.0.9)..."
./gradlew bundleRelease

echo "Build complete! Your signed .aab file is located at:"
echo "app/build/outputs/bundle/release/app-release.aab"
