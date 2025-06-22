// ... (داخل aiQuestionGenerator.js أو في ملف منفصل)
const concoursCurriculumData = {
    schools: [
        "ENSA (Écoles Nationales des Sciences Appliquées)",
        "ENSAM (École Nationale Supérieure d'Arts et Métiers)",
        "ENCG (Écoles Nationales de Commerce et de Gestion)",
        "FMD (Faculté de Médecine Dentaire)",
        "FMP (Faculté de Médecine et de Pharmacie)",
        "ISCAE (Institut Supérieur de Commerce et d'Administration des Entreprises)",
        "ENA (École Nationale d'Architecture)",
        "IAV (Institut Agronomique et Vétérinaire Hassan II)",
        "ENFI (École Nationale Forestière d'Ingénieurs)"
        // ... أضف مدارس أخرى إذا لزم الأمر
    ],
    subjects: [ // تم تحويل subjects إلى مصفوفة لتتبع الترتيب إذا لزم الأمر
        {
             nomMatiere: "Mathématiques", // الاسم الفرنسي للـ AI
                nomMatiereAr: "الرياضيات",
            lecons: [
                {
                    titreLecon: "Logique et Raisonnement",
                    paragraphes: [
                        "Propositions, connecteurs logiques (négation, conjonction, disjonction, implication, équivalence).",
                        "Quantificateurs (universel, existentiel).",
                        "Types de raisonnement (par déduction, par l'absurde, par contraposée, par récurrence)."
                    ]
                },
                {
                    titreLecon: "Continuité et Limites",
                    paragraphes: [
                        "Continuité d'une fonction numérique en un point, à droite, à gauche.",
                        "Continuité sur un intervalle.",
                        "Image d'un intervalle par une fonction continue.",
                        "Théorème des valeurs intermédiaires (TVI) et son application à l'existence de solutions d'équations f(x)=k.",
                        "Fonction réciproque d'une fonction continue et strictement monotone (définition, propriétés, représentation graphique).",
                        "Limites d'une fonction en un point, à l'infini (finies et infinies).",
                        "Opérations sur les limites (somme, produit, quotient, composition).",
                        "Limites des fonctions usuelles (polynômes, rationnelles, trigonométriques, racine n-ième).",
                        "Limites et ordre (théorèmes de comparaison, théorème d'encadrement).",
                        "Asymptotes (verticales, horizontales, obliques) à la courbe d'une fonction."
                    ]
                },
                {
                    titreLecon: "Dérivabilité et Étude des Fonctions",
                    paragraphes: [
                        "Dérivabilité d'une fonction en un point, à droite, à gauche. Interprétation géométrique (tangente).",
                        "Fonction dérivée. Dérivées des fonctions usuelles.",
                        "Opérations sur les fonctions dérivées (somme, produit, puissance, quotient, composée).",
                        "Dérivée de la fonction réciproque f⁻¹.",
                        "Monotonie d'une fonction et signe de sa dérivée.",
                        "Extremums (maximum, minimum) d'une fonction.",
                        "Points d'inflexion et concavité/convexité d'une courbe (étude du signe de la dérivée seconde).",
                        "Branches infinies (étude complète : asymptotes, branches paraboliques).",
                        "Plan d'étude d'une fonction et représentation graphique."
                    ]
                },
                {
                    titreLecon: "Suites Numériques",
                    paragraphes: [
                        "Généralités sur les suites (définition, monotonie, majorée, minorée, bornée).",
                        "Suites arithmétiques et géométriques (terme général, somme des termes).",
                        "Limite d'une suite (finie, infinie). Convergence et divergence.",
                        "Critères de convergence (suites monotones et bornées, théorème d'encadrement).",
                        "Opérations sur les limites des suites.",
                        "Suites de la forme u_n+1 = f(u_n) (étude de la convergence si f est continue).",
                        "Suites adjacentes (définition et théorème de convergence)."
                    ]
                },
                {
                    titreLecon: "Fonctions Logarithmiques",
                    paragraphes: [
                        "Définition de la fonction logarithme népérien (ln) comme primitive de x ↦ 1/x sur ]0, +∞[.",
                        "Propriétés algébriques de la fonction ln (ln(ab), ln(a/b), ln(a^n), ln(√a)).",
                        "Étude de la fonction ln (domaine, limites aux bornes, dérivée, sens de variation, concavité, graphe).",
                        "Fonction logarithme de base a (log_a(x)). Propriétés.",
                        "Résolution d'équations et inéquations logarithmiques."
                    ]
                },
                {
                    titreLecon: "Fonctions Exponentielles",
                    paragraphes: [
                        "Définition de la fonction exponentielle (exp) comme fonction réciproque de la fonction ln.",
                        "Propriétés algébriques de la fonction exp (e^(a+b), e^(a-b), (e^a)^n).",
                        "Étude de la fonction exp (domaine, limites aux bornes, dérivée, sens de variation, concavité, graphe).",
                        "Fonction exponentielle de base a (a^x = e^(x ln a)). Étude et propriétés.",
                        "Résolution d'équations et inéquations exponentielles.",
                        "Croissances comparées des fonctions ln(x), x^α, e^x à l'infini."
                    ]
                },
                {
                    titreLecon: "Calcul Intégral",
                    paragraphes: [
                        "Fonctions primitives (définition, existence pour une fonction continue, unicité à une constante près).",
                        "Tableau des primitives des fonctions usuelles.",
                        "Intégrale d'une fonction continue sur un segment [a,b] (définition à partir des primitives).",
                        "Interprétation géométrique de l'intégrale (aire sous la courbe pour une fonction positive).",
                        "Propriétés de l'intégrale (linéarité, relation de Chasles, positivité, comparaison).",
                        "Valeur moyenne d'une fonction sur un intervalle.",
                        "Techniques de calcul d'intégrales : Intégration par parties.",
                        "Calcul d'aires de domaines plans et de volumes de solides de révolution."
                    ]
                },
                {
                    titreLecon: "Équations Différentielles",
                    paragraphes: [
                        "Équations différentielles linéaires du premier ordre : y' = ay (solutions : x ↦ Ce^(ax)).",
                        "Équations différentielles linéaires du premier ordre : y' = ay + b (solutions générales, recherche d'une solution particulière constante).",
                        "Équations différentielles linéaires du second ordre à coefficients constants : y'' + ay' + by = 0.",
                        "Résolution de l'équation caractéristique r² + ar + b = 0 et formes des solutions selon le signe du discriminant Δ.",
                        "Recherche de solutions particulières vérifiant des conditions initiales."
                    ]
                },
                {
                    titreLecon: "Nombres Complexes (Partie 1: Forme Algébrique et Géométrie)",
                    paragraphes: [
                        "Ensemble des nombres complexes C (construction, unicité de la forme algébrique z = a+ib).",
                        "Opérations dans C (addition, soustraction, multiplication, inverse, quotient).",
                        "Conjugué d'un nombre complexe (définition, propriétés : z+z', z*z', (z/z')', z^n').",
                        "Module d'un nombre complexe (définition |z|=√(zz'), propriétés : |zz'|, |z/z'|, |z^n|, inégalité triangulaire).",
                        "Interprétation géométrique : affixe d'un point, affixe d'un vecteur.",
                        "Représentation géométrique de z+z', z-z', kz. Affixe du milieu d'un segment, d'un barycentre."
                    ]
                },
                {
                    titreLecon: "Nombres Complexes (Partie 2: Formes Trigonométrique et Exponentielle, Applications)",
                    paragraphes: [
                        "Forme trigonométrique d'un nombre complexe non nul (module et argument(s)).",
                        "Propriétés du module et de l'argument (produit, quotient, puissance - Formule de Moivre).",
                        "Forme exponentielle (e^(iθ) = cosθ + isinθ). Formules d'Euler (cosθ et sinθ en fonction de e^(iθ) et e^(-iθ)).",
                        "Linéarisation de cos^n(x) et sin^n(x).",
                        "Racines n-ièmes d'un nombre complexe, en particulier racines n-ièmes de l'unité.",
                        "Application des nombres complexes à la géométrie : distances, angles (mesure de (u,v)), colinéarité, orthogonalité.",
                        "Transformations planes : translation, homothétie, rotation (écritures complexes).",
                        "Résolution dans C d'équations du second degré à coefficients réels, puis à coefficients complexes."
                    ]
                },
                {
                    titreLecon: "Géométrie dans l'Espace",
                    paragraphes: [
                        "Repérage dans l'espace. Coordonnées d'un point, d'un vecteur.",
                        "Produit scalaire dans l'espace (définition, propriétés, expression analytique dans un repère orthonormé).",
                        "Orthogonalité de deux vecteurs, de deux droites.",
                        "Vecteur normal à un plan. Équation cartésienne d'un plan.",
                        "Distance d'un point à un plan.",
                        "Positions relatives de droites et de plans (parallélisme, intersection, orthogonalité).",
                        "Produit vectoriel (définition, propriétés, expression analytique dans un repère orthonormé direct).",
                        "Interprétation géométrique du produit vectoriel (vecteur normal, aire d'un triangle, d'un parallélogramme).",
                        "Équation cartésienne d'un plan défini par trois points non alignés ou par un point et deux vecteurs directeurs.",
                        "Sphère : équation cartésienne (x-a)²+(y-b)²+(z-c)²=R².",
                        "Positions relatives d'une sphère et d'un plan, d'une sphère et d'une droite. Sections planes.",
                        "Distance d'un point à une droite (application)."
                    ]
                },
                {
                    titreLecon: "Probabilités",
                    paragraphes: [
                        "Vocabulaire des probabilités : expérience aléatoire, univers des possibles (fini), événement, événement élémentaire.",
                        "Probabilité sur un univers fini : définition, propriétés (P(∅), P(Ω), P(A∪B), P(Ā)).",
                        "Hypothèse d'équiprobabilité. Calcul de probabilités par dénombrement.",
                        "Probabilité conditionnelle P(B|A). Formule des probabilités composées.",
                        "Indépendance de deux événements. Indépendance de n événements.",
                        "Formule des probabilités totales.",
                        "Variable aléatoire discrète : loi de probabilité, espérance mathématique, variance, écart-type.",
                        "Loi de Bernoulli. Loi binomiale B(n,p) (définition, espérance, variance)."
                        // "Loi de Poisson (si au programme de certains concours spécifiques)"
                    ]
                },
                {
                    titreLecon: "Arithmétique dans Z (pour concours spécifiques)",
                    paragraphes: [
                        "Divisibilité dans Z, PGCD, PPCM, algorithme d'Euclide.",
                        "Théorème de Bézout, théorème de Gauss.",
                        "Nombres premiers, décomposition en facteurs premiers.",
                        "Congruences modulo n, propriétés.",
                        "Équations diophantiennes du type ax + by = c."
                    ]
                }
            ]
        },
        {
           nomMatiere: "Physique-Chimie", // الاسم الفرنسي للـ AI
                nomMatiereAr: "الفيزياء و الكمياء",
            lecons: [
                // === PHYSIQUE ===
                {
                    titreLecon: "Les Ondes Mécaniques Progressives",
                    paragraphes: [
                        "Définition d'une onde mécanique progressive (perturbation se propageant dans un milieu matériel).",
                        "Ondes transversales et longitudinales : exemples (corde, ressort, son).",
                        "Célérité (vitesse de propagation) d'une onde : définition, facteurs influençant.",
                        "Retard temporel τ entre deux points du milieu.",
                        "Propagation d'une onde sans transport de matière mais avec transport d'énergie."
                    ]
                },
                {
                    titreLecon: "Les Ondes Mécaniques Progressives Périodiques",
                    paragraphes: [
                        "Définition d'une onde progressive périodique.",
                        "Double périodicité : périodicité temporelle (période T, fréquence N=1/T) et périodicité spatiale (longueur d'onde λ).",
                        "Relation entre célérité, longueur d'onde et période/fréquence : λ = v.T = v/N.",
                        "Comparaison du mouvement de deux points du milieu (en phase, en opposition de phase).",
                        "Milieu dispersif : définition et conséquences."
                    ]
                },
                {
                    titreLecon: "Propagation d'une Onde Lumineuse - Diffraction et Dispersion",
                    paragraphes: [
                        "Nature ondulatoire de la lumière : modèle ondulatoire.",
                        "Phénomène de diffraction de la lumière : mise en évidence (fente, trou, fil).",
                        "Influence de la dimension de l'ouverture/obstacle et de la longueur d'onde sur la diffraction.",
                        "Écart angulaire θ ≈ λ/a.",
                        "Lumière polychromatique et monochromatique. Longueur d'onde dans le vide.",
                        "Phénomène de dispersion de la lumière par un prisme ou un réseau.",
                        "Indice de réfraction n d'un milieu transparent, relation avec la célérité de la lumière."
                    ]
                },
                {
                    titreLecon: "Transformations Nucléaires et Radioactivité",
                    paragraphes: [
                        "Composition du noyau atomique (nucléons : protons, neutrons). Notation A_Z X.",
                        "Stabilité et instabilité des noyaux. Diagramme (N,Z).",
                        "Radioactivité : définition. Types de radioactivité : α (émission d'un noyau d'hélium), β- (émission d'un électron), β+ (émission d'un positron), γ (désexcitation).",
                        "Lois de conservation (lois de Soddy) lors des transformations nucléaires (conservation du nombre de masse A et du nombre de charge Z).",
                        "Décroissance radioactive : loi N(t) = N₀.e^(-λt). Activité A(t) = λN(t).",
                        "Constante radioactive λ. Temps de demi-vie t₁/₂ = ln(2)/λ.",
                        "Réactions nucléaires provoquées : fission (noyaux lourds) et fusion (noyaux légers).",
                        "Bilan d'énergie : défaut de masse Δm, énergie de liaison E_l = |Δm|.c². Énergie libérée ou consommée par une réaction nucléaire |ΔE| = |Δm_réaction|.c²."
                    ]
                },
                {
                    titreLecon: "Dipôle RC",
                    paragraphes: [
                        "Condensateur : description, symbole. Charge q = C.u_C. Capacité C (Farad).",
                        "Association de condensateurs (série, parallèle - notions utiles).",
                        "Charge d'un condensateur à travers une résistance (circuit RC série soumis à un échelon de tension E).",
                        "Établissement de l'équation différentielle vérifiée par u_C(t) ou q(t).",
                        "Solution de l'équation différentielle u_C(t) = E(1 - e^(-t/τ)). Constante de temps τ = RC.",
                        "Décharge d'un condensateur dans une résistance.",
                        "Équation différentielle et solution u_C(t) = E.e^(-t/τ).",
                        "Énergie emmagasinée dans un condensateur E_e = ½ C.u_C²."
                    ]
                },
                {
                    titreLecon: "Dipôle RL",
                    paragraphes: [
                        "Bobine : description, symbole. Inductance L (Henry). Résistance interne r.",
                        "Tension aux bornes d'une bobine : u_L = L(di/dt) + ri.",
                        "Phénomène d'auto-induction.",
                        "Réponse d'un dipôle RL à un échelon de tension (établissement du courant).",
                        "Équation différentielle vérifiée par i(t). Solution i(t) = (E/R_tot)(1 - e^(-t/τ)). Constante de temps τ = L/R_tot.",
                        "Rupture du courant dans un circuit RL (disparition du courant).",
                        "Énergie emmagasinée dans une bobine E_m = ½ L.i²."
                    ]
                },
                {
                    titreLecon: "Circuit RLC Série en Régime Libre",
                    paragraphes: [
                        "Oscillations électriques libres dans un circuit RLC série (décharge d'un condensateur dans une bobine et un résistor).",
                        "Équation différentielle des oscillations : LC(d²u_C/dt²) + RC(du_C/dt) + u_C = 0 (ou pour q(t)).",
                        "Régimes d'oscillations en fonction de l'amortissement (résistance R) : pseudo-périodique (R < R_c), apériodique (R > R_c), critique (R = R_c).",
                        "Pseudo-période T ≈ T₀ = 2π√(LC) (période propre) pour un faible amortissement.",
                        "Interprétation énergétique : transferts d'énergie entre condensateur et bobine, dissipation par effet Joule dans la résistance."
                    ]
                },
                {
                    titreLecon: "Circuit RLC Série en Régime Forcé (Courant Alternatif Sinusoïdal)",
                    paragraphes: [
                        "Générateur basse fréquence (GBF) délivrant une tension sinusoïdale u(t) = U_m cos(ωt + φ_u).",
                        "Intensité du courant i(t) = I_m cos(ωt + φ_i). Déphasage Δφ = φ_u - φ_i.",
                        "Impédance Z du circuit RLC. Z = U_eff / I_eff = U_m / I_m.",
                        "Construction de Fresnel. Loi d'additivité des tensions.",
                        "Étude de la résonance d'intensité : fréquence de résonance N_0, bande passante, facteur de qualité Q.",
                        "Puissance en régime sinusoïdal : puissance instantanée, puissance moyenne P = U_eff.I_eff.cos(Δφ)."
                    ]
                },
                {
                    titreLecon: "Les Lois de Newton",
                    paragraphes: [
                        "Référentiel galiléen (ou d'inertie) : définition.",
                        "Vecteur position OM, vecteur vitesse v = d(OM)/dt, vecteur accélération a = dv/dt.",
                        "Première loi de Newton (Principe d'inertie) : dans un référentiel galiléen, si la somme vectorielle des forces extérieures est nulle, le centre d'inertie G est soit au repos, soit en mouvement rectiligne uniforme (et réciproquement).",
                        "Deuxième loi de Newton (Relation fondamentale de la dynamique) : ΣF_ext = m.a_G.",
                        "Troisième loi de Newton (Principe des actions réciproques) : F_A/B = - F_B/A."
                    ]
                },
                {
                    titreLecon: "Applications des Lois de Newton : Mouvements Rectilignes",
                    paragraphes: [
                        "Chute libre verticale (uniquement le poids). Équations horaires du mouvement (position, vitesse).",
                        "Chute verticale avec frottements fluides (poussée d'Archimède négligée ou non, force de frottement de type f = -kv ou f = -kv²).",
                        "Établissement de l'équation différentielle du mouvement.",
                        "Vitesse limite (cas f = -kv).",
                        "Mouvement sur un plan horizontal ou incliné (avec ou sans frottements solides)."
                    ]
                },
                {
                    titreLecon: "Applications des Lois de Newton : Mouvements Plans",
                    paragraphes: [
                        "Mouvement d'un projectile dans un champ de pesanteur uniforme (g)." ,
                        "Établissement des équations horaires du mouvement (x(t), y(t)) à partir des conditions initiales.",
                        "Équation de la trajectoire y(x). Flèche et portée.",
                        "Mouvement d'une particule chargée (q, m) dans un champ électrique uniforme E (entre deux plaques).",
                        "Mouvement d'une particule chargée dans un champ magnétique uniforme B (force de Lorentz F = qv ∧ B). Cas où v est perpendiculaire à B : mouvement circulaire uniforme."
                    ]
                },
                {
                    titreLecon: "Satellites et Planètes : Lois de Kepler",
                    paragraphes: [
                        "Loi de l'attraction universelle (Newton) : F_A/B = -G (m_A.m_B / d²) u_AB.",
                        "Mouvement circulaire uniforme d'un satellite (ou planète) autour d'un astre central.",
                        "Expression de la vitesse, de la période de révolution T en fonction du rayon de l'orbite R et de la masse de l'astre attracteur M.",
                        "Première loi de Kepler (loi des orbites) : les planètes décrivent des ellipses dont le Soleil occupe l'un des foyers.",
                        "Deuxième loi de Kepler (loi des aires) : le rayon vecteur Soleil-planète balaie des aires égales pendant des durées égales.",
                        "Troisième loi de Kepler (loi des périodes) : T²/a³ = constante (où a est le demi-grand axe de l'ellipse, ou R pour une orbite circulaire)."
                    ]
                },
                {
                    titreLecon: "Systèmes Oscillants Mécaniques",
                    paragraphes: [
                        "Pendule simple : modélisation, étude dynamique pour de petites oscillations (approximation sinθ ≈ θ).",
                        "Équation différentielle du mouvement : d²θ/dt² + (g/l)θ = 0. Solution sinusoïdale.",
                        "Période propre T₀ = 2π√(l/g).",
                        "Pendule élastique horizontal (ressort à spires non jointives de raideur k, masse m).",
                        "Équation différentielle : d²x/dt² + (k/m)x = 0. Période propre T₀ = 2π√(m/k).",
                        "Pendule élastique vertical.",
                        "Pendule de torsion (fil de torsion de constante C, solide de moment d'inertie J).",
                        "Équation différentielle : d²θ/dt² + (C/J)θ = 0. Période propre T₀ = 2π√(J/C).",
                        "Amortissement des oscillations. Phénomène de résonance mécanique."
                    ]
                },
                {
                    titreLecon: "Aspects Énergétiques des Oscillations Mécaniques",
                    paragraphes: [
                        "Énergie cinétique E_c = ½ mv² (translation) ou E_c = ½ Jθ'² (rotation).",
                        "Énergie potentielle de pesanteur E_pp = mgz + cte.",
                        "Énergie potentielle élastique E_pe = ½ kx² + cte (ressort) ou E_pe = ½ Cθ² + cte (torsion).",
                        "Énergie mécanique E_m = E_c + E_p.",
                        "Conservation de l'énergie mécanique en l'absence de frottements.",
                        "Non-conservation de l'énergie mécanique en présence de frottements (travail des forces de frottement)."
                    ]
                },
                {
                    titreLecon: "L'Atome et la Mécanique de Newton : Limites",
                    paragraphes: [
                        "Insuffisance de la mécanique classique pour décrire le comportement de la matière à l'échelle atomique.",
                        "Quantification de l'énergie de l'atome : niveaux d'énergie discrets.",
                        "Spectres d'émission et d'absorption : raies spectrales.",
                        "Relation de Planck-Einstein : ΔE = hν = hc/λ (énergie d'un photon).",
                        "Dualité onde-corpuscule (introduction)."
                    ]
                },
                // === CHIMIE ===
                {
                    titreLecon: "Transformations Rapides et Transformations Lentes",
                    paragraphes: [
                        "Définition d'une transformation chimique. Système chimique.",
                        "Réaction d'oxydo-réduction : oxydant, réducteur, couples redox (Ox/Red).",
                        "Écriture des demi-équations électroniques et de l'équation bilan.",
                        "Notion de vitesse de réaction : transformations rapides, lentes, infiniment lentes.",
                        "Facteurs cinétiques : concentration des réactifs, température, catalyseur (définition, types de catalyse : homogène, hétérogène, enzymatique)."
                    ]
                },
                {
                    titreLecon: "Suivi Temporel d'une Transformation Chimique - Vitesse de Réaction",
                    paragraphes: [
                        "Tableau d'avancement d'une réaction chimique : réactif limitant, avancement maximal x_max.",
                        "Méthodes de suivi temporel d'une transformation : mesures physiques (conductimétrie, pH-métrie, spectrophotométrie, pression, volume) ou chimiques (dosages).",
                        "Vitesse volumique de réaction : v = (1/V_sol) * (dx/dt).",
                        "Détermination graphique de la vitesse à un instant t.",
                        "Évolution de la vitesse au cours du temps.",
                        "Temps de demi-réaction t₁/₂ : définition, détermination graphique, relation avec les facteurs cinétiques."
                    ]
                },
                {
                    titreLecon: "Transformations Chimiques s'Effectuant dans les Deux Sens - Équilibre Chimique",
                    paragraphes: [
                        "Notion de transformation non totale et d'équilibre chimique.",
                        "Quotient de réaction Qr à un instant t (expression en fonction des concentrations molaires pour les espèces dissoutes, des pressions partielles pour les gaz).",
                        "Constante d'équilibre K associée à l'équation de la réaction (K ne dépend que de la température).",
                        "État d'équilibre d'un système chimique : Qr,éq = K.",
                        "Taux d'avancement final τ = x_f / x_max. Relation entre K et τ (pour des cas simples).",
                        "Influence de l'état initial sur la composition à l'équilibre et sur τ."
                    ]
                },
                {
                    titreLecon: "Transformations Associées aux Réactions Acide-Base en Solution Aqueuse",
                    paragraphes: [
                        "Définition d'un acide et d'une base selon Brönsted-Lowry. Couples acide/base (AH/A⁻).",
                        "Produit ionique de l'eau Ke = [H₃O⁺][OH⁻]. Échelle de pH.",
                        "Constante d'acidité Ka d'un couple acide/base. pKa = -log(Ka).",
                        "Force relative des acides et des bases : comparaison des Ka ou pKa.",
                        "Diagramme de prédominance des espèces acido-basiques en fonction du pH.",
                        "Réaction acido-basique. Constante d'équilibre d'une réaction acido-basique.",
                        "Solutions tampons : définition, propriétés, préparation."
                    ]
                },
                {
                    titreLecon: "Dosage Acido-Basique par pH-métrie",
                    paragraphes: [
                        "Principe d'un dosage (titrage) : réaction support (rapide, totale, unique).",
                        "Montage expérimental d'un titrage pH-métrique.",
                        "Repérage du point d'équivalence : méthode des tangentes parallèles, méthode de la dérivée (dpH/dVb).",
                        "Choix d'un indicateur coloré approprié pour un titrage.",
                        "Calcul de concentrations à partir des résultats du dosage."
                    ]
                },
                {
                    titreLecon: "Évolution Spontanée d'un Système Chimique - Piles",
                    paragraphes: [
                        "Critère d'évolution spontanée d'un système chimique : comparaison de Qr et K.",
                        "Piles électrochimiques (ex: pile Daniell) : constitution, fonctionnement.",
                        "Anode (oxydation), cathode (réduction). Polarité des électrodes.",
                        "Force électromotrice (f.e.m.) d'une pile. Schéma conventionnel d'une pile.",
                        "Quantité d'électricité débitée par une pile Q = I.Δt = n(e⁻).F (où F est le Faraday)." ,
                        "Relation entre l'avancement de la réaction et la quantité d'électricité."
                    ]
                },
                {
                    titreLecon: "Transformations Forcées - Électrolyse",
                    paragraphes: [
                        "Principe de l'électrolyse : imposer une transformation non spontanée à l'aide d'un générateur de tension continue.",
                        "Cellule d'électrolyse : anode (oxydation), cathode (réduction).",
                        "Réactions aux électrodes. Prévision des réactions (règles de priorité si plusieurs espèces peuvent réagir).",
                        "Aspect quantitatif de l'électrolyse : relation entre la quantité d'électricité Q et les quantités de matière formées ou consommées (lois de Faraday).",
                        "Applications de l'électrolyse (préparation de métaux, dépôts électrolytiques, etc.)."
                    ]
                },
                {
                    titreLecon: "Réactions d'Estérification et d'Hydrolyse d'un Ester",
                    paragraphes: [
                        "Groupes fonctionnels : alcools (primaire, secondaire, tertiaire), acides carboxyliques, esters, anhydrides d'acide.",
                        "Nomenclature de base de ces composés.",
                        "Réaction d'estérification (acide carboxylique + alcool ⇌ ester + eau) : caractéristiques (lente, limitée par l'équilibre, athermique).",
                        "Réaction d'hydrolyse d'un ester (ester + eau ⇌ acide carboxylique + alcool) : caractéristiques.",
                        "Contrôle de la vitesse de réaction (catalyseur H⁺, température).",
                        "Amélioration du rendement : utilisation d'un réactif en excès, élimination d'un produit, utilisation d'un anhydride d'acide ou d'un chlorure d'acyle (réactions totales et rapides)."
                    ]
                },
                {
                    titreLecon: "Chimie Organique : Saponification et Détergents (si pertinent pour le concours)",
                    paragraphes: [
                        "Réaction de saponification : hydrolyse basique d'un ester (triglycéride) pour former un carboxylate (savon) et un alcool (glycérol).",
                        "Propriétés des savons : tensioactifs, pouvoir moussant et détergent.",
                        "Structure d'un ion tensioactif (partie hydrophile, partie lipophile/hydrophobe). Action détergente.",
                        "Notions sur les détergents synthétiques."
                    ]
                }
            ]
        },
        {
             nomMatiere: "SVT", // الاسم الفرنسي للـ AI (أو "Sciences de la Vie et de la Terre" إذا كنت تفضل)
                nomMatiereAr: "علوم الحياة و الارض",
            lecons: [
                {
                    titreLecon: "Consommation de la Matière Organique et Flux d'Énergie",
                    paragraphes: [
                        "Les besoins énergétiques et plastiques de l'organisme : rôle des aliments (glucides, lipides, protides).",
                        "La respiration cellulaire : localisation (cytosol, mitochondrie), étapes (glycolyse, cycle de Krebs, chaîne respiratoire), bilan énergétique (production d'ATP).",
                        "La fermentation (lactique et alcoolique) : localisation, étapes, faible rendement en ATP.",
                        "Comparaison des bilans énergétiques de la respiration et de la fermentation.",
                        "Structure et ultrastructure du muscle strié squelettique (fibre musculaire, myofibrille, sarcomère).",
                        "Mécanismes moléculaires de la contraction musculaire (glissement des myofilaments d'actine et de myosine).",
                        "Rôle de l'ATP et du calcium (Ca²⁺) dans la contraction et le relâchement musculaire. Renouvellement de l'ATP musculaire."
                    ]
                },
                {
                    titreLecon: "Nature de l'Information Génétique et Mécanisme de son Expression - Génie Génétique",
                    paragraphes: [
                        "Localisation de l'information génétique (noyau chez les eucaryotes, cytoplasme chez les procaryotes).",
                        "Nature chimique du matériel génétique : ADN (structure en double hélice, nucléotides).",
                        "Relation gène - protéine - caractère. Notion de code génétique (universalité, redondance).",
                        "Mécanismes de l'expression de l'information génétique :",
                        "  - Transcription : synthèse d'ARNm à partir d'un brin d'ADN (dans le noyau).",
                        "  - Traduction : synthèse de protéines à partir de l'ARNm (dans le cytoplasme, au niveau des ribosomes).",
                        "Notion de mutation (ponctuelle, chromosomique) et ses conséquences sur la protéine et le phénotype.",
                        "Le cycle cellulaire et la mitose (conservation de l'information génétique).",
                        "Principes et techniques de base du génie génétique : enzymes de restriction, plasmides, ligases, électrophorèse, PCR, clonage, transgénèse.",
                        "Applications du génie génétique (production de médicaments, amélioration des plantes, thérapie génique - exemples)."
                    ]
                },
                {
                    titreLecon: "Transmission de l'Information Génétique par la Reproduction Sexuée - Lois de Mendel",
                    paragraphes: [
                        "La méiose : étapes et rôle dans la réduction du nombre de chromosomes et le brassage génétique (intra et interchromosomique).",
                        "Formation des gamètes (gamétogenèse) et fécondation : rétablissement de la diploïdie.",
                        "Monohybridisme : dominance, récessivité, codominance. Lois de Mendel (uniformité des hybrides F1, ségrégation des allèles en F2).",
                        "Dihybridisme : ségrégation indépendante des couples d'allèles (si gènes non liés).",
                        "Notions de gènes liés et de crossing-over (cartographie génétique simplifiée).",
                        "Hérédité liée au sexe (exemple : daltonisme, hémophilie)."
                    ]
                },
                {
                    titreLecon: "L'Immunologie",
                    paragraphes: [
                        "Le soi et le non-soi : marqueurs du soi (CMH), antigènes.",
                        "L'immunité non spécifique (naturelle) : barrières naturelles, réaction inflammatoire, phagocytose.",
                        "L'immunité spécifique (acquise) : reconnaissance de l'antigène.",
                        "  - Immunité à médiation humorale : rôle des lymphocytes B, plasmocytes, anticorps (structure et fonctions).",
                        "  - Immunité à médiation cellulaire : rôle des lymphocytes T (LT CD4 ou auxiliaires, LT CD8 ou cytotoxiques).",
                        "Coopération cellulaire entre les différents acteurs du système immunitaire.",
                        "La mémoire immunitaire et son importance (vaccination).",
                        "Dysfonctionnements du système immunitaire : allergies, maladies auto-immunes, SIDA (VIH)."
                    ]
                },
                {
                    titreLecon: "La Communication Nerveuse et Hormonale",
                    paragraphes: [
                        "Le système nerveux : neurone (structure), nerf, centres nerveux (moelle épinière, encéphale).",
                        "Potentiel de repos et potentiel d'action : nature et propagation de l'influx nerveux.",
                        "La synapse : structure, transmission synaptique (neurotransmetteurs).",
                        "Réflexe myotatique comme exemple d'arc réflexe.",
                        "Le système hormonal (endocrinien) : glande endocrine, hormone, cellule cible, récepteur hormonal.",
                        "Exemple de régulation hormonale : la régulation de la glycémie (rôle du pancréas : insuline, glucagon).",
                        "Comparaison et complémentarité des communications nerveuse et hormonale."
                    ]
                },
                {
                    titreLecon: "Géodynamique Interne de la Terre",
                    paragraphes: [
                        "Structure interne du globe terrestre (croûte, manteau, noyau).",
                        "La théorie de la tectonique des plaques : lithosphère, asthénosphère, plaques lithosphériques.",
                        "Mouvements des plaques : divergence (dorsales océaniques), convergence (subduction, collision), coulissage (failles transformantes).",
                        "Manifestations de la géodynamique interne :",
                        "  - Séismes : origine, ondes sismiques, mesure (magnitude, intensité).",
                        "  - Volcanisme : types (effusif, explosif), relation avec la tectonique des plaques.",
                        "Formation des chaînes de montagnes : chaînes de subduction, de collision, chaînes intracontinentales.",
                        "Métamorphisme et granitisation associés à l'orogenèse."
                    ]
                },
                {
                    titreLecon: "Géodynamique Externe : Phénomènes Sédimentaires et Ressources",
                    paragraphes: [
                        "L'érosion : altération (physique, chimique) des roches et transport des produits.",
                        "La sédimentation : dépôt des matériaux dans différents milieux (continental, marin).",
                        "La diagenèse : transformation des sédiments en roches sédimentaires (compaction, cimentation).",
                        "Principaux types de roches sédimentaires (détritiques, chimiques, biochimiques).",
                        "Les ressources naturelles liées aux phénomènes sédimentaires :",
                        "  - L'eau : cycle de l'eau, nappes phréatiques, surexploitation et pollution des ressources en eau.",
                        "  - Les phosphates : origine sédimentaire, gisements (exemple du Maroc), importance économique.",
                        "  - Les hydrocarbures (pétrole, gaz naturel) : formation (roche mère, migration, piège), gisements.",
                        "Notions de gestion durable des ressources naturelles."
                    ]
                }
            ]
        },
        {
            nomMatiere: "Culture Générale",
            nomMatiereAr: "الثقافة العامة",
            lecons: [
                {
                    titreLecon: "Grands enjeux du monde contemporain",
                    paragraphes: [
                        "Globalisation et ses impacts (économiques, culturels, sociaux).",
                        "Développement durable : défis environnementaux (changement climatique, biodiversité, ressources en eau), sociaux et économiques.",
                        "Transformations numériques : intelligence artificielle, big data, impact sur l'emploi et la société.",
                        "Questions géopolitiques majeures : conflits régionaux, nouvelles puissances, organisations internationales.",
                        "Défis démographiques et migrations."
                    ]
                },
                {
                    titreLecon: "Actualité économique, sociale et politique",
                    paragraphes: [
                        "Suivi de l'actualité nationale (Maroc) et internationale marquante.",
                        "Principaux systèmes économiques (capitalisme, socialisme, économie mixte).",
                        "Rôle de l'État et politiques publiques (éducation, santé, emploi).",
                        "Enjeux sociaux : inégalités, pauvreté, éducation, santé.",
                        "Vie politique : institutions, partis politiques, élections."
                    ]
                },
                {
                    titreLecon: "Histoire des idées et des civilisations",
                    paragraphes: [
                        "Grands courants de pensée philosophique (Antiquité, Lumières, pensée contemporaine).",
                        "Moments clés de l'histoire mondiale (grandes découvertes, révolutions, guerres mondiales).",
                        "Histoire du Maroc : grandes dynasties, protectorat, indépendance, Maroc contemporain.",
                        "Apports des grandes civilisations (mésopotamienne, égyptienne, gréco-romaine, arabo-musulmane, chinoise, etc.)."
                    ]
                },
                {
                    titreLecon: "Art et Littérature (connaissances de base)",
                    paragraphes: [
                        "Principaux mouvements artistiques (Renaissance, Baroque, Classicisme, Romantisme, Impressionnisme, Art moderne et contemporain).",
                        "Grands courants littéraires (classicisme, romantisme, réalisme, symbolisme, surréalisme).",
                        "Auteurs et œuvres marquants de la littérature française, arabe et mondiale (selon les attentes du concours).",
                        "Notions de base en musique, cinéma, architecture."
                    ]
                }
            ]
        },
        {
            nomMatiere: "Langue Française",
            nomMatiereAr: "اللغة الفرنسية",
            lecons: [
                {
                    titreLecon: "Compréhension de textes complexes",
                    paragraphes: [
                        "Identification du thème, de la thèse, des arguments et des exemples.",
                        "Analyse de la structure du texte et de l'enchaînement des idées.",
                        "Repérage des implicites, des sous-entendus, du ton de l'auteur.",
                        "Identification des figures de style et leur fonction.",
                        "Reformulation des idées principales."
                    ]
                },
                {
                    titreLecon: "Synthèse de documents",
                    paragraphes: [
                        "Capacité à extraire l'essentiel de plusieurs sources (textes, graphiques, images).",
                        "Confrontation et comparaison des documents.",
                        "Identification des points communs, des divergences, des complémentarités.",
                        "Rédaction d'une synthèse neutre, objective, structurée et concise, sans opinion personnelle."
                    ]
                },
                {
                    titreLecon: "Dissertation/Essai argumentatif",
                    paragraphes: [
                        "Analyse et problématisation d'un sujet (citation, question, thème).",
                        "Élaboration d'un plan détaillé et équilibré (introduction, développement en parties/sous-parties, conclusion).",
                        "Mobilisation de connaissances personnelles et culturelles pertinentes.",
                        "Formulation d'arguments clairs, étayés par des exemples précis.",
                        "Utilisation de connecteurs logiques pour assurer la cohérence du discours.",
                        "Richesse et précision du vocabulaire. Correction grammaticale et orthographique."
                    ]
                },
                {
                    titreLecon: "Maîtrise de la langue (Grammaire, Vocabulaire, Orthographe)",
                    paragraphes: [
                        "Conjugaison des verbes (temps, modes, concordance des temps).",
                        "Accords (sujet-verbe, adjectif, participe passé).",
                        "Syntaxe de la phrase complexe (propositions subordonnées).",
                        "Maîtrise des nuances de sens du vocabulaire (synonymes, antonymes, paronymes, homonymes).",
                        "Connaissance des registres de langue (soutenu, courant, familier).",
                        "Règles d'orthographe grammaticale et d'usage."
                    ]
                }
            ]
        }
        // Ajoutez d'autres matières spécifiques aux concours si nécessaire
        // Par exemple: "Sciences Industrielles pour l'Ingénieur (SII)" pour ENSA, ENSAM, CNC (MP, PSI, TSI)
    ]
};

// Vous pouvez exporter cette constante si elle est dans un fichier séparé
 module.exports = concoursCurriculumData; // Décommentez si vous utilisez Node.js et require/module.exports

// Exemple d'utilisation (pour le navigateur ou un environnement d'exécution JS)
// console.log(concoursCurriculum.subjects.find(s => s.nomMatiereAr === "الرياضيات").lecons[0].titreLecon);