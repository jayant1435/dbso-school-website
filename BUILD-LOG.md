# DBSO development log

## v110 — responsive rhythm, legibility and recovery
Base: v109 / 280ecdc9f870fe10e31c38e569e4743b3fdd2549

Implemented from the authoritative handover queue (task IDs remain open until live served-byte and visual verification):
- 436: shared section spacing 64→48px, phone spacing 32px, heading groups 48→32px (24px on phones), footer margin 64→16px; scoped 24px Home Life/ICSE boundary and Life photo link.
- 437: anthem typography scales to each verse's own available width; original lyrics and explicit line breaks retained, wrapping permitted when accessibility settings require it.
- 429/208: smaller icons and cards, more visible adjacent values, stage-constrained peek calculation; no-JS value labels wrap at every width.
- 244: 18 clubs form six complete three-column rows at tablet/desktop, two columns on phones; labels can wrap, rows stretch evenly.
- 223/228: preserve complete long-video titles and increase description reserve in the intermediate-width band.
- 427: tighten margins around Fit India recognition note without editing the school claim.
- 405/442: delete unused house swatch, header CTA and no-JS button rules.
- 217: add static branded 404.html, with root-relative recovery links, to use Cloudflare Pages' normal custom-404 behavior. HTTP status still requires live validation.

Skills applied: better-ui (4px spacing increments and shared system); design-system (existing tokens); impeccable craft-floor (proximity, responsive type, recoverable error state); design-taste-frontend and no-ai-design-slop (smallest corrections within existing visual world); Hallmark (no-JS content); interaction-design (clear recovery choices). No new palette, typeface, dependencies, school facts, redirects or assets.

Checks: anchored edits against fetched v109 source, static structural and sizing-math checks; no stale patches. Browser execution, independent second-worker screenshot review and live served-byte confirmation unavailable in this environment. Do not mark tasks Completed until verified. Larger page merges and prospectus-dependent fee text remain separate.

## v111 — consolidate the site navigation and mobile content
- Tasks 298, 299, 300, 302: Facilities → Life, Staff → About (57 teachers, four leadership portraits and existing non-teaching layout), Fees → Admissions (same school-published figures), Videos → Gallery. Old URLs retain immediate redirects with a visible link; sitemap and internal links point to eight primary pages. Duplicate leadership and admissions CTA sections removed.
- Task 435: native touch and keyboard mobile Four Houses rail, with bounded ends and visible adjacent cards where available; desktop grid retained. No autoplay, dots or arrows.
- Task 426: eight genuine award photos, full portrait containment, no arrow buttons; existing drag/keyboard rail retained. Exact replacement crop unavailable.
- Tasks 187/243/214: no-script stream visibility and controls. Task 150: facilities descriptions unclamped. Task 137: remove unverified campus claims; duplicate lab card still under review.
- Checks: source-derived anchors, unique IDs, asset references, staff inventory, navigation destinations and sitemap. Browser/runtime and production deployment verification outstanding. AI raster transfer remains pending; existing icon references retained. Remaining backlog not marked complete.

## v112 — real AI imagery and accessibility repairs
- Tasks 37/38/62/64: uploaded all 23 selected AI-generated WebP icons (about 100 KB combined), converted 119 shared-sprite instances to image elements and deleted the superseded vector sprite. Preserved official crest and favicons.
- Task 63: awards autoplay pause/play control; no arrows restored. No-JS awards grid displays all eight genuine photos.
- Task 235: mobile menu closes when the viewport crosses the desktop breakpoint. Task 230: lock html scroll for dialogs. Task 246: gallery counters and button states update on resize. Task 403: enquiry form no-script fallback uses the school’s published email and phone. Task 163: contrasting lightbox arrow backgrounds. Extensionless route active states fixed.
- Static anchors, exact asset inventory and old sprite reference checks passed. Live/browser QA and remaining task queue not declared complete.

## v113 — user-directed icon scope correction
- Remove every illustrated section icon, restoring the original gold heading marker, including above A beacon of excellence in the Dooars.
- Replace illustrated utility icons with simple functional text glyphs; accessible control labels unchanged. Keep generated illustrations only in the two Core Values rails.
- Leave the official crest and favicon identity intact. Delete unused v112 section and utility WebP assets. The seven value icons are rejected and still need a lighter, restrained gradient treatment. Icon tasks 37/38/62/64 remain open and are not counted as finished.
- Static reference scope verified. Live deployment and visual verification remain outstanding.

## v114 — replace rejected core-values artwork
- Replaced all seven v112 dark metallic value images with selected AI-generated pale-blue/cream gradient art. Correct original seven symbols, no new artwork outside the two value sliders. Native image dimensions corrected to 144px. Asset hashes recorded in ICON-SHEET.md.
- Tasks 37/38/62/64 revised to reflect the latest user direction; live visual approval remains open.
