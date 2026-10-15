# Legacy band-exercise progress — 5.7.41

Reproduced on 5.7.40: restore an older Resistance Band Curl workout containing a numeric load and repetitions, without a modern tracking mode. The existing safe migration retains the original values and marks the set `legacy_reps`, since an old numeric load cannot identify a modern band or its resistance. History displays the record correctly, but neither of the band's selectable chart metrics accepts legacy sets. Its progress chart is empty even though the underlying series code can produce its recorded repetitions.

Band exercises now offer a separate **Legacy recorded reps** metric, consistent with the existing legacy metrics for duration and distance exercises. An exercise with only legacy working sets selects this metric automatically; mixed history still defaults to modern band reps. Help text explains that original loads remain in History and are not band resistance. Best set reps and Daily total reps continue to include only modern band records. Existing date, setup and band-label filters still apply.

No migration, load conversion, ranking change, workout rewrite or backup-format change is introduced. Legacy and modern series remain separate; old numeric loads are neither discarded nor converted into band labels or strength estimates.

Regression coverage includes both built-in band identities, equipment setups, band labels, modern versus legacy series separation, unchanged stored history, validation and reload. A Chromium/WebKit journey switches between legacy and modern chart metrics, checks exact values and explanatory text, then verifies unchanged history after reload.
