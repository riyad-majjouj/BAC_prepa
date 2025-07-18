const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

// 1. تحميل متغيرات البيئة
dotenv.config();

// 2. الاتصال بقاعدة البيانات
connectDB();

const app = express();

// 3. إعدادات الثقة بالبروكسي
app.set('trust proxy', 1);

// 4. إعدادات CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS Blocked] Origin: ${origin} is not allowed.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// --- [FIX] إعادة ترتيب وتحسين تعريف مسار الـ Webhook ---

// الخطوة 1: تعريف مسار Stripe Webhook أولاً وقبل أي محلل JSON
// هذا يضمن أنه يستقبل الجسم "الخام" للطلب.
const { handleStripeWebhook } = require('./controllers/paymentController');
// تم تغيير المسار ليكون فريدًا وواضحًا
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);


// الخطوة 2: الآن نقوم بتفعيل محلل JSON لباقي المسارات
app.use(express.json());


// الخطوة 3: تفعيل باقي Middlewares العامة
app.use(cookieParser());

const SESSION_SECRET = process.env.SESSION_SECRET || 'a_very_secret_key_for_development_only';
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60,
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

if (process.env.USE_PASSPORT === 'true') {
    require('./config/passport')(passport);
    app.use(passport.initialize());
    app.use(passport.session());
}

// الخطوة 4: ربط كل مسارات API الأخرى
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const questionRoutes = require('./routes/questionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const examRoutes = require('./routes/examRoutes');
const academicLevelRoutes = require('./routes/academicLevelRoutes');
const trackRoutes = require('./routes/trackRoutes');
const devoirRoutes = require('./routes/devoirRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const forumRoutes = require('./routes/forumRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.get('/', (req, res) => {
    res.send('API is running successfully!');
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/academic-levels', academicLevelRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/devoirs', devoirRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);


// الخطوة 5: Middlewares معالجة الأخطاء في النهاية
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});