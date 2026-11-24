# Handover backlog — verification ledger

Original source: the 247 task IDs marked ongoing in the supplied handover tracker. This public ledger uses IDs only, not private handover notes. It does not overwrite the original task tracker or imply the site is finished.

| Status | Count |
| --- | ---: |
| Implementation or source correction recorded, visual verification pending | 223 |
| Superseded or stale patch reconciled, verification pending | 10 |
| Requires additional evidence, real-device/independent QA, or external access | 13 |
| Still to review or implement | 1 |
| Total | 247 |

No entries are formally signed off yet under the original handover's required independent, live and visual verification protocol. Some implementation entries represent partial fixes.

## Implemented or addressed, QA pending
- [ ] #96
- [ ] #73
- [ ] #105
- [ ] #108
- [ ] #148
- [ ] #169
- [ ] #173
- [ ] #174
- [ ] #176
- [ ] #182
- [ ] #183
- [ ] #184
- [ ] #185
- [ ] #192
- [ ] #198
- [ ] #203
- [ ] #210
- [ ] #252
- [ ] #254
- [ ] #255
- [ ] #257
- [ ] #258
- [ ] #274
- [ ] #308
- [ ] #317
- [ ] #320
- [ ] #324
- [ ] #328
- [ ] #332
- [ ] #333
- [ ] #336
- [ ] #337
- [ ] #341
- [ ] #346
- [ ] #358
- [ ] #360
- [ ] #363
- [ ] #364
- [ ] #372
- [ ] #379
- [ ] #380
- [ ] #381
- [ ] #382
- [ ] #383
- [ ] #384
- [ ] #389
- [ ] #390
- [ ] #399
- [ ] #404
- [ ] #231
- [ ] #237
- [ ] #247
- [ ] #256
- [ ] #313
- [ ] #347
- [ ] #357
- [ ] #388
- [ ] #393
- [ ] #394
- [ ] #410
- [ ] #411
- [ ] #412
- [ ] #413
- [ ] #415
- [ ] #422
- [ ] #444
- [ ] #37
- [ ] #38
- [ ] #61
- [ ] #62
- [ ] #63
- [ ] #64
- [ ] #129
- [ ] #130
- [ ] #135
- [ ] #137
- [ ] #147
- [ ] #150
- [ ] #152
- [ ] #155
- [ ] #156
- [ ] #163
- [ ] #171
- [ ] #179
- [ ] #187
- [ ] #188
- [ ] #194
- [ ] #195
- [ ] #199
- [ ] #201
- [ ] #202
- [ ] #206
- [ ] #208
- [ ] #211
- [ ] #212
- [ ] #213
- [ ] #214
- [ ] #217
- [ ] #218
- [ ] #221
- [ ] #223
- [ ] #226
- [ ] #228
- [ ] #230
- [ ] #235
- [ ] #236
- [ ] #239
- [ ] #241
- [ ] #242
- [ ] #243
- [ ] #244
- [ ] #245
- [ ] #246
- [ ] #248
- [ ] #249
- [ ] #250
- [ ] #260
- [ ] #261
- [ ] #262
- [ ] #272
- [ ] #273
- [ ] #275
- [ ] #276
- [ ] #298
- [ ] #299
- [ ] #300
- [ ] #302
- [ ] #304
- [ ] #305
- [ ] #309
- [ ] #310
- [ ] #311
- [ ] #314
- [ ] #319
- [ ] #321
- [ ] #350
- [ ] #351
- [ ] #356
- [ ] #359
- [ ] #361
- [ ] #373
- [ ] #376
- [ ] #378
- [ ] #385
- [ ] #386
- [ ] #387
- [ ] #391
- [ ] #392
- [ ] #395
- [ ] #400
- [ ] #403
- [ ] #405
- [ ] #406
- [ ] #408
- [ ] #416
- [ ] #425
- [ ] #426
- [ ] #427
- [ ] #428
- [ ] #429
- [ ] #435
- [ ] #436
- [ ] #437
- [ ] #439
- [ ] #442
- [ ] #443

