const { MongoClient, ObjectId } = require('mongodb');

// رابط الاتصال بقاعدة البيانات
const uri = "mongodb+srv://majoriyad:ohX8v7WGQEfI56GR@cluster0.bpqezif.mongodb.net/";
const dbName = 'test';
const collectionName = 'questions';

// IDs ثابتة
const academicLevelId = new ObjectId('6856e57742d2333b081f4375');
const trackId = new ObjectId('6856e5bd42d2333b081f438d');
const subjectId = new ObjectId('6856e94c42d2333b081f4522'); // ID لمادة SVT

const questions = [
  // --- Questions finales de synthèse ---
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Contexte : La télomérase est une enzyme active dans les cellules souches et les cellules cancéreuses, mais généralement inactive dans la plupart des cellules somatiques. \n\n Question : Expliquez le rôle de la télomérase et pourquoi son activation est une étape cruciale dans le processus de cancérisation, conférant à la cellule une 'immortalité' réplicative.",
    options: [],
    correctAnswer: "Les télomères, situés aux extrémités des chromosomes, raccourcissent à chaque division cellulaire. Ce raccourcissement agit comme une horloge biologique, menant à la sénescence et à l'arrêt des divisions. La télomérase est une enzyme qui allonge les télomères en ajoutant des séquences répétitives, compensant ainsi ce raccourcissement. Dans les cellules cancéreuses, la réactivation de la télomérase leur permet de contourner la sénescence et de se diviser indéfiniment, une caractéristique essentielle de leur prolifération incontrôlée.",
    lesson: 'Synthèse des unités 2 et 4',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "Un patient est suspecté d'avoir une maladie auto-immune où ses propres LTc attaquent ses cellules bêta du pancréas. Quel est le mécanisme le plus probable de cette destruction ?",
    options: [
      "Les LTc reconnaissent un peptide du 'soi' (ex: un fragment d'insuline) présenté par le CMH I des cellules bêta et les induisent en apoptose.",
      "Les LTc libèrent des anticorps qui se fixent sur les cellules bêta.",
      "Les LTc phagocytent directement les cellules bêta.",
      "Les LTc activent la production d'histamine qui détruit les cellules bêta."
    ],
    correctAnswer: "Les LTc reconnaissent un peptide du 'soi' (ex: un fragment d'insuline) présenté par le CMH I des cellules bêta et les induisent en apoptose.",
    lesson: 'Dysfonctionnements du système immunitaire',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Quelle est la principale différence structurale entre une faille normale et une faille inverse ?",
    options: [
      "Le sens de déplacement relatif des blocs : le toit descend dans une faille normale (distension) et monte dans une faille inverse (compression).",
      "La nature de la roche : les failles normales n'affectent que les roches sédimentaires.",
      "L'angle du plan de faille, qui est toujours vertical pour une faille normale.",
      "Il n'y a pas de différence, les termes sont interchangeables."
    ],
    correctAnswer: "Le sens de déplacement relatif des blocs : le toit descend dans une faille normale (distension) et monte dans une faille inverse (compression).",
    lesson: 'Géologie - Déformations tectoniques',
    generatedBy: 'db'
  },
    {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Contexte : On souhaite produire une protéine humaine thérapeutique (ex: l'érythropoïétine, EPO) dans des cellules animales en culture plutôt que dans des bactéries. L'EPO est une glycoprotéine, c'est-à-dire qu'elle porte des chaînes de sucres complexes. \n\n Question : Expliquez pourquoi l'utilisation de cellules eucaryotes (animales) est indispensable pour produire une EPO fonctionnelle, contrairement à l'insuline qui peut être produite dans des bactéries.",
    options: [],
    correctAnswer: "La raison principale est la glycosylation. C'est une modification post-traductionnelle (ajout de sucres) qui se produit dans le réticulum endoplasmique et l'appareil de Golgi des cellules eucaryotes. Ces modifications sont cruciales pour le repliement correct, la stabilité et la fonction de nombreuses protéines comme l'EPO. Les bactéries ne possèdent pas cet appareil de maturation complexe. L'insuline, étant une protéine plus simple et non glycosylée, n'a pas besoin de ces modifications et peut donc être produite correctement dans des bactéries.",
    lesson: 'Génie génétique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Lors de la méiose, si les deux chromosomes X d'une femme ne se séparent pas lors de l'anaphase I (non-disjonction), quels seront les génotypes chromosomiques des quatre ovules produits ?",
    options: [
        "Deux ovules (24, XX) et deux ovules (22, 0).",
        "Quatre ovules (24, XX).",
        "Un ovule (24, XX), un ovule (22, 0) et deux ovules normaux (23, X).",
        "Quatre ovules normaux (23, X)."
    ],
    correctAnswer: "Deux ovules (24, XX) et deux ovules (22, 0).",
    lesson: 'Anomalies chromosomiques',
    generatedBy: 'db'
  },
    {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'mcq',
    text: "Lequel de ces éléments n'est PAS un composant de la lithosphère ?",
    options: [ "La croûte continentale", "La croûte océanique", "Le manteau supérieur rigide", "L'asthénosphère ductile" ],
    correctAnswer: "L'asthénosphère ductile",
    lesson: 'Géologie - Structure du globe',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Contexte : L'ADN mitochondrial (ADNmt) est transmis quasi-exclusivement par la mère. Il présente un taux de mutation plus élevé que l'ADN nucléaire et ne subit pas de recombinaison. \n\n Question : Expliquez comment ces caractéristiques font de l'ADNmt un outil précieux en génétique des populations et pour retracer les lignées maternelles (phylogénie).",
    options: [],
    correctAnswer: "1. Transmission maternelle : Il permet de suivre une lignée directe de mère en fille/fils sans la 'dilution' de la recombinaison, ce qui facilite la reconstitution des arbres généalogiques maternels (ex: l'Ève mitochondriale). \n 2. Taux de mutation élevé : Les mutations s'accumulent relativement vite, ce qui en fait une bonne 'horloge moléculaire' pour dater des événements de divergence entre populations humaines sur des échelles de temps de quelques milliers à dizaines de milliers d'années. Les différences dans les séquences d'ADNmt entre deux populations sont proportionnelles au temps écoulé depuis leur ancêtre commun.",
    lesson: 'Génétique des populations',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Quelle est la différence fondamentale entre la sélection clonale des lymphocytes B et celle des lymphocytes T ?",
    options: [
        "Il n'y a pas de différence fondamentale.",
        "Les LB reconnaissent l'antigène directement via leur BCR, tandis que les LT le reconnaissent sous forme de peptide présenté par une molécule du CMH.",
        "Seuls les lymphocytes B subissent une sélection clonale.",
        "La sélection clonale des LT se produit dans la moelle osseuse."
    ],
    correctAnswer: "Les LB reconnaissent l'antigène directement via leur BCR, tandis que les LT le reconnaissent sous forme de peptide présenté par une molécule du CMH.",
    lesson: 'Immunologie',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Contexte : Le gradient géothermique moyen dans la croûte est de 30°C/km. Dans une zone de subduction, ce gradient est beaucoup plus faible (ex: 5-10°C/km), alors qu'au niveau d'une dorsale, il est beaucoup plus élevé. \n\n Question : Expliquez la raison de ces anomalies thermiques. Reliez le gradient de subduction au métamorphisme HP/BT et le gradient de dorsale au magmatisme.",
    options: [],
    correctAnswer: "Zone de subduction : La plaque plongeante est une lithosphère océanique vieille, froide et dense. En s'enfonçant rapidement dans le manteau chaud, elle 'refroidit' la zone. Une roche qui s'enfonce avec elle voit sa pression augmenter rapidement, mais sa température n'a pas le temps de s'équilibrer, d'où un gradient faible et un métamorphisme HP/BT. \n Zone de dorsale : C'est une zone de remontée de l'asthénosphère chaude vers la surface. Le gradient thermique y est donc très élevé, provoquant la fusion par décompression de la péridotite et un magmatisme intense.",
    lesson: 'Géologie - Métamorphisme',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'mcq',
    text: "L'unité de base de la contraction musculaire, délimitée par deux stries Z successives, est appelée :",
    options: ["Myofibrille", "Sarcomère", "Fibre musculaire", "Réticulum sarcoplasmique"],
    correctAnswer: "Sarcomère",
    lesson: 'Consommation de matière organique et flux d\'énergie',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Si une femme porteuse saine de l'hémophilie (liée à l'X récessif) a des enfants avec un homme sain, quel est le risque pour eux d'avoir un garçon hémophile ?",
    options: [ "0%", "25%", "50%", "100%" ],
    correctAnswer: "25%",
    lesson: 'Génétique humaine',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Contexte : Lors d'un effort physique, le pH sanguin peut légèrement diminuer à cause de l'accumulation d'acide lactique et de CO₂. \n\n Question : Expliquez comment une baisse du pH sanguin (augmentation de [H⁺]) facilite la libération de l'oxygène par l'hémoglobine au niveau des tissus actifs. Comment appelle-t-on cet effet ?",
    options: [],
    correctAnswer: "Cet effet s'appelle l'effet Bohr. Une augmentation de la concentration en H⁺ (baisse de pH) et en CO₂ dans les tissus actifs modifie la conformation de la protéine d'hémoglobine. Les ions H⁺ se lient à l'hémoglobine, ce qui diminue son affinité pour l'O₂. L'hémoglobine 'relâche' donc plus facilement l'oxygène qu'elle transporte, ce qui permet de mieux approvisionner les muscles en O₂ au moment où ils en ont le plus besoin. C'est un mécanisme d'adaptation physiologique.",
    lesson: 'Consommation de matière organique et flux d\'énergie',
    generatedBy: 'db'
  },
    {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Contexte : L'électrophorèse de l'ADN est une technique de base en biologie moléculaire. \n\n Question : Expliquez le principe de cette technique. Sur quel critère les fragments d'ADN sont-ils séparés, et vers quelle électrode (positive ou négative) migrent-ils et pourquoi ?",
    options: [],
    correctAnswer: "Principe : C'est une technique qui permet de séparer des molécules (ici, l'ADN) en fonction de leur taille en les faisant migrer dans un champ électrique à travers un gel (ex: agarose). \n Critère de séparation : La taille. Le gel agit comme un tamis moléculaire : les petits fragments migrent plus rapidement et plus loin que les grands fragments. \n Direction de migration : L'ADN est chargé négativement à cause de ses groupements phosphate (PO₄³⁻). Il migre donc vers l'électrode positive (l'anode).",
    lesson: 'Génie génétique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Laquelle de ces affirmations concernant une chaîne de collision est FAUSSE ?",
    options: [
      "Elle est caractérisée par un fort épaississement crustal.",
      "Elle présente un volcanisme andésitique intense et actif.",
      "On y trouve des déformations ductiles comme des plis et des nappes de charriage.",
      "Elle est le résultat de l'affrontement de deux masses continentales."
    ],
    correctAnswer: "Elle présente un volcanisme andésitique intense et actif.",
    lesson: 'Géologie - Chaînes de montagnes',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Contexte : Un patient, après avoir reçu une greffe de rein, doit prendre à vie des médicaments immunosuppresseurs comme la cyclosporine. La cyclosporine agit en inhibant la production d'interleukine 2 (IL-2) par les lymphocytes T auxiliaires. \n\n Question : Expliquez en détail pourquoi le blocage de la production d'IL-2 empêche efficacement le rejet de la greffe, en décrivant l'impact de cette inhibition sur les réponses humorale et cellulaire.",
    options: [],
    correctAnswer: "L'IL-2 est la principale cytokine responsable de l'expansion clonale (prolifération) des lymphocytes T après leur activation. En bloquant sa production : \n 1. Impact sur la réponse cellulaire : Les LTc, même s'ils sont activés, ne peuvent pas proliférer massivement. Le nombre de cellules effectrices capables de détruire le greffon reste donc très faible. \n 2. Impact sur la réponse humorale : L'activation et la prolifération des LT auxiliaires sont elles-mêmes inhibées. Or, les LT auxiliaires sont indispensables pour activer la plupart des lymphocytes B. Sans cette aide, les LB ne peuvent pas se différencier en plasmocytes et produire des anticorps anti-greffon. \n En résumé, la cyclosporine paralyse l'amplification de la réponse immunitaire adaptative dirigée contre le greffon.",
    lesson: 'Dysfonctionnements du système immunitaire',
    generatedBy: 'db'
  },
    {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'mcq',
    text: "Les allèles d'un gène sont situés :",
    options: [ "Sur des chromosomes différents.", "À des locus différents sur le même chromosome.", "Au même locus sur des chromosomes homologues.", "Uniquement sur les chromosomes sexuels." ],
    correctAnswer: "Au même locus sur des chromosomes homologues.",
    lesson: 'Transmission de l\'information génétique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Quel est l'ion qui, en se liant à la troponine, déclenche le glissement des filaments d'actine et de myosine et donc la contraction musculaire ?",
    options: ["Sodium (Na⁺)", "Potassium (K⁺)", "Calcium (Ca²⁺)", "Chlore (Cl⁻)"],
    correctAnswer: "Calcium (Ca²⁺)",
    lesson: 'Consommation de matière organique et flux d\'énergie',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Contexte : La Terre possède un champ magnétique global, généré par des mouvements dans son noyau externe liquide. Ce champ protège la planète des vents solaires. \n\n Question : Expliquez comment ce champ magnétique est 'fossilisé' dans les roches volcaniques lors de leur refroidissement. Comment cette 'mémoire' magnétique, appelée paléomagnétisme, a-t-elle été un argument décisif en faveur de la théorie de la dérive des continents ?",
    options: [],
    correctAnswer: "1. Fossilisation : Les laves basaltiques sont riches en minéraux ferromagnétiques (ex: magnétite). Au-dessus d'une certaine température (point de Curie), ces minéraux sont non magnétiques. En refroidissant sous le point de Curie, leurs domaines magnétiques s'alignent sur le champ magnétique terrestre ambiant, comme de minuscules aiguilles de boussole. Cette orientation est figée dans la roche. \n 2. Argument pour la dérive : En mesurant le paléomagnétisme de roches d'âges différents sur un même continent, les scientifiques ont constaté que le pôle Nord magnétique semblait avoir 'dérivé' au cours du temps. Or, il est plus plausible que le pôle soit resté fixe et que ce soit le continent qui ait dérivé. De plus, les courbes de dérive du pôle reconstituées pour l'Europe et l'Amérique du Nord étaient différentes mais se superposaient parfaitement si on 'recollait' les deux continents, prouvant qu'ils étaient autrefois soudés.",
    lesson: 'Géologie - Tectonique des plaques',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Comparez la réponse immunitaire primaire et la réponse immunitaire secondaire en termes de temps de latence, d'intensité (quantité d'anticorps) et de durée.",
    options: [],
    correctAnswer: "Réponse primaire (1er contact) : Temps de latence long (plusieurs jours), intensité faible (pic d'anticorps modéré, principalement des IgM puis IgG), durée courte. \n Réponse secondaire (2ème contact) : Temps de latence très court (rapide), intensité très forte (pic d'anticorps beaucoup plus élevé, principalement des IgG de haute affinité), durée plus longue. Ceci est dû à la présence de cellules mémoire.",
    lesson: 'Immunologie',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'mcq',
    text: "Lequel de ces éléments n'est pas nécessaire à la traduction ?",
    options: [ "ARNm", "Ribosome", "ARNt", "ADN polymérase" ],
    correctAnswer: "ADN polymérase",
    lesson: 'Information génétique et son expression',
    generatedBy: 'db'
  },
    {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Une roche qui a subi un métamorphisme intense au point de commencer à fondre est appelée :",
    options: [ "Une migmatite", "Un gneiss", "Une éclogite", "Une cornéenne" ],
    correctAnswer: "Une migmatite",
    lesson: 'Géologie - Magmatisme',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Contexte : L'anémie falciforme est due à une mutation ponctuelle dans le gène de la β-globine, remplaçant un acide glutamique (hydrophile) par une valine (hydrophobe) en position 6. \n\n Question : Expliquez comment ce simple changement d'un acide aminé peut entraîner une modification radicale de la structure quaternaire de l'hémoglobine en condition de faible O₂, la déformation des hématies, et les crises vaso-occlusives douloureuses caractéristiques de la maladie.",
    options: [],
    correctAnswer: "La présence de la valine hydrophobe en surface de la protéine crée un 'site collant'. En condition de désoxygénation, ces sites collants interagissent avec des sites complémentaires sur d'autres molécules d'hémoglobine S. Cela provoque la polymérisation des molécules d'hémoglobine en de longues fibres rigides à l'intérieur de l'hématie. Ces fibres déforment le globule rouge, qui prend une forme de faucille. Ces hématies rigides et déformées ont du mal à passer dans les petits capillaires, provoquant des blocages (crises vaso-occlusives) qui privent les tissus d'oxygène et causent une douleur intense.",
    lesson: 'Synthèse des unités 1, 2, 3',
    generatedBy: 'db'
  },
    {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Dans le cas d'une maladie autosomique dominante à pénétrance incomplète, un individu possédant le génotype de la maladie :",
    options: [
        "Exprimera toujours le phénotype de la maladie.",
        "Peut ne pas exprimer le phénotype de la maladie mais peut quand même le transmettre à ses enfants.",
        "Est forcément homozygote dominant.",
        "Ne peut pas transmettre la maladie."
    ],
    correctAnswer: "Peut ne pas exprimer le phénotype de la maladie mais peut quand même le transmettre à ses enfants.",
    lesson: 'Génétique humaine',
    generatedBy: 'db'
  },
    {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "La vaccination contre le tétanos se fait en utilisant l'anatoxine tétanique. L'anatoxine est la toxine bactérienne qui a été traitée chimiquement pour lui faire perdre son pouvoir pathogène tout en conservant son pouvoir immunogène. Ce type de vaccin induit principalement :",
    options: [
        "Une réponse à médiation cellulaire contre la bactérie Clostridium tetani.",
        "Une réponse humorale avec production d'anticorps neutralisants dirigés contre la toxine.",
        "Une immunité innée non spécifique.",
        "Une tolérance immunitaire envers la toxine."
    ],
    correctAnswer: "Une réponse humorale avec production d'anticorps neutralisants dirigés contre la toxine.",
    lesson: 'Immunologie',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Contexte : Les dorsales médio-océaniques sont des frontières de plaques divergentes. \n\n Question : Décrivez la structure et le fonctionnement d'une dorsale. Expliquez comment la lithosphère océanique est créée à ce niveau.",
    options: [],
    correctAnswer: "Une dorsale est un relief sous-marin allongé où deux plaques s'écartent. Cet écartement provoque une baisse de pression dans le manteau sous-jacent (asthénosphère). Cette décompression entraîne la fusion partielle de la péridotite mantellique, produisant un magma basaltique. Ce magma remonte : une partie cristallise en profondeur pour former les gabbros (croûte inférieure), une autre partie remonte par des filons et s'épanche en surface sous forme de basaltes en coussins (croûte supérieure). Cette production continue de roche magmatique forme la nouvelle lithosphère océanique qui est ensuite écartée de part et d'autre de l'axe de la dorsale.",
    lesson: 'Géologie - Tectonique des plaques',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'سهل',
    type: 'mcq',
    text: "Le phénomène par lequel une cellule se divise pour donner deux cellules filles génétiquement identiques s'appelle :",
    options: [ "La méiose", "La mitose", "La fécondation", "La transcription" ],
    correctAnswer: "La mitose",
    lesson: 'Transmission de l\'information génétique',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Contexte : L'ATP est souvent qualifiée de 'monnaie énergétique' de la cellule. \n\n Question : Expliquez cette analogie. Décrivez comment l'énergie est 'stockée' dans la molécule d'ATP et comment elle est 'libérée' pour alimenter les activités cellulaires. Donnez deux exemples concrets d'utilisation de l'ATP dans la cellule.",
    options: [],
    correctAnswer: "Analogie : L'ATP est comme une petite batterie rechargeable. Elle est produite par les voies cataboliques (respiration, fermentation) et consommée par les voies anaboliques et autres activités. \n Stockage/Libération : L'énergie est stockée dans les liaisons phosphate, en particulier la dernière liaison pyrophosphate qui est très énergétique. L'hydrolyse de cette liaison (ATP -> ADP + Pi) libère une quantité importante d'énergie. \n Exemples : 1. Contraction musculaire : l'hydrolyse de l'ATP permet le détachement et le réarmement des têtes de myosine. 2. Transport actif : l'ATP alimente les pompes membranaires (ex: pompe Na+/K+) pour transporter des ions contre leur gradient de concentration. 3. Synthèses : l'ATP fournit l'énergie pour la synthèse de macromolécules (protéines, ADN...).",
    lesson: 'Consommation de matière organique et flux d\'énergie',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Un séisme de magnitude 7 libère environ combien de fois plus d'énergie qu'un séisme de magnitude 6 ?",
    options: [ "1.5 fois", "10 fois", "32 fois", "100 fois" ],
    correctAnswer: "32 fois",
    lesson: 'Géologie - Sismologie',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'free_text',
    text: "Quelle est la différence entre un génotype et un phénotype ? Donnez un exemple.",
    options: [],
    correctAnswer: "Génotype : C'est la constitution allélique d'un individu pour un ou plusieurs gènes. Il est représenté par des lettres (ex: AA, Aa, aa). \n Phénotype : C'est l'ensemble des caractères observables d'un individu (aspect, physiologie...). Il résulte de l'expression du génotype et de l'influence de l'environnement. \n Exemple : Pour le gène des groupes sanguins, une personne de génotype A/O a un phénotype [A].",
    lesson: 'Génétique humaine',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "Quelle est la signature géochimique principale d'un magma issu d'une zone de subduction par rapport à un magma de dorsale ?",
    options: [
        "Il est plus riche en eau et en éléments volatils, et présente une 'anomalie négative' en certains éléments comme le Niobium (Nb) et le Tantale (Ta).",
        "Il est complètement anhydre (sans eau).",
        "Il est plus riche en Fer et en Magnésium.",
        "Il est de nature exclusivement granitique."
    ],
    correctAnswer: "Il est plus riche en eau et en éléments volatils, et présente une 'anomalie négative' en certains éléments comme le Niobium (Nb) et le Tantale (Ta).",
    lesson: 'Géologie - Magmatisme',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "Laquelle de ces cellules est une cellule phagocytaire professionnelle ?",
    options: [ "Lymphocyte B", "Plasmocyte", "Macrophage", "Hématie" ],
    correctAnswer: "Macrophage",
    lesson: 'Immunologie',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'free_text',
    text: "Contexte : L'opéron lactose chez la bactérie E. coli est un modèle classique de régulation de l'expression des gènes. Il contient les gènes de structure nécessaires à l'utilisation du lactose, et est contrôlé par un répresseur. \n\n Question : Décrivez comment l'opéron est régulé en l'absence de lactose, puis en présence de lactose. Expliquez pourquoi ce système est un exemple de régulation par induction.",
    options: [],
    correctAnswer: "Absence de lactose : Le répresseur (codé par un gène régulateur) est actif. Il se fixe sur l'opérateur, une séquence d'ADN située juste après le promoteur. Cette fixation bloque physiquement la progression de l'ARN polymérase, et les gènes de structure ne sont pas transcrits. \n Présence de lactose : Le lactose (ou un de ses dérivés) se fixe sur le répresseur. Ce dernier change de forme et ne peut plus se lier à l'opérateur. L'ARN polymérase est alors libre de transcrire les gènes, permettant la production des enzymes nécessaires à la dégradation du lactose. \n C'est un système inductible car la présence du substrat (le lactose) induit (déclenche) l'expression des gènes nécessaires à son propre métabolisme. C'est un mécanisme économique pour la cellule.",
    lesson: 'Information génétique et son expression',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'متوسط',
    type: 'mcq',
    text: "L'ADN est une double hélice. Les deux brins sont reliés entre eux par :",
    options: [
        "Des liaisons covalentes.",
        "Des liaisons hydrogène entre les bases azotées complémentaires.",
        "Des ponts disulfure.",
        "Des liaisons peptidiques."
    ],
    correctAnswer: "Des liaisons hydrogène entre les bases azotées complémentaires.",
    lesson: 'Information génétique et son expression',
    generatedBy: 'db'
  },
  {
    academicLevel: academicLevelId,
    track: trackId,
    subject: subjectId,
    level: 'صعب',
    type: 'mcq',
    text: "La dérive génétique est un mécanisme de l'évolution qui a un impact particulièrement fort dans :",
    options: [ "Les grandes populations où la sélection naturelle est forte.", "Les populations de petite taille.", "Toutes les populations de manière égale.", "Les populations qui ne subissent pas de mutations." ],
    correctAnswer: "Les populations de petite taille.",
    lesson: 'Génétique des populations',
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