# Tenant Configuration Schema
Version: 1.0.0
Scope: Defines the structure for configuring distinct prop-firm tenants on the platform.

Each tenant has a unique JSON configuration that dictates their branding, allowed products, security keys, and data providers.

## Schema Definition

### 1. Identity & Branding
Controls the visual appearance of the white-label dashboard.
- `id` (string): Unique identifier (e.g., "tenantA").
- `name` (string): Display name.
- `domain` (string): Custom domain (e.g., "start.alphacapital.com").
- `branding` (object):
  - `logoUrl` (string): Path to logo.
  - `primaryColor` (string): Hex code (e.g., "#0055FF").
  - `secondaryColor` (string): Hex code.

### 2. Allowed Account Types
Restricts which account configurations are available to this tenant's users.
- `allowedConfigs` (array<string>): List of `configId`s (from `account-schema.md` definitions).

### 3. Security & Integrations
Manages secrets for webhooks and external APIs.
- `webhookSecret` (string): Shared secret for HMAC signature verification of incoming signals.
- `apiKeys` (object): Keys for external services.
  - `paymentProvider` (string): e.g., Stripe public key.
  - `emailService` (string): e.g., SendGrid key.

### 4. Data Provider Configuration
Specifies the source of market data and trade execution for this tenant.
- `dataProvider` (string): "polygon", "binance", etc.
- `brokerId` (string): Internal mapping to a liquidity bridge.

## Example

```json
{
  "id": "tenantA",
  "name": "Alpha Capital",
  "domain": "trader.alphacapital.com",
  "branding": {
    "logoUrl": "https://assets.alphacapital.com/logo.png",
    "primaryColor": "#1A73E8"
  },
  "allowedConfigs": ["25k-eval-v1", "50k-straight-v1"],
  "webhookSecret": "sec_8843d1a8...",
  "dataProvider": "polygon"
}
```
