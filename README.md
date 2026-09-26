# Proxima b

Site one-page immersif sur l'exoplanète Proxima Centauri b, en français.
Stack : Vite, React 19, TypeScript, Tailwind CSS v4, three.js (React Three Fiber, drei, postprocessing),
GSAP + ScrollTrigger, Lenis, Motion, composants Motion Primitives et Aceternity UI.

La proposition technique (arborescence, dépendances, composants, arbitrages) est dans
[`docs/PROPOSITION.md`](docs/PROPOSITION.md).

## Commandes

```bash
npm install
npm run dev        # serveur de développement (http://localhost:5173)
npm run build      # vérification TypeScript + build de production dans dist/
npm run preview    # sert le build de production
npm run lint       # oxlint
```

Contrôle d'une page (erreurs console, layout shift, captures desktop et mobile) :

```bash
npx tsx scripts/check.ts http://localhost:5173/ test-results
```

Dans un navigateur sans GPU (WebGL logiciel), ajouter `?timeout=200000` à l'URL : le calcul des textures
procédurales y prend une minute au lieu d'une seconde, et le délai de repli normal est de 8 s.
Autres paramètres de test : `?quality=eco`, `?motion=reduced`.

## Installer un composant

- **Motion Primitives** : `npx shadcn@latest add "https://motion-primitives.com/c/<nom>.json"`.
  Si `ui.shadcn.com` ou `motion-primitives.com` sont injoignables, le script
  `npx tsx scripts/registry-add.ts mp <nom>` écrit les mêmes fichiers (registre officiel, avec repli sur le
  dépôt GitHub du projet) aux emplacements définis par `components.json`.
- **Aceternity UI** : commande indiquée sur `https://ui.aceternity.com/components/<slug>`
  (registre `@aceternity` déclaré dans `components.json`).

Chaque composant installé est relu puis adapté à la palette du site : aucune couleur par défaut ne doit subsister.

## Organisation

```
src/
  three/        calque 0 : un seul canvas WebGL fixe (planète, étoile, étoiles, ciel), shaders GLSL
  components/   ui/ (Motion Primitives, Aceternity), layout/, text/, site/, loader/
  sections/     une feuille par section du récit
  lib/          store (zustand), sections, scroll, GSAP, polices
  providers/    Lenis ↔ ScrollTrigger, préférences (mouvements réduits, pointeur)
scripts/        installation de composants, contrôle Playwright
```

## État

Aperçu v0.1 : socle, scène 3D, loader, hero et section « La distance ».
Les autres sections attendent l'accès réseau à `ui.aceternity.com` et aux banques d'images
(ESO, ESA/Hubble, ESA/Webb, NASA, Unsplash).
