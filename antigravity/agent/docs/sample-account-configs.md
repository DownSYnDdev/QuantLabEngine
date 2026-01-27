# Sample Account Configs

This file references machine-readable configs in /agent/configs/.

## Included account types
- 25k Evaluation (25k-eval-v1)
- 25k Straight to Funded (25k-straight-v1)
- 50k Evaluation (50k-eval-v1)
- 50k Straight to Funded (50k-straight-v1)
- 100k Evaluation (100k-eval-v1)
- 100k Straight to Funded (100k-straight-v1)
- 150k Evaluation (150k-eval-v1)
- 150k Straight to Funded (150k-straight-v1)

## How to use
1. Validate each JSON file against agent/docs/account-schema.md.
2. Provision via the provisioning API: POST /tenants/{tenantId}/account-types with the chosen config object.
3. Use meta.version to manage updates and rollbacks.

## Notes
- Filenames and id fields use kebab-case and are tenant-aware.
- Straight-to-funded variants have variant: "straight-to-funded".
- Evaluation variants include multiple challengeDefinitions.
