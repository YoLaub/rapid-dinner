import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

// UI icons are drawn SVG (src/components/icons), never emoji.
const root = fileURLToPath(new URL('..', import.meta.url));
const emoji = /\p{Extended_Pictographic}/u;

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(astro|css)$/.test(name) ? [path] : [];
  });
}

describe('no emoji in the UI', () => {
  it.each(files(root))('%s has none', (file) => {
    expect(readFileSync(file, 'utf-8')).not.toMatch(emoji);
  });
});
