# Slat for iPhone — live glass rest timer

This is an installable **native iPhone app project**, not a web push notification template. It opens the Slat web UI in a persistent WKWebView and connects the saved rest deadline to an ActivityKit widget extension.

The Lock Screen card contains a real OS-rendered minutes/seconds countdown and a thin remaining-time progress bar. On iOS 26+, its surface uses clear Liquid Glass; on iOS 17–25 it uses an ultra-thin translucent material. Reduce Transparency selects a solid system background. The Dynamic Island uses Apple's required black presentation with a compact countdown.

The countdown uses SwiftUI `Text(timerInterval:)` and `ProgressView(timerInterval:)`. It does not depend on JavaScript continuing to tick, repeated web notifications or background audio. Logging replaces/updates the active rest; +30 updates its deadline; stop, discard, finish and disable end the activity. Tap the card to return to the current workout.

## Install on your iPhone with Xcode

1. Download this repository and open `ios/Slat.xcodeproj` on a Mac with **Xcode 26 or newer**.
2. In Xcode Settings → Accounts, sign in to your own Apple Account.
3. Select the **Slat** and **SlatRestWidget** targets. In Signing & Capabilities, select your team for both. If the bundle identifiers are already registered, change the app identifier to a unique value and use that same prefix for the widget extension.
4. Connect your iPhone, enable Developer Mode if Xcode requests it, select the phone as the run destination, and click Run.
5. Open Slat, allow Live Activities in iPhone Settings if required, and log a set. The native live countdown is enabled by default; Profile → Rest timer → Lock-screen timer can disable it.

A free Xcode Personal Team can be used for personal device testing. Provisioning must be renewed periodically. TestFlight/App Store distribution needs the appropriate Apple Developer Program account and signed builds. The unsigned CI device build is **not directly installable from Safari**, and is not a signed TestFlight release.

## Keep your existing workouts

WKWebView has its own local data store. It does not automatically read your Safari/Home Screen Slat data. Export a JSON backup from the existing Slat app, then import that file inside the native app using Profile → Import. Inspect the existing import preview before confirming. Native exports use the iPhone share sheet so backups can be saved to Files.

## Build and validation

The Xcode project and shared scheme are committed and generated deterministically with `python3 ios/generate-project.py`. CI checks reproducibility and compiles both Simulator and unsigned iPhone device builds, including the embedded widget extension. The JavaScript release suite verifies the native bridge and the existing browser app independently.

```sh
xcodebuild -project ios/Slat.xcodeproj -scheme Slat -configuration Debug \
  -sdk iphoneos -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
```

The app needs internet for its first website load. Subsequent offline behavior uses Slat's existing service-worker cache. The native bridge accepts messages only from the main frame under the exact Slat HTTPS site. Payload dates and identifiers are bounded, asynchronous ActivityKit work is serialized, and the last stop/replace operation wins.

## Presentation limits

Apple controls where Live Activities appear, refresh cadence on Always-On displays, and final rendering of glass against a device's wallpaper. The countdown stops at zero; an expired activity can remain until the app resumes or the user dismisses it. This project does not claim a guaranteed completion alarm while the app is terminated. Physical-device signing, installation and visual confirmation remain necessary before a production/TestFlight release.

The development icon reuses Slat's existing 180-pixel iPhone icon. Production distribution also requires a complete App Store icon asset set.

Primary references: [ActivityKit](https://developer.apple.com/documentation/ActivityKit), [Live Activity guidance](https://developer.apple.com/design/human-interface-guidelines/live-activities), [SwiftUI Liquid Glass](https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views), [Personal device testing](https://developer.apple.com/help/account/basics/about-your-developer-account).
