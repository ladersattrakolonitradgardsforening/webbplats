const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const IDS = {
  startsida: process.env.NOTION_STARTSIDA_ID,
  funktioner: process.env.NOTION_FUNKTIONER_ID,
  kontakt: process.env.NOTION_KONTAKT_ID,
  avgifter: process.env.NOTION_AVGIFTER_ID,
  regler: process.env.NOTION_REGLER_ID,
  formular: process.env.NOTION_FORMULAR_ID,
};

const PUBLIC = path.join(__dirname, 'public');
const TEMPLATES = path.join(__dirname, 'templates');

// ─── Notion helpers ───

async function getAllBlocks(pageId) {
  const blocks = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

async function queryDatabase(databaseId) {
  const pages = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

function prop(page, name) {
  const p = page.properties[name];
  if (!p) return '';
  switch (p.type) {
    case 'title': return p.title.map(t => t.plain_text).join('');
    case 'rich_text': return p.rich_text.map(t => t.plain_text).join('');
    case 'number': return p.number ?? 0;
    case 'checkbox': return p.checkbox;
    case 'select': return p.select?.name || '';
    default: return '';
  }
}

// ─── Notion blocks → HTML ───

function richTextToHtml(parts) {
  if (!parts || !parts.length) return '';
  return parts.map(rt => {
    let t = rt.plain_text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    if (rt.annotations.bold) t = `<strong>${t}</strong>`;
    if (rt.annotations.italic) t = `<em>${t}</em>`;
    if (rt.annotations.underline) t = `<u>${t}</u>`;
    if (rt.annotations.strikethrough) t = `<s>${t}</s>`;
    if (rt.annotations.code) t = `<code>${t}</code>`;
    if (rt.href) t = `<a href="${rt.href}">${t}</a>`;
    return t;
  }).join('');
}

function blocksToHtml(blocks) {
  let html = '';
  let listTag = null;

  for (const block of blocks) {
    const type = block.type;

    if (listTag && type !== 'bulleted_list_item' && type !== 'numbered_list_item') {
      html += `</${listTag}>\n`;
      listTag = null;
    }

    switch (type) {
      case 'paragraph': {
        const text = richTextToHtml(block.paragraph.rich_text);
        if (text) html += `    <p>${text}</p>\n`;
        break;
      }
      case 'heading_1':
        html += `    <h1>${richTextToHtml(block.heading_1.rich_text)}</h1>\n`;
        break;
      case 'heading_2':
        html += `    <h2>${richTextToHtml(block.heading_2.rich_text)}</h2>\n`;
        break;
      case 'heading_3':
        html += `    <h3>${richTextToHtml(block.heading_3.rich_text)}</h3>\n`;
        break;
      case 'bulleted_list_item':
        if (listTag !== 'ul') {
          if (listTag) html += `</${listTag}>\n`;
          html += '    <ul>\n';
          listTag = 'ul';
        }
        html += `      <li>${richTextToHtml(block.bulleted_list_item.rich_text)}</li>\n`;
        break;
      case 'numbered_list_item':
        if (listTag !== 'ol') {
          if (listTag) html += `</${listTag}>\n`;
          html += '    <ol>\n';
          listTag = 'ol';
        }
        html += `      <li>${richTextToHtml(block.numbered_list_item.rich_text)}</li>\n`;
        break;
      case 'divider':
        html += '    <hr>\n';
        break;
      case 'table': {
        html += '    <table class="info-table">\n';
        break;
      }
      default:
        break;
    }
  }

  if (listTag) html += `    </${listTag}>\n`;
  return html;
}

// ─── Content fetchers ───

async function fetchStartsida() {
  console.log('  Fetching Startsida...');
  const blocks = await getAllBlocks(IDS.startsida);

  const divIdx = blocks.findIndex(b => b.type === 'divider');
  const heroBlocks = divIdx >= 0 ? blocks.slice(0, divIdx) : [];
  const aboutBlocks = divIdx >= 0 ? blocks.slice(divIdx + 1) : blocks;

  let heroTitle = '';
  let heroSubtitle = '';

  for (const b of heroBlocks) {
    if (b.type === 'heading_1' && !heroTitle) {
      heroTitle = richTextToHtml(b.heading_1.rich_text);
    } else if (b.type === 'paragraph' && !heroSubtitle) {
      heroSubtitle = richTextToHtml(b.paragraph.rich_text);
    }
  }

  return { heroTitle, heroSubtitle, aboutHtml: blocksToHtml(aboutBlocks) };
}

async function fetchFunktioner() {
  console.log('  Fetching Funktioner...');
  const rows = await queryDatabase(IDS.funktioner);

  rows.sort((a, b) => (prop(a, 'Ordning') || 0) - (prop(b, 'Ordning') || 0));

  return rows.map(row => {
    const icon = prop(row, 'Ikon');
    const title = prop(row, 'Titel');
    const desc = prop(row, 'Beskrivning');
    return `    <div class="feature-card">
      <div class="icon">${icon}</div>
      <h3>${title}</h3>
      <p>${desc}</p>
    </div>`;
  }).join('\n');
}

async function fetchKontakt() {
  console.log('  Fetching Kontakt...');
  const rows = await queryDatabase(IDS.kontakt);

  const contact = {};
  for (const row of rows) {
    const field = prop(row, 'Fält');
    const value = prop(row, 'Värde');
    contact[field.toLowerCase()] = value;
  }

  const phone = contact['telefon'] || '';
  const phoneLink = '+46' + phone.replace(/[^0-9]/g, '').replace(/^0/, '');

  return {
    name: contact['namn'] || '',
    phone,
    phoneLink,
    email: contact['e-post'] || contact['epost'] || '',
    address: contact['adress'] || '',
  };
}

async function fetchPageContent(pageId, label) {
  console.log(`  Fetching ${label}...`);
  const blocks = await getAllBlocks(pageId);
  return blocksToHtml(blocks);
}

async function fetchFormular() {
  console.log('  Fetching Formulär...');
  const rows = await queryDatabase(IDS.formular);

  rows.sort((a, b) => (prop(a, 'Ordning') || 0) - (prop(b, 'Ordning') || 0));

  let html = '';
  let halfBuffer = [];

  function flushHalf() {
    if (halfBuffer.length === 0) return;
    if (halfBuffer.length >= 2) {
      html += '        <div class="form-row">\n';
      html += halfBuffer.join('\n') + '\n';
      html += '        </div>\n';
    } else {
      html += halfBuffer.join('\n') + '\n';
    }
    halfBuffer = [];
  }

  for (const row of rows) {
    const label = prop(row, 'Fältnamn');
    const id = prop(row, 'FältID');
    const type = prop(row, 'Typ');
    const required = prop(row, 'Obligatorisk');
    const placeholder = prop(row, 'Platshållartext');
    const options = prop(row, 'Alternativ');
    const width = prop(row, 'Bredd');

    const reqAttr = required ? ' required' : '';
    const reqStar = required ? ' *' : '';
    let fieldHtml = '';

    if (type === 'textarea') {
      fieldHtml = `          <div class="form-group">
            <label for="${id}">${label}${reqStar}</label>
            <textarea id="${id}" name="${id}"${reqAttr} placeholder="${placeholder}"></textarea>
          </div>`;
    } else if (type === 'select') {
      const opts = options.split(',').map(o => o.trim()).filter(Boolean);
      const optHtml = opts.map(o => `              <option value="${o}">${o}</option>`).join('\n');
      fieldHtml = `          <div class="form-group">
            <label for="${id}">${label}${reqStar}</label>
            <select id="${id}" name="${id}"${reqAttr}>
              <option value="">Välj...</option>
${optHtml}
            </select>
          </div>`;
    } else {
      fieldHtml = `          <div class="form-group">
            <label for="${id}">${label}${reqStar}</label>
            <input type="${type || 'text'}" id="${id}" name="${id}"${reqAttr} placeholder="${placeholder}">
          </div>`;
    }

    if (width === 'halv') {
      halfBuffer.push(fieldHtml);
      if (halfBuffer.length === 2) flushHalf();
    } else {
      flushHalf();
      html += fieldHtml + '\n';
    }
  }

  flushHalf();
  return html;
}

async function fetchFormIntro() {
  console.log('  Fetching Formulär intro...');
  const blocks = await getAllBlocks(IDS.formular);
  return '';
}

// ─── Build ───

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function build() {
  const missing = Object.entries(IDS).filter(([, v]) => !v);
  if (!process.env.NOTION_API_KEY || missing.length) {
    console.log('Notion not configured – copying static fallback files...');
    if (fs.existsSync(PUBLIC)) fs.rmSync(PUBLIC, { recursive: true });
    fs.mkdirSync(PUBLIC, { recursive: true });
    fs.mkdirSync(path.join(PUBLIC, 'assets'), { recursive: true });

    const fallbackFiles = ['index.html', 'medlemsavgifter.html', 'ordningsregler.html', 'bli-medlem.html', 'tack.html'];
    for (const f of fallbackFiles) {
      const src = path.join(__dirname, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(PUBLIC, f));
    }
    fs.copyFileSync(path.join(__dirname, 'style.css'), path.join(PUBLIC, 'style.css'));
    fs.copyFileSync(path.join(__dirname, 'script.js'), path.join(PUBLIC, 'script.js'));
    copyRecursive(path.join(__dirname, 'assets'), path.join(PUBLIC, 'assets'));
    console.log('Fallback build complete. Set up Notion to enable CMS features.');
    return;
  }

  console.log('Building site from Notion content...\n');

  if (fs.existsSync(PUBLIC)) fs.rmSync(PUBLIC, { recursive: true });
  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.mkdirSync(path.join(PUBLIC, 'assets'), { recursive: true });

  // Fetch all Notion content
  const [startsida, features, contact, avgifterHtml, reglerHtml, formFields] = await Promise.all([
    fetchStartsida(),
    fetchFunktioner(),
    fetchKontakt(),
    fetchPageContent(IDS.avgifter, 'Medlemsavgifter'),
    fetchPageContent(IDS.regler, 'Ordningsregler'),
    fetchFormular(),
  ]);

  // Fetch form intro from the Formulär page body (first paragraphs before any database)
  // For simplicity, form intro comes from a dedicated "Formulär-intro" section
  // or is fetched from the page that contains the database
  // We'll pass it via the Startsida page or hardcode awareness

  console.log('\n  Processing templates...');

  // Index page
  let indexHtml = fs.readFileSync(path.join(TEMPLATES, 'index.html'), 'utf8');
  indexHtml = indexHtml
    .replace('{{hero_title}}', startsida.heroTitle)
    .replace('{{hero_subtitle}}', startsida.heroSubtitle)
    .replace('{{about_content}}', startsida.aboutHtml)
    .replace('{{features}}', features)
    .replace('{{contact_name}}', contact.name)
    .replace('{{contact_phone}}', contact.phone)
    .replace('{{contact_phone_link}}', contact.phoneLink)
    .replaceAll('{{contact_email}}', contact.email)
    .replace('{{contact_address}}', contact.address);

  // Medlemsavgifter page
  let avgifterPage = fs.readFileSync(path.join(TEMPLATES, 'medlemsavgifter.html'), 'utf8');
  avgifterPage = avgifterPage.replace('{{avgifter_content}}', avgifterHtml);

  // Ordningsregler page
  let reglerPage = fs.readFileSync(path.join(TEMPLATES, 'ordningsregler.html'), 'utf8');
  reglerPage = reglerPage.replace('{{regler_content}}', reglerHtml);

  // Bli-medlem page
  let formPage = fs.readFileSync(path.join(TEMPLATES, 'bli-medlem.html'), 'utf8');
  formPage = formPage
    .replace('{{form_intro}}', '')
    .replace('{{form_fields}}', formFields);

  // Generate required fields list for client-side validation
  const formFieldIds = [];
  const formRows = await queryDatabase(IDS.formular);
  for (const row of formRows) {
    if (prop(row, 'Obligatorisk')) {
      formFieldIds.push(prop(row, 'FältID'));
    }
  }

  // Generate script.js with dynamic required fields
  let scriptContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  scriptContent = scriptContent.replace(
    "!entries.namn || !entries.epost || !entries.telefon || !entries.adress || !entries.postnummer || !entries.ort",
    formFieldIds.map(id => `!entries.${id}`).join(' || ')
  );

  // Tack page (static, just copy)
  const tackHtml = fs.readFileSync(path.join(TEMPLATES, 'tack.html'), 'utf8');

  // Write output
  fs.writeFileSync(path.join(PUBLIC, 'index.html'), indexHtml);
  fs.writeFileSync(path.join(PUBLIC, 'medlemsavgifter.html'), avgifterPage);
  fs.writeFileSync(path.join(PUBLIC, 'ordningsregler.html'), reglerPage);
  fs.writeFileSync(path.join(PUBLIC, 'bli-medlem.html'), formPage);
  fs.writeFileSync(path.join(PUBLIC, 'tack.html'), tackHtml);

  // Copy static assets
  fs.writeFileSync(path.join(PUBLIC, 'script.js'), scriptContent);
  fs.copyFileSync(path.join(__dirname, 'style.css'), path.join(PUBLIC, 'style.css'));
  copyRecursive(path.join(__dirname, 'assets'), path.join(PUBLIC, 'assets'));

  console.log(`\nBuild complete! Output in ${PUBLIC}`);
}

build().catch(err => {
  console.error('\nBuild failed:', err.message || err);
  process.exit(1);
});
