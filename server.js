// back-end/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // <--- تأكد أن هذا السطر موجود وغير معلّق
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

// تحميل متغيرات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB(); // <--- هذا هو الاستدعاء. يجب أن يكون بعد السطر أعلاه

const app = express();

// ... باقي إعدادات CORS والجلسات والمسارات كما في الكود السابق
// (الكود الذي قدمته في السؤال الأول لإعدادات CORS كان جيدًا بعد التعديل المقترح للمصادر)
// --- إعداد CORS ---
const allowedOrigins = [
    'http://localhost:3000',
    "http://localhost:8080", // للبيئة المحلية
    'https://bac-boost-maroc-git-master-lkjkljs-projects.vercel.app' // للإنتاج على Vercel
    // يمكنك إضافة أي نطاقات أخرى مسموح بها هنا
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS: Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_super_secret_key_for_development_only',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

 // إعداد Passport (إذا كنت تستخدمه للمصادقة)
 if (process.env.USE_PASSPORT === 'true') {
     require('./config/passport')(passport);
     app.use(passport.initialize());
     app.use(passport.session());
 }

 // --- مسارات API ---
 const userRoutes = require('./routes/userRoutes');
 const authRoutes = require('./routes/authRoutes');
 const subjectRoutes = require('./routes/subjectRoutes');
 const questionRoutes = require('./routes/questionRoutes');
 const progressRoutes = require('./routes/progressRoutes');
 const examRoutes = require('./routes/examRoutes');
 const academicLevelRoutes = require('./routes/academicLevelRoutes');
 const trackRoutes = require('./routes/trackRoutes');

 // مسار رئيسي ترحيبي
 app.get('/', (req, res) => {
     res.send('API is running successfully!');
 });

 // ... (مسار test-session وباقي المسارات كما هي) ...
 app.get('/api/test-session', (req, res) => {
     if (req.session) {
         req.session.views = (req.session.views || 0) + 1;
         req.session.testData = req.session.testData || `Session created at ${new Date().toLocaleTimeString()}`;

         console.log(`[TEST_SESSION] Session ID: ${req.sessionID}, Views: ${req.session.views}, Data: ${req.session.testData}`);
         res.status(200).json({
             message: 'Session test successful!',
             sessionId: req.sessionID,
             views: req.session.views,
             sessionData: req.session.testData,
             cookies: req.cookies,
             sessionContent: req.session
         });
     } else {
         console.error('[TEST_SESSION_FAIL] req.session is NOT available!');
         res.status(500).json({
             message: 'Session test FAILED: req.session is not available.',
             error: 'req.session was undefined or null on the server.'
         });
     }
 });

 app.use('/api/users', userRoutes);
 app.use('/api/auth', authRoutes);
 app.use('/api/subjects', subjectRoutes);
 app.use('/api/questions', questionRoutes);
 app.use('/api/exams', examRoutes);
 app.use('/api/progress', progressRoutes);
 app.use('/api/academic-levels', academicLevelRoutes);
 app.use('/api/tracks', trackRoutes);


// Middlewares لمعالجة الأخطاء (يجب أن تكون في النهاية)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    // ... باقي رسائل التحقق من متغيرات البيئة
     if (!process.env.SESSION_SECRET) {
         console.warn('[WARNING] SESSION_SECRET is not set in .env. Using a fallback secret (unsafe for production).');
     }
     if (!process.env.MONGO_URI) {
         console.error('[ERROR] MONGO_URI is not set in .env. Session persistence and database connection will fail.');
     }
     const mainFrontendUrl = 'https://bac-boost-maroc-git-master-lkjkljs-projects.vercel.app';
     if (!process.env.FRONTEND_URL && !allowedOrigins.includes('http://localhost:3000')) {
         console.warn('[WARNING] FRONTEND_URL is not set in .env and localhost:3000 is not explicitly allowed. CORS might not work as expected with credentials.');
     } else if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
         console.warn(`[WARNING] FRONTEND_URL (${process.env.FRONTEND_URL}) is set but not in allowedOrigins. CORS might not work as expected for it. Ensure ${mainFrontendUrl} is in allowedOrigins or set as FRONTEND_URL.`);
     } else if (!allowedOrigins.includes(mainFrontendUrl) && process.env.FRONTEND_URL !== mainFrontendUrl) {
         console.warn(`[WARNING] The primary frontend URL ${mainFrontendUrl} is not found in allowedOrigins and is not set as FRONTEND_URL. CORS issues might arise.`);
     }
});