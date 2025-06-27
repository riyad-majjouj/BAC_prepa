// concours/ENA_Math.js
// Matière: Mathématiques - Concours ENA Meknès
// Niveau: Révision du programme Bac Sciences Expérimentales (SVT, PC) et bases de Sciences Maths

module.exports = [
  // ===================================
  //            ANALYSE
  // ===================================
  {
    titreLecon: "Fonctions Numériques : Limites, Continuité, Dérivabilité",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de limites (polynômes, rationnelles, irrationnelles, trigonométriques, ln, exp)",
      "Formes indéterminées simples et techniques de résolution",
      "Continuité en un point, sur un intervalle",
      "Théorème des valeurs intermédiaires et application à l'existence de solutions d'équations f(x)=k",
      "Dérivabilité, nombre dérivé, interprétation géométrique (tangente)",
      "Fonction dérivée, opérations, dérivées des fonctions usuelles (ln(u), exp(u))"
    ]
  },
  {
    titreLecon: "Étude de Fonctions et Représentation Graphique",
    langueContenu: "fr",
    paragraphes: [
      "Sens de variation et signe de la dérivée",
      "Tableau de variations",
      "Extremums locaux",
      "Concavité et points d'inflexion (étude simple à partir de f'')",
      "Branches infinies (asymptotes horizontales, verticales, obliques simples)",
      "Construction de courbes représentatives"
    ]
  },
  {
    titreLecon: "Suites Numériques",
    langueContenu: "fr",
    paragraphes: [
      "Suites arithmétiques et géométriques (terme général, somme des termes)",
      "Monotonie d'une suite",
      "Limite d'une suite (convergence simple, opérations)",
      "Suites récurrentes du type u_(n+1) = f(u_n) (étude graphique et calcul de limite si convergente)"
    ]
  },
  {
    titreLecon: "Fonctions Logarithme Népérien et Exponentielle",
    langueContenu: "fr",
    paragraphes: [
      "Propriétés algébriques de ln et exp",
      "Étude complète de ces fonctions (limites, dérivées, variations, graphes)",
      "Résolution d'équations et inéquations simples avec ln et exp",
      "Croissances comparées (limites de base)"
    ]
  },
  {
    titreLecon: "Calcul Intégral",
    langueContenu: "fr",
    paragraphes: [
      "Primitives (définition, détermination de primitives usuelles)",
      "Intégrale définie, propriétés (linéarité, Chasles, positivité)",
      "Calcul d'intégrales par primitives",
      "Intégration par parties (cas simples)",
      "Calcul d'aires de domaines plans"
    ]
  },
  // Les équations différentielles sont moins fréquentes ou très simples si présentes.

  // ===================================
  //   PROBABILITÉS ET STATISTIQUES
  // ===================================
  {
    titreLecon: "Dénombrement",
    langueContenu: "fr",
    paragraphes: [
      "Principes de base (somme, produit)",
      "Arrangements, permutations, combinaisons (C(n,p))",
      "Utilisation dans des problèmes de tirages"
    ]
  },
  {
    titreLecon: "Probabilités",
    langueContenu: "fr",
    paragraphes: [
      "Vocabulaire des événements",
      "Calcul de probabilités en cas d'équiprobabilité",
      "Probabilité conditionnelle, événements indépendants",
      "Formule des probabilités totales (arbres pondérés)",
      "Variable aléatoire discrète : loi de probabilité, espérance, variance",
      "Loi binomiale (calcul de P(X=k), espérance, variance)"
    ]
  },
  {
    titreLecon: "Statistiques Descriptives (si pertinent pour ENA)",
    langueContenu: "fr",
    paragraphes: [
      "Séries statistiques à une variable : effectifs, fréquences, représentations graphiques (histogramme, diagramme en bâtons)",
      "Caractéristiques de position : moyenne, médiane, mode",
      "Caractéristiques de dispersion : étendue, variance, écart-type",
      "Séries statistiques à deux variables : nuage de points, point moyen (notions de base)",
      // "Ajustement affine (méthode de Mayer - si abordé)"
    ]
  }
  // La géométrie dans l'espace et les nombres complexes sont rarement au cœur du concours ENA.
];