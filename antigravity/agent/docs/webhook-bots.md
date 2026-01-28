# Webhook Bots

## Summary

Webhook Bots enable propfirm websites to send trading signals to QuantLab for simulated execution on behalf of user accounts. The webhook pipeline receives authenticated signals, validates payload schemas and signatures, maps signals to account context, and executes simulated trades while emitting events for each stage. This system supports algobot marketplaces, third-party signal providers, and automated trading strategies while maintaining full audit trails and tenant isolation.

## TODO

- [ ] Define webhook endpoint structure
  - [ ] `POST /api/v1/webhooks/signals` for incoming trading signals
  - [ ] Authentication mechanisms (HMAC signatures, API keys, JWT)
  - [ ] Tenant-specific webhook secrets management
- [ ] Document incoming signal payload schema
  - [ ] Required fields: `tenantId`, `accountId`, `symbol`, `action` (buy/sell), `quantity`
  - [ ] Optional fields: `orderType` (market/limit/stop), `price`, `stopLoss`, `takeProfit`
  - [ ] Strategy metadata: `botId`, `strategyName`, `signalId`, `timestamp`
- [ ] Document signature validation process
  - [ ] HMAC-SHA256 signature generation and verification
  - [ ] Timestamp validation to prevent replay attacks
  - [ ] Nonce handling for idempotency
- [ ] Document signal validation pipeline
  - [ ] Schema validation against defined contracts
  - [ ] Account existence and active status checks
  - [ ] Account rule pre-checks (would this violate limits?)
  - [ ] Tenant permission verification
- [ ] Document simulated trade execution
  - [ ] Mapping signals to order engine actions
  - [ ] Position sizing and leverage constraints
  - [ ] Simulated fill logic and slippage modeling
  - [ ] Order confirmation and acknowledgment
- [ ] Document event emission for webhook lifecycle
  - [ ] `webhook.received` event
  - [ ] `webhook.validated` event
  - [ ] `webhook.trade_executed` event with fill details
  - [ ] `webhook.failed` event with error details
- [ ] Provide webhook registration API documentation
  - [ ] How tenants register webhook URLs for callbacks
  - [ ] Webhook secret rotation and management
- [ ] Document rate limiting and abuse prevention
  - [ ] Per-account, per-tenant, and per-bot rate limits
  - [ ] Suspicious pattern detection
- [ ] Provide example webhook payloads and integration guides
- [ ] Document testing and sandbox environments for bot developers

## Related Documents

- [event-contracts.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/event-contracts.md) - Webhook delivery event schemas
- [provisioning-api.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/provisioning-api.md) - Webhook URL registration endpoints
- [tenant-config.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/tenant-config.md) - Tenant-specific webhook settings
