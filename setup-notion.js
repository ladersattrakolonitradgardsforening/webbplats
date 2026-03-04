/**
 * One-time setup script to create the Notion workspace structure.
 *
 * Usage:
 *   node setup-notion.js <NOTION_API_KEY> <PARENT_PAGE_ID>
 *
 * The parent page must already exist in your Notion workspace and be shared
 * with the integration. The script creates all sub-pages and databases,
 * populates them with the current website content, and prints the
 * environment variables you need for Vercel.
 */

const { Client } = require('@notionhq/client');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node setup-notion.js <NOTION_API_KEY> <PARENT_PAGE_ID>');
  console.log('');
  console.log('Steps:');
  console.log('  1. Go to https://www.notion.so/my-integrations and create an integration');
  console.log('  2. Copy the "Internal Integration Secret" (starts with ntn_...)');
  console.log('  3. Create a blank page in Notion called "Webbplats"');
  console.log('  4. Click ··· menu > Connect to > select your integration');
  console.log('  5. Copy the page URL and extract the ID (the 32-char hex string)');
  console.log('  6. Run: node setup-notion.js ntn_your_key_here abc123def456...');
  process.exit(0);
}

const notion = new Client({ auth: args[0] });
const parentId = args[1].replace(/-/g, '');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function createPage(parentId, title, icon, children) {
  const res = await notion.pages.create({
    parent: { page_id: parentId },
    icon: icon ? { type: 'emoji', emoji: icon } : undefined,
    properties: { title: [{ text: { content: title } }] },
    children: children.slice(0, 100),
  });
  if (children.length > 100) {
    for (let i = 100; i < children.length; i += 100) {
      await delay(400);
      await notion.blocks.children.append({
        block_id: res.id,
        children: children.slice(i, i + 100),
      });
    }
  }
  return res.id;
}

function heading1(text) {
  return { object: 'block', type: 'heading_1', heading_1: { rich_text: [{ text: { content: text } }] } };
}
function heading2(text) {
  return { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: text } }] } };
}
function paragraph(text, annotations) {
  if (typeof text === 'string') {
    return { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: text }, annotations }] } };
  }
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: text } };
}
function richParagraph(parts) {
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: parts } };
}
function txt(content, annotations) {
  return { type: 'text', text: { content }, annotations };
}
function bullet(text) {
  return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ text: { content: text } }] } };
}
function divider() {
  return { object: 'block', type: 'divider', divider: {} };
}

async function createDatabase(parentId, title, icon, properties) {
  const res = await notion.databases.create({
    parent: { page_id: parentId },
    title: [{ text: { content: title } }],
    icon: icon ? { type: 'emoji', emoji: icon } : undefined,
    properties,
  });
  return res.id;
}

async function addRow(databaseId, properties) {
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
  });
}

function titleProp(value) {
  return { title: [{ text: { content: value } }] };
}
function richTextProp(value) {
  return { rich_text: [{ text: { content: value } }] };
}
function numberProp(value) {
  return { number: value };
}
function checkboxProp(value) {
  return { checkbox: value };
}
function selectProp(value) {
  return { select: { name: value } };
}

