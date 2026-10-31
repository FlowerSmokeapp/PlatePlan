/*
  PlatePlan – app logic.
  Data lives in data/prices.js and data/recipes.js. Pictures are drawn by js/illustrations.js.
  Everything is saved in the browser (localStorage). There is no account and no server.
*/
(function () {
  "use strict";

  /* ---------- Constants ---------- */
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DIETS = {
    all: { label: "Everything", hint: "Meat, fish and veggie dishes" },
    veg: { label: "Vegetarian", hint: "No meat or fish" },
    protein: { label: "High protein", hint: "At least 30 g protein per serving" }
  };
  const TAGS = { veg: "Vegetarian", protein: "High protein", quick: "Quick" };
  const FREE_LIMIT = 20;
  const KEY = "plateplan-v2";

  /* ---------- Recipes: derived labels ---------- */
  RECIPES.forEach(r => {
    r.ingredients.forEach(([k]) => { if (!ITEMS[k]) console.warn(`PlatePlan: "${k}" in ${r.id} is missing from data/prices.js`); });
    r.ingredients = r.ingredients.filter(([k]) => ITEMS[k]);
    r.veg = r.ingredients.every(([k]) => !ITEMS[k].meat);
    r.quick = r.minutes <= 20;
    r.highProtein = (r.macros && r.macros.protein) >= 30;
    r.tags = [r.veg && "veg", r.highProtein && "protein", r.quick && "quick"].filter(Boolean);
  });
  const FREE = RECIPES.filter(r => !r.premium).slice(0, FREE_LIMIT);
  const LOCKED = RECIPES.filter(r => r.premium);
  const byId = id => RECIPES.find(r => r.id === id);
  const canUse = id => FREE.some(r => r.id === id);
  const picture = r => window.drawDish(r, RECIPES.indexOf(r));

  /* ---------- Helpers ---------- */
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const kr = v => `<span class="nowrap">${Math.round(v).toLocaleString("en-GB")} kr</span>`;
  const krText = v => `${Math.round(v)} kr`;
  const people = n => n === 1 ? "1 person" : `${n} people`;
  const ICON = {
    swap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h13l-3-3M20 16H7l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="currentColor"/></svg>'
  };
  let toastTimer;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600); }

  /* ---------- Analytics (GoatCounter, only if a code is set in js/config.js) ---------- */
  if (typeof GOATCOUNTER_CODE === "string" && GOATCOUNTER_CODE) {
    const s = document.createElement("script");
    s.async = true; s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
    document.head.appendChild(s);
  }
  function track(name) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "event-" + name, title: name, event: true }); } catch (e) { /* ignore */ }
  }

  /* ---------- Week dates ---------- */
  function baseMonday() {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const wd = (d.getDay() + 6) % 7;               // 0 = Monday
    d.setDate(d.getDate() - wd + (wd >= 4 ? 7 : 0)); // from Friday, plan next week
    return d;
  }
  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n);
    const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - y) / 864e5 + 1) / 7);
  }
  const MON = baseMonday();
  const WEEK_KEY = `${MON.getFullYear()}-${MON.getMonth() + 1}-${MON.getDate()}`;
  const dayDate = i => { const d = new Date(MON); d.setDate(d.getDate() + i); return d; };

  /* ---------- State (saved in this browser) ---------- */
  const DEFAULTS = { onboarded: false, budget: 400, persons: 2, diet: "all", week: { key: "", days: {}, locked: {} }, lastWeek: null, pantry: { oil: true }, checked: {}, favs: [], filters: [], interest: {} };
  let S = JSON.parse(JSON.stringify(DEFAULTS));
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved) S = Object.assign(S, saved); } catch (e) { /* private mode */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  // A new week: last week's plan becomes "last week", and the list starts over.
  if (S.week.key !== WEEK_KEY) {
    if (S.week.days && Object.keys(S.week.days).length) S.lastWeek = { ...S.week.days };
    S.week = { key: WEEK_KEY, days: {}, locked: {} };
    S.checked = {};
  }
  for (const d in S.week.days) if (!canUse(S.week.days[d])) delete S.week.days[d];
  let anim = null;        // day that just changed, for the pop animation
  let swapSeen = {};      // recipes recently shown per day, so Swap doesn't repeat
  let query = "", sortBy = "price", showAllPantry = false;

  /* ---------- Money ---------- */
  function needs(days = S.week.days) {
    const agg = {};
    for (const d in days) {
      const r = byId(days[d]); if (!r) continue;
      for (const [k, a] of r.ingredients) {
        const o = agg[k] || (agg[k] = { k, need: 0, days: [] });
        o.need += a * S.persons / 4;
        if (!o.days.includes(+d)) o.days.push(+d);
      }
    }
    return agg;
  }
  const packsFor = (k, need) => Math.max(1, Math.ceil(need / ITEMS[k].pack - 1e-9));
  function storeCost(days = S.week.days) {
    const n = needs(days); let t = 0;
    for (const k in n) if (!S.pantry[k]) t += packsFor(k, n[k].need) * ITEMS[k].price;
    return t;
  }
  const servingCost = r => r.ingredients.reduce((s, [k, a]) => s + a * ITEMS[k].price / ITEMS[k].pack, 0) / 4;
  function stats() {
    const n = Object.keys(S.week.days).length, total = storeCost();
    return { n, total, per: n ? total / (n * S.persons) : 0, left: S.budget - total };
  }
  function eligible() {
    return FREE.filter(r => S.diet === "veg" ? r.veg : S.diet === "protein" ? r.highProtein : true);
  }

  /* ---------- Fill the week automatically ---------- */
  function autofill() {
    const plan = {};
    for (const d in S.week.days) if (S.week.locked[d]) plan[d] = S.week.days[d];
    const pool = eligible(); if (!pool.length) return false;
    const open = [0, 1, 2, 3, 4, 5, 6].filter(d => !(d in plan));
    open.forEach((d, i) => {
      const used = new Set(Object.values(plan)), base = storeCost(plan);
      const target = Math.max((S.budget - base) / (open.length - i), 10);
      let cands = pool.filter(r => !used.has(r.id)); if (!cands.length) cands = pool;
      const prev = byId(plan[d - 1]);
      let best = null, bestScore = Infinity;
      for (const r of cands) {
        const m = storeCost({ ...plan, [d]: r.id }) - base;       // what this dish adds to the bill
        let s = Math.max(0, m - target) * 3 + m * 0.35 + Math.random() * target * 0.9;
        if (S.favs.includes(r.id)) s -= target * 0.35;
        if (prev && prev.dish === r.dish) s += target * 0.25;
        if (s < bestScore) { bestScore = s; best = r; }
      }
      plan[d] = best.id;
    });
    // Still over budget? Swap the day that saves most until it fits.
    for (let it = 0; it < 30; it++) {
      const cur = storeCost(plan); if (cur <= S.budget) break;
      let move = null, val = cur;
      for (const d of open) for (const r of pool) {
        if (plan[d] !== r.id && Object.values(plan).includes(r.id) && pool.length >= 7) continue;
        const t = storeCost({ ...plan, [d]: r.id }); if (t < val) { val = t; move = [d, r.id]; }
      }
      if (!move) break; plan[move[0]] = move[1];
    }
    S.week.days = plan;
    return true;
  }
  function swapDay(d) {
    const others = { ...S.week.days }; const cur = others[d]; delete others[d];
    const used = new Set(Object.values(others)), base = storeCost(others), room = S.budget - base;
    let cands = eligible().filter(r => r.id !== cur && !used.has(r.id));
    if (!cands.length) cands = eligible().filter(r => r.id !== cur);
    if (!cands.length) return null;
    let scored = cands.map(r => ({ r, m: storeCost({ ...others, [d]: r.id }) - base }));
    let ok = scored.filter(x => x.m <= room);
    if (!ok.length) ok = scored.sort((a, b) => a.m - b.m).slice(0, 3);
    const seen = swapSeen[d] || [];
    let fresh = ok.filter(x => !seen.includes(x.r.id));
    if (!fresh.length) { fresh = ok; swapSeen[d] = []; }
    const pick = fresh[Math.floor(Math.random() * fresh.length)].r;
    swapSeen[d] = [...(swapSeen[d] || []), cur].slice(-12);
    S.week.days[d] = pick.id;
    return pick;
  }

  /* ---------- Leftovers ---------- */
  function leftovers() {
    const n = needs(), out = [];
    for (const k in n) {
      const it = ITEMS[k]; if (!it.fresh || S.pantry[k]) continue;
      const left = packsFor(k, n[k].need) * it.pack - n[k].need;
      if (left > 0 && left / it.pack >= 0.3) out.push({ k, left });
    }
    return out;
  }
  function leftoverIdea(lo) {
    if (!lo.length) return null;
    const inWeek = new Set(Object.values(S.week.days));
    let best = null;
    for (const r of eligible()) {
      if (inWeek.has(r.id)) continue;
      let value = 0; const uses = [];
      for (const { k, left } of lo) {
        const ing = r.ingredients.find(i => i[0] === k);
        if (ing) { value += Math.min(left, ing[1] * S.persons / 4) * ITEMS[k].price / ITEMS[k].pack; uses.push(k); }
      }
      if (value >= 6 && (!best || value > best.value)) best = { r, uses, value };
    }
    if (!best) return null;
    const empty = [0, 1, 2, 3, 4, 5, 6].find(d => !S.week.days[d]);
    if (empty !== undefined) { best.day = empty; best.replace = false; }
    else {
      let bestDay = null, bestCost = Infinity;
      for (let d = 0; d < 7; d++) { if (S.week.locked[d]) continue; const c = storeCost({ ...S.week.days, [d]: best.r.id }); if (c < bestCost) { bestCost = c; bestDay = d; } }
      if (bestDay === null) return null;
      best.day = bestDay; best.replace = true; best.delta = bestCost - storeCost();
    }
    return best;
  }

  /* ---------- Amounts ---------- */
  function frac(a) {
    const q = Math.round(a * 4) / 4, w = Math.floor(q), f = q - w;
    const fs = f === 0.25 ? "¼" : f === 0.5 ? "½" : f === 0.75 ? "¾" : "";
    if (!w && !fs) return "¼";
    return (w || "") + fs;
  }
  function amount(a, u) {
    if (u === "g") return a >= 1000 ? `${(Math.round(a / 100) / 10).toLocaleString("en-GB")} kg` : `${a < 100 ? Math.max(5, Math.round(a / 5) * 5) : Math.round(a / 10) * 10} g`;
    if (u === "ml") {
      if (a <= 45) return `${frac(Math.round(a / 15 * 2) / 2)} tbsp`;
      return a >= 1000 ? `${(Math.round(a / 100) / 10).toLocaleString("en-GB")} l` : `${Math.round(a / 10) * 10} ml`;
    }
    const one = Math.round(a * 4) / 4 <= 1, f = frac(a);
    if (u === "can") return `${f} ${one ? "can" : "cans"}`;
    if (u === "clove") return `${f} ${one ? "clove" : "cloves"}`;
    return f;
  }
  // On the shopping list you buy whole cans, peppers and cloves, so round those up.
  const listAmount = (a, u) => (u === "g" || u === "ml") ? amount(a, u) : amount(Math.ceil(a - 0.05), u);
  const shortName = k => ITEMS[k].name.replace(/ \(.*\)/, "");
  const packLabel = k => { const it = ITEMS[k]; return it.unit === "g" || it.unit === "ml" ? amount(it.pack, it.unit) : `${it.pack}`; };

  /* ---------- Views ---------- */
  const VIEWS = ["week", "list", "recipes", "premium"];
  let view = "week";
  function route() {
    const v = location.hash.slice(1);
    showView(VIEWS.includes(v) ? v : "week", false);
  }
  function showView(v, push = true) {
    view = v;
    VIEWS.forEach(x => { $("#view-" + x).hidden = x !== v; });
    document.querySelectorAll(".tabbar a").forEach(a => { if (a.dataset.view === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    if (push && location.hash !== "#" + v) history.replaceState(null, "", "#" + v);
    render();
    window.scrollTo(0, 0);
    if (v === "premium") track("premium-view");
  }

  /* ----- Week ----- */
  function renderWeek() {
    const st = stats(), we = dayDate(6);
    const over = st.left < 0, pct = Math.min(100, st.total / S.budget * 100);
    const lo = leftovers(), idea = leftoverIdea(lo);
    const hasLast = S.lastWeek && Object.keys(S.lastWeek).some(d => canUse(S.lastWeek[d]));
    const range = `${MON.getDate()}${MON.getMonth() !== we.getMonth() ? " " + MONTHS[MON.getMonth()] : ""} – ${we.getDate()} ${MONTHS[we.getMonth()]}`;
    $("#view-week").innerHTML = `
      <div class="weekhead">
        <div><h2 id="weekTitle">Week ${isoWeek(MON)}</h2><span class="range">${range}</span></div>
        <button class="setchip" data-act="settings" aria-label="Change budget, people and diet">${people(S.persons)} · ${krText(S.budget)} · ${DIETS[S.diet].label}</button>
      </div>
      <div class="card budget ${over ? "over" : ""}">
        <div class="row"><b>${kr(st.total)}</b><span class="of">of ${kr(S.budget)} budget</span></div>
        <div class="bar" role="img" aria-label="${Math.round(pct)}% of budget used"><i style="width:${pct}%"></i></div>
        <div class="stats"><span><b>${kr(st.per)}</b> per serving</span><span><b>${st.n} of 7</b> dinners</span><span>${over ? "" : `<b>${kr(st.left)}</b> left`}</span></div>
        ${over ? `<p class="warnline">${krText(-st.left)} over budget. Tap Swap on a pricey day, or raise your budget.</p>` : ""}
      </div>
      <div class="actions ${hasLast ? "two" : ""}">
        <button class="btn" data-act="autofill">${ICON.spark} ${st.n ? "Refill my week" : "Fill my week"}</button>
        ${hasLast ? `<button class="btn ghost" data-act="repeat">Repeat last week</button>` : ""}
      </div>
      ${st.n ? "" : `<div class="tip"><h3>Your week is empty</h3><p>Tap <b>Fill my week</b> and get 7 dinners that fit your budget, with the shopping list done for you. Or tap a day to choose a dish yourself.</p></div>`}
      <ol class="days">${DAYS.map((name, i) => dayRow(name, i)).join("")}</ol>
      ${idea ? `<div class="tip"><h3>Use up your leftovers</h3>
        <p>You'll have some left over from full packs: ${lo.slice(0, 4).map(o => `${amount(o.left, ITEMS[o.k].unit)} ${esc(ITEMS[o.k].name.replace(/ \(.*\)/, "").toLowerCase())}`).join(", ")}.</p>
        <p><b>${esc(idea.r.name)}</b> uses ${idea.uses.map(k => esc(ITEMS[k].name.replace(/ \(.*\)/, "").toLowerCase())).join(" and ")}.</p>
        <button class="btn ghost" data-act="useLeftovers" data-id="${idea.r.id}" data-day="${idea.day}">${idea.replace ? `Put it on ${DAYS[idea.day]}${idea.delta < 0 ? ` (saves ${krText(-idea.delta)})` : ""}` : `Add it to ${DAYS[idea.day]}`}</button></div>` : ""}
      <div class="actions stack noprint">
        <button class="btn ghost" data-act="clear" ${st.n ? "" : "disabled"}>Clear week</button>
        <button class="btn ghost locked-next" data-act="premium">Plan next week <span class="pbadge">Premium</span></button>
      </div>`;
    anim = null;
  }
  function dayRow(name, i) {
    const r = byId(S.week.days[i]), d = dayDate(i), locked = !!S.week.locked[i];
    const head = `<div class="dhead"><span><span class="dn">${name}</span>${locked ? '<span class="lockpill">Locked</span>' : ""}</span><span class="dd">${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}</span></div>`;
    if (!r) return `<li class="day" data-day="${i}">${head}<button class="slot" data-act="pick" data-day="${i}">${ICON.plus} Choose a dish</button></li>`;
    return `<li class="day ${locked ? "locked" : ""}" data-day="${i}">${head}
      <div class="drow ${anim === i ? "pop" : ""}" draggable="true" data-from="${i}">
        <button class="thumb" data-act="open" data-id="${r.id}" data-day="${i}" aria-label="Open recipe: ${esc(r.name)}"><img src="${picture(r)}" alt="" width="92" height="69"></button>
        <div class="dinfo">
          <button class="dname" data-act="open" data-id="${r.id}" data-day="${i}">${esc(r.name)}</button>
          <span class="dmeta"><span class="nowrap">${krText(servingCost(r) * S.persons)}</span> · <span class="nowrap">${r.minutes} min</span></span>
          <div class="dbtns">
            <button class="dbtn" data-act="swap" data-day="${i}" ${locked ? "disabled" : ""} aria-label="Swap the dish on ${name}">${ICON.swap}<span class="lbl">Swap</span></button>
            <button class="dbtn" data-act="lock" data-day="${i}" aria-pressed="${locked}" aria-label="${locked ? "Unlock" : "Lock"} ${name}">${ICON.lock}</button>
            <button class="dbtn" data-act="remove" data-day="${i}" aria-label="Remove ${esc(r.name)} from ${name}">${ICON.x}</button>
          </div>
        </div>
      </div></li>`;
  }

  /* ----- Shopping list ----- */
  function listItems() {
    return Object.values(needs()).map(o => ({ ...o, it: ITEMS[o.k], packs: packsFor(o.k, o.need) }));
  }
  function renderList() {
    const all = listItems(), items = all.filter(o => !S.pantry[o.k]);
    const total = items.reduce((s, o) => s + o.packs * o.it.price, 0);
    const done = items.filter(o => S.checked[o.k]).length;
    const saved = all.filter(o => S.pantry[o.k]);
    const savedKr = saved.reduce((s, o) => s + o.packs * o.it.price, 0);
    const pantryCands = all.filter(o => showAllPantry || o.it.staple).sort((a, b) => a.it.name.localeCompare(b.it.name));
    const shopping = document.body.classList.contains("shopping");
    if (!all.length) {
      $("#view-list").innerHTML = `<h2 id="listTitle">Shopping list</h2><div class="empty"><p>Your list fills itself as soon as you have dinners in your week.</p><a class="btn" href="#week">Go to my week</a></div>`;
      return;
    }
    const groups = Object.keys(AISLES).map(a => {
      let g = items.filter(o => o.it.aisle === a).sort((x, y) => x.it.name.localeCompare(y.it.name));
      if (shopping) g = g.sort((x, y) => (S.checked[x.k] ? 1 : 0) - (S.checked[y.k] ? 1 : 0));
      if (!g.length) return "";
      return `<div class="group"><h3>${AISLES[a]}</h3><ul class="items">${g.map(o => {
        const id = "ck-" + o.k, buy = o.it.pack > 1 ? ` · buy ${o.packs} × ${packLabel(o.k)}` : "";
        return `<li class="item ${S.checked[o.k] ? "done" : ""}"><label for="${id}">
          <input type="checkbox" id="${id}" data-k="${o.k}" ${S.checked[o.k] ? "checked" : ""}><span class="box">${ICON.check}</span>
          <span class="iname"><span class="t"><span class="nowrap">${listAmount(o.need, o.it.unit)}</span> ${esc(shortName(o.k))}</span><small>${o.days.sort().map(d => SHORT[d]).join(", ")}${buy}</small></span>
          <span class="ikr">${kr(o.packs * o.it.price)}</span></label></li>`;
      }).join("")}</ul></div>`;
    }).join("");
    $("#view-list").innerHTML = `
      <div class="listhead">
        <h2 id="listTitle">Shopping list</h2>
        <div class="card totals"><div><b>${kr(total)}</b><small>at the shop, full packs · week ${isoWeek(MON)} · ${people(S.persons)}</small></div></div>
        <div class="progress"><span><b class="num">${done} of ${items.length}</b> in the basket</span><div class="bar"><i style="width:${items.length ? done / items.length * 100 : 0}%"></i></div></div>
        <div class="listbtns">
          <button class="btn ghost" data-act="share">Share</button>
          <button class="btn ghost" data-act="print">Print</button>
          <button class="btn ghost" data-act="shopmode" aria-pressed="${shopping}">${shopping ? "Done" : "Shop mode"}</button>
        </div>
      </div>
      <details class="card pantry" ${S.pantryOpen ? "open" : ""}>
        <summary>I already have${saved.length ? ` (${saved.length})` : ""}</summary>
        <p>Tap what's already in your kitchen. It comes off the list and the price. Salt, pepper and dried spices are never on the list.</p>
        <div class="chips">${pantryCands.map(o => `<button class="chip" data-act="pantry" data-k="${o.k}" aria-pressed="${!!S.pantry[o.k]}">${esc(o.it.name.replace(/ \(.*\)/, ""))}</button>`).join("")}
          <button class="chip" data-act="pantryAll">${showAllPantry ? "Show fewer" : "Show all items"}</button></div>
        ${saved.length ? `<p class="saved">Taken off: ${saved.map(o => esc(o.it.name.replace(/ \(.*\)/, ""))).join(", ")} (−${krText(savedKr)})</p>` : ""}
      </details>
      ${groups}
      <p class="fine">Prices are a guide: average Danish discount supermarket prices, updated ${fmtDate(PRICES_UPDATED)}. The total counts whole packs, so leftovers are included.</p>`;
  }
  function fmtDate(s) { const [y, m, d] = s.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; }
  function listText() {
    const items = listItems().filter(o => !S.pantry[o.k]);
    const total = items.reduce((s, o) => s + o.packs * o.it.price, 0);
    let t = `PlatePlan – shopping list, week ${isoWeek(MON)} (${people(S.persons)})\n`;
    for (const a in AISLES) {
      const g = items.filter(o => o.it.aisle === a); if (!g.length) continue;
      t += `\n${AISLES[a]}\n` + g.map(o => `${S.checked[o.k] ? "☑" : "☐"} ${listAmount(o.need, o.it.unit)} ${shortName(o.k)}`).join("\n") + "\n";
    }
    return t + `\nAbout ${krText(total)}`;
  }

  /* ----- Recipes ----- */
  function renderRecipes() {
    const f = S.filters;
    const q = query.trim().toLowerCase();
    const match = r => f.every(x => x === "fav" ? S.favs.includes(r.id) : r.tags.includes(x)) &&
      (!q || r.name.toLowerCase().includes(q) || r.ingredients.some(([k]) => ITEMS[k].name.toLowerCase().includes(q)));
    let list = FREE.filter(match);
    list.sort(sortBy === "price" ? (a, b) => servingCost(a) - servingCost(b) : sortBy === "time" ? (a, b) => a.minutes - b.minutes : (a, b) => a.name.localeCompare(b.name));
    const locked = LOCKED.filter(r => !f.includes("fav") && match(r));
    const chip = (k, label, dot) => `<button class="chip" data-act="filter" data-f="${k}" aria-pressed="${f.includes(k)}">${dot ? `<span class="dot" style="background:var(--${dot})"></span>` : ""}${label}</button>`;
    $("#view-recipes").innerHTML = `
      <div><h2 id="recipesTitle">Recipes</h2><p class="lead">${FREE.length} free dinners, all under 30 kr per serving.</p></div>
      <div class="filters">
        <div class="chips">${chip("veg", "Vegetarian", "veg")}${chip("protein", "High protein", "protein")}${chip("quick", "Quick (20 min)", "quick")}${chip("fav", "Favourites")}</div>
        <div class="searchrow">
          <label class="sr" for="q">Search recipes</label><input class="search" id="q" type="search" placeholder="Search, e.g. chicken or lentils" value="${esc(query)}" autocomplete="off">
          <label class="sr" for="sort">Sort</label><select class="search" id="sort"><option value="price">Cheapest</option><option value="time">Quickest</option><option value="name">A–Z</option></select>
        </div>
      </div>
      <div class="grid" id="rgrid">
        ${list.map(card).join("") || `<p class="empty" style="grid-column:1/-1">${f.includes("fav") && !S.favs.length ? "No favourites yet. Tap the heart on a dish to save it." : "No dishes match all your filters. Try turning one off."}</p>`}
        ${locked.map(r => `<article class="rcard locked"><button class="open" data-act="premium"><span class="lockpill2">Premium</span><img src="${picture(r)}" alt="" loading="lazy"><div class="body"><h3>${esc(r.name)}</h3>${tags(r)}<div class="meta"><span>${r.minutes} min</span><span>Unlock</span></div></div></button></article>`).join("")}
        <article class="rcard add"><button class="open" data-act="premium">${ICON.plus}<span>Save your own recipes</span><span class="pbadge">Premium</span></button></article>
      </div>`;
    $("#sort").value = sortBy;
  }
  const tags = r => `<div class="tags">${r.tags.map(t => `<span class="tag ${t}">${TAGS[t]}</span>`).join("")}</div>`;
  function favBtn(r) { const on = S.favs.includes(r.id); return `<button class="fav" data-act="fav" data-id="${r.id}" aria-pressed="${on}" aria-label="${on ? "Remove from" : "Save to"} favourites: ${esc(r.name)}">${ICON.heart}</button>`; }
  function card(r) {
    return `<article class="rcard"><button class="open" data-act="open" data-id="${r.id}"><img src="${picture(r)}" alt="" loading="lazy" width="400" height="300">
      <div class="body"><h3>${esc(r.name)}</h3>${tags(r)}<div class="meta"><span>${r.minutes} min</span><span class="price">${krText(servingCost(r))}/serving</span></div></div></button>${favBtn(r)}</article>`;
  }

  /* ----- Premium ----- */
  function renderPremium() {
    const it = S.interest || {};
    const row = (t, a, b) => `<tr><td>${t}</td><td class="${a === "No" ? "no" : ""}">${a}</td><td class="yes">${b}</td></tr>`;
    $("#view-premium").innerHTML = `
      <div class="hero"><h2 id="premiumTitle">PlatePlan Premium</h2><p>For when one week at a time isn't enough: more dishes, new ones every week, and macros for every meal.</p></div>
      <div class="plans">
        <div class="plan"><span>Monthly</span><b>45 kr</b><small>per month, cancel any time</small></div>
        <div class="plan best"><span class="save">Save 241 kr</span><span>Yearly</span><b>299 kr</b><small>per year, about 25 kr a month</small></div>
      </div>
      <div class="card"><table class="cmp"><thead><tr><th scope="col"></th><th scope="col">Free</th><th scope="col">Premium</th></tr></thead><tbody>
        ${row("Recipes", "20", "500+")}${row("New recipes every week", "No", "Yes")}${row("Week plans", "1 active", "Several weeks ahead")}
        ${row("Shopping list, price and pantry", "Yes", "Yes")}${row("Macros (kcal, protein, carbs, fat)", "No", "Yes")}
        ${row("Save your own recipes", "No", "Yes")}${row("Share your plan with flatmates", "No", "Yes")}
      </tbody></table></div>
      <div class="card">
        <form class="form" id="waitForm" novalidate>
          <h3>Premium isn't open yet</h3>
          <p class="lead">Join the waitlist and we'll let you know when it opens. You won't be charged anything now.</p>
          <label for="wEmail">Your email</label>
          <input type="email" id="wEmail" autocomplete="email" inputmode="email" placeholder="name@example.com" required>
          <button class="btn sun wide" type="submit">Join the waitlist</button>
          <p class="msg ok" id="wMsg" role="status">${it.waitlist ? "Thanks, you're on the list." : it.interested ? "Thanks for your interest! The waitlist opens soon." : ""}</p>
        </form>
        <button class="btn ghost wide" data-act="trial" style="margin-top:8px">${it.trial ? "Thanks for your interest!" : "Try Premium free for 7 days"}</button>
        <p class="fine" style="margin-top:8px">The free trial isn't live yet. Tapping it only tells us you're interested.</p>
      </div>`;
  }

  function render() {
    if (view === "week") renderWeek();
    if (view === "list") renderList();
    if (view === "recipes") renderRecipes();
    if (view === "premium") renderPremium();
    const left = listItems().filter(o => !S.pantry[o.k] && !S.checked[o.k]).length;
    const b = $("#listBadge"); b.hidden = !left; b.textContent = left;
    save();
  }

  /* ---------- Sheets ---------- */
  const sheet = $("#sheet"); let lastFocus = null, onboarding = null;
  function openSheet(html) {
    lastFocus = document.activeElement;
    $("#sheetBody").innerHTML = html;
    if (!sheet.open) sheet.showModal();
    sheet.scrollTop = 0;
  }
  function closeSheet() { if (sheet.open) sheet.close(); }
  sheet.addEventListener("close", () => {
    if (onboarding) finishOnboarding(true);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  });
  sheet.addEventListener("click", e => { if (e.target === sheet) closeSheet(); });

  function openRecipe(id, forDay) {
    const r = byId(id); if (!r) return;
    const f = S.persons / 4, m = r.macros;
    openSheet(`<div class="mimg"><img src="${picture(r)}" alt="${esc(r.name)}">${favBtn(r)}<button class="close" data-act="close" aria-label="Close">×</button></div>
      <div class="sheet">
        <h2 id="sheetTitle">${esc(r.name)}</h2>
        ${tags(r)}
        <div class="facts"><span><b>${r.minutes} min</b></span><span><b>${krText(servingCost(r))}</b> per serving</span><span><b>${krText(servingCost(r) * S.persons)}</b> for ${people(S.persons)}</span></div>
        <div class="macros locked" aria-label="Macros per serving (Premium)">
          <div><b>${m.kcal}</b><span>kcal</span></div><div><b>${m.protein} g</b><span>protein</span></div><div><b>${m.carbs} g</b><span>carbs</span></div><div><b>${m.fat} g</b><span>fat</span></div>
          <button class="unlock" data-act="premium"><span>See macros with Premium</span></button>
        </div>
        <div><h3>Ingredients for ${people(S.persons)}</h3><ul>${r.ingredients.map(([k, a]) => `<li><b class="nowrap">${amount(a * f, ITEMS[k].unit)}</b> ${esc(ITEMS[k].name.replace(/ \(.*\)/, "").toLowerCase())}</li>`).join("")}</ul></div>
        <div><h3>Method</h3><ol>${r.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>
        <div><h3>${forDay !== undefined ? "Move or copy to another day" : "Add to your week"}</h3>
          <div class="daypick">${SHORT.map((d, i) => { const o = byId(S.week.days[i]); return `<button data-act="place" data-id="${r.id}" data-day="${i}" class="${o && o.id === r.id ? "current" : ""}">${d}<small>${o ? (o.id === r.id ? "This dish" : "Replace") : "Free"}</small></button>`; }).join("")}</div></div>
      </div>`);
  }
  function openPicker(d) {
    const base = storeCost(), pool = eligible();
    const rows = pool.map(r => ({ r, m: storeCost({ ...S.week.days, [d]: r.id }) - base })).sort((a, b) => a.m - b.m);
    openSheet(`<div class="sheet"><div class="sheethead"><h2 id="sheetTitle">Dinner for ${DAYS[d]}</h2><button class="close" data-act="close" aria-label="Close">×</button></div>
      <p class="lead">Sorted by what each dish adds to this week's shopping. Dishes that share ingredients with your week are cheaper.</p>
      <div>${rows.map(({ r, m }) => `<button class="pickrow" data-act="place" data-id="${r.id}" data-day="${d}"><img src="${picture(r)}" alt=""><span><b>${esc(r.name)}</b><small>${r.minutes} min${Object.values(S.week.days).includes(r.id) ? " · already this week" : ""}</small></span><span class="add">+${krText(m)}</span></button>`).join("")}</div>
      ${S.diet !== "all" ? `<p class="fine">Showing ${DIETS[S.diet].label.toLowerCase()} dishes. Change this in settings.</p>` : ""}</div>`);
  }

  /* ----- Onboarding and settings ----- */
  function startOnboarding() {
    onboarding = { step: 0, budget: S.budget, persons: S.persons, diet: S.diet };
    renderOnboarding();
  }
  function renderOnboarding() {
    const o = onboarding, steps = `<div class="steps" aria-hidden="true">${[0, 1, 2].map(i => `<i class="${i <= o.step ? "on" : ""}"></i>`).join("")}</div>`;
    let body = "";
    if (o.step === 0) body = `<h2 id="sheetTitle">What can dinner cost this week?</h2>
      <p class="lead">For 7 dinners for everyone you cook for. You can change it any time.</p>
      <div class="big" id="obBudgetOut">${o.budget} kr</div>
      <label class="sr" for="obBudget">Weekly budget in kr</label>
      <input class="range" type="range" id="obBudget" min="150" max="1000" step="25" value="${o.budget}">
      <div class="quick">${[250, 400, 600].map(v => `<button class="chip" data-act="obBudget" data-v="${v}" aria-pressed="${o.budget === v}">${v} kr</button>`).join("")}</div>`;
    if (o.step === 1) body = `<h2 id="sheetTitle">How many are eating?</h2>
      <p class="lead">Amounts and prices follow the number of people.</p>
      <div class="stepper"><button data-act="obPeople" data-v="-1" aria-label="Fewer people">−</button><div class="big" aria-live="polite">${o.persons}</div><button data-act="obPeople" data-v="1" aria-label="More people">+</button></div>
      <p class="lead" style="text-align:center">${o.persons === 1 ? "Just you" : `${o.persons} people`} · about ${krText(o.budget / 7 / o.persons)} per serving</p>`;
    if (o.step === 2) body = `<h2 id="sheetTitle">What do you eat?</h2>
      <div class="choice" role="radiogroup" aria-label="Diet">${Object.entries(DIETS).map(([k, d]) => `<label><input type="radio" name="obDiet" value="${k}" ${o.diet === k ? "checked" : ""}><span><b>${d.label}</b><small>${d.hint}</small></span></label>`).join("")}</div>`;
    openSheet(`<div class="sheet">${steps}<p class="fine">Step ${o.step + 1} of 3</p>${body}
      <div class="navrow">${o.step ? `<button class="btn ghost" data-act="obBack">Back</button>` : `<button class="btn ghost" data-act="obSkip">Skip</button>`}
      <button class="btn" data-act="obNext">${o.step < 2 ? "Next" : "Make my week"}</button></div></div>`);
  }
  function finishOnboarding(skipped) {
    const o = onboarding; onboarding = null;
    if (!skipped) { S.budget = o.budget; S.persons = o.persons; S.diet = o.diet; }
    S.onboarded = true;
    if (!skipped || !Object.keys(S.week.days).length) autofill();
    anim = null; render();
    const st = stats();
    toast(st.left >= 0 ? `Your week is ready: ${krText(st.total)} for ${people(S.persons)}` : `Your week costs ${krText(st.total)}, ${krText(-st.left)} over budget`);
    track(skipped ? "onboarding-skip" : "onboarding-done");
    closeSheet();
  }
  function openSettings() {
    const installed = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    openSheet(`<div class="sheet"><div class="sheethead"><h2 id="sheetTitle">Settings</h2><button class="close" data-act="close" aria-label="Close">×</button></div>
      <div class="card" style="display:grid;gap:8px"><label for="setBudget"><b>Weekly budget</b> <span class="nowrap" id="setBudgetOut">${S.budget} kr</span></label>
        <input class="range" type="range" id="setBudget" min="150" max="1000" step="25" value="${S.budget}"></div>
      <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><b>People</b>
        <div class="stepper"><button data-act="setPeople" data-v="-1" aria-label="Fewer people">−</button><b class="num" style="font-size:22px;min-width:24px;text-align:center" aria-live="polite">${S.persons}</b><button data-act="setPeople" data-v="1" aria-label="More people">+</button></div></div>
      <div class="choice" role="radiogroup" aria-label="Diet">${Object.entries(DIETS).map(([k, d]) => `<label><input type="radio" name="setDiet" value="${k}" ${S.diet === k ? "checked" : ""}><span><b>${d.label}</b><small>${d.hint}</small></span></label>`).join("")}</div>
      <button class="btn wide" data-act="autofill">${ICON.spark} Refill my week with these settings</button>
      <div class="card" style="display:grid;gap:8px"><h3>Add PlatePlan to your home screen</h3>
        ${installed ? `<p>PlatePlan is installed on this device.</p>` : deferredPrompt ? `<p>Open it like an app, even offline.</p><button class="btn" data-act="install">Install PlatePlan</button>`
          : ios ? `<p>In Safari, tap <b>Share</b> at the bottom of the screen, then <b>Add to Home Screen</b>.</p>` : `<p>In Chrome, open the menu <b>⋮</b> and choose <b>Install app</b> or <b>Add to Home screen</b>.</p>`}</div>
      <button class="textbtn" data-act="reset" id="resetBtn">Start over (deletes your plan on this device)</button>
      </div>`);
  }

  /* ---------- Actions ---------- */
  function place(id, d) {
    if (!canUse(id)) { showView("premium"); return; }
    S.week.days[d] = id; anim = d; closeSheet(); render();
    toast(`${byId(id).name} on ${DAYS[d]}`);
  }
  const actions = {
    settings: () => openSettings(),
    close: () => closeSheet(),
    premium: () => { closeSheet(); track("premium-click"); location.hash = "#premium"; },
    autofill: () => {
      if (!autofill()) { toast("No dishes match your diet"); return; }
      closeSheet(); render(); track("autofill");
      const st = stats(); toast(st.left >= 0 ? `Done: ${krText(st.total)}, ${krText(st.left)} under budget` : `Cheapest week we found: ${krText(st.total)}`);
    },
    repeat: () => {
      for (const d in S.lastWeek) if (!S.week.locked[d] && canUse(S.lastWeek[d])) S.week.days[d] = S.lastWeek[d];
      render(); toast("Last week's dinners are back"); track("repeat-week");
    },
    clear: () => { for (const d in S.week.days) if (!S.week.locked[d]) delete S.week.days[d]; render(); toast("Cleared. Locked days were kept."); },
    pick: el => openPicker(+el.dataset.day),
    open: el => openRecipe(el.dataset.id, el.dataset.day !== undefined ? +el.dataset.day : undefined),
    place: el => place(el.dataset.id, +el.dataset.day),
    swap: el => { const d = +el.dataset.day, r = swapDay(d); if (!r) { toast("No other dishes match your diet"); return; } anim = d; render(); toast(`Swapped: ${r.name}`); track("swap"); },
    lock: el => { const d = +el.dataset.day; S.week.locked[d] = !S.week.locked[d]; if (!S.week.locked[d]) delete S.week.locked[d]; render(); toast(S.week.locked[d] ? `${DAYS[d]} is locked` : `${DAYS[d]} is unlocked`); },
    remove: el => {
      const d = +el.dataset.day, row = el.closest(".drow");
      const done = () => { delete S.week.days[d]; delete S.week.locked[d]; render(); };
      if (row && !matchMedia("(prefers-reduced-motion: reduce)").matches) { row.classList.add("out"); setTimeout(done, 190); } else done();
    },
    useLeftovers: el => { place(el.dataset.id, +el.dataset.day); track("leftovers"); },
    fav: el => {
      const id = el.dataset.id, on = S.favs.includes(id);
      S.favs = on ? S.favs.filter(x => x !== id) : [...S.favs, id];
      document.querySelectorAll(`.fav[data-id="${id}"]`).forEach(b => { b.setAttribute("aria-pressed", !on); b.setAttribute("aria-label", `${on ? "Save to" : "Remove from"} favourites: ${byId(id).name}`); });
      save(); toast(on ? "Removed from favourites" : "Saved to favourites. Fill my week will pick it more often.");
      if (view === "recipes" && S.filters.includes("fav")) renderRecipes();
    },
    filter: el => { const f = el.dataset.f; S.filters = S.filters.includes(f) ? S.filters.filter(x => x !== f) : [...S.filters, f]; renderRecipes(); save(); },
    pantry: el => { const k = el.dataset.k; if (S.pantry[k]) delete S.pantry[k]; else S.pantry[k] = true; S.pantryOpen = true; render(); },
    pantryAll: () => { showAllPantry = !showAllPantry; S.pantryOpen = true; renderList(); },
    share: async () => {
      const text = listText(); track("share-list");
      if (navigator.share) { try { await navigator.share({ title: "PlatePlan shopping list", text }); return; } catch (e) { if (e.name === "AbortError") return; } }
      try { await navigator.clipboard.writeText(text); toast("List copied. Paste it wherever you like."); } catch (e) { toast("Sharing isn't available in this browser"); }
    },
    print: () => { track("print-list"); window.print(); },
    shopmode: async () => {
      const on = document.body.classList.toggle("shopping");
      renderList();
      if (on) { toast("Shop mode: tap items as they go in the basket"); try { wakeLock = await navigator.wakeLock.request("screen"); } catch (e) { /* not supported */ } }
      else if (wakeLock) { wakeLock.release().catch(() => { }); wakeLock = null; }
    },
    trial: () => { S.interest = { ...S.interest, trial: true }; track("trial-interest"); renderPremium(); save(); toast("Thanks! We'll use this to decide when to open Premium."); },
    install: async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice.catch(() => { }); deferredPrompt = null; closeSheet(); track("install"); },
    reset: el => {
      if (!el.dataset.sure) { el.dataset.sure = "1"; el.textContent = "Tap again to delete everything"; return; }
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      location.reload();
    },
    obBudget: el => { onboarding.budget = +el.dataset.v; renderOnboarding(); },
    obPeople: el => { onboarding.persons = Math.min(8, Math.max(1, onboarding.persons + +el.dataset.v)); renderOnboarding(); },
    obBack: () => { onboarding.step--; renderOnboarding(); },
    obNext: () => { if (onboarding.step < 2) { onboarding.step++; renderOnboarding(); } else finishOnboarding(false); },
    obSkip: () => finishOnboarding(true),
    setPeople: el => { S.persons = Math.min(8, Math.max(1, S.persons + +el.dataset.v)); render(); openSettings(); }
  };
  let wakeLock = null, deferredPrompt = null, checkTimer = null;

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el || el.disabled) return;
    const fn = actions[el.dataset.act]; if (!fn) return;
    if (el.tagName === "A") e.preventDefault();
    fn(el);
  });
  document.addEventListener("input", e => {
    const t = e.target;
    if (t.id === "q") { query = t.value; const pos = t.selectionStart; renderRecipes(); const n = $("#q"); n.focus(); n.setSelectionRange(pos, pos); }
    if (t.id === "obBudget") { onboarding.budget = +t.value; $("#obBudgetOut").textContent = t.value + " kr"; document.querySelectorAll('[data-act="obBudget"]').forEach(b => b.setAttribute("aria-pressed", +b.dataset.v === +t.value)); }
    if (t.id === "setBudget") { S.budget = +t.value; $("#setBudgetOut").textContent = t.value + " kr"; render(); }
  });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.id === "sort") { sortBy = t.value; renderRecipes(); }
    if (t.name === "obDiet") onboarding.diet = t.value;
    if (t.name === "setDiet") { S.diet = t.value; render(); }
    if (t.dataset && t.dataset.k && t.type === "checkbox") {
      S.checked[t.dataset.k] = t.checked; if (!t.checked) delete S.checked[t.dataset.k];
      const li = t.closest(".item"); li.classList.toggle("done", t.checked);
      save();
      // update counters without re-rendering, so the strike-through animation is visible
      clearTimeout(checkTimer); checkTimer = setTimeout(() => { const y = window.scrollY; render(); window.scrollTo(0, y); const n = document.getElementById(t.id); if (n) n.focus({ preventScroll: true }); }, document.body.classList.contains("shopping") ? 650 : 350);
    }
  });
  document.addEventListener("toggle", e => { if (e.target.classList && e.target.classList.contains("pantry")) { S.pantryOpen = e.target.open; save(); } }, true);
  document.addEventListener("submit", async e => {
    if (e.target.id !== "waitForm") return;
    e.preventDefault();
    const input = $("#wEmail"), msg = $("#wMsg"), email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.className = "msg err"; msg.textContent = "That doesn't look like an email address. Check it and try again."; input.focus(); return; }
    track("waitlist");
    if (typeof WAITLIST_URL === "string" && WAITLIST_URL) {
      try {
        const res = await fetch(WAITLIST_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email, source: "PlatePlan" }) });
        if (!res.ok) throw new Error(res.status);
        S.interest = { ...S.interest, waitlist: true }; save();
        msg.className = "msg ok"; msg.textContent = "Thanks, you're on the list."; input.value = "";
      } catch (err) { msg.className = "msg err"; msg.textContent = "We couldn't save your email. Check your connection and try again."; }
    } else {
      S.interest = { ...S.interest, interested: true }; save();
      msg.className = "msg ok"; msg.textContent = "Thanks for your interest! The waitlist opens soon."; input.value = "";
    }
  });

  // Drag a dinner to another day (mouse)
  document.addEventListener("dragstart", e => { const r = e.target.closest(".drow"); if (!r) return; e.dataTransfer.setData("text/plain", r.dataset.from); e.dataTransfer.effectAllowed = "move"; });
  document.addEventListener("dragover", e => { const d = e.target.closest(".day"); if (!d) return; e.preventDefault(); document.querySelectorAll(".day.over").forEach(x => x !== d && x.classList.remove("over")); d.classList.add("over"); });
  document.addEventListener("dragleave", e => { const d = e.target.closest(".day"); if (d && !d.contains(e.relatedTarget)) d.classList.remove("over"); });
  document.addEventListener("drop", e => {
    const d = e.target.closest(".day"); if (!d) return; e.preventDefault(); d.classList.remove("over");
    const from = +e.dataTransfer.getData("text/plain"), to = +d.dataset.day; if (isNaN(from) || from === to) return;
    const days = S.week.days, there = days[to]; days[to] = days[from]; if (there) days[from] = there; else delete days[from];
    anim = to; render();
  });

  /* ---------- PWA: offline and home screen ---------- */
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const framed = window.self !== window.top;
  if (framed) document.documentElement.classList.add("framed");
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => { });
  function installHint(html) {
    const box = $("#install");
    box.innerHTML = `<img src="icons/icon-192.png" alt="">${html}<button class="close" data-x aria-label="Close">×</button>`;
    box.hidden = false;
    box.querySelector("[data-x]").onclick = () => { box.hidden = true; try { localStorage.setItem("plateplan-install", "no"); } catch (e) { /* ignore */ } };
    const btn = box.querySelector("[data-install]");
    if (btn) btn.onclick = () => { box.hidden = true; actions.install(); };
  }
  let hintOk = !standalone && !framed;
  try { if (localStorage.getItem("plateplan-install") === "no") hintOk = false; } catch (e) { /* ignore */ }
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); deferredPrompt = e;
    if (hintOk && S.onboarded) installHint(`<p><b>Add PlatePlan to your home screen</b>Opens like an app, even offline.</p><button class="btn" data-install>Install</button>`);
  });
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  function maybeIOSHint() { if (hintOk && isIOS && S.onboarded) installHint(`<p><b>Add PlatePlan to your home screen</b>Tap <b style="display:inline;font:inherit;font-weight:800">Share</b> in Safari, then <b style="display:inline;font:inherit;font-weight:800">Add to Home Screen</b>.</p>`); }

  /* ---------- Start ---------- */
  window.addEventListener("hashchange", route);
  route();
  if (!S.onboarded) startOnboarding(); else setTimeout(maybeIOSHint, 2500);
})();
