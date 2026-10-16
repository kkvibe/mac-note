# Project Handoff

## Purpose and Status

Nocturne Notes is a browser-based notes workspace inspired by the dark, three-pane layout in the product brief. It uses React and TypeScript with Vite, and stores note/folder data in browser `localStorage`; no backend or account is required.

The current app includes a responsive folder/list/editor workspace, basic rich-text editing, search, pinning, folder management, and resizable desktop panes. Most UI and interaction logic still lives in one component (`src/App.tsx`). The data layer (`src/data/store.ts`) handles types, starter data, migration, and local persistence, but is not yet a CRUD repository abstraction.

## Important Conventions

- Keep note and folder records plain serializable data. Note `body` currently contains editor HTML as a string.
- Keep storage access in `src/data/store.ts`; do not access localStorage from UI event handlers.
- The storage key is `nocturne-notes-v1`; default folder ID is `folder-notes`.
- The fresh-install state is one `Notes` folder and one `Welcome to Notes` note. Legacy fixed seed IDs `note-1` through `note-4` and untouched `Untitled note` placeholders are removed during load; notes with edited content and other unknown records are preserved.
- Styles are global CSS in `src/styles.css`, not CSS Modules.
- Use Lucide React icons from the existing `lucide-react` dependency and keep icon controls named for assistive technology.
- Do not imply that Nocturne Notes is an Apple product. The current sidebar still says “iCloud”; this conflicts with the PRD’s original-branding requirement and should be changed in a separate UI task.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

Vite defaults to port `5173` and binds to `0.0.0.0`. There is no test or lint script configured in `package.json`; `npm run build` runs TypeScript project checks and the production Vite build.

## Decisions and Limitations to Remember

- Persistence currently covers notes and folders only. Pane widths, search, selected items, and view mode are React state and reset on reload.
- Notes/folders mutations are implemented in `App.tsx`, not behind a repository interface. Introduce that boundary before adding a cloud backend or MCP integration.
- The rich-text editor uses browser `contentEditable` and `document.execCommand`; this is a lightweight current implementation, not a durable structured editor model.
- Attachments are embedded as data URLs in note HTML, which can grow localStorage quickly.
- Folder dialogs are browser prompts/confirms. The move action in the editor toolbar currently targets the already-selected folder; the More menu asks for a raw folder ID rather than presenting a folder picker.
- There is no authentication, cloud sync, conflict handling, trash/restore workflow, or automated test suite.
- Migration identifies fixed legacy seed IDs, the former `folder-ideas` record, and the exact untouched placeholder body “Start typing…”. An `Untitled note` with different body content is preserved; do not broaden cleanup by title alone.