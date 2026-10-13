# Slat 5.7.20 — chronological “Last Time” sets

## Reproduced defect

A completed workout can contain duplicate entries for one canonical movement, including a legacy alias. Each newly logged set already records `loggedAt`, but “Last Time” previously flattened matching entries and selected the final array item. Reordering those entries could therefore make a genuinely older set appear as the latest set and make Repeat copy the wrong load and repetitions.

The regression fixture stores a 50 kg set at time 20 before an aliased 40 kg set at time 10. Build 5.7.19 returned 40 kg.

## Fix

- Eligible sets are ordered by positive recorded `loggedAt` time before the latest set is selected.
- Original array position breaks ties and remains the complete fallback for legacy sessions without timestamps.
- The same helper now drives PR chronology, current-session last-set lookup and historical “Last Time”/Repeat lookup.
- Reading a suggestion does not sort, mutate or rewrite stored workout history.

## Regression evidence

- `tests/previous-set-chronology.mjs` reproduces the incorrect 40 kg result and verifies the corrected 50 kg result, draft preload, non-mutation and timestamp-free fallback.
- `tests/workflow-qol.mjs` retains date, warm-up, editing-session and equipment-profile isolation coverage.
- `tests/personal-record-context.mjs` retains PR chronology across aliases and duplicate entries.
- The Chromium and WebKit journey uses the real “Last Time” card and Repeat control, reloads, and verifies historical loads remain in their original order.

No catalogue records, rank standards or saved workout records are migrated by this release.
