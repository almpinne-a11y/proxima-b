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

Contrôle d'une page (erreurs console, layout shift avec les éléments en cause, captures desktop et mobile) :

```bash
npm run check -- http://localhost:5173/ test-results
```

Dans un navigateur sans GPU (WebGL logiciel), ajouter `?timeout=200000` à l'URL : le calcul des textures
procédurales y prend une minute au lieu d'une seconde, et le délai de repli normal est de 8 s.
Autres paramètres de test : `?quality=eco`, `?motion=reduced`.

## Mise en ligne (Netlify)

`netlify.toml` fixe la commande de build (`npm run build`), le dossier publié (`dist`) et la version de Node.
Sur Netlify : « Add new project » → « Import an existing project » → GitHub → ce dépôt, en choisissant la branche
à publier. Chaque push sur cette branche redéploie ensuite le site.

Sans passer par GitHub : `npm run build`, puis glisser le dossier `dist/` sur https://app.netlify.com/drop.

## Images (Wikimedia Commons)

Les images viennent de Wikimedia Commons, sous licence libre uniquement (CC BY, CC BY-SA, CC0, domaine public).
Licence, crédit et page source sont relus par l'API de Commons : rien n'est recopié à la main.

```bash
npm run images:discover   # parcourt les catégories de scripts/images/sources.ts,
                          # écrit .cache/images/candidates.json et des planches contact numérotées
# → choisir les images dans scripts/images/selection.ts (titre Commons exact, alt et légende en français)
npm run images:build      # télécharge, vérifie la licence, génère AVIF + WebP 640/1280/2560,
                          # le placeholder flouté et src/data/images.ts
```

L'emplacement de chaque image dans les sections est défini dans `src/data/placement.ts`.
Une image absente n'est simplement pas affichée. Les vues d'artiste sont légendées « Vue d'artiste ».

Ces scripts ont besoin d'accéder à `commons.wikimedia.org` et `upload.wikimedia.org`.

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
Emplacements d'images prêts (hero, sections à venir, bandeau « PROXIMA », crédits), en attente des fichiers.
Les autres sections attendent l'accès réseau à `ui.aceternity.com`, et les images l'accès à Wikimedia Commons.
