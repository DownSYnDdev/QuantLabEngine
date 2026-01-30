---
name: Full-Stack Development
description: Provides end‑to‑end capabilities for designing and generating full‑stack web applications, including frontend, backend, APIs, and integration logic.
---

# Skill: Full‑Stack Development

## Description
Provides end‑to‑end capabilities for designing and generating full‑stack web applications, including frontend, backend, APIs, and integration logic.

## Capabilities
- project_scaffold
- generate_frontend
- generate_backend
- design_api
- integrate_stacks
- optimize_code

## Inputs
### project_scaffold
- stack (string)
- language (string)
- features (array of strings)

### generate_frontend
- framework (string)
- component_name (string)
- requirements (string)

### generate_backend
- framework (string)
- endpoint (string)
- requirements (string)

### design_api
- endpoints (array of strings)
- data_flow (string)

### integrate_stacks
- frontend_stack (string)
- backend_stack (string)
- database (string)
- requirements (string)

## Outputs
- code (string)
- instructions (string)
- schema (string)
- notes (string)

## Usage Example
{
  "action": "generate_backend",
  "framework": "express",
  "endpoint": "/api/users",
  "requirements": "Return paginated users with optional search."
}

## Notes
This skill generates code and architecture but does not execute or deploy applications.
