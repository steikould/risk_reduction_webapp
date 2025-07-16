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
    let rrrScore = null;
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
        { title: "Project Overview", icon: 'file-text' },
        { title: "Risk Assessment", icon: 'alert-triangle' },
        { title: "AI Insights", icon: 'brain' },
        { title: "RRR Results", icon: 'trending-up' }
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
            case 0: description = "Enter basic project information"; break;
            case 1: description = "Provide detailed requirements and risk factors"; break;
            case 2: description = "AI analysis of your project data"; break;
            case 3: description = "Final RRR score and recommendations"; break;
        }
        currentStepDescription.textContent = description;

        let contentHtml = '';
        switch (currentStep) {
            case 0:
                contentHtml = `
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="projectName" class="block text-sm font-medium mb-2">Project Name</label>
                                <input id="projectName" value="${formData.projectName}" placeholder="Enter project name" class="input" />
                            </div>
                            <div>
                                <label for="projectType" class="block text-sm font-medium mb-2">Project Type</label>
                                <div class="select-wrapper">
                                    <button class="select-trigger" id="projectTypeTrigger">
                                        <span id="projectTypeValue">${formData.projectType || 'Select project type'}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                                    </button>
                                    <div class="select-content hidden" id="projectTypeContent">
                                        <div class="select-item" data-value="Equipment Replacement">Equipment Replacement</div>
                                        <div class="select-item" data-value="Maintenance">Maintenance</div>
                                        <div class="select-item" data-value="Safety Upgrade">Safety Upgrade</div>
                                        <div class="select-item" data-value="Compliance">Compliance</div>
                                        <div class="select-item" data-value="Emergency Repair">Emergency Repair</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="businessUnit" class="block text-sm font-medium mb-2">Business Unit</label>
                                <div class="select-wrapper">
                                    <button class="select-trigger" id="businessUnitTrigger">
                                        <span id="businessUnitValue">${formData.businessUnit || 'Select business unit'}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                                    </button>
                                    <div class="select-content hidden" id="businessUnitContent">
                                        <div class="select-item" data-value="Pipeline Operations">Pipeline Operations</div>
                                        <div class="select-item" data-value="Maintenance">Maintenance</div>
                                        <div class="select-item" data-value="Engineering">Engineering</div>
                                        <div class="select-item" data-value="Operations">Operations</div>
                                        <div class="select-item" data-value="Safety & Compliance">Safety & Compliance</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label for="estimatedCost" class="block text-sm font-medium mb-2">Estimated Cost ($)</label>
                                <input id="estimatedCost" type="number" value="${formData.estimatedCost}" placeholder="Enter estimated cost" class="input" />
                            </div>
                        </div>

                        <div>
                            <label for="timeline" class="block text-sm font-medium mb-2">Timeline (weeks)</label>
                            <input id="timeline" type="number" value="${formData.timeline}" placeholder="Enter timeline in weeks" class="input" />
                        </div>

                        <div>
                            <label for="proposedAction" class="block text-sm font-medium mb-2">Proposed Action</label>
                            <textarea id="proposedAction" rows="3" placeholder="Describe the proposed pump replacement action (e.g., Replace DRA skid pump during scheduled maintenance window...)" class="textarea">${formData.proposedAction}</textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="mitigationCircumstances" class="block text-sm font-medium mb-2">Mitigation Circumstances</label>
                                <textarea id="mitigationCircumstances" rows="3" placeholder="Describe risk mitigation measures (e.g., Hot standby pump available, bypass line operational...)" class="textarea">${formData.mitigationCircumstances}</textarea>
                            </div>
                            <div>
                                <label for="expectedDowntime" class="block text-sm font-medium mb-2">Expected Downtime (hours)</label>
                                <input id="expectedDowntime" type="number" step="0.1" value="${formData.expectedDowntime}" placeholder="Enter expected downtime" class="input" />
                            </div>
                        </div>

                        <div>
                            <label for="improvementMetrics" class="block text-sm font-medium mb-2">Improvement Metrics</label>
                            <textarea id="improvementMetrics" rows="2" placeholder="Expected improvements (e.g., 15% efficiency increase, reduced vibration, extended MTBF...)" class="textarea">${formData.improvementMetrics}</textarea>
                        </div>
                    </div>
                `;
                break;
            case 1:
                contentHtml = `
                    <div class="space-y-4">
                        <div>
                            <label for="technicalRequirements" class="block text-sm font-medium mb-2">Technical Requirements</label>
                            <textarea id="technicalRequirements" rows="4" placeholder="Describe technical requirements and constraints..." class="textarea">${formData.technicalRequirements}</textarea>
                        </div>

                        <div>
                            <label for="businessRequirements" class="block text-sm font-medium mb-2">Business Requirements</label>
                            <textarea id="businessRequirements" rows="4" placeholder="Describe business requirements and objectives..." class="textarea">${formData.businessRequirements}</textarea>
                        </div>

                        <div>
                            <h3 class="font-medium mb-2">Historical Context</h3>
                            <div class="grid grid-cols-1 gap-2">
                                ${mockHistoricalData.similarProjects.map((project, index) => `
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100" data-project-index="${index}">
                                        <div>
                                            <span class="font-medium">${project.name}</span>
                                            <span class="badge outline ml-2">${project.type}</span>
                                        </div>
                                        <div class="text-sm text-gray-600 text-right">
                                            <div>RRR: ${project.rrrScore} | Success: ${project.successRate}%</div>
                                            <div>Downtime: ${project.downtime} | Cost: ${project.cost}</div>
                                        </div>
                                    </div>
                                `).join('')}
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
                            <p class="text-gray-600">Processing your project data against historical patterns...</p>
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
                        <div class="text-center">
                            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle h-8 w-8 text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                            </div>
                            <h3 class="text-2xl font-bold mb-2">RRR Analysis Complete</h3>
                            <div class="text-4xl font-bold text-green-600 mb-2">
                                ${rrrScore ? (rrrScore * 100).toFixed(1) : 'N/A'}%
                            </div>
                            <p class="text-gray-600">Risk Reduction Ratio Score</p>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title text-sm">Project Viability</h3>
                                </div>
                                <div class="card-content">
                                    <div class="text-2xl font-bold">
                                        ${rrrScore && rrrScore > 0.7 ? 'High' : rrrScore && rrrScore > 0.5 ? 'Medium' : 'Low'}
                                    </div>
                                    <p class="text-sm text-gray-600">
                                        ${rrrScore && rrrScore > 0.7 ? 'Proceed with confidence' : 'Consider risk mitigation'}
                                    </p>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title text-sm">Comparable Projects</h3>
                                </div>
                                <div class="card-content">
                                    <div class="text-2xl font-bold">
                                        ${mockHistoricalData.similarProjects.length}
                                    </div>
                                    <p class="text-sm text-gray-600">Similar historical projects analyzed</p>
                                </div>
                            </div>
                        </div>

                        <div class="alert">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle h-4 w-4 alert-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 22h16a2 2 0 0 0 1.73-4Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            <div class="flex-1">
                                <h3 class="alert-title">Important Note</h3>
                                <p class="alert-description">
                                    This DRA pump replacement analysis is based on ${mockHistoricalData.similarProjects.length} similar pipeline operations and current safety protocols. Final approval required from Pipeline Operations Manager.
                                </p>
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

            // Set content width to match trigger
            content.style.setProperty('--trigger-width', `${trigger.offsetWidth}px`);

            trigger.addEventListener('click', () => {
                content.classList.toggle('hidden');
                // Adjust position if it goes off screen (simple top/bottom flip)
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

                    // Update formData based on the select ID
                    const selectId = trigger.id.replace('Trigger', '');
                    handleInputChange(selectId, selectedValue);

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

        document.querySelectorAll('[data-project-index]').forEach(item => {
            item.addEventListener('click', (e) => {
                const projectIndex = e.currentTarget.dataset.projectIndex;
                const project = mockHistoricalData.similarProjects[projectIndex];
                openDrawer(project);
            });
        });
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

    // LLM Analysis and RRR Score Calculation
    function generateLLMRecommendations() {
        setLoading(true);
        setTimeout(() => {
            llmRecommendations = [
                {
                    category: "Equipment Risk Mitigation",
                    suggestion: "Based on Station 47 DRA pump replacement, implement hot standby configuration to reduce downtime risk by 35%",
                    confidence: 0.88,
                    source: "Historical Pipeline Operations Data",
                    graph: true
                },
                {
                    category: "Operational Continuity",
                    suggestion: "Schedule replacement during low-flow period (Tuesday 2-6 AM) to minimize throughput impact - reduces risk exposure by 28%",
                    confidence: 0.92,
                    source: "Flow Pattern Analysis",
                    graph: true
                },
                {
                    category: "Safety Protocol",
                    suggestion: "Implement nitrogen purging procedure used in Station 23 overhaul - eliminated 2 high-risk scenarios",
                    confidence: 0.85,
                    source: "Safety Incident Database",
                    graph: true
                },
                {
                    category: "Cost Optimization",
                    suggestion: "Pre-order critical gaskets and seals based on Station 31 lessons learned - avoids 15% cost overrun risk",
                    confidence: 0.78,
                    source: "Procurement Pattern Analysis",
                    graph: true
                }
            ];
            calculateRRRScore();
            setLoading(false);
            renderApp(); // Re-render to show recommendations
            renderCharts();
        }, 2000);
    }

    function calculateRRRScore() {
        const estimatedCostNum = parseFloat(formData.estimatedCost) || 0;
        const expectedDowntimeNum = parseFloat(formData.expectedDowntime) || 0;

        const baseScore = 0.7;
        const projectTypeBonus = formData.projectType === 'Equipment Replacement' ? 0.05 : 0.02;
        const costFactor = estimatedCostNum > 50000 ? -0.05 : 0.05;
        const downtimeFactor = expectedDowntimeNum > 6 ? -0.1 : 0.08;
        const mitigationBonus = formData.mitigationCircumstances ? 0.07 : 0;

        const finalScore = Math.max(0, Math.min(1, baseScore + projectTypeBonus + costFactor + downtimeFactor + mitigationBonus));
        rrrScore = finalScore;
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
            console.log('Exporting results...', { formData, llmRecommendations, rrrScore });
            alert('Results Exported! Check console for details.');
        }
    });

    // Initial render
    function renderApp() {
        renderStepIndicators();
        renderStepContent();

        prevButton.disabled = currentStep === 0;
        if (currentStep < steps.length - 1) {
            nextButton.textContent = currentStep === 1 ? 'Analyze with AI' : 'Next';
            nextButton.classList.remove('outline');
            nextButton.classList.add('primary');
        } else {
            nextButton.textContent = 'Export Results';
            nextButton.classList.remove('primary');
            nextButton.classList.add('primary'); // Still primary for export
        }
        nextButton.disabled = loading;
    }

    // Initial render call
    renderApp();

    // --- Golden Tables Tab Functionality ---
    function initializeGoldenTablesTab() {
        setupQueryInterface();
        setupSchemaBrowser();
        setupVisualizationPanel();
        setupValidationRules();
        setupSelects(); // Ensure custom selects in this tab are initialized
    }

    // 1. Query Interface
    function setupQueryInterface() {
        const executeBtn = document.querySelector('.execute-query-btn');
        const queryTextarea = document.querySelector('.query-interface-card textarea');
        const querySuggestions = document.querySelector('.query-suggestions');

        executeBtn.addEventListener('click', () => {
            alert(`Executing query: "${queryTextarea.value}"`);
        });

        querySuggestions.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                queryTextarea.value = e.target.textContent.trim().replace(/"/g, '');
            }
        });
    }

    // 2. Schema Browser
    function setupSchemaBrowser() {
        const mockTables = [
          {
            name: "project_patterns",
            description: "Historical project data for pattern analysis",
            columns: [
              {name: "project_id", type: "STRING", description: "Unique project identifier"},
              {name: "project_type", type: "STRING", description: "Category of project"},
              {name: "rrr_score", type: "FLOAT", description: "Risk reduction ratio score"},
              {name: "created_date", type: "DATE", description: "Project creation date"}
            ],
            recordCount: 1247,
            lastUpdated: "Today"
          },
          {
            name: "risk_taxonomies",
            description: "Risk categorization and classification data",
            columns: [
              {name: "risk_id", type: "STRING", description: "Risk identifier"},
              {name: "category", type: "STRING", description: "Primary risk category"},
              {name: "severity", type: "INTEGER", description: "Risk severity level 1-5"}
            ],
            recordCount: 156,
            lastUpdated: "2 hours ago"
          }
        ];

        const tableList = document.querySelector('.table-list');
        const tableDetails = document.querySelector('.table-details');

        tableList.innerHTML = mockTables.map(table => `
            <div class="table-item border rounded p-2">
                <div class="table-item-header">
                    <span class="font-medium text-sm">${table.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                </div>
                <div class="table-item-columns text-xs space-y-1 mt-2">
                    ${table.columns.map(col => `
                        <div class="flex justify-between">
                            <span>${col.name}</span>
                            <span class="text-gray-500">${col.type}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        lucide.createIcons();

        tableList.addEventListener('click', e => {
            const header = e.target.closest('.table-item-header');
            if (header) {
                const tableItem = header.parentElement;
                tableItem.classList.toggle('open');
                const tableName = header.querySelector('span').textContent;
                const tableData = mockTables.find(t => t.name === tableName);

                if (tableItem.classList.contains('open')) {
                    tableDetails.innerHTML = `
                        <h5 class="font-bold text-sm mb-1">${tableData.name}</h5>
                        <p class="text-xs text-gray-600 mb-2">${tableData.description}</p>
                        <p class="text-xs"><strong>Records:</strong> ${tableData.recordCount}</p>
                        <p class="text-xs"><strong>Last Updated:</strong> ${tableData.lastUpdated}</p>
                    `;
                    tableDetails.classList.remove('hidden');
                } else {
                    tableDetails.classList.add('hidden');
                }
            }
        });
    }

    // 3. Visualization Panel
    function setupVisualizationPanel() {
        const chartTypeSelector = document.querySelector('.chart-type-selector');
        const chartContainer = document.querySelector('.chart-container');
        let currentChart = null;

        chartTypeSelector.addEventListener('click', e => {
            if (e.target.tagName === 'BUTTON') {
                chartTypeSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                const chartType = e.target.dataset.type;
                renderMockChart(chartType);
            }
        });

        function renderMockChart(type) {
            chartContainer.innerHTML = `<canvas id="golden-chart"></canvas>`;
            const ctx = document.getElementById('golden-chart').getContext('2d');

            if (currentChart) {
                currentChart.destroy();
            }

            const mockData = {
                labels: ['Infra', 'Product', 'Process', 'Compliance'],
                datasets: [{
                    label: 'Avg. RRR Score',
                    data: [0.78, 0.71, 0.69, 0.82],
                    backgroundColor: ['#4F46E5', '#818CF8', '#A5B4FC', '#C7D2FE'],
                }]
            };

            currentChart = new Chart(ctx, {
                type: type,
                data: mockData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: type === 'bar' || type === 'line' ? false : true,
                        }
                    }
                }
            });
        }
        // Initial render
        renderMockChart('bar');
    }

    // 4. Validation Rules
    function setupValidationRules() {
        const mockValidationRules = [
          {
            id: "rule_001",
            name: "RRR Score Range Check",
            description: "Ensures RRR scores are between 0.0 and 1.0",
            category: "Data Quality",
            status: "Active",
            success_rate: "99.2%",
            last_run: "2 hours ago"
          },
          {
            id: "rule_002",
            name: "Project Date Validation",
            description: "Validates project dates are not in the future",
            category: "Business Logic",
            status: "Active",
            success_rate: "100%",
            last_run: "1 hour ago"
          }
        ];

        const rulesList = document.querySelector('.rules-list');
        rulesList.innerHTML = mockValidationRules.map(rule => `
            <div class="text-sm p-2 border-b">
                <div class="flex justify-between items-center">
                    <span class="font-medium">${rule.name}</span>
                    <span class="badge ${rule.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs">${rule.status}</span>
                </div>
                <p class="text-xs text-gray-600">${rule.description}</p>
                <div class="text-xs text-gray-500 mt-1">
                    <span>${rule.category} | Success: ${rule.success_rate}</span>
                </div>
            </div>
        `).join('');

        const tabs = document.querySelector('.validation-rules-card .tabs-list');
        const contents = {
            'current-rules': document.querySelector('.validation-rules-card .current-rules'),
            'submit-rule': document.querySelector('.validation-rules-card .submit-rule')
        };

        tabs.addEventListener('click', e => {
            if (e.target.classList.contains('tabs-trigger')) {
                const tabName = e.target.dataset.tab;
                tabs.querySelectorAll('.tabs-trigger').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                for (const content in contents) {
                    contents[content].classList.add('hidden');
                }
                contents[tabName].classList.remove('hidden');
            }
        });

        const submissionForm = document.querySelector('.rule-submission-form');
        submissionForm.addEventListener('submit', e => {
            e.preventDefault();
            alert('Rule submitted for review!');
            submissionForm.reset();
            // Switch back to the rules list
            tabs.querySelector('[data-tab="current-rules"]').click();
        });
    }

    // Call initialization function when the golden tab is shown
    const goldenTabTrigger = document.querySelector('.tabs-trigger[data-tab="golden"]');
    goldenTabTrigger.addEventListener('click', () => {
        // A simple check to ensure it only initializes once
        if (!document.querySelector('.table-list').hasChildNodes()) {
            initializeGoldenTablesTab();
        }
    });
});