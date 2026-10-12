# Slat 5.7.12 — update recovery

An older open page could detect a newer published version even after that version's worker was already active. With no worker downloading or waiting, the update action repeatedly claimed that the release was still downloading. It now checks the app HTML served at its own start URL and reloads when that response contains the published version. Failed or absent installations get a retry message instead of a permanent download claim.

Every update-triggered reload first requires a successful save. An already-activated worker is handled directly, avoiding a missed controller-change event. Update metadata and HTML checks have bounded requests and restore the update button after failure.

Installation fetches fresh static assets rather than reusing older HTTP-cache entries. Staged HTML and app source must match the worker's release version before installation succeeds. Failed new staging caches are removed; workout storage and unrelated caches are retained.

Regression coverage includes ready-worker/stale-page recovery, absent installers, failed saves, offline checks, request timeouts and inconsistent staged versions. Chromium and WebKit journeys exercise stale pages, rejected staging, successful retries, offline reopening and draft preservation.
