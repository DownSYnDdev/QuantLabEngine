/**
 * Authentication Module Index
 * Re-exports all authentication-related types and functions
 */

// Types
export {
    User,
    PublicUser,
    UserPreferences,
    ChartDefaults,
    DEFAULT_CHART_DEFAULTS,
    DEFAULT_USER_PREFERENCES,
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    JWTPayload,
    RefreshToken,
    AuthErrorCode,
    AuthError,
    AuthResult,
} from './types';

// Password utilities
export {
    hashPassword,
    verifyPassword,
    validatePasswordStrength,
    generateSecureToken,
    hashToken,
} from './password';

// JWT utilities
export {
    JWTConfig,
    DEFAULT_JWT_CONFIG,
    generateAccessToken,
    verifyAccessToken,
    decodeToken,
    isTokenExpired,
    getTokenExpiration,
} from './jwt';

// Auth service
export {
    toPublicUser,
    registerUser,
    loginUser,
    refreshAccessToken,
    logout,
    getUserById,
    getUserFromToken,
    clearAuthStorage,
} from './auth';
