# Event Contracts

## Summary

Event Contracts define the standardized JSON schemas for all events emitted by QuantLab to propfirm websites. These events enable websites to react to trading milestones, rule violations, payout eligibility triggers, and webhook delivery statuses. All events are tenant-namespaced, version-tagged, and include immutable audit metadata to support reconciliation and dispute resolution. Websites consume these events via registered webhooks or polling endpoints.

## TODO

- [ ] Define base event schema structure
  - [ ] Common fields: `eventId`, `tenantId`, `accountId`, `userId`, `timestamp`, `eventType`, `version`
  - [ ] Payload structure and nesting conventions
  - [ ] Metadata fields for audit and tracing
- [ ] Document `challenge.milestone` event
  - [ ] JSON schema for stage completions (e.g., stage-1-pass, stage-2-pass)
  - [ ] Include achieved metrics: profit, drawdown, trading days
  - [ ] Example payloads for eval and straight-to-funded paths
- [ ] Document `challenge.failed` event
  - [ ] JSON schema for rule violations leading to failure
  - [ ] Include violation details: rule type, threshold, actual value
  - [ ] Link to audit log entries
- [ ] Document `payout.eligible` event
  - [ ] JSON schema indicating simulated trading criteria met
  - [ ] Clarify this is NOT payout approval, only eligibility signal
  - [ ] Include performance summary and qualifying period
- [ ] Document `rule.violation.*` events
  - [ ] Daily loss limit violation
  - [ ] Max drawdown violation
  - [ ] Consistency rule violation
  - [ ] Min trading days not met
- [ ] Document `webhook.delivery.*` events
  - [ ] `webhook.received` - signal received from bot
  - [ ] `webhook.validated` - schema and signature validated
  - [ ] `webhook.trade_executed` - simulated fill completed
  - [ ] `webhook.failed` - validation or execution failure
- [ ] Document `account.provisioned` and `account.state_changed` events
- [ ] Provide JSON schema definitions for all events
- [ ] Add example event payloads for each type
- [ ] Document versioning and backwards compatibility strategy
- [ ] Describe webhook delivery guarantees and retry logic

## Related Documents

- [webhook-bots.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/webhook-bots.md) - Webhook bot execution pipeline
- [provisioning-api.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/provisioning-api.md) - API for webhook URL registration
- [propfirm-model.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/propfirm-model.md) - Event emission responsibilities
