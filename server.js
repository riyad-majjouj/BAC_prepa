const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
dotenv.config();
connectDB();
const app = express();
app.set('trust proxy', 1);
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    // 'https://your-vercel-app-domain.vercel.app', // استبدل هذا بدومين Vercel الفعلي الخاص بك
];
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
    console.log(`[CORS] Added FRONTEND_URL: ${process.env.FRONTEND_URL} to allowed origins.`);
} else if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
    console.warn('[CORS WARNING] FRONTEND_URL is not set in environment variables for production. CORS might fail.');
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
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_development_only',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60,
        touchAfter: 24 * 3600
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // True for HTTPS in production (Railway)
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' for cross-origin in production
    }
}));
console.log(`[Session Setup] NODE_ENV is '${process.env.NODE_ENV}'. Cookie secure=${app.get('env') === 'production'}. SameSite=${process.env.NODE_ENV === 'production' ? 'none' : 'lax'}.`);
if (process.env.USE_PASSPORT === 'true') {
    require('./config/passport')(passport);
    app.use(passport.initialize());
    app.use(passport.session());
} else {
    console.warn('[Passport Warning] Passport authentication is disabled. Set USE_PASSPORT=true in .env to enable.');
}
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const questionRoutes = require('./routes/questionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const examRoutes = require('./routes/examRoutes');
const academicLevelRoutes = require('./routes/academicLevelRoutes');
const trackRoutes = require('./routes/trackRoutes');
app.get('/', (req, res) => {
    res.send('API is running successfully!');
});
app.get('/api/test-session', (req, res) => {
    if (req.session) {
        req.session.views = (req.session.views || 0) + 1;
        req.session.testData = req.session.testData || `Session created at ${new Date().toLocaleTimeString()}`;
        console.log(`[TEST_SESSION] Session ID: ${req.sessionID}, Views: ${req.session.views}, Data: ${req.session.testData}`);
        console.log('[TEST_SESSION] Full Session Content:', JSON.stringify(req.session, null, 2)); // <--- سجل تفصيلي لمحتوى الجلسة
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
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/academic-levels', academicLevelRoutes);
app.use('/api/tracks', trackRoutes);
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'a_very_secret_key_for_development_only') {
        console.warn('[WARNING] SESSION_SECRET is not set or is using a weak fallback. Unsafe for production.');
    }
    if (!process.env.MONGO_URI) {
        console.error('[ERROR] MONGO_URI is not set. Session persistence and DB connection will fail.');
    }
    if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
        console.warn('[WARNING] In production, FRONTEND_URL should be set for proper CORS.');
    }
    if (process.env.NODE_ENV === 'production' && app.get('trust proxy') !== 1) {
        console.warn('[WARNING] In production, `app.set("trust proxy", 1)` should be enabled for correct cookie/IP handling.');
    }
    if (process.env.NODE_ENV === 'production' && !process.env.MONGO_URI) {
        console.error('[CRITICAL] MONGO_URI is missing in production. Session persistence will not work.');
    }
});