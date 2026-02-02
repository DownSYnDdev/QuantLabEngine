/**
 * Account Provisioning
 * Account creation, management, and state transitions
 */

import {
    Account,
    AccountStatus,
    AccountModel,
    AccountConfig,
    CreateAccountRequest,
} from './types';

// In-memory storage (replace with database)
const accounts = new Map<string, Account>();
const accountsByTenant = new Map<string, Set<string>>();
const accountsByUser = new Map<string, Set<string>>();

/**
 * Generate unique ID
 */
function generateId(): string {
    return `acc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Validate account configuration
 */
export function validateAccountConfig(config: AccountConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.initialBalance <= 0) {
        errors.push('Initial balance must be positive');
    }

    if (config.maxDailyLoss <= 0 || config.maxDailyLoss > 1) {
        errors.push('Max daily loss must be between 0 and 1 (0-100%)');
    }

    if (config.maxTotalLoss <= 0 || config.maxTotalLoss > 1) {
        errors.push('Max total loss must be between 0 and 1 (0-100%)');
    }

    if (config.maxDailyLoss > config.maxTotalLoss) {
        errors.push('Max daily loss cannot exceed max total loss');
    }

    if (config.leverage <= 0 || config.leverage > 500) {
        errors.push('Leverage must be between 1 and 500');
    }

    if (config.profitTarget !== undefined && config.profitTarget <= 0) {
        errors.push('Profit target must be positive');
    }

    if (config.minTradingDays !== undefined && config.minTradingDays < 0) {
        errors.push('Minimum trading days cannot be negative');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Get default config for account model
 */
export function getDefaultConfig(model: AccountModel): AccountConfig {
    switch (model) {
        case AccountModel.INSTANT_FUNDING:
            return {
                initialBalance: 100000,
                maxDailyLoss: 0.05,      // 5%
                maxTotalLoss: 0.10,      // 10%
                leverage: 100,
            };
        case AccountModel.EVALUATION:
            return {
                initialBalance: 100000,
                maxDailyLoss: 0.05,
                maxTotalLoss: 0.10,
                profitTarget: 0.08,      // 8% target
                minTradingDays: 5,
                leverage: 100,
            };
        case AccountModel.CHALLENGE:
            return {
                initialBalance: 100000,
                maxDailyLoss: 0.05,
                maxTotalLoss: 0.08,      // Tighter for challenge
                profitTarget: 0.10,      // 10% target
                minTradingDays: 10,
                leverage: 100,
            };
    }
}

/**
 * Create a new trading account
 */
export function createAccount(
    tenantId: string,
    request: CreateAccountRequest
): Account | { error: string } {
    // Validate config
    const validation = validateAccountConfig(request.config);
    if (!validation.valid) {
        return { error: validation.errors.join('; ') };
    }

    const now = new Date().toISOString();
    const initialStatus = request.model === AccountModel.INSTANT_FUNDING
        ? AccountStatus.FUNDED
        : AccountStatus.EVALUATION;

    const account: Account = {
        id: generateId(),
        tenantId,
        userId: request.userId,
        externalId: request.externalId,
        model: request.model,
        status: initialStatus,
        config: request.config,
        balance: request.config.initialBalance,
        equity: request.config.initialBalance,
        highWaterMark: request.config.initialBalance,
        dailyPnL: 0,
        totalPnL: 0,
        tradingDays: 0,
        createdAt: now,
        updatedAt: now,
    };

    // Store account
    accounts.set(account.id, account);

    // Index by tenant
    if (!accountsByTenant.has(tenantId)) {
        accountsByTenant.set(tenantId, new Set());
    }
    accountsByTenant.get(tenantId)!.add(account.id);

    // Index by user
    if (!accountsByUser.has(request.userId)) {
        accountsByUser.set(request.userId, new Set());
    }
    accountsByUser.get(request.userId)!.add(account.id);

    return account;
}

/**
 * Get account by ID
 */
export function getAccount(accountId: string): Account | null {
    return accounts.get(accountId) || null;
}

/**
 * Get account with tenant isolation
 */
export function getAccountForTenant(accountId: string, tenantId: string): Account | null {
    const account = accounts.get(accountId);
    if (!account || account.tenantId !== tenantId) return null;
    return account;
}

/**
 * List accounts for tenant
 */
export function listAccountsForTenant(tenantId: string): Account[] {
    const ids = accountsByTenant.get(tenantId);
    if (!ids) return [];

    const result: Account[] = [];
    for (const id of ids) {
        const account = accounts.get(id);
        if (account) result.push(account);
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * List accounts for user
 */
export function listAccountsForUser(userId: string, tenantId: string): Account[] {
    const ids = accountsByUser.get(userId);
    if (!ids) return [];

    const result: Account[] = [];
    for (const id of ids) {
        const account = accounts.get(id);
        if (account && account.tenantId === tenantId) result.push(account);
    }
    return result;
}

/**
 * Update account equity and PnL
 */
export function updateAccountEquity(
    accountId: string,
    equity: number,
    dailyPnL: number
): Account | null {
    const account = accounts.get(accountId);
    if (!account) return null;

    account.equity = equity;
    account.dailyPnL = dailyPnL;
    account.totalPnL = equity - account.config.initialBalance;
    account.balance = equity; // For simplicity, balance = equity when no open positions

    // Update high water mark
    if (equity > account.highWaterMark) {
        account.highWaterMark = equity;
    }

    account.updatedAt = new Date().toISOString();

    return account;
}

/**
 * Increment trading days
 */
export function incrementTradingDays(accountId: string): Account | null {
    const account = accounts.get(accountId);
    if (!account) return null;

    account.tradingDays++;
    account.updatedAt = new Date().toISOString();

    return account;
}

/**
 * Breach account
 */
export function breachAccount(accountId: string, reason: string): Account | null {
    const account = accounts.get(accountId);
    if (!account) return null;

    account.status = AccountStatus.BREACHED;
    account.breachedAt = new Date().toISOString();
    account.breachReason = reason;
    account.updatedAt = account.breachedAt;

    return account;
}

/**
 * Promote evaluation account to funded
 */
export function promoteToFunded(accountId: string): Account | null {
    const account = accounts.get(accountId);
    if (!account) return null;

    if (account.status !== AccountStatus.EVALUATION) {
        return null; // Can only promote from evaluation
    }

    account.status = AccountStatus.FUNDED;
    account.updatedAt = new Date().toISOString();

    return account;
}

/**
 * Reset daily PnL (called at end of day)
 */
export function resetDailyPnL(accountId: string): Account | null {
    const account = accounts.get(accountId);
    if (!account) return null;

    account.dailyPnL = 0;
    account.updatedAt = new Date().toISOString();

    return account;
}

/**
 * Clear all accounts (for testing)
 */
export function clearAccounts(): void {
    accounts.clear();
    accountsByTenant.clear();
    accountsByUser.clear();
}
