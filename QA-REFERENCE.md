# Current-source QA reference (v124)

Baseline: f4032f5b02a8f308a0e903759cd2daa3a6552ecf. The three historical reports cited by #420, #421 and #445 were not provided. This file supersedes their obsolete references for the current website; it does not claim to edit those absent reports.

- #420: current Admissions footer link: admissions.html:457 (footer Admissions 2027–28 link); current Home primary CTA: index.html:483 (See admissions).
- #421: current details.css: 1876 lines when split on newline (including the trailing empty line when present). Historical v97 line counts cannot describe this release.
- #445: Home admissions CTA section: 473 UTF-8 bytes, measured from the opening section tag including its two-space indent through its closing section tag, without trailing newline. Canonical shared CTA styling: style.css:1592; inspect selectors rather than historical offsets.

Browser QA v123: [168/168 checks passed](https://github.com/jayant1435/dbso-school-website/actions/runs/45431038717). The v124 browser script adds runtime carousel autoplay/focus/reduced-motion checks and logs side-by-side image/text geometry for #293 at four desktop/tablet widths. Geometry records are a review aid, not a substitute for visual sign-off. Real-device, live edge-cache and independent review remain separate.
