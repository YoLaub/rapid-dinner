# Rapid'Dinner — Site vitrine

Site vitrine du fast food **Rapid'Dinner** (6 rue de Vannes, 56660 Saint-Jean-Brévelay).
Objectif n°1 : rendre **la carte** visible et à jour, là où le restaurant n'existait en
ligne que sur Facebook.

## Stack

- [Astro](https://astro.build) — site 100 % statique, SEO natif
- Vitest — tests de la logique pure (`src/lib/`)
- Déploiement : Netlify (voir `netlify.toml`)

## Démarrer

```bash
npm install
npm run dev       # http://localhost:4321
npm test          # tests de la carte / SEO
npm run build     # génère dist/
npm run preview   # prévisualise le build
```

## Modifier la carte

Toute la carte vit dans **`src/data/menu.json`** (source de vérité unique). Les
coordonnées et horaires sont dans **`src/data/site.json`**. Aucun prix ni horaire
n'est écrit en dur dans les pages : il suffit d'éditer ces deux fichiers.

- Un plat : `{ "name", "price", "description" }` (`priceFrites` en option pour les
  sandwichs chauds).
- Les prix sont en euros (nombre, ex. `12.5`) et affichés formatés automatiquement.

## Structure

```
src/
  data/        menu.json, site.json   ← source de vérité (à éditer)
  lib/         menu.js (+ tests)      ← formatage, validation, JSON-LD SEO
  layouts/     Base.astro             ← <head>, meta, données structurées
  components/  MenuCategory.astro     ← rendu d'une catégorie
  pages/       index.astro            ← page d'accueil
  styles/      clay.css               ← design « Claymorphisme »
public/        logo.jpeg
docs/index/    fiches OKF + retro     ← mémoire de projet
```

Conventions détaillées : voir [CLAUDE.md](CLAUDE.md).
