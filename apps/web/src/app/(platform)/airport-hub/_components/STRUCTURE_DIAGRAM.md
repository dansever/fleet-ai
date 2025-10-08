# Airport Hub - Visual Structure Diagram

## Page Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AIRPORT HUB                                      │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │
│  │   Service      │  │   Contacts &   │  │    Manage      │          │
│  │  Agreements    │  │   Providers    │  │    Airport     │          │
│  └────────────────┘  └────────────────┘  └────────────────┘          │
│         ↓                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    SERVICE AGREEMENTS PAGE                       │  │
│  │                                                                  │  │
│  │  ┌───────────────┐  ┌──────────────────────────────────────┐  │  │
│  │  │   CONTRACT    │  │         SELECTED CONTRACT            │  │  │
│  │  │   SIDEBAR     │  │                                      │  │  │
│  │  │               │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │  │  │
│  │  │ - Contract 1  │  │  │Over-│ │Files│ │Invoi│ │Finan│  │  │  │
│  │  │ - Contract 2  │  │  │view │ │     │ │ces  │ │cials│  │  │  │
│  │  │ - Contract 3  │  │  └─────┘ └─────┘ └─────┘ └─────┘  │  │  │
│  │  │               │  │     ↓        ↓                      │  │  │
│  │  └───────────────┘  └──────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Overview Tab - Contract Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OVERVIEW TAB                                     │
│                    (Contract-Level Actions)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ℹ️  CONTRACT MANAGEMENT                                 [BLUE]   │  │
│  │  This page manages the entire contract. To manage individual     │  │
│  │  documents, navigate to the Files tab.                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Contract Title: Ground Handling Services                        │  │
│  │  [Fuel Services] [Active]                                        │  │
│  │                                                                   │  │
│  │                                       ┌──────────────────────┐   │  │
│  │                                       │  👁️  View Contract   │   │  │
│  │                                       └──────────────────────┘   │  │
│  │                                       ─────────────────────────  │  │
│  │                                       ⚠️  Danger Zone            │  │
│  │                                       ┌──────────────────────┐   │  │
│  │                                       │ 🗑️  Delete Contract  │   │  │
│  │                                       │     (RED BUTTON)     │   │  │
│  │                                       └──────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────┐  ┌─────────────────────────┐             │
│  │  📅 Contract Period     │  │  🏢 Vendor Information  │             │
│  │  From: 2024-01-01       │  │  Company: Acme Corp     │             │
│  │  To: 2025-12-31         │  │  Contact: John Doe      │             │
│  │  Progress: 50%          │  │  Email: john@acme.com   │             │
│  └─────────────────────────┘  └─────────────────────────┘             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Files Tab - Document Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FILES TAB                                        │
│                    (Document-Level Actions)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ⚠️  DOCUMENT MANAGEMENT                            [AMBER]       │  │
│  │  This page manages individual documents within the contract.     │  │
│  │  To manage the contract itself, navigate to the Overview tab.   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────┐  ┌────────────────────────────────────────────────┐  │
│  │   FILES      │  │         SELECTED DOCUMENT                      │  │
│  │              │  │                                                │  │
│  │ 📄 Contract  │  │  📄 Contract_Signed_2024.pdf                  │  │
│  │    Signed    │  │  [PDF] [Processed]                            │  │
│  │              │  │                                                │  │
│  │ 📄 Appendix  │  │                    ┌──────────────────────┐   │  │
│  │    A         │  │                    │ ⬇️  Download         │   │  │
│  │              │  │                    └──────────────────────┘   │  │
│  │ 📄 Rates     │  │                    ┌──────────────────────┐   │  │
│  │    Schedule  │  │                    │ 🗑️  Delete File      │   │  │
│  │              │  │                    │   (GRAY BUTTON)      │   │  │
│  │ [+ Upload]   │  │                    └──────────────────────┘   │  │
│  │              │  │                                                │  │
│  │              │  │  ┌────────────────────────────────────────┐   │  │
│  │              │  │  │ 📝 Summary | 📊 Extracted | 📄 Content │   │  │
│  │              │  │  └────────────────────────────────────────┘   │  │
│  │              │  │                                                │  │
│  └──────────────┘  └────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
airport-hub/
├── ClientPage.tsx
│   └── MainContentSection
│       └── Tabs (Service Agreements, Contacts & Providers, Manage Airport)
│           └── ServiceAgreements.tsx
│               ├── ContractSidebar (LEFT)
│               │   └── contract/ContractSidebar.tsx
│               │       - Lists all contracts
│               │       - Add new contract button
│               │       - Select contract action
│               │
│               └── Tabs (RIGHT)
│                   ├── Overview Tab
│                   │   └── contract/ContractOverview.tsx
│                   │       ├── [BLUE INFO BANNER]
│                   │       ├── Contract details
│                   │       ├── Safe actions (View, Edit)
│                   │       └── [DANGER ZONE] Delete Contract 🔴
│                   │
│                   └── Files Tab
│                       └── documents/ContractDocuments.tsx
│                           ├── [AMBER WARNING BANNER]
│                           ├── Document list sidebar
│                           ├── Document viewer
│                           └── Document actions (Download, Delete File)
```

## Action Scope Comparison

### Contract-Level Actions (Overview Tab)

| Action              | Scope                              | Visual Cue          | Button Intent |
| ------------------- | ---------------------------------- | ------------------- | ------------- |
| View Contract       | Whole contract                     | Blue banner         | Secondary     |
| Edit Contract       | Whole contract                     | Blue banner         | Secondary     |
| **Delete Contract** | **Whole contract + ALL documents** | **Red danger zone** | **Danger**    |

### Document-Level Actions (Files Tab)

| Action            | Scope                | Visual Cue       | Button Intent |
| ----------------- | -------------------- | ---------------- | ------------- |
| Upload Document   | Single file          | Amber banner     | Add           |
| Download Document | Single file          | Amber banner     | Secondary     |
| **Delete File**   | **Single file only** | **Amber banner** | **Secondary** |

## Color Coding System

```
🔵 BLUE = Information (Contract-level context)
   ├── "This manages the entire contract"
   └── Points user to Files tab for documents

