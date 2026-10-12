# Update installation protections

Extends the 5.7.12 update recovery without replacing its fresh-file validation or save-before-reload checks. Installation requests now abort after 25 seconds, the active worker reads only its own cache, and update registration checks have a timeout. Active workers report their build through a message channel, with the existing served-shell check retained for older workers. All four application entry files remain version-checked before activation. Failed staging preserves any pre-existing cache and all workout records.
