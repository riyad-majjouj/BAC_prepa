// concours/ENSA_pc.js
// المادة: الفيزياء والكيمياء - مباراة ولوج ENSA
// المستوى: مراجعة شاملة لبرنامج البكالوريا علوم رياضية مع تركيزات خاصة بمباريات ENSA

module.exports = [
  // ===================================
  //            PHYSIQUE (الفيزياء)
  // ===================================

  // === ONDES ===
  {
    titreLecon: "Ondes Mécaniques Progressives et Périodiques",
    langueContenu: "fr",
    paragraphes: [
      "Définitions, types, célérité, retard temporel, élongation",
      "Onde sinusoïdale, période (T, N), longueur d'onde (λ), relation λ=vT",
      "Superposition d'ondes, interférences (cas simples), ondes stationnaires (corde vibrante, colonne d'air - si abordé)",
      "Effet Doppler (formule et applications simples)",
      "Diffraction des ondes mécaniques"
    ]
  },
  {
    titreLecon: "Ondes Lumineuses : Propagation, Diffraction, Dispersion",
    langueContenu: "fr",
    paragraphes: [
      "Modèle ondulatoire de la lumière, spectre électromagnétique",
      "Diffraction (fente, trou circulaire), relation θ = λ/a ou θ = 1.22 λ/D",
      "Interférences lumineuses (dispositif des fentes d'Young - calcul de l'interfrange)",
      "Dispersion par un prisme, lois de Snell-Descartes, indice de réfraction"
    ]
  },

  // === TRANSFORMATIONS NUCLÉAIRES ===
  {
    titreLecon: "Radioactivité et Réactions Nucléaires",
    langueContenu: "fr",
    paragraphes: [
      "Structure du noyau, stabilité, radioactivité (α, β-, β+, γ), lois de Soddy",
      "Cinétique de la décroissance radioactive (N(t), A(t), λ, t1/2)",
      "Datation radioactive",
      "Énergie nucléaire : défaut de masse, énergie de liaison (El, El/A), courbe d'Aston",
      "Réactions de fission et de fusion, bilan énergétique, énergie libérée"
    ]
  },

  // === ÉLECTRICITÉ ===
  {
    titreLecon: "Dipôles RC, RL, RLC en Régime Transitoire et Forcé",
    langueContenu: "fr",
    paragraphes: [
      "Condensateur (charge, décharge), bobine (établissement/rupture du courant)",
      "Équations différentielles et solutions pour RC et RL",
      "Circuit RLC série : régime libre (oscillations amorties, pseudo-période), régime non amorti (LC)",
      "Circuit RLC série en régime sinusoïdal forcé : impédance, résonance (intensité, tension), bande passante, facteur de qualité",
      "Puissance en régime alternatif (active, réactive, apparente, facteur de puissance)"
    ]
  },
  {
    titreLecon: "Électronique : Modulation/Démodulation (si au programme spécifique ENSA)",
    langueContenu: "fr",
    paragraphes: [
        "Principe de la modulation d'amplitude (AM)",
        "Réalisation d'un modulateur AM, spectre du signal modulé, taux de modulation",
        "Principe de la démodulation AM (détection d'enveloppe)",
        "Autres types de modulation (FM - notions, si pertinent)"
    ]
  },
  {
    titreLecon: "Électromagnétisme (Notions de base si exigées pour ENSA)",
    langueContenu: "fr",
    paragraphes: [
        "Champ magnétique créé par des courants (fil rectiligne, spire, solénoïde - formules)",
        "Force de Lorentz (sur une particule chargée, sur un conducteur parcouru par un courant - loi de Laplace)",
        "Induction électromagnétique (loi de Faraday, loi de Lenz), auto-induction",
        // "Équations de Maxwell (forme intégrale ou qualitative, si niveau ENSA l'exige)"
    ]
  },

  // === MÉCANIQUE ===
  {
    titreLecon: "Cinématique et Dynamique du Point Matériel",
    langueContenu: "fr",
    paragraphes: [
      "Vecteurs position, vitesse, accélération (cartésien, polaire, Frenet)",
      "Lois de Newton, quantité de mouvement, moment cinétique (scalaire et vectoriel)",
      "Théorème de la quantité de mouvement, théorème du moment cinétique",
      "Travail, puissance, énergie cinétique, théorème de l'énergie cinétique",
      "Forces conservatives, énergie potentielle, énergie mécanique, conservation"
    ]
  },
  {
    titreLecon: "Applications des Lois de Newton",
    langueContenu: "fr",
    paragraphes: [
      "Mouvements dans un champ de pesanteur uniforme (chute libre, projectile)",
      "Mouvements de particules chargées dans des champs électrique et/ou magnétique uniformes",
      "Mouvements circulaires (uniformes ou non)",
      "Mouvements de satellites et planètes (lois de Kepler)"
    ]
  },
  {
    titreLecon: "Dynamique du Solide en Rotation Autour d'un Axe Fixe",
    langueContenu: "fr",
    paragraphes: [
      "Cinématique de rotation (vitesse angulaire, accélération angulaire)",
      "Moment d'inertie, théorème de Huygens (si pertinent)",
      "Relation fondamentale de la dynamique en rotation (Théorème du moment cinétique)",
      "Énergie cinétique de rotation, travail et puissance d'un couple"
    ]
  },
  {
    titreLecon: "Systèmes Oscillants Mécaniques",
    langueContenu: "fr",
    paragraphes: [
      "Pendule élastique (horizontal, vertical), équation différentielle, période propre",
      "Pendule pesant, pendule simple (petites oscillations), période propre",
      "Amortissement, résonance mécanique (analyse qualitative et quantitative si nécessaire)"
    ]
  },
  {
    titreLecon: "Mécanique des Fluides (Notions de base si au programme ENSA)",
    langueContenu: "fr",
    paragraphes: [
      "Pression, poussée d'Archimède",
      "Fluides parfaits incompressibles : équation de continuité, théorème de Bernoulli",
      "Fluides réels : viscosité (qualitatif), pertes de charge (qualitatif)"
    ]
  },

  // === THERMODYNAMIQUE ===
  {
    titreLecon: "Thermodynamique : Principes et Applications",
    langueContenu: "fr",
    paragraphes: [
      "Systèmes thermodynamiques, variables d'état, équation d'état des gaz parfaits",
      "Premier principe : énergie interne, travail, chaleur, transferts thermiques",
      "Application aux transformations (isochore, isobare, isotherme, adiabatique réversible/irréversible)",
      "Capacités thermiques (Cv, Cp), relation de Mayer",
      "Cycles thermodynamiques (Carnot, Diesel, Beau de Rochas - principes et rendements)",
      "Second principe : entropie, transformations réversibles/irréversibles, bilan entropique",
      "Machines thermiques (moteurs, réfrigérateurs, pompes à chaleur - efficacité)"
    ]
  },

  // ===================================
  //            CHIMIE (الكيمياء)
  // ===================================
  {
    titreLecon: "Cinétique Chimique",
    langueContenu: "fr",
    paragraphes: [
      "Vitesse de réaction, facteurs cinétiques (concentration, température, catalyseur)",
      "Loi de vitesse, ordre de réaction (0, 1, 2), constante de vitesse",
      "Temps de demi-réaction",
      "Loi d'Arrhenius (influence de la température sur la constante de vitesse)",
      "Catalyse (homogène, hétérogène, enzymatique)"
    ]
  },
  {
    titreLecon: "Équilibres Chimiques en Solution Aqueuse",
    langueContenu: "fr",
    paragraphes: [
      "État d'équilibre, quotient de réaction Qr, constante d'équilibre K",
      "Loi de Le Chatelier (déplacement des équilibres)",
      "Équilibres acido-basiques : pH, Ka, pKa, solutions tampons, calculs de pH (acides/bases forts/faibles, mélanges)",
      "Titrage acido-basique (suivi pH-métrique, conductimétrique, choix d'indicateurs)",
      "Équilibres de complexation (constante de formation/dissociation - si pertinent)",
      "Équilibres de précipitation : produit de solubilité Ks, conditions de précipitation/dissolution"
    ]
  },
  {
    titreLecon: "Électrochimie : Oxydo-réduction et Piles",
    langueContenu: "fr",
    paragraphes: [
      "Réactions d'oxydo-réduction, couples redox, nombre d'oxydation",
      "Potentiel d'électrode, équation de Nernst",
      "Piles électrochimiques : f.e.m., fonctionnement, prévision du sens d'évolution",
      "Diagrammes potentiel-pH (diagrammes de Pourbaix - notions, si pertinent)",
      "Électrolyse : aspects quantitatifs (lois de Faraday), applications"
    ]
  },
  {
    titreLecon: "Chimie Organique : Structure, Réactivité et Synthèse",
    langueContenu: "fr",
    paragraphes: [
      "Nomenclature des composés organiques (principales fonctions)",
      "Isomérie (constitution, stéréoisomérie : énantiomérie, diastéréoisomérie, configuration R/S, Z/E)",
      "Effets électroniques (inductif, mésomère) et leur influence sur la réactivité",
      "Grands types de réactions : addition (électrophile, nucléophile), substitution (SN1, SN2), élimination (E1, E2)",
      "Réactions spécifiques des principales fonctions : alcools, aldéhydes, cétones, acides carboxyliques et dérivés (esters, amides, halogénures d'acyles), amines",
      "Réactions d'oxydo-réduction en chimie organique",
      "Stratégies de synthèse simples (protection de fonctions, réactifs organométalliques - Grignard)"
    ]
  }
];
