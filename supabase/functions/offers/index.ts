// offers – returns grocery offers from two official sources:
//   1. Salling Group Anti Food Waste API: reduced short-date items in Netto, Føtex, Bilka and Salling
//      near a Danish postcode (send { zip: "8000" }). Cached for 30 minutes per postcode.
//   2. Tjek (eTilbudsavis): this week's flyer offers from all chains. Used only when TJEK_API_KEY is set.
//      Cached for 6 hours.
//
// Secrets (supabase secrets set ...):
//   SALLING_API_TOKEN  Your token from https://developer.sallinggroup.com (Anti Food Waste API).
//   TJEK_API_KEY       Your Tjek API key (sent as X-Api-Key). Get it from Tjek and accept their terms first.
//   TJEK_BASE_URL      Optional. Defaults to https://squid-api.tjek.com/v2
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

type Offer = {
  id: string; title: string; store: string; storeName?: string; price: number; before: number | null;
  quantity: string; validUntil: string | null; image: string | null; kind: "weekly" | "clearance";
};

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
    kind: "weekly",
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

/* ---------- Salling Group: reduced short-date items near a postcode ---------- */
const SALLING_TOKEN = Deno.env.get("SALLING_API_TOKEN") ?? "";
const SALLING_MINUTES = 30;
const BRANDS: Record<string, string> = { netto: "Netto", foetex: "Føtex", bilka: "Bilka", salling: "Salling", br: "BR" };
// "GRILLMØRBRAD GODT BEGYNDT" -> "Grillmørbrad godt begyndt"
const sentence = (t: string) => { const l = t.trim().toLocaleLowerCase("da-DK"); return l.charAt(0).toLocaleUpperCase("da-DK") + l.slice(1); };

async function fetchSalling(zip: string): Promise<Offer[]> {
  const res = await fetch(`https://api.sallinggroup.com/v1/food-waste/?zip=${zip}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${SALLING_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Salling ${res.status}`);
  const data = await res.json();
  const out: Offer[] = [];
  const now = Date.now();
  // deno-lint-ignore no-explicit-any
  for (const entry of (Array.isArray(data) ? data : []) as any[]) {
    const st = entry.store ?? {};
    const brand = BRANDS[String(st.brand ?? "").toLowerCase()] ?? String(st.brand ?? "Store");
    for (const c of entry.clearances ?? []) {
      const o = c.offer ?? {}, p = c.product ?? {};
      if (typeof o.newPrice !== "number" || !p.description) continue;
      if (o.endTime && Date.parse(o.endTime) < now) continue;
      const left = typeof o.stock === "number" && o.stock > 0
        ? (o.stockUnit === "kg" ? `${Math.round(o.stock * 1000)} g left` : `${Math.round(o.stock)} left`) : "";
      out.push({
        id: `sg-${st.id ?? ""}-${o.ean ?? p.ean ?? out.length}`,
        title: sentence(String(p.description)),
        store: brand,
        storeName: [st.name, st.address?.street].filter(Boolean).join(", "),
        price: o.newPrice,
        before: typeof o.originalPrice === "number" ? o.originalPrice : null,
        quantity: left,
        validUntil: o.endTime ?? null,
        image: p.image ?? null,
        kind: "clearance",
      });
    }
  }
  return out.slice(0, 400);
}

async function cachedOr(db: ReturnType<typeof createClient>, id: string, maxAgeMs: number, load: () => Promise<Offer[]>): Promise<{ offers: Offer[]; updated: string | null }> {
  const { data: cached } = await db.from("offers_cache").select("data, updated_at").eq("id", id).maybeSingle();
  if (cached && Date.now() - Date.parse(cached.updated_at) < maxAgeMs) return { offers: cached.data, updated: cached.updated_at };
  try {
    const offers = await load();
    const updated = new Date().toISOString();
    await db.from("offers_cache").upsert({ id, data: offers, updated_at: updated });
    return { offers, updated };
  } catch (err) {
    console.error(id, err);
    return cached ? { offers: cached.data, updated: cached.updated_at } : { offers: [], updated: null }; // older data beats none
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  let zip = new URL(req.url).searchParams.get("zip") ?? "";
  if (req.method === "POST") { try { zip = String((await req.json()).zip ?? zip); } catch { /* no body */ } }
  zip = /^\d{4}$/.test(zip.trim()) ? zip.trim() : "";

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const [weekly, clearance] = await Promise.all([
    KEY ? cachedOr(db, "dk", CACHE_HOURS * 3600e3, fetchAll) : Promise.resolve({ offers: [] as Offer[], updated: null }),
    SALLING_TOKEN && zip ? cachedOr(db, `sg-${zip}`, SALLING_MINUTES * 60e3, () => fetchSalling(zip)) : Promise.resolve({ offers: [] as Offer[], updated: null }),
  ]);
  const offers = [...weekly.offers, ...clearance.offers];
  return json({
    offers,
    sources: { weekly: !!KEY, clearance: !!SALLING_TOKEN },
    zip: zip || null,
    updated: clearance.updated ?? weekly.updated,
  });
});
