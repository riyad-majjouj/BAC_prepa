const { MongoClient, ObjectId } = require('mongodb');

// رابط الاتصال بقاعدة البيانات
const uri = "mongodb+srv://majoriyad:ohX8v7WGQEfI56GR@cluster0.bpqezif.mongodb.net/";
const dbName = 'test';
const collectionName = 'questions';

// IDs ثابتة
const academicLevelId = new ObjectId('6856e57742d2333b081f4375');
const trackId = new ObjectId('6856e5bd42d2333b081f438d');
const subjectId = new ObjectId('6856e92d42d2333b081f4510');

const questions = [
  // --- Nombres Complexes (Partie 2 - Suite) ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Soit \\( z = \\frac{1+i\\sqrt{3}}{\\sqrt{2}+i\\sqrt{2}} \\). Donner la forme exponentielle et la forme algébrique de z.",
    options: [],
    correctAnswer: "z = e^{i\\pi/12}. Forme algébrique : \\frac{\\sqrt{6}+\\sqrt{2}}{4} + i\\frac{\\sqrt{6}-\\sqrt{2}}{4}.",
    lesson: 'Nombres Complexes',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Écrire sous forme algébrique les racines 6-ièmes de l'unité.",
    options: [],
    correctAnswer: "1, -1, 1/2+i√3/2, 1/2-i√3/2, -1/2+i√3/2, -1/2-i√3/2.",
    lesson: 'Nombres Complexes',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Résoudre dans \\(\\mathbb{C}\\) l'équation : \\(z^3 = 4\\sqrt{2} + 4i\\sqrt{2}\\).",
    options: [],
    correctAnswer: "Le module est 8. L'argument est π/4. Les solutions sont 2e^{i(π/12)}, 2e^{i(9π/12)}, 2e^{i(17π/12)}.",
    lesson: 'Nombres Complexes',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Soit la rotation \\(R\\) de centre \\(\\Omega(3+i)\\) qui transforme \\(A(2+4i)\\) en \\(B(6+2i)\\). Donner l'écriture complexe de la rotation R.",
    options: [],
    correctAnswer: "z' = i(z - (3+i)) + (3+i)  => z' = iz + 4",
    lesson: 'Nombres Complexes',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "Soit \\( z = e^{i\\frac{2\\pi}{7}} \\). On pose \\( S = z+z^2+z^4 \\) et \\( T = z^3+z^5+z^6 \\). Que peut-on dire de S et T ?",
    options: [
      "S et T sont conjugués",
      "S et T sont égaux",
      "S et T sont opposés",
      "S et T sont des réels"
    ],
    correctAnswer: "S et T sont conjugués",
    lesson: 'Nombres Complexes',
    generatedBy: 'db'
  },
  // --- Arithmétique (Suite) ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Soit \\(a,b \\in \\mathbb{Z}\\). Si \\(a = bc + d\\), alors \\(PGCD(a,b)\\) est égal à :",
    options: [
      "PGCD(b, d)",
      "PGCD(a, d)",
      "PGCD(c, d)",
      "d"
    ],
    correctAnswer: "PGCD(b, d)",
    lesson: 'Arithmétique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Si 17 est le reste de la division de \\(a\\) par 19 et 15 est le reste de la division de \\(b\\) par 19, quel est le reste de la division de \\(a+b\\) par 19 ?",
    options: [],
    correctAnswer: "a ≡ 17 ≡ -2 [19], b ≡ 15 ≡ -4 [19]. a+b ≡ -6 ≡ 13 [19]. Le reste est 13.",
    lesson: 'Arithmétique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Montrer que pour tout entier naturel \\(n\\), \\(3^{2n+1} + 2^{n+2}\\) est divisible par 7.",
    options: [],
    correctAnswer: "3^{2n+1} = 3 \\cdot 9^n ≡ 3 \\cdot 2^n [7]. 2^{n+2} = 4 \\cdot 2^n. La somme est ≡ (3+4)2^n ≡ 7 \\cdot 2^n ≡ 0 [7].",
    lesson: 'Arithmétique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "On pose \\(a = n^2+5n+13\\) et \\(b = n+3\\). Que vaut \\(PGCD(a,b)\\) ?",
    options: [
      "PGCD(n+3, 7)",
      "PGCD(n, 7)",
      "1",
      "7"
    ],
    correctAnswer: "PGCD(n+3, 7)",
    lesson: 'Arithmétique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Résoudre dans \\(\\mathbb{Z}/5\\mathbb{Z}\\) l'équation \\(x^2 + \\bar{3}x = \\bar{0}\\).",
    options: [],
    correctAnswer: "x(x+3) = 0. Les solutions sont x = 0̄ ou x = -3̄ = 2̄.",
    lesson: 'Arithmétique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Résoudre dans \\((\\mathbb{Z}/5\\mathbb{Z})^2\\) le système : \\( \\begin{cases} \\bar{3}x + \\bar{2}y = \\bar{1} \\\\ \\bar{2}x + \\bar{4}y = \\bar{3} \\end{cases} \\).",
    options: [],
    correctAnswer: "x = 3̄, y = 1̄.",
    lesson: 'Arithmétique',
    generatedBy: 'db'
  },
  // --- Probabilités (Suite) ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "On tire simultanément trois dés et on note la somme des résultats. Combien y a-t-il de façons d'obtenir 9 ? Et 10 ?",
    options: [],
    correctAnswer: "Pour 9 : 25 façons. Pour 10 : 27 façons.",
    lesson: 'Probabilités',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Dans une urne se trouvent 4 boules noires et 2 boules blanches. Cinq personnes tirent successivement et sans remise. Le premier qui tire une boule blanche a gagné. Quelle est la probabilité de gain pour la 3ème personne ?",
    options: [],
    correctAnswer: "P(gain de 3) = P(N₁N₂B₃) = (4/6) * (3/5) * (2/4) = 1/5.",
    lesson: 'Probabilités',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Une urne contient 15 boules vertes et 10 boules blanches. On tire successivement et sans remise 5 boules. Quelle est la probabilité d'obtenir 3 boules vertes et 2 blanches ?",
    options: [],
    correctAnswer: "(C(15,3) * C(10,2)) / C(25,5)",
    lesson: 'Probabilités',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Dans une classe de 38 élèves, 31 étudient l'anglais et 24 l'espagnol. 4 étudient les 3 langues (anglais, espagnol, allemand). 12 étudient anglais et allemand. 9 étudient espagnol et allemand. Sachant que tous les élèves étudient au moins une langue, combien étudient l'anglais et l'espagnol ?",
    options: [ "22", "19", "18", "20" ],
    correctAnswer: "22", // A utiliser la formule de Poincaré.
    lesson: 'Probabilités',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "On range 5 boules distinguables dans 4 boites distinguables. Quelle est la probabilité qu'aucune boite ne soit vide ?",
    options: [
      "1 - ( (4*3^5 - 6*2^5 + 4*1^5) / 4^5 )",
      "240 / 1024",
      "La même chose que les deux premières réponses",
      "C(5,4)/4^5"
    ],
    correctAnswer: "La même chose que les deux premières réponses", // La formule de Poincaré donne le numérateur
    lesson: 'Probabilités',
    generatedBy: 'db'
  },
  // --- Espaces Vectoriels (Suite) ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Dans l'espace vectoriel des matrices 2x2, la matrice \\( M = \\begin{pmatrix} 2 & 5 \\\\ 3 & 8 \\end{pmatrix} \\) est-elle une combinaison linéaire de \\( M_1 = \\begin{pmatrix} 1 & 1 \\\\ 1 & 0 \\end{pmatrix} \\) et \\( M_2 = \\begin{pmatrix} 1 & 1 \\\\ 0 & 4 \\end{pmatrix} \\) ?",
    options: [
      "Oui, M = 3M₁ - M₂",
      "Oui, M = -M₁ + 3M₂",
      "Non, ce n'est pas possible",
      "Oui, M = M₁ + M₂"
    ],
    correctAnswer: "Oui, M = -M₁ + 3M₂",
    lesson: 'Espaces Vectoriels',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "Soit \\(E = F(\\mathbb{R}, \\mathbb{R})\\). Les fonctions \\(f_0(x)=1, f_1(x)=x, f_2(x)=x^2, f_3(x)=x^3\\) forment une famille. La fonction \\(f(x) = x^3 - 2x^2 - 7x - 4\\) est-elle une combinaison linéaire de cette famille ?",
    options: [
      "Oui, f = f₃ - 2f₂ - 7f₁ - 4f₀",
      "Non, car le terme constant est négatif",
      "Non, car les fonctions ne forment pas une base",
      "Oui, f = f₃ + 2f₂ + 7f₁ + 4f₀"
    ],
    correctAnswer: "Oui, f = f₃ - 2f₂ - 7f₁ - 4f₀",
    lesson: 'Espaces Vectoriels',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Dans \\(\\mathbb{R}^3\\), montrer que \\(F_3 = \\{(x,y,z) \\in \\mathbb{R}^3 / x - y + z = 0\\}\\) est un sous-espace vectoriel et en donner une famille génératrice.",
    options: [],
    correctAnswer: "F₃ est un plan vectoriel. Une famille génératrice est ((1,1,0), (-1,0,1)).",
    lesson: 'Espaces Vectoriels',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "Soit \\( B = (\\vec{u}, \\vec{v}, \\vec{w}) \\) avec \\(\\vec{u}=(\\cos a, \\cos b, \\cos c)\\), \\(\\vec{v}=(\\sin a, \\sin b, \\sin c)\\), et \\(\\vec{w}=(\\sin(x+a), \\sin(x+b), \\sin(x+c))\\). La famille B est-elle liée ou libre ?",
    options: [
      "Liée, car w = (cos x)v + (sin x)u",
      "Libre, car les vecteurs sont indépendants",
      "Cela dépend des valeurs de a, b, c, x",
      "Liée, car w = u + v"
    ],
    correctAnswer: "Liée, car w = (cos x)v + (sin x)u",
    lesson: 'Espaces Vectoriels',
    generatedBy: 'db'
  },
  // --- Calculs Intégrales (Suite) ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Soit la suite \\(u_n = \\int_0^1 \\frac{e^{nx}}{1+e^x} dx\\). En utilisant l'encadrement \\(\\frac{e^{nx}}{1+e} \\le f(x) \\le \\frac{e^{nx}}{2}\\), déduire \\(\\lim_{n \\to +\\infty} \\frac{u_n}{e^n}\\).",
    options: [],
    correctAnswer: "Après intégration, on encadre uₙ. En divisant par eⁿ et en passant à la limite, on trouve que la limite est 0.",
    lesson: 'Calcul Intégral',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Calculer la surface du domaine limité par la courbe de \\(f(x)=x^2\\), l'axe des abscisses et les droites \\(x=1\\) et \\(x=2\\).",
    options: [],
    correctAnswer: "S = \\int_1^2 x^2 dx = [x³/3]_1² = 8/3 - 1/3 = 7/3 u.a.",
    lesson: 'Calcul Intégral',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Calculer la surface du domaine limité par la courbe de \\(f(x)=1-e^x\\), l'axe des abscisses et les droites \\(x=\\ln 2\\) et \\(x=\\ln 4\\).",
    options: [],
    correctAnswer: "Sur [ln2, ln4], f(x) est négative. S = -\\int_{ln2}^{ln4} (1-e^x) dx = \\int_{ln2}^{ln4} (e^x-1) dx = [e^x-x]_{ln2}^{ln4} = (4-ln4) - (2-ln2) = 2 - ln2 u.a.",
    lesson: 'Calcul Intégral',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "Calculer la limite de la somme de Riemann : \\(\\lim_{n \\to +\\infty} \\sum_{k=1}^n \\frac{n}{n^2+k^2}\\).",
    options: [
      "\\pi/4",
      "\\ln(2)",
      "1",
      "e-1"
    ],
    correctAnswer: "\\pi/4",
    lesson: 'Calcul Intégral',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Calculer la limite de la somme de Riemann : \\(\\lim_{n \\to +\\infty} \\sum_{k=1}^n \\frac{1}{\\sqrt{n^2+kn}}\\).",
    options: [],
    correctAnswer: "\\int_0^1 \\frac{1}{\\sqrt{1+x}} dx = [2\\sqrt{1+x}]_0^1 = 2\\sqrt{2} - 2.",
    lesson: 'Calcul Intégral',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Déterminer la fonction primitive de \\(f(x)=\\ln x\\) qui s'annule en \\(x=e\\).",
    options: [],
    correctAnswer: "F(x) = x\\ln x - x. Pour que F(e)=0, F(e) = e - e + C = 0 => C=0. F(x) = xlnx - x.",
    lesson: 'Fonctions Primitives',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Soit \\( F(x) = \\int_x^{\\ln x} e^{-t^2} dt \\). Étudier la dérivabilité de F et calculer F'(x).",
    options: [],
    correctAnswer: "F'(x) = (1/x)e^{-(\\ln x)^2} - e^{-x^2}",
    lesson: 'Calcul Intégral',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "Soit \\( f(t) = \\frac{1}{\\ln t} \\) et \\( F(x) = \\int_x^{x+1} f(t) dt \\). En utilisant un encadrement, déterminer la limite de F(x) en \\(+\\infty\\).",
    options: [
      "0",
      "1",
      "+\\infty",
      "ln(2)"
    ],
    correctAnswer: "0",
    lesson: 'Calcul Intégral',
    generatedBy: 'db'
  },
  // Dernières questions variées
    {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Déterminer le volume du solide engendré par la rotation de la courbe de \\(f(x) = \\sqrt{x}\\) autour de l'axe des abscisses entre a=0 et b=4.",
    options: [],
    correctAnswer: "V = π \\int_0^4 (\\sqrt{x})^2 dx = π \\int_0^4 x dx = π [x²/2]_0^4 = 8π u.v.",
    lesson: 'Calcul Intégral',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Soit la suite numérique \\(u_n = \\int_0^1 \\frac{1}{1+x^n} dx\\). Montrer que \\(\\frac{1}{2} \\le u_n \\le 1\\) pour tout \\(n \\in \\mathbb{N}\\).",
    options: [],
    correctAnswer: "Pour x in [0,1], 0 ≤ xⁿ ≤ 1, donc 1 ≤ 1+xⁿ ≤ 2. On a 1/2 ≤ 1/(1+xⁿ) ≤ 1. On intègre de 0 à 1 pour obtenir le résultat.",
    lesson: 'Calcul Intégral',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Résoudre dans \\(\\mathbb{C}\\) l'équation : \\( (E) 2z^3 - (1+2i)z^2 + (25i-1)z + 13i = 0 \\), sachant qu'elle admet une solution réelle \\(z_0\\).",
    options: [],
    correctAnswer: "En testant z₀ réel, on trouve z₀=-1/2. On factorise par (z+1/2) ou (2z+1) pour trouver les autres solutions qui sont 2+3i et -2-i.",
    lesson: 'Nombres Complexes',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Soient \\(a_n = 2n+1\\) et \\(b_n = 5n+4\\). Montrer que tout diviseur commun de \\(a_n\\) et \\(b_n\\) divise 3.",
    options: [],
    correctAnswer: "Soit d un diviseur commun. d divise 5aₙ - 2bₙ. 5(2n+1) - 2(5n+4) = 10n+5 - 10n-8 = -3. Donc d divise -3, ce qui signifie que d divise 3.",
    lesson: 'Arithmétique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "Un tournoi de tennis accueille 64 joueurs, dont 8 sont têtes de série. Quelle est la probabilité qu'au moins deux têtes de série se rencontrent dès le premier tour (32 matchs) ?",
    options: [
      "1 - (A(56,8)*2^8*32! / 64!)",
      "1 - (C(56,8) / C(64,8))",
      "C(8,2) / C(64,2)",
      "1 - (A(56,8) / A(64,8))"
    ],
    correctAnswer: "1 - (A(56,8)*2^8*32! / 64!)",
    lesson: 'Probabilités',
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