# Nicolás Muñoz — professional portfolio

A Spanish-language portfolio for [nicolasm.pro](https://nicolasm.pro/), built with React, TypeScript, and Vite. Production output is static HTML, CSS, and JavaScript; no application server or runtime API is required. CV facts and dates live in `src/App.tsx`.

## Start locally

**Prerequisites:** Node.js 22.12+ (or a supported newer LTS), npm, and Git. No environment variables, API keys, or external fonts are required.

1. Install the locked dependencies: `npm ci`.
2. Start development: `npm run dev`.
3. Open the local URL printed by Vite (normally `http://localhost:5173`).

The development server renders on the client. The production build prerenders the same React component so the complete portfolio remains readable and navigable with JavaScript disabled.

## Run checks

| Command | Purpose |
| --- | --- |
| `npm test -- --run` | Run component, navigation/accessibility-hook, metadata, and favicon tests once. |
| `npm test` | Watch component tests while editing. |
| `npm run e2e` | Build first, then run Chromium desktop/mobile browser checks. |
| `npm run build` | Type-check both TypeScript projects, replace `dist/`, bundle assets, and prerender `dist/index.html`. |
| `npm audit --omit=dev` / `npm audit` | Check production-only / all dependency advisories. |

### Install the test browser first

Playwright needs its own Chromium installation, not just a system Chrome browser. After `npm ci`, install it in the package-local location expected by the E2E script:

```sh
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install chromium
```

On Linux, browser system libraries must also be available. On a supported CI runner or machine where you can install OS packages, use:

```sh
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install --with-deps chromium
```

These are setup commands; they download a browser (and the second may require administrator access). Repeat the browser installation after upgrading Playwright. The inline environment syntax assumes a POSIX shell; on Windows use WSL or Git Bash.

The suite starts and stops its own Vite server at `http://127.0.0.1:4173`; leave that port free. It checks 1440×900 and 375×812 layouts, readable contrast, overflow, contact destinations, keyboard focus, native anchor navigation, normal/reduced motion, live motion preference changes, print styles, and built HTML with JavaScript disabled. Failure screenshots go to `test-results/`. Print checks use media emulation, not physical printer pagination.

## Preview production

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173`. Preview serves the prerendered `dist/` output, unlike the development server. Disable JavaScript to check the static fallback; use browser print preview to inspect the CV layout. Stop preview before running E2E tests on the same port.

## Deploy the static site

1. From a fresh checkout, run `npm ci` and `npm run build`.
2. Publish **only `dist/`** as the hosting provider's document root. Its root must serve `index.html`, with `/assets/` and `/favicon.svg` preserved.
3. Configure the provider's domain and HTTPS for `nicolasm.pro`. Redirect alternate hostnames to `https://nicolasm.pro/`.
4. Verify the live title, contact links, keyboard navigation, JavaScript-disabled content, and print preview.

A typical static host uses build command `npm run build` and publish directory `dist`. No Node.js process is needed after building, and no client-side routing rewrite is required. The app assumes deployment at the domain root, not a subdirectory. No deployment, DNS changes, or upload happens during a local build.

Each full `npm run build` replaces `dist/` using Vite's default output cleaning, so old hashed assets are removed before the new build. Do not store hand-authored files in `dist/`. The prerender cache lives in ignored `node_modules/.vite-prerender/`, outside the deployment directory. Publish all of the freshly built `dist/`.

Prefer revalidation/short caching for `index.html` and long-lived immutable caching for hashed `/assets/` files. Revalidate the favicon when changing its design.

## Content and accessibility

- Keep product copy in neutral, professional Spanish. Do not add claims, dates, metrics, or credentials without a verified source.
- Native anchors work without JavaScript; hydration adds an underlined current-location indicator without intercepting links or moving focus.
- Section arrival animates only a decorative border, once per section. Text is never hidden, faded, translated, or gated on an observer. Reduced-motion preferences disable effects, including when changed while the page is open.
- Print uses a compact, single-column CV layout with contact details, sensible break hints, and no navigation, decorative note, or action buttons.
- SEO, canonical, Open Graph, and Twitter summary metadata are in `index.html`. Social image/handle tags are intentionally absent: no verified social image asset or Twitter account is supplied. Platforms may choose not to show a visual card without an image.

## Project structure

| Path | Responsibility |
| --- | --- |
| `src/App.tsx`, `src/main.tsx` | Verified CV content, semantic sections, optional interaction, and hydration entry point. |
| `src/styles.css`, `public/favicon.svg` | Responsive/reduced-motion/print styles and authored `nm.` vector mark. |
| `src/App.test.tsx`, `src/test/` | Component/metadata tests, test setup, and build-time prerender helper. |
| `e2e/portfolio.spec.ts`, `playwright.config.ts` | Chromium browser coverage and desktop/mobile configuration. |
| `index.html`, `dist/`, `odd/tasks/` | Metadata template, deployable generated output, and project task records. |

There are no additional runtime dependencies for motion, icons, or prerendering. The build helper reuses the installed Vite and React server renderer; React content has one source of truth rather than a separately maintained no-JavaScript CV.
