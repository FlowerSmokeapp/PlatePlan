/*
  PRICES – every grocery item the recipes use.

  To change a price:
    Find the item and edit "price" (DKK for one pack) or "pack" (how much is in the pack).
    Then set PRICES_UPDATED to today's date.

  Fields:
    name    Name as shown on the shopping list.
    unit    g, ml, pcs, clove or can. Recipes use the same unit.
    pack    Amount in the smallest common pack (e.g. 500 for 500 g).
    price   DKK for one pack (average Danish discount price: Netto, Rema 1000, Lidl, 365discount).
    aisle   produce, pantry, dairy, meat (meat, fish and tofu), bread
    staple  true = something many people already have at home (shown under "I already have").
    fresh   true = keeps less than a week, so leftovers should be used (drives leftover tips).
    meat    true = meat or fish (the dish is then not vegetarian).
*/
const PRICES_UPDATED = "2026-10-31";

const ITEMS = {
  // Meat, fish and tofu
  beef:          { name: "Minced beef 8–12%", unit: "g", pack: 500, price: 45, aisle: "meat", meat: true, fresh: true },
  pork:          { name: "Minced pork 8–12%", unit: "g", pack: 500, price: 32, aisle: "meat", meat: true, fresh: true },
  chickenBreast: { name: "Chicken breast", unit: "g", pack: 500, price: 45, aisle: "meat", meat: true, fresh: true },
  chickenThigh:  { name: "Boneless chicken thighs", unit: "g", pack: 500, price: 38, aisle: "meat", meat: true, fresh: true },
  cod:           { name: "Cod fillets, frozen", unit: "g", pack: 400, price: 45, aisle: "meat", meat: true },
  bacon:         { name: "Diced bacon", unit: "g", pack: 250, price: 20, aisle: "meat", meat: true, fresh: true },
  tofu:          { name: "Tofu", unit: "g", pack: 400, price: 22, aisle: "meat", fresh: true },

  // Dairy and eggs
  eggs:          { name: "Eggs", unit: "pcs", pack: 10, price: 28, aisle: "dairy" },
  skyr:          { name: "Plain skyr", unit: "g", pack: 1000, price: 22, aisle: "dairy", fresh: true },
  feta:          { name: "Feta", unit: "g", pack: 200, price: 14, aisle: "dairy", fresh: true },
  cheese:        { name: "Grated cheese", unit: "g", pack: 200, price: 18, aisle: "dairy" },
  milk:          { name: "Semi-skimmed milk", unit: "ml", pack: 1000, price: 11, aisle: "dairy", fresh: true },
  cream:         { name: "Cooking cream 9%", unit: "ml", pack: 250, price: 9, aisle: "dairy", fresh: true },
  cremeFraiche:  { name: "Crème fraîche 18%", unit: "g", pack: 200, price: 8, aisle: "dairy", fresh: true },
  cottage:       { name: "Cottage cheese", unit: "g", pack: 250, price: 10, aisle: "dairy", fresh: true },
  butter:        { name: "Butter", unit: "g", pack: 250, price: 25, aisle: "dairy", staple: true },

  // Pantry
  oil:           { name: "Rapeseed oil", unit: "ml", pack: 1000, price: 22, aisle: "pantry", staple: true },
  tuna:          { name: "Tuna in water (185 g)", unit: "can", pack: 1, price: 11, aisle: "pantry" },
  lentils:       { name: "Red lentils", unit: "g", pack: 500, price: 15, aisle: "pantry" },
  chickpeas:     { name: "Chickpeas", unit: "can", pack: 1, price: 6, aisle: "pantry" },
  kidney:        { name: "Kidney beans", unit: "can", pack: 1, price: 6, aisle: "pantry" },
  tomatoes:      { name: "Chopped tomatoes", unit: "can", pack: 1, price: 5, aisle: "pantry" },
  coconut:       { name: "Coconut milk", unit: "can", pack: 1, price: 11, aisle: "pantry" },
  corn:          { name: "Sweetcorn", unit: "can", pack: 1, price: 7, aisle: "pantry" },
  tomatoPaste:   { name: "Tomato paste", unit: "g", pack: 140, price: 5, aisle: "pantry", staple: true },
  pasta:         { name: "Pasta", unit: "g", pack: 1000, price: 14, aisle: "pantry", staple: true },
  lasagne:       { name: "Lasagne sheets", unit: "g", pack: 500, price: 13, aisle: "pantry" },
  rice:          { name: "Rice", unit: "g", pack: 1000, price: 18, aisle: "pantry", staple: true },
  noodles:       { name: "Noodles", unit: "g", pack: 250, price: 10, aisle: "pantry" },
  bulgur:        { name: "Bulgur", unit: "g", pack: 500, price: 14, aisle: "pantry", staple: true },
  oats:          { name: "Rolled oats", unit: "g", pack: 1000, price: 11, aisle: "pantry", staple: true },
  stock:         { name: "Stock cubes", unit: "pcs", pack: 12, price: 12, aisle: "pantry", staple: true },
  curry:         { name: "Curry powder", unit: "g", pack: 50, price: 12, aisle: "pantry", staple: true },
  soy:           { name: "Soy sauce", unit: "ml", pack: 250, price: 15, aisle: "pantry", staple: true },
  pesto:         { name: "Green pesto", unit: "g", pack: 190, price: 17, aisle: "pantry" },

  // Bread
  tortilla:      { name: "Tortillas", unit: "pcs", pack: 8, price: 18, aisle: "bread", fresh: true },
  baguette:      { name: "Baguette", unit: "pcs", pack: 1, price: 9, aisle: "bread", fresh: true },

  // Produce
  potato:        { name: "Potatoes", unit: "g", pack: 2000, price: 20, aisle: "produce" },
  onion:         { name: "Onions (net of about 8)", unit: "pcs", pack: 8, price: 10, aisle: "produce", staple: true },
  redOnion:      { name: "Red onions (net of about 4)", unit: "pcs", pack: 4, price: 9, aisle: "produce" },
  garlic:        { name: "Garlic (3 bulbs, about 30 cloves)", unit: "clove", pack: 30, price: 10, aisle: "produce", staple: true },
  ginger:        { name: "Fresh ginger", unit: "g", pack: 100, price: 5, aisle: "produce" },
  carrot:        { name: "Carrots", unit: "g", pack: 1000, price: 9, aisle: "produce" },
  pepper:        { name: "Bell pepper", unit: "pcs", pack: 1, price: 6, aisle: "produce", fresh: true },
  spinach:       { name: "Spinach, frozen", unit: "g", pack: 450, price: 10, aisle: "produce" },
  broccoli:      { name: "Broccoli", unit: "pcs", pack: 1, price: 12, aisle: "produce", fresh: true },
  zucchini:      { name: "Zucchini", unit: "pcs", pack: 1, price: 8, aisle: "produce", fresh: true },
  leek:          { name: "Leek", unit: "pcs", pack: 1, price: 5, aisle: "produce", fresh: true },
  cabbage:       { name: "White cabbage (about 1 kg)", unit: "g", pack: 1000, price: 10, aisle: "produce" },
  lemon:         { name: "Lemon", unit: "pcs", pack: 1, price: 4, aisle: "produce" },
  cucumber:      { name: "Cucumber", unit: "pcs", pack: 1, price: 8, aisle: "produce", fresh: true },
  cherryTomatoes:{ name: "Cherry tomatoes", unit: "g", pack: 250, price: 13, aisle: "produce", fresh: true },
  lettuce:       { name: "Iceberg lettuce", unit: "pcs", pack: 1, price: 10, aisle: "produce", fresh: true },
  peas:          { name: "Peas, frozen", unit: "g", pack: 750, price: 15, aisle: "produce" }
};

const AISLES = {
  produce: "Fruit & veg",
  meat: "Meat, fish & tofu",
  dairy: "Dairy & eggs",
  bread: "Bread",
  pantry: "Pantry"
};
