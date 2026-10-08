const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        "/api/auth/google/callback",
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        const email =
          profile.emails?.[0]?.value?.toLowerCase();

        const name =
          profile.displayName ||
          profile.name?.givenName ||
          "Google User";

        const avatar =
          profile.photos?.[0]?.value || "";

        if (!email) {
          return done(
            new Error("Google account has no email"),
            null
          );
        }

        // Find by Google ID
        let user = await User.findOne({
          googleId: profile.id,
        });

        if (user) {
          return done(null, user);
        }

        // Check if email already exists
        user = await User.findOne({
          email,
        });

        if (user) {
          // Link Google account
          user.googleId = profile.id;

          if (!user.avatar) {
            user.avatar = avatar;
          }

          await user.save();

          return done(null, user);
        }

        // Create new Google user
        user = await User.create({
          name,
          email,
          googleId: profile.id,
          avatar,
          password: null,
        });

        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;