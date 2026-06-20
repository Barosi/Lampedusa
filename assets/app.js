/* ============================================================
   Lampedusa Trip Planner — app.js  (vanilla JS, nessuna dipendenza)
   Persistenza: localStorage per i dati strutturati, IndexedDB per i PDF.
   Fallback in memoria se lo storage non è disponibile (es. anteprima).
   ============================================================ */

/* ---------------- Config viaggio ---------------- */
const TRIP = {
  nome: "Lampedusa",
  start: "2026-08-09",
  end: "2026-08-15",
  valuta: "EUR",
};

/* ---------------- Icone (inline SVG) ---------------- */
const I = {
  home:   '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  euro:   '<path d="M15 7a5 5 0 1 0 0 10M5 10h8M5 14h8"/>',
  plane:  '<path d="M21 15l-8-3V5a2 2 0 0 0-4 0v7l-6 2v2l6-1v3l-2 1v1l4-1 4 1v-1l-2-1v-3l6 1z"/>',
  route:  '<path d="M9 6H6a3 3 0 0 0 0 6h12a3 3 0 0 1 0 6h-3"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/>',
  doc:    '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  fork:   '<path d="M7 3v7a2 2 0 0 0 4 0V3M9 12v9M16 3c-1.5 0-2 2-2 5s.5 4 2 4v9"/>',
  glass:  '<path d="M5 3h14l-6 8v7M5 3l6 8M9 21h6"/>',
  beach:  '<circle cx="8" cy="8" r="3"/><path d="M8 11v2M3 21c1.5-1 3-1.5 4.5-1.5S10 20 11 21M5 16h12a4 4 0 0 0-12 0z" /><path d="M16 3l4 2-2 4"/>',
  plus:   '<path d="M12 5v14M5 12h14"/>',
  edit:   '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash:  '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  star:   '<path d="M12 2l3 6.5 7 .8-5 4.7 1.3 7L12 17.8 5.7 21l1.3-7-5-4.7 7-.8z"/>',
  pin:    '<path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  upload: '<path d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"/>',
  check:  '<path d="M20 6L9 17l-5-5"/>',
  ext:    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>',
  clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
function svg(path, w) { return `<svg viewBox="0 0 24 24" width="${w||18}" height="${w||18}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`; }

/* ---------------- Storage layer ---------------- */
const KEY = "lampedusa_trip_v1";
let STORAGE_OK = true;
let memBlob = {}; // fallback PDF in memoria

(function testStorage() {
  try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); }
  catch (e) { STORAGE_OK = false; }
})();

function loadState() {
  if (STORAGE_OK) {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); }
    catch (e) { /* corrotto: si riparte dai default */ }
  }
  if (!STORAGE_OK && window.__memState) return window.__memState;
  return null;
}
function saveState() {
  if (STORAGE_OK) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { STORAGE_OK = false; updateStorageNote(); }
  } else {
    window.__memState = state;
  }
}

