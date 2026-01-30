---
name: Security Best Practices
description: Provides secure coding guidance, threat modeling, input validation patterns, authentication flows, and architectural hardening recommendations.
---

# Skill: Security Best Practices

## Description
Provides secure coding guidance, threat modeling, input validation patterns, authentication flows, and architectural hardening recommendations.

## Capabilities
- analyze_threats
- generate_secure_code
- design_auth_flow
- validate_inputs
- security_review

## Inputs
### analyze_threats
- architecture (string)

### generate_secure_code
- code (string)
- goals (string)

### design_auth_flow
- method (string)
- requirements (string)

### validate_inputs
- data_types (array of strings)

### security_review
- codebase (string)

## Outputs
- secure_code (string)
- recommendations (string)
- auth_flow (string)
- notes (string)

## Usage Example
{
  "action": "design_auth_flow",
  "method": "oauth2",
  "requirements": "Secure login with refresh tokens"
}

## Notes
This skill provides guidance but does not perform penetration testing.
