---
id: okf-001
feature: site-vitrine
branch: feature/site-vitrine
status: done
files:
  - src/data/menu.json
  - src/data/site.json
  - src/lib/menu.js
  - src/layouts/Base.astro
  - src/components/MenuCategory.astro
  - src/pages/index.astro
  - src/styles/clay.css
  - astro.config.mjs
  - netlify.toml
tests:
  - src/lib/menu.test.js
decisions:
  - "2026-07-18 : Astro + sortie statique + Netlify (site vitrine léger, SEO natif, hébergement gratuit)."
  - "2026-07-18 : carte 100% pilotée par src/data/menu.json (maintenance par un non-technicien)."
  - "2026-07-18 : nom de marque = Rapid'Dinner (deux N, confirmé client) ; le logo stylise en 'Diner'."
  - "2026-07-18 : design Claymorphisme aux couleurs du logo (rouge/doré/crème), mobile-first."
---

**Quoi** : page d'accueil unique présentant toute la carte (9 catégories, ~60 items)
par cartes claymorphiques, avec nav collante par catégorie, infos pratiques (horaires,
adresse, clic-to-call, itinéraire, Facebook), SEO local via JSON-LD schema.org/Restaurant
+ Menu généré depuis les données. Logique pure (format prix, validation carte, JSON-LD)
dans `src/lib/menu.js`, testée (11 tests verts). Build statique OK, E2E HTML vérifié.

**Pièges** :
- Intl fr-FR insère des espaces insécables (U+00A0/U+202F) dans les prix → normaliser
  avec `/\p{White_Space}/gu` avant comparaison/affichage.
- Astro échappe les apostrophes en `&#39;` dans le HTML : en tenir compte dans les
  contrôles E2E par grep (chercher le texte échappé, pas l'apostrophe brute).

**À faire (backlog)** :
- Confirmer avec le client : URL Facebook exacte, coordonnées GPS précises, jour de
  fermeture exact, photos réelles des plats.
- Pages mentions légales + confidentialité (obligation légale FR).
- Achat + branchement du nom de domaine.
