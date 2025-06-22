// 2bac_sm_pc.js
// المادة: الفيزياء والكيمياء
// المستوى: السنة الثانية بكالوريا
// الشعبة: علوم رياضية (أ و ب)

module.exports = [
  // ===================================
  //            PHYSIQUE (الفيزياء)
  // ===================================

  // === ONDES (الموجات) ===
  {
    titreLecon: "Les Ondes Mécaniques Progressives",
    langueContenu: "fr",
    paragraphes: [
      "Définition d'une onde mécanique progressive, types (transversale, longitudinale)",
      "Célérité, retard temporel, élongation",
      "Propagation d'une onde le long d'une corde, à la surface de l'eau, ondes sonores"
    ]
  },
  {
    titreLecon: "Les Ondes Mécaniques Progressives Périodiques",
    langueContenu: "fr",
    paragraphes: [
      "Onde périodique, onde sinusoïdale",
      "Périodicité temporelle (T, N) et périodicité spatiale (λ)",
      "Relation λ = v.T",
      "Phénomène de diffraction des ondes mécaniques",
      "Milieu dispersif"
    ]
  },
  {
    titreLecon: "Propagation d'une Onde Lumineuse",
    langueContenu: "fr",
    paragraphes: [
      "Nature ondulatoire de la lumière",
      "Diffraction de la lumière : mise en évidence, relation θ = λ/a",
      "Dispersion de la lumière par un prisme, indice de réfraction"
    ]
  },

  // === TRANSFORMATIONS NUCLÉAIRES (التحولات النووية) ===
  {
    titreLecon: "La Décroissance Radioactive",
    langueContenu: "fr",
    paragraphes: [
      "Stabilité et instabilité des noyaux, diagramme (N,Z)",
      "Radioactivité α, β-, β+, émission γ, lois de Soddy",
      "Loi de la décroissance radioactive N(t) = N0.e^(-λt), activité A(t)",
      "Constante radioactive λ, temps de demi-vie t1/2",
      "Datation"
    ]
  },
  {
    titreLecon: "Noyaux, Masse et Énergie",
    langueContenu: "fr",
    paragraphes: [
      "Équivalence masse-énergie (E=mc²), unités (u, MeV)",
      "Défaut de masse, énergie de liaison, énergie de liaison par nucléon",
      "Courbe d'Aston, stabilité des noyaux",
      "Réactions nucléaires provoquées : fission et fusion",
      "Bilan énergétique d'une réaction nucléaire"
    ]
  },

  // === ÉLECTRICITÉ (الكهرباء) ===
  {
    titreLecon: "Dipôle RC",
    langueContenu: "fr",
    paragraphes: [
      "Condensateur : capacité, relation q=C.uc",
      "Charge d'un condensateur : équation différentielle, solution, constante de temps τ=RC",
      "Décharge d'un condensateur : équation différentielle, solution",
      "Énergie emmagasinée dans un condensateur"
    ]
  },
  {
    titreLecon: "Dipôle RL",
    langueContenu: "fr",
    paragraphes: [
      "Bobine : inductance L, résistance r, tension uL = L(di/dt) + r.i",
      "Établissement du courant : équation différentielle, solution, constante de temps τ=L/Rt",
      "Rupture du courant",
      "Énergie emmagasinée dans une bobine"
    ]
  },
  {
    titreLecon: "Circuit RLC Série en Régime Libre",
    langueContenu: "fr",
    paragraphes: [
      "Oscillations électriques libres : équation différentielle",
      "Régimes d'oscillations (pseudo-périodique, apériodique, critique)",
      "Cas du circuit LC idéal (R=0) : oscillations non amorties, période propre T0",
      "Étude énergétique"
    ]
  },
  {
    titreLecon: "Circuit RLC Série en Régime Sinusoïdal Forcé",
    langueContenu: "fr",
    paragraphes: [
      "Excitation par un GBF",
      "Impédance Z du circuit RLC série",
      "Résonance d'intensité : fréquence de résonance, bande passante, facteur de qualité",
      "Puissance en régime sinusoïdal forcé"
    ]
  },
  {
    titreLecon: "Modulation et Démodulation d'Amplitude (AM)",
    langueContenu: "fr",
    paragraphes: [
        "Principe de la modulation d'amplitude",
        "Schéma d'un modulateur AM (multiplieur et sommateur)",
        "Expression du signal modulé, spectre de fréquences",
        "Qualité de la modulation (taux de modulation)",
        "Principe de la démodulation d'amplitude (détection d'enveloppe)",
        "Schéma d'un démodulateur AM (diode, RC)"
    ]
  },

  // === MÉCANIQUE (الميكانيك) ===
  {
    titreLecon: "Les Lois de Newton",
    langueContenu: "fr",
    paragraphes: [
      "Vecteurs position, vitesse, accélération (repère cartésien, Frenet)",
      "Référentiels galiléens",
      "Les trois lois de Newton",
      "Quantité de mouvement, théorème de la quantité de mouvement"
    ]
  },
  {
    titreLecon: "Applications des Lois de Newton : Mouvements Rectilignes et Chute Verticale",
    langueContenu: "fr",
    paragraphes: [
      "Mouvement sur plan horizontal ou incliné (avec/sans frottements)",
      "Chute libre verticale dans le vide",
      "Chute verticale avec frottements fluides (régime initial, régime permanent, vitesse limite)"
    ]
  },
  {
    titreLecon: "Applications des Lois de Newton : Mouvements Plans",
    langueContenu: "fr",
    paragraphes: [
      "Mouvement d'un projectile dans un champ de pesanteur uniforme (équations horaires, trajectoire, flèche, portée)",
      "Mouvement d'une particule chargée dans un champ électrique uniforme",
      "Mouvement d'une particule chargée dans un champ magnétique uniforme (force de Lorentz)"
    ]
  },
  {
    titreLecon: "Applications des Lois de Newton : Satellites et Planètes",
    langueContenu: "fr",
    paragraphes: [
      "Loi de l'attraction universelle",
      "Mouvement circulaire uniforme d'un satellite/planète, vitesse, période",
      "Lois de Kepler (énoncés et applications)"
    ]
  },
  {
    titreLecon: "Rotation d'un Solide Autour d'un Axe Fixe",
    langueContenu: "fr",
    paragraphes: [
      "Abscisse angulaire, vitesse angulaire, accélération angulaire",
      "Relation entre grandeurs linéaires et angulaires",
      "Moment d'une force, moment d'inertie JΔ",
      "Relation fondamentale de la dynamique en rotation (Théorème du moment cinétique scalaire)",
      "Travail et puissance d'un couple de forces"
    ]
  },
  {
    titreLecon: "Systèmes Oscillants Mécaniques",
    langueContenu: "fr",
    paragraphes: [
      "Pendule élastique (horizontal/vertical) : étude dynamique, équation différentielle, période propre",
      "Pendule pesant et pendule simple (petites oscillations) : étude dynamique, équation différentielle, période propre",
      "Influence des frottements, résonance mécanique"
    ]
  },
  {
    titreLecon: "Aspects Énergétiques des Oscillations Mécaniques",
    langueContenu: "fr",
    paragraphes: [
      "Travail d'une force, énergie cinétique (translation, rotation)",
      "Énergie potentielle (pesanteur, élastique)",
      "Énergie mécanique, théorème de l'énergie cinétique, conservation/non-conservation de l'énergie mécanique",
      "Diagrammes énergétiques"
    ]
  },
  {
    titreLecon: "Atome et Mécanique de Newton - Limites de la Mécanique Classique",
    langueContenu: "fr",
    paragraphes: [
      "Modèles de l'atome (Thomson, Rutherford)",
      "Quantification de l'énergie de l'atome (modèle de Bohr pour l'atome d'hydrogène)",
      "Spectres d'émission et d'absorption",
      "Dualité onde-corpuscule (introduction, relation de De Broglie)",
      "Limites de la mécanique classique et nécessité de la mécanique quantique (introduction)"
    ]
  },

  // === THERMODYNAMIQUE (pour Sciences Maths, c'est souvent plus poussé que l'intro en PC) ===
  {
    titreLecon: "Thermodynamique : Premier Principe",
    langueContenu: "fr",
    paragraphes: [
        "Système thermodynamique, variables d'état (P, V, T, n), équation d'état des gaz parfaits",
        "Énergie interne U, capacité thermique (massique, molaire)",
        "Travail des forces de pression W, transfert thermique Q",
        "Premier principe de la thermodynamique : ΔU = W + Q",
        "Application aux transformations (isochore, isobare, isotherme, adiabatique) d'un gaz parfait",
        "Cycles thermodynamiques, machines thermiques (rendement)"
    ]
  },
  {
    titreLecon: "Thermodynamique : Second Principe (Introduction)",
    langueContenu: "fr",
    paragraphes: [
        "Transformations réversibles et irréversibles",
        "Énoncés du second principe (Clausius, Kelvin)",
        "Entropie S : définition, variation d'entropie pour des transformations simples",
        "Interprétation statistique de l'entropie (désordre)",
        "Bilan entropique, critère d'évolution"
    ]
  },


  // ===================================
  //            CHIMIE (الكيمياء)
  // ===================================
  {
    titreLecon: "Suivi Temporel d'une Transformation Chimique - Vitesse de Réaction",
    langueContenu: "fr",
    paragraphes: [
      "Transformations rapides et lentes",
      "Méthodes de suivi (physiques et chimiques)",
      "Vitesse volumique de réaction, détermination graphique",
      "Temps de demi-réaction t1/2",
      "Facteurs cinétiques (concentration, température, catalyseur)"
    ]
  },
  {
    titreLecon: "Transformations Chimiques Non Totales – État d'Équilibre",
    langueContenu: "fr",
    paragraphes: [
      "Notion de réaction limitée, état d'équilibre dynamique",
      "Taux d'avancement final τ",
      "Quotient de réaction Qr, constante d'équilibre K",
      "Relation entre K et τ, influence des conditions initiales sur l'état d'équilibre",
      "Loi de modération de Le Chatelier (influence de la température, pression, concentration)"
    ]
  },
  {
    titreLecon: "Transformations Acido-Basiques en Solution Aqueuse",
    langueContenu: "fr",
    paragraphes: [
      "Couple acide/base (Brönsted), produit ionique de l'eau Ke, pH",
      "Constante d'acidité Ka, pKa, relation pH-pKa",
      "Domaines de prédominance, force des acides et bases",
      "Réaction acido-basique, constante d'équilibre",
      "Solutions tampons"
    ]
  },
  {
    titreLecon: "Titrage Acido-Basique – Suivi pH-métrique",
    langueContenu: "fr",
    paragraphes: [
      "Principe et caractéristiques d'un titrage",
      "Point d'équivalence (méthodes de repérage)",
      "Choix d'un indicateur coloré",
      "Courbes de titrage (acide fort/base forte, acide faible/base forte, etc.)"
    ]
  },
  {
    titreLecon: "Transformations Spontanées dans les Piles et Production d'Énergie",
    langueContenu: "fr",
    paragraphes: [
      "Oxydo-réduction, couples Ox/Red",
      "Piles électrochimiques : constitution, fonctionnement, polarité, f.e.m.",
      "Critère d'évolution spontanée (Qr et K)",
      "Quantité d'électricité, capacité d'une pile"
    ]
  },
  {
    titreLecon: "Transformations Forcées : L'Électrolyse",
    langueContenu: "fr",
    paragraphes: [
      "Principe de l'électrolyse, réactions aux électrodes",
      "Bilan quantitatif (lois de Faraday)",
      "Applications de l'électrolyse"
    ]
  },
  {
    titreLecon: "Contrôle de l'Évolution des Systèmes Chimiques par Modification des Réactifs",
    langueContenu: "fr",
    paragraphes: [
      "Réactions d'estérification et d'hydrolyse d'un ester : caractéristiques, contrôle (vitesse, rendement)",
      "Saponification : caractéristiques, intérêt",
      "Synthèse peptidique (acides α-aminés, liaison peptidique, protection/déprotection des fonctions)",
      "Autres exemples de modification de réactifs pour contrôler une synthèse (ex: halogénoalcanes, organomagnésiens - selon le détail du programme)"
    ]
  },
  {
    titreLecon: "Chimie Organique : Stratégies de Synthèse et Sélectivité (approfondissement)",
    langueContenu: "fr",
    paragraphes: [
        "Rappel des principales familles et fonctions organiques",
        "Notions de réactivité : sites donneurs et accepteurs d'électrons, nucléophiles, électrophiles",
        "Mécanismes réactionnels simples (Addition, Substitution, Élimination - SN1, SN2, E1, E2 - aspects qualitatifs)",
        "Protection de fonctions",
        "Notions de stéréochimie et sélectivité (régiosélectivité, stéréosélectivité - diastéréosélectivité, énantiosélectivité - introduction)",
        "Exemples de synthèses multi-étapes simples"
    ]
  }
];