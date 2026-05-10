const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName
    };
    return done(null, user);
  }));
} else {
  console.warn('⚠️  Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;