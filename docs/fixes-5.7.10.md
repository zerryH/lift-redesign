# Slat 5.7.10 — routine imports and timer wake cleanup

- Valid routine backups may contain numeric targets as strings. Normalize those targets to numbers in saved routines and active session targets so progress counts, copying, editing and zero-rest presets behave consistently after import and reload. Logged measurements and exercise identities are unchanged.
- Share a pending screen-wake request instead of requesting multiple locks. A stopped or replaced rest releases any lock that arrives late; a new rest can acquire independently, and denied requests remain retryable.
- Treat spaces in the optional RPE field as empty. Decimal RPE values still accept a comma or point; invalid values remain blocked.

Validation: all three regressions were reproduced before the changes. Regression checks cover import/copy/reload, blank and invalid RPE, concurrent wake requests, stop/restart races, late completion and denial/retry. Chromium and WebKit journeys cover the affected controls with a mocked wake-lock API; physical iPhone power behavior is not certified by browser simulation.
