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

## Run the production container

Docker builds with `node:22-alpine` using `npm ci` and `npm run build`, then copies only `dist/` into `nginxinc/nginx-unprivileged:1.28.2-alpine`. The runtime has no Node process or source tree, runs as UID/GID `101:101`, and listens on unprivileged port **8080**. Image tags are explicit (nginx uses the stable 1.28 release line), but not digest-locked; rebuilding later can include base-image updates.

1. Build from the repository root:
   ```sh
   docker build -t nicolasm-portfolio:verify .
   ```
2. Start on loopback for local verification:
   ```sh
   docker run --rm -d --name nicolasm-portfolio-verify -p 127.0.0.1:18080:8080 nicolasm-portfolio:verify
   ```
3. Verify health, headers, and prerendered content:
   ```sh
   curl -fsS http://127.0.0.1:18080/health
   curl -fsSI http://127.0.0.1:18080/
   curl -fsS http://127.0.0.1:18080/ | grep -F 'Nicolás Andrés'
   docker inspect --format '{{.State.Health.Status}}' nicolasm-portfolio-verify
   ```
   Health returns `ok`; Docker reports `healthy` after its first scheduled check (up to 30 seconds). The image checks `/health` every 30 seconds. Health validates nginx responsiveness; the content check separately validates the build.
4. Stop the test container, including after any failed check:
   ```sh
   docker stop nicolasm-portfolio-verify
   ```

`nginx.conf` serves SVG with the standard `image/svg+xml` MIME type, revalidates HTML and the favicon (`Cache-Control: no-cache`), and caches existing Vite-hashed `/assets/` files for one year with `immutable` on 200/206/304 responses only. Extensionless paths fall back to `index.html`; missing assets and file-like paths return 404 instead of portfolio HTML, with `no-cache` even when the filename looks hashed. Baseline headers disable MIME sniffing and framing, limit referrer disclosure, and suppress the nginx version. HTTPS termination belongs to the deployment proxy.

### Deploy with Dokploy / Docker Swarm

| Setting | Value |
| --- | --- |
| Source | This public Git repository, branch `feat/professional-portfolio` (publish the deployment commit before deploying). |
| Build type | **Dockerfile**, path `Dockerfile`, build/context directory repository root (`.`); no separate publish directory or build command. |
| Runtime | Container port **8080** over HTTP; use Dokploy's proxy/service networking, not the local `18080` host binding. No environment variables, persistent volumes, or privileged mode required. |
| Health | Image `HEALTHCHECK` calls `http://127.0.0.1:8080/health`; use `/health` on port 8080 for any additional Dokploy health check. |
| Domain | Verify the service first with a temporary Dokploy route or direct service check, then attach `nicolasm.pro` to port 8080, path `/`, with HTTPS enabled. |

Keep the current Railway destination until the Dokploy container is healthy **and** its route serves the expected `Nicolás Andrés` content, favicon, assets, and headers. Only then change the domain/DNS destination, verify public HTTPS and portfolio behavior, and retire the fallback. Domain and DNS mutations are separate from this local build; the Dockerfile does not perform them. Avoid publishing port 8080 directly on the VPS when Dokploy's proxy already routes to it.

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
| `src/App.test.tsx`, `src/test/` | Component/metadata/deployment tests, test setup, and build-time prerender helper. |
| `Dockerfile`, `.dockerignore`, `nginx.conf` | Production build, filtered build context, and unprivileged static server configuration. |
| `e2e/portfolio.spec.ts`, `playwright.config.ts` | Chromium browser coverage and desktop/mobile configuration. |
| `index.html`, `dist/`, `odd/tasks/` | Metadata template, deployable generated output, and project task records. |

There are no additional runtime dependencies for motion, icons, or prerendering. The build helper reuses the installed Vite and React server renderer; React content has one source of truth rather than a separately maintained no-JavaScript CV.
