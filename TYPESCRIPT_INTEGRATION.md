# TypeScript App Integration Guide

## Quick Copy-Paste Integration

### 1. Copy Files to Your TypeScript Project

```bash
# Copy these files to your /public folder:
your-app/
├── public/
│   ├── power_consumption.html
│   ├── power_consumption.js
│   ├── power_consumption.css
│   ├── fuel_blending.html
│   ├── fuel_blending.js
│   └── professional.css
```

### 2. Create TypeScript Pages/Components

#### Method A: Simple Link (Opens in new tab)

```tsx
// src/pages/Dashboard.tsx
import React from 'react';

export default function Dashboard() {
    return (
        <div className="dashboard">
            <h1>Energy Management Dashboard</h1>

            <div className="tools-grid">
                <a
                    href="/power_consumption.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tool-card">
                    <h3>Power Consumption Analysis</h3>
                    <p>AI-powered pump efficiency analysis</p>
                </a>

                <a
                    href="/fuel_blending.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tool-card">
                    <h3>Fuel Blending Calculator</h3>
                    <p>RVP optimization and blend ratios</p>
                </a>
            </div>
        </div>
    );
}
```

#### Method B: iframe Embed (Stays in your app)

```tsx
// src/pages/PowerConsumptionPage.tsx
import React from 'react';

interface PowerConsumptionPageProps {
    className?: string;
}

export default function PowerConsumptionPage({ className }: PowerConsumptionPageProps) {
    return (
        <div className={className} style={{ width: '100%', height: '100vh' }}>
            <iframe
                src="/power_consumption.html"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                }}
                title="Power Consumption Analysis"
            />
        </div>
    );
}
```

```tsx
// src/pages/FuelBlendingPage.tsx
import React from 'react';

export default function FuelBlendingPage() {
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <iframe
                src="/fuel_blending.html"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                title="Fuel Blending Calculator"
            />
        </div>
    );
}
```

#### Method C: Navigation Component with Both Options

```tsx
// src/components/ToolsNavigation.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'embed' | 'newTab';

export default function ToolsNavigation() {
    const [viewMode, setViewMode] = useState<ViewMode>('embed');
    const navigate = useNavigate();

    const openTool = (tool: 'power-consumption' | 'fuel-blending') => {
        if (viewMode === 'newTab') {
            const urls = {
                'power-consumption': '/power_consumption.html',
                'fuel-blending': '/fuel_blending.html'
            };
            window.open(urls[tool], '_blank');
        } else {
            navigate(`/${tool}`);
        }
    };

    return (
        <div className="tools-navigation">
            <div className="view-mode-toggle">
                <button
                    onClick={() => setViewMode('embed')}
                    className={viewMode === 'embed' ? 'active' : ''}>
                    Embed
                </button>
                <button
                    onClick={() => setViewMode('newTab')}
                    className={viewMode === 'newTab' ? 'active' : ''}>
                    New Tab
                </button>
            </div>

            <div className="tools-grid">
                <button onClick={() => openTool('power-consumption')}>
                    Power Consumption Analysis
                </button>
                <button onClick={() => openTool('fuel-blending')}>
                    Fuel Blending Calculator
                </button>
            </div>
        </div>
    );
}
```

### 3. Set Up Routing

#### React Router v6

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PowerConsumptionPage from './pages/PowerConsumptionPage';
import FuelBlendingPage from './pages/FuelBlendingPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/power-consumption" element={<PowerConsumptionPage />} />
                <Route path="/fuel-blending" element={<FuelBlendingPage />} />
            </Routes>
        </BrowserRouter>
    );
}
```

#### Next.js

```tsx
// pages/power-consumption.tsx
export default function PowerConsumption() {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <iframe
                src="/power_consumption.html"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
            />
        </div>
    );
}
```

```tsx
// pages/fuel-blending.tsx
export default function FuelBlending() {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <iframe
                src="/fuel_blending.html"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
            />
        </div>
    );
}
```

### 4. Add Navigation Menu

```tsx
// src/components/AppLayout.tsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function AppLayout() {
    return (
        <div className="app-layout">
            <nav className="sidebar">
                <Link to="/">Dashboard</Link>
                <Link to="/power-consumption">Power Consumption</Link>
                <Link to="/fuel-blending">Fuel Blending</Link>
            </nav>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}
