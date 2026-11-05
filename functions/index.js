/*
  PlatePlan server functions (Firebase Cloud Functions, region europe-west1).

    offers        Grocery offers: Salling Group reduced items near a postcode, and Tjek weekly offers.
    scanKitchen   Premium: reads a fridge photo with Claude and returns the items it can see.
    startTrial    Starts the 7-day free Premium trial, once per account.
    deleteAccount Deletes the user's account and data.

  Secrets (firebase functions:secrets:set NAME). Type "none" for a key you don't have yet.
    ANTHROPIC_API_KEY  Claude API key, for photo scanning.
    SALLING_API_TOKEN  Salling Group token (Anti Food Waste API), for reduced items.
    TJEK_API_KEY       Tjek (eTilbudsavis) key, for weekly flyer offers. Only after an agreement with Tjek.
*/
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const AnthropicModule = require("@anthropic-ai/sdk");
const Anthropic = AnthropicModule.default || AnthropicModule;

initializeApp();
const db = getFirestore();
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const SALLING_API_TOKEN = defineSecret("SALLING_API_TOKEN");
const TJEK_API_KEY = defineSecret("TJEK_API_KEY");
const real = v => { const s = (v || "").trim(); return s && s.toLowerCase() !== "none" ? s : ""; };

const TRIAL_DAYS = 7;
const SCANS_PER_DAY = 20;

/* ---------- Cache in Firestore (collection offers_cache, server only) ---------- */
async function cached(id, maxAgeMs, load) {
  const ref = db.collection("offers_cache").doc(id);
  const snap = await ref.get();
  const old = snap.exists ? snap.data() : null;
  if (old && Date.now() - old.updated_at.toMillis() < maxAgeMs) return { offers: old.data, updated: old.updated_at.toDate().toISOString() };
  try {
    const offers = await load();
    const now = Timestamp.now();
    await ref.set({ data: offers, updated_at: now });
    return { offers, updated: now.toDate().toISOString() };
  } catch (err) {
    console.error(id, err);
    return old ? { offers: old.data, updated: old.updated_at.toDate().toISOString() } : { offers: [], updated: null }; // older data beats none
  }
}

/* ---------- Salling Group: reduced short-date items near a postcode ---------- */
const BRANDS = { netto: "Netto", foetex: "Føtex", bilka: "Bilka", salling: "Salling", br: "BR" };
// "GRILLMØRBRAD GODT BEGYNDT" -> "Grillmørbrad godt begyndt"
const sentence = t => { const l = String(t).trim().toLocaleLowerCase("da-DK"); return l.charAt(0).toLocaleUpperCase("da-DK") + l.slice(1); };

async function fetchSalling(zip, token) {
  const res = await fetch(`https://api.sallinggroup.com/v1/food-waste/?zip=${zip}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Salling ${res.status}`);
  const data = await res.json();
  const out = [], now = Date.now();
  for (const entry of Array.isArray(data) ? data : []) {
    const st = entry.store || {};
    const brand = BRANDS[String(st.brand || "").toLowerCase()] || String(st.brand || "Store");
    for (const c of entry.clearances || []) {
      const o = c.offer || {}, p = c.product || {};
      if (typeof o.newPrice !== "number" || !p.description) continue;
      if (o.endTime && Date.parse(o.endTime) < now) continue;
      const left = typeof o.stock === "number" && o.stock > 0
        ? (o.stockUnit === "kg" ? `${Math.round(o.stock * 1000)} g left` : `${Math.round(o.stock)} left`) : "";
      out.push({
        id: `sg-${st.id || ""}-${o.ean || p.ean || out.length}`,
        title: sentence(p.description),
        store: brand,
        storeName: [st.name, st.address && st.address.street].filter(Boolean).join(", "),
        price: o.newPrice,
        before: typeof o.originalPrice === "number" ? o.originalPrice : null,
        quantity: left,
        validUntil: o.endTime || null,
        image: p.image || null,
        kind: "clearance",
      });
    }
  }
  return out.slice(0, 400);
}

/* ---------- Tjek: weekly flyer offers ----------
   Tjek has no public documentation. The request and field names follow their v2 API as used by other
   projects. If Tjek gives you other docs, only fetchTjekTerm() and normalizeTjek() need changing. */
