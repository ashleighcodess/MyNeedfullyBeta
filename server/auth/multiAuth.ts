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
import { authLimiter, createUserLimiter } from "../middleware/rateLimiter";
import SecurityMonitor from "../services/security-monitor";

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
  
  const sessionMiddleware = session({
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
  
  // Store reference for WebSocket authentication
  (sessionMiddleware as any).store = sessionStore;
  
  return sessionMiddleware;
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
  
  const sessionMiddleware = getSession();
  app.use(sessionMiddleware);
  
  // Store session store reference for WebSocket authentication
  app.set('sessionStore', (sessionMiddleware as any).store);
  
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

  // Google OAuth Strategy with multiple domain support
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Create separate strategies for different domains
    const domains = [
      'myneedfully.app',
      'my-needfully.replit.app',
      process.env.REPLIT_DOMAINS?.split(',')[0] || ''
    ].filter(Boolean);
    
    domains.forEach((domain, index) => {
      const strategyName = index === 0 ? 'google' : `google-${index}`;
      passport.use(strategyName, new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `https://${domain}/api/callback/google`,
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
    });
  }

  // Facebook OAuth Strategy - Temporarily disabled for deployment
  // if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  //   passport.use(new FacebookStrategy({
  //     clientID: process.env.FACEBOOK_APP_ID,
  //     clientSecret: process.env.FACEBOOK_APP_SECRET,
  //     callbackURL: "/api/callback/facebook",
  //     profileFields: ['id', 'displayName', 'name', 'photos', 'email'],
  //     scope: ['email']
  //   },
  //   async (accessToken, refreshToken, profile, done) => {
  //     try {
  //       const user = {
  //         provider: 'facebook',
  //         access_token: accessToken,
  //         refresh_token: refreshToken,
  //         profile: profile
  //       };

  //       await upsertUserFromProfile({
  //         id: `facebook_${profile.id}`,
  //         email: profile.emails?.[0]?.value,
  //         firstName: profile.name?.givenName,
  //         lastName: profile.name?.familyName,
  //         profileImageUrl: profile.photos?.[0]?.value,
  //         provider: 'facebook'
  //       });

  //       return done(null, user);
  //     } catch (error) {
  //       return done(error as Error, false);
  //     }
  //   }));
  // }

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

  // Replit Auth Routes with rate limiting
  app.get("/api/login/replit", authLimiter, (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback/replit", authLimiter, (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login/replit",
    })(req, res, next);
  });

  // Google Auth Routes with domain-aware strategy selection
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/login/google", authLimiter, (req, res, next) => {
      const hostname = req.hostname;
      let strategyName = 'google';
      
      // Select the appropriate strategy based on hostname
      if (hostname === 'myneedfully.app') {
        strategyName = 'google';
      } else if (hostname === 'my-needfully.replit.app') {
        strategyName = 'google-1';
      } else {
        strategyName = 'google-2'; // development domain
      }
      
      passport.authenticate(strategyName, { scope: ["profile", "email"] })(req, res, next);
    });

    app.get("/api/callback/google", authLimiter, (req, res, next) => {
      const hostname = req.hostname;
      let strategyName = 'google';
      
      // Select the appropriate strategy based on hostname
      if (hostname === 'myneedfully.app') {
        strategyName = 'google';
      } else if (hostname === 'my-needfully.replit.app') {
        strategyName = 'google-1';
      } else {
        strategyName = 'google-2'; // development domain
      }
      
      passport.authenticate(strategyName, { failureRedirect: "/login" })(req, res, next);
    }, (req, res) => {
      // Store user preference if it exists in localStorage
      res.redirect("/?auth=success");
    });
  }

  // Facebook Auth Routes - Temporarily disabled for deployment
  // if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  //   app.get("/api/login/facebook", authLimiter,
  //     passport.authenticate("facebook", { scope: ["email"] })
  //   );

  //   app.get("/api/callback/facebook", authLimiter,
  //     passport.authenticate("facebook", { failureRedirect: "/login" }),
  //     (req, res) => {
  //       // Store user preference if it exists in localStorage
  //       res.redirect("/?auth=success");
  //     }
  //   );
  // }

  // Email/Password Auth Routes with rate limiting
  app.post("/api/auth/signup", createUserLimiter, async (req, res) => {
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
      
      // Send welcome email for new email/password users
      if (newUser.email && newUser.firstName) {
        try {
          console.log(`📧 Attempting to send welcome email to ${newUser.email}`);
          const { emailService } = await import('../email-service');
          // Fire and forget - don't block signup if email fails
          emailService.sendWelcomeEmail(newUser.email, newUser.firstName).catch(error => {
            console.error('❌ Failed to send welcome email:', error);
          });
        } catch (error) {
          console.error('❌ Error loading email service:', error);
        }
      } else {
        console.log('⚠️ No email or firstName provided for welcome email');
      }
      
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

  app.post("/api/auth/login", authLimiter, (req, res, next) => {
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
    res.redirect("/login");
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const startTime = Date.now();
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  try {
    // CRITICAL SECURITY: Multiple bypass protection layers
    const user = req.user as any;
    
    // Layer 1: Passport authentication check
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      console.log(`[AUTH_FAILURE] ${req.method} ${req.path} - Not authenticated - IP: ${ipAddress}`);
      await SecurityMonitor.logSecurityEvent({
        eventType: 'unauthorized_access',
        threatLevel: 'medium',
        ipAddress,
        userAgent,
        endpoint: req.path,
        requestMethod: req.method,
        errorMessage: 'Authentication bypass attempt - no passport session',
      });
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Layer 2: User object validation
    if (!user || typeof user !== 'object') {
      console.log(`[AUTH_FAILURE] ${req.method} ${req.path} - Invalid user object - IP: ${ipAddress}`);
      await SecurityMonitor.logSecurityEvent({
        eventType: 'unauthorized_access',
        threatLevel: 'high',
        ipAddress,
        userAgent,
        endpoint: req.path,
        requestMethod: req.method,
        errorMessage: 'Authentication bypass attempt - invalid user object',
      });
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Layer 3: Session validation
    if (!req.session || !req.sessionID) {
      console.log(`[AUTH_FAILURE] ${req.method} ${req.path} - No valid session - IP: ${ipAddress}`);
      await SecurityMonitor.logSecurityEvent({
        eventType: 'unauthorized_access',
        threatLevel: 'high',
        ipAddress,
        userAgent,
        endpoint: req.path,
        requestMethod: req.method,
        errorMessage: 'Authentication bypass attempt - no session',
      });
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Layer 4: Provider-specific validation
    if (!user.provider || !['replit', 'google', 'facebook', 'email'].includes(user.provider)) {
      console.log(`[AUTH_FAILURE] ${req.method} ${req.path} - Invalid provider: ${user.provider} - IP: ${ipAddress}`);
      await SecurityMonitor.logSecurityEvent({
        eventType: 'unauthorized_access',
        threatLevel: 'high',
        ipAddress,
        userAgent,
        endpoint: req.path,
        requestMethod: req.method,
        errorMessage: `Authentication bypass attempt - invalid provider: ${user.provider}`,
      });
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Handle different OAuth providers with provider-specific validation
    if (user.provider === 'replit') {
      // Layer 5: Replit token validation
      if (!user.expires_at || !user.claims || !user.claims.sub) {
        console.log(`[AUTH_FAILURE] ${req.method} ${req.path} - Invalid Replit token data - IP: ${ipAddress}`);
        await SecurityMonitor.logSecurityEvent({
          eventType: 'unauthorized_access',
          threatLevel: 'high',
          ipAddress,
          userAgent,
          endpoint: req.path,
          requestMethod: req.method,
          userId: user.claims?.sub,
          errorMessage: 'Replit authentication bypass attempt - invalid token structure',
        });
        return res.status(401).json({ message: "Unauthorized" });
      }

      const now = Math.floor(Date.now() / 1000);
      if (now <= user.expires_at) {
        // Valid token, proceed
        return next();
      }

      // Token expired, attempt refresh
      const refreshToken = user.refresh_token;
      if (!refreshToken) {
        console.log(`[AUTH_FAILURE] ${req.method} ${req.path} - No refresh token - IP: ${ipAddress}`);
        await SecurityMonitor.logSecurityEvent({
          eventType: 'unauthorized_access',
          threatLevel: 'medium',
          ipAddress,
          userAgent,
          endpoint: req.path,
          requestMethod: req.method,
          userId: user.claims?.sub,
          errorMessage: 'Replit token expired, no refresh token available',
        });
        return res.status(401).json({ message: "Unauthorized" });
      }

      try {
        const config = await getOidcConfig();
        const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
        updateUserSession(user, tokenResponse);
        return next();
      } catch (error) {
        console.log(`[AUTH_FAILURE] ${req.method} ${req.path} - Token refresh failed - IP: ${ipAddress}`);
        await SecurityMonitor.logSecurityEvent({
          eventType: 'unauthorized_access',
          threatLevel: 'medium',
          ipAddress,
          userAgent,
          endpoint: req.path,
          requestMethod: req.method,
          userId: user.claims?.sub,
          errorMessage: 'Replit token refresh failed',
          metadata: { error: error.message },
        });
        return res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      // Layer 6: Other providers (Google/Facebook/Email) validation
      if (!user.profile || !user.profile.id) {
        console.log(`[AUTH_FAILURE] ${req.method} ${req.path} - Invalid profile data for ${user.provider} - IP: ${ipAddress}`);
        await SecurityMonitor.logSecurityEvent({
          eventType: 'unauthorized_access',
          threatLevel: 'high',
          ipAddress,
          userAgent,
          endpoint: req.path,
          requestMethod: req.method,
          errorMessage: `${user.provider} authentication bypass attempt - invalid profile`,
        });
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // For Google/Facebook/Email, session-based auth is sufficient
      return next();
    }
  } catch (error) {
    console.error(`[AUTH_ERROR] ${req.method} ${req.path} - Authentication error - IP: ${ipAddress}:`, error);
    await SecurityMonitor.logSecurityEvent({
      eventType: 'system_error',
      threatLevel: 'medium',
      ipAddress,
      userAgent,
      endpoint: req.path,
      requestMethod: req.method,
      errorMessage: 'Authentication middleware error',
      metadata: { error: error.message },
    });
    return res.status(401).json({ message: "Unauthorized" });
  } finally {
    // Log authentication processing time for monitoring
    const duration = Date.now() - startTime;
    console.log(`[SECURITY] ${req.method} ${req.path} - ${res.statusCode || 'pending'} - ${duration}ms - IP: ${ipAddress}`);
  }
};