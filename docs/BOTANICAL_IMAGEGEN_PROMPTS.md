# Prompt e provenienza degli artwork botanici

Generati il 15 settembre 2026 con ImageGen integrato, in sei richieste distinte. I file originali sono conservati in `source-assets/botanical/`. Per i livelli trasparenti, i livelli precedenti della stessa composizione sono stati passati come riferimenti visivi; desktop e mobile restano composizioni indipendenti.

## Distanza desktop

```text
Use case: stylized-concept
Asset type: responsive website parallax layer — desktop distance plate
Primary request: Create a wide, opaque illustrated distant garden clearing that will serve as the backmost layer of a sophisticated botanical portfolio hero.
Scene/backdrop: An immersive planted garden at early morning, with a luminous clearing, soft atmospheric trees, gently rolling planted ground, and a narrow irregular interruption in the planting that creates depth without reading as a path or river. The deepest garden forms sit toward the right and far background; the lower-left is botanically rich but remains distant-scale.
Subject: Distant and background vegetation only: airy tree canopies, layered shrubs, fine grasses, and small muted violet and pale cream flower notes. No oversized foreground leaves.
Style/medium: Sophisticated tactile editorial botanical illustration; hand-painted gouache and translucent watercolor washes with restrained colored-pencil grain; naturalistic plant shapes, elegant and contemporary, detailed but breathable; not photorealistic, not cartoonish, not flat vector.
Composition/framing: Purpose-designed wide landscape composition for desktop, approximately 3:2. Full bleed. Reserve calm, low-contrast readable negative space across the left and center-left for live website typography while retaining subtle pale foliage texture there. Use asymmetry and a gentle visual pull toward a luminous middle-right clearing. Avoid a centered vanishing-point path.
Lighting/mood: Credible pale morning light entering from the upper right, softly backlighting foliage; subtle cool atmospheric depth; quiet, cultivated, luminous, contemplative.
Color palette: Varied believable foliage greens—sage, fern, moss, olive, deep bottle green—with pale daylight, warm ivory highlights, muted violet and dusty-lilac flower accents. No neon or harsh black.
Materials/textures: Visible dry-brush edges, translucent wash overlaps, fine leaf and grass marks, soft paper-like tactile variation, polished editorial finish.
Constraints: Opaque background covering the entire canvas; coherent natural perspective; calm negative space must remain usable; no embedded text, logo, UI, frame, border, or watermark.
Avoid: doors, gates, arches, people, animals, insects, glass objects, buildings, mountains, rivers, a centered tourism-style path, repeated stock leaves, mirrored foliage, fantasy portals, fake project screenshots, black backdrop, heavy fog, dramatic sunset, excessive floral density.
```

## Piano medio desktop

```text
Use case: stylized-concept
Asset type: responsive website parallax layer — desktop middle planting overlay
Input images: Image 1 is the exact desktop distance plate and is a composition, perspective, palette, and lighting reference only. Do not reproduce its sky, trees, lawn, or background.
Primary request: Create a standalone middle-depth botanical planting layer that aligns perfectly over Image 1 when placed at the same canvas size. Output only the new midground vegetation on a genuinely transparent RGBA canvas.
Subject: Naturalistic mixed planting in medium scale: airy grasses, slender stems, varied leafy perennials, loose fern fronds, and a few small muted violet, dusty-lilac, and pale cream flower spikes. The lower-left cluster is richest and tallest, with a smaller supporting cluster sweeping along the lower-right and scattered low connectors near the bottom edge. Leave an irregular narrow interruption between plant groups to echo the depth opening in Image 1 without becoming a path.
Style/medium: Match Image 1 exactly: sophisticated tactile editorial botanical illustration; hand-painted gouache and translucent watercolor washes with restrained colored-pencil grain; refined, botanical, detailed but breathable; no photographic cutouts, no flat vector shapes.
Composition/framing: Same wide landscape proportions and viewpoint as Image 1. Midground silhouettes should rise mostly through the lower 35–50% of the canvas, with occasional fine stems higher only near the outer edges. Keep the left and center-left typographic opening calm and low-contrast above the planting. Do not make a centered arch, frame, wreath, or symmetrical border.
Lighting/mood: Match the credible pale morning light from the upper right, including soft rim-light on right-facing leaf edges and subtle cool shadows.
Color palette: Match Image 1’s sage, fern, moss, olive, and deep green; pale daylight highlights; restrained muted violet and ivory flower notes.
Transparency/edges: True transparent background with real alpha (not white, gray, checkerboard, paper, haze, or tinted wash). Clean antialiased organic edges; retain delicate stem and frond detail without halos. Interior gaps between stems and leaves must also be transparent.
Constraints: Return only this middle planting layer at full canvas dimensions; preserve empty transparency everywhere else; coherent scale, perspective, and lighting relative to Image 1; no text, logo, UI, border, or watermark.
Avoid: copying any background from Image 1, sky tint, ground plane, shadows painted across empty canvas, oversized foreground leaves, doors, gates, arches, people, animals, insects, glass objects, buildings, mountains, rivers, centered tourism path, repeated stock leaves, mirrored foliage, fake project screenshots, black backdrop.
```

