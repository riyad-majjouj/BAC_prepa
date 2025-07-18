// Ce fichier définit le curriculum de mathématiques pour la 2ème année du Baccalauréat Sciences Mathématiques.
// Il est structuré pour guider l'IA dans la création de problèmes complexes et pertinents.

// Le module exporte un objet avec deux clés principales:
// 1. 'lecons': Une liste de leçons individuelles avec des objectifs spécifiques.
// 2. 'problemesIntegres': Une liste de thèmes de problèmes complexes qui combinent plusieurs leçons.

module.exports = {
    /**
     * Liste des leçons individuelles.
     * Chaque leçon contient :
     * - titreLecon: Le nom du chapitre.
     * - domaine: Le champ des mathématiques (Analyse, Algèbre, etc.).
     * - objectifsSpecifiques: Un tableau d'instructions pour l'IA, décrivant les types de questions difficiles
     *   et abstraites à poser, inspirées des examens nationaux.
     */
    lecons: [
        // --- ANALYSE ---
        {
            titreLecon: "Continuité, Dérivabilité et Étude de fonctions",
            domaine: "Analyse",
            objectifsSpecifiques: [
                "Établir une inégalité en étudiant les variations d'une fonction auxiliaire (un classique).",
                "Utiliser le théorème des valeurs intermédiaires (TVI) pour prouver l'existence de solutions uniques à des équations de type f(x)=k ou f(x)=x.",
                "Étudier des fonctions réciproques (domaine, continuité, dérivabilité).",
                "Déterminer des limites complexes nécessitant des changements de variable ou des théorèmes d'encadrement.",
                "Analyser les branches infinies (asymptotes obliques, branches paraboliques) et la position relative de la courbe."
            ]
        },
        {
            titreLecon: "Fonctions Logarithmique et Exponentielle",
            domaine: "Analyse",
            objectifsSpecifiques: [
                "Construire des problèmes où la solution nécessite l'introduction d'une fonction auxiliaire de type g(x) = f(x) - x.",
                "Comparer les croissances de x^a, ln(x) et e^x à l'infini.",
                "Résoudre des équations/inéquations où les variables sont dans les exposants ou à l'intérieur de logarithmes."
            ]
        },
        {
            titreLecon: "Calcul intégral",
            domaine: "Analyse",
            objectifsSpecifiques: [
                "Utiliser l'intégration par parties de manière créative (parfois plusieurs fois de suite).",
                "Calculer l'aire d'un domaine délimité par plusieurs courbes, nécessitant de trouver leurs points d'intersection.",
                "Encadrer une intégrale sans la calculer, en utilisant les propriétés de l'intégrale et les bornes de la fonction."
            ]
        },
        {
            titreLecon: "Suites numériques",
            domaine: "Analyse",
            objectifsSpecifiques: [
                "Démontrer la convergence d'une suite en utilisant la récurrence pour prouver qu'elle est bornée, puis étudier sa monotonie.",
                "Étudier une suite de type U_{n+1} = f(U_n) et utiliser les résultats de l'étude de f.",
                "Appliquer le théorème des accroissements finis pour majorer |U_{n+1} - a| en fonction de |U_n - a|."
            ]
        },
        {
            titreLecon: "Équations différentielles",
            domaine: "Analyse",
            objectifsSpecifiques: [
                "Trouver la solution d'une équation différentielle qui vérifie une condition non standard (ex: la tangente en un point est horizontale).",
                "Modéliser une situation physique simple avec une équation différentielle."
            ]
        },

        // --- NOMBRES COMPLEXES ---
        {
            titreLecon: "Nombres Complexes (Formes et Équations)",
            domaine: "Nombres Complexes",
            objectifsSpecifiques: [
                "Utiliser les formules d'Euler pour la linéarisation de cos^n(x) ou sin^n(x).",
                "Résoudre des équations de degré > 2 qui peuvent être ramenées au degré 2 par un changement de variable (ex: Z^4 + aZ^2 + b = 0).",
                "Travailler avec les racines n-ièmes de l'unité et leurs propriétés géométriques."
            ]
        },
        {
            titreLecon: "Géométrie et Nombres Complexes",
            domaine: "Nombres Complexes",
            objectifsSpecifiques: [
                "Caractériser géométriquement des transformations complexes non standards.",
                "Utiliser les nombres complexes pour prouver l'alignement de points, l'orthogonalité de droites ou la nature d'un polygone.",
                "Interpréter géométriquement le module et l'argument de (z-a)/(z-b)."
            ]
        },

        // --- ARITHMÉTIQUE ET STRUCTURES ---
        {
            titreLecon: "Arithmétique dans Z",
            domaine: "Arithmétique",
            objectifsSpecifiques: [
                "Résoudre une équation diophantienne ax + by = c en utilisant l'algorithme d'Euclide et le théorème de Bézout.",
                "Utiliser le petit théorème de Fermat pour simplifier des puissances dans des congruences (ex: calculer 7^2023 mod 11).",
                "Résoudre un système de congruences (théorème des restes chinois, cas simples).",
                "Faire des raisonnements par l'absurde ou par disjonction de cas."
            ]
        },
        {
            titreLecon: "Structures Algébriques",
            domaine: "Structures Algébriques",
            objectifsSpecifiques: [
                "Démontrer qu'un ensemble muni de deux lois est un anneau ou un corps (ex: E ensemble de matrices, ou C muni de lois spéciales).",
                "Étudier les propriétés d'un morphisme de groupes ou d'anneaux.",
                "Travailler avec l'anneau Z/nZ, trouver les éléments inversibles, résoudre des équations.",
                "Prouver qu'un ensemble est un sous-espace vectoriel d'un espace de référence (comme les fonctions ou les matrices)."
            ]
        },
    ],

    /**
     * Problèmes Intégrés : Ce sont les problèmes les plus difficiles et les plus représentatifs.
     * Ils combinent plusieurs chapitres en un seul exercice cohérent.
     * L'IA devrait être fortement encouragée à choisir parmi ceux-ci.
     */
    problemesIntegres: [
        {
            titreProbleme: "Problème d'Analyse complet : Étude d'une fonction et d'une suite associée",
            lessonsImpliquees: ["Étude de fonctions", "Suites numériques", "Calcul intégral"],
            poidsApproximatif: "8-11 points",
            description: "Un long problème en plusieurs parties. Partie 1 : étude d'une fonction auxiliaire g. Partie 2 : étude d'une fonction principale f en utilisant g. Partie 3 : étude de la convergence d'une suite U_{n+1}=f(U_n) ou calcul d'une aire liée à f."
        },
        {
            titreProbleme: "Problème d'Algèbre : Arithmétique et Structures",
            lessonsImpliquees: ["Arithmétique dans Z", "Structures Algébriques"],
            poidsApproximatif: "3-5 points",
            description: "Un problème qui utilise les outils de l'arithmétique (congruences, Fermat) pour étudier les propriétés d'une structure algébrique, typiquement l'anneau Z/nZ, ou un corps fini."
        },
        {
            titreProbleme: "Problème de Nombres Complexes et Géométrie/Arithmétique",
            lessonsImpliquees: ["Nombres Complexes", "Arithmétique dans Z"],
            poidsApproximatif: "3-4 points",
            description: "Un problème qui utilise les racines de l'unité ou les transformations complexes pour résoudre une question de géométrie ou de dénombrement (alignement, nature d'un triangle, etc.) ou pour trouver des solutions entières à des équations."
        }
    ]
};