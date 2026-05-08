const OPTION_KEY = 'ubMailmergeV2';

function uid() { return Math.random().toString(36).slice(2, 10); }
function $(id) { return document.getElementById(id); }

const DEFAULT_TEMPLATE = () => ([
  { id: uid(), title: 'Identification', fields: [
    { id: uid(), label: 'Nom complet de l’instance', column: 'Nom complet' },
    { id: uid(), label: 'Type d’instance', column: "Type d'instance" },
    { id: uid(), label: 'Pilote', column: 'VP Pilote' },
    { id: uid(), label: 'Rôle de l’instance', column: "Rôle de l'instance" }
  ]},
  { id: uid(), title: 'Composition', fields: [
    { id: uid(), label: 'Membres de droit', column: 'Membres de droit' },
    { id: uid(), label: 'Membres invités', column: 'Membres invités' }
  ]},
  { id: uid(), title: 'Fonctionnement', fields: [
    { id: uid(), label: 'Fréquence', column: 'Fréquence' },
    { id: uid(), label: 'Durée', column: 'Durée h' },
    { id: uid(), label: 'Référent opérationnel', column: 'Référent opérationnel' }
  ]},
  { id: uid(), title: 'Documents', fields: [
    { id: uid(), label: 'Entrants / Inputs', column: 'Documents INPUT' },
    { id: uid(), label: 'Sortants / Outputs', column: 'Document OUTPUT' }
  ]},
  { id: uid(), title: 'Liens avec l’écosystème', fields: [
    { id: uid(), label: 'Liens avec d’autres instances', column: 'Lien avec l’écosystème de gouvernance' }
  ]},
  { id: uid(), title: 'Points d’amélioration', fields: [
    { id: uid(), label: 'Commentaire libre', column: "Points d'amélioration" }
  ]}
]);

const DEFAULT_SETTINGS = {
  docTitle: 'FICHE INSTANCE',
  docSubtitle: 'Publipostage depuis la ligne active Grist',
  primaryColor: '#8d1d21',
  accentColor: '#5f6b7a',
  titleFont: "'Source Serif 4', Georgia, serif",
  bodyFont: "'Source Sans 3', 'Segoe UI', sans-serif",
  logoMode: 'url',
  logoUrl: '',
  logoWidth: 136,
  logoHeight: 56,
  logoDataUrl: '',
  docTitleSize: 28,
  sectionTitleSize: 18,
  fieldLabelSize: 14,
  fieldValueSize: 14,
  rowGap: 8,
  sectionGap: 20,
  sections: DEFAULT_TEMPLATE(),
  sidebarHidden: false
};

const state = {
  columns: [],
  records: [],
  record: null,
  currentIndex: 0,
  settings: structuredCloneSafe(DEFAULT_SETTINGS),
  suppressSave: false,
};

