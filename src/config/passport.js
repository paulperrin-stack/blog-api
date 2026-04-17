const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcryptjs');
const prisma = require('../db');

// --- Local Strategy: validates email + password at login ---

passport.use('local', new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
        try {
            const user = await prisma.user.findUnique ({ where: { email } });

            if (!user) {
                return done(null, false, { message: 'No user with that email' });
            }

            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                return done(null, false, { message: 'Wrong password' });
            }
            
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// --- JWT Strategy: validates JWT on protected routes ---

passport.use(
    'jwt',
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        async (jwtPayload, done) => {
            try {
                const user = await prisma.user.findUnique({ where: { id: jwtPayload.userId }, });

                if (!user) return done(null, false);

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

module.exports = passport;