export type Folder = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type Note = {
  id: string;
  folderId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
};

export type AppState = {
  folders: Folder[];
  notes: Note[];
};

const STORAGE_KEY = 'nocturne-notes-v1';
const LEGACY_SEEDED_NOTE_IDS = new Set(['note-1', 'note-2', 'note-3', 'note-4']);

export const DEFAULT_FOLDER_ID = 'folder-notes';

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function stripHtml(raw: string) {
  if (!raw) return '';
  const plain = raw.replace(/<[^>]*>/g, ' ');
  return plain.replace(/\s+/g, ' ').trim();
}

export function createSampleState(): AppState {
  const now = new Date();
  const defaultFolder: Folder = {
    id: DEFAULT_FOLDER_ID,
    name: 'Notes',
    color: '#d4b55a',
    createdAt: now.toISOString(),
  };

  const note: Note = {
    id: 'note-welcome',
    folderId: DEFAULT_FOLDER_ID,
    title: 'Welcome to Notes',
    body: '<p>Create and organize your notes here. Keep ideas, plans, and quick reminders together in one calm workspace.</p>',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    pinned: false,
  };

  return { folders: [defaultFolder], notes: [note] };
}

function isLegacyWelcomeBody(body: string) {
  return [
    '<p>Nocturne keeps your notes, ideas, and quick references in one calm workspace.</p><p>Use the sidebar to organize folders, the list to scan recent notes, and the editor to capture what matters most.</p>',
    '<p>Use this space to create and organize your notes. Keep ideas, plans, and quick reminders in one calm workspace.</p>',
  ].includes(body);
}

function isUntouchedUntitledPlaceholder(note: Note) {
  return note.title === 'Untitled note' && stripHtml(note.body) === 'Start typing…';
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSampleState();

    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !Array.isArray(parsed.folders) || !Array.isArray(parsed.notes)) {
      return createSampleState();
    }

    const folders = parsed.folders.filter(
      (folder): folder is Folder => typeof folder?.id === 'string' && typeof folder?.name === 'string',
    );
    const storedNotes = parsed.notes.filter(
      (note): note is Note =>
        typeof note?.id === 'string' &&
        typeof note?.folderId === 'string' &&
        typeof note?.title === 'string' &&
        typeof note?.body === 'string',
    );

    const hadLegacySeed = storedNotes.some(
      (note) => LEGACY_SEEDED_NOTE_IDS.has(note.id) || isUntouchedUntitledPlaceholder(note),
    );
    let nextFolders = folders.filter((folder) => !(folder.id === 'folder-ideas' && folder.name === 'Ideas'));
    if (!nextFolders.some((folder) => folder.id === DEFAULT_FOLDER_ID)) {
      nextFolders = [...createSampleState().folders, ...nextFolders];
    }

    let nextNotes = storedNotes
      .filter((note) => !LEGACY_SEEDED_NOTE_IDS.has(note.id) && !isUntouchedUntitledPlaceholder(note))
      .map((note) => {
        if (note.folderId === 'folder-ideas') {
          return { ...note, folderId: DEFAULT_FOLDER_ID };
        }

        if (note.id === 'note-welcome' && isLegacyWelcomeBody(note.body)) {
          return { ...note, title: 'Welcome to Notes', body: createSampleState().notes[0].body };
        }

        return note;
      });

    const validFolderIds = new Set(nextFolders.map((folder) => folder.id));
    nextNotes = nextNotes.map((note) =>
      validFolderIds.has(note.folderId) ? note : { ...note, folderId: DEFAULT_FOLDER_ID },
    );

    if (hadLegacySeed && nextNotes.length === 0) {
      nextNotes = createSampleState().notes;
    }

    const nextState = { folders: nextFolders, notes: nextNotes };
    if (JSON.stringify(nextState) !== JSON.stringify(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }

    return nextState;
  } catch {
    return createSampleState();
  }
}

export function saveAppState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