/* IndexedDB per i PDF (blob), con fallback in memoria */
const IDB = {
  db: null,
  ready: false,
  async open() {
    if (!("indexedDB" in window)) return false;
    return new Promise((res) => {
      try {
        const req = indexedDB.open("lampedusa_docs", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("pdf");
        req.onsuccess = () => { this.db = req.result; this.ready = true; res(true); };
        req.onerror = () => res(false);
      } catch (e) { res(false); }
    });
  },
  async put(id, blob) {
    if (this.ready) {
      return new Promise((res, rej) => {
        const tx = this.db.transaction("pdf", "readwrite");
        tx.objectStore("pdf").put(blob, id);
        tx.oncomplete = () => res(true); tx.onerror = () => rej(tx.error);
      });
    }
    memBlob[id] = blob; return true;
  },
  async get(id) {
    if (this.ready) {
      return new Promise((res) => {
        const tx = this.db.transaction("pdf", "readonly");
        const r = tx.objectStore("pdf").get(id);
        r.onsuccess = () => res(r.result || null); r.onerror = () => res(null);
      });
    }
    return memBlob[id] || null;
  },
  async del(id) {
    if (this.ready) {
      return new Promise((res) => {
        const tx = this.db.transaction("pdf", "readwrite");
        tx.objectStore("pdf").delete(id);
        tx.oncomplete = () => res(true); tx.onerror = () => res(false);
      });
    }
    delete memBlob[id]; return true;
  },
};

/* ---------------- Dati di default ---------------- */
function defaultState() {
  const giorni = eachDay(TRIP.start, TRIP.end).map((d, i) => ({
    data: d,
    titolo: i === 0 ? "Arrivo a Lampedusa" : (isLast(d) ? "Rientro" : ""),
    attivita: [],
  }));

  return {
    budgetTotale: 1600,
    budget: [
      { id: uid(), nome: "Voli", pianificato: 380, speso: 0, colore: "#0e7c86" },
      { id: uid(), nome: "Alloggio", pianificato: 560, speso: 0, colore: "#16b1ac" },
      { id: uid(), nome: "Cibo & Ristoranti", pianificato: 280, speso: 0, colore: "#ff6b5c" },
      { id: uid(), nome: "Barca & Escursioni", pianificato: 180, speso: 0, colore: "#ffce4f" },
      { id: uid(), nome: "Noleggio scooter/auto", pianificato: 120, speso: 0, colore: "#7fe9de" },
      { id: uid(), nome: "Extra", pianificato: 80, speso: 0, colore: "#7d949b" },
    ],
    voli: [
      { id: uid(), tipo: "Andata", compagnia: "", numero: "", da: "", daCity: "", a: "LMP", aCity: "Lampedusa", data: TRIP.start, partenza: "", arrivo: "", prezzo: 0, prenotazione: "", note: "" },
      { id: uid(), tipo: "Ritorno", compagnia: "", numero: "", da: "LMP", daCity: "Lampedusa", a: "", aCity: "", data: TRIP.end, partenza: "", arrivo: "", prezzo: 0, prenotazione: "", note: "" },
    ],
    giorni,
    documenti: [],
    ristoranti: [],
    aperitivi: [],
    // spiagge note dell'isola, pre-caricate e modificabili/eliminabili
    spiagge: [
      { id: uid(), nome: "Spiaggia dei Conigli", zona: "Isola dei Conigli", tipo: "Sabbia", note: "Riserva naturale, area protetta delle tartarughe Caretta caretta. Accesso a piedi.", link: "", rating: 0, preferito: true, fatto: false },
      { id: uid(), nome: "Cala Pulcino", zona: "Sud-ovest", tipo: "Ghiaia / scogli", note: "Si raggiunge con sentiero o via mare.", link: "", rating: 0, preferito: false, fatto: false },
      { id: uid(), nome: "Cala Croce", zona: "Vicino al paese", tipo: "Sabbia", note: "Comoda e vicina al centro.", link: "", rating: 0, preferito: false, fatto: false },
      { id: uid(), nome: "Cala Madonna", zona: "Sud", tipo: "Scogli", note: "", link: "", rating: 0, preferito: false, fatto: false },
      { id: uid(), nome: "Cala Galera", zona: "Ovest", tipo: "Ghiaia", note: "Sentiero nella macchia mediterranea.", link: "", rating: 0, preferito: false, fatto: false },
      { id: uid(), nome: "La Tabaccara", zona: "Sud-ovest", tipo: "Mare aperto", note: "Acqua trasparente, spesso raggiunta in barca.", link: "", rating: 0, preferito: true, fatto: false },
      { id: uid(), nome: "Spiaggia della Guitgia", zona: "Paese", tipo: "Sabbia", note: "In paese, servizi vicini.", link: "", rating: 0, preferito: false, fatto: false },
      { id: uid(), nome: "Mare Morto", zona: "Vicino Guitgia", tipo: "Sabbia", note: "Acqua bassa e calma, adatta per relax.", link: "", rating: 0, preferito: false, fatto: false },
    ],
  };
}

/* ---------------- Utility ---------------- */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function eachDay(a, b) {
  const out = []; const d = new Date(a + "T00:00:00"); const end = new Date(b + "T00:00:00");
  while (d <= end) { out.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1); }
  return out;
}
function isLast(d) { return d === TRIP.end; }
const MESI = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const GIORNI = ["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"];
function fmtDate(iso, opt) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  const s = `${d.getDate()} ${MESI[d.getMonth()]}`;
  if (opt === "full") return `${GIORNI[d.getDay()]} ${s}`;
  if (opt === "year") return `${s} ${d.getFullYear()}`;
  return s;
}
function eur(n) { return new Intl.NumberFormat("it-IT", { style: "currency", currency: TRIP.valuta, maximumFractionDigits: 0 }).format(Math.round(n || 0)); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function daysUntil(iso) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const t = new Date(iso + "T00:00:00");
  return Math.round((t - today) / 86400000);
}
function bytes(n) { if (n < 1024) return n + " B"; if (n < 1048576) return (n / 1024).toFixed(0) + " KB"; return (n / 1048576).toFixed(1) + " MB"; }

/* ---------------- Stato globale ---------------- */
let state = loadState() || defaultState();
// migrazione leggera: garantisce le chiavi attese
["budget","voli","giorni","documenti","ristoranti","aperitivi","spiagge"].forEach((k) => { if (!Array.isArray(state[k])) state[k] = defaultState()[k]; });
if (typeof state.budgetTotale !== "number") state.budgetTotale = 1600;

/* ---------------- Navigazione ---------------- */
const VIEWS = [
  { id: "panoramica", label: "Panoramica", icon: I.home,  render: renderPanoramica },
  { id: "budget",     label: "Budget",     icon: I.euro,  render: renderBudget },
  { id: "voli",       label: "Voli",       icon: I.plane, render: renderVoli },
  { id: "itinerario", label: "Itinerario", icon: I.route, render: renderItinerario },
  { id: "documenti",  label: "Documenti",  icon: I.doc,   render: renderDocumenti },
  { id: "ristoranti", label: "Ristoranti", icon: I.fork,  render: () => renderPlaces("ristoranti") },
  { id: "aperitivi",  label: "Aperitivi",  icon: I.glass, render: () => renderPlaces("aperitivi") },
  { id: "spiagge",    label: "Spiagge",    icon: I.beach, render: () => renderPlaces("spiagge") },
];
let current = "panoramica";

function buildNav() {
  const counts = {
    documenti: state.documenti.length, ristoranti: state.ristoranti.length,
    aperitivi: state.aperitivi.length, spiagge: state.spiagge.length,
  };
  document.getElementById("nav").innerHTML = VIEWS.map((v) => {
    const badge = counts[v.id] ? `<span class="badge">${counts[v.id]}</span>` : "";
    return `<button data-view="${v.id}" class="${v.id === current ? "active" : ""}">${svg(v.icon)} ${v.label} ${badge}</button>`;
  }).join("");
}
function go(id) {
  current = id;
  buildNav();
  const v = VIEWS.find((x) => x.id === id);
  document.getElementById("view").innerHTML = v.render();
  window.scrollTo(0, 0);
  closeSidebar();
}

/* ============================================================
   VISTE
   ============================================================ */