function structuredCloneSafe(value) { return JSON.parse(JSON.stringify(value)); }
function normalizeText(value) { return (value ?? '').toString().trim(); }
function normalizeCol(value) { return normalizeText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').toLowerCase(); }
function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function clampNumber(value, min, max, fallback) { const n = Number(value); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback; }
function availableColumns() { return state.columns.length ? state.columns : ['']; }
function setStatus(text) { $('statusBox').textContent = text; }

function getRecordId(record) { return record?.id ?? record?.ID ?? record?.Id ?? null; }

function hexToRgba(hex, alpha) {
  const clean = String(hex || '').replace('#', '');
  const value = clean.length === 3 ? clean.split('').map(x => x + x).join('') : clean;
  const bigint = parseInt(value || '8d1d21', 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getRecordValue(record, columnName) {
  if (!record || !columnName) return '';
  if (record[columnName] !== undefined) return record[columnName];
  const normalizedMap = Object.keys(record).find(key => normalizeCol(key) === normalizeCol(columnName));
  return normalizedMap ? record[normalizedMap] : '';
}

function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function collectSettingsFromControls() {
  Object.keys(DEFAULT_SETTINGS).forEach(key => {
    const el = $(key);
    if (!el || key === 'sections') return;
    state.settings[key] = el.type === 'number' ? Number(el.value) : el.value;
  });
  state.settings.sections = state.settings.sections || DEFAULT_TEMPLATE();
  state.settings.sidebarHidden = $('app').classList.contains('sidebar-hidden');
}

function applySettingsToControls() {
  Object.entries(state.settings).forEach(([key, value]) => {
    const el = $(key);
    if (!el || key === 'sections') return;
    el.value = value ?? DEFAULT_SETTINGS[key] ?? '';
  });
  $('app').classList.toggle('sidebar-hidden', !!state.settings.sidebarHidden);
  $('toggleSidebarBtn').textContent = state.settings.sidebarHidden ? 'Afficher le panneau' : 'Masquer le panneau';
}

function applyGlobalStyles() {
  const s = state.settings;
  const root = document.documentElement.style;
  root.setProperty('--color-primary', s.primaryColor || DEFAULT_SETTINGS.primaryColor);
  root.setProperty('--color-primary-soft', hexToRgba(s.primaryColor || DEFAULT_SETTINGS.primaryColor, 0.1));
  root.setProperty('--color-accent', s.accentColor || DEFAULT_SETTINGS.accentColor);
  root.setProperty('--font-display', s.titleFont || DEFAULT_SETTINGS.titleFont);
  root.setProperty('--font-body', s.bodyFont || DEFAULT_SETTINGS.bodyFont);
  root.setProperty('--logo-width', `${clampNumber(s.logoWidth, 40, 520, 136)}px`);
  root.setProperty('--logo-height', `${clampNumber(s.logoHeight, 20, 240, 56)}px`);
  root.setProperty('--doc-title-size', `${clampNumber(s.docTitleSize, 14, 48, 28)}px`);
  root.setProperty('--section-title-size', `${clampNumber(s.sectionTitleSize, 10, 30, 18)}px`);
  root.setProperty('--field-label-size', `${clampNumber(s.fieldLabelSize, 8, 24, 14)}px`);
  root.setProperty('--field-value-size', `${clampNumber(s.fieldValueSize, 8, 24, 14)}px`);
  root.setProperty('--row-gap', `${clampNumber(s.rowGap, 0, 40, 8)}px`);
  root.setProperty('--section-gap', `${clampNumber(s.sectionGap, 0, 60, 20)}px`);
}

function logoHtml() {
  const s = state.settings;
  let src = '';
  if (s.logoMode === 'url') src = normalizeText(s.logoUrl);
  if (s.logoMode === 'upload') src = s.logoDataUrl;
  $('logoUrlField').hidden = s.logoMode !== 'url';
  $('logoUploadField').hidden = s.logoMode !== 'upload';
  if (s.logoMode === 'none' || !src) return '<div class="logo-fallback">Logo UB</div>';
  return `<img src="${escapeHtml(src)}" alt="Logo UB">`;
}

function buildPaperHtml(record, options = {}) {
  const s = state.settings;
  const sections = s.sections || [];
  const rowsHtml = sections.map(section => {
    const rows = (section.fields || []).map(field => {
      const raw = formatValue(getRecordValue(record, field.column));
      const hasValue = normalizeText(raw) !== '';
      return `<div class="kv-row"><div class="kv-label">${escapeHtml(field.label || 'Libellé')}</div><div class="kv-value">${hasValue ? escapeHtml(raw) : '<span class="placeholder">—</span>'}</div></div>`;
    }).join('');
    return `<section class="doc-section"><div class="doc-section-title">${escapeHtml(section.title || 'Section')}</div><div class="kv-list">${rows}</div></section>`;
  }).join('');

  const extraClass = options.extraClass ? ` ${options.extraClass}` : '';
  return `<div class="paper${extraClass}">
    <header class="doc-header">
      <div class="logo-box">${logoHtml()}</div>
      <div class="doc-heading"><h1 class="doc-title">${escapeHtml(s.docTitle || 'FICHE INSTANCE')}</h1><div class="doc-subtitle">${escapeHtml(s.docSubtitle || '')}</div></div>
    </header>
    <div class="doc-sections">${rowsHtml}</div>
  </div>`;
}

function renderPreview() {
  applyGlobalStyles();
  $('previewHost').innerHTML = buildPaperHtml(state.record, { extraClass: 'export-hidden' });
  updateRecordChip();
}

function updateRecordChip() {
  const total = state.records.length;
  if (!total) { $('recordChip').textContent = state.record ? 'Ligne active Grist' : 'Aucune ligne'; return; }
  $('recordChip').textContent = `Enregistrement ${state.currentIndex + 1} / ${total}`;
  $('prevRecordBtn').disabled = state.currentIndex <= 0;
  $('nextRecordBtn').disabled = state.currentIndex >= total - 1;
}

function renderSectionsEditor() {
  const host = $('sectionsEditor');
  host.innerHTML = (state.settings.sections || []).map((section, sIndex) => `
    <div class="section-editor" data-section-id="${section.id}">
      <div class="section-head"><strong>Section ${sIndex + 1}</strong><div class="tiny-actions"><button class="tiny-btn" type="button" data-action="add-field" data-section="${section.id}">+ Ligne</button><button class="tiny-btn" type="button" data-action="remove-section" data-section="${section.id}">Supprimer</button></div></div>
      <div class="field"><label>Titre de section</label><input type="text" data-action="section-title" data-section="${section.id}" value="${escapeHtml(section.title)}"></div>
      ${(section.fields || []).map(field => `
        <div class="field-row"><div class="field"><label>Libellé affiché</label><input type="text" data-action="field-label" data-section="${section.id}" data-field="${field.id}" value="${escapeHtml(field.label)}"></div>
        <div><div class="field"><label>Champ Grist</label><select data-action="field-column" data-section="${section.id}" data-field="${field.id}"><option value="">— Sélectionner —</option>${availableColumns().map(col => `<option value="${escapeHtml(col)}" ${normalizeCol(col) === normalizeCol(field.column) ? 'selected' : ''}>${escapeHtml(col)}</option>`).join('')}</select></div><div class="tiny-actions"><button class="tiny-btn" type="button" data-action="remove-field" data-section="${section.id}" data-field="${field.id}">Supprimer la ligne</button></div></div></div>
      `).join('')}
    </div>`).join('');
  bindSectionEditorEvents();
}

function findField(sectionId, fieldId) {
  const section = state.settings.sections.find(s => s.id === sectionId);
  return section ? section.fields.find(f => f.id === fieldId) || null : null;
}

function saveSoon() {
  if (state.suppressSave) return;
  clearTimeout(saveSoon.timer);
  saveSoon.timer = setTimeout(saveOptions, 350);
}

async function saveOptions() {
  collectSettingsFromControls();
  const payload = structuredCloneSafe(state.settings);
  localStorage.setItem(OPTION_KEY, JSON.stringify(payload));
}

function handleSettingsChanged() {
  collectSettingsFromControls();
  renderPreview();
  saveSoon();
}

function bindSectionEditorEvents() {
  document.querySelectorAll('[data-action="section-title"]').forEach(el => el.addEventListener('input', e => {
    const section = state.settings.sections.find(s => s.id === e.target.dataset.section);
    if (!section) return;
    section.title = e.target.value; renderPreview(); saveSoon();
  }));
  document.querySelectorAll('[data-action="field-label"]').forEach(el => el.addEventListener('input', e => {
    const field = findField(e.target.dataset.section, e.target.dataset.field);
    if (!field) return;
    field.label = e.target.value; renderPreview(); saveSoon();
  }));
  document.querySelectorAll('[data-action="field-column"]').forEach(el => el.addEventListener('change', e => {
    const field = findField(e.target.dataset.section, e.target.dataset.field);
    if (!field) return;
    field.column = e.target.value; renderPreview(); saveSoon();
  }));
  document.querySelectorAll('[data-action="add-field"]').forEach(el => el.addEventListener('click', e => {
    const section = state.settings.sections.find(s => s.id === e.target.dataset.section);
    if (!section) return;
    section.fields.push({ id: uid(), label: 'Nouveau champ', column: state.columns[0] || '' });
    refreshEditorsAndPreview(); saveSoon();
  }));
  document.querySelectorAll('[data-action="remove-field"]').forEach(el => el.addEventListener('click', e => {
    const section = state.settings.sections.find(s => s.id === e.target.dataset.section);
    if (!section) return;
    section.fields = section.fields.filter(f => f.id !== e.target.dataset.field);
    refreshEditorsAndPreview(); saveSoon();
  }));
  document.querySelectorAll('[data-action="remove-section"]').forEach(el => el.addEventListener('click', e => {
    if (state.settings.sections.length === 1) return;
    state.settings.sections = state.settings.sections.filter(s => s.id !== e.target.dataset.section);
    refreshEditorsAndPreview(); saveSoon();
  }));
}

function refreshEditorsAndPreview() { renderSectionsEditor(); renderPreview(); }

function bindGlobalControls() {
  ['docTitle','docSubtitle','primaryColor','accentColor','titleFont','bodyFont','logoMode','logoUrl','logoWidth','logoHeight','docTitleSize','sectionTitleSize','fieldLabelSize','fieldValueSize','rowGap','sectionGap']
    .forEach(id => $(id).addEventListener('input', handleSettingsChanged));
  $('logoMode').addEventListener('change', handleSettingsChanged);
  $('logoFile').addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) { state.settings.logoDataUrl = ''; renderPreview(); saveSoon(); return; }
    const reader = new FileReader();
    reader.onload = () => { state.settings.logoDataUrl = reader.result; state.settings.logoMode = 'upload'; applySettingsToControls(); renderPreview(); saveSoon(); };
    reader.readAsDataURL(file);
  });
  $('addSectionBtn').addEventListener('click', () => {
    state.settings.sections.push({ id: uid(), title: 'Nouvelle section', fields: [{ id: uid(), label: 'Nouveau champ', column: state.columns[0] || '' }] });
    refreshEditorsAndPreview(); saveSoon();
  });
  $('resetTemplateBtn').addEventListener('click', () => { state.settings.sections = DEFAULT_TEMPLATE(); refreshEditorsAndPreview(); saveSoon(); });
  $('toggleSidebarBtn').addEventListener('click', () => {
    $('app').classList.toggle('sidebar-hidden');
    state.settings.sidebarHidden = $('app').classList.contains('sidebar-hidden');
    $('toggleSidebarBtn').textContent = state.settings.sidebarHidden ? 'Afficher le panneau' : 'Masquer le panneau';
    saveSoon();
  });
  $('prevRecordBtn').addEventListener('click', () => selectRecordByIndex(state.currentIndex - 1));
  $('nextRecordBtn').addEventListener('click', () => selectRecordByIndex(state.currentIndex + 1));
  $('printCurrentBtn').addEventListener('click', () => window.print());
  $('printAllBtn').addEventListener('click', printAllRecords);
  $('exportSeparateBtn').addEventListener('click', exportSeparatePdfs);
}

