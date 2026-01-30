---
name: Database Design
description: Provides schema design, relational modeling, migrations, and data‑layer code generation for SQL and NoSQL databases.
---

# Skill: Database Design

## Description
Provides schema design, relational modeling, migrations, and data‑layer code generation for SQL and NoSQL databases.

## Capabilities
- design_schema
- define_relationships
- generate_migrations
- optimize_queries

## Inputs
### design_schema
- db_type (string)
- entities (array of strings)

### define_relationships
- relationships (string)

### generate_migrations
- schema (string)

### optimize_queries
- queries (array of strings)
- goals (string)

## Outputs
- schema (string)
- migrations (string)
- optimized_queries (string)
- notes (string)

## Usage Example
{
  "action": "design_schema",
  "db_type": "postgres",
  "entities": ["User", "Chart", "Indicator"]
}

## Notes
This skill does not execute queries or connect to live databases.
