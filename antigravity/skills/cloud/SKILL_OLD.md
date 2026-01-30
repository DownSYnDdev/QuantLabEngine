---
name: Cloud Infrastructure
description: Generates infrastructure plans, deployment configurations, containerization setups, and scaling strategies for cloud‑native applications.
---

# Skill: Cloud Infrastructure

## Description
Generates infrastructure plans, deployment configurations, containerization setups, and scaling strategies for cloud‑native applications.

## Capabilities
- design_architecture
- generate_dockerfile
- generate_kubernetes_manifests
- plan_scaling_strategy
- configure_cicd

## Inputs
### design_architecture
- services (array of strings)
- requirements (string)

### generate_dockerfile
- language (string)
- app_type (string)

### generate_kubernetes_manifests
- services (array of strings)
- resources (string)

### plan_scaling_strategy
- traffic_profile (string)
- goals (string)

### configure_cicd
- provider (string)
- steps (array of strings)

## Outputs
- architecture (string)
- dockerfile (string)
- manifests (string)
- cicd_config (string)
- notes (string)

## Usage Example
{
  "action": "generate_dockerfile",
  "language": "node",
  "app_type": "api"
}

## Notes
This skill generates infrastructure definitions but does not deploy them.
