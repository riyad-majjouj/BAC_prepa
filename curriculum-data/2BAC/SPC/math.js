// curriculum_2bac_spc_math.js
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
      "Application du Théorème des Valeurs Intermédiaires (TVI) pour montrer l'existence d'une solution.",
      "Étude de la continuité d'une fonction définie par morceaux en un point."
    ]
  },
  {
    titreLecon: "Dérivation et Étude de Fonctions",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de la dérivée d'une fonction composée (g o f).",
      "Détermination de l'équation de la tangente à une courbe en un point.",
      "Étude du sens de variation d'une fonction à partir du signe de sa dérivée.",
      "Détermination des extremums (maximum/minimum) d'une fonction."
    ]
  },
  {
    titreLecon: "Suites Numériques",
    langueContenu: "fr",
    paragraphes: [
      "Démonstration par récurrence qu'une suite est majorée ou minorée.",
      "Étude de la monotonie d'une suite récurrente ($u_{n+1} - u_n$).",
      "Utilisation d'une suite auxiliaire (géométrique ou arithmétique) pour exprimer $u_n$ en fonction de $n$.",
      "Calcul de la limite d'une suite récurrente convergente ($u_{n+1}=f(u_n)$)."
    ]
  },
  {
    titreLecon: "Fonctions Logarithmiques et Exponentielles",
    langueContenu: "fr",
    paragraphes: [
      "Résolution d'équations et inéquations simples avec ln(x) ou e^x.",
      "Calcul de limites utilisant les croissances comparées de base.",
      "Calcul de dérivées de fonctions de la forme $\\ln(u(x))$ et $e^{u(x)}$.",
      "Détermination de primitives de la forme $\\frac{u'}{u}$ et $u'e^u$."
    ]
  },
  {
    titreLecon: "Calcul Intégral et Équations Différentielles",
    langueContenu: "fr",
    paragraphes: [
      "Calcul d'une intégrale en utilisant une intégration par parties.",
      "Calcul de l'aire d'un domaine délimité par une courbe et l'axe des abscisses.",
      "Résolution d'une équation différentielle du second ordre $ay''+by'+cy=0$.",
      "Résolution d'une équation différentielle du premier ordre $y'=ay+b$."
    ]
  },
  // ===================================
  // NOMBRES COMPLEXES, GÉOMÉTRIE, PROBABILITÉS
  // ===================================
  {
    titreLecon: "Nombres Complexes",
    langueContenu: "fr",
    paragraphes: [
      "Résolution dans $\\mathbb{C}$ d'une équation du second degré à coefficients réels.",
      "Détermination de la forme trigonométrique ou exponentielle d'un nombre complexe.",
      "Interprétation géométrique du module et de l'argument.",
      "Détermination d'un ensemble de points (cercle ou médiatrice)."
    ]
  },
  {
    titreLecon: "Géométrie Analytique dans l'Espace",
    langueContenu: "fr",
    paragraphes: [
      "Détermination d'une équation cartésienne d'un plan.",
      "Calcul de la distance d'un point à un plan.",
      "Étude de la position relative d'une droite et d'un plan.",
      "Détermination de l'équation d'une sphère et de son intersection avec un plan."
    ]
  },
  {
    titreLecon: "Probabilités",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de probabilités en utilisant le dénombrement (Combinaisons $C_n^p$).",
      "Calcul de probabilités conditionnelles à l'aide d'un arbre pondéré.",
      "Application de la formule des probabilités totales.",
      "Modélisation d'une situation par une variable aléatoire suivant une loi binomiale."
    ]
  }
];