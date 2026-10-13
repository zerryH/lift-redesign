# Slat 5.7.19 — large backup restore

- Removed the 25 MiB pre-validation import rejection. Slat did not impose the same limit when exporting, so a valid long workout history could produce a backup the app refused to review.
- Large selected files now follow the normal path: JSON parsing, strict version-4 record validation, the before/after review screen, recovery-copy creation and atomic replacement. Invalid backups still cannot replace saved data.
- Added an isolated file-selection regression and a real Chromium journey with a structurally valid backup larger than 25 MiB. Device memory remains the practical limit for parsing a user-selected JSON file.

No workout records, rankings, catalogue entries or notification behavior are migrated by this release.
