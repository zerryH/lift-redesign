# Roadmap implementation and regression review — 16 October 2026

The five-page roadmap's functional scope is F01–F08, delivered through recovery #165, diagnostics #166, quick logging/inspector #167, programmes/progression #168 and groups/goals #169. The implementation register and feature notes describe the data contracts and user-visible behavior. Each PR retains its exact tested source head, failed-run evidence and final release/deployment results.

## Reproduced defects corrected during these slices

- An IndexedDB `put` throwing inside the asynchronous comparison callback escaped transaction error handling. It now rejects with the original failure and leaves Finish recoverable.
- Later action registration replaced the exercise diagnostics shortcut. Diagnostics now extends the final registered action.
- Rapid-activation protection also blocked an intentional Log → Stop rest → Log sequence. Intervening control/input actions establish new intent; duplicate activations still log once. Automatically prepared warm-up measurements do not count as new intent.
- The picker CSS reset shrank new tabs/pins; scoped shared-token styles retain usable 44px targets.
- New programme creation compared two absent IDs and incorrectly rejected the action. An actual linked programme ID is now required for that guard.
- A presentation callback throwing after an acknowledged optional-feature save reverted only memory. Durable state remains authoritative after acknowledgement.
- Successful optional-feature saves tried to close their editor while the import/mutation lock was still held. Protection now releases after acknowledgement and before the success callback.
- Edited assistance targets could exceed the logger's supported range. Targets and decision validation now use the same 60kg maximum.
- The calendar's year bounds ignored future plan dates. A year with plans is now reachable before it has completed history.
- Filtered calendar re-renders could remove every enabled date's keyboard entry point. The selected tab stop now comes from visible enabled dates; empty filters remain readable.
- Warm-up Undo restored the prepared step but lost the removed set's note/RPE. Both are retained.
- Changing equipment could retain the old setup's prepared warm-up queue/flag. Setup reset stops that queue before another log and retains notes/RPE.

The test harness also had two distinct timing defects: Playwright's async truthy-promise predicate needed an awaited bounded polling helper, and the new pin-order journey reloaded before its save acknowledgement. Both have direct regression coverage; original outcome assertions, deadlines and browser engines were retained.

## Coverage

| Maintained area | Review and regression focus |
| --- | --- |
| Core UI, exercise identity, measurement/provenance, ranks and catalogue contracts | Typed invalid drafts, exact kg/units, all tracking modes, custom/alias identity, future dates, comparable setups, earned/calculator separation and consistency across 475 exercise records |
| Persistence, recovery/diagnostics contracts/stores/views and data validation | Save acknowledgement, quota/abort/open failures, cross-tab conflicts, interrupted reset/Finish/import/update, checksums, retention, redaction, old backups and unknown compatible JSON |
| Training/planning/session/goal modules and workout transitions | Pin order/Recent, duplicate protection, Undo, copied routines, cursor atomicity, optional explainable progression, independent groups/rest, explicit warm-ups and history-derived goals/adherence |
| Dialogs, styles, calendar, build and update worker | Focus/protected sheets, enlarged text and themes, disabled-date navigation, keyboard viewport handling, deterministic source/generated distributions, staged update and offline/local-file journeys |
| Native bridge, Swift app/controller/widget and generated Xcode project | Origin/main-frame/version/deadline checks, serialized activity lifecycle, native-build gate and reproducible project generation; no distribution expansion |

Generated `app.js`, both HTML distributions and embedded catalogue/rank/anatomy copies are checked against canonical sources by the independent build regression. They are not separate manual reviews. The generator checks every catalogue/standard record; provisional fitness heuristics still require independent domain review.

The final local slice passes 112 regression scripts, both editor configurations with zero diagnostics and the 475-exercise generator. Hosted Chromium/WebKit, six local-file reload fixtures, native build and public Pages asset hashes are additional required gates; their completed results belong to the PR evidence, not an assumed pass here.

The cumulative backup regression verifies favourites, programmes/slots, rules/decision snapshots, group order/rest, active warm-up queue and Undo, goals, exact values, stable IDs and unknown JSON through checksummed recovery, replacement, reload and Undo. Old backups and reset default optional feature arrays safely.

## Practical completion limits

No observed failure in a documented set of checks is a bounded result; it is not proof that no latent bug exists. Physical iPhone Home Screen airplane-mode logging, force-close, interrupted save/update, Files import, midnight, keyboard and VoiceOver testing still needs the actual device. The roadmap explicitly defers automatic cross-device sync, public social ranking, nutrition/opaque AI coaching and native distribution expansion. The web timer reminder remains static; its live countdown is in the app.