- [ ] #94
- [ ] #134
- [ ] #143
- [ ] #168
- [ ] #181
- [ ] #197
- [ ] #205
- [ ] #222
- [ ] #225
- [ ] #291
- [ ] #315
- [ ] #335
- [ ] #339
- [ ] #340
- [ ] #342
- [ ] #343
- [ ] #344
- [ ] #345
- [ ] #365
- [ ] #371
- [ ] #374
- [ ] #402

- [ ] #56
- [ ] #72
- [ ] #106
- [ ] #138
- [ ] #146
- [ ] #149
- [ ] #157
- [ ] #158
- [ ] #167
- [ ] #175
- [ ] #177
- [ ] #193
- [ ] #204
- [ ] #207
- [ ] #216
- [ ] #220
- [ ] #234
- [ ] #306
- [ ] #307
- [ ] #312
- [ ] #316
- [ ] #322
- [ ] #323
- [ ] #325
- [ ] #326
- [ ] #329
- [ ] #330
- [ ] #331
- [ ] #334
- [ ] #338
- [ ] #396
- [ ] #397
- [ ] #398
- [ ] #401
- [ ] #409

## Superseded or stale patch reconciled, QA pending
- [ ] #417
- [ ] #418
- [ ] #419
- [ ] #423
- [ ] #424
- [ ] #438
- [ ] #440
- [ ] #420
- [ ] #421
- [ ] #445

## Evidence or external verification dependencies
- [ ] #52
- [ ] #55
- [ ] #57
- [ ] #68
- [ ] #74
- [ ] #77
- [ ] #95
- [ ] #118
- [ ] #123
- [ ] #127
- [ ] #142
- [ ] #196
- [ ] #407

## Remaining review or implementation
- [ ] #293

## Verification
At v117, repository-source inspection checked 13 HTML files, 1,265 local references, 30 fragments, image alt attributes, unique IDs and ARIA references; no errors were found in those checks. JavaScript syntax was validated. Seven generated value assets and no old sprite remain. These are static results, not live browser sign-off.

### v119 implementation/reconciliation notes (QA pending)
- #94: legacy routes redirect to merged sections.
- #134: mobile footer layout superseded by v115.
- #143: portrait containment and slider already implemented.
- #168: 65ch stacked split paragraphs.
- #181: center curriculum figure.
- #197: existing lazy lightbox placeholder.
- #205: shortened club instructions.
- #222: duration labels never wrap internally.
- #225: eight primary pages have active navigation; four legacy redirects.
- #291: existing eight-reason balanced grid from earlier brief.
- #315: gold heading rule already present in merged fee section.
- #335: Managing Committee removed per brief.
- #339: 44px pillar dot tap targets.
- #340: video links underline.
- #342: full-width form submit.
- #343: shared field radius.
- #344: shared tab radius.
- #345: 8px award markers.
- #365: shortened stationery copy.
- #371: avoid priority item column breaks.
- #374: science slide uses existing seminar photo instead of square poster.
- #402: facilities merged on current source rather than stale patch.
The initial v118 browser run reported 52/64 passing, with 12 failures due to counting the two intentional core-value carousel clones. The updated test distinguishes original slides, checks that clones are aria-hidden, and checks every illustrated image remains inside a value slide. New run not yet verified.

