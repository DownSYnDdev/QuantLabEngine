/**
 * PropFirm Module Index
 * Re-exports all PropFirm integration layer functionality
 */

// Types
export {
    // Tenant types
    Tenant,
    TenantBranding,

    // Account types
    Account,
    AccountStatus,
    AccountModel,
    AccountConfig,
    CreateAccountRequest,

    // Rule types
    RuleType,
    RuleCheckResult,
    RuleViolation,
    ViolationSeverity,

    // Webhook types
    WebhookPayload,
    WebhookConfig,
    WebhookValidationResult,
    WebhookSignalType,

    // Audit types
    AuditEntry,
    AuditAction,
    AuditQueryOptions,

    // Event types
    PropFirmEvent,
    PropFirmEventType,
} from './types';

// Tenant management
export {
    createTenant,
    getTenant,
    validateApiKey,
    updateTenantBranding,
    deactivateTenant,
    listTenants,
    rotateApiKey,
    enforceTenantIsolation,
    clearTenants,
    CreateTenantRequest,
} from './tenant';

// Account provisioning
export {
    createAccount,
    getAccount,
    getAccountForTenant,
    listAccountsForTenant,
    listAccountsForUser,
    updateAccountEquity,
    incrementTradingDays,
    breachAccount,
    promoteToFunded,
    resetDailyPnL,
    validateAccountConfig,
    getDefaultConfig,
    clearAccounts,
} from './account';

// Rule enforcement
export {
    checkDailyLoss,
    checkMaxLoss,
    checkDrawdown,
    checkConsistency,
    checkProfitTarget,
    checkMinTradingDays,
    runAllRuleChecks,
    hasBreachingViolation,
    getViolations,
    getBreaches,
} from './rules';

// Webhook pipeline
export {
    createWebhook,
    getWebhookForAccount,
    validateHmacSignature,
    checkRateLimit,
    validateIP,
    parseWebhookPayload,
    processWebhook,
    deactivateWebhook,
    clearWebhooks,
} from './webhook';

// Audit logging
export {
    logAudit,
    logAccountCreated,
    logTradeExecuted,
    logRuleViolation,
    logAccountBreach,
    logWebhookReceived,
    logWebhookRejected,
    queryAuditLogs,
    getAuditCount,
    getRecentActivity,
    exportAuditLog,
    getAccountAuditSummary,
    clearAuditLog,
} from './audit';

// Events
export {
    on,
    onAll,
    off,
    emit,
    emitAccountCreated,
    emitAccountStatusChanged,
    emitAccountBreach,
    emitTradeExecuted,
    emitRuleViolation,
    emitWebhookProcessed,
    emitDailySummary,
    getListenerCount,
    clearListeners,
} from './events';
