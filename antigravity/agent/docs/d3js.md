# D3.js: Documentation Reference

## Purpose
This file provides reference material for the agent. It contains documentation, summaries, API notes, or technical insights gathered from external sources (NotebookLM).
It is **not** a skill definition and does not instruct the agent how to behave.
It exists purely as contextual knowledge to support coding and architectural tasks.

---

## Source Summary
Research conducted via NotebookLM deep research mode from 110 curated sources including official D3 documentation, Observable notebooks, and community tutorials. Full report available at: https://notebooklm.google.com/notebook/57a1d7bb-8883-4fe5-a8f2-031b1a5e1b49

---

## Key Concepts
- **Data-Driven Documents**: Binds arbitrary data to DOM and applies data-driven transformations
- **Selections**: Declarative API for manipulating DOM elements based on data
- **Enter-Update-Exit Pattern**: Core paradigm for handling dynamic datasets
- **Scales**: Maps data domain to visual range (linear, time, ordinal, log, etc.)
- **SVG Focus**: Primarily uses SVG for vector graphics, though Canvas is supported
- **Modular Design**: Tree-shakeable ES modules (d3-scale, d3-selection, d3-shape, etc.)
- **Transitions**: Smooth animated interpolation between states

---

## API Reference (If Applicable)

### Core Selection Methods
- **`d3.select(selector)`**: Select single element
- **`d3.selectAll(selector)`**: Select multiple elements
- **`selection.data(array)`**: Join data to elements
- **`selection.enter()`**: Returns placeholder for missing elements
- **`selection.exit()`**: Returns elements without data
- **`selection.attr(name, value)`**: Set attribute
- **`selection.style(name, value)`**: Set CSS style
- **`selection.append(type)`**: Append new element

### Scales
- **`d3.scaleLinear()`**: Continuous linear scale
- **`d3.scaleTime()`**: Time scale with smart tick formatting
- **`d3.scaleOrdinal()`**: Discrete ordinal scale
- **`scale.domain([min, max])`**: Set input domain
- **`scale.range([min, max])`**: Set output range
- **`scale.ticks(count)`**: Generate evenly-spaced ticks

### Axes
- **`d3.axisBottom(scale)`**: Bottom-oriented axis
- **`d3.axisLeft(scale)`**: Left-oriented axis
- **`axis.ticks(count)`**: Control tick density
- **`axis.tickFormat(formatter)`**: Custom tick labels

### Shapes
- **`d3.line()`**: Line generator for time series
- **`d3.area()`**: Area generator for filled regions
- **`line.x(accessor)`, `line.y(accessor)`**: Define coordinate accessors
- **`line.curve(d3.curveLinear)`**: Interpolation method

### Transitions
- **`selection.transition()`**: Start transition
- **`transition.duration(ms)`**: Animation duration
- **`transition.ease(d3.easeLinear)`**: Easing function
- **`transition.attr(name, value)`**: Animated attribute change

---

## Usage Patterns

### Basic Line Chart
```javascript
const xScale = d3.scaleTime()
  .domain(d3.extent(data, d => d.date))
  .range([margin.left, width - margin.right]);

const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .range([height - margin.bottom, margin.top]);

const line = d3.line()
  .x(d => xScale(d.date))
  .y(d => yScale(d.value));

svg.append('path')
  .datum(data)
  .attr('d', line)
  .attr('stroke', 'steelblue')
  .attr('fill', 'none');
```

### Enter-Update-Exit Pattern
```javascript
const circles = svg.selectAll('circle')
  .data(dataPoints, d => d.id);

// Enter: create new elements
circles.enter()
  .append('circle')
  .attr('r', 5)
  .attr('cx', d => xScale(d.x))
  .attr('cy', d => yScale(d.y));

// Update: modify existing elements
circles
  .attr('cx', d => xScale(d.x))
  .attr('cy', d => yScale(d.y));

// Exit: remove old elements
circles.exit().remove();
```

### Axes with Grid
```javascript
const xAxis = d3.axisBottom(xScale)
  .ticks(10)
  .tickFormat(d3.timeFormat('%H:%M'));

svg.append('g')
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(xAxis);

// Add grid lines
svg.append('g')
  .attr('class', 'grid')
  .call(d3.axisLeft(yScale)
    .tickSize(-width)
    .tickFormat(''));
```

### Zoom and Pan
```javascript
const zoom = d3.zoom()
  .scaleExtent([1, 10])
  .on('zoom', (event) => {
    const newXScale = event.transform.rescaleX(xScale);
    xAxis.scale(newXScale);
    svg.select('.x-axis').call(xAxis);
    // Update chart elements with newXScale
  });

svg.call(zoom);
```

---

## Constraints & Notes
- **Learning Curve**: Steeper than charting libraries due to low-level control
- **Performance**: SVG can struggle with 1000+ elements; use Canvas for large datasets
- **Bundle Size**: Full D3 is ~250KB; use specific modules to reduce size
- **Responsive**: Requires manual resize handling (no auto-resize)
- **No Built-in Charts**: You build visualizations from primitives, not pre-made charts
- **Data Joining**: Understanding enter-update-exit is critical for dynamic data

---

## Examples (Optional)

### Time-Series Brush Selection
```javascript
const brush = d3.brushX()
  .extent([[0, 0], [width, height]])
  .on('end', (event) => {
    if (event.selection) {
      const [x0, x1] = event.selection.map(xScale.invert);
      // Filter data between x0 and x1
    }
  });

svg.append('g').call(brush);
```

### Animated Transitions
```javascript
svg.selectAll('circle')
  .transition()
  .duration(750)
  .attr('r', d => radiusScale(d.value))
  .attr('fill', 'orange');
```

---

## Related Files
- `tradingview-lightweight-charts.md` - For high-performance financial charts
- `simple-statistics.md` - For calculating data statistics
- `nextjs-app-router.md` - For React integration patterns

---

## Revision History
- Created: 2026-01-26
- Source: NotebookLM Deep Research (110 sources)
