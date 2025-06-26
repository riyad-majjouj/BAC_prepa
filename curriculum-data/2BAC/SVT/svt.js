// back-end/exam-curriculum-data/2BAC/SVT/svt.js
// (هذا الملف كما قدمته أنت، وهو مناسب للاستخدام مع التعديلات المقترحة أعلاه)
// المادة: علوم الحياة والأرض (SVT)
// المستوى: السنة الثانية بكالوريا
// الشعبة: علوم الحياة والأرض (SVT)

module.exports = [
  // === Unité 1 & 2 : Base des connaissances (Restitution) ===
  {
    titreLecon: "Libération de l'énergie emmagasinée dans la matière organique",
    langueContenu: "fr",
    category: "restitution", // <<< هذه الخاصية مهمة
    paragraphes: [
      "La glycolyse : étape commune, localisation et bilan",
      "La respiration cellulaire : cycle de Krebs et phosphorylation oxydative",
      "La fermentation lactique et alcoolique : étapes et bilan énergétique",
      "Comparaison des rendements énergétiques",
      "Rôle de l'ATP"
    ]
  },
  {
    titreLecon: "Rôle du muscle squelettique dans la conversion de l'énergie",
    langueContenu: "fr",
    category: "restitution", // <<< هذه الخاصية مهمة
    paragraphes: [
      "Structure et ultrastructure du muscle squelettique strié",
      "Mécanisme moléculaire de la contraction musculaire (glissement des filaments)",
      "Régénération de l'ATP dans la cellule musculaire (voies anaérobies et aérobie)"
    ]
  },
  // ... (باقي دروس الاسترداد بنفس النمط) ...
  {
    titreLecon: "Nature de l'information génétique et sa réplication",
    langueContenu: "fr",
    category: "restitution",
    paragraphes: [
      "Localisation et nature chimique de l'information génétique (ADN)",
      "Structure de la molécule d'ADN",
      "La réplication semi-conservative de l'ADN"
    ]
  },
  {
    titreLecon: "Mécanisme d'expression de l'information génétique",
    langueContenu: "fr",
    category: "restitution",
    paragraphes: [
      "La relation gène - protéine - caractère",
      "La transcription : synthèse de l'ARNm",
      "Le code génétique : caractéristiques",
      "La traduction : synthèse des protéines"
    ]
  },
  {
    titreLecon: "Les mutations et le génie génétique",
    langueContenu: "fr",
    category: "restitution",
    paragraphes: [
      "Définition et types de mutations",
      "Conséquences des mutations sur la protéine",
      "Principes et outils du génie génétique (enzymes de restriction, vecteurs)",
      "Applications du génie génétique et enjeux éthiques"
    ]
  },
  
  // === Unité 3, 4, 5 : Analyse et raisonnement (Reasoning) ===
  {
    titreLecon: "La méiose et la diversité génétique",
    langueContenu: "fr",
    category: "reasoning", // <<< هذه الخاصية مهمة
    paragraphes: [
      "Les étapes de la méiose",
      "Le brassage intrachromosomique (crossing-over)",
      "Le brassage interchromosomique",
      "Rôle de la méiose et de la fécondation dans la diversité"
    ]
  },
  {
    titreLecon: "Les lois statistiques de la transmission des caractères (Mendel)",
    langueContenu: "fr",
    category: "reasoning", // <<< هذه الخاصية مهمة
    paragraphes: [
      "Le monohybridisme (dominance, codominance)",
      "Le dihybridisme (gènes indépendants)",
      "Cas de gènes liés (linkage) et cartographie génétique",
      "Interprétation chromosomique des lois de Mendel"
    ]
  },
  // ... (باقي دروس الاستدلال بنفس النمط) ...
  {
    titreLecon: "La génétique humaine",
    langueContenu: "fr",
    category: "reasoning",
    paragraphes: [
      "Analyse des arbres généalogiques (pedigrees)",
      "L'hérédité autosomique (dominante et récessive)",
      "L'hérédité liée au sexe (gènes portés par X ou Y)",
      "Les anomalies chromosomiques (trisomie 21, syndrome de Turner)"
    ]
  },
  {
    titreLecon: "La génétique des populations",
    langueContenu: "fr",
    category: "reasoning",
    paragraphes: [
      "Calcul des fréquences alléliques et génotypiques",
      "La loi de Hardy-Weinberg et ses conditions",
      "Facteurs de variation de la structure génétique (sélection naturelle, dérive génétique, etc.)"
    ]
  },
  {
    titreLecon: "Les chaînes de montagnes et la tectonique des plaques",
    langueContenu: "fr",
    category: "reasoning",
    paragraphes: [
      "Les chaînes de subduction : caractéristiques",
      "Les chaînes d'obduction : caractéristiques",
      "Les chaînes de collision : caractéristiques"
    ]
  },
  {
    titreLecon: "Le métamorphisme et la granitisation",
    langueContenu: "fr",
    category: "reasoning",
    paragraphes: [
      "Définition et facteurs du métamorphisme",
      "Types de métamorphisme (contact, régional)",
      "Relation entre métamorphisme, granitisation et orogenèse"
    ]
  },
  {
    titreLecon: "L'immunité naturelle et acquise",
    langueContenu: "fr",
    category: "reasoning",
    paragraphes: [
      "Le soi et le non-soi (CMH)",
      "L'immunité naturelle (réaction inflammatoire, phagocytose)",
      "La réponse immunitaire à médiation humorale (rôle des LB et anticorps)",
      "La réponse immunitaire à médiation cellulaire (rôle des LTc)",
      "Rôle central des lymphocytes T auxiliaires (LT4)"
    ]
  },
  {
    titreLecon: "Dysfonctionnements et aides au système immunitaire",
    langueContenu: "fr",
    category: "reasoning",
    paragraphes: [
      "La mémoire immunitaire (réponse primaire et secondaire)",
      "Les allergies et les maladies auto-immunes",
      "Le SIDA (VIH, cellules cibles, évolution)",
      "La vaccination et la sérothérapie"
    ]
  }
];