/*
  ITEMS – every food the recipes use.

  Fields:
    name       Name shown in the app.
    unit       g, ml, pcs, clove or can. Recipes use the same unit.
    place      Where you keep it: fridge, freezer or cupboard (shown in "Cook What You Have").
    allergens  gluten, lactose, egg, fish, soy, nuts (used by the Premium allergy filter).
    meat       true = meat or fish (the dish is then not vegetarian).
    offer      Danish words used to find this item in the weekly offers (lower case).
*/
const ITEMS = {
  // Fridge
  beef:          { name: "Minced beef", unit: "g", place: "fridge", meat: true, offer: ["hakket oksekød", "oksefars", "hakket kalv og flæsk"] },
  pork:          { name: "Minced pork", unit: "g", place: "fridge", meat: true, offer: ["hakket svinekød", "svinefars", "hakket grisekød"] },
  chickenBreast: { name: "Chicken breast", unit: "g", place: "fridge", meat: true, offer: ["kyllingebryst", "kyllingefilet", "kyllingeinderfilet"] },
  chickenThigh:  { name: "Chicken thighs", unit: "g", place: "fridge", meat: true, offer: ["kyllingelår", "kyllingeoverlår"] },
  bacon:         { name: "Bacon", unit: "g", place: "fridge", meat: true, offer: ["bacon"] },
  tofu:          { name: "Tofu", unit: "g", place: "fridge", allergens: ["soy"], offer: ["tofu"] },
  eggs:          { name: "Eggs", unit: "pcs", place: "fridge", allergens: ["egg"], offer: ["æg"] },
  skyr:          { name: "Skyr", unit: "g", place: "fridge", allergens: ["lactose"], offer: ["skyr"] },
  feta:          { name: "Feta", unit: "g", place: "fridge", allergens: ["lactose"], offer: ["feta", "salattern"] },
  cheese:        { name: "Grated cheese", unit: "g", place: "fridge", allergens: ["lactose"], offer: ["revet ost", "pizzatop", "mozzarella"] },
  milk:          { name: "Milk", unit: "ml", place: "fridge", allergens: ["lactose"], offer: ["letmælk", "minimælk", "sødmælk"] },
  cream:         { name: "Cooking cream", unit: "ml", place: "fridge", allergens: ["lactose"], offer: ["madlavningsfløde", "piskefløde"] },
  cremeFraiche:  { name: "Crème fraîche", unit: "g", place: "fridge", allergens: ["lactose"], offer: ["cremefraiche", "creme fraiche"] },
  cottage:       { name: "Cottage cheese", unit: "g", place: "fridge", allergens: ["lactose"], offer: ["hytteost"] },
  butter:        { name: "Butter", unit: "g", place: "fridge", allergens: ["lactose"], offer: ["smør", "smørbar"] },
  pepper:        { name: "Bell pepper", unit: "pcs", place: "fridge", offer: ["peberfrugt"] },
  broccoli:      { name: "Broccoli", unit: "pcs", place: "fridge", offer: ["broccoli"] },
  zucchini:      { name: "Zucchini", unit: "pcs", place: "fridge", offer: ["squash"] },
  leek:          { name: "Leek", unit: "pcs", place: "fridge", offer: ["porre"] },
  cabbage:       { name: "White cabbage", unit: "g", place: "fridge", offer: ["hvidkål", "spidskål"] },
  carrot:        { name: "Carrots", unit: "g", place: "fridge", offer: ["gulerødder", "gulerod"] },
  cucumber:      { name: "Cucumber", unit: "pcs", place: "fridge", offer: ["agurk"] },
  cherryTomatoes:{ name: "Cherry tomatoes", unit: "g", place: "fridge", offer: ["cherrytomater", "snacktomater"] },
  lettuce:       { name: "Lettuce", unit: "pcs", place: "fridge", offer: ["iceberg", "salathoved", "hjertesalat"] },
  lemon:         { name: "Lemon", unit: "pcs", place: "fridge", offer: ["citron"] },
  ginger:        { name: "Fresh ginger", unit: "g", place: "fridge", offer: ["ingefær"] },
  pesto:         { name: "Pesto", unit: "g", place: "fridge", allergens: ["lactose", "nuts"], offer: ["pesto"] },
  tortilla:      { name: "Tortillas", unit: "pcs", place: "cupboard", allergens: ["gluten"], offer: ["tortilla", "wraps"] },

  // Freezer
  cod:           { name: "Cod fillets", unit: "g", place: "freezer", meat: true, allergens: ["fish"], offer: ["torsk", "torskefilet"] },
  peas:          { name: "Peas", unit: "g", place: "freezer", offer: ["ærter"] },
  spinach:       { name: "Spinach", unit: "g", place: "freezer", offer: ["spinat"] },

  // Cupboard
  potato:        { name: "Potatoes", unit: "g", place: "cupboard", offer: ["kartofler"] },
  onion:         { name: "Onions", unit: "pcs", place: "cupboard", offer: ["løg"] },
  redOnion:      { name: "Red onions", unit: "pcs", place: "cupboard", offer: ["rødløg"] },
  garlic:        { name: "Garlic", unit: "clove", place: "cupboard", offer: ["hvidløg"] },
  oil:           { name: "Oil", unit: "ml", place: "cupboard", offer: ["rapsolie", "olivenolie"] },
  tuna:          { name: "Tinned tuna", unit: "can", place: "cupboard", meat: true, allergens: ["fish"], offer: ["tun i vand", "tun i olie", "tun "] },
  lentils:       { name: "Red lentils", unit: "g", place: "cupboard", offer: ["røde linser", "linser"] },
  chickpeas:     { name: "Chickpeas", unit: "can", place: "cupboard", offer: ["kikærter"] },
  kidney:        { name: "Kidney beans", unit: "can", place: "cupboard", offer: ["kidneybønner", "chilibønner"] },
  tomatoes:      { name: "Chopped tomatoes", unit: "can", place: "cupboard", offer: ["hakkede tomater", "flåede tomater"] },
  coconut:       { name: "Coconut milk", unit: "can", place: "cupboard", offer: ["kokosmælk"] },
  corn:          { name: "Sweetcorn", unit: "can", place: "cupboard", offer: ["majs"] },
  tomatoPaste:   { name: "Tomato paste", unit: "g", place: "cupboard", offer: ["tomatpuré"] },
  pasta:         { name: "Pasta", unit: "g", place: "cupboard", allergens: ["gluten"], offer: ["pasta", "spaghetti", "penne", "fusilli"] },
  lasagne:       { name: "Lasagne sheets", unit: "g", place: "cupboard", allergens: ["gluten"], offer: ["lasagneplader"] },
  rice:          { name: "Rice", unit: "g", place: "cupboard", offer: ["ris", "basmati", "jasmin"] },
  noodles:       { name: "Noodles", unit: "g", place: "cupboard", allergens: ["gluten"], offer: ["nudler"] },
  bulgur:        { name: "Bulgur", unit: "g", place: "cupboard", allergens: ["gluten"], offer: ["bulgur"] },
  couscous:      { name: "Couscous", unit: "g", place: "cupboard", allergens: ["gluten"], offer: ["couscous"] },
  oats:          { name: "Rolled oats", unit: "g", place: "cupboard", allergens: ["gluten"], offer: ["havregryn"] },
  stock:         { name: "Stock cubes", unit: "pcs", place: "cupboard", offer: ["bouillon"] },
  curry:         { name: "Curry powder", unit: "g", place: "cupboard", offer: ["karry"] },
  soy:           { name: "Soy sauce", unit: "ml", place: "cupboard", allergens: ["soy", "gluten"], offer: ["soja"] },
  bread:         { name: "Bread", unit: "pcs", place: "cupboard", allergens: ["gluten"], offer: ["toastbrød", "rugbrød", "franskbrød"] },
  baguette:      { name: "Baguette", unit: "pcs", place: "cupboard", allergens: ["gluten"], offer: ["flute", "baguette"] }
};

const PLACES = { fridge: "Fridge", freezer: "Freezer", cupboard: "Cupboard" };
const ALLERGENS = { gluten: "Gluten", lactose: "Lactose", egg: "Egg", fish: "Fish", soy: "Soy", nuts: "Nuts" };

// Kitchen tools. Recipes list what they need, e.g. tools: ["hob", "oven|airfryer"].
const TOOLS = {
  hob: "Hob",
  oven: "Oven",
  airfryer: "Air fryer",
  microwave: "Microwave",
  kettle: "Kettle",
  blender: "Blender"
};
