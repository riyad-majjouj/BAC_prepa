// --- back-end/prompts/2BAC/PC/pc/questionPrompt.js ---

function generatePracticeQuestionPrompt(context) {
    const { academicLevelName, trackName, subjectName, difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, questionLanguage, questionTypeToGenerate, selectedTaskFlavor } = context;

    // --- **التعديل 1: إعادة صياغة وتوسيع محاور الإبداع لتجنب التكرار** ---
    // تم التخفيف من تركيز "اكتشاف الخطأ" وتعزيز الأنماط الأخرى.
    const creativityAxes = `
AXES_DE_CRÉATIVITÉ_POUR_LA_GÉNÉRATION (Veuillez VARIER l'axe utilisé pour chaque question):
- **1. Axe de Modélisation & Contexte Inhabituel:** Placer le concept physique/chimique dans un scénario du monde réel ou un contexte moins scolaire.
  - *Exemple:* Modéliser le flash d'un appareil photo comme la décharge d'un condensateur, étudier la trajectoire d'une sonde spatiale près d'une planète, analyser la cinétique de la dégradation d'un médicament.
- **2. Axe de Conception & Ingénierie Inverse:** Demander à l'élève de "concevoir" une solution ou de déduire les paramètres initiaux à partir d'un résultat final.
  - *Exemple:* "Déterminer la valeur de l'inductance L nécessaire dans un circuit d'accord radio pour capter une fréquence N₀." ou "Quelle vitesse initiale faut-il donner à un projectile pour qu'il atteigne une cible précise ?".
- **3. Axe d'Analyse de Données Graphiques/Textuelles:** Fournir des données brutes ou un graphique non standard et demander une interprétation profonde.
  - *Exemple:* Fournir le graphique de la puissance dissipée par effet Joule $P_j(t)$ dans un circuit RLC et demander de déduire le régime d'oscillation. ou "À partir du spectre d'émission d'une étoile, déduire les éléments chimiques présents."
- **4. Axe de Connexion Inter-chapitres:** Créer une situation-problème où la solution nécessite l'application de concepts de deux leçons différentes.
  - *Exemple:* Un moteur électrique (rotation) soulève une charge (mécanique du point). Calculer le travail total. Ou bien, une réaction chimique exothermique (chimie) chauffe un gaz (thermodynamique).
- **5. Axe de Défi Conceptuel:** Poser une question qui cible une idée fausse courante ou qui demande une justification fine entre deux concepts très proches. (À utiliser avec modération pour éviter la répétition).
  - *Exemple:* "Pourquoi la période d'un pendule simple ne dépend-elle pas de sa masse, alors que la force de rappel (poids) en dépend ?".
`;

    const languageInstruction = "La question et toutes ses parties (texte, options, correctAnswer) doivent être EXCLUSIVEMENT EN FRANÇAIS, avec un vocabulaire scientifique précis et rigoureux.";
    const promptExpertise = `un expert en conception de questions de Physique-Chimie pour le niveau ${academicLevelName} - ${trackName} (Sciences Physiques) du baccalauréat marocain. Vous êtes reconnu pour votre capacité à créer des questions originales qui varient en style et en approche.`;

    // --- **التعديل 2: تعديل الإرشادات للتأكيد على التنوع** ---
    let examStyleGuidance = `
La question générée doit rigoureusement imiter le style et le niveau d'exigence de l'Examen National marocain, tout en aspirant à l'originalité.
**Votre objectif principal est la DIVERSITÉ.** Évitez de vous reposer sur un seul type de questionnement (comme 'trouver l'erreur').
Inspirez-vous des 'AXES_DE_CRÉATIVITÉ' en essayant de choisir un axe différent à chaque fois.`;

    if (difficultyLevelApi === "Difficile") {
        examStyleGuidance += " **Cette question doit être difficile.** Privilégiez l'axe **Conception**, **Analyse de Données** ou **Connexion Inter-chapitres**. La question doit amener l'élève à synthétiser ses connaissances.";
    } else if (difficultyLevelApi === "Moyen") {
        examStyleGuidance += " **Cette question doit être de difficulté moyenne.** L'axe **Modélisation & Contexte** est excellent ici. La question doit tester une application intelligente des formules dans une situation concrète.";
    } else { // Facile
        examStyleGuidance += " **Cette question doit être facile.** Elle teste la connaissance directe d'une définition, d'une loi, ou l'application simple d'une formule dans un contexte standard.";
    }

    // ... (Le reste du fichier, `topicContextBlock` et `outputFormatInstructions` reste identique car les exemples sont bons)

    const topicContextBlock = `
CONTEXTE_ACADÉMIQUE:
- Niveau: "${academicLevelName}"
- Filière: "${trackName}"
- Matière: "${subjectName}"
- Sujet de la Leçon: "${selectedLessonTitre}" 
- Contenu Spécifique: "${selectedParagraphTexte}"
- Langue: "${questionLanguage}"`;

    let outputFormatInstructions;
    if (questionTypeToGenerate === "mcq") {
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (QCM):
1. ${languageInstruction}
2. Objectif: "${selectedTaskFlavor.description}".
3. **Exemple de question de HAUTE QUALITÉ:**
\`\`\`json
{
  "question": "Dans un circuit RLC série, on observe une courbe de résonance d'intensité. Le facteur de qualité est Q = 5 et la résistance totale du circuit est R_totale = 20 Ω. L'inductance L et la capacité C de ce circuit vérifient la relation :",
  "options": ["√(L/C) = 4", "√(L/C) = 20", "√(L/C) = 100", "√(L/C) = 0.05"],
  "correctAnswer": "√(L/C) = 100",
  "lesson": "Circuit RLC Série en Régime Sinusoïdal Forcé",
  "type": "mcq"
}
\`\`\`
`;
    } else { // free_text
        outputFormatInstructions = `
FORMAT_DE_SORTIE_JSON_STRICT (Question à réponse ouverte):
1. ${languageInstruction}
2. Objectif: "${selectedTaskFlavor.description}".
3. **Exemple de question de HAUTE QUALITÉ:**
\`\`\`json
{
  "question": "Un palet de hockey de masse m = 170 g glisse sans frottement. Un joueur lui communique une impulsion qui fait passer sa vitesse de 2 m/s à 12 m/s en 0,1 s. Calculez la valeur de la force moyenne exercée par la crosse sur le palet.",
  "options": [],
  "correctAnswer": "La variation de la quantité de mouvement est Δp = m(v_f - v_i) = 0.170 * (12 - 2) = 1.7 kg.m/s. Selon le théorème de la quantité de mouvement, F_moy * Δt = Δp, donc F_moy = Δp / Δt = 1.7 / 0.1 = 17 N.",
  "lesson": "Les Lois de Newton",
  "type": "free_text"
}
\`\`\`
`;
    }

    return `
Vous êtes ${promptExpertise}.
Votre mission est de créer une seule question de haute qualité, originale et stimulante pour l'entraînement des élèves.

${examStyleGuidance}

${creativityAxes}

TÂCHE DE GÉNÉRATION:
${topicContextBlock}
${outputFormatInstructions}
Répondez UNIQUEMENT avec un seul objet JSON valide et complet. Ne fournissez aucune explication ou texte en dehors du JSON.`;
}

module.exports = { generatePracticeQuestionPrompt };