async function run() {
  console.log('Setting up Notion workspace...\n');

  // 1. Startsida page
  console.log('Creating Startsida page...');
  const startsidaId = await createPage(parentId, 'Startsida', '🏡', [
    heading1('Välkommen till Lädersättra Koloniträdgårdsförening'),
    paragraph('En grönskande oas i Järfälla kommun där vi odlar gemenskap, grönsaker och blommor sedan 1978.'),
    divider(),
    heading2('Om föreningen'),
    paragraph('Lädersättra Koloniträdgårdsförening ligger vackert belägen vid Kallhällsleden/Lädersättavägen i Järfälla kommun. Föreningen är en av nio koloniträdgårdsföreningar i kommunen och erbjuder en plats för odling, avkoppling och social gemenskap.'),
    paragraph('Området består av odlingslotter som är 100 kvadratmeter stora. På sin lott kan medlemmarna odla blommor och grönsaker, ha en liten uteplats, en låsbar redskapslåda samt mindre odlingsstrukturer som pallkragar eller låga växthus.'),
    paragraph('Föreningen bildades i slutet av 1970-talet och har sedan dess vuxit till en uppskattad del av Järfällas friluftsliv. Vi värnar om ekologiska odlingsprinciper och strävar efter att bevara den biologiska mångfalden i området.'),
    paragraph('Det sociala umgänget är viktigt för oss. Föreningen anordnar bland annat gemensamma arbetsdagar vår och höst, växtbytardagar och andra aktiviteter som stärker gemenskapen bland våra medlemmar.'),
    richParagraph([
      txt('Föreningen är medlem i '),
      txt('Koloniträdgårdsförbundet', { bold: true }),
      txt(', en rikstäckande organisation som verkar för koloniträdgårdsrörelsens intressen.'),
    ]),
  ]);
  await delay(400);

  // 2. Funktioner database
  console.log('Creating Funktioner database...');
  const funktionerId = await createDatabase(parentId, 'Funktioner', '✨', {
    Titel: { title: {} },
    Ikon: { rich_text: {} },
    Beskrivning: { rich_text: {} },
    Ordning: { number: {} },
  });
  await delay(400);

  const featureCards = [
    { icon: '🌱', title: 'Ekologisk odling', desc: 'Vi odlar utan kemiska bekämpningsmedel och använder naturgödsel för en hållbar trädgård.', order: 1 },
    { icon: '🤝', title: 'Gemenskap', desc: 'Vi arrangerar arbetsdagar, växtbytardagar och sociala aktiviteter för alla medlemmar.', order: 2 },
    { icon: '🌻', title: '100 kvm odlingslott', desc: 'Varje medlem har en egen lott med plats för blommor, grönsaker, uteplats och redskapslåda.', order: 3 },
  ];
  for (const f of featureCards) {
    await addRow(funktionerId, {
      Titel: titleProp(f.title),
      Ikon: richTextProp(f.icon),
      Beskrivning: richTextProp(f.desc),
      Ordning: numberProp(f.order),
    });
    await delay(400);
  }

  // 3. Kontakt database
  console.log('Creating Kontakt database...');
  const kontaktId = await createDatabase(parentId, 'Kontakt', '📞', {
    Fält: { title: {} },
    Värde: { rich_text: {} },
  });
  await delay(400);

  const contactRows = [
    { field: 'Namn', value: 'Ulla Andersson' },
    { field: 'Telefon', value: '073-700 37 99' },
    { field: 'E-post', value: 'ladersattra.koloni@gmail.com' },
    { field: 'Adress', value: 'Kallhällsleden/Lädersättavägen, Järfälla' },
  ];
  for (const c of contactRows) {
    await addRow(kontaktId, {
      Fält: titleProp(c.field),
      Värde: richTextProp(c.value),
    });
    await delay(400);
  }

  // 4. Medlemsavgifter page
  console.log('Creating Medlemsavgifter page...');
  const avgifterId = await createPage(parentId, 'Medlemsavgifter', '💰', [
    heading1('Medlemsavgifter'),
    paragraph('Aktuella avgifter för säsongen 2026', { italic: true }),
    paragraph('Medlemsavgiften betalas årsvis i förskott och avser kalenderåret. Varje medlem tilldelas en odlingslott om 100 kvm. Det är inte möjligt att inneha mer än en lott.'),
    heading2('Årsavgift'),
    richParagraph([txt('Årsavgift (en odlingslott om 100 kvm): '), txt('600 kr / år', { bold: true })]),
    heading2('Vad ingår i avgiften?'),
    bullet('Nyttjanderätt till en odlingslott om 100 kvm under hela säsongen'),
    bullet('Tillgång till gemensamma ytor och redskap'),
    bullet('Bevattning med kommunalt vatten under odlingssäsongen'),
    bullet('Medlemskap i Koloniträdgårdsförbundet'),
    bullet('Deltagande i föreningens aktiviteter och evenemang'),
    bullet('Tillgång till föreningens gemensamma kompost'),
    heading2('Betalning'),
    paragraph('Betalning sker via bankgiro eller Swish. Betalningsuppgifter skickas ut via e-post i samband med fakturering i januari varje år.'),
  ]);
  await delay(400);

  // 5. Ordningsregler page
  console.log('Creating Ordningsregler page...');
  const reglerId = await createPage(parentId, 'Ordningsregler', '📋', [
    heading1('Ordningsregler'),
    paragraph('Regler och riktlinjer för ett trivsamt koloniområde', { italic: true }),
    paragraph('För att alla ska trivas och kunna njuta av sin tid i koloniträdgården har föreningen antagit följande ordningsregler. Genom att respektera dessa regler bidrar vi alla till en trevlig och välskött miljö.'),
    heading2('Odling och skötsel'),
    bullet('Lotten ska odlas och hållas i ordnat skick under hela säsongen (1 april – 30 september).'),
    bullet('Enbart ekologiska odlingsmetoder får användas. Kemiska bekämpningsmedel och konstgödsel är förbjudna.'),
    bullet('Naturgödsel och KRAV-godkänt gödsel ska användas.'),
    bullet('Kompostering ska ske på den egna odlingslotten i godkänd kompostbehållare.'),
    bullet('Ogräs ska hållas efter, särskilt mot gångar och grannlotter.'),
    bullet('Höga växter och spaljéer ska placeras så att de inte skuggar grannens lott.'),
    heading2('Byggnader och konstruktioner'),
    bullet('Varje lott får ha en låsbar redskapslåda (max 120 × 60 × 70 cm).'),
    bullet('Pallkragar för odling är tillåtna (max höjd 60 cm).'),
    bullet('Mindre växthus eller odlingstunnlar är tillåtna efter godkännande av styrelsen.'),
    bullet('Inga permanenta byggnader får uppföras utan styrelsens skriftliga medgivande.'),
    bullet('Alla konstruktioner ska vara i diskreta och naturnära färger.'),
    heading2('Gemensamma ytor'),
    bullet('Gångar och gemensamma ytor ska hållas fria från redskap och personliga tillhörigheter.'),
    bullet('Gemensamma redskap ska återställas efter användning.'),
    bullet('Vattenslang ska rullas upp efter bevattning.'),
    bullet('Grillplatsen ska städas efter varje användning.'),
    heading2('Arbetsdagar'),
    bullet('Alla medlemmar är skyldiga att delta i minst en arbetsdag per säsong (vår och höst).'),
    bullet('Vid frånvaro ska detta meddelas styrelsen i förväg.'),
    bullet('Medlemmar som inte deltar kan bli skyldiga att betala en ersättningsavgift om 300 kr per missad arbetsdag.'),
    heading2('Användarrätt och överlåtelse'),
    bullet('Lotten får enbart användas för koloniträdgårdsändamål.'),
    bullet('Medlemmen måste vara folkbokförd i Järfälla kommun eller i Stor-Stockholmsområdet.'),
    bullet('Nyttjanderätten får inte överlåtas till annan person utan föreningens skriftliga medgivande.'),
    bullet('Lotten får användas aktivt under perioden 1 april – 30 september. Under perioden 1 oktober – 31 mars är tillträde tillåtet vid helger och veckoslut.'),
    heading2('Trivsel och hänsyn'),
    bullet('Visa hänsyn till dina koloniträdgårdsgrannar.'),
    bullet('Husdjur ska hållas kopplade inom koloniområdet.'),
    bullet('Rökning är inte tillåtet i närheten av andras odlingslotter.'),
    bullet('Musik och buller ska hållas på en låg nivå.'),
    bullet('Avfall och sopor ska tas med hem – det finns inga sopkärl i området.'),
    heading2('Brott mot reglerna'),
    paragraph('Medlem som upprepat bryter mot ordningsreglerna kan, efter skriftlig varning, förlora sin nyttjanderätt till lotten. Beslut om uppsägning fattas av styrelsen.'),
  ]);
  await delay(400);

  // 6. Stadgar page
  console.log('Creating Stadgar page...');
  const stadgarId = await createPage(parentId, 'Stadgar', '📜', [
    heading1('Stadgar'),
    paragraph('Föreningens stadgar antagna vid årsmötet', { italic: true }),
    heading2('§ 1 Föreningens namn och säte'),
    paragraph('Föreningens namn är Lädersättra Koloniträdgårdsförening. Föreningen har sitt säte i Järfälla kommun, Stockholms län.'),
    heading2('§ 2 Ändamål'),
    paragraph('Föreningen har till ändamål att främja odling och trädgårdskultur bland sina medlemmar samt att verka för en god gemenskap och trivsel inom koloniområdet.'),
    heading2('§ 3 Medlemskap'),
    paragraph('Medlem i föreningen kan den bli som är folkbokförd i Järfälla kommun eller i Stor-Stockholmsområdet och som förbinder sig att följa föreningens stadgar och ordningsregler. Ansökan om medlemskap görs skriftligen till styrelsen.'),
    heading2('§ 4 Avgifter'),
    paragraph('Medlem ska betala den årsavgift som fastställs av årsmötet. Årsavgiften ska betalas senast det datum som styrelsen bestämmer. Medlem som inte betalat avgiften inom föreskriven tid kan uteslutas ur föreningen.'),
    heading2('§ 5 Styrelse'),
    paragraph('Föreningens angelägenheter handhas av en styrelse bestående av ordförande, sekreterare, kassör samt minst två övriga ledamöter. Styrelsen väljs av årsmötet för en mandatperiod om ett år.'),
    heading2('§ 6 Årsmöte'),
    paragraph('Årsmötet är föreningens högsta beslutande organ. Ordinarie årsmöte hålls årligen före mars månads utgång. Kallelse till årsmöte ska ske skriftligen minst två veckor före mötet.'),
    heading2('§ 7 Stadgeändring'),
    paragraph('Ändring av dessa stadgar kräver beslut vid två på varandra följande föreningsmöten, varav ett ska vara ordinarie årsmöte. Minst två tredjedelar av de närvarande röstberättigade medlemmarna måste rösta för ändringen vid båda tillfällena.'),
    heading2('§ 8 Upplösning'),
    paragraph('Beslut om föreningens upplösning fattas på samma sätt som stadgeändring. Vid upplösning ska föreningens tillgångar tillfalla ändamål som överensstämmer med föreningens syfte, enligt beslut av det sista årsmötet.'),
  ]);
  await delay(400);

  // 7. Formulär database
  console.log('Creating Formulär database...');
  const formularId = await createDatabase(parentId, 'Formulär', '📝', {
    Fältnamn: { title: {} },
    FältID: { rich_text: {} },
    Typ: { select: { options: [
      { name: 'text' }, { name: 'email' }, { name: 'tel' },
      { name: 'textarea' }, { name: 'select' },
    ]}},
    Obligatorisk: { checkbox: {} },
    Platshållartext: { rich_text: {} },
    Alternativ: { rich_text: {} },
    Bredd: { select: { options: [{ name: 'hel' }, { name: 'halv' }] } },
    Ordning: { number: {} },
  });
  await delay(400);

  const formFields = [
    { name: 'Fullständigt namn', id: 'namn', type: 'text', req: true, ph: 'Förnamn Efternamn', alt: '', width: 'hel', order: 1 },
    { name: 'E-postadress', id: 'epost', type: 'email', req: true, ph: 'din@epost.se', alt: '', width: 'halv', order: 2 },
    { name: 'Telefonnummer', id: 'telefon', type: 'tel', req: true, ph: '07X-XXX XX XX', alt: '', width: 'halv', order: 3 },
    { name: 'Gatuadress', id: 'adress', type: 'text', req: true, ph: 'Gatuadress', alt: '', width: 'hel', order: 4 },
    { name: 'Postnummer', id: 'postnummer', type: 'text', req: true, ph: 'XXX XX', alt: '', width: 'halv', order: 5 },
    { name: 'Ort', id: 'ort', type: 'text', req: true, ph: 'Ort', alt: '', width: 'halv', order: 6 },
    { name: 'Odlingserfarenhet', id: 'erfarenhet', type: 'select', req: false, ph: '', alt: 'Nybörjare – har inte odlat förut, Viss erfarenhet – har odlat i kruka eller balkong, Erfaren – har odlat i trädgård eller koloni', width: 'hel', order: 7 },
    { name: 'Meddelande', id: 'meddelande', type: 'textarea', req: false, ph: 'Berätta gärna varför du vill bli medlem eller om du har några frågor...', alt: '', width: 'hel', order: 8 },
  ];
  for (const f of formFields) {
    await addRow(formularId, {
      Fältnamn: titleProp(f.name),
      FältID: richTextProp(f.id),
      Typ: selectProp(f.type),
      Obligatorisk: checkboxProp(f.req),
      Platshållartext: richTextProp(f.ph),
      Alternativ: richTextProp(f.alt),
      Bredd: selectProp(f.width),
      Ordning: numberProp(f.order),
    });
    await delay(400);
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log('  Notion workspace created successfully!');
  console.log('══════════════════════════════════════════════════');
  console.log('');
  console.log('Add these environment variables to Vercel:');
  console.log('');
  console.log(`  NOTION_API_KEY=${args[0]}`);
  console.log(`  NOTION_STARTSIDA_ID=${startsidaId}`);
  console.log(`  NOTION_FUNKTIONER_ID=${funktionerId}`);
  console.log(`  NOTION_KONTAKT_ID=${kontaktId}`);
  console.log(`  NOTION_AVGIFTER_ID=${avgifterId}`);
  console.log(`  NOTION_REGLER_ID=${reglerId}`);
  console.log(`  NOTION_STADGAR_ID=${stadgarId}`);
  console.log(`  NOTION_FORMULAR_ID=${formularId}`);
  console.log('');
  console.log('In Vercel: Project Settings > Environment Variables');
  console.log('');
  console.log('You can now edit content in Notion and redeploy!');
}

run().catch(err => {
  console.error('Setup failed:', err.message || err);
  process.exit(1);
});
