// curriculum/2bac/SPC/curriculum_2bac_spc_math.js
// Contenu axé sur le style et le niveau de l'Examen National pour 2Bac SPC

module.exports = [
  // ===================================
  // ANALYSE
  // ===================================
  {
    titreLecon: "Limites et Continuité",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de limites de fonctions irrationnelles en utilisant l'expression conjuguée.",
      "Détermination de limites de fonctions rationnelles en factorisant par le terme de plus haut degré.",
      "Application du Théorème des Valeurs Intermédiaires (TVI) pour montrer l'existence d'une solution à l'équation f(x)=k.",
      "Étude de la continuité d'une fonction définie par morceaux en un point de jonction.",
      "Calcul de limites trigonométriques en utilisant les limites de référence."
    ]
  },
  {
    titreLecon: "Dérivation et Étude de Fonctions",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de la dérivée d'une fonction composée (type g o f).",
      "Détermination de l'équation de la tangente à une courbe en un point donné.",
      "Étude du sens de variation d'une fonction à partir du signe de sa dérivée.",
      "Détermination des points d'inflexion et de la concavité à partir du signe de la dérivée seconde.",
      "Étude des branches infinies (asymptotes et branches paraboliques)."
    ]
  },
  {
    titreLecon: "Suites Numériques",
    langueContenu: "fr",
    paragraphes: [
      "Démonstration par récurrence qu'une suite est majorée, minorée ou bornée.",
      "Étude de la monotonie d'une suite récurrente en étudiant le signe de $u_{n+1} - u_n$.",
      "Utilisation d'une suite auxiliaire (géométrique ou arithmétique) pour exprimer $u_n$ en fonction de $n$.",
      "Calcul de la limite d'une suite récurrente convergente de la forme $u_{n+1}=f(u_n)$."
    ]
  },
  {
    titreLecon: "Fonctions Logarithmiques et Exponentielles",
    langueContenu: "fr",
    paragraphes: [
      "Résolution d'équations et inéquations complexes faisant intervenir ln(x) et e^x.",
      "Calcul de limites utilisant les croissances comparées.",
      "Calcul de dérivées de fonctions de la forme $\\ln(u(x))$ et $e^{u(x)}$.",
      "Détermination de primitives des formes $\\frac{u'}{u}$ et $u'e^u$."
    ]
  },
  {
    titreLecon: "Calcul Intégral et Équations Différentielles",
    langueContenu: "fr",
    paragraphes: [
      "Calcul d'une intégrale en utilisant une intégration par parties.",
      "Calcul de l'aire d'un domaine délimité par deux courbes.",
      "Résolution d'une équation différentielle du second ordre $ay''+by'+cy=0$.",
      "Trouver la solution particulière d'une équation différentielle $y'=ay+f(x)$."
    ]
  },
  // ===================================
  // AUTRES DOMAINES
  // ===================================
  {
    titreLecon: "Nombres Complexes",
    langueContenu: "fr",
    paragraphes: [
      "Résolution dans $\\mathbb{C}$ d'une équation du second degré à coefficients réels.",
      "Détermination de la forme trigonométrique ou exponentielle d'un nombre complexe.",
      "Interprétation géométrique du module et de l'argument d'un rapport $\\frac{z_C-z_A}{z_B-z_A}$.",
      "Caractérisation d'une transformation géométrique (rotation, translation) dans le plan complexe.",
      "Détermination d'un ensemble de points (cercle, médiatrice, droite)."
    ]
  },
  {
    titreLecon: "Géométrie Analytique dans l'Espace",
    langueContenu: "fr",
    paragraphes: [
      "Détermination d'une équation cartésienne d'un plan à partir d'un point et d'un vecteur normal.",
      "Calcul de la distance d'un point à un plan.",
      "Étude de la position relative d'une droite et d'une sphère.",
      "Détermination de l'intersection d'une sphère et d'un plan (cercle).",
      "Calcul du produit vectoriel pour déterminer un vecteur normal."
    ]
  },
  {
    titreLecon: "Probabilités",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de probabilités dans un cas de tirage simultané (Combinaisons $C_n^p$).",
      "Calcul de probabilités conditionnelles à l'aide d'un arbre pondéré.",
      "Application de la formule des probabilités totales.",
      "Modélisation d'une situation par une variable aléatoire suivant une loi binomiale et calcul d'espérance."
    ]
  }
];