import { describe, it, expect } from 'vitest';
import { formatRatingLabel } from './reviews.js';
import site from '../data/site.json';
import menu from '../data/menu.json';
import { buildRestaurantSchema } from './menu.js';

describe('formatRatingLabel', () => {
  it('writes the score with a French decimal comma', () => {
    expect(formatRatingLabel({ score: 4.6, count: 116 })).toBe('4,6 sur 5 · 116 avis Google');
  });

  it('keeps one decimal for round scores', () => {
    expect(formatRatingLabel({ score: 5, count: 12 })).toBe('5,0 sur 5 · 12 avis Google');
  });
});

describe('google reviews data', () => {
  it('has a plausible score, a count, a date and a Google Maps link', () => {
    const { score, count, checkedAt, href } = site.googleReviews;
    expect(score).toBeGreaterThanOrEqual(1);
    expect(score).toBeLessThanOrEqual(5);
    expect(Number.isInteger(count) && count > 0).toBe(true);
    expect(checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(href).toMatch(/^https:\/\/www\.google\.com\/maps\//);
  });

  it('feeds aggregateRating in the JSON-LD from the same figures', () => {
    const schema = buildRestaurantSchema(site, menu);
    expect(schema.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: '4.6',
      reviewCount: 116,
      bestRating: '5',
    });
  });
});