```

```tsx
// Updated App.tsx with layout
import AppLayout from './components/AppLayout';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="power-consumption" element={<PowerConsumptionPage />} />
                    <Route path="fuel-blending" element={<FuelBlendingPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
```

### 5. Communication Between TypeScript App and iframe (Optional)

If you want to pass data between your TypeScript app and the embedded pages:

```tsx
// src/pages/PowerConsumptionPage.tsx
import React, { useRef, useEffect } from 'react';

interface PowerConsumptionPageProps {
    initialQuery?: {
        location?: string;
        dateRange?: string;
    };
}

export default function PowerConsumptionPage({ initialQuery }: PowerConsumptionPageProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || !initialQuery) return;

        // Send data to iframe when it loads
        const handleLoad = () => {
            iframe.contentWindow?.postMessage({
                type: 'SET_QUERY',
                data: initialQuery
            }, '*');
        };

        iframe.addEventListener('load', handleLoad);
        return () => iframe.removeEventListener('load', handleLoad);
    }, [initialQuery]);

    useEffect(() => {
        // Listen for messages from iframe
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'QUERY_COMPLETE') {
                console.log('Results from iframe:', event.data.results);
                // Do something with the results in your TypeScript app
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <iframe
                ref={iframeRef}
                src="/power_consumption.html"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Power Consumption Analysis"
            />
        </div>
    );
}
```

### 6. Styling the iframe Container

```tsx
// src/pages/PowerConsumptionPage.tsx
import React from 'react';
import styles from './PowerConsumptionPage.module.css';

export default function PowerConsumptionPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Power Consumption Analysis</h1>
                <button onClick={() => window.open('/power_consumption.html', '_blank')}>
                    Open in New Tab
                </button>
            </div>

            <div className={styles.iframeContainer}>
                <iframe
                    src="/power_consumption.html"
                    className={styles.iframe}
                    title="Power Consumption Analysis"
                />
            </div>
        </div>
    );
}
```

```css
/* PowerConsumptionPage.module.css */
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
}

.header {
    padding: 1rem 2rem;
    background-color: #161B22;
    border-bottom: 1px solid #30363D;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.iframeContainer {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
}
```

## Framework-Specific Instructions

### Create React App
```bash
# 1. Copy files to /public
cp power_consumption.html public/
cp power_consumption.js public/
cp fuel_blending.html public/
# etc.

# 2. Access at http://localhost:3000/power_consumption.html
# 3. No build configuration needed!
```

### Vite
```bash
# 1. Copy files to /public
cp power_consumption.html public/
# etc.

# 2. Access at http://localhost:5173/power_consumption.html
# 3. Files are automatically served
```

### Next.js
```bash
# 1. Copy files to /public
cp power_consumption.html public/
# etc.

# 2. Access at http://localhost:3000/power_consumption.html
# 3. Works out of the box
```

### Angular
```bash
# 1. Copy files to /src/assets
cp power_consumption.html src/assets/
# etc.

# 2. Update angular.json:
"assets": [
  "src/favicon.ico",
  "src/assets",
  {
    "glob": "**/*.html",
    "input": "src/assets",
    "output": "/"
  }
]
```

## Type Safety (Optional)

If you want TypeScript types for communication:

```typescript
// src/types/power-consumption.ts
export interface QueryParams {
    location?: string;
    dateRange?: string;
    lineNumbers?: string[];
    sensorCategories?: string[];
}

export interface QueryResult {
    timestamp: string;
    location: string;
    line: string;
    sensor: string;
    value: number;
}

export interface PowerConsumptionMessage {
    type: 'SET_QUERY' | 'QUERY_COMPLETE';
    data?: QueryParams | QueryResult[];
}
```

```tsx
// Usage
import type { PowerConsumptionMessage, QueryParams } from '../types/power-consumption';

const sendQuery = (query: QueryParams) => {
    const message: PowerConsumptionMessage = {
        type: 'SET_QUERY',
        data: query
    };

    iframeRef.current?.contentWindow?.postMessage(message, '*');
};
```

## Summary

**Easiest approach (recommended for most cases):**
1. Copy HTML/JS/CSS files to `/public` folder
2. Create iframe wrapper components in TypeScript
3. Use React Router to navigate between pages
4. Done! ✅

No build tools, no transpilation, no complex integration needed.