### v120 implementation/reconciliation notes (QA pending)
- #56: existing anthem one-line introduction verified; lyrics untouched.
- #72: eight repetitive video descriptions removed; specific descriptions retained.
- #106: obsolete emblem grid removed; curriculum split centered in v119.
- #138: previous arrow-button issue superseded by slider keyboard handling.
- #146: previous/next controls removed in v111; focus pause on slider and explicit pause button.
- #149: legacy facilities CTA replaced by shared admissions CTA.
- #157: retain accurate, upcoming 10 Dec 2026 deadline in notices and announcement; not duplicate CTA copy.
- #158: story split centered in v119; full-width second photograph preserved.
- #167: obsolete colours paragraph absent with removed coat-of-arms section.
- #175: leadership cards and separate school-hours section supersede old split.
- #177: old coat-of-arms introduction absent.
- #193: legacy facilities CTA removed in merge.
- #204: seven shared CTA sections follow the same spacing rules.
- #207: announcement arrow uses nonbreaking space in current markup.
- #216: no duplicate admissions link within the footer.
- #220: generic repeated video descriptions removed; unnecessary height reserve removed.
- #234: page-heading intro 66ch.
- #306: gold rules now present on all 36 gallery event headings.
- #307: merged payment section already has canonical heading rule and spacing.
- #312: footer and syllabus headings use display font.
- #316: common content cards use shared hover lift and shadow.
- #322: uniform video thumbnail ratio; centered normal-width final row.
- #323: retain intentional editorial photo mosaic, not impose a single ratio on different images.
- #325: staff and leadership headings/description sizing, padding and wrapping aligned.
- #326: common card grid gap 16px.
- #329: tile minimum height 64px with stretched rows.
- #330: standard content card title 1.2rem; staff and summary remain smaller for hierarchy.
- #331: notice panel uses solid shared border.
- #334: stat and summary cards share hover lift and shadow.
- #338: pillar arrows use 48px same as gallery/lightbox.
- #396: coat-of-arms section removed.
- #397: transport image moved after heading/text on mobile in v119.
- #398: celebration image moved after heading/text on mobile in v119.
- #401: principal figure after quote and attribution on mobile in v119.
- #409: house-modal link ends with nonbreaking arrow.
Browser QA v119: 64/64 checks passed, plus four legacy redirect checks with no failures. Run: https://github.com/jayant1435/dbso-school-website/actions/runs/45425918565. New v120 assertions extend those checks; no visual sign-off yet.

### v121 source reconciliation
- Addressed IDs: #231, #237, #247, #256, #313, #347, #357, #388, #393, #394, #410, #411, #412, #413, #415, #422, #444. Removed obsolete rules and stale line-number references rather than retaining fragile line citations; corrected the award caption using the handover's photo evidence; connected the slider peek setting to CSS; restored consistent heading sizes and natural checklist heights; reordered the stacked welcome section. Visual verification remains pending.
- v120: 64/64 automated checks passed (Actions run 45426603182); v121 extends the breakpoint matrix. This is not independent visual or live deployment sign-off.

### v122 user screenshot corrections
Reopened earlier implementation IDs for values layout, mobile family tiles, leadership readability, awards image treatment and footer. The latest user brief supersedes the earlier duplicate Home/About values and visible pause controls. This patch preserves the seven actual icons on About only. New browser checks target the screenshot regressions. No additional original IDs signed off solely from these changes.

