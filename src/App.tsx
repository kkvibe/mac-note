import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bold,
  Check,
  Copy,
  FileText,
  FolderPlus,
  Heading,
  Italic,
  LayoutGrid,
  List,
  MoreHorizontal,
  MoveRight,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Redo2,
  Search,
  Strikethrough,
  Trash2,
  Underline,
  Undo2,
  X,
} from 'lucide-react';
import { DEFAULT_FOLDER_ID, createId, createSampleState, loadAppState, saveAppState, stripHtml, type Folder, type Note } from './data/store';

type ViewMode = 'list' | 'grid';

type GroupedNotes = {
  label: string;
  notes: Note[];
};

const ACCENT = '#d9b35e';

const dateLabel = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const noteSummary = (body: string) => stripHtml(body).slice(0, 90) || 'No content yet.';

function App() {
  const initialState = useMemo(() => loadAppState(), []);

  const [folders, setFolders] = useState<Folder[]>(initialState.folders);
  const [notes, setNotes] = useState<Note[]>(initialState.notes);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(initialState.folders[0]?.id ?? DEFAULT_FOLDER_ID);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialState.notes[0]?.id ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [mobileStage, setMobileStage] = useState<'folders' | 'notes' | 'editor'>('editor');
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [notesWidth, setNotesWidth] = useState(360);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 760 : false);

  const titleRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragState = useRef<{ side: 'sidebar' | 'notes'; startX: number; startSidebar: number; startNotes: number } | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 760);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    saveAppState({ folders, notes });
  }, [folders, notes]);

  useEffect(() => {
    if (!selectedFolderId && folders.length) {
      setSelectedFolderId(folders[0].id);
    }
  }, [selectedFolderId, folders]);

  useEffect(() => {
    if (isMobile && selectedNoteId) {
      setMobileStage('editor');
    }
  }, [isMobile, selectedNoteId]);

  const folderNotes = useMemo(
    () =>
      notes
        .filter((note) => note.folderId === selectedFolderId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [notes, selectedFolderId],
  );

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return folderNotes;

    return folderNotes.filter((note) => {
      const haystack = `${note.title} ${stripHtml(note.body)}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [folderNotes, searchQuery]);

  useEffect(() => {
    if (!selectedNoteId || !filteredNotes.some((note) => note.id === selectedNoteId)) {
      setSelectedNoteId(filteredNotes[0]?.id ?? null);
    }
  }, [filteredNotes, selectedNoteId]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;

  const groupedNotes = useMemo(() => {
    const pinned = filteredNotes.filter((note) => note.pinned);
    const regular = filteredNotes.filter((note) => !note.pinned);
    const sections: GroupedNotes[] = [];

    if (pinned.length) {
      sections.push({ label: 'Pinned', notes: pinned });
    }

    const buckets = [
      { label: 'Today', match: (value: number) => value < 1 },
      { label: 'Previous 7 Days', match: (value: number) => value < 7 },
      { label: 'Previous 30 Days', match: (value: number) => value < 30 },
    ];

    for (const bucket of buckets) {
      const items = regular.filter((note) => {
        const diffDays = (Date.now() - new Date(note.updatedAt).getTime()) / 86400000;
        return bucket.match(diffDays);
      });

      if (items.length) sections.push({ label: bucket.label, notes: items });
    }

    const monthGroups = new Map<string, Note[]>();
    regular.forEach((note) => {
      const diffDays = (Date.now() - new Date(note.updatedAt).getTime()) / 86400000;
      if (diffDays < 30) return;

      const label = new Date(note.updatedAt).toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const current = monthGroups.get(label) ?? [];
      current.push(note);
      monthGroups.set(label, current);
    });

    monthGroups.forEach((items, label) => {
      sections.push({ label, notes: items });
    });

    return sections;
  }, [filteredNotes]);

  const currentFolderName = folders.find((folder) => folder.id === selectedFolderId)?.name ?? 'Notes';

  const commitNoteUpdate = (noteId: string, next: Partial<Note>) => {
    setNotes((current) =>
      current.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          ...next,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  const handleCreateFolder = () => {
    const folderName = window.prompt('Folder name', 'New folder');
    if (!folderName?.trim()) return;

    const newFolder: Folder = {
      id: createId('folder'),
      name: folderName.trim(),
      color: '#d9b35e',
      createdAt: new Date().toISOString(),
    };

    setFolders((current) => [...current, newFolder]);
    setSelectedFolderId(newFolder.id);
    setMobileStage('notes');
  };

  const handleRenameFolder = () => {
    const folder = folders.find((entry) => entry.id === selectedFolderId);
    if (!folder || folder.id === DEFAULT_FOLDER_ID) return;

    const nextName = window.prompt('Rename folder', folder.name);
    if (!nextName?.trim()) return;

    setFolders((current) => current.map((entry) => (entry.id === folder.id ? { ...entry, name: nextName.trim() } : entry)));
  };

  const handleDeleteFolder = () => {
    if (selectedFolderId === DEFAULT_FOLDER_ID) return;

    const folder = folders.find((entry) => entry.id === selectedFolderId);
    if (!folder) return;

    const confirmed = window.confirm(`Delete “${folder.name}”? Notes inside will move to the default folder.`);
    if (!confirmed) return;

    setFolders((current) => current.filter((entry) => entry.id !== folder.id));
    setNotes((current) =>
      current.map((note) => (note.folderId === folder.id ? { ...note, folderId: DEFAULT_FOLDER_ID } : note)),
    );
    setSelectedFolderId(DEFAULT_FOLDER_ID);
  };

  const handleCreateNote = () => {
    const folderId = selectedFolderId || DEFAULT_FOLDER_ID;
    const newNote: Note = {
      id: createId('note'),
      folderId,
      title: 'Untitled note',
      body: '<p>Start typing…</p>',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
    };

    setNotes((current) => [newNote, ...current]);
    setSelectedNoteId(newNote.id);
    setMobileStage('editor');
    window.setTimeout(() => titleRef.current?.focus(), 0);
  };

  const handleDeleteNote = () => {
    if (!selectedNoteId) return;

    const target = notes.find((note) => note.id === selectedNoteId);
    if (!target) return;

    const confirmation = window.confirm(`Delete “${target.title || 'Untitled note'}”?`);
    if (!confirmation) return;

    const remaining = notes.filter((note) => note.id !== selectedNoteId);
    setNotes(remaining);
    const next = remaining.find((note) => note.folderId === selectedFolderId) ?? remaining[0] ?? null;
    setSelectedNoteId(next?.id ?? null);
  };

  const applyFormat = (command: string, value?: string) => {
    if (!editorRef.current || !selectedNoteId) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    const nextHtml = editorRef.current.innerHTML;
    commitNoteUpdate(selectedNoteId, { body: nextHtml });
  };

  const handleAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedNoteId || !editorRef.current) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const markup = file.type.startsWith('image/')
        ? `<p><img src="${result}" alt="${file.name}" /></p>`
        : `<p><a href="${result}" target="_blank" rel="noreferrer">${file.name}</a></p>`;

      editorRef.current?.focus();
      document.execCommand('insertHTML', false, markup);
      commitNoteUpdate(selectedNoteId, { body: editorRef.current?.innerHTML ?? '' });
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const insertChecklist = () => {
    if (!editorRef.current || !selectedNoteId) return;
    const html = '<div class="checklist-line"><input type="checkbox" /><span contenteditable="true">New item</span></div>';
    editorRef.current.focus();
    document.execCommand('insertHTML', false, html);
    commitNoteUpdate(selectedNoteId, { body: editorRef.current.innerHTML });
  };

  const insertTable = () => {
    if (!editorRef.current || !selectedNoteId) return;
    const html = '<table><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></tbody></table>';
    editorRef.current.focus();
    document.execCommand('insertHTML', false, html);
    commitNoteUpdate(selectedNoteId, { body: editorRef.current.innerHTML });
  };

  const insertLink = () => {
    const url = window.prompt('Link URL', 'https://');
    if (!url) return;
    applyFormat('createLink', url);
  };

  const exportNote = async () => {
    if (!selectedNote) return;
    const text = `${selectedNote.title}\n\n${stripHtml(selectedNote.body)}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${selectedNote.title || 'note'}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey;
      if (!isModifier) return;

      const key = event.key.toLowerCase();
      if (key === 'b') {
        event.preventDefault();
        applyFormat('bold');
      }
      if (key === 'i') {
        event.preventDefault();
        applyFormat('italic');
      }
      if (key === 'u') {
        event.preventDefault();
        applyFormat('underline');
      }
      if (key === 's') {
        event.preventDefault();
      }
      if (key === 'n') {
        event.preventDefault();
        handleCreateNote();
      }
      if (key === 'z') {
        event.preventDefault();
        applyFormat(event.shiftKey ? 'redo' : 'undo');
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [selectedNoteId]);

  const clampPaneWidth = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const adjustPaneWidth = (side: 'sidebar' | 'notes', change: number) => {
    if (side === 'sidebar') {
      setSidebarWidth((current) => clampPaneWidth(current + change, 180, 380));
      return;
    }

    setNotesWidth((current) => clampPaneWidth(current + change, 260, 520));
  };

  const handleResizeKeyDown = (side: 'sidebar' | 'notes') => (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      adjustPaneWidth(side, side === 'sidebar' ? -24 : -28);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      adjustPaneWidth(side, side === 'sidebar' ? 24 : 28);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      if (side === 'sidebar') setSidebarWidth(180);
      else setNotesWidth(260);
    }

    if (event.key === 'End') {
      event.preventDefault();
      if (side === 'sidebar') setSidebarWidth(380);
      else setNotesWidth(520);
    }
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragState.current) return;

      const delta = event.clientX - dragState.current.startX;
      if (dragState.current.side === 'sidebar') {
        setSidebarWidth(clampPaneWidth(dragState.current.startSidebar + delta, 180, 380));
        return;
      }

      setNotesWidth(clampPaneWidth(dragState.current.startNotes + delta, 260, 520));
    };

    const handlePointerUp = () => {
      dragState.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const moveSelectedNote = (folderId: string) => {
    if (!selectedNoteId) return;
    setNotes((current) => current.map((note) => (note.id === selectedNoteId ? { ...note, folderId } : note)));
    setSelectedFolderId(folderId);
    setMoreOpen(false);
  };

  const togglePin = () => {
    if (!selectedNoteId) return;
    const note = notes.find((item) => item.id === selectedNoteId);
    if (!note) return;
    commitNoteUpdate(selectedNoteId, { pinned: !note.pinned });
  };

  const onEditorInput = () => {
    if (!selectedNoteId || !editorRef.current) return;
    commitNoteUpdate(selectedNoteId, { body: editorRef.current.innerHTML });
  };

  return (
    <div className="page-shell">
      <div className="window-frame">
        <div className="window-header">
          <div className="toolbar-shell">
            {!isMobile && (
              <button className="icon-button compact" aria-label="Toggle sidebar" onClick={() => setSidebarVisible((value) => !value)}>
                {sidebarVisible ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
              </button>
            )}
            {!isMobile && (
              <>
                <button className="icon-button compact" aria-label="List view" onClick={() => setViewMode('list')}>
                  <List size={14} />
                </button>
                <button className="icon-button compact" aria-label="Grid view" onClick={() => setViewMode('grid')}>
                  <LayoutGrid size={14} />
                </button>
              </>
            )}
            <button className="icon-button compact" aria-label="New note" onClick={handleCreateNote}>
              <Plus size={14} />
            </button>
            {!isMobile && (
              <button className="icon-button compact" aria-label="Delete note" onClick={handleDeleteNote}>
                <Trash2 size={14} />
              </button>
            )}
            {!isMobile && (
              <div className="format-menu">
                <button className="icon-button compact" aria-label="Undo" onClick={() => applyFormat('undo')}>
                  <Undo2 size={14} />
                </button>
                <button className="icon-button compact" aria-label="Redo" onClick={() => applyFormat('redo')}>
                  <Redo2 size={14} />
                </button>
                <button className="icon-button compact" aria-label="Text format" onClick={() => applyFormat('bold')}>
                  <Bold size={14} />
                </button>
                <button className="icon-button compact" aria-label="Italic text" onClick={() => applyFormat('italic')}>
                  <Italic size={14} />
                </button>
                <button className="icon-button compact" aria-label="Underline text" onClick={() => applyFormat('underline')}>
                  <Underline size={14} />
                </button>
                <button className="icon-button compact" aria-label="Strikethrough text" onClick={() => applyFormat('strikeThrough')}>
                  <Strikethrough size={14} />
                </button>
                <button className="icon-button compact" aria-label="Heading" onClick={() => applyFormat('formatBlock', 'h2')}>
                  <Heading size={14} />
                </button>
              </div>
            )}
            {!isMobile && (
              <>
                <button className="icon-button compact" aria-label="Checklist" onClick={insertChecklist}>
                  <Check size={14} />
                </button>
                <button className="icon-button compact" aria-label="Insert table" onClick={insertTable}>
                  <FileText size={14} />
                </button>
                <button className="icon-button compact" aria-label="Attach file or image" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip size={14} />
                </button>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt,.doc,.docx" hidden onChange={handleAttachment} />
            <div className="search-box">
              <Search size={14} />
              <input
                aria-label="Search notes"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search"
              />
              {searchQuery && (
                <button className="clear-search" aria-label="Clear search" onClick={() => setSearchQuery('')}>
                  <X size={12} />
                </button>
              )}
            </div>
            <button className="icon-button compact" aria-label="More actions" onClick={() => setMoreOpen((value) => !value)}>
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {isMobile ? (
          <div className="mobile-pane-shell">
            {mobileStage === 'folders' && (
              <aside className="sidebar-pane mobile-pane">
                <div className="mobile-pane-header">
                  <span>Folders</span>
                  <button className="text-button" onClick={handleCreateFolder}>New</button>
                </div>
                <div className="folder-list">
                  {folders.map((folder) => {
                    const folderCount = notes.filter((entry) => entry.folderId === folder.id).length;
                    const selected = folder.id === selectedFolderId;

                    return (
                      <button
                        key={folder.id}
                        className={`folder-row ${selected ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedFolderId(folder.id);
                          setMobileStage('notes');
                        }}
                      >
                        <span className="folder-icon" style={{ background: folder.color }} />
                        <span className="folder-name">{folder.name}</span>
                        <span className="folder-count">{folderCount}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>
            )}

            {mobileStage === 'notes' && (
              <section className="notelist-pane mobile-pane">
                <div className="mobile-pane-header">
                  <button className="text-button" onClick={() => setMobileStage('folders')}>Back</button>
                  <span>{currentFolderName}</span>
                  <button className="text-button" onClick={handleCreateNote}>New</button>
                </div>

                {filteredNotes.length ? (
                  <div className={`note-list ${viewMode}`}>
                    {groupedNotes.map((group) => (
                      <div key={group.label} className="note-group">
                        <div className="group-label">{group.label}</div>
                        {group.notes.map((note) => {
                          const selected = note.id === selectedNoteId;
                          return (
                            <button
                              key={note.id}
                              className={`note-card ${selected ? 'selected' : ''}`}
                              onClick={() => {
                                setSelectedNoteId(note.id);
                                setMobileStage('editor');
                              }}
                            >
                              <div className="card-header">
                                <span className="note-title">{note.title || 'Untitled note'}</span>
                                {note.pinned && <Pin size={12} className="pin-icon" />}
                              </div>
                              <div className="note-meta">{dateLabel(note.updatedAt)}</div>
                              <div className="note-snippet">{noteSummary(note.body)}</div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon"><FileText size={18} /></div>
                    <p>No notes in this folder.</p>
                    <button onClick={handleCreateNote}>Create a note</button>
                  </div>
                )}
              </section>
            )}

            {mobileStage === 'editor' && (
              <main className="editor-pane mobile-pane">
                {selectedNote ? (
                  <>
                    <div className="mobile-pane-header">
                      <button className="text-button" onClick={() => setMobileStage('notes')}>Back</button>
                      <span>Editor</span>
                      <button className="text-button" onClick={togglePin}>{selectedNote.pinned ? 'Unpin' : 'Pin'}</button>
                    </div>
                    <div className="editor-toolbar">
                      <div className="editor-actions-left">
                        <button className="icon-button compact" aria-label="Copy note" onClick={exportNote}><Copy size={14} /></button>
                        <button className="icon-button compact" aria-label="Delete note" onClick={handleDeleteNote}><Trash2 size={14} /></button>
                      </div>
                      <div className="editor-meta">{dateLabel(selectedNote.updatedAt)}</div>
                    </div>
                    <div className="editor-body">
                      <input
                        ref={titleRef}
                        className="title-input"
                        value={selectedNote.title}
                        onChange={(event) => commitNoteUpdate(selectedNote.id, { title: event.target.value })}
                        placeholder="Note title"
                        aria-label="Note title"
                      />
                      <div
                        ref={editorRef}
                        className="content-editor"
                        contentEditable
                        suppressContentEditableWarning
                        onInput={onEditorInput}
                        dangerouslySetInnerHTML={{ __html: selectedNote.body || '<p></p>' }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="empty-editor">
                    <div className="empty-icon"><FileText size={18} /></div>
                    <h3>Ready to capture something?</h3>
                    <p>Select or create a note to begin writing.</p>
                    <button onClick={handleCreateNote}>New note</button>
                  </div>
                )}
              </main>
            )}
          </div>
        ) : (
          <div
            className="workspace-grid"
            style={{
              gridTemplateColumns: sidebarVisible ? `${sidebarWidth}px 12px ${notesWidth}px 12px minmax(0, 1fr)` : `${notesWidth}px 12px minmax(0, 1fr)`,
            }}
          >
            {sidebarVisible && (
              <>
                <aside className="sidebar-pane">
                  <div className="sidebar-header">iCloud</div>
                  <div className="folder-list">
                    {folders.map((folder) => {
                      const folderCount = notes.filter((entry) => entry.folderId === folder.id).length;
                      const selected = folder.id === selectedFolderId;

                      return (
                        <button
                          key={folder.id}
                          className={`folder-row ${selected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedFolderId(folder.id);
                            setMobileStage('notes');
                          }}
                        >
                          <span className="folder-icon" style={{ background: folder.color }} />
                          <span className="folder-name">{folder.name}</span>
                          <span className="folder-count">{folderCount}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="sidebar-footer">
                    <button className="new-folder-button" onClick={handleCreateFolder}>
                      <FolderPlus size={15} />
                      <span>New Folder</span>
                    </button>
                  </div>
                </aside>

                <button
                  type="button"
                  className="pane-divider"
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize folder sidebar"
                  tabIndex={0}
                  onMouseDown={(event) => {
                    dragState.current = {
                      side: 'sidebar',
                      startX: event.clientX,
                      startSidebar: sidebarWidth,
                      startNotes: notesWidth,
                    };
                  }}
                  onKeyDown={handleResizeKeyDown('sidebar')}
                />
              </>
            )}

            <section className="notelist-pane">
              <div className="panel-toolbar">
                <div className="title-group">
                  <h2>{currentFolderName}</h2>
                </div>
                <div className="panel-actions">
                  {selectedFolderId !== DEFAULT_FOLDER_ID && (
                    <button className="text-button" onClick={handleRenameFolder}>Rename</button>
                  )}
                  {selectedFolderId !== DEFAULT_FOLDER_ID && (
                    <button className="text-button danger" onClick={handleDeleteFolder}>Delete</button>
                  )}
                </div>
              </div>

              {filteredNotes.length ? (
                <div className={`note-list ${viewMode}`}>
                  {groupedNotes.map((group) => (
                    <div key={group.label} className="note-group">
                      <div className="group-label">{group.label}</div>
                      {group.notes.map((note) => {
                        const selected = note.id === selectedNoteId;
                        const isPinned = note.pinned;
                        return (
                          <button
                            key={note.id}
                            className={`note-card ${selected ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedNoteId(note.id);
                              setMobileStage('editor');
                            }}
                          >
                            <div className="card-header">
                              <span className="note-title">{note.title || 'Untitled note'}</span>
                              {isPinned && <Pin size={12} className="pin-icon" />}
                            </div>
                            <div className="note-meta">{dateLabel(note.updatedAt)}</div>
                            <div className="note-snippet">{noteSummary(note.body)}</div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><FileText size={18} /></div>
                  <p>No notes match this search.</p>
                  <button onClick={handleCreateNote}>Create a note</button>
                </div>
              )}
            </section>

            <button
              type="button"
              className="pane-divider"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize note list"
              tabIndex={0}
              onMouseDown={(event) => {
                dragState.current = {
                  side: 'notes',
                  startX: event.clientX,
                  startSidebar: sidebarWidth,
                  startNotes: notesWidth,
                };
              }}
              onKeyDown={handleResizeKeyDown('notes')}
            />

            <main className="editor-pane">
              {selectedNote ? (
                <>
                  <div className="editor-toolbar">
                    <div className="editor-actions-left">
                      <button className="icon-button compact" aria-label="Pin note" onClick={togglePin}>
                        <Pin size={14} />
                      </button>
                      <button className="icon-button compact" aria-label="Copy note" onClick={exportNote}>
                        <Copy size={14} />
                      </button>
                      <button className="icon-button compact" aria-label="Move to another folder" onClick={() => moveSelectedNote(selectedFolderId)}>
                        <MoveRight size={14} />
                      </button>
                    </div>
                    <div className="editor-meta">Last updated {dateLabel(selectedNote.updatedAt)}</div>
                  </div>

                  <div className="editor-body">
                    <input
                      ref={titleRef}
                      className="title-input"
                      value={selectedNote.title}
                      onChange={(event) => commitNoteUpdate(selectedNote.id, { title: event.target.value })}
                      placeholder="Note title"
                      aria-label="Note title"
                    />

                    <div
                      ref={editorRef}
                      className="content-editor"
                      contentEditable
                      suppressContentEditableWarning
                      onInput={onEditorInput}
                      dangerouslySetInnerHTML={{ __html: selectedNote.body || '<p></p>' }}
                    />
                  </div>
                </>
              ) : (
                <div className="empty-editor">
                  <div className="empty-icon"><FileText size={18} /></div>
                  <h3>Ready to capture something?</h3>
                  <p>Select or create a note to begin writing.</p>
                  <button onClick={handleCreateNote}>New note</button>
                </div>
              )}
            </main>
          </div>
        )}

        {moreOpen && (
          <div className="more-menu">
            <button onClick={handleCreateFolder}>New folder</button>
            {selectedFolderId !== DEFAULT_FOLDER_ID && <button onClick={handleRenameFolder}>Rename folder</button>}
            <button onClick={exportNote}>Export note</button>
            <button
              onClick={() => {
                const targetFolderId = window.prompt('Move note to folder id', selectedFolderId) || selectedFolderId;
                moveSelectedNote(targetFolderId);
              }}
            >
              Move to folder
            </button>
            <button onClick={() => window.print()}>Print</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
