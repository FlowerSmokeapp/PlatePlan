/*
  SAMPLE OFFERS – shown only while the offer service is not connected
  (see SUPABASE_URL in js/config.js and supabase/functions/offers).
  The app labels them clearly as examples. Titles are in Danish, like real offers.
*/
const SAMPLE_OFFERS = [
  { title: "Hakket oksekød 8-12%", store: "Netto", price: 35, before: 45, quantity: "500 g" },
  { title: "Kyllingebryst", store: "Rema 1000", price: 59, before: 75, quantity: "900 g" },
  { title: "Kyllingelår uden ben", store: "Lidl", price: 32, before: 40, quantity: "500 g" },
  { title: "Hakket svinekød 8-12%", store: "Føtex", price: 25, before: 32, quantity: "500 g" },
  { title: "Bacon i tern", store: "Coop 365", price: 15, before: 20, quantity: "2 x 125 g" },
  { title: "Torskefilet, frost", store: "Lidl", price: 39, before: 49, quantity: "400 g" },
  { title: "Tun i vand", store: "Netto", price: 25, before: 33, quantity: "3 x 185 g" },
  { title: "Tofu naturel", store: "Meny", price: 18, before: 24, quantity: "400 g" },
  { title: "Danske æg, skrabeæg", store: "Rema 1000", price: 22, before: 28, quantity: "10 stk" },
  { title: "Feta salattern", store: "Netto", price: 10, before: 14, quantity: "200 g" },
  { title: "Revet ost, mozzarella", store: "Bilka", price: 15, before: 20, quantity: "200 g" },
  { title: "Skyr naturel", store: "Føtex", price: 16, before: 22, quantity: "1 kg" },
  { title: "Cremefraiche 18%", store: "Coop 365", price: 6, before: 8, quantity: "200 g" },
  { title: "Hakkede tomater", store: "Lidl", price: 12, before: 18, quantity: "4 x 400 g" },
  { title: "Kokosmælk", store: "Meny", price: 8, before: 12, quantity: "400 ml" },
  { title: "Kikærter", store: "Netto", price: 5, before: 7, quantity: "400 g" },
  { title: "Kidneybønner", store: "Netto", price: 5, before: 7, quantity: "400 g" },
  { title: "Pasta penne", store: "Rema 1000", price: 10, before: 15, quantity: "1 kg" },
  { title: "Basmati ris", store: "Bilka", price: 15, before: 22, quantity: "1 kg" },
  { title: "Nudler", store: "Lidl", price: 6, before: 10, quantity: "250 g" },
  { title: "Couscous", store: "Føtex", price: 9, before: 14, quantity: "500 g" },
  { title: "Tortilla wraps", store: "Coop 365", price: 12, before: 18, quantity: "8 stk" },
  { title: "Grøn pesto", store: "Meny", price: 13, before: 18, quantity: "190 g" },
  { title: "Kartofler", store: "Netto", price: 15, before: 20, quantity: "2 kg" },
  { title: "Løg", store: "Lidl", price: 7, before: 10, quantity: "1 kg" },
  { title: "Gulerødder", store: "Rema 1000", price: 6, before: 9, quantity: "1 kg" },
  { title: "Peberfrugt, mix", store: "Føtex", price: 12, before: 18, quantity: "3 stk" },
  { title: "Broccoli", store: "Bilka", price: 8, before: 12, quantity: "1 stk" },
  { title: "Squash", store: "Netto", price: 5, before: 8, quantity: "1 stk" },
  { title: "Spinat, frost", store: "Coop 365", price: 7, before: 10, quantity: "450 g" },
  { title: "Ærter, frost", store: "Lidl", price: 10, before: 15, quantity: "750 g" },
  { title: "Cherrytomater", store: "Meny", price: 10, before: 15, quantity: "250 g" },
  { title: "Agurk", store: "Rema 1000", price: 5, before: 8, quantity: "1 stk" },
  { title: "Citroner", store: "Bilka", price: 10, before: 15, quantity: "4 stk" },
  { title: "Hvidkål", store: "Føtex", price: 6, before: 10, quantity: "1 stk" }
];
