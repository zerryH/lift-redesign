# Slat 5.7.28 — future-dated earned ranks

## Reproduced defect

Backup validation correctly preserves valid workout dates, including future dates, so no historical record is silently discarded or rewritten. However, earned-rank rebuilding used every completed workout immediately. A mistaken future-dated restored session could therefore inflate exercise, muscle and overall ranks before that session's recorded date, even though Slat's date editor does not allow a user to create or correct a workout into the future.

## Fix

- Keep future-dated workouts unchanged and visible in History and the activity calendar.
- Exclude them from earned exercise and muscle rank rebuilding until the local date reaches the recorded date.
- Include them immediately after the user corrects the date to today or earlier.
- Explain deferred future sessions on the Ranks screen so the result is transparent and correctable.

No workout, set, load, bodyweight, calendar date, routine, preference or backup record is migrated or rewritten by this release.

## Regression evidence

The focused regression starts with an ordinary current workout plus a much stronger future-dated restored workout. It verifies that the future record remains byte-for-byte represented in state and History, does not affect the earned rank or its source date, and produces the Ranks notice. After correcting only the date, the same stronger set becomes rank-eligible and wins normally.
