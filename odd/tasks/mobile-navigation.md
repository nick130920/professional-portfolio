# Responsive Mobile Navigation

## Objective
Replace the visually dominant two-column navigation at 320–480px with a compact, accessible mobile disclosure while preserving every destination and the existing desktop editorial header.

## Decision
- Use a native `button` labelled “Menú” at narrow widths.
- Enhance progressively: all navigation links remain visible without JavaScript; after hydration, the mobile menu starts collapsed.
- Keep the desktop and tablet navigation visible and unchanged above the mobile breakpoint.

## Constraints
- Preserve all seven exact Spanish labels and native hash anchors.
- Preserve `aria-current="location"`, skip navigation, focus visibility, and 44px minimum targets.
- The toggle must expose accurate `aria-expanded` and `aria-controls` state.
- Opening and closing must work with keyboard and pointer input.
- A selected link may close the narrow menu without intercepting native navigation.
- Live viewport changes across the mobile breakpoint must not strand links in a hidden or stale state.
- Respect reduced motion and keep the header hidden in print.
- Preserve JavaScript-disabled reading and navigation.

## Tasks

### NAV-001 — Implement the responsive disclosure
- [x] Add hydration-safe mobile navigation state and semantic toggle control.
- [x] Replace the narrow two-column grid with a compact disclosed list.
- [x] Preserve desktop behavior, active-section indication, native anchors, and no-JavaScript visibility.
- [x] Verify 320, 375, 430, 480, 600, 850, and 1440px behavior, keyboard/focus, touch targets, hydration, reduced motion, print, and horizontal overflow.
- Verification: observed RED with 3 expected failures before implementation; 25 component tests and 38 Chromium checks passed; production build/prerender passed; independent verification approved SSR and JavaScript-disabled visibility, hydration, Enter/Space/pointer operation, accurate ARIA state, focus recovery, seven native destinations, 44px targets, 480↔481px live resizing, desktop preservation, reduced motion, print, contacts, disclosure, differentiator, and overflow regression coverage.
- Commit evidence: local work-unit commit `fix: make mobile navigation responsive` (current branch HEAD).

## Acceptance Criteria
1. At 320–480px after hydration, the header shows a compact “Menú” button and the seven links start collapsed.
2. The button opens and closes the list with accurate accessible state and retained visible focus.
3. Selecting a destination preserves native hash navigation and updates `aria-current`.
4. Without JavaScript, all seven links remain visible and usable.
5. At widths above 480px, navigation remains visible and the toggle is absent or non-disruptive.
6. No tested viewport has horizontal overflow; every mobile navigation target is at least 44px high.

## Review Workload
Expected scope is the four existing app/style/test files plus this task document. One local work-unit commit is appropriate; push and deployment remain separate decisions.

## Next Step
Decide whether to push and deploy the verified mobile navigation fix.
