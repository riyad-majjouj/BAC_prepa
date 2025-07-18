const curriculum = require('../../../../exam-curriculum-data/2BAC/SM/math.js');

// =================================================================================
// START: The Abstract Concept Factory - مصنع المفاهيم المجردة
// =================================================================================

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * يولد "مفهوم" رياضي مجرد ليكون نواة المسألة.
 * @param {string} problemDomain - مجال المسألة (Analyse, Arithmétique, etc.)
 * @returns {Object} - كائن يحتوي على وصف المفهوم الإجباري.
 */
function createAbstractConcept(problemDomain) {
    const domainLower = problemDomain.toLowerCase();
    let concept = {};

    if (domainLower.includes('analyse')) {
        const functionFamilies = [
            `f_n(x) = x^k (\\ln(x))^n`,
            `f_n(x) = \\frac{e^{-nx}}{x^k+a}`,
            `f_n(x) = \\arctan(nx) - kx`,
            `f_n(x) = (x-a)^n e^{-x}`
        ];
        const chosenFamily = getRandomElement(functionFamilies)
            .replace('n', 'n') // Keep n as parameter
            .replace('k', getRandomInt(1, 2).toString())
            .replace('a', getRandomInt(1, 2).toString());

        concept.imposedConcept = `Le problème doit tourner autour de l'étude de la **famille de fonctions** $(f_n)_{n \\in \\mathbb{N}^*}$ définie par **$${chosenFamily}$**.`;
        
        const theoreticalQuestions = [
            "1. Démontrer que pour tout $n \\in \\mathbb{N}^*$, l'équation $f_n(x) = 1$ admet une solution unique, notée $x_n$.",
            "2. Étudier la monotonie et la convergence de la suite $(x_n)_{n \\in \\mathbb{N}^*}$.",
            "3. Calculer la limite de la suite $(x_n)$ en justifiant rigoureusement.",
            "4. Étudier le comportement de la fonction (limites, variations) en discutant selon la parité de l'entier $n$."
        ];
        // Select 2 unique questions
        const shuffledQuestions = [...theoreticalQuestions].sort(() => 0.5 - Math.random());
        concept.theoreticalTasks = `Vous devez intégrer les questions théoriques suivantes dans le problème : \n- ${shuffledQuestions[0]}\n- ${shuffledQuestions[1]}`;

    } else if (domainLower.includes('arithmétique')) {
        const p = getRandomElement([11, 13, 17]);
        const a = getRandomInt(2, p - 2);
        concept.imposedConcept = `Le problème est une investigation théorique des propriétés des solutions de l'équation $(E_p): x^2 \\equiv a \\pmod{p}$, où $p$ est un nombre premier et $a$ est un entier non-résidu quadratique.`;
        concept.theoreticalTasks = `Les questions doivent prouver des propriétés générales, comme le critère d'Euler, et non simplement trouver une solution numérique. Par exemple : démontrer que $a^{\\frac{p-1}{2}} \\equiv -1 \\pmod{p}$.`;

    } else if (domainLower.includes('structures')) {
        const structures = [
            `l'ensemble $E = \\{ M(a,b) \\in \\mathcal{M}_2(\\mathbb{R}) \\}$ muni d'une loi $\\star$ non-conventionnelle`,
            `l'anneau-produit $(\\mathbb{Z}/n\\mathbb{Z} \\times \\mathbb{Z}/m\\mathbb{Z}, +, \\times)$`,
            `un ensemble de fonctions $F = \\{ f_{a,b} : x \\mapsto ax+b \\}$ muni de la composition $\\circ$`
        ];
        concept.imposedConcept = `Le problème doit étudier en profondeur la structure de ${getRandomElement(structures)}.`;
        concept.theoreticalTasks = `Les questions doivent porter sur : la recherche d'éléments inversibles, la démonstration qu'une partie est un sous-groupe ou un sous-anneau, et la discussion si la structure est un corps ou non.`;

    } else if (domainLower.includes('complexes')) {
        concept.imposedConcept = `Le problème utilise les nombres complexes pour résoudre un problème de géométrie non-trivial. Le cadre est un cercle $(U)$ et des points $A(a), B(b), C(c)$ sur ce cercle.`;
        concept.theoreticalTasks = `Prouver des relations géométriques en utilisant les affixes. Par exemple : montrer que l'orthocentre du triangle $ABC$ a pour affixe $h=a+b+c$, ou trouver l'affixe d'un point $P$ défini par une condition de parallélisme ou d'orthogonalité.`;
    }

    return concept;
}

