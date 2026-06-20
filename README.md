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

Per impostazione predefinita i dati sono **persistenti nel browser**: i dati strutturati in `localStorage`, i PDF in `IndexedDB`. Sono quindi legati al singolo dispositivo. Per **condividerli tra più persone/dispositivi in tempo reale** c'è una sincronizzazione cloud opzionale via Firebase (vedi sotto).

> ⚠️ Senza la sincronizzazione cloud i dati restano sul dispositivo/browser che usi: aprendo il sito da un altro device non vengono trasferiti.

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

## Sincronizzazione tra dispositivi (opzionale)

Per far sì che due persone vedano le stesse modifiche in tempo reale, l'app può usare **Firebase Firestore** (gratuito, nessun server da gestire). Finché non lo configuri, l'app resta in modalità locale.

Setup una tantum (~5 minuti):

1. **Crea il progetto** su [console.firebase.google.com](https://console.firebase.google.com) → *Aggiungi progetto* (puoi saltare Google Analytics).
2. **Firestore**: menu *Build → Firestore Database → Crea database* → modalità *Production* → scegli una region europea (es. `eur3` / `europe-west`).
3. **Regole**: nella tab *Rules* incolla il contenuto del file `firestore.rules` incluso nel repo e premi *Pubblica*. Consentono lettura/scrittura solo agli utenti autenticati.
4. **Autenticazione**: menu *Build → Authentication → Inizia → Sign-in method →* abilita **Anonimo**. (Nessun login da fare: l'app autentica da sola in background.)
5. **App web**: *Impostazioni progetto (⚙) → Le tue app →* icona Web `</>` → registra l'app → copia l'oggetto `firebaseConfig`.
6. **Incolla la config** in `firebase-config.js` (sostituendo i `"INCOLLA_QUI"`), poi commit + push:
   ```bash
   git add firebase-config.js
   git commit -m "Abilita sync Firebase"
   git push
   ```
7. Apri il sito su entrambi i dispositivi con lo **stesso `TRIP_ID`**. In basso a sinistra il pallino diventa verde *"Sincronizzato in cloud"* e le modifiche si propagano in tempo reale.

Note:
- **Ultimo-che-scrive-vince**: se due persone modificano lo stesso elemento nello stesso istante, vince l'ultimo salvataggio. Per un planner a due va benissimo.
- **I PDF non si sincronizzano**: restano sul dispositivo che li carica (Firestore è pensato per dati, non file). Per condividere anche i PDF servirebbe Firebase Storage.
- **Privacy**: con le regole incluse può scrivere solo chi passa dall'autenticazione anonima della tua app. È adeguato per un planner personale; per restringere a indirizzi specifici si può passare all'autenticazione via email.
- La `apiKey` di Firebase **non è un segreto** e può stare nel repo pubblico: è un identificativo, la sicurezza la fanno le *regole* Firestore.



```
.
├── index.html              # pagina principale
├── firebase-config.js      # config sync cloud (opzionale, da compilare)
├── firestore.rules         # regole di sicurezza Firestore
├── assets/
│   ├── styles.css          # tema "mare delle Pelagie"
│   └── app.js              # stato, persistenza, sync, viste e CRUD
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
