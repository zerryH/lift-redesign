# Slat 5.7.23 — restorable routine references

## Reproduced defect

Older workouts can legitimately retain an exercise that is not in today's catalogue or custom registry. Saving one as a routine previously validated only the target numbers, without the catalogue identity context. That created an unresolved routine reference, which could not start and caused the app's own exported backup to fail restore validation.

## Fix and focused quality-of-life improvement

- Routine saving checks every name/identity pair and runs the same catalogue-aware validation as backup import.
- The routine picker includes registered built-in and custom movements, not unresolved archival names.
- An unresolved row provides an explicit **Replace exercise** flow. It changes only the routine draft's exercise reference, preserving its planned sets, quantities and rest. The user is reminded to review those targets for the replacement movement.
- A dangling identity no longer starts a routine merely because its name happens to be known.
- Original workouts, dates, set measurements and notes are not renamed, rewritten or deleted. Existing invalid routines are retained for explicit repair; there is no automatic mapping to a guessed movement.

## Regression evidence

`tests/routine-reference-safety.mjs` reproduces the previously accepted unrestorable routine, verifies rejection without any saved-byte change, repairs it explicitly, and exports/imports the result with archival workout measurements intact. Built-in, custom and true-alias references continue to save, restore and start. The Chromium/WebKit journey verifies the actual repair controls, retained targets, unchanged history and reload.

No catalogue records or rank standards change in this release.
