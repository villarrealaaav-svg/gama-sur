/* ════════════════════════════════════════════════════════════
   GAMA SUR — Launcher de Herramientas
   Lógica + datos. Para agregar una herramienta fija, edita
   INITIAL_APPS abajo (campos: id, name, nameItalic, desc, icon,
   color, iconBg, url, badge, badgeLabel, cat, tags).
   ════════════════════════════════════════════════════════════ */

/* ── Categorías (grupos visibles — punto 8) ── */
const CATEGORIES = [
  { id: 'comercial',  label: 'Comercial' },
  { id: 'operacion',  label: 'Operación' },
  { id: 'clientes',   label: 'Clientes' },
  { id: 'proximas',   label: 'Próximamente' }
];

/* ── Herramientas activas ── */
const INITIAL_APPS = [
  {
    id: "precios-cotizador",
    name: "Gestor de", nameItalic: "Precios",
    desc: "Cotiza materiales IMPAC, FANOSA, NOVIDESA y KEMIX con firma profesional.",
    icon: "💰", color: "#1e3a5f", iconBg: "#eef2f8",
    url: "precios.html",
    badge: "freq", badgeLabel: "Uso frecuente",
    cat: "comercial",
    tags: ["cotizador","precios","materiales","impac","fanosa","novidesa","kemix"]
  },
  {
    id: "cotizador-trabajos",
    name: "Cotizador de", nameItalic: "Trabajos",
    desc: "Presupuestos de mano de obra y trabajos de construcción.",
    icon: "🔨", color: "#0f7173", iconBg: "#e8f4f4",
    url: "cotizador-trabajos.html",
    badge: "live", badgeLabel: "En vivo",
    cat: "comercial",
    tags: ["cotizador","presupuesto","obra","mano de obra","trabajos"]
  },
  {
    id: "benchmark-losas",
    name: "Benchmark", nameItalic: "Sistemas de Losa",
    desc: "Compara 10 sistemas de losa por precio y rendimiento. APU 2026.",
    icon: "🏗️", color: "#1e4d8b", iconBg: "#EFF6FF",
    url: "benchmark-losas.html",
    badge: "new", badgeLabel: "Nuevo",
    cat: "comercial",
    tags: ["benchmark","losa","comparador","apu","sistemas constructivos"]
  },
  {
    id: "cuantificador-amenidades",
    name: "Cuantificador", nameItalic: "Makros",
    desc: "Calcula material por proyecto. Pedido Novidesa y prefactura integrados.",
    icon: "📐", color: "#0f4c75", iconBg: "#e8f4f8",
    url: "cuantificador-amenidades.html",
    badge: "new", badgeLabel: "Nuevo",
    cat: "operacion",
    tags: ["cuantificador","material","prefactura","pedido","novidesa","makros","amenidades"]
  },
  {
    id: "logistica-3d",
    name: "Logística", nameItalic: "3D",
    desc: "Acomodo de carga y cálculo de viajes desde el despiece del cuantificador.",
    icon: "🚚", color: "#1e4d8b", iconBg: "#EFF6FF",
    url: "logistica-3d.html",
    badge: "new", badgeLabel: "Nuevo",
    cat: "operacion",
    tags: ["logistica","carga","viajes","camion","remolque","despiece","3d","acomodo"]
  },
  {
    id: "dashboard-proyectos",
    name: "Dashboard de", nameItalic: "Proyectos",
    desc: "Panorama de proyectos: KPIs, montos cotizados, estados y mapa de lotes.",
    icon: "📊", color: "#2e5496", iconBg: "#eaf0fa",
    url: "dashboard-proyectos.html",
    badge: "new", badgeLabel: "Nuevo",
    cat: "operacion",
    tags: ["dashboard","proyectos","kpi","panel","montos","estados","palmarena","mapa","lotes","gerencia"]
  },
  {
    id: "clientes",
    name: "Directorio de", nameItalic: "Clientes",
    desc: "Guarda clientes una vez. Se autocompletan en todas las cotizaciones.",
    icon: "👥", color: "#c2622a", iconBg: "#f7ede5",
    url: "clientes.html",
    badge: "freq", badgeLabel: "Uso frecuente",
    cat: "clientes",
    tags: ["clientes","directorio","contactos","crm"]
  }
];

/* ── Roadmap (no clickeable) ── */
const ROADMAP = [
  {
    id: "rm-calcs",
    name: "Calculadora de", nameItalic: "Materiales",
    desc: "Área, volumen y rendimiento por tipo de producto.",
    icon: "📐", color: "#0f7173", iconBg: "#e8f4f4",
    badge: "soon", badgeLabel: "Próximamente",
    cat: "proximas",
    tags: ["calculadora","materiales","area","volumen"]
  },
  {
    id: "rm-inventario",
    name: "Control de", nameItalic: "Inventario",
    desc: "Existencias, stock mínimo y movimientos por producto.",
    icon: "📦", color: "#6d28d9", iconBg: "#f0ecfc",
    badge: "soon", badgeLabel: "Próximamente",
    cat: "proximas",
    tags: ["inventario","stock","existencias","almacen"]
  }
];

