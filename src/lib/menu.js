// Logique pure de la carte : formatage, validation, génération JSON-LD SEO.
// Source de vérité des données : src/data/menu.json et src/data/site.json.

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

/** Formate un prix numérique en euros (fr-FR), ex. 12.5 -> "12,50 €". */
export function formatPrice(value) {
  // Intl fr-FR insère des espaces insécables (U+00A0, U+202F) ; on les normalise
  // en espace simple pour un rendu et des comparaisons stables.
  return priceFormatter.format(value).replace(/\p{White_Space}/gu, ' ');
}

/** Renvoie tous les plats, toutes catégories confondues. */
export function allItems(menu) {
  return menu.categories.flatMap((cat) => cat.items);
}

/**
 * Vérifie l'intégrité de la carte. Renvoie un tableau de messages d'anomalie
 * (vide si tout est correct) — jamais d'exception, pour rester utilisable au build.
 */
export function validateMenu(menu) {
  const issues = [];
  const seenIds = new Set();

  for (const cat of menu.categories ?? []) {
    if (seenIds.has(cat.id)) issues.push(`id de catégorie dupliqué: ${cat.id}`);
    seenIds.add(cat.id);

    if (!cat.items || cat.items.length === 0) {
      issues.push(`${cat.id}: catégorie vide`);
      continue;
    }
    for (const item of cat.items) {
      if (typeof item.price !== 'number' || item.price <= 0) {
        issues.push(`${cat.id}/${item.name}: prix invalide`);
      }
    }
  }
  return issues;
}

/**
 * Construit le JSON-LD schema.org/Restaurant (avec Menu complet et horaires)
 * pour le référencement local.
 */
export function buildRestaurantSchema(site, menu) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: site.name,
    description: site.description,
    servesCuisine: site.servesCuisine,
    priceRange: site.priceRange,
    telephone: site.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    sameAs: site.facebook ? [site.facebook] : [],
    openingHoursSpecification: (site.openingHoursSpec ?? []).map((spec) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: spec.days,
      opens: spec.opens,
      closes: spec.closes,
    })),
    hasMenu: {
      '@type': 'Menu',
      hasMenuSection: menu.categories.map((cat) => ({
        '@type': 'MenuSection',
        name: cat.name,
        hasMenuItem: cat.items.map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description || undefined,
          offers: {
            '@type': 'Offer',
            price: item.price.toFixed(2),
            priceCurrency: menu.currency || 'EUR',
          },
        })),
      })),
    },
  };
}
