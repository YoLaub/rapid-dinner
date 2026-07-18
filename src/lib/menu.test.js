import { describe, it, expect } from 'vitest';
import menu from '../data/menu.json';
import site from '../data/site.json';
import {
  formatPrice,
  allItems,
  validateMenu,
  buildRestaurantSchema,
} from './menu.js';

describe('formatPrice', () => {
  it('formate en euros fr-FR avec deux décimales', () => {
    expect(formatPrice(12.5)).toBe('12,50 €');
    expect(formatPrice(3)).toBe('3,00 €');
    expect(formatPrice(0.2)).toBe('0,20 €');
  });
});

describe('intégrité des données de la carte', () => {
  it('ne remonte aucune anomalie de structure', () => {
    expect(validateMenu(menu)).toEqual([]);
  });

  it('a des catégories avec un id unique', () => {
    const ids = menu.categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a au moins un plat par catégorie et des prix positifs', () => {
    for (const cat of menu.categories) {
      expect(cat.items.length).toBeGreaterThan(0);
      for (const item of cat.items) {
        expect(typeof item.price).toBe('number');
        expect(item.price).toBeGreaterThan(0);
      }
    }
  });

  it('expose une catégorie formules mise en avant', () => {
    const formules = menu.categories.find((c) => c.id === 'formules');
    expect(formules).toBeDefined();
    expect(formules.featured).toBe(true);
  });
});

describe('validateMenu détecte les erreurs', () => {
  it('signale un prix manquant ou négatif', () => {
    const broken = {
      categories: [{ id: 'x', name: 'X', items: [{ name: 'A', price: -1 }] }],
    };
    expect(validateMenu(broken)).toContain('x/A: prix invalide');
  });

  it('signale un id de catégorie dupliqué', () => {
    const broken = {
      categories: [
        { id: 'dup', name: 'A', items: [{ name: 'a', price: 1 }] },
        { id: 'dup', name: 'B', items: [{ name: 'b', price: 1 }] },
      ],
    };
    expect(validateMenu(broken)).toContain('id de catégorie dupliqué: dup');
  });
});

describe('allItems', () => {
  it('aplatit tous les plats de toutes les catégories', () => {
    const total = menu.categories.reduce((n, c) => n + c.items.length, 0);
    expect(allItems(menu)).toHaveLength(total);
  });
});

describe('buildRestaurantSchema (JSON-LD)', () => {
  const schema = buildRestaurantSchema(site, menu);

  it('produit un Restaurant schema.org valide', () => {
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Restaurant');
    expect(schema.name).toBe("Rapid'Dinner");
    expect(schema.telephone).toBe('02 97 41 99 89');
    expect(schema.address['@type']).toBe('PostalAddress');
    expect(schema.address.addressLocality).toBe('Saint-Jean-Brévelay');
  });

  it('inclut le menu complet dans hasMenu', () => {
    expect(schema.hasMenu['@type']).toBe('Menu');
    expect(schema.hasMenu.hasMenuSection).toHaveLength(menu.categories.length);
    const firstSection = schema.hasMenu.hasMenuSection[0];
    expect(firstSection['@type']).toBe('MenuSection');
    expect(firstSection.hasMenuItem[0]['@type']).toBe('MenuItem');
    expect(firstSection.hasMenuItem[0].offers.priceCurrency).toBe('EUR');
  });

  it('déclare les horaires d\'ouverture', () => {
    expect(Array.isArray(schema.openingHoursSpecification)).toBe(true);
    expect(schema.openingHoursSpecification.length).toBeGreaterThan(0);
    expect(schema.openingHoursSpecification[0]['@type']).toBe('OpeningHoursSpecification');
  });
});
