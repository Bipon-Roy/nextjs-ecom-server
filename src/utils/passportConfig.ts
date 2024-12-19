import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/user/user.model";

// Configure the Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: "http://localhost:5000/api/v1/users/google/callback", // Replace with your actual redirect URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await UserModel.findOne({ email: profile.emails?.[0].value });

                if (!user) {
                    // Create a new user if not found
                    user = await UserModel.create({
                        email: profile.emails?.[0].value,
                        name: profile.displayName,
                        avatar: profile.photos?.[0].value,
                        verified: true,
                        password: "google-auth",
                    });
                }

                // Pass user to the next middleware
                return done(null, user);
            } catch (error: any) {
                return done(error, undefined);
            }
        }
    )
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => done(null, user._id)); // Serialize by user ID
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Export the configured passport
export default passport;
