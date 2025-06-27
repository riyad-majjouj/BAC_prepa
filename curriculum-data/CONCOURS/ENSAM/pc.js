// concours/ENSAM_pc.js
// المادة: Physique et Chimie - Concours ENSAM
// Niveau: Révision complète du programme Bac Sciences Maths avec focus concours ENSAM

module.exports = [
  // ===================================
  //            PHYSIQUE (الفيزياء)
  // ===================================

  // === ONDES ===
  {
    titreLecon: "Ondes Mécaniques et Lumineuses",
    langueContenu: "fr",
    paragraphes: [
      "Ondes mécaniques : propagation, célérité, types, périodicité (T, λ)",
      "Diffraction et interférences des ondes mécaniques et lumineuses (fentes d'Young pour la lumière)",
      "Effet Doppler (applications)",
      "Dispersion de la lumière, indice de réfraction"
    ]
  },

  // === TRANSFORMATIONS NUCLÉAIRES ===
  {
    titreLecon: "Physique Nucléaire",
    langueContenu: "fr",
    paragraphes: [
      "Radioactivité (α, β, γ), lois de conservation, cinétique de décroissance (N(t), A(t), t1/2)",
      "Énergie nucléaire (défaut de masse, énergie de liaison), réactions de fission et fusion, bilans énergétiques"
    ]
  },

  // === ÉLECTRICITÉ ET ÉLECTRONIQUE ===
  {
    titreLecon: "Circuits Électriques (RC, RL, RLC)",
    langueContenu: "fr",
    paragraphes: [
      "Régime transitoire des dipôles RC et RL (équations différentielles, solutions, constantes de temps)",
      "Circuit RLC série : régime libre (oscillations amorties, non amorties, pseudo-période)",
      "Circuit RLC série en régime sinusoïdal forcé : impédance, résonance, puissance, facteur de qualité"
      // "Filtres passifs (passe-bas, passe-haut, passe-bande - étude simple), si pertinent pour ENSAM"
    ]
  },
  {
    titreLecon: "Bases de l'Électronique (si spécifié)",
    langueContenu: "fr",
    paragraphes: [
        "Diodes (caractéristique, redressement simple/double alternance)",
        "Transistors (fonctionnement en commutation et amplification - notions qualitatives)",
        "Amplificateur opérationnel (montages de base : inverseur, non-inverseur, sommateur, intégrateur, dérivateur - idéal)"
    ]
  },
  {
    titreLecon: "Électromagnétisme (Bases)",
    langueContenu: "fr",
    paragraphes: [
        "Champ magnétique (sources : fil, spire, solénoïde)",
        "Force de Lorentz, Loi de Laplace",
        "Induction électromagnétique (Loi de Faraday, Lenz), auto-induction, inductance mutuelle (notion)"
    ]
  },

  // === MÉCANIQUE (souvent très important pour ENSAM) ===
  {
    titreLecon: "Cinématique et Dynamique du Point Matériel",
    langueContenu: "fr",
    paragraphes: [
      "Systèmes de coordonnées (cartésien, polaire, cylindrique, sphérique - notions)",
      "Vecteurs vitesse et accélération dans différents repères, mouvement relatif (composition des vitesses et accélérations - cas simples)",
      "Lois de Newton, quantité de mouvement, moment cinétique",
      "Théorèmes généraux (énergie cinétique, moment cinétique, quantité de mouvement)",
      "Travail, puissance, énergie potentielle, énergie mécanique, forces conservatives et non conservatives"
    ]
  },
  {
    titreLecon: "Mouvement dans des Champs de Forces Centraux",
    langueContenu: "fr",
    paragraphes: [
      "Mouvement des planètes et satellites (lois de Kepler, énergie mécanique, vitesse de libération)",
      "Mouvement d'une particule chargée dans un champ coulombien"
    ]
  },
  {
    titreLecon: "Dynamique du Solide",
    langueContenu: "fr",
    paragraphes: [
      "Centre d'inertie, quantité de mouvement et moment cinétique d'un solide",
      "Solide en rotation autour d'un axe fixe : moment d'inertie (calcul pour des solides usuels), équation du mouvement",
      "Énergie cinétique de rotation",
      "Mouvement de roulement sans glissement (parfois)"
    ]
  },
  {
    titreLecon: "Systèmes Oscillants Mécaniques",
    langueContenu: "fr",
    paragraphes: [
      "Oscillateurs harmoniques simples (pendule élastique, pendule simple)",
      "Oscillations amorties, oscillations forcées, résonance"
    ]
  },
  {
    titreLecon: "Mécanique des Fluides (Notions importantes)",
    langueContenu: "fr",
    paragraphes: [
      "Statique des fluides : pression, théorème de Pascal, poussée d'Archimède",
      "Dynamique des fluides parfaits incompressibles : équation de continuité, théorème de Bernoulli et applications (tube de Pitot, Venturi, vidange d'un réservoir)",
      "Dynamique des fluides réels : viscosité, pertes de charge (qualitatif et formules simples)"
    ]
  },

  // === THERMODYNAMIQUE (Important) ===
  {
    titreLecon: "Principes de la Thermodynamique",
    langueContenu: "fr",
    paragraphes: [
      "Systèmes, variables d'état, transformations, gaz parfaits",
      "Premier principe : énergie interne, travail, chaleur, transferts (conduction, convection, rayonnement - notions)",
      "Transformations particulières (isochore, isobare, isotherme, adiabatique)",
      "Capacités thermiques, relation de Mayer",
      "Second principe : entropie, transformations réversibles et irréversibles",
      "Cycles thermodynamiques (Carnot, moteurs thermiques, machines frigorifiques), rendements et efficacités"
    ]
  },
  {
    titreLecon: "Machines Thermiques et Diagrammes",
    langueContenu: "fr",
    paragraphes: [
      "Étude de cycles de moteurs (Beau de Rochas/Otto, Diesel)",
      "Étude de cycles de machines frigorifiques ou pompes à chaleur",
      "Utilisation de diagrammes thermodynamiques (Clapeyron P-V, entropique T-S)"
    ]
  },


  // ===================================
  //            CHIMIE (الكيمياء)
  // ===================================
  {
    titreLecon: "Cinétique Chimique et Catalyse",
    langueContenu: "fr",
    paragraphes: [
      "Vitesse de réaction, ordre, constante de vitesse, temps de demi-réaction",
      "Facteurs cinétiques, loi d'Arrhenius",
      "Catalyse (homogène, hétérogène)"
    ]
  },
  {
    titreLecon: "Équilibres Chimiques",
    langueContenu: "fr",
    paragraphes: [
      "Constante d'équilibre K, quotient de réaction Qr, loi de Le Chatelier",
      "Équilibres acido-basiques (pH, Ka, pKa, solutions tampons, titrages)",
      "Équilibres de solubilité (Ks, précipitation)",
      "Équilibres d'oxydo-réduction (potentiels redox, équation de Nernst, piles, électrolyse - aspects quantitatifs)"
    ]
  },
  {
    titreLecon: "Chimie Organique",
    langueContenu: "fr",
    paragraphes: [
      "Nomenclature, isomérie (constitution, stéréoisomérie Z/E, R/S)",
      "Effets électroniques",
      "Principales fonctions et leur réactivité (alcools, aldéhydes/cétones, acides carboxyliques et dérivés, amines)",
      "Grands types de réactions (Addition, Substitution, Élimination)",
      "Polymérisation (addition, condensation - notions si pertinent)"
    ]
  },
  {
    titreLecon: "Thermochimie (si pertinent pour ENSAM)",
    langueContenu: "fr",
    paragraphes: [
        "Enthalpie standard de réaction, de formation, de combustion",
        "Loi de Hess, calculs d'enthalpies de réaction",
        "Influence de la température sur l'enthalpie de réaction (Loi de Kirchhoff - notion)"
    ]
  }
];