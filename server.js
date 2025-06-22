// back-end/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // تأكد من أن هذا المسار صحيح
const { notFound, errorHandler } = require('./middlewares/errorMiddleware'); // تأكد من أن هذا المسار صحيح
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

// تحميل متغيرات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB();

const app = express();

// إعداد CORS (مهم جداً للجلسات والكوكيز)
// تأكد من أن FRONTEND_URL في ملف .env يشير إلى عنوان الواجهة الأمامية الصحيح (مثل http://localhost:3000)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // استخدم متغير بيئة أو قيمة افتراضية
    credentials: true // ضروري للسماح بإرسال واستقبال الكوكيز عبر النطاقات
}));

// Middleware لتحليل JSON
app.use(express.json());
app.use(cookieParser());
// إعداد Session Middleware (قبل Passport وقبل المسارات التي تستخدم الجلسات)
// تأكد من وجود SESSION_SECRET و MONGO_URI في ملف .env
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_super_secret_key_for_development_only', // هام: يجب أن يكون في .env
    resave: false, // لا تعيد حفظ الجلسة إذا لم تتغير
    saveUninitialized: true, // مهم: اضبطه على true إذا كنت تريد إنشاء جلسة فورًا حتى لو لم يتم تخزين شيء.
                           // هذا يساعد في التأكد من أن req.session متاح دائمًا.
                           // يمكنك تغييره إلى false لاحقًا إذا كان كل شيء يعمل وأردت تحسين الأداء قليلاً.
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // يجب أن يكون معرفًا في .env
        collectionName: 'sessions', // اسم مجموعة الجلسات في MongoDB
        ttl: 14 * 24 * 60 * 60 // مدة بقاء الجلسة بالثواني (هنا 14 يومًا)
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true في الإنتاج (يتطلب HTTPS)
        httpOnly: true, // يمنع وصول JavaScript من جانب العميل إلى الكوكي
        maxAge: 1000 * 60 * 60 * 24 * 7, // مدة صلاحية الكوكي في المتصفح (هنا أسبوع)
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax' // 'lax' جيد لمعظم الحالات.
                                                                    // قد تحتاج 'none' إذا كان الخادم والواجهة على نطاقات مختلفة تمامًا ويتطلب HTTPS.
    }
}));

// إعداد Passport (إذا كنت تستخدمه للمصادقة)
if (process.env.USE_PASSPORT === 'true') { // يمكنك إضافة هذا المتغير للتحكم في استخدام passport
    require('./config/passport')(passport); // تأكد من أن هذا المسار صحيح
    app.use(passport.initialize());
    app.use(passport.session()); // يعتمد على express-session
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

// --- مسار اختبار الجلسات ---
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
            cookies: req.cookies, // لعرض الكوكيز المستلمة من العميل (يتطلب cookie-parser إذا أردت استخدامه بشكل كامل)
            sessionContent: req.session // لعرض محتوى الجلسة بالكامل (للتصحيح فقط)
        });
    } else {
        console.error('[TEST_SESSION_FAIL] req.session is NOT available!');
        res.status(500).json({
            message: 'Session test FAILED: req.session is not available.',
            error: 'req.session was undefined or null on the server.'
        });
    }
});
// -------------------------

// استخدام مسارات API
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
    if (!process.env.SESSION_SECRET) {
        console.warn('[WARNING] SESSION_SECRET is not set in .env. Using a fallback secret (unsafe for production).');
    }
    if (!process.env.MONGO_URI) {
        console.error('[ERROR] MONGO_URI is not set in .env. Session persistence and database connection will fail.');
    }
    if (!process.env.FRONTEND_URL) {
        console.warn('[WARNING] FRONTEND_URL is not set in .env. CORS might not work as expected with credentials.');
    }
});