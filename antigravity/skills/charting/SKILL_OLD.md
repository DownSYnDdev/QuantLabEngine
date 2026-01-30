---
name: Charting & WebGL
description: Generates high‑performance charting logic, rendering pipelines, and WebGL‑based visualizations for financial or scientific data.
---

# Skill: Charting & WebGL

## Description
Generates high‑performance charting logic, rendering pipelines, and WebGL‑based visualizations for financial or scientific data.

## Capabilities
- generate_chart_component
- implement_webgl_renderer
- design_indicator_overlay
- optimize_render_pipeline

## Inputs
### generate_chart_component
- framework (string)
- chart_type (string)
- requirements (string)

### implement_webgl_renderer
- shaders (array of strings)
- data_format (string)

### design_indicator_overlay
- indicator_name (string)
- formula (string)
- visualization (string)

### optimize_render_pipeline
- current_pipeline (string)
- performance_goals (string)

## Outputs
- code (string)
- shader_code (string)
- instructions (string)
- notes (string)

## Usage Example
{
  "action": "design_indicator_overlay",
  "indicator_name": "EMA",
  "formula": "Exponential moving average over N periods",
  "visualization": "line overlay"
}

## Notes
This skill focuses on rendering logic, not data acquisition.
