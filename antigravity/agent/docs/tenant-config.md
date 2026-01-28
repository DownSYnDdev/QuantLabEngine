# Tenant Configuration

## Summary

Tenant Configuration describes how propfirms configure and customize their QuantLab instance for white-label licensing. Each tenant has isolated account configs, webhook secrets, branding settings, and operational parameters. Tenant configs support versioning, allow per-tenant rule customization, and enable multiple propfirms to operate independently on the same QuantLab platform while maintaining complete data isolation and security.

## TODO

- [ ] Define tenant configuration schema
  - [ ] Tenant metadata: `tenantId`, `tenantName`, `contactEmail`, `status` (active/suspended)
  - [ ] Branding: logo URLs, color schemes, custom domains
  - [ ] Operational settings: timezone, default currency, data retention policies
- [ ] Document account type configuration management
  - [ ] How tenants define custom account configs (25k, 50k, 100k, 150k, etc.)
  - [ ] Config versioning and migration strategies
  - [ ] Override default rules per tenant
- [ ] Document webhook configuration
  - [ ] Webhook callback URLs for event delivery
  - [ ] Webhook secrets and signature keys
  - [ ] Event type subscriptions (which events to receive)
  - [ ] Retry policies and failure handling
- [ ] Document API access and quotas
  - [ ] API key generation and rotation
  - [ ] Rate limits per tenant
  - [ ] Usage quotas and billing integration hooks
- [ ] Document multi-tenant isolation guarantees
  - [ ] Data namespacing by `tenantId`
  - [ ] User and account separation
  - [ ] Config and secret isolation
  - [ ] Cross-tenant access prevention
- [ ] Document tenant admin endpoints
  - [ ] `POST /api/v1/admin/tenants` - create new tenant
  - [ ] `GET /api/v1/admin/tenants/{tenantId}` - retrieve tenant config
  - [ ] `PUT /api/v1/admin/tenants/{tenantId}` - update tenant settings
  - [ ] `DELETE /api/v1/admin/tenants/{tenantId}` - deactivate tenant
- [ ] Provide sample tenant configuration files
  - [ ] `agent/configs/tenants/example-tenant-config.json`
  - [ ] Include all configurable settings with defaults
- [ ] Document tenant onboarding workflow
  - [ ] Initial setup steps
  - [ ] API key provisioning
  - [ ] Webhook testing and validation
  - [ ] First account creation
- [ ] Document security best practices
  - [ ] Secret rotation schedules
  - [ ] IP whitelisting options
  - [ ] Audit log access and retention
- [ ] Document config versioning and backwards compatibility

## Related Documents

- [provisioning-api.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/provisioning-api.md) - Tenant provisioning endpoints
- [webhook-bots.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/webhook-bots.md) - Webhook configuration
- [propfirm-model.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/propfirm-model.md) - Multi-tenant architecture
- [account-schema.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/account-schema.md) - Account config customization
