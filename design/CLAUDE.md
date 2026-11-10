# chams.dev — refonte de la page d'accueil

Portfolio de Chamseddine Adaadour (« Chams. »). On remplace la page d'accueil par une version
Three.js. Le design est validé : il est entièrement décrit par `design/prototype-chams.html`.

## Source de vérité

`design/prototype-chams.html` est un prototype autonome (HTML + CSS + JS, Three.js r128 en global).
Ouvre-le dans un navigateur avant de coder. Le but est de le porter fidèlement dans ce projet,
pas de le redessiner. En cas de doute sur un comportement, c'est le prototype qui a raison.

## Périmètre

- À refaire : la page d'accueil uniquement.
- À ne pas toucher : `/calculator` (calculatrice de notes) et `/hours` (suivi d'heures), ni leurs
  données, ni leurs routes. Vérifie qu'elles fonctionnent toujours à la fin.
- Avant d'écrire du code, lis la structure existante (router, i18n, config Tailwind, composants
  partagés) et réutilise ce qui existe plutôt que d'ajouter une solution parallèle.

## Stack

- Next.js + TypeScript + Tailwind CSS (déjà en place, garde les versions du projet).
- 3D : `three`, `@react-three/fiber`. `@react-three/drei` seulement si ça simplifie vraiment.
- Pas d'autre dépendance sans me demander.

## Ce que fait la page

Huit sections, dans cet ordre : Accueil, Web, Data, IA / MLOps, DevOps, Projets, Parcours, Contact.

- Une scène 3D fixe : un portable en aluminium et un téléphone, sur un fond de couleurs animé
  (shader plein écran).
- Chaque section a une palette de trois couleurs (`--p1`, `--p2`, `--p3`) qui pilote le fond, les
  titres en dégradé, les pastilles, les boutons et le point du logo. Le prototype les appelle
  `--c1..--c3`, mais ces noms sont déjà pris par les blocs de la calculatrice dans
  `app/globals.css`, et `@property` est global : on a donc renommé en `--p1..--p3`, rattachées
  au conteneur `.home` (jamais à `:root`).
- Les écrans du portable et du téléphone sont des `CanvasTexture` redessinées en continu. Chaque
  section a son « app » : éditeur de code, boutique, notebook, entraînement de modèle, pipeline
  CI/CD, grille de projets, `git log`, terminal de contact. Fondu de 0,4 s entre deux apps.
- Au défilement, la section active change, la scène passe de droite à gauche et le texte se place
  du côté opposé.
- Bascule FR / EN, mémorisée en local.

## Architecture attendue

- `content/` : tout le texte FR + EN, les projets, le parcours et les palettes dans des fichiers
  typés. Aucun texte en dur dans les composants.
- `components/scene/` : la scène R3F, chargée avec `next/dynamic` et `ssr: false`.
  - `Laptop.tsx`, `Phone.tsx` : géométries (dalles à coins arrondis extrudées, clavier AZERTY
    touche par touche, charnière, ports, webcam). Reprends les dimensions du prototype.
  - `Background.tsx` : le shader de fond.
  - `screens/laptop/*.ts` et `screens/phone/*.ts` : une fonction de dessin canvas 2D par app,
    signature `(ctx, t, env) => void` avec `env = { lang, palettes, fonts }`, sans dépendance à
    React. `fonts` contient les vrais noms de famille de `next/font` (`lib/home-fonts.ts`) : jamais
    de `"JetBrains Mono"` en dur, et attendre `document.fonts.load` avant le premier dessin. Porte-les telles quelles depuis le
    prototype (fonctions `appCode`, `appShop`, `appNotebook`, `appTrain`, `appCI`, `appProjects`,
    `appGit`, `appContact`, et `pHome` … `pCard`).
- `components/sections/` : le HTML des sections, rendu côté serveur pour le SEO.
- Un hook `useScrollProgress` qui reprend la fonction `progress()` du prototype (indice flottant
  de section, ligne de référence à 50 % de la hauteur sur ordinateur, 62 % sur mobile).

## Points à respecter

- Bascule de la scène adoucie par rapport au prototype (demandé le 2026-11-10) : transition sur
  0,85 de hauteur d'écran (0,45 sur mobile) au lieu de 0,5 (0,3), amortissement indépendant de la
  fréquence d'affichage (0,035 par image à 60 i/s au lieu de 0,07 / 0,06 par image).
- Mobile (≤ 820 px) : la scène est fixée dans les 43 % supérieurs de l'écran, masquée en fondu
  vers le bas, et la page défile dessous. Menu en barre horizontale défilante. Pas de défilement
  horizontal de la page.
- Performance : `devicePixelRatio` plafonné à 1,75, écrans redessinés une image sur deux,
  texture du portable en 1216×786 sur ordinateur et 1024 de large sur mobile.
- Accessibilité : `prefers-reduced-motion` fige les animations ; le canvas est `aria-hidden` ;
  focus clavier visible ; contenu lisible sans WebGL (prévoir un fond de repli en CSS).
- Three.js récent : le prototype utilise l'API r128 (`outputEncoding`, `texture.encoding`).
  Utilise les équivalents actuels (`outputColorSpace`, `texture.colorSpace`) et vérifie que les
  couleurs des écrans restent identiques au prototype.
- Reflets : l'environnement est généré par `PMREMGenerator` à partir d'une petite scène de
  panneaux lumineux, sans fichier HDR externe. Garde ce principe.

## Données à confirmer avec moi (ne pas inventer)

- Dates exactes du parcours (Licence, Master, stage, alternance).
- La répartition des heures affichée sur le téléphone (21 h / 10,5 h / 3,5 h) est un exemple.
- La boutique « Club Store » est fictive ; ne pas reprendre le nom ni l'interface de MyClub.
- Liens des projets : seuls `/calculator`, `/hours` et `chams.dev` ont une URL connue.

## Vérification avant de dire que c'est fini

1. `npm run lint` et `npm run build` passent sans erreur.
2. Capture d'écran de chaque section à 1440×900 et à 390×844, comparée au prototype ouvert aux
   mêmes tailles. Montre-moi les captures.
3. Aucune erreur dans la console du navigateur.
4. `/calculator` et `/hours` fonctionnent toujours.

## Méthode

Travaille sur une branche `refonte-home`, par étapes, avec un commit par étape :
1. contenu + sections statiques + palettes, 2. scène 3D et fond, 3. écrans du portable,
4. écrans du téléphone, 5. mobile, 6. finitions et vérifications.
