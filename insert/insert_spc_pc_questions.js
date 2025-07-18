const { MongoClient, ObjectId } = require('mongodb');

// --- Informations de connexion ---
const uri = "mongodb+srv://majoriyad:ohX8v7WGQEfI56GR@cluster0.bpqezif.mongodb.net/";
const dbName = 'test';
const collectionName = 'questions';

// --- IDs extraits et utilisés précédemment ---
const academicLevelId = new ObjectId('6856e57742d2333b081f4375'); // 2ème Année Bac
const trackId = new ObjectId('6856e5b242d2333b081f4386');         // Sciences Physiques
const subjectId = new ObjectId('6856e8e642d2333b081f44f4');       // Physique-Chimie

// --- Quinzième et dernier lot de nouvelles questions ---
const newQuestionsBatch15 = [
  // ========== LOT 15 (FIN) ==========

  // --- PHYSIQUE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'mcq',
    text: "Laquelle de ces affirmations décrit correctement la deuxième loi de Kepler (loi des aires) ?",
    options: ["Les planètes décrivent des ellipses.", "Le carré de la période est proportionnel au cube du demi-grand axe.", "Le rayon vecteur reliant la planète au Soleil balaie des aires égales en des durées égales.", "La vitesse de la planète est constante sur son orbite.", "La force de gravitation est en \\(1/r^2\\)."],
    correctAnswer: "Le rayon vecteur reliant la planète au Soleil balaie des aires égales en des durées égales.",
    lesson: "Lois de Kepler", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'free_text',
    text: "Un circuit RLC série est soumis à une tension sinusoïdale de fréquence variable. Définir le facteur de qualité Q et expliquer son influence sur l'acuité de la résonance.",
    options: [],
    correctAnswer: '-',
    lesson: "Circuit RLC série", generatedBy: 'db'
  },
  
  // --- CHIMIE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'سهل', type: 'mcq',
    text: "Pour extraire une espèce organique d'une phase aqueuse, on utilise un solvant extracteur qui doit être :",
    options: ["Miscible avec l'eau et dans lequel l'espèce est très soluble.", "Non miscible avec l'eau et dans lequel l'espèce est très soluble.", "Non miscible avec l'eau et dans lequel l'espèce est peu soluble.", "De même densité que l'eau.", "Un acide fort."],
    correctAnswer: "Non miscible avec l'eau et dans lequel l'espèce est très soluble.",
    lesson: "Synthèse organique - Techniques", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'mcq',
    text: "Dans une pile saline (Leclanché), l'électrode de zinc constitue :",
    options: ["La cathode (pôle +) et l'oxydant.", "L'anode (pôle -) et le réducteur.", "La cathode (pôle +) et le réducteur.", "L'anode (pôle -) et l'oxydant.", "Le pont salin."],
    correctAnswer: "L'anode (pôle -) et le réducteur.",
    lesson: "Piles électrochimiques", generatedBy: 'db'
  },
  
  // --- PHYSIQUE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'mcq',
    text: "Une onde est dite 'progressive' si :",
    options: ["Elle se propage dans une seule direction.", "Elle transporte de la matière.", "Elle est la superposition de deux ondes en sens opposé.", "Elle correspond à la propagation d'une perturbation avec transport d'énergie.", "Son amplitude est constante."],
    correctAnswer: "Elle correspond à la propagation d'une perturbation avec transport d'énergie.",
    lesson: "Ondes mécaniques progressives", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'mcq',
    text: "Un positron est l'antiparticule de l'électron. Lors de la rencontre d'un électron et d'un positron, ils s'annihilent en produisant :",
    options: ["Un proton et un neutron.", "Deux photons gamma.", "Un noyau d'hélium.", "Une paire de neutrinos.", "Rien, ils disparaissent."],
    correctAnswer: "Deux photons gamma.",
    lesson: "Annihilation matière-antimatière", generatedBy: 'db'
  },

  // --- CHIMIE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'free_text',
    text: "Comparer les caractéristiques (vitesse, caractère total/limité) de l'hydrolyse d'un ester en milieu acide et en milieu basique (saponification).",
    options: [],
    correctAnswer: '-',
    lesson: "Hydrolyse vs Saponification", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'mcq',
    text: "Une solution contient les ions \\(Ag^+\\) et \\(Cu^{2+}\\) à la même concentration. On plonge une lame de zinc. Que se passe-t-il en premier ? (Données: \\(E^0(Ag^+/Ag) > E^0(Cu^{2+}/Cu) > E^0(Zn^{2+}/Zn)\\))",
    options: ["Les ions \\(Cu^{2+}\\) sont réduits.", "Les ions \\(Ag^+\\) sont réduits.", "Le zinc est réduit.", "Les ions \\(Ag^+\\) et \\(Cu^{2+}\\) sont réduits simultanément.", "Rien ne se passe."],
    correctAnswer: "Les ions \\(Ag^+\\) sont réduits.",
    lesson: "Oxydoréduction - Réactions compétitives", generatedBy: 'db'
  },

  // --- PHYSIQUE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'سهل', type: 'mcq',
    text: "Laquelle de ces énergies n'est PAS une forme d'énergie mécanique ?",
    options: ["Énergie cinétique de translation", "Énergie potentielle de pesanteur", "Énergie potentielle élastique", "Énergie thermique (chaleur)", "Énergie cinétique de rotation"],
    correctAnswer: "Énergie thermique (chaleur)",
    lesson: "Aspects énergétiques", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'free_text',
    text: "Un solénoïde de longueur L, comportant N spires et de rayon r, est parcouru par un courant I. Donner l'expression du champ magnétique \\(\\vec{B}\\) à l'intérieur du solénoïde (en le considérant infini) et en déduire l'expression de son inductance propre L.",
    options: [],
    correctAnswer: '-',
    lesson: "Dipôle RL - Électromagnétisme", generatedBy: 'db'
  },

  // --- CHIMIE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'mcq',
    text: "Pour un titrage pH-métrique, le point de la courbe où le pH est égal au pKa du couple titré est appelé :",
    options: ["Le point d'équivalence", "Le point de neutralité", "La demi-équivalence", "Le point de virage", "Le point initial"],
    correctAnswer: "La demi-équivalence",
    lesson: "Titrage acido-basique", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'mcq',
    text: "Parmi les alcools de formule \\(C_4H_{10}O\\), lequel ne peut PAS être obtenu par réduction d'un composé carbonylé (aldéhyde ou cétone) ?",
    options: ["Butan-1-ol", "Butan-2-ol", "2-méthylpropan-1-ol", "2-méthylpropan-2-ol", "Tous peuvent être obtenus."],
    correctAnswer: "2-méthylpropan-2-ol",
    lesson: "Chimie organique - Réactions de réduction", generatedBy: 'db'
  },

  // --- PHYSIQUE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'mcq',
    text: "Un noyau radioactif a 1 chance sur 2 de se désintégrer en une durée \\(t_{1/2}\\). La probabilité qu'il se désintègre pendant la première seconde est :",
    options: ["Très élevée, proche de 1", "Très faible, mais non nulle", "Nulle", "Égale à 0.5", "Dépend du nombre total de noyaux"],
    correctAnswer: "Très faible, mais non nulle",
    lesson: "Décroissance radioactive - Aspect probabiliste", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'mcq',
    text: "L'impédance d'un circuit RLC série est donnée par \\(Z = \\sqrt{R^2 + (L\\omega - 1/C\\omega)^2}\\). À très haute fréquence (\\(\\omega \\to \\infty\\)), l'impédance tend vers :",
    options: ["R", "0", "\\(\\infty\\)", "L'impédance de la bobine (L\\(\\omega\\))", "L'impédance du condensateur (1/C\\(\\omega\\))"],
    correctAnswer: "L'impédance de la bobine (L\\(\\omega\\))",
    lesson: "Circuit RLC série", generatedBy: 'db'
  },

  // --- CHIMIE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'free_text',
    text: "Expliquer pourquoi une augmentation de température augmente la vitesse d'une réaction en se basant sur la théorie des chocs efficaces.",
    options: [],
    correctAnswer: '-',
    lesson: "Facteurs cinétiques", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'mcq',
    text: "Pour la réaction \\(A(g) + 2B(g) \\rightleftharpoons C(g)\\), la constante d'équilibre Kp (en fonction des pressions partielles) et Kc (en fonction des concentrations) sont liées par : (R est la cste des gaz parfaits, T la température)",
    options: ["\\(Kp = Kc\\)", "\\(Kp = Kc(RT)^{-1}\\)", "\\(Kp = Kc(RT)^{-2}\\)", "\\(Kp = Kc(RT)\\)", "\\(Kp = Kc(RT)^{2}\\)"],
    correctAnswer: "\\(Kp = Kc(RT)^{-2}\\)",
    lesson: "Constante d'équilibre - Gaz", generatedBy: 'db'
  },
  
  // --- PHYSIQUE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'سهل', type: 'mcq',
    text: "Lequel de ces instruments n'est PAS basé sur le phénomène de diffraction ?",
    options: ["Spectroscope à réseau", "Lecteur de CD/DVD", "Hologramme", "Prisme", "Cristallographie aux rayons X"],
    correctAnswer: "Prisme",
    lesson: "Ondes - Applications", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'free_text',
    text: "Une masse \\(m\\) est suspendue à un ressort de raideur \\(k\\) et de longueur à vide \\(l_0\\). Déterminer l'allongement à l'équilibre \\(\\Delta l_e\\), puis établir l'équation différentielle du mouvement de la masse par rapport à sa position d'équilibre.",
    options: [],
    correctAnswer: '-',
    lesson: "Oscillateur mécanique - Pendule élastique vertical", generatedBy: 'db'
  },

  // --- CHIMIE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'mcq',
    text: "Un oxydant est une espèce chimique qui :",
    options: ["Provoque une oxydation en étant elle-même réduite", "Provoque une réduction en étant elle-même oxydée", "Cède des électrons", "A toujours une charge positive", "Est toujours un métal"],
    correctAnswer: "Provoque une oxydation en étant elle-même réduite",
    lesson: "Oxydoréduction", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'mcq',
    text: "Dans un titrage d'un mélange d'ions \\(Cl^-\\) et \\(I^-\\) par le nitrate d'argent \\(Ag^+\\), lequel des précipités se forme en premier ? Données : \\(K_s(AgCl) = 1.8 \\cdot 10^{-10}\\) et \\(K_s(AgI) = 8.3 \\cdot 10^{-17}\\).",
    options: ["AgCl", "AgI", "Les deux en même temps", "Aucun des deux", "Cela dépend des concentrations initiales"],
    correctAnswer: "AgI",
    lesson: "Produit de solubilité", generatedBy: 'db'
  },
  
  // --- PHYSIQUE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'mcq',
    text: "Un son pur est une onde sonore :",
    options: ["Sinusoïdale", "Carrée", "Triangulaire", "Complexe et périodique", "Non périodique"],
    correctAnswer: "Sinusoïdale",
    lesson: "Ondes sonores - Hauteur et timbre", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'mcq',
    text: "La puissance instantanée reçue par un dipôle soumis à une tension \\(u(t)\\) et traversé par un courant \\(i(t)\\) est \\(p(t) = u(t)i(t)\\). Pour un condensateur, cette puissance représente :",
    options: ["L'énergie stockée.", "La puissance dissipée par effet Joule.", "La variation de l'énergie stockée par unité de temps.", "La capacité du condensateur.", "La charge du condensateur."],
    correctAnswer: "La variation de l'énergie stockée par unité de temps.",
    lesson: "Dipôle RC - Aspects énergétiques", generatedBy: 'db'
  },

  // --- CHIMIE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'free_text',
    text: "Écrire la formule topologique du produit principal de la réaction entre le 2-méthylbut-2-ène et le chlorure d'hydrogène (HCl). Énoncer la règle de Markovnikov.",
    options: [],
    correctAnswer: '-',
    lesson: "Chimie organique - Additions électrophiles", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: 'subjectId',
    level: 'صعب', type: 'mcq',
    text: "On réalise le titrage d'une solution d'ammoniac \\(NH_3\\) par de l'acide chlorhydrique. À l'équivalence, la solution contient principalement :",
    options: ["\\(NH_3\\) et \\(Cl^-\\)", "\\(NH_4^+\\) et \\(Cl^-\\)","\\(NH_3\\) et \\(NH_4^+\\)","\\(H_3O^+\\) et \\(Cl^-\\)","\\(HO^-\\) et \\(NH_4^+\\)"],
    correctAnswer: "\\(NH_4^+\\) et \\(Cl^-\\) ",
    lesson: "Titrage acido-basique", generatedBy: 'db'
  },
  
  // --- PHYSIQUE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'free_text',
    text: "Qu'est-ce que le 'défaut de masse' d'un noyau et comment permet-il de calculer l'énergie de liaison ?",
    options: [],
    correctAnswer: '-',
    lesson: "Bilan de masse et d'énergie", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'mcq',
    text: "La flèche (hauteur maximale) d'un projectile lancé à 45° avec une vitesse \\(v_0\\) est H. Si on double la vitesse initiale (\\(2v_0\\)), la nouvelle flèche H' sera :",
    options: ["H' = H", "H' = 2H", "H' = 4H", "H' = H/2", "H' = \\(\\sqrt{2}\\)H"],
    correctAnswer: "H' = 4H",
    lesson: "Mouvement d'un projectile", generatedBy: 'db'
  },

  // --- CHIMIE ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'متوسط', type: 'mcq',
    text: "Laquelle de ces affirmations est vraie pour une pile à l'équilibre (pile 'usée') ?",
    options: ["La tension à ses bornes est maximale.", "Le quotient de réaction est égal à la constante d'équilibre.", "Les deux électrodes ont la même masse.", "Le pont salin est vide.", "La concentration de tous les ions est nulle."],
    correctAnswer: "Le quotient de réaction est égal à la constante d'équilibre.",
    lesson: "Piles électrochimiques - État d'équilibre", generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId,
    level: 'صعب', type: 'free_text',
    text: "Proposer une méthode de synthèse du propanone à partir du propan-2-ol, en précisant le réactif oxydant, les conditions opératoires et la méthode de purification du produit.",
    options: [],
    correctAnswer: '-',
    lesson: "Synthèse organique", generatedBy: 'db'
  },

];

// --- Script d'insertion ---
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connecté avec succès au serveur");
    const database = client.db(dbName);
    const questionsCollection = database.collection(collectionName);
    const result = await questionsCollection.insertMany(newQuestionsBatch15);
    console.log(`Inséré avec succès ${result.insertedCount} nouveaux documents du Lot 15.`);
    console.log("Mission accomplie ! Les 500 questions ont été générées.");
  } catch (err) {
    console.error("Une erreur est survenue :", err);
  } finally {
    await client.close();
    console.log("Connexion fermée.");
  }
}

run().catch(console.dir);