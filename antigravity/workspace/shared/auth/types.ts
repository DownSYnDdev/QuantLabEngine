/**
 * Authentication Types
 * Type definitions for the authentication system
 */

/**
 * User entity
 */
export interface User {
    id: string;
    tenantId: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Public user info (no sensitive data)
 */
export interface PublicUser {
    id: string;
    username: string;
    email: string;
    createdAt: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
    userId: string;
    theme: 'light' | 'dark' | 'system';
    chartDefaults: ChartDefaults;
    defaultLayoutId?: string;
}

/**
 * Chart default settings
 */
export interface ChartDefaults {
    timeframe: string;
    chartType: 'candlestick' | 'line' | 'bar';
    showVolume: boolean;
    indicators: string[];
}

/**
 * Default chart settings
 */
export const DEFAULT_CHART_DEFAULTS: ChartDefaults = {
    timeframe: '1H',
    chartType: 'candlestick',
    showVolume: true,
    indicators: [],
};

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'userId'> = {
    theme: 'dark',
    chartDefaults: DEFAULT_CHART_DEFAULTS,
};

/**
 * Registration request
 */
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    tenantId?: string; // Optional, defaults to new tenant
}

/**
 * Login request
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Token response
 */
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
    refreshToken: string;
}

/**
 * JWT payload
 */
export interface JWTPayload {
    sub: string; // User ID
    tenantId: string;
    username: string;
    email: string;
    iat: number;
    exp: number;
}

/**
 * Stored refresh token
 */
export interface RefreshToken {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: string;
    createdAt: string;
}

/**
 * Auth error types
 */
export enum AuthErrorCode {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    USER_EXISTS = 'USER_EXISTS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    TOKEN_INVALID = 'TOKEN_INVALID',
    RATE_LIMITED = 'RATE_LIMITED',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Auth error
 */
export interface AuthError {
    code: AuthErrorCode;
    message: string;
}

/**
 * Auth result
 */
export type AuthResult<T> =
    | { success: true; data: T }
    | { success: false; error: AuthError };
