/**
 * JWT Utilities
 * JSON Web Token generation and validation
 */

import * as crypto from 'crypto';
import { JWTPayload } from './types';

/**
 * JWT configuration
 */
export interface JWTConfig {
    secret: string;
    accessTokenExpiry: number; // seconds
    refreshTokenExpiry: number; // seconds
    issuer: string;
}

/**
 * Default JWT configuration
 */
export const DEFAULT_JWT_CONFIG: JWTConfig = {
    secret: process.env.JWT_SECRET || 'quantlab-dev-secret-change-in-production',
    accessTokenExpiry: 15 * 60, // 15 minutes
    refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
    issuer: 'quantlab',
};

/**
 * Base64URL encode
 */
function base64URLEncode(data: string): string {
    return Buffer.from(data)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

/**
 * Base64URL decode
 */
function base64URLDecode(data: string): string {
    // Add padding if needed
    const padded = data + '='.repeat((4 - data.length % 4) % 4);
    return Buffer.from(
        padded.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
    ).toString('utf8');
}

/**
 * Create HMAC signature
 */
function createSignature(data: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    return hmac.digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

/**
 * Generate a JWT access token
 */
export function generateAccessToken(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    config: JWTConfig = DEFAULT_JWT_CONFIG
): string {
    const now = Math.floor(Date.now() / 1000);

    const header = {
        alg: 'HS256',
        typ: 'JWT',
    };

    const fullPayload: JWTPayload = {
        ...payload,
        iat: now,
        exp: now + config.accessTokenExpiry,
    };

    const encodedHeader = base64URLEncode(JSON.stringify(header));
    const encodedPayload = base64URLEncode(JSON.stringify(fullPayload));
    const signature = createSignature(`${encodedHeader}.${encodedPayload}`, config.secret);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export function verifyAccessToken(
    token: string,
    config: JWTConfig = DEFAULT_JWT_CONFIG
): { valid: true; payload: JWTPayload } | { valid: false; error: string } {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false, error: 'Invalid token format' };
        }

        const [encodedHeader, encodedPayload, signature] = parts;

        // Verify signature
        const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`, config.secret);

        if (!crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        )) {
            return { valid: false, error: 'Invalid signature' };
        }

        // Decode payload
        const payload: JWTPayload = JSON.parse(base64URLDecode(encodedPayload));

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
            return { valid: false, error: 'Token expired' };
        }

        return { valid: true, payload };

    } catch (err) {
        return { valid: false, error: 'Token parsing failed' };
    }
}

/**
 * Decode token without verification (for debugging only)
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        return JSON.parse(base64URLDecode(parts[1]));
    } catch {
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeToken(token);
    if (!payload) return true;
    return payload.exp < Math.floor(Date.now() / 1000);
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
    const payload = decodeToken(token);
    if (!payload) return null;
    return new Date(payload.exp * 1000);
}
