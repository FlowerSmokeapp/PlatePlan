/*
  RECIPES – every dish in PlatePlan. All texts are written for PlatePlan.

  To add a dish: copy a whole { ... } block, paste it, and edit the fields.
    id          Short unique name, no spaces (e.g. "lentilDal").
    name        Name of the dish.
    minutes     Total time. 15 or less = shown under "15 min".
    tools       What you need, from TOOLS in data/items.js. "oven|airfryer" means either one.
                Use [] for dishes that need no cooking.
    dish        Picture style: bowl, pasta, wok, pan, wrap, soup, plate, tray, salad
    sauce       (optional) Sauce colour in the picture, e.g. "#C2442B".
    ingredients For 4 servings: [item, amount]. "item" must exist in data/items.js,
                and the amount is in that item's unit (g, ml, pcs, clove or can).
    steps       The method, one step per line.

  Vegetarian and allergens are worked out automatically from the items.
  Salt, pepper and dried spices are assumed to be in every kitchen.
*/
const RECIPES = [
  {
    id: "lentilDal", name: "Red lentil dal with coconut", minutes: 35, tools: ["hob"], dish: "bowl", sauce: "#E08A2C",
    macros: { kcal: 520, protein: 22, carbs: 80, fat: 14 },
    ingredients: [["lentils", 300], ["coconut", 1], ["tomatoes", 1], ["onion", 1], ["garlic", 3], ["ginger", 20], ["curry", 10], ["rice", 300], ["oil", 20]],
    steps: ["Chop the onion, garlic and ginger, and soften them in oil with the curry powder.", "Add lentils, tomatoes, coconut milk and 300 ml water. Simmer for 20 min, stirring now and then.", "Cook the rice meanwhile, and season the dal with salt."]
  },
  {
    id: "chickenCurry", name: "Chicken curry with rice", minutes: 30, tools: ["hob"], dish: "bowl", sauce: "#E9AE3C",
    macros: { kcal: 610, protein: 38, carbs: 62, fat: 22 },
    ingredients: [["chickenThigh", 600], ["coconut", 1], ["pepper", 1], ["onion", 1], ["curry", 10], ["rice", 300], ["oil", 20]],
    steps: ["Cut the chicken into bite-sized pieces and brown them in oil.", "Add onion, bell pepper and curry powder, then pour in the coconut milk.", "Simmer for 15 min and serve with rice."]
  },
  {
    id: "bolognese", name: "Pasta with meat sauce", minutes: 35, tools: ["hob"], dish: "pasta", sauce: "#A8402A",
    macros: { kcal: 640, protein: 37, carbs: 72, fat: 20 },
    ingredients: [["beef", 500], ["tomatoes", 2], ["onion", 1], ["carrot", 200], ["garlic", 2], ["tomatoPaste", 50], ["pasta", 400]],
    steps: ["Brown the mince in a pot with chopped onion and garlic.", "Grate the carrot and add it with the tomato paste and chopped tomatoes. Simmer for 20 min.", "Cook the pasta and toss it with the sauce."]
  },
  {
    id: "shakshuka", name: "Shakshuka with feta and bread", minutes: 20, tools: ["hob"], dish: "pan", sauce: "#C2442B",
    macros: { kcal: 430, protein: 24, carbs: 38, fat: 20 },
    ingredients: [["eggs", 8], ["tomatoes", 2], ["pepper", 2], ["onion", 1], ["garlic", 2], ["feta", 100], ["baguette", 1], ["oil", 20]],
    steps: ["Fry onion, garlic and bell pepper in oil in a large pan.", "Add the tomatoes and let them cook down for 8 min. Make small wells and crack the eggs into them.", "Cover for 5 min. Crumble feta on top and eat with bread."]
  },
  {
    id: "chickenWraps", name: "Chicken wraps with skyr dressing", minutes: 20, tools: ["hob"], dish: "wrap",
    macros: { kcal: 560, protein: 45, carbs: 55, fat: 14 },
    ingredients: [["chickenBreast", 500], ["tortilla", 8], ["skyr", 200], ["pepper", 1], ["corn", 1], ["lettuce", 1], ["oil", 10]],
    steps: ["Slice the chicken into strips and fry with salt and paprika.", "Stir the skyr with salt, pepper and a little grated garlic.", "Fill the tortillas with lettuce, corn, bell pepper, chicken and dressing, then roll them up."]
  },
  {
    id: "tunaPasta", name: "Tuna pasta with peas and lemon", minutes: 15, tools: ["hob"], dish: "pasta", sauce: "#F2E6C4",
    macros: { kcal: 560, protein: 34, carbs: 74, fat: 12 },
    ingredients: [["pasta", 400], ["tuna", 2], ["peas", 300], ["cremeFraiche", 200], ["lemon", 1], ["onion", 1]],
    steps: ["Cook the pasta. Add the peas for the last 2 min.", "Fry the onion, then stir in tuna, crème fraîche and grated lemon zest.", "Toss pasta and peas in the sauce and squeeze lemon juice over."]
  },
  {
    id: "chickpeaCurry", name: "Chickpea curry with spinach", minutes: 25, tools: ["hob"], dish: "bowl", sauce: "#D69A2E",
    macros: { kcal: 540, protein: 17, carbs: 76, fat: 18 },
    ingredients: [["chickpeas", 2], ["coconut", 1], ["spinach", 300], ["tomatoes", 1], ["onion", 1], ["garlic", 2], ["curry", 10], ["rice", 300], ["oil", 20]],
    steps: ["Fry onion, garlic and curry powder in oil for a couple of minutes.", "Add chickpeas, tomatoes and coconut milk, and simmer for 10 min.", "Stir in the spinach at the end and serve with rice."]
  },
  {
    id: "bakedCod", name: "Baked cod with potatoes and peas", minutes: 35, tools: ["hob", "oven|airfryer"], dish: "plate",
    macros: { kcal: 420, protein: 36, carbs: 45, fat: 9 },
    ingredients: [["cod", 600], ["potato", 800], ["peas", 300], ["lemon", 1], ["butter", 30]],
    steps: ["Boil the potatoes until tender, about 20 min.", "Put the cod in a dish with lemon slices and small knobs of butter. Bake for 15 min at 200 °C.", "Serve with the potatoes and boiled peas."]
  },
  {
    id: "chiliSinCarne", name: "Chili sin carne", minutes: 40, tools: ["hob"], dish: "bowl", sauce: "#9E3523",
    macros: { kcal: 510, protein: 24, carbs: 88, fat: 6 },
    ingredients: [["kidney", 2], ["lentils", 150], ["tomatoes", 2], ["onion", 1], ["pepper", 1], ["garlic", 2], ["corn", 1], ["rice", 300], ["oil", 20]],
    steps: ["Fry onion, garlic and bell pepper in oil with chili and cumin.", "Add lentils, tomatoes and 200 ml water, and simmer for 20 min.", "Add the beans and corn, heat through, and serve with rice."]
  },
  {
    id: "omelette", name: "Danish omelette with potatoes and bacon", minutes: 20, tools: ["hob"], dish: "pan", sauce: "#F4D46A",
    macros: { kcal: 450, protein: 26, carbs: 30, fat: 24 },
    ingredients: [["eggs", 8], ["potato", 500], ["bacon", 150], ["milk", 200], ["onion", 1]],
    steps: ["Fry the bacon and slices of boiled potato until golden.", "Whisk eggs and milk with salt and pepper, and pour it over.", "Let it set under a lid on low heat for about 8 min."]
  },
  {
    id: "tofuNoodles", name: "Stir-fried noodles with tofu", minutes: 20, tools: ["hob"], dish: "wok", sauce: "#B0742E",
    macros: { kcal: 480, protein: 22, carbs: 62, fat: 15 },
    ingredients: [["noodles", 250], ["tofu", 400], ["broccoli", 1], ["carrot", 200], ["soy", 50], ["ginger", 20], ["garlic", 2], ["oil", 20]],
    steps: ["Cut the tofu into cubes and fry until golden in oil.", "Add broccoli, carrot, garlic and ginger to the pan and stir-fry for 4 min.", "Toss in the cooked noodles and the soy sauce."]
  },
  {
    id: "meatPatties", name: "Meat patties with potatoes and slaw", minutes: 45, tools: ["hob"], dish: "plate",
    macros: { kcal: 620, protein: 30, carbs: 52, fat: 32 },
    ingredients: [["pork", 500], ["eggs", 1], ["oats", 50], ["milk", 100], ["onion", 1], ["potato", 1000], ["butter", 30], ["cabbage", 400]],
    steps: ["Mix the mince with egg, oats, milk, grated onion, salt and pepper into a firm mixture.", "Shape patties with a spoon and fry them in butter for about 12 min.", "Boil the potatoes, and shred the cabbage finely for a slaw with a splash of vinegar."]
  },
  {
    id: "veggieLasagne", name: "Veggie lasagne with cottage cheese", minutes: 60, tools: ["hob", "oven"], dish: "tray", sauce: "#C24C2E",
    macros: { kcal: 520, protein: 31, carbs: 56, fat: 17 },
    ingredients: [["lasagne", 250], ["cottage", 500], ["zucchini", 1], ["spinach", 300], ["tomatoes", 2], ["cheese", 150], ["onion", 1]],
    steps: ["Make a tomato sauce from onion, grated zucchini and chopped tomatoes.", "Layer sauce, sheets, spinach and cottage cheese in a dish, finishing with grated cheese.", "Bake for 40 min at 200 °C."]
  },
  {
    id: "leekSoup", name: "Potato and leek soup", minutes: 30, tools: ["hob", "blender"], dish: "soup", sauce: "#E6DBA8",
    macros: { kcal: 410, protein: 11, carbs: 58, fat: 14 },
    ingredients: [["leek", 2], ["potato", 800], ["stock", 2], ["cream", 200], ["baguette", 1], ["oil", 10]],
    steps: ["Slice the leek into rings and soften it in oil.", "Add diced potatoes, 1 litre of water and the stock cubes. Boil for 20 min.", "Blend the soup, stir in the cream, and eat it with bread."]
  },
  {
    id: "chickenSalad", name: "Chicken salad with bulgur and feta", minutes: 20, tools: ["hob|airfryer"], dish: "salad",
    macros: { kcal: 490, protein: 40, carbs: 44, fat: 15 },
    ingredients: [["chickenBreast", 400], ["bulgur", 250], ["cucumber", 1], ["cherryTomatoes", 250], ["feta", 100], ["lemon", 1], ["oil", 20]],
    steps: ["Cook the bulgur as described on the packet.", "Fry the chicken and slice it.", "Mix bulgur, cucumber, tomatoes, feta, oil and lemon juice, and top with the chicken."]
  },
  {
    id: "quesadillas", name: "Bean and corn quesadillas", minutes: 15, tools: ["hob"], dish: "wrap",
    macros: { kcal: 580, protein: 24, carbs: 62, fat: 24 },
    ingredients: [["tortilla", 8], ["kidney", 1], ["corn", 1], ["cheese", 200], ["pepper", 1], ["cremeFraiche", 100]],
    steps: ["Lightly mash the beans with a fork and mix them with corn and bell pepper.", "Spread the filling on the tortillas, sprinkle cheese on top, and fold them in half.", "Fry for 2 min on each side and eat with crème fraîche."]
  },
  {
    id: "chickenSoup", name: "Chicken noodle soup", minutes: 30, tools: ["hob"], dish: "soup", sauce: "#E9C46A",
    macros: { kcal: 430, protein: 30, carbs: 46, fat: 12 },
    ingredients: [["chickenThigh", 400], ["noodles", 200], ["carrot", 300], ["leek", 1], ["stock", 2], ["ginger", 20]],
    steps: ["Simmer the chicken in 1.5 litres of water with stock cubes and ginger for 15 min.", "Lift out the chicken, and add carrot and leek to the pot.", "Shred the chicken and return it with the noodles. Cook for 4 min."]
  },
  {
    id: "pestoPasta", name: "Pesto pasta with chicken and broccoli", minutes: 20, tools: ["hob"], dish: "pasta", sauce: "#6F9A3A",
    macros: { kcal: 640, protein: 42, carbs: 70, fat: 20 },
    ingredients: [["pasta", 400], ["pesto", 190], ["broccoli", 1], ["chickenBreast", 400], ["oil", 10]],
    steps: ["Cook the pasta, adding the broccoli for the last 3 min.", "Fry the chicken in strips.", "Toss everything with the pesto."]
  },
  {
    id: "meatballs", name: "Meatballs in tomato sauce with rice", minutes: 35, tools: ["hob"], dish: "bowl", sauce: "#B4402A",
    macros: { kcal: 590, protein: 31, carbs: 64, fat: 22 },
    ingredients: [["pork", 500], ["oats", 50], ["eggs", 1], ["tomatoes", 2], ["onion", 1], ["rice", 300], ["oil", 20]],
    steps: ["Mix the mince with oats, egg, salt and pepper, and roll into small balls.", "Brown the balls in oil, then add onion and tomatoes.", "Simmer for 15 min and serve with rice."]
  },
  {
    id: "roastVeg", name: "Roast veg with chickpeas and feta", minutes: 40, tools: ["oven|airfryer"], dish: "tray", sauce: "#D9A75A",
    macros: { kcal: 540, protein: 21, carbs: 66, fat: 20 },
    ingredients: [["zucchini", 1], ["pepper", 2], ["redOnion", 2], ["chickpeas", 2], ["feta", 200], ["bulgur", 250], ["oil", 30]],
    steps: ["Cut the vegetables into chunks and toss them with chickpeas, oil and salt.", "Roast for 30 min at 220 °C.", "Serve on bulgur with crumbled feta."]
  },

  {
    id: "shawarmaBowl", name: "Chicken shawarma bowl", minutes: 30, tools: ["hob|airfryer"], dish: "salad",
    macros: { kcal: 560, protein: 44, carbs: 48, fat: 18 },
    ingredients: [["chickenThigh", 600], ["bulgur", 250], ["skyr", 300], ["cucumber", 1], ["redOnion", 1], ["cabbage", 300], ["oil", 20]],
    steps: ["Toss the chicken with cumin, paprika and salt, and fry until crisp.", "Cook the bulgur, and shred the cabbage and cucumber.", "Build bowls with bulgur, veg, chicken and garlicky skyr."]
  },
  {
    id: "codCurry", name: "Cod curry with spinach", minutes: 25, tools: ["hob"], dish: "bowl", sauce: "#E8B54A",
    macros: { kcal: 470, protein: 32, carbs: 54, fat: 14 },
    ingredients: [["cod", 500], ["coconut", 1], ["spinach", 300], ["curry", 10], ["rice", 300], ["lemon", 1]],
    steps: ["Warm the coconut milk and curry powder in a pan.", "Add the cod and let it poach for 8 min under a lid.", "Stir in the spinach and serve with rice and lemon."]
  },
  {
    id: "lentilBolognese", name: "Lentil bolognese", minutes: 30, tools: ["hob"], dish: "pasta", sauce: "#A8402A",
    macros: { kcal: 530, protein: 25, carbs: 86, fat: 8 },
    ingredients: [["lentils", 250], ["tomatoes", 2], ["carrot", 200], ["onion", 1], ["garlic", 2], ["tomatoPaste", 50], ["pasta", 400], ["cheese", 80]],
    steps: ["Fry onion, garlic and grated carrot.", "Add lentils, tomato paste, tomatoes and 300 ml water, and simmer for 20 min.", "Serve with pasta and grated cheese."]
  },
  {
    id: "tofuTeriyaki", name: "Tofu teriyaki with rice", minutes: 20, tools: ["hob"], dish: "wok", sauce: "#7E4320",
    macros: { kcal: 500, protein: 24, carbs: 70, fat: 13 },
    ingredients: [["tofu", 400], ["soy", 60], ["ginger", 20], ["broccoli", 1], ["rice", 300], ["garlic", 2], ["oil", 20]],
    steps: ["Fry the tofu cubes until crisp.", "Boil soy sauce, ginger, garlic and a little sugar into a glossy sauce.", "Toss the tofu and broccoli in the sauce and serve with rice."]
  },
  // ---------- Ready in 15 minutes ----------
  {
    id: "eggFriedRice", name: "Egg fried rice with peas", minutes: 15, tools: ["hob"], dish: "wok", sauce: "#E8C36A",
    macros: { kcal: 480, protein: 18, carbs: 70, fat: 14 },
    ingredients: [["rice", 300], ["eggs", 4], ["peas", 300], ["soy", 40], ["onion", 1], ["oil", 30]],
    steps: ["Cook the rice, or use leftover rice from the fridge.", "Fry the onion in oil, push it aside and scramble the eggs in the pan.", "Add rice, peas and soy sauce, and stir-fry on high heat for 4 min."]
  },
  {
    id: "jacketPotato", name: "Microwave jacket potatoes with tuna", minutes: 15, tools: ["microwave"], dish: "plate",
    macros: { kcal: 430, protein: 30, carbs: 58, fat: 7 },
    ingredients: [["potato", 1000], ["tuna", 2], ["cottage", 250], ["corn", 1]],
    steps: ["Prick the potatoes with a fork and microwave them on full power for 10–12 min, turning once.", "Mix tuna, cottage cheese and corn with salt and pepper.", "Split the potatoes and fill them."]
  },
  {
    id: "couscousSalad", name: "Couscous salad with chickpeas and feta", minutes: 10, tools: ["kettle"], dish: "salad",
    macros: { kcal: 520, protein: 20, carbs: 68, fat: 18 },
    ingredients: [["couscous", 300], ["chickpeas", 1], ["feta", 150], ["cucumber", 1], ["cherryTomatoes", 250], ["lemon", 1], ["oil", 30]],
    steps: ["Pour 400 ml boiling water over the couscous, cover and leave for 5 min.", "Chop the cucumber and halve the tomatoes.", "Fluff the couscous with a fork and mix in everything else with lemon juice and oil."]
  },
  {
    id: "eggsOnToast", name: "Fried eggs on toast with spinach", minutes: 10, tools: ["hob"], dish: "pan", sauce: "#2F5A2A",
    macros: { kcal: 390, protein: 22, carbs: 32, fat: 19 },
    ingredients: [["eggs", 8], ["bread", 8], ["spinach", 300], ["butter", 30], ["garlic", 1]],
    steps: ["Toast the bread.", "Wilt the spinach in a pan with a little butter and garlic, then move it to a plate.", "Fry the eggs in the rest of the butter and serve on toast with the spinach."]
  },
  {
    id: "crispyChicken", name: "Air fryer chicken strips with slaw", minutes: 15, tools: ["airfryer|oven"], dish: "plate",
    macros: { kcal: 470, protein: 42, carbs: 30, fat: 18 },
    ingredients: [["chickenBreast", 500], ["oats", 80], ["eggs", 1], ["cabbage", 300], ["skyr", 150], ["oil", 15]],
    steps: ["Cut the chicken into strips, dip them in beaten egg, then in oats mixed with salt and paprika.", "Air fry at 200 °C for 10–12 min (or bake in the oven for 15 min).", "Shred the cabbage and mix with skyr, salt and pepper."]
  },
  {
    id: "quickNoodleSoup", name: "Quick noodle soup with egg", minutes: 10, tools: ["kettle|hob"], dish: "soup", sauce: "#D9A24E",
    macros: { kcal: 380, protein: 17, carbs: 52, fat: 10 },
    ingredients: [["noodles", 250], ["eggs", 4], ["stock", 2], ["spinach", 200], ["soy", 30]],
    steps: ["Boil 1.2 litres of water with the stock cubes and soy sauce.", "Add the noodles and spinach and cook for 3 min.", "Add eggs boiled for 6 min, halved, and serve."]
  },
  {
    id: "tomatoPesto", name: "Pasta with pesto and cherry tomatoes", minutes: 12, tools: ["hob"], dish: "pasta", sauce: "#6F9A3A",
    macros: { kcal: 560, protein: 16, carbs: 76, fat: 21 },
    ingredients: [["pasta", 400], ["pesto", 190], ["cherryTomatoes", 250], ["cheese", 60]],
    steps: ["Cook the pasta.", "Halve the tomatoes.", "Toss the hot pasta with pesto and tomatoes, and top with cheese."]
  },
  {
    id: "tunaWraps", name: "No-cook tuna wraps", minutes: 10, tools: [], dish: "wrap",
    macros: { kcal: 450, protein: 30, carbs: 48, fat: 13 },
    ingredients: [["tortilla", 8], ["tuna", 2], ["corn", 1], ["lettuce", 1], ["cremeFraiche", 150], ["cucumber", 1]],
    steps: ["Mix tuna and corn with crème fraîche, salt and pepper.", "Shred the lettuce and slice the cucumber.", "Fill and roll the tortillas."]
  }
];
