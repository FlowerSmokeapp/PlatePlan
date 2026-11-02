// scan-kitchen – Premium: reads one photo of a fridge, freezer or cupboard with Claude
// and returns which items from the app's catalog are visible.
//
// Secrets (supabase secrets set ...):
//   ANTHROPIC_API_KEY  Your Claude API key from https://console.anthropic.com
//
// Cost: one photo is roughly 1,500–2,500 input tokens. Scans are capped per user per day.
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { cors, json } from "../_shared/cors.ts";

const SCANS_PER_DAY = 20;
const MAX_IMAGE_BYTES = 4_000_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  // Who is asking? The app sends the user's login token.
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (!user) return json({ error: "Log in to scan your fridge." }, 401);

  // Premium only.
  const { data: profile } = await admin.from("profiles").select("premium_until").eq("id", user.id).single();
  if (!profile?.premium_until || Date.parse(profile.premium_until) < Date.now()) {
    return json({ error: "Photo scanning is part of Premium." }, 403);
  }

  // Daily cap, so one account can't run up the bill.
  const since = new Date(Date.now() - 24 * 3600e3).toISOString();
  const { count } = await admin.from("scan_log").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= SCANS_PER_DAY) return json({ error: `You've used today's ${SCANS_PER_DAY} scans. Try again tomorrow.` }, 429);

  // Check the request.
  let body: { image?: string; media_type?: string; catalog?: { key: string; name: string }[] };
  try { body = await req.json(); } catch { return json({ error: "Send the photo as JSON." }, 400); }
  const image = body.image ?? "";
  const mediaType = body.media_type === "image/png" ? "image/png" : "image/jpeg";
  const catalog = (body.catalog ?? []).filter((c) => typeof c?.key === "string" && typeof c?.name === "string" && c.key.length <= 40 && c.name.length <= 60).slice(0, 200);
  if (!image || image.length * 0.75 > MAX_IMAGE_BYTES) return json({ error: "The photo is missing or too large." }, 400);
  if (!catalog.length) return json({ error: "No item list was sent." }, 400);

  await admin.from("scan_log").insert({ user_id: user.id });

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY
  const keys = catalog.map((c) => c.key);
  const list = catalog.map((c) => `${c.key}: ${c.name}`).join("\n");
  try {
    const msg = await client.beta.messages.create({
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
    if (msg.stop_reason === "refusal") return json({ error: "We couldn't read this photo. Try another one." }, 422);
    const block = msg.content.find((b) => b.type === "text");
    const parsed = block && block.type === "text" ? JSON.parse(block.text) : { items: [] };
    const items = [...new Set((parsed.items ?? []).filter((k: string) => keys.includes(k)))];
    return json({ items });
  } catch (err) {
    console.error(err);
    return json({ error: "We couldn't read the photo right now. Try again in a minute." }, 502);
  }
});
