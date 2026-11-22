import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function readJsonFiles(folder) {
  const dir = path.join(rootDir, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => {
      const fullPath = path.join(dir, file);
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const stat = fs.statSync(fullPath);
      return { file, data, mtimeMs: Math.round(stat.mtimeMs) };
    });
}

function assertImageExists(imgPath, context) {
  if (!imgPath || /^https?:\/\//i.test(imgPath)) return;
  const rel = imgPath.replace(/^\/+/, '');
  if (!fs.existsSync(path.join(rootDir, rel))) {
    throw new Error(`Missing image "${rel}" referenced in ${context}`);
  }
}

function validateLineTranslations(text, translationsFr, translationsEn, context) {
  const lines = String(text || '').split('\n');
  if (Array.isArray(translationsFr) && translationsFr.length !== lines.length) {
    throw new Error(`FR line mismatch in ${context}: text=${lines.length}, fr=${translationsFr.length}`);
  }
  if (Array.isArray(translationsEn) && translationsEn.length !== lines.length) {
    throw new Error(`EN line mismatch in ${context}: text=${lines.length}, en=${translationsEn.length}`);
  }
}

const texts = readJsonFiles('texts').map(({ data, mtimeMs }) => {
  assertImageExists(data.imageUrl, `texts/${data.id}`);
  validateLineTranslations(data.text, data.translationsFr, data.translationsEn, `texts/${data.id}`);
  return {
    id: data.id,
    titleJa: data.titleJa,
    titleFr: data.titleFr,
    titleEn: data.titleEn,
    level: data.level,
    author: data.author,
    authorEn: data.authorEn,
    category: data.category,
    categoryEn: data.categoryEn,
    tags: data.tags,
    tagsEn: data.tagsEn,
    descriptionFr: data.descriptionFr,
    descriptionEn: data.descriptionEn,
    imageUrl: data.imageUrl,
    text: data.text,
    preview: (data.text || '').slice(0, 140),
    charCount: (data.text || '').replace(/\s/g, '').length,
    updatedAt: data.updatedAt || mtimeMs,
  };
});

const books = readJsonFiles('books').map(({ data, mtimeMs }) => {
  assertImageExists(data.coverImage, `books/${data.id}`);
  for (const ch of data.chapters || []) {
    assertImageExists(ch.imageUrl, `books/${data.id}/${ch.id}`);
    validateLineTranslations(ch.text, ch.translationsFr, ch.translationsEn, `books/${data.id}/${ch.id}`);
  }
  return {
    id: data.id,
    format: 'book',
    titleJa: data.titleJa,
    titleFr: data.titleFr,
    titleEn: data.titleEn,
    level: data.level,
    author: data.author,
    authorEn: data.authorEn,
    category: data.category,
    categoryEn: data.categoryEn,
    tags: data.tags,
    tagsEn: data.tagsEn,
    descriptionFr: data.descriptionFr,
    descriptionEn: data.descriptionEn,
    coverImage: data.coverImage,
    chaptersCount: (data.chapters || []).length,
    chaptersSummary: (data.chapters || []).map((ch) => ({
      id: ch.id,
      chapterNumber: ch.chapterNumber,
      titleJa: ch.titleJa,
      titleFr: ch.titleFr,
      titleEn: ch.titleEn,
      summaryFr: ch.summaryFr,
      summaryEn: ch.summaryEn,
      charCount: (ch.text || '').replace(/\s/g, '').length,
    })),
    updatedAt: data.updatedAt || mtimeMs,
  };
});

const gamebooks = readJsonFiles('gamebooks').map(({ data, mtimeMs }) => {
  assertImageExists(data.coverImage, `gamebooks/${data.id}`);
  const chapters = data.chapters || {};
  if (!chapters[data.startChapterId]) {
    throw new Error(`Missing startChapterId "${data.startChapterId}" in gamebooks/${data.id}`);
  }
  for (const [id, ch] of Object.entries(chapters)) {
    assertImageExists(ch.imageUrl, `gamebooks/${data.id}/${id}`);
    validateLineTranslations(ch.text, ch.translationsFr, ch.translationsEn, `gamebooks/${data.id}/${id}`);
    for (const choice of ch.choices || []) {
      if (!chapters[choice.targetChapterId]) {
        throw new Error(`Broken choice target "${choice.targetChapterId}" in gamebooks/${data.id}/${id}`);
      }
    }
  }
  return {
    id: data.id,
    format: 'gamebook',
    titleJa: data.titleJa,
    titleFr: data.titleFr,
    titleEn: data.titleEn,
    level: data.level,
    author: data.author,
    authorEn: data.authorEn,
    category: data.category,
    categoryEn: data.categoryEn,
    tags: data.tags,
    tagsEn: data.tagsEn,
    synopsisFr: data.synopsisFr,
    synopsisEn: data.synopsisEn,
    coverImage: data.coverImage,
    startChapterId: data.startChapterId,
    scenesCount: Object.keys(chapters).length,
    updatedAt: data.updatedAt || mtimeMs,
  };
});

const rpgGamebooks = readJsonFiles('rpg-gamebooks').map(({ data, mtimeMs }) => {
  assertImageExists(data.coverImage, `rpg-gamebooks/${data.id}`);
  const chapters = data.chapters || {};
  if (!chapters[data.startChapterId]) {
    throw new Error(`Missing startChapterId "${data.startChapterId}" in rpg-gamebooks/${data.id}`);
  }
  for (const [id, ch] of Object.entries(chapters)) {
    assertImageExists(ch.imageUrl, `rpg-gamebooks/${data.id}/${id}`);
    validateLineTranslations(ch.text, ch.translationsFr, ch.translationsEn, `rpg-gamebooks/${data.id}/${id}`);
  }
  return {
    id: data.id,
    format: 'rpg-gamebook',
    titleJa: data.titleJa,
    titleFr: data.titleFr,
    titleEn: data.titleEn,
    level: data.level,
    author: data.author,
    authorEn: data.authorEn,
    category: data.category,
    categoryEn: data.categoryEn,
    tags: data.tags,
    tagsEn: data.tagsEn,
    synopsisFr: data.synopsisFr,
    synopsisEn: data.synopsisEn,
    coverImage: data.coverImage,
    initialCharacter: data.initialCharacter,
    startChapterId: data.startChapterId,
    scenesCount: Object.keys(chapters).length,
    updatedAt: data.updatedAt || mtimeMs,
  };
});

const manifest = {
  version: Date.now(),
  generatedAt: new Date().toISOString(),
  texts,
  books,
  gamebooks,
  rpgGamebooks,
};

fs.writeFileSync(path.join(rootDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(
  `[Manifest] Built manifest.json: ${texts.length} texts, ${books.length} books, ${gamebooks.length} gamebooks, ${rpgGamebooks.length} rpg-gamebooks.`
);
