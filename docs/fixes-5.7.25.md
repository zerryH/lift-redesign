# Slat 5.7.25 — complete workflow pause guards

## Reproduced defect

The read-only History dialog and routine builder attach direct button listeners. Those listeners run before the document-level action guard. If a storage conflict, backup import or workout finish paused Slat after a dialog opened, **Repeat session** could still create a current workout and routine controls could still change the in-memory draft.

The durable saved copy was not immediately overwritten, but the paused recovery state no longer matched the workflow shown to the user. The user's later recovery decision could therefore continue from an unintended current workout or altered routine draft.

## Fix

- Check the shared mutation gate before History's **Repeat session** and **Save as routine** actions.
- Apply the same gate before routine add, reorder, remove and delete actions.
- Keep the existing routine save and exercise-replacement checks.
- Leave completed workouts, calendar history, rankings, routines and backup data unchanged.

## Regression evidence

`tests/dialog-mutation-locks.mjs` now opens the real History and routine-builder controllers, activates each conflict/import/finish lock, and invokes their direct listeners. The test verifies that Repeat does not create a workout and add/reorder/remove/Save as routine do not change the routine draft. It fails against 5.7.24 and passes with this fix.
