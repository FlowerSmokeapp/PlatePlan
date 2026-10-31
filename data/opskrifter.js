/*
  OPSKRIFTER – alle retter i PlatePlan. Teksterne er skrevet til PlatePlan.

  Sådan tilføjer du en ret: kopiér en hel blok { ... }, sæt den ind, og ret felterne.
    id           Kort, unikt navn uden mellemrum og æøå (fx "linsedal").
    navn         Rettens navn.
    minutter     Tid i alt.
    ret          Hvilken slags billede: skaal, pasta, wok, pande, wrap, suppe, tallerken, fad, salat
    sovs         (valgfri) Farve på sovsen i billedet, fx "#C2442B".
    makro        Pr. portion: kcal, protein (g), kulhydrat (g), fedt (g).
    premium      true = kun i Premium. Gratis-versionen har 20 retter.
    ingredienser Til 4 portioner: [vare, mængde]. "vare" skal findes i data/priser.js,
                 og mængden er i varens enhed (g, ml, stk, fed eller dåse).
    trin         Fremgangsmåden, ét trin pr. linje.

  Mærkerne sættes automatisk:
    Vegetar      = ingen varer med kod: true i priser.js
    Hurtig       = højst 20 minutter
    High protein = mindst 30 g protein pr. portion
*/
const OPSKRIFTER = [
  {
    id: "linsedal", navn: "Rød linsedal med kokos", minutter: 35, ret: "skaal", sovs: "#E08A2C",
    makro: { kcal: 520, protein: 22, kulhydrat: 80, fedt: 14 },
    ingredienser: [["linser", 300], ["kokos", 1], ["tomat", 1], ["log", 1], ["hvidlog", 3], ["ingefaer", 20], ["karry", 10], ["ris", 300], ["olie", 20]],
    trin: ["Hak løg, hvidløg og ingefær, og steg det blødt i olie med karry.", "Kom linser, tomater, kokosmælk og 3 dl vand i. Lad det simre i 20 min under omrøring.", "Kog risene imens, og smag dal til med salt."]
  },
  {
    id: "kyllingkarry", navn: "Kylling i karry med ris", minutter: 30, ret: "skaal", sovs: "#E9AE3C",
    makro: { kcal: 610, protein: 38, kulhydrat: 62, fedt: 22 },
    ingredienser: [["kylllaar", 600], ["kokos", 1], ["peber", 1], ["log", 1], ["karry", 10], ["ris", 300], ["olie", 20]],
    trin: ["Skær kyllingen i mundrette stykker, og brun dem i olie.", "Kom løg, peberfrugt og karry ved, og hæld kokosmælken over.", "Lad det simre i 15 min, og server med ris."]
  },
  {
    id: "kodsovs", navn: "Pasta med kødsovs", minutter: 35, ret: "pasta", sovs: "#A8402A",
    makro: { kcal: 640, protein: 37, kulhydrat: 72, fedt: 20 },
    ingredienser: [["oksekod", 500], ["tomat", 2], ["log", 1], ["gulerod", 200], ["hvidlog", 2], ["pure", 50], ["pasta", 400]],
    trin: ["Brun kødet i en gryde sammen med hakket løg og hvidløg.", "Riv guleroden, og kom den i med tomatpuré og hakkede tomater. Lad det simre i 20 min.", "Kog pastaen, og vend den med sovsen."]
  },
  {
    id: "shakshuka", navn: "Shakshuka med feta og brød", minutter: 20, ret: "pande", sovs: "#C2442B",
    makro: { kcal: 430, protein: 24, kulhydrat: 38, fedt: 20 },
    ingredienser: [["aeg", 8], ["tomat", 2], ["peber", 2], ["log", 1], ["hvidlog", 2], ["feta", 100], ["flute", 1], ["olie", 20]],
    trin: ["Steg løg, hvidløg og peberfrugt i olie på en stor pande.", "Kom tomaterne på, og lad det koge ind i 8 min. Lav små huller, og slå æggene ud i dem.", "Læg låg på i 5 min. Drys feta over, og spis med brød."]
  },
  {
    id: "wraps", navn: "Kyllingewraps med skyrdressing", minutter: 20, ret: "wrap",
    makro: { kcal: 560, protein: 45, kulhydrat: 55, fedt: 14 },
    ingredienser: [["kyllbryst", 500], ["tortilla", 8], ["skyr", 200], ["peber", 1], ["majs", 1], ["salat", 1], ["olie", 10]],
    trin: ["Skær kyllingen i strimler, og steg dem med salt og paprika.", "Rør skyr med salt, peber og en smule revet hvidløg.", "Fyld tortillas med salat, majs, peberfrugt, kylling og dressing, og rul dem."]
  },
  {
    id: "tunpasta", navn: "Tunpasta med ærter og citron", minutter: 15, ret: "pasta", sovs: "#F2E6C4",
    makro: { kcal: 560, protein: 34, kulhydrat: 74, fedt: 12 },
    ingredienser: [["pasta", 400], ["tun", 2], ["aerter", 300], ["cremef", 200], ["citron", 1], ["log", 1]],
    trin: ["Kog pastaen. Kom ærterne i gryden de sidste 2 min.", "Steg løget, og rør tun, cremefraiche og revet citronskal i.", "Vend pasta og ærter i sovsen, og pres citronsaft over."]
  },
  {
    id: "kikaertecurry", navn: "Kikærtecurry med spinat", minutter: 25, ret: "skaal", sovs: "#D69A2E",
    makro: { kcal: 540, protein: 17, kulhydrat: 76, fedt: 18 },
    ingredienser: [["kikaert", 2], ["kokos", 1], ["spinat", 300], ["tomat", 1], ["log", 1], ["hvidlog", 2], ["karry", 10], ["ris", 300], ["olie", 20]],
    trin: ["Steg løg, hvidløg og karry i olie i et par minutter.", "Kom kikærter, tomater og kokosmælk i, og lad det simre i 10 min.", "Rør spinaten i til sidst, og server med ris."]
  },
  {
    id: "torsk", navn: "Ovnbagt torsk med kartofler og ærter", minutter: 35, ret: "tallerken",
    makro: { kcal: 420, protein: 36, kulhydrat: 45, fedt: 9 },
    ingredienser: [["torsk", 600], ["kartoffel", 800], ["aerter", 300], ["citron", 1], ["smor", 30]],
    trin: ["Kog kartoflerne møre i ca. 20 min.", "Læg torsken i et fad med citronskiver og små klatter smør. Bag den i 15 min ved 200 °C.", "Server med kartofler og kogte ærter."]
  },
  {
    id: "chili", navn: "Chili sin carne", minutter: 40, ret: "skaal", sovs: "#9E3523",
    makro: { kcal: 510, protein: 24, kulhydrat: 88, fedt: 6 },
    ingredienser: [["kidney", 2], ["linser", 150], ["tomat", 2], ["log", 1], ["peber", 1], ["hvidlog", 2], ["majs", 1], ["ris", 300], ["olie", 20]],
    trin: ["Steg løg, hvidløg og peberfrugt i olie med chili og spidskommen.", "Kom linser, tomater og 2 dl vand i, og lad det simre i 20 min.", "Tilsæt bønner og majs, varm det igennem, og server med ris."]
  },
  {
    id: "aeggekage", navn: "Æggekage med kartofler og bacon", minutter: 20, ret: "pande", sovs: "#F4D46A",
    makro: { kcal: 450, protein: 26, kulhydrat: 30, fedt: 24 },
    ingredienser: [["aeg", 8], ["kartoffel", 500], ["bacon", 150], ["maelk", 200], ["log", 1]],
    trin: ["Steg bacon og skiver af kogte kartofler gyldne på en pande.", "Pisk æg og mælk med salt og peber, og hæld det over.", "Lad æggekagen stivne under låg ved lav varme i ca. 8 min."]
  },
  {
    id: "wok", navn: "Wokede nudler med tofu", minutter: 20, ret: "wok", sovs: "#B0742E",
    makro: { kcal: 480, protein: 22, kulhydrat: 62, fedt: 15 },
    ingredienser: [["nudler", 250], ["tofu", 400], ["broccoli", 1], ["gulerod", 200], ["soja", 50], ["ingefaer", 20], ["hvidlog", 2], ["olie", 20]],
    trin: ["Skær tofuen i tern, og steg dem gyldne i olie.", "Kom broccoli, gulerod, hvidløg og ingefær på panden, og steg i 4 min.", "Vend de kogte nudler og sojasaucen i."]
  },
  {
    id: "frikadeller", navn: "Frikadeller med kartofler og kålsalat", minutter: 45, ret: "tallerken",
    makro: { kcal: 620, protein: 30, kulhydrat: 52, fedt: 32 },
    ingredienser: [["svinekod", 500], ["aeg", 1], ["havre", 50], ["maelk", 100], ["log", 1], ["kartoffel", 1000], ["smor", 30], ["hvidkaal", 400]],
    trin: ["Rør kødet med æg, havregryn, mælk, revet løg, salt og peber til en fast fars.", "Form frikadeller med en ske, og steg dem i smør i ca. 12 min.", "Kog kartoflerne, og snit kålen fint til en salat med lidt eddike."]
  },
  {
    id: "lasagne", navn: "Grøntsagslasagne med hytteost", minutter: 60, ret: "fad", sovs: "#C24C2E",
    makro: { kcal: 520, protein: 31, kulhydrat: 56, fedt: 17 },
    ingredienser: [["lasagne", 250], ["hytteost", 500], ["squash", 1], ["spinat", 300], ["tomat", 2], ["ost", 150], ["log", 1]],
    trin: ["Lav en tomatsovs af løg, revet squash og hakkede tomater.", "Læg sovs, plader, spinat og hytteost i lag i et fad, og slut med revet ost.", "Bag lasagnen i 40 min ved 200 °C."]
  },
  {
    id: "porresuppe", navn: "Kartoffel- og porresuppe", minutter: 30, ret: "suppe", sovs: "#E6DBA8",
    makro: { kcal: 410, protein: 11, kulhydrat: 58, fedt: 14 },
    ingredienser: [["porre", 2], ["kartoffel", 800], ["bouillon", 2], ["flode", 200], ["flute", 1], ["olie", 10]],
    trin: ["Skær porren i ringe, og steg den blød i olie.", "Kom kartofler i tern, 1 liter vand og bouillon i. Kog i 20 min.", "Blend suppen, rør fløden i, og spis den med brød."]
  },
  {
    id: "kyllingesalat", navn: "Kyllingesalat med bulgur og feta", minutter: 20, ret: "salat",
    makro: { kcal: 490, protein: 40, kulhydrat: 44, fedt: 15 },
    ingredienser: [["kyllbryst", 400], ["bulgur", 250], ["agurk", 1], ["cherry", 250], ["feta", 100], ["citron", 1], ["olie", 20]],
    trin: ["Kog bulgur efter anvisningen på posen.", "Steg kyllingen, og skær den i skiver.", "Bland bulgur, agurk, tomater, feta, olie og citronsaft, og læg kyllingen ovenpå."]
  },
  {
    id: "quesadillas", navn: "Quesadillas med bønner og majs", minutter: 15, ret: "wrap",
    makro: { kcal: 580, protein: 24, kulhydrat: 62, fedt: 24 },
    ingredienser: [["tortilla", 8], ["kidney", 1], ["majs", 1], ["ost", 200], ["peber", 1], ["cremef", 100]],
    trin: ["Mos bønnerne let med en gaffel, og bland dem med majs og peberfrugt.", "Fordel fyldet på tortillas, drys ost over, og fold dem på midten.", "Steg dem 2 min på hver side, og spis dem med cremefraiche."]
  },
  {
    id: "kyllingesuppe", navn: "Kyllingesuppe med nudler", minutter: 30, ret: "suppe", sovs: "#E9C46A",
    makro: { kcal: 430, protein: 30, kulhydrat: 46, fedt: 12 },
    ingredienser: [["kylllaar", 400], ["nudler", 200], ["gulerod", 300], ["porre", 1], ["bouillon", 2], ["ingefaer", 20]],
    trin: ["Kog kyllingen i 1,5 liter vand med bouillon og ingefær i 15 min.", "Tag kyllingen op, og kom gulerod og porre i gryden.", "Riv kyllingen i stykker, og kom den tilbage med nudlerne. Kog i 4 min."]
  },
  {
    id: "pestopasta", navn: "Pestopasta med kylling og broccoli", minutter: 20, ret: "pasta", sovs: "#6F9A3A",
    makro: { kcal: 640, protein: 42, kulhydrat: 70, fedt: 20 },
    ingredienser: [["pasta", 400], ["pesto", 190], ["broccoli", 1], ["kyllbryst", 400], ["olie", 10]],
    trin: ["Kog pastaen, og kom broccolien i de sidste 3 min.", "Steg kyllingen i strimler.", "Vend det hele med pesto."]
  },
  {
    id: "kodboller", navn: "Kødboller i tomatsovs med ris", minutter: 35, ret: "skaal", sovs: "#B4402A",
    makro: { kcal: 590, protein: 31, kulhydrat: 64, fedt: 22 },
    ingredienser: [["svinekod", 500], ["havre", 50], ["aeg", 1], ["tomat", 2], ["log", 1], ["ris", 300], ["olie", 20]],
    trin: ["Rør kødet med havregryn, æg, salt og peber, og form små boller.", "Brun bollerne i olie, og kom løg og tomater i.", "Lad det simre i 15 min, og server med ris."]
  },
  {
    id: "ovngront", navn: "Ovngrøntsager med kikærter og feta", minutter: 40, ret: "fad", sovs: "#D9A75A",
    makro: { kcal: 540, protein: 21, kulhydrat: 66, fedt: 20 },
    ingredienser: [["squash", 1], ["peber", 2], ["rodlog", 2], ["kikaert", 2], ["feta", 200], ["bulgur", 250], ["olie", 30]],
    trin: ["Skær grøntsagerne i stykker, og vend dem med kikærter, olie og salt.", "Bag dem i 30 min ved 220 °C.", "Server på bulgur, og smuldr feta over."]
  },

  // ---------- Premium (vises låst i gratisversionen) ----------
  {
    id: "shawarma", navn: "Kyllingeshawarma-bowl", minutter: 30, ret: "salat", premium: true,
    makro: { kcal: 560, protein: 44, kulhydrat: 48, fedt: 18 },
    ingredienser: [["kylllaar", 600], ["bulgur", 250], ["skyr", 300], ["agurk", 1], ["rodlog", 1], ["hvidkaal", 300], ["olie", 20]],
    trin: ["Vend kyllingen med spidskommen, paprika og salt, og steg den sprød.", "Kog bulgur, og snit kål og agurk.", "Byg skåle med bulgur, grønt, kylling og skyr med hvidløg."]
  },
  {
    id: "torskkarry", navn: "Torsk i karry med spinat", minutter: 25, ret: "skaal", sovs: "#E8B54A", premium: true,
    makro: { kcal: 470, protein: 32, kulhydrat: 54, fedt: 14 },
    ingredienser: [["torsk", 500], ["kokos", 1], ["spinat", 300], ["karry", 10], ["ris", 300], ["citron", 1]],
    trin: ["Varm kokosmælk og karry op på en pande.", "Læg torsken i, og lad den trække i 8 min under låg.", "Rør spinat i, og server med ris og citron."]
  },
  {
    id: "linsebolognese", navn: "Linsebolognese", minutter: 30, ret: "pasta", sovs: "#A8402A", premium: true,
    makro: { kcal: 530, protein: 25, kulhydrat: 86, fedt: 8 },
    ingredienser: [["linser", 250], ["tomat", 2], ["gulerod", 200], ["log", 1], ["hvidlog", 2], ["pure", 50], ["pasta", 400], ["ost", 80]],
    trin: ["Steg løg, hvidløg og revet gulerod.", "Kom linser, tomatpuré, tomater og 3 dl vand i, og lad det simre i 20 min.", "Server med pasta og revet ost."]
  },
  {
    id: "teriyaki", navn: "Tofu-teriyaki med ris", minutter: 20, ret: "wok", sovs: "#7E4320", premium: true,
    makro: { kcal: 500, protein: 24, kulhydrat: 70, fedt: 13 },
    ingredienser: [["tofu", 400], ["soja", 60], ["ingefaer", 20], ["broccoli", 1], ["ris", 300], ["hvidlog", 2], ["olie", 20]],
    trin: ["Steg tofu i tern, til de er sprøde.", "Kog sojasauce, ingefær, hvidløg og lidt sukker til en blank sovs.", "Vend tofu og broccoli i sovsen, og server med ris."]
  }
];
