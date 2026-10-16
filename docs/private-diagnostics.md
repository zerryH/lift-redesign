# Private device diagnostics (F02)

Profile → Diagnostics → optional reproduction steps → exact JSON preview → explicit Copy. An Exercise settings shortcut includes a public stable catalogue ID and catalogue version; arbitrary custom identifiers and names are omitted. Clipboard denial selects the preview for manual copy. Nothing is sent or attached automatically.

The report builder accepts no workout state, raw exceptions, URL or stack. Browser/OS output is a coarse allowlisted family and browser major version, not the full user agent. The event log is a separate localStorage key containing at most 32 allowlisted codes, derived failing steps, timestamps, bounded repeat counts and safe exception categories. Unknown fields/codes and damaged event data are ignored. Save failures cannot be caused by failed diagnostic persistence.

Quota, IndexedDB/local save failures, interrupted Finish, stale-tab detection and offline/check/install/activation update failures have separate codes or safe causes. Viewing a paused screen or verifying a backup alone does not generate a storage write. The stale-tab panel can open and dismiss the read-only preview while all workout mutations remain blocked.

Failure injection reproduced an existing asynchronous IndexedDB bug: a synchronous `put` exception inside the later comparison callback escaped as a page error. The callback now catches it, explicitly aborts and rejects the save through the normal path. A baseline-failing regression checks that quota failure never escapes the callback; the browser journey also denies both durable copies and confirms that Finish retains the draft.

No portable state field is added. Ordinary export/import/recovery snapshots do not contain the event log; import preview and reports do not change records or backup freshness. Reset clears the diagnostic key alongside existing personal copies and pauses late diagnostic callbacks until reload; a failed reset resumes logging. The privacy notice describes these flows. A pre-5.7.54 rollback must retain the new diagnostic-key cleanup, alongside 5.7.53 recovery cleanup and portable-field preservation.

The automated release requires actual quota/offline/Finish/stale-tab fixtures, hostile/oversized log sanitization, bounded retention, exact explicit-copy behavior and clipboard denial, reset/late-callback handling, unchanged workout bytes and real Chromium/WebKit focus/layout checks. Physical Home Screen, Files import, keyboard and VoiceOver checks remain separate and cannot be signed off by CI.
