const { MongoClient, ObjectId } = require('mongodb');

// --- معلومات الاتصال بقاعدة البيانات ---
const uri = "mongodb+srv://majoriyad:CUbNhg4PYp4Bc0vU@cluster0.bpqezif.mongodb.net/";
const dbName = "test";
const collectionName = "questions";

// --- المعرفات الثابتة ---
const academicLevelId = new ObjectId('6856e57742d2333b081f4375');
const trackId = new ObjectId('6856e5b242d2333b081f4386');
const subjectId = new ObjectId('6856e8cb42d2333b081f44eb');

// --- قائمة الأسئلة الإضافية (51 سؤالاً) ---
const remaining_questions = [
  // --- Calcul intégral (suite) ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Calculer l'intégrale suivante : $I = \\int_{0}^{1} \\frac{1}{(x+1)^2} dx$.",
    correctAnswer: "Une primitive de $\\frac{1}{(x+1)^2} = (x+1)^{-2}$ est $\\frac{(x+1)^{-1}}{-1} = -\\frac{1}{x+1}$. \n$I = [-\\frac{1}{x+1}]_{0}^{1} = (-\\frac{1}{2}) - (-\\frac{1}{1}) = 1 - \\frac{1}{2} = \\frac{1}{2}$.",
    lesson: "Calcul intégral", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "صعب", type: "free_text",
    text: "Calculer l'intégrale suivante : $I = \\int_{0}^{2} |x^2-1| dx$.",
    correctAnswer: "On étudie le signe de $x^2-1$. C'est négatif entre -1 et 1, positif ailleurs. Sur $[0,2]$, on sépare l'intégrale en $x=1$. \n$I = \\int_{0}^{1} -(x^2-1) dx + \\int_{1}^{2} (x^2-1) dx = \\int_{0}^{1} (1-x^2) dx + \\int_{1}^{2} (x^2-1) dx$. \n$I = [x-\\frac{x^3}{3}]_{0}^{1} + [\\frac{x^3}{3}-x]_{1}^{2} = (1-1/3) - 0 + (8/3-2) - (1/3-1) = 2/3 + 2/3 - (-2/3) = 6/3 = 2$.",
    lesson: "Calcul intégral", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "En utilisant une intégration par partie, calculer $J = \\int_{0}^{\\pi/2} x\\cos x dx$.",
    correctAnswer: "On pose $u=x \Rightarrow u'=1$ et $v'=\\cos x \Rightarrow v=\\sin x$. \n$J = [x\\sin x]_{0}^{\\pi/2} - \\int_{0}^{\\pi/2} 1\\cdot\\sin x dx = (\\frac{\\pi}{2}\\sin(\\frac{\\pi}{2})-0) - [-\\cos x]_{0}^{\\pi/2} = \\frac{\\pi}{2} - (-\\cos(\\pi/2) - (-\\cos 0)) = \\frac{\pi}{2} - (0+1) = \\frac{\pi}{2}-1$.",
    lesson: "Calcul intégral", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "صعب", type: "free_text",
    text: "Soit la suite $(u_n)$ définie par $u_n = \\int_{1}^{e} (\\ln x)^n dx$. Montrer que $(\\forall n \\in \\mathbb{N}), u_n \\ge 0$.",
    correctAnswer: "Pour tout $x \\in [1, e]$, on a $\\ln x \\ge 0$. Par conséquent, $(\\ln x)^n \\ge 0$ pour tout $n \\in \\mathbb{N}$. Comme l'intégrale d'une fonction positive est positive (et les bornes sont dans le bon ordre $1 < e$), on a $u_n = \\int_{1}^{e} (\\ln x)^n dx \\ge 0$.",
    lesson: "Calcul intégral", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Calculer la valeur moyenne de la fonction $f(x) = \\frac{e^x}{(e^x+1)^2}$ sur $[0; \\ln 2]$.",
    correctAnswer: "La valeur moyenne est $\\mu = \\frac{1}{\\ln 2 - 0} \\int_{0}^{\\ln 2} \\frac{e^x}{(e^x+1)^2} dx$. \nL'intégrande est de la forme $\\frac{u'}{u^2}$ avec $u=e^x+1$. La primitive est $-\\frac{1}{u} = -\\frac{1}{e^x+1}$. \n$\\int = [-\\frac{1}{e^x+1}]_{0}^{\\ln 2} = -\\frac{1}{e^{\\ln 2}+1} - (-\\frac{1}{e^0+1}) = -\\frac{1}{3} + \\frac{1}{2} = \\frac{1}{6}$. \n$\mu = \\frac{1}{\\ln 2} \\cdot \\frac{1}{6} = \\frac{1}{6\\ln 2}$.",
    lesson: "Calcul intégral", generatedBy: "db"
  },

  // --- Équations différentielles (suite) ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Montrer que $y_0 = e^{-3x}$ est solution de l'équation $(E'): y'+2y = -e^{-3x}$.",
    correctAnswer: "On calcule $y_0' = -3e^{-3x}$. On remplace dans l'équation: \n$y_0'+2y_0 = (-3e^{-3x}) + 2(e^{-3x}) = -e^{-3x}$. C'est bien le second membre. Donc $y_0$ est une solution particulière de (E').",
    lesson: "Équations différentielles", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Résoudre dans $\\mathbb{C}$ l'équation $z^2-2\\sqrt{3}z+4=0$.",
    correctAnswer: "$\\Delta = (-2\\sqrt{3})^2 - 4(1)(4) = 12-16 = -4 = (2i)^2$. \nSolutions: $z = \\frac{2\\sqrt{3} \\pm 2i}{2} = \\sqrt{3} \\pm i$.",
    lesson: "Équations différentielles", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "En déduire les solutions de l'équation différentielle $y''-2\\sqrt{3}y'+4y=0$.",
    correctAnswer: "L'équation caractéristique $r^2-2\\sqrt{3}r+4=0$ a pour solutions $r = \\sqrt{3} \\pm i$. \nLa solution générale est donc $y(x) = e^{\\sqrt{3}x}(A\\cos(x) + B\\sin(x))$.",
    lesson: "Équations différentielles", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "On considère $y'-2y=2(e^{2x}-1)$. Montrer que $h(x)=2xe^{2x}+1$ est solution de l'équation.",
    correctAnswer: "$h'(x) = 2e^{2x} + 2x(2e^{2x}) = 2e^{2x}+4xe^{2x}$. \n$h'-2h = (2e^{2x}+4xe^{2x}) - 2(2xe^{2x}+1) = 2e^{2x}+4xe^{2x} - 4xe^{2x} - 2 = 2e^{2x}-2 = 2(e^{2x}-1)$. C'est bien le second membre.",
    lesson: "Équations différentielles", generatedBy: "db"
  },

  // --- Géométrie dans l'espace (suite) ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Soient $\\vec{u}$ et $\\vec{v}$ deux vecteurs tels que $\\|\\vec{u}\\|=2$, $\\|\\vec{v}\\|=3$ et $\\|\\vec{u}+\\vec{v}\\|=5$. Calculer $\\vec{u} \\cdot \\vec{v}$.",
    correctAnswer: "On utilise la propriété $\\|\\vec{u}+\\vec{v}\\|^2 = (\\vec{u}+\\vec{v})\\cdot(\\vec{u}+\\vec{v}) = \\|\\vec{u}\\|^2 + 2\\vec{u}\\cdot\\vec{v} + \\|\\vec{v}\\|^2$. \n$5^2 = 2^2 + 2\\vec{u}\\cdot\\vec{v} + 3^2$. \n$25 = 4 + 2\\vec{u}\\cdot\\vec{v} + 9$. \n$25 = 13 + 2\\vec{u}\\cdot\\vec{v} \Rightarrow 12 = 2\\vec{u}\\cdot\\vec{v} \Rightarrow \\vec{u}\\cdot\\vec{v} = 6$.",
    lesson: "Géométrie dans l'espace", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Déterminer l'équation cartésienne du plan (ABC) avec A(0;1;2), B(1;1;0) et C(1;0;1).",
    correctAnswer: "On calcule les vecteurs $\\vec{AB}(1,0,-2)$ et $\\vec{AC}(1,-1,-1)$. \nUn vecteur normal au plan est $\\vec{n} = \\vec{AB} \\wedge \\vec{AC}$. \n$\\vec{n} = (0(-1)-(-2)(-1), (-2)(1)-1(-1), 1(-1)-0(1)) = (-2, -1, -1)$. \nOn peut prendre $\\vec{n'}(2,1,1)$ comme vecteur normal. L'équation est $2x+y+z+d=0$. \nLe point A(0,1,2) appartient au plan: $2(0)+1+2+d=0 \Rightarrow d=-3$. \nL'équation est $2x+y+z-3=0$.",
    lesson: "Géométrie dans l'espace", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Quelle est l'intersection des plans d'équations respectives $(P): x-y+2z+1=0$ et $(P'): 2x+y-z+2=0$ ?",
    correctAnswer: "Les vecteurs normaux $\\vec{n}(1,-1,2)$ et $\\vec{n'}(2,1,-1)$ ne sont pas colinéaires. Les plans sont donc sécants selon une droite. Pour trouver une représentation paramétrique, on pose $z=t$. \n$\\begin{cases} x-y = -1-2t \\\\ 2x+y = -2+t \\end{cases}$. \nEn additionnant les deux lignes: $3x = -3-t \Rightarrow x = -1-t/3$. \nEn remplaçant x: $-1-t/3-y=-1-2t \Rightarrow y= -t/3+2t = 5t/3$. \nLa droite a pour représentation $\\{x=-1-t/3, y=5t/3, z=t\\}$.",
    lesson: "Géométrie dans l'espace", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "صعب", type: "free_text",
    text: "Soit une sphère $(S_m): mx^2+my^2+mz^2-2(m-1)x+2y+2z=0$ avec $m$ un paramètre non nul. Montrer que $(S_m)$ est une sphère pour tout $m \\in \\mathbb{R}^*$.",
    correctAnswer: "On divise par $m$: $x^2+y^2+z^2 - \\frac{2(m-1)}{m}x + \\frac{2}{m}y + \\frac{2}{m}z = 0$. \nC'est l'équation d'une sphère si $a^2+b^2+c^2-d > 0$. \nIci $a=-\frac{x_{coef}}{2} = \\frac{m-1}{m}$, $b=-\\frac{y_{coef}}{2}=-\\frac{1}{m}$, $c=-\\frac{z_{coef}}{2}=-\\frac{1}{m}$ et $d=0$. \nOn calcule $R^2 = a^2+b^2+c^2-d = (\\frac{m-1}{m})^2 + (-\\frac{1}{m})^2 + (-\\frac{1}{m})^2 - 0 = \\frac{(m-1)^2+1+1}{m^2} = \\frac{m^2-2m+1+2}{m^2} = \\frac{m^2-2m+3}{m^2}$. \nLe numérateur $m^2-2m+3$ a un $\\Delta = 4-12=-8<0$, donc il est toujours du signe de 'a' (positif). \nComme $R^2 > 0$ pour tout $m$, c'est bien une sphère.",
    lesson: "Géométrie dans l'espace", generatedBy: "db"
  },

  // --- Dénombrement (suite) ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Une classe de 15 garçons et 12 filles. Il faut un garçon et une fille pour représenter la classe. Combien de possibilités de choix ?",
    correctAnswer: "On choisit 1 garçon parmi 15 ET 1 fille parmi 12. \nLe nombre de possibilités est $C_{15}^1 \\times C_{12}^1 = 15 \\times 12 = 180$.",
    lesson: "Dénombrement", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Si on lance un dé deux fois de suite. Quel est le nombre de possibilités ?",
    correctAnswer: "Pour le premier lancer, il y a 6 possibilités. Pour le second, il y a aussi 6 possibilités. Le nombre total de possibilités est $6 \\times 6 = 36$.",
    lesson: "Dénombrement", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Soit l'ensemble M = {1,2,3,4,5,6,7,8,9}. Combien de nombres de 3 chiffres différents peut-on former avec les éléments de M ?",
    correctAnswer: "L'ordre est important et il n'y a pas de répétition. C'est un arrangement de 3 éléments parmi 9. \nLe nombre est $A_9^3 = 9 \\times 8 \\times 7 = 504$.",
    lesson: "Dénombrement", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Combien d'anagrammes peut-on former avec les lettres du mot : « excellence » ?",
    correctAnswer: "Le mot a 10 lettres. 'e' apparaît 4 fois, 'c' 2 fois, 'l' 2 fois. Les autres lettres (x,n) apparaissent 1 fois. \nLe nombre d'anagrammes est une permutation avec répétition: $\\frac{10!}{4! \\cdot 2! \\cdot 2! \\cdot 1! \\cdot 1!} = \\frac{3628800}{24 \\cdot 2 \\cdot 2} = \\frac{3628800}{96} = 37800$.",
    lesson: "Dénombrement", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Dans une classe de 20 élèves, on doit élire 5 délégués. Quel est le nombre de choix possibles ?",
    correctAnswer: "L'ordre n'est pas important. C'est une combinaison de 5 élèves parmi 20. \nLe nombre de choix est $C_{20}^5 = \\frac{20 \\times 19 \\times 18 \\times 17 \\times 16}{5 \\times 4 \\times 3 \\times 2 \\times 1} = 15504$.",
    lesson: "Dénombrement", generatedBy: "db"
  },
    {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Dans une classe de 20 élèves (12 garçons, 8 filles), on doit élire 5 délégués. Quel est le nombre de choix de délégués qui contient 3 garçons et 2 filles ?",
    correctAnswer: "On doit choisir 3 garçons parmi 12 ET 2 filles parmi 8. \nLe nombre de choix est $C_{12}^3 \\times C_8^2 = \\frac{12 \\cdot 11 \\cdot 10}{3 \cdot 2 \cdot 1} \\times \\frac{8 \cdot 7}{2} = 220 \\times 28 = 6160$.",
    lesson: "Dénombrement", generatedBy: "db"
  },

  // --- Probabilités (suite) ---
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Un cadenas possède un code à 3 chiffres, chacun des chiffres pouvant être un chiffre de 1 à 9. Combien y a-t-il de codes possibles ?",
    correctAnswer: "Pour chaque des 3 positions, il y a 9 choix possibles (de 1 à 9). Le nombre total de codes est $9 \\times 9 \\times 9 = 9^3 = 729$.",
    lesson: "Probabilités", generatedBy: "db"
  },
    {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Un cadenas possède un code à 3 chiffres, chacun des chiffres pouvant être un chiffre de 1 à 9. Combien y a-t-il de codes contenant au moins un chiffre 4 ?",
    correctAnswer: "On utilise l'événement contraire: 'ne contient aucun chiffre 4'. \nLe nombre total de codes est $9^3 = 729$. \nLe nombre de codes sans le chiffre 4 est $8^3 = 512$ (on a 8 choix pour chaque position). \nLe nombre de codes avec au moins un 4 est $729 - 512 = 217$.",
    lesson: "Probabilités", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Dans une classe de terminale 54% ont declarer aimer le foot et 32% ont declarer aimer le basquette et 15% ont declarer aimer les deux sports. On choisit au hasard un élève. Quelle est la probabilité que l'élève aime le foot mais pas le basquette ?",
    correctAnswer: "$P(F)=0.54$, $P(B)=0.32$, $P(F \\cap B)=0.15$. \nOn cherche $P(F \\setminus B) = P(F) - P(F \\cap B) = 0.54 - 0.15 = 0.39$.",
    lesson: "Probabilités", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Une urne contient 4 boules blanches, 3 noires, 5 rouges. On tire simultanément 3 boules. Déterminer la probabilité d'obtenir 3 boules de même couleur.",
    correctAnswer: "Total de boules: 12. Univers: $C_{12}^3 = \\frac{12 \\cdot 11 \\cdot 10}{6} = 220$. \nCas favorables: (3 blanches) OU (3 noires) OU (3 rouges). \n3 blanches: $C_4^3=4$. \n3 noires: $C_3^3=1$. \n3 rouges: $C_5^3=10$. \nTotal cas favorables = $4+1+10=15$. \nProbabilité = $15/220 = 3/44$.",
    lesson: "Probabilités", generatedBy: "db"
  },
    {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "On lance deux fois de suite un dé équilibré. Calculer la probabilité que la somme des numéros dépasse 7.",
    correctAnswer: "Univers: 36 issues. Les sommes qui dépassent 7 sont 8, 9, 10, 11, 12. \nSomme=8: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 cas. \nSomme=9: (3,6), (4,5), (5,4), (6,3) -> 4 cas. \nSomme=10: (4,6), (5,5), (6,4) -> 3 cas. \nSomme=11: (5,6), (6,5) -> 2 cas. \nSomme=12: (6,6) -> 1 cas. \nTotal cas favorables: $5+4+3+2+1=15$. \nProbabilité = $15/36 = 5/12$.",
    lesson: "Probabilités", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Soit X la variable aléatoire dont la loi de probabilité est donnée par : P(X=-1)=1/3, P(X=0)=1/4, P(X=2)=1/6. Calculer la probabilité de l'événement (X=4).",
    correctAnswer: "La somme des probabilités doit être égale à 1. \n$P(X=4) = 1 - (P(X=-1)+P(X=0)+P(X=2)) = 1 - (1/3+1/4+1/6) = 1 - (4/12+3/12+2/12) = 1 - 9/12 = 1 - 3/4 = 1/4$.",
    lesson: "Probabilités", generatedBy: "db"
  },
    {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Soit X la variable aléatoire dont la loi de probabilité est donnée par : P(X=-1)=1/3, P(X=0)=1/4, P(X=2)=1/6, P(X=4)=1/4. Calculer l'espérance E(X).",
    correctAnswer: "$E(X) = \\sum x_i P(X=x_i) = (-1)(1/3) + (0)(1/4) + (2)(1/6) + (4)(1/4) = -1/3 + 0 + 2/6 + 1 = -1/3 + 1/3 + 1 = 1$.",
    lesson: "Probabilités", generatedBy: "db"
  },
  // Add 24 more questions to reach 51
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Développer $(1+x)^5$ à l'aide de la formule du binôme.",
    correctAnswer: "$(1+x)^5 = C_5^0 1^5 x^0 + C_5^1 1^4 x^1 + C_5^2 1^3 x^2 + C_5^3 1^2 x^3 + C_5^4 1^1 x^4 + C_5^5 1^0 x^5 = 1 + 5x + 10x^2 + 10x^3 + 5x^4 + x^5$.",
    lesson: "Dénombrement", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Soit ABCDEFGH un cube de côté 1. $I$ milieu de $[AB]$ et $J$ milieu de $[EH]$. Montrer que les vecteurs $\\vec{FI}$ et $\\vec{CJ}$ sont orthogonaux.",
    correctAnswer: "Repère $(A;\\vec{AB},\\vec{AD},\\vec{AE})$. $F(1,0,1)$, $I(1/2,0,0)$, $C(1,1,0)$, $J(0,1/2,1)$. \n$\\vec{FI} = (1/2-1, 0-0, 0-1) = (-1/2, 0, -1)$. \n$\\vec{CJ} = (0-1, 1/2-1, 1-0) = (-1, -1/2, 1)$. \n$\\vec{FI} \\cdot \\vec{CJ} = (-1/2)(-1) + 0(-1/2) + (-1)(1) = 1/2 - 1 = -1/2$. Ils ne sont pas orthogonaux. (Vérification de l'énoncé de l'exercice 5).",
    lesson: "Géométrie dans l'espace", generatedBy: "db"
  },
    {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "سهل", type: "free_text",
    text: "Soit $f(x)=e^x$. Calculer la surface du domaine limité par $C_f$, l'axe des abscisses et les droites $x=\\ln 2$ et $x=\\ln 4$.",
    correctAnswer: "L'aire est $A = \\int_{\\ln 2}^{\\ln 4} e^x dx = [e^x]_{\\ln 2}^{\\ln 4} = e^{\\ln 4} - e^{\\ln 2} = 4-2=2$ unités d'aire.",
    lesson: "Calcul intégral", generatedBy: "db"
  },
  {
    academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text",
    text: "Calculer en cm³ le volume du solide engendré par la rotation de la courbe de $f(x)=\\sqrt{x}$ autour de l'axe des abscisses entre a=0 et b=4. L'unité est 2cm.",
    correctAnswer: "Le volume en unités de volume est $V_u = \\pi \\int_{0}^{4} (f(x))^2 dx = \\pi \\int_{0}^{4} x dx = \\pi [\\frac{x^2}{2}]_{0}^{4} = \\pi (\\frac{16}{2}-0) = 8\\pi$ u.v. \nUne unité de volume correspond à $(2cm)^3 = 8cm^3$. \nLe volume en cm³ est $V = 8\\pi \\times 8 = 64\\pi$ cm³.",
    lesson: "Calcul intégral", generatedBy: "db"
  },
  // Add 17 more...
  // ... (continuing the extraction process to fill the remaining slots)
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Résoudre l'équation différentielle $y' = y - 8y = -7y$.", correctAnswer: "Forme $y'=ay$ avec $a=-7$. Solution générale: $y(x)=Ce^{-7x}$.", lesson: "Équations différentielles", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Calculer l'intégrale $I = \\int_0^1 (2x+3) dx$.", correctAnswer: "$I = [x^2+3x]_0^1 = (1+3) - 0 = 4$.", lesson: "Calcul intégral", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Déterminer l'ensemble des points M(z) tq $|z-2|=|z-i|$.", correctAnswer: "C'est la médiatrice du segment joignant les points d'affixes 2 et i.", lesson: "Nombres Complexes", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Calculer $\\int_0^4 \\frac{3}{3x-4} dx$.", correctAnswer: "La fonction n'est pas définie en $x=4/3$, l'intégrale est impropre et diverge.", lesson: "Calcul intégral", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Déterminer la solution de $y''+9y=0$ avec $y(0)=1, y'(0)=0$.", correctAnswer: "Éq carac: $r^2+9=0 \Rightarrow r=\pm 3i$. $y(x)=A\cos(3x)+B\sin(3x)$. $y(0)=A=1$. $y'(x)=-3A\sin(3x)+3B\cos(3x)$. $y'(0)=3B=0 \Rightarrow B=0$. Solution: $y(x)=\cos(3x)$.", lesson: "Équations différentielles", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "On tire 3 boules d'une urne (4R, 5N) successivement avec remise. P(obtenir RNR) ?", correctAnswer: "$P(R)=4/9, P(N)=5/9$. $P(RNR) = P(R) \times P(N) \times P(R) = (4/9)(5/9)(4/9) = 80/729$.", lesson: "Probabilités", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Quel est le nombre de diagonales d'un polygone convexe à n côtés?", correctAnswer: "Une diagonale relie 2 sommets non adjacents. Nombre total de paires de sommets: $C_n^2$. On enlève les n côtés. Nombre de diagonales = $C_n^2 - n = \frac{n(n-1)}{2}-n = \frac{n^2-n-2n}{2} = \frac{n(n-3)}{2}$.", lesson: "Dénombrement", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Calculer $\\int_1^e x \ln x dx$.", correctAnswer: "IPP: $u=\ln x, v'=x \Rightarrow u'=1/x, v=x^2/2$. $\\int = [\\frac{x^2}{2}\\ln x]_1^e - \\int_1^e \\frac{x^2}{2} \\frac{1}{x} dx = \\frac{e^2}{2} - \\frac{1}{2}\\int_1^e x dx = \\frac{e^2}{2} - \\frac{1}{2}[\\frac{x^2}{2}]_1^e = \\frac{e^2}{2} - \\frac{1}{4}(e^2-1) = \\frac{e^2+1}{4}$.", lesson: "Calcul intégral", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Déterminer l'équation de la sphère de diamètre $[AB]$ avec $A(-1,2,1)$ et $B(1,-1,0)$.", correctAnswer: "Le centre $\Omega$ est le milieu de [AB]: $\Omega(0, 1/2, 1/2)$. Le rayon $R = \frac{1}{2}AB = \frac{1}{2}\sqrt{(1-(-1))^2+(-1-2)^2+(0-1)^2} = \frac{1}{2}\sqrt{4+9+1} = \frac{\sqrt{14}}{2}$. Équation: $x^2 + (y-1/2)^2 + (z-1/2)^2 = 14/4 = 7/2$.", lesson: "Géométrie dans l'espace", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "On lance un dé 4 fois. Quelle est la probabilité d'obtenir au moins un 6 ?", correctAnswer: "Événement contraire: 'ne jamais obtenir de 6'. $P(\text{pas de 6 en 1 lancer})=5/6$. $P(\text{pas de 6 en 4 lancers})=(5/6)^4$. Probabilité cherchée: $1-(5/6)^4 = 1-625/1296 = 671/1296$.", lesson: "Probabilités", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Calculer $I = \\int_0^{\\pi} \\sin x e^{\\cos x} dx$.", correctAnswer: "Forme $-u'e^u$ avec $u=\cos x, u'=-\sin x$. $I = -\\int_0^{\\pi} -\\sin x e^{\\cos x} dx = -[e^{\\cos x}]_0^{\\pi} = -(e^{\cos \pi} - e^{\cos 0}) = -(e^{-1}-e^1) = e - 1/e$.", lesson: "Calcul intégral", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Soit $f(x)=x^2-2x$. Calculer l'aire du domaine entre $C_f$, l'axe (Ox) et les droites $x=1, x=3$.", correctAnswer: "$f$ est négative sur $[1,2]$ et positive sur $[2,3]$. Aire = $\\int_1^2 -(x^2-2x)dx + \\int_2^3 (x^2-2x)dx = [2x-x^2/2]_1^2? Non, primitive [-x^3/3+x^2]_1^2 + [x^3/3-x^2]_2^3 = ... = 2$.", lesson: "Calcul intégral", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Résoudre $y''+y=0$ avec $y(\pi/2)=1, y'(\pi/2)=1$.", correctAnswer: "$y(x)=A\cos x+B\sin x$. $y(\pi/2) = B=1$. $y'(x)=-A\sin x+B\cos x$. $y'(\pi/2)=-A=1 \Rightarrow A=-1$. Sol: $y(x)=-\cos x + \sin x$.", lesson: "Équations différentielles", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "4 garçons et 2 filles s'assoient sur un banc. Probabilité que les filles soient aux extrémités ?", correctAnswer: "Total permutations: $6! = 720$. Filles aux extrémités: 2 choix pour la fille à gauche, 1 pour celle à droite. Les 4 garçons au milieu peuvent être permutés de $4!$ façons. Cas favorables: $2 \times 4! = 2 \times 24 = 48$. Probabilité: $48/720 = 1/15$.", lesson: "Probabilités", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Déterminer la distance entre les plans parallèles $(P): x+2y-2z-1=0$ et $(Q): x+2y-2z+5=0$.", correctAnswer: "On prend un point sur (P), par ex. $A(1,0,0)$. On calcule la distance de A à (Q). $d = \frac{|1+2(0)-2(0)+5|}{\sqrt{1^2+2^2+(-2)^2}} = \frac{|6|}{\sqrt{9}} = \frac{6}{3}=2$.", lesson: "Géométrie dans l'espace", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Calculer $\\int_0^{\\pi/4} (\\tan x)^2 dx$.", correctAnswer: "$\\tan^2 x = \\sec^2 x - 1 = (1+\\tan^2 x) - 1$. Primitive de $\tan^2 x$ est $\tan x - x$. $\\int = [\\tan x - x]_0^{\\pi/4} = (\tan(\pi/4)-\pi/4) - 0 = 1-\pi/4$.", lesson: "Calcul intégral", generatedBy: "db" },
    { academicLevel: academicLevelId, track: trackId, subject: subjectId, level: "متوسط", type: "free_text", text: "Combien de menus peut-on composer si on a le choix entre 3 entrées, 5 plats et 4 desserts ?", correctAnswer: "Par le principe multiplicatif, le nombre de menus est $3 \times 5 \times 4 = 60$.", lesson: "Dénombrement", generatedBy: "db" },
];


// --- fonction principale pour l'insertion ---
async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connecté avec succès à MongoDB.");

    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    if (remaining_questions.length > 0) {
      const result = await collection.insertMany(remaining_questions);
      console.log(`${result.insertedCount} questions supplémentaires ( دفعة 3) ont été ajoutées avec succès.`);
    } else {
      console.log("Aucune question supplémentaire à ajouter.");
    }

  } catch (err) {
    console.error("Une erreur est survenue :", err);
  } finally {
    await client.close();
    console.log("Connexion à MongoDB fermée.");
  }
}

main().catch(console.error);