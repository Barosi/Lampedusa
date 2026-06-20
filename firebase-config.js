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
