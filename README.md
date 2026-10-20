# Richmond's Air — Homepage

Static HTML5 + Tailwind CSS v4 (CLI) + vanilla JS. No framework, no backend.

## Run
```bash
npm install
npm run dev        # Tailwind watch -> css/styles.css (open index.html via a local server)
npm run build      # production site -> dist/
npm run preview    # serve dist/ locally
```

`dist/` is the folder to deploy: `index.html`, `css/styles.css` (minified), `js/` and only the assets the page uses (37 files, about 4.6 MB, mostly the video).

## Before going live
1. **Web3Forms:** in `index.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` with the key from https://web3forms.com. Submissions go to the email address registered there.
2. Swap `assets/images/logo.png` for an SVG or high-resolution logo if one is available.
3. Update the absolute `og:image` / canonical URLs if the site is hosted somewhere else.

## Structure
`index.html` · `src/input.css` (tokens in `@theme`, components) · `scripts/build.js` (builds `dist/`) · `js/main.js` · `assets/{images,fonts,video,source}` · docs: `PROJECT_BRIEF.md`, `MARKET_RESEARCH.md`, `DESIGN_PROPOSAL.md`, `QA_REPORT.md`.

Nav links to inner pages point to the current richmondsair.com URLs until those pages are rebuilt.

## Attribution
- Fonts: Barlow and Barlow Condensed by Jeremy Tribby, SIL Open Font License (`assets/fonts/OFL-LICENSE.txt`), via @fontsource.
- Photos, video, logo, BBB mark and brand-logo strip: supplied by Richmond's Air or taken from richmondsair.com. Third-party marks (BBB, Trane, Carrier, American Standard) are used under the client's affiliations.
- Icons: hand-drawn inline SVG.
- Smooth scrolling: Lenis 1.3.27 by darkroom.engineering, MIT licence (`js/vendor/lenis.min.js`, `js/vendor/lenis-LICENSE.txt`).
