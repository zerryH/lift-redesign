# Slat 5.7.26 — guarded and transparent backup restore

## Reproduced defect

The backup review dialog attaches a direct **Replace data** listener. If a workout finish began after the review opened, that listener could run before the document-level action guard and start replacement while the workout save was still pending.

The restore queue reduced the likelihood of a corrupt durable write, but the action still violated Slat's pause contract and could replace the just-finished session without making the transition clear.

## Fix

- Check the shared conflict/import/finish gate before backup confirmation.
- Reject programmatic backup import while a workout finish is in progress.
- Show workout-history, calendar-day, logged-set, routine, exercise-setting, bodyweight, custom-exercise and saved-check counts in the review.
- Explain in Profile that workout dates rebuild activity history, earned ranks rebuild from workouts, and device notification permission is not portable.
- Update Reset wording to include calendar history, routines and exercise preferences.

No workout, ranking, routine, timer or backup data is migrated or rewritten by this release.

## Regression evidence

The dialog-lock test opens the real backup review, activates each finish/import/conflict lock and invokes its direct confirmation listener. It verifies that both in-memory and durable state remain unchanged. The backup-contract test verifies calendar-day, routine and exercise-setting summaries.