function renderPanoramica() {
  const speso = state.budget.reduce((s, b) => s + (+b.speso || 0), 0);
  const pian = state.budget.reduce((s, b) => s + (+b.pianificato || 0), 0);
  const attivitaTot = state.giorni.reduce((s, g) => s + g.attivita.length, 0);
  const fattiSpiagge = state.spiagge.filter((s) => s.fatto).length;
  const dleft = daysUntil(TRIP.start);
  const countdown = dleft > 0 ? `${dleft}` : (dleft === 0 ? "Oggi!" : "in corso");
  const cdLabel = dleft > 0 ? `<small>giorni</small>` : "";

  const sezioni = [
    { id: "budget", label: "Apri budget", icon: I.euro, txt: `${eur(speso)} di ${eur(state.budgetTotale)}` },
    { id: "voli", label: "Apri voli", icon: I.plane, txt: state.voli.filter(v=>v.compagnia||v.partenza).length ? "Voli inseriti" : "Da compilare" },
    { id: "itinerario", label: "Apri itinerario", icon: I.route, txt: `${attivitaTot} attività` },
    { id: "documenti", label: "Apri documenti", icon: I.doc, txt: `${state.documenti.length} PDF` },
  ];

  // prossime attività
  const tutte = [];
  state.giorni.forEach((g) => g.attivita.forEach((a) => tutte.push({ ...a, data: g.data })));
  tutte.sort((a, b) => (a.data + (a.ora || "")).localeCompare(b.data + (b.ora || "")));
  const prossime = tutte.slice(0, 5);

  const preferiti = [...state.ristoranti, ...state.aperitivi, ...state.spiagge].filter((p) => p.preferito).slice(0, 6);

  return `
  <div class="hero">
    <div class="place">${svg(I.pin,13)} Pelagie · Sicilia</div>
    <h1>${esc(TRIP.nome)}</h1>
    <div class="dates">${fmtDate(TRIP.start,"full")} → ${fmtDate(TRIP.end,"full")} 2026 · 7 giorni</div>
    <div class="hero-grid">
      <div class="hero-stat"><div class="k">Partenza tra</div><div class="v tnum">${countdown} ${cdLabel}</div></div>
      <div class="hero-stat"><div class="k">Budget</div><div class="v tnum">${eur(state.budgetTotale)}</div></div>
      <div class="hero-stat"><div class="k">Speso</div><div class="v tnum">${eur(speso)}</div></div>
      <div class="hero-stat"><div class="k">Spiagge fatte</div><div class="v tnum">${fattiSpiagge}/${state.spiagge.length}</div></div>
    </div>
  </div>

  <div class="grid cols-2">
    ${sezioni.map((s) => `
      <button class="card" style="text-align:left;border:1px solid var(--line)" data-go="${s.id}">
        <div class="card-head"><h3>${VIEWS.find(v=>v.id===s.id).label}</h3><span style="color:var(--turquoise)">${svg(s.icon,20)}</span></div>
        <div style="color:var(--ink-soft);font-size:14px">${esc(s.txt)}</div>
      </button>`).join("")}
  </div>

  <div class="section-head"><h2>Prossime attività</h2><span class="count">${tutte.length} in programma</span></div>
  ${prossime.length ? `<div class="card">${prossime.map((a) => `
    <div class="act" style="grid-template-columns:120px 1fr">
      <div><div class="at">${esc(a.ora || "—")}</div><div style="font-size:11px;color:var(--muted)">${fmtDate(a.data)}</div></div>
      <div><div class="atitle">${esc(a.titolo)}</div>${a.luogo ? `<div class="aloc">${svg(I.pin,12)} ${esc(a.luogo)}</div>` : ""}</div>
    </div>`).join("")}</div>`
    : emptyState(I.route, "Nessuna attività ancora", "Aggiungi qualcosa nell'itinerario per vederla qui.")}

  ${preferiti.length ? `
  <div class="section-head"><h2>I tuoi preferiti</h2><span class="count">da non perdere</span></div>
  <div class="places">${preferiti.map((p) => `
    <div class="place"><div class="ptop"><div class="pname"><h4>${esc(p.nome)}</h4><div class="zona">${esc(p.zona || "")}</div></div><span class="fav on">${svg(I.star,18)}</span></div>${p.note?`<div class="pnote">${esc(p.note)}</div>`:""}</div>`).join("")}</div>` : ""}
  `;
}

