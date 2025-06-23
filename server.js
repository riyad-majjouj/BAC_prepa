const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

// 1. تحميل متغيرات البيئة من ملف .env
dotenv.config();

// 2. الاتصال بقاعدة البيانات MongoDB
connectDB();

const app = express();

// 3. تمكين Express من الثقة بالبروكسيات العكسية (مثل Railway و Vercel)
// هذا ضروري لجعل 'req.protocol' صحيحًا (HTTPS) ولاستقبال عناوين IP الحقيقية ولعمل secure cookies
app.set('trust proxy', 1);

// 4. إعدادات CORS
const allowedOrigins = [
    'http://localhost:3000', // للبيئة المحلية (React/Vue/Angular Dev Server)
    'http://localhost:8080', // للبيئة المحلية (إذا كان الفرونت إند يعمل على هذا البورت)
    // *** هذا هو المكان الذي يجب أن تضيف فيه دومين Vercel الفعلي الخاص بك ***
    // مثال: 'https://your-vercel-app-name.vercel.app',
    'https://bac-boost-maroc.vercel.app'
];

// إضافة FRONTEND_URL من متغيرات البيئة إذا كان مضبوطاً وغير مكرر
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
    console.log(`[CORS] Added FRONTEND_URL: ${process.env.FRONTEND_URL} to allowed origins.`);
} else if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
    console.warn('[CORS WARNING] FRONTEND_URL is not set in environment variables for production. CORS might fail for your actual frontend.');
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`[CORS Blocked] Origin: ${origin} is not allowed.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // ضروري للسماح بإرسال واستقبال الكوكيز عبر النطاقات المختلفة
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// 5. Middlewares لمعالجة JSON والكوكيز
app.use(express.json()); // لتحليل جسم الطلبات كـ JSON
app.use(cookieParser()); // لتحليل الكوكيز الواردة

// 6. إعداد الجلسة (Session) باستخدام express-session و MongoStore
// ----------------------------------------------------------------------
// *** هنا يكمن جزء كبير من الحل المحتمل لمشكلة الجلسة ***
// ----------------------------------------------------------------------
// تأكد من أن SESSION_SECRET هو متغير بيئة مضبوط في Railway
// ولا تستخدم القيمة الافتراضية 'a_very_secret_key_for_development_only' في الإنتاج
const SESSION_SECRET = process.env.SESSION_SECRET || 'a_very_secret_key_for_development_only';
if (SESSION_SECRET === 'a_very_secret_key_for_development_only' && process.env.NODE_ENV === 'production') {
    console.error('[CRITICAL ERROR] SESSION_SECRET is using a weak fallback in production. This WILL cause session issues!');
} else if (process.env.NODE_ENV === 'production') {
    console.log('[INFO] Using custom SESSION_SECRET in production.');
}

app.use(session({
    secret: SESSION_SECRET, // استخدم المتغير الذي تم التحقق منه هنا
    resave: false, // لا تحفظ الجلسة في المخزن إذا لم يتم تعديلها
    saveUninitialized: false, // لا تحفظ الجلسات غير المهيأة (الجديدة التي لا تحتوي على بيانات)
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // URL لقاعدة بيانات MongoDB لتخزين الجلسات
        collectionName: 'sessions', // اسم المجموعة في MongoDB لتخزين الجلسات
        ttl: 14 * 24 * 60 * 60, // عمر الجلسة بالثواني (14 يومًا)
        touchAfter: 24 * 3600 // تحديث الجلسة في قاعدة البيانات مرة واحدة كل 24 ساعة (لتجنب تحديثها في كل طلب)
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // True for HTTPS in production (Railway)
        httpOnly: true, // يمنع JavaScript من الوصول إلى الكوكي (ممارسة أمنية جيدة)
        maxAge: 1000 * 60 * 60 * 24 * 7, // عمر الكوكي بالملي ثانية (7 أيام)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' for cross-origin in production
    }
}));

// سجل لتأكيد إعدادات الكوكيز عند بدء التشغيل
console.log(`[Session Setup] NODE_ENV is '${process.env.NODE_ENV}'. Cookie secure=${process.env.NODE_ENV === 'production'}. SameSite=${process.env.NODE_ENV === 'production' ? 'none' : 'lax'}.`);

// 7. إعداد Passport (إذا كنت تستخدمه للمصادقة)
if (process.env.USE_PASSPORT === 'true') {
    require('./config/passport')(passport);
    app.use(passport.initialize());
    app.use(passport.session());
} else {
    console.warn('[Passport Warning] Passport authentication is disabled. Set USE_PASSPORT=true in .env to enable.');
}

// 8. مسارات API
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

// مسار لاختبار الجلسة (للتشخيص) - حافظ عليه فهو مفيد جداً
app.get('/api/test-session', (req, res) => {
    if (req.session) {
        req.session.views = (req.session.views || 0) + 1;
        req.session.testData = req.session.testData || `Session created at ${new Date().toLocaleTimeString()}`;

        // طباعة محتويات الجلسة الكاملة للتشخيص
        console.log(`[TEST_SESSION] Session ID: ${req.sessionID}, Views: ${req.session.views}, Data: ${req.session.testData}`);
        console.log('[TEST_SESSION] Full Session Content:', JSON.stringify(req.session, null, 2));
        
        // مثال لتخزين بيانات مؤقتة في الجلسة لاختبار استمراريتها
        req.session.sampleAiQuestion = { id: 'test_ai_q_123', text: 'What is 1+1?', answer: '2' };
        
        res.status(200).json({
            message: 'Session test successful!',
            sessionId: req.sessionID,
            views: req.session.views,
            sessionData: req.session.testData,
            cookies: req.cookies,
            sessionContent: req.session
        });
    } else {
        console.error('[TEST_SESSION_FAIL] req.session is NOT available! Check session middleware setup.');
        res.status(500).json({
            message: 'Session test FAILED: req.session is not available.',
            error: 'req.session was undefined or null on the server.'
        });
    }
});

// 9. ربط المسارات بـ Express
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/academic-levels', academicLevelRoutes);
app.use('/api/tracks', trackRoutes);

// 10. Middlewares لمعالجة الأخطاء (يجب أن تكون في النهاية)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`API listening on port ${PORT}`);

    // رسائل تحذيرية ومتغيرات بيئة للتأكد
    if (SESSION_SECRET === 'a_very_secret_key_for_development_only' && process.env.NODE_ENV === 'production') {
        console.error('[CRITICAL] SESSION_SECRET is using a default fallback in production. This will cause session issues!');
    }
    if (!process.env.MONGO_URI) {
        console.error('[ERROR] MONGO_URI is not set. Session persistence and database connection will fail.');
    }
    if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
        console.warn('[WARNING] In production, FRONTEND_URL should be set for proper CORS configuration.');
    }
    if (process.env.NODE_ENV === 'production' && app.get('trust proxy') !== 1) {
        console.warn('[WARNING] In production, `app.set("trust proxy", 1)` should be enabled for correct cookie and IP handling behind a proxy.');
    }
    if (process.env.NODE_ENV === 'production' && !process.env.MONGO_URI) {
        console.error('[CRITICAL] MONGO_URI is missing in production. Session persistence will not work.');
    }
});