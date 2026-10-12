# Slat 5.7.5 — routine copies and equipment setup inputs

- Saving a routine from a planned session now retains its sets, reps, duration, distance and rest targets, including zero rest. Previously a three-set, twelve-rep, zero-rest plan saved before logging became one set, eight reps and the default rest. Extra logged sets also no longer overwrite the plan. Sessions without a plan still derive targets from working sets.
- Switching an exercise's equipment setup refreshes measurement inputs from matching history rather than leaving a different machine's weight in place. The reset applies to repeated entries of that movement; notes, RPE, unrelated drafts and saved sets remain intact. Changing only a rest preference retains measurement inputs.
- Saved routines have a Duplicate action. It opens an editable copy with a fresh identity and preserves the original. Nothing is saved until Save routine is pressed.
- Old imported movements without catalogue metadata can be copied into a routine using their existing name rather than failing backup validation for a missing identity.

Validation: a regression script checks planned/unplanned copying, zero-rest preservation, legacy movement compatibility, repeated-entry setup isolation and reload. Chromium/WebKit journeys cover duplication/save/reload, routine target round trips and setup changes through real controls. Release checks and browser results must pass before publication; this change makes no new physical-device or native signing claims.
