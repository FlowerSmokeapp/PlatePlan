// offers – returns this week's grocery offers, fetched from Tjek (eTilbudsavis) and cached for 6 hours.
//
// Secrets (supabase secrets set ...):
//   TJEK_API_KEY   Your Tjek API key (sent as X-Api-Key). Get it from Tjek and accept their terms first.
//   TJEK_BASE_URL  Optional. Defaults to https://squid-api.tjek.com/v2
//
// Tjek has no public documentation, so the request and the field names below follow their v2 API
// as used by other projects. If Tjek gives you different docs, only fetchTerm() and normalize() need changing.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { cors, json } from "../_shared/cors.ts";

const CACHE_HOURS = 6;
const BASE = Deno.env.get("TJEK_BASE_URL") ?? "https://squid-api.tjek.com/v2";
const KEY = Deno.env.get("TJEK_API_KEY") ?? "";
// Centre of Denmark with a radius that covers the whole country.
const GEO = { r_lat: "55.95", r_lng: "10.6", r_radius: "300000" };
// Search words: the same Danish words as "offer" in data/items.js, so every offer can be matched to a recipe item.
const TERMS = [
  "hakket oksekød", "hakket svinekød", "kyllingebryst", "kyllingelår", "bacon", "tofu", "torsk", "tun",
  "æg", "skyr", "feta", "revet ost", "mælk", "fløde", "cremefraiche", "hytteost", "smør",
  "peberfrugt", "broccoli", "squash", "porre", "hvidkål", "gulerødder", "agurk", "cherrytomater", "salat", "citron", "ingefær",
  "kartofler", "løg", "rødløg", "hvidløg", "ærter", "spinat",
  "linser", "kikærter", "kidneybønner", "hakkede tomater", "kokosmælk", "majs", "tomatpuré",
  "pasta", "lasagneplader", "ris", "nudler", "bulgur", "couscous", "havregryn", "bouillon", "pesto", "tortilla", "toastbrød", "rugbrød", "flute",
];

type Offer = { id: string; title: string; store: string; price: number; before: number | null; quantity: string; validUntil: string | null; image: string | null };

async function fetchTerm(term: string): Promise<unknown[]> {
  const url = new URL(`${BASE}/offers/search`);
  Object.entries({ ...GEO, query: term, limit: "24" }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { headers: { Accept: "application/json", ...(KEY ? { "X-Api-Key": KEY } : {}) } });
  if (!res.ok) throw new Error(`Tjek ${res.status} for "${term}"`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// deno-lint-ignore no-explicit-any
function normalize(o: any): Offer | null {
  const price = o?.pricing?.price;
  if (!o?.id || !o?.heading || typeof price !== "number") return null;
  const q = o.quantity ?? {};
  const size = q.size?.from ? `${q.size.from}${q.size.to && q.size.to !== q.size.from ? "–" + q.size.to : ""} ${q.unit?.symbol ?? ""}`.trim() : "";
  const pieces = q.pieces?.from > 1 ? `${q.pieces.from} x ` : "";
  return {
    id: String(o.id),
    title: String(o.heading),
    store: String(o.branding?.name ?? o.dealer?.name ?? "Store"),
    price,
    before: typeof o.pricing?.pre_price === "number" ? o.pricing.pre_price : null,
    quantity: (pieces + size).trim(),
    validUntil: o.run_till ?? null,
    image: o.images?.thumb ?? o.images?.view ?? null,
  };
}

async function fetchAll(): Promise<Offer[]> {
  const seen = new Map<string, Offer>();
  // A few requests at a time, to be gentle with Tjek.
  for (let i = 0; i < TERMS.length; i += 6) {
    const batch = await Promise.allSettled(TERMS.slice(i, i + 6).map(fetchTerm));
    for (const r of batch) {
      if (r.status !== "fulfilled") { console.warn(r.reason); continue; }
      for (const raw of r.value) { const o = normalize(raw); if (o && !seen.has(o.id)) seen.set(o.id, o); }
    }
  }
  const now = Date.now();
  return [...seen.values()].filter((o) => !o.validUntil || Date.parse(o.validUntil) > now);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cached } = await db.from("offers_cache").select("data, updated_at").eq("id", "dk").maybeSingle();
  const fresh = cached && Date.now() - Date.parse(cached.updated_at) < CACHE_HOURS * 3600e3;
  if (fresh) return json({ offers: cached.data, updated: cached.updated_at });
  try {
    const offers = await fetchAll();
    if (!offers.length) throw new Error("Tjek returned no offers");
    const updated = new Date().toISOString();
    await db.from("offers_cache").upsert({ id: "dk", data: offers, updated_at: updated });
    return json({ offers, updated });
  } catch (err) {
    console.error(err);
    // Serve older offers rather than nothing.
    if (cached) return json({ offers: cached.data, updated: cached.updated_at, stale: true });
    return json({ offers: [], error: "Offers are not available right now." }, 503);
  }
});
