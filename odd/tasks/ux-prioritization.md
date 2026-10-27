# UX Prioritization Improvements

## Objective
Apply the two highest-impact findings from the Laws of UX audit without changing, removing, reordering, or inventing any CV fact.

## Decisions
- Show the first two achievements for each role by default after JavaScript enhancement.
- Keep every achievement available through an accessible per-role disclosure control.
- Render every achievement by default without JavaScript and in print.
- Add one visually isolated factual positioning statement derived entirely from existing portfolio copy.

## Constraints
- Preserve the exact text and order of all achievements.
- Preserve all five contact targets and existing metadata.
- Preserve semantic headings, native navigation, keyboard access, focus visibility, live reduced-motion handling, JavaScript-free reading, hydration, and A4 print output.
- Disclosure controls must expose accurate expanded state and have adequate touch targets.
- No analytics-based claims, metrics, availability statements, or new professional facts.

## Tasks

### UX-001 — Reduce career scan load
- [x] Add progressive enhancement that initially shows the first two achievements per role.
- [x] Add accessible per-role controls for revealing and hiding remaining achievements.
- [x] Keep all achievements visible without JavaScript and when printing.
- Verification: observed RED before implementation; 20 component tests and 30 Chromium checks passed; after hydration 8 of 13 achievements are visible; independent keyboard controls, accurate state, focus retention, exact content/order, JavaScript-disabled fallback, collapsed/mixed/expanded print states, responsive overflow, hydration, reduced motion, anchors, and A4 checks passed.
- Commit evidence: `5c20ec9` (`feat: reduce portfolio career scan load`).

### UX-002 — Isolate the professional differentiator
- [x] Add a single editorial statement using only existing facts: architecture and full-stack development for financial and e-commerce systems.
- [x] Give the statement a distinct but restrained visual treatment consistent with the current design system.
- [x] Verify that it improves visual prioritization without competing with the primary hero action.
- Verification: observed RED before implementation; 21 component tests and 34 Chromium checks passed; exact copy/source derivation, uniqueness, semantic order, non-interactivity, responsive geometry from 320 to 1440 px, contrast, keyboard flow, live reduced motion, JavaScript-disabled rendering, intentional print exclusion, build/prerender, hydration, and UX-001 regression coverage passed; both npm audits reported zero vulnerabilities.
- Commit evidence: `ecea592` (`feat: emphasize portfolio positioning`).

## Acceptance Criteria
1. After hydration, each role initially displays exactly its first two achievements.
2. Every hidden achievement can be revealed and hidden using keyboard-accessible controls with accurate state.
3. Without JavaScript and in print, all 13 achievements remain visible.
4. The differentiator introduces no new factual claim.
5. Component tests, production build, Chromium checks, audits, and diff checks pass.

## Review Workload
Expected scope is four existing implementation/test files plus this task document. Keep two cohesive local work-unit commits if authorized; push and deployment remain separate decisions.

## Native Review
- Candidate: committed range after `ff79b3108d5d22d772a21f09ab96de11e6bb6b5d`.
- Inspect resolved target `sha256:e05c3ee7adee449f002d4404fcb2797ac1ffac07cb46655679ebf874c4540bf8`.
- The first START attempt mistakenly used a tree hash and was rejected as `base-ref-unresolvable`.
- START with the correct full base commit failed with `identity-mismatch`.
- Both attempts reported `lineage_created: false` and `mutation_performed: false`; no recovery or authority mutation was attempted.
- Independent verification remains the available evidence.

## Next Step
Decide whether to push and deploy commits `5c20ec9` and `ecea592`, with the native review failure disclosed.
