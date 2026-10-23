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
- Delivery strategy: `ask-on-risk`.
- Forecast: approximately 900–1,300 authored changed lines, excluding generated lockfiles. This exceeds the 400-line review heuristic because a complete new portfolio requires layout, content, responsive styling, interaction, tests, and documentation; work remains split into cohesive work-unit commits.

## Tasks

### PORT-001 — Establish the portfolio foundation
- [ ] Scaffold a lightweight web application and test setup.
- [ ] Define semantic page structure, design tokens, typography, and responsive shell.
- [ ] Add the hero, professional summary, and contact actions using supplied data.
- Route: delegated (`gentle-ai-worker`) because the task requires multiple non-trivial files.
- Checks: focused component tests, production build, and accessibility-oriented structural assertions.
- Commit evidence: pending.

### PORT-002 — Present career and technical expertise
- [ ] Add the complete experience timeline with roles, dates, locations, and supplied achievements.
- [ ] Add technical skills grouped by domain.
- [ ] Add education and certifications.
- Route: delegated (`gentle-ai-worker`) because the task requires multi-file implementation and content styling.
- Checks: content tests, responsive structural inspection, and production build.
- Commit evidence: pending.

### PORT-003 — Polish interaction, metadata, and documentation
- [ ] Add subtle reveal/navigation interactions with reduced-motion support.
- [ ] Add SEO/social metadata, favicon treatment, and printable behavior.
- [ ] Document local development and deployment.
- [ ] Complete functional responsive verification.
- Route: delegated (`gentle-ai-worker`) because behavior, metadata, tests, and documentation span multiple files.
- Checks: tests, lint/type diagnostics where available, production build, and browser verification at desktop/mobile widths.
- Commit evidence: pending.

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
- PORT-001 is in progress.
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
- Vite starts successfully, but desktop/mobile and keyboard behavior remain pending until Playwright headless verification is added.

## Next Step
Add Playwright headless functional coverage for 375px and 1440px viewports, keyboard navigation, skip-link focus, link destinations, and horizontal overflow; upgrade test tooling without forced breaking remediation, then re-run the full checks.
