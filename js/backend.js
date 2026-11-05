/*
  BACKEND – the only file that talks to the server (Firebase: Authentication, Firestore, Cloud Functions).
  When js/config.js has no Firebase details, everything runs in demo mode on this device.
*/
(function () {
  "use strict";
  const FB = "https://www.gstatic.com/firebasejs/10.14.1/";
  const FB_SCRIPTS = ["firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js", "firebase-functions-compat.js"];
  let live = false, auth = null, db = null, fns = null;
  function loadScript(src) {
    return new Promise((ok, fail) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s); });
  }

  /* ---------- Demo storage (this device only) ---------- */
  const DEMO_KEY = "plateplan-demo";
  const demoLoad = () => { try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || { users: {}, current: null }; } catch (e) { return { users: {}, current: null }; } };
  const demoSave = d => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(d)); } catch (e) { /* ignore */ } };
  async function hash(s) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  const blankProfile = () => ({ premium_until: null, trial_used: false, allergies: [], dislikes: [] });

  /* ---------- Errors in plain words ---------- */
  const CODES = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/wrong-password": "Wrong email or password.",
    "auth/user-not-found": "Wrong email or password.",
    "auth/invalid-login-credentials": "Wrong email or password.",
    "auth/email-already-in-use": "There's already an account with that email. Log in instead.",
    "auth/weak-password": "Use a password with at least 8 characters.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
    "auth/network-request-failed": "No connection. Check your internet and try again.",
    "auth/requires-recent-login": "For your safety, log out and in again, then delete your account."
  };
  function friendly(err) {
    if (err && CODES[err.code]) return CODES[err.code];
    const m = String((err && err.message) || err || "");
    if (/invalid login/i.test(m)) return CODES["auth/invalid-credential"];
    if (/already registered/i.test(m)) return CODES["auth/email-already-in-use"];
    if (/trial/i.test(m)) return "You've already used your free trial.";
    if (/network|failed to fetch|internal/i.test(m)) return "No connection to the server. Try again.";
    return m || "Something went wrong. Try again.";
  }
  const call = (name, data, timeout) => fns.httpsCallable(name, timeout ? { timeout } : undefined)(data || {}).then(r => r.data);
  const iso = t => (t && t.toDate ? t.toDate().toISOString() : t || null);
  const backToApp = () => ({ url: location.origin + location.pathname });

  const Backend = {
    get live() { return live; },

    /** Connects to Firebase if js/config.js has its details. Falls back to demo mode. */
    async init() {
      if (!(FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId)) return;
      try {
        if (!window.firebase) for (const f of FB_SCRIPTS) await loadScript(FB + f);
        const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
        auth = firebase.auth(); db = firebase.firestore(); fns = app.functions(FIREBASE_REGION);
        await new Promise(ok => { const stop = auth.onAuthStateChanged(() => { stop(); ok(); }); });
        live = true;
      } catch (e) { console.warn("PlatePlan: could not load Firebase, using demo mode", e); }
    },

    /** Returns { email } or null. An account counts as logged in once its email is confirmed. */
    async user() {
      if (live) { const u = auth.currentUser; return u && u.emailVerified ? { email: u.email } : null; }
      const d = demoLoad(); return d.current ? { email: d.current } : null;
    },

    /** Creates an account and sends a confirmation email. Returns { ok, needsConfirm, error }. */
    async signUp(email, password) {
      if (password.length < 8) return { ok: false, error: "Use a password with at least 8 characters." };
      if (live) {
        try {
          const { user } = await auth.createUserWithEmailAndPassword(email, password);
          await user.sendEmailVerification(backToApp());
          await auth.signOut();
          return { ok: true, needsConfirm: true };
        } catch (e) { return { ok: false, error: friendly(e) }; }
      }
      const d = demoLoad();
      if (d.users[email]) return { ok: false, error: friendly("already registered") };
      d.users[email] = { pw: await hash(password), profile: blankProfile() }; d.current = email; demoSave(d);
      return { ok: true };
    },

    async signIn(email, password) {
      if (live) {
        try {
          const { user } = await auth.signInWithEmailAndPassword(email, password);
          if (!user.emailVerified) {
            await user.sendEmailVerification(backToApp()).catch(() => { });
            await auth.signOut();
            return { ok: false, error: "Confirm your email first. We've sent you a new link." };
          }
          return { ok: true };
        } catch (e) { return { ok: false, error: friendly(e) }; }
      }
      const d = demoLoad(), u = d.users[email];
      if (!u || u.pw !== await hash(password)) return { ok: false, error: friendly("invalid login") };
      d.current = email; demoSave(d); return { ok: true };
    },

    async signOut() {
      if (live) { await auth.signOut(); return; }
      const d = demoLoad(); d.current = null; demoSave(d);
    },

    async deleteAccount() {
      if (live) {
        try { await call("deleteAccount"); await auth.signOut(); return { ok: true }; }
        catch (e) { return { ok: false, error: friendly(e) }; }
      }
      const d = demoLoad(); delete d.users[d.current]; d.current = null; demoSave(d); return { ok: true };
    },

    /** { premium_until, trial_used, allergies, dislikes } for the logged-in user. */
    async profile() {
      if (live) {
        const u = auth.currentUser; if (!u) return blankProfile();
        try {
          const ref = db.collection("profiles").doc(u.uid), snap = await ref.get();
          if (!snap.exists) { await ref.set(blankProfile()); return blankProfile(); }
          const p = snap.data();
          return { premium_until: iso(p.premium_until), trial_used: !!p.trial_used, allergies: p.allergies || [], dislikes: p.dislikes || [] };
        } catch (e) { console.warn("PlatePlan: profile", e); return blankProfile(); }
      }
      const d = demoLoad(); return (d.users[d.current] || {}).profile || blankProfile();
    },

    async saveProfile({ allergies, dislikes }) {
      if (live) {
        try { await db.collection("profiles").doc(auth.currentUser.uid).update({ allergies, dislikes }); return { ok: true }; }
        catch (e) { return { ok: false, error: friendly(e) }; }
      }
      const d = demoLoad(); Object.assign(d.users[d.current].profile, { allergies, dislikes }); demoSave(d); return { ok: true };
    },

    /** Starts the free trial once per account. */
    async startTrial() {
      if (live) {
        try { await call("startTrial"); return { ok: true }; }
        catch (e) { return { ok: false, error: friendly(e) }; }
      }
      const d = demoLoad(), p = d.users[d.current].profile;
      if (p.trial_used) return { ok: false, error: friendly("trial") };
      p.trial_used = true; p.premium_until = new Date(Date.now() + PREMIUM_PRICES.trialDays * 864e5).toISOString(); demoSave(d);
      return { ok: true };
    },

    /** Offers: { offers: [{ title, store, storeName, price, before, quantity, validUntil, image, kind }], sample, clearanceSource, zip }
        zip = a Danish postcode for reduced short-date items near the user (Salling Group). Optional. */
    async offers(zip) {
      let clearanceSource = false;
      if (live) {
        try {
          const data = await call("offers", { zip: zip || "" }, 120000);
          clearanceSource = !!(data && data.sources && data.sources.clearance);
          if (data && data.offers && data.offers.length) return { offers: data.offers, sample: false, clearanceSource, zip: data.zip, updated: data.updated };
        } catch (e) { console.warn("PlatePlan: offers not available", e); }
      }
      const sunday = new Date(); sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7)); sunday.setHours(23, 59, 0, 0);
      return { offers: SAMPLE_OFFERS.map((o, i) => ({ id: "sample-" + i, ...o, validUntil: sunday.toISOString(), image: null, kind: "weekly" })), sample: true, clearanceSource, zip: zip || null };
    },

    /** Sends one photo (base64 JPEG, no prefix) and returns { items: [keys] } or { error }. Premium only. */
    async scan(base64) {
      if (!live) return { error: "Photo scanning works once the app is connected to its server. Tick your items by hand for now." };
      const catalog = Object.entries(ITEMS).map(([key, it]) => ({ key, name: it.name }));
      try {
        const data = await call("scanKitchen", { image: base64, media_type: "image/jpeg", catalog }, 120000);
        return { items: (data.items || []).filter(k => ITEMS[k]) };
      } catch (e) {
        return { error: e && e.message && e.code !== "internal" ? e.message : "We couldn't read the photo. Try again in better light." };
      }
    },

    onAuthChange(cb) { if (live) auth.onAuthStateChanged(() => cb()); }
  };

  window.Backend = Backend;
})();
