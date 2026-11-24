import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { contrastRatio } from './contrast.js';

// Reads the real theme tokens so a color change in clay.css cannot silently break AA.
const css = readFileSync(new URL('../styles/clay.css', import.meta.url), 'utf-8');

function token(name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Token --${name} not found in clay.css`);
  return match[1];
}
const color = (name) => (name.startsWith('#') ? name : token(name));

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for identical colors', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
  });

  it('matches a known mid-grey (#767676 on white is about 4.54)', () => {
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 1);
  });
});

// [foreground, background] pairs actually used for text in the UI.
const textPairs = [
  ['ink', 'cream'],
  ['ink', 'surface'],
  ['ink', 'gold'],
  ['muted', 'surface'],
  ['muted', 'cream'],
  ['red', 'cream'],
  ['red', 'surface'],
  ['red-dark', 'surface'],
  ['red-dark', 'cream'],
  ['#ffffff', 'red'],
  ['#ffffff', 'red-dark'],
  ['#ffffff', 'green-deep'],
  ['cream', 'ink'],
  ['yellow', 'ink'],
  ['#c9bfae', 'ink'],
];

describe('theme contrast (WCAG AA)', () => {
  it.each(textPairs)('text %s on %s is at least 4.5:1', (fg, bg) => {
    expect(contrastRatio(color(fg), color(bg))).toBeGreaterThanOrEqual(4.5);
  });
});
