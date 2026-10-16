# Nocturne Notes

A dark, desktop-first notes workspace inspired by the macOS Notes layout, built with React, TypeScript, and Vite. The app keeps notes and folders in browser storage so the data persists after a refresh without needing a backend.

## Features

- Three-pane notes layout with folder sidebar, note list, and editor
- Folder creation, renaming, selection, and deletion management
- Search, pinned notes, list/grid note previews, and recency-based grouping
- Rich text controls for bold, italic, underline, heading, strike, checklist, links, and simple table insertion
- Local persistence through a small repository-style data layer, designed for future mobile or server integration

## Getting started

```bash
npm install
npm run dev
```

Then open the URL printed by Vite in the terminal, typically http://localhost:5173.

## Production build

```bash
npm run build
```

## Notes

- Data is stored in browser localStorage.
- A default folder is protected from deletion to avoid empty states.
- The app is responsive and collapses into a mobile-first flow on smaller screens.
