# Slat 5.7.1 — reproduced errors fixed

- “Last time” clears stale weight/repetition rejection flags after replacing invalid typed measurements with the previous recorded set.
- Importing an active rest deadline starts the ticking clock and clears the old interval. Importing disabled timers removes the clock.
- A zero-rest override stops the previous timer when the next set is logged.
- Opening another saved workout clears the unrelated draft and timer.
- Custom exercise primary muscles use the shared catalogue resolver in weekly/monthly summaries.
- Routine imports reject duplicate IDs, zero/fractional set or rep targets, invalid durations/distances, and rest durations the editor would reject. Exercise preference imports use the same rest rules.
- Workout name correction rejects names incompatible with the backup contract.
- Rank checks and RPE entry use the same strict measurement parser as workout logging.

Existing raw workout measurements and the two-color calendar are retained. Physical phone/background alert and empirical ranking calibration limits remain as described in the 5.7 audit.
