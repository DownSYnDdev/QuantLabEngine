# Account Types and Challenge Schema

## Purpose
This document defines the canonical configuration schema for PropFirm account types, challenge definitions, payout rules, and related policies.  
It is the single source of truth for how the website (business layer) and QuantLab (simulation platform) exchange account and challenge configuration.

---

## Overview
The platform must support at least four base account sizes (25k, 50k, 100k, 150k) and two delivery variants per size:

- **Straight to Funded** — no evaluation phase; different rules (e.g., daily loss, consistency) and immediate funded account behavior.  
- **Evaluation Path** — one or more evaluation stages with pass/fail criteria and staged payouts.

Design principle: **config driven**. All rules are JSON/YAML configs that the website provisions to QuantLab via the provisioning API. QuantLab enforces runtime constraints based on these configs.

---

## JSON Schema (canonical)
Use this JSON Schema to validate account type and challenge configuration before provisioning.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PropFirm Account Type Schema",
  "type": "object",
  "required": ["id", "displayName", "baseCapital", "variant", "challengeDefinitions", "payoutRules"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9\\-]+$" },
    "displayName": { "type": "string" },
    "description": { "type": "string" },
    "baseCapital": { "type": "number", "minimum": 1000 },
    "currency": { "type": "string", "default": "USD" },
    "variant": { "type": "string", "enum": ["straight-to-funded", "evaluation"] },
    "tenantId": { "type": "string" },
    "challengeDefinitions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "rules"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "rules": {
            "type": "object",
            "properties": {
              "profitTarget": { "type": "number", "minimum": 0 },
              "maxDrawdown": { "type": "number", "minimum": 0 },
              "dailyLossLimit": { "type": "number", "minimum": 0 },
              "minTradingDays": { "type": "integer", "minimum": 0 },
              "consistencyRule": {
                "type": "object",
                "properties": {
                  "minWinningDays": { "type": "integer", "minimum": 0 },
                  "minTradesPerDay": { "type": "integer", "minimum": 0 }
                },
                "additionalProperties": false
              },
              "orderTypesAllowed": {
                "type": "array",
                "items": { "type": "string" }
              },
              "leverage": { "type": "number", "minimum": 0 }
            },
            "additionalProperties": false
          },
          "durationDays": { "type": "integer", "minimum": 0 }
        },
        "additionalProperties": false
      }
    },
    "payoutRules": {
      "type": "object",
      "properties": {
        "stagedPayouts": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["milestone", "payoutPercent"],
            "properties": {
              "milestone": { "type": "string" },
              "payoutPercent": { "type": "number", "minimum": 0, "maximum": 100 },
              "conditions": { "type": "object" }
            },
            "additionalProperties": false
          }
        },
        "escrowPolicy": {
          "type": "object",
          "properties": {
            "holdPeriodDays": { "type": "integer", "minimum": 0 },
            "releaseConditions": { "type": "object" }
          },
          "additionalProperties": false
        },
        "partialPayoutAllowed": { "type": "boolean", "default": false }
      },
      "additionalProperties": false
    },
    "meta": {
      "type": "object",
      "properties": {
        "createdBy": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" },
        "version": { "type": "string" }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": false
}
```
