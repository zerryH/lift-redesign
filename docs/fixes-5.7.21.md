# Slat 5.7.21 — safe rest-timer restore

## Reproduced defect

The restore path accepted any future numeric `restEndAt` value. A stale or malformed backup with a deadline more than 24 hours ahead therefore started a 250 ms interval indefinitely and displayed a multi-day rest countdown. The iPhone Live Activity bridge already rejected the same deadline as out of range, leaving the web and native timer states inconsistent.

## Fix

- Web restore now shares the native bridge's 24-hour future-deadline limit.
- An out-of-range deadline clears only `restEndAt` and `restStartedAt`; workout exercises and logged sets remain untouched.
- A missing or impossible timer start is reconstructed from the saved rest duration before progress is rendered.
- Valid in-progress timers continue to resume after reload or backup import.

## Regression evidence

`tests/post-release-errors.mjs` now boots from a deadline just beyond 24 hours and verifies that no interval is scheduled and the ephemeral timer fields are removed. It also verifies that an invalid start time is repaired while a valid future deadline continues running.

No catalogue records, rank standards, completed workouts or logged sets are migrated by this release.