## Primo piano desktop

```text
Use case: stylized-concept
Asset type: responsive website parallax layer — desktop foreground foliage overlay
Input images: Image 1 is the exact desktop distance plate; Image 2 is the exact transparent desktop midground layer. Use both only as composition, perspective, palette, texture, and lighting references. Do not reproduce their opaque background or existing midground plants.
Primary request: Create a standalone nearest-depth foreground layer of large botanical leaves and fern fronds that aligns perfectly over Images 1 and 2 at the same canvas size. Output only the new close foliage on a genuinely transparent RGBA canvas.
Subject: A varied, botanically credible close planting: sculptural matte leaves, several elegant fern fronds, a few curling grass blades, and restrained fine stems. The strongest, densest mass emerges from the lower-left corner and bottom-left edge; a lighter cropped cluster enters from the lower-right edge, with only one or two sparse edge leaves higher at the far right. Use diverse leaf shapes and natural overlaps. No flowers larger than a tiny muted violet accent.
Style/medium: Match the references exactly: sophisticated tactile editorial botanical illustration; layered gouache and translucent watercolor with restrained colored-pencil grain; hand-painted, refined and naturalistic, detailed but breathable; not photorealistic, not cartoon, not flat vector.
Composition/framing: Same 1536×1024-style wide landscape proportions and viewpoint as the references. Foreground foliage is substantially larger than the midground plants, cropped naturally by the bottom and side edges to convey parallax depth. Keep the broad left/center-left upper opening and central clearing visually open for live typography. Do not form an arch, wreath, tunnel, frame, or symmetric border; do not place a central hero plant.
Lighting/mood: Match the pale morning light from the upper right, with luminous fine edges on right-facing leaves, soft internal shadows, and calm cool-green depth.
Color palette: Sage, fern, moss, olive, blue-green, and restrained deep bottle green; warm ivory highlights and only tiny muted violet notes.
Transparency/edges: True transparent background with real alpha, including transparent interior gaps between fronds and stems. No white, gray, black, checkerboard, paper, haze, tint, glow wash, or ground color behind the foliage. Clean antialiased edges; preserve fine hairs, serrations, and narrow stems without halos.
Constraints: Return only this foreground foliage layer at full canvas dimensions; empty regions must remain fully transparent; coherent perspective and lighting relative to the references; no text, logo, UI, border, or watermark.
Avoid: copying any background or existing planting from the references, large floral bouquets, repeated stock leaves, mirrored foliage, tropical monstera cliché, doors, gates, arches, people, animals, insects, glass objects, buildings, mountains, rivers, paths, fake project screenshots, black backdrop.
```

## Distanza mobile

