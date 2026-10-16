# getzapl.ie

The Zaplie website: one static page. Plain HTML and CSS, no framework, no JavaScript, no third-party requests (the fonts are self-hosted). It follows the layout of the Wardie site ([getward.ie](https://getward.ie)).

## Layout

| Path | What it is |
|---|---|
| `site.config.json` | **The one place for links and addresses**: the site URL, the sales and support email addresses, the repository and design links, and the copyright year. |
| `build.mjs` | A tiny build with no dependencies: copies `src/` to `dist/` and replaces each `{{placeholder}}` with the value from `site.config.json`. It fails if a placeholder is unknown. |
| `src/index.html` | The page. |
| `src/styles.css` | The styles: Zaplie's tokens (Bitcoin orange `#F7931A` on near-black `#0B0A09`), Playfair Display headings and Mulish body text. |
| `src/fonts/` | Mulish and Playfair Display (latin, WOFF2) from `@fontsource`, under the SIL Open Font Licence (licences alongside). |
| `src/img/` | Zaplie's images, the app mockups, the explainer video and the social preview (see below). |
| `src/CNAME` | `getzapl.ie`, for GitHub Pages. Harmless elsewhere. |

## Images

Zaplie's images come from his character kit in [knowall-ai/zaplie-bot](https://github.com/knowall-ai/zaplie-bot) (`assets/agent/`), exported to WebP for the web:

| File | From the kit | Used for |
|---|---|---|
| `zaplie-hero.webp`, `zaplie-hero-960.webp` | `images/zaplie-hero.jpg` | The hero (1920 px wide; 960 px on phones) |
| `zaplie-zapping.webp`, `zaplie-gift.webp`, `zaplie-celebrate.webp` | `images/` | How it works, steps 1 to 3 |
| `zaplie-wave.webp` | `images/zaplie-wave.jpg` | For organisations |
| `zaplie-electrified-subtle.webp` | `images/zaplie-electrified-subtle.jpg` | The closing call to action |
| `zaplie-profile.webp`, `apple-touch-icon.png` | `images/zaplie-profile.jpg` | The header logo and the home-screen icon |
| `zaplie-explainer.mp4`, `zaplie-explainer-poster.webp` | `video/zaplie-explainer.mp4` | Meet Zaplie (re-encoded at CRF 26 to 3 MB; the poster is the frame at 4 s) |
| `social-preview.png` | `CoverImage-SocialPreview.png` | Link previews (Open Graph and Twitter) |
| `screen-*.webp` | `docs/design/*.png` | See it: the Teams mockups |

To refresh an image, export it again at the same size and name.

## Preview locally

```bash
node website/build.mjs
python3 -m http.server 8080 --directory website/dist
# open http://localhost:8080/
```

Any static file server works. Rebuild after each change to `src/` or `site.config.json`.

## Deploy

The site is the contents of `website/dist/` after `node website/build.mjs`, so any static host works: GitHub Pages (`src/CNAME` is already set) or Azure Static Web Apps. There's no deploy workflow yet.

The domain `getzapl.ie` is registered with Gandi and currently shows Gandi's placeholder page. Point its DNS at the host you choose, then turn on HTTPS there.
