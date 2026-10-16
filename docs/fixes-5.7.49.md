# 5.7.49 — keep typed drafts attached during entry-identity repair

## Reproduced on 5.7.48

A restored active workout can reuse an exercise-entry ID already present in saved history. This is accepted by the backup contract and repaired on startup/import: the active entry receives a fresh ID. Its typed draft, however, remained stored under the old ID. The form then showed defaults instead of the user's unsaved measurements and note. Undo of a restored draft had the same problem. The draft bytes were still in storage but no longer reachable from the form.

The new isolated regression failed on published 5.7.48 with `startup Bench Press: repairing entry identity must retain the typed draft` (actual note empty, expected `Keep my unsaved identity draft`). Validation accepted the fixture before this assertion.

## Focused fix

When an entry ID changes, move that entry's identity-keyed draft to the repaired ID before applying legacy-name fallback. Keep the exact draft values and typed text. Only the first occurrence owns an ambiguous duplicate-ID draft; do not copy its input into another exercise entry. Legitimate saved-workout editor mirrors keep their existing identities.

The existing ID collision repair remains in place. No backup schema, exercise catalogue, ranking rules, calendar, timer, UI style or logged measurement changes were introduced.

## Coverage

- Isolated tests cover startup, import and Undo; kg/lb; reps, unloaded holds, bands and carries; exact draft bytes, typed weight/rep text, notes/RPE/band; idempotent repair; logging and reload; and unchanged saved history.
- Negative/ownership cases cover duplicate entries within one workout, collisions with history, canonical-name resolution with legacy fallback, and legitimate editor mirrors.
- Chromium/WebKit journey checks actual restored fields, reload, import and Undo, exact logged values, finish/history persistence and backup validation.
- Existing unseeded local-file reload checks and all other release gates remain enabled with unchanged deadlines and browser engines.

Complete CI/deployment evidence is recorded on the PR. This is a reproduced draft-recovery fix, not a claim that every possible data-recovery issue is solved.