```text
Use case: stylized-concept
Asset type: responsive website parallax layer — dedicated mobile distance plate
Input images: Image 1 is a style, palette, mark-making, and lighting reference only. Create a genuinely new portrait composition; do not crop, stretch, trace, or reuse the desktop layout.
Primary request: Create an opaque portrait illustration of a distant planted garden clearing designed specifically as the backmost layer of a mobile portfolio hero.
Scene/backdrop: An immersive cultivated garden at early morning, with a luminous vertical opening, atmospheric tree layers, gently rolling planted ground, airy shrubs, and a narrow irregular interruption in the planting offset toward the lower center-right that suggests depth but does not read as a path or river.
Subject: Distant and background-scale vegetation only: soft tree canopies concentrated more heavily along the right side and lower perimeter, delicate shrubs, fine grasses, and very restrained muted violet and pale cream flower notes. No oversized foreground leaves.
Style/medium: Closely match Image 1’s sophisticated tactile editorial botanical illustration: hand-painted gouache and translucent watercolor washes with restrained colored-pencil grain; elegant, contemporary, detailed but breathable; naturalistic without becoming photorealistic, cartoonish, or flat vector.
Composition/framing: Purpose-designed portrait composition, approximately 2:3. Full bleed and opaque. The lower-left has the richest planted density, while the upper-left and central vertical opening remain calm, pale, and low-contrast for live mobile typography. Let the right-side trees and light guide the eye downward into the clearing. Strong asymmetry; no centered vanishing point, no tunnel, no arch. This must feel composed for portrait, not like a desktop crop.
Lighting/mood: Credible pale morning light from the upper right, softly backlighting foliage; luminous airy atmosphere; gentle cool depth; quiet and contemplative.
Color palette: Varied foliage greens—sage, fern, moss, olive, blue-green, deep bottle green—with pale daylight and warm ivory highlights, plus tiny muted violet and dusty-lilac floral accents. No neon, muddy brown wash, or harsh black.
Materials/textures: Visible dry-brush foliage edges, translucent wash overlaps, fine grass and leaf marks, subtle tactile paper-like variation, polished editorial finish.
Constraints: Opaque background covering the entire portrait canvas; calm upper-left/central negative space must remain readable; coherent natural perspective; no embedded text, logo, UI, frame, border, or watermark.
Avoid: doors, gates, arches, people, animals, insects, glass objects, buildings, mountains, rivers, centered tourism-style path, repeated stock leaves, mirrored foliage, fantasy portals, fake project screenshots, black backdrop, dramatic sunset, dense floral wallpaper.
```

## Piano medio mobile

```text
Use case: stylized-concept
Asset type: responsive website parallax layer — mobile middle planting overlay
Input images: Image 1 is the exact portrait mobile distance plate and is a composition, perspective, palette, texture, and lighting reference only. Do not reproduce its sky, trees, ground, or existing vegetation.
Primary request: Create a standalone middle-depth botanical planting layer composed specifically for the portrait scene in Image 1. It must align perfectly when overlaid at the same full canvas size. Output only the new midground vegetation on a genuinely transparent RGBA canvas.
Subject: Medium-scale, botanically varied planting: airy seed grasses, slender stems, loose fern fans, natural leafy perennials, and a restrained scattering of small dusty-lilac, muted violet, and pale cream flower spikes. Build the densest and tallest planted mass from the lower-left and left-bottom edge; use a narrower supporting cluster along the lower-right edge, plus a few low bridging plants near the bottom. Maintain an irregular narrow opening offset toward lower center-right for depth without depicting a path.
Style/medium: Match Image 1 exactly: sophisticated tactile editorial botanical illustration; hand-painted gouache and translucent watercolor with restrained colored-pencil grain; naturalistic, elegant, detailed but breathable; not photorealistic, cartoon, or flat vector.
Composition/framing: Same 2:3 portrait proportions and viewpoint as Image 1. Midground plants should occupy mainly the bottom 35–45%, with selected fine stems rising along the far left or far right only. Preserve the upper-left and central vertical opening as clean, calm space for live mobile typography. Avoid an arch, tunnel, wreath, symmetrical frame, centered bouquet, or desktop-crop feeling.
Lighting/mood: Precisely match the credible pale morning light from the upper right, with soft luminous leaf edges and subtle cool-green shadow structure.
Color palette: Match the sage, fern, moss, olive, blue-green, and deep green of Image 1; restrained ivory highlights and muted violet/dusty-lilac accents.
Transparency/edges: True transparent background with real alpha—no white, gray, black, checkerboard, paper, haze, color wash, tint, or ground plane. Interior gaps between every stem, flower, and frond must remain transparent. Clean antialiased organic edges with fine detail and no halos.
Constraints: Return only this mobile midground layer at full portrait canvas dimensions; empty areas must remain fully transparent; coherent perspective and lighting relative to Image 1; no text, logo, UI, border, or watermark.
Avoid: copying any background from Image 1, sky color, opaque ground, shadows across empty regions, oversized foreground leaves, repeated stock leaves, mirrored foliage, doors, gates, arches, people, animals, insects, glass objects, buildings, mountains, rivers, centered tourism path, fake project screenshots, black backdrop.
```

