// concours/ENSA_Math.js
// المادة: الرياضيات - مباراة ولوج ENSA
// المستوى: مراجعة شاملة لبرنامج البكالوريا علوم رياضية مع تركيزات خاصة بمباريات ENSA

module.exports = [
  // ===================================
  //            ANALYSE (التحليل)
  // ===================================
  {
    titreLecon: "Fonctions Numériques : Limites, Continuité, Dérivabilité",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de limites (techniques avancées, développements limités simples - si pertinent pour ENSA)",
      "Théorèmes de comparaison, théorème des gendarmes",
      "Continuité et théorème des valeurs intermédiaires (applications complexes)",
      "Dérivabilité, interprétation géométrique, fonction dérivée",
      "Théorème de Rolle, Théorème des Accroissements Finis (T.A.F), Inégalité des Accroissements Finis (I.A.F)",
      "Dérivées successives, formule de Taylor-Young (mention ou application simple)",
      "Étude complète de fonctions (asymptotes, branches paraboliques, convexité, points d'inflexion)"
    ]
  },
  {
    titreLecon: "Suites Numériques",
    langueContenu: "fr",
    paragraphes: [
      "Convergence de suites (critères, suites monotones et bornées, suites adjacentes)",
      "Suites récurrentes u_(n+1) = f(u_n) (étude de la convergence, points fixes)",
      "Suites récurrentes linéaires d'ordre 2 à coefficients constants",
      "Comparaison de suites (négligeabilité o, équivalence ~), utilisation pour le calcul de limites",
      "Sommation de termes de suites usuelles"
    ]
  },
  {
    titreLecon: "Fonctions Logarithmiques, Exponentielles et Puissances",
    langueContenu: "fr",
    paragraphes: [
      "Propriétés et étude complète des fonctions ln, exp, x ↦ a^x, x ↦ x^α",
      "Croissances comparées, limites usuelles complexes",
      "Résolution d'équations et inéquations avancées",
      "Fonctions hyperboliques (ch, sh, th) : définitions, propriétés, dérivées (souvent utiles)"
    ]
  },
  {
    titreLecon: "Calcul Intégral",
    langueContenu: "fr",
    paragraphes: [
      "Primitives et intégrales définies (propriétés, calculs directs)",
      "Intégration par parties (applications multiples et astucieuses)",
      "Changement de variable (choix judicieux)",
      "Intégrales de fonctions rationnelles (décomposition en éléments simples - cas de base)",
      "Intégrales impropres (convergence, calcul - si abordé de manière basique)",
      "Applications géométriques : aires, volumes, longueur d'arc (parfois)",
      "Fonctions définies par une intégrale, dérivation sous le signe somme (si pertinent)"
    ]
  },
  {
    titreLecon: "Équations Différentielles",
    langueContenu: "fr",
    paragraphes: [
      "Équations différentielles linéaires du premier ordre (avec et sans second membre)",
      "Équations différentielles linéaires du second ordre à coefficients constants (avec et sans second membre)",
      "Méthode de variation de la constante",
      "Recherche de solutions particulières (polynômes, exponentielles, fonctions trigonométriques)",
      "Problèmes de Cauchy (conditions initiales)"
    ]
  },
  {
    titreLecon: "Développements Limités (Introduction et Applications)",
    langueContenu: "fr",
    paragraphes: [
      "Formule de Taylor-Young",
      "Développements limités usuels au voisinage de 0 (e^x, sin x, cos x, ln(1+x), (1+x)^α)",
      "Opérations sur les développements limités (somme, produit, quotient, composition)",
      "Application au calcul de limites, recherche d'asymptotes, étude locale de courbes"
    ]
  },

  // ===================================
  //     ALGÈBRE ET GÉOMÉTRIE (الجبر والهندسة)
  // ===================================
  {
    titreLecon: "Nombres Complexes",
    langueContenu: "fr",
    paragraphes: [
      "Formes algébrique, trigonométrique, exponentielle",
      "Opérations, module, argument, propriétés",
      "Formules de Moivre et d'Euler, applications (linéarisation, factorisation de polynômes)",
      "Racines n-ièmes de l'unité, racines n-ièmes d'un nombre complexe",
      "Résolution d'équations polynomiales dans C",
      "Interprétation géométrique des nombres complexes, transformations du plan (translations, rotations, homothéties, similitudes directes)"
    ]
  },
  {
    titreLecon: "Arithmétique dans Z",
    langueContenu: "fr",
    paragraphes: [
      "Divisibilité, division euclidienne, PGCD, PPCM",
      "Algorithme d'Euclide, Théorème de Bézout, Théorème de Gauss",
      "Nombres premiers, décomposition en facteurs premiers",
      "Congruences, résolution d'équations de congruences (ax ≡ b [n])",
      "Petit théorème de Fermat"
    ]
  },
  {
    titreLecon: "Structures Algébriques (Groupes, Anneaux, Corps)",
    langueContenu: "fr",
    paragraphes: [
      "Lois de composition interne, propriétés",
      "Groupes (exemples : (Z,+), (R*,x), (C*,x), groupes de permutations S_n, groupes de matrices GLn(R))",
      "Sous-groupes, morphismes de groupes, noyau, image",
      "Anneaux (exemples : (Z,+,x), (K[X],+,x), (Mn(K),+,x))",
      "Idéaux (notion), anneaux intègres",
      "Corps (exemples : Q, R, C, Z/pZ avec p premier)"
    ]
  },
  {
    titreLecon: "Polynômes",
    langueContenu: "fr",
    paragraphes: [
      "Anneau K[X] des polynômes à coefficients dans K (K=R ou C)",
      "Degré, opérations sur les polynômes, division euclidienne",
      "Racines d'un polynôme, multiplicité",
      "Théorème de d'Alembert-Gauss (énoncé)",
      "Relations entre coefficients et racines",
      "Polynômes irréductibles sur R et C",
      "Fractions rationnelles (décomposition en éléments simples)"
    ]
  },
  {
    titreLecon: "Espaces Vectoriels et Applications Linéaires",
    langueContenu: "fr",
    paragraphes: [
      "Espaces vectoriels sur R ou C (exemples : R^n, C^n, espaces de polynômes, de fonctions, de matrices)",
      "Sous-espaces vectoriels, combinaisons linéaires, familles libres/génératrices, bases, dimension",
      "Somme, somme directe de sous-espaces",
      "Applications linéaires, noyau, image, rang, théorème du rang",
      "Matrice d'une application linéaire dans des bases données, changement de bases",
      "Endomorphismes, isomorphismes, automorphismes"
    ]
  },
  {
    titreLecon: "Calcul Matriciel et Systèmes Linéaires",
    langueContenu: "fr",
    paragraphes: [
      "Opérations sur les matrices (somme, produit par un scalaire, produit matriciel)",
      "Matrices carrées, transposée, trace",
      "Matrices inversibles, calcul de l'inverse (méthode de Gauss-Jordan, comatrice)",
      "Déterminants (propriétés, calcul pour n=2,3 et par développement)",
      "Rang d'une matrice",
      "Résolution de systèmes linéaires (méthode du pivot de Gauss, interprétation matricielle)"
    ]
  },
  {
    titreLecon: "Géométrie Analytique de l'Espace",
    langueContenu: "fr",
    paragraphes: [
      "Produit scalaire, vectoriel, mixte (propriétés et applications)",
      "Représentations de droites et plans, intersections, parallélisme, orthogonalité",
      "Distances (point-droite, point-plan, entre deux droites)",
      "Sphères, plans tangents",
      "Courbes paramétrées et surfaces (notions, si abordé)"
    ]
  },

  // ===================================
  //      PROBABILITÉS (الاحتمالات)
  // ===================================
  {
    titreLecon: "Dénombrement et Analyse Combinatoire",
    langueContenu: "fr",
    paragraphes: [
      "Principes fondamentaux (somme, produit)",
      "Arrangements, permutations, combinaisons (avec et sans répétition)",
      "Formule du binôme de Newton, triangle de Pascal",
      "Problèmes de dénombrement complexes"
    ]
  },
  {
    titreLecon: "Probabilités Discrètes",
    langueContenu: "fr",
    paragraphes: [
      "Espace probabilisé, événements, probabilité",
      "Probabilité conditionnelle, indépendance",
      "Formule des probabilités totales, formule de Bayes",
      "Variables aléatoires discrètes : loi, fonction de répartition, espérance, variance, écart-type",
      "Lois usuelles : Bernoulli, binomiale, géométrique, de Poisson (et leurs applications)"
    ]
  },
  {
    titreLecon: "Variables Aléatoires Continues (ou à densité)",
    langueContenu: "fr",
    paragraphes: [
      "Densité de probabilité, fonction de répartition",
      "Espérance, variance, écart-type",
      "Lois usuelles : uniforme, exponentielle, normale (loi normale centrée réduite, loi normale générale, utilisation des tables)"
      // "Théorème Central Limite (énoncé et signification, si pertinent pour ENSA)"
    ]
  }
];