### v123 — original tracker tasks, source work recorded (QA pending)
- #73/#96: examined actual handover artwork images; five contained handwritten pupil-identifying details. Omitted them from the current gallery and removed all working-tree image variants; original handover archive preserved. Historical Git objects and CDN caches may still need access-owner remediation.
- #105: Both poster frames retain matching aspect ratios and a consistent caption grid, without clipping or fixed excessive text reserves.
- #108: 32 lazy image placements now use existing lower-resolution variants or responsive sources; full viewer images preserved, 7 orphan value PNGs retired. Font preloads and lazy awards were already present. Full performance metrics remain pending.
- #148: Grouped repeated Telegraph award labels under their dated event names, preserving every award. Longest individual facts remain allowed to wrap.
- #169: Both video grids use equal-width two-column cards across 861–1200px.
- #173: On compact phones all ranked cards place rank/score on one row and full name below; no squeezed names.
- #174: Responsive Auditorium seats label and equal-height stat cards.
- #176: Anthem uses one column in the 861–1000px squeeze band; verse typography scales to its container.
- #182: Shorter co-curricular labels and two-column compact tablet/phone grid.
- #183: v120 already stretches enquiry form to office column; no additional copy or unsupported service added.
- #184: Fit the sticky class column and an integer number of numeric columns to the viewport, retaining the exact same 12 amount columns; added geometry test.
- #185: Club grid is 2 columns below 861 and 3 at desktop, labels wrap naturally without box overflow; removed obsolete Gymnastics example.
- #192: Facility descriptions explicitly unclamped; added browser geometry check.
- #198: Responsive event heading scale on mobile; long factual labels can wrap rather than truncate.
- #203: Retired PNG mapping comment replaced and old 20-club reference corrected.
- #210: Current Home source no longer has the five retired tile selectors; stale comments and old clamp rules removed where actually present.
- #252: Obsolete meaning-card comment absent in current source; no line-number patch reapplied.
- #254: Four equal subject slots at narrow widths, with full wording.
- #255: Corrected outdated 20-club and Gymnastics comments.
- #257: Wider academic results column in the two-column desktop band; mobile rank layout adjusted.
- #258: Shortened relationship paragraph while preserving its substance, equal-height desktop pillar rows in squeeze band.
- #274: Date labels abbreviated without changing any dates, unified cards and grid.
- #308: Shared gold-rule/heading spacing and heading group bottom margin.
- #317: 56x4px gold rules in headings, quote and footer; obsolete committee absent.
- #320: Notices and Home use common bordered card treatment, same title hierarchy.
- #324: Shared caption type and line height for posters, awards and photo strips.
- #328: All three Campus activity grids use 2 columns at tablet/phone widths.
- #332: Ranked results and timeline share card treatment; keep dates and chronological order.
- #333: Shared date cards across Home and Admissions.
- #336: 48px minimum small action controls; footer remains plain navigation per original brief.
- #337: Primary action max-width and wrapping standardized; full-width only when context requires, e.g. form.
- #341: Consistent blue selected-state ring on tabs, tiles and club/house choices.
- #346: Shared list spacing and grouped repeated awards, natural content height.
- #358: Removed the old contradictory <=600px footer design and obsolete overrides; retained the compact grouped phone layout.
- #360: Removed obsolete measured caption line-count claim.
- #363: Syllabus comment now explicitly describes no-JS fallback.
- #364: Same video card widths at intermediate breakpoints; titles unclamped.
- #372: Compact timeline stacks years/names at 360px and below, preserving full names.
- #379: Four duplicate descriptions replaced with distinct descriptions after viewing the original photographs.
- #380: Replaced W4's superseded footer blocks with a single current rule set; canonical grid retained.
- #381: Deleted superseded 3-column and orphan-span Home notices grid rules.
- #382: Removed confirmed duplicated tab, note, input, old hours heading and grouped result-row declarations.
- #383: Removed superseded Home card clamp and obsolete photo-pause declarations; additional exact dead rules may need measured review.
- #384: Removed result-row from superseded grouped selector; other selectors retained.
- #389: Removed shadowed nav height/crest transitions.
- #390: Removed shadowed focus-ring transition.
- #399: Facilities intro already has shared heading; five merged cards reordered heading/photo/description and final row balanced.
- #404: Removed fragile single-line-based timeline pseudo-rule; per-row borders now mark each item.
- #293 remains open for comprehensive split geometry/visual review. Academics longest split now moves its extra copy into a full-width continuation; other splits centered as appropriate. #420/#421/#445 are report-only historical citation corrections, not changes to visible website; original cited QA reports were not included in the handover, so leave them explicitly open.
- v122 passed 168/168 automated checks at 19 responsive widths, plus legacy redirects. v123 adds fee geometry, video widths and privacy checks. External dependencies still open, including school-confirmed qualifications, prospectus text, real-device checks, new genuine images and live cache.

### v124 source references and additional QA
- v123 browser run 45431038717 passed 168/168 checks. #420/#421/#445 reconciled for current source in QA-REFERENCE.md; absent historical reports themselves were not edited. #293 receives an explicit geometry audit at four widths and is not yet signed off. Added behavioral assertions for values autoplay and interaction/reduced-motion behavior.

### v127 automated evidence
- Visual audit run 45448050294 inspected 24 page/viewport combinations with no reported overflowing labels or broken local image requests. Five sampled live files returned HTTP 200 and exactly matched the checkout. Long-page screenshot clipping failed; the capture harness is repaired in v128. This is not full visual sign-off and does not resolve missing school evidence.

### v129 screenshot review
Actual v128 screenshots were retrieved and inspected; the reduced-motion values overlap was identified and repaired. Prior layout metrics and selected live hash comparisons passed. The comprehensive layout task #293 remains open pending complete visual review and individual task sign-off; no unsupported school facts added. Latest audit reduces screenshot quality on the very long Gallery page to stay within the free storage budget.
