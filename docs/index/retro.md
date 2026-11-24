# Rétro continue — Rapid'Dinner

Ce qui a fonctionné / ce qui a mordu, au fil de l'eau. Pièges génériques réutilisables →
aussi remontés dans le skill `greenfield-tdd-okf/references/pieges.md`.

## 2026-07-18 — Bootstrap + site vitrine

**Bien fonctionné**
- Extraction de toute la carte depuis la photo Facebook en une passe, puis saisie en
  `menu.json` : la carte devient une donnée éditable, pas du HTML figé.
- TDD sur la logique pure (format prix, validation, JSON-LD) : rapide, aucune UI à mocker.
- Astro static : build < 1s, HTML pur, JSON-LD SEO généré depuis les mêmes données.

**A mordu (spécifique projet)**
- Orthographe du nom : d'abord lu « Rapid'Diner » sur le logo, puis **corrigé en
  « Rapid'Dinner » (deux N) sur confirmation du client** 2026-07-18. Le logo stylise en
  « Diner » mais l'enseigne s'écrit avec deux N.
- Prix Intl fr-FR : espaces insécables → normalisés dans `formatPrice` (piège générique,
  remonté dans `references/pieges.md`).
- Contrôle E2E par grep : Astro échappe les apostrophes (`&#39;`), le grep doit en tenir
  compte (le contenu était correct, c'est le test qui était faux).

**En attente d'infos client**
- URL Facebook exacte, GPS précis, jours/horaires de fermeture définitifs, photos des plats.

## 2026-11-24 — Port des fonctions de en-cas 2 faim (statut, avis, panier, a11y)

**Bien fonctionné**
- Garder le style clay validé par le client et n'ajouter que les fonctions : aucun re-design à faire valider.
- Les libs `openStatus` / `cart` se portent presque telles quelles : logique pure, dates et stockage injectés.
- Un test de contraste qui lit les vrais tokens de `clay.css` a trouvé un échec (blanc sur vert des sauces) que l'œil ne voyait pas.

**A mordu**
- `node_modules` absent : `npx vitest` marchait quand même, mais `astro dev` sortait sans message utile. Faire `npm ci` d'abord.
- Node par défaut trop ancien pour Astro 7 : `mise exec node@24.18.0 -- ...`.
- `sed -i` sur macOS demande un suffixe (`sed -i ''`), sinon il prend le script pour le suffixe.
- Pas de Tailwind ici : les icônes copiées avaient `h-4 w-4` par défaut, sans effet. Classe `.icon` à la place.
- Styles scopés Astro : une classe passée à un composant enfant (`.star`) n'est pas atteinte, utiliser `:global()`.

**En attente d'infos client**
- Note Google relevée le 2026-11-24 (4,6 / 116 avis) : à remettre à jour.
- Sauces au choix : non gérées dans le panier, précisées au téléphone.
