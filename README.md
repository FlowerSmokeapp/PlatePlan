# PlatePlan

Ugens aftensmad og indkøbsliste på et lille budget, til unge og studerende.
Live: https://flowersmokeapp.github.io/PlatePlan/

Appen er ren HTML, CSS og JavaScript uden server. Alt gemmes i brugerens egen browser (localStorage).

## Filer

| Fil | Hvad den gør |
| --- | --- |
| `index.html` | Viser appen i en telefonramme på computer og sender mobiler direkte til appen |
| `app.html` | Selve appen (skelet) |
| `css/app.css` | Udseende |
| `js/app.js` | Logik: ugeplan, budget, indkøbsliste, onboarding, Premium-side |
| `js/illustrations.js` | Tegner billedet af hver ret ud fra ingredienserne |
| `js/config.js` | GoatCounter-måling og venteliste-adresse (begge slået fra, til du udfylder dem) |
| `data/prices.js` | **Alle priser** og pakkestørrelser, med dato for opdatering |
| `data/recipes.js` | **Alle opskrifter** |
| `sw.js`, `manifest.webmanifest`, `icons/` | Gør appen installerbar og brugbar offline |

## Ret en pris
Åbn `data/prices.js`, ret `price` (kr. pr. pakke) eller `pack` (pakkestørrelse), og ret `PRICES_UPDATED` til dagens dato.

## Tilføj en opskrift
Åbn `data/recipes.js`, kopiér en hel `{ ... }`-blok, og ret felterne. Alle ingredienser skal findes i `data/prices.js`.
Vegetar, hurtig og high protein sættes automatisk, og billedet tegnes automatisk ud fra `dish` og ingredienserne.

## Efter en ændring
Hæv tallet i `CACHE = "plateplan-v2"` i `sw.js` (fx til `v3`), så telefoner, der har appen installeret, henter den nye version.

## Slå måling og venteliste til
Se kommentarerne i `js/config.js`.
