---
id: okf-005
feature: accessibilite-ui
branch: feature/a11y-clean-ui
status: done
files:
  - src/styles/clay.css
  - src/pages/index.astro
  - src/components/icons/
  - src/lib/contrast.js
  - scripts/e2e-check.mjs
tests:
  - src/lib/contrast.test.js
  - src/lib/no-emoji.test.js
decisions:
  - "2026-11-24 : emoji remplacés par des icônes SVG (currentColor, aria-hidden) ; test qui interdit les emoji dans .astro/.css. Le champ icon de menu.json n'est plus affiché."
  - "2026-11-24 : contrastes calculés depuis les tokens de clay.css. Fond des sauces assombri (--green-deep) : blanc sur #4e9a3e ne passait pas AA."
  - "2026-11-24 : focus visible, cibles 44 px, smooth-scroll seulement sans prefers-reduced-motion, plus de tirets cadratins dans l'UI."
  - "2026-11-24 : script e2e (build + grep du HTML) ajouté."
---

**Quoi** : Aucun débordement horizontal de 320 à 1440 px (mesuré dans le navigateur).
