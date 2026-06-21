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
  euro:   '<path d="M17.5 8.4A6 6 0 1 0 17.5 15.6"/><path d="M5 10.6h8.5M5 13.4h7"/>',
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
  cog:    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.14.62.46.66.85"/>',
  bed:    '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 14h18M5 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M3 18v2M21 18v2"/>',
  download:'<path d="M12 4v12m0 0l-4-4m4 4l4-4M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v5h-5"/>',
  google:  '<path d="M21 12.2c0-.7-.06-1.4-.18-2.05H12v3.9h5.05a4.3 4.3 0 0 1-1.87 2.83v2.35h3.02C19.96 17.5 21 15.1 21 12.2z"/><path d="M12 21c2.53 0 4.65-.84 6.2-2.27l-3.02-2.35c-.84.56-1.9.9-3.18.9-2.44 0-4.5-1.65-5.24-3.87H3.64v2.42A9 9 0 0 0 12 21z"/><path d="M6.76 13.41A5.4 5.4 0 0 1 6.76 10v-2.42H3.64a9 9 0 0 0 0 8.25z"/><path d="M12 6.58c1.38 0 2.6.47 3.57 1.4l2.68-2.68A8.96 8.96 0 0 0 12 3a9 9 0 0 0-8.36 5.58L6.76 10C7.5 7.79 9.56 6.58 12 6.58z"/>',
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
  Sync.push(); // se la sincronizzazione è attiva, invia anche al cloud (debounced)
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
    trip: { nome: TRIP.nome, start: TRIP.start, end: TRIP.end, valuta: TRIP.valuta },
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
    alloggi: [],
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
  const out = []; const d = new Date(a + "T00:00:00Z"); const end = new Date(b + "T00:00:00Z");
  while (d <= end) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); }
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
function eur(n) {
  const v = Math.round(n || 0);
  const s = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (v < 0 ? "\u2212" : "") + s + '<span class="cur">€</span>';
}
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
["budget","voli","giorni","documenti","alloggi","ristoranti","aperitivi","spiagge"].forEach((k) => { if (!Array.isArray(state[k])) state[k] = defaultState()[k]; });
if (typeof state.budgetTotale !== "number") state.budgetTotale = 1600;
// dati del viaggio: ora vivono nello stato (modificabili e sincronizzati)
if (!state.trip || typeof state.trip !== "object") state.trip = { nome: TRIP.nome, start: TRIP.start, end: TRIP.end, valuta: TRIP.valuta };
syncTripRuntime(); // allinea il TRIP runtime usato da tutto il resto del codice
reconcileDays();   // VINCOLO: i giorni dell'itinerario seguono sempre le date del viaggio

// Mantiene il TRIP runtime (usato da fmtDate/eachDay/eur/...) allineato a state.trip
function syncTripRuntime() {
  TRIP.nome = state.trip.nome || "Lampedusa";
  TRIP.start = state.trip.start || "2026-08-09";
  TRIP.end = state.trip.end || "2026-08-15";
  TRIP.valuta = state.trip.valuta || "EUR";
}

// Riallinea i giorni dell'itinerario all'intervallo del viaggio, preservando
// le attività dei giorni che restano nel nuovo intervallo.
function reconcileDays() {
  const byDate = {};
  state.giorni.forEach((g) => { byDate[g.data] = g; });
  const wanted = eachDay(TRIP.start, TRIP.end);
  state.giorni = wanted.map((d, i) => byDate[d] || {
    data: d,
    titolo: i === 0 ? "Arrivo a Lampedusa" : (d === TRIP.end ? "Rientro" : ""),
    attivita: [],
  });
}

/* ---------------- Navigazione ---------------- */
const VIEWS = [
  { id: "panoramica", label: "Panoramica", icon: I.home,  render: renderPanoramica },
  { id: "budget",     label: "Budget",     icon: I.euro,  render: renderBudget },
  { id: "voli",       label: "Voli",       icon: I.plane, render: renderVoli },
  { id: "alloggi",    label: "Alloggio",   icon: I.bed,   render: renderAlloggi },
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
    alloggi: state.alloggi.length,
  };
  document.getElementById("nav").innerHTML = VIEWS.map((v) => {
    const badge = counts[v.id] ? `<span class="badge">${counts[v.id]}</span>` : "";
    return `<button data-view="${v.id}" class="${v.id === current ? "active" : ""}">${svg(v.icon)} ${v.label} ${badge}</button>`;
  }).join("");
}
function go(id) {
  current = id;
  buildNav();
  updateChrome();
  const v = VIEWS.find((x) => x.id === id);
  document.getElementById("view").innerHTML = v.render();
  window.scrollTo(0, 0);
  closeSidebar();
}

