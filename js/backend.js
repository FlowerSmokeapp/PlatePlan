/*
  BACKEND – the only file that talks to the server (Supabase).
  When js/config.js has no Supabase details, everything runs in demo mode on this device.
*/
(function () {
  "use strict";
  const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
  let live = false, sb = null;
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
  function friendly(err) {
    const m = String((err && err.message) || err || "");
    if (/invalid login|invalid credentials/i.test(m)) return "Wrong email or password.";
    if (/already registered|already exists/i.test(m)) return "There's already an account with that email. Log in instead.";
    if (/password/i.test(m) && /6|short|weak/i.test(m)) return "Use a password with at least 8 characters.";
    if (/email/i.test(m) && /invalid/i.test(m)) return "That email address doesn't look right.";
    if (/trial/i.test(m)) return "You've already used your free trial.";
    if (/fetch|network|failed to load/i.test(m)) return "No connection. Check your internet and try again.";
    return m || "Something went wrong. Try again.";
  }

  const Backend = {
    get live() { return live; },

    /** Connects to Supabase if js/config.js has its details. Falls back to demo mode. */
    async init() {
      if (!(SUPABASE_URL && SUPABASE_ANON_KEY)) return;
      try {
        if (!window.supabase) await loadScript(SUPABASE_JS);
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        live = true;
      } catch (e) { console.warn("PlatePlan: could not load Supabase, using demo mode", e); }
    },

    /** Returns { email } or null. */
    async user() {
      if (live) { const { data } = await sb.auth.getSession(); return data.session ? { email: data.session.user.email } : null; }
      const d = demoLoad(); return d.current ? { email: d.current } : null;
    },

    /** Creates an account. Returns { ok, needsConfirm, error }. */
    async signUp(email, password) {
      if (password.length < 8) return { ok: false, error: "Use a password with at least 8 characters." };
      if (live) {
        const { data, error } = await sb.auth.signUp({ email, password });
        if (error) return { ok: false, error: friendly(error) };
        return { ok: true, needsConfirm: !data.session };
      }
      const d = demoLoad();
      if (d.users[email]) return { ok: false, error: friendly("already registered") };
      d.users[email] = { pw: await hash(password), profile: blankProfile() }; d.current = email; demoSave(d);
      return { ok: true };
    },

    async signIn(email, password) {
      if (live) {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        return error ? { ok: false, error: friendly(error) } : { ok: true };
      }
      const d = demoLoad(), u = d.users[email];
      if (!u || u.pw !== await hash(password)) return { ok: false, error: friendly("invalid login") };
      d.current = email; demoSave(d); return { ok: true };
    },

    async signOut() {
      if (live) { await sb.auth.signOut(); return; }
      const d = demoLoad(); d.current = null; demoSave(d);
    },

    async deleteAccount() {
      if (live) {
        const { error } = await sb.rpc("delete_me");
        if (error) return { ok: false, error: friendly(error) };
        await sb.auth.signOut(); return { ok: true };
      }
      const d = demoLoad(); delete d.users[d.current]; d.current = null; demoSave(d); return { ok: true };
    },

    /** { premium_until, trial_used, allergies, dislikes } for the logged-in user. */
    async profile() {
      if (live) {
        const { data, error } = await sb.from("profiles").select("premium_until, trial_used, allergies, dislikes").single();
        return error ? blankProfile() : data;
      }
      const d = demoLoad(); return (d.users[d.current] || {}).profile || blankProfile();
    },

    async saveProfile({ allergies, dislikes }) {
      if (live) {
        const { data: s } = await sb.auth.getSession();
        const { error } = await sb.from("profiles").update({ allergies, dislikes }).eq("id", s.session.user.id);
        return error ? { ok: false, error: friendly(error) } : { ok: true };
      }
      const d = demoLoad(); Object.assign(d.users[d.current].profile, { allergies, dislikes }); demoSave(d); return { ok: true };
    },

    /** Starts the free trial once per account. */
    async startTrial() {
      if (live) {
        const { error } = await sb.rpc("start_trial");
        return error ? { ok: false, error: friendly(error) } : { ok: true };
      }
      const d = demoLoad(), p = d.users[d.current].profile;
      if (p.trial_used) return { ok: false, error: friendly("trial") };
      p.trial_used = true; p.premium_until = new Date(Date.now() + PREMIUM_PRICES.trialDays * 864e5).toISOString(); demoSave(d);
      return { ok: true };
    },

    /** This week's offers: { offers: [{ title, store, price, before, quantity, validUntil, image }], sample } */
    async offers() {
      if (live) {
        try {
          const { data, error } = await sb.functions.invoke("offers", { method: "GET" });
          if (error) throw error;
          if (data && data.offers && data.offers.length) return { offers: data.offers, sample: false, updated: data.updated };
        } catch (e) { console.warn("PlatePlan: offers not available", e); }
      }
      const sunday = new Date(); sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7)); sunday.setHours(23, 59, 0, 0);
      return { offers: SAMPLE_OFFERS.map((o, i) => ({ id: "sample-" + i, ...o, validUntil: sunday.toISOString(), image: null })), sample: true };
    },

    /** Sends one photo (base64 JPEG, no prefix) and returns { items: [keys] } or { error }. Premium only. */
    async scan(base64) {
      if (!live) return { error: "Photo scanning works once the app is connected to its server. Tick your items by hand for now." };
      const catalog = Object.entries(ITEMS).map(([key, it]) => ({ key, name: it.name }));
      const { data, error } = await sb.functions.invoke("scan-kitchen", { body: { image: base64, media_type: "image/jpeg", catalog } });
      if (error) {
        let msg = "We couldn't read the photo. Try again in better light.";
        try { const b = await error.context.json(); if (b && b.error) msg = b.error; } catch (e) { /* keep default */ }
        return { error: msg };
      }
      return { items: (data.items || []).filter(k => ITEMS[k]) };
    },

    onAuthChange(cb) { if (live) sb.auth.onAuthStateChange(() => cb()); }
  };

  window.Backend = Backend;
})();
