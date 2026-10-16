# Feature Inventory

This inventory describes the current implementation in `src/App.tsx`, `src/data/store.ts`, and `src/styles.css`. PRD-only or incomplete items are listed separately below.

## Implemented Features

| Feature | Current behavior | Main implementation |
| --- | --- | --- |
| Three-pane workspace | Desktop shows folders, notes, and editor together with dark styling. | `src/App.tsx`, `src/styles.css` |
| Responsive pane flow | At widths up to 760px, one of folders, note list, or editor is shown at a time. Back buttons navigate to the preceding pane. | `src/App.tsx`, `.mobile-pane-shell` rules in `src/styles.css` |
| Resizable desktop panes | Two separators resize the sidebar and note list. Mouse dragging and Arrow/Home/End keyboard handling are provided; sidebar width is clamped to 180–380px and list width to 260–520px. | `src/App.tsx`, `.pane-divider` in `src/styles.css` |
| Starter data | When storage is absent, the app creates a `Notes` folder and selected `Welcome to Notes` note with an introductory body. | `src/data/store.ts`; initial selection in `src/App.tsx` |
| Legacy seed cleanup | On load, fixed legacy note IDs `note-1`–`note-4` and untouched `Untitled note` entries with the exact “Start typing…” placeholder body are removed. The old `Ideas` folder is removed by ID/name, and other notes assigned to it are moved to `Notes`. Edited placeholders and other unknown notes/folders are retained. | `loadAppState` in `src/data/store.ts` |
| Create/edit notes | New notes are added to the current folder and opened in the editor. Title and HTML body changes update `updatedAt`; data is saved after state changes. | `handleCreateNote`, `commitNoteUpdate`, `onEditorInput` in `src/App.tsx`; `saveAppState` in `src/data/store.ts` |
| Delete notes | A browser confirmation is shown; another note is selected when available, otherwise the editor empty state is shown. | `handleDeleteNote` in `src/App.tsx` |
| Folder management | Users can create folders, rename non-default folders, and delete non-default folders. Notes in a deleted folder are reassigned to `Notes`. Prompts/confirms are browser-native. | `handleCreateFolder`, `handleRenameFolder`, `handleDeleteFolder` in `src/App.tsx` |
| Search | Filters notes in the selected folder by title and plain-text body; the clear button empties the query. | `filteredNotes` and toolbar search in `src/App.tsx`; `stripHtml` in `src/data/store.ts` |
| Note ordering and grouping | Notes are ordered by `updatedAt`; pinned notes are grouped first, with remaining notes grouped by recent ranges/month. | `folderNotes` and `groupedNotes` in `src/App.tsx` |
| Pinning | A note can be toggled as pinned and shows a pin marker in its preview. | `togglePin`, note cards in `src/App.tsx` |
| List/grid mode | Desktop toolbar switches note preview layout. The selection is component state and is not persisted. | `viewMode`, toolbar, `.note-list.grid` in `src/App.tsx` and `src/styles.css` |
| Basic formatting | Bold, italic, underline, strike, heading, undo/redo, checklist HTML, and a basic editable HTML table are exposed in the desktop toolbar. Keyboard shortcuts cover new note, bold, italic, underline, undo, and redo. | `applyFormat`, `insertChecklist`, `insertTable`, key handler in `src/App.tsx` |
| Local attachments | A local file picker inserts image data URLs or links to other selected files into editor HTML. | `handleAttachment` and toolbar input in `src/App.tsx` |
| Copy/export fallback and print | More actions offers copy-to-clipboard with text-file download fallback and browser print. | `exportNote`, More menu in `src/App.tsx` |
| Local persistence | Notes/folders are serialized to localStorage under `nocturne-notes-v1`. | `loadAppState`, `saveAppState` in `src/data/store.ts` |

## Gaps and PRD Work Remaining

- **Recently Deleted:** no trash, restore, or permanent-delete interface exists; deletion is immediate after confirmation.
- **Move to folder:** the More menu asks for a raw folder ID. The editor’s move button currently calls the move operation with the current folder ID and therefore does not change folders. A folder picker is needed.
- **Rich-text durability:** content is stored as HTML from `contentEditable`; `document.execCommand` is deprecated. Bulleted/numbered list actions, link editing, checked-item styling, robust cursor behavior, and editor-level tests are not complete. A named link insertion helper exists but is not wired to a visible control.
- **Attachment model:** there is no typed attachment entity. Files are embedded in HTML as data URLs, including non-image files, which is unsuitable for large files or future sync without redesign.
- **Preferences:** the PRD asks to persist preferences, but view mode, pane widths, search, selected folder/note, and mobile stage are not persisted.
- **Organization UI:** folder create/rename/delete uses browser dialogs, and move-to-folder is not an ergonomic picker.
- **Accessibility polish:** icon buttons have accessible labels, but tooltips, complete menu/dialog semantics, separator value announcements, and comprehensive keyboard testing are incomplete.
- **Branding:** the sidebar heading is currently “iCloud”; replace it with neutral/original wording to comply with the PRD’s branding constraint.
- **Data architecture:** CRUD/search/move operations remain in the React component rather than a repository interface. Authentication, backend synchronization, and MCP support are not implemented.
- **Automated tests:** no test runner or test scripts are configured.