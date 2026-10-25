# Professional Portfolio

## Objective
Build a polished, responsive portfolio website for Nicolás Andrés Muñoz Coronado that presents his profile, experience, education, certifications, technical skills, and contact channels to recruiters and hiring teams.

## Problem
The current CV contains strong technical experience but has no dedicated web presentation that communicates seniority, architecture experience, and professional identity through a memorable visual experience.

## Why
A focused portfolio provides a shareable professional presence at `nicolasm.pro`, supports CV applications, and makes Nicolás's impact and technical range easier to scan.

## Scope
- Create a new static portfolio application from an empty repository.
- Use a premium minimalist visual direction with light surfaces, dark navy typography, and restrained blue accents.
- Present all supplied CV content in Spanish.
- Provide responsive desktop and mobile layouts.
- Add tasteful interaction and motion without reducing accessibility.
- Include direct email, phone, LinkedIn, GitHub, and website links.
- Add project documentation and deployment-ready build output.

## Constraints
- Preserve factual claims and dates from the supplied CV.
- Do not invent metrics, clients, projects, testimonials, or certifications.
- Keep dependencies and hosting requirements lightweight.
- Respect reduced-motion preferences and keyboard navigation.
- Generated technical artifacts use English; portfolio copy remains Spanish because the user supplied and requested Spanish-facing content.
- Delivery strategy: `single-pr`, explicitly selected by the user after the oversized-delivery warning; one whole-feature PR is planned, with no push or PR creation authorized yet.
- Forecast: approximately 900–1,300 authored changed lines, excluding generated lockfiles. This exceeds the 400-line review heuristic because a complete new portfolio requires layout, content, responsive styling, interaction, tests, and documentation; work remains split into cohesive work-unit commits.

## Tasks

### PORT-001 — Establish the portfolio foundation
- [x] Scaffold a lightweight web application and test setup.
- [x] Define semantic page structure, design tokens, typography, and responsive shell.
- [x] Add the hero, professional summary, and contact actions using supplied data.
- Route: delegated (`gentle-ai-worker`) because the task requires multiple non-trivial files.
- Checks: focused component tests, production build, and accessibility-oriented structural assertions.
- Commit evidence: `cb8e790` (`feat: establish portfolio foundation`).
- RDD assessment: unavailable because the repository has no pre-existing `main` commit/tree; writer self-verification and independent verification completed instead.

### PORT-002 — Present career and technical expertise
- [x] Add the complete experience timeline with roles, dates, locations, and supplied achievements.
- [x] Add technical skills grouped by domain.
- [x] Add education and certifications.
- Route: delegated (`gentle-ai-worker`) because the task requires multi-file implementation and content styling.
- Checks: content tests, responsive structural inspection, and production build.
- Commit evidence: `86de484` (`feat: present career and technical expertise`).
- RDD assessment: medium risk, `reviewDue: false` (`under_budget`); writer self-verification stands for the large writer profile.

### PORT-003 — Polish interaction, metadata, and documentation
- [x] Add subtle reveal/navigation interactions with reduced-motion support.
- [x] Add SEO/social metadata, favicon treatment, and printable behavior.
- [x] Document local development and deployment.
- [x] Complete functional responsive verification.
- Route: delegated (`gentle-ai-worker`) because behavior, metadata, tests, and documentation span multiple files.
- Checks: 15 component/metadata tests, 18 Chromium checks at desktop/mobile widths, production build, clean deployment inventory, dependency audits, and independent verification.
- Commit evidence: `f865277` (`feat: polish portfolio delivery`).

## Acceptance Criteria
1. A recruiter can understand Nicolás's current role, specialization, and experience within the first screen.
2. Every supplied role, education item, certification, skill group, and contact channel is present without invented claims.
3. The site works at common mobile and desktop widths with no horizontal overflow.
4. Primary navigation and contact links are keyboard accessible and use valid destinations.
5. Motion is subtle and disabled or reduced when the operating system requests reduced motion.
6. The application installs, tests, and builds from documented commands.

