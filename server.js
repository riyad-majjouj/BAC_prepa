// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const http = require('http'); // أو https إذا كنت ستدير HTTPS بنفسك (غير محتمل مع Railway)

// استيراد المسارات
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const academicDataRoutes = require('./routes/academicDataRoutes');
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes'); // مسارات الاختبارات

// استيراد إعدادات Passport (تأكد من أن المسار صحيح)
require('./config/passport-setup')(passport);

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. إعدادات CORS ---
// قائمة النطاقات المسموح بها
const whitelist = [
    'http://localhost:8080', // للواجهة الأمامية المحلية (Vite)
    'http://localhost:3000', // للواجهة الأمامية المحلية (CRA)
    process.env.FRONTEND_URL_VERCEL, // رابط Vercel من متغيرات البيئة
    // يمكنك إضافة المزيد من النطاقات هنا إذا لزم الأمر
];

const corsOptions = {
    origin: function (origin, callback) {
        // السماح بالطلبات التي لا تحتوي على origin (مثل Postman أو تطبيقات الهاتف في التطوير)
        // أو إذا كان الـ origin موجودًا في القائمة البيضاء
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS: Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // ***** هذا مهم جدًا للسماح بالكوكيز *****
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200 // لبعض المتصفحات القديمة
};
app.use(cors(corsOptions));


// --- 2. الثقة بالبروكسي (Trust Proxy) ---
// مهم إذا كان تطبيقك يعمل خلف بروكسي عكسي (شائع في منصات الاستضافة مثل Railway)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // يثق بالبروكسي الأول (عادةً كافٍ)
    console.log("Production mode: 'trust proxy' is set.");
}

// Middleware لتحليل جسم الطلب (JSON و URL-encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 3. إعدادات الجلسة (express-session) ---
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'a very secret key for development',
    resave: false,
    saveUninitialized: false, // تعيين إلى false أفضل للأمان والامتثال لـ GDPR
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI_SESSION || process.env.MONGO_URI,
        collectionName: 'sessions', // اسم المجموعة للجلسات
        ttl: 14 * 24 * 60 * 60 // 14 يومًا (بالثواني)
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 أيام (بالمللي ثانية)
        httpOnly: true, // يمنع الوصول للكوكيز من JavaScript العميل
        // `secure` و `sameSite` يتم تعيينهما بناءً على بيئة التشغيل
        secure: process.env.NODE_ENV === 'production', // يجب أن يكون true في الإنتاج (عند استخدام HTTPS)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' للإنتاج عبر النطاقات، يتطلب secure: true
        // domain: process.env.NODE_ENV === 'production' ? '.yourbaserailwaydomain.app' : undefined, // قد تحتاج لتعديل هذا إذا كان Railway يوفر نطاقًا أساسيًا ثابتًا يمكنك استخدامه
                                                                                             // أو اتركه undefined إذا كان sameSite: 'none' كافيًا
    }
});
app.use(sessionMiddleware);

// --- 4. Middleware لمعالجة مشكلة Google OAuth redirect_uri_mismatch (إذا كنت لا تزال بحاجته) ---
// هذا يفترض أن Railway قد يضيف "www" أو يغير البروتوكول
// وأن نطاقك الأساسي الذي تم تكوينه في Google Console لا يتضمنها
const redirectToMainDomain = (req, res, next) => {
    // تأكد من أن لديك YOUR_MAIN_DOMAIN_URL معرفًا في .env
    // مثال: YOUR_MAIN_DOMAIN_URL=https://bacprepa-production.up.railway.app
    const mainDomain = process.env.YOUR_MAIN_DOMAIN_URL;
    if (process.env.NODE_ENV === 'production' && mainDomain && req.hostname !== new URL(mainDomain).hostname) {
        const targetUrl = new URL(req.originalUrl, mainDomain).toString();
        console.warn(`Redirecting from ${req.hostname} to main domain: ${targetUrl}`);
        return res.redirect(301, targetUrl);
    }
    next();
};
// استخدم هذا الـ middleware فقط إذا كنت تواجه مشكلة redirect_uri_mismatch
// وإذا كان التوجيه إلى نطاق أساسي واحد هو الحل المناسب.
// app.use(redirectToMainDomain); // قم بإلغاء التعليق إذا كنت بحاجة إليه

// إعداد Passport
app.use(passport.initialize());
app.use(passport.session());

// مسارات API
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/academic-data', academicDataRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);

// --- للإنتاج: خدمة ملفات الواجهة الأمامية المبنية ---
if (process.env.NODE_ENV === 'production') {
    // المسار إلى مجلد build الخاص بالواجهة الأمامية (React/Vite)
    // افترض أن الواجهة الأمامية يتم خدمتها من Vercel، لذا هذا الجزء قد لا يكون ضروريًا هنا
    // إلا إذا كنت تريد خدمة الواجهة الأمامية من نفس خادم Railway (وهو ما لا تفعله حاليًا)
    /*
    const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist'); // اضبط المسار حسب هيكل مشروعك
    if (require('fs').existsSync(frontendBuildPath)) {
        app.use(express.static(frontendBuildPath));
        // لأي مسار غير مطابق لمسارات API، أرسل index.html (للتعامل مع React Router)
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
        });
        console.log(`Serving frontend from: ${frontendBuildPath}`);
    } else {
        console.warn(`Frontend build path not found: ${frontendBuildPath}. Frontend will not be served by this server.`);
    }
    */
   // بما أن الواجهة الأمامية على Vercel، هذا يكفي كنقطة نهاية أساسية
    app.get('/', (req, res) => {
        res.send('BacPrepa API is running. Frontend is hosted separately.');
    });
} else {
    app.get('/', (req, res) => {
        res.send('BacPrepa API is running in development mode.');
    });
}

// --- الاتصال بـ MongoDB وبدء الخادم ---
mongoose.connect(process.env.MONGO_URI, {
    // الخيارات القديمة لم تعد مطلوبة في Mongoose 6+
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useCreateIndex: true, // لم يعد مدعومًا
    // useFindAndModify: false // لم يعد مدعومًا
})
.then(() => {
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    const server = http.createServer(app); // استخدام http.createServer
    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
})
.catch(err => {
    console.error(`MongoDB Connection Error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});