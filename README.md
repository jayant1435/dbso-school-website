# Don Bosco School Oodlabari — website

Replacement website for Don Bosco School, Oodlabari (CISCE affiliated,
school code WB366). Plain static site, no build step.

## Layout

Pages live at the root (`index.html` and friends). Shared styles, scripts,
fonts and images live under `assets/`. Fonts are self-hosted; there is no
CDN dependency. All photos are the school's own, taken from its website,
Instagram and Facebook pages.

## Deploy

Pushes to `main` deploy automatically on Cloudflare Pages, which serves
the repo root as-is. The Pages project is `dbso-school-website`.

## Notes

Facts on the site come from the school's own published pages. Where the
school publishes no photo or figure, the site says so instead of filling
the gap.
