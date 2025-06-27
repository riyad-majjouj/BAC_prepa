// concours/ENSAM_Math.js
// المادة: الرياضيات - مباراة ولوج ENSAM
// المستوى: مراجعة شاملة لبرنامج البكالوريا علوم رياضية مع تركيزات خاصة بمباريات ENSAM

module.exports = [
  // ===================================
  //            ANALYSE (التحليل)
  // ===================================
  {
    titreLecon: "Fonctions Numériques : Étude Complète",
    langueContenu: "fr",
    paragraphes: [
      "Limites (techniques avancées, comparaison, encadrement)",
      "Continuité, Théorème des Valeurs Intermédiaires et applications",
      "Dérivabilité, fonction dérivée, T.A.F, I.A.F, applications à l'étude des variations",
      "Dérivées successives, convexité, points d'inflexion",
      "Branches infinies (asymptotes, branches paraboliques)",
      "Construction de courbes paramétrées (si pertinent pour ENSAM)"
    ]
  },
  {
    titreLecon: "Suites Numériques",
    langueContenu: "fr",
    paragraphes: [
      "Convergence, critères (monotonie et bornes, suites adjacentes)",
      "Suites arithmétiques, géométriques, arithmético-géométriques",
      "Suites récurrentes u_(n+1) = f(u_n) : étude graphique, points fixes, convergence",
      "Suites récurrentes linéaires d'ordre 2",
      "Utilisation des équivalents et négligeabilités pour les limites"
    ]
  },
  {
    titreLecon: "Fonctions Usuelles (Logarithmes, Exponentielles, Puissances, Trigonométriques et Réciproques)",
    langueContenu: "fr",
    paragraphes: [
      "Propriétés et étude des fonctions ln, exp, x ↦ a^x, x ↦ x^α",
      "Fonctions trigonométriques (sin, cos, tan) et leurs réciproques (Arcsin, Arccos, Arctan) : définitions, domaines, dérivées, graphes",
      "Fonctions hyperboliques (sh, ch, th) et leurs réciproques (Argsh, Argch, Argth) - (plus fréquent dans les concours type ENSAM/ENSA)",
      "Croissances comparées"
    ]
  },
  {
    titreLecon: "Calcul Intégral et Applications",
    langueContenu: "fr",
    paragraphes: [
      "Primitives, intégrales définies, propriétés",
      "Techniques d'intégration : intégration par parties, changement de variable",
      "Intégration de fonctions rationnelles (décomposition en éléments simples)",
      "Calcul d'aires planes, volumes de solides de révolution",
      "Longueur d'un arc de courbe (parfois)",
      "Intégrales impropres (étude de convergence simple)"
    ]
  },
  {
    titreLecon: "Équations Différentielles",
    langueContenu: "fr",
    paragraphes: [
      "Équations différentielles linéaires du premier ordre y' + a(x)y = b(x)",
      "Équations différentielles linéaires du second ordre à coefficients constants ay'' + by' + cy = f(x)",
      "Résolution avec conditions initiales (problème de Cauchy)"
    ]
  },
  {
    titreLecon: "Développements Limités (si inclus spécifiquement pour ENSAM)",
    langueContenu: "fr",
    paragraphes: [
      "Formule de Taylor-Young",
      "DL usuels au voisinage de 0 (e^x, sin x, cos x, ln(1+x), (1+x)^α, tan x, Arctan x, Argsh x, etc.)",
      "Opérations sur les DL (somme, produit, quotient, composition, intégration, dérivation)",
      "Applications : calcul de limites, asymptotes, position relative, étude de points singuliers"
    ]
  },

  // ===================================
  //     ALGÈBRE ET GÉOMÉTRIE (الجبر والهندسة)
  // ===================================
  {
    titreLecon: "Nombres Complexes",
    langueContenu: "fr",
    paragraphes: [
      "Toutes les formes et opérations",
      "Module, argument, formules de Moivre et d'Euler",
      "Applications à la trigonométrie (linéarisation, factorisation)",
      "Racines n-ièmes, résolution d'équations polynomiales",
      "Transformations géométriques du plan complexe (translation, homothétie, rotation, similitude directe)"
    ]
  },
  {
    titreLecon: "Arithmétique dans Z (Bases)",
    langueContenu: "fr",
    paragraphes: [
      "Divisibilité, PGCD, PPCM, algorithme d'Euclide",
      "Théorèmes de Bézout et de Gauss",
      "Nombres premiers",
      "Congruences (applications simples)"
    ]
  },
  {
    titreLecon: "Structures Algébriques (Notions)",
    langueContenu: "fr",
    paragraphes: [
      "Groupes (définition, exemples simples)",
      "Anneaux et Corps (définitions, exemples Z, Q, R, C)"
    ]
  },
  {
    titreLecon: "Polynômes et Fractions Rationnelles",
    langueContenu: "fr",
    paragraphes: [
      "Opérations, division euclidienne, racines, multiplicité",
      "Relations coefficients-racines",
      "Décomposition en éléments simples des fractions rationnelles (essentiel pour l'intégration)"
    ]
  },
  {
    titreLecon: "Algèbre Linéaire : Espaces Vectoriels, Applications Linéaires, Matrices",
    langueContenu: "fr",
    paragraphes: [
      "Espaces vectoriels (R^n, espaces de matrices, de polynômes)",
      "Sous-espaces vectoriels, familles libres/génératrices, bases, dimension",
      "Applications linéaires, noyau, image, rang, théorème du rang",
      "Matrices : opérations, transposée, trace, inverse",
      "Déterminants (calcul et propriétés)",
      "Systèmes d'équations linéaires (méthode de Gauss, discussion selon les paramètres)"
      // "Réduction des endomorphismes (valeurs propres, vecteurs propres, diagonalisation - si niveau ENSAM l'exige, souvent plus léger qu'ENSA)"
    ]
  },
  {
    titreLecon: "Géométrie Analytique de l'Espace",
    langueContenu: "fr",
    paragraphes: [
      "Produit scalaire, vectoriel, mixte et leurs applications (orthogonalité, colinéarité, coplanarité, aires, volumes)",
      "Représentations de droites et plans",
      "Positions relatives, intersections",
      "Distances (point-droite, point-plan, droite-droite)",
      "Sphères et plans tangents",
      "Étude de courbes paramétrées simples dans l'espace (tangente, longueur)",
      "Surfaces quadriques (cylindre, cône, paraboloïde, ellipsoïde - identification et sections planes, si pertinent)"
    ]
  },

  // ===================================
  //      PROBABILITÉS (الاحتمالات)
  // ===================================
  {
    titreLecon: "Dénombrement",
    langueContenu: "fr",
    paragraphes: [
      "Principes fondamentaux",
      "Arrangements, permutations, combinaisons",
      "Formule du binôme",
      "Problèmes de dénombrement variés"
    ]
  },
  {
    titreLecon: "Probabilités",
    langueContenu: "fr",
    paragraphes: [
      "Espace probabilisé, événements",
      "Probabilité conditionnelle, indépendance",
      "Formule des probabilités totales, formule de Bayes",
      "Variables aléatoires discrètes : loi, espérance, variance, écart-type",
      "Lois usuelles discrètes (Bernoulli, binomiale)",
      "Variables aléatoires continues : densité, fonction de répartition, espérance, variance",
      "Lois usuelles continues (uniforme, exponentielle, normale - utilisation de la loi normale centrée réduite)"
    ]
  }
];