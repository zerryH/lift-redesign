# Same-browser recovery centre

Profile → Recovery centre shows the last acknowledged save/revision, current save status, external-backup time/freshness and recoverable copies. It reuses the existing glass dialog, focus trap, close controls and theme tokens. Verification, viewing and exporting a copy never replace current data.

## Capture and retention

- Attempt a full JSON-wire copy after an acknowledged Finish, before explicit import replacement and before startup repair/ranking migration of existing saved data. Invalid older state retains the existing raw startup/migration recovery paths; an invalid or oversized snapshot cannot be called verified.
- Manual capture waits for pending saves and requires saved status. Snapshot failure does not roll back a successfully finished workout or prevent the existing import path from using its separately retained pre-import recovery copy.
- Three indexed envelopes share an 8 MiB budget. A staged envelope may use up to another 8 MiB if an index write is interrupted. The full snapshot is never truncated. Larger ordinary external backups retain their existing unrestricted file-size path.
- Two acknowledgements: first write the complete new envelope to staging; only then replace the bounded index/bundle. A failed first write leaves indexed copies intact. A failed second write leaves every old indexed copy plus the staged new copy available. A subsequent capture promotes that staged copy before reusing staging. Failed staging cleanup only leaves a duplicate, which reads deduplicate by identity/checksum.
- The hosted app uses separate keys in the existing IndexedDB `kv` store. Both capture phases use the same Web Lock as active-state writes and reset. Without Web Locks, hosted capture stops safely and recommends external export. The local-file distribution uses its existing localStorage-only model; cross-window coordination is limited when Web Locks are unavailable there.
- Capture checks the source's acknowledged revision/time and rejects stale work. Save/reset generations invalidate late checksum work. Reset waits for queued recovery writes, clears both recovery keys alongside all existing personal copies and rolls back captured copies if cleanup fails.
- Corrupt copies are retained, not automatically pruned. They can be explicitly exported, but Review restore stays disabled. Header/list damage exposes an explicit raw-storage export instead of deleting anything.

## Explicit restore and transfer

Review restore verifies a selected envelope again, then opens the existing count-by-count replacement preview. Only **Replace data** writes anything. Import still retains the old full state before replacement and rolls back on an unacknowledged save. Recovery-envelope files can also enter through Import backup; checksum/schema verification happens before the replacement review. Legacy ordinary backups remain supported and are explicitly described as structural checks without an embedded checksum.

Snapshots carry current records, dates, measurements, stable IDs, provenance, drafts, routines, exercise/setup preferences, settings and additional accepted JSON fields. Export/import now preserve those additional fields instead of silently dropping them; source save revisions and external-backup freshness remain device-local. Reload also preserves prototype-like keys as ordinary own JSON properties, without changing the state object's prototype. Counts from a damaged envelope are hidden until integrity passes, never interpreted as markup or trusted totals. Both cases have baseline-failing regressions. Ordinary Export backup contains current feature data, not the historical device-recovery library. Export an individual recovery copy separately when needed. Raw-storage export is a troubleshooting container, not an ordinary import file.

Same-browser copies are not cloud sync, encryption, authenticity proof, a device-loss backup or protection against clearing browser data. Nothing is uploaded or shared automatically. A copy exported by the user contains private workout information. Reset in this build clears the new stores too; do not roll back to pre-5.7.53 code without retaining the new recovery-key cleanup and field-preservation support. Existing active workout data remains version-4 compatible, but older builds do not provide the new recovery interface or cleanup contract.

## Validation boundaries

Failure regressions cover both write phases, interrupted staging promotion, corruption, count/byte budgets, stale source revisions, late hashing after reset, cleanup rollback, missing Web Locks, successful versus failed Finish, pre-import/migration capture, additional-field export/import and exact record/draft preservation. Dictionary-reserved exercise-entry IDs are repaired with their owning draft before editable text is written, preventing inherited-property handling from dropping the draft. The independent cache-hash oracle includes the new store source; first-build asset-list correction remains tested.

Real-browser journeys cover explicit capture/export/review/restore/reload, typed invalid input and precision, both themes with enlarged text at a narrow width, failed writes, disabled corrupt-copy restore, and reset/late hashing. Hosted browser and native gates plus Pages verification must pass for the exact candidate before release. Automated tests are not physical iPhone Home Screen sign-off: airplane mode, force-close, interrupted updates/Files import, midnight, keyboard and VoiceOver still require a person with the device.

This implements the functional F01 recovery workflow, not all of R0 or the eight-feature roadmap. Private diagnostics and F03–F08 remain separately tracked.
