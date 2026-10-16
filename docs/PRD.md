Build a polished notes application using **React and TypeScript**, inspired by the layout and familiar workflows of macOS Notes. Use the attached screenshot as the visual reference. Create an original product name and visual identity; do not use Apple logos or imply that this is an official Apple product.

The app should work as a responsive web application first. Structure the code so the core notes and folders data model can later be reused with a mobile app wrapper such as Capacitor and exposed through a future MCP server. Do not build the MCP server now.

## Technical approach

- Use React, TypeScript, and the project’s existing setup. If there is no setup, use Vite.
- Use the existing styling conventions. If starting fresh, use CSS Modules or another maintainable styling approach.
- You may use Material UI or another component library, but customize its appearance to match the reference rather than leaving default component styles.
- Use a consistent icon library such as Lucide. Give every icon-only button an accessible name and tooltip.
- Persist notes, folders, and preferences in browser storage so they remain after refresh. Keep persistence behind a small storage/data-service layer so it can later be replaced by a server API.
- Do not require a backend or external account to run the app.
- Include a README with setup and run instructions.

## Visual design

Create a dark, desktop-first workspace inspired by the screenshot:

- A macOS-style window frame with rounded corners, subtle border, and red, yellow, and green window dots as visual controls.
- Three panes: folder sidebar on the left, note list in the middle, and note editor on the right.
- A toolbar across the top of the note list and editor.
- Charcoal sidebar and note list; near-black editor; soft white primary text; muted gray secondary text and icons; restrained yellow accents for selected controls or folder icons.
- Subtle dividers, quiet hover states, clear selected states, and comfortable spacing.
- Use a system sans-serif font stack.
- Make the desktop layout fill the available viewport without unnecessary page scrolling.
- On tablets and phones, collapse panes into a navigable flow: folder sidebar, then note list, then editor. Provide an obvious back action and preserve the selected note while navigating.

## Main workspace

### Folder sidebar

- Show a storage/account heading and a list of folders.
- Each folder row includes an icon, folder name, and note count.
- Include a clearly highlighted selected folder.
- Add a “New Folder” action at the bottom.
- Let users create, rename, and delete folders.
- Protect the default folder from deletion, or move its notes safely if deletion is allowed.
- Include a simple “Recently Deleted” area if practical, with restore and permanently delete actions.

### Note list

- Display notes from the selected folder, ordered by most recently modified.
- Group notes by recency with headings such as “Today,” “Previous 7 Days,” “Previous 30 Days,” and month names.
- Each note preview shows its title, date or time, and a short snippet of its body.
- Truncate long titles and snippets cleanly.
- Support list and grid layouts with a toolbar toggle.
- Highlight the selected note clearly.
- Include useful empty states for empty folders and search results with no matches.

### Editor

- Show the selected note’s last-modified date near the top.
- Provide a prominent editable title and a spacious content area.
- Autosave edits and update the note’s modification time and preview.
- Creating a note should open it immediately and place the cursor in the title or body.
- Deleting a note should select another note or show an empty state.
- If no note is selected, show a useful prompt to create one.

## Note editing and formatting

Provide practical note-taking features:

- Plain text editing that works reliably.
- Formatting controls for title/headings, bold, italic, underline, and strikethrough.
- Checklist creation with clickable checkboxes and checked-item styling.
- Bulleted and numbered lists.
- Tables, with a simple editable table experience.
- Links that can be opened and edited.
- Undo and redo where supported by the chosen editor.
- Keyboard shortcuts for common actions, and show shortcuts in tooltips or menus where helpful.
- Preserve formatting correctly when editing and reloading a note.

Choose a maintained rich-text editor that fits React if needed. Keep formatting controls functional; do not show toolbar buttons that do nothing.

## Toolbar

Include a compact toolbar with:

- Sidebar visibility toggle.
- List/grid view toggle.
- New note.
- Delete note.
- Text formatting menu.
- Checklist and table actions.
- Attachment or image insertion using a local file picker.
- Search field or search button.
- More-actions menu with options such as rename, move to folder, share/export, and print.

Implement the actions that are visible. If a feature such as sharing cannot work without a backend, provide a useful local alternative such as copying note text or exporting it.

## Search and organization

- Search notes by title and body.
- Make it easy to clear the search query.
- Allow notes to be moved between folders.
- Support pinning or favoriting notes, with a clear visual marker and pinned section.
- Keep selection and search state predictable when changing folders or views.

## Starter content

Seed the app with a small set of realistic sample notes so the layout is populated on first launch. Use generic sample content; do not copy personal names, account labels, or note text from the reference screenshot.

## Accessibility and responsive behavior

- Use semantic buttons, inputs, menus, and dialogs.
- Support keyboard navigation and visible focus indicators.
- Provide accessible names for icon-only controls.
- Ensure readable contrast in the dark theme.
- Keep touch targets comfortable on mobile.
- Handle window resizing without clipped controls or overlapping panes.

## Code organization

Keep the implementation easy to extend:

- Separate reusable UI components for the sidebar, note list, editor, toolbar, dialogs, and menus.
- Define clear TypeScript types for notes, folders, attachments, and editor content.
- Separate UI state from persistence and data operations.
- Keep note operations such as create, update, delete, search, and move-to-folder behind a service or repository interface. This will make it easier to connect a backend or future MCP server without coupling that integration to the UI.
- Avoid hardcoding app data into visual components.

## Acceptance criteria

The completed application should:

- Resemble the reference’s dark, three-pane notes workspace while using original branding.
- Run locally using the project’s documented start command.
- Work at desktop, tablet, and phone widths.
- Let users create, edit, search, format, organize, pin, and delete notes.
- Let users create, rename, and manage folders.
- Preserve notes and folders after refresh.
- Provide working controls, sensible empty states, and accessible keyboard interaction.
- Keep data and UI layers structured for future mobile packaging and MCP integration.