/* ════════════════════════════════════════
   STATE
════════════════════════════════════════ */
const STORE = 'gamasur_lobby_v2';
var customApps = [];
var activeFilter = 'all';
var searchTerm = '';

function load(){
  try{
    const d = JSON.parse(localStorage.getItem(STORE)||'[]');
    if(Array.isArray(d)) customApps = d;
  }catch(e){}
}
function save(){
  try{ localStorage.setItem(STORE, JSON.stringify(customApps)); }catch(e){}
}

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function badgeClassFor(b){
  switch(b){
    case 'live':    return 'badge-live';
    case 'new':     return 'badge-new';
    case 'beta':    return 'badge-beta';
    case 'freq':    return 'badge-freq';
    case 'updated': return 'badge-updated';
    default:        return 'badge-soon';
  }
}
function isLiveApp(app){ return app.badge !== 'soon'; }

/* Texto buscable de una app */
function searchHay(app){
  return [app.name, app.nameItalic, app.desc, (app.tags||[]).join(' ')]
    .join(' ').toLowerCase();
}
function matchesSearch(app){
  if(!searchTerm) return true;
  return searchHay(app).indexOf(searchTerm) !== -1;
}
function matchesFilter(app){
  if(activeFilter === 'all') return true;
  return app.cat === activeFilter;
}

/* ════════════════════════════════════════
   RENDER
════════════════════════════════════════ */
function buildCard(app){
  const live = isLiveApp(app);
  const isCustom = customApps.indexOf(app) !== -1;

  const chevron = live
    ? `<span class="chevron" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9,18 15,12 9,6"/></svg></span>`
    : '';

  const delBtn = isCustom
    ? `<button class="del-btn" aria-label="Eliminar ${esc(app.nameItalic||app.name)} del menú" onclick="event.stopPropagation();delApp('${app.id}')" style="padding:3px 7px;border-radius:5px;font-size:11px;color:#a09c96;background:none;border:1px solid #e0dbd2;cursor:pointer;transition:all .15s" onmouseover="this.style.color='#c0392b'" onmouseout="this.style.color='#a09c96'">✕</button>`
    : '';

  const fullName = [app.name, app.nameItalic].filter(Boolean).join(' ');
  const clickAttr = (live && app.url) ? `onclick="openApp('${esc(app.url)}')"` : '';
  const a11y = (live && app.url)
    ? `role="link" tabindex="0" aria-label="Abrir ${esc(fullName)}" onkeydown="cardKey(event,'${esc(app.url)}')"`
    : `aria-disabled="true"`;

  return `
  <div class="app-card ${live?'':'soon'}" id="card-${app.id}" data-cat="${esc(app.cat||'')}"
    style="--card-color:${app.color||'var(--navy)'};--icon-bg:${app.iconBg||'#eef3f9'}"
    ${clickAttr} ${a11y}>
    <div class="card-icon" aria-hidden="true">${app.icon||'📄'}</div>
    <div class="card-content">
      <div class="card-name">
        ${app.name ? esc(app.name) : ''}
        ${app.nameItalic ? `<em>${esc(app.nameItalic)}</em>` : ''}
      </div>
      <div class="card-desc">${esc(app.desc||'')}</div>
    </div>
    <div class="card-right">
      ${delBtn}
      <span class="badge ${badgeClassFor(app.badge)}">${esc(app.badgeLabel||'')}</span>
      ${chevron}
    </div>
  </div>`;
}

function render(){
  const host = document.getElementById('groups');
  const all = [...INITIAL_APPS, ...customApps, ...ROADMAP];

  // custom apps sin cat → "comercial" por defecto
  all.forEach(a=>{ if(!a.cat) a.cat = 'comercial'; });

  let visible = 0;
  let html = '';
  CATEGORIES.forEach(catObj=>{
    const inCat = all.filter(a => (a.cat||'comercial') === catObj.id && matchesFilter(a) && matchesSearch(a));
    if(!inCat.length) return;
    visible += inCat.length;
    html += `<section class="cat-group" aria-label="${esc(catObj.label)}">
      <div class="sec-label">${esc(catObj.label)}</div>
      <div class="app-list">${inCat.map(buildCard).join('')}</div>
    </section>`;
  });

  host.innerHTML = html;
  document.getElementById('noResults').classList.toggle('show', visible === 0);
}

/* ════════════════════════════════════════
   BÚSQUEDA + FILTROS (punto 2)
════════════════════════════════════════ */
function onSearch(val){
  searchTerm = (val||'').trim().toLowerCase();
  document.getElementById('searchClear').classList.toggle('show', !!searchTerm);
  render();
}
function clearSearch(){
  const inp = document.getElementById('searchInput');
  inp.value=''; searchTerm='';
  document.getElementById('searchClear').classList.remove('show');
  render(); inp.focus();
}
function setFilter(cat, btn){
  activeFilter = cat;
  document.querySelectorAll('.filter-chip').forEach(c=>{
    const on = c === btn;
    c.classList.toggle('active', on);
    c.setAttribute('aria-pressed', on ? 'true':'false');
  });
  render();
}

