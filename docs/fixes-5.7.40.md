# Protected routine saves — 5.7.40

Reproduced on 5.7.39: hold the first routine save's browser storage lock, submit a second edit, then reject the first lock and allow the second save. The first failure rolls the in-memory routine back to its original value while the second write stores the newer value. The screen and storage then disagree, and a subsequent save or export can use the stale in-memory routine.

Routine saves now accept only one submission per editor while pending. The editor shows “Saving…”, marks itself busy and disables its controls, including Close. The existing protected-persistence gate also blocks dismissal and competing app mutations until the write is acknowledged; rest deadlines are retained. After a failure, the original routine is restored, the typed draft and error remain in the editor, and controls return to their prior enabled/disabled states for retry. A successful save closes the editor only after acknowledgement. Blank names receive a direct validation message.

No workout, calendar history, exercise identity, ranking rule, rest deadline or backup format is migrated. This is a narrow routine-editor transaction fix, not a claim that all other editors have been audited.

Regression coverage exercises new and existing routines, successful and rejected storage locks, duplicate queued taps, blocked dismissal, unchanged workouts/rest state, restored controls, validation and retry. A real-browser journey holds and rejects a write, attempts a duplicate submission and Escape, retries, reloads, and checks that the routine and completed history persist correctly.
