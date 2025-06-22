// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const http = require('http');

// استيراد المسارات
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const progressRoutes = require('./routes/progressRoutes');
// const academicDataRoutes = require('./routes/academicDataRoutes'); // معلق إذا لم يكن الملف موجودًا
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');

// استيراد إعدادات Passport
require('./config/passport')(passport); // تأكد أن هذا الملف موجود في ./config/passport-setup.js

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. إعدادات CORS (مع تسجيل إضافي) ---
const vercelOrigin = process.env.FRONTEND_URL_VERCEL; // يجب تعيينه في Railway

const corsOptions = {
    origin: function (origin, callback) {
        console.log(`[CORS DEBUG] Request origin: ${origin}`);
        console.log(`[CORS DEBUG] Expected Vercel origin from env: ${vercelOrigin}`);

        // السماح بالطلبات التي لا تحتوي على origin (مثل Postman، curl، أو في بعض سيناريوهات التطوير)
        // أو إذا كان الـ origin يطابق نطاق Vercel المحدد في متغير البيئة
        if (!origin || origin === vercelOrigin) {
            console.log(`[CORS DEBUG] Allowing origin: ${origin}`);
            callback(null, true);
        } else {
            // تحقق أيضًا من قائمة بيضاء إضافية إذا كنت تحتاجها (مثل localhost)
            const additionalWhitelist = ['http://localhost:8080', 'http://localhost:3000'];
            if (additionalWhitelist.includes(origin)) {
                console.log(`[CORS DEBUG] Allowing whitelisted origin: ${origin}`);
                callback(null, true);
            } else {
                console.warn(`[CORS DEBUG] Blocking origin: ${origin}. Expected: ${vercelOrigin} or from whitelist.`);
                callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


// --- 2. الثقة بالبروكسي (Trust Proxy) ---
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    console.log("Production mode: 'trust proxy' is set.");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 3. إعدادات الجلسة (express-session) ---
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'a very secret key for development',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI_SESSION || process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }
});
app.use(sessionMiddleware);

// --- 4. Middleware لمعالجة مشكلة Google OAuth redirect_uri_mismatch (اختياري) ---
const redirectToMainDomain = (req, res, next) => {
    const mainDomain = process.env.YOUR_MAIN_DOMAIN_URL; // يجب تعيينه في Railway
    if (process.env.NODE_ENV === 'production' && mainDomain && req.hostname !== new URL(mainDomain).hostname) {
        const targetUrl = new URL(req.originalUrl, mainDomain).toString();
        console.warn(`Redirecting from ${req.hostname} to main domain: ${targetUrl}`);
        return res.redirect(301, targetUrl);
    }
    next();
};
// app.use(redirectToMainDomain); // <--- معطل حاليًا، قم بإلغاء التعليق إذا كنت بحاجة إليه وتأكد من YOUR_MAIN_DOMAIN_URL

app.use(passport.initialize());
app.use(passport.session());

// مسارات API
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/progress', progressRoutes);
// app.use('/api/academic-data', academicDataRoutes); // <--- معلق إذا لم يكن الملف موجودًا
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);

if (process.env.NODE_ENV === 'production') {
    app.get('/', (req, res) => {
        res.send('BacPrepa API is running. Frontend is hosted separately.');
    });
} else {
    app.get('/', (req, res) => {
        res.send('BacPrepa API is running in development mode.');
    });
}

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
})
.catch(err => {
    console.error(`MongoDB Connection Error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});