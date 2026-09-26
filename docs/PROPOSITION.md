# Proxima b — Proposition technique (étape 1)

> **Statut : en attente de validation.** Aucune dépendance installée, aucun code écrit.
> Ce document sert de référence pour la suite, y compris si une nouvelle session reprend le travail.

---

## 0. Constat

- Le dépôt est vide (un README) → nouvelle stack **Vite + React + TypeScript + Tailwind CSS v4**, shadcn/ui avec l'alias `@/`.
- **Motion Primitives** : les 28 composants prévus existent. Je les ai vérifiés dans le registre officiel (`public/c/<nom>.json` du dépôt `ibelick/motion-primitives`). Ils dépendent seulement de `motion` et de `react-use-measure`, sans dépendance de registre.
- **Réseau de l'environnement cloud** : npm, raw.githubusercontent.com et Google Fonts sont accessibles. La politique réseau refuse les hôtes suivants (réponse 403 du proxy) :

| Hôte refusé | Usage | Contournement |
|---|---|---|
| `ui.aceternity.com` | pages, code et registre Aceternity | aucun fiable → **bloquant** |
| `www.eso.org`, `cdn.eso.org` | images ESO, crédits, communiqués | aucun → **bloquant (images)** |
| `esahubble.org`, `cdn.esahubble.org`, `esawebb.org`, `cdn.esawebb.org` | images ESA/Hubble et ESA/Webb | aucun → **bloquant (images)** |
| `images-api.nasa.gov`, `images-assets.nasa.gov` | NASA Image and Video Library | aucun → **bloquant (images)** |
| `unsplash.com`, `images.unsplash.com` | photos d'ambiance | aucun |
| `exoplanetarchive.ipac.caltech.edu` | vérification des chiffres | aucun |
| `ui.shadcn.com` | `shadcn init`, namespace `@aceternity` | init manuel équivalent (components.json, `cn`, variables CSS) |
| `motion-primitives.com` | registre Motion Primitives | fichiers identiques via raw.githubusercontent.com |

