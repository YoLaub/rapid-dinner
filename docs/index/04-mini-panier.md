---
id: okf-004
feature: mini-panier
branch: feature/cart
status: done
files:
  - src/lib/cart.js
  - src/components/Cart.astro
  - src/components/MenuCategory.astro
  - src/pages/index.astro
tests:
  - src/lib/cart.test.js
decisions:
  - "2026-11-24 : aide à préparer l'appel, rien n'est envoyé en ligne ; fin sur un lien tel:."
  - "2026-11-24 : le panier ne stocke que des choix (clé, taille, quantité) ; les prix viennent de la carte actuelle. Clé localStorage panier:v1, try/catch."
  - "2026-11-24 : « Seul / Avec frites » = deux tailles déduites de price/priceFrites. Pas de suppléments (absents de la carte source), sauces à choisir au téléphone (dit dans le volet)."
  - "2026-11-24 : hors horaires, le bouton devient « Rappeler <prochaine ouverture> »."
---

**Quoi** : Boutons d'ajout par prix, barre fixe en bas dès le premier ajout, volet (dialog natif) avec quantités, total estimé
(aria-live), copie du récapitulatif, vider. Un seul script, le reste du site reste du HTML statique.
