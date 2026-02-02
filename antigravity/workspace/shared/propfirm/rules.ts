/**
 * Rule Enforcement Engine
 * Real-time validation of trading rules
 */

import {
    Account,
    RuleType,
    RuleCheckResult,
    RuleViolation,
    ViolationSeverity,
} from './types';

/**
 * Generate unique ID
 */
function generateId(): string {
    return `vio-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Create a rule violation
 */
function createViolation(
    account: Account,
    ruleType: RuleType,
    severity: ViolationSeverity,
    threshold: number,
    actualValue: number,
    message: string
): RuleViolation {
    return {
        id: generateId(),
        accountId: account.id,
        tenantId: account.tenantId,
        ruleType,
        severity,
        threshold,
        actualValue,
        message,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Check daily loss limit
 * Triggers if daily P&L exceeds max daily loss threshold
 */
export function checkDailyLoss(account: Account): RuleCheckResult {
    const maxDailyLossAmount = account.config.initialBalance * account.config.maxDailyLoss;
    const currentDailyLoss = -account.dailyPnL; // Negative PnL = loss

    // Warning at 80% of limit
    const warningThreshold = maxDailyLossAmount * 0.8;

    if (currentDailyLoss >= maxDailyLossAmount) {
        return {
            passed: false,
            ruleType: RuleType.DAILY_LOSS,
            violation: createViolation(
                account,
                RuleType.DAILY_LOSS,
                ViolationSeverity.BREACH,
                account.config.maxDailyLoss,
                currentDailyLoss / account.config.initialBalance,
                `Daily loss limit breached: $${currentDailyLoss.toFixed(2)} exceeds max $${maxDailyLossAmount.toFixed(2)}`
            ),
        };
    }

    if (currentDailyLoss >= warningThreshold) {
        return {
            passed: true, // Warning, not breach
            ruleType: RuleType.DAILY_LOSS,
            violation: createViolation(
                account,
                RuleType.DAILY_LOSS,
                ViolationSeverity.WARNING,
                account.config.maxDailyLoss,
                currentDailyLoss / account.config.initialBalance,
                `Approaching daily loss limit: $${currentDailyLoss.toFixed(2)} (80% of max)`
            ),
        };
    }

    return { passed: true, ruleType: RuleType.DAILY_LOSS };
}

/**
 * Check maximum total loss
 * Triggers if total drawdown from initial balance exceeds threshold
 */
export function checkMaxLoss(account: Account): RuleCheckResult {
    const maxLossAmount = account.config.initialBalance * account.config.maxTotalLoss;
    const currentTotalLoss = -account.totalPnL; // Negative = loss

    const warningThreshold = maxLossAmount * 0.8;

    if (currentTotalLoss >= maxLossAmount) {
        return {
            passed: false,
            ruleType: RuleType.MAX_LOSS,
            violation: createViolation(
                account,
                RuleType.MAX_LOSS,
                ViolationSeverity.BREACH,
                account.config.maxTotalLoss,
                currentTotalLoss / account.config.initialBalance,
                `Maximum loss limit breached: $${currentTotalLoss.toFixed(2)} exceeds max $${maxLossAmount.toFixed(2)}`
            ),
        };
    }

    if (currentTotalLoss >= warningThreshold) {
        return {
            passed: true,
            ruleType: RuleType.MAX_LOSS,
            violation: createViolation(
                account,
                RuleType.MAX_LOSS,
                ViolationSeverity.WARNING,
                account.config.maxTotalLoss,
                currentTotalLoss / account.config.initialBalance,
                `Approaching max loss limit: $${currentTotalLoss.toFixed(2)} (80% of max)`
            ),
        };
    }

    return { passed: true, ruleType: RuleType.MAX_LOSS };
}

/**
 * Check trailing drawdown from high water mark
 * More strict than max loss - measures from peak equity
 */
export function checkDrawdown(account: Account): RuleCheckResult {
    const drawdownFromPeak = account.highWaterMark - account.equity;
    const maxDrawdownAmount = account.highWaterMark * account.config.maxTotalLoss;

    const warningThreshold = maxDrawdownAmount * 0.8;

    if (drawdownFromPeak >= maxDrawdownAmount) {
        return {
            passed: false,
            ruleType: RuleType.DRAWDOWN,
            violation: createViolation(
                account,
                RuleType.DRAWDOWN,
                ViolationSeverity.BREACH,
                account.config.maxTotalLoss,
                drawdownFromPeak / account.highWaterMark,
                `Drawdown limit breached: $${drawdownFromPeak.toFixed(2)} from peak $${account.highWaterMark.toFixed(2)}`
            ),
        };
    }

    if (drawdownFromPeak >= warningThreshold) {
        return {
            passed: true,
            ruleType: RuleType.DRAWDOWN,
            violation: createViolation(
                account,
                RuleType.DRAWDOWN,
                ViolationSeverity.WARNING,
                account.config.maxTotalLoss,
                drawdownFromPeak / account.highWaterMark,
                `Approaching drawdown limit: $${drawdownFromPeak.toFixed(2)} (80% of max)`
            ),
        };
    }

    return { passed: true, ruleType: RuleType.DRAWDOWN };
}

/**
 * Check profit consistency
 * Ensures no single day contributes more than X% of total profits
 */
export function checkConsistency(
    account: Account,
    maxDayContribution: number = 0.30
): RuleCheckResult {
    // Only check if account has positive P&L
    if (account.totalPnL <= 0 || account.dailyPnL <= 0) {
        return { passed: true, ruleType: RuleType.CONSISTENCY };
    }

    const dayContribution = account.dailyPnL / account.totalPnL;

    if (dayContribution > maxDayContribution) {
        return {
            passed: true, // Warning only, not a breach
            ruleType: RuleType.CONSISTENCY,
            violation: createViolation(
                account,
                RuleType.CONSISTENCY,
                ViolationSeverity.WARNING,
                maxDayContribution,
                dayContribution,
                `Consistency warning: Today's profit (${(dayContribution * 100).toFixed(1)}%) exceeds ${(maxDayContribution * 100).toFixed(0)}% of total`
            ),
        };
    }

    return { passed: true, ruleType: RuleType.CONSISTENCY };
}

