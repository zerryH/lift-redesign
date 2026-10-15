# Browser release-check cleanup

Two post-merge browser jobs on 5.7.39 stopped after 76 successful journeys and reached the 15-minute job limit. Their last completed case was the WebKit refused-channel test. The earlier PR job had passed all 110 journeys on the same source tree.

A local diagnostic probe reproduced a pending page evaluation during cleanup of the previous browser context. That evaluation awaited `navigator.serviceWorker.getRegistrations()` and each registration's `unregister()` before closing the context. The next reset journey had not started yet. Three earlier reset repetitions in that probe had passed.

The runner now closes the previous isolated browser context directly. Each journey still creates a new context, seeds its own storage, and retains every original application assertion. This removes the redundant old-page service-worker evaluation that could prevent the next journey from starting. Explicit service-worker install, offline reload and update-activation journeys remain in the suite.

This is a test-runner change. Application source, generated release files, version 5.7.39, user data, reset behavior and backup formats are unchanged.

Local validation passed all 53 existing WebKit journeys, including service-worker update/offline coverage, both reset cases, chart date windows and histories of up to 10,000 sessions. A separate focused run completed six fresh-browser cycles with 12 refused-channel/reset journeys and no browser errors. JavaScript syntax, diff checks and generated-file reproducibility also passed.
