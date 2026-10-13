# Slat 5.7.22 — dialog mutation locks

## Reproduced defect

The main document's delegated controls respected the import, finish-saving and cross-tab conflict locks. Direct form listeners ran earlier in the event path, however, and could mutate state before that guard was reached.

A workout name/date form opened before a conflict could change the paused draft and append a date correction. Set, equipment, routine, custom-exercise and confirmation callbacks had the same missing precondition. The persistence layer still rejected conflict writes, so the other tab's stored data was protected; the paused tab's in-memory recovery copy was not.

## Fix

Apply one shared mutation gate before persistent changes in these direct callbacks. During a conflict, the recovery panel stays available; importing and finish-saving also block the callbacks. Read-only dialogs and ordinary unlocked editing are unchanged.

Covered paths: workout name/date, set edits, equipment preferences, routine saving, custom rename/retire, deletion confirmations and final reset confirmation.

## Regression evidence

- `tests/dialog-mutation-locks.mjs` exercises direct listeners under each lock and checks both in-memory state and durable bytes remain unchanged.
- The Chromium/WebKit journey opens a real set editor, saves from a second tab, attempts the edit in the paused tab, and verifies that neither copy is overwritten.
- Existing normal editing, routine, backup and deletion/undo journeys remain release gates.

No catalogue, rankings, workout records or calendar history are migrated by this release.
