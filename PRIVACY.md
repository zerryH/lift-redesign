# Slat Privacy Notice

**Last updated: 16 October 2026 · Build 5.7.53**

## Controller and contact

Slat is created by **@o.r146**. Privacy questions or requests concerning Slat's own processing can be sent through the [Slat support tracker](https://github.com/zerryH/lift-redesign/issues). Do not include workout backups or sensitive personal data in public reports. This notice describes the product's current data flows in plain language and is not legal advice.

## What Slat stores locally

Slat processes and stores the information needed for the features you use, including:

- workout history, exercises, sets, weights and repetitions;
- bodyweight history and profile settings such as age/height, unit and ranking preferences;
- custom exercises;
- locally calculated ranking results and progress information; and
- settings such as theme, motion, tutorial and rest-timer preferences; and
- bounded same-browser recovery copies of those records, including unfinished drafts, routines and equipment preferences.

The app does not require an account and does not operate a Slat-owned workout database, analytics service, advertising system or telemetry service.

## Purposes and legal basis

Local processing is used to provide the app's logging, backup, ranking, progress and settings features. Where EU/EEA data-protection law applies, the relevant basis for Slat's own local processing is generally performance of the requested service; optional actions such as exporting a backup are performed at the user's request. This is a product-level description, not individualized legal advice.

## GitHub Pages hosting

The public web build is hosted by GitHub Pages. GitHub may log and retain visitor IP addresses and other technical request information for security and service operation. This provider-side processing is separate from Slat's local workout database, and GitHub's own privacy terms govern it. Slat does not receive or maintain those hosting logs as its own workout database.

## Retention and deletion

Slat's local data remains on the device until the user deletes it or clears the site's/app's storage. Use **Profile → Reset all data** to clear Slat's stored app data, or use the browser/device storage controls. Exported backup files are controlled by the user and remain wherever they are saved or shared. GitHub hosting logs follow GitHub's retention practices.

The recovery centre retains up to three indexed snapshots within an 8 MiB envelope budget, plus one staged snapshot if a list write was interrupted. A new copy is acknowledged before older indexed copies are pruned. Reset in build 5.7.53 or newer also clears these recovery stores. Same-browser copies can disappear with browser-data deletion or device loss and are not a substitute for an external backup.

## Backups and sharing

Export is user-initiated. An exported JSON backup can contain workout, bodyweight, profile, custom-exercise and rank information. Anyone who receives a copy of that file may be able to read it, so store and share backups carefully.

Ordinary backup export contains the current records and feature data, not the historical recovery library. Individual snapshots or raw recovery storage can be exported separately through explicit controls. Verification reads a selected file without replacing data; recovery capture and verification never upload or automatically share copies.

## Automated ranking

Slat calculates exercise ranks automatically from logged performance and configured reference data. These are product heuristics for training context; they do not create legal, employment, credit, insurance or similarly significant decisions about a person.

## Your choices and requests

You can view, export, import and delete your local app data from Profile. For questions about Slat's own processing, contact `ejaculator2000`. Requests concerning GitHub Pages provider logs should be directed to GitHub because Slat does not control those logs.

## Changes

If the app's data flows materially change, this notice should be updated before or with the affected release.
