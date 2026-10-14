# Slat 5.7.29 — future-dated bodyweight provenance

## Reproduced defect

Backup validation preserves valid bodyweight history, including future dates. Slat nevertheless treated the final array entry as the current measurement. A future-dated restored entry could become today's Get Your Rank default and, when no earlier measurement existed, be stamped onto a set logged today. That created false measurement provenance even though the future record itself was valid and should not be deleted.

## Fix

- Resolve the current bodyweight from the newest entry dated today or earlier.
- Resolve a workout's bodyweight only from entries eligible on that workout date, retaining the existing current-weight fallback for older workouts with no historical measurement.
- Keep future entries unchanged, visible in Profile and available to progress history.
- Show a Profile notice while future measurements are deferred.
- Let a deferred entry become active automatically when its recorded local date arrives.
- Use the same eligible current weight in exported profile metadata while preserving the full bodyweight history in the backup.

No workout, set, bodyweight entry, calendar date, routine, preference or backup record is migrated or rewritten by this release.

## Regression evidence

The focused regression restores an 80 kg current measurement plus a 200 kg future measurement. It verifies that the rank calculator and a newly logged set use 80 kg, the future record stays unchanged and visible, and Profile explains the deferral. A future-only history supplies no false current weight. Advancing the fixed clock to the recorded date activates the preserved 200 kg entry without rewriting it.