Pour débloquer : ouvrir le menu de l'environnement cloud dans la barre de titre de la session → **Edit** → **Network access**, puis ajouter ces domaines aux domaines autorisés, ou choisir un niveau d'accès plus large (niveaux décrits sur https://code.claude.com/docs/en/claude-code-on-the-web).

---

## 1. Dépendances

Versions : dernières stables sur npm au 26/09/2026, figées dans `package-lock.json` à l'installation.

**Runtime**

| Paquet | Rôle |
|---|---|
| `react`, `react-dom` 19.3 | UI |
| `three` 0.186, `@react-three/fiber` 9, `@react-three/drei` 10 | canvas 3D unique, `useProgress` |
| `@react-three/postprocessing` 3 + `postprocessing` 6 | bloom (+ aberration chromatique discrète en qualité Haute) |
| `gsap` 3.15 (ScrollTrigger), `@gsap/react` | pin, scrub, scroll horizontal, nettoyage via `useGSAP` |
| `lenis` 1.3 | smooth scroll synchronisé avec ScrollTrigger |
| `motion` 13 | Framer Motion (`motion/react`), requis par MP et Aceternity |
| `zustand` | store global (section active, progression, qualité, éruptions) lu dans `useFrame` sans re-render ; déjà utilisé par R3F |
| `react-use-measure` | SlidingNumber, InfiniteSlider, ToolbarExpandable |
| `clsx`, `tailwind-merge`, `class-variance-authority`, `tw-animate-css` | socle shadcn |
| `lucide-react` | seule bibliothèque d'icônes (les icônes Tabler des composants Aceternity sont remplacées par leurs équivalents Lucide) |
| `@tsparticles/react`, `@tsparticles/engine`, `@tsparticles/slim` | Sparkles (et Cover / Compare, qui l'embarquent) |
| `simplex-noise` | Vortex |
| `@radix-ui/react-hover-card`, `qss` | Link Preview |
| `cobe` ou `three-globe` | 3D Globe (selon la page Aceternity) |
| `@fontsource-variable/unbounded`, `@fontsource/instrument-serif`, `@fontsource-variable/jetbrains-mono` | les fichiers Google Fonts, auto-hébergés et préchargés |

Les autres dépendances Aceternity seront ajoutées d'après la page de chaque composant.

**Dev**

| Paquet | Rôle |
|---|---|
| `vite` 8, `@vitejs/plugin-react`, `typescript` (version du template Vite) | build |
| `tailwindcss` 4.3, `@tailwindcss/vite` | styles |
| `@types/react`, `@types/react-dom`, `@types/three` | types |
| `shadcn` (via npx) | installation des composants |
| `sharp`, `tsx` | pipeline d'images (scripts TypeScript) |
| `playwright` (Chromium déjà présent) | script de contrôle : erreurs console, CLS, captures desktop et mobile après chaque section |
| `eslint` (config du template Vite) | lint |

Shaders GLSL importés en `?raw` (natif dans Vite, sans plugin).

---

## 2. Arborescence

```
proxima-b/
├── index.html
├── package.json · vite.config.ts · tsconfig*.json · components.json · eslint.config.js
├── docs/PROPOSITION.md
├── public/
│   └── images/                          ← sorties sharp : AVIF + WebP en 640 / 1280 / 2560
│       ├── proxima-b/   star/   alpha-centauri/   space/
│       └── missions/    earth/  telescopes/
├── scripts/
│   ├── images.manifest.ts               ← source de vérité : URL source, page, crédit, licence, alt FR, catégorie
│   ├── fetch-images.ts                  ← téléchargement des originaux (.cache/, ignoré par git)
│   ├── optimize-images.ts               ← sharp → variantes + placeholder base64 → génère src/data/images.ts
│   └── check.ts                         ← Playwright : console, CLS, captures
└── src/
    ├── main.tsx · App.tsx
    ├── styles/      globals.css (@theme : palette, typos, easing, z-index des calques)
    ├── data/        images.ts · facts.ts · glossary.ts · sections.ts · missions.ts · timeline.ts · voyage.ts
    ├── lib/         utils.ts (cn) · gsap.ts · motion.ts (easing, durées) · store.ts
    ├── providers/
    │   ├── PreferencesProvider.tsx      ← qualité 3D + mouvements réduits (panneau Mission + prefers-reduced-motion)
    │   ├── SmoothScrollProvider.tsx     ← Lenis ↔ ScrollTrigger
    │   ├── ActiveSectionProvider.tsx    ← section active → Notch, Dock, scène 3D, curseur
    │   └── HeavyEffectsProvider.tsx     ← budget : 2 effets canvas lourds montés au maximum
    ├── hooks/       useIsTouch · useMediaQuery · useMountInView · usePageVisibility · useWebGL
    ├── three/                           ← calque 0 : un seul <Canvas> fixe
    │   ├── Experience.tsx · CameraRig.tsx · PostFX.tsx · CssFallback.tsx
    │   ├── objects/  Starfield.tsx · Planet.tsx · Atmosphere.tsx · Star.tsx · Flares.tsx
    │   └── shaders/  planet.* · atmosphere.* · star.* (convection) · starfield.* · liquid.*
    ├── components/
    │   ├── ui/                          ← composants MP + Aceternity installés, re-stylés
    │   ├── layout/   Section (feuille sticky) · Layer · Navbar · DockNav · SectionNotch · SignalBanner
    │   │             MissionPanel · CustomCursor · AmbientOverlays (grain, vignette, ProgressiveBlur)
    │   ├── text/     RevealText · GlossaryTerm · SourceLink · ImageFilledText
    │   ├── media/    Picture · Lightbox · CurtainReveal · Duotone · LiquidImage · ImageTrail · CircleReveal
    │   └── loader/   SignalLoader · RadioWave
    └── sections/                        ← React.lazy, sauf Loader et Hero
        ├── Hero/  Distance/  Donnees/  Hubble/  JourNuit/  Etoile/
        └── Habitable/  Decouverte/  Voyage/  Archives/  Footer/
```

---

## 3. Motion Primitives — 28 composants

Commande : `npx shadcn@latest add "https://motion-primitives.com/c/<nom>.json"`. Si l'hôte reste bloqué, j'utilise la même URL de fichier sur raw.githubusercontent.com (dépôt officiel, contenu identique).

| Composant | Usage |
|---|---|
| `cursor` | curseur global : point `--dwarf`, anneau, label contextuel (désactivé sur tactile) |
| `magnetic` | boutons et liens principaux |
| `scroll-progress` | barre de 2 px, dégradé `--glow` → `--dwarf` |
| `progressive-blur` | bord bas du viewport, sous la navbar |
| `animated-background` | survol des liens de la navbar |
| `text-roll` | texte des liens de la navbar, labels Jour/Nuit |
| `dock` | navigation basse (une icône Lucide par section) |
| `sliding-number` | % du loader, Notch, horloge Proxima b, années du Voyage, température des éruptions |
| `toolbar-expandable` | panneau Mission (Qualité 3D / Mouvements / Sources) |
| `in-view` | entrée des blocs |
| `animated-group` | entrée des groupes (`blur-slide`, `zoom`, `flip`) |
| `text-effect` | titres et paragraphes, via `<RevealText>` |
| `text-scramble` | petits labels en mono |
| `text-shimmer` | lignes de données techniques |
| `text-shimmer-wave` | « ACQUISITION DU SIGNAL », « ÉRUPTION DÉTECTÉE » |
| `text-morph` | km → années-lumière, libellés de boutons, « Signal envoyé… » |
| `spinning-text` | badges circulaires (scroll, étoile) |
| `animated-number` | tous les compteurs |
| `glow-effect` | derrière « Commencer le voyage » |
| `tilt` | images et cartes non couvertes par Comet, Glare ou 3D Card |
| `morphing-dialog` | lightbox de toutes les images, détails des cartes bento |
| `border-trail` | carte « Zone habitable » |
| `infinite-slider` | faits courts (Données), marquee du footer |
| `transition-panel` | Face jour / Terminateur / Face nuit |
| `accordion` | détails Pour / Contre |
| `disclosure` | « Ce que l'ELT pourra mesurer » |
| `carousel` | Voyage sur mobile |
| `morphing-popover` | « Envoyer un signal » |

---

## 4. Aceternity UI — 71 composants gratuits

Commande : celle indiquée sur `https://ui.aceternity.com/components/<slug>` (en général `npx shadcn@latest add @aceternity/<nom>`). En cas d'échec, je copie le code de la page.
✱ = composant récent dont je n'ai pas pu lire le code (hôte bloqué). Pour chaque composant, je vérifierai la commande exacte, la gratuité et les dépendances. S'il est payant ou introuvable, je m'arrête et je te propose un remplaçant.

| Zone | Composants (slug de page) |
|---|---|
| Global (8) | `resizable-navbar`, `notch` ✱, `sticky-banner`, `tooltip-card`, `link-preview`, `pointer-highlight`, `images-badge` ✱, `animated-modal` |
| Loader (2) | `multi-step-loader`, `encrypted-text` ✱ (aussi pour les coordonnées du hero) |
| Hero (8) | `shooting-stars-and-stars-background` (étoiles filantes seulement), `spotlight-new`, `parallax-hero-images` ✱, `sparkles`, `hero-highlight`, `container-text-flip`, `moving-border`, `hover-border-gradient` |
| Distance (6) | `lamp-effect`, `colourful-text`, `google-gemini-effect`, `cover`, `text-generate-effect`, `background-lines` |
| Données (8) | `bento-grid`, `glowing-effect`, `comet-card`, `glowing-stars-effect`, `canvas-reveal-effect`, `evervault-card`, `terminal` ✱, `ascii-art` ✱ |
| Hubble (2) | `container-scroll-animation`, `lens` |
| Jour / Nuit (3) | `compare`, `svg-mask-effect`, `images-slider` |
| L'étoile (5) | `vortex`, `background-beams-with-collision`, `meteors`, `chromatic-image` ✱, `dither-shader` ✱ |
| Habitable (7) | `aurora-background`, `canvas-text` ✱, `squiggly-text` ✱, `flip-words`, `focus-cards`, `parallax-scroll`, `wobble-card` |
| Découverte (4) | `timeline`, `3d-globe` ✱, `pixelated-canvas`, `glare-card` (placement proposé : vues d'artiste ESO mises en avant aux étapes 2016 et 2022) |
| Voyage (4) | `text-flipping-board` ✱, `layout-text-flip`, `3d-card-effect`, `apple-cards-carousel` |
| Archives (9) | `hero-parallax`, `3d-marquee`, `direction-aware-hover`, `image-generation-loader` ✱, `tabs` (Animated Tabs), `layout-grid`, `draggable-card`, `following-pointer`, `background-gradient-animation` |
| Footer (5) | `background-beams`, `dotted-glow-background`, `placeholders-and-vanish-input`, `stateful-button`, `text-hover-effect` |

Aucun composant de la liste d'exclusion (section 7 du brief) n'est prévu.

---

## 5. Arbitrages à valider

1. **Feuilles empilées et fonds transparents.** Si chaque section est transparente pour laisser voir le calque 0, la suivante ne peut pas recouvrir la précédente. Je propose un voile `--void` par feuille, d'opacité variable : ≈ 0 % dans le Hero et Jour/Nuit (la planète est le sujet), 70 à 90 % dans les sections denses. Chaque feuille a un bord haut en dégradé avec une ombre. Pendant qu'elle est recouverte, la section sortante se dissout (opacité, échelle 0,96, flou).
2. **Un seul Canvas three.js.** Il porte toute la 3D du site (starfield, planète, étoile, éruptions), et les scènes changent selon la section active. Les effets Aceternity qui ont leur propre canvas ou WebGL (Canvas Reveal Effect est un Canvas R3F ; 3D Globe, Dither, Chromatic, Vortex, Sparkles, ASCII, Pixelated…) gardent le leur. Ils sont montés par IntersectionObserver, 2 au maximum en même temps ; les autres affichent une image fixe de même taille, sans layout shift.
   La distorsion liquide ne peut pas être dessinée dans le canvas principal : il est au calque 0, sous les fonds du calque 10. Elle utilise donc un seul petit canvas WebGL, partagé par les 3 images et monté seulement au survol (desktop).
3. **Haut de l'écran.** ScrollProgress, Sticky Banner, navbar et Notch se disputent le même espace. Au chargement, le Sticky Banner est tout en haut, et il se cache dès qu'on scrolle vers le bas. La Notch est accrochée au bord supérieur, au centre, façon Dynamic Island. La navbar est juste en dessous : la pilule rétrécie reste sous la Notch. La ScrollProgress occupe le bord supérieur. En bas : le Dock au centre, le panneau Mission à droite, le ProgressiveBlur sous les deux.
4. **Link Preview.** Mode statique avec des vignettes locales tirées de nos images, plutôt que le mode dynamique : celui-ci appelle microlink.io (service tiers avec quotas) depuis le navigateur du visiteur.
5. **Loader « vrai chargement ».** La planète et l'étoile sont procédurales, donc `useProgress` seul atteindrait 100 % immédiatement. La progression combine `useProgress` (textures chargées par three.js : images de la distorsion, ciel), les polices (`document.fonts`), le décodage de l'image du hero, la compilation des shaders et la première frame rendue. Timeout de 8 s → fallback CSS.
6. **Polices.** Fontsource (mêmes fichiers que Google Fonts), auto-hébergées et préchargées : aucune requête externe, aucun layout shift.
7. **« Heure locale sur Proxima b ».** En rotation synchrone, l'étoile reste immobile dans le ciel. L'horloge affichera donc la position sur l'orbite de 11,2 jours (jour J/11, hh:mm), avec une ligne d'explication.
8. **Poids des images.** La variante 2560 n'est générée que si l'original est assez grand (jamais d'agrandissement). Les originaux ne sont pas versionnés. Estimation : 40 à 60 Mo d'images dans le dépôt.

---

## 6. Chiffres (pré-vérification, à confirmer sur les sources)

| Donnée | Valeur prévue | Source à confirmer |
|---|---|---|
| Distance | 4,24 AL (4,2465 AL, 1,302 pc) ≈ 40 000 milliards de km | NASA Exoplanet Archive (parallaxe Gaia) |
| Masse minimale | ≈ 1,07 M⊕ (± 0,06) | Faria et al. 2022 (ESPRESSO), jeu de paramètres par défaut de l'Archive |
| Période orbitale | 11,19 j → « 11,2 jours » | idem |
| Demi-grand axe | 0,0485 UA → « 0,05 UA », soit ≈ 20 fois plus proche | idem |
| Température d'équilibre | ≈ 234 K = −39 °C (albédo terrestre) | Anglada-Escudé et al. 2016, communiqué eso1629 |
| Étoile | M5.5V, ≈ 3 000 K | Archive |
| Dates | 1915 (R. Innes) · 2016 (Pale Red Dot, annonce le 24/08) · 2020 (ESPRESSO) · 2022 (Proxima d) | communiqués ESO |
| Voyage | Voyager 1 (~17 km/s) → ~75 000 ans · lumière → 4 ans et 3 mois · Starshot (20 % de c) → ~20 ans | calcul à partir de la distance |
| Aller-retour de la lumière | ≈ 8,5 ans → réponse estimée = année actuelle + 9 | calcul |

Toute différence avec les sources sera corrigée et notée dans les crédits.

---

## 7. Images (plan)

- 30 à 45 images, réparties dans `proxima-b`, `star`, `alpha-centauri`, `space`, `missions`, `earth` et `telescopes`.
- **ESO** (CC BY 4.0) : vues d'artiste de Proxima b (série eso1629, dont eso1629a), surface imaginée, Proxima d (2022), système Alpha Centauri, La Silla, VLT, ELT, ciel austral.
- **ESA/Hubble et ESA/Webb** (CC BY 4.0) : Proxima Centauri vue par Hubble, nébuleuses, champs d'étoiles.
- **NASA** (domaine public sauf mention contraire, vérifié image par image) : exoplanet, red dwarf, stellar flare, Voyager, solar sail, Terre vue de l'espace, Voie lactée.
- **Unsplash** (Unsplash License) : Voie lactée, observatoires, antennes radio, déserts rouges, passés en duotone.
- Vues d'artiste légendées « Vue d'artiste ». Aucune URL inventée : une source qui échoue est remplacée par une autre.

---

## 8. Suite (après validation)

1. Collecte et optimisation des images, puis `images.ts` (nécessite les hôtes ci-dessus).
2. Socle : Vite, Tailwind, shadcn, providers, Lenis ↔ ScrollTrigger, canvas 3D fixe, calques, navbar, Dock, curseur, overlays. Il ne dépend pas des images : il peut passer en premier si les hôtes tardent à être ouverts.
3. Les sections une par une, dans l'ordre du brief. Après chacune : serveur de dev, rapport console et CLS, captures desktop et mobile, puis j'attends ton retour.
4. Passe performance, responsive et mouvements réduits, puis checklist finale.

Chaque étape est commitée et poussée sur la branche `claude/proxima-b-immersive-site-wlqo21`.
