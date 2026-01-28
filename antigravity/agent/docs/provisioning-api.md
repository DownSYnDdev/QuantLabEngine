# Provisioning API

## Summary

The Provisioning API enables propfirm websites to programmatically create and manage tenant accounts in QuantLab. It provides endpoints for provisioning account configurations, mapping users to accounts, retrieving account state, and managing tenant-specific settings. All account configs must conform to the schema defined in `account-schema.md`, and the API enforces validation, versioning, and tenant isolation to ensure safe multi-tenant operation.

## TODO

- [ ] Define API authentication and authorization (API keys, JWT, OAuth2)
- [ ] Document `POST /api/v1/tenants/{tenantId}/accounts` endpoint
  - [ ] Request schema with account config validation
  - [ ] Response schema with account ID and provisioning status
  - [ ] Error responses and validation error formats
- [ ] Document `GET /api/v1/tenants/{tenantId}/accounts/{accountId}` endpoint
  - [ ] Response schema with full account state
  - [ ] Include balance, PnL, open positions, rule statuses
- [ ] Document `PUT /api/v1/tenants/{tenantId}/accounts/{accountId}` endpoint for updates
- [ ] Document `DELETE /api/v1/tenants/{tenantId}/accounts/{accountId}` endpoint
- [ ] Document user-to-account mapping endpoints
  - [ ] `POST /api/v1/tenants/{tenantId}/users/{userId}/accounts/{accountId}/map`
  - [ ] `GET /api/v1/tenants/{tenantId}/users/{userId}/accounts`
- [ ] Document config versioning support
  - [ ] How to specify config version in requests
  - [ ] Version migration and backwards compatibility
- [ ] Document rate limiting and quotas per tenant
- [ ] Provide example requests and responses for common workflows
- [ ] Document webhook URL registration for event callbacks
- [ ] Add API reference with OpenAPI/Swagger spec

## Related Documents

- [account-schema.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/account-schema.md) - Account configuration schema
- [sample-account-configs.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/sample-account-configs.md) - Example account configurations
- [tenant-config.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/tenant-config.md) - Tenant configuration guide
- [propfirm-model.md](file:///c:/Users/Mason/Documents/Antigrav%20projects/Quantlab/antigravity/agent/docs/propfirm-model.md) - Platform responsibilities
