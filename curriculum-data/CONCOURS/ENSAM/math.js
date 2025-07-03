// concours/ENSAM_Math.js
// المادة: الرياضيات - تم تحديثه ليشمل مواضيع العلوم الرياضية المتقدمة

module.exports = [
  // ===================================
  // ANALYSE (التحليل)
  // ===================================
  {
    titreLecon: "Analyse de Fonctions",
    langueContenu: "fr",
    paragraphes: [
      "Lever des indéterminations complexes avec les développements limités ou la règle de l'Hôpital.",
      "Application du théorème des accroissements finis (TAF) pour obtenir des encadrements.",
      "Étude de la convexité et points d'inflexion via le signe de la dérivée seconde.",
      "Étude complète de fonctions trigonométriques réciproques (Arcsin, Arccos, Arctan).",
      "Étude complète de fonctions hyperboliques et leurs réciproques (sh, ch, Argsh, Argch)."
    ]
  },
  {
    titreLecon: "Suites Numériques Avancées",
    langueContenu: "fr",
    paragraphes: [
      "Étude de la convergence de suites récurrentes linéaires d'ordre 2 ($au_{n+2}+bu_{n+1}+cu_n=0$).",
      "Détermination de la nature et de la limite d'une suite définie par une somme ou un produit.",
      "Utilisation des suites adjacentes pour prouver la convergence et encadrer la limite.",
      "Étude de suites implicites définies par une équation ($f_n(x)=0$).",
      "Convergence et calcul de la somme d'une série géométrique dérivée."
    ]
  },
  {
    titreLecon: "Calcul Intégral et Équations Différentielles",
    langueContenu: "fr",
    paragraphes: [
      "Intégration par parties multiples pour des fonctions comme $x^n e^x$ ou $x^n \\cos(x)$.",
      "Calcul d'intégrales par changement de variable (trigonométrique ou hyperbolique).",
      "Décomposition en éléments simples de fractions rationnelles pour l'intégration.",
      "Résolution d'équations différentielles du second ordre avec second membre polynomial ou trigonométrique.",
      "Calcul de volumes de solides de révolution autour de l'axe (Oy)."
    ]
  },
  // ===================================
  // ALGÈBRE ET GÉOMÉTRIE
  // ===================================
  {
    titreLecon: "Nombres Complexes et Géométrie",
    langueContenu: "fr",
    paragraphes: [
      "Résolution d'équations polynomiales complexes en utilisant les racines n-ièmes de l'unité.",
      "Interprétation géométrique des transformations complexes (similitudes directes et indirectes).",
      "Utilisation des nombres complexes pour résoudre des problèmes de géométrie plane (alignement, concours, lieux de points).",
      "Linéarisation de $\\cos^n(x)$ et factorisation de polynômes trigonométriques."
    ]
  },
  {
    titreLecon: "Algèbre Linéaire",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de déterminants de taille 3x3 et 4x4 et application à l'inversibilité d'une matrice.",
      "Résolution de systèmes linéaires à paramètres en utilisant le rang ou les déterminants (formules de Cramer).",
      "Détermination du noyau et de l'image d'une application linéaire définie par sa matrice.",
      "Calcul des valeurs propres et des vecteurs propres d'une matrice 2x2 ou 3x3 simple.",
      "Discussion de la diagonalisabilité d'une matrice."
    ]
  },
  {
    titreLecon: "Géométrie Analytique de l'Espace",
    langueContenu: "fr",
    paragraphes: [
      "Utilisation du produit mixte pour calculer le volume d'un tétraèdre ou vérifier la coplanarité.",
      "Détermination de l'équation d'un cylindre ou d'un cône de révolution.",
      "Intersection de trois plans et discussion géométrique du système associé.",
      "Calcul de la distance entre deux droites non coplanaires.",
      "Projection orthogonale d'un point sur une droite ou un plan."
    ]
  },
  // ===================================
  // PROBABILITÉS
  // ===================================
  {
    titreLecon: "Probabilités et Variables Aléatoires",
    langueContenu: "fr",
    paragraphes: [
      "Dénombrement dans des situations complexes (anagrammes avec répétitions, partages).",
      "Application de la formule de Bayes à des problèmes de diagnostic ou de test.",
      "Étude d'une variable aléatoire continue définie par sa fonction de densité.",
      "Calcul de l'espérance et de la variance pour une variable aléatoire suivant une loi exponentielle ou normale.",
      "Approximation d'une loi binomiale par une loi de Poisson ou une loi normale."
    ]
  }
];