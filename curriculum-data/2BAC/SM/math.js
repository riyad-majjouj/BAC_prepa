// 2bac_sm_math.js
// المادة: الرياضيات
// المستوى: السنة الثانية بكالوريا
// الشعبة: علوم رياضية (أ و ب)

module.exports = [
    // === ANALYSE ===
    {
        titreLecon: "Limites et Continuité",
        langueContenu: "fr",
        paragraphes: [
            "Limites d'une fonction numérique (rappels et approfondissements)",
            "Continuité en un point, sur un intervalle",
            "Image d'un intervalle par une fonction continue",
            "Théorème des valeurs intermédiaires, applications (existence de solutions d'équations)",
            "Fonction réciproque d'une fonction continue et strictement monotone",
            "Branches infinies, asymptotes (étude complète)"
        ]
    },
    {
        titreLecon: "Dérivabilité et Étude de Fonctions",
        langueContenu: "fr",
        paragraphes: [
            "Dérivabilité en un point, interprétation géométrique",
            "Fonction dérivée, opérations sur les fonctions dérivées",
            "Dérivées des fonctions usuelles, dérivée d'une fonction composée, dérivée de la fonction réciproque",
            "Théorème de Rolle, Théorème des accroissements finis (T.A.F) et Inégalité des accroissements finis",
            "Sens de variation, extremums",
            "Points d'inflexion, concavité, convexité",
            "Étude complète de fonctions et représentation graphique"
        ]
    },
    {
        titreLecon: "Suites Numériques",
        langueContenu: "fr",
        paragraphes: [
            "Limites de suites (convergence, divergence, opérations)",
            "Critères de convergence (suites monotones et bornées, théorème des gendarmes)",
            "Suites adjacentes",
            "Suites récurrentes du type u_(n+1) = f(u_n), étude de la convergence",
            "Suites récurrentes linéaires d'ordre 2 (mention ou cas simples)",
            "Comparaison de suites (négligeabilité, équivalence)"
        ]
    },
    {
        titreLecon: "Fonctions Logarithmiques et Exponentielles",
        langueContenu: "fr",
        paragraphes: [
            "Fonction logarithme népérien (ln) : définition, propriétés, étude et représentation",
            "Fonction exponentielle (exp) : définition, propriétés, étude et représentation",
            "Fonctions logarithmes de base a, fonctions exponentielles de base a",
            "Croissances comparées des fonctions ln, exp et puissances",
            "Résolution d'équations et inéquations faisant intervenir ln et exp"
        ]
    },
    {
        titreLecon: "Calcul Intégral",
        langueContenu: "fr",
        paragraphes: [
            "Primitives d'une fonction, existence et unicité à une constante près",
            "Intégrale d'une fonction continue sur un segment, propriétés",
            "Interprétation géométrique (aire), valeur moyenne",
            "Techniques de calcul : primitives usuelles, intégration par parties",
            "Changement de variable (cas simples)",
            "Intégrales et ordre, encadrement d'intégrales",
            "Applications : calcul d'aires, calcul de volumes de solides de révolution",
            "Fonctions définies par une intégrale"
        ]
    },
    {
        titreLecon: "Équations Différentielles",
        langueContenu: "fr",
        paragraphes: [
            "Équations différentielles linéaires du premier ordre : y' + a(x)y = b(x)",
            "Équations différentielles linéaires du second ordre à coefficients constants : ay'' + by' + cy = f(x)",
            "Recherche de solutions particulières (méthode de variation de la constante, cas où f(x) est un polynôme, exponentielle, sin/cos)",
            "Applications"
        ]
    },
    // === ALGÈBRE ET GÉOMÉTRIE ===
    {
        titreLecon: "Arithmétique dans Z",
        langueContenu: "fr",
        paragraphes: [
            "Divisibilité dans Z, division euclidienne",
            "Plus Grand Commun Diviseur (PGCD), algorithme d'Euclide",
            "Théorème de Bézout, théorème de Gauss",
            "Plus Petit Commun Multiple (PPCM)",
            "Nombres premiers, décomposition en facteurs premiers",
            "Congruences dans Z, propriétés",
            "Équations diophantiennes du type ax + by = c"
        ]
    },
    {
        titreLecon: "Structures Algébriques",
        langueContenu: "fr",
        paragraphes: [
            "Lois de composition interne, propriétés (associativité, commutativité, élément neutre, symétrique)",
            "Groupes : définition, exemples (Z,+), (R*,x), groupes de permutations S_n (n petit), groupes de matrices",
            "Sous-groupes, morphisme de groupes, noyau, image",
            "Anneaux : définition, exemples (Z,+,x), (K[X],+,x), anneaux de matrices",
            "Idéaux d'un anneau commutatif (mention)",
            "Corps : définition, exemples (Q, R, C)",
            "Arithmétique des polynômes (si non traité séparément)"
        ]
    },
    {
        titreLecon: "Espaces Vectoriels Réels",
        langueContenu: "fr",
        paragraphes: [
            "Définition d'un espace vectoriel sur R, exemples (R^n, espaces de fonctions, espaces de suites, espaces de matrices)",
            "Sous-espaces vectoriels, caractérisation",
            "Combinaisons linéaires, famille génératrice, famille libre",
            "Base d'un espace vectoriel, dimension (finie)",
            "Coordonnées d'un vecteur dans une base",
            "Somme et somme directe de sous-espaces vectoriels",
            "Applications linéaires : définition, noyau, image, rang",
            "Matrice d'une application linéaire dans des bases données"
        ]
    },
    {
        titreLecon: "Nombres Complexes",
        langueContenu: "fr",
        paragraphes: [
            "Formes algébrique, trigonométrique, exponentielle",
            "Module, argument, propriétés",
            "Formules de Moivre et d'Euler, applications (linéarisation, factorisation)",
            "Racines n-ièmes de l'unité, racines n-ièmes d'un nombre complexe",
            "Résolution dans C d'équations polynomiales (second degré, se ramenant au second degré)",
            "Transformations géométriques du plan complexe (translation, homothétie, rotation)"
        ]
    },
    {
        titreLecon: "Géométrie Analytique de l'Espace",
        langueContenu: "fr",
        paragraphes: [
            "Produit scalaire dans l'espace, expression analytique, propriétés, orthogonalité",
            "Produit vectoriel, expression analytique, propriétés, colinéarité, interprétation géométrique (aire)",
            "Produit mixte, expression analytique, propriétés, coplanarité, interprétation géométrique (volume)",
            "Représentations paramétriques et cartésiennes de droites et de plans",
            "Positions relatives de droites et de plans, intersections",
            "Distance d'un point à une droite, d'un point à un plan, entre deux droites",
            "Sphère : équation, positions relatives (sphère et plan, sphère et droite)"
        ]
    },
    // === PROBABILITÉS ===
    {
        titreLecon: "Dénombrement (Rappels et Compléments)",
        langueContenu: "fr",
        paragraphes: [
            "Principe fondamental du dénombrement (produit et somme)",
            "Arrangements, permutations, combinaisons (avec et sans répétition)",
            "Formule du binôme de Newton",
            "Triangle de Pascal"
        ]
    },
    {
        titreLecon: "Probabilités",
        langueContenu: "fr",
        paragraphes: [
            "Espace probabilisé, événements, probabilité d'un événement",
            "Probabilité conditionnelle, indépendance en probabilité",
            "Formule des probabilités totales, formule de Bayes",
            "Variables aléatoires discrètes : loi de probabilité, espérance, variance, écart-type",
            "Lois usuelles discrètes : loi de Bernoulli, loi binomiale, loi géométrique (mention), loi de Poisson (mention)",
            "Variables aléatoires continues (densité de probabilité, fonction de répartition, espérance, variance)",
            "Lois usuelles continues : loi uniforme, loi exponentielle, loi normale (centrée réduite et générale)"
        ]
    }
];