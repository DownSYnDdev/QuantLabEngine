/**
 * Authentication Service
 * Core authentication operations: register, login, refresh, logout
 */

import {
    User,
    PublicUser,
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshToken,
    AuthResult,
    AuthErrorCode,
    JWTPayload,
} from './types';
import { hashPassword, verifyPassword, validatePasswordStrength, generateSecureToken, hashToken } from './password';
import { generateAccessToken, verifyAccessToken, DEFAULT_JWT_CONFIG, JWTConfig } from './jwt';

/**
 * In-memory storage (replace with database in production)
 */
const users = new Map<string, User>();
const usersByEmail = new Map<string, User>();
const refreshTokens = new Map<string, RefreshToken>();

/**
 * Generate unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Convert User to PublicUser (remove sensitive data)
 */
export function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
    };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate username
 */
function isValidUsername(username: string): boolean {
    // 3-30 characters, alphanumeric and underscores
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
}

/**
 * Register a new user
 */
export async function registerUser(
    request: RegisterRequest
): Promise<AuthResult<{ user: PublicUser; tokens: TokenResponse }>> {
    // Validate email
    if (!isValidEmail(request.email)) {
        return {
            success: false,
            error: { code: AuthErrorCode.VALIDATION_ERROR, message: 'Invalid email format' },
        };
    }

    // Validate username
    if (!isValidUsername(request.username)) {
        return {
            success: false,
            error: {
                code: AuthErrorCode.VALIDATION_ERROR,
                message: 'Username must be 3-30 characters, alphanumeric and underscores only'
            },
        };
    }

    // Validate password
    const passwordValidation = validatePasswordStrength(request.password);
    if (!passwordValidation.valid) {
        return {
            success: false,
            error: {
                code: AuthErrorCode.VALIDATION_ERROR,
                message: passwordValidation.errors.join('; ')
            },
        };
    }

    // Check if user exists
    if (usersByEmail.has(request.email.toLowerCase())) {
        return {
            success: false,
            error: { code: AuthErrorCode.USER_EXISTS, message: 'Email already registered' },
        };
    }

    // Hash password
    const passwordHash = await hashPassword(request.password);

    // Create user
    const now = new Date().toISOString();
    const user: User = {
        id: generateId(),
        tenantId: request.tenantId || generateId(),
        username: request.username,
        email: request.email.toLowerCase(),
        passwordHash,
        createdAt: now,
        updatedAt: now,
    };

    // Store user
    users.set(user.id, user);
    usersByEmail.set(user.email, user);

    // Generate tokens
    const tokens = await generateTokens(user);

    return {
        success: true,
        data: {
            user: toPublicUser(user),
            tokens,
        },
    };
}

/**
 * Login user
 */
export async function loginUser(
    request: LoginRequest
): Promise<AuthResult<{ user: PublicUser; tokens: TokenResponse }>> {
    // Find user by email
    const user = usersByEmail.get(request.email.toLowerCase());

    if (!user) {
        // Use same error for email not found and wrong password (security)
        return {
            success: false,
            error: { code: AuthErrorCode.INVALID_CREDENTIALS, message: 'Invalid email or password' },
        };
    }

    // Verify password
    const isValid = await verifyPassword(request.password, user.passwordHash);

    if (!isValid) {
        return {
            success: false,
            error: { code: AuthErrorCode.INVALID_CREDENTIALS, message: 'Invalid email or password' },
        };
    }

    // Generate tokens
    const tokens = await generateTokens(user);

    return {
        success: true,
        data: {
            user: toPublicUser(user),
            tokens,
        },
    };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
    refreshToken: string
): Promise<AuthResult<TokenResponse>> {
    // Hash the token to compare with stored hash
    const tokenHash = hashToken(refreshToken);

    // Find refresh token
    let storedToken: RefreshToken | undefined;
    for (const [_, token] of refreshTokens) {
        if (token.tokenHash === tokenHash) {
            storedToken = token;
            break;
        }
    }

    if (!storedToken) {
        return {
            success: false,
            error: { code: AuthErrorCode.TOKEN_INVALID, message: 'Invalid refresh token' },
        };
    }

    // Check expiration
    if (new Date(storedToken.expiresAt) < new Date()) {
        refreshTokens.delete(storedToken.id);
        return {
            success: false,
            error: { code: AuthErrorCode.TOKEN_EXPIRED, message: 'Refresh token expired' },
        };
    }

    // Get user
    const user = users.get(storedToken.userId);
    if (!user) {
        return {
            success: false,
            error: { code: AuthErrorCode.TOKEN_INVALID, message: 'User not found' },
        };
    }

    // Delete old refresh token
    refreshTokens.delete(storedToken.id);

    // Generate new tokens
    const tokens = await generateTokens(user);

    return {
        success: true,
        data: tokens,
    };
}

/**
 * Logout (invalidate refresh token)
 */
export async function logout(refreshToken: string): Promise<boolean> {
    const tokenHash = hashToken(refreshToken);

    for (const [id, token] of refreshTokens) {
        if (token.tokenHash === tokenHash) {
            refreshTokens.delete(id);
            return true;
        }
    }

    return false;
}

/**
 * Get user by ID
 */
export function getUserById(userId: string): User | undefined {
    return users.get(userId);
}

/**
 * Get user from access token
 */
export function getUserFromToken(
    accessToken: string,
    config: JWTConfig = DEFAULT_JWT_CONFIG
): AuthResult<User> {
    const result = verifyAccessToken(accessToken, config);

    if (!result.valid) {
        return {
            success: false,
            error: { code: AuthErrorCode.TOKEN_INVALID, message: result.error },
        };
    }

    const user = users.get(result.payload.sub);

    if (!user) {
        return {
            success: false,
            error: { code: AuthErrorCode.TOKEN_INVALID, message: 'User not found' },
        };
    }

    return {
        success: true,
        data: user,
    };
}

/**
 * Generate access and refresh tokens for a user
 */
async function generateTokens(
    user: User,
    config: JWTConfig = DEFAULT_JWT_CONFIG
): Promise<TokenResponse> {
    // Generate access token
    const accessToken = generateAccessToken({
        sub: user.id,
        tenantId: user.tenantId,
        username: user.username,
        email: user.email,
    }, config);

    // Generate refresh token
    const refreshTokenValue = generateSecureToken(32);
    const tokenHash = hashToken(refreshTokenValue);

    const refreshToken: RefreshToken = {
        id: generateId(),
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + config.refreshTokenExpiry * 1000).toISOString(),
        createdAt: new Date().toISOString(),
    };

    refreshTokens.set(refreshToken.id, refreshToken);

    return {
        accessToken,
        refreshToken: refreshTokenValue,
        expiresIn: config.accessTokenExpiry,
        tokenType: 'Bearer',
    };
}

/**
 * Clear all stored data (for testing)
 */
export function clearAuthStorage(): void {
    users.clear();
    usersByEmail.clear();
    refreshTokens.clear();
}