// Aggiorna titolo pagina, nome e date mostrati nella sidebar/topbar in base a state.trip
function updateChrome() {
  const fmtShort = (iso) => { const d = new Date(iso + "T00:00:00"); return `${d.getDate()} ${MESI[d.getMonth()].slice(0,3)}`; };
  const range = `${fmtShort(TRIP.start)}–${fmtShort(TRIP.end)} ${new Date(TRIP.end+"T00:00:00").getFullYear()}`;
  document.title = `${TRIP.nome} · ${range}`;
  const bn = document.getElementById("brandName"); if (bn) bn.textContent = TRIP.nome;
  const bd = document.getElementById("brandDates"); if (bd) bd.textContent = range;
  const tb = document.getElementById("topbarTitle"); if (tb) tb.textContent = TRIP.nome;
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
    <div class="dates">${fmtDate(TRIP.start,"full")} → ${fmtDate(TRIP.end,"full")} ${new Date(TRIP.end+"T00:00:00").getFullYear()} · ${eachDay(TRIP.start,TRIP.end).length} giorni</div>
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

  <div class="card bud-wrap">
    <table class="bud-table">
      <thead><tr><th>Categoria</th><th class="num">Pianificato</th><th class="num">Speso</th><th class="num">Diff.</th><th></th></tr></thead>
      <tbody>
        ${state.budget.map((b) => {
          const diff = (+b.pianificato||0) - (+b.speso||0);
          return `<tr>
            <td data-label="Categoria"><span class="cat-dot" style="background:${b.colore||'#16b1ac'}"></span>${esc(b.nome)}</td>
            <td class="num tnum" data-label="Pianificato">${eur(b.pianificato)}</td>
            <td class="num tnum" data-label="Speso">${eur(b.speso)}</td>
            <td class="num tnum" data-label="Differenza" style="color:${diff<0?'var(--coral-deep)':'var(--ink-soft)'}">${diff<0?'-':''}${eur(Math.abs(diff))}</td>
            <td class="num actions" data-label=""><button class="btn sm icon" data-edit-budget="${b.id}" aria-label="Modifica">${svg(I.edit,14)}</button> <button class="btn sm icon danger" data-del-budget="${b.id}" aria-label="Elimina">${svg(I.trash,14)}</button></td>
          </tr>`;
        }).join("")}
      </tbody>
      <tfoot class="bud-foot"><tr><td data-label="Totale">Totale</td><td class="num tnum" data-label="Pianificato">${eur(pian)}</td><td class="num tnum" data-label="Speso">${eur(speso)}</td><td class="hide-sm"></td><td class="hide-sm"></td></tr></tfoot>
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
  ${state.voli.length ? `<div class="cards-stack">${state.voli.map(renderVoloCard).join("")}</div>` : emptyState(I.plane, "Nessun volo inserito", "Aggiungi la tua prima tratta.")}
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

/* ---------------- Alloggio ---------------- */
function renderAlloggi() {
  return `
  <div class="view-head">
    <div class="eyebrow">Dove dormire</div>
    <h1>Alloggio</h1>
    <p>Casa, B&amp;B o hotel sull'isola. Salva indirizzo, check-in/out, codice prenotazione, prezzo e contatti.</p>
  </div>
  <div class="section-head"><h2>Strutture</h2><button class="btn primary sm" data-add-alloggio>${svg(I.plus,15)} Aggiungi alloggio</button></div>
  ${state.alloggi.length ? `<div class="cards-stack">${state.alloggi.map(renderAlloggioCard).join("")}</div>` : emptyState(I.bed, "Nessun alloggio inserito", "Aggiungi la struttura dove dormirai.")}
  `;
}
function renderAlloggioCard(a) {
  const nights = (a.checkin && a.checkout) ? eachDay(a.checkin, a.checkout).length - 1 : 0;
  const meta = [];
  if (a.prezzo) meta.push(`Totale: <b class="tnum">${eur(a.prezzo)}</b>`);
  if (nights > 0) meta.push(`${nights} nott${nights === 1 ? "e" : "i"}`);
  if (a.prenotazione) meta.push(`Prenotazione: <b>${esc(a.prenotazione)}</b>`);
  if (a.telefono) meta.push(`Tel: <b>${esc(a.telefono)}</b>`);
  return `<div class="card">
    <div class="card-head">
      <h3>${svg(I.bed,18)} ${esc(a.nome || "Alloggio")}</h3>
      <div><button class="btn sm icon" data-edit-alloggio="${a.id}">${svg(I.edit,14)}</button> <button class="btn sm icon danger" data-del-alloggio="${a.id}">${svg(I.trash,14)}</button></div>
    </div>
    ${a.indirizzo ? `<div class="aloc" style="margin-bottom:8px">${svg(I.pin,13)} ${esc(a.indirizzo)}</div>` : ""}
    <div class="stay">
      <div class="stay-col"><span class="k">Check-in</span><b>${a.checkin ? fmtDate(a.checkin, "full") : "—"}</b></div>
      <div class="stay-arrow">${svg(I.route,16)}</div>
      <div class="stay-col"><span class="k">Check-out</span><b>${a.checkout ? fmtDate(a.checkout, "full") : "—"}</b></div>
    </div>
    ${meta.length ? `<div class="flight-meta">${meta.map((m) => `<span>${m}</span>`).join("")}</div>` : ""}
    ${a.note ? `<div class="pnote" style="margin-top:8px">${esc(a.note)}</div>` : ""}
    ${renderGoogleBlock("alloggi", a)}
    ${a.link ? `<div style="margin-top:10px"><a class="maps" href="${esc(a.link)}" target="_blank" rel="noopener">${svg(I.pin,13)} Apri su Maps</a></div>` : ""}
  </div>`;
}
function formAlloggio(a) {
  const nuovo = !a;
  a = a || { nome: "", indirizzo: "", checkin: TRIP.start, checkout: TRIP.end, prezzo: 0, prenotazione: "", telefono: "", link: "", note: "" };
  openModal(nuovo ? "Nuovo alloggio" : "Modifica alloggio",
    `${field("Nome struttura", "f_nome", a.nome, "text", 'placeholder="es. Casa Maruzza"')}
     ${field("Indirizzo", "f_ind", a.indirizzo)}
     <div class="field-row">${field("Check-in", "f_cin", a.checkin, "date")}${field("Check-out", "f_cout", a.checkout, "date")}</div>
     <div class="field-row">${field("Prezzo totale (€)", "f_prezzo", a.prezzo, "number", 'min="0" step="1"')}${field("Codice prenotazione", "f_pren", a.prenotazione)}</div>
     ${field("Telefono / contatto", "f_tel", a.telefono)}
     ${field("Link a Maps / annuncio", "f_link", a.link, "url", 'placeholder="https://..."')}
     ${area("Note", "f_note", a.note)}`,
    () => {
      const nome = val("f_nome"); if (!nome) return toast("Inserisci un nome");
      const obj = { nome, indirizzo: val("f_ind"), checkin: val("f_cin"), checkout: val("f_cout"), prezzo: numVal("f_prezzo"), prenotazione: val("f_pren"), telefono: val("f_tel"), link: val("f_link"), note: val("f_note") };
      if (nuovo) state.alloggi.push({ id: uid(), ...obj });
      else Object.assign(state.alloggi.find((x) => x.id === a.id), obj);
      commit(); toast(nuovo ? "Alloggio aggiunto" : "Alloggio aggiornato");
    });
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
    <span class="dz-icon">${svg(I.upload,24)}</span>
    <span class="dz-title">Trascina qui i PDF</span>
    <span class="dz-sub">oppure tocca per selezionare · solo file PDF</span>
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
    ${p.rating?`<div class="myrating"><span class="rl">Tuo voto</span> ${stars}</div>`:''}
    ${p.note?`<div class="pnote">${esc(p.note)}</div>`:''}
    ${renderGoogleBlock(kind, p)}
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
   Google Places — recensioni e voto (opzionale)
   Attivo solo se window.GOOGLE_MAPS_API_KEY è valorizzato.
   Usa la Places API (New) via REST (supporta CORS dal browser).
   I dati recuperati vengono salvati nello stato → sincronizzati e
   visibili anche all'altra persona senza nuove chiamate API.
   ============================================================ */
const Places = {
  key() { return (window.GOOGLE_MAPS_API_KEY || "").trim(); },
  enabled() { const k = this.key(); return !!k && k !== "INCOLLA_QUI"; },
  async search(query) {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.key(),
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.reviews",
      },
      body: JSON.stringify({ textQuery: query, languageCode: "it", regionCode: "IT", maxResultCount: 1 }),
    });
    if (!res.ok) {
      let detail = "HTTP " + res.status;
      try { const j = await res.json(); if (j.error) detail = j.error.status || j.error.message || detail; } catch (e) {}
      throw new Error(detail);
    }
    const data = await res.json();
    return (data.places && data.places[0]) || null;
  },
};
function mapGmaps(pl) {
  return {
    placeId: pl.id || "",
    rating: pl.rating || 0,
    count: pl.userRatingCount || 0,
    uri: pl.googleMapsUri || "",
    reviews: (pl.reviews || []).slice(0, 3).map((r) => ({
      autore: (r.authorAttribution && r.authorAttribution.displayName) || "Utente Google",
      voto: r.rating || 0,
      testo: (r.text && r.text.text) || (r.originalText && r.originalText.text) || "",
      quando: r.relativePublishTimeDescription || "",
    })),
    aggiornato: Date.now(),
  };
}
function googleStars(rating, w) {
  const r = Math.round(rating || 0);
  return `<span class="stars">${[1,2,3,4,5].map((n) => `<svg viewBox="0 0 24 24" width="${w||13}" height="${w||13}" class="${n<=r?'on':''}" fill="currentColor" stroke="none"><path d="M12 2l3 6.5 7 .8-5 4.7 1.3 7L12 17.8 5.7 21l1.3-7-5-4.7 7-.8z"/></svg>`).join("")}</span>`;
}
function renderGoogleBlock(kind, p) {
  if (!p.gmaps && !Places.enabled()) return ""; // non configurato e nessun dato → niente
  if (!p.gmaps) {
    return `<button class="btn sm ghost gbtn" data-gmaps="${kind}|${p.id}">${svg(I.google,15)} Recensioni Google</button>`;
  }
  const g = p.gmaps;
  const reviews = (g.reviews || []).map((r) => `
    <div class="greview">
      <div class="grh"><b>${esc(r.autore)}</b> ${googleStars(r.voto,11)}${r.quando?`<span class="gtime">${esc(r.quando)}</span>`:""}</div>
      ${r.testo ? `<div class="grtext">${esc(r.testo.length>180 ? r.testo.slice(0,180)+"…" : r.testo)}</div>` : ""}
    </div>`).join("");
  return `<div class="gblock">
    <div class="grating">${svg(I.google,15)}
      ${g.rating ? `<b class="tnum">${g.rating.toFixed(1)}</b> ${googleStars(g.rating)} <span class="gcount">${g.count} recensioni</span>` : `<span class="gcount">Nessun voto su Google</span>`}
      <button class="btn sm icon ghost" data-gmaps="${kind}|${p.id}" title="Aggiorna recensioni">${svg(I.refresh,14)}</button>
    </div>
    ${reviews ? `<div class="greviews">${reviews}</div>` : ""}
    ${g.uri ? `<a class="maps gmaps-link" href="${esc(g.uri)}" target="_blank" rel="noopener">${svg(I.ext,12)} Apri su Google Maps</a>` : ""}
    <div class="gattr">Recensioni e voti forniti da Google</div>
  </div>`;
}
let gmapsBusy = false;
async function fetchGoogle(kind, id) {
  if (!Places.enabled()) { toast("Configura la chiave Google in firebase-config.js"); return; }
  if (gmapsBusy) return;
  const list = state[kind] || [];
  const obj = list.find((x) => x.id === id);
  if (!obj) return;
  gmapsBusy = true;
  toast("Cerco su Google…");
  try {
    const zona = obj.zona || obj.indirizzo || "";
    const query = `${obj.nome} ${zona} Lampedusa`.replace(/\s+/g, " ").trim();
    const pl = await Places.search(query);
    if (!pl) { toast("Nessun risultato su Google"); gmapsBusy = false; return; }
    obj.gmaps = mapGmaps(pl);
    if (!obj.link && obj.gmaps.uri) obj.link = obj.gmaps.uri;
    saveState(); buildNav(); go(current);
    toast("Recensioni Google aggiornate");
  } catch (e) {
    toast("Google: " + (e.message || "errore"));
  }
  gmapsBusy = false;
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
   Impostazioni viaggio + Backup (esporta/importa)
   ============================================================ */
function currentTripId() {
  try { return localStorage.getItem("lampedusa_trip_id_override") || window.TRIP_ID || "default"; }
  catch (e) { return window.TRIP_ID || "default"; }
}
function formTrip() {
  const t = state.trip;
  const tid = currentTripId();
  const durata = eachDay(t.start, t.end).length;
  openModal("Impostazioni viaggio",
    `${field("Nome del viaggio", "f_tnome", t.nome)}
     <div class="field-row">${field("Data inizio", "f_tstart", t.start, "date")}${field("Data fine", "f_tend", t.end, "date")}</div>
     <div class="trip-duration">${svg(I.route,15)} L'itinerario avrà <b>${durata} ${durata===1?"giorno":"giorni"}</b>, uno per ogni data del viaggio.</div>
     <div class="modal-note">Cambiando le date, i giorni dell'itinerario si aggiornano automaticamente. Le attività dei giorni che restano nel periodo vengono conservate.</div>

     <div class="field" style="margin-top:18px"><label for="f_tid">Codice viaggio (sync)</label>
       <input id="f_tid" type="text" value="${esc(tid)}" placeholder="es. lampedusa-2026" />
     </div>
     <div class="modal-note">Lo stesso codice su due dispositivi = stessi dati condivisi. Cambiarlo apre un viaggio separato (la pagina si ricarica).</div>

     <div class="field-actions">
       <button type="button" class="btn sea sm" data-export>${svg(I.download,15)} Esporta backup (.json)</button>
       <button type="button" class="btn sm" data-import-btn>${svg(I.upload,15)} Importa backup</button>
       <input type="file" id="importFile" accept="application/json,.json" hidden />
     </div>
     <div class="modal-note">Il backup include tutti i dati tranne i PDF (che restano nel browser).</div>`,
    () => {
      const nome = val("f_tnome"); if (!nome) return toast("Inserisci un nome viaggio");
      const start = val("f_tstart"), end = val("f_tend");
      if (!start || !end) return toast("Imposta entrambe le date");
      if (end < start) return toast("La data fine è prima dell'inizio");

      state.trip = { nome, start, end, valuta: state.trip.valuta || "EUR" };
      syncTripRuntime();
      reconcileDays();

      const newTid = val("f_tid") || "default";
      const tidChanged = newTid !== currentTripId();
      if (tidChanged) {
        try { localStorage.setItem("lampedusa_trip_id_override", newTid); } catch (e) { /* storage non disponibile */ }
      }
      commit();
      toast("Viaggio aggiornato");
      if (tidChanged) setTimeout(() => location.reload(), 600); // riconnetto il sync al nuovo codice
    });
}

function exportData() {
  const dump = JSON.parse(JSON.stringify(state));
  delete dump.documenti; // i PDF non sono esportabili in JSON
  const payload = { app: "lampedusa-trip-planner", schema: 1, exportedAt: new Date().toISOString(), state: dump };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lampedusa-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast("Backup esportato");
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const incoming = parsed && parsed.state ? parsed.state : parsed;
      if (!incoming || typeof incoming !== "object") throw new Error("formato non valido");
      if (!window.confirm("Importare questo backup? Sostituirà i dati attuali (i PDF restano).")) return;
      const localDocs = state.documenti;
      state = Object.assign(defaultState(), incoming);
      state.documenti = localDocs;
      ["budget","voli","giorni","alloggi","ristoranti","aperitivi","spiagge"].forEach((k) => { if (!Array.isArray(state[k])) state[k] = defaultState()[k]; });
      if (!state.trip || typeof state.trip !== "object") state.trip = defaultState().trip;
      syncTripRuntime();
      reconcileDays();
      commit();
      toast("Backup importato");
    } catch (e) {
      toast("File non valido");
    }
  };
  reader.readAsText(file);
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
  const dot = document.getElementById("storageDot");
  const txt = document.getElementById("storageText");
  if (!dot || !txt) return;
  if (STORAGE_OK) { dot.classList.remove("mem"); txt.textContent = "Dati salvati su questo dispositivo"; }
  else { dot.classList.add("mem"); txt.textContent = "Sessione: dati solo in memoria"; }
}

