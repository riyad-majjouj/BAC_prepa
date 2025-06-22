// 2bac_spc_pc.js
// المادة: الفيزياء والكيمياء
// المستوى: السنة الثانية بكالوريا
// الشعبة: علوم فيزيائية (خيار علوم فيزيائية)

module.exports = [
  // ===================================
  //            PHYSIQUE (الفيزياء)
  // ===================================

  // === ONDES (الموجات) ===
  {
    titreLecon: "Les Ondes Mécaniques Progressives",
    langueContenu: "fr",
    paragraphes: [
      "Définition d'une onde mécanique progressive",
      "Types d'ondes mécaniques (transversale, longitudinale)",
      "Célérité (vitesse de propagation) d'une onde",
      "Retard temporel et élongation d'un point du milieu de propagation",
      "Propagation d'une onde le long d'une corde, à la surface de l'eau"
    ]
  },
  {
    titreLecon: "Les Ondes Mécaniques Progressives Périodiques",
    langueContenu: "fr",
    paragraphes: [
      "Définition d'une onde mécanique progressive périodique",
      "Onde sinusoïdale : période temporelle (T) et fréquence (N)",
      "Périodicité spatiale : longueur d'onde (λ)",
      "Relation entre célérité, longueur d'onde et période (ou fréquence): λ = v.T = v/N",
      "Comparaison du mouvement de deux points du milieu de propagation (en phase, en opposition de phase)",
      "Milieu dispersif et non dispersif"
    ]
  },
  {
    titreLecon: "Propagation d'une Onde Lumineuse - Diffraction et Dispersion",
    langueContenu: "fr",
    paragraphes: [
      "Nature ondulatoire de la lumière",
      "Diffraction de la lumière : mise en évidence expérimentale",
      "Condition de diffraction (dimension de l'ouverture ou de l'obstacle)",
      "Influence de la longueur d'onde et de la dimension de l'ouverture/obstacle sur le phénomène de diffraction",
      "Relation θ = λ/a (pour une fente)",
      "Dispersion de la lumière blanche par un prisme",
      "Indice de réfraction d'un milieu transparent, relation de la célérité de la lumière dans le vide et dans le milieu",
      "Loi de Snell-Descartes pour la réfraction (application à la dispersion)"
    ]
  },

  // === TRANSFORMATIONS NUCLÉAIRES (التحولات النووية) ===
  {
    titreLecon: "La Décroissance Radioactive",
    langueContenu: "fr",
    paragraphes: [
      "Stabilité et instabilité des noyaux : diagramme (N, Z)",
      "Radioactivité : définition, types de désintégrations (α, β-, β+), émission γ",
      "Lois de conservation (lois de Soddy)",
      "Loi de la décroissance radioactive : N(t) = N0.e^(-λt)",
      "Activité d'un échantillon radioactif : A(t) = A0.e^(-λt)",
      "Constante radioactive (λ) et temps de demi-vie (t1/2)",
      "Relation entre λ et t1/2 : t1/2 = ln(2)/λ",
      "Applications : datation (exemple : Carbone 14)"
    ]
  },
  {
    titreLecon: "Noyaux, Masse et Énergie - Réactions Nucléaires Provoquées",
    langueContenu: "fr",
    paragraphes: [
      "Équivalence masse-énergie : relation d'Einstein (E = m.c²)",
      "Unités : unité de masse atomique (u), électronvolt (eV), mégaélectronvolt (MeV)",
      "Défaut de masse (Δm) d'un noyau",
      "Énergie de liaison (El) d'un noyau : El = Δm.c²",
      "Énergie de liaison par nucléon (El/A) et courbe d'Aston (stabilité des noyaux)",
      "Réactions nucléaires provoquées : fission et fusion",
      "Bilan énergétique d'une réaction nucléaire (énergie libérée ou absorbée)",
      "Applications : production d'énergie dans les centrales nucléaires (fission), énergie solaire (fusion)"
    ]
  },

  // === ÉLECTRICITÉ (الكهرباء) ===
  {
    titreLecon: "Dipôle RC : Charge et Décharge d'un Condensateur",
    langueContenu: "fr",
    paragraphes: [
      "Le condensateur : description, symbole, capacité (C)",
      "Relation entre charge (q), tension (uc) et capacité : q = C.uc",
      "Association de condensateurs (série, parallèle) - (mention)",
      "Charge d'un condensateur à travers une résistance : établissement du courant",
      "Équation différentielle vérifiée par uc(t) ou q(t) lors de la charge",
      "Solution de l'équation différentielle : uc(t) = E(1 - e^(-t/τ))",
      "Constante de temps τ = RC : détermination graphique, signification physique",
      "Décharge d'un condensateur à travers une résistance",
      "Équation différentielle et sa solution lors de la décharge : uc(t) = E.e^(-t/τ)",
      "Énergie emmagasinée dans un condensateur : Ee = (1/2)C.uc² = (1/2)q²/C"
    ]
  },
  {
    titreLecon: "Dipôle RL : Établissement et Rupture du Courant",
    langueContenu: "fr",
    paragraphes: [
      "La bobine : description, symbole, inductance (L), résistance interne (r)",
      "Tension aux bornes d'une bobine : uL = L(di/dt) + r.i",
      "Établissement du courant dans un circuit RL série",
      "Équation différentielle vérifiée par i(t)",
      "Solution de l'équation différentielle : i(t) = (E/Rt)(1 - e^(-t/τ)) où Rt est la résistance totale",
      "Constante de temps τ = L/Rt : détermination graphique, signification physique",
      "Rupture du courant dans un circuit RL (avec diode de protection)",
      "Énergie emmagasinée dans une bobine : Em = (1/2)L.i²"
    ]
  },
  {
    titreLecon: "Circuit RLC Série en Régime Libre - Oscillations Électriques",
    langueContenu: "fr",
    paragraphes: [
      "Oscillations électriques libres dans un circuit RLC série",
      "Équation différentielle vérifiée par uc(t) ou q(t)",
      "Régimes d'oscillations : pseudo-périodique, apériodique, critique (influence de R)",
      "Cas du circuit LC idéal (R=0) : oscillations libres non amorties",
      "Équation différentielle et sa solution : uc(t) = Um.cos(ω0.t + φ)",
      "Période propre T0 = 2π√(LC) et pulsation propre ω0 = 1/√(LC)",
      "Étude énergétique des oscillations dans un circuit RLC : conservation ou non conservation de l'énergie totale",
      "Entretien des oscillations (générateur maintenant une tension constante aux bornes du circuit oscillant)"
    ]
  },
  // Option PC a souvent un approfondissement sur le régime forcé, mais il est parfois introduit en SPC standard.
  // Je l'inclus car "PC" est mentionné spécifiquement.
  {
    titreLecon: "Circuit RLC Série en Régime Sinusoïdal Forcé",
    langueContenu: "fr",
    paragraphes: [
      "Excitation d'un circuit RLC série par un générateur basses fréquences (GBF)",
      "Notion d'impédance Z du circuit RLC série : Z = √(R² + (Lω - 1/(Cω))²)",
      "Comportement du circuit en fonction de la fréquence (résistif, inductif, capacitif)",
      "Résonance d'intensité : définition, fréquence de résonance N0 (ou pulsation ω0)",
      "Bande passante à -3dB et facteur de qualité Q",
      "Influence de la résistance R sur l'acuité de la résonance",
      "Puissance électrique en régime sinusoïdal forcé (puissance moyenne)"
    ]
  },

  // === MÉCANIQUE (الميكانيك) ===
  {
    titreLecon: "Les Lois de Newton",
    langueContenu: "fr",
    paragraphes: [
      "Vecteur position, vecteur vitesse, vecteur accélération dans un repère cartésien",
      "Référentiels galiléens",
      "Première loi de Newton (Principe d'inertie)",
      "Deuxième loi de Newton (Relation fondamentale de la dynamique)",
      "Troisième loi de Newton (Principe des actions réciproques)",
      "Quantité de mouvement : p = m.v",
      "Théorème de la quantité de mouvement (forme de la 2ème loi de Newton)"
    ]
  },
  {
    titreLecon: "Applications des Lois de Newton : Mouvements Rectilignes et Chute Libre Verticale",
    langueContenu: "fr",
    paragraphes: [
      "Mouvement d'un solide sur un plan horizontal (avec ou sans frottements)",
      "Mouvement d'un solide sur un plan incliné (avec ou sans frottements)",
      "Poussée d'Archimède",
      "Chute libre verticale d'un solide dans le vide : équations horaires du mouvement",
      "Chute libre verticale d'un solide dans un fluide (avec frottements fluides, force de Stokes)"
    ]
  },
  {
    titreLecon: "Applications des Lois de Newton : Mouvements Plans - Projectiles",
    langueContenu: "fr",
    paragraphes: [
      "Mouvement d'un projectile dans un champ de pesanteur uniforme (sans frottements de l'air)",
      "Conditions initiales (vitesse initiale, angle de tir)",
      "Équations horaires du mouvement (x(t), y(t))",
      "Équation de la trajectoire (y en fonction de x)",
      "Caractéristiques du mouvement : flèche (hauteur maximale), portée"
    ]
  },
  {
    titreLecon: "Applications des Lois de Newton : Satellites et Planètes",
    langueContenu: "fr",
    paragraphes: [
      "Loi de l'attraction universelle (Newton)",
      "Mouvement circulaire uniforme d'un satellite autour d'une planète",
      "Expression de la vitesse et de la période du satellite",
      "Mise en orbite d'un satellite artificiel",
      "Lois de Kepler (énoncés, application de la 3ème loi)"
    ]
  },
  {
    titreLecon: "Rotation d'un Solide Autour d'un Axe Fixe",
    langueContenu: "fr",
    paragraphes: [
      "Repérage du mouvement de rotation : abscisse angulaire, vitesse angulaire, accélération angulaire",
      "Relation entre grandeurs linéaires et angulaires (v = R.ω)",
      "Moment d'une force par rapport à un axe fixe (Δ)",
      "Moment d'inertie (JΔ) d'un solide par rapport à un axe fixe",
      "Relation fondamentale de la dynamique pour la rotation : Σ MΔ(Fext) = JΔ. α (où α = θ̈)",
      "Travail et puissance d'une force ou d'un couple de forces en rotation"
    ]
  },
  {
    titreLecon: "Systèmes Oscillants Mécaniques",
    langueContenu: "fr",
    paragraphes: [
      "Pendule élastique horizontal (solide-ressort) : étude dynamique",
      "Équation différentielle du mouvement et sa solution (cas sans frottements)",
      "Période propre T0 = 2π√(m/k)",
      "Influence des frottements : régimes pseudo-périodique, apériodique, critique",
      "Pendule pesant : étude dynamique (pour de petites oscillations)",
      "Équation différentielle et période propre (T0 = 2π√(l/g) pour le pendule simple)",
      "Résonance mécanique (phénomène, acuité de la résonance)"
    ]
  },
  {
    titreLecon: "Aspects Énergétiques des Oscillations Mécaniques",
    langueContenu: "fr",
    paragraphes: [
      "Travail d'une force (constante, variable : cas du ressort)",
      "Énergie cinétique (translation, rotation)",
      "Énergie potentielle (de pesanteur, élastique)",
      "Énergie mécanique d'un système",
      "Théorème de l'énergie cinétique",
      "Conservation et non-conservation de l'énergie mécanique",
      "Diagrammes énergétiques"
    ]
  },
  // Pour SPC-PC, il y a souvent un module sur la Thermodynamique
  {
    titreLecon: "Introduction à la Thermodynamique",
    langueContenu: "fr",
    paragraphes: [
        "Système thermodynamique : définition, variables d'état (P, V, T, n)",
        "Équation d'état des gaz parfaits : PV = nRT",
        "Énergie interne (U) d'un système",
        "Premier principe de la thermodynamique : ΔU = W + Q",
        "Travail (W) des forces de pression pour une transformation infinitésimale et finie",
        "Transfert thermique (Q) : modes de transfert (conduction, convection, rayonnement)",
        "Capacité thermique massique, capacité thermique molaire",
        "Application du premier principe aux transformations isobare, isochore, isotherme, adiabatique (pour un gaz parfait)",
        "Second principe de la thermodynamique (introduction, notion d'entropie - si au programme détaillé)",
        "Machines thermiques (rendement, efficacité)"
    ]
  },

  // ===================================
  //            CHIMIE (الكيمياء)
  // ===================================

  // === TRANSFORMATIONS RAPIDES ET TRANSFORMATIONS LENTES D'UN SYSTÈME CHIMIQUE ===
  {
    titreLecon: "Transformations Lentes et Transformations Rapides - Suivi Temporel et Facteurs Cinétiques",
    langueContenu: "fr",
    paragraphes: [
      "Réactions rapides et réactions lentes : exemples",
      "Suivi temporel d'une transformation chimique : méthodes physiques (conductimétrie, pH-métrie, spectrophotométrie, mesure de pression/volume) et chimiques (titrage)",
      "Tableau d'avancement, avancement x(t)",
      "Vitesse volumique de réaction : définition, expression en fonction de dx/dt, [C], P ou V",
      "Détermination graphique de la vitesse volumique",
      "Temps de demi-réaction t1/2 : définition, détermination graphique",
      "Facteurs cinétiques : concentration des réactifs, température, catalyseur",
      "Rôle et types de catalyse (homogène, hétérogène, enzymatique)"
    ]
  },

  // === TRANSFORMATIONS CHIMIQUES QUI ONT LIEU DANS LES DEUX SENS – ÉTAT D’ÉQUILIBRE D’UN SYSTÈME CHIMIQUE ===
  {
    titreLecon: "Transformations Chimiques Non Totales – État d'Équilibre d'un Système Chimique",
    langueContenu: "fr",
    paragraphes: [
      "Notion de réaction non totale (limitée)",
      "État d'équilibre dynamique d'un système chimique",
      "Avancement final (xf) et avancement maximal (xmax)",
      "Taux d'avancement final (τ) : τ = xf / xmax",
      "Quotient de réaction (Qr) : définition et expression",
      "Critère d'évolution spontanée d'un système chimique : comparaison de Qr et K",
      "Constante d'équilibre (K) associée à une équation de réaction",
      "Relation entre K et τ pour certaines réactions simples"
    ]
  },
  {
    titreLecon: "Transformations Associées aux Réactions Acido-Basiques en Solution Aqueuse",
    langueContenu: "fr",
    paragraphes: [
      "Définition d'un acide et d'une base selon Brönsted",
      "Couple acide/base (HA/A-)",
      "Produit ionique de l'eau (Ke) et pH des solutions aqueuses",
      "Constante d'acidité (Ka) et pKa d'un couple acide/base",
      "Relation entre pH et pKa : pH = pKa + log([A-]/[HA])",
      "Domaines de prédominance des espèces acide et basique",
      "Force des acides et des bases dans l'eau : comparaison des Ka ou pKa",
      "Réaction entre un acide et une base : constante d'équilibre K",
      "Solutions tampons : définition, propriétés et préparation (importance en biologie)"
    ]
  },
  {
    titreLecon: "Titrage Acido-Basique – Suivi pH-métrique",
    langueContenu: "fr",
    paragraphes: [
      "Principe du titrage acido-basique",
      "Caractéristiques d'une réaction de titrage (rapide, totale, unique)",
      "Dispositif expérimental d'un titrage pH-métrique",
      "Point d'équivalence : définition et repérage (méthode des tangentes, dérivée)",
      "Relation à l'équivalence",
      "Choix d'un indicateur coloré approprié pour un titrage",
      "Courbes de titrage : acide fort/base forte, acide faible/base forte, base faible/acide fort"
    ]
  },

  // === SENS D'ÉVOLUTION SPONTANÉE D'UN SYSTÈME CHIMIQUE ===
  // (Souvent intégré dans le chapitre sur l'état d'équilibre, mais peut être un point focal)
  // Je le laisse comme point implicite dans "Transformations Chimiques Non Totales – État d'Équilibre"
  // et "Transformations Spontanées dans les Piles".

  // === TRANSFORMATIONS SPONTANÉES DANS LES PILES ET PRODUCTION D'ÉNERGIE ===
  {
    titreLecon: "Transformations Spontanées dans les Piles et Production d'Énergie",
    langueContenu: "fr",
    paragraphes: [
      "Réactions d'oxydo-réduction : définitions (oxydant, réducteur, oxydation, réduction)",
      "Couples oxydant/réducteur (Ox/Red)",
      "Constitution et fonctionnement d'une pile électrochimique (ex : pile Daniell)",
      "Demi-piles, pont salin, anode, cathode",
      "Polarité de la pile et sens du courant électrique",
      "Schéma conventionnel d'une pile",
      "Force électromotrice (f.e.m.) d'une pile",
      "Évolution spontanée et critère (comparaison Qr,i et K pour la réaction de la pile)",
      "Quantité d'électricité débitée par une pile (Q = I.Δt = n(e-).F), capacité d'une pile"
    ]
  },
  {
    titreLecon: "Exemples de Transformations Forcées : L'Électrolyse",
    langueContenu: "fr",
    paragraphes: [
      "Définition d'une transformation forcée",
      "Principe de l'électrolyse : réalisation expérimentale",
      "Rôle du générateur, anode et cathode dans une électrolyse",
      "Réactions aux électrodes",
      "Bilan quantitatif de l'électrolyse : relation entre quantité d'électricité et quantité de matière formée ou consommée (lois de Faraday)",
      "Applications de l'électrolyse (préparation de métaux, dépôts métalliques, etc.)"
    ]
  },

  // === CONTRÔLE DE L'ÉVOLUTION DES SYSTÈMES CHIMIQUES (CHIMIE ORGANIQUE) ===
  {
    titreLecon: "Réactions d'Estérification et d'Hydrolyse d'un Ester",
    langueContenu: "fr",
    paragraphes: [
      "Groupes caractéristiques : alcools, acides carboxyliques, esters, amines, amides (rappel et nomenclature)",
      "Réaction d'estérification : équation, caractéristiques (lente, limitée, athermique)",
      "Réaction d'hydrolyse d'un ester : équation, caractéristiques (lente, limitée)",
      "État d'équilibre pour l'estérification et l'hydrolyse",
      "Contrôle de la vitesse de réaction : influence de la température, du catalyseur",
      "Contrôle du rendement : influence de la proportion des réactifs, élimination d'un produit"
    ]
  },
  {
    titreLecon: "Contrôle de l'Évolution des Systèmes Chimiques : Saponification et Synthèse des Peptides",
    langueContenu: "fr",
    paragraphes: [
      "Hydrolyse basique des esters (saponification) : équation, caractéristiques (lente à froid, rapide à chaud, totale)",
      "Intérêt de la saponification (fabrication des savons)",
      "Acides α-aminés : structure générale, caractère amphotère",
      "Liaison peptidique",
      "Formation d'un dipeptide par réaction entre deux acides α-aminés (synthèse peptidique)",
      "Hydrolyse des peptides (acide ou basique)",
      "Protection et activation des fonctions lors de la synthèse peptidique (mention)"
    ]
  }
];