## Progress
- Repository isolated and initialized at `/workspace/nicolasm` on branch `main` with user authorization.
- Visual direction selected: premium minimalist.
- Task plan created before the first source-code write.
- Work resumed from a fresh Pi session with the repository identity correctly bound to `/workspace/nicolasm`.
- PORT-001, PORT-002, and PORT-003 are complete, independently verified, and committed locally.
- The user supplied the complete two-page CV text and verified contact identifiers in chat; factual content is now available for implementation.
- The first PORT-001 writer stopped before edits because generated dependency/build directories were outside its edit surface.
- The user explicitly authorized `node_modules/**` and `dist/**` as generated-output surfaces only.

## Verification Evidence
- Confirmed `/workspace/nicolasm` is an independent Git repository on `main` with no source implementation yet.
- Reconciled the local task document with Engram observation 529.
- First writer attempt changed no files and ran no checks; it correctly requested authorization for `node_modules/**` and `dist/**`.
- PORT-001 writer observed RED with four failing structural/component tests against an empty app, then GREEN with all four passing after implementation.
- `npm run build` passed with TypeScript checks and Vite production compilation.
- Independent verification confirmed all supplied profile facts and five contact destinations, with no PORT-002 content added prematurely.
- `npm audit --omit=dev` passed with zero production vulnerabilities; full `npm audit` found one moderate and two critical development-tool vulnerabilities through Vitest 3.2.7.
- Playwright 1.64.1 verified eight Chromium checks across 1440×900 and 375×812 viewports, including overflow, readable content, internal navigation, exact contact destinations, skip-link focus transfer, and keyboard focus visibility.
- Vitest 4.1.12 passes all four component tests; `npm audit` and `npm audit --omit=dev` both report zero vulnerabilities.
- PORT-001 was committed on `feat/professional-portfolio` as `cb8e790` (`feat: establish portfolio foundation`).
- The user selected one single PR for the whole feature after being shown the reviewer-load and rollback tradeoffs.
- Native RDD assessment was unavailable because this root commit has no pre-existing `main` tree; independent verification remains the evidence of record.
- PORT-002 adds all four CV roles and 13 achievements, five skill groups with all 41 supplied skills, both education entries, and the supplied Scrum/Platzi details.
- Parent review restored the exact domain term “administración de rentas” and the CI/CD and JWT/OAuth2 purposes; regression tests now preserve both facts.
- PORT-002 verification passed 8 component tests, 8 Chromium checks across desktop/mobile, the production build, and `git diff --check`; warning-level LSP diagnostics reported no findings, with two silent-on-clean files unconfirmed.
- Native RDD assessment classified PORT-002 as medium risk with `reviewDue: false` because the candidate is under budget; the large writer's self-verification stands.
- PORT-002 was committed on `feat/professional-portfolio` as `86de484` (`feat: present career and technical expertise`); the committed range from `cb8e790` was reassessed as medium risk with 374 changed lines and `reviewDue: false`.
- PORT-003 adds progressive enhancement with native-anchor navigation, decorative-only reveal behavior, live reduced-motion handling, truthful SEO/social metadata, an authored SVG favicon, single-column print styling, prerendered no-JavaScript content, and complete English development/deployment documentation.
- Initial independent verification found that `vite build --emptyOutDir false` retained stale deployable assets; the build now restores Vite's default output cleaning and keeps prerender cache in ignored `node_modules/.vite-prerender`.
- Final independent verification approved PORT-003: 15 component/metadata tests, 18 Chromium checks, production build, both audits, and `git diff --check` pass. Standalone and E2E builds each leave exactly four publishable files in `dist/`, with no stale assets or `dist/.vite` cache.
- Native RDD inspection remains unavailable with `native-inspect-input-invalid` / `committed-only-invalid`; no review lineage was created.

- PORT-003 was committed locally as `f865277` (`feat: polish portfolio delivery`).

## Next Step
Decide whether to publish the feature branch and create the planned single pull request; neither action has been performed.