/* ---------------- Budget ---------------- */
function renderBudget() {
  const speso = state.budget.reduce((s, b) => s + (+b.speso || 0), 0);
  const pian = state.budget.reduce((s, b) => s + (+b.pianificato || 0), 0);
  const tot = state.budgetTotale;
  const pct = tot > 0 ? Math.min(100, (speso / tot) * 100) : 0;
  const over = speso > tot;

  return `
  <div class="view-head">
    <div class="eyebrow">Soldi</div>
    <h1>Budget</h1>
    <p>Imposta un tetto di spesa e tieni traccia di pianificato e speso per categoria. Tutto modificabile.</p>
  </div>

  <div class="grid cols-3" style="margin-bottom:24px">
    <div class="card"><div class="k" style="color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.06em">Budget totale</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:6px"><div class="tnum" style="font-family:var(--font-display);font-size:30px">${eur(tot)}</div>
      <button class="btn sm icon" data-edit-total title="Modifica budget">${svg(I.edit,15)}</button></div></div>
    <div class="card"><div class="k" style="color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.06em">Speso</div>
      <div class="tnum" style="font-family:var(--font-display);font-size:30px;margin-top:6px;color:${over?'var(--coral-deep)':'var(--ink)'}">${eur(speso)}</div></div>
    <div class="card"><div class="k" style="color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.06em">${over?'Sforamento':'Rimanente'}</div>
      <div class="tnum" style="font-family:var(--font-display);font-size:30px;margin-top:6px;color:${over?'var(--coral-deep)':'var(--ok)'}">${eur(Math.abs(tot-speso))}</div></div>
  </div>

  <div class="card" style="margin-bottom:20px">
    <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--ink-soft)"><span>Avanzamento spesa</span><span class="tnum">${pct.toFixed(0)}%${over?' · oltre il budget':''}</span></div>
    <div class="budget-bar ${over?'over':''}"><i style="width:${Math.min(100,pct)}%"></i></div>
    <div style="font-size:12.5px;color:var(--muted);margin-top:8px">Pianificato per categorie: <b class="tnum">${eur(pian)}</b></div>
  </div>

  <div class="section-head"><h2>Categorie</h2>
    <button class="btn primary sm" data-add-budget>${svg(I.plus,15)} Aggiungi categoria</button></div>

  <div class="card" style="padding:8px 10px">
    <table class="bud-table">
      <thead><tr><th>Categoria</th><th class="num">Pianificato</th><th class="num">Speso</th><th class="num">Diff.</th><th></th></tr></thead>
      <tbody>
        ${state.budget.map((b) => {
          const diff = (+b.pianificato||0) - (+b.speso||0);
          return `<tr>
            <td><span class="cat-dot" style="background:${b.colore||'#16b1ac'}"></span>${esc(b.nome)}</td>
            <td class="num tnum">${eur(b.pianificato)}</td>
            <td class="num tnum">${eur(b.speso)}</td>
            <td class="num tnum" style="color:${diff<0?'var(--coral-deep)':'var(--ink-soft)'}">${diff<0?'-':''}${eur(Math.abs(diff))}</td>
            <td class="num"><button class="btn sm icon" data-edit-budget="${b.id}">${svg(I.edit,14)}</button> <button class="btn sm icon danger" data-del-budget="${b.id}">${svg(I.trash,14)}</button></td>
          </tr>`;
        }).join("")}
      </tbody>
      <tfoot class="bud-foot"><tr><td>Totale</td><td class="num tnum">${eur(pian)}</td><td class="num tnum">${eur(speso)}</td><td></td><td></td></tr></tfoot>
    </table>
  </div>`;
}

/* ---------------- Voli ---------------- */
function renderVoli() {
  return `
  <div class="view-head">
    <div class="eyebrow">Spostamenti</div>
    <h1>Voli</h1>
    <p>Lampedusa (LMP) si raggiunge in aereo. Inserisci tratte, orari, codici di prenotazione e prezzi.</p>
  </div>
  <div class="section-head"><h2>Tratte</h2><button class="btn primary sm" data-add-volo>${svg(I.plus,15)} Aggiungi tratta</button></div>
  ${state.voli.length ? state.voli.map(renderVoloCard).join("") : emptyState(I.plane, "Nessun volo inserito", "Aggiungi la tua prima tratta.")}
  `;
}
function renderVoloCard(v) {
  const dash = '<svg viewBox="0 0 60 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 6h44" stroke-dasharray="3 4"/><path d="M44 2l6 4-6 4" /></svg>';
  return `<div class="card">
    <div class="card-head">
      <h3>${esc(v.tipo)} ${v.data?`· <span style="font-weight:500;color:var(--muted);font-size:13px">${fmtDate(v.data,'full')}</span>`:''}</h3>
      <div><button class="btn sm icon" data-edit-volo="${v.id}">${svg(I.edit,14)}</button> <button class="btn sm icon danger" data-del-volo="${v.id}">${svg(I.trash,14)}</button></div>
    </div>
    <div class="flight">
      <div class="ap"><div class="code">${esc(v.da||'—')}</div><div class="city">${esc(v.daCity||'')}</div><div class="time tnum">${esc(v.partenza||'')}</div></div>
      <div class="path">${dash}<small>${esc(v.compagnia||'')} ${esc(v.numero||'')}</small></div>
      <div class="ap"><div class="code">${esc(v.a||'—')}</div><div class="city">${esc(v.aCity||'')}</div><div class="time tnum">${esc(v.arrivo||'')}</div></div>
    </div>
    <div class="flight-meta">
      ${v.prezzo?`<span>Prezzo: <b class="tnum">${eur(v.prezzo)}</b></span>`:''}
      ${v.prenotazione?`<span>Prenotazione: <b>${esc(v.prenotazione)}</b></span>`:''}
      ${v.note?`<span>${esc(v.note)}</span>`:''}
    </div>
  </div>`;
}

