# Editorial Portfolio Redesign

## Objective
Transform the existing professional portfolio into a distinctive editorial-technology experience while preserving every CV fact, contact target, accessibility behavior, reduced-motion preference, and print capability.

## Direction
- Strong typographic hierarchy with a publication-like rhythm.
- Asymmetric compositions anchored by precise rules and restrained blue accents.
- Experience as the central narrative.
- Premium visual detail without decorative noise or invented claims.
- Responsive behavior that remains deliberate from desktop to narrow mobile.

## Constraints
- Do not change, normalize, or invent CV facts.
- Preserve native anchors, skip navigation, focus visibility, semantic landmarks, and keyboard access.
- Preserve live reduced-motion handling and JavaScript-free readable content.
- Preserve useful A4 print output.
- Keep generated outputs out of authored commits.
- Keep the existing uncommitted deployment evidence update separate.

## Tasks

### DESIGN-001 — Establish the editorial identity
- [x] Strengthen the hero, navigation, typography, palette, spacing, and compositional grid.
- [x] Add only factual editorial markers derived from existing portfolio content.
- [x] Preserve semantic structure, focus behavior, and native navigation.
- Verification: 12 focused component tests and 20 Chromium checks passed; production build and prerender completed; responsive, keyboard, reduced-motion, print, and JavaScript-disabled assertions passed; `git diff --check` passed.
- Commit evidence: `70414ee` (`feat: establish editorial portfolio identity`).

### DESIGN-002 — Reframe career and expertise
- [x] Make professional experience the central visual narrative.
- [x] Improve scanability of roles, dates, locations, achievements, and skill groups.
- [x] Give profile, education, and certifications distinct editorial rhythms without altering content.
- Verification: 14 component tests and 22 Chromium checks passed; production build and prerender completed; exact Spanish CV and contact content remained unchanged; responsive checks passed at 1440, 1000, 850, 600, 375, and 320 px; keyboard, reduced-motion, print, JavaScript-disabled, and diff checks passed.
- Commit evidence: `08be169` (`feat: reframe portfolio career narrative`).

### DESIGN-003 — Polish responsive delivery
- [x] Refine contact, footer, micro-interactions, and narrow-screen navigation.
- [x] Confirm reduced-motion, keyboard focus, JavaScript-disabled reading, and print output.
- [x] Run the complete component, metadata, production-build, audit, and Chromium verification suite.
- Verification: 17 component tests and 26 Chromium checks passed; TypeScript, production build, prerender, hydration, exact contact targets, keyboard navigation, live reduced-motion changes, responsive checks from 320 to 1440 px, A4 print dimensions, JavaScript-disabled reading, and `git diff --check` passed; production and full npm audits reported zero vulnerabilities.
- Commit evidence: `656df85` (`feat: polish responsive portfolio delivery`).

## Acceptance Criteria
1. The result has a cohesive editorial-technology identity rather than repeated generic two-column sections.
2. Every supplied CV fact and all five contact targets remain exact.
3. Desktop and mobile layouts have no unintended overflow and retain clear hierarchy.
4. Keyboard, reduced-motion, JavaScript-disabled, and print behavior remain functional.
5. Tests, production build, dependency audits, and browser verification pass.

## Review Workload
A complete visual redesign will likely exceed 400 changed lines across markup, styles, and browser assertions. The user previously selected single-PR delivery for this portfolio; preserve cohesive work-unit commits and report the final review size explicitly.

## Native Review
- Candidate: committed range after `5627a1cd07faf3f21df2903d487c82b1f0f371e0`.
- Inspect resolved target `sha256:b1c0a7dad8a0e68fbfecd859ff8e0d710d2c58ad6ae7cd3eda7526023af516ea`.
- Start did not create a lineage: native operation returned `identity-mismatch` with `mutation_performed: false`.
- Independent verification remains the available evidence; no recovery or authority mutation was attempted.

## Next Step
Decide whether to push the local redesign commits and deploy them to Dokploy, with the native review failure disclosed.
