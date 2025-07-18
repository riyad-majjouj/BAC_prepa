// قائمة أمثلة لأسئلة FMD-FMP في علوم الحياة والأرض عالية الجودة.
// سيتم اختيار مثال واحد عشوائيًا من هذه القائمة في كل مرة لتوجيه الذكاء الاصطناعي.
// كل الأسئلة والخيارات تستخدم تنسيق LaTeX مع الـ 'double backslashes' الصحيحة لسلاسل JSON.
const fmdFmpSvtExamples = [
    {
        question: "Quelle structure cellulaire est principalement responsable de la synthèse des protéines destinées à être sécrétées ou intégrées dans les membranes ?",
        type: "mcq",
        options: [
            "Le noyau",
            "Le mitochondrie",
            "Le réticulum endoplasmique rugueux",
            "L'appareil de Golgi",
            "Le lysosome"
        ],
        correctAnswer: "Le réticulum endoplasmique rugueux",
        lesson: "Biologie Cellulaire",
        tags: ["concours", "médecine", "svt", "difficile", "biologie cellulaire"]
    },
    {
        question: "Lors de la méiose, le brassage interchromosomique se produit spécifiquement pendant :",
        type: "mcq",
        options: [
            "La prophase I",
            "L'anaphase I",
            "La métaphase I",
            "La prophase II",
            "L'anaphase II"
        ],
        correctAnswer: "L'anaphase I", // Brassage interchromosomique = ségrégation aléatoire des chromosomes homologues en anaphase I. Brassage intrachromosomique (crossing-over) = prophase I.
        lesson: "Génétique - Méiose",
        tags: ["concours", "médecine", "svt", "difficile", "génétique", "méiose"]
    },
    {
        question: "Quelle est la principale fonction des lymphocytes T auxiliaires (LT4) dans la réponse immunitaire spécifique ?",
        type: "mcq",
        options: [
            "La production d'anticorps",
            "La destruction des cellules infectées",
            "La reconnaissance des antigènes présentés par le CMH-I",
            "La sécrétion de cytokines qui activent d'autres cellules immunitaires",
            "La différenciation en cellules mémoires"
        ],
        correctAnswer: "La sécrétion de cytokines qui activent d'autres cellules immunitaires",
        lesson: "Immunologie",
        tags: ["concours", "médecine", "svt", "difficile", "immunologie"]
    },
    {
        question: "La loi de superposition en stratigraphie implique que :",
        type: "mcq",
        options: [
            "Les couches sédimentaires sont déposées horizontalement à l'origine.",
            "Dans une séquence sédimentaire non déformée, la couche la plus ancienne est en bas et la plus jeune en haut.",
            "Les roches magmatiques intrusives sont plus anciennes que les roches qu'elles traversent.",
            "Les failles sont plus jeunes que les couches qu'elles décalent.",
            "Les fossiles dans les couches sédimentaires indiquent l'âge relatif de ces couches."
        ],
        correctAnswer: "Dans une séquence sédimentaire non déformée, la couche la plus ancienne est en bas et la plus jeune en haut.",
        lesson: "Géologie - Stratigraphie",
        tags: ["concours", "médecine", "svt", "difficile", "géologie", "stratigraphie"]
    },
    {
        question: "Quelle enzyme est responsable de la transcription de l'ADN en ARN messager (ARNm) chez les eucaryotes ?",
        type: "mcq",
        options: [
            "L'ADN polymérase",
            "L'ARN polymérase",
            "La transcriptase inverse",
            "L'ADN ligase",
            "L'hélicase"
        ],
        correctAnswer: "L'ARN polymérase",
        lesson: "Génétique Moléculaire",
        tags: ["concours", "médecine", "svt", "difficile", "génétique", "transcription"]
    }
];

/**
 * Génère un prompt pour créer une question de type QCM de SVT pour le concours FMD-FMP.
 * @param {object} context - Contexte contenant les informations sur le sujet, la difficulté, etc.
 * @param {string} context.subjectName - Nom de la matière (ex: "SVT").
 * @param {string} context.difficultyLevelApi - Niveau de difficulté (ex: "difficile").
 * @param {string} context.selectedLessonTitre - Titre de la leçon (ex: "Immunologie").
 * @param {string} context.selectedParagraphTexte - Paragraphe spécifique de la leçon.
 * @param {string} context.lessonForJsonOutput - Nom de la leçon à insérer dans le JSON final.
 * @returns {string} Le prompt complet pour l'IA.
 */
