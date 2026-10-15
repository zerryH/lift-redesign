# 5.7.46 — safe completion of notification permission

## Reproduced on 5.7.45

Start enabling static rest reminders and leave the device permission request pending. If another tab saves first, the original tab pauses to protect its recovery copy. Granting permission afterward still changed that paused copy's `restNotifications` preference and could publish a reminder.

Likewise, importing a replacement backup before the permission result arrived let the older gesture enable reminders in the newly imported profile. No conflict/import guard remained active after the import, so checking only a current guard was insufficient.

The new regression first failed on 5.7.45: `storageConflict: a late permission result cannot change a paused state`, with `restNotifications` changing from false to true.

## Focused fix

- Check mutation safety before starting the action and after its asynchronous boundaries.
- Capture the originating state identity. Ignore permission results/errors if the active state was replaced by import/reset, or the tab became paused by a conflict or protected operation.
- Do not publish a reminder or redraw from a stale completion.
- Release the busy flag so a fresh user gesture remains possible. Already-granted device permission can be used without asking twice.
- Keep web notifications as static next-set reminders; no countdown updates, finish alerts or new permission prompts were added.
- No workout-measurement, exercise, ranking, calendar or backup-format changes.

## Regression coverage

- New isolated test covers pending permission under conflict/import/finish locks, completed backup replacement, granted/denied/rejected outcomes, unchanged memory/storage, no stale reminder, and fresh-gesture recovery.
- Chromium/WebKit journey covers a real second-tab save while the permission callback is deferred, then a completed backup replacement followed by a stale result and a successful fresh gesture. The permission prompt and reminder delivery are isolated test doubles; existing Chromium tests retain real service-worker notification coverage.
- Full release gates include all isolated regressions, both editor checks, ranking-data generation, reproducible output, browser journeys and the native iOS build.

Deployment and exact-check evidence are recorded on the release PR. These are focused fixes, not an exhaustive zero-bug claim.
