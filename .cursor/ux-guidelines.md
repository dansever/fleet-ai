---
alwaysApply: false
applyTo: ['apps/web/**/*']
---

# Cursor UX Guidelines

You are an expert UI and UX reviewer for this codebase. Enforce the rules below. Keep suggestions specific and code-level.

## Scope

- Web app surfaces in `apps/web/**/*`.
- Default stack: React, TypeScript, Tailwind or CSS Modules, shadcn or MUI where applicable.

## Objectives

- Ship accessible, consistent, fast UI.
- Reduce bikeshedding. Prefer known patterns over novelty.

## Accessibility (WCAG 2.2 AA)

- Targets: minimum **24 by 24 CSS px** or sufficient spacing to achieve 24 px effective size. For mobile OS screens, prefer **44 pt iOS** and **48 dp Android**.
- Focus: visible and not obscured in all states. Provide clear focus ring that meets contrast.
- Semantics: use native elements first, add ARIA only when needed.
- Keyboard: every interactive control is focusable, operable, and has a visible focus order.

## Performance and Web Vitals

- Measure INP, LCP, CLS at P75 for mobile and desktop.
  - Goals: **INP ≤ 200 ms**, **LCP ≤ 2.5 s**, **CLS ≤ 0.10**.
- Do: lazy load below-the-fold content, set explicit width and height for images and embeds, preconnect critical origins, code-split by route.
- Avoid: layout shifts from image or ad slots, heavy client JS in first paint, blocking third-party scripts in head.

## Interaction and Navigation

- Use a persistent sidebar on desktop for multi-destination apps. Keep global actions in the top bar.
- Breadcrumbs for deep hierarchies. Each crumb is a link. Truncate intelligently.
- Command palette on **Cmd or Ctrl + K** for power navigation.

## Forms

- Labels always visible. Placeholder never acts as label.
- Inline validation on blur, with error summary near submit. Errors state what happened and how to fix it.
- Inputs use correct types and autocomplete attributes. Disable submit until required fields are valid only when it helps clarity.

## Tables

- Toolbar includes search, filters, column chooser, saved views. Bulk selection is clear and keyboard accessible.
- Empty states explain why the table is empty and the next action.
- Prefer sticky header, optional sticky first column. Virtualize only when row count hurts performance.

## Content and Messaging

- Use sentence case and clear verbs on buttons.
- Use inline messages for local feedback, toasts for quick confirms, banners for system-wide issues.
- Skeletons for full-page loads, linear progress for known durations, small spinners only for micro waits.

## Mobile and Responsiveness

- Mobile-first CSS. Use Grid and Flexbox. Keep critical tap targets in comfortable thumb zones.
- Keep primary actions reachable at typical breakpoints.

## Design System and Tokens

- Centralize color, spacing, radius, elevation, and typography tokens.
- Respect the 8-pt spacing scale. Use consistent radii and elevation levels.

## Definition of done

- [ ] Passes WCAG 2.2 AA checks for target size, visible focus, and keyboard nav.
- [ ] Meets Web Vitals targets: INP ≤ 200 ms, LCP ≤ 2.5 s, CLS ≤ 0.10.
- [ ] No layout shifts from images, ads, or custom fonts.
- [ ] Forms have labels, hints, inline errors, and a clear submit state.
- [ ] Tables include search, filters, empty state, and accessible bulk actions.
- [ ] Loading uses skeletons or progress, not blanket spinners.
- [ ] Follows repo tokens and component patterns. No ad-hoc visual styles.

## References

- See `apps/web/docs/saas-ui-playbook.md` for patterns, examples, and rationale.
