document.addEventListener('DOMContentLoaded', () => {
    // State variables
    let currentStep = 0;
    let formData = {
        projectName: '',
        projectType: '',
        businessUnit: '',
        estimatedCost: '',
        timeline: '',
        proposedAction: '',
        mitigationCircumstances: '',
        expectedDowntime: '',
        improvementMetrics: '',
        technicalRequirements: '',
        businessRequirements: '',
        historicalContext: ''
    };
    let llmRecommendations = [];
    let powerConsumptionScore = null;
    let loading = false;

    // Mock historical data and business context
    const mockHistoricalData = {
        similarProjects: [
            { name: "DRA Skid Pump Replacement - Station 47", type: "Infrastructure", rrrScore: 0.78, successRate: 85, downtime: "4.2 hrs", cost: "$45,000" },
            { name: "Main Line Pump Overhaul - Station 23", type: "Infrastructure", rrrScore: 0.82, successRate: 92, downtime: "6.1 hrs", cost: "$38,500" },
            { name: "DRA System Upgrade - Station 31", type: "Infrastructure", rrrScore: 0.73, successRate: 78, downtime: "8.7 hrs", cost: "$67,200" },
            { name: "Emergency Pump Replacement - Station 15", type: "Infrastructure", rrrScore: 0.65, successRate: 72, downtime: "12.3 hrs", cost: "$52,800" },
            { name: "Scheduled DRA Pump Maintenance - Station 62", type: "Infrastructure", rrrScore: 0.88, successRate: 95, downtime: "2.8 hrs", cost: "$28,900" }
        ],
        riskPatterns: {
            "Infrastructure": ["Equipment failure during operation", "Unplanned downtime extension", "Environmental compliance", "Personnel safety risks"],
            "Product": ["Market timing", "User adoption", "Feature creep"],
            "Process": ["Change management", "Training requirements", "Compliance"]
        },
        businessMetrics: {
            avgProjectCost: 46480,
            avgTimeline: 2.5,
            avgDowntime: 6.8,
            successRate: 84
        }
    };

    const steps = [
        { title: "Run Query", icon: 'play-circle' },
        { title: "Query Summary", icon: 'list-checks' },
        { title: "AI Insights", icon: 'brain' },
        { title: "Power Consumption Forecast", icon: 'trending-up' }
    ];

    // DOM Elements
    const stepIndicatorsContainer = document.querySelector('#analysis-tab > .flex');
    const currentStepTitle = document.getElementById('current-step-title');
    const currentStepDescription = document.getElementById('current-step-description');
    const currentStepContent = document.getElementById('current-step-content');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const sidebarDrawer = document.getElementById('sidebar-drawer');
    const drawerClose = document.getElementById('drawer-close');
    const drawerTitle = document.getElementById('drawer-title');
    const drawerContent = document.getElementById('drawer-content');

    // Tabs functionality
    const tabsList = document.querySelector('.tabs-list');
    const tabsContent = {
        analysis: document.getElementById('analysis-tab'),
        data: document.getElementById('data-tab'),
        golden: document.getElementById('golden-tab')
    };

    tabsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('tabs-trigger')) {
            document.querySelectorAll('.tabs-trigger').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            for (const key in tabsContent) {
                tabsContent[key].classList.add('hidden');
            }
            tabsContent[e.target.dataset.tab].classList.remove('hidden');
        }
    });

    // Handle form input changes
    function handleInputChange(field, value) {
        formData[field] = value;
    }

    // Render step indicators
    function renderStepIndicators() {
        stepIndicatorsContainer.innerHTML = '';
        steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = `flex items-center`;
            stepDiv.innerHTML = `
                <div class="flex items-center justify-center w-10 h-10 rounded-full ${
                    index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${step.icon} h-5 w-5"></svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium ${
                        index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                    }">
                        ${step.title}
                    </p>
                </div>
                ${index < steps.length - 1 ? `<div class="w-12 h-0.5 mx-4 ${index < currentStep ? 'bg-blue-500' : 'bg-gray-200'}"></div>` : ''}
            `;
            stepIndicatorsContainer.appendChild(stepDiv);
        });
        // Re-create Lucide icons after rendering
        lucide.createIcons();
    }

    // Render current step content
    function renderStepContent() {
        currentStepTitle.textContent = steps[currentStep].title;
        let description = "";
        switch (currentStep) {
            case 0: description = "Set filters for your query"; break;
            case 1: description = "Review query summary and results"; break;
            case 2: description = "AI-powered analysis of your query results"; break;
            case 3: description = "View the power consumption forecast"; break;
        }
        currentStepDescription.textContent = description;

        let contentHtml = '';
        switch (currentStep) {
            case 0:
                contentHtml = `
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="startDate" class="block text-sm font-medium mb-2">Start Date</label>
                                <input id="startDate" type="date" value="${formData.startDate || ''}" class="input" />
                            </div>
                            <div>
                                <label for="endDate" class="block text-sm font-medium mb-2">End Date</label>
                                <input id="endDate" type="date" value="${formData.endDate || ''}" class="input" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="location" class="block text-sm font-medium mb-2">Location</label>
                                <input id="location" value="${formData.location || ''}" placeholder="Enter location" class="input" />
                            </div>
                            <div>
                                <label for="lineNumber" class="block text-sm font-medium mb-2">Line Number</label>
                                <input id="lineNumber" type="number" value="${formData.lineNumber || ''}" placeholder="Enter line number" class="input" />
                            </div>
                        </div>
                        <div>
                            <label for="sensorTagIds" class="block text-sm font-medium mb-2">Sensor Tag IDs</label>
                            <textarea id="sensorTagIds" rows="3" placeholder="Enter comma-separated sensor tag IDs" class="textarea">${formData.sensorTagIds || ''}</textarea>
                        </div>
                        <div>
                            <label for="timeIncrement" class="block text-sm font-medium mb-2">Time Increment</label>
                            <div class="select-wrapper">
                                <button class="select-trigger" id="timeIncrementTrigger">
                                    <span id="timeIncrementValue">${formData.timeIncrement || 'Select time increment'}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                                </button>
                                <div class="select-content hidden" id="timeIncrementContent">
                                    <div class="select-item" data-value="raw">Raw</div>
                                    <div class="select-item" data-value="1min">1 Minute</div>
                                    <div class="select-item" data-value="5min">5 Minutes</div>
                                    <div class="select-item" data-value="15min">15 Minutes</div>
                                    <div class="select-item" data-value="1hour">1 Hour</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 1:
                contentHtml = `
                    <div class="space-y-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Query Profile</h3>
                            </div>
                            <div class="card-content grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p class="text-sm text-gray-500">Unique Tags</p>
                                    <p class="text-2xl font-bold">12</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Total Records</p>
                                    <p class="text-2xl font-bold">1,452</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Time Period</p>
                                    <p class="text-2xl font-bold">7d</p>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Query Results</h3>
                            </div>
                            <div class="card-content">
                                <div id="query-results-table-container"></div>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 2:
                contentHtml = `
                    <div class="space-y-4">
                        <div class="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain mx-auto h-12 w-12 text-blue-500 mb-4"><path d="M12 5c-3.31 0-6 2.69-6 6v3h12v-3c0-3.31-2.69-6-6-6Z"/><path d="M16 11V7"/><path d="M8 11V7"/><path d="M10 19v-6h4v6a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2Z"/></svg>
                            <h3 class="text-lg font-medium">AI Analysis in Progress</h3>
                            <p class="text-gray-600">Processing your pump data against historical patterns...</p>
                        </div>

                        ${loading ? `
                            <div class="space-y-2">
                                <div class="progress-bar">
                                    <div class="progress-indicator" style="--progress-width: 50%;"></div>
                                </div>
                                <p class="text-sm text-gray-600">Analyzing structured BQ data...</p>
                            </div>
                        ` : ''}

                        ${!loading && llmRecommendations.length > 0 ? `
                            <div class="space-y-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h3 class="card-title text-sm">Interactive Analysis</h3>
                                    </div>
                                    <div class="card-content">
                                        <div id="chatbot-container" class="space-y-4">
                                            <div id="chatbot-messages" class="space-y-4 h-48 overflow-y-auto p-4 border rounded-md">
                                                </div>
                                            <div class="flex items-center space-x-2">
                                                <input id="chatbot-input" type="text" placeholder="Ask a question about the recommendations..." class="input flex-grow" />
                                                <button id="chatbot-send" class="button primary">Send</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <h4 class="font-medium flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb h-5 w-5 mr-2 text-yellow-500"><path d="M15 14v-3"/><path d="M15 10V7a3 3 0 0 0-3-3V2H9.5a.5.5 0 0 0-.5.5v.5a.5.5 0 0 1-.5.5H8a.5.5 0 0 0-.5.5v.5a.5.5 0 0 1-.5.5H6a.5.5 0 0 0-.5.5V11"/><path d="M7 14v-3"/><path d="M12 22a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4z"/><path d="M12 18v-2"/></svg>
                                    AI Insights
                                </h4>
                                ${llmRecommendations.map((rec, index) => `
                                    <div class="card">
                                        <div class="card-header pb-2">
                                            <div class="flex items-center justify-between">
                                                <h3 class="card-title text-sm">${rec.category}</h3>
                                                <span class="badge outline">
                                                    ${Math.round(rec.confidence * 100)}% confidence
                                                </span>
                                            </div>
                                        </div>
                                        <div class="card-content pt-0">
                                            <p class="text-sm mb-2">${rec.suggestion}</p>
                                            <p class="text-xs text-gray-500">Source: ${rec.source}</p>
                                            ${rec.graph ? `<div class="mt-4"><canvas id="chart-${index}" height="150"></canvas></div>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
                break;
            case 3:
                contentHtml = `
                    <div class="space-y-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Power Consumption Forecast</h3>
                            </div>
                            <div class="card-content">
                                <canvas id="forecast-chart" height="150"></canvas>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Forecast Data</h3>
                            </div>
                            <div class="card-content">
                                <div id="forecast-table-container"></div>
                            </div>
                        </div>
                    </div>
                `;
                break;
            default:
                contentHtml = '';
        }
        currentStepContent.innerHTML = contentHtml;
        addEventListenersToStepContent(); // Re-attach listeners after content is rendered
        lucide.createIcons(); // Re-create Lucide icons for new content
    }

    // Function to handle custom select dropdowns
    function setupSelects() {
        document.querySelectorAll('.select-wrapper').forEach(wrapper => {
            const trigger = wrapper.querySelector('.select-trigger');
            const content = wrapper.querySelector('.select-content');
            const valueSpan = trigger.querySelector('span');

            if (!trigger || !content || !valueSpan) return;

            // Check if this select is already initialized to avoid duplicates
            if (trigger.hasAttribute('data-initialized')) {
                return;
            }
            trigger.setAttribute('data-initialized', 'true');

            // Set content width to match trigger
            content.style.setProperty('--trigger-width', `${trigger.offsetWidth}px`);

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();

                // Close all other dropdowns
                document.querySelectorAll('.select-content').forEach(otherContent => {
                    if (otherContent !== content) {
                        otherContent.classList.add('hidden');
                    }
                });

                content.classList.toggle('hidden');

                // Adjust position if it goes off screen
                const rect = trigger.getBoundingClientRect();
                const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                if (rect.bottom + content.offsetHeight > viewportHeight && rect.top - content.offsetHeight > 0) {
                    content.style.bottom = `${trigger.offsetHeight + 5}px`;
                    content.style.top = 'auto';
                } else {
                    content.style.top = `${trigger.offsetHeight + 5}px`;
                    content.style.bottom = 'auto';
                }
            });

            content.addEventListener('click', (e) => {
                if (e.target.classList.contains('select-item')) {
                    const selectedValue = e.target.dataset.value;
                    const selectedText = e.target.textContent;

                    // Update UI
                    valueSpan.textContent = selectedText;
                    content.classList.add('hidden');

                    // Handle special cases for golden table selector
                    if (trigger.id === 'goldenTableSelectorTrigger') {
                        selectedGoldenTable = mockGoldenTables[selectedValue];
                        updateGoldenTabContent();
                    } else {
                        // Handle regular form fields
                        const selectId = trigger.id.replace('Trigger', '');
                        if (typeof handleInputChange === 'function') {
                            handleInputChange(selectId, selectedValue);
                        }
                    }

                    // Update selected class for styling
                    content.querySelectorAll('.select-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    e.target.classList.add('selected');
                }
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!wrapper.contains(e.target)) {
                    content.classList.add('hidden');
                }
            });
        });
    }

    // Attach event listeners to dynamically rendered inputs/textareas
    function addEventListenersToStepContent() {
        const inputs = currentStepContent.querySelectorAll('.input');
        inputs.forEach(input => {
            const field = input.id;
            input.value = formData[field]; // Ensure current value is set
            input.oninput = (e) => handleInputChange(field, e.target.value);
        });

        const textareas = currentStepContent.querySelectorAll('.textarea');
        textareas.forEach(textarea => {
            const field = textarea.id;
            textarea.value = formData[field]; // Ensure current value is set
            textarea.oninput = (e) => handleInputChange(field, e.target.value);
        });

        setupSelects(); // Setup the custom selects for current step

        const chatbotSend = document.getElementById('chatbot-send');
        if (chatbotSend) {
            chatbotSend.addEventListener('click', handleChatbotSend);
        }

        if (currentStep === 1) {
            renderQueryResultsTable();
        } else if (currentStep === 3) {
            renderForecastChart();
            renderForecastTable();
        }
    }

    function openDrawer(project) {
        drawerTitle.textContent = project.name;
        drawerContent.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="font-medium text-sm text-gray-500">Project Type</h4>
                    <p>${project.type}</p>
                </div>
                <div>
                    <h4 class="font-medium text-sm text-gray-500">RRR Score</h4>
                    <p>${project.rrrScore}</p>
                </div>
                <div>
                    <h4 class="font-medium text-sm text-gray-500">Success Rate</h4>
                    <p>${project.successRate}%</p>
                </div>
                <div>
                    <h4 class="font-medium text-sm text-gray-500">Downtime</h4>
                    <p>${project.downtime}</p>
                </div>
                <div>
                    <h4 class="font-medium text-sm text-gray-500">Cost</h4>
                    <p>${project.cost}</p>
                </div>
            </div>
        `;
        sidebarDrawer.classList.add('open');
    }

    function closeDrawer() {
        sidebarDrawer.classList.remove('open');
    }

    drawerClose.addEventListener('click', closeDrawer);

    const queryDrawer = document.getElementById('query-drawer');
    const queryDrawerClose = document.getElementById('query-drawer-close');

    function openQueryDrawer(query) {
        const queryDrawerContent = document.getElementById('query-drawer-content');
        queryDrawerContent.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="font-medium text-sm text-gray-500">Plain Language Query</h4>
                    <p>${query}</p>
                </div>
                <div>
                    <label for="sql-query-input" class="block text-sm font-medium mb-1">BigQuery SQL</label>
                    <textarea id="sql-query-input" class="textarea" rows="5">SELECT * FROM \`${selectedGoldenTable.name}\` WHERE ...</textarea>
                </div>
                <button id="submit-sql-query-btn" class="button primary w-full">Submit Query</button>
            </div>
        `;
        queryDrawer.classList.add('open');

        document.getElementById('submit-sql-query-btn').addEventListener('click', () => {
            queryDrawer.classList.remove('open');
            displayQueryResults(document.getElementById('sql-query-input').value);
        });
    }

    function displayQueryResults(query) {
        const tabId = `query-results-${Date.now()}`;
        const tabName = `Results: ${table.name.substring(0, 10)}...`;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Create new tab button
        const newTab = document.createElement('button');
        newTab.className = 'tabs-trigger';
        newTab.dataset.tab = tabId;
        newTab.textContent = tabName;
        tabsList.appendChild(newTab);

        // Create new tab content
        const newTabContent = document.createElement('div');
        newTabContent.id = tabId;
        newTabContent.className = 'tabs-content space-y-4 pt-6';
        newTabContent.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Query: ${query}</h2>
                    <p class="card-description">Table: ${selectedGoldenTable.name} | Time Window: ${startDate} to ${endDate}</p>
                </div>
                <div class="card-content">
                    <div class="flex justify-end mb-4">
                        <button class="button primary text-sm" onclick="handleAnalyze('${tabId}')">Analyze</button>
                    </div>
                    <div id="table-container-${tabId}"></div>
                </div>
            </div>
        `;
        document.querySelector('.tabs-container').appendChild(newTabContent);

        // Switch to the new tab
        document.querySelectorAll('.tabs-trigger').forEach(btn => btn.classList.remove('active'));
        newTab.classList.add('active');
        document.querySelectorAll('.tabs-content').forEach(content => content.classList.add('hidden'));
        newTabContent.classList.remove('hidden');


        // Populate the table
        populateResultsTable(tabId, selectedGoldenTable);
    }

    function closeQueryDrawer() {
        queryDrawer.classList.remove('open');
    }

    queryDrawerClose.addEventListener('click', closeQueryDrawer);

    function handleChatbotSend() {
        const input = document.getElementById('chatbot-input');
        const messagesContainer = document.getElementById('chatbot-messages');
        const message = input.value.trim();
        if (message) {
            // Display user message
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'text-right';
            userMessageDiv.innerHTML = `<div class="inline-block bg-blue-500 text-white p-2 rounded-lg">${message}</div>`;
            messagesContainer.appendChild(userMessageDiv);

            // Clear input
            input.value = '';

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Mock AI response
            setTimeout(() => {
                const aiResponseDiv = document.createElement('div');
                aiResponseDiv.className = 'text-left';
                aiResponseDiv.innerHTML = `<div class="inline-block bg-gray-200 text-gray-800 p-2 rounded-lg">This is a mock response to "${message}".</div>`;
                messagesContainer.appendChild(aiResponseDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 1000);
        }
    }

    // LLM Analysis and Power Consumption Score Calculation
    function generateLLMRecommendations() {
        setLoading(true);
        setTimeout(() => {
            llmRecommendations = [
                {
                    category: "Outlier Detection",
                    suggestion: "Detected an unusual spike in power consumption for PUMP-A1 on 2023-07-23. Recommend investigating for potential cavitation or mechanical issue.",
                    confidence: 0.95,
                    source: "Time-series Anomaly Detection",
                    graph: true
                },
                {
                    category: "Efficiency Opportunity",
                    suggestion: "PUMP-C3 is consistently operating at a lower efficiency than its peers. A 5% improvement is possible with impeller adjustments.",
                    confidence: 0.88,
                    source: "Comparative Power Analysis",
                    graph: true
                },
                {
                    category: "Predictive Maintenance",
                    suggestion: "Vibration data for PUMP-B2 correlates with increased power draw. Recommend scheduling maintenance in the next 2-4 weeks to prevent failure.",
                    confidence: 0.82,
                    source: "Multi-variate Correlation Analysis",
                    graph: true
                },
                {
                    category: "Load Balancing",
                    suggestion: "Shifting 15% of the load from PUMP-A1 to PUMP-B2 during peak hours could reduce overall power consumption by 8%.",
                    confidence: 0.79,
                    source: "System Load Optimization Model",
                    graph: true
                }
            ];
            calculatePowerConsumptionScore();
            setLoading(false);
            renderApp(); // Re-render to show recommendations
            renderCharts();
        }, 2000);
    }

    function calculatePowerConsumptionScore() {
        const estimatedCostNum = parseFloat(formData.estimatedCost) || 0;
        const timelineNum = parseFloat(formData.timeline) || 0;
        const expectedDowntimeNum = parseFloat(formData.expectedDowntime) || 0;

        const baseConsumption = 150; // kWh
        const costFactor = estimatedCostNum > 50000 ? 20 : -10;
        const timelineFactor = timelineNum > 4 ? 15 : -5;
        const downtimeFactor = expectedDowntimeNum > 8 ? 25 : -15;

        const finalScore = baseConsumption + costFactor + timelineFactor + downtimeFactor;
        powerConsumptionScore = finalScore;
    }

    function setLoading(isLoading) {
        loading = isLoading;
        nextButton.disabled = isLoading;
        if (isLoading && currentStep === 2) {
             // Re-render only the progress bar part if it exists
             renderStepContent();
        }
    }

    function renderCharts() {
        llmRecommendations.forEach((rec, index) => {
            if (rec.graph) {
                const ctx = document.getElementById(`chart-${index}`).getContext('2d');
                let chartConfig;

                switch (index) {
                    case 0: // Equipment Risk Mitigation
                        chartConfig = {
                            type: 'line',
                            data: {
                                labels: ['0%', '10%', '20%', '30%', '35%', '40%', '50%'],
                                datasets: [{
                                    label: 'Downtime Reduction vs. Cost',
                                    data: [0, 5, 15, 30, 40, 55, 75],
                                    borderColor: 'rgb(59, 130, 246)',
                                    tension: 0.4,
                                    pointBackgroundColor: (context) => context.dataIndex === 4 ? 'red' : 'rgb(59, 130, 246)',
                                    pointRadius: (context) => context.dataIndex === 4 ? 6 : 3,
                                }]
                            },
                            options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'Downtime Reduction' } }, y: { title: { display: true, text: 'Implementation Cost ($k)' } } } }
                        };
                        break;
                    case 1: // Operational Continuity
                        chartConfig = {
                            type: 'bar',
                            data: {
                                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                datasets: [{
                                    label: 'Flow Rate by Day',
                                    data: [85, 45, 70, 75, 90, 60, 55],
                                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                    borderColor: 'rgb(59, 130, 246)',
                                    borderWidth: 1
                                }]
                            },
                            options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'Day of Week' } }, y: { title: { display: true, text: 'Avg. Flow Rate' } } } }
                        };
                        break;
                    case 2: // Safety Protocol
                        chartConfig = {
                            type: 'doughnut',
                            data: {
                                labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                                datasets: [{
                                    label: 'Risk Scenarios',
                                    data: [2, 5, 18],
                                    backgroundColor: ['rgb(239, 68, 68)', 'rgb(245, 158, 11)', 'rgb(34, 197, 94)'],
                                }]
                            },
                            options: { responsive: true, plugins: { legend: { position: 'top' } } }
                        };
                        break;
                    case 3: // Cost Optimization
                        chartConfig = {
                            type: 'line',
                            data: {
                                labels: ['-20%', '-10%', '0%', '10%', '15%', '20%'],
                                datasets: [{
                                    label: 'Cost Overrun vs. Probability',
                                    data: [5, 10, 25, 40, 60, 75],
                                    borderColor: 'rgb(239, 68, 68)',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    fill: true,
                                    tension: 0.3
                                }]
                            },
                            options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'Cost Overrun' } }, y: { title: { display: true, text: 'Probability (%)' } } } }
                        };
                        break;
                }

                new Chart(ctx, chartConfig);
            }
        });
    }

    // Navigation buttons
    prevButton.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            renderApp();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
            if (currentStep === 1) { // If moving from Risk Assessment to LLM Analysis
                generateLLMRecommendations();
            }
            currentStep++;
            renderApp();
        } else {
            // This is the "Export Results" button
            console.log('Exporting results...', { formData, llmRecommendations, powerConsumptionScore });
            alert('Results Exported! Check console for details.');
        }
    });

    // Initial render
    function renderApp() {
        renderStepIndicators();
        renderStepContent();

        prevButton.disabled = currentStep === 0;
        if (currentStep < steps.length - 1) {
            nextButton.textContent = currentStep === 0 ? 'Run Query' : 'Next';
            nextButton.classList.remove('outline');
            nextButton.classList.add('primary');
        } else {
            nextButton.textContent = 'Export Results';
            nextButton.classList.remove('primary');
            nextButton.classList.add('primary'); // Still primary for export
        }
        nextButton.disabled = loading;
    }

    function renderQueryResultsTable() {
        const container = document.getElementById('query-results-table-container');
        if (!container) return;

        const mockData = [
            { timestamp: '2023-07-23 10:00:00', tag: 'PUMP-A1', value: 120.5, location: 'Station A', line: 1 },
            { timestamp: '2023-07-23 10:01:00', tag: 'PUMP-A1', value: 121.2, location: 'Station A', line: 1 },
            { timestamp: '2023-07-23 10:00:00', tag: 'PUMP-B2', value: 210.8, location: 'Station B', line: 2 },
            { timestamp: '2023-07-23 10:01:00', tag: 'PUMP-B2', value: 209.9, location: 'Station B', line: 2 },
            { timestamp: '2023-07-23 10:00:00', tag: 'PUMP-C3', value: 150.1, location: 'Station C', line: 3 },
            { timestamp: '2023-07-23 10:01:00', tag: 'PUMP-C3', value: 151.3, location: 'Station C', line: 3 },
        ];

        const headers = Object.keys(mockData[0]);

        container.innerHTML = `
            <table class="w-full text-sm text-left">
                <thead class="bg-gray-50">
                    <tr>
                        ${headers.map(h => `<th class="p-2 font-medium">${h.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${mockData.map(row => `
                        <tr class="border-b">
                            ${headers.map(h => `<td class="p-2">${row[h]}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function renderForecastChart() {
        const ctx = document.getElementById('forecast-chart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['+1d', '+2d', '+3d', '+4d', '+5d', '+6d', '+7d'],
                datasets: [
                    {
                        label: 'Forecast',
                        data: [125, 128, 130, 127, 132, 135, 133],
                        borderColor: 'rgb(59, 130, 246)',
                        tension: 0.4,
                    },
                    {
                        label: 'Upper Bound',
                        data: [130, 133, 135, 132, 137, 140, 138],
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        fill: '+1',
                    },
                    {
                        label: 'Lower Bound',
                        data: [120, 123, 125, 122, 127, 130, 128],
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        fill: false,
                    },
                ]
            },
            options: { responsive: true, plugins: { legend: { display: true } }, scales: { y: { title: { display: true, text: 'Power Consumption (kWh)' } } } }
        });
    }

    function renderForecastTable() {
        const container = document.getElementById('forecast-table-container');
        if (!container) return;

        const mockData = [
            { date: '2023-07-24', forecast: 125, lower_bound: 120, upper_bound: 130 },
            { date: '2023-07-25', forecast: 128, lower_bound: 123, upper_bound: 133 },
            { date: '2023-07-26', forecast: 130, lower_bound: 125, upper_bound: 135 },
            { date: '2023-07-27', forecast: 127, lower_bound: 122, upper_bound: 132 },
            { date: '2023-07-28', forecast: 132, lower_bound: 127, upper_bound: 137 },
            { date: '2023-07-29', forecast: 135, lower_bound: 130, upper_bound: 140 },
            { date: '2023-07-30', forecast: 133, lower_bound: 128, upper_bound: 138 },
        ];

        const headers = Object.keys(mockData[0]);

        container.innerHTML = `
            <table class="w-full text-sm text-left">
                <thead class="bg-gray-50">
                    <tr>
                        ${headers.map(h => `<th class="p-2 font-medium">${h.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${mockData.map(row => `
                        <tr class="border-b">
                            ${headers.map(h => `<td class="p-2">${row[h]}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Initial render call
    renderApp();

    // --- Golden Tables Tab Functionality ---
    let selectedGoldenTable = null;

    const mockGoldenTables = {
        "maintenance_reports": {
            name: "maintenance_reports",
            description: "Detailed reports of maintenance activities.",
            columns: [
                { name: "report_id", type: "STRING" },
                { name: "asset_id", type: "STRING" },
                { name: "date", type: "DATE" },
                { name: "technician", type: "STRING" },
                { name: "summary", type: "STRING" }
            ],
            validationRules: [
                { id: "MR01", name: "Asset ID Exists", description: "Asset ID must be valid.", status: "Active" },
                { id: "MR02", name: "Technician Certified", description: "Technician must be certified for the asset type.", status: "Active" },
                { id: "MR03", name: "Date is not in future", description: "Maintenance date cannot be in the future.", status: "Active" }
            ],
            queries: [
                "Show all reports for asset X",
                "Recent reports by technician Y",
                "Reports with 'failure' in summary"
            ]
        },
        "safety_incidents": {
            name: "safety_incidents",
            description: "Records of safety incidents and near-misses.",
            columns: [
                { name: "incident_id", type: "STRING" },
                { name: "date", type: "DATE" },
                { name: "location", type: "STRING" },
                { name: "severity", type: "INTEGER" },
                { name: "report_link", type: "STRING" }
            ],
            validationRules: [
                { id: "SI01", name: "Severity Range", description: "Severity must be 1-5.", status: "Active" },
                { id: "SI02", name: "Location Code Valid", description: "Location code must be a valid facility code.", status: "Active" },
                { id: "SI03", name: "Report Link Active", description: "Report link must be an active URL.", status: "Pending" }
            ],
            queries: [
                "Show high severity incidents",
                "Incidents by location",
                "Recent near-misses"
            ]
        },
        "sensor_data": {
            name: "sensor_data",
            description: "Time-series data from pipeline sensors.",
            columns: [
                { name: "timestamp", type: "TIMESTAMP" },
                { name: "sensor_id", type: "STRING" },
                { name: "pressure", type: "FLOAT" },
                { name: "temperature", type: "FLOAT" },
                { name: "flow_rate", type: "FLOAT" }
            ],
            validationRules: [
                { id: "SD01", name: "Pressure within limits", description: "Pressure must be within operational limits.", status: "Active" },
                { id: "SD02", name: "Temperature within limits", description: "Temperature must be within operational limits.", status: "Active" },
                { id: "SD03", name: "Flow rate non-negative", description: "Flow rate must be non-negative.", status: "Active" }
            ],
            queries: [
                "Show pressure spikes for sensor X",
                "Average temperature by sensor",
                "Flow rate anomalies"
            ]
        }
    };

    function initializeGoldenTablesTab() {
        setupGoldenTableSelector();
        setupQueryInterface();
        setupVisualizationPanel();
        setupValidationRules();

        // Setup all selects after DOM is ready
        setTimeout(() => {
            setupSelects();
        }, 50);
    }

    function setupGoldenTableSelector() {
        const selectorContent = document.getElementById('goldenTableSelectorContent');
        const selectorValue = document.getElementById('goldenTableSelectorValue');

        // Clear existing content
        selectorContent.innerHTML = '';

        // Populate dropdown options
        Object.values(mockGoldenTables).forEach(table => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'select-item';
            optionDiv.dataset.value = table.name;
            optionDiv.textContent = table.name;
            selectorContent.appendChild(optionDiv);
        });

        // Pre-select the first table
        const firstTable = Object.values(mockGoldenTables)[0];
        if (firstTable) {
            selectedGoldenTable = firstTable;
            selectorValue.textContent = firstTable.name;
            updateGoldenTabContent();
        }

        // Set up the click handler using the same pattern as other selects
        const wrapper = selectorContent.closest('.select-wrapper');
        const trigger = wrapper.querySelector('.select-trigger');

        // Remove any existing listeners to prevent duplicates
        const newWrapper = wrapper.cloneNode(true);
        wrapper.parentNode.replaceChild(newWrapper, wrapper);

        // Now set up the select functionality using the main setupSelects function
        setupSelectsForGoldenTab();
    }

    function setupGoldenTableSelector() {
        const selectorContent = document.getElementById('goldenTableSelectorContent');
        const selectorValue = document.getElementById('goldenTableSelectorValue');

        if (!selectorContent || !selectorValue) {
            console.error('Golden table selector elements not found');
            return;
        }

        // Clear existing content
        selectorContent.innerHTML = '';

        // Populate dropdown options
        Object.values(mockGoldenTables).forEach(table => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'select-item';
            optionDiv.dataset.value = table.name;
            optionDiv.textContent = table.name;
            selectorContent.appendChild(optionDiv);
        });

        // Pre-select the first table
        const firstTable = Object.values(mockGoldenTables)[0];
        if (firstTable) {
            selectedGoldenTable = firstTable;
            selectorValue.textContent = firstTable.name;
            updateGoldenTabContent();
        }
    }

    function updateGoldenTabContent() {
        updateQuerySuggestions();
        renderMockChart('bar'); // Re-render chart with new data context
        renderValidationRules();
    }

    function updateQuerySuggestions() {
        const suggestionsContainer = document.querySelector('.query-suggestions');
        if (selectedGoldenTable) {
            suggestionsContainer.innerHTML = selectedGoldenTable.queries.map(q =>
                `<button class="button outline text-xs">"${q}"</button>`
            ).join('');
        } else {
            suggestionsContainer.innerHTML = '';
        }
    }

    function setupQueryInterface() {
        const executeBtn = document.querySelector('.execute-query-btn');
        const queryTextarea = document.querySelector('.query-interface-card textarea');
        const querySuggestions = document.querySelector('.query-suggestions');
        const datePresetContent = document.getElementById('datePresetContent');

        executeBtn.addEventListener('click', () => {
            if (!selectedGoldenTable) {
                alert("Please select a golden table first.");
                return;
            }
            openQueryDrawer(queryTextarea.value);
        });

        querySuggestions.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                queryTextarea.value = e.target.textContent.trim().replace(/"/g, '');
            }
        });

        datePresetContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-item')) {
                const months = parseInt(e.target.dataset.value);
                const endDate = new Date();
                const startDate = new Date();
                startDate.setMonth(endDate.getMonth() - months);

                document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
                document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
                document.getElementById('datePresetValue').textContent = e.target.textContent;
                datePresetContent.classList.add('hidden');

                // Manually trigger the select for the dropdown
                const trigger = document.getElementById('datePresetTrigger');
                const valueSpan = document.getElementById('datePresetValue');
                valueSpan.textContent = e.target.textContent;
                trigger.dispatchEvent(new Event('change'));
            }
        });
    }

    function setupVisualizationPanel() {
        const chartTypeSelector = document.querySelector('.chart-type-selector');
        chartTypeSelector.addEventListener('click', e => {
            if (e.target.tagName === 'BUTTON') {
                chartTypeSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                const chartType = e.target.dataset.type;
                renderMockChart(chartType);
            }
        });
    }

    function renderMockChart(type) {
        const chartContainer = document.querySelector('.chart-container');
        if (!selectedGoldenTable) {
            chartContainer.innerHTML = '<p>Select a table to see visualization</p>';
            return;
        }
        chartContainer.innerHTML = `<canvas id="golden-chart"></canvas>`;
        const ctx = document.getElementById('golden-chart').getContext('2d');

        // Destroy previous chart if it exists
        if (window.goldenChart instanceof Chart) {
            window.goldenChart.destroy();
        }

        const mockData = {
            labels: selectedGoldenTable.columns.map(c => c.name),
            datasets: [{
                label: `Data for ${selectedGoldenTable.name}`,
                data: selectedGoldenTable.columns.map(() => Math.random() * 100),
                backgroundColor: '#4F46E5',
            }]
        };

        window.goldenChart = new Chart(ctx, {
            type: type,
            data: mockData,
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function setupValidationRules() {
        const submitBtn = document.getElementById('submit-new-rule-btn');
        const newRuleInput = document.getElementById('new-rule-input');
        submitBtn.addEventListener('click', () => {
            if (!selectedGoldenTable) {
                alert("Please select a golden table first.");
                return;
            }
            const newRule = newRuleInput.value;
            alert(`Confirmed: New rule submission for table '${selectedGoldenTable.name}' has been received.\n\nNew Rule: ${newRule}`);
            newRuleInput.value = '';
        });
    }

    function renderValidationRules() {
        const container = document.getElementById('validation-rules-container');
        if (!selectedGoldenTable) {
            container.innerHTML = '<p>Select a table to see validation rules.</p>';
            return;
        }

        const rules = selectedGoldenTable.validationRules;
        const headers = Object.keys(rules[0]);

        container.innerHTML = `
            <table class="w-full text-sm text-left">
                <thead class="bg-gray-50">
                    <tr>
                        ${headers.map(h => `<th class="p-2 font-medium">${h.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rules.map(rule => `
                        <tr class="border-b">
                            ${headers.map(h => `<td class="p-2">${rule[h]}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Call initialization function when the golden tab is shown
    const goldenTabTrigger = document.querySelector('.tabs-trigger[data-tab="golden"]');
    goldenTabTrigger.addEventListener('click', () => {
        initializeGoldenTablesTab();
    });

    function populateResultsTable(tabId, table) {
        const tableContainer = document.getElementById(`table-container-${tabId}`);
        const headers = table.columns.map(c => c.name);
        const data = Array.from({ length: 10 }, () => {
            const row = {};
            headers.forEach(h => {
                row[h] = Math.floor(Math.random() * 100);
            });
            return row;
        });

        const renderTable = (filteredData) => {
            let tableHtml = `
                <div class="flex mb-4">
                    ${headers.map(h => `<input class="input text-sm mr-2" data-header="${h}" placeholder="Filter ${h}...">`).join('')}
                </div>
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            ${headers.map((h, i) => `<th class="p-2 font-medium cursor-pointer" data-sort-by="${h}">${h} ↕️</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredData.map(row => `
                            <tr class="border-b">
                                ${headers.map(h => `<td class="p-2">${row[h]}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            tableContainer.innerHTML = tableHtml;
        };

        renderTable(data);

        tableContainer.addEventListener('input', e => {
            if (e.target.classList.contains('input')) {
                const filters = {};
                tableContainer.querySelectorAll('.input').forEach(input => {
                    if (input.value) {
                        filters[input.dataset.header] = input.value.toLowerCase();
                    }
                });

                const filteredData = data.filter(row => {
                    return Object.keys(filters).every(header => {
                        return String(row[header]).toLowerCase().includes(filters[header]);
                    });
                });

                renderTable(filteredData);
            }
        });

        tableContainer.addEventListener('click', e => {
            if (e.target.tagName === 'TH') {
                const sortBy = e.target.dataset.sortBy;
                const sortedData = [...data].sort((a, b) => {
                    if (a[sortBy] < b[sortBy]) return -1;
                    if (a[sortBy] > b[sortBy]) return 1;
                    return 0;
                });
                renderTable(sortedData);
            }
        });
    }
    function exportToExcel(tabId) {
        const table = document.querySelector(`#table-container-${tabId} table`);
        let csv = [];
        for (const row of table.rows) {
            const rowData = [];
            for (const cell of row.cells) {
                rowData.push(cell.textContent);
            }
            csv.push(rowData.join(','));
        }

        const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'query_results.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    document.addEventListener('click', e => {
        if (e.target.id.startsWith('export-')) {
            const tabId = e.target.id.replace('export-', '');
            exportToExcel(tabId);
        } else if (e.target.id.startsWith('analyze-')) {
            const tabId = e.target.id.replace('analyze-', '');
            createDashboardTab(tabId);
        }
    });

    // Add this to the global scope to handle the dynamic buttons
    window.handleAnalyze = function(tabId) {
        createDashboardTab(tabId);
    }

    function createDashboardTab(sourceTabId) {
        const tabId = `dashboard-${Date.now()}`;
        const tabName = `Dashboard: ${selectedGoldenTable.name.substring(0, 10)}...`;
        const query = document.querySelector(`#${sourceTabId.replace('analyze', 'table-container')} .card-title`).textContent;
        const timeWindow = document.querySelector(`#${sourceTabId.replace('analyze', 'table-container')} .card-description`).textContent;

        // Create new tab button
        const newTab = document.createElement('button');
        newTab.className = 'tabs-trigger';
        newTab.dataset.tab = tabId;
        newTab.textContent = tabName;
        tabsList.appendChild(newTab);

        // Create new tab content
        const newTabContent = document.createElement('div');
        newTabContent.id = tabId;
        newTabContent.className = 'tabs-content space-y-4 pt-6';
        newTabContent.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">${query}</h2>
                    <p class="card-description">${timeWindow}</p>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="card text-center">
                    <div class="card-content">
                        <h3 class="text-lg font-medium">Anomaly Score</h3>
                        <p class="text-3xl font-bold text-red-500">7.8</p>
                        <p class="text-sm text-gray-500">ML Driven KPI</p>
                    </div>
                </div>
                <div class="card text-center">
                    <div class="card-content">
                        <h3 class="text-lg font-medium">Data Quality</h3>
                        <p class="text-3xl font-bold text-green-500">98%</p>
                        <p class="text-sm text-gray-500">ML Driven KPI</p>
                    </div>
                </div>
                <div class="card text-center">
                    <div class="card-content">
                        <h3 class="text-lg font-medium">Projected Risk</h3>
                        <p class="text-3xl font-bold text-yellow-500">Medium</p>
                        <p class="text-sm text-gray-500">ML Driven KPI</p>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Time Series with Outliers</h3>
                    </div>
                    <div class="card-content">
                        <canvas id="chart1-${tabId}"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Distribution</h3>
                    </div>
                    <div class="card-content">
                        <canvas id="chart2-${tabId}"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Correlation Matrix</h3>
                    </div>
                    <div class="card-content">
                        <canvas id="chart3-${tabId}"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Category Breakdown</h3>
                    </div>
                    <div class="card-content">
                        <canvas id="chart4-${tabId}"></canvas>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.tabs-container').appendChild(newTabContent);

        // Switch to new tab
        newTab.click();

        // Render charts
        renderDashboardCharts(tabId);
    }

    function renderDashboardCharts(tabId) {
        // Chart 1: Time Series with Outliers
        new Chart(document.getElementById(`chart1-${tabId}`).getContext('2d'), {
            type: 'line',
            data: {
                labels: Array.from({ length: 10 }, (_, i) => `Point ${i + 1}`),
                datasets: [{
                    label: 'Value',
                    data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)),
                    borderColor: '#3b82f6',
                }, {
                    label: 'ML Outliers',
                    data: [null, 85, null, null, 20, null, 95, null, null, null],
                    backgroundColor: 'red',
                    pointRadius: 5,
                    type: 'scatter'
                }]
            }
        });

        // Chart 2: Distribution
        new Chart(document.getElementById(`chart2-${tabId}`).getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['<20', '20-40', '40-60', '60-80', '>80'],
                datasets: [{
                    label: 'Distribution',
                    data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
                    backgroundColor: '#818cf8',
                }]
            }
        });

        // Chart 3: Correlation Matrix (mock)
        const chart3Ctx = document.getElementById(`chart3-${tabId}`).getContext('2d');
        chart3Ctx.fillStyle = '#f3f4f6';
        chart3Ctx.fillRect(0, 0, 300, 200);
        chart3Ctx.fillStyle = '#6b7280';
        chart3Ctx.font = '16px sans-serif';
        chart3Ctx.fillText('Mock Correlation Matrix', 50, 100);


        // Chart 4: Category Breakdown
        new Chart(document.getElementById(`chart4-${tabId}`).getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Category A', 'Category B', 'Category C'],
                datasets: [{
                    data: [30, 50, 20],
                    backgroundColor: ['#a5b4fc', '#c7d2fe', '#e0e7ff'],
                }]
            }
        });
    }
    // Initialize the app
    renderApp();
});