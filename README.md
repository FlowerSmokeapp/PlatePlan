# PlatePlan

Aftensmad ud fra det, du har derhjemme, og det, der er på tilbud i denne uge.
Live: https://flowersmokeapp.github.io/PlatePlan/

## Sådan virker appen
1. **Opret konto eller fortsæt uden.** Kontoen skal kun bruges til Premium.
2. **Premium-tilbud** vises lige efter login. Krydset oppe til højre lukker det.
3. **Fire faner:**
   - **Cook What You Have:** Kryds af, hvad du har i køleskab, fryser og skab, og hvilke redskaber du har. Så kommer de retter, du kan lave. Premium kan tage et billede af køleskabet.
   - **Offers:** Opskrifter ud fra ugens tilbud og en tilbudsavis med alle tilbud.
   - **15 min:** Retter, der tager højst 15 minutter.
   - **Account:** Konto, Premium, og allergier og ting, man ikke kan lide (Premium).

Det, man krydser af i køkkenet, gemmes ikke. Det slettes, når appen lukkes.

## Filer
| Fil | Hvad den gør |
| --- | --- |
| `app.html`, `css/app.css`, `js/app.js` | Selve appen |
| `js/backend.js` | Al kontakt med serveren (konto, Premium, tilbud, scanning) |
| `js/config.js` | **Her skriver du dine Supabase-oplysninger** |
| `data/items.js` | Alle varer, deres plads (køleskab/fryser/skab), allergener og danske tilbudsord, plus listen over redskaber |
| `data/recipes.js` | Alle opskrifter |
| `data/sample-offers.js` | Eksempeltilbud, som kun vises, indtil tilbudsdelen er sat op |
| `supabase/` | Serveren: database og to funktioner (`offers` og `scan-kitchen`) |
| `index.html` | Viser appen i en telefonramme på computer |

## Opsætning af serveren (ca. 20 minutter)
Uden opsætning kører appen i **demo-tilstand**. Så gemmes konti kun på telefonen, og tilbuddene er eksempler.

1. **Supabase:** Opret et gratis projekt på https://supabase.com.
2. **Database:** Åbn *SQL Editor* i Supabase, indsæt indholdet af `supabase/migrations/20261102000000_init.sql`, og tryk *Run*.
3. **Funktioner:** Installér Supabase CLI (https://supabase.com/docs/guides/cli), og kør i denne mappe:
   ```bash
   supabase login
   supabase link --project-ref DIT-PROJEKT-ID
   supabase functions deploy offers --no-verify-jwt
   supabase functions deploy scan-kitchen
   ```
4. **Hemmelige nøgler:**
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=din-claude-nøgle
   supabase secrets set TJEK_API_KEY=din-tjek-nøgle
   supabase secrets set SALLING_API_TOKEN=din-salling-nøgle
   ```
   - **Salling-nøglen** får du gratis på https://developer.sallinggroup.com (Anti Food Waste API). Den viser nedsatte varer med kort holdbarhed i Netto, Føtex og Bilka tæt på brugerens postnummer.
   - **Claude-nøglen** får du på https://console.anthropic.com. Den bruges kun til billedscanning. Hver bruger kan højst scanne 20 billeder i døgnet.
   - **Tjek-nøglen** får du hos Tjek (eTilbudsavis). Deres API er til licenserede partnere, så få en aftale og læs deres vilkår, før du går live. Hvis Tjeks dokumentation viser andre felter end dem, funktionen bruger, skal du kun rette `fetchTerm()` og `normalize()` i `supabase/functions/offers/index.ts`.
5. **Appen:** Skriv `SUPABASE_URL` og `SUPABASE_ANON_KEY` (under *Project Settings → API*) i `js/config.js`, og send ændringen til GitHub.
6. **Login:** I Supabase under *Authentication → URL Configuration* sætter du *Site URL* til `https://flowersmokeapp.github.io/PlatePlan/app.html`, så linket i bekræftelsesmailen virker.

## Premium
- Prøveperioden er 7 dage, kan bruges én gang pr. konto og kræver intet kort.
- Rigtig betaling er ikke bygget endnu. Næste skridt er fx Stripe, der sætter `premium_until` i tabellen `profiles`.
- Du kan selv give nogen Premium ved at rette `premium_until` i tabellen.

## Ret indhold
- **Ny opskrift:** Kopiér en blok i `data/recipes.js`. Husk `tools` (fx `["hob"]` eller `["oven|airfryer"]`). Billedet tegnes automatisk.
- **Ny vare:** Tilføj den i `data/items.js` med `place` og danske `offer`-ord, så den kan findes i tilbuddene.
- **Efter en ændring:** Hæv tallet i `CACHE = "plateplan-v3"` i `sw.js`, så installerede telefoner henter den nye version.
