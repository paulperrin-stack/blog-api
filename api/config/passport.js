import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcryptjs";
import prisma from "./prisma.js";

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { username } });
            if (!user) return done(null, false, { message: "Incorrect username" });
            const match = await bcrypt.compare(password, user.password);
            if (!match) return done(null, false, { message: "Incorrect password" });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        async (payload, done) => {
            try {
                const user = await prisma.user.findUnique({ where: { id: payload.sub } });
                if (!user) return done(null, false);
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

export default passport;