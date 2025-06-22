// config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/auth/google/callback', // يجب أن يتطابق مع ما تم إعداده في Google Console
            },
            async (accessToken, refreshToken, profile, done) => {
                const newUser = {
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                };

                try {
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // المستخدم موجود بالفعل
                        done(null, user);
                    } else {
                        // إذا لم يكن المستخدم موجودًا بمعرف جوجل، تحقق من البريد الإلكتروني
                        user = await User.findOne({ email: profile.emails[0].value });
                        if (user) {
                             // إذا كان البريد الإلكتروني موجودًا، اربطه بحساب جوجل
                            user.googleId = profile.id;
                            await user.save();
                            done(null, user);
                        } else {
                            // إنشاء مستخدم جديد
                            user = await User.create(newUser);
                            done(null, user);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    done(err, null);
                }
            }
        )
    );

    // هذه الدوال ليست ضرورية في حالة استخدام JWT (stateless sessions)
    // ولكنها مطلوبة من قبل Passport
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
};