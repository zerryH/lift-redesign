# Groups, warm-ups and optional goals

F06 and F07 complete the functional scope of the five-page roadmap. Advanced controls use secondary sheets, shared theme tokens and the existing single Log action. The web reminder stays static; the in-app countdown remains deadline-based.

## Independent exercise groups

Groups & rest assigns an optional A1/A2 label to existing exercise-entry IDs. Next in group follows current manual order. Each exercise retains its own sets, targets, exact values and provenance. Removing/reordering members cannot merge records; exercise Undo carries its group metadata. Saved routines copy membership and timer policy into new independent entries.

Choose exercise rest or round rest explicitly. Round rest starts when every current member has another working set. Warm-ups cannot complete a round. Zero disables round rest; other durations use 15–600 seconds. The rule and order survive reload and backup replacement.

## Explicit warm-up presets

Warm-up presets are separate from working targets and specific to stable exercise ID, setup and recorded protocol. Create steps or reuse logged warm-ups. Apply prepares measurements without creating a log. Every step requires Log; a rapid second activation cannot consume an automatically prepared next step. Invalid input remains editable. Applying preserves notes and RPE; logging consumes them normally.

The active queue and prepared input survive reload. Undo removes the accepted set and restores its original step, note and RPE. On the final warm-up, a loaded working-set input is cleared for explicit review. A changed setup stops automatic preparation. Completed records retain actual warm-up sets, without unused queue intentions. Warm-ups stay excluded from working targets, earned ranks, PRs and exercise-goal progress.

## Goals and adherence

Goals are optional and pausable. Weekly goals count completed sessions with working sets, Monday–Sunday through today. Two same-day sessions count as two; drafts and warm-up-only sessions do not count toward this explicitly labelled working-session goal.

Exercise targets record a baseline/date, target/date, equipment setup, metric and full protocol. Progress reuses chart series from comparable completed working sets, excluding future dates and missing or different recorded provenance. Lower assistance is progress; band resistance stays a label. Exact recorded values remain authoritative. Editing/deleting history recalculates results rather than editing a results cache. Paused goals remain visible and retain their history-derived progress.

The calendar offers All, Planned, Completed and Skipped layers. Plans use an outline and text; observed completed activity keeps its accent fill and multiple-session count. Filtering preserves the grid and keyboard navigation skips disabled dates. The adherence summary sits beside the existing weekly/monthly summary: linked completed workout IDs, explicit skips, missed planned dates and today's pending slots. Rest days have no planned slot and cannot become failures. Only the next slot per programme is scheduled; no future attendance is invented.

## Portable data and validation

`trainingGroups`, entry membership and removal Undo metadata live with workouts/routines. `warmupPresets`, active `warmupQueue`, typed draft `warmup`, and accepted-log Undo metadata are validated together. `goalsV1` stores goals without taking ownership of old unspecified `goals` JSON. Old backups default to empty optional fields.

Normal export, verification and replacement review include these fields and counts. Recovery envelopes checksum the entire backup. A cumulative round-trip regression covers favourites, programme slots, progression rules/decisions, group order/timers, active warm-ups, goals, raw precision, stable IDs and unknown compatible JSON. Reset removes optional feature state. Frozen format-1 recovery wire counts remain compatible.

Local regression and both editor configurations, Chromium/WebKit journeys, native build and exact Pages-byte verification remain release requirements. Automated enlarged-text screenshots/focus tests are not physical iPhone Home Screen/keyboard/VoiceOver sign-off; that checklist requires the actual device. The PDF's deferred cloud sync, social/nutrition/AI coaching and native distribution expansion remain deferred.
