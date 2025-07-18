// concours/FMD-FMP_pc.js
// المادة: الفيزياء والكيمياء - مباراة ولوج كليتي الطب والصيدلة
// المستوى: مراجعة لبرنامج البكالوريا علوم تجريبية (SVT و PC) مع تركيزات خاصة بمباريات FMD/FMP

module.exports = [
  // ===================================
  //            PHYSIQUE (الفيزياء)
  // ===================================

  // === ONDES (الموجات) ===
  {
    titreLecon: "Ondes Mécaniques Progressives et Périodiques",
    langueContenu: "fr",
    paragraphes: [
      "Définition, types (transversale, longitudinale), célérité, retard temporel",
      "Onde périodique, sinusoïdale : période (T), fréquence (N), longueur d'onde (λ)",
      "Relation λ = v.T",
      "Diffraction des ondes mécaniques (aspect qualitatif)",
      "Ondes sonores et ultrasonores (applications médicales : échographie - principe)"
    ]
  },
  {
    titreLecon: "Propagation d'une Onde Lumineuse - Applications",
    langueContenu: "fr",
    paragraphes: [
      "Nature ondulatoire de la lumière, spectre visible",
      "Diffraction de la lumière par une fente (θ = λ/a)",
      "Dispersion de la lumière par un prisme, indice de réfraction",
      "Fibres optiques (principe de la réflexion totale, applications médicales : endoscopie)"
    ]
  },

  // === TRANSFORMATIONS NUCLÉAIRES (التحولات النووية) - Très important ===
  {
    titreLecon: "La Décroissance Radioactive et Applications Médicales",
    langueContenu: "fr",
    paragraphes: [
      "Stabilité et instabilité des noyaux, diagramme (N,Z)",
      "Radioactivité : α, β-, β+, émission γ, lois de Soddy",
      "Loi de la décroissance radioactive N(t), activité A(t) (Bq)",
      "Constante radioactive λ, temps de demi-vie t1/2",
      "Datation (Carbone 14 - principe)",
      "Applications médicales des radioisotopes : diagnostic (scintigraphie, TEP - principes), thérapie (radiothérapie - principe)",
      "Radioprotection (notions de base, dangers des radiations ionisantes)"
    ]
  },
  {
    titreLecon: "Noyaux, Masse et Énergie",
    langueContenu: "fr",
    paragraphes: [
      "Équivalence masse-énergie (E=mc²), unités (u, MeV/c², MeV)",
      "Défaut de masse, énergie de liaison par nucléon (El/A)",
      "Réactions de fission et de fusion (principes)",
      "Bilan énergétique d'une réaction nucléaire"
    ]
  },

  // === ÉLECTRICITÉ (الكهرباء) ===
  {
    titreLecon: "Dipôles RC, RL en Régime Transitoire (Bases)",
    langueContenu: "fr",
    paragraphes: [
      "Condensateur : charge et décharge (évolution qualitative de uc et i, constante de temps τ=RC)",
      "Énergie emmagasinée Ee = (1/2)C.uc²",
      "Bobine : établissement et rupture du courant (évolution qualitative de i, constante de temps τ=L/R)",
      "Énergie emmagasinée Em = (1/2)L.i²",
      "Le circuit RLC série libre n'est généralement pas un focus majeur, mais la notion d'oscillation peut être mentionnée."
    ]
  },
  // La mécanique est souvent moins détaillée que pour les concours d'ingénieurs.
  // Les lois de Newton et l'énergie sont les plus probables.
  {
    titreLecon: "Mécanique : Lois de Newton et Énergie (Notions Fondamentales)",
    langueContenu: "fr",
    paragraphes: [
      "Les trois lois de Newton (énoncés et applications simples : chute libre, mouvement sur plan)",
      "Travail d'une force, puissance",
      "Énergie cinétique Ec = (1/2)mv²",
      "Énergie potentielle de pesanteur Epp = mgz",
      "Énergie mécanique Em = Ec + Epp, conservation en l'absence de frottements"
    ]
  },

  // ===================================
  //            CHIMIE (الكيمياء) - Très importante
  // ===================================

  // === CINÉTIQUE CHIMIQUE ===
  {
    titreLecon: "Suivi Temporel d'une Transformation Chimique - Vitesse de Réaction",
    langueContenu: "fr",
    paragraphes: [
      "Transformations rapides et lentes",
      "Méthodes de suivi (physiques : conductimétrie, pH-métrie, spectrophotométrie ; chimiques : titrage)",
      "Vitesse volumique de réaction (définition, calcul à partir de graphes)",
      "Temps de demi-réaction t1/2",
      "Facteurs cinétiques (concentration, température) et leur influence",
      "Catalyse (définition, types, rôle notamment en biochimie - enzymes)"
    ]
  },

  // === ÉQUILIBRES CHIMIQUES ===
  {
    titreLecon: "Transformations Chimiques Non Totales – État d'Équilibre",
    langueContenu: "fr",
    paragraphes: [
      "Réaction limitée, état d'équilibre dynamique",
      "Taux d'avancement final τ",
      "Quotient de réaction Qr, constante d'équilibre K (associée à l'équation)",
      "Influence des conditions initiales et des facteurs (concentration, température, pression) sur l'état d'équilibre (Loi de Le Chatelier qualitative)"
    ]
  },
  {
    titreLecon: "Transformations Acido-Basiques en Solution Aqueuse - pH",
    langueContenu: "fr",
    paragraphes: [
      "Acide et base selon Brönsted, couples acide/base",
      "Produit ionique de l'eau Ke, pH des solutions aqueuses (calculs pour acides/bases forts/faibles)",
      "Constante d'acidité Ka, pKa, relation pH = pKa + log([Base]/[Acide])",
      "Domaines de prédominance des espèces acide et basique",
      "Comparaison de la force des acides et des bases",
      "Réaction entre un acide et une base, calcul de la constante d'équilibre K",
      "Solutions tampons : définition, préparation, propriétés, importance biologique (tampons sanguins)"
    ]
  },
  {
    titreLecon: "Titrage Acido-Basique",
    langueContenu: "fr",
    paragraphes: [
      "Principe et caractéristiques d'une réaction de titrage",
      "Titrage pH-métrique : courbe de titrage, repérage du point d'équivalence (méthode des tangentes, dérivée)",
      "Relation à l'équivalence et calcul de concentrations",
      "Choix d'un indicateur coloré approprié"
    ]
  },
  {
    titreLecon: "Transformations Liées aux Réactions d'Oxydo-Réduction (Bases)",
    langueContenu: "fr",
    paragraphes: [
      "Oxydant, réducteur, oxydation, réduction, couples Ox/Red",
      "Équilibrage des demi-équations et de l'équation bilan en milieu acide ou basique",
      "Piles électrochimiques (fonctionnement simple, polarité - notions de base)",
      "L'électrolyse est moins fréquente mais le principe peut être demandé."
    ]
  },

  // === CHIMIE ORGANIQUE (Très important pour FMD/FMP) ===
  {
    titreLecon: "Chimie Organique : Alcanes, Alcènes, Alcools",
    langueContenu: "fr",
    paragraphes: [
      "Nomenclature des alcanes, alcènes, alcools (chaînes simples et ramifiées)",
      "Isomérie de constitution (chaîne, position, fonction)",
      "Réactions principales des alcènes : addition (H2, H2O, HX, X2)",
      "Alcools : classes (primaire, secondaire, tertiaire), réactions d'oxydation ménagée (distinction des classes), déshydratation"
    ]
  },
  {
    titreLecon: "Chimie Organique : Aldéhydes, Cétones, Acides Carboxyliques",
    langueContenu: "fr",
    paragraphes: [
      "Nomenclature des aldéhydes, cétones, acides carboxyliques",
      "Oxydation des aldéhydes en acides carboxyliques (réactifs doux comme liqueur de Fehling, réactif de Tollens)",
      "Réduction des aldéhydes et cétones en alcools",
      "Acidité des acides carboxyliques"
    ]
  },
  {
    titreLecon: "Chimie Organique : Esters, Amines, Amides - Réactions Clés",
    langueContenu: "fr",
    paragraphes: [
      "Estérification : réaction entre un acide carboxylique et un alcool (caractéristiques : lente, limitée, athermique)",
      "Hydrolyse d'un ester (en milieu acide : limitée ; en milieu basique - saponification : totale et lente à froid)",
      "Amines : nomenclature (primaires, secondaires, tertiaires), basicité",
      "Amides : formation à partir d'acides carboxyliques et d'amines (liaison peptidique - très important)",
      "Hydrolyse des amides (liaison peptidique)"
    ]
  },
  {
    titreLecon: "Stéréoisomérie en Chimie Organique",
    langueContenu: "fr",
    paragraphes: [
      "Isomérie Z/E pour les alcènes",
      "Chiralité, carbone asymétrique (*C)",
      "Énantiomérie (définition, propriétés physiques similaires sauf pouvoir rotatoire, propriétés biologiques différentes - important)",
      "Mélange racémique",
      "Représentation de Cram (perspective)",
      "Diastéréoisomérie (pour les molécules avec plusieurs carbones asymétriques - notion)"
    ]
  },
  {
    titreLecon: "Composés Aromatiques (Benzène et dérivés simples)",
    langueContenu: "fr",
    paragraphes: [
      "Structure du benzène, aromaticité (notion)",
      "Nomenclature de dérivés simples du benzène (toluène, phénol, aniline, acide benzoïque)",
      "Réactions de substitution électrophile aromatique (nitration, halogénation, alkylation de Friedel-Crafts - mécanismes non exigés mais produits à connaître)"
    ]
  }
];