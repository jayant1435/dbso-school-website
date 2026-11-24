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

## v115 — shared structure and readable content
- 129/130/156: remove stale deadline from CTA bands; canonical admissions CTA on seven primary pages, existing Questions CTA on Admissions. Existing dated news and announcement facts retained. 304/309/311/321: shared CTA spacing and action sizing; visual confirmation required.
- 155: add Gallery to Explore across all eight pages. 135/218: distinct ISC tablist and no-script nav accessible labels. 195: Class XI in announcements. 194/199/213/272/406: wrap mobile footer links and keep the hamburger round; narrow-screen brand sizing. 350/359/361: remove shadowed footer declarations.
- 137: combine duplicate lab cards; 250: cap grounds and science body text. 152/305/395: story heading rule, banner placed after intro. 400: Notices heading with rule; notice entries become h3. 206/245: fee heading/region labels consolidated. 201/202/221: responsive fee-table focusability and wider row labels; live width testing pending. 242/262: no-script syllabus groups and list styling.
- 239: remove home news truncation. 211/261/273: readable club labels and balanced static/reduced-motion club grids. 212/241/248/275/351: shared readable line wrapping. 147/179: narrow hours rows stack where necessary. 408: remove stale section-tight class where present.
- All school facts, dates, fee amounts, genuine photos and brand assets preserved except duplicate computer-lab card text consolidated. No new decorative icons. Source checks only; live/browser verification and dependent tasks remain open.

## v116 — motion and reading accessibility
- 61/276: Life photo strip gets a user-controlled pause/play button, a six-photo no-JS grid, and real interactive roles only when the JS viewer is active. No clone exposed to assistive technology.
- 226/188: announcement track has three repetitions per animation half, sufficient for typical desktop widths; static wrapping text without JavaScript or with reduced motion. Only one announcement is accessible to screen readers.
- 171: link arrow kept with preceding phrase. 314: same Core Values type scale in both sliders. 249/260/356: portrait centered, eight recognition photos in balanced reduced-motion rows and hint spacing. 261: static value grid handles final card deliberately. These remain subject to visual and runtime QA.

## v117 — source cleanup and image-radius consistency
- Verified original handover cleanup anchors against current source, rather than applying obsolete line-number patches. Removed only exact dead or overridden rules: #156 (4), #376 (5), #392 (1), #386 (1), #387 (1), #391 (1), #385 (1), #373 (1).
- 319/310: one 20px photo-radius token (matches the established Home and details treatment), no duplicated radius declaration. 424/438/440: staff merge uses current non-teaching list and existing merge destinations; old staged patch issues need not be reapplied. 428: existing About why-grid contains 8 items; final render check outstanding.
- JS source compiled successfully in a JavaScript parser. No changes to photographs, facts or illustrated-icon scope. Source-only cleanup, full browser test still required.

## v118 — verification infrastructure
- Reconciled all 247 original ongoing IDs in TASK-STATUS.md, with implementation, superseded, evidence-dependent and remaining categories. No false completion claims.
- Added browser QA for all eight pages at six viewport widths, no-JS and reduced-motion modes, mobile menu and photo-strip controls, and legacy redirects. Runs in GitHub Actions; no production dependency introduced. Results are not yet confirmed.

## v119 — concise navigation, fuller staff profiles and QA repair
- Rename Life at Bosco to Campus and News & Notices to Notices, including navigation, footer, page headings and matching CSS/JS labels. Keep original routes and school crest.
- Expand Office and Support Staff descriptions without inventing personnel or unsupported school-specific duties; equal-width photo/text pairs on desktop and natural stacking on smaller screens.
- Readability, control sizes, text wrapping, field/tab tokens, photo balance and video duration/link improvements. Ledger records 22 additional addressed/reconciled IDs, all pending verification.
- Fix QA's false icon-count failure caused by two legitimate aria-hidden clones, retaining scope and accessibility assertions. Previous run 52/64. No release sign-off yet.

## v120 — gallery, typography and card consistency
- Verified v119 browser run passed 64/64, no failures, including legacy redirects.
- 36 gallery headings use the shared gold rule. Remove eight exact repeated video descriptions; preserve meaningful descriptions, videos, thumbnails and links. Replace heavy placeholder image with transparent placeholder. Video grids keep normal image ratio and balanced final row.
- Shared content card gap, title type, readable names/descriptions, hover treatment and 48px pillar controls; footer and syllabus headings use display font. Tile grid stretches equal-height rows. Fee table gets a small-screen scroll hint; enquiry form stretches to available height on desktop. Preserve all fee values and official school facts.
- Reconcile 35 further task entries in the public ledger, including older tasks superseded by merges. All need task-specific visual QA or confirmation, no formal sign-off. Gallery mosaic intentionally preserved. Keep the published admission deadline in notices and ticker while applicable.

## v121 — responsive cleanup and broader QA
- Retired shadowed layout rules and stale CSS line citations, made the values slider consume its declared peek size, normalized the celebrations heading and admissions list rhythm, and placed the welcome copy before its portrait on stacked layouts.
- Clarified the 2026 Telegraph award caption based on the original handover's photo evidence.
- Expanded browser coverage to 14 widths; v120 baseline passed 64/64 checks. v121 verification pending.

## v122 — screenshot-driven correction
- Keep the seven values only on About; replace the narrow pager with a full-width auto-scrolling native rail, shared radius tokens, 16px gaps, reduced-motion grid and interaction-stops-autoplay. Home retains its clubs and houses. Remove pause buttons and visible drag instructions; photograph strips use native manual scroll. Keep one Campus CTA in Home's Campus section.
- Mobile reasons now use concise, one-line labels; preserve original meaning in titles. Leadership uses wider cards with readable one-line full names and roles, without truncation; single-column at phone widths, two columns on tablets. Awards use equal 3:4 frames, center crop and rounded masks; original full photos open in viewer. Restore actual address on phone footer and use consistent two-column link groups and gold rules.
- Browser assertions now test requested phone widths, full-width values, one-line text fit, photo controls, and award-frame dimensions. Original tracker is preserved; none of the remaining 66 are claimed complete from this patch alone.

## v123 — original remaining task implementation and privacy review
- v122 browser checks passed 168/168. Compact About reasons returned to two columns; mobile leadership switched to horizontal portrait/name rows. Preserve full original names/roles; no text clipping intended.
- Privacy: five Exhibition 2026 artwork photographs with handwritten pupil-identifying details removed from gallery and current tree (all variants), original offline handover remains. Four distinct visiting-school dance photographs now have distinct alt text.
- Performance: 32 lazy image placements use existing smaller variants or responsive srcsets; 7 unused old PNG icons removed. All original full-resolution viewer destinations retained except privacy removals. No fabricated photos, new school facts, or changed fee figures.
- Fee table fits a whole number of numeric columns beside sticky class header. Shared date/card/rank styles, activity grids, gallery titles, academic subjects, video/facilities layouts, footer and typography refined. Group repeated awards without dropping facts. Remove precisely identified obsolete CSS/comments. 49 original task IDs have additional source implementation/reconciliation evidence, all pending complete verification. No claim of final production approval.
