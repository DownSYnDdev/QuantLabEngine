/**
 * PropFirm Event System
 * Event emitter for rule violations, trades, account changes
 */

import {
    PropFirmEvent,
    PropFirmEventType,
    RuleViolation,
    Account,
    WebhookPayload,
} from './types';

// Event listeners
type EventListener = (event: PropFirmEvent) => void;
const listeners = new Map<PropFirmEventType, Set<EventListener>>();
const globalListeners = new Set<EventListener>();

/**
 * Subscribe to specific event type
 */
export function on(eventType: PropFirmEventType, listener: EventListener): () => void {
    if (!listeners.has(eventType)) {
        listeners.set(eventType, new Set());
    }
    listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => off(eventType, listener);
}

/**
 * Subscribe to all events
 */
export function onAll(listener: EventListener): () => void {
    globalListeners.add(listener);
    return () => globalListeners.delete(listener);
}

/**
 * Unsubscribe from specific event type
 */
export function off(eventType: PropFirmEventType, listener: EventListener): void {
    listeners.get(eventType)?.delete(listener);
}

/**
 * Emit an event
 */
export function emit(event: PropFirmEvent): void {
    // Notify type-specific listeners
    const typeListeners = listeners.get(event.type);
    if (typeListeners) {
        for (const listener of typeListeners) {
            try {
                listener(event);
            } catch (err) {
                console.error(`Event listener error for ${event.type}:`, err);
            }
        }
    }

    // Notify global listeners
    for (const listener of globalListeners) {
        try {
            listener(event);
        } catch (err) {
            console.error(`Global event listener error:`, err);
        }
    }
}

/**
 * Emit account created event
 */
export function emitAccountCreated(account: Account): void {
    emit({
        type: PropFirmEventType.ACCOUNT_CREATED,
        tenantId: account.tenantId,
        accountId: account.id,
        data: {
            userId: account.userId,
            model: account.model,
            status: account.status,
            initialBalance: account.config.initialBalance,
        },
        timestamp: new Date().toISOString(),
    });
}

/**
 * Emit account status change event
 */
export function emitAccountStatusChanged(
    account: Account,
    previousStatus: string
): void {
    emit({
        type: PropFirmEventType.ACCOUNT_STATUS_CHANGED,
        tenantId: account.tenantId,
        accountId: account.id,
        data: {
            previousStatus,
            newStatus: account.status,
            equity: account.equity,
        },
        timestamp: new Date().toISOString(),
    });
}

/**
 * Emit account breach event
 */
export function emitAccountBreach(account: Account, reason: string): void {
    emit({
        type: PropFirmEventType.ACCOUNT_BREACHED,
        tenantId: account.tenantId,
        accountId: account.id,
        data: {
            reason,
            equity: account.equity,
            totalPnL: account.totalPnL,
            dailyPnL: account.dailyPnL,
        },
        timestamp: new Date().toISOString(),
    });
}

/**
 * Emit trade execution event
 */
export function emitTradeExecuted(
    tenantId: string,
    accountId: string,
    trade: {
        symbol: string;
        side: string;
        quantity: number;
        price: number;
        pnl?: number;
    }
): void {
    emit({
        type: PropFirmEventType.TRADE_EXECUTED,
        tenantId,
        accountId,
        data: trade,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Emit rule violation event
 */
export function emitRuleViolation(violation: RuleViolation): void {
    emit({
        type: PropFirmEventType.RULE_VIOLATION,
        tenantId: violation.tenantId,
        accountId: violation.accountId,
        data: {
            ruleType: violation.ruleType,
            severity: violation.severity,
            threshold: violation.threshold,
            actualValue: violation.actualValue,
            message: violation.message,
        },
        timestamp: violation.timestamp,
    });
}

/**
 * Emit webhook processed event
 */
export function emitWebhookProcessed(
    tenantId: string,
    accountId: string,
    payload: WebhookPayload,
    success: boolean
): void {
    emit({
        type: PropFirmEventType.WEBHOOK_PROCESSED,
        tenantId,
        accountId,
        data: {
            signal: payload.signal,
            symbol: payload.symbol,
            success,
        },
        timestamp: new Date().toISOString(),
    });
}

/**
 * Emit daily summary event
 */
export function emitDailySummary(
    tenantId: string,
    accountId: string,
    summary: {
        openingEquity: number;
        closingEquity: number;
        dailyPnL: number;
        tradeCount: number;
        isNewHighWaterMark: boolean;
    }
): void {
    emit({
        type: PropFirmEventType.DAILY_SUMMARY,
        tenantId,
        accountId,
        data: summary,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Get listener count for debugging
 */
export function getListenerCount(eventType?: PropFirmEventType): number {
    if (eventType) {
        return listeners.get(eventType)?.size || 0;
    }
    let total = globalListeners.size;
    for (const set of listeners.values()) {
        total += set.size;
    }
    return total;
}

/**
 * Clear all listeners (for testing)
 */
export function clearListeners(): void {
    listeners.clear();
    globalListeners.clear();
}
