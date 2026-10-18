#!/usr/bin/env node
/**
 * Finds every English UI string that must exist in the Tamil and Hindi
 * dictionaries and reports the missing ones. Exit code 1 if any are missing.
 *
 *   node scripts/check-i18n.mjs            # report
 *   node scripts/check-i18n.mjs --json     # print missing keys as JSON
 *
 * Collected:
 *  1. literal first arguments of t('...')
 *  2. literal strings in data that the UI passes through t() at runtime
 *     (seed titles, labels, prep checklists, menu labels…) — found by
 *     property name in the files listed below.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dirs = ['src', 'doctor/src'];

function walk(dir, out = []) {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      if (e === 'test' || e === 'i18n') continue;
      walk(p, out);
    } else if (/\.(tsx?|mjs)$/.test(e) && !e.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

const files = dirs.flatMap((d) => walk(join(root, d)));
const keys = new Map(); // key -> first file

const add = (k, f) => {
  if (!k || !/[A-Za-z]/.test(k)) return;
  if (!keys.has(k)) keys.set(k, relative(root, f));
};

// Decode a JS string literal body.
const unq = (s) => s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n');

const T_CALL = /\bt\(\s*(['"])((?:\\.|(?!\1).)*)\1/g;
const T_TPL = /\bt\(\s*`([^`$]*)`/g;
const PROP = /\b(label|hint|description|title|group|name|instructions|location|clinicianName|supportiveNote|skipReason|typeLabel|doneLabel|doneText|subtitle|action|unit)\s*[:=]\s*(['"])((?:\\.|(?!\2).)*)\2/g;
const T_ANY = /\bt\(([^()\n]*(?:\([^()\n]*\)[^()\n]*)*)\)/g;
const IDENT = /^([A-Z0-9_]+|[a-z0-9_-]+|[a-z]+[A-Z][A-Za-z]*)$/;
const RETURN = /\breturn\s+(['"])((?:\\.|(?!\1).)*)\1/g;

// Files whose string data reaches t() at runtime.
const DATA_FILES = [
  /domain\/seed\.ts$/,
  /utils\/labels\.ts$/,
  /content\/vaccines\.ts$/,
  /pages\/.*\.tsx$/,
  /components\/.*\.tsx$/,
  /store\/selectors\.ts$/,
  /doctor\/src\/.*\.tsx?$/,
];
const SKIP_PROP_FILES = [/content\/(facts|articles|epds|sources)\.ts$/, /doctor\/src\/data\.ts$/];

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(T_CALL)) add(unq(m[2]), f);
  for (const m of src.matchAll(T_TPL)) add(m[1], f);
  for (const m of src.matchAll(T_ANY)) {
    for (const q of m[1].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g)) {
      const v = unq(q[2]);
      if (!IDENT.test(v) && !/^(https?:|#|\/)/.test(v)) add(v, f);
    }
  }
  if (SKIP_PROP_FILES.some((r) => r.test(f))) continue;
  if (!DATA_FILES.some((r) => r.test(f))) continue;
  for (const m of src.matchAll(PROP)) {
    // skip ids / css / urls / names of people that are not UI text
    const v = unq(m[3]);
    if (/^(https?:|#|\.|\/)/.test(v) || /^[a-z0-9-]+$/.test(v)) continue;
    add(v, f);
  }
  if (/labels\.ts$|Vaccines\.tsx$|Home\.tsx$|vaccines\.ts$/.test(f)) for (const m of src.matchAll(RETURN)) add(unq(m[2]), f);
  // blocks of UI strings marked with // i18n-list (arrays, maps, call lists)
  for (const block of src.matchAll(/\/\/ i18n-list[^\n]*\n([\s\S]*?)\/\/ end-i18n-list/g)) {
    for (const m of block[1].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g)) {
      const v = unq(m[2]);
      if (!IDENT.test(v) && !/^(https?:|#|\/|\d)/.test(v)) add(v, f);
    }
  }
}

// prepChecklist arrays in seed
const seed = readFileSync(join(root, 'src/domain/seed.ts'), 'utf8');
for (const block of seed.matchAll(/prepChecklist:\s*\[([^\]]*)\]/g)) {
  for (const m of block[1].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g)) add(unq(m[2]), 'src/domain/seed.ts');
}

const IGNORE = new Set(['Arogyama', 'EN', 'MoHFW']);
async function load(lang) {
  const src = readFileSync(join(root, `src/i18n/${lang}.ts`), 'utf8');
  const dict = new Set();
  for (const m of src.matchAll(/^\s*(['"])((?:\\.|(?!\1).)*)\1\s*:/gm)) dict.add(unq(m[2]));
  return dict;
}

const missing = {};
let total = 0;
for (const lang of ['ta', 'hi']) {
  const dict = await load(lang);
  missing[lang] = [...keys.keys()].filter((k) => !dict.has(k) && !IGNORE.has(k));
  total += missing[lang].length;
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify([...new Set([...missing.ta, ...missing.hi])], null, 1));
} else {
  console.log(`i18n: ${keys.size} UI strings found`);
  for (const lang of ['ta', 'hi']) {
    console.log(`  ${lang}: ${missing[lang].length} missing`);
    for (const k of missing[lang].slice(0, 15)) console.log(`    - ${k}  (${keys.get(k)})`);
  }
}
process.exit(total > 0 ? 1 : 0);