/* ---------------- Itinerario ---------------- */
function renderItinerario() {
  return `
  <div class="view-head">
    <div class="eyebrow">Giorno per giorno</div>
    <h1>Itinerario</h1>
    <p>Sette giorni sull'isola. Tocca un giorno per aprirlo e aggiungere attività, orari e luoghi.</p>
  </div>
  ${state.giorni.map((g, idx) => {
    const oggi = daysUntil(g.data) === 0;
    const aperto = oggi || idx === 0 ? "open" : "";
    return `<div class="day ${aperto}" data-day="${g.data}">
      <div class="day-head" data-toggle-day="${g.data}">
        <div class="dnum">${idx+1}<small>${fmtDate(g.data)}</small></div>
        <div class="dtitle">${esc(g.titolo||'Giornata libera')}<small>${GIORNI[new Date(g.data+'T00:00:00').getDay()]}</small></div>
        ${oggi?'<span class="today-flag">Oggi</span>':''}
        <button class="btn sm icon ghost" data-edit-day="${g.data}" title="Titolo giornata">${svg(I.edit,14)}</button>
        <span class="chev">${svg('<path d="M6 9l6 6 6-6"/>',18)}</span>
      </div>
      <div class="day-body">
        ${g.attivita.length ? g.attivita.slice().sort((a,b)=>(a.ora||'').localeCompare(b.ora||'')).map((a) => `
          <div class="act">
            <div class="at tnum">${esc(a.ora||'—')}</div>
            <div><div class="atitle">${esc(a.titolo)}</div>${a.luogo?`<div class="aloc">${svg(I.pin,12)} ${esc(a.luogo)}</div>`:''}${a.note?`<div class="anote">${esc(a.note)}</div>`:''}</div>
            <div class="row-actions"><button class="btn sm icon" data-edit-act="${g.data}|${a.id}">${svg(I.edit,14)}</button> <button class="btn sm icon danger" data-del-act="${g.data}|${a.id}">${svg(I.trash,14)}</button></div>
          </div>`).join('') : `<div style="color:var(--muted);font-size:13px;padding:10px 0">Ancora niente in programma.</div>`}
        <button class="btn sm sea" style="margin-top:10px" data-add-act="${g.data}">${svg(I.plus,15)} Aggiungi attività</button>
      </div>
    </div>`;
  }).join("")}`;
}

/* ---------------- Documenti (PDF) ---------------- */
function renderDocumenti() {
  return `
  <div class="view-head">
    <div class="eyebrow">Archivio</div>
    <h1>Documenti</h1>
    <p>Carica i PDF utili: carte d'imbarco, prenotazioni, voucher, mappe. Restano salvati in questo browser.</p>
  </div>
  <label class="dropzone" id="dropzone">
    ${svg(I.upload,34)}
    <div style="margin-top:10px"><b>Trascina qui i PDF</b> o clicca per selezionarli</div>
    <div style="font-size:12.5px;color:var(--muted);margin-top:4px">Solo file PDF</div>
    <input type="file" id="fileInput" accept="application/pdf" multiple hidden />
  </label>
  <div class="section-head"><h2>File caricati</h2><span class="count">${state.documenti.length}</span></div>
  <div id="docList">
    ${state.documenti.length ? state.documenti.map(renderDoc).join("") : emptyState(I.doc, "Nessun documento", "Carica il primo PDF qui sopra.")}
  </div>`;
}
function renderDoc(d) {
  return `<div class="doc" data-doc="${d.id}">
    <div class="pdf-ico">${svg(I.doc,22)}</div>
    <div class="dinfo"><b>${esc(d.nome)}</b><span class="tnum">${bytes(d.size)} · ${esc(d.dataAgg||'')}</span></div>
    <button class="btn sm sea" data-open-doc="${d.id}">${svg(I.ext,14)} Apri</button>
    <button class="btn sm icon danger" data-del-doc="${d.id}">${svg(I.trash,14)}</button>
  </div>`;
}

/* ---------------- Luoghi (ristoranti / aperitivi / spiagge) ---------------- */
const PLACE_CFG = {
  ristoranti: { titolo: "Ristoranti", eyebrow: "Dove mangiare", icon: I.fork,
    intro: "Trattorie, pizzerie e posti di pesce da provare. Aggiungi nome, zona, fascia di prezzo e link a Maps.",
    sec: "tipo cucina", priceField: true, typeOptions: null },
  aperitivi: { titolo: "Aperitivi", eyebrow: "Dove bere", icon: I.glass,
    intro: "Bar e lounge per l'ora del tramonto. Segna i preferiti e tieni traccia di quelli già provati.",
    sec: "ambiente", priceField: true, typeOptions: null },
  spiagge: { titolo: "Spiagge", eyebrow: "Dove fare il bagno", icon: I.beach,
    intro: "Cale e spiagge dell'isola. Quelle famose sono già pre-caricate: modificale o eliminale come vuoi.",
    sec: "tipo", priceField: false, typeOptions: ["Sabbia","Ghiaia","Scogli","Mare aperto","Mista"] },
};
function renderPlaces(kind) {
  const cfg = PLACE_CFG[kind];
  const list = state[kind];
  const fatti = list.filter((p) => p.fatto).length;
  return `
  <div class="view-head">
    <div class="eyebrow">${cfg.eyebrow}</div>
    <h1>${cfg.titolo}</h1>
    <p>${cfg.intro}</p>
  </div>
  <div class="section-head">
    <h2>Elenco <span class="count">· ${list.length} totali · ${fatti} fatti</span></h2>
    <button class="btn primary sm" data-add-place="${kind}">${svg(I.plus,15)} Aggiungi</button>
  </div>
  ${list.length ? `<div class="places">${list.map((p) => renderPlace(kind, p)).join("")}</div>`
    : emptyState(cfg.icon, "Niente qui per ora", "Aggiungi il primo elemento con il pulsante in alto.")}
  `;
}
function renderPlace(kind, p) {
  const cfg = PLACE_CFG[kind];
  const price = p.prezzo ? `<span class="tag price">${esc(p.prezzo)}</span>` : "";
  const type = p.tipo ? `<span class="tag type">${esc(p.tipo)}</span>` : "";
  const stars = `<span class="stars">${[1,2,3,4,5].map((n) => `<svg viewBox="0 0 24 24" class="${n<=(p.rating||0)?'on':''}" fill="currentColor" stroke="none"><path d="M12 2l3 6.5 7 .8-5 4.7 1.3 7L12 17.8 5.7 21l1.3-7-5-4.7 7-.8z"/></svg>`).join("")}</span>`;
  return `<div class="place ${p.fatto?'done':''}">
    <div class="ptop">
      <div class="pname"><h4>${esc(p.nome)}</h4>${p.zona?`<div class="zona">${svg(I.pin,12)} ${esc(p.zona)}</div>`:''}</div>
      <button class="fav ${p.preferito?'on':''}" data-fav="${kind}|${p.id}" title="Preferito">${svg(I.star,18)}</button>
    </div>
    ${(price||type)?`<div class="ptags">${type}${price}</div>`:''}
    ${p.rating?`<div>${stars}</div>`:''}
    ${p.note?`<div class="pnote">${esc(p.note)}</div>`:''}
    <div class="pfoot">
      ${p.fatto?`<span class="chip-done">${svg(I.check,14)} Fatto</span>`:''}
      <span class="spacer"></span>
      ${p.link?`<a class="maps" href="${esc(p.link)}" target="_blank" rel="noopener">${svg(I.pin,13)} Maps</a>`:''}
      <button class="btn sm icon" data-edit-place="${kind}|${p.id}">${svg(I.edit,14)}</button>
      <button class="btn sm icon danger" data-del-place="${kind}|${p.id}">${svg(I.trash,14)}</button>
    </div>
  </div>`;
}

