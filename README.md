# PlatePlan

Aftensmad ud fra det, du har derhjemme, og det, der er på tilbud i denne uge.
Live: https://dani-gh1.github.io/PlatePlan/

## Sådan virker appen
1. **Opret konto eller fortsæt uden.** Kontoen skal kun bruges til Premium.
2. **Premium-tilbud** vises lige efter login. Krydset oppe til højre lukker det.
3. **Fire faner:**
   - **Cook What You Have:** Kryds af, hvad du har i køleskab, fryser og skab, og hvilke redskaber du har. Så kommer de retter, du kan lave. Premium kan tage et billede af køleskabet.
   - **Offers:** Nedsatte varer fra Netto, Føtex og Bilka tæt på dit postnummer, opskrifter ud fra tilbuddene og en tilbudsavis.
   - **15 min:** Retter, der tager højst 15 minutter.
   - **Account:** Konto, Premium, og allergier og ting, man ikke kan lide (Premium).

Det, man krydser af i køkkenet, og postnummeret gemmes ikke. Det slettes, når appen lukkes.

## Filer
| Fil | Hvad den gør |
| --- | --- |
| `app.html`, `css/app.css`, `js/app.js` | Selve appen |
| `js/backend.js` | Al kontakt med serveren (Firebase: login, database og funktioner) |
| `js/config.js` | **Her skriver du dine Firebase-oplysninger** |
| `data/items.js` | Alle varer, deres plads, allergener og danske tilbudsord, plus listen over redskaber |
| `data/recipes.js` | Alle opskrifter |
| `data/sample-offers.js` | Eksempeltilbud, som kun vises, indtil der er rigtige tilbud |
| `functions/index.js` | Server-funktionerne: `offers`, `scanKitchen`, `startTrial`, `deleteAccount` |
| `firestore.rules` | Sikkerhedsregler: hver bruger kan kun læse sin egen profil og aldrig give sig selv Premium |
| `firebase.json`, `.firebaserc` | Firebase-opsætning |
| `index.html` | Viser appen i en telefonramme på computer |

## Opsætning
Den fulde trin-for-trin-guide ligger i dokumentet "PlatePlan – opsætningsguide". Kort fortalt:

1. Opret et Firebase-projekt på https://console.firebase.google.com, og skift til **Blaze**-planen.
2. Slå **Authentication → Email/Password** til, opret **Firestore** i `eur3`, og tilføj `dani-gh1.github.io` under **Authentication → Settings → Authorized domains**.
3. Installér Firebase CLI, og kør i denne mappe:
   ```bash
   firebase login
   firebase use --add
   cd functions && npm install && cd ..
   firebase deploy --only firestore,functions
   ```
   Firebase spørger efter de hemmelige nøgler. Skriv `none` for dem, du ikke har endnu.
4. Kopiér web-appens config ind i `js/config.js`, og send ændringen til GitHub.

Uden opsætning kører appen i **demo-tilstand**. Så gemmes konti kun på telefonen, og tilbuddene er eksempler.

## Hemmelige nøgler
Sæt eller skift en nøgle med `firebase functions:secrets:set NAVN`, og kør derefter `firebase deploy --only functions`.

| Navn | Hvor du får den | Bruges til |
| --- | --- | --- |
| `SALLING_API_TOKEN` | https://developer.sallinggroup.com (Anti Food Waste) | Nedsatte varer nær postnummer |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com | Billedscanning (Premium), højst 20 pr. bruger pr. døgn |
| `TJEK_API_KEY` | Tjek (eTilbudsavis), kun efter aftale | Ugens tilbudsavis |

## Premium
- Prøveperioden er 7 dage, kan bruges én gang pr. konto og kræver intet kort.
- Rigtig betaling er ikke bygget endnu. Næste skridt er fx Stripe.
- Du kan selv give nogen Premium: I Firestore åbner du `profiles` → brugerens dokument og sætter `premium_until` til en dato (type *timestamp*).

## Test lokalt
```bash
firebase emulators:start --project demo-plateplan
```
Lav filen `functions/.secret.local` med `ANTHROPIC_API_KEY=none`, `SALLING_API_TOKEN=none` og `TJEK_API_KEY=none` (en pr. linje). Filen sendes ikke til GitHub.

## Ret indhold
- **Ny opskrift:** Kopiér en blok i `data/recipes.js`. Husk `tools` (fx `["hob"]` eller `["oven|airfryer"]`). Billedet tegnes automatisk.
- **Ny vare:** Tilføj den i `data/items.js` med `place` og danske `offer`-ord, så den kan findes i tilbuddene.
- **Efter en ændring:** Hæv tallet i `CACHE = "plateplan-v6"` i `sw.js`, så installerede telefoner henter den nye version.
