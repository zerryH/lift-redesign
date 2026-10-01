# 3D anatomy asset attribution

The interactive muscle model uses `body.glb.gz` (a gzip-compressed copy of the upstream `body.glb`) from **Body Anatomy 3D Viewer** by hpfrei: https://github.com/hpfrei/body-anatomy-3d-viewer

The model is derived from the **Z-Anatomy** anatomical dataset: https://www.z-anatomy.com/ . The upstream project identifies its anatomical data as licensed under **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**: https://creativecommons.org/licenses/by-sa/4.0/ .

Changes made here: the original model is rendered with translucent holographic materials, fine outlines, and per-muscle colors linked to Lift rank groups; only muscle structures are shown in the rank viewport. The model is not presented as medically validated for diagnosis.

Three.js is included under the MIT License; see `THREE-LICENSE.txt`. The GLTF and Draco loaders/decoder are distributed as part of Three.js under its included license.
