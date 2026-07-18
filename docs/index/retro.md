# Rétro continue — Rapid'Diner

Ce qui a fonctionné / ce qui a mordu, au fil de l'eau. Pièges génériques réutilisables →
aussi remontés dans le skill `greenfield-tdd-okf/references/pieges.md`.

## 2026-07-18 — Bootstrap + site vitrine

**Bien fonctionné**
- Extraction de toute la carte depuis la photo Facebook en une passe, puis saisie en
  `menu.json` : la carte devient une donnée éditable, pas du HTML figé.
- TDD sur la logique pure (format prix, validation, JSON-LD) : rapide, aucune UI à mocker.
- Astro static : build < 1s, HTML pur, JSON-LD SEO généré depuis les mêmes données.

**A mordu (spécifique projet)**
- Le nom réel de l'enseigne est **Rapid'Diner** (pas « Rapid'Dinner » = nom du dossier).
  Corrigé partout ; ne jamais afficher l'orthographe du dossier.
- Prix Intl fr-FR : espaces insécables → normalisés dans `formatPrice` (piège générique,
  remonté dans `references/pieges.md`).
- Contrôle E2E par grep : Astro échappe les apostrophes (`&#39;`), le grep doit en tenir
  compte (le contenu était correct, c'est le test qui était faux).

**En attente d'infos client**
- URL Facebook exacte, GPS précis, jours/horaires de fermeture définitifs, photos des plats.
