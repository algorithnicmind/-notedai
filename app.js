// State management
let notes = JSON.parse(localStorage.getItem('noted_app_data')) || [];
let activeNoteId = null;
let saveTimeout = null;

// DOM Elements
const notesListEl = document.getElementById('notes-list');
const newNoteBtn = document.getElementById('new-note-btn');
const searchInput = document.getElementById('search-input');
const editorEmptyState = document.getElementById('editor-empty-state');
const editorArea = document.getElementById('editor-area');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const deleteNoteBtn = document.getElementById('delete-note-btn');
const saveStatus = document.getElementById('save-status');

// Initialize App
function init() {
    renderNotesList();
    if (notes.length > 0) {
        // Optionally open the first note: openNote(notes[0].id);
        showEmptyState();
    } else {
        showEmptyState();
    }
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    newNoteBtn.addEventListener('click', createNote);
    
    noteTitleInput.addEventListener('input', handleEditorInput);
    noteContentInput.addEventListener('input', handleEditorInput);
    
    deleteNoteBtn.addEventListener('click', deleteActiveNote);
    
    searchInput.addEventListener('input', (e) => {
        renderNotesList(e.target.value);
    });
}

// Auto-save logic
function handleEditorInput() {
    if (!activeNoteId) return;

    showSaveStatus('Saving...');
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveActiveNote();
    }, 500); // 500ms debounce
}

// Core Functions
function createNote() {
    const newNote = {
        id: Date.now().toString(),
        title: '',
        content: '',
        lastModified: new Date().toISOString()
    };
    
    notes.unshift(newNote); // Add to beginning
    saveToLocalStorage();
    renderNotesList();
    openNote(newNote.id);
}

function openNote(id) {
    activeNoteId = id;
    const note = notes.find(n => n.id === id);
    
    if (!note) return;
    
    // Update Editor UI
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    
    hideEmptyState();
    
    // Update Sidebar UI
    renderNotesList(searchInput.value); // Re-render to update active state
    
    // Focus content or title if empty
    if (!note.title) {
        noteTitleInput.focus();
    } else {
        noteContentInput.focus();
    }
}

function saveActiveNote() {
    if (!activeNoteId) return;
    
    const noteIndex = notes.findIndex(n => n.id === activeNoteId);
    if (noteIndex !== -1) {
        notes[noteIndex].title = noteTitleInput.value;
        notes[noteIndex].content = noteContentInput.value;
        notes[noteIndex].lastModified = new Date().toISOString();
        
        // Move to top when updated
        const updatedNote = notes.splice(noteIndex, 1)[0];
        notes.unshift(updatedNote);
        
        saveToLocalStorage();
        renderNotesList(searchInput.value);
        showSaveStatus('Saved');
        
        setTimeout(() => {
            saveStatus.classList.remove('show');
        }, 2000);
    }
}

function deleteActiveNote() {
    if (!activeNoteId) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(n => n.id !== activeNoteId);
        saveToLocalStorage();
        
        activeNoteId = null;
        renderNotesList(searchInput.value);
        showEmptyState();
        
        noteTitleInput.value = '';
        noteContentInput.value = '';
    }
}

// UI Helpers
function renderNotesList(searchQuery = '') {
    notesListEl.innerHTML = '';
    
    const filteredNotes = notes.filter(note => {
        const query = searchQuery.toLowerCase();
        return note.title.toLowerCase().includes(query) || 
               note.content.toLowerCase().includes(query);
    });
    
    if (filteredNotes.length === 0) {
        notesListEl.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 20px; font-size: 14px;">No notes found</div>`;
        return;
    }
    
    filteredNotes.forEach(note => {
        const el = document.createElement('div');
        el.className = `note-item ${note.id === activeNoteId ? 'active' : ''}`;
        
        const title = note.title.trim() || 'Untitled Note';
        const preview = note.content.trim() || 'No additional text...';
        const date = new Date(note.lastModified).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        
        el.innerHTML = `
            <div class="note-item-title">${escapeHTML(title)}</div>
            <div class="note-item-preview">${escapeHTML(preview)}</div>
            <div class="note-item-date">${date}</div>
        `;
        
        el.addEventListener('click', () => openNote(note.id));
        notesListEl.appendChild(el);
    });
}

function showEmptyState() {
    editorEmptyState.classList.remove('hidden');
    editorArea.classList.add('hidden');
}

function hideEmptyState() {
    editorEmptyState.classList.add('hidden');
    editorArea.classList.remove('hidden');
}

function showSaveStatus(text) {
    saveStatus.textContent = text;
    saveStatus.classList.add('show');
}

function saveToLocalStorage() {
    localStorage.setItem('noted_app_data', JSON.stringify(notes));
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// Boot up
init();
