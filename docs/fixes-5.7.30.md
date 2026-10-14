# Slat 5.7.30 — date-consistent earned ranks

## Reproduced defect

With a 60 kg Bench Press dated 14 October and a 300 kg restored session dated 15 October, advancing an already-open app to 15 October and opening Ranks changed the eligible exercise estimate from 74.48 to 372.4 kg. The cached muscle map nevertheless stayed on the earlier result. Moving the clock backwards could likewise leave a now-future session in the cached earned ranks.

## Fix

- Track the local date used to compute derived ranks.
- Recompute exercise and muscle results together when rendering on a different date.
- Refresh an already-open Ranks screen after focus/visibility resume or local midnight.
- Maintain one midnight deadline, replacing it on resume; no frequent polling loop.
- Pause derived refresh during storage conflicts, imports and workout finishes.
- Do not persist a date refresh or modify workout, calendar, bodyweight or backup records.
- Avoid replacing logging/Profile inputs merely because the app resumes on a new date.

## Validation and unresolved evidence

The fixed-clock regression covers forward and backwards date changes, navigation, focus, visibility, midnight scheduling, unchanged durable bytes and all three safety guards. The browser journey checks an already-open screen through real DOM controls.

Inspection also found that 5.7.29's main-branch browser job timed out waiting for a local-HTML draft note after reload, despite a passing PR run. The failure artifact did not capture the draft/storage state needed to determine whether the cause was storage or UI. This release adds precise synthetic before/after diagnostics and keeps the strict reload assertion; it does not claim that unexplained timeout is fixed. No production user data is used in those diagnostics.