/* ---------------- Empty state ---------------- */
function emptyState(icon, title, sub) {
  return `<div class="empty">${svg(icon,40)}<b>${esc(title)}</b><div style="margin-top:4px;font-size:13.5px">${esc(sub)}</div></div>`;
}

/* ============================================================
   MODALE + FORM
   ============================================================ */
let modalSaveFn = null;
function openModal(title, bodyHTML, onSave) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = bodyHTML;
  modalSaveFn = onSave;
  const bg = document.getElementById("modalBg");
  bg.classList.add("show");
  const first = bg.querySelector("input,select,textarea");
  if (first) setTimeout(() => first.focus(), 50);
}
function closeModal() { document.getElementById("modalBg").classList.remove("show"); modalSaveFn = null; }
function val(id) { const e = document.getElementById(id); return e ? e.value.trim() : ""; }
function numVal(id) { const v = parseFloat(val(id).replace(",", ".")); return isNaN(v) ? 0 : v; }
function checked(id) { const e = document.getElementById(id); return e ? e.checked : false; }
function field(label, id, value, type, attrs) {
  return `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" type="${type||'text'}" value="${esc(value)}" ${attrs||''} /></div>`;
}
function area(label, id, value) {
  return `<div class="field"><label for="${id}">${esc(label)}</label><textarea id="${id}">${esc(value)}</textarea></div>`;
}

/* --- form Budget categoria --- */
function formBudget(b) {
  b = b || { nome: "", pianificato: 0, speso: 0, colore: "#16b1ac" };
  openModal(b.id ? "Modifica categoria" : "Nuova categoria",
    `${field("Nome categoria", "f_nome", b.nome)}
     <div class="field-row">${field("Pianificato (€)", "f_pian", b.pianificato, "number", 'min="0" step="1"')}${field("Speso (€)", "f_speso", b.speso, "number", 'min="0" step="1"')}</div>
     <div class="field"><label for="f_col">Colore</label><input id="f_col" type="color" value="${esc(b.colore||'#16b1ac')}" style="height:42px;padding:4px"></div>`,
    () => {
      const nome = val("f_nome"); if (!nome) return toast("Inserisci un nome");
      const obj = { nome, pianificato: numVal("f_pian"), speso: numVal("f_speso"), colore: val("f_col") || "#16b1ac" };
      if (b.id) Object.assign(state.budget.find((x) => x.id === b.id), obj);
      else state.budget.push({ id: uid(), ...obj });
      commit(); toast(b.id ? "Categoria aggiornata" : "Categoria aggiunta");
    });
}

/* --- form Budget totale --- */
function formBudgetTotale() {
  openModal("Budget totale", field("Tetto di spesa (€)", "f_tot", state.budgetTotale, "number", 'min="0" step="50"'),
    () => { state.budgetTotale = numVal("f_tot"); commit(); toast("Budget aggiornato"); });
}

/* --- form Volo --- */
function formVolo(v) {
  const nuovo = !v;
  v = v || { tipo: "Andata", compagnia: "", numero: "", da: "", daCity: "", a: "LMP", aCity: "Lampedusa", data: TRIP.start, partenza: "", arrivo: "", prezzo: 0, prenotazione: "", note: "" };
  openModal(nuovo ? "Nuova tratta" : "Modifica tratta",
    `<div class="field-row">
       <div class="field"><label for="f_tipo">Tipo</label><select id="f_tipo"><option ${v.tipo==='Andata'?'selected':''}>Andata</option><option ${v.tipo==='Ritorno'?'selected':''}>Ritorno</option><option ${v.tipo==='Scalo'?'selected':''}>Scalo</option></select></div>
       ${field("Data", "f_data", v.data, "date")}
     </div>
     <div class="field-row">${field("Compagnia", "f_comp", v.compagnia)}${field("Numero volo", "f_num", v.numero)}</div>
     <div class="field-row">${field("Da (aeroporto/IATA)", "f_da", v.da)}${field("Città partenza", "f_dacity", v.daCity)}</div>
     <div class="field-row">${field("A (aeroporto/IATA)", "f_a", v.a)}${field("Città arrivo", "f_acity", v.aCity)}</div>
     <div class="field-row">${field("Partenza (ora)", "f_part", v.partenza, "time")}${field("Arrivo (ora)", "f_arr", v.arrivo, "time")}</div>
     <div class="field-row">${field("Prezzo (€)", "f_prezzo", v.prezzo, "number", 'min="0" step="1"')}${field("Codice prenotazione", "f_pren", v.prenotazione)}</div>
     ${area("Note", "f_note", v.note)}`,
    () => {
      const obj = { tipo: val("f_tipo"), compagnia: val("f_comp"), numero: val("f_num"), da: val("f_da").toUpperCase(), daCity: val("f_dacity"), a: val("f_a").toUpperCase(), aCity: val("f_acity"), data: val("f_data"), partenza: val("f_part"), arrivo: val("f_arr"), prezzo: numVal("f_prezzo"), prenotazione: val("f_pren"), note: val("f_note") };
      if (nuovo) state.voli.push({ id: uid(), ...obj });
      else Object.assign(state.voli.find((x) => x.id === v.id), obj);
      commit(); toast(nuovo ? "Tratta aggiunta" : "Tratta aggiornata");
    });
}

