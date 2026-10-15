# Preserve saved browser fixtures when test metadata is absent

The first post-merge browser attempt for 5.7.46 failed in the unchanged local-file reload journey after 61 Chromium journeys passed. Diagnostics showed the original fixture and regenerated entry identities instead of the saved draft. The full 124-journey PR suite had passed on the same source; one unmodified job retry was requested to check reproducibility. Attempt details and retry results remain recorded on PR #148.

An independent, deterministic reproduction found a test-harness weakness consistent with these diagnostics: removing only `slat-test-seeded` while retaining `liftlog-state` made the old initializer overwrite the saved app state with its original fixture. This does not prove that marker loss explains every possible local-file failure.

The initializer now seeds only genuinely empty app storage. An absent marker cannot replace an existing saved or corrupt/recovery value. A deliberate reset with its existing marker also remains empty.

The isolated regression covers initial seeding, missing-marker preservation, raw/corrupt values, existing markers and deliberate resets. The real local-file journey now deliberately removes the test marker before reload, then requires the exact original exercise entry identity and typed note to survive. Logging, subsequent reload and local-update assertions remain in place.

No assertion was removed, timeout increased, workflow bypassed or browser skipped. If app storage itself is lost, the persistence assertions still fail. This follow-up changes CI fixtures only; the app remains 5.7.46 with byte-identical public release files.
