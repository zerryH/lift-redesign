# Anatomy asset attribution

Slat embeds modified copies of the male front/anterior and male back/posterior advanced 2D anatomy SVGs from https://github.com/suryamolly/muscle_mapper.

The upstream project states that its advanced SVG assets are provided under the CC BY 4.0 license by Ryan Graves. The upstream repository itself is MIT-licensed, but that MIT license does not replace the separate CC BY 4.0 attribution requirement for these advanced SVG assets.

Slat modifies the SVG presentation and structure for its offline renderer, including rank coloring and front/back ID namespacing. The underlying advanced anatomy asset attribution remains:

Advanced anatomy SVGs provided by Ryan Graves, licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).

Source: https://github.com/suryamolly/muscle_mapper
License: https://creativecommons.org/licenses/by/4.0/

5.6 maintenance: source SVGs now live in `anatomy-front.svg` and `anatomy-back.svg` and are embedded by the build. Slat separates anterior tibialis from calf coloring, adds schematic medial-thigh adductor regions and a neutral back-of-head silhouette, repairs the posterior group nesting, removes duplicate outline artifacts, and assigns unique element IDs. New regions are diagram conventions, not a diagnostic anatomical model. Existing source attribution remains retained.

5.6.1 presentation repair: adds continuous neutral torso/limb contours, front patellae, posterior spinal erectors, sacrum, soleus/Achilles and heels; replaces the medial-thigh schematic with longus/gracilis regions; keeps sartorius neutral rather than coloring it as a quadriceps head. Original muscle geometry receives clipped fiber lines and surface lighting. Neutral details are illustrative anatomy, without invented earned ranks. Front/back selection and named keyboard/touch targets use the same muscle details as the rank list. Upstream attribution remains unchanged.