async function selectRecordByIndex(index) {
  if (!state.records.length) return;
  state.currentIndex = Math.min(state.records.length - 1, Math.max(0, index));
  state.record = state.records[state.currentIndex];
  renderPreview();
  const rowId = getRecordId(state.record);
  if (rowId && typeof grist !== 'undefined' && grist.setCursorPos) {
    try { await grist.setCursorPos({ rowId }); } catch (err) { console.warn('Navigation locale seulement : setCursorPos non disponible.', err); }
  }
}

function inferColumnsFromRecord(record) { return record ? Object.keys(record).filter(k => k !== 'id' && k !== 'manualSort') : []; }

function loadFromLocalStorage() {
  try { return JSON.parse(localStorage.getItem(OPTION_KEY) || 'null'); } catch { return null; }
}

function mergeSettings(saved) {
  if (!saved) return;
  state.settings = { ...structuredCloneSafe(DEFAULT_SETTINGS), ...saved, sections: saved.sections || DEFAULT_TEMPLATE() };
  applySettingsToControls();
  renderSectionsEditor();
  renderPreview();
}

function connectGrist() {
  mergeSettings(loadFromLocalStorage());

  if (typeof grist === 'undefined') {
    setStatus('Mode autonome : hors Grist. Sauvegarde locale navigateur uniquement.');
    return;
  }

  grist.ready({ requiredAccess: 'read table' });

  grist.onRecord(record => {
    if (!record) { setStatus('Aucune ligne active sélectionnée dans Grist.'); return; }
    state.record = record;
    const rowId = getRecordId(record);
    const idx = rowId && state.records.length ? state.records.findIndex(r => getRecordId(r) === rowId) : -1;
    if (idx >= 0) state.currentIndex = idx;
    const inferred = inferColumnsFromRecord(record);
    if (inferred.length && !state.columns.length) { state.columns = inferred; renderSectionsEditor(); }
    setStatus(`Connecté à Grist. Ligne active chargée avec ${Object.keys(record).length} champ(s).`);
    renderPreview();
  });

  grist.onRecords(records => {
    if (!Array.isArray(records) || !records.length) return;
    state.records = records;
    const currentId = getRecordId(state.record);
    const idx = currentId ? records.findIndex(r => getRecordId(r) === currentId) : -1;
    state.currentIndex = idx >= 0 ? idx : 0;
    state.record = records[state.currentIndex];
    const inferred = inferColumnsFromRecord(records[0]);
    if (inferred.length) state.columns = inferred;
    setStatus(`Connecté à Grist. ${records.length} enregistrement(s) disponible(s).`);
    refreshEditorsAndPreview();
  });
}

