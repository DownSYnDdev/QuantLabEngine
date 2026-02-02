/**
 * Tenant Management
 * Tenant configuration, branding, and isolation
 */

import { Tenant, TenantBranding } from './types';
import { generateSecureToken, hashToken } from '../auth/password';

// In-memory storage (replace with database)
const tenants = new Map<string, Tenant>();
const tenantsByApiKey = new Map<string, Tenant>();

/**
 * Generate unique ID
 */
function generateId(): string {
    return `tenant-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Create tenant request
 */
export interface CreateTenantRequest {
    name: string;
    branding?: Partial<TenantBranding>;
}

/**
 * Create a new tenant
 */
export function createTenant(request: CreateTenantRequest): { tenant: Tenant; apiKey: string } {
    const now = new Date().toISOString();
    const apiKey = generateSecureToken(32);
    const apiKeyHash = hashToken(apiKey);

    const tenant: Tenant = {
        id: generateId(),
        name: request.name,
        apiKey: `pk_${apiKey.substring(0, 8)}...`, // Masked for display
        apiKeyHash,
        branding: {
            name: request.name,
            ...request.branding,
        },
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };

    tenants.set(tenant.id, tenant);
    tenantsByApiKey.set(apiKeyHash, tenant);

    return { tenant, apiKey: `pk_${apiKey}` };
}

/**
 * Get tenant by ID
 */
export function getTenant(tenantId: string): Tenant | null {
    return tenants.get(tenantId) || null;
}

/**
 * Validate API key and get tenant
 */
export function validateApiKey(apiKey: string): Tenant | null {
    if (!apiKey.startsWith('pk_')) return null;

    const keyValue = apiKey.substring(3);
    const keyHash = hashToken(keyValue);

    const tenant = tenantsByApiKey.get(keyHash);
    if (!tenant || !tenant.isActive) return null;

    return tenant;
}

/**
 * Update tenant branding
 */
export function updateTenantBranding(
    tenantId: string,
    branding: Partial<TenantBranding>
): Tenant | null {
    const tenant = tenants.get(tenantId);
    if (!tenant) return null;

    tenant.branding = { ...tenant.branding, ...branding };
    tenant.updatedAt = new Date().toISOString();

    return tenant;
}

/**
 * Deactivate tenant
 */
export function deactivateTenant(tenantId: string): boolean {
    const tenant = tenants.get(tenantId);
    if (!tenant) return false;

    tenant.isActive = false;
    tenant.updatedAt = new Date().toISOString();

    return true;
}

/**
 * List all tenants
 */
export function listTenants(): Tenant[] {
    return Array.from(tenants.values());
}

/**
 * Rotate API key for tenant
 */
export async function rotateApiKey(tenantId: string): Promise<{ tenant: Tenant; apiKey: string } | null> {
    const tenant = tenants.get(tenantId);
    if (!tenant) return null;

    // Remove old key mapping
    tenantsByApiKey.delete(tenant.apiKeyHash);

    // Generate new key
    const newApiKey = generateSecureToken(32);
    const newApiKeyHash = hashToken(newApiKey);

    tenant.apiKey = `pk_${newApiKey.substring(0, 8)}...`;
    tenant.apiKeyHash = newApiKeyHash;
    tenant.updatedAt = new Date().toISOString();

    tenantsByApiKey.set(newApiKeyHash, tenant);

    return { tenant, apiKey: `pk_${newApiKey}` };
}

/**
 * Enforce tenant isolation - validates that resource belongs to tenant
 */
export function enforceTenantIsolation<T extends { tenantId: string }>(
    resource: T | null,
    expectedTenantId: string
): T | null {
    if (!resource) return null;
    if (resource.tenantId !== expectedTenantId) return null;
    return resource;
}

/**
 * Clear all tenants (for testing)
 */
export function clearTenants(): void {
    tenants.clear();
    tenantsByApiKey.clear();
}
