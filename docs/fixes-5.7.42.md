# Protected rank-check saves — 5.7.42

Reproduced on 5.7.41: start with a saved 50 kg check, hold the first save of a 60 kg preview, submit a 70 kg preview, then reject the first browser storage lock. The first failure restores the old in-memory check while the second save stores 70 kg. The app shows 50 kg while storage contains 70 kg; a subsequent save or export can use the stale in-memory value. This was a separate handler from the routine-save fix in 5.7.40.

Rank-check saves now use the existing protected-persistence gate. Until storage acknowledges the write, the calculator marks itself busy, shows Saving… and disables its controls. Duplicate taps, dismissal and competing state mutations are blocked. Failure restores the prior check (or removes the unsaved new check), restores each control's original disabled state and keeps the calculated preview available for retry. Successful saves retain the existing calculator behavior and separate saved checks from earned workout ranks.

No workout/calendar records, original measurements, ranking formulas, rest deadlines or backup formats are migrated. The rest timer's existing persistence guard also prevents expiry from queuing a snapshot of a failed check while its write is pending.

Regression coverage exercises new and existing checks, successful and rejected locks, duplicate submissions, restored control states, retained previews, retry, persistence guards and unchanged workout/rest data. A Chromium/WebKit journey interrupts an edited check save, attempts duplicate/backdrop/Escape actions, retries, reloads and verifies unchanged completed history.
