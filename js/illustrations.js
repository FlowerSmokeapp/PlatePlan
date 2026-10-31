/*
  ILLUSTRATIONS – draws a picture of each dish from its ingredients and "dish" type.
  You don't need to touch this file when adding recipes: the picture is built automatically.
*/
(function () {
  const W = 400, H = 300;
  const cache = {};

  // Backgrounds in the app colours. Dishes rotate through them so cards look different.
  const BORDE = [
    { bord: "#FAF4E8", stof: "#F2B330", tal: "#FFFDF8" },
    { bord: "#2F6143", stof: "#F6DFA0", tal: "#FAF4E8" },
    { bord: "#F6DB94", stof: "#2F6143", tal: "#FFFDF8" },
    { bord: "#DCE6D2", stof: "#F2B330", tal: "#FFFDF8" },
    { bord: "#F1E2C4", stof: "#2F6143", tal: "#FFFDF8" },
    { bord: "#3E7553", stof: "#FAF4E8", tal: "#F6DFA0" }
  ];

  function rng(seed) {
    let h = 2166136261;
    for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return function () {
      h += 0x6D2B79F5; let t = h;
      t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function tone(hex, amt) {
    const n = parseInt(hex.slice(1), 16), c = v => Math.max(0, Math.min(255, v + amt));
    return "#" + ((c(n >> 16) << 16) | (c(n >> 8 & 255) << 8) | c(n & 255)).toString(16).padStart(6, "0");
  }
  function blob(g, x, y, r, col, R, wob = 0.18, pts = 14, sy = 0.92) {
    const off = []; for (let i = 0; i < pts; i++) off.push(1 + (R() - 0.5) * wob * 2);
    g.beginPath();
    for (let i = 0; i <= pts; i++) {
      const a = i / pts * Math.PI * 2, p = off[i % pts];
      const px = x + Math.cos(a) * r * p, py = y + Math.sin(a) * r * p * sy;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.closePath(); g.fillStyle = col; g.fill();
  }
  function shine(g, x, y, r, a = 0.16) {
    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
    gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, `rgba(0,0,0,${a * 0.9})`);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  // Points spread evenly inside a circle
  function spots(R, n, x, y, r, minD) {
    const out = [];
    for (let t = 0; out.length < n && t < n * 30; t++) {
      const a = R() * 7, d = Math.sqrt(R()) * r;
      const p = [x + Math.cos(a) * d, y + Math.sin(a) * d * 0.92];
      if (out.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > minD)) out.push(p);
    }
    return out;
  }

  /* ---------- Single food pieces ---------- */
  const P = {
    kylling(g, x, y, s, R) { blob(g, x, y, 13 * s, "#B9773A", R, 0.3, 9); blob(g, x - 1, y - 1, 11 * s, "#DDA45C", R, 0.3, 9); blob(g, x - 3, y - 3, 5 * s, "#EBC27E", R, 0.4, 7); },
    kyllingstrimmel(g, x, y, s, R) { g.save(); g.translate(x, y); g.rotate(R() * 3); g.fillStyle = "#C9884A"; g.beginPath(); g.roundRect(-16 * s, -5 * s, 32 * s, 10 * s, 5 * s); g.fill(); g.fillStyle = "#E6B878"; g.fillRect(-13 * s, -3 * s, 26 * s, 3 * s); g.restore(); },
    hakket(g, x, y, s, R) { for (let i = 0; i < 3; i++) blob(g, x + (R() - 0.5) * 10, y + (R() - 0.5) * 10, 4.5 * s, R() < 0.5 ? "#6B3420" : "#8A4A2C", R, 0.5, 7); },
    kodbolle(g, x, y, s) { g.fillStyle = "#7E4026"; g.beginPath(); g.arc(x, y, 12 * s, 0, 7); g.fill(); shine(g, x, y, 12 * s, 0.25); },
    frikadelle(g, x, y, s, R) { g.save(); g.translate(x, y); g.rotate(R() - 0.5); g.fillStyle = "#5E2E18"; g.beginPath(); g.ellipse(0, 0, 25 * s, 17 * s, 0, 0, 7); g.fill(); g.fillStyle = "#8A4B2A"; g.beginPath(); g.ellipse(-2, -2, 21 * s, 13 * s, 0, 0, 7); g.fill(); g.restore(); shine(g, x, y, 20 * s, 0.18); },
    torsk(g, x, y, s, R) {
      g.save(); g.translate(x, y); g.rotate(-0.35);
      g.fillStyle = "#E3BE82"; g.beginPath(); g.ellipse(0, 0, 58 * s, 26 * s, 0, 0, 7); g.fill();
      g.fillStyle = "#F8F3EA"; g.beginPath(); g.ellipse(-2, -2, 54 * s, 22 * s, 0, 0, 7); g.fill();
      g.strokeStyle = "#E6DACA"; g.lineWidth = 2;
      for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 13 * s, -18 * s); g.quadraticCurveTo(i * 13 * s + 8, 0, i * 13 * s, 18 * s); g.stroke(); }
      g.restore();
    },
    tun(g, x, y, s, R) { for (let i = 0; i < 3; i++) blob(g, x + (R() - 0.5) * 12, y + (R() - 0.5) * 10, 5 * s, R() < 0.5 ? "#C9A58A" : "#DDBFA6", R, 0.5, 7); },
    bacon(g, x, y, s) { g.fillStyle = "#B8513C"; g.fillRect(x - 5 * s, y - 5 * s, 10 * s, 10 * s); g.fillStyle = "#F1D0BE"; g.fillRect(x - 5 * s, y - 1 * s, 10 * s, 3 * s); },
    tofu(g, x, y, s, R) { g.save(); g.translate(x, y); g.rotate(R()); g.fillStyle = "#D9A24E"; g.beginPath(); g.roundRect(-9 * s, -9 * s, 18 * s, 18 * s, 3); g.fill(); g.fillStyle = "#F4E6C4"; g.beginPath(); g.roundRect(-7 * s, -7 * s, 14 * s, 13 * s, 2); g.fill(); g.restore(); },
    kikaert(g, x, y, s) { g.fillStyle = "#D9B57A"; g.beginPath(); g.arc(x, y, 7 * s, 0, 7); g.fill(); g.strokeStyle = "#B38C52"; g.lineWidth = 1.5; g.beginPath(); g.arc(x + 1, y, 4 * s, 1.5, 4.2); g.stroke(); shine(g, x, y, 7 * s, 0.2); },
    kidney(g, x, y, s, R) { g.save(); g.translate(x, y); g.rotate(R() * 3); g.fillStyle = "#6E1A1C"; g.beginPath(); g.ellipse(0, 0, 9 * s, 5.5 * s, 0, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse(-2, -2, 4 * s, 1.5 * s, 0, 0, 7); g.fill(); g.restore(); },
    spejlaeg(g, x, y, s, R) { blob(g, x, y, 26 * s, "#FDFBF4", R, 0.22, 12); g.fillStyle = "#F0A11C"; g.beginPath(); g.arc(x + 3, y - 2, 10 * s, 0, 7); g.fill(); shine(g, x + 3, y - 2, 10 * s, 0.3); },
    broccoli(g, x, y, s, R) { g.fillStyle = "#9BC26A"; g.fillRect(x - 3 * s, y, 6 * s, 12 * s); for (let i = 0; i < 6; i++) { const a = i / 6 * 7; g.fillStyle = i % 2 ? "#3D7A2E" : "#4F8F3A"; g.beginPath(); g.arc(x + Math.cos(a) * 7 * s, y - 3 + Math.sin(a) * 5 * s, 6.5 * s, 0, 7); g.fill(); } g.fillStyle = "#5FA046"; g.beginPath(); g.arc(x, y - 4, 6 * s, 0, 7); g.fill(); },
    aert(g, x, y, s) { g.fillStyle = "#6FA83E"; g.beginPath(); g.arc(x, y, 4.5 * s, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.arc(x - 1.5, y - 1.5, 1.5 * s, 0, 7); g.fill(); },
    spinat(g, x, y, s, R) { blob(g, x, y, 13 * s, "#2C5A27", R, 0.45, 9); blob(g, x + 2, y - 2, 7 * s, "#3E7533", R, 0.45, 8); },
    peber(g, x, y, s, R) { g.strokeStyle = R() < 0.6 ? "#D8432C" : "#F0BE2E"; g.lineWidth = 6 * s; g.lineCap = "round"; const a = R() * 7; g.beginPath(); g.arc(x, y, 12 * s, a, a + 1.6); g.stroke(); },
    majs(g, x, y, s) { g.fillStyle = "#F2C230"; g.beginPath(); g.roundRect(x - 3.5 * s, y - 3.5 * s, 7 * s, 7 * s, 2); g.fill(); },
    gulerod(g, x, y, s) { g.fillStyle = "#E9822B"; g.beginPath(); g.arc(x, y, 7 * s, 0, 7); g.fill(); g.strokeStyle = "#F5A85A"; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 3.5 * s, 0, 7); g.stroke(); },
    squash(g, x, y, s, R) { const a = R() * 7; g.fillStyle = "#3F6F2A"; g.beginPath(); g.arc(x, y, 11 * s, a, a + Math.PI); g.fill(); g.fillStyle = "#EEF0C6"; g.beginPath(); g.arc(x, y, 9 * s, a, a + Math.PI); g.fill(); },
    porre(g, x, y, s) { g.strokeStyle = "#BFDB8A"; g.lineWidth = 3 * s; g.beginPath(); g.arc(x, y, 6 * s, 0, 7); g.stroke(); g.strokeStyle = "#EEF5D8"; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 3 * s, 0, 7); g.stroke(); },
    kaal(g, x, y, s, R) { g.strokeStyle = R() < 0.5 ? "#EEF1D2" : "#DCE7B4"; g.lineWidth = 2.5 * s; g.lineCap = "round"; const a = R() * 7; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 4, x + Math.cos(a) * 16 * s, y + Math.sin(a) * 16 * s); g.stroke(); },
    agurk(g, x, y, s) { g.fillStyle = "#3F7A35"; g.beginPath(); g.arc(x, y, 10 * s, 0, 7); g.fill(); g.fillStyle = "#E3EFC2"; g.beginPath(); g.arc(x, y, 8.5 * s, 0, 7); g.fill(); g.fillStyle = "#C9DD98"; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x + Math.cos(i * 2.1) * 3 * s, y + Math.sin(i * 2.1) * 3 * s, 1.4 * s, 0, 7); g.fill(); } },
    cherry(g, x, y, s) { g.fillStyle = "#D63A2A"; g.beginPath(); g.arc(x, y, 10 * s, 0, 7); g.fill(); g.fillStyle = "#EF6A4E"; g.beginPath(); g.arc(x, y, 7 * s, 0, 7); g.fill(); g.fillStyle = "#F6D9A0"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x + Math.cos(i * 1.6) * 3.5 * s, y + Math.sin(i * 1.6) * 3.5 * s, 1.3 * s, 0, 7); g.fill(); } },
    salat(g, x, y, s, R) { blob(g, x, y, 17 * s, R() < 0.5 ? "#B8DC7E" : "#A6CF6A", R, 0.4, 11); g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 10 * s, y); g.lineTo(x + 10 * s, y - 3); g.stroke(); },
    rodlog(g, x, y, s) { g.strokeStyle = "#8E3470"; g.lineWidth = 3 * s; g.beginPath(); g.arc(x, y, 8 * s, 0.3, 4); g.stroke(); },
    feta(g, x, y, s, R) { g.save(); g.translate(x, y); g.rotate(R()); g.fillStyle = "#FFFFFF"; g.fillRect(-5.5 * s, -5.5 * s, 11 * s, 11 * s); g.strokeStyle = "#E4DDCD"; g.lineWidth = 1; g.strokeRect(-5.5 * s, -5.5 * s, 11 * s, 11 * s); g.restore(); },
    ost(g, x, y, s, R) { g.strokeStyle = "#F2CF5B"; g.lineWidth = 2.5 * s; g.lineCap = "round"; const a = R() * 7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 9 * s, y + Math.sin(a) * 9 * s); g.stroke(); },
    klat(g, x, y, s, R) { blob(g, x, y, 18 * s, "#FFFFFF", R, 0.18, 12); g.strokeStyle = "#ECE6D8"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 9 * s, 0.5, 4.5); g.stroke(); },
    kartoffel(g, x, y, s, R) { g.save(); g.translate(x, y); g.rotate(R() * 3); g.fillStyle = "#DDB24E"; g.beginPath(); g.ellipse(0, 0, 18 * s, 14 * s, 0, 0, 7); g.fill(); g.fillStyle = "#F1D07A"; g.beginPath(); g.ellipse(-2, -2, 15 * s, 11 * s, 0, 0, 7); g.fill(); g.restore(); shine(g, x, y, 16 * s, 0.14); },
    persille(g, x, y, s, R) { g.fillStyle = R() < 0.5 ? "#3F7F2E" : "#5C9C3E"; g.beginPath(); g.ellipse(x, y, 3 * s, 1.8 * s, R() * 3, 0, 7); g.fill(); },
    citron(g, x, y, s) { g.fillStyle = "#E6B21E"; g.beginPath(); g.arc(x, y, 18 * s, Math.PI, 0); g.fill(); g.fillStyle = "#FFF6D0"; g.beginPath(); g.arc(x, y, 15 * s, Math.PI, 0); g.fill(); g.fillStyle = "#F6D545"; g.beginPath(); g.arc(x, y, 13 * s, Math.PI, 0); g.fill(); g.strokeStyle = "#FFF6D0"; g.lineWidth = 1.5; for (let i = 1; i < 4; i++) { const a = Math.PI + i * Math.PI / 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 13 * s, y + Math.sin(a) * 13 * s); g.stroke(); } }
  };

  /* ---------- Bases and sauces ---------- */
  function ris(g, x, y, r, R) {
    blob(g, x, y, r, "#F4F0E4", R, 0.12);
    for (let i = 0; i < r * 5; i++) { const a = R() * 7, d = Math.sqrt(R()) * r * 0.95; g.fillStyle = R() < 0.5 ? "#FFFFFF" : "#E6DFCD"; g.beginPath(); g.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.92, 3.2, 1.4, R() * 3, 0, 7); g.fill(); }
  }
  function bulgur(g, x, y, r, R) {
    blob(g, x, y, r, "#D8B676", R, 0.12);
    for (let i = 0; i < r * 6; i++) { const a = R() * 7, d = Math.sqrt(R()) * r * 0.95; g.fillStyle = R() < 0.5 ? "#C59E5A" : "#E9CF98"; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.92, 1.6, 0, 7); g.fill(); }
  }
  function strenge(g, x, y, r, R, col, n, bolge) {
    g.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const a = R() * 7, d = Math.sqrt(R()) * r * 0.7, sx = x + Math.cos(a) * d, sy = y + Math.sin(a) * d;
      g.strokeStyle = R() < 0.5 ? col : tone(col, -22); g.lineWidth = bolge ? 3.5 : 5;
      g.beginPath(); g.moveTo(sx, sy);
      if (bolge) { let px = sx, py = sy, dir = R() * 7; for (let k = 0; k < 8; k++) { dir += (R() - 0.5) * 1.4; const nx = px + Math.cos(dir) * 9, ny = py + Math.sin(dir) * 9; if (Math.hypot(nx - x, ny - y) > r * 0.92) break; g.quadraticCurveTo(px + (R() - 0.5) * 10, py + (R() - 0.5) * 10, nx, ny); px = nx; py = ny; } }
      else { const ex = sx + (R() - 0.5) * r * 0.9, ey = sy + (R() - 0.5) * r * 0.9; g.bezierCurveTo(sx + (R() - 0.5) * 50, sy + (R() - 0.5) * 50, ex + (R() - 0.5) * 50, ey + (R() - 0.5) * 50, ex, ey); }
      g.stroke();
    }
  }
  function sovs(g, x, y, r, col, R) { blob(g, x, y, r, tone(col, -14), R, 0.22, 16); blob(g, x - 2, y - 2, r * 0.9, col, R, 0.22, 16); shine(g, x, y, r * 0.9, 0.1); }

  /* ---------- Sort ingredients into roles ---------- */
  const CARBS = ["rice", "bulgur", "pasta", "noodles", "potato"];
  const PROTEIN = { chickenBreast: "kylling", chickenThigh: "kylling", beef: "hakket", pork: "kodbolle", cod: "torsk", tuna: "tun", bacon: "bacon", tofu: "tofu", chickpeas: "kikaert", kidney: "kidney" };
  const VEG = { broccoli: "broccoli", peas: "aert", spinach: "spinat", pepper: "peber", corn: "majs", carrot: "gulerod", zucchini: "squash", leek: "porre", cabbage: "kaal", cucumber: "agurk", cherryTomatoes: "cherry", lettuce: "salat", redOnion: "rodlog" };
  const SMAA = { torsk: 2, aert: 22, majs: 18, kidney: 16, kikaert: 14, tun: 8, hakket: 12, bacon: 12, ost: 26, kaal: 26, persille: 26 };

  function roller(r) {
    const has = k => r.ingredients.some(i => i[0] === k);
    const k = CARBS.find(has);
    const prot = Object.keys(PROTEIN).filter(has).map(x => PROTEIN[x]);
    const gront = Object.keys(VEG).filter(has).map(x => VEG[x]);
    const top = [];
    if (has("feta")) top.push("feta");
    if (has("skyr") || has("cremeFraiche")) top.push("klat");
    return { k, prot, gront, top, has };
  }
  function scatter(g, R, navn, x, y, r, s = 1, n) {
    const cnt = n || SMAA[navn] || 7;
    spots(R, cnt, x, y, r, cnt > 15 ? 6 : 16).forEach(p => P[navn](g, p[0], p[1], s, R));
  }

  /* ---------- Table and tableware ---------- */
  function bord(g, R, tema, idx) {
    g.fillStyle = tema.bord; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${tema.bord === "#2F6143" || tema.bord === "#3E7553" ? "255,255,255" : "120,80,30"},${R() * 0.05})`; g.fillRect(R() * W, R() * H, 2 + R() * 30, 1); }
    // napkin in a corner
    g.save(); const left = idx % 2 === 0; g.translate(left ? 38 : W - 38, left ? 60 : H - 60); g.rotate(left ? -0.25 : 0.25);
    g.fillStyle = tema.stof; g.fillRect(-55, -90, 90, 200);
    g.fillStyle = "rgba(255,255,255,.18)"; for (let i = -80; i < 110; i += 14) g.fillRect(-55, i, 90, 4);
    g.restore();
  }
  function tallerken(g, x, y, r, col) {
    g.fillStyle = "rgba(40,25,10,.22)"; g.beginPath(); g.ellipse(x + 6, y + 10, r, r * 0.97, 0, 0, 7); g.fill();
    const pg = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r); pg.addColorStop(0, tone(col, 8)); pg.addColorStop(1, tone(col, -22));
    g.fillStyle = pg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.strokeStyle = "rgba(0,0,0,.07)"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r * 0.8, 0, 7); g.stroke();
  }
  function skaal(g, x, y, r, col) {
    g.fillStyle = "rgba(40,25,10,.25)"; g.beginPath(); g.ellipse(x + 6, y + 10, r, r * 0.97, 0, 0, 7); g.fill();
    g.fillStyle = tone(col, -10); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    const ig = g.createRadialGradient(x, y, r * 0.5, x, y, r * 0.88); ig.addColorStop(0, tone(col, 4)); ig.addColorStop(1, tone(col, -40));
    g.fillStyle = ig; g.beginPath(); g.arc(x, y, r * 0.88, 0, 7); g.fill();
  }
  function pande(g, x, y, r) {
    g.fillStyle = "rgba(20,10,0,.3)"; g.beginPath(); g.ellipse(x + 6, y + 10, r, r, 0, 0, 7); g.fill();
    g.fillStyle = "#2B2724"; g.beginPath(); g.roundRect(x + r * 0.8, y - 13, r * 0.9, 26, 10); g.fill();
    g.fillStyle = "#231F1C"; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.fillStyle = "#3C3631"; g.beginPath(); g.arc(x, y, r * 0.9, 0, 7); g.fill();
  }
  function gaffel(g, x, y, rot, lys) {
    g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = lys ? "#E9E4DA" : "#B9B2A4";
    g.beginPath(); g.roundRect(-4, 0, 8, 110, 4); g.fill();
    for (let i = -1.5; i <= 1.5; i++) { g.fillRect(i * 5 - 1.5, -38, 3, 34); }
    g.beginPath(); g.roundRect(-9, -10, 18, 16, 6); g.fill(); g.restore();
  }

  /* ---------- Draw the whole dish ---------- */
  function tegn(r, idx) {
    if (cache[r.id]) return cache[r.id];
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), R = rng(r.id), tema = BORDE[idx % BORDE.length];
    const ro = roller(r), farve = r.sauce || "#C98A3A";
    const mork = tema.bord === "#2F6143" || tema.bord === "#3E7553";
    bord(g, R, tema, idx);
    const cx = W * 0.52, cy = H * 0.52, PR = H * 0.44;
    const type = r.dish || "plate";
    if (type !== "fad" && type !== "wrap") gaffel(g, idx % 2 ? 40 : W - 40, H * 0.55, idx % 2 ? 0.15 : -0.15, mork);

    if (type === "bowl") {
      skaal(g, cx, cy, PR, tema.tal);
      const fr = PR * 0.8;
      if (ro.k === "rice" || ro.k === "bulgur") (ro.k === "rice" ? ris : bulgur)(g, cx - fr * 0.38, cy + fr * 0.05, fr * 0.55, R);
      sovs(g, cx + fr * 0.2, cy - fr * 0.03, fr * 0.62, farve, R);
      ro.prot.forEach(p => scatter(g, R, p, cx + fr * 0.22, cy, fr * 0.45, 1, p === "kodbolle" ? 6 : undefined));
      ro.gront.forEach(v => scatter(g, R, v, cx + fr * 0.22, cy, fr * 0.5, 0.85, SMAA[v] ? 10 : 4));
      scatter(g, R, "persille", cx, cy, fr * 0.75, 1, 22);
    } else if (type === "pasta" || type === "wok") {
      if (type === "wok") pande(g, cx, cy, PR); else tallerken(g, cx, cy, PR, tema.tal);
      const fr = PR * 0.78;
      const pcol = ro.k === "noodles" ? tone(farve, 40) : "#EBC979";
      if (ro.k === "rice") { ris(g, cx - fr * 0.3, cy, fr * 0.5, R); sovs(g, cx + fr * 0.25, cy, fr * 0.5, farve, R); }
      else {
        blob(g, cx, cy, fr * 0.86, tone(pcol, -10), R, 0.14);
        strenge(g, cx, cy, fr * 0.95, R, pcol, ro.k === "noodles" ? 46 : 60, ro.k === "noodles");
        if (type === "pasta") sovs(g, cx + 4, cy - 6, fr * 0.45, farve, R);
      }
      ro.prot.forEach(p => scatter(g, R, p, cx, cy, fr * 0.6, 1, p === "kylling" ? 6 : undefined));
      ro.gront.forEach(v => scatter(g, R, v, cx, cy, fr * 0.7, 0.9, SMAA[v] ? 14 : 6));
      if (type === "pasta") scatter(g, R, "persille", cx, cy, fr * 0.7, 1, 18);
    } else if (type === "pan") {
      pande(g, cx, cy, PR);
      const fr = PR * 0.82;
      blob(g, cx, cy, fr, farve, R, 0.06, 20); shine(g, cx, cy, fr, 0.12);
      if (r.id.includes("omelette")) {
        for (let i = 0; i < 40; i++) { const a = R() * 7, d = Math.sqrt(R()) * fr * 0.9; g.fillStyle = "rgba(200,140,40,.35)"; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2 + R() * 6, 0, 7); g.fill(); }
        scatter(g, R, "kartoffel", cx, cy, fr * 0.7, 0.7, 7);
      } else {
        spots(R, 5, cx, cy, fr * 0.62, 50).forEach(p => P.spejlaeg(g, p[0], p[1], 1, R));
      }
      ro.prot.forEach(p => scatter(g, R, p, cx, cy, fr * 0.8, 1));
      ro.gront.forEach(v => scatter(g, R, v, cx, cy, fr * 0.8, 0.8, 6));
      ro.top.forEach(t => t === "feta" && scatter(g, R, "feta", cx, cy, fr * 0.8, 1, 10));
      scatter(g, R, "persille", cx, cy, fr * 0.85, 1.2, 26);
    } else if (type === "wrap") {
      // cutting board with wraps cut in half
      g.fillStyle = "rgba(40,25,10,.22)"; g.beginPath(); g.roundRect(48, 52, W - 84, H - 92, 22); g.fill();
      g.fillStyle = "#C99A62"; g.beginPath(); g.roundRect(40, 44, W - 84, H - 92, 22); g.fill();
      g.strokeStyle = "rgba(120,70,30,.25)"; g.lineWidth = 2; for (let i = 60; i < H - 50; i += 11) { g.beginPath(); g.moveTo(52, i); g.lineTo(W - 56, i + R() * 4); g.stroke(); }
      const quesa = r.id.includes("quesa");
      const fyld = [...ro.prot, ...ro.gront];
      for (let k = 0; k < 3; k++) {
        const x = 110 + k * 82, y = 130 + (k % 2) * 40;
        g.save(); g.translate(x, y); g.rotate(-0.3 + k * 0.25);
        if (quesa) {
          g.fillStyle = "#E2B66A"; g.beginPath(); g.moveTo(0, -56); g.lineTo(46, 30); g.lineTo(-46, 30); g.closePath(); g.fill();
          g.fillStyle = "#F0CD82"; g.beginPath(); g.moveTo(0, -48); g.lineTo(38, 24); g.lineTo(-38, 24); g.closePath(); g.fill();
          for (let j = 0; j < 7; j++) { g.fillStyle = "rgba(150,90,30,.4)"; g.beginPath(); g.arc((R() - 0.5) * 40, (R() - 0.3) * 50, 3 + R() * 4, 0, 7); g.fill(); }
          g.fillStyle = "#F4D04E"; g.fillRect(-40, 24, 80, 7);
          for (let j = 0; j < 6; j++) P[fyld[j % fyld.length] || "majs"](g, -30 + j * 12, 30, 0.6, R);
        } else {
          g.fillStyle = "#D8B67A"; g.beginPath(); g.ellipse(0, 0, 36, 50, 0, 0, 7); g.fill();
          g.fillStyle = "#F2DDAE"; g.beginPath(); g.ellipse(0, 0, 32, 46, 0, 0, 7); g.fill();
          g.fillStyle = "#FFFFFF"; g.beginPath(); g.ellipse(0, -30, 26, 12, 0, 0, 7); g.fill();
          for (let j = 0; j < 9; j++) { const f = fyld[j % fyld.length] || "salat"; P[f](g, (R() - 0.5) * 34, -32 + (R() - 0.5) * 12, 0.55, R); }
        }
        g.restore();
      }
      if (ro.top.includes("klat")) { g.fillStyle = "#E9E4DA"; g.beginPath(); g.arc(W - 78, 80, 30, 0, 7); g.fill(); P.klat(g, W - 78, 80, 1.2, R); scatter(g, R, "persille", W - 78, 80, 14, 1, 6); }
    } else if (type === "soup") {
      skaal(g, cx, cy, PR, tema.tal);
      const fr = PR * 0.8;
      const sg = g.createRadialGradient(cx - fr * 0.3, cy - fr * 0.3, 4, cx, cy, fr); sg.addColorStop(0, tone(farve, 22)); sg.addColorStop(1, tone(farve, -20));
      g.fillStyle = sg; g.beginPath(); g.arc(cx, cy, fr, 0, 7); g.fill();
      if (ro.k === "noodles") strenge(g, cx, cy, fr * 0.9, R, "#F2E2B0", 18, true);
      ro.prot.forEach(p => scatter(g, R, p, cx, cy, fr * 0.7, 0.9));
      ro.gront.forEach(v => scatter(g, R, v, cx, cy, fr * 0.75, 0.8, 9));
      if (r.ingredients.some(i => i[0] === "cream")) { g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 4; g.beginPath(); for (let a = 0; a < 12; a += 0.2) { const rr = 4 + a * 4; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.stroke(); }
      scatter(g, R, "persille", cx, cy, fr * 0.8, 1.2, 30);
      if (r.ingredients.some(i => i[0] === "baguette")) { const bx = idx % 2 ? W - 52 : 52; for (let k = 0; k < 2; k++) { g.save(); g.translate(bx, 70 + k * 46); g.rotate(0.3 - k * 0.5); g.fillStyle = "#B8742E"; g.beginPath(); g.ellipse(0, 0, 36, 22, 0, 0, 7); g.fill(); g.fillStyle = "#F4E2BC"; g.beginPath(); g.ellipse(0, 0, 31, 17, 0, 0, 7); g.fill(); for (let j = 0; j < 9; j++) { g.fillStyle = "rgba(190,150,90,.6)"; g.beginPath(); g.arc((R() - 0.5) * 40, (R() - 0.5) * 20, 1.5, 0, 7); g.fill(); } g.restore(); } }
    } else if (type === "tray") {
      const fx = 70, fy = 52, fw = W - 132, fh = H - 100;
      g.fillStyle = "rgba(40,25,10,.25)"; g.beginPath(); g.roundRect(fx + 8, fy + 10, fw, fh, 26); g.fill();
      g.fillStyle = "#B4542E"; g.beginPath(); g.roundRect(fx, fy, fw, fh, 26); g.fill();
      g.fillStyle = "#93401F"; g.beginPath(); g.roundRect(fx + 12, fy + 12, fw - 24, fh - 24, 18); g.fill();
      const ix = fx + 18, iy = fy + 18, iw = fw - 36, ih = fh - 36, mx = ix + iw / 2, my = iy + ih / 2;
      if (r.id.toLowerCase().includes("lasagne")) {
        g.fillStyle = farve; g.beginPath(); g.roundRect(ix, iy, iw, ih, 14); g.fill();
        const tg = g.createLinearGradient(0, iy, 0, iy + ih); tg.addColorStop(0, "#F3CD6A"); tg.addColorStop(1, "#DDA143");
        blob(g, mx, my, iw * 0.46, "#E9B654", R, 0.08, 22, ih / iw);
        g.fillStyle = tg; g.beginPath(); g.roundRect(ix + 8, iy + 8, iw - 16, ih - 16, 12); g.fill();
        for (let i = 0; i < 46; i++) { g.fillStyle = `rgba(150,70,20,${0.2 + R() * 0.3})`; g.beginPath(); g.arc(ix + 10 + R() * (iw - 20), iy + 10 + R() * (ih - 20), 2 + R() * 6, 0, 7); g.fill(); }
        scatter(g, R, "persille", mx, my, iw * 0.4, 1.3, 20);
      } else {
        g.fillStyle = tone(farve, 10); g.beginPath(); g.roundRect(ix, iy, iw, ih, 14); g.fill();
        const pts = spots(R, 34, mx, my, iw * 0.45, 18);
        pts.forEach((p, i) => { const vs = [...ro.gront, ...ro.prot]; const v = vs[i % vs.length]; if (Math.abs(p[1] - my) < ih / 2 - 10) P[v](g, p[0], p[1], 1.1, R); });
        for (let i = 0; i < 30; i++) { g.fillStyle = "rgba(60,30,10,.35)"; g.fillRect(ix + R() * iw, iy + R() * ih, 6, 2); }
        if (ro.top.includes("feta")) spots(R, 12, mx, my, iw * 0.4, 20).forEach(p => Math.abs(p[1] - my) < ih / 2 - 10 && P.feta(g, p[0], p[1], 1.1, R));
        scatter(g, R, "persille", mx, my, iw * 0.4, 1.2, 20);
      }
    } else if (type === "salad") {
      skaal(g, cx, cy, PR, tema.tal);
      const fr = PR * 0.8;
      if (ro.k === "bulgur") bulgur(g, cx, cy, fr * 0.85, R); else blob(g, cx, cy, fr * 0.85, "#A6CF6A", R, 0.15);
      const items = [...ro.gront];
      items.forEach(v => scatter(g, R, v, cx, cy, fr * 0.75, 0.9, 6));
      ro.prot.forEach(p => scatter(g, R, p === "kylling" ? "kyllingstrimmel" : p, cx + fr * 0.1, cy - fr * 0.1, fr * 0.4, 1, 6));
      if (ro.top.includes("feta")) scatter(g, R, "feta", cx, cy, fr * 0.7, 1, 9);
      if (ro.top.includes("klat")) P.klat(g, cx - fr * 0.35, cy + fr * 0.3, 1.1, R);
      scatter(g, R, "persille", cx, cy, fr * 0.8, 1, 18);
    } else { // plate
      tallerken(g, cx, cy, PR, tema.tal);
      const fr = PR * 0.78;
      if (ro.prot.includes("torsk")) P.torsk(g, cx - fr * 0.15, cy - fr * 0.25, 1, R);
      else if (ro.prot.includes("kodbolle")) [[-0.4, -0.3], [-0.05, -0.42], [-0.3, 0.05]].forEach(([dx, dy]) => P.frikadelle(g, cx + dx * fr, cy + dy * fr, 1, R));
      else ro.prot.forEach(p => scatter(g, R, p, cx - fr * 0.3, cy - fr * 0.2, fr * 0.35));
      if (ro.k === "potato") spots(R, 6, cx + fr * 0.42, cy + fr * 0.1, fr * 0.36, 24).forEach(p => P.kartoffel(g, p[0], p[1], 1, R));
      else if (ro.k === "rice") ris(g, cx + fr * 0.4, cy, fr * 0.4, R);
      if (r.ingredients.some(i => i[0] === "butter")) blob(g, cx + fr * 0.35, cy - fr * 0.05, 7, "#F6E08A", R, 0.2, 8);
      ro.gront.forEach(v => scatter(g, R, v, cx - fr * 0.15, cy + fr * 0.48, fr * 0.3, 0.9, SMAA[v] ? 22 : 10));
      if (r.ingredients.some(i => i[0] === "lemon")) P.citron(g, cx + fr * 0.15, cy - fr * 0.52, 1, R);
      scatter(g, R, "persille", cx, cy, fr * 0.8, 1, 18);
    }
    // warm light
    const lg = g.createLinearGradient(0, 0, W, H); lg.addColorStop(0, "rgba(255,235,190,.14)"); lg.addColorStop(1, "rgba(60,30,0,.12)");
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    return (cache[r.id] = cv.toDataURL("image/jpeg", 0.84));
  }

  window.drawDish = tegn;
})();