/* ════════════════════════════════════════
   NAVEGACIÓN (+ teclado — punto 9)
════════════════════════════════════════ */
function openApp(url){ window.location.href = url; }
function cardKey(e, url){
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openApp(url); }
}

/* ════════════════════════════════════════
   ALTA / BAJA (punto 3 — acceso local)
════════════════════════════════════════ */
function openModal(){
  const ov = document.getElementById('overlay');
  ov.classList.add('open');
  const f = document.getElementById('fName'); if(f) f.focus();
}
function closeModal(){ document.getElementById('overlay').classList.remove('open'); }
function handleOverlayClick(e){ if(e.target===e.currentTarget) closeModal(); }

function addApp(){
  const name  = document.getElementById('fName').value.trim();
  const desc  = document.getElementById('fDesc').value.trim();
  const url   = document.getElementById('fUrl').value.trim();
  const icon  = document.getElementById('fIcon').value.trim() || '📄';
  const color = document.getElementById('fColor').value;
  if(!name){ toast('El nombre es obligatorio','error'); return; }

  const parts = name.split(' ');
  const italic = parts.pop();
  const base   = parts.join(' ');

  customApps.push({
    id: 'c-'+Date.now(),
    name: base, nameItalic: italic,
    desc, url, icon, color,
    iconBg: '#f0f4f9',
    badge: url ? 'live' : 'soon',
    badgeLabel: url ? 'En vivo' : 'Próximamente',
    cat: 'comercial',
    tags: [base.toLowerCase(), italic.toLowerCase(), desc.toLowerCase()]
  });
  save();
  render();
  closeModal();
  ['fName','fDesc','fUrl','fIcon'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  toast('Acceso local agregado (solo en este dispositivo)','success');
}

function delApp(id){
  if(!confirm('¿Eliminar del menú?')) return;
  customApps = customApps.filter(a=>a.id!==id);
  save();
  render();
  toast('Eliminada');
}

/* ════════════════════════════════════════
   LOGO (sincronizado vía Firebase)
════════════════════════════════════════ */
const LOGO_KEY = 'gamasur_logo_global';   // mismo logo para TODAS las apps del origen
const FB = { apiKey:"AIzaSyB0txTXmZEvYQX-uKvnJ6SVnP-yfeyhfBc", databaseURL:"https://launcher-gama-sur-default-rtdb.firebaseio.com" };
var fireDb=null;
function initFirebase(){
  if(typeof firebase==='undefined') return;
  try{
    if(!firebase.apps.length) firebase.initializeApp(FB);
    fireDb=firebase.database();
    fireDb.ref('gamasur/logo').on('value', snap=>{
      const v=snap.val(); if(!v) return;
      try{ localStorage.setItem(LOGO_KEY, v); }catch(e){}
      setLogo(v);
    });
    const local=(function(){try{return localStorage.getItem(LOGO_KEY);}catch(e){return null;}})();
    if(local) fireDb.ref('gamasur/logo').once('value').then(s=>{ if(!s.val()) fireDb.ref('gamasur/logo').set(local).catch(()=>{}); });
  }catch(e){ console.warn('Firebase init:', e); }
}
function handleLogo(input){
  const file = input.files[0];
  if(!file) return;
  const r = new FileReader();
  r.onload = e => {
    setLogo(e.target.result);
    try{ localStorage.setItem(LOGO_KEY, e.target.result); }catch(err){ toast('Logo muy pesado. Usa una imagen más liviana.','error'); }
    if(fireDb){ try{ fireDb.ref('gamasur/logo').set(e.target.result); }catch(e2){} }
    toast('Logo actualizado (se usa en todas las apps)','success');
  };
  r.readAsDataURL(file);
  input.value='';
}
function setLogo(src){
  const img=document.getElementById('logoImg');
  const txt=document.getElementById('logoTxt');
  if(img){ img.src=src; img.style.display=''; }
  if(txt) txt.style.display='none';
}
function loadLogo(){
  try{
    const src = localStorage.getItem(LOGO_KEY) || localStorage.getItem('gamasur_lobby_logo');
    if(src){ setLogo(src); try{ localStorage.setItem(LOGO_KEY, src); }catch(e){} }
  }catch(e){}
}
function logoKey(e){
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); document.getElementById('logoFile').click(); }
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
function toast(msg, type='info'){
  const c=document.getElementById('toast');
  const el=document.createElement('div');
  el.className=`toast-item ${type}`;
  el.textContent=msg;
  c.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(()=>el.remove(),300); },3000);
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  load();
  loadLogo();
  render();
  initFirebase();
  // ESC cierra modal
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape') closeModal();
  });
});
