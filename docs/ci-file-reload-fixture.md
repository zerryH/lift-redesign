# Unseeded local-file reload verification

## Evidence and limits

The 5.7.48 PR first failed in the local-file draft reload check, then passed all 128 journeys on one unchanged diagnostic retry. Its merged source tree was byte-identical, but the main browser job failed after 63 Chromium journeys: the app's Reload action returned one set after two had been stored. Logs and artifacts are retained on [PR #151](https://github.com/zerryH/lift-redesign/pull/151). This does not establish whether app storage, file-origin browser behavior or fixture initialization caused the loss.

The previous file journey registered the original state as a navigation init script. Its storage guard protected existing values, but if storage appeared empty on a later navigation the harness would reinstall the original fixture. That intervention obscured the state the app itself would have read. The earlier marker guard remains useful for HTTP fixtures; it was not proof that every file-reload failure was fixed.

## Focused test change

- The file journey starts an unseeded, real `file:` page and uses the app's backup-import path once to establish its starting records. No fixture init script or seeding marker is registered on that page, including on later reloads.
- Each engine runs three fresh contexts. Every context checks both a browser reload with an unfinished note and the app's Reload action after logging a second set: 12 actual reloads across Chromium/WebKit.
- Existing note, entry identity and two-set assertions remain. Exact set contents and stored values are additionally compared. Both reload phases retain before/after evidence in `report.json`, including a failing startup where no workout is restored.
- The isolated regression verifies unseeded setup installs no hook and imported file drafts/sets survive reload without fixture metadata. Ordinary HTTP fixture seeding keeps its existing guard and coverage.

No production code, generated distribution, app version, workflow, browser flag, timeout or storage/backup schema changes. A passing run is evidence for these journeys, not proof that every file-origin storage failure is solved. Full CI evidence and deployment state are recorded on the maintenance PR.
