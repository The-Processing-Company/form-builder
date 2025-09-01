## Remaining Work Plan

### 1) Field Wiring (HeadlessFieldApi)
- Advanced selects: multi-select, tags-input
- Masked inputs: password-input, phone-input
- Date/time: datetime-picker, smart-datetime-input, date-picker
- File upload: file-upload
- Complex: location-input, signature-input, credit-card
- Ensure options mapping works for multi-select (select/radio done)
- Initial value/reset handling for complex fields

Outcome: All UI primitives accept `field?: HeadlessFieldApi<T>` or are rendered via FieldRenderer with strong typing.

### 2) Store + Selection/Highlight Sync
- Move highlight lines into Zustand store so JSON tab reflects current selection without recomputation (done)
- JSON click → select field via store (done), ensure properties panel stays in sync (done)
- Selection elsewhere → JSON highlight updates via store-derived bounds (done)
- Harden block-boundary detection for inline braces and mixed arrays

Outcome: Bi-directional selection/highlight that never desyncs.
### 3) Type-based Properties Panel
- Introduce component-type-based properties panels (registry or switch) to configure per-type options
- For Select/Radio: static options editor (add/remove/reorder, label/value)
- Include a disabled "Use context as source" toggle with tooltip (coming soon)
- Persist options to schema/store and reflect immediately in JSON and preview

Outcome: Focused, type-specific configuration with static options now, context source later.

### 4) Form Context Inputs (Scaffold, disabled initially)
- Define typed form-level input parameters (schema + types) to act as data sources
- Add UI to configure these inputs at the form level (disabled wiring for now)
- Plan wiring so fields can later bind options to a context key

Outcome: Clear path to dynamic options via typed form inputs; gated until enabled.

### 5) MUI System Layout Adoption
 - Convert properties panel sections (headers, section containers) to MUI `Box/Stack` while preserving shadcn styles
 - Convert any remaining palette-like or list containers to MUI Stacks with `minHeight: 0` and `overflow`
 - Keep: page is non-scrollable; columns scroll independently

Outcome: Predictable height/scroll throughout without calc hacks.

### 6) Builder UX
 - DnD insertion preview line and exact index calculation over variable card heights
 - Keyboard navigation across components (up/down, enter to select)
 - Undo/redo: keep an in-memory history (Zustand store slice), expose shortcuts

Outcome: Smooth, robust editing.

### 7) Renderer/Validation
 - Required handling for all types (including boolean, arrays, files)
 - Basic format checks where trivial (email/phone if we support masks)
 - Error display parity (consistent label/description/error treatment)

Outcome: Minimal but consistent validation experience.

### 8) Code/Docs
 - Add a “Code” tab next to JSON with a live usage snippet for `<FormRenderer />`
 - Add README section describing the headless API and how to integrate custom fields

Outcome: Clear guidance for usage and extension.

### 9) Persistence/Schema
 - Export/import schema from JSON tab
 - Guard against invalid schema edits; show error state with reset to last valid

Outcome: Safer editing loop and portability.

### 10) Accessibility/QA
 - ARIA for errors and labels, focus outlines, keyboard reachability
 - Cross-browser sanity and mobile checks

Outcome: Solid baseline accessibility and QA.

---

## Milestone Sequence
1. Wire advanced fields (+ options mapping, initial/reset)
2. Centralize selection/highlight in store (done except boundary hardening)
3. MUI refactors for remaining panels
4. DnD preview + keyboard nav + undo/redo
5. Validation polish across types
6. Code tab + docs
7. Export/import + invalid-schema guard
8. Accessibility/QA pass

---

## Definition of Done
- All fields render via FieldRenderer, typed, with working required/disabled/error
- JSON/Design/Properties stay in sync via store
- Layout is fully scroll-contained inside the dashboard
- Minimal validation + error messaging across all types
- Code/JSON tabs show live, correct artifacts

