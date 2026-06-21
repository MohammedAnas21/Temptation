# Temptations Cafe — Flutter Build Instructions

This project (`platform/apps/mobile`) currently contains only the `lib/` Dart
source and `pubspec.yaml` — the native `android/` and `ios/` project folders
have **not** been generated yet, and font/image asset files are **not**
included (only placeholder `.gitkeep` files exist in `assets/fonts/` and
`assets/images/`). You must complete the steps below on a machine with the
Flutter SDK installed before this will build.

## 1. Prerequisites

- Flutter 3.19+ (`flutter --version` to confirm)
- Android Studio (for Android SDK + emulator) and/or Xcode (for iOS, macOS only)
- A Firebase project with Authentication enabled (Phone, Google, Apple, Anonymous sign-in methods turned on)

## 2. Add required assets (currently missing)

Download and place these **before** building — the app will fail to compile without them:

- `assets/fonts/Fraunces-Regular.ttf`, `-Medium.ttf`, `-SemiBold.ttf`, `-Bold.ttf`, `-Black.ttf`
  → https://fonts.google.com/specimen/Fraunces
- `assets/fonts/WorkSans-Regular.ttf`, `-Medium.ttf`, `-SemiBold.ttf`, `-Bold.ttf`
  → https://fonts.google.com/specimen/Work+Sans
- `assets/images/` — app logo/splash source images (reuse the fixed logo from
  `artifacts/mobile/assets/images/logo.png` in this repo as your starting point)

## 3. Generate native projects

From `platform/apps/mobile/`:

```bash
flutter create --platforms=android,ios --org com.temptations .
flutter pub get
```

This generates the `android/` and `ios/` folders. It will NOT overwrite your existing `lib/`.

## 4. Firebase setup

1. In the Firebase console, register an Android app with package name `com.temptations.cafe` and an iOS app with bundle ID `com.temptations.cafe` (matching the Expo prototype's existing bundle ID for consistency).
2. Download `google-services.json` → place in `android/app/google-services.json`.
3. Download `GoogleService-Info.plist` → place in `ios/Runner/GoogleService-Info.plist`.
4. Add the Firebase Gradle plugin to `android/build.gradle` and `android/app/build.gradle` per the FlutterFire docs (`flutterfire configure` can automate steps 2–4 if you have the FlutterFire CLI installed).

## 5. Android build configuration

In `android/app/build.gradle`, set:

```gradle
android {
    namespace "com.temptations.cafe"
    defaultConfig {
        applicationId "com.temptations.cafe"
        minSdkVersion 23
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

Add required permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" /> <!-- only if using Google Maps "find us" -->
<uses-permission android:name="com.google.android.gms.permission.AD_ID" /> <!-- required by google_sign_in on Android 13+ -->
```

For Google Maps, add your API key inside `<application>`:

```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_MAPS_API_KEY" />
```

### Release signing (required for Play Store)

1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore temptations-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias temptations
   ```
2. Create `android/key.properties` (do **not** commit this file):
   ```
   storePassword=<your password>
   keyPassword=<your password>
   keyAlias=temptations
   storeFile=../temptations-release.jks
   ```
3. Reference it in `android/app/build.gradle`'s `signingConfigs` block (standard Flutter release-signing boilerplate — see https://docs.flutter.dev/deployment/android#signing-the-app).

## 6. iOS build configuration

In `ios/Runner/Info.plist`, add usage descriptions for any permission you use:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Used to show directions to our cafe.</string>
<key>NSCameraUsageDescription</key>
<string>Used to update your profile photo.</string>
```

Enable "Sign in with Apple" capability in Xcode (Runner target → Signing & Capabilities → + Capability).

Set the bundle identifier to `com.temptations.cafe` and configure your Apple Developer signing team in Xcode before archiving.

## 7. Build the APK

```bash
flutter build apk --release
# output: build/app/outputs/flutter-apk/app-release.apk
```

For Play Store, build an App Bundle instead:

```bash
flutter build appbundle --release
# output: build/app/outputs/bundle/release/app-release.aab
```

## 8. Play Store readiness checklist

- [ ] Unique, signed release build (steps above)
- [ ] App icon set via `flutter_launcher_icons` (add as a dev dependency, point at your real icon asset, run `dart run flutter_launcher_icons`)
- [ ] Privacy Policy URL live (referenced in Settings → Privacy Policy in-app)
- [ ] Target API level meets current Play Store minimum (`targetSdkVersion 34` above satisfies this as of 2025)
- [ ] Data safety form filled in Play Console (this app collects phone number, email, birthday/anniversary, location if Maps is used)
- [ ] Internal testing track build uploaded and smoke-tested before production rollout
