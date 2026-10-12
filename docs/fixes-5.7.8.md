# Slat 5.7.8 — static web rest reminders

Web notification text cannot run a live countdown. Slat's previous next-set card was already a fixed deadline, but its completion notification depended on the page continuing to run and could leave an apparently frozen rest card while the phone slept.

- Rename the web card and preference to a static rest reminder, with a fixed next-set time and an action to open the live in-app timer.
- Remove the web completion-notification branch and its conditional notification-retention code. No notification ticking, rescheduling loop or completion alert remains. Logging a new set and explicit ±30-second adjustments still replace the fixed deadline.
- Clear the card when the app observes expiration, stops or disables the timer, finishes or discards the workout. While the app is suspended, the static deadline remains readable and the card can be dismissed.
- Allow retrying the same deadline after a notification failure and clear an old card if a pending request expires before it can be shown.
- Retain the existing native iPhone ActivityKit/SwiftUI countdown and in-app timer. No workout data or preferences are migrated.

Validation includes notification snapshots across elapsed time, no completion card on timely or late expiration, same-deadline retry, cancellation races, real service-worker replacement/cleanup, the full regression suite, and native bridge checks. Native countdown rendering still requires a signed app and physical-device verification; publishing the web app does not install that widget.
