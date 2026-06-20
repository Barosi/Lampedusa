# 🏝️ Lampedusa Trip Planner

Web app statica per organizzare un viaggio a **Lampedusa (9–15 agosto 2026)**: budget, voli, itinerario giorno per giorno, archivio PDF, ristoranti, aperitivi e spiagge — tutto modificabile direttamente dal browser.

Niente backend, niente build step, niente dipendenze: solo HTML, CSS e JavaScript vanilla. Pensata per girare su **GitHub Pages**.

---

## Funzionalità

- **Panoramica** — countdown alla partenza, riepilogo budget, prossime attività e preferiti.
- **Budget** — tetto di spesa + categorie con pianificato/speso, barra di avanzamento e calcolo automatico dei totali.
- **Voli** — tratte andata/ritorno (e scali) con compagnia, orari, IATA, prezzo e codice di prenotazione.
- **Itinerario** — i 7 giorni del viaggio, ognuno con attività, orari, luoghi e note.
- **Documenti** — upload di PDF (carte d'imbarco, voucher, mappe) salvati nel browser via IndexedDB.
- **Ristoranti / Aperitivi / Spiagge** — schede con zona, fascia di prezzo, voto, link a Maps, preferiti e "già fatto". Le spiagge note dell'isola sono pre-caricate e modificabili.

Tutti i dati sono **persistenti nel browser**: i dati strutturati in `localStorage`, i PDF in `IndexedDB`. Se lo storage non è disponibile (es. anteprima embedded), l'app continua a funzionare tenendo i dati solo in memoria per la sessione corrente.

> ⚠️ I dati restano sul dispositivo/browser che usi. Non c'è sincronizzazione cloud: aprendo il sito da un altro device i dati non vengono trasferiti.

---

## Provare in locale

Apri `index.html` con un piccolo server (consigliato, così l'apertura dei PDF funziona senza limiti del protocollo `file://`):

```bash
# con Python
python3 -m http.server 8000
# poi apri http://localhost:8000

# oppure con Node
npx serve .
```

---

## Deploy su GitHub Pages

### Opzione A — GitHub Actions (incluso, consigliato)

Il repo contiene già `.github/workflows/deploy.yml`. Passi:

1. Crea un repository su GitHub e carica i file:
   ```bash
   git init
   git add .
   git commit -m "Lampedusa trip planner"
   git branch -M main
   git remote add origin https://github.com/<tuo-utente>/<tuo-repo>.git
   git push -u origin main
   ```
2. Su GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Ad ogni push su `main` il sito viene pubblicato. L'URL compare nel workflow e in Settings → Pages.

### Opzione B — Deploy da branch (senza Actions)

1. Carica i file come sopra.
2. **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `/root` → Save**.
3. Dopo qualche minuto il sito è online su `https://<tuo-utente>.github.io/<tuo-repo>/`.

> Se usi l'opzione B puoi anche eliminare la cartella `.github/`.

---

## Struttura del progetto

```
.
├── index.html              # pagina principale
├── assets/
│   ├── styles.css          # tema "mare delle Pelagie"
│   └── app.js              # stato, persistenza, viste e CRUD
├── .github/workflows/
│   └── deploy.yml          # deploy automatico su Pages (opzionale)
├── .gitignore
└── README.md
```

## Personalizzare

- **Date e nome viaggio**: costante `TRIP` in cima a `assets/app.js`.
- **Categorie budget, spiagge pre-caricate, ecc.**: funzione `defaultState()` in `assets/app.js`.
- **Colori e tipografia**: variabili CSS in `:root` dentro `assets/styles.css`.

## Reset dei dati

Per ripartire da zero, svuota i dati del sito dal browser (DevTools → Application → Local Storage / IndexedDB) oppure usa la navigazione privata.

---

Buon viaggio. 🌊
