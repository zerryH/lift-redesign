# Repeat only compatible recorded measurements — 5.7.44

Reproduced on 5.7.43: retain a legacy Plank entry containing repetitions but no recorded duration, type 75 seconds for a new set and choose Repeat. The action replaces the typed draft with a fabricated 30 seconds. Distance entries have the equivalent 20-metre fallback; legacy band entries can overwrite a typed resistance label with no comparable band measurement.

The Last time card now offers Repeat only when the previous entry uses the current tracking mode and contains valid required measurements. Otherwise the old entry remains visible with a manual-entry hint. The action handler repeats the same check, so stale or queued Repeat actions cannot overwrite draft inputs. Modern recorded values, including decimal seconds/metres and assisted loads, remain repeatable. Legacy band summaries now correctly explain that band resistance was not recorded.

This does not rewrite history, infer missing measurements, alter routine targets, change rankings or migrate backup formats. Existing invalid-input correction and note/RPE retention on compatible Repeat actions are preserved.

Regression coverage exercises legacy duration, distance and band entries, mismatched/incomplete protocols, typed-draft preservation, and all five current tracking modes. Chromium/WebKit coverage checks the legacy hint, queued-action protection, manual logging of exact typed values, compatible modern Repeat and unchanged historical records.