function recordsForExport() {
  if (state.records.length) return state.records;
  return state.record ? [state.record] : [];
}

function printAllRecords() {
  const records = recordsForExport();
  if (!records.length) return;
  $('printHost').innerHTML = records.map(record => buildPaperHtml(record)).join('');
  $('previewHost').querySelector('.paper')?.classList.add('export-hidden');
  window.print();
  setTimeout(() => { $('printHost').innerHTML = ''; $('previewHost').querySelector('.paper')?.classList.remove('export-hidden'); }, 500);
}

function safeFileName(value, fallback = 'fiche-instance') {
  return normalizeText(value || fallback).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '_').slice(0, 80) || fallback;
}

async function exportSeparatePdfs() {
  const records = recordsForExport();
  if (!records.length || typeof html2pdf === 'undefined') { printAllRecords(); return; }
  setStatus(`Export PDF séparés : ${records.length} fichier(s) à générer.`);
  for (let i = 0; i < records.length; i++) {
    const wrap = document.createElement('div');
    wrap.innerHTML = buildPaperHtml(records[i]);
    document.body.appendChild(wrap);
    const nameSource = getRecordValue(records[i], 'Nom complet') || getRecordValue(records[i], 'Nom') || `${state.settings.docTitle}-${i + 1}`;
    await html2pdf().set({
      margin: 0,
      filename: `${safeFileName(nameSource)}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    }).from(wrap.querySelector('.paper')).save();
    document.body.removeChild(wrap);
  }
  setStatus(`Export PDF séparés terminé : ${records.length} fichier(s).`);
}

bindGlobalControls();
applySettingsToControls();
renderSectionsEditor();
renderPreview();
connectGrist();
