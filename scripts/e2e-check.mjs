// E2E: build the static site, then grep the generated HTML for what must be there.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

execSync('npm run build', { stdio: 'inherit' });
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf-8');
const text = html.replace(/&#39;/g, "'");

const checks = [
  ['adresse', /6 rue de Vannes/],
  ['telephone', /02 97 41 99 89/],
  ['horaires', /18h30 – 22h00/],
  ['mention alcool', /L'abus d'alcool est dangereux/],
  ['JSON-LD Restaurant', /"@type":"Restaurant"/],
  ['JSON-LD aggregateRating', /"@type":"AggregateRating"/],
  ['badge ouvert/ferme', /data-testid="open-status"/],
  ['avis Google', /data-testid="google-reviews"/],
  ['lien fiche Google', /href="https:\/\/www\.google\.com\/maps\/place\//],
  ['boutons ajouter', /data-add/],
  ['catalogue panier', /id="cart-catalog"/],
  ['barre panier', /data-cart-bar/],
  ['volet panier', /data-cart-dialog/],
  ['honnetete panier', /Rien n'est envoyé en ligne/],
  ['lien tel panier', /href="tel:\+33297419989"/],
];

let failed = 0;
for (const [name, pattern] of checks) {
  const ok = pattern.test(text);
  console.log(`  ${ok ? '✔' : '✘'} ${name}`);
  if (!ok) failed += 1;
}
if (/\p{Extended_Pictographic}/u.test(text)) {
  console.log('  ✘ emoji dans le HTML');
  failed += 1;
}
if (failed) {
  console.error(`E2E check FAILED (${failed})`);
  process.exit(1);
}
console.log('E2E check OK.');