function generatePracticeQuestionPrompt(context) {
    const { difficultyLevelApi, selectedLessonTitre, selectedParagraphTexte, lessonForJsonOutput } = context;

    // --- 1. Sélectionner un exemple aléatoire ---
    const randomIndex = Math.floor(Math.random() * fmdFmpSvtExamples.length);
    const exampleQuestion = fmdFmpSvtExamples[randomIndex];
    const exampleString = JSON.stringify(exampleQuestion, null, 2);

    // --- 2. Définir les instructions du prompt ---
    const promptExpertise = `Vous êtes un expert en conception de QCM de SVT pour le concours d'accès aux facultés de Médecine, Pharmacie et Médecine Dentaire (FMD-FMP). Vous savez que les questions sont très précises, factuelles et visent à tester la mémorisation et la compréhension fine des détails du programme du bac.`;

    const specificGuidance = `
Créez une question QCM très précise et factuelle, conçue pour un concours exigeant.

**Règles impératives de formatage LaTeX :**
  - Toutes les expressions mathématiques ou symboles spécifiques (hormones, enzymes, ions, unités, formules, structures génétiques etc.) doivent être entourées de délimiteurs mathématiques.
  - Pour le mode mathématique **inline**, utilisez le symbole dollar unique ($). Exemple: "La concentration de $\\text{Ca}^{2+}$ est cruciale."
  - Pour le mode mathématique **display** (bloc séparé), utilisez le double dollar ($$). Exemple: "La formule est: $$\\text{ADN} \\xrightarrow{\\text{ARN polymérase}} \\text{ARN}$$. "
  - **CHAQUE** commande LaTeX (qui commence par une barre oblique inverse '\\' ou '\\begin{') doit utiliser **DEUX** barres obliques inverses (\\\\) dans la chaîne JSON. Par exemple, pour l'instruction LaTeX '\\text{ADN}' vous écrirez " \\\\text{ ADN} ".
  - Pour les flèches, utilisez des commandes LaTeX appropriées comme "\\\\to" ou "\\\\rightarrow".
  - Assurez-vous que la syntaxe LaTeX est parfaitement valide et qu'elle peut être rendue sans erreur par un moteur comme MathJax.
  - Évitez les caractères spéciaux ou les séquences d'échappement incorrectes qui pourraient casser le rendu LaTeX.

- **Thèmes à privilégier :** Biologie cellulaire (organites, mitose/méiose), Génétique humaine et moléculaire (transmission des maladies, mutations), Immunologie (tous les détails sur les cellules et les médiateurs), Géologie (chronologie relative/absolue, stratigraphie).
- **Compétences testées :** Mémorisation de détails précis (noms de molécules, enzymes, phases, structures), compréhension de mécanismes biologiques complexes, analyse de schémas ou de données expérimentales très ciblées.
- **Difficulté :** La difficulté vient de la précision requise. Les distracteurs doivent être très proches de la vérité, ne différant que par un seul terme ou détail, forçant l'étudiant à une lecture et une connaissance parfaites.
- **Originalité :** La question doit être originale et ne pas être une copie directe de l'exemple fourni.

`;

    const fewShotExample = `
Voici un exemple concret du style, de la difficulté et du format JSON attendu. Cet exemple respecte toutes les règles de formatage LaTeX. Inspirez-vous de cet exemple pour créer une nouvelle question.
**Note importante :** L'exemple est là pour le format, le style et la difficulté du LaTeX, PAS pour le sujet. Le sujet de la nouvelle question est déterminé par les informations de "Sujet : ${selectedLessonTitre} - ${selectedParagraphTexte}". Ne créez PAS une question identique ou très similaire à l'exemple.
\`\`\`json
${exampleString}
\`\`\``;

    const outputFormat = `
Maintenant, en vous basant sur l'exemple et les règles ci-dessus, générez une nouvelle question sur le sujet suivant.
**Sujet de la question :** "${selectedLessonTitre} - ${selectedParagraphTexte}".

Répondez **uniquement** avec un bloc de code JSON respectant scrupuleusement le format suivant (5 options), et assurez-vous que tout le LaTeX est correctement formaté avec des doubles backslashes (\\\\) pour chaque commande :
\`\`\`json
{
  "question": "Votre question très précise et factuelle ici, en utilisant LaTeX. Exemple: Quelle est la fonction principale du réticulum endoplasmique lisse ?",
  "type": "mcq",
  "options": [
    "Option A en LaTeX, exemple : La synthèse des protéines",
    "Option B en LaTeX, exemple : La détoxification des drogues",
    "Option C en LaTeX, exemple : La production d'ATP",
    "Option D en LaTeX, exemple : Le stockage de l'information génétique",
    "Option E en LaTeX, exemple : La digestion intracellulaire"
  ],
  "correctAnswer": "L'option correcte, aussi en LaTeX avec doubles backslashes. Exemple : La détoxification des drogues",
  "lesson": "${lessonForJsonOutput}",
  "tags": ["concours", "médecine", "svt", "${difficultyLevelApi}"]
}
\`\`\``;

    // --- 3. Assembler le prompt final ---
    return `${promptExpertise}\n${specificGuidance}\n${fewShotExample}\n${outputFormat}`;
}

module.exports = { generatePracticeQuestionPrompt };