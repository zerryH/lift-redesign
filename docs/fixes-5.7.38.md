# Optional cross-tab channel failures — 5.7.38

Two failures were reproduced on 5.7.37:

- If BroadcastChannel was exposed but its constructor threw, script evaluation stopped before startup and recovery handling. Existing workout data was inaccessible through the app.
- If the channel was closed before Reset, its reset message threw after storage had already been cleared. The old in-memory state remained active, reload was skipped and a later save restored the workouts the user had cleared.

Channel construction now falls back to no advisory channel. Save and reset messages share a non-throwing notification boundary, so acknowledged storage operations finish regardless of message delivery. Web Locks, IndexedDB comparisons and storage-event conflict detection remain in place.

Regression coverage checks retained history/drafts and successful Finish with a refused constructor, rejected competing writes without a channel, successful reset with working and closed channels, cleared durable and in-memory copies, reload, and no resurrection on a subsequent save. Chromium and WebKit journeys cover refused construction and a genuinely closed native BroadcastChannel during reset.

Storage and backup formats are unchanged. These are focused failure-handling fixes; physical iPhone testing is outside this batch.
