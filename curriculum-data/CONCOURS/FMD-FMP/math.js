// concours/FMD-FMP_Math.js
// المادة: الرياضيات - مباراة ولوج كليات الطب والصيدلة (FMD/FMP)
// المستوى: محاكاة دقيقة لأسئلة المباراة التي تتطلب تحليل واستنتاج ودمج المفاهيم.

module.exports = [
  // ===================================
  //            ANALYSE (التحليل)
  // ===================================
  {
    titreLecon: "Fonctions : Limites et Propriétés",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de limites basées sur la reconnaissance de formes usuelles (exp, ln)",
      "Reconnaissance de la définition du nombre dérivé dans une limite",
      "Application du Théorème des Valeurs Intermédiaires pour justifier une existence",
      "Déduction de propriétés d'une fonction (parité, signe) à partir de son expression"
    ]
  },
  {
    titreLecon: "Dérivation et Applications",
    langueContenu: "fr",
    paragraphes: [
      "Calcul de la dérivée d'une fonction composée (ex: f(ax+b))",
      "Utilisation de la dérivée pour trouver les extrema d'une fonction",
      "Lien entre le signe de f' et la monotonie de f",
      "Détermination d'un paramètre pour qu'une tangente ait une propriété donnée (ex: parallèle à une droite)"
    ]
  },
  {
    titreLecon: "Suites Numériques",
    langueContenu: "fr",
    paragraphes: [
      "Déduction du terme général v_n à partir de la somme S_n = v_1 + ... + v_n",
      "Étude de suites récurrentes u_(n+1) = f(u_n) et leur convergence",
      "Utilisation de suites auxiliaires (géométriques/arithmétiques) pour trouver le terme général",
      "Calcul de limites de suites impliquant des formes indéterminées"
    ]
  },
  {
    titreLecon: "Calcul Intégral",
    langueContenu: "fr",
    paragraphes: [
      "Reconnaissance de primitives de la forme u'(x) * f'(u(x)) ou u'(x) / u(x)^n",
      "Calcul d'une intégrale par une intégration par parties ciblée",
      "Détermination d'une relation de récurrence entre des intégrales (ex: I_n+1 en fonction de I_n)",
      "Utilisation de conditions initiales pour déterminer une constante d'intégration (ex: F(a)=b)",
      "Calcul de l'aire d'un domaine défini par des courbes"
    ]
  },
  // ===================================
  //     ALGÈBRE ET GÉOMÉTRIE
  // ===================================
  {
    titreLecon: "Nombres Complexes",
    langueContenu: "fr",
    paragraphes: [
      "Résolution d'équations complexes et interprétation des propriétés des solutions (ex: |z|, arg(z))",
      "Interprétation géométrique d'expressions complexes (ex: |(z-a)/(z-b)| = k, arg((z-a)/(z-b)) = k')",
      "Lien entre les transformations géométriques (rotation, homothétie) et les opérations complexes",
      "Utilisation des formules d'Euler pour la linéarisation ou le calcul de sommes"
    ]
  },
  {
    titreLecon: "Géométrie Analytique et Probabilités",
    langueContenu: "fr",
    paragraphes: [
      "Combinaison d'un problème de géométrie dans l'espace avec un tirage probabiliste",
      "Détermination de la probabilité qu'un point (dont les coordonnées dépendent d'un aléa) appartienne à un ensemble (plan, sphère, etc.)",
      "Calcul de distance d'un point à un plan ou une droite",
      "Étude de l'intersection de plans, droites et sphères"
    ]
  }
];