/* --- form titolo giornata --- */
function formDay(data) {
  const g = state.giorni.find((x) => x.data === data);
  openModal(`Giornata · ${fmtDate(data, "full")}`,
    field("Titolo della giornata", "f_dtit", g.titolo, "text", 'placeholder="es. Giro in barca dell&apos;isola"'),
    () => { g.titolo = val("f_dtit"); commit(); toast("Giornata aggiornata"); });
}

/* --- form attività --- */
function formAct(data, act) {
  const nuovo = !act;
  act = act || { ora: "", titolo: "", luogo: "", note: "" };
  openModal(nuovo ? "Nuova attività" : "Modifica attività",
    `<div class="field-row">${field("Orario", "f_ora", act.ora, "time")}${field("Luogo", "f_luogo", act.luogo)}</div>
     ${field("Cosa fare", "f_tit", act.titolo, "text", 'placeholder="es. Bagno a Cala Pulcino"')}
     ${area("Note", "f_anote", act.note)}`,
    () => {
      const titolo = val("f_tit"); if (!titolo) return toast("Inserisci una descrizione");
      const g = state.giorni.find((x) => x.data === data);
      const obj = { ora: val("f_ora"), luogo: val("f_luogo"), titolo, note: val("f_anote") };
      if (nuovo) g.attivita.push({ id: uid(), ...obj });
      else Object.assign(g.attivita.find((a) => a.id === act.id), obj);
      commit(); toast(nuovo ? "Attività aggiunta" : "Attività aggiornata");
    });
}

/* --- form luogo (ristoranti/aperitivi/spiagge) --- */
function formPlace(kind, p) {
  const cfg = PLACE_CFG[kind];
  const nuovo = !p;
  p = p || { nome: "", zona: "", tipo: "", prezzo: "", note: "", link: "", rating: 0, preferito: false, fatto: false };
  const typeField = cfg.typeOptions
    ? `<div class="field"><label for="f_tipo">Tipo</label><select id="f_tipo"><option value="">—</option>${cfg.typeOptions.map((o) => `<option ${p.tipo===o?'selected':''}>${o}</option>`).join("")}</select></div>`
    : field("Categoria (" + cfg.sec + ")", "f_tipo", p.tipo);
  const priceField = cfg.priceField
    ? `<div class="field"><label for="f_prezzo">Fascia di prezzo</label><select id="f_prezzo"><option value="">—</option>${["€","€€","€€€"].map((o) => `<option ${p.prezzo===o?'selected':''}>${o}</option>`).join("")}</select></div>`
    : "";
  openModal(nuovo ? `Nuovo · ${cfg.titolo.slice(0,-1).toLowerCase()}` : "Modifica",
    `${field("Nome", "f_nome", p.nome)}
     <div class="field-row">${field("Zona", "f_zona", p.zona)}${typeField}</div>
     ${priceField}
     ${field("Link a Google Maps (opzionale)", "f_link", p.link, "url", 'placeholder="https://maps.google.com/..."')}
     <div class="field"><label for="f_rating">Voto (0–5)</label><select id="f_rating">${[0,1,2,3,4,5].map((n) => `<option value="${n}" ${(+p.rating||0)===n?'selected':''}>${n===0?'—':'★'.repeat(n)}</option>`).join("")}</select></div>
     ${area("Note", "f_note", p.note)}
     <div class="field-check"><input type="checkbox" id="f_fav" ${p.preferito?'checked':''}><label for="f_fav">Preferito (da non perdere)</label></div>
     <div class="field-check"><input type="checkbox" id="f_fatto" ${p.fatto?'checked':''}><label for="f_fatto">Già fatto / provato</label></div>`,
    () => {
      const nome = val("f_nome"); if (!nome) return toast("Inserisci un nome");
      const obj = { nome, zona: val("f_zona"), tipo: val("f_tipo"), prezzo: cfg.priceField ? val("f_prezzo") : "", link: val("f_link"), rating: +val("f_rating") || 0, note: val("f_note"), preferito: checked("f_fav"), fatto: checked("f_fatto") };
      if (nuovo) state[kind].push({ id: uid(), ...obj });
      else Object.assign(state[kind].find((x) => x.id === p.id), obj);
      commit(); toast(nuovo ? "Aggiunto" : "Aggiornato");
    });
}

/* ============================================================
   PDF upload
   ============================================================ */