// =================================================================================
// END: The Abstract Concept Factory
// =================================================================================


module.exports = {
    examConfig: {
        numberOfProblems: () => 4, // Les examens récents ont souvent 4 problèmes.
        timeLimitMinutes: 240,
    },

    type: 'multi-step',
    defaultGenerationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    defaultModelType: 'gemini-1.5-flash-latest',

    steps: [
        {
            name: 'prepare_problem_scope',
            processor: () => {
                let problemChoice, problemDomain, totalPointsForProblem, isChallengeProblem;

                // Forcer une distribution plus proche des examens : 1 Analyse, 1 Complexe, 1 Structure, 1 Arithmétique
                // Cette logique peut être complexifiée, mais pour l'instant on garde le choix aléatoire.
                
                const randomFactor = Math.random();
                if (randomFactor < 0.35) { // 35% chance for a big Analysis problem
                    problemChoice = curriculum.problemesIntegres.find(p => p.lessonsImpliquees.includes("Étude de fonctions"));
                    problemDomain = "Analyse";
                    totalPointsForProblem = getRandomInt(9, 11);
                } else { // 65% chance for other problems
                    const otherDomains = ["Nombres Complexes", "Structures Algébriques", "Arithmétique"];
                    problemDomain = getRandomElement(otherDomains);
                    problemChoice = { titreProbleme: `Problème sur ${problemDomain}` };
                    totalPointsForProblem = (Math.random() * 1.5) + 2.5; // 2.5-4 pts
                }
                
                totalPointsForProblem = Math.round(totalPointsForProblem * 4) / 4;
                isChallengeProblem = true; // Tous les problèmes doivent être des défis.

                // <-- MODIFICATION MAJEURE: Utilisation de l'Abstract Concept Factory
                const abstractConcept = createAbstractConcept(problemDomain);

                return {
                    titreProbleme: problemChoice.titreProbleme,
                    totalPointsForProblem: totalPointsForProblem,
                    isChallengeProblem: isChallengeProblem,
                    abstractConcept: abstractConcept // On passe le concept entier au prompt
                };
            }
        },
        {
            name: 'generate_exam_problem',
            promptGenerator: (context, previousOutputs) => {
                const { titreProbleme, totalPointsForProblem, abstractConcept } = previousOutputs.prepare_problem_scope;

                let conceptInstructions = "";
                if (abstractConcept && Object.keys(abstractConcept).length > 0) {
                    conceptInstructions = `
**CONCEPT CENTRAL IMPOSÉ (CŒUR DU PROBLÈME) :**
Vous devez construire l'intégralité de l'exercice autour du concept théorique suivant. C'est une contrainte absolue et non-négociable.

- **Cadre du problème :** ${abstractConcept.imposedConcept}
- **Questions Théoriques à inclure :** ${abstractConcept.theoreticalTasks}
`;
                }

                return `
Vous êtes un académicien membre de la commission nationale des examens de mathématiques pour la filière Sciences Mathématiques A. Votre mission est de concevoir UN SEUL exercice (problème) qui reflète la profondeur, la rigueur et le niveau d'abstraction des épreuves nationales marocaines.

**MISSION :** Créer un problème original et théorique, pas un simple exercice d'application.

**LIGNES DIRECTRICES FONDAMENTALES :**
1.  **Respect Impératif du Concept Central :**
    -   ${conceptInstructions}
    -   Le problème ne doit pas être une simple étude de fonction ou une résolution numérique. Il doit être une investigation des propriétés d'un objet mathématique abstrait (une famille de fonctions, une structure, etc.).

2.  **Structure et Difficulté :**
    -   **Progression Logique :** Le problème doit être structuré en plusieurs parties et sous-questions qui s'enchaînent. Le résultat d'une question doit servir de lemme pour la suivante.
    -   **Discussion de Paramètres :** Les questions doivent fréquemment impliquer la discussion selon un paramètre (entier $n$, réel $a$, etc.).
    -   **Niveau de Rigueur :** Les justifications attendues doivent être complètes et basées sur des théorèmes précis du programme.

3.  **Barème :** Le total des points doit être EXACTEMENT ${totalPointsForProblem} points, répartis de manière juste.
4.  **Formatage LaTeX OBLIGATOIRE :** Chaque expression mathématique doit être en LaTeX échappé pour JSON (e.g., "\\\\frac{a}{b}").

**FORMAT DE SORTIE JSON STRICT :**
\`\`\`json
{
  "problemTitle": "${titreProbleme}",
  "examItems": [
    {
      "itemType": "instruction",
      "text": "Partie I : Mise en place et étude des propriétés fondamentales de l'objet mathématique."
    },
    {
      "itemType": "question",
      "text": "1. Première question théorique, basée sur les instructions.",
      "difficultyOrder": 1,
      "points": 1.0
    },
    {
      "itemType": "question",
      "text": "2. Deuxième question qui s'appuie sur le résultat de la première.",
      "difficultyOrder": 2,
      "points": 1.25
    }
  ],
  "totalPointsForProblem": ${totalPointsForProblem}
}
\`\`\`
Soyez fidèle à l'esprit des examens de la filière Sciences Mathématiques : l'abstraction, la rigueur et la profondeur priment sur la complexité calculatoire pure.
`;
            }
        }
    ],

    finalAggregator: (context, allStepsOutputs) => {
        // ... (Le finalAggregator reste correct et n'a pas besoin d'être modifié)
        const aiOutput = allStepsOutputs.generate_exam_problem;

        if (!aiOutput || !Array.isArray(aiOutput.examItems) || aiOutput.examItems.length === 0) {
            console.error("[MATH_SM_AGGREGATOR] AI output is missing or has an invalid 'examItems' array:", aiOutput);
            throw new Error("Erreur interne: les données générées par l'IA pour le problème de maths sont invalides.");
        }

        const problemItems = [];
        let questionCounter = 0;

        aiOutput.examItems.forEach(item => {
            if (item.itemType === 'instruction' || item.itemType === 'paragraph') {
                problemItems.push({ itemType: 'content', contentType: item.itemType, text: item.text });
            } else if (item.itemType === 'question') {
                questionCounter++;
                problemItems.push({
                    itemType: 'question',
                    text: item.text,
                    points: item.points || 0,
                    orderInProblem: item.difficultyOrder || questionCounter,
                    questionType: 'free_text',
                    correctAnswer: item.answer || 'La correction détaillée dépend de la méthode suivie.',
                });
            }
        });

        const calculatedTotalPoints = problemItems.reduce((sum, item) => {
            return item.itemType === 'question' ? sum + (Number(item.points) || 0) : sum;
        }, 0);
        
        const finalPoints = Math.round(calculatedTotalPoints * 100) / 100;

        if (Math.abs(finalPoints - aiOutput.totalPointsForProblem) > 0.15) {
            console.warn(`[MATH_SM_AGGREGATOR_WARN] Points mismatch. AI Stated: ${aiOutput.totalPointsForProblem}, Calculated: ${finalPoints}. Using calculated value.`);
        }

        return {
            problemTitle: aiOutput.problemTitle || `Exercice sur ${context.lesson.titreLecon}`,
            problemItems: problemItems,
            problemTotalPossibleRawScore: finalPoints,
        };
    }
};