## Primo piano mobile

```text
Use case: stylized-concept
Asset type: responsive website parallax layer — mobile foreground foliage overlay
Input images: Image 1 is the exact portrait mobile distance plate; Image 2 is the exact transparent portrait midground planting layer. Use both only as composition, perspective, palette, mark-making, and lighting references. Do not reproduce their sky, ground, trees, or existing middle plants.
Primary request: Create a standalone nearest-depth portrait foreground layer of large leaves and fern fronds, composed to align perfectly over Images 1 and 2 at the same full canvas size. Output only the new close foliage on a genuinely transparent RGBA canvas.
Subject: A diverse, botanically credible close planting: broad matte leaves with varied silhouettes, several elegant fern fronds, curling grass blades, and restrained fine stems. The strongest, densest mass grows from the lower-left corner and left-bottom edge, with a smaller, airier cropped group from the lower-right and bottom-right. Add at most a few sparse edge fronds along the side margins; keep the central opening free. Natural overlaps and varied scale, no repeated leaf stamp. No prominent flowers; only one or two tiny muted violet accents if needed.
Style/medium: Match the references exactly: sophisticated tactile editorial botanical illustration; layered gouache and translucent watercolor with restrained colored-pencil grain; elegant, naturalistic, detailed but breathable; not photorealistic, cartoonish, or flat vector.
Composition/framing: Same 1024×1536-style 2:3 portrait proportions and viewpoint as the references. Foreground foliage is markedly larger than Image 2’s plants and cropped naturally by the bottom and side edges for strong parallax depth. Preserve the full upper-left and central vertical opening for live mobile typography. Keep negative space breathable; do not form an arch, wreath, tunnel, frame, central bouquet, or symmetrical border.
Lighting/mood: Match the pale morning light from the upper right, with soft luminous edges on right-facing foliage, subtle cool shadows, and quiet layered depth.
Color palette: Sage, fern, moss, olive, blue-green, and restrained deep bottle green; warm ivory highlights and minimal muted violet detail.
Transparency/edges: True transparent background with real alpha, including transparent interior gaps between frond leaflets and stems. No white, gray, black, checkerboard, paper, haze, tint, glow wash, ground plane, or soft color field behind the foliage. Clean antialiased organic edges; preserve fine serrations and slender stems without halos.
Constraints: Return only this mobile foreground foliage layer at full portrait canvas dimensions; empty regions must remain fully transparent; coherent scale, perspective, and lighting relative to both references; no text, logo, UI, border, or watermark.
Avoid: copying any background or existing planting from the references, floral bouquets, repeated stock leaves, mirrored foliage, tropical monstera cliché, doors, gates, arches, people, animals, insects, glass objects, buildings, mountains, rivers, paths, fake project screenshots, black backdrop.
```

## Verifica degli output

- Distanza desktop: PNG RGB opaco, 1536 × 1024.
- Piani medio/primo desktop: PNG RGBA con alpha reale, 1536 × 1024.
- Distanza mobile: PNG RGB opaco, 1024 × 1536.
- Piani medio/primo mobile: PNG RGBA con alpha reale, 1024 × 1536.
- Nessun output contiene testo, logo, watermark, persone, insetti, edifici, porte, fiumi o montagne.
- L’allineamento è compositivo, non una segmentazione pixel-per-pixel; i due breakpoint non devono essere intercambiati o ricampionati l’uno dall’altro.
