const { MongoClient, ObjectId } = require('mongodb');

// رابط الاتصال بقاعدة البيانات
const uri = "mongodb+srv://majoriyad:ohX8v7WGQEfI56GR@cluster0.bpqezif.mongodb.net/";
const dbName = 'test';
const collectionName = 'questions';

// IDs ثابتة
const academicLevelId = new ObjectId('6856e57742d2333b081f4375');
const trackId = new ObjectId('6856e5bd42d2333b081f438d');
const subjectId = new ObjectId('6856e93c42d2333b081f4519');

const questions = [
  // --- Chimie : Questions Fondamentales ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Écrire l'expression de la constante d'acidité \\(K_a\\) pour le couple \\(NH_4^+/NH_3\\).",
    options: [],
    correctAnswer: "K_a = \\frac{[NH_3][H_3O^+]}{[NH_4^+]}",
    lesson: 'Chimie - Acides et Bases',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'mcq',
    text: "Une solution a un pH de 3. Quelle est sa concentration en ions hydronium \\([H_3O^+]\\) ?",
    options: [
      "10⁻³ mol/L",
      "3 mol/L",
      "10³ mol/L",
      "-log(3) mol/L"
    ],
    correctAnswer: "10⁻³ mol/L",
    lesson: 'Chimie - Acides et Bases',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Quel est le quotient de réaction \\(Q_r\\) pour la réaction \\(CH_3COOH + H_2O \\rightleftharpoons CH_3COO^- + H_3O^+\\) à un instant donné ?",
    options: [],
    correctAnswer: "Q_r = \\frac{[CH_3COO^-][H_3O^+]}{[CH_3COOH]}",
    lesson: 'Chimie - Equilibre',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Dans une pile électrochimique, où se produit l'oxydation ?",
    options: [ "A l'anode", "A la cathode", "Dans le pont salin", "Aux deux électrodes" ],
    correctAnswer: "A l'anode",
    lesson: 'Chimie - Piles et Electrolyse',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Quelle est l'unité de la constante de Faraday F ?",
    options: [],
    correctAnswer: "Coulomb par mole (C/mol)",
    lesson: 'Chimie - Piles et Electrolyse',
    generatedBy: 'db'
  },
  // --- Electricité : Questions Fondamentales ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Donner l'expression de la constante de temps \\(\\tau\\) pour un circuit RC et un circuit RL.",
    options: [],
    correctAnswer: "Pour RC, τ = RC. Pour RL, τ = L/R.",
    lesson: 'Electricité - RC, RL, RLC',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Quelle est la condition pour observer des oscillations électriques dans un circuit RLC série ?",
    options: [
      "Le discriminant de l'équation caractéristique doit être négatif (R² < 4L/C).",
      "Le discriminant de l'équation caractéristique doit être positif (R² > 4L/C).",
      "La résistance R doit être nulle.",
      "Le condensateur doit être complètement chargé."
    ],
    correctAnswer: "Le discriminant de l'équation caractéristique doit être négatif (R² < 4L/C).",
    lesson: 'Electricité - RC, RL, RLC',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Quelle est l'expression de la pulsation propre \\(\\omega_0\\) d'un circuit LC idéal ?",
    options: [],
    correctAnswer: "ω₀ = 1 / √(LC)",
    lesson: 'Electricité - RC, RL, RLC',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "L'énergie totale dans un circuit LC idéal est constante. Que peut-on dire de l'énergie dans un circuit RLC ?",
    options: [
      "Elle diminue au cours du temps à cause de l'effet Joule.",
      "Elle reste constante.",
      "Elle augmente au cours du temps.",
      "Elle oscille autour d'une valeur moyenne."
    ],
    correctAnswer: "Elle diminue au cours du temps à cause de l'effet Joule.",
    lesson: 'Electricité - RC, RL, RLC',
    generatedBy: 'db'
  },
  // --- Ondes : Questions Fondamentales ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Définir la longueur d'onde \\(\\lambda\\) d'une onde périodique.",
    options: [],
    correctAnswer: "La longueur d'onde est la plus petite distance séparant deux points du milieu qui vibrent en phase. C'est aussi la distance parcourue par l'onde pendant une période T (λ = vT).",
    lesson: 'Ondes',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Le son est une onde mécanique. Peut-il se propager dans le vide ?",
    options: [
      "Non, car il a besoin d'un support matériel pour se propager.",
      "Oui, comme la lumière.",
      "Oui, mais seulement à très haute fréquence.",
      "Non, car sa vitesse serait infinie."
    ],
    correctAnswer: "Non, car il a besoin d'un support matériel pour se propager.",
    lesson: 'Ondes',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Quelle est la condition sur la largeur d'une fente \\(a\\) et la longueur d'onde \\(\\lambda\\) pour que le phénomène de diffraction soit observable ?",
    options: [],
    correctAnswer: "La largeur de la fente 'a' doit être du même ordre de grandeur ou inférieure à la longueur d'onde λ.",
    lesson: 'Ondes',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Dans un récepteur radio AM, quel est le rôle du détecteur d'enveloppe ?",
    options: [],
    correctAnswer: "Le détecteur d'enveloppe a pour rôle d'éliminer le signal de la porteuse (haute fréquence) pour ne conserver que l'enveloppe, qui est le signal modulant (information basse fréquence).",
    lesson: 'Ondes - Modulation',
    generatedBy: 'db'
  },
  // --- Physique Nucléaire : Questions Fondamentales ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Qu'est-ce que l'énergie de liaison d'un noyau ?",
    options: [],
    correctAnswer: "C'est l'énergie qu'il faut fournir au noyau au repos pour le dissocier en ses nucléons séparés et immobiles. Elle est calculée par E_L = Δm * c², où Δm est le défaut de masse.",
    lesson: 'Physique Nucléaire',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Laquelle de ces particules est la plus pénétrante ?",
    options: [ "Gamma (γ)", "Bêta (β)", "Alpha (α)", "Neutron" ],
    correctAnswer: "Gamma (γ)",
    lesson: 'Physique Nucléaire',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Donner la définition de l'activité A d'un échantillon radioactif.",
    options: [],
    correctAnswer: "L'activité A est le nombre moyen de désintégrations par unité de temps. Son unité est le Becquerel (Bq). A(t) = λN(t).",
    lesson: 'Physique Nucléaire',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Compléter la réaction de fission de l'Uranium 235: \\( ^{235}_{92}U + ^1_0n \\rightarrow ^{94}_{38}Sr + ^{...}_{...}Xe + 2 ^1_0n \\).",
    options: [],
    correctAnswer: "¹⁴⁰₅₄Xe",
    lesson: 'Physique Nucléaire',
    generatedBy: 'db'
  },
  // --- Mécanique : Questions Fondamentales ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Énoncer la deuxième loi de Newton (Principe Fondamental de la Dynamique).",
    options: [],
    correctAnswer: "Dans un référentiel galiléen, la somme vectorielle des forces extérieures appliquées à un solide est égale au produit de la masse du solide par l'accélération de son centre d'inertie. ΣF_ext = ma_G.",
    lesson: 'Mécanique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Dans un mouvement circulaire uniforme, le vecteur accélération est :",
    options: [ "Normal et dirigé vers le centre", "Tangentiel", "Nul", "Constant" ],
    correctAnswer: "Normal et dirigé vers le centre",
    lesson: 'Mécanique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Quelle est l'expression de la période propre \\(T_0\\) d'un pendule pesant simple de longueur L ?",
    options: [],
    correctAnswer: "T₀ = 2π√(L/g)",
    lesson: 'Mécanique - Oscillations',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Lorsqu'un solide glisse avec frottement sur un plan, son énergie mécanique :",
    options: [ "Diminue", "Augmente", "Reste constante", "Est nulle" ],
    correctAnswer: "Diminue",
    lesson: 'Mécanique - Energie',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Donner l'expression de l'énergie cinétique d'un solide en translation et d'un solide en rotation.",
    options: [],
    correctAnswer: "Translation: E_c = (1/2)mv². Rotation: E_c = (1/2)I_Δω².",
    lesson: 'Mécanique - Energie',
    generatedBy: 'db'
  },
  // --- Questions de Révision Finale ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Donner la relation entre la force de Laplace \\(\\vec{F}\\), le courant \\(I\\), le vecteur longueur \\(\\vec{L}\\) et le champ magnétique \\(\\vec{B}\\).",
    options: [],
    correctAnswer: "\\vec{F} = I (\\vec{L} \\wedge \\vec{B})",
    lesson: 'Electromagnétisme',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Quelle est la nature du mouvement d'une particule chargée entrant avec une vitesse \\(\\vec{v}\\) dans un champ magnétique uniforme \\(\\vec{B}\\) si \\(\\vec{v}\\) est parallèle à \\(\\vec{B}\\) ?",
    options: [
      "Mouvement rectiligne uniforme",
      "Mouvement circulaire uniforme",
      "Mouvement hélicoïdal",
      "La particule s'arrête"
    ],
    correctAnswer: "Mouvement rectiligne uniforme",
    lesson: 'Electromagnétisme',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Exprimer le travail d'une force constante \\(\\vec{F}\\) lors d'un déplacement rectiligne \\(\\vec{AB}\\).",
    options: [],
    correctAnswer: "W_{AB}(\\vec{F}) = \\vec{F} \\cdot \\vec{AB} = F \\times AB \\times cos(\\alpha)",
    lesson: 'Mécanique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Un titrage pH-métrique d'un acide faible par une base forte est réalisé. Comment détermine-t-on graphiquement le point d'équivalence ?",
    options: [],
    correctAnswer: "Par la méthode des tangentes parallèles. Le point d'équivalence est le milieu du segment perpendiculaire aux deux tangentes, tracé au niveau du saut de pH.",
    lesson: 'Chimie - Acides et Bases',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Laquelle de ces réactions est une réaction de fusion nucléaire ?",
    options: [
      "²₁H + ³₁H → ⁴₂He + ¹₀n",
      "²³⁵₉₂U + ¹₀n → ¹⁴¹₅₆Ba + ⁹²₃₆Kr + 3 ¹₀n",
      "²¹⁰₈₄Po → ²⁰⁶₈₂Pb + ⁴₂He",
      "¹⁴₆C → ¹⁴₇N + ⁰₋₁e"
    ],
    correctAnswer: "²₁H + ³₁H → ⁴₂He + ¹₀n",
    lesson: 'Physique Nucléaire',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Calculer l'énergie cinétique d'un électron (en Joules) après avoir été accéléré par une différence de potentiel de 1000 V. Donnée: e = 1.6 x 10⁻¹⁹ C.",
    options: [],
    correctAnswer: "E_c = |q|U = 1.6 x 10⁻¹⁹ * 1000 = 1.6 x 10⁻¹⁶ J.",
    lesson: 'Electromagnétisme',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'free_text',
    text: "Quel est le rôle du pont salin dans une pile électrochimique ?",
    options: [],
    correctAnswer: "Le pont salin a deux rôles: fermer le circuit électrique en permettant le passage des ions, et maintenir l'électroneutralité des solutions dans les deux demi-piles.",
    lesson: 'Chimie - Piles et Electrolyse',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "L'équation horaire d'un pendule simple est \\(\\theta(t) = \\theta_m \\cos(\\frac{2\\pi}{T_0}t)\\). A quel instant la vitesse angulaire est-elle maximale en valeur absolue ?",
    options: [
      "Quand θ(t) = 0 (passage par la position d'équilibre)",
      "Quand θ(t) = θ_m (élongation maximale)",
      "A t = T₀/2",
      "La vitesse est constante"
    ],
    correctAnswer: "Quand θ(t) = 0 (passage par la position d'équilibre)",
    lesson: 'Mécanique - Oscillations',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Donner la définition de la célérité d'une onde.",
    options: [],
    correctAnswer: "La célérité d'une onde est la vitesse à laquelle l'onde se propage dans un milieu donné, c'est-à-dire la vitesse de propagation de la perturbation, sans transport de matière.",
    lesson: 'Ondes',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Soit une réaction d'estérification. Comment peut-on augmenter le rendement de la réaction ?",
    options: [],
    correctAnswer: "On peut augmenter le rendement en utilisant un des réactifs en excès, ou en éliminant l'un des produits (l'eau par exemple) au fur et à mesure de sa formation.",
    lesson: 'Chimie - Cinétique',
    generatedBy: 'db'
  },
    {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'mcq',
    text: "Parmi les grandeurs suivantes, laquelle ne se conserve pas lors de la traversée d'un dioptre par une onde lumineuse ?",
    options: [ "La longueur d'onde", "La fréquence", "La période", "L'énergie du photon" ],
    correctAnswer: "La longueur d'onde",
    lesson: 'Ondes - Optique',
    generatedBy: 'db'
  }
];


async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.insertMany(questions);
    console.log(`${result.insertedCount} documents were inserted successfully.`);

  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

run().catch(console.dir);