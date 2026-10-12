# Slat 5.7.7 — reliable date corrections and quicker rest adjustment

- Workout date validation now constructs the device-local date from numeric year, month and day fields. It no longer assumes that requesting the `en-CA` locale always produces an ISO-formatted string, preventing valid corrections from being rejected as future dates on engines with different locale data.
- The minimal rest timer now has a −30-second control beside +30 seconds and Stop. Shortening an active timer updates the persisted deadline and browser/native notification state; subtracting beyond the remaining time ends the timer cleanly.
- Existing workout dates, correction history, timer preferences and logged sets are not migrated or rewritten.

Validation covers correction with locale formatting deliberately disabled, timer deadline persistence in both directions, notification rescheduling, native timer synchronization and the full release regression suite.
