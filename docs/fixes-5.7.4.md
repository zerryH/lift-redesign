# Slat 5.7.4 — native live rest countdown

- Adds an iPhone app project with an ActivityKit extension for a live minutes/seconds countdown and progress bar on the Lock Screen.
- Uses clear Liquid Glass on iOS 26+, a translucent older-iOS fallback, and a solid accessibility fallback when Reduce Transparency is enabled.
- Connects logging, +30 seconds, restore, stop, finish, discard and timer disable to a versioned native bridge. Native updates are sent for state changes, never for each displayed second.
- Native Profile settings expose the lock-screen countdown. Normal browsers keep the web notification option and its explicit platform limitations.
- The in-app dock uses a lightly tinted translucent surface while continuing to reserve a dedicated layout row.
- Bounds native payloads, limits bridge calls to Slat's owned main-frame URL, serializes ActivityKit operations and removes stale activities before starting a replacement.
- Opens the active workout when a native activity is tapped. Native backup downloads open the share sheet; Safari/Home Screen data must be transferred with the existing backup importer.

Installation is required: this release cannot transform an iPhone web push into a custom live widget. See `ios/README.md` for signing, device installation, local-data transfer and distribution requirements. CI device builds are unsigned. Phone installation and actual Lock Screen appearance must be confirmed on the user's device.
