// ============================================
// SiniestrosAI - Modulo: Wiki interna y base de conocimiento
// Archivo: js/modules/wiki.js
// ============================================

'use strict';

function initWiki(){
    loadWikiNotes();
    loadWikiStats();
    
    // Search with debounce
    const searchInput = document.getElementById('wikiSearch');
    if(searchInput){
        let t;
        searchInput.addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(() => {
                const q = searchInput.value.trim();
                if(q.length >= 2) searchWiki(q);
                else loadWikiNotes();
            }, 300);
        });
    }
    
    // New note button
    const btnNew = document.getElementById('btnNuevaNota');
    if(btnNew) btnNew.addEventListener('click', () => showWikiEditor());
    
    // Save note button
    const btnSave = document.getElementById('btnGuardarNota');
    if(btnSave) btnSave.addEventListener('click', saveWikiNote);
    
    // Graph button
    const btnGraph = document.getElementById('btnWikiGraph');
    if(btnGraph) btnGraph.addEventListener('click', toggleWikiGraph);
}

function filterWikiCat(elem){
    document.querySelectorAll('.wiki-cat').forEach(c => c.classList.remove('active'));
    elem.classList.add('active');
    wikiCurrentCat = elem.dataset.cat || '';
    showWikiList();
    loadWikiNotes();
}

function showWikiList(){
    document.getElementById('wikiNoteList').style.display = 'flex';
    document.getElementById('wikiNoteViewer').style.display = 'none';
    document.getElementById('wikiNoteEditor').style.display = 'none';
    document.getElementById('wikiGraphView').style.display = 'none';
}

function showWikiEditor(nota){
    document.getElementById('wikiNoteList').style.display = 'none';
    document.getElementById('wikiNoteViewer').style.display = 'none';
    document.getElementById('wikiGraphView').style.display = 'none';
    document.getElementById('wikiNoteEditor').style.display = 'flex';
    
    document.getElementById('wikiEditTitle').value = nota ? nota.titulo : '';
    document.getElementById('wikiEditContenido').value = nota ? nota.contenido : '';
    document.getElementById('wikiEditCategoria').value = nota ? nota.categoria : 'procedimientos';
    document.getElementById('wikiEditTags').value = nota ? (nota.tags||'') : '';
    wikiCurrentNoteId = nota ? nota.id : null;
}

// Exportar al scope global
if (typeof window !== 'undefined') {
  window.initWiki = initWiki;
  window.filterWikiCat = filterWikiCat;
  window.showWikiList = showWikiList;
  window.showWikiEditor = showWikiEditor;
}
