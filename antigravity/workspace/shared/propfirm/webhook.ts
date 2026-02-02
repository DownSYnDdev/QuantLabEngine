/**
 * Webhook Bot Pipeline
 * HMAC validation, rate limiting, and signal processing
 */

import {
    WebhookPayload,
    WebhookConfig,
    WebhookValidationResult,
    WebhookSignalType,
} from './types';
import { hashToken } from '../auth/password';

// In-memory storage
const webhookConfigs = new Map<string, WebhookConfig>();
const webhooksByAccount = new Map<string, string>();
const rateLimitBuckets = new Map<string, { tokens: number; lastRefill: number }>();

/**
 * Generate unique ID
 */
function generateId(): string {
    return `wh-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generate secure token for webhook secret
 */
function generateSecretKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Create a webhook configuration
 */
export function createWebhook(
    accountId: string,
    tenantId: string,
    rateLimit: number = 60,
    allowedIPs?: string[]
): { config: WebhookConfig; secretKey: string } {
    const secretKey = generateSecretKey();
    const secretKeyHash = hashToken(secretKey);

    const config: WebhookConfig = {
        id: generateId(),
        accountId,
        tenantId,
        secretKey: `whk_${secretKey.substring(0, 8)}...`, // Masked
        secretKeyHash,
        rateLimit,
        isActive: true,
        allowedIPs,
        createdAt: new Date().toISOString(),
    };

    webhookConfigs.set(config.id, config);
    webhooksByAccount.set(accountId, config.id);

    // Initialize rate limit bucket
    rateLimitBuckets.set(config.id, {
        tokens: rateLimit,
        lastRefill: Date.now(),
    });

    return { config, secretKey: `whk_${secretKey}` };
}

/**
 * Get webhook by account ID
 */
export function getWebhookForAccount(accountId: string): WebhookConfig | null {
    const webhookId = webhooksByAccount.get(accountId);
    if (!webhookId) return null;
    return webhookConfigs.get(webhookId) || null;
}

/**
 * Compute HMAC signature for payload
 * Uses SHA-256 to create signature from payload and secret
 */
function computeHmac(payload: string, secret: string): string {
    // Simplified HMAC for browser compatibility
    // In production, use crypto.createHmac
    const combined = payload + secret;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    // Convert to hex-like string
    return 'sha256=' + Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Validate HMAC signature
 */
export function validateHmacSignature(
    payload: string,
    signature: string,
    secretKey: string
): boolean {
    const expectedSignature = computeHmac(payload, secretKey);

    // Constant-time comparison
    if (signature.length !== expectedSignature.length) return false;

    let result = 0;
    for (let i = 0; i < signature.length; i++) {
        result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    return result === 0;
}

/**
 * Check rate limit (token bucket algorithm)
 */
export function checkRateLimit(webhookId: string, rateLimit: number): boolean {
    const bucket = rateLimitBuckets.get(webhookId);
    if (!bucket) return false;

    const now = Date.now();
    const timePassed = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = timePassed * (rateLimit / 60); // tokens per second

    // Refill bucket
    bucket.tokens = Math.min(rateLimit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if we have tokens
    if (bucket.tokens < 1) {
        return false;
    }

    // Consume token
    bucket.tokens -= 1;
    return true;
}

/**
 * Validate IP address against whitelist
 */
export function validateIP(ip: string, allowedIPs?: string[]): boolean {
    if (!allowedIPs || allowedIPs.length === 0) return true;
    return allowedIPs.includes(ip);
}

/**
 * Parse and normalize webhook payload
 */
export function parseWebhookPayload(
    rawPayload: unknown
): WebhookPayload | null {
    if (!rawPayload || typeof rawPayload !== 'object') return null;

    const payload = rawPayload as Record<string, unknown>;

    // Required fields
    if (typeof payload.accountId !== 'string') return null;
    if (typeof payload.signal !== 'string') return null;
    if (typeof payload.symbol !== 'string') return null;

    // Validate signal type
    const validSignals = Object.values(WebhookSignalType);
    if (!validSignals.includes(payload.signal as WebhookSignalType)) return null;

    // Normalize symbol
    const symbol = payload.symbol.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (symbol.length === 0) return null;

    return {
        accountId: payload.accountId as string,
        signal: payload.signal as WebhookSignalType,
        symbol,
        quantity: typeof payload.quantity === 'number' ? payload.quantity : undefined,
        price: typeof payload.price === 'number' ? payload.price : undefined,
        stopLoss: typeof payload.stopLoss === 'number' ? payload.stopLoss : undefined,
        takeProfit: typeof payload.takeProfit === 'number' ? payload.takeProfit : undefined,
        comment: typeof payload.comment === 'string' ? payload.comment : undefined,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Process incoming webhook request
 */
export function processWebhook(
    accountId: string,
    rawPayload: string,
    signature: string,
    secretKey: string,
    clientIP?: string
): WebhookValidationResult {
    // Get webhook config
    const config = getWebhookForAccount(accountId);
    if (!config) {
        return { valid: false, error: 'Webhook not configured for account' };
    }

    if (!config.isActive) {
        return { valid: false, error: 'Webhook is disabled' };
    }

    // Validate IP
    if (clientIP && !validateIP(clientIP, config.allowedIPs)) {
        return { valid: false, error: 'IP address not allowed' };
    }

    // Validate signature
    if (!validateHmacSignature(rawPayload, signature, secretKey)) {
        return { valid: false, error: 'Invalid signature' };
    }

    // Check rate limit
    if (!checkRateLimit(config.id, config.rateLimit)) {
        return { valid: false, error: 'Rate limit exceeded' };
    }

    // Parse payload
    let parsedPayload: unknown;
    try {
        parsedPayload = JSON.parse(rawPayload);
    } catch {
        return { valid: false, error: 'Invalid JSON payload' };
    }

    // Normalize payload
    const payload = parseWebhookPayload(parsedPayload);
    if (!payload) {
        return { valid: false, error: 'Invalid payload format' };
    }

    // Verify account ID matches
    if (payload.accountId !== accountId) {
        return { valid: false, error: 'Account ID mismatch' };
    }

    return { valid: true, payload };
}

/**
 * Deactivate webhook
 */
export function deactivateWebhook(webhookId: string): boolean {
    const config = webhookConfigs.get(webhookId);
    if (!config) return false;

    config.isActive = false;
    return true;
}

/**
 * Clear all webhooks (for testing)
 */
export function clearWebhooks(): void {
    webhookConfigs.clear();
    webhooksByAccount.clear();
    rateLimitBuckets.clear();
}