async function handleFiles(files) {
  let added = 0;
  for (const f of files) {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) { toast(`"${f.name}" non è un PDF`); continue; }
    const id = uid();
    try {
      await IDB.put(id, f);
      state.documenti.push({ id, nome: f.name, size: f.size, dataAgg: new Date().toLocaleDateString("it-IT") });
      added++;
    } catch (e) { toast("Errore nel salvataggio del PDF"); }
  }
  if (added) { saveState(); buildNav(); go("documenti"); toast(`${added} file caricato${added>1?'i':''}`); }
}
async function openDoc(id) {
  const blob = await IDB.get(id);
  if (!blob) return toast("File non trovato");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
async function delDoc(id) {
  await IDB.del(id);
  state.documenti = state.documenti.filter((d) => d.id !== id);
  commit(); toast("Documento eliminato");
}

/* ============================================================
   Commit / toast / sidebar
   ============================================================ */
function commit() { saveState(); buildNav(); go(current); closeModal(); }
let toastT;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2200);
}
function confirmDel(msg, fn) { if (window.confirm(msg)) fn(); }

function openSidebar() { document.getElementById("sidebar").classList.add("open"); document.getElementById("scrim").classList.add("show"); }
function closeSidebar() { document.getElementById("sidebar").classList.remove("open"); document.getElementById("scrim").classList.remove("show"); }

function updateStorageNote() {
  const dot = document.querySelector("#storageNote .storage-dot");
  const txt = document.getElementById("storageText");
  if (STORAGE_OK) { dot.classList.remove("mem"); txt.textContent = "Dati salvati in questo browser"; }
  else { dot.classList.add("mem"); txt.textContent = "Anteprima: dati solo in memoria"; }
}

/* ============================================================
   Event delegation
   ============================================================ */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-view],[data-go],[data-add-budget],[data-edit-budget],[data-del-budget],[data-edit-total],[data-add-volo],[data-edit-volo],[data-del-volo],[data-toggle-day],[data-edit-day],[data-add-act],[data-edit-act],[data-del-act],[data-add-place],[data-edit-place],[data-del-place],[data-fav],[data-open-doc],[data-del-doc]");
  if (!t) return;
  const d = t.dataset;

  if (d.view) return go(d.view);
  if (d.go) return go(d.go);

  // Budget
  if ("addBudget" in d) return formBudget();
  if (d.editBudget) return formBudget(state.budget.find((x) => x.id === d.editBudget));
  if (d.delBudget) return confirmDel("Eliminare questa categoria?", () => { state.budget = state.budget.filter((x) => x.id !== d.delBudget); commit(); toast("Categoria eliminata"); });
  if ("editTotal" in d) return formBudgetTotale();

  // Voli
  if ("addVolo" in d) return formVolo();
  if (d.editVolo) return formVolo(state.voli.find((x) => x.id === d.editVolo));
  if (d.delVolo) return confirmDel("Eliminare questa tratta?", () => { state.voli = state.voli.filter((x) => x.id !== d.delVolo); commit(); toast("Tratta eliminata"); });

  // Itinerario
  if (d.toggleDay) { t.closest(".day").classList.toggle("open"); return; }
  if (d.editDay) { e.stopPropagation(); return formDay(d.editDay); }
  if (d.addAct) return formAct(d.addAct);
  if (d.editAct) { const [data, id] = d.editAct.split("|"); const g = state.giorni.find((x) => x.data === data); return formAct(data, g.attivita.find((a) => a.id === id)); }
  if (d.delAct) { const [data, id] = d.delAct.split("|"); return confirmDel("Eliminare questa attività?", () => { const g = state.giorni.find((x) => x.data === data); g.attivita = g.attivita.filter((a) => a.id !== id); commit(); toast("Attività eliminata"); }); }

  // Luoghi
  if (d.addPlace) return formPlace(d.addPlace);
  if (d.editPlace) { const [k, id] = d.editPlace.split("|"); return formPlace(k, state[k].find((x) => x.id === id)); }
  if (d.delPlace) { const [k, id] = d.delPlace.split("|"); return confirmDel("Eliminare questo elemento?", () => { state[k] = state[k].filter((x) => x.id !== id); commit(); toast("Eliminato"); }); }
  if (d.fav) { const [k, id] = d.fav.split("|"); const p = state[k].find((x) => x.id === id); p.preferito = !p.preferito; commit(); return; }

  // Documenti
  if (d.openDoc) return openDoc(d.openDoc);
  if (d.delDoc) return confirmDel("Eliminare questo documento?", () => delDoc(d.delDoc));
});

/* modale */
document.getElementById("modalSave").addEventListener("click", () => { if (modalSaveFn) modalSaveFn(); });
document.getElementById("modalCancel").addEventListener("click", closeModal);
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalBg").addEventListener("click", (e) => { if (e.target.id === "modalBg") closeModal(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter" && document.getElementById("modalBg").classList.contains("show")) {
    const tag = (document.activeElement.tagName || "").toLowerCase();
    if (tag !== "textarea" && modalSaveFn) { e.preventDefault(); modalSaveFn(); }
  }
});

/* sidebar mobile */
document.getElementById("menuBtn").addEventListener("click", openSidebar);
document.getElementById("scrim").addEventListener("click", closeSidebar);

/* upload: delega per dropzone (ricreata a ogni render) */
document.addEventListener("change", (e) => {
  if (e.target.id === "fileInput") { handleFiles(e.target.files); e.target.value = ""; }
});
document.addEventListener("dragover", (e) => { const dz = e.target.closest("#dropzone"); if (dz) { e.preventDefault(); dz.classList.add("drag"); } });
document.addEventListener("dragleave", (e) => { const dz = e.target.closest("#dropzone"); if (dz) dz.classList.remove("drag"); });
document.addEventListener("drop", (e) => { const dz = e.target.closest("#dropzone"); if (dz) { e.preventDefault(); dz.classList.remove("drag"); handleFiles(e.dataTransfer.files); } });

/* ============================================================
   Avvio
   ============================================================ */
(async function init() {
  await IDB.open();
  updateStorageNote();
  buildNav();
  go("panoramica");
})();
