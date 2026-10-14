# Slat 5.7.27 — restored rest-reminder permission state

## Reproduced defect

Backup files retain the static rest-reminder preference, but browser notification permission belongs to each device and cannot be transferred. After restoring an enabled preference on a device whose permission was still undecided, Profile incorrectly showed **Reminder on · disable**. The first explicit tap switched the preference off without asking for permission.

## Fix

- Treat the reminder as enabled only when both the saved preference and this device's notification permission are active.
- Show **Enable static reminder** when restored permission is missing.
- On the user's first explicit tap, request permission and keep the preference enabled if permission is granted.
- Continue to avoid permission prompts during import, startup, set logging or timer ticks.

No workout, calendar, routine, rank, timer deadline or backup record is migrated or rewritten by this release.

## Regression evidence

The rest-notification integration test starts with a restored enabled preference and undecided device permission. It verifies the inactive label, exactly one permission request on the explicit tap, correct enable/disable behavior afterward, and the existing static-card, timer-adjustment, expiry and cleanup paths.
