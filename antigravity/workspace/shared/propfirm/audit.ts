/**
 * Audit Logging System
 * Immutable, tenant-isolated audit trail
 */

import {
    AuditEntry,
    AuditAction,
    AuditQueryOptions,
} from './types';

// In-memory storage (append-only)
const auditLog: AuditEntry[] = [];
const auditByTenant = new Map<string, number[]>();
const auditByAccount = new Map<string, number[]>();

/**
 * Generate unique ID
 */
function generateId(): string {
    return `aud-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Log an audit entry
 */
export function logAudit(
    tenantId: string,
    action: AuditAction,
    details: Record<string, unknown>,
    options?: {
        accountId?: string;
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
    }
): AuditEntry {
    const entry: AuditEntry = {
        id: generateId(),
        tenantId,
        accountId: options?.accountId,
        userId: options?.userId,
        action,
        details,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        timestamp: new Date().toISOString(),
    };

    // Append to log (immutable)
    const index = auditLog.length;
    auditLog.push(entry);

    // Index by tenant
    if (!auditByTenant.has(tenantId)) {
        auditByTenant.set(tenantId, []);
    }
    auditByTenant.get(tenantId)!.push(index);

    // Index by account
    if (options?.accountId) {
        const key = `${tenantId}:${options.accountId}`;
        if (!auditByAccount.has(key)) {
            auditByAccount.set(key, []);
        }
        auditByAccount.get(key)!.push(index);
    }

    return entry;
}

/**
 * Log account creation
 */
export function logAccountCreated(
    tenantId: string,
    accountId: string,
    userId: string,
    config: Record<string, unknown>
): AuditEntry {
    return logAudit(tenantId, AuditAction.ACCOUNT_CREATED, {
        initialBalance: config.initialBalance,
        model: config.model,
        maxDailyLoss: config.maxDailyLoss,
        maxTotalLoss: config.maxTotalLoss,
    }, { accountId, userId });
}

/**
 * Log trade execution
 */
export function logTradeExecuted(
    tenantId: string,
    accountId: string,
    trade: Record<string, unknown>
): AuditEntry {
    return logAudit(tenantId, AuditAction.TRADE_EXECUTED, trade, { accountId });
}

/**
 * Log rule violation
 */
export function logRuleViolation(
    tenantId: string,
    accountId: string,
    violation: Record<string, unknown>
): AuditEntry {
    return logAudit(tenantId, AuditAction.RULE_VIOLATED, violation, { accountId });
}

/**
 * Log account breach
 */
export function logAccountBreach(
    tenantId: string,
    accountId: string,
    reason: string
): AuditEntry {
    return logAudit(tenantId, AuditAction.ACCOUNT_BREACHED, { reason }, { accountId });
}

/**
 * Log webhook received
 */
export function logWebhookReceived(
    tenantId: string,
    accountId: string,
    signal: string,
    ipAddress?: string
): AuditEntry {
    return logAudit(tenantId, AuditAction.WEBHOOK_RECEIVED, { signal }, {
        accountId,
        ipAddress
    });
}

/**
 * Log webhook rejection
 */
export function logWebhookRejected(
    tenantId: string,
    accountId: string,
    reason: string,
    ipAddress?: string
): AuditEntry {
    return logAudit(tenantId, AuditAction.WEBHOOK_REJECTED, { reason }, {
        accountId,
        ipAddress
    });
}

/**
 * Query audit logs with tenant isolation
 */
export function queryAuditLogs(options: AuditQueryOptions): AuditEntry[] {
    let indices: number[];

    // Start with tenant-filtered indices
    if (options.accountId) {
        const key = `${options.tenantId}:${options.accountId}`;
        indices = auditByAccount.get(key) || [];
    } else {
        indices = auditByTenant.get(options.tenantId) || [];
    }

    // Get entries
    let entries = indices.map(i => auditLog[i]);

    // Filter by action
    if (options.action) {
        entries = entries.filter(e => e.action === options.action);
    }

    // Filter by user
    if (options.userId) {
        entries = entries.filter(e => e.userId === options.userId);
    }

    // Filter by date range
    if (options.startDate) {
        entries = entries.filter(e => e.timestamp >= options.startDate!);
    }
    if (options.endDate) {
        entries = entries.filter(e => e.timestamp <= options.endDate!);
    }

    // Sort by timestamp descending (newest first)
    entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 100;

    return entries.slice(offset, offset + limit);
}

/**
 * Get audit log count for tenant
 */
export function getAuditCount(tenantId: string): number {
    const indices = auditByTenant.get(tenantId);
    return indices?.length || 0;
}

/**
 * Get recent activity for account
 */
export function getRecentActivity(
    tenantId: string,
    accountId: string,
    limit: number = 10
): AuditEntry[] {
    return queryAuditLogs({
        tenantId,
        accountId,
        limit,
    });
}

/**
 * Export audit log for compliance (JSON format)
 */
export function exportAuditLog(
    tenantId: string,
    startDate?: string,
    endDate?: string
): string {
    const entries = queryAuditLogs({
        tenantId,
        startDate,
        endDate,
        limit: 10000, // Max export size
    });

    return JSON.stringify(entries, null, 2);
}

/**
 * Get audit trail summary for account
 */
export function getAccountAuditSummary(
    tenantId: string,
    accountId: string
): {
    totalEntries: number;
    tradeCount: number;
    violationCount: number;
    lastActivity: string | null;
} {
    const entries = queryAuditLogs({ tenantId, accountId, limit: 10000 });

    const tradeCount = entries.filter(e =>
        e.action === AuditAction.TRADE_EXECUTED
    ).length;

    const violationCount = entries.filter(e =>
        e.action === AuditAction.RULE_VIOLATED
    ).length;

    return {
        totalEntries: entries.length,
        tradeCount,
        violationCount,
        lastActivity: entries[0]?.timestamp || null,
    };
}

/**
 * Clear audit log (for testing only - should never be used in production)
 */
export function clearAuditLog(): void {
    auditLog.length = 0;
    auditByTenant.clear();
    auditByAccount.clear();
}
