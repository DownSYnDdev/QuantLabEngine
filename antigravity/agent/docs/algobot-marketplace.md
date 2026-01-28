# AlgoBot Marketplace

## Overview

The AlgoBot Marketplace enables users to create, test, share, and execute automated trading strategies on their simulated propfirm accounts. **Important**: QuantLab only simulates bot execution; actual live trading is handled by the propfirm's broker integration. Bots send signals via webhooks to QuantLab for simulated fills and rule enforcement.

## Bot Lifecycle

```
┌──────────────┐
│ Bot Creation │ (DSL or visual builder)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Backtesting  │ (historical data simulation)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Bot Approval │ (tenant/admin review - optional)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Marketplace  │ (public/tenant listing)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ User Deploys │ (attach to account)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Signal Emit  │ (webhook to QuantLab)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Simulated    │ (QuantLab execution)
│ Execution    │
└──────────────┘
```

## Bot Schema

**Bot Definition:**
```json
{
  "botId": "bot_456",
  "name": "EMA Crossover Strategy",
  "description": "Trades based on 20/50 EMA crossover signals",
  "author": {
    "userId": "user_789",
    "username": "trader_pro"
  },
  "version": "1.2.0",
  "strategy": {
    "type": "dsl",
    "code": "...", // DSL code
    "symbols": ["EURUSD", "GBPUSD"],
    "timeframe": "5m"
  },
  "backtestResults": {
    "period": "2025-01-01 to 2025-12-31",
    "totalTrades": 342,
    "winRate": 62.5,
    "profitFactor": 1.85,
    "maxDrawdown": 1200,
    "sharpeRatio": 1.42
  },
  "visibility": "public",
  "tenantId": "tenant_001",
  "status": "approved",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

## Webhook Integration

When a bot generates a signal, it sends a webhook to QuantLab:

**Signal Webhook:**
```json
{
  "tenantId": "tenant_001",
  "accountId": "acc_50k_001",
  "botId": "bot_456",
  "signalId": "sig_abc123",
  "timestamp": "2026-01-28T14:30:00Z",
  "symbol": "EURUSD",
  "action": "buy",
  "quantity": 1.0,
  "orderType": "market",
  "stopLoss": 1.0800,
  "takeProfit": 1.0900,
  "signature": "sha256=..."
}
```

QuantLab receives, validates, and simulates the trade. See [webhook-bots.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/webhook-bots.md) for details.

## Bot Categories

- **Trend Following**: EMA/SMA crossovers, MACD strategies
- **Mean Reversion**: RSI oversold/overbought, Bollinger Band bounces
- **Breakout**: Support/resistance breaks, volatility expansion
- **Scalping**: High-frequency short-term trades
- **News Trading**: Event-driven signals (requires external feed)

## Marketplace Features

### Discovery
- Browse bots by category, rating, performance
- Filter by symbols, timeframes, risk level
- Sort by subscribers, ratings, recent performance

### Bot Details Page
```json
{
  "botId": "bot_456",
  "name": "EMA Crossover Strategy",
  "rating": 4.7,
  "totalSubscribers": 1250,
  "totalTrades": 15234,
  "avgWinRate": 61.2,
  "monthlyPerformance": [
    { "month": "2026-01", "profit": 3250, "trades": 45 }
  ],
  "reviews": [
    {
      "userId": "user_999",
      "rating": 5,
      "comment": "Excellent bot, very consistent!",
      "timestamp": "2026-01-20T15:00:00Z"
    }
  ]
}
```

### Deployment
Users deploy bots to their accounts:

**Deploy Bot:**
```
POST /tenants/{tenantId}/accounts/{accountId}/bots/deploy
```

**Request:**
```json
{
  "botId": "bot_456",
  "config": {
    "maxPositionSize": 2.0,
    "maxDailyTrades": 10,
    "stopOnDailyLoss": 500
  }
}
```

**Response:**
```json
{
  "deploymentId": "dep_xyz789",
  "status": "active",
  "startedAt": "2026-01-28T15:00:00Z"
}
```

### Monitoring
Users monitor bot performance in real-time:

**Get Bot Performance:**
```
GET /tenants/{tenantId}/accounts/{accountId}/bots/{botId}/performance
```

## Tenant-Specific Marketplace

Tenants can:
- Curate which bots are available to their users
- Create private bots only for their propfirm
- Set approval workflows for public bots
- Override bot settings (e.g., max position size)

**Tenant Bot Config:**
```json
{
  "tenantId": "tenant_001",
  "botId": "bot_456",
  "visibility": "approved",
  "allowUserDeployment": true,
  "restrictions": {
    "maxPositionSize": 1.5,
    "maxConcurrentDeployments": 100
  }
}
```

## Revenue Sharing (Optional Future Feature)

Bot creators can charge subscription fees:
- Monthly subscription: $19-$99/month
- Performance-based: % of profits generated
- One-time purchase: $299-$999

**Note**: QuantLab does not handle payments. Billing is the propfirm's responsibility.

## Scope Boundaries

**QuantLab provides:**
- Bot marketplace UI and discovery
- Bot backtesting infrastructure
- Webhook signal reception and validation
- Simulated execution and rule enforcement
- Bot performance tracking

**QuantLab does NOT provide:**
- Live broker execution (propfirm's responsibility)
- Payment processing for bot subscriptions
- KYC for bot creators
- Legal liability for bot performance

## Implementation Checklist

- [ ] Define bot DSL and execution environment
- [ ] Build backtesting engine
- [ ] Create marketplace UI (browse, search, filter)
- [ ] Implement bot approval workflow
- [ ] Add bot deployment API
- [ ] Build bot monitoring dashboard
- [ ] Integrate with webhook pipeline
- [ ] Add rating and review system
- [ ] Implement tenant-specific bot curation
- [ ] Create bot creator tools (IDE, debugger)

## Related Documents

- [webhook-bots.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/webhook-bots.md) - Signal webhook integration
- [event-contracts.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/event-contracts.md) - Bot event schemas
- [rule-engine.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/rule-engine.md) - Rule enforcement on bot trades
