/**
 * Password Utilities
 * Secure password hashing and verification using bcrypt-compatible approach
 */

import * as crypto from 'crypto';

/**
 * Number of salt rounds for hashing (higher = more secure but slower)
 */
const SALT_ROUNDS = 12;

/**
 * Hash a password using PBKDF2 (Node.js native, bcrypt-like security)
 * Uses 100,000 iterations with SHA-512 for strong security
 */
export async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Generate a random salt
        const salt = crypto.randomBytes(16).toString('hex');

        // Use PBKDF2 with 100,000 iterations (OWASP recommended)
        crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
            if (err) {
                reject(err);
                return;
            }
            // Format: salt:hash
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const [salt, hash] = storedHash.split(':');

        if (!salt || !hash) {
            resolve(false);
            return;
        }

        crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
            if (err) {
                reject(err);
                return;
            }
            // Use timing-safe comparison to prevent timing attacks
            const derivedHash = derivedKey.toString('hex');
            resolve(crypto.timingSafeEqual(
                Buffer.from(hash, 'hex'),
                Buffer.from(derivedHash, 'hex')
            ));
        });
    });
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
        errors.push('Password must be at most 128 characters long');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token for storage (one-way hash for refresh tokens)
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}
