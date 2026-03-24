// ============================================
// SiniestrosAI - Modulo: Sistema de importacion de datos
// Archivo: js/modules/importar.js
// ============================================

'use strict';

function initImportar(){
    const dropzone = document.getElementById('importDropzone');
    const fileInput = document.getElementById('importFileInput');
    if(!dropzone || !fileInput) return;

    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', e => { e.preventDefault(); dropzone.classList.remove('dragover'); handleImportFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if(fileInput.files[0]) handleImportFile(fileInput.files[0]); });

    const execBtn = document.getElementById('btnImportExecute');
    if(execBtn) execBtn.addEventListener('click', executeImport);

    // Load history
    modLoadData('/import/historial', 'importHistory', (el, data) => {
        const items = Array.isArray(data) ? data : [];
        el.innerHTML = items.length ? items.map(h => `<div class="mod-item"><i class="fas fa-file-import" style="color:#16a34a"></i><div><strong>${esc(h.archivo || '-')} (${esc(h.tipo || '-')})</strong><span>${h.importados||0} importados | ${h.rechazados||0} rechazados | ${h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES') : '-'}</span></div></div>`).join('') : '<p style="padding:1rem;color:var(--gray-400)">No hay importaciones previas</p>';
    });
}

function showImportStep(n) {
    for(let i=1;i<=4;i++){
        const panel = document.getElementById('importPanel'+i);
        const step = document.getElementById('importStep'+i);
        if(panel) panel.style.display = i===n ? 'block' : 'none';
        if(step) { step.classList.toggle('active', i===n); step.classList.toggle('done', i<n); }
    }
}

function importValidate() {
    // Collect current mappings from selects
    const selects = document.querySelectorAll('#importMappingGrid select');
    const mapping = {};
    selects.forEach(s => { if(s.value) mapping[s.dataset.header] = s.value; });
    importMapping = mapping;

    // Show validation
    const el = document.getElementById('importValidationResult');
    if(!el) return;

    const total = importPreview?.totalRows || 0;
    const mapped = Object.keys(mapping).length;
    const hasNombre = Object.values(mapping).includes('nombre');
    const errors = [];
    if(!hasNombre) errors.push('Falta mapear la columna "nombre" (obligatoria)');
    if(mapped < 2) errors.push('Se necesitan al menos 2 columnas mapeadas');

    el.innerHTML = `<div class="import-result-summary">
        <div class="import-result-card info"><span>${total}</span><span>Filas totales</span></div>
        <div class="import-result-card ${mapped>=3?'success':'warning'}"><span>${mapped}</span><span>Columnas mapeadas</span></div>
        <div class="import-result-card ${errors.length?'error':'success'}"><span>${errors.length}</span><span>Errores</span></div>
        <div class="import-result-card info"><span>${importPreview?.headers?.length||0}</span><span>Columnas origen</span></div>
    </div>
    ${importPreview?.preview ? '<h4>Preview (primeras filas):</h4><div class="table-wrapper"><table class="data-table"><thead><tr>' + Object.values(mapping).map(f => '<th>'+esc(f)+'</th>').join('') + '</tr></thead><tbody>' + (importPreview.preview||[]).slice(0,5).map(row => '<tr>' + Object.entries(mapping).map(([from]) => '<td>'+esc(row[from]||'-')+'</td>').join('') + '</tr>').join('') + '</tbody></table></div>' : ''}
    ${errors.length ? '<div style="color:#dc2626;margin-top:1rem">' + errors.map(e => '<p><i class="fas fa-times-circle"></i> '+esc(e)+'</p>').join('') + '</div>' : '<p style="color:#16a34a;margin-top:1rem"><i class="fas fa-check-circle"></i> Datos listos para importar</p>'}`;

    showImportStep(3);

    const btn = document.getElementById('btnImportExecute');
    if(btn) btn.disabled = errors.length > 0;
}

// Exportar al scope global
if (typeof window !== 'undefined') {
  window.initImportar = initImportar;
  window.showImportStep = showImportStep;
  window.importValidate = importValidate;
}
