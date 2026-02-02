/**
 * PropFirm Types
 * Core types for white-label prop firm integration
 */

// ============================================
// Tenant Types
// ============================================

/**
 * Tenant branding configuration
 */
export interface TenantBranding {
    name: string;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    website?: string;
    supportEmail?: string;
}

/**
 * Tenant configuration
 */
export interface Tenant {
    id: string;
    name: string;
    apiKey: string;
    apiKeyHash: string;
    branding: TenantBranding;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// Account Types
// ============================================

/**
 * Account status
 */
export enum AccountStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    EVALUATION = 'evaluation',
    FUNDED = 'funded',
    BREACHED = 'breached',
    SUSPENDED = 'suspended',
    CLOSED = 'closed',
}

/**
 * Account model type
 */
export enum AccountModel {
    INSTANT_FUNDING = 'instant_funding',
    EVALUATION = 'evaluation',
    CHALLENGE = 'challenge',
}

/**
 * Account configuration
 */
export interface AccountConfig {
    initialBalance: number;
    maxDailyLoss: number;       // As percentage (e.g., 0.05 = 5%)
    maxTotalLoss: number;       // As percentage
    profitTarget?: number;      // For evaluation accounts
    minTradingDays?: number;    // Consistency requirement
    maxPositionSize?: number;   // Position size limit
    allowedSymbols?: string[];  // Symbol whitelist
    leverage: number;
}

/**
 * Trading account
 */
export interface Account {
    id: string;
    tenantId: string;
    userId: string;
    externalId?: string;        // External reference ID
    model: AccountModel;
    status: AccountStatus;
    config: AccountConfig;
    balance: number;
    equity: number;
    highWaterMark: number;      // Peak equity for drawdown calc
    dailyPnL: number;
    totalPnL: number;
    tradingDays: number;
    createdAt: string;
    updatedAt: string;
    breachedAt?: string;
    breachReason?: string;
}

/**
 * Account creation request
 */
export interface CreateAccountRequest {
    userId: string;
    externalId?: string;
    model: AccountModel;
    config: AccountConfig;
}

// ============================================
// Rule Types
// ============================================

/**
 * Rule type
 */
export enum RuleType {
    DAILY_LOSS = 'daily_loss',
    MAX_LOSS = 'max_loss',
    DRAWDOWN = 'drawdown',
    CONSISTENCY = 'consistency',
    PROFIT_TARGET = 'profit_target',
    MIN_TRADING_DAYS = 'min_trading_days',
    POSITION_SIZE = 'position_size',
    SYMBOL_RESTRICTION = 'symbol_restriction',
}

/**
 * Violation severity
 */
export enum ViolationSeverity {
    WARNING = 'warning',
    BREACH = 'breach',
    CRITICAL = 'critical',
}

/**
 * Rule violation
 */
export interface RuleViolation {
    id: string;
    accountId: string;
    tenantId: string;
    ruleType: RuleType;
    severity: ViolationSeverity;
    threshold: number;
    actualValue: number;
    message: string;
    timestamp: string;
}

/**
 * Rule check result
 */
export interface RuleCheckResult {
    passed: boolean;
    ruleType: RuleType;
    violation?: RuleViolation;
}

// ============================================
// Webhook Types
// ============================================

/**
 * Webhook signal type
 */
export enum WebhookSignalType {
    BUY = 'buy',
    SELL = 'sell',
    CLOSE = 'close',
    CLOSE_ALL = 'close_all',
}

/**
 * Webhook payload
 */
export interface WebhookPayload {
    accountId: string;
    signal: WebhookSignalType;
    symbol: string;
    quantity?: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
    comment?: string;
    timestamp: string;
}

/**
 * Webhook configuration
 */
export interface WebhookConfig {
    id: string;
    accountId: string;
    tenantId: string;
    secretKey: string;
    secretKeyHash: string;
    rateLimit: number;          // Requests per minute
    isActive: boolean;
    allowedIPs?: string[];
    createdAt: string;
}

/**
 * Webhook validation result
 */
export interface WebhookValidationResult {
    valid: boolean;
    error?: string;
    payload?: WebhookPayload;
}

// ============================================
// Audit Types
// ============================================

/**
 * Audit action type
 */
export enum AuditAction {
    ACCOUNT_CREATED = 'account.created',
    ACCOUNT_UPDATED = 'account.updated',
    ACCOUNT_BREACHED = 'account.breached',
    ACCOUNT_CLOSED = 'account.closed',
    TRADE_EXECUTED = 'trade.executed',
    TRADE_CLOSED = 'trade.closed',
    RULE_CHECKED = 'rule.checked',
    RULE_VIOLATED = 'rule.violated',
    WEBHOOK_RECEIVED = 'webhook.received',
    WEBHOOK_REJECTED = 'webhook.rejected',
    USER_LOGIN = 'user.login',
    CONFIG_CHANGED = 'config.changed',
}

/**
 * Audit log entry
 */
export interface AuditEntry {
    id: string;
    tenantId: string;
    accountId?: string;
    userId?: string;
    action: AuditAction;
    details: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
}

/**
 * Audit query options
 */
export interface AuditQueryOptions {
    tenantId: string;
    accountId?: string;
    userId?: string;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

// ============================================
// Event Types
// ============================================

/**
 * PropFirm event types
 */
export enum PropFirmEventType {
    ACCOUNT_CREATED = 'propfirm.account.created',
    ACCOUNT_STATUS_CHANGED = 'propfirm.account.status_changed',
    ACCOUNT_BREACHED = 'propfirm.account.breached',
    TRADE_EXECUTED = 'propfirm.trade.executed',
    RULE_VIOLATION = 'propfirm.rule.violation',
    WEBHOOK_PROCESSED = 'propfirm.webhook.processed',
    DAILY_SUMMARY = 'propfirm.daily.summary',
}

/**
 * PropFirm event
 */
export interface PropFirmEvent {
    type: PropFirmEventType;
    tenantId: string;
    accountId?: string;
    data: Record<string, unknown>;
    timestamp: string;
}
