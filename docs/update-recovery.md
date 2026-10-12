# Update recovery

The update check distinguishes a waiting worker, an installation in progress, and an already-active newer worker. A newer `version.json` alone does not mean files are downloading. If the active worker reports the published build, the app saves pending writes and reloads its staged shell. Failed or timed-out installations keep the current app and offer an honest retry message.

Installations fetch the offline files without the HTTP cache, stop after 25 seconds, and verify the staged HTML build before activation. Failed staging removes only its own cache. Fetches read only the active worker's cache, so an incomplete cache cannot shadow the working release. Reloads wait for pending workout writes; updates never delete IndexedDB or localStorage.
