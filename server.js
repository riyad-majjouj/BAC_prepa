// back-end/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// ... باقي الـ imports

dotenv.config();
connectDB();

const app = express();

// --- إعداد CORS ---
const allowedOrigins = [
    'http://localhost:3000', // للبيئة المحلية
    'https://bac-boost-maroc-git-master-lkjkljs-projects.vercel.app' // للإنتاج على Vercel
    // يمكنك إضافة أي نطاقات أخرى مسموح بها هنا
];

// إذا كان لديك FRONTEND_URL محدد في .env وتريد إضافته ديناميكيًا
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}


app.use(cors({
    origin: function (origin, callback) {
        // السماح بالطلبات التي ليس لها origin (مثل تطبيقات الهاتف أو curl)
        // أو إذا كان الـ origin ضمن قائمة المصادر المسموح بها
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS: Blocked origin: ${origin}`); // سجل المصدر المرفوض
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // ضروري للسماح بإرسال واستقبال الكوكيز
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // أضف OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'] // أضف الهيدرز الشائعة
}));

// Middleware لتحليل JSON
app.use(express.json());
app.use(cookieParser());

// إعداد Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_super_secret_key_for_development_only',
    resave: false,
    saveUninitialized: true, // مهم للجلسات الجديدة، خاصة مع OAuth
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true في الإنتاج (يتطلب HTTPS)
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // هام جدًا للـ OAuth والـ cross-site cookies
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// ... باقي كود server.js (Passport, المسارات, etc.)
// --- مسارات API ---
 const userRoutes = require('./routes/userRoutes');
 const authRoutes = require('./routes/authRoutes'); // تأكد من أن هذا المسار صحيح
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

 // Middlewares لمعالجة الأخطاء
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
     if (!process.env.FRONTEND_URL && !allowedOrigins.includes('http://localhost:3000')) {
          // إذا لم يكن FRONTEND_URL معرفاً ولم يكن localhost:3000 ضمن allowedOrigins (في حال عدم استخدام القائمة أعلاه)
         console.warn('[WARNING] FRONTEND_URL is not set in .env and localhost:3000 is not explicitly allowed. CORS might not work as expected with credentials.');
     } else if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
          // إذا كان FRONTEND_URL معرفاً ولكنه ليس ضمن allowedOrigins
         console.warn(`[WARNING] FRONTEND_URL (${process.env.FRONTEND_URL}) is set but not in allowedOrigins. CORS might not work as expected.`);
     }
 });