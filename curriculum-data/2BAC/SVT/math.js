// 2bac_svt_math.js
// المادة: الرياضيات
// المستوى: السنة الثانية بكالوريا
// الشعبة: علوم الحياة والأرض (SVT)

module.exports = [
    // === ANALYSE ===
    {
        titreLecon: "Limites et Continuité",
        langueContenu: "fr",
        paragraphes: [
            "Limites d'une fonction numérique (opérations, formes indéterminées simples)",
            "Limites à droite, limites à gauche",
            "Continuité en un point, sur un intervalle",
            "Image d'un intervalle par une fonction continue (mention)",
            "Théorème des valeurs intermédiaires (application à l'existence de solutions d'équations f(x)=k)",
            "Branches infinies (asymptotes horizontales, verticales, obliques - cas simples)"
        ]
    },
    {
        titreLecon: "Dérivabilité et Étude de Fonctions",
        langueContenu: "fr",
        paragraphes: [
            "Nombre dérivé, interprétation géométrique (tangente)",
            "Fonction dérivée, opérations sur les fonctions dérivées (somme, produit, quotient)",
            "Dérivées des fonctions usuelles (polynômes, x ↦ 1/x, x ↦ √x, fonctions trigonométriques simples)",
            "Dérivée d'une fonction composée g(ax+b)",
            "Sens de variation d'une fonction et signe de sa dérivée",
            "Extremums locaux d'une fonction",
            "Points d'inflexion (identification graphique et à partir du signe de f'')",
            "Plan d'étude d'une fonction et représentation graphique"
        ]
    },
    {
        titreLecon: "Suites Numériques",
        langueContenu: "fr",
        paragraphes: [
            "Généralités sur les suites (définition, modes de génération, monotonie)",
            "Suites arithmétiques et géométriques (terme général, somme des termes)",
            "Limite d'une suite (convergence, divergence) - cas intuitifs et exemples simples",
            "Limites des suites de référence (n^p, q^n, 1/n)",
            "Opérations sur les limites de suites (somme, produit, quotient)",
            "Suites récurrentes du type u_(n+1) = f(u_n) (étude graphique de la convergence)"
        ]
    },
    {
        titreLecon: "Fonction Logarithme Népérien",
        langueContenu: "fr",
        paragraphes: [
            "Définition de la fonction ln comme primitive de x ↦ 1/x sur ]0, +∞[",
            "Propriétés algébriques de la fonction ln (ln(ab), ln(a/b), ln(a^n), ln(√a))",
            "Étude de la fonction ln (limites, dérivée, sens de variation, tableau de variation, représentation graphique)",
            "Résolution d'équations et inéquations avec ln (simples)"
        ]
    },
    {
        titreLecon: "Fonction Exponentielle (de base e)",
        langueContenu: "fr",
        paragraphes: [
            "Définition de la fonction exp comme fonction réciproque de ln",
            "Propriétés algébriques de la fonction exp (e^(a+b), e^(a-b), (e^a)^n)",
            "Étude de la fonction exp (limites, dérivée, sens de variation, tableau de variation, représentation graphique)",
            "Résolution d'équations et inéquations avec exp (simples)",
            "Dérivée de e^(u(x))"
        ]
    },
    {
        titreLecon: "Calcul Intégral",
        langueContenu: "fr",
        paragraphes: [
            "Primitives d'une fonction (définition, existence - admise)",
            "Détermination de primitives usuelles",
            "Intégrale d'une fonction continue sur un segment [a,b]",
            "Interprétation géométrique de l'intégrale (aire sous la courbe pour f ≥ 0)",
            "Propriétés de l'intégrale (linéarité, relation de Chasles, positivité)",
            "Valeur moyenne d'une fonction sur un segment",
            "Calcul d'intégrales à l'aide de primitives",
            "Intégration par parties (cas simples)",
            "Calcul d'aires de domaines plans délimités par des courbes"
        ]
    },
    // === PROBABILITÉS ET STATISTIQUES ===
    {
        titreLecon: "Dénombrement (Principes de base)",
        langueContenu: "fr",
        paragraphes: [
            "Principe additif et multiplicatif",
            "Arrangements, permutations, combinaisons (sans répétition) - définitions et utilisation",
            "Utilisation des outils de dénombrement dans des situations concrètes"
        ]
    },
    {
        titreLecon: "Probabilités",
        langueContenu: "fr",
        paragraphes: [
            "Vocabulaire des probabilités (expérience aléatoire, univers, événement, événement élémentaire)",
            "Probabilité d'un événement, propriétés (P(A U B), P(Ā))",
            "Équiprobabilité et calcul de probabilités",
            "Probabilité conditionnelle, P(A∩B) = P(A)P_A(B)",
            "Événements indépendants",
            "Formule des probabilités totales (avec un système complet d'événements simple)",
            "Arbres de probabilités",
            "Épreuves répétées, schéma de Bernoulli et loi binomiale (calcul de P(X=k))",
            "Espérance mathématique, variance et écart-type d'une variable aléatoire discrète"
        ]
    }
    // La géométrie dans l'espace est souvent limitée ou absente pour SVT,
    // si présente, elle serait très basique (coordonnées, vecteurs simples).
];