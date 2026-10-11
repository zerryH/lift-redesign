# Slat 5.7.3 — compact rest timer and phone rest cards

- The rest timer now occupies a dedicated row below the workout scroller. It cannot cover the logger, Add exercise, Finish or navigation. Desktop navigation stays at the top.
- The dock follows the current palette and font, with a thin progress line, tabular countdown, and 44-pixel Add 30 seconds/Stop targets. The timer has no transient-toast animation or second-by-second screen-reader announcements.
- The saved start time and deadline retain progress through reload. Adding time refreshes the displayed countdown and notification immediately. Finishing, discarding, disabling or stopping removes timer-only fields and its active card.
- Profile → Rest timer → Phone notifications explicitly requests permission. Logging, import and reload never prompt. Blocked/unsupported devices receive a useful status, including iPhone Home Screen instructions.
- A single tagged system card shows the next-set clock time and returns to the active workout when tapped. Extending/replacing a rest updates that card without adding a notification for each tick. Cancel/stop wins against pending asynchronous notification work.
- Rest completion can replace the card with an alert while the app continues to run. A late wake-up clears an old card instead of sounding an expired rest.

## Phone limitations

The web app cannot provide native iPhone Live Activities or an OS-maintained live countdown widget. iPhone web notifications require a Home Screen web app on a supported iOS version. Browsers control system-card styling and can suspend page timers when the phone locks or the app closes; this release does not promise scheduled background alerts. The fixed deadline stays meaningful when page execution pauses. No push subscription/server, media-playback workaround or hidden background heartbeat is used.

References: [WebKit Home Screen web notifications](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/), [Notifications API](https://notifications.spec.whatwg.org/), [Apple ActivityKit](https://developer.apple.com/documentation/ActivityKit).

## Verification

51 isolated regression scripts, including deadline cards, deduplication, async stop/replacement races, permission denial, iPhone browser guidance, cleanup and worker return paths. Release CI additionally exercises mobile/landscape/desktop dock bounds in Chromium and WebKit and the real Chromium service-worker notification API. Existing offline, import, routines, charts, storage and catalogue journeys remain in the release suite. Physical phone notification delivery and iOS Live Activities are not certified by headless browser tests.
