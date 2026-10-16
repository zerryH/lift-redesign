# Recovery snapshot contract: first R0 slice

Tracking: [F01 #157](https://github.com/zerryH/lift-redesign/issues/157). This slice implements the contract, not the recovery centre UI, capture hooks or storage backend.

`SlatRecovery.create` validates a complete JSON-wire backup and returns a format-1 envelope with source app version, reason, timestamp, revision/save time, record counts and SHA-256 checksum. It retains all validated payload fields, including unknown JSON feature fields; no measurements or IDs are converted. Format-1 count fields are frozen so adding a future backup-summary metric cannot make an older snapshot unreadable.

`verify` copies the envelope before its first asynchronous operation, verifies the complete canonical metadata/payload checksum, validates the backup and checks the counts. It returns independent data and manifest copies. Corruption, unsupported formats, unsupported integrity capabilities and oversized copies fail without touching current data. SHA-256 is an integrity check, not proof of authenticity or encryption.

`planRetention` returns bounded keep/remove lists and the identity that storage must persist first. It performs no storage operations. The next slice must acknowledge the new envelope before updating the index/pruning older snapshots, serialize concurrent index changes and leave all old copies intact on quota or write failure. The default plan retains at most three envelopes within 8 MiB; a complete envelope is limited to 16 MiB. Never truncate a large history to make it fit; direct the user to a full external backup instead.

Required remaining work: durable capture on acknowledged Finish and before import/migration, Profile save/export status, snapshot list, exact Verify preview, explicit Restore confirmation/recovery copy, reset coverage, storage failure tests and physical-iPhone checks. Do not mark F01 complete from this contract alone.

## Build issue found during integration

Adding an offline asset exposed a first-build bug: the cache digest was computed before the worker asset list was updated. The first build therefore hashed the old list; a second build happened to repair the digest. Build generation now finalizes the offline list before hashing and writes those same normalized bytes. The independent cache-hash assertion remains strict, with a new stale-list probe proving one build is enough.