/* Indicatore stato sincronizzazione cloud */
function updateSyncBadge(status) {
  const dot = document.getElementById("syncDot");
  const txt = document.getElementById("syncText");
  if (!dot || !txt) return;
  const code = currentTripId();
  const map = {
    ok:   ["#1e9e6a", "Sincronizzato · " + code],
    wait: ["#16b1ac", "Connessione al cloud…"],
    off:  ["#7d949b", "Solo questo dispositivo"],
    err:  ["#e8a33d", "Sync non disponibile · controlla connessione"],
  };
  const [c, t] = map[status] || map.off;
  dot.style.background = c; txt.textContent = t;
  if (status === "ok") hideSyncBanner();
}

/* Banner di errore sincronizzazione, con codice */
const SYNC_ERRORS = {
  "permission-denied": "Permessi negati: controlla le regole Firestore.",
  "unauthenticated": "Non autenticato sul cloud.",
  "auth/operation-not-allowed": "Login anonimo non abilitato in Firebase (Authentication → Sign-in method).",
  "auth/network-request-failed": "Rete non disponibile: impossibile contattare Firebase.",
  "unavailable": "Cloud non raggiungibile (sei offline?).",
  "failed-precondition": "Database Firestore non inizializzato o indice mancante.",
  "resource-exhausted": "Quota Firebase esaurita.",
  "not-found": "Database/progetto Firebase non trovato.",
  "invalid-argument": "Configurazione Firebase non valida.",
};
function showSyncBanner(code, detail) {
  const b = document.getElementById("syncBanner");
  if (!b) return;
  const human = SYNC_ERRORS[code] || detail || "Errore di sincronizzazione col cloud.";
  b.innerHTML =
    `<span class="sb-ico">!</span>` +
    `<span class="sb-txt"><b>Sincronizzazione non riuscita</b> — ${esc(human)}` +
    (code ? ` <code>${esc(String(code))}</code>` : "") + `</span>` +
    `<button class="sb-x" data-sync-banner-close aria-label="Chiudi">${svg('<path d="M18 6L6 18M6 6l12 12"/>',16)}</button>`;
  b.hidden = false;
}
function hideSyncBanner() { const b = document.getElementById("syncBanner"); if (b) b.hidden = true; }

