const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const jsonPath = path.join(root, 'study_data.json');
const jsPath = path.join(root, 'study_data.js');
const defaultTextPath = path.join(root, 'lyrics_placeholders.txt');

function readJson() {
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

function writeJson(data) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  fs.writeFileSync(jsPath, `window.STUDY_DATA = ${JSON.stringify(data, null, 2)};\n`, 'utf8');
}

function normalizeBlock(text) {
  return text.replace(/\r\n/g, '\n').trim();
}

function exportTemplate(outputPath) {
  const data = readJson();
  const countries = Object.keys(data).sort();
  const chunks = [];

  chunks.push('# Fill in anthem lyrics here.');
  chunks.push('# Keep the section markers exactly as-is.');
  chunks.push('# You can paste normal multi-line text. The importer will preserve line breaks automatically.');
  chunks.push('# Leave a section empty if you do not want to change it.');
  chunks.push('');

  for (const country of countries) {
    const entry = data[country];
    chunks.push(`=== ${country} ===`);
    chunks.push('[lyrics]');
    chunks.push(entry.lyrics || '');
    chunks.push('[translation]');
    chunks.push(entry.translation || '');
    chunks.push('[translation_ja]');
    chunks.push(entry.translation_ja || '');
    chunks.push('');
  }

  fs.writeFileSync(outputPath, chunks.join('\n'), 'utf8');
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

function importTemplate(inputPath) {
  const data = readJson();
  const text = fs.readFileSync(inputPath, 'utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n');

  let currentCountry = null;
  let currentSection = null;
  const sections = {};

  function commitSection() {
    if (!currentCountry || !currentSection) return;
    if (!sections[currentCountry]) sections[currentCountry] = {};
    sections[currentCountry][currentSection] = normalizeBlock(buffer.join('\n'));
  }

  let buffer = [];

  for (const line of lines) {
    const countryMatch = line.match(/^=== (.+) ===$/);
    const sectionMatch = line.match(/^\[(lyrics|translation|translation_ja)\]$/);

    if (countryMatch) {
      commitSection();
      currentCountry = countryMatch[1];
      currentSection = null;
      buffer = [];
      continue;
    }

    if (sectionMatch) {
      commitSection();
      currentSection = sectionMatch[1];
      buffer = [];
      continue;
    }

    if (line.startsWith('#') && !currentCountry) continue;
    if (currentCountry && currentSection) buffer.push(line);
  }
  commitSection();

  let updated = 0;
  for (const [country, values] of Object.entries(sections)) {
    if (!data[country]) continue;
    for (const key of ['lyrics', 'translation', 'translation_ja']) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        data[country][key] = values[key];
      }
    }
    updated++;
  }

  writeJson(data);
  console.log(`Imported lyrics data for ${updated} countries from ${path.relative(root, inputPath)}`);
}

function printUsage() {
  console.log('Usage:');
  console.log('  node scripts/lyrics_placeholders.js export [output-file]');
  console.log('  node scripts/lyrics_placeholders.js import [input-file]');
}

const command = process.argv[2];
const targetPath = process.argv[3]
  ? path.resolve(process.cwd(), process.argv[3])
  : defaultTextPath;

if (command === 'export') {
  exportTemplate(targetPath);
} else if (command === 'import') {
  importTemplate(targetPath);
} else {
  printUsage();
  process.exitCode = 1;
}
