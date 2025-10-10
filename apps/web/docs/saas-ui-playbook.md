# SaaS UI Playbook

**Practical design and implementation guide for clean, accessible, and consistent SaaS products**

**Audience:** Frontend engineers and AI code agents  
**Goal:** Enable fast, consistent, and high-quality UI implementation using proven SaaS patterns.

---

## 1. Core Principles

- **Clarity over cleverness:** Always favor predictable, recognizable patterns.
- **Hierarchy & rhythm:** Use visual hierarchy and spacing to guide the eye.
- **Accessibility is a requirement, not an enhancement.**
- **Performance equals UX:** Optimize perceived and actual speed.
- **Consistency scales:** One component per purpose, one style per role.

---

## 2. Layout & Structure

### Recommended structure

- Use a **two-column layout** for web apps:
  - **Sidebar (navigation)**: persistent, left-aligned
  - **Main content**: flexible and scrollable
- Keep page headers sticky with breadcrumb + primary action on the right.
- Use an **8pt spacing scale**: 4, 8, 12, 16, 24, 32, 40, 64.
- Follow a **responsive grid system**: 12 columns, with breakpoints:
  - `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px).

---

## 3. Navigation Patterns

| Use Case                            | Pattern                            | Notes                                        |
| ----------------------------------- | ---------------------------------- | -------------------------------------------- |
| Complex product with multiple tools | **Sidebar navigation**             | Persistent, collapsible, with icons + labels |
| Deep hierarchies                    | **Breadcrumbs**                    | Always clickable, truncate long paths        |
| Global search & shortcuts           | **Command palette (Cmd/Ctrl + K)** | Include navigation and actions               |
| Multi-step flows                    | **Stepper or tabs**                | Keep context and progress clear              |

**Do:** Keep active states visible, use consistent icon placement, and maintain keyboard access.

---

## 4. Page Header Pattern

- Left section: breadcrumb → title → optional description
- Right section: primary action → secondary actions
- Example:

```tsx
<header className="flex items-center justify-between mb-6">
  <div>
    <nav aria-label="Breadcrumb">...</nav>
    <h1 className="text-2xl font-semibold">Projects</h1>
  </div>
  <div className="flex gap-2">
    <Button variant="secondary">Export</Button>
    <Button variant="primary">New Project</Button>
  </div>
</header>
```

````

---

## 5. Tables

Tables are the backbone of most SaaS dashboards. Use:

- **Search + Filters + Sorting + Pagination** in a toolbar.
- **Empty states** that teach and prompt action.
- **Sticky header + optional sticky first column.**
- **Bulk selection** that’s accessible via keyboard and screen readers.

**Empty state example:**

```tsx
<div className="border rounded-xl p-8 text-center">
  <h3 className="text-lg font-medium">No data yet</h3>
  <p className="text-muted-foreground mt-2">Import or create your first record.</p>
  <Button className="mt-4">Add Record</Button>
</div>
```

---

## 6. Forms

- Always include **visible labels** above inputs.
- Provide **helper text** and inline **error messages**.
- Use **inline validation on blur** and summarize errors near the submit button.
- Keep actions sticky on scroll for long forms.

**Accessibility checklist:**

- All inputs have `id`, `label`, and `aria-describedby` when needed.
- Focus state visible with ≥ 3:1 contrast.
- Keyboard navigation works in logical order.

---

## 7. Feedback & Messaging

| Type           | Use                | Behavior                  |
| -------------- | ------------------ | ------------------------- |
| Inline message | Local context      | Persistent until resolved |
| Toast          | Quick confirmation | Auto-dismiss in 3–5s      |
| Banner         | System-wide info   | Top of page, dismissible  |
| Modal          | Critical decision  | Always escapable          |

**Best practices:**

- Never stack multiple toasts at once.
- Provide actionable text ("Retry", "Undo") when possible.
- Use skeletons or progress bars instead of indefinite spinners.

---

## 8. Loading States

- **Full-page content** → skeleton screen
- **Known duration** → linear progress bar
- **Short wait (<1s)** → small spinner
- Prefer **optimistic UI** where safe.

Example skeleton:

```tsx
<div className="space-y-3 animate-pulse">
  <div className="h-6 bg-muted rounded" />
  <div className="h-6 bg-muted rounded w-5/6" />
  <div className="h-6 bg-muted rounded w-4/6" />
</div>
```

---

## 9. Accessibility (WCAG 2.2 AA)

- **Target size:** min 24×24 CSS px, or spacing to achieve effective 24px target.
- **Focus:** visible, non-obscured, contrast ≥ 3:1.
- **Keyboard:** all actions reachable and operable without mouse.
- **Forms:** errors linked via `aria-describedby`.
- **Motion:** respect `prefers-reduced-motion`.

---

## 10. Performance & Core Web Vitals

| Metric | Target   | Notes                   |
| ------ | -------- | ----------------------- |
| INP    | ≤ 200 ms | Responsiveness          |
| LCP    | ≤ 2.5 s  | Largest visible element |
| CLS    | ≤ 0.10   | Avoid layout shifts     |

**Optimize for perceived speed:**

- Lazy load below-the-fold content.
- Use responsive `srcset` images.
- Preload key fonts and routes.
- Split JS bundles by route.

---

## 11. AI Feature UX (if applicable)

- **Set expectations:** clarify model scope and limitations.
- **Provide feedback tools:** thumbs up/down, “improve” or “regenerate.”
- **Show uncertainty:** display confidence levels or citations.
- **Explain actions:** “This suggestion is based on recent activity.”
- **Allow recovery:** always offer Undo or manual edit.

---

## 12. Design Tokens

Use design tokens for cross-platform consistency.

```json
{
  "color": {
    "primary": { "value": "#2563eb" },
    "background": { "value": "#ffffff" },
    "text": { "value": "#111827" }
  },
  "spacing": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" },
  "radii": { "sm": "6px", "md": "10px", "lg": "16px" }
}
```

Tokens map to Tailwind, CSS variables, or Figma styles depending on your stack.

---

## 13. Content & Microcopy

- Use **sentence case** for all text.
- Buttons use **action verbs**: “Save”, “Invite”, “Create Project”.
- Error messages: “We couldn’t save your changes. Try again.”
- Empty states: friendly but direct (“No reports yet. Create your first one.”).

---

## 14. Checklist for “Definition of Done”

- [ ] Meets **WCAG 2.2 AA** (target size, focus, keyboard nav).
- [ ] Meets **Core Web Vitals** targets.
- [ ] No layout shifts or blocking scripts.
- [ ] Clear labels, inline errors, and accessible forms.
- [ ] Responsive and mobile-first design verified.
- [ ] Uses consistent spacing, color, and token definitions.
- [ ] Loading states and error messages implemented.
- [ ] Follows playbook patterns for tables, headers, and navigation.

---

## 15. References

- [W3C WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [Google Web.dev: Core Web Vitals](https://web.dev/vitals/)
- [NNGroup: 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Material Design 3](https://m3.material.io/)
- [Atlassian Design System](https://atlassian.design/)
- [Shopify Polaris](https://polaris.shopify.com/)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [Google PAIR Guidebook](https://pair.withgoogle.com/guidebook/)

---

**Purpose:** Human-readable UI reference for engineers, designers, and AI agents.

```

```
````
