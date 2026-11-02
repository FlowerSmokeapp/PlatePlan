/*
  PlatePlan – app logic.
  Data: data/items.js, data/recipes.js. Server: js/backend.js. Pictures: js/illustrations.js.
  What you tick in "Cook What You Have" is only kept until the app is closed.
*/
(function () {
  "use strict";

  /* ---------- Recipes: derived info ---------- */
  RECIPES.forEach(r => {
    r.ingredients = r.ingredients.filter(([k]) => { if (!ITEMS[k]) console.warn(`PlatePlan: "${k}" in ${r.id} is missing from data/items.js`); return !!ITEMS[k]; });
    r.veg = r.ingredients.every(([k]) => !ITEMS[k].meat);
    r.allergens = [...new Set(r.ingredients.flatMap(([k]) => ITEMS[k].allergens || []))];
  });
  const byId = id => RECIPES.find(r => r.id === id);
  const picture = r => window.drawDish(r, RECIPES.indexOf(r));

  /* ---------- Helpers ---------- */
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDay = iso => { const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
  const kr = v => `${Number.isInteger(v) ? v : v.toFixed(2).replace(".", ",")} kr`;
  let toastTimer;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2800); }
  const store = {
    get(k, def) { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const ICON = {
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    devices: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="13" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="15" y="9" width="6" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 19h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  const TOOL_ICON = {
    hob: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="15.5" cy="14" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    oven: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 8h17M7 5.8h.01M10 5.8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="7" y="11" width="10" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    airfryer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 11h16M9 15h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.5" r="1.3" fill="currentColor"/></svg>',
    microwave: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="5.5" y="8" width="10" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M18.5 9v.01M18.5 12v.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    kettle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9h11l-1 11H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M17 11h1.5a2 2 0 0 1 0 4H16.5M8 9l1-4h5l1 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    blender: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10l-2 11H9zM9 14l-1 3h8l-1-3M7 20h10v-3H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
  };
  const toolText = r => r.tools.length ? r.tools.map(t => t.split("|").map(x => TOOLS[x]).join(" or ")).join(" + ") : "No cooking";
  const itemName = k => ITEMS[k].name;
  const lower = k => ITEMS[k].name.toLowerCase();

  /* ---------- Analytics (only if a GoatCounter code is set) ---------- */
  if (GOATCOUNTER_CODE) {
    const s = document.createElement("script"); s.async = true; s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`; document.head.appendChild(s);
  }
  function track(name) { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "event-" + name, title: name, event: true }); } catch (e) { /* ignore */ } }

  /* ---------- State ---------- */
  let user = null, profile = null;
  const kitchen = store.get("pp-kitchen", { have: {}, tools: { hob: true, oven: true } }); // temporary
  const saveKitchen = () => store.set("pp-kitchen", kitchen);
  let place = "fridge", foodQuery = "";
  let offersData = null, offersLoading = false, offerMode = "recipes", offerStore = "", offerQuery = "";
  let quickTool = "";
  let welcomeMode = "signup", plan = "yearly";
  let editProfile = null;
  const isPremium = () => !!(profile && profile.premium_until && new Date(profile.premium_until) > new Date());
  // Premium: hide recipes with the user's allergies or foods they don't like.
  function visible(r) {
    if (!isPremium()) return true;
    if (profile.allergies.some(a => r.allergens.includes(a))) return false;
    if (profile.dislikes.some(k => r.ingredients.some(i => i[0] === k))) return false;
    return true;
  }

  /* ---------- Screens ---------- */
  function showScreen(id) {
    ["welcome", "premium", "app"].forEach(x => { $("#" + x).hidden = x !== id; });
    window.scrollTo(0, 0);
  }

  /* ----- 1. Welcome ----- */
  function showWelcome(mode = welcomeMode, msg = "") {
    welcomeMode = mode;
    const signup = mode === "signup";
    $("#welcome").innerHTML = `<div class="inner">
      <svg class="hero-logo" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="13" fill="#2F6143"/><circle cx="24" cy="24" r="15" fill="#FBF8F2"/><circle cx="24" cy="24" r="9.5" fill="#F2B330"/></svg>
      <div><h2 id="welcomeTitle">PlatePlan</h2><p class="lead">Dinner ideas from what you have at home and what's on offer this week.</p></div>
      <div class="tabs2" role="group" aria-label="Account">
        <button data-act="wMode" data-m="signup" aria-pressed="${signup}">Create account</button>
        <button data-act="wMode" data-m="login" aria-pressed="${!signup}">Log in</button>
      </div>
      <form class="form" id="authForm" novalidate>
        <div class="field"><label for="aEmail">Email</label><input id="aEmail" type="email" autocomplete="email" inputmode="email" required></div>
        <div class="field"><label for="aPw">Password</label><input id="aPw" type="password" autocomplete="${signup ? "new-password" : "current-password"}" minlength="8" required>${signup ? '<span class="small muted">At least 8 characters</span>' : ""}</div>
        <p class="${msg && msg.ok ? "ok" : "error"}" id="aMsg" role="alert">${msg ? esc(msg.text || msg) : ""}</p>
        <button class="btn wide" type="submit">${signup ? "Create account" : "Log in"}</button>
      </form>
      <button class="link" data-act="guest">Continue without an account</button>
      ${Backend.live ? "" : '<p class="banner">Demo mode: accounts are only stored on this device until the app is connected to its server.</p>'}
    </div>`;
    showScreen("welcome");
  }

  /* ----- 2. Premium ----- */
  function showPremium() {
    const trialUsed = profile && profile.trial_used;
    const P = PREMIUM_PRICES, save = P.monthly * 12 - P.yearly;
    const cta = !user ? `<button class="btn wide" data-act="toSignup">Create an account to start</button>`
      : isPremium() ? `<p class="ok">You have Premium until ${fmtDay(profile.premium_until)}.</p>`
      : trialUsed ? `<button class="btn wide" disabled>Paid plans open soon</button>`
      : `<button class="btn wide" data-act="trial">Start ${P.trialDays}-day free trial</button>`;
    $("#premium").innerHTML = `<button class="xclose" data-act="closePremium" aria-label="Close and go to the app">${ICON.x}</button>
      <div class="inner" style="padding-top:36px">
        <div><span class="pbadge">Premium</span><h2 id="premiumTitle" style="margin-top:10px">Get more from your kitchen</h2></div>
        <ul class="perks">
          <li><span class="ic">${ICON.camera}</span><span><b>Scan your fridge</b><small>Take a photo and we tick what you have.</small></span></li>
          <li><span class="ic">${ICON.shield}</span><span><b>Allergies and dislikes</b><small>Never see recipes with things you can't eat or don't like.</small></span></li>
          <li><span class="ic">${ICON.devices}</span><span><b>Your settings everywhere</b><small>Log in on any phone and your preferences follow you.</small></span></li>
        </ul>
        <div class="plans" role="group" aria-label="Choose a plan">
          <button class="plan" data-act="plan" data-p="monthly" aria-pressed="${plan === "monthly"}"><span>Monthly</span><b>${P.monthly} kr</b><small>per month</small></button>
          <button class="plan" data-act="plan" data-p="yearly" aria-pressed="${plan === "yearly"}"><span class="save">Save ${save} kr</span><span>Yearly</span><b>${P.yearly} kr</b><small>about ${Math.round(P.yearly / 12)} kr a month</small></button>
        </div>
        ${cta}
        <p class="small muted">The free trial needs no card. Paid plans open soon, and you'll choose then. Everything else in PlatePlan is free.</p>
      </div>`;
    showScreen("premium");
    track("premium-view");
  }

  /* ----- 3. App ----- */
  const VIEWS = { cook: "Cook What You Have", offers: "This week's offers", quick: "15-minute dinners", account: "Account" };
  let view = "cook";
  function showApp() { showScreen("app"); route(); }
  function route() {
    const v = location.hash.slice(1);
    view = VIEWS[v] ? v : "cook";
    Object.keys(VIEWS).forEach(x => { $("#view-" + x).hidden = x !== view; });
    document.querySelectorAll(".tabbar a").forEach(a => { if (a.dataset.view === view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    $("#viewTitle").textContent = VIEWS[view];
    document.title = `${VIEWS[view]} · PlatePlan`;
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    if (view === "cook") renderCook();
    if (view === "offers") renderOffers();
    if (view === "quick") renderQuick();
    if (view === "account") renderAccount();
  }

  /* ----- Recipe card ----- */
  function card(r, status) {
    return `<button class="rcard" data-act="open" data-id="${r.id}"><img src="${picture(r)}" alt="" width="108" height="81" loading="lazy">
      <span><h3>${esc(r.name)}</h3><span class="meta">${r.minutes} min · ${esc(toolText(r))}${r.veg ? " · Vegetarian" : ""}</span>${status || ""}</span></button>`;
  }

  /* ----- Cook What You Have ----- */
  const canCook = r => r.tools.every(req => req.split("|").some(t => kitchen.tools[t]));
  const missingFor = r => r.ingredients.filter(([k]) => !kitchen.have[k]).map(([k]) => k);
  function renderCook() {
    const haveCount = Object.keys(kitchen.have).length;
    const counts = {}; Object.keys(PLACES).forEach(p => { counts[p] = Object.keys(kitchen.have).filter(k => ITEMS[k].place === p).length; });
    const q = foodQuery.trim().toLowerCase();
    const shown = Object.keys(ITEMS).filter(k => q ? itemName(k).toLowerCase().includes(q) : ITEMS[k].place === place).sort((a, b) => itemName(a).localeCompare(itemName(b)));
    const pool = RECIPES.filter(r => visible(r) && canCook(r)).map(r => ({ r, miss: missingFor(r) }));
    const ready = pool.filter(x => !x.miss.length).sort((a, b) => a.r.minutes - b.r.minutes);
    const almost = pool.filter(x => x.miss.length && x.miss.length <= 2).sort((a, b) => a.miss.length - b.miss.length || a.r.minutes - b.r.minutes);
    const total = ready.length + almost.length;
    $("#view-cook").innerHTML = `
      <p class="intro">Tick the food you have and the tools you can use. We'll show what you can make.</p>
      <button class="scan" data-act="scan" id="scanBtn"><span class="ic">${ICON.camera}</span><span><b>Scan your fridge</b><small>Take a photo and we'll tick the items for you</small></span>${isPremium() ? "" : '<span class="pbadge">Premium</span>'}</button>
      <div class="sec">
        <h2>Food you have ${haveCount ? `<span class="count">${haveCount}</span>` : ""}</h2>
        <div class="seg" role="group" aria-label="Where">${Object.entries(PLACES).map(([p, label]) => `<button data-act="place" data-p="${p}" aria-pressed="${!q && place === p}">${label}${counts[p] ? ` <b>${counts[p]}</b>` : ""}</button>`).join("")}</div>
        <label class="sr" for="foodQ">Search food</label><input class="search" id="foodQ" type="search" placeholder="Search all food" value="${esc(foodQuery)}" autocomplete="off">
        <div class="chips">${shown.map(k => `<button class="chip" data-act="have" data-k="${k}" aria-pressed="${!!kitchen.have[k]}">${esc(itemName(k))}</button>`).join("") || '<p class="muted small">Nothing found. Try another word.</p>'}</div>
        ${haveCount ? '<button class="link" data-act="clearFood" style="justify-self:start">Clear all food</button>' : ""}
      </div>
      <div class="sec">
        <h2>Tools you can use</h2>
        <div class="chips">${Object.entries(TOOLS).map(([t, label]) => `<button class="chip tool" data-act="tool" data-t="${t}" aria-pressed="${!!kitchen.tools[t]}">${TOOL_ICON[t]}${label}</button>`).join("")}</div>
      </div>
      ${haveCount ? `<button class="btn wide stickybtn" data-act="toResults">${total ? `Show ${total} recipe${total === 1 ? "" : "s"}` : "No recipes yet"}</button>` : ""}
      <div class="sec" id="results">
        ${!haveCount ? `<div class="empty"><p>Tick a few things above, and recipes you can make will appear here.</p></div>` : `
          <h2>Ready to cook <span class="count">${ready.length}</span></h2>
          ${ready.length ? `<div class="rlist">${ready.map(x => card(x.r, `<p class="status have">You have everything</p>`)).join("")}</div>` : '<p class="muted small">Nothing you can make with only what you ticked. See the ones below that need one or two more things.</p>'}
          <h2 style="margin-top:10px">Missing one or two things <span class="count">${almost.length}</span></h2>
          ${almost.length ? `<div class="rlist">${almost.map(x => card(x.r, `<p class="status miss">Missing: ${x.miss.map(lower).map(esc).join(", ")}</p>`)).join("")}</div>` : '<p class="muted small">Tick a few more things to see more ideas.</p>'}`}
      </div>`;
  }

  /* ----- Offers ----- */
  const STORE_COLORS = { "Netto": "#F6C700", "Rema 1000": "#1E3C8C", "Lidl": "#0050AA", "Føtex": "#0A3D91", "Bilka": "#0072BC", "Meny": "#C8102E", "Coop 365": "#E30613", "Kvickly": "#E30613", "SuperBrugsen": "#E30613", "Løvbjerg": "#D2232A", "Spar": "#E2001A" };
  function offerMatches() {
    const out = {}; // item key -> cheapest matching offer
    const offers = (offersData ? offersData.offers : []).filter(o => !offerStore || o.store === offerStore);
    for (const [k, it] of Object.entries(ITEMS)) {
      const res = (it.offer || []).map(w => new RegExp("(^|[^a-zæøå])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
      for (const o of offers) if (res.some(re => re.test(o.title)) && (!out[k] || o.price < out[k].price)) out[k] = o;
    }
    return out;
  }
  async function loadOffers() {
    if (offersData || offersLoading) return;
    offersLoading = true;
    offersData = await Backend.offers();
    offersLoading = false;
    if (view === "offers") renderOffers();
  }
  function renderOffers() {
    if (!offersData) {
      $("#view-offers").innerHTML = `<div class="empty"><span class="spinner" aria-hidden="true"></span><p>Getting this week's offers…</p></div>`;
      loadOffers(); return;
    }
    const stores = [...new Set(offersData.offers.map(o => o.store))].sort();
    const head = `
      <div class="seg" role="group" aria-label="Show"><button data-act="oMode" data-m="recipes" aria-pressed="${offerMode === "recipes"}">Recipes from offers</button><button data-act="oMode" data-m="list" aria-pressed="${offerMode === "list"}">All offers</button></div>
      ${offersData.sample ? '<p class="banner">These are example offers. This week\'s real offers appear when PlatePlan is connected to the offer service.</p>' : ""}
      <div class="chips" role="group" aria-label="Store"><button class="chip" data-act="oStore" data-s="" aria-pressed="${!offerStore}">All stores</button>${stores.map(s => `<button class="chip" data-act="oStore" data-s="${esc(s)}" aria-pressed="${offerStore === s}">${esc(s)}</button>`).join("")}</div>`;
    let body = "";
    if (offerMode === "recipes") {
      const m = offerMatches();
      const ranked = RECIPES.filter(visible).map(r => ({ r, on: r.ingredients.map(i => i[0]).filter(k => m[k]) })).filter(x => x.on.length).sort((a, b) => b.on.length - a.on.length || a.r.minutes - b.r.minutes);
      body = ranked.length ? `<p class="intro">Dinners that use what's cheap this week, with the most offers first.</p><div class="rlist">${ranked.map(x => card(x.r, `<p class="status offer">On offer: ${x.on.slice(0, 3).map(k => `${esc(lower(k))} ${kr(m[k].price)}${offerStore ? "" : ` at ${esc(m[k].store)}`}`).join(", ")}${x.on.length > 3 ? ` +${x.on.length - 3} more` : ""}</p>`)).join("")}</div>`
        : `<div class="empty"><p>No recipes match the offers in this store. Try another store.</p></div>`;
    } else {
      const q = offerQuery.trim().toLowerCase();
      const list = offersData.offers.filter(o => (!offerStore || o.store === offerStore) && (!q || o.title.toLowerCase().includes(q)))
        .sort((a, b) => ((b.before ? 1 - b.price / b.before : 0) - (a.before ? 1 - a.price / a.before : 0)));
      body = `<label class="sr" for="offerQ">Search offers</label><input class="search" id="offerQ" type="search" placeholder="Search offers, e.g. kylling" value="${esc(offerQuery)}" autocomplete="off">
        ${list.length ? `<div class="ogrid">${list.map(o => `<article class="ocard">
          <span class="store"><i style="background:${STORE_COLORS[o.store] || "var(--muted)"}"></i>${esc(o.store)}</span>
          ${o.image ? `<img src="${esc(o.image)}" alt="" loading="lazy">` : ""}
          <h3>${esc(o.title)}</h3>${o.quantity ? `<span class="q">${esc(o.quantity)}</span>` : ""}
          <span class="price"><b>${kr(o.price)}</b>${o.before ? `<s>${kr(o.before)}</s>` : ""}</span>
          ${o.validUntil ? `<span class="until">Until ${fmtDay(o.validUntil)}</span>` : ""}</article>`).join("")}</div>`
          : '<div class="empty"><p>No offers match your search.</p></div>'}`;
    }
    $("#view-offers").innerHTML = head + body;
  }

  /* ----- 15 min ----- */
  const QUICK_FILTERS = { "": "Any", hob: "Hob", microwave: "Microwave", airfryer: "Air fryer", none: "No cooking" };
  function renderQuick() {
    const list = RECIPES.filter(r => r.minutes <= 15 && visible(r) && (!quickTool || (quickTool === "none" ? !r.tools.length || r.tools.every(t => t === "kettle") : r.tools.some(t => t.split("|").includes(quickTool)))))
      .sort((a, b) => a.minutes - b.minutes);
    $("#view-quick").innerHTML = `<p class="intro">Dinner on the table in 15 minutes or less.</p>
      <div class="chips" role="group" aria-label="Cook with">${Object.entries(QUICK_FILTERS).map(([k, l]) => `<button class="chip" data-act="qTool" data-t="${k}" aria-pressed="${quickTool === k}">${l}</button>`).join("")}</div>
      ${list.length ? `<div class="rlist">${list.map(r => card(r)).join("")}</div>` : '<div class="empty"><p>No 15-minute dinners for this choice yet.</p></div>'}`;
  }

  /* ----- Account ----- */
  function renderAccount() {
    if (!user) {
      $("#view-account").innerHTML = `<div class="card lockcard"><h2 style="font-size:22px">Create an account</h2>
        <p class="muted">You only need an account for Premium: photo scanning and hiding recipes with your allergies or foods you don't like.</p>
        <button class="btn wide" data-act="toSignup">Create account</button><button class="btn ghost wide" data-act="toLogin">Log in</button></div>
        <button class="btn ghost wide" data-act="seePremium">See Premium</button>
        <p class="small muted">PlatePlan doesn't save what you tick in your kitchen. It's cleared when you close the app.</p>`;
      return;
    }
    const prem = isPremium();
    const e = editProfile || (editProfile = { allergies: [...profile.allergies], dislikes: [...profile.dislikes] });
    const dislikeChips = Object.keys(ITEMS).sort((a, b) => itemName(a).localeCompare(itemName(b)));
    $("#view-account").innerHTML = `
      <div class="rows">
        <div class="row"><span class="muted">Email</span><b>${esc(user.email)}</b></div>
        <div class="row"><span class="muted">Plan</span><b>${prem ? `Premium until ${fmtDay(profile.premium_until)}` : "Free"}</b></div>
      </div>
      ${prem ? "" : `<button class="btn sun wide" data-act="seePremium">See Premium</button>`}
      <div class="card lockcard">
        <h2 style="font-size:20px">Allergies and dislikes ${prem ? "" : '<span class="pbadge">Premium</span>'}</h2>
        <p class="muted small">Recipes with these are hidden everywhere in the app.</p>
        ${prem ? `
          <h3 style="font-size:16px">I can't eat</h3>
          <div class="chips">${Object.entries(ALLERGENS).map(([a, l]) => `<button class="chip" data-act="allergy" data-a="${a}" aria-pressed="${e.allergies.includes(a)}">${l}</button>`).join("")}</div>
          <details><summary style="min-height:44px;display:flex;align-items:center;font-weight:800;cursor:pointer">I don't like${e.dislikes.length ? ` (${e.dislikes.length})` : ""}</summary>
            <div class="chips">${dislikeChips.map(k => `<button class="chip" data-act="dislike" data-k="${k}" aria-pressed="${e.dislikes.includes(k)}">${esc(itemName(k))}</button>`).join("")}</div></details>
          <button class="btn wide" data-act="saveProfile">Save</button>
          <p id="pMsg" role="status"></p>`
          : `<button class="btn ghost wide" data-act="seePremium">Unlock with Premium</button>`}
      </div>
      <div class="rows">
        <button class="row link" data-act="logout" style="width:100%;text-decoration:none">Log out</button>
        <button class="row link" data-act="deleteAccount" id="delBtn" style="width:100%;text-decoration:none;color:var(--warn)">Delete my account</button>
      </div>
      ${Backend.live ? "" : '<p class="banner">Demo mode: your account is only stored on this device until the app is connected to its server.</p>'}`;
  }

  /* ---------- Recipe sheet ---------- */
  const sheet = $("#sheet"); let servings = 4, openId = null, lastFocus = null;
  function amount(a, u) {
    const frac = x => { const q = Math.round(x * 4) / 4, w = Math.floor(q), f = q - w; const fs = f === .25 ? "¼" : f === .5 ? "½" : f === .75 ? "¾" : ""; return (!w && !fs) ? "¼" : (w || "") + fs; };
    if (u === "g") return a >= 1000 ? `${(Math.round(a / 100) / 10).toString().replace(".", ",")} kg` : `${a < 100 ? Math.max(5, Math.round(a / 5) * 5) : Math.round(a / 10) * 10} g`;
    if (u === "ml") return a <= 45 ? `${frac(Math.round(a / 15 * 2) / 2)} tbsp` : a >= 1000 ? `${(Math.round(a / 100) / 10).toString().replace(".", ",")} l` : `${Math.round(a / 10) * 10} ml`;
    const one = Math.round(a * 4) / 4 <= 1;
    if (u === "can") return `${frac(a)} ${one ? "can" : "cans"}`;
    if (u === "clove") return `${frac(a)} ${one ? "clove" : "cloves"}`;
    return frac(a);
  }
  function openRecipe(id) {
    if (openId !== id) servings = 4;
    openId = id; const r = byId(id); if (!r) return;
    const m = offersData ? offerMatches() : {};
    const missing = r.ingredients.filter(([k]) => !kitchen.have[k]);
    if (!sheet.open) lastFocus = document.activeElement;
    $("#sheetBody").innerHTML = `<div class="mimg"><img src="${picture(r)}" alt="${esc(r.name)}"><button class="xclose" data-act="closeSheet" aria-label="Close">${ICON.x}</button></div>
      <div class="sheet">
        <h2 id="sheetTitle">${esc(r.name)}</h2>
        <div class="facts"><span class="fact">${r.minutes} min</span><span class="fact">${esc(toolText(r))}</span>${r.veg ? '<span class="fact">Vegetarian</span>' : ""}</div>
        <div class="servings"><b>Servings</b><div class="stepper"><button data-act="serv" data-v="-1" aria-label="Fewer servings">−</button><b aria-live="polite">${servings}</b><button data-act="serv" data-v="1" aria-label="More servings">+</button></div></div>
        <ul class="ing">${r.ingredients.map(([k, a]) => { const have = !!kitchen.have[k], o = m[k];
          return `<li class="${have ? "have" : "need"}"><span class="dot" aria-label="${have ? "You have this" : "You need this"}">${have ? ICON.check : ""}</span>
            <span><b class="nowrap">${amount(a * servings / 4, ITEMS[k].unit)}</b> ${esc(lower(k))}</span>${o && !have ? `<span class="tag">${kr(o.price)} ${esc(o.store)}</span>` : "<span></span>"}</li>`; }).join("")}</ul>
        <p class="small muted">Salt, pepper and dried spices aren't listed.</p>
        <div><h3 style="font-size:18px;margin-bottom:8px">Method</h3><ol class="steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>
        ${missing.length ? `<button class="btn ghost wide" data-act="shareMissing">${ICON.share} Share what you need to buy (${missing.length})</button>` : ""}
      </div>`;
    if (!sheet.open) sheet.showModal();
  }
  sheet.addEventListener("close", () => { openId = null; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); });
  sheet.addEventListener("click", e => { if (e.target === sheet) sheet.close(); });

  /* ---------- Photo scan (Premium) ---------- */
  async function photoToBase64(file) {
    const img = await new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = URL.createObjectURL(file); });
    const max = 1280, s = Math.min(1, max / Math.max(img.width, img.height));
    const cv = document.createElement("canvas"); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
    cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
    URL.revokeObjectURL(img.src);
    return cv.toDataURL("image/jpeg", 0.82).split(",")[1];
  }
  $("#photoInput").addEventListener("change", async e => {
    const file = e.target.files[0]; e.target.value = ""; if (!file) return;
    const btn = $("#scanBtn"); if (btn) { btn.disabled = true; btn.querySelector("small").textContent = "Reading your photo…"; }
    try {
      const res = await Backend.scan(await photoToBase64(file));
      if (res.error) toast(res.error);
      else { res.items.forEach(k => { kitchen.have[k] = true; }); saveKitchen(); toast(res.items.length ? `Found ${res.items.length} things. Check them and add anything we missed.` : "We couldn't spot any food. Try a closer photo."); track("scan"); }
    } catch (err) { toast("We couldn't read the photo. Try again."); }
    if (view === "cook") renderCook();
  });

  /* ---------- Actions ---------- */
  async function afterLogin() {
    user = await Backend.user();
    profile = user ? await Backend.profile() : null;
    editProfile = null;
  }
  const actions = {
    wMode: el => showWelcome(el.dataset.m),
    guest: () => { try { localStorage.setItem("pp-guest", "1"); } catch (e) { /* ignore */ } track("guest"); showApp(); },
    toSignup: () => showWelcome("signup"),
    toLogin: () => showWelcome("login"),
    plan: el => { plan = el.dataset.p; document.querySelectorAll(".plan").forEach(b => b.setAttribute("aria-pressed", b.dataset.p === plan)); },
    closePremium: () => { store.set("pp-premium-shown", true); showApp(); },
    seePremium: () => showPremium(),
    trial: async el => {
      el.disabled = true;
      const res = await Backend.startTrial();
      if (!res.ok) { toast(res.error); el.disabled = false; return; }
      profile = await Backend.profile(); track("trial");
      toast(`Premium is on until ${fmtDay(profile.premium_until)}`);
      store.set("pp-premium-shown", true); showApp();
    },
    place: el => { place = el.dataset.p; foodQuery = ""; renderCook(); },
    have: el => { const k = el.dataset.k; if (kitchen.have[k]) delete kitchen.have[k]; else kitchen.have[k] = true; saveKitchen(); keepScroll(renderCook); },
    tool: el => { const t = el.dataset.t; kitchen.tools[t] = !kitchen.tools[t]; if (!kitchen.tools[t]) delete kitchen.tools[t]; saveKitchen(); keepScroll(renderCook); },
    clearFood: () => { kitchen.have = {}; saveKitchen(); renderCook(); },
    toResults: () => { const r = $("#results"); if (r) r.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); },
    scan: () => {
      if (!user) { toast("Photo scanning is part of Premium. Create an account to try it."); showPremium(); return; }
      if (!isPremium()) { showPremium(); return; }
      $("#photoInput").click();
    },
    oMode: el => { offerMode = el.dataset.m; renderOffers(); },
    oStore: el => { offerStore = el.dataset.s; renderOffers(); },
    qTool: el => { quickTool = el.dataset.t; renderQuick(); },
    open: el => openRecipe(el.dataset.id),
    closeSheet: () => sheet.close(),
    serv: el => { servings = Math.min(12, Math.max(1, servings + +el.dataset.v)); const y = sheet.scrollTop; openRecipe(openId); sheet.scrollTop = y; },
    shareMissing: async () => {
      const r = byId(openId), list = r.ingredients.filter(([k]) => !kitchen.have[k]).map(([k, a]) => `- ${amount(a * servings / 4, ITEMS[k].unit)} ${lower(k)}`);
      const text = `${r.name} (${servings} servings)\nTo buy:\n${list.join("\n")}`;
      track("share");
      if (navigator.share) { try { await navigator.share({ title: r.name, text }); return; } catch (e) { if (e.name === "AbortError") return; } }
      try { await navigator.clipboard.writeText(text); toast("Copied. Paste it wherever you like."); } catch (e) { toast("Sharing isn't available in this browser"); }
    },
    allergy: el => { const a = el.dataset.a, l = editProfile.allergies; editProfile.allergies = l.includes(a) ? l.filter(x => x !== a) : [...l, a]; el.setAttribute("aria-pressed", editProfile.allergies.includes(a)); },
    dislike: el => { const k = el.dataset.k, l = editProfile.dislikes; editProfile.dislikes = l.includes(k) ? l.filter(x => x !== k) : [...l, k]; el.setAttribute("aria-pressed", editProfile.dislikes.includes(k)); },
    saveProfile: async el => {
      el.disabled = true;
      const res = await Backend.saveProfile(editProfile);
      el.disabled = false;
      if (res.ok) { profile = { ...profile, ...editProfile }; toast("Saved. Recipes are filtered everywhere."); } else toast(res.error);
    },
    logout: async () => { await Backend.signOut(); user = null; profile = null; editProfile = null; toast("You're logged out"); renderAccount(); },
    deleteAccount: async el => {
      if (!el.dataset.sure) { el.dataset.sure = "1"; el.textContent = "Tap again to delete your account for good"; return; }
      const res = await Backend.deleteAccount();
      if (!res.ok) { toast(res.error); return; }
      user = null; profile = null; editProfile = null; toast("Your account is deleted"); renderAccount();
    }
  };
  function keepScroll(fn) { const y = window.scrollY; fn(); window.scrollTo(0, y); }

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el || el.disabled) return;
    const fn = actions[el.dataset.act]; if (!fn) return;
    e.preventDefault(); fn(el);
  });
  document.addEventListener("input", e => {
    const t = e.target;
    const refocus = (fn) => { const pos = t.selectionStart, id = t.id; fn(); const n = document.getElementById(id); if (n) { n.focus(); n.setSelectionRange(pos, pos); } };
    if (t.id === "foodQ") { foodQuery = t.value; refocus(() => keepScroll(renderCook)); }
    if (t.id === "offerQ") { offerQuery = t.value; refocus(renderOffers); }
  });
  document.addEventListener("submit", async e => {
    if (e.target.id !== "authForm") return;
    e.preventDefault();
    const email = $("#aEmail").value.trim(), pw = $("#aPw").value, msg = $("#aMsg"), btn = e.target.querySelector("button[type=submit]");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.className = "error"; msg.textContent = "That email address doesn't look right."; $("#aEmail").focus(); return; }
    btn.disabled = true;
    const res = welcomeMode === "signup" ? await Backend.signUp(email, pw) : await Backend.signIn(email, pw);
    btn.disabled = false;
    if (!res.ok) { msg.className = "error"; msg.textContent = res.error; return; }
    if (res.needsConfirm) { showWelcome("login", { ok: true, text: "Check your email and tap the link to confirm your account. Then log in here." }); return; }
    await afterLogin(); track(welcomeMode === "signup" ? "signup" : "login");
    if (isPremium()) showApp(); else showPremium();
  });

  /* ---------- Offline and home screen ---------- */
  if (window.self !== window.top) document.documentElement.classList.add("framed");
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => { });

  /* ---------- Start ---------- */
  window.addEventListener("hashchange", () => { if (!$("#app").hidden) route(); });
  (async function start() {
    await Backend.init();
    Backend.onAuthChange(async () => { await afterLogin(); if (!$("#app").hidden && view === "account") renderAccount(); });
    await afterLogin();
    let guest = false; try { guest = localStorage.getItem("pp-guest") === "1"; } catch (e) { /* ignore */ }
    if (user && !isPremium() && !store.get("pp-premium-shown", false)) showPremium();
    else if (user || guest) showApp();
    else showWelcome("signup");
  })();
})();