const TJEK_BASE = "https://squid-api.tjek.com/v2";
const GEO = { r_lat: "55.95", r_lng: "10.6", r_radius: "300000" }; // all of Denmark
// The same Danish words as "offer" in data/items.js, so offers can be matched to recipe items.
const TERMS = [
  "hakket oksekød", "hakket svinekød", "kyllingebryst", "kyllingelår", "bacon", "tofu", "torsk", "tun",
  "æg", "skyr", "feta", "revet ost", "mælk", "fløde", "cremefraiche", "hytteost", "smør",
  "peberfrugt", "broccoli", "squash", "porre", "hvidkål", "gulerødder", "agurk", "cherrytomater", "salat", "citron", "ingefær",
  "kartofler", "løg", "rødløg", "hvidløg", "ærter", "spinat",
  "linser", "kikærter", "kidneybønner", "hakkede tomater", "kokosmælk", "majs", "tomatpuré",
  "pasta", "lasagneplader", "ris", "nudler", "bulgur", "couscous", "havregryn", "bouillon", "pesto", "tortilla", "toastbrød", "rugbrød", "flute",
];
async function fetchTjekTerm(term, key) {
  const url = new URL(`${TJEK_BASE}/offers/search`);
  Object.entries({ ...GEO, query: term, limit: "24" }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { headers: { Accept: "application/json", "X-Api-Key": key } });
  if (!res.ok) throw new Error(`Tjek ${res.status} for "${term}"`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
function normalizeTjek(o) {
  const price = o && o.pricing && o.pricing.price;
  if (!o || !o.id || !o.heading || typeof price !== "number") return null;
  const q = o.quantity || {};
  const size = q.size && q.size.from ? `${q.size.from}${q.size.to && q.size.to !== q.size.from ? "–" + q.size.to : ""} ${(q.unit && q.unit.symbol) || ""}`.trim() : "";
  const pieces = q.pieces && q.pieces.from > 1 ? `${q.pieces.from} x ` : "";
  return {
    id: String(o.id), title: String(o.heading),
    store: String((o.branding && o.branding.name) || (o.dealer && o.dealer.name) || "Store"),
    price, before: typeof (o.pricing && o.pricing.pre_price) === "number" ? o.pricing.pre_price : null,
    quantity: (pieces + size).trim(), validUntil: o.run_till || null,
    image: (o.images && (o.images.thumb || o.images.view)) || null, kind: "weekly",
  };
}
async function fetchTjek(key) {
  const seen = new Map();
  for (let i = 0; i < TERMS.length; i += 6) { // a few requests at a time, to be gentle with Tjek
    const batch = await Promise.allSettled(TERMS.slice(i, i + 6).map(t => fetchTjekTerm(t, key)));
    for (const r of batch) {
      if (r.status !== "fulfilled") { console.warn(r.reason); continue; }
      for (const raw of r.value) { const o = normalizeTjek(raw); if (o && !seen.has(o.id)) seen.set(o.id, o); }
    }
  }
  const now = Date.now();
  return [...seen.values()].filter(o => !o.validUntil || Date.parse(o.validUntil) > now);
}

/* ---------- offers ---------- */
exports.offers = onCall({ secrets: [SALLING_API_TOKEN, TJEK_API_KEY], timeoutSeconds: 120 }, async req => {
  const zipIn = String((req.data && req.data.zip) || "").trim();
  const zip = /^\d{4}$/.test(zipIn) ? zipIn : "";
  const salling = real(SALLING_API_TOKEN.value()), tjek = real(TJEK_API_KEY.value());
  const [weekly, clearance] = await Promise.all([
    tjek ? cached("dk", 6 * 3600e3, () => fetchTjek(tjek)) : { offers: [], updated: null },
    salling && zip ? cached(`sg-${zip}`, 30 * 60e3, () => fetchSalling(zip, salling)) : { offers: [], updated: null },
  ]);
  return {
    offers: [...weekly.offers, ...clearance.offers],
    sources: { weekly: !!tjek, clearance: !!salling },
    zip: zip || null,
    updated: clearance.updated || weekly.updated,
  };
});

/* ---------- helpers for logged-in calls ---------- */
function needUser(req) {
  if (!req.auth) throw new HttpsError("unauthenticated", "Log in first.");
  if (!req.auth.token.email_verified) throw new HttpsError("permission-denied", "Confirm your email first.");
  return req.auth.uid;
}
const isPremium = p => !!(p && p.premium_until && p.premium_until.toMillis() > Date.now());

/* ---------- startTrial ---------- */
exports.startTrial = onCall(async req => {
  const uid = needUser(req);
  const ref = db.collection("profiles").doc(uid);
  const until = await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const p = snap.exists ? snap.data() : { allergies: [], dislikes: [] };
    if (p.trial_used) throw new HttpsError("failed-precondition", "You've already used your free trial.");
    const t = Timestamp.fromMillis(Date.now() + TRIAL_DAYS * 864e5);
    tx.set(ref, { allergies: p.allergies || [], dislikes: p.dislikes || [], trial_used: true, premium_until: t });
    return t;
  });
  return { premium_until: until.toDate().toISOString() };
});

