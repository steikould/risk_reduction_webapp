/**
 * Power Consumption Component
 * Modular version that can be embedded in any webapp
 *
 * Usage:
 * const powerConsumption = new PowerConsumptionComponent('container-id');
 * powerConsumption.initialize();
 */

class PowerConsumptionComponent {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }

        // Configuration options
        this.options = {
            title: options.title || 'Pump Power Consumption Analysis',
            subtitle: options.subtitle || 'AI-powered analysis of pump power consumption for efficiency',
            apiEndpoint: options.apiEndpoint || null,
            onQueryComplete: options.onQueryComplete || null,
            onAnalysisComplete: options.onAnalysisComplete || null,
            theme: options.theme || 'dark', // 'dark' or 'light'
            ...options
        };

        // State
        this.queryData = {
            dateRange: '',
            fromDate: '',
            toDate: '',
            locations: [],
            lineNumbers: [],
            sensorCategories: [],
            timeIncrement: ''
        };
        this.queryResults = [];
        this.charts = {};
    }

    /**
     * Initialize the component
     */
    initialize() {
        this.render();
        this.attachEventListeners();
        this.loadDependencies();
    }

    /**
     * Load required dependencies if not already loaded
     */
    async loadDependencies() {
        const dependencies = [
            { name: 'Chart.js', url: 'https://cdn.jsdelivr.net/npm/chart.js', check: () => window.Chart },
            { name: 'Lucide', url: 'https://unpkg.com/lucide@latest', check: () => window.lucide },
            { name: 'JSZip', url: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', check: () => window.JSZip }
        ];

        for (const dep of dependencies) {
            if (!dep.check()) {
                await this.loadScript(dep.url);
            }
        }

        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    /**
     * Load external script
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Render the component HTML
     */
    render() {
        this.container.innerHTML = `
            <div class="power-consumption-component" data-theme="${this.options.theme}">
                <div class="mb-6">
                    <h1 class="text-xl font-bold">${this.options.title}</h1>
                    <p class="text-secondary text-sm">${this.options.subtitle}</p>
                </div>

                <div class="tabs-container">
                    <div class="tabs-list grid w-full grid-cols-3">
                        <button class="tabs-trigger active" data-tab="analysis">Data Query</button>
                        <button class="tabs-trigger" data-tab="data">Data Insights</button>
                        <button class="tabs-trigger" data-tab="golden">Validation & Sources</button>
                    </div>

                    <!-- Analysis Tab -->
                    <div id="pc-analysis-tab" class="tabs-content space-y-6 pt-6">
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title">Query Assistant</h2>
                                <p class="card-description">Ask for the data you need in natural language</p>
                            </div>
                            <div class="card-content">
                                <div id="pc-chatMessages" class="chat-messages mb-4"></div>

                                <div class="mb-4">
                                    <p class="text-sm text-secondary mb-2">Quick Requests:</p>
                                    <div class="flex flex-wrap gap-2">
                                        <button class="suggestion-button" data-request="Get last week's data for all lines and locations">
                                            Last week - all lines & locations
                                        </button>
                                        <button class="suggestion-button" data-request="Get flowrates for all pumps at Station A for last week">
                                            Flowrates - Station A - last week
                                        </button>
                                        <button class="suggestion-button" data-request="Get all flowrates for all locations on Line 1">
                                            Flowrates - Line 1 - all locations
                                        </button>
                                    </div>
                                </div>

                                <div class="flex gap-2">
                                    <input type="text" id="pc-chatInput" class="input flex-1" placeholder="Type your request here...">
                                    <button id="pc-chatSendBtn" class="button primary">Send</button>
                                </div>
                            </div>
                        </div>

                        <div class="card hidden" id="pc-queryResultsCard">
                            <div class="card-header">
                                <h3 class="card-title">Query Results</h3>
                                <p class="card-description" id="pc-queryResultsDescription">Showing results based on selected filters</p>
                            </div>
                            <div class="card-content">
                                <div id="pc-queryResultsTable"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Data Insights Tab -->
                    <div id="pc-data-tab" class="tabs-content space-y-4 pt-6 hidden">
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title">AI-Powered Data Analysis</h2>
                                <p class="card-description">Machine learning insights and recommendations</p>
                            </div>
                            <div class="card-content">
                                <div id="pc-llm-recommendations-container">
                                    <p class="text-secondary text-center py-8">Run a query to see AI-powered insights and recommendations.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Validation Tab -->
                    <div id="pc-golden-tab" class="tabs-content space-y-6 pt-6 hidden">
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title">Data Validation Assistant</h2>
                                <p class="card-description">Query specifications and validation rules</p>
                            </div>
                            <div class="card-content">
                                <div id="pc-validationChatMessages" class="chat-messages mb-4"></div>
                                <div class="flex gap-2">
                                    <input type="text" id="pc-validationChatInput" class="input flex-1" placeholder="Ask about specifications...">
                                    <button id="pc-validationChatSendBtn" class="button primary">Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Tab switching
        const tabButtons = this.container.querySelectorAll('.tabs-trigger');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Chat send button
        const chatSendBtn = this.container.querySelector('#pc-chatSendBtn');
        const chatInput = this.container.querySelector('#pc-chatInput');

        chatSendBtn?.addEventListener('click', () => this.handleChatMessage());
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleChatMessage();
        });

        // Suggestion buttons
        const suggestionButtons = this.container.querySelectorAll('.suggestion-button');
        suggestionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const request = e.target.dataset.request;
                this.handlePredefinedRequest(request);
            });
        });
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update button states
        const tabButtons = this.container.querySelectorAll('.tabs-trigger');
        tabButtons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update content visibility
        const tabs = {
            analysis: this.container.querySelector('#pc-analysis-tab'),
            data: this.container.querySelector('#pc-data-tab'),
            golden: this.container.querySelector('#pc-golden-tab')
        };

        Object.keys(tabs).forEach(key => {
            if (key === tabName) {
                tabs[key]?.classList.remove('hidden');
            } else {
                tabs[key]?.classList.add('hidden');
            }
        });
    }

    /**
     * Handle chat message
     */
    handleChatMessage() {
        const chatInput = this.container.querySelector('#pc-chatInput');
        const message = chatInput?.value.trim();

        if (!message) return;

        this.addChatMessage(message, true);
        chatInput.value = '';

        // Process the message (with simulated delay)
        setTimeout(() => {
            this.processChatQuery(message);
        }, 500);
    }

    /**
     * Handle predefined request
     */
    handlePredefinedRequest(request) {
        this.addChatMessage(request, true);
        setTimeout(() => {
            this.processChatQuery(request);
        }, 500);
    }

    /**
     * Add message to chat
     */
    addChatMessage(message, isUser = false) {
        const chatMessages = this.container.querySelector('#pc-chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'assistant'}`;
        messageDiv.innerHTML = `
            <div class="chat-bubble">${message}</div>
            <div class="chat-timestamp">${new Date().toLocaleTimeString()}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Process chat query (placeholder - connect to your backend)
     */
    processChatQuery(query) {
        // Parse the query and extract parameters
        const parsedQuery = this.parseNaturalLanguageQuery(query);

        // Show AI response
        const response = `I understand you want data for ${parsedQuery.timeRange || 'the specified period'} at ${parsedQuery.location || 'all locations'}. Let me fetch that for you.`;
        this.addChatMessage(response, false);

        // Generate mock results
        setTimeout(() => {
            this.queryResults = this.generateMockData(parsedQuery);
            this.displayQueryResults();

            if (this.options.onQueryComplete) {
                this.options.onQueryComplete(this.queryResults);
            }
        }, 1000);
    }

    /**
     * Parse natural language query (basic implementation)
     */
    parseNaturalLanguageQuery(query) {
        const params = {};

        // Time range detection
        if (query.includes('last week')) {
            params.timeRange = 'last week';
            params.days = 7;
        } else if (query.includes('last month')) {
            params.timeRange = 'last month';
            params.days = 30;
        } else if (query.includes('3 weeks')) {
            params.timeRange = '3 weeks';
            params.days = 21;
        }

        // Location detection
        if (query.includes('Station A')) params.location = 'Station A';
        if (query.includes('Station B')) params.location = 'Station B';
        if (query.includes('Station C')) params.location = 'Station C';

        // Line detection
        if (query.includes('Line 1')) params.line = 'Line 1';
        if (query.includes('Line 2')) params.line = 'Line 2';

        // Sensor type detection
        if (query.includes('flowrate')) params.sensor = 'flowrate';
        if (query.includes('temperature')) params.sensor = 'temperature';
        if (query.includes('pressure')) params.sensor = 'pressure';

        return params;
    }

    /**
     * Generate mock data (replace with actual API call)
     */
    generateMockData(params) {
        const results = [];
        const count = 20;

        for (let i = 0; i < count; i++) {
            results.push({
                timestamp: new Date(Date.now() - Math.random() * (params.days || 7) * 24 * 60 * 60 * 1000).toISOString(),
                location: params.location || `Station ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}`,
                line: params.line || `Line ${Math.floor(Math.random() * 8) + 1}`,
                sensor: params.sensor || ['flowrate', 'temperature', 'pressure'][Math.floor(Math.random() * 3)],
                value: (Math.random() * 200 + 50).toFixed(2)
            });
        }

        return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Display query results
     */
    displayQueryResults() {
        const resultsCard = this.container.querySelector('#pc-queryResultsCard');
        const resultsTable = this.container.querySelector('#pc-queryResultsTable');
        const resultsDesc = this.container.querySelector('#pc-queryResultsDescription');

        if (!resultsCard || !resultsTable) return;

        resultsCard.classList.remove('hidden');
        resultsDesc.textContent = `Showing ${this.queryResults.length} results`;

        const headers = Object.keys(this.queryResults[0] || {});
        let tableHTML = `
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h.charAt(0).toUpperCase() + h.slice(1)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.queryResults.map(row => `
                            <tr>
                                ${headers.map(h => `<td>${row[h]}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        resultsTable.innerHTML = tableHTML;
    }

    /**
     * Get current query results
     */
    getResults() {
        return this.queryResults;
    }

    /**
     * Set custom data
     */
    setData(data) {
        this.queryResults = data;
        this.displayQueryResults();
    }

    /**
     * Export data as CSV
     */
    exportCSV() {
        if (this.queryResults.length === 0) return;

        const headers = Object.keys(this.queryResults[0]);
        const csv = [
            headers.join(','),
            ...this.queryResults.map(row =>
                headers.map(h => JSON.stringify(row[h])).join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `power_consumption_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    /**
     * Destroy the component
     */
    destroy() {
        // Clean up charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });

        // Clear container
        this.container.innerHTML = '';
    }
}

// Export for use in different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PowerConsumptionComponent;
}
if (typeof window !== 'undefined') {
    window.PowerConsumptionComponent = PowerConsumptionComponent;
}