/* ============================================================
   Sincronizzazione cloud (Firebase Firestore) — opzionale.
   Attiva solo se window.FIREBASE_CONFIG è valorizzato in firebase-config.js.
   Modello: un singolo documento condiviso (per TRIP_ID) con tutto lo stato,
   tranne i PDF che restano locali. Aggiornamenti in tempo reale (onSnapshot),
   ultimo-che-scrive-vince. I PDF non vengono sincronizzati.
   ============================================================ */
const Sync = {
  active: false, ref: null, lastRev: null, applying: false, timer: null,

  async init() {
    const cfg = window.FIREBASE_CONFIG;
    const configurato = cfg && cfg.apiKey && cfg.apiKey !== "INCOLLA_QUI" && typeof firebase !== "undefined";
    if (!configurato) { updateSyncBadge("off"); return false; }
    updateSyncBadge("wait");
    try {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      await firebase.auth().signInAnonymously();
      const tripId = currentTripId();
      this.ref = firebase.firestore().collection("trips").doc(tripId);
      this.active = true;
      this.ref.onSnapshot(
        (snap) => this.onRemote(snap),
        (err) => { console.warn("Sync error:", err.code, err.message); updateSyncBadge("err"); showSyncBanner(err.code, err.message); }
      );
      return true;
    } catch (e) {
      console.warn("Sync disattivato:", e.code, e.message);
      updateSyncBadge("err");
      showSyncBanner(e.code, e.message);
      return false;
    }
  },

  onRemote(snap) {
    if (!snap.exists) { this.push(true); return; }       // primo avvio: creo il doc dallo stato locale
    const data = snap.data();
    if (data._rev && data._rev === this.lastRev) return; // è l'eco del mio stesso salvataggio
    const localDocs = state.documenti;                    // i PDF restano locali, non li tocco
    state = Object.assign(defaultState(), data.state || {});
    state.documenti = localDocs;
    syncTripRuntime();                                    // allineo il viaggio (nome/date) a quello in cloud
    reconcileDays();                                      // VINCOLO: giorni itinerario = date del viaggio
    if (data._rev) this.lastRev = data._rev;              // evito di ri-pubblicare lo stato appena ricevuto
    // persisto in locale lo stato remoto: così un reload mostra subito gli stessi dati
    if (STORAGE_OK) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota: ignoro */ } }
    this.applying = true;
    buildNav();
    // non re-renderizzo se c'è una modale aperta (per non interrompere una modifica)
    if (!document.getElementById("modalBg").classList.contains("show")) go(current);
    this.applying = false;
    updateSyncBadge("ok");
  },

  push(force) {
    if (!this.active || this.applying || !this.ref) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.lastRev = uid();
      const c = JSON.parse(JSON.stringify(state));
      delete c.documenti; // i PDF non vanno in cloud
      this.ref.set({ state: c, _rev: this.lastRev, _updated: Date.now() })
        .then(() => updateSyncBadge("ok"))
        .catch((e) => { console.warn("Push error:", e.code, e.message); updateSyncBadge("err"); showSyncBanner(e.code, e.message); });
    }, force ? 0 : 450);
  },
};

