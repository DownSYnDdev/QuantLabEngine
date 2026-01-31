# Provisioning & Configuration API
Version: 1.0.0
Scope: Defines the workflow for creating accounts and managing their configurations.

This API acts as the bridge between the Prop-Firm Website (Tenant) and the QuantLab Engine.

## 1. Account Provisioning Flow

### Step 1: Request
The website sends a `POST /tenants/{tenantId}/accounts` request.
**Required Fields:**
- `userId`: The unique ID of the user on the website.
- `configId`: The specific account configuration to use (e.g., `25k-eval-v1`).
- `tenantId`: Must match the authenticated API key.

### Step 2: Validation
The system performs the following checks:
1. **Tenant Check**: Is the tenant active?
2. **Config Check**: Does `configId` exist and is it in the tenant's `allowedConfigs` list?
3. **Capacity Check**: (Optional) Does the system have capacity for new accounts?

### Step 3: Instantiation
If valid:
1. A new `AccountState` record is created in the database.
2. Initial balance and rules are copied from the *current version* of the `configId`.
3. An `account.provisioned` event is emitted.

### Step 4: Response
Returns the new `accountId` immediately. The account is ready to receive trades.

## 2. Configuration Management

### Validating Configs
Before a tenant can use a new configuration, it must be validated.
**Endpoint**: `POST /tenants/{tenantId}/configs/validate`
**Process**:
1. Website uploads the JSON config.
2. System validates against `account-schema.md` (JSON Schema).
3. System checks for logical errors (e.g., `dailyLoss` > `maxLoss`).
4. Returns specific validation errors or "OK".

### Uploading New Versions
Tenants can update configurations without breaking existing accounts.
**Endpoint**: `POST /tenants/{tenantId}/configs`
**Process**:
1. Website uploads verified config with `id: "25k-eval-v1"`.
2. System detects this ID already exists.
3. System creates a NEW internal version (e.g., v2) but keeps the ID stable OR requires a new ID (e.g., `25k-eval-v2`) depending on `versioningStrategy` in tenant config.
   - *Recommended*: Use explicit versioning in IDs (`v2`) for clarity.
4. Old accounts stay on their original config snapshot.
5. New accounts use the new upload.

## 3. Best Practices
- **Idempotency**: Use `requestId` headers to prevent double-provisioning on retries.
- **Async Handling**: Provisioning is fast, but heavy updates should rely on webhooks (`account.state_changed`) rather than polling.
- **Isolation**: Tenants can NEVER see or modify another tenant's configs or accounts.
