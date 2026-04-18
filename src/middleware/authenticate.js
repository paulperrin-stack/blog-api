import passport from '../config/passport.js';

const authenticate = passport.authenticate('jwt', { session: false });

export default authenticate;