/**
 * Check if profit target is met (for evaluation accounts)
 */
export function checkProfitTarget(account: Account): RuleCheckResult {
    if (!account.config.profitTarget) {
        return { passed: true, ruleType: RuleType.PROFIT_TARGET };
    }

    const targetAmount = account.config.initialBalance * account.config.profitTarget;
    const currentProfit = account.totalPnL;

    if (currentProfit >= targetAmount) {
        return {
            passed: true,
            ruleType: RuleType.PROFIT_TARGET,
            // Use "violation" to signal achievement (positive event)
            violation: createViolation(
                account,
                RuleType.PROFIT_TARGET,
                ViolationSeverity.WARNING, // Not a breach - positive!
                account.config.profitTarget,
                currentProfit / account.config.initialBalance,
                `Profit target achieved: $${currentProfit.toFixed(2)} (${(account.config.profitTarget * 100).toFixed(0)}% target)`
            ),
        };
    }

    return { passed: true, ruleType: RuleType.PROFIT_TARGET };
}

/**
 * Check minimum trading days requirement
 */
export function checkMinTradingDays(account: Account): RuleCheckResult {
    if (!account.config.minTradingDays) {
        return { passed: true, ruleType: RuleType.MIN_TRADING_DAYS };
    }

    if (account.tradingDays >= account.config.minTradingDays) {
        return { passed: true, ruleType: RuleType.MIN_TRADING_DAYS };
    }

    return {
        passed: true, // Not a breach, just pending
        ruleType: RuleType.MIN_TRADING_DAYS,
        violation: createViolation(
            account,
            RuleType.MIN_TRADING_DAYS,
            ViolationSeverity.WARNING,
            account.config.minTradingDays,
            account.tradingDays,
            `Trading days: ${account.tradingDays}/${account.config.minTradingDays} required`
        ),
    };
}

/**
 * Run all rule checks on an account
 */
export function runAllRuleChecks(account: Account): RuleCheckResult[] {
    return [
        checkDailyLoss(account),
        checkMaxLoss(account),
        checkDrawdown(account),
        checkConsistency(account),
        checkProfitTarget(account),
        checkMinTradingDays(account),
    ];
}

/**
 * Check if any rule resulted in a breach
 */
export function hasBreachingViolation(results: RuleCheckResult[]): boolean {
    return results.some(r =>
        !r.passed && r.violation?.severity === ViolationSeverity.BREACH
    );
}

/**
 * Get all violations (warnings and breaches)
 */
export function getViolations(results: RuleCheckResult[]): RuleViolation[] {
    return results
        .filter(r => r.violation)
        .map(r => r.violation!);
}

/**
 * Get breach violations only
 */
export function getBreaches(results: RuleCheckResult[]): RuleViolation[] {
    return results
        .filter(r => r.violation?.severity === ViolationSeverity.BREACH)
        .map(r => r.violation!);
}
