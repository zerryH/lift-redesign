# Slat 5.7.2 — workout reliability and quality of life

This release includes the unpublished 5.7.1 fixes in `fixes-5.7.1.md` and the following additional changes.

- Repeated entries for the same exercise keep independent weight, quantity, band, note and RPE drafts by entry ID. Name-keyed legacy drafts still restore to their first matching entry.
- Discarding clears the live draft and rest clock. Undo can restore the discarded session and its draft; expired deadlines stop safely.
- Last time and default loads use working sets, recorded workout dates and the selected equipment setup. They exclude the workout being edited and later-dated sessions, and inspect repeated entries.
- Routine repetitions, duration and distance prefill the logging form. Saved input drafts take precedence.
- A themed routine progress bar counts planned working sets and completed exercises, excluding warm-ups and capping extra sets at each exercise's target.
- Next unfinished moves to another incomplete planned exercise. Move earlier/later reorders the active exercise while retaining its identity, sets and draft.
- Retired custom exercises with history remain available in progress charts. Charts open on the active exercise or most recent logged exercise and offer the most recent equipment setup first.
- Equipment labels including `__all`, `constructor` and `prototype` round-trip as ordinary text; the chart's All setups selection has a separate control value.
- Chart windows include whole local calendar days. Chart bounds handle large datasets without spreading every point into a function call, and reserve space for long axis labels.
- Last time labels, measurements and equipment context have separate readable lines.
- Routine target copy displays the actual fallback rest duration after removing an override.

Verification: 50 isolated regression scripts, focused new workflow checks, deterministic catalogue/build checks, and Chromium/WebKit CI journeys for drafts, routines, charts, imports, timers, mobile themes and existing workflows. Record completed CI results on the actual release commit before publication. Physical-device, screen-reader and empirical ranking calibration limitations remain as documented for 5.7.
