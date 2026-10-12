# Slat 5.7.6 — collision-safe workout saves

- New free workouts and routine sessions now choose an unused numeric workout identity instead of assuming the current millisecond is unique. A repeated device clock, clock rollback or imported workout with the same timestamp can no longer make a finished session look like an already-saved workout.
- Startup repair now detects an unfinished, non-editing draft whose identity collides with History and gives the draft a free identity before it can be finished. Editing a saved workout intentionally retains that workout's identity and replacement behavior.
- Existing workout IDs and user records are left unchanged unless an unfinished draft has an actual collision. The change does not migrate or reinterpret logged measurements.

Validation covers free-workout starts, routine starts, imported-draft repair, successful append after repair and preservation of saved-workout edit identity under a deliberately repeated clock. Full release and Chromium/WebKit checks must pass before publication.
