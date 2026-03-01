# Instruktioner – Lädersättra Koloniträdgårdsförening Webbplats

## Hur webbplatsen fungerar

Webbplatsens innehåll redigeras i **Notion** – ett gratis verktyg som fungerar som
ett vanligt ordbehandlingsprogram. När du är klar med dina ändringar klickar du
på en "Publicera"-länk så uppdateras webbplatsen automatiskt inom ett par minuter.

Du behöver **inte** kunna programmera eller installera något program.

---

## Steg 1: Skapa ett Notion-konto (engångssteg)

1. Gå till **https://www.notion.so** och klicka "Sign up"
2. Registrera dig med **ladersattra.koloni@gmail.com** (eller annat gemensamt konto)
3. Välj "For personal use" (gratis)

---

## Steg 2: Skapa en Notion-integration (engångssteg)

1. Gå till **https://www.notion.so/my-integrations**
2. Klicka **"New integration"**
3. Ge den namnet **"Webbplats"**
4. Välj rätt workspace
5. Klicka **"Submit"**
6. Kopiera **"Internal Integration Secret"** (en lång text som börjar med `ntn_`)
   – spara den, du behöver den snart

---

## Steg 3: Skapa en sida i Notion (engångssteg)

1. I Notion, skapa en ny sida och kalla den **"Webbplats"**
2. Klicka på **···** menyn (tre prickar) uppe till höger
3. Klicka **"Connect to"** och välj integrationen **"Webbplats"**

---

## Steg 4: Kör installationsskriptet (engångssteg)

Denna steg kräver att någon med dator kör ett kommando en gång:

1. Öppna terminalen/kommandotolken
2. Gå till projektmappen:
   ```
   cd "c:\Users\jonka\Nya filer\Ladersattra-kolonitradgardsforening"
   ```
3. Kopiera sidans ID från sidans URL i Notion. Om adressen ser ut så här:
   `https://www.notion.so/Webbplats-abc123def456...`
   så är ID:t den långa texten efter sista bindestrecket (32 tecken).
4. Kör:
   ```
   node setup-notion.js DIN_API_NYCKEL DIN_SID_ID
   ```
5. Skriptet skapar allt innehåll i Notion och skriver ut miljövariabler.
   Kopiera alla rader som börjar med `NOTION_`.

---

## Steg 5: Lägg till miljövariabler i Vercel (engångssteg)

1. Gå till **https://vercel.com** och logga in med **ladersattra.koloni@gmail.com**
2. Klicka på projektet **ladersattra-kolonitradgardsforening**
3. Gå till **Settings** > **Environment Variables**
4. Lägg till varje variabel från steg 4:
   - `NOTION_API_KEY` = din API-nyckel
   - `NOTION_STARTSIDA_ID` = ...
   - `NOTION_FUNKTIONER_ID` = ...
   - `NOTION_KONTAKT_ID` = ...
   - `NOTION_AVGIFTER_ID` = ...
   - `NOTION_REGLER_ID` = ...
   - `NOTION_FORMULAR_ID` = ...
5. Se till att alla variabler är markerade för **Production**

---

## Steg 6: Skapa en "Publicera"-knapp (engångssteg)

1. I Vercel, gå till **Settings** > **Git** > **Deploy Hooks**
2. Skapa en ny hook:
   - Namn: **Publicera**
   - Branch: **main** (eller lämna tomt)
3. Kopiera URL:en som skapas (ser ut som `https://api.vercel.com/v1/integrations/deploy/...`)
4. Spara denna URL som ett bokmärke i webbläsaren med namnet **"Publicera webbplatsen"**

---

## Hur du redigerar webbplatsen (daglig användning)

### Redigera startsidan

1. Öppna **Notion** och gå till **Webbplats** > **Startsida**
2. Sidan ser ut så här:
   ```
   # Välkommen till Lädersättra Koloniträdgårdsförening
   En grönskande oas i Järfälla kommun...
   ───────────────────
   ## Om föreningen
   Text om föreningen...
   ```
3. Rubriken (# ...) är den stora titeln på webbplatsen
4. Första stycket under rubriken är undertexten
5. Linjen (───) separerar titeln från resten
6. Allt under linjen visas i "Om föreningen"-sektionen
7. Ändra texten precis som i ett vanligt dokument

### Redigera funktionskorten (Ekologisk odling, Gemenskap, etc.)

1. Gå till **Webbplats** > **Funktioner**
2. Det är en tabell med kolumnerna: **Ikon**, **Titel**, **Beskrivning**, **Ordning**
3. Ändra texten i valfri rad
4. **Ikon** – en emoji (t.ex. 🌱, 🤝, 🌻)
5. **Ordning** – nummer som bestämmer vilken ordning korten visas (1, 2, 3...)

### Redigera kontaktuppgifter

1. Gå till **Webbplats** > **Kontakt**
2. Det är en tabell med **Fält** och **Värde**
3. Ändra värdet för Namn, Telefon, E-post eller Adress

### Redigera medlemsavgifter

1. Gå till **Webbplats** > **Medlemsavgifter**
2. Redigera texten precis som ett vanligt dokument
3. Använd rubriker (## ), punktlistor (- ) och fet text (**text**)

### Redigera ordningsregler

1. Gå till **Webbplats** > **Ordningsregler**
2. Redigera texten precis som ett vanligt dokument
3. Alla rubriker och punktlistor översätts automatiskt till webbplatsen

### Redigera formulärfält (medlemsansökan)

1. Gå till **Webbplats** > **Formulär**
2. Det är en tabell med kolumnerna:
   - **Fältnamn** – vad som visas som etikett
   - **FältID** – tekniskt ID (ändra INTE detta)
   - **Typ** – text, email, tel, textarea, select
   - **Obligatorisk** – kryssruta om fältet måste fyllas i
   - **Platshållartext** – grå hjälptext i fältet
   - **Alternativ** – för select-fält, kommaseparerade val
   - **Bredd** – "hel" (full bredd) eller "halv" (halv bredd)
   - **Ordning** – nummer som bestämmer ordningen

---

## Publicera ändringar

När du har gjort dina ändringar i Notion:

1. Öppna denna länk i webbläsaren (spara den gärna som bokmärke!):
   **https://api.vercel.com/v1/integrations/deploy/prj_vxH3gVHXD57YUHtulwcMdT9l5Lwb/dXmibDty8v**
2. Du bör se ett kort meddelande med `"state":"PENDING"` – det betyder att det fungerade
3. Vänta 1–2 minuter
3. Gå till **https://ladersattrakolonitradgardsforening.se** och kontrollera att ändringarna syns

---

## Viktigt att veta

- **Ändra INTE** strukturen på databaserna (lägg inte till/ta bort kolumner)
- **Ändra INTE** "FältID" i formulärdatabasen
- Ändringar syns **inte** direkt – du måste klicka på "Publicera"-länken
- Om något går fel, kontakta den som satte upp webbplatsen
- Inloggning till Vercel: **ladersattra.koloni@gmail.com**

---

## Teknisk information (för utvecklare)

- Webbplatsen hostas på **Vercel** (vercel.com)
- Domän: **ladersattrakolonitradgardsforening.se** (DNS via One.com)
- Innehåll hämtas från **Notion API** vid byggtid
- Formulär skickas via **FormSubmit.co** till ladersattra.koloni@gmail.com
- Facebook-grupp: https://www.facebook.com/groups/ladersattrakolonitradgardsforening/
- Bygge: `npm run build` kör `build.js` som genererar statisk HTML i `public/`
- Setup: `node setup-notion.js <API_KEY> <PAGE_ID>` skapar Notion-strukturen