/* ---------- deleteAccount ---------- */
exports.deleteAccount = onCall(async req => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Log in first.");
  const uid = req.auth.uid;
  await Promise.all([db.collection("profiles").doc(uid).delete(), db.collection("scan_counts").doc(uid).delete()]);
  await getAuth().deleteUser(uid);
  return { ok: true };
});

/* ---------- scanKitchen (Premium) ---------- */
exports.scanKitchen = onCall({ secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 120, memory: "512MiB" }, async req => {
  const uid = needUser(req);
  const key = real(ANTHROPIC_API_KEY.value());
  if (!key) throw new HttpsError("failed-precondition", "Photo scanning isn't set up yet.");

  const profile = await db.collection("profiles").doc(uid).get();
  if (!isPremium(profile.data())) throw new HttpsError("permission-denied", "Photo scanning is part of Premium.");

  const d = req.data || {};
  const image = typeof d.image === "string" ? d.image : "";
  const mediaType = d.media_type === "image/png" ? "image/png" : "image/jpeg";
  const catalog = (Array.isArray(d.catalog) ? d.catalog : [])
    .filter(c => c && typeof c.key === "string" && typeof c.name === "string" && c.key.length <= 40 && c.name.length <= 60).slice(0, 200);
  if (!image || image.length * 0.75 > 4e6) throw new HttpsError("invalid-argument", "The photo is missing or too large.");
  if (!catalog.length) throw new HttpsError("invalid-argument", "No item list was sent.");

  // Daily cap, so one account can't run up the bill.
  const today = new Date().toISOString().slice(0, 10);
  const counter = db.collection("scan_counts").doc(uid);
  await db.runTransaction(async tx => {
    const s = await tx.get(counter);
    const c = s.exists && s.data().day === today ? s.data().count : 0;
    if (c >= SCANS_PER_DAY) throw new HttpsError("resource-exhausted", `You've used today's ${SCANS_PER_DAY} scans. Try again tomorrow.`);
    tx.set(counter, { day: today, count: c + 1 });
  });

  const keys = catalog.map(c => c.key);
  const list = catalog.map(c => `${c.key}: ${c.name}`).join("\n");
  const client = new Anthropic({ apiKey: key });
  let msg;
  try {
    msg = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: { items: { type: "array", items: { type: "string", enum: keys } } },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
          {
            type: "text",
            text: `This is a photo of someone's fridge, freezer or kitchen cupboard. They want to know which dinners they can cook with what they have.\n\nList the keys of the items below that you can clearly see in the photo. Include an item only if you are fairly sure it is there; packaging with a readable label counts. Leave out anything you can't identify.\n\nItems:\n${list}`,
          },
        ],
      }],
    });
  } catch (err) {
    console.error(err);
    throw new HttpsError("unavailable", "We couldn't read the photo right now. Try again in a minute.");
  }
  if (msg.stop_reason === "refusal") throw new HttpsError("invalid-argument", "We couldn't read this photo. Try another one.");
  const block = msg.content.find(b => b.type === "text");
  let parsed = { items: [] };
  try { parsed = JSON.parse(block ? block.text : "{}"); } catch (e) { console.error("Bad JSON from Claude", e); }
  return { items: [...new Set((parsed.items || []).filter(k => keys.includes(k)))] };
});
