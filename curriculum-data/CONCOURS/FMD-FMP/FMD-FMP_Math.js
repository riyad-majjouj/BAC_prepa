// concours/FMD-FMP_Math.js
// المادة: الرياضيات - مباراة ولوج كليتي الطب والصيدلة
// المستوى: مراجعة لبرنامج البكالوريا علوم تجريبية (SVT و PC) مع تركيزات خاصة بمباريات FMD/FMP

module.exports = [
  // ===================================
  //            ANALYSE (التحليل)
  // ===================================
  {
    titreLecon: "Fonctions Numériques : Limites, Continuité, Dérivabilité",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de limites de fonctions (polynômes, rationnelles, irrationnelles, trigonométriques, ln, exp)",
      "Formes indéterminées et techniques de levée d'indétermination",
      "Continuité en un point, sur un intervalle",
      "Théorème des valeurs intermédiaires et son application à l'existence de solutions d'équations (f(x)=k, f(x)=0)",
      "Dérivabilité en un point, interprétation géométrique (tangente)",
      "Fonction dérivée, opérations sur les fonctions dérivées",
      "Dérivées des fonctions usuelles (y compris ln(u), exp(u), u^n, sin(ax+b), cos(ax+b))"
    ]
  },
  {
    titreLecon: "Étude de Fonctions et Représentation Graphique",
    langueContenu: "fr",
    paragraphes: [
      "Sens de variation d'une fonction et signe de sa dérivée",
      "Tableau de variations complet",
      "Extremums (maximum, minimum) d'une fonction",
      "Concavité, convexité et points d'inflexion (étude à partir du signe de f'')",
      "Branches infinies : asymptotes horizontales, verticales, obliques (y=ax+b)",
      "Plan d'étude d'une fonction et tracé de sa courbe représentative",
      "Position relative de deux courbes"
    ]
  },
  {
    titreLecon: "Suites Numériques",
    langueContenu: "fr",
    paragraphes: [
      "Définition d'une suite, modes de génération (explicite, récurrente)",
      "Monotonie d'une suite",
      "Suites arithmétiques et géométriques (terme général, somme des n premiers termes)",
      "Limite d'une suite (convergence, divergence) - cas simples et opérations",
      "Limites des suites de référence (n^p, q^n, 1/n)",
      "Suites récurrentes du type u_(n+1) = f(u_n) : étude graphique de la convergence, recherche de la limite si convergente"
    ]
  },
  {
    titreLecon: "Fonction Logarithme Népérien (ln)",
    langueContenu: "fr",
    paragraphes: [
      "Définition, domaine, propriétés algébriques (ln(ab), ln(a/b), ln(a^r))",
      "Étude complète de la fonction ln (limites aux bornes, dérivée, variations, graphe)",
      "Résolution d'équations et inéquations contenant ln (ex: ln(X)=A, ln(X) < A)",
      "Dérivée de ln(u(x))"
    ]
  },
  {
    titreLecon: "Fonction Exponentielle (exp)",
    langueContenu: "fr",
    paragraphes: [
      "Définition comme réciproque de ln, domaine, propriétés algébriques (e^(a+b), e^(a-b), (e^a)^r)",
      "Étude complète de la fonction exp (limites aux bornes, dérivée, variations, graphe)",
      "Résolution d'équations et inéquations contenant exp (ex: e^X=A, e^X < A)",
      "Dérivée de exp(u(x))",
      "Croissances comparées (limites de x^n e^x, (ln x)/x^n, (e^x)/x^n - en 0 et +∞)"
    ]
  },
  {
    titreLecon: "Calcul Intégral",
    langueContenu: "fr",
    paragraphes: [
      "Primitives d'une fonction : définition, détermination de primitives usuelles",
      "Intégrale d'une fonction continue sur un segment [a,b] : définition, propriétés (linéarité, Chasles, positivité)",
      "Valeur moyenne d'une fonction",
      "Calcul d'intégrales à l'aide de primitives",
      "Technique d'intégration par parties (applications simples)",
      "Calcul d'aires de domaines plans délimités par une ou deux courbes et des droites verticales"
    ]
  },
  // ===================================
  //   PROBABILITÉS (الاحتمالات) - Très important
  // ===================================
  {
    titreLecon: "Dénombrement (Principes de Base)",
    langueContenu: "fr",
    paragraphes: [
      "Principe fondamental du dénombrement (produit et somme)",
      "Arrangements (avec et sans répétition) : p-listes",
      "Permutations (sans répétition)",
      "Combinaisons (sans répétition) : C(n,p)",
      "Utilisation dans des situations de tirages (successifs avec/sans remise, simultanés)"
    ]
  },
  {
    titreLecon: "Probabilités",
    langueContenu: "fr",
    paragraphes: [
      "Vocabulaire : expérience aléatoire, univers, événement, événement élémentaire, événements incompatibles, événement contraire",
      "Calcul de probabilités dans le cas d'équiprobabilité P(A) = card(A)/card(Ω)",
      "Propriétés des probabilités : P(A U B), P(Ā)",
      "Probabilité conditionnelle : P_B(A) = P(A∩B)/P(B)",
      "Formule des probabilités composées : P(A∩B) = P(A)P_A(B) = P(B)P_B(A)",
      "Événements indépendants : P(A∩B) = P(A)P(B)",
      "Formule des probabilités totales (utilisation d'arbres pondérés)",
      "Épreuves répétées, Schéma de Bernoulli",
      "Variable aléatoire discrète : loi de probabilité, fonction de répartition (cas discret)",
      "Espérance mathématique E(X), Variance V(X), Écart-type σ(X) d'une variable aléatoire discrète",
      "Loi binomiale B(n,p) : définition, calcul de P(X=k), espérance E(X)=np, variance V(X)=np(1-p)"
    ]
  }
  // La géométrie dans l'espace est généralement moins présente ou absente.
  // Les nombres complexes sont aussi moins fréquents, mais des bases peuvent apparaître.
];