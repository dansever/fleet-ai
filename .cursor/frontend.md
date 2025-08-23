---
alwaysApply: false
applyTo: ['apps/web/**/*']
---

# Folder Structure

apps/(platform) - stores the pages for the core product
each directory in (platform) should be structured as so:
|-- apps
| |-- (platform))
| | |-- example-directory
| | | |-- page.tsx
| | | |-- ClientPage.tsx
| | | |-- ContextPage.tsx
| | | |-- \_components
| | | | |-- ReactComponentA.tsx
| | | | |-- ReactComponentB.tsx
| | | |-- \_subpages
| | | | |-- SubPageA.tsx
| | | | |-- SubPageB.tsx
| | | |-- utils
| | | |-- hooks

# UX

- ShadcnUI component as core UI elemenets
- Storybook as our UI library for complex, resuable app components
