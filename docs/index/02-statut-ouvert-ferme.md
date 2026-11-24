---
id: okf-002
feature: statut-ouvert-ferme
branch: feature/open-status
status: done
files:
  - src/lib/openStatus.js
  - src/components/OpenStatusBadge.astro
  - src/data/site.json
tests:
  - src/lib/openStatus.test.js
decisions:
  - "2026-11-24 : horaires lus dans site.json (openingHoursSpec), source unique réutilisée pour le badge, le panier et le JSON-LD."
  - "2026-11-24 : calcul côté navigateur (site statique), texte de repli « Voir les horaires » sans JS."
  - "2026-11-24 : la minute de fermeture compte comme fermé ; heure lue en Europe/Paris via Intl, indépendante du fuseau de la machine."
---

**Quoi** : Badge « Ouvert jusqu'à 14h » / « Fermé, rouvre demain à 12h » dans le hero. Logique pure `getOpenStatus(now, specs)`
testée (hiver, été, midi/soir, dimanche soir seul, lundi fermé). Rafraîchi chaque minute.