🟡 AMBER = Warning (Document-level context)
   ├── "This manages individual documents"
   └── Points user to Overview tab for contract

🔴 RED = Danger (Destructive action)
   ├── Used ONLY for contract deletion
   ├── Separated in "Danger Zone"
   └── Extra confirmation required

⚪ GRAY = Standard action (Non-destructive)
   └── Used for file operations
```

## User Flow Examples

### Scenario 1: Delete a specific document

```
1. Click "Files" tab
2. See AMBER banner: "manages individual documents"
3. Select document from sidebar
4. Click gray "Delete File" button
5. Confirm: "Delete only this file, not the contract"
6. ✅ Document deleted, contract intact
```

### Scenario 2: Delete entire contract

```
1. Stay on "Overview" tab (or navigate there)
2. See BLUE banner: "manages the entire contract"
3. Scroll to "Danger Zone" section
4. Click RED "Delete Contract" button
5. Confirm: "Delete contract AND all documents"
6. ⚠️ Contract and ALL documents deleted permanently
```

## Key Improvements Visualization

### Before: Confusing

```
Overview Tab                    Files Tab
┌──────────────────┐           ┌──────────────────┐
│ [Delete] ←─┐     │           │ [Delete] ←─┐     │
└─────────────│─────┘           └─────────────│─────┘
              │                               │
    BOTH BUTTONS LOOK THE SAME! 😕
    User doesn't know what gets deleted
```

### After: Clear

```
Overview Tab                    Files Tab
┌──────────────────────┐       ┌──────────────────────┐
│ 🔵 INFO BANNER       │       │ 🟡 WARNING BANNER    │
│ ─────────────────    │       │                      │
│ ⚠️ Danger Zone       │       │ [Delete File] ←─┐   │
│ [Delete Contract]←─┐ │       └─────────────────│───┘
└────────────────────│─┘                         │
                     │                            │
            RED, SEPARATED              GRAY, LABELED
            Deletes everything          Deletes one file
            🎯 CLEAR! 😊                🎯 CLEAR! 😊
```

## Summary

✅ **Clear Visual Hierarchy**

- Colored banners provide instant context
- Danger zones separate risky actions
- Consistent button styling by severity

✅ **Explicit Labeling**

- "Delete Contract" vs "Delete File"
- No ambiguity about scope

✅ **Logical Organization**

- Contract actions in contract/ directory
- Document actions in documents/ directory
- Easy to find and maintain

✅ **Safe by Default**

- Destructive actions clearly marked
- Enhanced confirmations
- Hard to delete by accident