/* ============================================================
   Event delegation
   ============================================================ */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-view],[data-go],[data-trip-settings],[data-add-budget],[data-edit-budget],[data-del-budget],[data-edit-total],[data-add-volo],[data-edit-volo],[data-del-volo],[data-add-alloggio],[data-edit-alloggio],[data-del-alloggio],[data-toggle-day],[data-edit-day],[data-add-act],[data-edit-act],[data-del-act],[data-add-place],[data-edit-place],[data-del-place],[data-fav],[data-gmaps],[data-open-doc],[data-del-doc],[data-export],[data-import-btn]");
  if (!t) return;
  const d = t.dataset;

  if (d.view) return go(d.view);
  if (d.go) return go(d.go);
  if ("tripSettings" in d) return formTrip();

  // Backup (dentro la modale Impostazioni)
  if ("export" in d) return exportData();
  if ("importBtn" in d) { const fi = document.getElementById("importFile"); if (fi) fi.click(); return; }

  // Alloggio
  if ("addAlloggio" in d) return formAlloggio();
  if (d.editAlloggio) return formAlloggio(state.alloggi.find((x) => x.id === d.editAlloggio));
  if (d.delAlloggio) return confirmDel("Eliminare questo alloggio?", () => { state.alloggi = state.alloggi.filter((x) => x.id !== d.delAlloggio); commit(); toast("Alloggio eliminato"); });

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

  // Recensioni Google
  if (d.gmaps) { const [k, id] = d.gmaps.split("|"); return fetchGoogle(k, id); }

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

