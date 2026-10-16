# Read-only backup verification

Part of [F01 #157](https://github.com/zerryH/lift-redesign/issues/157), not completion of the recovery centre.

Profile → Verify backup opens a dedicated file picker and read-only report. It validates the complete selected JSON against the same catalogue and restore contracts, then shows counts for workouts, activity-calendar days, sets, routines, exercise preferences, bodyweight, custom exercises and saved checks, plus unfinished-workout presence. There is no Replace/Import control in this report.

Existing legacy exports have no embedded checksum. The report explicitly says their structure and restore rules passed, not that all values are unchanged or the file is authentic. Format-1 recovery envelopes also require the complete metadata/payload SHA-256 checksum and frozen counts to match. Unsupported formats, corrupt JSON, invalid records and tampered envelopes cannot open a successful report. Integrity is not authenticity or encryption.

Verification does not write storage, change the in-memory workout/draft, update export freshness, retain a recovery copy or send/upload any file. There is no new arbitrary size ceiling on ordinary exported backups. On-device recovery envelopes retain their separate bounded-size contract.

Import and Verify share a latest-selection sequence. Old reads and old checksum work cannot replace a newer report, and completion after a finish/import/reset/conflict pause cannot open stale UI. Inputs clear immediately for same-file retries. The existing import preview and explicit atomic-replacement path remain separate and unchanged.

Automatic acknowledged-Finish/pre-import/migration capture, durable retention, recovery list/Profile status and snapshot Restore are still pending. Existing legacy before-import recovery copies remain in place; this feature does not claim physical-device recovery sign-off.

## Release-check race found during validation

The first PR browser run passed all 70 Chromium journeys but stopped early in WebKit in the older repaired-entry reload journey, before its Verify backup checks. That journey rendered an Undo recovery and could reload without awaiting the asynchronous save. A deterministic held-write regression reproduces the resulting difference: the rendered draft is present while durable storage still contains the prior state and its intact Undo record; after acknowledgement the recovered identity and typed input survive reload. It also verifies denied writes are not acknowledgements. This establishes the test race; the failed artifact did not record which loop case was active, so it is not proof of a separate production-storage defect.

The journey now requires a successful save acknowledgement and exact stored repaired identity before reloading. Every existing post-reload identity/text/measurement/history assertion, engine, unseeded file round and deadline remains enabled. No blind rerun, seed reset, sleep or timeout increase is used. The failed head and its artifact remain recorded in the PR; only the corrected exact head may be merged after all gates pass.
