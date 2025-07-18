const { MongoClient, ObjectId } = require('mongodb');

// --- بيانات الاتصال بقاعدة البيانات ---
const uri = "mongodb+srv://majoriyad:ohX8v7WGQEfI56GR@cluster0.bpqezif.mongodb.net/";
const dbName = 'test'; // اسم قاعدة البيانات
const collectionName = 'questions'; // اسم الكولكشن

// --- البيانات الثابتة لكل سؤال ---
const commonData = {
    academicLevel: new ObjectId('6856e58a42d2333b081f4379'),
    track: new ObjectId('6856e5e642d2333b081f43a0'),
    subject: new ObjectId('6856e76a42d2333b081f4437'),
    type: "mcq",
    generatedBy: "AI-assisted DB Seeder",
    createdAt: new Date(),
    updatedAt: new Date()
};

// --- قائمة الأسئلة الكاملة ---
const questions = [
    // ====================================================================
    // Part 21: Type de question (Dérivées successives, Concours Blanc)
    // ====================================================================
    {
        lesson: "Dérivées successives",
        level: "متوسط",
        text: "Q200. Soit $f(x) = x^2e^x$. Quelle est la bonne réponse ?",
        options: [
            "Pour $n \\in \\mathbb{N}; f^{(n)}(x) = (x^2 + 2nx + n^2 - n)e^x$",
            "Pour $n \\in \\mathbb{N}; f^{(n)}(x) = (x^2 - 2nx + n^2 - n)e^x$",
            "Pour $n \\in \\mathbb{N}; f^{(n)}(x) = (x^2 + 2nx + n(n-1))e^x$",
            "Pour $n \\in \\mathbb{N}; f^{(n)}(x) = (x^2 + 2nx + n^2 + n)e^x$"
        ],
        correctAnswer: "Pour $n \\in \\mathbb{N}; f^{(n)}(x) = (x^2 + 2nx + n(n-1))e^x$"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q201. L'entier $\\alpha$ pour lequel la limite $\\lim_{x \\to 0} \\frac{(\\cos(x)-1)(\\cos(x)-e^x)}{x^\\alpha}$ est finie et non nulle est égale à :",
        options: ["1", "2", "3", "4"],
        correctAnswer: "3"
    },
    {
        lesson: "Concours Blanc",
        level: "صعب",
        text: "Q202. Soit f et g deux fonctions de classe $C^1$ de $\\mathbb{R}^+$ dans $\\mathbb{R}^+$. Alors $\\int_a^b \\frac{f(x)g'(x)-f'(x)}{f(x)+e^{g(x)}} dx$ est égale à :",
        options: [
            "$\\ln(\\frac{e^{-g(b)}f(b)+1}{e^{-g(a)}f(a)+1})$",
            "$\\ln(\\frac{e^{-g(a)}f(b)+1}{e^{-g(a)}f(a)+1})$",
            "$\\ln(\\frac{e^{-g(b)}f(a)+1}{e^{-g(a)}f(b)+1})$",
            "$\\ln(\\frac{e^{-g(b)}f(a)}{e^{-g(a)}f(b)+1})$"
        ],
        correctAnswer: "Question incalculable ou erronée"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q203. Soit $f: [0;1] \\to \\mathbb{R}$ une fonction continue telle que $\\int_0^\\pi f(\\sin(x))dx = 2024$. Alors $\\int_0^\\pi x f(\\sin(x))dx$ est égale :",
        options: ["1012", "2024$\\pi$", "1012$\\pi$", "1010$\\pi$"],
        correctAnswer: "1012$\\pi$"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q205. Soit f la fonction définie sur $\\mathbb{R}$ par $f(x)=(x-1)(x-2)...(x-2022)$. Le nombre dérivé $f'(2022)$ est égal à :",
        options: ["2022!", "2021!", "2022", "2021"],
        correctAnswer: "2021!"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q206. On considère la somme $S=\\sqrt{3}+\\sqrt{75}+\\sqrt{243}+\\dots$ (n termes). Si S est égale à $435\\sqrt{3}$, alors n est égale à ($\\sqrt{3481}=59$) :",
        options: ["14", "15", "12", "21"],
        correctAnswer: "15"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q207. Soit ABC un triangle rectangle en B tel que AB=8 et BC=6. On place M sur [AB], R sur [BC] et N sur [AC] de sorte que MNRB soit un rectangle. Quelle est la position du point R (d'abscisse a sur BC) pour que l'aire de ce rectangle soit maximale ?",
        options: ["a=3", "a=7", "a=8", "a=12"],
        correctAnswer: "a=3"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q208. Soit $(F_n)$ une suite définie par $(\\forall n \\in \\mathbb{N}): F_{n+1} = 2F_n^2 + \\frac{1}{8}$ et $F_0=0$. Alors la limite de la suite $F_n$ est :",
        options: ["$8^{-1}$", "$2^{-1}$", "1/4", "8"],
        correctAnswer: "1/4"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q209. Soit la suite $(P_n)$ une suite arithmétique telle que $P_2+P_3+P_4=21$ et $P_6=25$. Alors le premier terme $P_0$ est égal à :",
        options: ["6", "-52", "-36", "-6"],
        correctAnswer: "-11"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q210. La valeur de la limite $\\lim_{x \\to +\\infty} \\sqrt[2022]{x^{2022}-x^2+2024}-x$ est égale à :",
        options: ["0", "1", "2024", "+∞"],
        correctAnswer: "0"
    },
    {
        lesson: "Concours Blanc",
        level: "صعب",
        text: "Q212. La valeur de la limite $\\lim_{x \\to a} \\frac{e^{x\\ln(a)}-e^{a\\ln(x)}}{x^2-a^2}$ ; $(a \\in \\mathbb{R}_+^*)$ est égale à :",
        options: ["$\\frac{e^a}{2a}(\\ln(a)+1)$", "$\\frac{e^a}{2a}(\\ln(a)-1)$", "$\\frac{a^a}{2a}(1-\\ln(a))$", "$\\frac{a^a}{2a}(\\ln(a)-\\frac{1}{a})$"],
        correctAnswer: "$\\frac{a^a}{2a}(1-\\ln(a))$"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q213. Soit $f:x \\to e^{-x}\\cos(x)$ définie sur $I=[0,2\\pi]$. Pour tous $x \\in I$, $f''(x)+2f'(x)+2f(x)$ est égale à :",
        options: ["1", "$2e^{-x}\\cos(x)$", "$e^{-x}\\cos(x)$", "0"],
        correctAnswer: "0"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q214. L'intégrale $\\int_{e^2}^{e^3} \\frac{\\ln(x)-1}{x\\ln(x)} dx$ est égale à :",
        options: ["$1-\\ln3+\\ln2$", "$-1+\\ln3+\\ln2$", "$-1-\\ln3+\\ln2$", "$1-\\ln3-\\ln2$"],
        correctAnswer: "$1-\\ln(3/2)$"
    },
    {
        lesson: "Concours Blanc",
        level: "متوسط",
        text: "Q215. Soit la fonction f définie par $f(x) = \\begin{cases} x^{2024}+x^{2023}+...+x^3\\cos(\\frac{1}{x}) & \\text{si } x \\ne 0 \\\\ 0 & \\text{si } x=0 \\end{cases}$. Alors la valeur de $f'(0)$ est :",
        options: ["0", "1", "2", "2023!"],
        correctAnswer: "0"
    },

    // ====================================================================
    // Part 22: Nombres complexes
    // ====================================================================
    {
        lesson: "Nombres complexes",
        level: "سهل",
        text: "Q216. Soit $z = 1+\\cos(4a)+i\\sin(4a)$ avec $a \\in [0, \\pi/4[$. Le module et l'argument de z sont :",
        options: [
            "$|z|=2\\cos(a); arg(z)=a[2\\pi]$",
            "$|z|=2\\cos(2a); arg(z)=2a[2\\pi]$",
            "$|z|=2\\cos(a); arg(z)=2a[2\\pi]$",
            "$|z|=2\\cos(2a); arg(z)=a[2\\pi]$"
        ],
        correctAnswer: "$|z|=2\\cos(2a); arg(z)=2a[2\\pi]$"
    },
    {
        lesson: "Nombres complexes",
        level: "سهل",
        text: "Q217. Soit $z \\in \\mathbb{C}-\\{0\\}$ avec $|z|=\\sqrt{2023}$. La valeur de $A = |z+\\frac{1}{z}|$ est :",
        options: ["1", "$\\frac{2023}{\\sqrt{2023}}$", "$\\frac{2024}{\\sqrt{2023}}$", "$\\sqrt{2023}$"],
        correctAnswer: "Question incalculable ou erronée"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q218. Soit $z \\in \\mathbb{C}-\\{0\\}$ avec tel que $arg(\\frac{z^4}{2024i})=0[2\\pi]$. Alors l'argument de z est égal à :",
        options: ["$\\pi/8 [2\\pi]$", "$\\pi/4 [2\\pi]$", "$\\pi/8 [\\pi/2]$", "$\\pi/2 [\\pi]$"],
        correctAnswer: "$\\pi/8 [\\pi/2]$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q219. Soit $z = \\sqrt{2+\\sqrt{3}} - i\\sqrt{2-\\sqrt{3}}$. La forme exponentielle de z est :",
        options: ["$z=2e^{i5\\pi/12}$", "$z=2e^{-i5\\pi/12}$", "$z=2e^{-i\\pi/12}$", "$z=2e^{i\\pi/12}$"],
        correctAnswer: "$z=2e^{-i\\pi/12}$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q220. Soit $(z_1, z_2 \\in \\mathbb{C})$ tel que $|z_1|=|z_2|=1$ et $|z_1-z_2|=1$. Alors $|z_1+z_2|$ est :",
        options: ["0", "1", "$\\sqrt{3}$", "$\\sqrt{2}$"],
        correctAnswer: "$\\sqrt{3}$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q221. Si z est un nombre complexe tel que: $arg(z+1+\\frac{2\\sqrt{3}}{3}i)=\\frac{\\pi}{3}[2\\pi]$ et $arg(z-1+\\frac{2\\sqrt{3}}{3}i)=\\frac{2\\pi}{3}[2\\pi]$. Alors z est égal à :",
        options: ["$\\sqrt{3}i$", "0", "$2\\sqrt{3}$", "$\\frac{\\sqrt{3}}{3}i$"],
        correctAnswer: "0"
    },
    {
        lesson: "Nombres complexes",
        level: "سهل",
        text: "Q222. Dans le plan complexe, l'ensemble des points M(z) vérifiant $|z-1|=|\\bar{z}+1|$ est la droite d'équation :",
        options: ["x=0", "x=1", "y=x", "y=0"],
        correctAnswer: "x=0"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q223. Soit z un nombre complexe tel que $|z|=4$ et $|z+2i|=5$. Alors la valeur de $|z-2i|$ est :",
        options: ["2", "1", "$\\sqrt{15}$", "$\\sqrt{2}$"],
        correctAnswer: "$\\sqrt{15}$"
    },
    {
        lesson: "Nombres complexes",
        level: "صعب",
        text: "Q224. Le plan complexe est rapporté à un repère. Soient $z_1, z_2$ les solutions de $z^2 - \\frac{1+\\sqrt{3}}{2}\\sin(2\\alpha) + e^{i2\\alpha\\sin^2(\\alpha)}=0$. La valeur de $\\alpha \\in ]0; \\pi/2[$ pour laquelle O, M($z_1$), M($z_2$) sont les sommets d'un triangle équilatéral est :",
        options: ["$\\pi/2$", "$\\pi/3$", "$\\pi/12$", "$\\pi/4$"],
        correctAnswer: "Question incalculable ou erronée"
    },
    {
        lesson: "Nombres complexes",
        level: "صعب",
        text: "Q225. Soit $z_{BC} = \\frac{z_C-z_B}{z_A-z_B} = \\frac{(\\psi^2-4\\psi-2021)+i(4\\psi^2-2020)}{(2-\\psi)^{2024}+(\\psi-2021)^{2024}}$. Les valeurs de $\\psi$ pour que A, B, C soient alignés :",
        options: ["$\\psi \\in \\{\\sqrt{505}, -\\sqrt{505}\\}$", "$\\psi \\in \\{\\sqrt{505}, -\\sqrt{505}, 2\\}$", "$\\psi \\in \\{505, -505\\}$", "$\\psi \\in \\{505, -500, 2\\}$"],
        correctAnswer: "$\\psi = \\pm\\sqrt{505}$"
    },
    {
        lesson: "Nombres complexes",
        level: "سهل",
        text: "Q226. L'ensemble des solutions complexes de l'équation $\\frac{z-2}{z-1}=z$ est :",
        options: ["$S=\\{1-i, 1+i\\}$", "$S=\\{-1-i, 1+i\\}$", "$S=\\{i, -i\\}$", "$S=\\{1-2i, 1+i\\}$"],
        correctAnswer: "$S=\\{i, -i\\}$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q227. On considère l'équation $(A): z^2-z-1=0$. Soient $z_1, z_2$ les solutions. Alors la valeur de $\\phi = (\\frac{z_1z_2+2022i}{z_1+z_2+2022i})^{2022}$ est :",
        options: ["2022i", "1", "-i", "i"],
        correctAnswer: "1"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q228. Soit z un nombre complexe tel que $z+|z|=8+12i$. Alors la valeur de $|z^2|$ est :",
        options: ["130", "170", "169", "1"],
        correctAnswer: "169"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q229. Dans C, l'ensemble des solutions de l'équation $z-2\\bar{z}+|z|=4(7+3i)$ est :",
        options: [
            "$S=\\{-3+3i, -4+3i\\}$",
            "$S=\\{-3+3i, 4+3i\\}$",
            "$S=\\{3+3i, -4+3i\\}$",
            "$S=\\{12-4i, -\\frac{44}{3}-4i\\}$"
        ],
        correctAnswer: "$S=\\{12-4i, -\\frac{44}{3}-4i\\}$"
    },
    {
        lesson: "Nombres complexes",
        level: "سهل",
        text: "Q230. Soit z un nombre complexe tel que $|z|=2$ et $arg(iz)=\\frac{\\pi}{4}[2\\pi]$. Alors la valeur de z est :",
        options: ["$\\sqrt{2}+i\\sqrt{2}$", "$\\sqrt{2}-i\\sqrt{2}$", "$-\\sqrt{2}+i\\sqrt{2}$", "$-\\sqrt{2}-i\\sqrt{2}$"],
        correctAnswer: "$\\sqrt{2}-i\\sqrt{2}$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q231. La forme algébrique de $z=(1-e^{i\\pi/4})(1+e^{-i\\pi/4})$ est :",
        options: ["$1-i$", "-3+6i", "$2-3i$", "$-1+i\\sqrt{2}$"],
        correctAnswer: "$-1+i\\sqrt{2}$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q232. Soit $z=e^{e^{iq}+1}$ ($q \\in \\mathbb{R}$). Alors le module et l'argument de z sont :",
        options: [
            "$|z|=e^{\\cos(q)}; arg(z)=\\sin(q)[2\\pi]$",
            "$|z|=e^{\\cos(q)}; arg(z)=q[2\\pi]$",
            "$|z|=e^{1+\\cos(q)}; arg(z)=\\sin(q)[2\\pi]$",
            "$|z|=e^{e^{\\cos(q)}}; arg(z)=\\sin(q)[\\pi]$"
        ],
        correctAnswer: "$|z|=e^{\\cos(q)}; arg(z)=\\sin(q)[2\\pi]$"
    },
    {
        lesson: "Nombres complexes",
        level: "صعب",
        text: "Q233. Soit $z_1, z_2$ deux nombres complexes. Alors $|z_1+z_2|^2 - 2(|z_1|+|z_2|)$ est :",
        options: ["$-|z_1-z_2|$", "$|z_1-z_2|$", "$2|z_1-z_2|$", "Question incalculable ou erronée"],
        correctAnswer: "Question incalculable ou erronée"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q234. Soit $x \\in \\mathbb{R} - \\{2k\\pi, k \\in \\mathbb{Z}\\}$. $S_n = \\sum_{k=0}^n \\cos(kx)$ est :",
        options: [
            "$S_n = \\frac{\\cos(\\frac{nx}{2})\\sin(\\frac{(n+1)x}{2})}{\\sin(\\frac{x}{2})}$",
            "$S_n = \\frac{\\cos(\\frac{(n)x}{4})\\sin(\\frac{(n-1)x}{2})}{\\sin(\\frac{x}{2})}$",
            "$S_n = \\frac{\\sin(\\frac{nx}{2})\\sin(\\frac{(n+1)x}{2})}{\\sin(\\frac{x}{2})}$",
            "$S_n = \\frac{\\cos(\\frac{(n+1)x}{2})\\sin(\\frac{nx}{2})}{\\cos(\\frac{x}{2})}$"
        ],
        correctAnswer: "$S_n = \\frac{\\cos(\\frac{nx}{2})\\sin(\\frac{(n+1)x}{2})}{\\sin(\\frac{x}{2})}$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q235. Dans l'ensemble C, si $z\\sqrt{z}=2024\\sqrt{2024}$, alors la valeur de $|(1+i)z|$ est :",
        options: ["$2024i\\sqrt{2}$", "$2024\\sqrt{2}$", "$-2024i\\sqrt{2}$", "$2022\\sqrt{2}$"],
        correctAnswer: "$2024\\sqrt{2}$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q236. Dans le plan complexe, soit A d'affixe i. On considère $\\psi$ qui associe à M(z) (z!=i) le point M'(z') tel que $z'=\\frac{i}{2022(z-i)}$. L'image par $\\psi$ du cercle (C) de centre A et de rayon 1 est :",
        options: ["Le cercle de centre O et de rayon $2021^{-1}$", "Le cercle de centre O et de rayon $1/2022$", "Le cercle de centre A et de rayon 1", "Le cercle de centre A et de rayon $2021^{-1}$"],
        correctAnswer: "Le cercle de centre O et de rayon $1/2022$"
    },
    {
        lesson: "Nombres complexes",
        level: "سهل",
        text: "Q237. L'affixe de M le centre du cercle circonscrit au triangle OAB avec $z_A=2022$ et $z_B=2024i$ :",
        options: ["2022", "1012i", "1011+1012i", "1012+1011i"],
        correctAnswer: "1011+1012i"
    },
    {
        lesson: "Nombres complexes",
        level: "صعب",
        text: "Q238. Soit $z=x+iy$ ($x,y \\in \\mathbb{R}_+^*$). On pose $\\frac{1}{2}(z+\\bar{z})=x(1+z)$. Alors la valeur de $|z|$ est :",
        options: ["1", "2", "$\\sqrt{2}$", "$2\\sqrt{2}$"],
        correctAnswer: "Question incalculable ou erronée"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q239. Dans l'ensemble C, si $|z|+2z=11-8i$ alors la valeur de $|z|$ est :",
        options: ["2", "3", "5", "4"],
        correctAnswer: "5"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q240. Soit $z \\in \\mathbb{C}$ avec $|z|=1$. On pose $P_z=|\\sqrt{2022}+z|^2+|\\sqrt{2022}-z|^2$. Alors la valeur de $P_z$ est :",
        options: ["4044", "4048", "4046", "$\\sqrt{2022}$"],
        correctAnswer: "4046"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q241. Soit $z=2+\\sqrt{3}+i$. Alors l'argument de z est :",
        options: ["$\\pi/12 [2\\pi]$", "$5\\pi/12 [2\\pi]$", "$-5\\pi/12 [2\\pi]$", "$\\pi/6 [2\\pi]$"],
        correctAnswer: "$\\pi/12 [2\\pi]$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q242. On considère dans C l'application f définie par $f(z)=z^2+z^3$ et $z=e^{ia}$ avec $0 \\le a \\le \\pi$. L'expression de $f(z)$ est :",
        options: [
            "$2\\cos(\\frac{a}{2})e^{i\\frac{5a}{2}}$",
            "$2\\cos(\\frac{5a}{2})e^{i\\frac{a}{2}}$",
            "$2\\cos(\\frac{a}{2})e^{i\\frac{3a}{2}}$",
            "$2\\cos(\\frac{a}{2})e^{i\\frac{a}{2}}$"
        ],
        correctAnswer: "$2\\cos(\\frac{a}{2})e^{i\\frac{3a}{2}}$"
    },
    {
        lesson: "Nombres complexes",
        level: "سهل",
        text: "Q243. On considère dans C l'application $G(z)=\\frac{1-z^2}{1-z}$ et $z=e^{ia}$ avec $0 < a < \\pi$. L'expression de $|G(z)|$ est :",
        options: ["$2\\cos(a/2)$", "$2\\sin(a/2)$", "$|1+e^{ia}|$", "1"],
        correctAnswer: "$|1+e^{ia}|$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q244. On pose $z=e^{ia}$. La valeur de $1+z+z^2$ est :",
        options: [
            "$\\frac{\\sin(3a/2)}{\\sin(a/2)}e^{ia}$",
            "$\\frac{\\cos(3a/2)}{\\cos(a/2)}e^{ia}$",
            "$\\frac{\\sin(3a/2)}{\\sin(a/2)}e^{ia}$",
            "$\\frac{\\sin(3a)}{\\sin(a/2)}e^{2ia}$"
        ],
        correctAnswer: "$\\frac{\\sin(3a/2)}{\\sin(a/2)}e^{ia}$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q245. La forme exponentielle du nombre complexe $z=1+e^{i8\\pi/7}$ est :",
        options: [
            "$z=2\\cos(\\frac{4\\pi}{7})e^{i\\frac{4\\pi}{7}}$",
            "$z=2\\cos(\\frac{11\\pi}{7})e^{i\\frac{11\\pi}{7}}$",
            "$z=2\\cos(\\frac{4\\pi}{11})e^{i\\frac{4\\pi}{11}}$",
            "$z=2\\cos(\\frac{11\\pi}{7})e^{i\\frac{4\\pi}{7}}$"
        ],
        correctAnswer: "$z=2\\cos(\\frac{4\\pi}{7})e^{i\\frac{4\\pi}{7}}$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q246. La forme exponentielle du nombre complexe $P_z=1+i(1+\\sqrt{2})$ est :",
        options: [
            "$z=2\\sqrt{2}\\cos(\\frac{\\pi}{8})e^{i\\frac{3\\pi}{8}}$",
            "$z=2\\sqrt{2}\\cos(\\frac{3\\pi}{8})e^{i\\frac{\\pi}{8}}$",
            "$z=2\\sqrt{2}\\cos(\\frac{3\\pi}{8})e^{i\\frac{3\\pi}{8}}$",
            "$z=2\\cos(\\frac{\\pi}{8})e^{i\\frac{3\\pi}{8}}$"
        ],
        correctAnswer: "Question incalculable ou erronée"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q247. Un argument du nombre complexe $z=(\\frac{1+i}{\\sqrt{3}-i})^{10}$ est :",
        options: ["$\\pi$", "$\\pi/6$", "$-5\\pi/6$", "$-5\\pi/6$"],
        correctAnswer: "$-5\\pi/6$"
    },
    {
        lesson: "Nombres complexes",
        level: "سهل",
        text: "Q248. Le module du nombre complexe $P=\\frac{2024-2023i}{2024+2023i}$. Alors la valeur de $|P|$ est :",
        options: ["i", "-1", "-i", "1"],
        correctAnswer: "1"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q249. Soit $L=(\\sin(a)+i\\cos(a))(\\cos(a)-i\\sin(a))$. La valeur de $k=Arg(L)$ est :",
        options: ["$k=(\\pi/2-a)[2\\pi]$", "$k=(\\pi/2-2a)[2\\pi]$", "$k=(\\pi/2+a)[2\\pi]$", "$k=(\\pi-a)[2\\pi]$"],
        correctAnswer: "$k=(\\pi/2-2a)[2\\pi]$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q250. On considère la suite de points $(W_n)$ d'affixe $z_n$ définie par $z_0=8$ et $z_{n+1}=\\frac{\\sqrt{2}+i\\sqrt{2}}{4}z_n$. L'expression de $z_n$ en fonction de n est :",
        options: [
            "$z_n=\\frac{1}{2^n}e^{in\\pi/4}$",
            "$z_n=\\frac{1}{2^{n-2}}e^{in3\\pi/4}$",
            "$z_n=\\frac{8}{2^n}e^{in\\pi/4}$",
            "$z_n=\\frac{1}{2^{n-1}}e^{in\\pi/4}$"
        ],
        correctAnswer: "$z_n=\\frac{8}{2^n}e^{in\\pi/4}$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q251. Le complexe est rapporté à un repère orthonormé direct. Soit z un nombre complexe et M, M' les points d'affixes respectives $z, z'=(1+\\sqrt{3}i)z+i$. Une mesure de l'angle $(\\vec{u}, \\vec{MM'})$ si z est imaginaire pur est :",
        options: ["$\\pi/3$", "$\\pi/6$", "$\\pi/2$", "$\\pi/12$"],
        correctAnswer: "$\\pi/2$"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q252. Soit $(n \\in \\mathbb{N})$ et $(L \\in \\mathbb{C})$, on pose $L=\\cos(\\frac{\\pi}{n})+i\\sin(\\frac{\\pi}{n})$. La valeur de $J=1+L+L^2+...+L^{n-1}$ est égale à :",
        options: ["$1+i$", "$1+i\\tan(\\frac{\\pi}{2n})$", "$1+i\\tan(\\frac{\\pi}{2}+\\frac{\\pi}{n})$", "$1-i$"],
        correctAnswer: "$1+i\\cot(\\frac{\\pi}{2n})$"
    },
    {
        lesson: "Nombres complexes",
        level: "سهل",
        text: "Q253. Nombre de solution de l'équation dans $\\mathbb{C}: z^3+\\bar{z}=0$ est égale à :",
        options: ["2", "3", "4", "5"],
        correctAnswer: "5"
    },
    {
        lesson: "Nombres complexes",
        level: "سهل",
        text: "Q254. Soit $(z \\in \\mathbb{C}^*): arg(z)-arg(-\\bar{z})=a[2\\pi]$. Alors la valeur de a est :",
        options: ["$\\pi$", "$\\pi/2$", "$-2\\pi$", "0"],
        correctAnswer: "0"
    },
    {
        lesson: "Nombres complexes",
        level: "متوسط",
        text: "Q255. Soit $(z \\in \\mathbb{C}^*): arg(z)=\\frac{\\pi}{4}[2\\pi]$ et $|z|=2\\sqrt{2}$. On pose $arg(8+z^3)=a[2\\pi]$. Alors la valeur de a est :",
        options: ["$a=3\\pi/2$", "$a=\\pi/4$", "$a=3\\pi/4$", "$a=7\\pi/4$"],
        correctAnswer: "$a=7\\pi/4$"
    },

    // ====================================================================
    // Part 23: l'ensemble de points
    // ====================================================================
    {
        lesson: "l'ensemble de points",
        level: "سهل",
        text: "Q256. L'ensemble de points M(z) vérifiant $\\begin{cases} arg(z)=0[2\\pi] \\\\ |z|>1 \\end{cases}$ est :",
        options: ["Demi-droite", "Cercle", "Segment", "Disque"],
        correctAnswer: "Demi-droite"
    },
    {
        lesson: "l'ensemble de points",
        level: "متوسط",
        text: "Q257. L'ensemble de points M(z) vérifiant $|\\frac{a-z}{\\bar{a}+z}|<1$ est :",
        options: ["Le demi-plan droit ouvert", "Le demi-plan droit fermé", "Médiatrice", "Cercle"],
        correctAnswer: "Le demi-plan droit ouvert"
    },
    {
        lesson: "l'ensemble de points",
        level: "متوسط",
        text: "Q258. L'ensemble de points M(z) vérifiant $\\begin{cases} arg(z)=\\pi/2 [\\pi] \\\\ |z| \\le 1 \\end{cases}$ est :",
        options: ["Segment", "Union de deux segments privés de 0", "Union de deux droites privées de 0", "Plan"],
        correctAnswer: "Union de deux segments privés de 0"
    },
    {
        lesson: "l'ensemble de points",
        level: "متوسط",
        text: "Q259. L'ensemble de points M(z) vérifiant $\\begin{cases} arg(\\frac{z-1}{z+1})=0[2\\pi] \\\\ |z|=1 \\end{cases}$ est :",
        options: ["L'ensemble vide", "Cercle", "Union de deux segments", "Point"],
        correctAnswer: "L'ensemble vide"
    },
    {
        lesson: "l'ensemble de points",
        level: "سهل",
        text: "Q260. L'ensemble de points M(z) vérifiant $|z-1|=2|z+1|$ est :",
        options: ["Cercle", "Droite", "Segment", "Médiatrice"],
        correctAnswer: "Cercle"
    },
    {
        lesson: "l'ensemble de points",
        level: "متوسط",
        text: "Q261. L'ensemble de points M(z) vérifiant $|z|=z+\\bar{z}$ est :",
        options: ["Union de demi-droite", "Droite", "Union de droite", "Cercle"],
        correctAnswer: "Question incalculable ou erronée"
    },
    {
        lesson: "l'ensemble de points",
        level: "سهل",
        text: "Q262. L'ensemble de points M(z) vérifiant $\\frac{z-a}{z-b} \\in \\mathbb{R}$ ; $z \\ne b$ est :",
        options: ["Droite", "Droite privée de B", "Droite privée de A et B", "Cercle de centre 0 et de rayon 1"],
        correctAnswer: "Droite privée de B"
    },
    {
        lesson: "l'ensemble de points",
        level: "سهل",
        text: "Q263. L'ensemble de points M(z) vérifiant $\\frac{z-a}{z-b} \\in i\\mathbb{R}$ ; $z \\ne b$ est :",
        options: ["Cercle", "Cercle privé de B", "Droite privée de 0", "Cercle privé de A et B"],
        correctAnswer: "Cercle privé de B"
    },
    {
        lesson: "l'ensemble de points",
        level: "متوسط",
        text: "Q264. L'ensemble de points M(z) vérifiant $\\begin{cases} Re(z)=n \\\\ |z-\\frac{1}{2}|=1 \\end{cases}$. Les valeurs de n pour que M(z) aient deux affixes réelles pures sont :",
        options: ["$n \\in \\{0,2\\}$", "$n \\in \\{1,2\\}$", "$n \\in \\{-1/2, 3/2\\}$", "$n \\in \\{-1,2\\}$"],
        correctAnswer: "$n \\in \\{-1/2, 3/2\\}$"
    },
    {
        lesson: "l'ensemble de points",
        level: "متوسط",
        text: "Q265. L'ensemble de points M(z) vérifiant $|\\frac{2-z}{-3iz-6i}|=\\frac{1}{3}$ est :",
        options: ["Médiatrice de segment", "Cercle", "Droite", "Médiatrice du segment [A(2), B(-2)]"],
        correctAnswer: "Médiatrice du segment [A(2), B(-2)]"
    },
    {
        lesson: "l'ensemble de points",
        level: "متوسط",
        text: "Q266. L'ensemble de points M(z) vérifiant $(1+z+z^2) \\in \\mathbb{R}$ est :",
        options: ["Demi-droite", "Droite", "Union de deux droites", "Cercle"],
        correctAnswer: "Union de l'axe réel (privé de -1/2) et de la droite x=-1/2"
    },
    {
        lesson: "l'ensemble de points",
        level: "سهل",
        text: "Q267. L'ensemble de points M(z) vérifiant $z\\bar{z}+2(z+\\bar{z})=0$ est :",
        options: ["Cercle", "Droite", "Segment", "Sphère"],
        correctAnswer: "Cercle"
    },
    {
        lesson: "l'ensemble de points",
        level: "سهل",
        text: "Q268. L'ensemble de points M(z) vérifiant $\\bar{z}=1-ke^{i\\pi/3}$; $k \\in [0;1]$ est :",
        options: ["Segment", "Droite", "Sphère", "Point"],
        correctAnswer: "Segment"
    },
    {
        lesson: "l'ensemble de points",
        level: "متوسط",
        text: "Q269. L'ensemble de points M(z) vérifiant $arg(z-2)=arg(iz-3)[2\\pi]$ est :",
        options: ["Cercle", "Demi-cercle privé de -3i et 2", "Demi-droite", "Droite"],
        correctAnswer: "Demi-cercle privé de -3i et 2"
    }
];

// --- Fonction pour insérer les données ---
async function insertQuestions() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connecté à la base de données MongoDB !");

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const questionsToInsert = questions.map(q => ({
            ...commonData,
            ...q
        }));

        const result = await collection.insertMany(questionsToInsert);
        console.log(`${result.insertedCount} questions ont été insérées avec succès.`);
        console.log("IDs des documents insérés:", result.insertedIds);

    } catch (err) {
        console.error("Une erreur est survenue lors de l'insertion des données :", err);
    } finally {
        await client.close();
        console.log("Connexion à la base de données fermée.");
    }
}

// --- Lancement du script ---
insertQuestions();