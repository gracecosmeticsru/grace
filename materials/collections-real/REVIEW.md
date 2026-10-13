# Stage 5A real composition photos

12 exact catalogue variants, three per selected theme. Source mapping and original/public hashes: `docs/step05a-photo-sources.json`. Original files are retained here. `public/images/collections-real/*.webp` are display derivatives, longest side at most 900 px (500 px CP-1 original is not enlarged). Combined public size: 256,138 bytes.

Viewed every selected image in `contact-sheet.jpg`. All contain the intended packaging. Tree Hut label explicitly reads 510 g; La'dor tube reads 150 ml. Gisou styling cream and Sol de Janeiro source JSON link the image IDs to 150 ml and 240 ml respectively. Clarins 01 Honey and Charlotte Tilbury Pillow Talk Original are tied to their exact source product pages. Source product metadata is retained in `source-product-metadata.json`.

| Theme | Exact variant IDs |
|---|---|
| Clean | gc002705, gc002718, gc002670 |
| Lips | gc003374, gc002909, gc003423 |
| Body | gc004603, gc001867, gc001222 |
| Hair | gc004731, gc003348, gc004388 |

Limitations: Beauty of Joseon balm has an ivory reflective studio background, and the previously approved Rare Hope photo has a pale beige studio background. These remain unretouched. Clarins and Sol de Janeiro retain natural product shadows. The selected photos represent the currently published packaging, not a visual audit of physical store inventory. CP-1 is the 500 px retailer source; the other originals are at least 1000 px.

Rejected candidates remain in `candidates/` for traceability. In particular La'dor's OG photo was only product texture, so the actual white-background product PNG from the same official page was selected instead. `gc003348.jpg` is that rejected texture, never referenced by the manifest or public derivative. The original BOJ official photo was preferred over retailer candidates containing promotional copy.

No generated product images, product recolouring, fabricated labels, cropping, catalogue changes or card changes. Derivatives use resize, format conversion and white compositing for source alpha only. `prepare.py` reproduces derivatives and asserts catalogue/variant membership, image dimensions and original hashes. Parent performs independent asset/source and final composition review before accepting the photo gates.
