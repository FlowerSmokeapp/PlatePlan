/*
  PRISER – alle varer, som opskrifterne bruger.

  Sådan retter du en pris:
    Find varen og ret "pris" (kr. for én pakke) eller "pakke" (hvor meget der er i pakken).
    Husk at rette PRISER_OPDATERET til dagens dato bagefter.

  Felter:
    navn      Navnet, som det står på indkøbslisten.
    enhed     g, ml, stk, fed eller dåse. Opskrifterne bruger samme enhed.
    pakke     Hvor meget der er i den mindste almindelige pakke (fx 500 for 500 g).
    pris      Pris i kr. for én pakke (gennemsnitlig discountpris: Netto, Rema 1000, Lidl, 365discount).
    afdeling  frugt, kol (kolonial), mejeri, kod (kød, fisk og tofu), brod (brød)
    basis     true = noget mange allerede har i skabet (vises under "Jeg har allerede").
    frisk     true = holder under en uge, så rester bør bruges (bruges til forslag om rester).
    kod       true = kød eller fisk (så er retten ikke vegetar).
*/
const PRISER_OPDATERET = "2026-10-31";

const VARER = {
  // Kød, fisk og tofu
  oksekod:   { navn: "Hakket oksekød 8–12 %", enhed: "g", pakke: 500, pris: 45, afdeling: "kod", kod: true, frisk: true },
  svinekod:  { navn: "Hakket svinekød 8–12 %", enhed: "g", pakke: 500, pris: 32, afdeling: "kod", kod: true, frisk: true },
  kyllbryst: { navn: "Kyllingebryst", enhed: "g", pakke: 500, pris: 45, afdeling: "kod", kod: true, frisk: true },
  kylllaar:  { navn: "Kyllingelår uden ben", enhed: "g", pakke: 500, pris: 38, afdeling: "kod", kod: true, frisk: true },
  torsk:     { navn: "Torskefilet, frost", enhed: "g", pakke: 400, pris: 45, afdeling: "kod", kod: true },
  bacon:     { navn: "Bacontern", enhed: "g", pakke: 250, pris: 20, afdeling: "kod", kod: true, frisk: true },
  tofu:      { navn: "Tofu", enhed: "g", pakke: 400, pris: 22, afdeling: "kod", frisk: true },

  // Mejeri og æg
  aeg:       { navn: "Æg", enhed: "stk", pakke: 10, pris: 28, afdeling: "mejeri" },
  skyr:      { navn: "Skyr naturel", enhed: "g", pakke: 1000, pris: 22, afdeling: "mejeri", frisk: true },
  feta:      { navn: "Feta", enhed: "g", pakke: 200, pris: 14, afdeling: "mejeri", frisk: true },
  ost:       { navn: "Revet ost", enhed: "g", pakke: 200, pris: 18, afdeling: "mejeri" },
  maelk:     { navn: "Letmælk", enhed: "ml", pakke: 1000, pris: 11, afdeling: "mejeri", frisk: true },
  flode:     { navn: "Madlavningsfløde 9 %", enhed: "ml", pakke: 250, pris: 9, afdeling: "mejeri", frisk: true },
  cremef:    { navn: "Cremefraiche 18 %", enhed: "g", pakke: 200, pris: 8, afdeling: "mejeri", frisk: true },
  hytteost:  { navn: "Hytteost", enhed: "g", pakke: 250, pris: 10, afdeling: "mejeri", frisk: true },
  smor:      { navn: "Smør", enhed: "g", pakke: 250, pris: 25, afdeling: "mejeri", basis: true },

  // Kolonial
  olie:      { navn: "Rapsolie", enhed: "ml", pakke: 1000, pris: 22, afdeling: "kol", basis: true },
  tun:       { navn: "Tun i vand (185 g)", enhed: "dåse", pakke: 1, pris: 11, afdeling: "kol" },
  linser:    { navn: "Røde linser", enhed: "g", pakke: 500, pris: 15, afdeling: "kol" },
  kikaert:   { navn: "Kikærter", enhed: "dåse", pakke: 1, pris: 6, afdeling: "kol" },
  kidney:    { navn: "Kidneybønner", enhed: "dåse", pakke: 1, pris: 6, afdeling: "kol" },
  tomat:     { navn: "Hakkede tomater", enhed: "dåse", pakke: 1, pris: 5, afdeling: "kol" },
  kokos:     { navn: "Kokosmælk", enhed: "dåse", pakke: 1, pris: 11, afdeling: "kol" },
  majs:      { navn: "Majs", enhed: "dåse", pakke: 1, pris: 7, afdeling: "kol" },
  pure:      { navn: "Tomatpuré", enhed: "g", pakke: 140, pris: 5, afdeling: "kol", basis: true },
  pasta:     { navn: "Pasta", enhed: "g", pakke: 1000, pris: 14, afdeling: "kol", basis: true },
  lasagne:   { navn: "Lasagneplader", enhed: "g", pakke: 500, pris: 13, afdeling: "kol" },
  ris:       { navn: "Ris", enhed: "g", pakke: 1000, pris: 18, afdeling: "kol", basis: true },
  nudler:    { navn: "Nudler", enhed: "g", pakke: 250, pris: 10, afdeling: "kol" },
  bulgur:    { navn: "Bulgur", enhed: "g", pakke: 500, pris: 14, afdeling: "kol", basis: true },
  havre:     { navn: "Havregryn", enhed: "g", pakke: 1000, pris: 11, afdeling: "kol", basis: true },
  bouillon:  { navn: "Bouillonterninger", enhed: "stk", pakke: 12, pris: 12, afdeling: "kol", basis: true },
  karry:     { navn: "Karry", enhed: "g", pakke: 50, pris: 12, afdeling: "kol", basis: true },
  soja:      { navn: "Sojasauce", enhed: "ml", pakke: 250, pris: 15, afdeling: "kol", basis: true },
  pesto:     { navn: "Grøn pesto", enhed: "g", pakke: 190, pris: 17, afdeling: "kol" },

  // Brød
  tortilla:  { navn: "Tortillas", enhed: "stk", pakke: 8, pris: 18, afdeling: "brod", frisk: true },
  flute:     { navn: "Flute", enhed: "stk", pakke: 1, pris: 9, afdeling: "brod", frisk: true },

  // Frugt og grønt
  kartoffel: { navn: "Kartofler", enhed: "g", pakke: 2000, pris: 20, afdeling: "frugt" },
  log:       { navn: "Løg (net med ca. 8)", enhed: "stk", pakke: 8, pris: 10, afdeling: "frugt", basis: true },
  rodlog:    { navn: "Rødløg (net med ca. 4)", enhed: "stk", pakke: 4, pris: 9, afdeling: "frugt" },
  hvidlog:   { navn: "Hvidløg (3 hoveder, ca. 30 fed)", enhed: "fed", pakke: 30, pris: 10, afdeling: "frugt", basis: true },
  ingefaer:  { navn: "Ingefær", enhed: "g", pakke: 100, pris: 5, afdeling: "frugt" },
  gulerod:   { navn: "Gulerødder", enhed: "g", pakke: 1000, pris: 9, afdeling: "frugt" },
  peber:     { navn: "Peberfrugt", enhed: "stk", pakke: 1, pris: 6, afdeling: "frugt", frisk: true },
  spinat:    { navn: "Spinat, frost", enhed: "g", pakke: 450, pris: 10, afdeling: "frugt" },
  broccoli:  { navn: "Broccoli", enhed: "stk", pakke: 1, pris: 12, afdeling: "frugt", frisk: true },
  squash:    { navn: "Squash", enhed: "stk", pakke: 1, pris: 8, afdeling: "frugt", frisk: true },
  porre:     { navn: "Porre", enhed: "stk", pakke: 1, pris: 5, afdeling: "frugt", frisk: true },
  hvidkaal:  { navn: "Hvidkål (ca. 1 kg)", enhed: "g", pakke: 1000, pris: 10, afdeling: "frugt" },
  citron:    { navn: "Citron", enhed: "stk", pakke: 1, pris: 4, afdeling: "frugt" },
  agurk:     { navn: "Agurk", enhed: "stk", pakke: 1, pris: 8, afdeling: "frugt", frisk: true },
  cherry:    { navn: "Cherrytomater", enhed: "g", pakke: 250, pris: 13, afdeling: "frugt", frisk: true },
  salat:     { navn: "Icebergsalat", enhed: "stk", pakke: 1, pris: 10, afdeling: "frugt", frisk: true },
  aerter:    { navn: "Ærter, frost", enhed: "g", pakke: 750, pris: 15, afdeling: "frugt" }
};

const AFDELINGER = {
  frugt: "Frugt og grønt",
  kod: "Kød, fisk og tofu",
  mejeri: "Mejeri og æg",
  brod: "Brød",
  kol: "Kolonial"
};
