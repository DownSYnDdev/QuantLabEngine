# Webhook Bot Execution Pipeline
Version: 1.0.0
Scope: Defines the end-to-end pipeline for processing trading signals received from external bots via webhooks.

This document outlines the standard payload schema, authentication mechanism, validation logic, and execution steps.

## 1. Webhook Payload Schema
**Endpoint**: `POST /webhooks/{tenantId}/{botId}`

### Headers
| Header | Description |
| :--- | :--- |
| `X-Bot-ID` | The unique ID of the registered bot. |
| `X-Timestamp` | ISO 8601 UTC timestamp of the request. |
| `X-Signature` | HMAC-SHA256 signature for authentication. |

### JSON Body
```json
{
  "accountId": "25k-eval-v1",
  "symbol": "EURUSD",
  "side": "buy",
  "size": 1.0,
  "price": 1.0842,
  "signalId": "sig_550e8400-e29b",
  "action": "open" 
}
```
*Note: `action` triggers opening or closing logic.*

## 2. Authentication
**Mechanism**: HMAC-SHA256
1. **Secret**: Tenant-specific or Bot-specific webhook secret (stored in `tenant-config` or `algobot-marketplace`).
2. **String to Sign**: `timestamp + "." + raw_request_body`
3. **Validation**: 
   - Recompute signature.
   - Compare with `X-Signature`.
   - Reject if mismatch.
   - Reject if `timestamp` is older than 60 seconds (Replay Protection).

## 3. Rate Limits
- **Per Bot**: 60 requests per minute.
- **Per Tenant**: 1000 requests per minute.
- **Action**: Return `429 Too Many Requests` if exceeded.

## 4. Signal Validation
Before execution, the pipeline validates:
1. **Schema**: Fields (`symbol`, `side`, `size`, `accountId`) are present and correct types.
2. **Account**: `accountId` belongs to `tenantId`.
3. **Symbol**: `symbol` is in the account's `allowedInstruments` list.
4. **Markets**: Markets are open (not weekend/holiday).

## 5. Execution Pipeline
1. **Receive**: Ingest raw request, log IP, emit `webhook.received`.
2. **Authenticate**: Verify HMAC and Timestamp.
3. **Validate**: Check schema and business logic (Rate limits, Account ownership).
   - *If invalid*: Emit `webhook.rejected`, return 4xx.
   - *If valid*: Emit `webhook.validated`.
4. **Rule Engine Check**: Run all pre-trade rule checks (Daily Loss, Max Drawdown, etc.).
   - *If violation*: Emit `webhook.rejected` (with reason), return 422.
5. **Simulate**: 
   - Calculate new equity/balance.
   - Create execution record.
   - Emit `webhook.trade_executed`.
   - Return 200 OK.
