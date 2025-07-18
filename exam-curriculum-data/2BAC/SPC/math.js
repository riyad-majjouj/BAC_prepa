// =======================================================================
// FILE: /backend/exam-curriculum-data/2BAC/SPC/math.js (VERSION REVUE)
// PURPOSE: Fournit des "Blueprints" (structures d'examen complètes) 
//          pour la génération d'épreuves de mathématiques.
// =======================================================================

module.exports = [
  // ===================================================================
  // الهيكل 1: "النموذج الكلاسيكي 2022/2023" (تحليل مع دالة مساعدة ومتتالية)
  // ===================================================================
  {
    name: "Blueprint 2022/2023 Normal Session: Classic Analysis with Suite",
    description: "Structure très classique avec un problème d'analyse guidé par une fonction auxiliaire, se terminant par une suite récurrente. Les autres exercices sont standards.",
    totalProblems: 4, 
    problems: [
      {
        problemTitle: "Exercice de Géométrie dans l'espace (3 points)",
        totalPointsForProblem: 3,
        domain: "GEOMETRIE",
        coreTopics: ["Produit vectoriel", "Équation de plan", "Position relative Plan/Sphère", "Représentation paramétrique d'une droite"],
        questionStructure: `
          L'objectif est de guider l'élève à travers plusieurs concepts de la géométrie dans l'espace.
          1.  Commencer par 3 points A, B, C et demander de prouver qu'ils forment un plan, en calculant le produit vectoriel AB^AC et en déduisant l'équation du plan (ABC).
          2.  Introduire une sphère (S) et étudier sa position relative avec le plan (ABC). Le cas le plus intéressant est une tangence.
          3.  Introduire une droite (Δ) définie par un point et un vecteur directeur, et étudier sa position relative avec la sphère (S) ou le plan (ABC).
        `
      },
      {
        problemTitle: "Exercice de Nombres Complexes (3 points)",
        totalPointsForProblem: 3,
        domain: "COMPLEXES",
        coreTopics: ["Forme trigonométrique", "Transformation (Rotation/Translation)", "Nature d'un triangle"],
        questionStructure: `
          L'objectif est de lier le calcul algébrique à l'interprétation géométrique.
          1.  Résoudre une équation du second degré dans C. Soient z1 et z2 les solutions.
          2.  Considérer les points A(z1), B(z2) et un autre point C(z3).
          3.  Demander de calculer le rapport (z_A-z_C)/(z_B-z_C) pour déterminer la nature exacte du triangle ABC (isocèle, rectangle, etc.).
          4.  Introduire une transformation géométrique (rotation ou homothétie) et demander de trouver l'image d'un des points.
        `
      },
      {
        problemTitle: "Exercice de Calcul des probabilités (3 points)",
        totalPointsForProblem: 3,
        domain: "PROBABILITES",
        coreTopics: ["Tirage simultané ou successif", "Probabilités conditionnelles", "Variable aléatoire"],
        questionStructure: `
          L'objectif est de modéliser une expérience aléatoire.
          1.  Décrire une urne avec des boules de différentes couleurs. L'expérience est un tirage (simultané ou successif).
          2.  Calculer la probabilité d'événements A et B.
          3.  Calculer une probabilité conditionnelle p(A|B) et vérifier si les événements sont indépendants.
          4.  Définir une variable aléatoire X (ex: nombre de boules d'une certaine couleur) et déterminer sa loi de probabilité.
        `
      },
      {
        problemTitle: "Problème d'Analyse (11 points)",
        totalPointsForProblem: 11,
        domain: "ANALYSE",
        coreTopics: ["Fonction auxiliaire", "Asymptote", "Concavité", "Suite récurrente"],
        questionStructure: `
          C'est le cœur de l'épreuve.
          - **Partie A : Étude d'une fonction auxiliaire g(x).** L'objectif est de trouver le signe de g(x) en utilisant son tableau de variation.
          - **Partie B : Étude de la fonction principale f(x).** La dérivée f'(x) doit être liée à g(x). L'étude doit inclure les limites, les branches infinies, le tableau de variation complet, et l'étude de la concavité pour trouver les points d'inflexion.
          - **Partie C : Étude d'une suite récurrente.** La suite est définie par u_{n+1} = f(u_n). Les questions doivent porter sur la démonstration par récurrence de ses bornes, l'étude de sa monotonie, et le calcul de sa limite.
        `
      }
    ]
  },
  
  // ===================================================================
  // الهيكل 2: "نموذج 2023 الاستدراكي" (تحليل بدالة معرفة بأجزاء وتكامل)
  // ===================================================================
  {
    name: "Blueprint 2023 Retake: Piecewise Function & Integration",
    description: "Un problème d'analyse centré sur une fonction définie par morceaux, avec un accent sur la continuité/dérivabilité et le calcul d'aire par intégration. Les exercices sont variés.",
    totalProblems: 4,
    problems: [
       {
        problemTitle: "Exercice sur les Suites Numériques (3 points)",
        totalPointsForProblem: 3,
        domain: "ANALYSE", // Domaine principal
        coreTopics: ["Suite arithmétique", "Suite géométrique", "Convergence"],
        questionStructure: `
          Cet exercice est indépendant du problème principal.
          1.  Introduire une suite récurrente (u_n) qui n'est ni arithmétique ni géométrique.
          2.  Demander de montrer qu'elle est bornée par récurrence.
          3.  **L'astuce :** Introduire une suite auxiliaire (v_n) liée à (u_n) (ex: v_n = 1/(u_n - k)) et demander de prouver que (v_n) est arithmétique ou géométrique.
          4.  Utiliser la nature de (v_n) pour trouver l'expression de u_n en fonction de n, puis calculer la limite de (u_n).
        `
      },
      {
        problemTitle: "Exercice de Géométrie dans l'espace (3 points)",
        totalPointsForProblem: 3,
        domain: "GEOMETRIE",
        coreTopics: ["Produit vectoriel", "Plan tangent", "Intersection Droite/Plan"],
        questionStructure: `
          L'objectif est de guider l'élève à travers plusieurs concepts de la géométrie dans l'espace.
          1.  Commencer par 3 points A, B, C et demander de prouver qu'ils forment un plan, en calculant le produit vectoriel AB^AC et en déduisant l'équation du plan (ABC).
          2.  Introduire une sphère (S) et étudier sa position relative avec le plan (ABC). Le cas le plus intéressant est une tangence.
          3.  Introduire une droite (Δ) définie par un point et un vecteur directeur, et étudier sa position relative avec la sphère (S) ou le plan (ABC).
        `
      },
      {
        problemTitle: "Exercice de Calcul des probabilités (3 points)",
        totalPointsForProblem: 3,
        domain: "PROBABILITES",
        coreTopics: ["Épreuves répétées (Bernoulli)", "Probabilités conditionnelles", "Arbre de probabilités"],
        questionStructure: `
          L'objectif est de modéliser une expérience aléatoire en plusieurs étapes.
          1.  Décrire une expérience aléatoire simple (ex: lancer un dé, tirer une boule).
          2.  Demander de répéter cette expérience n fois (schéma de Bernoulli) et de calculer la probabilité d'obtenir "exactement k succès".
          3.  Alternativement, utiliser un arbre de probabilités pour modéliser une expérience en deux temps (ex: choisir une urne puis tirer une boule) et utiliser la formule des probabilités totales.
        `
      },
      {
        problemTitle: "Problème d'Analyse (11 points)",
        totalPointsForProblem: 11,
        domain: "ANALYSE",
        coreTopics: ["Fonction par morceaux", "Continuité/Dérivabilité", "Calcul intégral", "Aire"],
        questionStructure: `
          Le problème est basé sur une fonction f définie par morceaux en un point 'a'.
          - **Partie 1 : Étude de la régularité.**
            1.  Étudier la continuité de f en 'a'.
            2.  Étudier la dérivabilité à gauche et à droite en 'a', et donner une interprétation géométrique des résultats (demi-tangentes).
          - **Partie 2 : Étude globale et variations.**
            1.  Calculer les limites aux bornes et étudier toutes les branches infinies.
            2.  Calculer f'(x) sur chaque intervalle et utiliser son signe pour dresser le tableau de variation complet de f.
          - **Partie 3 : Calcul intégral.**
            1.  Demander de calculer une intégrale I en utilisant une intégration par parties. La fonction à intégrer doit être liée à f(x).
            2.  Utiliser cette intégrale pour calculer l'aire d'un domaine plan.
        `
      }
    ]
  }
];