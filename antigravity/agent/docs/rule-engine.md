# Rule Enforcement Engine

## Overview

The Rule Enforcement Engine validates all trading activity against account-specific constraints defined in provisioned configs. Rules are evaluated on every simulated fill and at periodic checkpoints to ensure accounts comply with daily loss limits, max drawdown, consistency requirements, and minimum trading days.

## Rule Types

### 1. Daily Loss Limit
Maximum loss allowed in a single trading day.

**Config Schema:**
```json
{
  "dailyLossLimit": {
    "enabled": true,
    "value": 2000,
    "currency": "USD",
    "calculationMethod": "startOfDay"
  }
}
```

**Evaluation:**
- Triggered on every fill
- Compares current day P&L against limit
- Emits `rule.violation.daily_loss_limit` if breached

### 2. Max Drawdown
Maximum cumulative loss from peak balance.

**Config Schema:**
```json
{
  "maxDrawdown": {
    "enabled": true,
    "value": 5000,
    "currency": "USD",
    "calculationType": "balance-based"
  }
}
```

**Evaluation:**
- Triggered on every fill
- Tracks highest balance achieved
- Emits `rule.violation.max_drawdown` if breached

### 3. Minimum Trading Days
Required number of trading days before payout eligibility.

**Config Schema:**
```json
{
  "minTradingDays": {
    "enabled": true,
    "value": 5,
    "definition": "days_with_at_least_one_trade"
  }
}
```

**Evaluation:**
- Evaluated at milestone checkpoints
- Counts unique calendar days with fills

### 4. Consistency Rule
Prevents single-day profits from exceeding a percentage of total profit.

**Config Schema:**
```json
{
  "consistencyRule": {
    "enabled": true,
    "maxSingleDayProfitPercent": 40,
    "evaluationWindow": "entire_period"
  }
}
```

**Evaluation:**
- Evaluated at milestone checkpoints
- Ensures balanced profit distribution

## Rule Engine Architecture

```
┌─────────────────┐
│  Simulated Fill │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Rule Engine        │
│  - Load config      │
│  - Evaluate rules   │
│  - Calculate state  │
└────────┬────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌──────────────┐
│ Pass   │  │ Violation    │
└────────┘  └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │ Emit Event   │
            │ Write Audit  │
            └──────────────┘
```

## Event Emission

When a rule is violated, the engine emits events:

**Example Violation Event:**
```json
{
  "eventId": "evt_abc123",
  "eventType": "rule.violation.daily_loss_limit",
  "tenantId": "tenant_001",
  "accountId": "acc_50k_001",
  "timestamp": "2026-01-28T14:30:00Z",
  "payload": {
    "ruleType": "dailyLossLimit",
    "threshold": 2000,
    "actualValue": 2150,
    "currency": "USD",
    "tradingDay": "2026-01-28",
    "violatedAt": "2026-01-28T14:30:00Z"
  }
}
```

## Implementation Checklist

- [ ] Load rules from account config at account creation
- [ ] Hook into simulated fill pipeline
- [ ] Implement rule evaluators for each rule type
- [ ] Track account state (balance, peak, daily P&L, trading days)
- [ ] Emit violation events via event bus
- [ ] Write violations to audit log
- [ ] Implement periodic checkpoint evaluations
- [ ] Add rule configuration validation
- [ ] Create unit tests for each rule type
- [ ] Add integration tests for multi-rule scenarios

## Related Documents

- [account-schema.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/account-schema.md) - Rule configuration schema
- [event-contracts.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/event-contracts.md) - Violation event schemas
- [audit-log.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/audit-log.md) - Audit logging system
