# CLAUDE.md — Conventions du repo Rapid'Dinner

## Contexte
Site vitrine pour **Rapid'Dinner**, fast food à **Saint-Jean-Brévelay (56, Morbihan)**.
Le restaurant est bien noté mais n'existe en ligne que via sa page Facebook (« Rapid'Dinner
morel ») — pas de site. **Problème n°1 à résoudre : le manque de visibilité de la carte.**
Le site met la carte (menus, sandwichs, prix) au centre de tout : accessible en 1 clic,
lisible sur mobile, à jour facilement.

> Nom de marque officiel = **Rapid'Dinner** (deux N), confirmé par le client 2026-07-18.
> Le logo le stylise en « Rapid' Diner » mais l'enseigne s'écrit avec deux N : toujours
> afficher « Rapid'Dinner ».

## Coordonnées (source de vérité : docs/ux/carte.jpeg)
- Adresse : 6 rue de Vannes, 56660 Saint-Jean-Brévelay
- Téléphone : 02 97 41 99 89
- Horaires : Mardi midi au Samedi soir, 12h00–14h00 et 18h30–22h00 ; Dimanche 18h30–22h00
  (fermé lundi et mardi soir — à confirmer avec le client)
- Sur place ou à emporter
- Facebook : page « Rapid'Dinner morel » (URL exacte à récupérer)

## Objectifs du site
1. **La carte d'abord** : carte visible dès l'arrivée, par catégories (formules, sandwichs
   froids, sandwichs chauds, paninis, salades, plats chauds, boissons, apéritifs, desserts).
2. **Infos pratiques** : horaires, adresse, téléphone (clic-to-call mobile), itinéraire.
3. **SEO local** : « fast food Saint-Jean-Brévelay », « kebab Saint-Jean-Brévelay »,
   « Rapid Diner ». Meta + données structurées `schema.org/Restaurant` + `Menu`.
4. **Pont avec Facebook** : lien vers la page (avis, actus). Le site est la vitrine de
   référence, Facebook reste le canal d'actualité.

## Identité visuelle (source : docs/ux/LOGO.jpeg)
- **Rouge** (dominante, gobelet du logo & carte) — couleur principale
- **Jaune/orangé doré** (frites, pain) — accent secondaire
- **Noir** (contours, texte)
- **Crème / blanc cassé** (fond)
- **Vert** (salade) — touche ponctuelle
- Style graphique : **Claymorphisme** — surfaces douces, coins arrondis généreux, ombres
  portées + reliefs internes (double ombre claire/foncée), aspect « pâte à modeler ».
  Garder simple : quelques composants réutilisables, pas de surcharge.

## Décisions techniques (validées 2026-07-18)
- Framework : **Astro** (sortie 100% statique, SEO natif, données découplées)
- Hébergement : **Netlify** (déploiement Git, HTTPS, domaine brançhable plus tard)
- Nom de domaine : **_à acheter plus tard_** — dev/déploiement sur l'URL Netlify d'abord
- Tests : **Vitest** sur la logique pure (`src/lib/`)

## Méthode
- **Git** : `main` ← `dev` ← `feature/xx`. Jamais de commit direct sur main/dev.
  Merge `--no-ff` vers dev seulement si tests verts + vérif build/E2E.
- **TDD** sur la logique pure (`src/lib/` : intégrité de la carte, génération JSON-LD).
  Les pages/composants Astro ne font qu'afficher les données.
- **Index OKF** : fin de chaque feature → `docs/index/<feature>.md`
  (entête YAML : id, feature, branch, status, files, tests, decisions ; corps ≤ 15 lignes).
  Lire `docs/index/` en début de session au lieu de relire tout le code.
- **Rétro continue** : `docs/index/retro.md`.
- **Autonomie** : le client délègue la gestion — avancer seul sur les actions réversibles
  et rendre compte ; ne demander que pour un fait métier inconnu ou une action destructive.

## Règles métier clés
- **La carte vit dans `src/data/menu.json`** (source de vérité unique). Les prix sont TTC
  et doivent correspondre exactement à la carte réelle — **ne jamais inventer** un plat,
  un prix, un horaire : demander au client.
- Coordonnées et horaires : source unique dans `src/data/site.json`, réutilisée partout
  (header, footer, schema.org).
- Mention alcool obligatoire : « L'abus d'alcool est dangereux pour la santé. À consommer
  avec modération. » (la carte propose des apéritifs/bières/vins).
- Mentions légales + politique de confidentialité obligatoires (site français).
- Photos : uniquement celles fournies par le restaurateur (ou sa page Facebook avec accord).

## Commandes
- `npm run dev` — serveur de dev Astro
- `npm test` — Vitest (logique pure)
- `npm run build` — build statique dans `dist/`
- `npm run preview` — prévisualiser le build
