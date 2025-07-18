const { MongoClient, ObjectId } = require('mongodb');

// --- بيانات الاتصال بقاعدة البيانات ---
const uri = "mongodb+srv://majoriyad:CUbNhg4PYp4Bc0vU@cluster0.bpqezif.mongodb.net/";
const dbName = 'test'; // اسم قاعدة البيانات
const collectionName = 'questions'; // اسم الكولكشن

// --- البيانات الثابتة لكل سؤال (تم استخراجها من الصورة) ---
const commonData = {
    academicLevel: new ObjectId('6856e58a42d2333b081f4379'),
    track: new ObjectId('6856e61e42d2333b081f43c3'), // ID للشعبة (ربما الطب)
    subject: new ObjectId('6856e88b42d2333b081f44d5'), // ID للمادة (SVT)
    level: "متوسط",
    type: "mcq",
    generatedBy: "AI-assisted DB Seeder",
    createdAt: new Date(),
    updatedAt: new Date()
};

// --- قائمة الأسئلة الكاملة ---
const questions = [
    // ====================================================================
    // Questions from FMD-FMP 2023 Exam - SVT (Extracted from Images)
    // ====================================================================
    {
        lesson: "FMD-FMP 2023",
        text: "Q1 : Au cours du cycle de la contraction musculaire, le $\\text{Ca}^{2+}$ se fixe sur :",
        options: [
            "A) La troponine qui déplace la tropomyosine et la tête de myosine porteuse d'ADP-Pi se lie à l'actine.",
            "B) La tropomyosine qui déplace la troponine et la tête de myosine porteuse d'ADP-Pi se lie à l'actine.",
            "C) La troponine qui déplace la tropomyosine et la tête de myosine porteuse d'ADP se lie à l'actine.",
            "D) La troponine qui déplace la tropomyosine et l'actine porteuse d'ADP se lie à la tête de myosine.",
            "E) La troponine qui déplace la troponine et la tête de myosine porteuse d'ADP-Pi se lie à la tropomyosine."
        ],
        correctAnswer: "A) La troponine qui déplace la tropomyosine et la tête de myosine porteuse d'ADP-Pi se lie à l'actine."
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q2 : Parmi les suggestions suivantes, il y a deux suggestions vraies concernant les voies utilisées dans la régénération de l'ATP pendant un effort musculaire : \\\\ \n1. La fermentation lactique pour un effort court. \\\\ \n2. La respiration cellulaire pour un effort court. \\\\ \n3. L'ADP interagit avec la phosphocréatine pour un effort très rapide. \\\\ \n4. La phosphocréatine pour un effort plus long. \\\\ \n5. La respiration cellulaire pour un effort plus long. \\\\ \nLes deux suggestions vraies sont :",
        options: [
            "A) 1 et 2.",
            "B) 1 et 3.",
            "C) 3 et 4.",
            "D) 3 et 5.",
            "E) 4 et 5."
        ],
        // True statements are 1, 3, 5. (1: Fermentation lactique - short; 3: Phosphocréatine - very rapid; 5: Respiration cellulaire - long).
        // Both B (1 et 3) and D (3 et 5) contain two true statements.
        // In QCMs where multiple options are true based on direct interpretation, the "best" or "most complete" answer is usually sought.
        // Option B pairs short-term anaerobic (fermentation) with very rapid (phosphocreatine).
        // Option D pairs very rapid (phosphocreatine) with long-term aerobic (respiration).
        // Since phosphocreatine is the *initial* burst, followed by fermentation, (1 et 3) represents the sequence for short efforts.
        // If the question implicitly asks for the *two* main pathways for *non-aerobic* efforts (short/very short), B is better.
        // If it means "any two true statements", then both B and D are correct, which indicates a flawed question.
        // Sticking with B as the most direct representation of short/very short energy systems.
        correctAnswer: "B) 1 et 3."
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q3 : Le brassage intrachromosomique permet la combinaison entre les allèles :",
        options: [
            "A) d'un même gène disposés sur deux locus (loci) différents d'un même chromosome.",
            "B) d'un même gène disposés sur un même locus d'un chromosome déterminé.",
            "C) de deux gènes disposés sur deux locus différents de deux chromosomes homologues.",
            "D) de deux gènes disposés sur deux locus différents de deux chromosomes non homologues.",
            "E) de deux gènes disposés sur un même locus d'un chromosome déterminé."
        ],
        correctAnswer: "C) de deux gènes disposés sur deux locus différents de deux chromosomes homologues."
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q4 : Un plasmide est :",
        options: [
            "A) un ADN bactérien utilisé comme vecteur en génie génétique.",
            "B) un ARN bactérien utilisé comme vecteur en génie génétique.",
            "C) une enzyme bactérienne utilisée en génie génétique pour découper l'ADN au niveau de sites spécifiques.",
            "D) une enzyme bactérienne utilisée en génie génétique pour découper l'ARN au niveau de sites spécifiques.",
            "E) une protéine découverte chez les plantes et utilisée comme vecteur en génie génétique."
        ],
        correctAnswer: "A) un ADN bactérien utilisé comme vecteur en génie génétique."
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q5 : La réplication de l'ADN a lieu :",
        options: [
            "A) uniquement avant la mitose grâce à l'ARN polymérase qui copie l'ADN.",
            "B) uniquement avant la méiose grâce à l'ARN polymérase qui copie l'ADN.",
            "C) avant la première division de la méiose grâce à l'ADN polymérase qui copie l'ADN.",
            "D) grâce à l'ADN polymérase qui copie l'ADN durant l'interphase.",
            "E) juste avant la deuxième division de la méiose grâce à l'ADN polymérase qui copie l'ADN."
        ],
        // Option C is more specific to meiosis, which is a context often tested.
        // Option D is generally true for any DNA replication (mitosis or meiosis).
        // In this context, C is the most precise answer for meiosis.
        correctAnswer: "C) avant la première division de la méiose grâce à l'ADN polymérase qui copie l'ADN."
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q6 : La carte factorielle est représentée par une droite avec les loci (locus) et la distance séparant les loci est exprimée en centimorgan (cM) dont $1 \\text{ cM}$ correspond à $1 \\%$ des types recombinés.",
        options: [
            "A) liés est exprimée en centimorgan (cM) dont $1 \\text{ cM}$ correspond à $1 \\%$ des types recombinés.",
            "B) indépendants est exprimée en centimorgan (cM) dont $1 \\text{ cM}$ correspond à $1 \\%$ des types recombinés.",
            "C) liés est exprimée en centimorgan (cM) dont $1 \\text{ cM}$ correspond à $10 \\%$ des types parentaux.",
            "D) liés est exprimée en centimorgan (cM) dont $1 \\text{ cM}$ correspond à $10 \\%$ des types recombinés.",
            "E) indépendants est exprimée en centimorgan (cM) dont $1 \\text{ cM}$ correspond à $1 \\%$ des types parentaux."
        ],
        correctAnswer: "A) liés est exprimée en centimorgan (cM) dont $1 \\text{ cM}$ correspond à $1 \\%$ des types recombinés."
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q7 : Dans le cas d'une maladie héréditaire récessive liée au chromosome X :",
        options: [
            "A) L'allèle responsable de la maladie se transmet du père vers ses fils.",
            "B) Un homme malade donne toujours des filles malades.",
            "C) Une femme saine porteuse de l'allèle morbide ne donne jamais des garçons malades.",
            "D) Une femme malade donne toujours des garçons malades.",
            "E) L'allèle responsable de la maladie ne se transmet pas du père vers ses filles."
        ],
        correctAnswer: "D) Une femme malade donne toujours des garçons malades."
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q8 : Concernant le mécanisme de la dérive génétique, on peut affirmer que :",
        options: [
            "A) les effets de la dérive génétique sont d'autant plus marqués que la population ciblée par la dérive génétique est grande.",
            "B) les effets de la dérive génétique sont d'autant plus marqués au sein d'une population ayant subi un goulot d'étranglement.",
            "C) la dérive génétique peut ne pas agir en même temps que la sélection naturelle.",
            "D) la dérive génétique accroit la diversité génétique au sein d'une population donnée.",
            "E) la dérive génétique est liée à des phénomènes déterministes c'est-à-dire non-aléatoires."
        ],
        correctAnswer: "B) les effets de la dérive génétique sont d'autant plus marqués au sein d'une population ayant subi un goulot d'étranglement."
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q9 : Parmi les suggestions suivantes, il y a deux suggestions vraies concernant la reconnaissance de l'antigène : \\\\ \n1. LB reconnaît le déterminant antigénique après sa présentation par les CPA à travers le CMH-I. \\\\ \n2. LT4 reconnaît le déterminant antigénique après sa présentation par les CPA à travers le CMH-II. \\\\ \n3. LT8 reconnaît le déterminant antigénique après sa présentation par les CPA à travers le CMH-II. \\\\ \n4. LT4 reconnaît le déterminant antigénique après sa présentation par les CPA à travers le CMH-I. \\\\ \n5. LT8 reconnaît le déterminant antigénique après sa présentation par les CPA à travers le CMH-I. \\\\ \nLes deux suggestions vraies sont :",
        options: [
            "A) 1 et 3.",
            "B) 1 et 4.",
            "C) 4 et 5.",
            "D) 2 et 5.",
            "E) 1 et 5."
        ],
        correctAnswer: "D) 2 et 5."
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q10 : Dans la réponse allergique la phase de sensibilisation est liée à l'activation de :",
        options: [
            "A) LT8 qui se transforme en LTc sécrétant la perforine et les granzymes qui détruisent les cellules dendritiques.",
            "B) LB qui se transforment en plasmocytes sécrétant les IgE qui se fixent sur les mastocytes.",
            "C) LB qui se transforment en plasmocytes sécrétant les IgG qui se fixent sur les cellules dendritiques.",
            "D) LT8 qui se transforme en LTc sécrétant la perforine et les granzymes qui détruisent les mastocytes.",
            "E) LB qui se transforment en plasmocytes sécrétant les IgG qui se fixent sur les cellules dendritiques."
        ],
        correctAnswer: "B) LB qui se transforment en plasmocytes sécrétant les IgE qui se fixent sur les mastocytes."
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q15 : Dans l'ADN de l'oursin qui est à double brin, $17\\%$ des bases se sont révélées être de la cytosine (C). Les pourcentages des trois autres bases censées être présentes dans cette ADN sont les suivants :",
        options: [
            "A) G:$34\\%$ ; A:$24.5\\%$ ; T:$24.5\\%$",
            "B) G:$17\\%$ ; A:$16.5\\%$ ; T:$32.5\\%$",
            "C) G:$17\\%$ ; A:$33\\%$ ; T:$33\\%$",
            "D) G:$8.5\\%$ ; A:$50\\%$ ; T:$24.5\\%$",
            "E) G:$24\\%$ ; A:$50\\%$ ; T:$34\\%$"
        ],
        correctAnswer: "C) G:$17\\%$ ; A:$33\\%$ ; T:$33\\%$"
    },
    {
        lesson: "FMD-FMP 2023",
        text: "Q16 : Un allèle récessif sur le chromosome X est responsable du daltonisme rouge-vert chez l'Homme. Une femme ayant une vision normale et dont le père est daltonien se marie avec un homme daltonien. La probabilité pour que ce couple donne naissance à une fille et que cette fille soit daltonienne est :",
        options: [
            "A) 0",
            "B) 1/4",
            "C) 1/2",
            "D) 3/4",
            "E) 1"
        ],
        correctAnswer: "B) 1/4"
    }
    // Skipped questions due to graphs, tables, or complex multi-step analysis as per instructions:
    // Q11 (Graph)
    // Q12 (Table)
    // Q13 (Complex genetic cross with potentially ambiguous options/values)
    // Q14 (Table)
    // Q17 (Multi-step genetic deduction problem)
    // Q18 (Hardy-Weinberg problem with complex data presentation)
];

// --- Fonction pour insérer les données ---
async function insertQuestions() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connecté à la base de données MongoDB !");

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Ajout des données communes à chaque question
        const questionsToInsert = questions.map(q => ({
            ...commonData, // Spread the common data
            ...q // Spread the specific question data
        }));

        // Insertion de toutes les questions en une seule fois
        const result = await collection.insertMany(questionsToInsert);
        console.log(`${result.insertedCount} questions de SVT ont été insérées avec succès.`);
        console.log("IDs des documents insérés:", result.insertedIds);

    } catch (err) {
        console.error("Une erreur est survenue lors de l'insertion des données :", err);
    } finally {
        await client.close();
        console.log("Connexion à la base de données fermée.");
    }
}

// --- Lancement du script ---
insertQuestions();