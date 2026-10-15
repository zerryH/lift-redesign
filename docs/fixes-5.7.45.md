# 5.7.45 — identity-safe recovery

## Reproduced on 5.7.44

- Discard an older unfinished workout with a name-keyed draft, rename its custom exercise in Profile, then Undo. The exercise name resolves, but the draft remains keyed by the old name: a typed 75.5-second duration falls back to the recorded 45.25 seconds and the draft note is not shown.
- Restore a deleted workout after renaming a ranked custom exercise. Undo saves and recalculates before resolving the exercise identity, leaving the durable label and in-memory rank keyed by the old name until another repair/recalculation.

## Focused correction

- Normalize restored records before Undo saves and recalculates earned ranks.
- When a custom identity or catalogue alias changes an exercise label, move an older name-keyed draft to that entry's stable identity key. Existing identity-keyed input takes priority, and a legacy draft belongs only to the first duplicate entry.
- Preserve exact logged measurements, set identities, provenance, typed draft text, notes and RPE. No ranking-standard, calendar, timer or backup-format change.
- Repair also applies to older recovery copies and imported unfinished workouts.

## Regression coverage

- New isolated regression covers exercise/set/workout/draft Undo, before and after reload, old recovery copies, modern draft precedence, duplicate entries, catalogue aliases, backup import, durable labels and immediate custom ranks.
- Chromium/WebKit journey covers discard → rename → reload → Undo → reload → exact logging, plus delete → rename → Undo with immediate earned ranks.
- Full release gates include isolated regressions, both editor checks, ranking generator consistency, reproducible build, real-browser journeys and the native iOS build.

Passing checks and deployment evidence are recorded on the release PR. This is focused recovery coverage, not a claim that every possible bug is eliminated.
