/* ============================================================
   Configurazione sincronizzazione cloud (Firebase) — OPZIONALE
   ------------------------------------------------------------
   Finché lasci "INCOLLA_QUI", l'app funziona in locale su questo
   dispositivo (come prima). Per condividere i dati con un'altra
   persona in tempo reale, incolla qui la config del TUO progetto
   Firebase e usa lo STESSO trip-id su entrambi i dispositivi.

   Come ottenere la config: console.firebase.google.com →
   Impostazioni progetto (⚙) → Le tue app → app Web → "firebaseConfig".
   Istruzioni complete nel README.
   ============================================================ */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBZJwrtBV6enrjvY4AOOiTEu7cgql6KlII",
  authDomain: "lampedusa-c0cd3.firebaseapp.com",
  projectId: "lampedusa-c0cd3",
  storageBucket: "lampedusa-c0cd3.firebasestorage.app",
  messagingSenderId: "451737665705",
  appId: "1:451737665705:web:f29392c4e4c1a25574e9b8"
};

/* Codice del viaggio: lo stesso valore per te e la tua ragazza =
   stessi dati condivisi. Cambialo se vuoi un secondo viaggio separato. */
window.TRIP_ID = "lampedusa-2026";

/* ============================================================
   Recensioni Google (Places API New) — OPZIONALE
   ------------------------------------------------------------
   Lasciando "" la funzione resta nascosta. Per attivare le
   recensioni/voti Google su ristoranti, aperitivi, spiagge e
   alloggi, incolla qui una chiave API di Google Cloud.

   Setup (~5 min):
   1. console.cloud.google.com → crea/seleziona un progetto e
      ATTIVA la fatturazione (c'è un credito gratuito mensile).
   2. "API e servizi" → Abilita "Places API (New)".
   3. "Credenziali" → Crea chiave API.
   4. Limita la chiave:
      - Restrizioni applicazione → "Referrer HTTP" → aggiungi
        il tuo dominio, es:  barosi.github.io/*
      - Restrizioni API → consenti solo "Places API (New)".
   5. Incolla la chiave qui sotto, poi commit + push.

   Nota: con la restrizione per referrer la chiave può stare nel
   repo pubblico (come la apiKey di Firebase). I dati recuperati
   vengono salvati nello stato e sincronizzati, così non si
   richiama l'API ad ogni apertura.
   ============================================================ */
window.GOOGLE_MAPS_API_KEY = "";
