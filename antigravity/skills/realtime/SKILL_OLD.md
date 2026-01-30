---
name: Real-Time Systems
description: Supports the design and generation of real‑time communication systems using WebSockets, SSE, pub/sub, and event‑driven architectures.
---

# Skill: Real‑Time Systems

## Description
Supports the design and generation of real‑time communication systems using WebSockets, SSE, pub/sub, and event‑driven architectures.

## Capabilities
- implement_realtime
- design_event_flow
- generate_socket_handlers
- optimize_latency

## Inputs
### implement_realtime
- protocol (string)
- event_types (array of strings)
- requirements (string)

### design_event_flow
- events (array of strings)
- data_flow (string)

### generate_socket_handlers
- framework (string)
- handlers (array of strings)

### optimize_latency
- architecture (string)
- bottlenecks (string)

## Outputs
- code (string)
- event_map (string)
- instructions (string)
- notes (string)

## Usage Example
{
  "action": "implement_realtime",
  "protocol": "websocket",
  "event_types": ["price_update", "order_update"],
  "requirements": "Broadcast updates to all subscribed clients."
}

## Notes
This skill focuses on architecture and code generation, not deployment or hosting.
