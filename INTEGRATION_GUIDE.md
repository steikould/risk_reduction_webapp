# Power Consumption App Integration Guide

This guide explains how to incorporate the Power Consumption webapp into another web application.

## Table of Contents
1. [iframe Integration](#iframe-integration)
2. [Component Integration](#component-integration)
3. [API Integration](#api-integration)
4. [React Integration](#react-integration)
5. [Vue Integration](#vue-integration)
6. [Communication Between Apps](#communication-between-apps)

---

## 1. iframe Integration (Simplest)

### Basic Implementation

```html
<!-- Embed as iframe -->
<iframe
    src="power_consumption.html"
    width="100%"
    height="800px"
    frameborder="0"
    style="border: none;">
</iframe>
```

### With Communication (postMessage)

**Parent App:**
```html
<iframe id="powerConsumptionFrame" src="power_consumption.html"></iframe>

<script>
// Send message to iframe
const iframe = document.getElementById('powerConsumptionFrame');
iframe.contentWindow.postMessage({
    type: 'SET_QUERY',
    data: { location: 'Station A', timeRange: 'last week' }
}, '*');

// Receive messages from iframe
window.addEventListener('message', (event) => {
    if (event.data.type === 'QUERY_COMPLETE') {
        console.log('Results:', event.data.results);
    }
});
</script>
```

**Inside power_consumption.js:**
```javascript
// Listen for messages from parent
window.addEventListener('message', (event) => {
    if (event.data.type === 'SET_QUERY') {
        // Process query
        handleQuery(event.data.data);
    }
});

// Send results to parent
function sendResultsToParent(results) {
    window.parent.postMessage({
        type: 'QUERY_COMPLETE',
        results: results
    }, '*');
}
```

**Pros:**
- No code changes needed
- Complete isolation (no CSS/JS conflicts)
- Easy to implement

**Cons:**
- Less flexible styling
- Communication requires postMessage
- Cannot easily share state

---

## 2. Component Integration (Recommended)

### Using the PowerConsumptionComponent Class

```javascript
// Create container in your HTML
<div id="power-consumption-container"></div>

// Initialize component
const powerConsumption = new PowerConsumptionComponent('power-consumption-container', {
    title: 'Power Consumption Analysis',
    subtitle: 'AI-powered pump efficiency analysis',
    theme: 'dark', // or 'light'

    // Callbacks
    onQueryComplete: (results) => {
        console.log('Query completed:', results);
        updateDashboard(results);
    },

    onAnalysisComplete: (analysis) => {
        console.log('Analysis completed:', analysis);
        showNotification('Analysis ready!');
    }
});

// Initialize
powerConsumption.initialize();

// Programmatic access
const results = powerConsumption.getResults();
powerConsumption.setData(customData);
powerConsumption.exportCSV();
```

### Component API Reference

#### Constructor Options
```javascript
{
    title: string,              // Component title
    subtitle: string,           // Component subtitle
    theme: 'dark' | 'light',   // Color theme
    apiEndpoint: string,        // Custom API endpoint
    onQueryComplete: function,  // Callback when query completes
    onAnalysisComplete: function // Callback when analysis completes
}
```

#### Methods
- `initialize()` - Initialize the component
- `getResults()` - Get current query results
- `setData(data)` - Set custom data
- `exportCSV()` - Export results as CSV
- `destroy()` - Clean up and remove component

---

## 3. API Integration

### Backend Integration Architecture

```javascript
// Frontend: Modify component to use your API
const powerConsumption = new PowerConsumptionComponent('container', {
    apiEndpoint: 'https://your-api.com/power-consumption',

    onQueryComplete: async (results) => {
        // Send to your backend
        await fetch('/api/save-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(results)
        });
    }
});
```

### Backend Endpoint Example (Node.js/Express)

```javascript
// server.js
const express = require('express');
const app = express();

app.post('/api/power-consumption/query', async (req, res) => {
    const { location, dateRange, sensors } = req.body;

    // Query your database
    const results = await db.query(`
        SELECT * FROM pump_data
        WHERE location = ? AND date >= ? AND date <= ?
    `, [location, dateRange.from, dateRange.to]);

    res.json({ results });
});

app.post('/api/save-query', async (req, res) => {
    const queryResults = req.body;

    // Save to database
    await db.insert('query_history', queryResults);

    res.json({ success: true });
});
```

---

## 4. React Integration

### Method 1: Using the Component Class

```jsx
// PowerConsumptionWrapper.jsx
import React, { useEffect, useRef } from 'react';

function PowerConsumptionWrapper({ onQueryComplete }) {
    const containerRef = useRef(null);
    const componentRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && !componentRef.current) {
            // Load the component script dynamically
            const script = document.createElement('script');
            script.src = '/power_consumption_component.js';
            script.onload = () => {
                componentRef.current = new window.PowerConsumptionComponent(
                    containerRef.current.id,
                    {
                        onQueryComplete: (results) => {
                            onQueryComplete?.(results);
                        }
                    }
                );
                componentRef.current.initialize();
            };
            document.body.appendChild(script);
        }

        return () => {
            if (componentRef.current) {
                componentRef.current.destroy();
            }
        };
    }, [onQueryComplete]);

    return <div id="power-consumption-react" ref={containerRef} />;
}

export default PowerConsumptionWrapper;
```

### Method 2: Native React Component

```jsx
// PowerConsumption.jsx
import React, { useState } from 'react';
import './professional.css';

function PowerConsumption() {
    const [results, setResults] = useState([]);
    const [activeTab, setActiveTab] = useState('analysis');

    const handleQuery = async (query) => {
        const response = await fetch('/api/power-consumption', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        });
        const data = await response.json();
        setResults(data);
    };

    return (
        <div className="power-consumption-component">
            <div className="tabs-container">
                <div className="tabs-list">
                    <button
                        className={activeTab === 'analysis' ? 'tabs-trigger active' : 'tabs-trigger'}
                        onClick={() => setActiveTab('analysis')}>
                        Data Query
                    </button>
                    <button
                        className={activeTab === 'insights' ? 'tabs-trigger active' : 'tabs-trigger'}
                        onClick={() => setActiveTab('insights')}>
                        Insights
                    </button>
                </div>

                {activeTab === 'analysis' && (
                    <div className="tabs-content">
                        {/* Query interface */}
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="tabs-content">
                        {/* Insights display */}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PowerConsumption;
```

### Usage in React App

```jsx
// App.jsx
import PowerConsumptionWrapper from './components/PowerConsumptionWrapper';

function App() {
    const handleQueryComplete = (results) => {
        console.log('Query completed:', results);
        // Update other parts of your app
    };

    return (
        <div className="app">
            <h1>Energy Management Dashboard</h1>
            <PowerConsumptionWrapper onQueryComplete={handleQueryComplete} />
        </div>
    );
}
```

---

## 5. Vue Integration

### Vue 3 Composition API

```vue
<!-- PowerConsumption.vue -->
<template>
  <div ref="containerRef" id="power-consumption-vue"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  onQueryComplete: Function
});

const containerRef = ref(null);
let componentInstance = null;

onMounted(() => {
  // Load script
  const script = document.createElement('script');
  script.src = '/power_consumption_component.js';
  script.onload = () => {
    componentInstance = new window.PowerConsumptionComponent(
      'power-consumption-vue',
      {
        onQueryComplete: (results) => {
          props.onQueryComplete?.(results);
        }
      }
    );
    componentInstance.initialize();
  };
  document.body.appendChild(script);
});

onUnmounted(() => {
  if (componentInstance) {
    componentInstance.destroy();
  }
});
</script>
```

### Usage in Vue App

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <h1>Energy Management Dashboard</h1>
    <PowerConsumption :onQueryComplete="handleQueryComplete" />
  </div>
</template>

<script setup>
import PowerConsumption from './components/PowerConsumption.vue';

const handleQueryComplete = (results) => {
  console.log('Query completed:', results);
};
</script>
```

---

## 6. Communication Between Apps

### Event-Based Communication

```javascript
// Create custom events
class PowerConsumptionEvents {
    static QUERY_START = 'pc:query:start';
    static QUERY_COMPLETE = 'pc:query:complete';
    static ANALYSIS_COMPLETE = 'pc:analysis:complete';
    static ERROR = 'pc:error';
}

// Emit events from component
function emitEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
}

// Listen in parent app
window.addEventListener('pc:query:complete', (event) => {
    console.log('Query completed:', event.detail);
    updateDashboard(event.detail);
});
```

### Shared State Management (Redux/Vuex)

```javascript
// Redux action
export const updatePowerConsumptionResults = (results) => ({
    type: 'POWER_CONSUMPTION_RESULTS_UPDATE',
    payload: results
});

// In component callback
onQueryComplete: (results) => {
    store.dispatch(updatePowerConsumptionResults(results));
}
```

---

## Best Practices

### 1. Lazy Loading
```javascript
// Only load component when needed
async function loadPowerConsumption() {
    if (!window.PowerConsumptionComponent) {
        await import('./power_consumption_component.js');
    }
    // Initialize component
}
```

### 2. Error Handling
```javascript
const powerConsumption = new PowerConsumptionComponent('container', {
    onError: (error) => {
        console.error('Component error:', error);
        showErrorNotification('Failed to load power consumption data');
    }
});
```

### 3. Responsive Design
```css
/* Make iframe responsive */
.iframe-container {
    position: relative;
    width: 100%;
    padding-bottom: 75%; /* 4:3 aspect ratio */
}

.iframe-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
```

### 4. Security
```javascript
// Validate postMessage origin
window.addEventListener('message', (event) => {
    // Only accept messages from trusted origins
    if (event.origin !== 'https://your-domain.com') {
        return;
    }
    // Process message
});
```

---

## Troubleshooting

### CSS Conflicts
```html
<!-- Use Shadow DOM to isolate styles -->
<script>
const container = document.getElementById('container');
const shadow = container.attachShadow({ mode: 'open' });
// Load component inside shadow DOM
</script>
```

### Dependency Conflicts
```html
<!-- Load dependencies in specific order -->
<script src="chart.js" defer></script>
<script src="lucide.js" defer></script>
<script src="power_consumption_component.js" defer></script>
```

---

## Complete Example

See `integration_example.html` for a full working example showing:
- Multi-view navigation
- Component initialization
- Data passing between views
- Event handling
- Export functionality

---

## Support

For issues or questions:
1. Check the example files
2. Review the component API documentation
3. Test in isolation before integrating
4. Use browser DevTools to debug postMessage communication