/* chiusura banner errore sync */
document.addEventListener("click", (e) => { if (e.target.closest("[data-sync-banner-close]")) hideSyncBanner(); });

/* upload: delega per dropzone (ricreata a ogni render) */
document.addEventListener("change", (e) => {
  if (e.target.id === "fileInput") { handleFiles(e.target.files); e.target.value = ""; }
  if (e.target.id === "importFile") { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ""; }
});
document.addEventListener("dragover", (e) => { const dz = e.target.closest("#dropzone"); if (dz) { e.preventDefault(); dz.classList.add("drag"); } });
document.addEventListener("dragleave", (e) => { const dz = e.target.closest("#dropzone"); if (dz) dz.classList.remove("drag"); });
document.addEventListener("drop", (e) => { const dz = e.target.closest("#dropzone"); if (dz) { e.preventDefault(); dz.classList.remove("drag"); handleFiles(e.dataTransfer.files); } });

/* ============================================================
   Avvio
   ============================================================ */
(function init() {
  // 1) disegno subito l'interfaccia (non aspetto storage/cloud)
  updateStorageNote();
  buildNav();
  go("panoramica");
  // 2) apro IndexedDB in background: se non risponde entro 3s, proseguo comunque
  Promise.race([
    IDB.open(),
    new Promise((r) => setTimeout(() => r(false), 3000)),
  ]).then(updateStorageNote).catch(() => {});
  // 3) attivo la sincronizzazione cloud se configurata
  Sync.init();
})();
