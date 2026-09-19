# Asset ambientali — prompt ImageGen

Aggiornato il 17 settembre 2026.

I due atlanti sono stati generati con lo strumento ImageGen integrato, usando come riferimenti di stile esclusivamente gli artwork botanici già approvati del sito. Le immagini di riferimento non sono state modificate. Le sorgenti RGBA sono conservate in `source-assets/botanical/ambient/`; gli output ottimizzati vengono prodotti da `scripts/optimize-botanical-assets.mjs` in `public/assets/images/ambient/`.

## Atlante dell’uccellino

```text
Use case: stylized-concept
Asset type: transparent website decorative actor atlas for miniutti.it
Input images: Image 1 is a style, palette, lighting, realism and brushwork reference; Image 2 is a foliage texture and edge-detail reference. They are references only—do not copy their compositions or include any background.
Primary request: Create a coherent four-pose family of the same very small European garden songbird for a refined botanical website. Arrange exactly four isolated cutouts in a clean 2 × 2 atlas: top-left bird flying left-to-right with wings raised; top-right the same bird flying left-to-right with wings lowered and body gently angled for approach; bottom-left the same bird perched in calm side profile facing right on a very short, fine natural twig; bottom-right the same perched bird facing left on a matching short twig.
Subject: one consistent, anatomically credible tiny songbird in every cell, muted olive-gray and sage upper plumage, soft warm ivory-buff underside, restrained charcoal eye and beak, no exaggerated markings.
Style/medium: match the references’ sophisticated tactile editorial botanical illustration—naturalistic layered gouache and translucent watercolor with restrained colored-pencil grain, fine feather edges, detailed but quiet; between illustration and realism, never cartoon.
Composition/framing: 1536 × 1024 landscape transparent canvas divided into four equal invisible quadrants, one complete pose centered in each quadrant, generous fully transparent gutters around every pose, no overlap between cells. Keep each bird small within its quadrant with the full silhouette and wing tips visible.
Lighting/mood: credible pale morning light from the upper right with restrained highlights and soft cool-green shadows, calm and cultivated.
Color palette: sage, fern, olive, muted blue-green, warm ivory and soft charcoal, harmonized with the references.
Transparency/edges: genuinely transparent RGBA background, including around feather tips and between wings, legs and twig; clean antialiased organic edges with no halo.
Constraints: same bird identity, proportions, palette and level of detail in all four poses; no text, labels, grid lines, logo, UI, border or watermark; no ground shadow or colored wash; no extra animals, flowers, leaves or scene elements; only the two tiny perch twigs in the bottom cells.
Avoid: emoji, iconography, flat vector art, mascot styling, children’s-book cartoon, oversized eyes, dramatic action pose, photorealistic cutout, stock clip art, duplicated birds within a cell, opaque or checkerboard background.
```

## Atlante delle foglie

```text
Use case: stylized-concept
Asset type: transparent website ambient falling-leaf atlas for miniutti.it
Input images: Image 1 and Image 2 are exact style, palette, material, lighting and edge-detail references only. Do not copy their composition or include their backgrounds.
Primary request: Create exactly six separate, coherent individual fallen-leaf cutouts derived from the cultivated garden language of the references. Arrange them in a clean 3 × 2 atlas with invisible equal cells: top row three leaves, bottom row three leaves.
Subject: six botanically credible leaf variants with short petioles: one small oval tree leaf, one slender willow-like leaf, one softly serrated sage-green leaf, one small compound leaflet, one curled olive leaf seen at a three-quarter angle, and one pale backlit leaf turned partly edge-on. Each is a single loose leaf, not a branch, cluster or flower.
Style/medium: match the references’ sophisticated tactile editorial botanical illustration—naturalistic gouache and translucent watercolor with restrained colored-pencil grain, soft painterly veins, refined but quiet; neither photorealistic cutout nor flat vector.
Composition/framing: 1536 × 1024 landscape transparent canvas divided into six equal invisible cells, one complete leaf centered in each cell, generous fully transparent gutters and no overlap. Vary orientation naturally while keeping every silhouette fully visible.
Lighting/mood: pale morning light from the upper right, soft luminous edges and restrained cool-green shadows.
Color palette: sage, fern, moss, olive, muted blue-green and one lightly sun-warmed ivory-green underside, harmonized precisely with the references.
Transparency/edges: genuinely transparent RGBA background, including around petioles and curled edges; clean antialiased organic edges with no halo.
Constraints: exactly six leaves, consistent material quality, no text, labels, grid lines, logo, UI, border or watermark; no ground shadows, scene, colored wash, branch, flowers, berries or insects.
Avoid: emoji, stock clip art, iconography, flat vector, cartoon, tropical monstera cliché, maple leaf cliché, duplicated silhouettes, dense clusters, opaque or checkerboard background.
```

Il quarto riquadro dell’atlante foglie contiene un piccolo ramo composto e non viene usato dal sistema di caduta. Le cinque celle utilizzate sono tutte foglie singole.
