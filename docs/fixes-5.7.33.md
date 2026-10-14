# 5.7.33 — reset and backup selection races

## Confirmed bugs

- Reset closed its confirmation before waiting for outstanding saves and clearing storage. Another delegated Log set click or draft input could mutate the workout during this gap. The reset confirmation now stays open, disables both actions, pauses mutations/timer callbacks and releases that pause after a safely failed cleanup. Reset uses the same Web Lock as normal writes when supported, so it cannot interleave with another writer holding that lock.
- Backup file reads could finish out of order. Choosing a second file while the first was still reading could show the first file's review afterward. Only the latest selection can open review or report an error. The captured file is retained while the input clears synchronously, allowing same-file retries without waiting for an older read.
- The invalid-backup browser journey previously waited only for the file input to reset. It now waits for each specific validation error, asserts the input clears and checks both the absence of a replacement dialog and unchanged stored records. Distinct cases use distinct file names. No failure is skipped or automatically retried.
- WebKit's frame-based condition polling timed out even though the failure snapshot showed the waited-for Reset button enabled. Its condition waits now poll every 100 ms independently of animation frames, retaining every predicate, assertion and timeout. Chromium retains frame polling. This also covers the recurring file-input reset waits from earlier failed runs.

## Validation

The reset and out-of-order backup regressions fail on the old source and pass after the fixes. Browser coverage exercises a delayed first read followed by a second selection, protected pending reset, failed cleanup and resumed logging. Existing backup review/replacement, >25 MiB backup, conflict, rollback, logging, calendar, ranking and timer checks remain enabled.

No completed workout measurements or backup format are migrated. This audit does not establish a list of 250 distinct bugs; it records reproducible defects and their fixes.
