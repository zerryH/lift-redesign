# 5.7.48 — validate only measurements used by the exercise

## Reproduced on 5.7.47

An older or restored draft can retain invalid typed weight text after its exercise uses a reps-only, band or unloaded-duration protocol. The logger correctly hides weight for these exercises and records zero added load, but `makeDraftSet` still rejected the hidden `invalidWeight` flag. There was no weight field to fix, so an otherwise valid set could not be logged. Reloading or importing the draft preserved the dead end.

The isolated regression failed on the published build: `Push-Up: a hidden obsolete weight error must not block a valid set`, with a valid rep count and no weight control.

## Focused fix

Derive whether load is used from the same tracking protocol as the logger. Reps-only sets, band sets and unloaded holds ignore obsolete weight validation state and continue to record zero added load. Load/reps sets, loaded holds and loaded-distance sets still require valid weight, including their existing range limits. Visible reps, seconds, distance, notes, bands and RPE retain their validation.

The old draft text is not silently rewritten or reinterpreted. Existing logged measurements and histories remain unchanged. No storage or backup schema, exercise catalogue, ranking standard, calendar, timer or UI styling was changed.

## Regression coverage

- New isolated regression covers reps, bands and unloaded holds in kg/lb; immediate logging, reload and backup import; retained note/RPE/band text; invalid visible quantities; exact logged values; unchanged history; and persisted reloads.
- Negative cases cover load/reps, weighted holds and carries in both units: invalid weight remains rejected and correcting the visible input permits logging.
- Chromium/WebKit journey covers actual input controls, reload, strict quantity/weight rejection, successful logging and finish, backup validation and saved-set persistence.

Complete release/CI/deployment evidence is recorded on the PR. This is a focused reproduced fix, not an exhaustive zero-bug claim.
