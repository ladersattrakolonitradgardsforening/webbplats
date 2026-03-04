# Instruktioner – Lädersättra Koloniträdgårdsförening Webbplats

## Hur webbplatsen fungerar

Webbplatsens innehåll redigeras i **Notion** – ett gratis verktyg som fungerar som
ett vanligt ordbehandlingsprogram. När du är klar med dina ändringar klickar du
på en "Publicera"-länk så uppdateras webbplatsen automatiskt inom ett par minuter.

Du behöver **inte** kunna programmera eller installera något program.

---

## Konton och inloggningar

| Tjänst | E-post | Lösenord |
|--------|--------|----------|
| **Notion** (innehållsredigering) | ladersattra.koloni@gmail.com | *(fråga ansvarig)* |
| **Vercel** (webbhotell) | ladersattra.koloni@gmail.com | *(fråga ansvarig)* |
| **GitHub** (koddatabas) | ladersattra.koloni@gmail.com | *(fråga ansvarig)* |
| **Gmail** (e-post för formulär) | ladersattra.koloni@gmail.com | *(fråga ansvarig)* |
| **One.com** (domännamn) | *(fråga ansvarig)* | *(fråga ansvarig)* |

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

### Redigera stadgar

1. Gå till **Webbplats** > **Stadgar**
2. Redigera texten precis som ett vanligt dokument
3. Använd rubriker (## ) för varje paragraf och vanlig text för innehållet

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

1. Öppna bokmärket **"Publicera webbplatsen"** i webbläsaren
   (den URL du sparade som bokmärke — dela INTE denna URL offentligt)
2. Du bör se ett kort meddelande med `"state":"PENDING"` – det betyder att det fungerade
3. Vänta 1–2 minuter
4. Gå till **https://ladersattrakolonitradgardsforening.se** och kontrollera att ändringarna syns

> **Tips:** Spara publicera-länken som bokmärke i webbläsaren med namnet
> **"Publicera webbplatsen"** så hittar du den enkelt.

---

## Viktigt att veta

- **Ändra INTE** strukturen på databaserna (lägg inte till/ta bort kolumner)
- **Ändra INTE** "FältID" i formulärdatabasen
- Ändringar syns **inte** direkt – du måste klicka på "Publicera"-länken
- Notion sparar automatiskt – du behöver inte trycka "Spara"
- Om något går fel, kontakta den som satte upp webbplatsen

---

## Vad kan och kan inte ändras?

### Kan ändras via Notion:
- All text på alla sidor
- Kontaktuppgifter (namn, telefon, e-post, adress)
- Medlemsavgifter (priser, betalningsinformation)
- Ordningsregler
- Stadgar
- Funktionskorten på startsidan (ikon, titel, beskrivning)
- Formulärfält i medlemsansökan

### Kan INTE ändras via Notion:
- Logotypen
- Färger och design
- Navigeringsmenyn (sidlänkarna i menyn)
- Sidlayout och struktur
- Facebook-länken i sidfoten

---

## Felsökning

| Problem | Lösning |
|---------|---------|
| Ändringen syns inte på webbplatsen | Har du klickat på "Publicera"-länken? Vänta 1–2 minuter och ladda om sidan. |
| Publicera-länken ger inget svar | Kontrollera din internetanslutning och försök igen. |
| Texten ser konstig ut på webbplatsen | Kontrollera att du inte har ändrat databasstrukturen i Notion. |
| Formulär skickas inte | Kontrollera att e-postadressen i FormSubmit är korrekt (ladersattra.koloni@gmail.com). |

---

## Teknisk information (för utvecklare)

- **Webbplats**: https://ladersattrakolonitradgardsforening.se
- **GitHub-repo**: https://github.com/ladersattrakolonitradgardsforening/webbplats (publik)
- **Hosting**: Vercel (vercel.com), projekt: **webbplats**
- **Domän**: ladersattrakolonitradgardsforening.se (DNS via One.com)
- **CMS**: Notion API – innehåll hämtas vid byggtid
- **Formulär**: FormSubmit.co → ladersattra.koloni@gmail.com
- **Facebook**: https://www.facebook.com/groups/ladersattrakolonitradgardsforening/
- **Bygge**: `npm run build` kör `build.js` som genererar statisk HTML i `public/`
- **Setup**: `node setup-notion.js <API_KEY> <PAGE_ID>` skapar Notion-strukturen
- **Deploy hook**: Finns under Vercel > Settings > Git > Deploy Hooks (delas INTE i repot)
