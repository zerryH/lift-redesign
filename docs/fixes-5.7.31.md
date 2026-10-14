# Slat 5.7.31 — rest timer survives failed finish

## Reproduced defect

Finish temporarily moves the draft into completed history while awaiting its durable save. A 250 ms timer tick saw the empty current workout and stopped the live rest clock before that save was acknowledged. When saving failed, the original workout and stored deadline were restored, but the live timer had been cleared. Native resume and synchronization could trigger the same premature stop.

## Fix

- Pause rest ticks, timer restore and native synchronization during a finish, import or storage conflict.
- Keep the original deadline, start time and one timer interval while the save is pending.
- If the finish fails, keep an unexpired countdown running with the recovered draft.
- If the deadline elapsed while waiting, end rest after rollback instead of restarting it.
- Stop the timer normally after a successful finish or explicit user stop.
- Keep web notification cards static; this does not introduce an updating notification.

Workout sets, calendar history, routines, bodyweight and backup records are not migrated or rewritten.

## Regression evidence

The focused regression holds the actual finish save pending, forces a storage failure, fires timer/visibility/native-resume paths and verifies that the draft and durable bytes survive with their original rest deadline. It then retries successfully and verifies one completed workout and normal timer shutdown. Additional cases cover elapsed rest and every safety guard.

The real-browser journey forces synthetic localStorage and IndexedDB failures while the normal 250 ms interval runs. It verifies countdown continuity, retained storage and a successful retry in Chromium and WebKit. Native bridge messages are inspected without claiming physical-device runtime verification.
