// المادة: الفيزياء والكيمياء
// المستوى: السنة الثانية بكالوريا
// الشعبة: علوم الحياة والأرض (SVT)

module.exports = [
  // ===================================
  //            PHYSIQUE (الفيزياء)
  // ===================================

  // === ONDES (الموجات) ===
  {
    titreLecon: "Les Ondes Mécaniques Progressives",
    langueContenu: "fr",
    domaine: "Physique",
    paragraphes: [
      "Définition d'une onde mécanique progressive, exemples",
      "Types d'ondes (transversale, longitudinale)",
      "Célérité (vitesse de propagation) d'une onde",
      "Retard temporel"
    ]
  },
  {
    titreLecon: "Les Ondes Mécaniques Progressives Périodiques",
    langueContenu: "fr",
    domaine: "Physique",
    paragraphes: [
      "Définition d'une onde mécanique progressive périodique, onde sinusoïdale",
      "Période temporelle (T) et fréquence (N)",
      "Périodicité spatiale : longueur d'onde (λ)",
      "Relation : λ = v.T = v/N",
      "Phénomène de diffraction des ondes mécaniques (aspect qualitatif)"
    ]
  },
  {
    titreLecon: "Propagation d'une Onde Lumineuse",
    langueContenu: "fr",
    domaine: "Physique",
    paragraphes: [
      "Nature ondulatoire de la lumière",
      "Diffraction de la lumière : mise en évidence expérimentale, influence de λ et a (qualitatif)",
      "Dispersion de la lumière blanche par un prisme",
      "Indice de réfraction d'un milieu transparent"
    ]
  },

  // === TRANSFORMATIONS NUCLÉAIRES (التحولات النووية) ===
  {
    titreLecon: "La Décroissance Radioactive",
    langueContenu: "fr",
    domaine: "Physique",
    paragraphes: [
      "Stabilité et instabilité des noyaux",
      "Radioactivité : types de désintégrations (α, β-, β+), émission γ",
      "Lois de conservation (lois de Soddy)",
      "Loi de la décroissance radioactive : N(t) = N0.e^(-λt)",
      "Activité d'un échantillon radioactif A(t)",
      "Constante radioactive (λ) et temps de demi-vie (t1/2)",
      "Applications : datation (Carbone 14 - principe)"
    ]
  },
  {
    titreLecon: "Noyaux, Masse et Énergie",
    langueContenu: "fr",
    domaine: "Physique",
    paragraphes: [
      "Équivalence masse-énergie : relation d'Einstein (E = m.c²)",
      "Unités : unité de masse atomique (u), électronvolt (eV), mégaélectronvolt (MeV)",
      "Défaut de masse (Δm) d'un noyau",
      "Énergie de liaison (El) d'un noyau, énergie de liaison par nucléon (El/A)",
      "Réactions nucléaires provoquées : fission et fusion (définitions et exemples)",
      "Bilan énergétique d'une réaction nucléaire (calcul simple d'énergie libérée)"
    ]
  },

  // === ÉLECTRICITÉ (الكهرباء) ===
  {
    titreLecon: "Dipôle RC : Charge et Décharge d'un Condensateur",
    langueContenu: "fr",
    domaine: "Physique",
    paragraphes: [
      "Le condensateur : description, symbole, capacité (C)",
      "Relation q = C.uc",
      "Charge d'un condensateur à travers une résistance (évolution qualitative de uc et i)",
      "Constante de temps τ = RC (signification, détermination graphique)",
      "Décharge d'un condensateur à travers une résistance (évolution qualitative de uc et i)",
      "Énergie emmagasinée dans un condensateur Ee = (1/2)C.uc²"
    ]
  },
  {
    titreLecon: "Dipôle RL : Établissement et Rupture du Courant",
    langueContenu: "fr",
    domaine: "Physique",
    paragraphes: [
      "La bobine : description, symbole, inductance (L)",
      "Tension aux bornes d'une bobine idéale : uL = L(di/dt)",
      "Établissement du courant dans un circuit RL série (évolution qualitative de i)",
      "Constante de temps τ = L/R (signification)",
      "Rupture du courant (rôle de la diode de protection)",
      "Énergie emmagasinée dans une bobine Em = (1/2)L.i²"
    ]
  },

  // === MÉCANIQUE (الميكانيك) ===
  {
    titreLecon: "Les Lois de Newton (applications simples)",
    langueContenu: "fr",
    domaine: "Physique",
    paragraphes: [
      "Vecteur position, vecteur vitesse, vecteur accélération (dans un repère cartésien)",
      "Référentiels galiléens (définition)",
      "Première loi de Newton (Principe d'inertie)",
      "Deuxième loi de Newton (Relation fondamentale de la dynamique : ΣFext = m.a)",
      "Troisième loi de Newton (Principe des actions réciproques)",
      "Application à la chute libre verticale d'un solide dans le vide (équation horaire)",
      "Application au mouvement d'un solide sur un plan horizontal sans frottements"
    ]
  },

  // ===================================
  //            CHIMIE (الكيمياء)
  // ===================================
  {
    titreLecon: "Transformations Lentes et Rapides - Facteurs Cinétiques",
    langueContenu: "fr",
    domaine: "Chimie",
    paragraphes: [
      "Distinction entre réactions rapides et réactions lentes",
      "Suivi temporel d'une transformation chimique (méthodes physiques simples : conductimétrie, pH-métrie - principe)",
      "Vitesse volumique de réaction (définition qualitative, évolution)",
      "Temps de demi-réaction t1/2 (définition, détermination graphique simple)",
      "Facteurs cinétiques : concentration des réactifs, température (influence qualitative)",
      "Rôle du catalyseur (définition, action qualitative)"
    ]
  },
  {
    titreLecon: "Transformations Chimiques Non Totales – État d'Équilibre",
    langueContenu: "fr",
    domaine: "Chimie",
    paragraphes: [
      "Notion de réaction non totale (limitée)",
      "État d'équilibre dynamique d'un système chimique",
      "Taux d'avancement final (τ) : τ = xf / xmax",
      "Quotient de réaction (Qr) et constante d'équilibre (K) (définitions simples)",
      "Relation entre K et τ pour des réactions simples (ex: estérification)",
      "Influence de certains facteurs sur l'état d'équilibre (concentration, température - qualitatif)"
    ]
  },
  {
    titreLecon: "Transformations Acido-Basiques en Solution Aqueuse",
    langueContenu: "fr",
    domaine: "Chimie",
    paragraphes: [
      "Définition d'un acide et d'une base selon Brönsted, couple acide/base",
      "Produit ionique de l'eau (Ke) et pH des solutions aqueuses",
      "Constante d'acidité (Ka) et pKa d'un couple acide/base",
      "Relation pH = pKa + log([Base]/[Acide]) (utilisation)",
      "Domaines de prédominance des espèces acide et basique",
      "Force relative des acides et des bases (comparaison des Ka ou pKa)",
      "Réaction entre un acide et une base (équation bilan)",
      "Solutions tampons (définition, rôle qualitatif)"
    ]
  },
  {
    titreLecon: "Titrage Acido-Basique",
    langueContenu: "fr",
    domaine: "Chimie",
    paragraphes: [
      "Principe du titrage acido-basique (réaction support)",
      "Dispositif expérimental d'un titrage pH-métrique",
      "Point d'équivalence : définition et repérage (méthode des tangentes)",
      "Relation à l'équivalence (calcul de concentration)",
      "Choix d'un indicateur coloré approprié (zone de virage)"
    ]
  },
  {
    titreLecon: "Transformations Spontanées dans les Piles",
    langueContenu: "fr",
    domaine: "Chimie",
    paragraphes: [
      "Réactions d'oxydo-réduction (définitions)",
      "Couples oxydant/réducteur (Ox/Red)",
      "Constitution et fonctionnement d'une pile électrochimique (ex : pile Daniell - description)",
      "Demi-piles, pont salin, anode (oxydation), cathode (réduction)",
      "Polarité de la pile et sens du courant électrique",
      "Équation de la réaction de fonctionnement de la pile",
      "Quantité d'électricité débitée par une pile (Q = I.Δt = n(e-).F - utilisation simple)"
    ]
  },
  {
    titreLecon: "Réactions d'Estérification et d'Hydrolyse",
    langueContenu: "fr",
    domaine: "Chimie",
    paragraphes: [
      "Groupes caractéristiques : alcools, acides carboxyliques, esters (nomenclature de base)",
      "Réaction d'estérification : équation, caractéristiques (lente, limitée, athermique)",
      "Réaction d'hydrolyse d'un ester : équation, caractéristiques (lente, limitée)",
      "Contrôle de la vitesse de réaction (température, catalyseur - qualitatif)",
      "Contrôle du rendement (excès d'un réactif, élimination d'un produit - qualitatif)"
    ]
  },
  {
    titreLecon: "La Saponification",
    langueContenu: "fr",
    domaine: "Chimie",
    paragraphes: [
      "Hydrolyse basique des esters (saponification) : équation, caractéristiques (lente à froid, rapide à chaud, totale)",
      "Le savon : obtention, structure (partie hydrophile, partie hydrophobe)",
      "Action détergente du savon (formation de micelles)"
    ]
  }
];