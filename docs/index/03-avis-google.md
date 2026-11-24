---
id: okf-003
feature: avis-google
branch: feature/google-reviews
status: done
files:
  - src/lib/reviews.js
  - src/components/GoogleReviewsLink.astro
  - src/data/site.json
  - src/lib/menu.js
tests:
  - src/lib/reviews.test.js
decisions:
  - "2026-11-24 : note 4,6 sur 5, 116 avis, relevés à la main sur la fiche Google (lien partagé par le client). Jamais inventés."
  - "2026-11-24 : chiffres dans site.json (googleReviews, checkedAt) ; ils vieillissent, à relire de temps en temps."
  - "2026-11-24 : aggregateRating ajouté au JSON-LD depuis les mêmes chiffres."
---

**Quoi** : Lien « 4,6 sur 5 · 116 avis Google » dans le hero, ouvert dans un nouvel onglet vers la fiche Google Maps.
