# DBSO icon system — v109

The school crest and crest-derived favicons are unchanged. The new hand-authored vector family uses the approved #1d6fa5 → #175984 blue tile and #c9a227 gold marks, a 64-unit artboard, 17-unit corners, and 3.4-unit rounded strokes. The utility marks inherit currentColor. Icons are decorative when accompanied by headings or control labels.

## Inventory
- `icon-value-integrity`
- `icon-value-compassion`
- `icon-value-self-discipline`
- `icon-value-love-of-god`
- `icon-value-love-for-nature`
- `icon-value-respect-for-others`
- `icon-value-spirituality`
- `icon-section-school`
- `icon-section-learning`
- `icon-section-community`
- `icon-section-achievement`
- `icon-section-admissions`
- `icon-section-sport`
- `icon-section-gallery`
- `icon-section-contact`
- `icon-section-facilities`
- `icon-section-fees`
- `icon-section-news`
- `icon-section-video`
- `icon-chevron-left`
- `icon-chevron-right`
- `icon-arrow-right`
- `icon-check`

Use the shared sprite with an SVG `<use href="assets/img/icons.svg#icon-NAME"/>`. No new icon libraries or scripts are required.

## Build log
- Recreated the missing round-three icon design as scalable SVGs; reviewed all 19 branded marks at large and small sizes; revised sport from globe-like to football, and chose lotus for spirituality.
- Integrated 14 value icon instances across Home and About, and 16 section placements across all 12 pages. Migrated repeated check and chevron geometry, pillar controls and matching text-link arrows to shared symbols.
- Restored the current page attribute in the no-JS primary navigation where the page is in that navigation.
- Removed the Managing Committee block on About (task 425); preserved leadership and other school facts. Bound the final Life paragraph's 'and certificates.' with a nonbreaking space (378). Removed the orphan Coat of arms selector (416).
- Source checks: shared icon references resolve to the 23 symbols. Legacy photographs, fonts, fee amounts, crest, and hosting configuration are retained. Full browser and served-byte deployment verification remain outstanding; do not consider the entire backlog complete.
