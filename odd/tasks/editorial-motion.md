# Editorial Motion

## Outcome
Add original, restrained motion and persistent navigation to the editorial portfolio without copying the reference site or compromising readability, accessibility, progressive enhancement, print, or performance.

## Direction
**Editorial cinético** — the portfolio keeps its warm paper/deep ink/blue identity while gaining:
- A full sticky header that remains available during scroll.
- A subtle paper-layer state (fine rule/shadow or tint) after leaving the top.
- Animated editorial rules and restrained section emphasis.
- Static, immediately readable text at all times.

## Constraints
- Do not copy `sijita.dev` composition, assets, copy, or distinctive implementation.
- Preserve every CV fact, link, section order, and existing mobile disclosure behavior.
- Preserve SSR/JavaScript-disabled reading and native hash navigation.
- Keep the full header sticky on desktop and mobile; avoid covering hash targets.
- Do not animate text position or make content depend on animation.
- Disable nonessential animation and transitions under `prefers-reduced-motion: reduce`, including live preference changes.
- Preserve keyboard access, visible focus, 44px targets, print output, and 320px minimum width.
- No push or production deployment without explicit authorization.

## Work Unit

### MOTION-001 — Add sticky editorial motion
- [x] Add component/browser checks for sticky positioning, scroll state, hash-target clearance, reduced motion, JavaScript-free behavior, print, and responsive overflow.
- [x] Implement a sticky full header with a restrained scrolled state.
- [x] Add original editorial-rule and section-accent motion without moving or hiding text.
- [x] Verify at 320, 375, 430, 480, 600, 850, and 1440px.
- [x] Run production build/prerender, focused tests, independent verification, and `git diff --check`.
- [ ] Create one local Conventional Commit after explicit authorization.

## Acceptance Criteria
1. The complete header remains visible while scrolling at all supported widths.
2. On narrow screens, `Menú` stays reachable; opening it exposes all seven links without overflow.
3. Scrolled styling is subtle and original, with no layout jump.
4. Hash navigation positions every target below the sticky header.
5. Decorative rules/accents animate only when motion is allowed; text remains stationary and opaque.
6. Reduced-motion mode has no nonessential animation or transition and responds to live preference changes.
7. Without JavaScript, all navigation and portfolio content remain visible and usable.
8. Print hides the site header and interactive/decorative motion as before.
9. Existing achievement disclosure, contacts, differentiator, metadata, and responsive behavior do not regress.

## Reference Findings
A read-only headless measurement of `www.sijita.dev` found sticky navigation, a fixed decorative layer, scroll-triggered animation activity, 34 transitioned elements, no horizontal overflow at 1440/390/320px, and zero active animations when reduced motion was requested. These are general interaction principles only; the implementation must remain visually and structurally original.

## Evidence
- Component suite: 36 tests passed across 3 files.
- Production build: TypeScript, Vite build, and prerender passed.
- Chromium desktop: 22 browser tests passed.
- Chromium mobile: 22 browser tests passed.
- Total: 80 passed, 0 failed, 0 skipped.
- Responsive behavior passed at 320, 375, 430, 480, 600, 850, and 1440px.
- Native hash clearance passed with and without JavaScript at 320, 480, 600, and 1440px.
- Sticky height stability, scrolled mobile menu, stationary/opaque text, decorative keyframes, live reduced motion, print suppression, and horizontal overflow checks passed.
- `git diff --check` passed.
- Independent verifier result: APPROVED within tested Chromium scope.
- Historical RED output is unavailable because the delegated writer failed before returning lifecycle evidence; no RED result is claimed.
- Not checked: non-Chromium engines, physical devices, or manual printed-page inspection.
- Commit evidence: pending explicit authorization.
