# Backup share-sheet freshness — 5.7.36

Reproduced on 5.7.35: export a workout containing a 100 kg set, keep its native share promise pending, update the set to 120 kg and save, then complete sharing. The file still contains 100 kg, but the app incorrectly reported no changes since export.

The export now retains its source state and revision, compares the actual export payload after sharing, and flushes pending saves before acknowledging its marker. Newer content retains a stale-backup marker and an explicit newer-changes message. A completed share cannot stamp a replacement state imported in the meantime. Metadata-only saves do not falsely stale an unchanged export.

No backup format, workout measurements, calendar history, ranking rules or timer behavior changes. Regression coverage includes persisted and unsaved changes, reload, unchanged saves, replacement imports and cancelled shares.
