import * as client from "openid-client";
import { Strategy as ReplitStrategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LocalStrategy } from "passport-local";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "../storage";
import bcrypt from "bcryptjs";

// Types for OAuth providers
interface OAuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  provider: 'replit' | 'google' | 'facebook' | 'email';
}

// Replit OIDC configuration
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUserFromProfile(profile: OAuthUser) {
  await storage.upsertUser({
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileImageUrl: profile.profileImageUrl,
  });
}

export async function setupMultiAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Replit OAuth Strategy
  const replitConfig = await getOidcConfig();

  const replitVerify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = { provider: 'replit' };
    updateUserSession(user, tokens);
    
    const claims = tokens.claims();
    if (claims) {
      await upsertUserFromProfile({
        id: String(claims["sub"] || ''),
        email: String(claims["email"] || ''),
        firstName: String(claims["first_name"] || ''),
        lastName: String(claims["last_name"] || ''),
        profileImageUrl: String(claims["profile_image_url"] || ''),
        provider: 'replit'
      });
    }
    
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new ReplitStrategy(
      {
        name: `replitauth:${domain}`,
        config: replitConfig,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback/replit`,
      },
      replitVerify,
    );
    passport.use(strategy);
  }

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/callback/google",
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          provider: 'google',
          access_token: accessToken,
          refresh_token: refreshToken,
          profile: profile
        };

        await upsertUserFromProfile({
          id: `google_${profile.id}`,
          email: profile.emails?.[0]?.value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          profileImageUrl: profile.photos?.[0]?.value,
          provider: 'google'
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    }));
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/callback/facebook",
      profileFields: ['id', 'displayName', 'name', 'photos', 'email'],
      scope: ['email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          provider: 'facebook',
          access_token: accessToken,
          refresh_token: refreshToken,
          profile: profile
        };

        await upsertUserFromProfile({
          id: `facebook_${profile.id}`,
          email: profile.emails?.[0]?.value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          profileImageUrl: profile.photos?.[0]?.value,
          provider: 'facebook'
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    }));
  }

  // Local Strategy for Email/Password Authentication
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email: string, password: string, done) => {
    try {
      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      const sessionUser = {
        provider: 'email',
        profile: user
      };
      
      return done(null, sessionUser);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Replit Auth Routes
  app.get("/api/login/replit", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback/replit", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login/replit",
    })(req, res, next);
  });

  // Google Auth Routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/login/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get("/api/callback/google",
      passport.authenticate("google", { failureRedirect: "/login" }),
      (req, res) => {
        // Store user preference if it exists in localStorage
        res.redirect("/?auth=success");
      }
    );
  }

  // Facebook Auth Routes
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    app.get("/api/login/facebook",
      passport.authenticate("facebook", { scope: ["email"] })
    );

    app.get("/api/callback/facebook",
      passport.authenticate("facebook", { failureRedirect: "/login" }),
      (req, res) => {
        // Store user preference if it exists in localStorage
        res.redirect("/?auth=success");
      }
    );
  }

  // Email/Password Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({
        id: `email_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        authProvider: 'email',
        isVerified: false
      });
      
      // Auto-login after signup
      req.login({ provider: 'email', profile: newUser }, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login after signup failed" });
        }
        res.json({ message: "User created successfully", user: newUser });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        res.json({ message: "Login successful", user: user.profile });
      });
    })(req, res, next);
  });

  // Unified logout route
  app.get("/api/logout", (req, res) => {
    const user = req.user as any;
    
    req.logout(() => {
      if (user?.provider === 'replit') {
        // Replit logout
        res.redirect(
          client.buildEndSessionUrl(replitConfig, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      } else {
        // Google/Facebook logout - just redirect to home
        res.redirect("/");
      }
    });
  });

  // Legacy route for backward compatibility
  app.get("/api/login", (req, res) => {
    res.redirect("/api/login/replit");
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Handle different OAuth providers
  if (user.provider === 'replit') {
    if (!user.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }

    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      return next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  } else {
    // For Google/Facebook, session-based auth is sufficient
    return next();
  }
};