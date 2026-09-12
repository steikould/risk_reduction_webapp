document.addEventListener('DOMContentLoaded', () => {
    // State variables
    let queryData = {
        dateRange: '',
        fromDate: '',
        toDate: '',
        locations: [],
        lineNumbers: [],
        sensorCategories: [],
        timeIncrement: ''
    };
    let queryResults = [];
    let loading = false;

    // Mock historical data and business context
    const mockHistoricalData = {
        similarProjects: [
            { name: "Q3 Companion Animal Marketing Launch", type: "Infrastructure", rrrScore: 0.78, successRate: 85, downtime: "4.2 hrs", cost: "$45,000" },
            { name: "EU Distribution Network Overhaul", type: "Infrastructure", rrrScore: 0.82, successRate: 92, downtime: "6.1 hrs", cost: "$38,500" },
            { name: "Global ERP Implementation", type: "Infrastructure", rrrScore: 0.73, successRate: 78, downtime: "8.7 hrs", cost: "$67,200" },
            { name: "Livestock Vaccine Recall Protocol", type: "Infrastructure", rrrScore: 0.65, successRate: 72, downtime: "12.3 hrs", cost: "$52,800" },
            { name: "APAC Manufacturing Line Expansion", type: "Infrastructure", rrrScore: 0.88, successRate: 95, downtime: "2.8 hrs", cost: "$28,900" }
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

    // DOM Elements
    const queryResultsCard = document.getElementById('queryResultsCard');
    const queryResultsTable = document.getElementById('queryResultsTable');
    const queryResultsDescription = document.getElementById('queryResultsDescription');
    const sidebarDrawer = document.getElementById('sidebar-drawer');
    const drawerClose = document.getElementById('drawer-close');
    const drawerTitle = document.getElementById('drawer-title');
    const drawerContent = document.getElementById('drawer-content');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const suggestionButtons = document.querySelectorAll('.suggestion-button');
    const bottomDrawer = document.getElementById('bottom-drawer');
    const bottomDrawerClose = document.getElementById('bottom-drawer-close');
    const bottomDrawerTitle = document.getElementById('bottom-drawer-title');
    const bottomDrawerContent = document.getElementById('bottom-drawer-content');
    const bottomDrawerExport = document.getElementById('bottom-drawer-export');
    const alertDrawer = document.getElementById('alert-drawer');
    const alertDrawerClose = document.getElementById('alert-drawer-close');
    const alertSubject = document.getElementById('alert-subject');
    const alertBody = document.getElementById('alert-body');
    const alertRecipients = document.getElementById('alert-recipients');
    const attachRawData = document.getElementById('attach-raw-data');
    const attachAnalytics = document.getElementById('attach-analytics');
    const alertSubmitBtn = document.getElementById('alert-submit-btn');
    const alertDraftBtn = document.getElementById('alert-draft-btn');
    const alertCancelBtn = document.getElementById('alert-cancel-btn');

    // Tabs functionality
    const tabsList = document.querySelector('.tabs-list');
    const tabsContent = {
        overview: document.getElementById('overview-tab'),
        analysis: document.getElementById('analysis-tab'),
        data: document.getElementById('data-tab'),
        golden: document.getElementById('golden-tab')
    };

    tabsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('tabs-trigger')) {
            document.querySelectorAll('.tabs-trigger').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            for (const key in tabsContent) {
                if (tabsContent[key]) tabsContent[key].classList.add('hidden');
            }
            if (tabsContent[e.target.dataset.tab]) {
                tabsContent[e.target.dataset.tab].classList.remove('hidden');
            }
        }
    });

    // Calculate date range based on preset
    function calculateDateRange(rangeType) {
        const today = new Date();
        const fromDate = new Date();

        switch(rangeType) {
            case '1week':
                fromDate.setDate(today.getDate() - 7);
                break;
            case '3weeks':
                fromDate.setDate(today.getDate() - 21);
                break;
            case '3months':
                fromDate.setMonth(today.getMonth() - 3);
                break;
            case '6months':
                fromDate.setMonth(today.getMonth() - 6);
                break;
            case '1year':
                fromDate.setFullYear(today.getFullYear() - 1);
                break;
        }

        return {
            from: fromDate.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0]
        };
    }

    // Generate mock query results based on filters
    function generateMockQueryResults() {
        const results = [];
        const locations = queryData.locations.length > 0 ? queryData.locations : ['station-a', 'station-b', 'station-c'];
        const lines = queryData.lineNumbers.length > 0 ? queryData.lineNumbers : ['line-1', 'line-2', 'line-3', 'line-4', 'line-5', 'line-6', 'line-7', 'line-8'];
        const sensors = queryData.sensorCategories.length > 0 ? queryData.sensorCategories : ['companion-revenue', 'livestock-revenue'];

        // Generate 50 sample rows
        for (let i = 0; i < 50; i++) {
            const timestamp = new Date(new Date(queryData.toDate).getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            const location = locations[Math.floor(Math.random() * locations.length)];
            const line = lines[Math.floor(Math.random() * lines.length)];
            const sensor = sensors[Math.floor(Math.random() * sensors.length)];

            results.push({
                timestamp: timestamp.toISOString().replace('T', ' ').substring(0, 19),
                location: location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                line: line.replace('line-', 'Line '),
                sensor: sensor.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value: (Math.random() * 200 + 50).toFixed(2),
                unit: sensor.includes('temperature') ? '°F' : sensor.includes('pressure') ? 'PSI' : sensor.includes('flowrate') ? 'GPM' : sensor.includes('power') ? 'kW' : sensor.includes('speed') ? 'RPM' : 'Hz'
            });
        }

        // Sort by timestamp descending
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return results;
    }

    // Render query results table with sorting and filtering
    function renderQueryResultsTable(data) {
        if (!data || data.length === 0) {
            queryResultsTable.innerHTML = '<p class="text-secondary">No results found. Please adjust your query parameters.</p>';
            return;
        }

        queryResultsCard.classList.remove('hidden');
        queryResultsDescription.textContent = `Showing ${data.length} results from ${queryData.fromDate} to ${queryData.toDate}`;

        const headers = Object.keys(data[0]);
        let sortColumn = null;
        let sortAscending = true;
        let filteredData = [...data];

        const renderTable = () => {
            let tableHTML = `
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                ${headers.map(h => `
                                    <th class="cursor-pointer hover:bg-gray-700" data-column="${h}">
                                        ${h.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        <span class="sort-indicator">${sortColumn === h ? (sortAscending ? ' ↑' : ' ↓') : ''}</span>
                                    </th>
                                `).join('')}
                            </tr>
                            <tr>
                                ${headers.map(h => `
                                    <th>
                                        <input type="text" class="input text-xs filter-input" data-column="${h}" placeholder="Filter...">
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredData.map(row => `
                                <tr>
                                    ${headers.map(h => `<td>${row[h]}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            queryResultsTable.innerHTML = tableHTML;

            // Add sorting handlers
            queryResultsTable.querySelectorAll('th[data-column]').forEach(th => {
                th.addEventListener('click', () => {
                    const column = th.dataset.column;
                    if (sortColumn === column) {
                        sortAscending = !sortAscending;
                    } else {
                        sortColumn = column;
                        sortAscending = true;
                    }

                    filteredData.sort((a, b) => {
                        let aVal = a[column];
                        let bVal = b[column];

                        // Try to parse as number
                        const aNum = parseFloat(aVal);
                        const bNum = parseFloat(bVal);
                        if (!isNaN(aNum) && !isNaN(bNum)) {
                            return sortAscending ? aNum - bNum : bNum - aNum;
                        }

                        // String comparison
                        return sortAscending ?
                            String(aVal).localeCompare(String(bVal)) :
                            String(bVal).localeCompare(String(aVal));
                    });

                    renderTable();
                });
            });

            // Add filtering handlers
            queryResultsTable.querySelectorAll('.filter-input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const filterValues = {};
                    queryResultsTable.querySelectorAll('.filter-input').forEach(inp => {
                        if (inp.value.trim()) {
                            filterValues[inp.dataset.column] = inp.value.toLowerCase();
                        }
                    });

                    filteredData = data.filter(row => {
                        return Object.keys(filterValues).every(col => {
                            return String(row[col]).toLowerCase().includes(filterValues[col]);
                        });
                    });

                    renderTable();
                });
            });
        };

        renderTable();
    }

    // Check if query is valid and render results
    function checkAndRenderQuery() {
        if (queryData.dateRange && queryData.locations.length > 0 && queryData.lineNumbers.length > 0 &&
            queryData.sensorCategories.length > 0 && queryData.timeIncrement) {
            queryResults = generateMockQueryResults();
            renderQueryResultsTable(queryResults);
        }
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

            // Check if this is a multiselect
            const isMultiselect = trigger.id === 'sensorCategoriesTrigger' || trigger.id === 'locationTrigger' || trigger.id === 'lineNumberTrigger';

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

            if (isMultiselect) {
                // Handle multiselect for sensor categories, locations, and line numbers
                content.addEventListener('change', (e) => {
                    if (e.target.type === 'checkbox') {
                        const selectedItems = [];
                        const selectedLabels = [];
                        content.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                            const item = checkbox.closest('.select-item-multiselect');
                            selectedItems.push(item.dataset.value);
                            selectedLabels.push(checkbox.nextElementSibling.textContent);
                        });

                        // Update queryData based on which trigger this is
                        if (trigger.id === 'sensorCategoriesTrigger') {
                            queryData.sensorCategories = selectedItems;
                            valueSpan.textContent = selectedItems.length > 0 ?
                                selectedLabels.join(', ') :
                                'Select sensors...';
                        } else if (trigger.id === 'locationTrigger') {
                            queryData.locations = selectedItems;
                            valueSpan.textContent = selectedItems.length > 0 ?
                                selectedLabels.join(', ') :
                                'Select location...';
                        } else if (trigger.id === 'lineNumberTrigger') {
                            queryData.lineNumbers = selectedItems;
                            valueSpan.textContent = selectedItems.length > 0 ?
                                selectedLabels.join(', ') :
                                'Select line...';
                        }

                        checkAndRenderQuery();
                    }
                });
            } else {
                content.addEventListener('click', (e) => {
                    if (e.target.classList.contains('select-item')) {
                        const selectedValue = e.target.dataset.value;
                        const selectedText = e.target.textContent;

                        // Update UI
                        valueSpan.textContent = selectedText;
                        content.classList.add('hidden');

                        // Handle different dropdowns
                        if (trigger.id === 'dateRangePresetTrigger') {
                            queryData.dateRange = selectedValue;
                            const dates = calculateDateRange(selectedValue);
                            queryData.fromDate = dates.from;
                            queryData.toDate = dates.to;
                            fromDateDisplay.value = dates.from;
                            toDateDisplay.value = dates.to;
                        } else if (trigger.id === 'timeIncrementTrigger') {
                            queryData.timeIncrement = selectedValue;
                        } else if (trigger.id === 'goldenTableSelectorTrigger') {
                            selectedGoldenTable = mockGoldenTables[selectedValue];
                            updateGoldenTabContent();
                        }

                        // Check if we should render the query results
                        checkAndRenderQuery();

                        // Update selected class for styling
                        content.querySelectorAll('.select-item').forEach(item => {
                            item.classList.remove('selected');
                        });
                        e.target.classList.add('selected');
                    }
                });
            }

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!wrapper.contains(e.target)) {
                    if (!isMultiselect) {
                        content.classList.add('hidden');
                    }
                }
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

    // Bottom drawer functions
    let currentBottomDrawerData = null;

    function openBottomDrawer(title, content, exportData = null) {
        bottomDrawerTitle.textContent = title;
        bottomDrawerContent.innerHTML = content;
        currentBottomDrawerData = exportData;
        bottomDrawer.classList.add('open');
    }

    function closeBottomDrawer() {
        bottomDrawer.classList.remove('open');
        currentBottomDrawerData = null;
    }

    function exportTableToCSV() {
        if (!currentBottomDrawerData) return;

        // Extract table from content
        const table = bottomDrawerContent.querySelector('table');
        if (!table) return;

        let csv = [];
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const cols = row.querySelectorAll('td, th');
            const csvRow = [];

            cols.forEach(col => {
                // Get text content and clean it
                let text = col.textContent.trim();
                // Remove extra whitespace
                text = text.replace(/\s+/g, ' ');
                // Escape quotes and wrap in quotes if contains comma
                if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                csvRow.push(text);
            });

            csv.push(csvRow.join(','));
        });

        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        // Generate filename based on title
        const filename = `${currentBottomDrawerData.filename || 'analytics'}_${new Date().toISOString().split('T')[0]}.csv`;

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show feedback
        addChatMessage(`Analytics table exported as "${filename}"`, false);
    }

    bottomDrawerClose.addEventListener('click', closeBottomDrawer);
    bottomDrawerExport.addEventListener('click', exportTableToCSV);

    // Alert drawer functions
    let currentAlertRecommendation = null;

    function openAlertDrawer(recommendation, recIndex) {
        currentAlertRecommendation = { ...recommendation, index: recIndex };

        // Generate email content based on recommendation
        const emailContent = generateAlertEmailContent(recommendation, recIndex);

        alertSubject.value = emailContent.subject;
        alertBody.value = emailContent.body;
        alertRecipients.value = 'operations@company.com, maintenance@company.com';
        attachRawData.checked = false;
        attachAnalytics.checked = true; // Default to analytics attached

        alertDrawer.classList.add('open');
    }

    function closeAlertDrawer() {
        alertDrawer.classList.remove('open');
        currentAlertRecommendation = null;
    }

            function generateAlertEmailContent(rec, index) {
        const templates = [
            // Revenue Anomaly
            {
                subject: 'ALERT: Revenue Anomaly Detected - EU Parasiticides',
                body: `Dear Team,

Our AI monitoring system has detected an unusual revenue drop that requires immediate attention.

SUMMARY:
A significant drop in revenue was detected for Companion Animal Parasiticides in the EU region for August (28M vs 45M expected).

DETAILS:
• Portfolio: Companion Animal Parasiticides
• Region: EU
• Actual Revenue: $28M
• Expected Revenue: $45M
• Confidence Level: 95%

RECOMMENDED ACTION:
Review distributor inventory levels and investigate potential supply chain constraints or competitive product launches in the region.

Please review the attached analytics and take appropriate action.

Best regards,
Executive Intelligence System`
            },
            // Supply Chain Optimization
            {
                subject: 'Supply Chain Risk - NA Livestock Vaccines',
                body: `Dear Team,

Our analytics have identified a potential stockout risk for Livestock Vaccines in the NA region.

SUMMARY:
Inventory is projected to drop to 2 days on hand within 4 weeks due to delayed raw material shipments.

DETAILS:
• Portfolio: Livestock Vaccines
• Region: NA
• Current Inventory: 45 Days
• Projected Inventory (Week 4): 2 Days
• Target Minimum: 30 Days
• Confidence Level: 88%

RECOMMENDED ACTION:
Expedite shipments from secondary suppliers immediately to mitigate stockout risk.

Please review the attached inventory projection data.

Best regards,
Executive Intelligence System`
            },
            // Margin Improvement
            {
                subject: 'URGENT: Margin Improvement Opportunity - APAC Therapeutics',
                body: `Dear Team,

Our analytics system has identified a margin improvement opportunity regarding manufacturing yield.

SUMMARY:
Manufacturing yield for the Therapeutics line in APAC (Supplier B) has dropped to 82.4%, significantly below the 95% target.

DETAILS:
• Issue: Low Manufacturing Yield
• Current Supplier: Supplier B (API-14)
• Current Yield: 82.4%
• Target Yield: 95.0%
• Estimated Margin Impact: -$3.8M
• Confidence Level: 82%

RECOMMENDED ACTION:
Suggest returning to previous supplier (Supplier C) or expediting quality review with Supplier B.

Please review the attached yield analysis.

Best regards,
Executive Intelligence System`
            },
            // R&D Pipeline Forecast
            {
                subject: 'R&D Pipeline Update - Accelerated Timeline',
                body: `Dear Team,

Our predictive model has identified an opportunity to accelerate the regulatory submission for the new feline vaccine.

SUMMARY:
Phase 3 trials are trending towards early completion, potentially allowing regulatory submission to be pulled forward by 2 months.

DETAILS:
• Project: New Feline Vaccine (Phase 3)
• Original Submission Target: November (Q4)
• New Projected Target: September (Q3)
• Estimated Launch Impact: Pulled forward by 1 Quarter
• Confidence Level: 79%

RECOMMENDED ACTION:
Coordinate with regulatory affairs to prepare submission documentation early.

Please review the attached clinical trial projections.

Best regards,
Executive Intelligence System`
            }
        ];
        return templates[index];
    }

    alertDrawerClose.addEventListener('click', closeAlertDrawer);

    // Communication type toggle
    window.selectCommType = function(type) {
        const emailBtn = document.getElementById('comm-email');
        const chatBtn = document.getElementById('comm-chat');

        if (type === 'email') {
            emailBtn.classList.add('active');
            chatBtn.classList.remove('active');
            document.querySelector('label[for="alert-subject"]').textContent = 'Subject';
            alertRecipients.placeholder = 'Enter email addresses, separated by commas';
        } else {
            chatBtn.classList.add('active');
            emailBtn.classList.remove('active');
            document.querySelector('label[for="alert-subject"]').textContent = 'Title';
            alertRecipients.placeholder = 'Enter usernames or channel names, separated by commas';
        }
    };

    // Alert action buttons
    alertSubmitBtn.addEventListener('click', () => {
        const commType = document.getElementById('comm-email').classList.contains('active') ? 'email' : 'chat';
        const recipients = alertRecipients.value;
        const subject = alertSubject.value;
        const body = alertBody.value;
        const includeRaw = attachRawData.checked;
        const includeAnalytics = attachAnalytics.checked;

        if (!recipients || !subject || !body) {
            alert('Please fill in all required fields (Recipients, Subject, and Message).');
            return;
        }

        // Simulate sending
        const attachments = [];
        if (includeRaw) attachments.push('raw_data.csv');
        if (includeAnalytics) attachments.push('analytics_table.csv');

        closeAlertDrawer();

        const attachmentText = attachments.length > 0 ? ` with ${attachments.length} attachment(s)` : '';
        addChatMessage(`Alert sent via ${commType} to: ${recipients}${attachmentText}`, false);

        // Show success feedback in original button
        if (currentAlertRecommendation) {
            const btn = document.querySelector(`.create-alert-btn[data-rec-index="${currentAlertRecommendation.index}"]`);
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 4px;"><polyline points="20 6 9 17 4 12"/></svg>Sent!`;
                btn.disabled = true;
                btn.style.opacity = '0.7';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }, 3000);
            }
        }
    });

    alertDraftBtn.addEventListener('click', () => {
        const subject = alertSubject.value;
        const body = alertBody.value;
        const recipients = alertRecipients.value;

        if (!subject || !body) {
            alert('Please fill in at least the subject and message to save as draft.');
            return;
        }

        // Simulate saving to Outlook
        closeAlertDrawer();
        addChatMessage(`Draft saved to Outlook with subject: "${subject}". You can find it in your Outlook Drafts folder.`, false);
    });

    alertCancelBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            closeAlertDrawer();
        }
    });

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
            userMessageDiv.className = 'chatbot-message user';
            userMessageDiv.innerHTML = `<div class="chatbot-bubble">${message}</div>`;
            messagesContainer.appendChild(userMessageDiv);

            // Clear input
            input.value = '';

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Mock AI response
            setTimeout(() => {
                const aiResponseDiv = document.createElement('div');
                aiResponseDiv.className = 'chatbot-message ai';
                aiResponseDiv.innerHTML = `<div class="chatbot-bubble">This is a mock response to "${message}".</div>`;
                messagesContainer.appendChild(aiResponseDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 1000);
        }
    }

    // Store current recommendations globally
    let currentRecommendations = null;

    // LLM Analysis and Insights Generation for Animal Health
    function generateLLMRecommendations() {
        const llmRecommendations = [
            {
                category: "Revenue Anomaly Detection",
                suggestion: "Detected an unusual drop in Companion Animal Parasiticides revenue in the EU region for August. Recommend reviewing distributor inventory levels.",
                confidence: 0.95,
                source: "Time-series Anomaly Detection",
                graph: true
            },
            {
                category: "Supply Chain Optimization",
                suggestion: "Livestock Vaccines (NA region) showing potential stockout risk in 4 weeks due to delayed raw material shipments. Recommend expediting secondary suppliers.",
                confidence: 0.88,
                source: "Predictive Inventory Model",
                graph: true
            },
            {
                category: "Margin Improvement",
                suggestion: "Manufacturing yield for Therapeutics line in APAC correlates with recent raw material batch changes. Suggest returning to previous supplier.",
                confidence: 0.82,
                source: "Multi-variate Correlation Analysis",
                graph: true
            },
            {
                category: "R&D Pipeline Forecast",
                suggestion: "Phase 3 trial for new feline vaccine trending towards early completion. Regulatory submission could be pulled forward by 2 months.",
                confidence: 0.79,
                source: "Clinical Trial Predictive Model",
                graph: true
            }
        ];

        currentRecommendations = llmRecommendations;
        renderLLMRecommendations(llmRecommendations);

        // Show action buttons
        document.getElementById('insights-action-buttons').style.display = 'flex';
    }

    function renderLLMRecommendations(recommendations) {
        const container = document.getElementById('llm-recommendations-container');

        const analyticsButtonLabels = [
            'View Revenue Analytics',
            'View Supply Chain Projection',
            'View Margin Details',
            'View Pipeline Forecast'
        ];

        let html = '<div class="space-y-6">';

        recommendations.forEach((rec, index) => {
            html += `
                <div class="card collapsible-card">
                    <div class="card-header" style="cursor: pointer;">
                        <div class="flex justify-between items-start w-full">
                            <div class="flex-1">
                                <h3 class="card-title">${rec.category}</h3>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="badge outline">Confidence: ${(rec.confidence * 100).toFixed(0)}%</span>
                                    <span class="text-xs text-secondary">${rec.source}</span>
                                </div>
                            </div>
                            <button class="collapse-toggle" data-card-index="${index}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="card-content collapsible-content" data-content-index="${index}">
                        <p class="mb-4">${rec.suggestion}</p>
                        ${rec.graph ? `<div style="height: 250px;"><canvas id="chart-${index}"></canvas></div>` : ''}
                        <div class="mt-4 flex flex-wrap gap-2">
                            <button class="button primary create-alert-btn" data-rec-index="${index}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 4px;"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                                Create Alert
                            </button>
                            <button class="button outline dismiss-btn" data-rec-index="${index}" title="Recommendations always saved and accessible after determination">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 4px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                Dismiss
                            </button>
                            <button class="button outline uncertain-btn" data-rec-index="${index}" title="Recommendations always saved and accessible after determination">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                Mark Uncertain
                            </button>
                            <button class="button outline view-analytics-btn" data-rec-index="${index}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 4px;"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                                ${analyticsButtonLabels[index]}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Render charts after DOM update
        setTimeout(() => {
            renderAnalysisCharts(recommendations);
            setupAnalyticsButtons(recommendations);
            setupActionButtons(recommendations);
            setupCollapseToggle();
        }, 100);
    }

    function setupCollapseToggle() {
        const toggleButtons = document.querySelectorAll('.collapse-toggle');

        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cardIndex = btn.dataset.cardIndex;
                const content = document.querySelector(`.collapsible-content[data-content-index="${cardIndex}"]`);
                const chevron = btn.querySelector('.chevron-icon');

                if (content.classList.contains('collapsed')) {
                    content.classList.remove('collapsed');
                    chevron.style.transform = 'rotate(0deg)';
                } else {
                    content.classList.add('collapsed');
                    chevron.style.transform = 'rotate(-90deg)';
                }
            });
        });
    }

    function renderAnalysisCharts(recommendations) {
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { color: '#8B949E' }, grid: { color: '#30363D' } },
                x: { ticks: { color: '#8B949E' }, grid: { color: '#30363D' } }
            }
        };

        const chartColors = {
            primary: '#58A6FF',
            primaryTransparent: 'rgba(88, 166, 255, 0.5)',
            danger: '#F85149',
            dangerTransparent: 'rgba(248, 81, 73, 0.1)',
            success: '#3FB950',
            warning: '#D29922'
        };

        recommendations.forEach((rec, index) => {
            if (rec.graph) {
                const canvas = document.getElementById(`chart-${index}`);
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                let chartConfig;

                switch (index) {
                    case 0: // Outlier Detection
                        chartConfig = {
                            type: 'line',
                            data: {
                                labels: ['Jul 17', 'Jul 18', 'Jul 19', 'Jul 20', 'Jul 21', 'Jul 22', 'Jul 23', 'Jul 24'],
                                datasets: [{
                                    label: 'Revenue ($M)',
                                    data: [125, 128, 130, 127, 132, 135, 185, 133],
                                    borderColor: chartColors.primary,
                                    backgroundColor: chartColors.primaryTransparent,
                                    tension: 0.4,
                                    fill: false
                                }, {
                                    label: 'Anomaly',
                                    data: [null, null, null, null, null, null, 185, null],
                                    borderColor: chartColors.danger,
                                    backgroundColor: chartColors.danger,
                                    pointRadius: 8,
                                    pointHoverRadius: 10,
                                    showLine: false
                                }]
                            },
                            options: {
                                ...chartOptions,
                                plugins: {
                                    legend: {
                                        display: true,
                                        labels: { color: '#8B949E' }
                                    }
                                }
                            }
                        };
                        break;
                    case 1: // Efficiency Opportunity
                        chartConfig = {
                            type: 'bar',
                            data: {
                                labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
                                datasets: [{
                                    label: 'Efficiency %',
                                    data: [85, 88, 72, 90, 87],
                                    backgroundColor: chartColors.primaryTransparent,
                                    borderColor: chartColors.primary,
                                    borderWidth: 1
                                }]
                            },
                            options: chartOptions
                        };
                        break;
                    case 2: // Predictive Maintenance
                        chartConfig = {
                            type: 'doughnut',
                            data: {
                                labels: ['Needs Maintenance Soon', 'Moderate Risk', 'Good Condition'],
                                datasets: [{
                                    data: [2, 5, 18],
                                    backgroundColor: [chartColors.danger, chartColors.warning, chartColors.success]
                                }]
                            },
                            options: {
                                ...chartOptions,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                        labels: { color: '#8B949E' }
                                    }
                                }
                            }
                        };
                        break;
                    case 3: // Load Balancing
                        chartConfig = {
                            type: 'line',
                            data: {
                                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                                datasets: [
                                    {
                                        label: 'Current Load',
                                        data: [100, 95, 140, 180, 160, 120, 105],
                                        borderColor: chartColors.danger,
                                        backgroundColor: chartColors.dangerTransparent,
                                        fill: true,
                                        tension: 0.3
                                    },
                                    {
                                        label: 'Optimized Load',
                                        data: [100, 95, 125, 165, 145, 120, 105],
                                        borderColor: chartColors.success,
                                        backgroundColor: 'rgba(63, 185, 80, 0.1)',
                                        fill: true,
                                        tension: 0.3
                                    }
                                ]
                            },
                            options: {
                                ...chartOptions,
                                plugins: {
                                    legend: {
                                        display: true,
                                        labels: { color: '#8B949E' }
                                    }
                                }
                            }
                        };
                        break;
                }

                new Chart(ctx, chartConfig);
            }
        });
    }

    function setupAnalyticsButtons(recommendations) {
        const buttons = document.querySelectorAll('.view-analytics-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const recIndex = parseInt(btn.dataset.recIndex);
                const rec = recommendations[recIndex];
                const tableContent = generateAnalyticsTable(recIndex, rec);

                // Create export data with filename
                const filenameMap = [
                    'outlier_detection_analytics',
                    'efficiency_comparison',
                    'maintenance_schedule',
                    'load_distribution'
                ];

                const exportData = {
                    filename: filenameMap[recIndex],
                    category: rec.category
                };

                openBottomDrawer(`${rec.category} - Detailed Analytics`, tableContent, exportData);
            });
        });
    }

    function setupActionButtons(recommendations) {
        // Create Alert buttons
        document.querySelectorAll('.create-alert-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const recIndex = parseInt(btn.dataset.recIndex);
                const rec = recommendations[recIndex];

                // Open alert drawer with pre-populated content
                openAlertDrawer(rec, recIndex);
            });
        });

        // Dismiss buttons
        document.querySelectorAll('.dismiss-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const recIndex = parseInt(btn.dataset.recIndex);
                const rec = recommendations[recIndex];

                if (confirm(`Are you sure you want to dismiss this recommendation?\n\n"${rec.category}"\n\nThis recommendation will be hidden from your view.`)) {
                    // Find and remove the card
                    const card = btn.closest('.card');
                    card.style.transition = 'opacity 0.3s, transform 0.3s';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';

                    setTimeout(() => {
                        card.remove();
                        addChatMessage(`Recommendation "${rec.category}" has been dismissed.`, false);
                    }, 300);
                }
            });
        });

        // Mark Uncertain buttons
        document.querySelectorAll('.uncertain-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const recIndex = parseInt(btn.dataset.recIndex);
                const rec = recommendations[recIndex];

                // Visual feedback
                const originalText = btn.innerHTML;
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 4px;"><polyline points="20 6 9 17 4 12"/></svg>Saved`;
                btn.disabled = true;
                btn.style.opacity = '0.7';

                // Add to chat
                addChatMessage(`Recommendation "${rec.category}" has been marked as uncertain and saved for later review. You can revisit this in your pending actions.`, false);

                // Reset after 2 seconds
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }, 2000);
            });
        });
    }

    function generateAnalyticsTable(index, recommendation) {
        let tableHTML = '';

        switch (index) {
            case 0: // Revenue Anomaly
                tableHTML = `
                    <div class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Region</th>
                                    <th>Portfolio</th>
                                    <th>Actual ($M)</th>
                                    <th>Expected ($M)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>June</td>
                                    <td>EU</td>
                                    <td>Parasiticides</td>
                                    <td>47</td>
                                    <td>46.5</td>
                                    <td><span class="badge outline" style="color: var(--success);">Normal</span></td>
                                </tr>
                                <tr>
                                    <td>July</td>
                                    <td>EU</td>
                                    <td>Parasiticides</td>
                                    <td>52</td>
                                    <td>51</td>
                                    <td><span class="badge outline" style="color: var(--success);">Normal</span></td>
                                </tr>
                                <tr style="background-color: rgba(248, 81, 73, 0.1);">
                                    <td>August</td>
                                    <td>EU</td>
                                    <td>Parasiticides</td>
                                    <td>28</td>
                                    <td>45</td>
                                    <td><span class="badge outline" style="color: var(--danger);">ANOMALY</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
                break;

            case 1: // Supply Chain Optimization
                tableHTML = `
                    <div class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
                                    <th>Week</th>
                                    <th>Region</th>
                                    <th>Product Line</th>
                                    <th>Projected Inventory</th>
                                    <th>Target Min</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Week 1</td>
                                    <td>NA</td>
                                    <td>Livestock Vaccines</td>
                                    <td>45 Days</td>
                                    <td>30 Days</td>
                                    <td><span class="badge outline" style="color: var(--success);">Healthy</span></td>
                                </tr>
                                <tr>
                                    <td>Week 2</td>
                                    <td>NA</td>
                                    <td>Livestock Vaccines</td>
                                    <td>30 Days</td>
                                    <td>30 Days</td>
                                    <td><span class="badge outline" style="color: var(--warning);">At Risk</span></td>
                                </tr>
                                <tr style="background-color: rgba(210, 153, 34, 0.1);">
                                    <td>Week 3</td>
                                    <td>NA</td>
                                    <td>Livestock Vaccines</td>
                                    <td>15 Days</td>
                                    <td>30 Days</td>
                                    <td><span class="badge outline" style="color: var(--warning);">Critical</span></td>
                                </tr>
                                <tr style="background-color: rgba(248, 81, 73, 0.1);">
                                    <td>Week 4</td>
                                    <td>NA</td>
                                    <td>Livestock Vaccines</td>
                                    <td>2 Days</td>
                                    <td>30 Days</td>
                                    <td><span class="badge outline" style="color: var(--danger);">Stockout Imminent</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
                break;

            case 2: // Margin Improvement
                tableHTML = `
                    <div class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
                                    <th>Supplier</th>
                                    <th>Component</th>
                                    <th>Avg Yield (%)</th>
                                    <th>Target Yield (%)</th>
                                    <th>Impact on Margin</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Supplier A</td>
                                    <td>API-12</td>
                                    <td>96.5%</td>
                                    <td>95.0%</td>
                                    <td>+$1.2M</td>
                                    <td><span class="badge outline" style="color: var(--success);">Above Target</span></td>
                                </tr>
                                <tr style="background-color: rgba(248, 81, 73, 0.1);">
                                    <td>Supplier B (Current)</td>
                                    <td>API-14</td>
                                    <td>82.4%</td>
                                    <td>95.0%</td>
                                    <td>-$3.8M</td>
                                    <td><span class="badge outline" style="color: var(--danger);">Action Needed</span></td>
                                </tr>
                                <tr style="background-color: rgba(210, 153, 34, 0.1);">
                                    <td>Supplier C (Backup)</td>
                                    <td>API-14</td>
                                    <td>91.2%</td>
                                    <td>95.0%</td>
                                    <td>-$0.5M</td>
                                    <td><span class="badge outline" style="color: var(--warning);">Monitor</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
                break;

            case 3: // R&D Pipeline Forecast
                tableHTML = `
                    <div class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
                                    <th>Trial Phase</th>
                                    <th>Original Timeline</th>
                                    <th>Accelerated Timeline</th>
                                    <th>Time Saved</th>
                                    <th>Regulatory Submission</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Phase 1</td>
                                    <td>Complete</td>
                                    <td>Complete</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td>Phase 2</td>
                                    <td>Complete</td>
                                    <td>Complete</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                                <tr style="background-color: rgba(63, 185, 80, 0.1);">
                                    <td>Phase 3</td>
                                    <td>Q4 (Nov)</td>
                                    <td>Q3 (Sep)</td>
                                    <td>2 Months</td>
                                    <td>Pulled forward to Oct</td>
                                </tr>
                                <tr style="font-weight: bold; background-color: var(--background);">
                                    <td>Est. Commercial Launch</td>
                                    <td>Q2 Next Year</td>
                                    <td>Q1 Next Year</td>
                                    <td>1 Quarter</td>
                                    <td>-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
                break;
        }

        return tableHTML;
    }


    // Chat Interface Functions
    function addChatMessage(message, isUser = false, includeButtons = false, queryDetails = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'assistant'}`;

        let bubbleContent = `<div class="chat-bubble">${message}`;

        if (queryDetails) {
            bubbleContent += `
                <div class="query-details">
                    <div class="query-details-item"><strong>Date Range:</strong> <span>${queryDetails.dateRangeText}</span></div>
                    <div class="query-details-item"><strong>Locations:</strong> <span>${queryDetails.locationsText}</span></div>
                    <div class="query-details-item"><strong>Lines:</strong> <span>${queryDetails.linesText}</span></div>
                    <div class="query-details-item"><strong>Sensors:</strong> <span>${queryDetails.sensorsText}</span></div>
                    <div class="query-details-item"><strong>Time Increment:</strong> <span>${queryDetails.timeIncrementText}</span></div>
                </div>
            `;
        }

        if (includeButtons) {
            bubbleContent += `
                <div class="confirmation-buttons">
                    <button class="button primary confirm-query-btn">Confirm & Show</button>
                    <button class="button primary confirm-analyze-btn">Confirm & Analyze</button>
                    <button class="button outline cancel-query-btn">Cancel</button>
                </div>
            `;
        }

        bubbleContent += '</div>';
        messageDiv.innerHTML = bubbleContent;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return messageDiv;
    }

    function parseUserRequest(request) {
        const requestLower = request.toLowerCase();

        // Initialize default values
        let dateRange = '1week';
        let locations = [];
        let lines = [];
        let sensors = [];
        let timeIncrement = 'raw';

        // Parse date range
        if (requestLower.includes('last week') || requestLower.includes('past week')) {
            dateRange = '1week';
        } else if (requestLower.includes('3 weeks') || requestLower.includes('three weeks')) {
            dateRange = '3weeks';
        } else if (requestLower.includes('3 months') || requestLower.includes('three months')) {
            dateRange = '3months';
        } else if (requestLower.includes('6 months') || requestLower.includes('six months')) {
            dateRange = '6months';
        } else if (requestLower.includes('year') || requestLower.includes('12 months')) {
            dateRange = '1year';
        }

        // Parse locations
        if (requestLower.includes('all locations')) {
            locations = ['station-a', 'station-b', 'station-c', 'station-d', 'facility-1', 'facility-2', 'plant-north', 'plant-south'];
        } else {
            if (requestLower.includes('station a')) locations.push('station-a');
            if (requestLower.includes('station b')) locations.push('station-b');
            if (requestLower.includes('station c')) locations.push('station-c');
            if (requestLower.includes('station d')) locations.push('station-d');
            if (requestLower.includes('facility 1')) locations.push('facility-1');
            if (requestLower.includes('facility 2')) locations.push('facility-2');
            if (requestLower.includes('plant north')) locations.push('plant-north');
            if (requestLower.includes('plant south')) locations.push('plant-south');
        }

        // Parse lines
        if (requestLower.includes('all lines')) {
            lines = ['line-1', 'line-2', 'line-3', 'line-4', 'line-5', 'line-6', 'line-7', 'line-8'];
        } else {
            for (let i = 1; i <= 8; i++) {
                if (requestLower.includes(`line ${i}`)) lines.push(`line-${i}`);
            }
        }

        // Parse sensors
        if (requestLower.includes('all sensors') || requestLower.includes('all data')) {
            sensors = ['companion-revenue', 'livestock-revenue', 'margin-percentage', 'inventory-days', 'power-consumption', 'yield-percentage'];
        } else {
            if (requestLower.includes('flowrate')) sensors.push('companion-revenue');
            if (requestLower.includes('temperature')) sensors.push('livestock-revenue');
            if (requestLower.includes('pressure')) sensors.push('margin-percentage');
            if (requestLower.includes('vibration')) sensors.push('inventory-days');
            if (requestLower.includes('power')) sensors.push('power-consumption');
            if (requestLower.includes('speed')) sensors.push('yield-percentage');
        }

        // If no specific sensors mentioned but "all portfolios" is mentioned, get all sensors
        if (sensors.length === 0 && (requestLower.includes('all portfolios') || requestLower.includes('all'))) {
            sensors = ['companion-revenue', 'livestock-revenue', 'margin-percentage', 'inventory-days', 'power-consumption', 'yield-percentage'];
        }

        return { dateRange, locations, lines, sensors, timeIncrement };
    }

    function formatQueryDetails(parsedQuery) {
        const dates = calculateDateRange(parsedQuery.dateRange);

        const dateRangeMap = {
            '1week': 'Last Week',
            '3weeks': 'Last 3 Weeks',
            '3months': 'Last 3 Months',
            '6months': 'Last 6 Months',
            '1year': 'Last Year'
        };

        const locationMap = {
            'station-a': 'Station A', 'station-b': 'Station B', 'station-c': 'Station C', 'station-d': 'Station D',
            'facility-1': 'Facility 1', 'facility-2': 'Facility 2', 'plant-north': 'Plant North', 'plant-south': 'Plant South'
        };

        const sensorMap = {
            'companion-revenue': 'Companion Revenue', 'livestock-revenue': 'Livestock Revenue', 'margin-percentage': 'Margin Percentage',
            'inventory-days': 'Inventory Days', 'margin': 'Margin', 'yield-percentage': 'Yield Percentage'
        };

        return {
            dateRangeText: `${dateRangeMap[parsedQuery.dateRange]} (${dates.from} to ${dates.to})`,
            locationsText: parsedQuery.locations.map(l => locationMap[l]).join(', '),
            linesText: parsedQuery.lines.map(l => l.replace('line-', 'Line ')).join(', '),
            sensorsText: parsedQuery.sensors.map(s => sensorMap[s]).join(', '),
            timeIncrementText: 'Raw Data',
            fromDate: dates.from,
            toDate: dates.to
        };
    }


    function handleUserMessage(message) {
        // Phase 5: Abstain state for unclear queries
        const requestLower = message.toLowerCase();
        if (requestLower.includes('how many employees') || requestLower.includes('meaning of life') || requestLower.includes('stock price')) {
            addChatMessage(message, true);
            setTimeout(() => {
                const abstainHtml = `
                    <div class="mt-2 p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-slate-300">
                        <div class="font-semibold text-red-400 mb-1 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            Cannot Safely Answer
                        </div>
                        <div>I am configured to provide insights on Animal Health Commercial and Operational data. I cannot verify or synthesize information outside of these domains.</div>
                    </div>
                `;
                addChatMessage(abstainHtml, false, true);
            }, 800);
            return;
        }

        // Add user message to chat
        addChatMessage(message, true);


        // Parse the request
        const parsedQuery = parseUserRequest(message);
        const queryDetails = formatQueryDetails(parsedQuery);

        // Add assistant response with confirmation
        setTimeout(() => {


            // Add Interpretation Chip
            const interpretationHtml = `
                <div class="mt-2 p-3 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300">
                    <div class="font-semibold text-violet-400 mb-1 flex justify-between items-center cursor-pointer group" onclick="document.getElementById('reasoning-drawer').classList.remove('translate-x-full')">
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Interpreting your request
                        </div>
                        <div class="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">View reasoning trace &rarr;</div>
                    </div>
                    <div>Looking at <span class="bg-slate-700 px-1 rounded cursor-pointer hover:bg-slate-600">${queryDetails.dateRangeText}</span> for <span class="bg-slate-700 px-1 rounded cursor-pointer hover:bg-slate-600">${queryDetails.linesText}</span> in <span class="bg-slate-700 px-1 rounded cursor-pointer hover:bg-slate-600">${queryDetails.locationsText}</span>.</div>

                    <details class="mt-2 text-xs text-slate-500 border-t border-slate-700 pt-2">
                        <summary class="cursor-pointer hover:text-slate-300">Show generated query parameters</summary>
                        <pre class="mt-2 p-2 bg-slate-900 rounded border border-slate-800 overflow-x-auto">
{
  "intent": "fetch_metrics",
  "timeframe": "${queryDetails.dateRangeText}",
  "portfolios": "${queryDetails.linesText}",
  "regions": "${queryDetails.locationsText}",
  "confidence_threshold": 0.85
}</pre>
                    </details>
                </div>
            `;
            const assistantMsg = addChatMessage("I understand you'd like to retrieve the following data:", false, true, queryDetails);


            const btnContainer = assistantMsg.querySelector('.mt-3.flex.gap-2');
            if (btnContainer) {
                btnContainer.insertAdjacentHTML('beforebegin', interpretationHtml);

                // Add Pin Button
                const confirmBtn = assistantMsg.querySelector('.confirm-query-btn');
                if (confirmBtn) {
                    confirmBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1"><path d="M12 20v-6M6 20V10M18 20V4"/></svg> Confirm & View Data';

                    const pinBtn = document.createElement('button');
                    pinBtn.className = 'button outline text-xs py-1 px-2 cancel-query-btn ml-2';
                    pinBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Pin to board';
                    btnContainer.appendChild(pinBtn);

                    pinBtn.addEventListener('click', () => {
                        addChatMessage("Pinned to your Executive Board. It will be available in the Today tab.", false);
                        pinBtn.classList.add('bg-green-600', 'text-white', 'border-green-600');
                        pinBtn.innerHTML = 'Pinned!';
                        setTimeout(() => pinBtn.parentElement.remove(), 1000);
                    });
                }
            }


            // Add event listeners to confirmation buttons
            const confirmBtn = assistantMsg.querySelector('.confirm-query-btn');
            const confirmAnalyzeBtn = assistantMsg.querySelector('.confirm-analyze-btn');
            const cancelBtn = assistantMsg.querySelector('.cancel-query-btn');

            confirmBtn.addEventListener('click', () => {
                // Update queryData
                queryData.dateRange = parsedQuery.dateRange;
                queryData.fromDate = queryDetails.fromDate;
                queryData.toDate = queryDetails.toDate;
                queryData.locations = parsedQuery.locations;
                queryData.lineNumbers = parsedQuery.lines;
                queryData.sensorCategories = parsedQuery.sensors;
                queryData.timeIncrement = parsedQuery.timeIncrement;

                // Remove buttons
                confirmBtn.parentElement.remove();

                // Generate and show results
                queryResults = generateMockQueryResults();
                renderQueryResultsTable(queryResults);

                // Add confirmation message
                addChatMessage("Perfect! I've retrieved the data and displayed it in the table below.", false);
            });

            confirmAnalyzeBtn.addEventListener('click', () => {
                // Update queryData
                queryData.dateRange = parsedQuery.dateRange;
                queryData.fromDate = queryDetails.fromDate;
                queryData.toDate = queryDetails.toDate;
                queryData.locations = parsedQuery.locations;
                queryData.lineNumbers = parsedQuery.lines;
                queryData.sensorCategories = parsedQuery.sensors;
                queryData.timeIncrement = parsedQuery.timeIncrement;

                // Remove buttons
                confirmAnalyzeBtn.parentElement.remove();

                // Generate and show results
                queryResults = generateMockQueryResults();
                renderQueryResultsTable(queryResults);

                // Add confirmation message with analysis
                addChatMessage("Perfect! I've retrieved the data and displayed it in the table below. Now analyzing the data for insights...", false);

                // Generate LLM recommendations and switch to Data Insights tab
                setTimeout(() => {
                    generateLLMRecommendations();

                    const dataTabTrigger = document.querySelector('.tabs-trigger[data-tab="data"]');
                    if (dataTabTrigger) {
                        dataTabTrigger.click();
                    }

                    addChatMessage("Analysis complete! I've identified 4 key insights with actionable recommendations. Check the Data Insights tab for detailed analysis and visualizations.", false);
                }, 1000);
            });

            cancelBtn.addEventListener('click', () => {
                // Remove the entire assistant message
                assistantMsg.remove();
                addChatMessage("Request cancelled. Feel free to make another request.", false);
            });
        }, 500);
    }

    // Initialize the application
    function initializeApp() {

    // Phase 2: Agent Workspace Sliders Logic
    const slider1 = document.querySelector('input[type="range"][max="150"]');
    const slider2 = document.querySelector('input[type="range"][max="45"]');
    if (slider1 && slider2) {
        const updateGraph = () => {
            const cost = parseInt(slider1.value);
            const buffer = parseInt(slider2.value);

            document.getElementById('slider-val-1').textContent = `$${cost}k`;
            document.getElementById('slider-val-2').textContent = `${buffer} Days`;

            // Recompute proposed trajectory (mock logic based on sliders)
            // Buffer drives the end height, cost drives how fast we get there
            const endY = 100 - buffer; // Invert for SVG (0 is top)
            const midY = 100 - (buffer * (cost/150 + 0.5)); // Faster rise with more cost

            const path = document.querySelector('path[stroke="#8b5cf6"]');
            if (path) {
                path.setAttribute('d', `M0,40 L20,50 L40,${midY} L60,${endY+10} L80,${endY+5} L100,${endY}`);
            }
        };

        slider1.addEventListener('input', updateGraph);
        slider2.addEventListener('input', updateGraph);
    }

    // Phase 6: Presenter Affordances
    document.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
            const switcher = document.getElementById('scenario-switcher');
            if (switcher) {
                switcher.classList.toggle('hidden');
            }
        }
        if (e.key === 'r' || e.key === 'R') {
            window.location.reload();
        }
    });

        lucide.createIcons();

        // Add welcome message
        setTimeout(() => {
            addChatMessage("Hello! I'm your executive AI assistant. You can ask me to retrieve sensor data using the quick request buttons above, or type your own request.", false);
        }, 300);

        // Setup chat input handlers
        chatSendBtn.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                handleUserMessage(message);
                chatInput.value = '';
            }
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const message = chatInput.value.trim();
                if (message) {
                    handleUserMessage(message);
                    chatInput.value = '';
                }
            }
        });

        // Setup suggestion buttons
        suggestionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const request = btn.dataset.request;
                handleUserMessage(request);
            });
        });
    }

    function renderForecastChart() {
        const ctx = document.getElementById('forecast-chart')?.getContext('2d');
        if (!ctx) return;

        const chartColors = {
            primary: '#58A6FF',
            primaryTransparent: 'rgba(88, 166, 255, 0.3)'
        };

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['+1d', '+2d', '+3d', '+4d', '+5d', '+6d', '+7d'],
                datasets: [
                    {
                        label: 'Forecast',
                        data: [125, 128, 130, 127, 132, 135, 133],
                        borderColor: chartColors.primary,
                        tension: 0.4,
                    },
                    {
                        label: 'Upper Bound',
                        data: [130, 133, 135, 132, 137, 140, 138],
                        borderColor: chartColors.primaryTransparent,
                        fill: '+1',
                    },
                    {
                        label: 'Lower Bound',
                        data: [120, 123, 125, 122, 127, 130, 128],
                        borderColor: chartColors.primaryTransparent,
                        fill: false,
                    },
                ]
            },
            options: { responsive: true, plugins: { legend: { display: true, labels: { color: '#8B949E' } } }, scales: { y: { title: { display: true, text: 'Projected Margin (%)', color: '#8B949E' }, ticks:{ color: '#8B949E' }, grid: { color: '#30363D' } }, x: { ticks:{ color: '#8B949E' }, grid: { color: '#30363D' } } } }
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
            <table class="table">
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${h.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${mockData.map(row => `
                        <tr>
                            ${headers.map(h => `<td>${row[h]}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Report Generation Functions
    async function generateReport() {
        if (!currentRecommendations) return;

        // Generate both text and HTML reports
        await generateTextReport();
        await generateHTMLReport();
    }

    function generateTextReport() {
        if (!currentRecommendations) return;

        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let reportContent = `ANIMAL HEALTH EXECUTIVE VITAL SIGNS REPORT
Generated: ${today}

EXECUTIVE SUMMARY
================================================================================
This report presents AI-powered analysis of business vital signs data,
identifying ${currentRecommendations.length} key insights and recommendations for operational
improvement and risk mitigation.

Query Parameters:
- Date Range: ${queryData.fromDate} to ${queryData.toDate}
- Regions: ${queryData.locations.join(', ')}
- Portfolios: ${queryData.lineNumbers.join(', ')}
- Metrics: ${queryData.sensorCategories.join(', ')}

DETAILED FINDINGS
================================================================================

`;

        currentRecommendations.forEach((rec, index) => {
            reportContent += `
${index + 1}. ${rec.category.toUpperCase()}
${'-'.repeat(80)}
Confidence Level: ${(rec.confidence * 100).toFixed(0)}%
Analysis Source: ${rec.source}

Finding:
${rec.suggestion}

`;

            // Add specific details based on recommendation type
            switch(index) {
                case 0: // Revenue Anomaly Detection
                    reportContent += `Key Metrics:
- Portfolio: Companion Animal Parasiticides
- Region: EU
- Actual Revenue: $28M
- Expected Revenue: $45M
- Deviation: -37.8%

Recommended Action:
Review distributor inventory levels and competitive activity.
Timeline: Immediate

`;
                    break;
                case 1: // Supply Chain Optimization
                    reportContent += `Key Metrics:
- Portfolio: Livestock Vaccines
- Region: NA
- Current Inventory: 45 Days
- Projected (Week 4): 2 Days
- Target Minimum: 30 Days

Recommended Action:
Expedite secondary suppliers to avoid stockouts.
Timeline: Next 5 days

`;
                    break;
                case 2: // Margin Improvement
                    reportContent += `Key Metrics:
- Issue: Low Manufacturing Yield
- Current Supplier: Supplier B (API-14)
- Current Yield: 82.4%
- Target Yield: 95.0%

Recommended Action:
Return to previous supplier (Supplier C).
Timeline: Next production batch

`;
                    break;
                case 3: // R&D Pipeline Forecast
                    reportContent += `Key Metrics:
- Project: New Feline Vaccine
- Trial Phase: Phase 3
- Original Target: Q4
- New Projected Target: Q3
- Launch Impact: +1 Quarter

Recommended Action:
Prepare regulatory submission early.
Timeline: Coordinate next 30 days

`;
                    break;
            }
        });

        reportContent += `
RECOMMENDATIONS SUMMARY
================================================================================
${currentRecommendations.map((rec, i) => `${i + 1}. ${rec.category} (${(rec.confidence * 100).toFixed(0)}% confidence)`).join('\n')}

NEXT STEPS
================================================================================
1. Review all high-confidence recommendations (>80%)
2. Prioritize urgent items (Revenue Anomaly, Supply Chain Risk)
3. Coordinate with Commercial and Operations leaders
4. Adjust Q3 and Q4 forecast models
5. Monitor results and adjust as needed

END OF REPORT
================================================================================
Generated by Executive Intelligence System - AI-Powered Analytics
Report Date: ${today}
`;

        // Download report
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const filename = `Animal_Health_Report_${new Date().toISOString().split('T')[0]}.txt`;

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addChatMessage(`Text report downloaded as "${filename}"`, false);
    }

    async function generateHTMLReport() {
        if (!currentRecommendations) return;

        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Capture chart images
        const chartImages = [];
        for (let i = 0; i < currentRecommendations.length; i++) {
            const canvas = document.getElementById(`chart-${i}`);
            if (canvas) {
                chartImages.push(canvas.toDataURL('image/png'));
            } else {
                chartImages.push(null);
            }
        }

        let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animal Health Executive Vital Signs Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2em;
        }
        .header .date {
            opacity: 0.9;
            font-size: 0.9em;
        }
        .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-top: 0;
        }
        .section h3 {
            color: #764ba2;
            margin-top: 20px;
        }
        .params {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .params-item {
            margin: 8px 0;
        }
        .params-label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            min-width: 120px;
        }
        .recommendation {
            background: white;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .recommendation h3 {
            margin-top: 0;
            color: #667eea;
        }
        .confidence-badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            margin-right: 10px;
        }
        .source-badge {
            display: inline-block;
            background: #e9ecef;
            color: #495057;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85em;
        }
        .chart-container {
            margin: 20px 0;
            text-align: center;
        }
        .chart-container img {
            max-width: 100%;
            height: auto;
            border: 1px solid #dee2e6;
            border-radius: 5px;
        }
        .metrics {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .metrics ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .action-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
        }
        .action-box strong {
            color: #856404;
        }
        .summary-list {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .summary-list ol {
            margin: 10px 0;
            padding-left: 25px;
        }
        .next-steps {
            background: #d1ecf1;
            border-left: 4px solid #17a2b8;
            padding: 20px;
            border-radius: 5px;
        }
        .next-steps ol {
            margin: 10px 0;
            padding-left: 25px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 0.9em;
            border-top: 2px solid #dee2e6;
            margin-top: 30px;
        }
        @media print {
            body {
                background-color: white;
            }
            .section {
                box-shadow: none;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Animal Health Executive Vital Signs Report</h1>
        <div class="date">Generated: ${today}</div>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <p>This report presents AI-powered analysis of executive commercial and operations data, identifying ${currentRecommendations.length} key insights and recommendations for operational improvement and risk mitigation.</p>

        <div class="params">
            <div class="params-item">
                <span class="params-label">Date Range:</span>
                <span>${queryData.fromDate} to ${queryData.toDate}</span>
            </div>
            <div class="params-item">
                <span class="params-label">Locations:</span>
                <span>${queryData.locations.map(l => l.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}</span>
            </div>
            <div class="params-item">
                <span class="params-label">Lines:</span>
                <span>${queryData.lineNumbers.map(l => l.replace('line-', 'Line ')).join(', ')}</span>
            </div>
            <div class="params-item">
                <span class="params-label">Sensors:</span>
                <span>${queryData.sensorCategories.map(s => s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Detailed Findings</h2>
`;

        currentRecommendations.forEach((rec, index) => {
            const detailsMap = [
                {
                    portfolio: 'Companion Animal Parasiticides',
                    region: 'EU',
                    actual: '$28M',
                    expected: '$45M',
                    deviation: '-37.8%',
                    action: 'Review distributor inventory levels and competitive activity.',
                    timeline: 'Immediate'
                },
                {
                    portfolio: 'Livestock Vaccines',
                    region: 'NA',
                    projectedInventory: '2 Days (Week 4)',
                    targetMinimum: '30 Days',
                    action: 'Expedite secondary suppliers to avoid stockouts.',
                    timeline: 'Next 5 days'
                },
                {
                    issue: 'Low Manufacturing Yield',
                    supplier: 'Supplier B (API-14)',
                    currentYield: '82.4%',
                    targetYield: '95.0%',
                    action: 'Return to previous supplier (Supplier C).',
                    timeline: 'Next production batch'
                },
                {
                    project: 'New Feline Vaccine',
                    trialPhase: 'Phase 3',
                    originalTarget: 'Q4',
                    newProjectedTarget: 'Q3',
                    action: 'Prepare regulatory submission early.',
                    timeline: 'Coordinate next 30 days'
                }
            ];

            htmlContent += `
        <div class="recommendation">
            <h3>${index + 1}. ${rec.category}</h3>
            <div style="margin: 10px 0;">
                <span class="confidence-badge">Confidence: ${(rec.confidence * 100).toFixed(0)}%</span>
                <span class="source-badge">${rec.source}</span>
            </div>
            <p><strong>Finding:</strong> ${rec.suggestion}</p>

            ${chartImages[index] ? `
            <div class="chart-container">
                <img src="${chartImages[index]}" alt="${rec.category} Chart">
            </div>
            ` : ''}

            <div class="metrics">
                <strong>Key Metrics:</strong>
                <ul>
`;

            const details = detailsMap[index];
            Object.keys(details).forEach(key => {
                if (key !== 'action' && key !== 'timeline') {
                    htmlContent += `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${details[key]}</li>`;
                }
            });

            htmlContent += `
                </ul>
            </div>

            <div class="action-box">
                <strong>Recommended Action:</strong><br>
                ${details.action}<br>
                <strong>Timeline:</strong> ${details.timeline}
            </div>
        </div>
`;
        });

        htmlContent += `
    </div>

    <div class="section">
        <h2>Recommendations Summary</h2>
        <div class="summary-list">
            <ol>
                ${currentRecommendations.map((rec, i) => `<li>${rec.category} (${(rec.confidence * 100).toFixed(0)}% confidence)</li>`).join('')}
            </ol>
        </div>
    </div>

    <div class="section">
        <h2>Next Steps</h2>
        <div class="next-steps">
            <ol>
                <li>Review all high-confidence recommendations (&gt;80%)</li>
                <li>Prioritize urgent items (Revenue Anomaly, Supply Chain Risk)</li>
                <li>Coordinate with Commercial and Operations leaders</li>
                <li>Adjust Q3 and Q4 forecast models</li>
                <li>Monitor results and adjust as needed</li>
            </ol>
        </div>
    </div>

    <div class="footer">
        <p><strong>Generated by Executive Intelligence System - AI-Powered Analytics</strong></p>
        <p>Report Date: ${today}</p>
    </div>
</body>
</html>`;

        // Download HTML report
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        const link = document.createElement('a');
        const filename = `Animal_Health_Report_${new Date().toISOString().split('T')[0]}.html`;

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addChatMessage(`HTML report with embedded charts downloaded as "${filename}"`, false);
    }

    async function downloadPackage() {
        if (!currentRecommendations) return;

        addChatMessage("Generating analysis package... This may take a moment.", false);

        const zip = new JSZip();
        const today = new Date().toISOString().split('T')[0];

        // Add the text report
        const reportContent = await generateReportContent();
        zip.file(`Animal_Health_Report_${today}.txt`, reportContent);

        // Add the HTML report with embedded charts
        const htmlReport = await generateHTMLReportContent();
        zip.file(`Animal_Health_Report_${today}.html`, htmlReport);

        // Add chart images as separate PNG files
        for (let i = 0; i < currentRecommendations.length; i++) {
            const canvas = document.getElementById(`chart-${i}`);
            if (canvas) {
                const imgData = canvas.toDataURL('image/png').split(',')[1]; // Get base64 data
                const chartNames = ['outlier_detection', 'efficiency_comparison', 'maintenance_schedule', 'load_distribution'];
                zip.file(`charts/${chartNames[i]}_chart_${today}.png`, imgData, {base64: true});
            }
        }

        // Add analytics tables as CSV files
        const filenameMap = [
            'outlier_detection_analytics',
            'efficiency_comparison',
            'maintenance_schedule',
            'load_distribution'
        ];

        currentRecommendations.forEach((rec, index) => {
            const tableHTML = generateAnalyticsTable(index, rec);
            const csvContent = convertTableToCSV(tableHTML);
            zip.file(`${filenameMap[index]}_${today}.csv`, csvContent);
        });

        // Add query results if available
        if (queryResults && queryResults.length > 0) {
            const queryCSV = convertQueryResultsToCSV();
            zip.file(`query_results_${today}.csv`, queryCSV);
        }

        // Add README
        const readme = `ANIMAL HEALTH EXECUTIVE VITAL SIGNS PACKAGE
Generated: ${today}

CONTENTS:
=========
REPORTS:
1. Animal_Health_Report_${today}.txt - Text-based comprehensive analysis report
2. Animal_Health_Report_${today}.html - HTML report with embedded charts and visualizations

DATA FILES:
3. revenue_anomaly_analytics_${today}.csv - Anomaly detection data
4. supply_chain_optimization_${today}.csv - Supply chain analysis
5. margin_improvement_${today}.csv - Margin improvement breakdown
6. rd_pipeline_forecast_${today}.csv - R&D Pipeline analysis
7. query_results_${today}.csv - Raw query results (if available)

CHARTS (PNG format):
8. charts/revenue_anomaly_chart_${today}.png - Anomaly detection visualization
9. charts/supply_chain_optimization_chart_${today}.png - Supply Chain bar chart
10. charts/margin_improvement_chart_${today}.png - Margin Improvement doughnut chart
11. charts/rd_pipeline_forecast_chart_${today}.png - Pipeline forecast line chart

INSTRUCTIONS:
=============
- Open the .html file in any web browser for the best viewing experience with charts
- The .txt file provides the same information in plain text format
- CSV files can be opened in Excel, Google Sheets, or any spreadsheet application
- Chart PNG files can be used in presentations or reports
- All data is current as of ${today}

RECOMMENDED VIEWING ORDER:
1. Start with the HTML report for a complete overview
2. Review CSV files for detailed data analysis
3. Use chart images for presentations or documentation

For questions or assistance, please contact your system administrator.
`;
        zip.file('README.txt', readme);

        // Generate and download ZIP
        zip.generateAsync({ type: 'blob' }).then(function(content) {
            const link = document.createElement('a');
            const filename = `Executive_Analysis_Package_${today}.zip`;

            link.href = URL.createObjectURL(content);
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            addChatMessage(`Analysis package downloaded as "${filename}" (contains 2 reports, ${currentRecommendations.length} charts, and ${currentRecommendations.length + 1} data files)`, false);
        });
    }

    function generateHTMLReportContent() {
        // Returns HTML content without downloading (for ZIP package)
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const chartImages = [];
        for (let i = 0; i < currentRecommendations.length; i++) {
            const canvas = document.getElementById(`chart-${i}`);
            if (canvas) {
                chartImages.push(canvas.toDataURL('image/png'));
            } else {
                chartImages.push(null);
            }
        }

        // Reuse the same HTML generation logic from generateHTMLReport
        // (Same content as above but return instead of download)
        return generateHTMLReportString(today, chartImages);
    }

    function generateHTMLReportString(today, chartImages) {
        let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animal Health Executive Vital Signs Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .section { background: white; padding: 25px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .recommendation { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .chart-container { margin: 20px 0; text-align: center; }
        .chart-container img { max-width: 100%; height: auto; border: 1px solid #dee2e6; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Animal Health Executive Vital Signs Report</h1>
        <div>Generated: ${today}</div>
    </div>
    <div class="section">
        <h2>Charts Available</h2>
        <p>This package includes all analysis charts. Open the HTML file to view embedded charts, or view the separate PNG files in the charts folder.</p>
    </div>
</body>
</html>`;
        return htmlContent;
    }

    function generateReportContent() {
        // Same as generateReport but returns content instead of downloading
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let reportContent = `ANIMAL HEALTH EXECUTIVE VITAL SIGNS REPORT
Generated: ${today}

EXECUTIVE SUMMARY
================================================================================
This report presents AI-powered analysis of executive commercial and operations data,
identifying ${currentRecommendations.length} key insights and recommendations for operational
improvement and risk mitigation.

Query Parameters:
- Date Range: ${queryData.fromDate} to ${queryData.toDate}
- Locations: ${queryData.locations.map(l => l.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}
- Lines: ${queryData.lineNumbers.map(l => l.replace('line-', 'Line ')).join(', ')}
- Sensors: ${queryData.sensorCategories.map(s => s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}

DETAILED FINDINGS
================================================================================

`;

        currentRecommendations.forEach((rec, index) => {
            reportContent += `
${index + 1}. ${rec.category.toUpperCase()}
${'-'.repeat(80)}
Confidence Level: ${(rec.confidence * 100).toFixed(0)}%
Analysis Source: ${rec.source}

Finding:
${rec.suggestion}

`;

            switch(index) {
                case 0:
                    reportContent += `Key Metrics:
- Portfolio: Companion Animal Parasiticides
- Region: EU
- Anomaly Date: July 23, 2023
- Actual Revenue: $28M
- Expected Revenue: $45M
- Deviation: -37.8%

Recommended Action:
Review distributor inventory levels and competitive activity.
Timeline: Within 24 hours

`;
                    break;
                case 1:
                    reportContent += `Key Metrics:
- Portfolio: Livestock Vaccines
- Region: NA
- Current Inventory: 45 Days
- Projected (Week 4): 2 Days
- Target Minimum: 30 Days


Recommended Action:
Expedite secondary suppliers to avoid stockouts.
Timeline: Next 5 days

`;
                    break;
                case 2:
                    reportContent += `Key Metrics:
- Issue: Low Manufacturing Yield
- Current Supplier: Supplier B (API-14)
- Current Yield: 82.4%
- Target Yield: 95.0%


Recommended Action:
Return to previous supplier (Supplier C).
Timeline: Next production batch

`;
                    break;
                case 3:
                    reportContent += `Key Metrics:
- Project: New Feline Vaccine
- Trial Phase: Phase 3
- Original Target: Q4
- New Projected Target: Q3
- Launch Impact: +1 Quarter


Recommended Action:
Prepare regulatory submission early.
Timeline: Coordinate next 30 days

`;
                    break;
            }
        });

        reportContent += `
RECOMMENDATIONS SUMMARY
================================================================================
${currentRecommendations.map((rec, i) => `${i + 1}. ${rec.category} (${(rec.confidence * 100).toFixed(0)}% confidence)`).join('\n')}

NEXT STEPS
================================================================================
1. Review all high-confidence recommendations (>80%)
2. Prioritize urgent items (Revenue Anomaly, Supply Chain Risk)
3. Coordinate with Commercial and Operations leaders
4. Adjust Q3 and Q4 forecast models
5. Monitor results and adjust as needed

END OF REPORT
================================================================================
Generated by Executive Intelligence System - AI-Powered Analytics
Report Date: ${today}
`;

        return reportContent;
    }

    function convertTableToCSV(tableHTML) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = tableHTML;
        const table = tempDiv.querySelector('table');

        if (!table) return '';

        let csv = [];
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const cols = row.querySelectorAll('td, th');
            const csvRow = [];

            cols.forEach(col => {
                let text = col.textContent.trim();
                text = text.replace(/\s+/g, ' ');
                if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                csvRow.push(text);
            });

            csv.push(csvRow.join(','));
        });

        return csv.join('\n');
    }

    function convertQueryResultsToCSV() {
        let csv = 'Timestamp,Location,Line,Sensor,Value,Unit\n';

        queryResults.forEach(row => {
            csv += `"${row.timestamp}","${row.location}","${row.line}","${row.sensor}",${row.value},"${row.unit}"\n`;
        });

        return csv;
    }

    // Event listeners for report buttons
    document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    document.getElementById('download-package-btn').addEventListener('click', downloadPackage);

    // Event listener for revise query button
    document.getElementById('revise-query-btn').addEventListener('click', () => {
        // Switch to the Data Query tab
        document.querySelectorAll('.tabs-trigger').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.tabs-trigger[data-tab="analysis"]').classList.add('active');

        for (const key in tabsContent) {
            tabsContent[key].classList.add('hidden');
        }
        tabsContent.analysis.classList.remove('hidden');
    });

    // Initial render call
    initializeApp();

    // --- Validation Tab Functionality ---
    const validationChatMessages = document.getElementById('validationChatMessages');
    const validationChatInput = document.getElementById('validationChatInput');
    const validationChatSendBtn = document.getElementById('validationChatSendBtn');
    const validationSuggestions = document.querySelectorAll('.validation-suggestion');
    const validationResultsCard = document.getElementById('validationResultsCard');
    const validationResultsContent = document.getElementById('validationResultsContent');
    const validationResultsDescription = document.getElementById('validationResultsDescription');
    const referencesDrawer = document.getElementById('references-drawer');
    const referencesDrawerClose = document.getElementById('references-drawer-close');
    const referencesDrawerContent = document.getElementById('references-drawer-content');
    const documentModal = document.getElementById('document-modal');
    const documentModalClose = document.getElementById('document-modal-close');
    const documentModalCancel = document.getElementById('document-modal-cancel');
    const documentModalTitle = document.getElementById('document-modal-title');
    const documentModalBody = document.getElementById('document-modal-body');
    const documentDownloadBtn = document.getElementById('document-download-btn');

    let currentDocument = null;

    // References drawer close button
    referencesDrawerClose.addEventListener('click', () => {
        referencesDrawer.classList.remove('open');
    });

    // Document modal close buttons
    documentModalClose.addEventListener('click', () => {
        documentModal.style.display = 'none';
    });

    documentModalCancel.addEventListener('click', () => {
        documentModal.style.display = 'none';
    });

    // Close modal when clicking overlay
    documentModal.addEventListener('click', (e) => {
        if (e.target === documentModal) {
            documentModal.style.display = 'none';
        }
    });

    // Download button handler
    documentDownloadBtn.addEventListener('click', () => {
        if (currentDocument) {
            downloadDocument(currentDocument);
        }
    });

    // Validation rules data
    const validationRules = [
        // Flowrate rules (3)
        // Revenue rules
        { id: 'RV001', category: 'revenue', portfolio: 'Companion Animal', region: 'NA', location: 'NA', type: 'Growth', min: 2, max: 15, unit: '%', optimal: '>8', status: 'Active' },
        { id: 'RV002', category: 'revenue', portfolio: 'Livestock', region: 'EU', location: 'EU', type: 'Growth', min: -5, max: 10, unit: '%', optimal: '>2', status: 'Active' },

        // Margin rules
        { id: 'MG001', category: 'margin', portfolio: 'Therapeutics', region: 'APAC', location: 'APAC', min: 55, max: 85, unit: '%', warning: '60/80', critical: '50/90', status: 'Active' },

        // Yield rules
        { id: 'YL001', category: 'yield', line: 'Vaccine Line A', location: 'NA', baseline: 95, variance: '±2%', range: '93-97', unit: '%', status: 'Active' },
        { id: 'YL002', category: 'yield', line: 'Parasiticide Line B', location: 'EU', baseline: 98, variance: '±1%', range: '97-99', unit: '%', status: 'Active' },

        // Inventory rules
        { id: 'IV001', category: 'inventory', portfolio: 'Companion Animal', region: 'Global', location: 'Global', max: 60, warning: 30, unit: 'Days', status: 'Active' },
        { id: 'IV002', category: 'inventory', portfolio: 'Livestock', region: 'NA', location: 'NA', max: 45, warning: 25, unit: 'Days', status: 'Active' },

        // Data quality rules
        { id: 'DQ001', category: 'data-quality', rule: 'Sales Reporting Delay', location: 'System-Wide', requirement: 'T+2 Days Max', scope: 'All Regions', status: 'Active' },
        { id: 'DQ002', category: 'data-quality', rule: 'Inventory Reconciliation', location: 'System-Wide', requirement: 'Weekly', scope: 'All Warehouses', status: 'Active' },
    ];

    let currentCategoryFilter = 'all';
    let currentLocationFilter = 'all';

    // Initialize validation rules display
    function initializeValidationRules() {
        renderValidationRules();
        setupValidationFilterButtons();
    }

    // Setup validation filter buttons
    function setupValidationFilterButtons() {
        // Category filter buttons
        const categoryButtons = document.querySelectorAll('.validation-category-filter');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update filter and re-render
                currentCategoryFilter = btn.dataset.category;
                renderValidationRules();
            });
        });

        // Location filter buttons
        const locationButtons = document.querySelectorAll('.validation-location-filter');
        locationButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                locationButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update filter and re-render
                currentLocationFilter = btn.dataset.location;
                renderValidationRules();
            });
        });
    }

    // Render validation rules based on filters
    function renderValidationRules() {
        const container = document.getElementById('validation-rules-container');

        let filteredRules = validationRules;

        // Apply category filter
        if (currentCategoryFilter !== 'all') {
            filteredRules = filteredRules.filter(rule => rule.category === currentCategoryFilter);
        }

        // Apply location filter
        if (currentLocationFilter !== 'all') {
            filteredRules = filteredRules.filter(rule => rule.location === currentLocationFilter);
        }

        let rulesHTML = '<div class="space-y-3">';

        if (filteredRules.length === 0) {
            rulesHTML += '<div class="text-center text-secondary py-8">No validation rules match the selected filters.</div>';
        } else {
            filteredRules.forEach(rule => {
                rulesHTML += generateRuleHTML(rule);
            });
        }

        rulesHTML += '</div>';
        container.innerHTML = rulesHTML;
    }

    // Generate HTML for a single rule
    function generateRuleHTML(rule) {
        const categoryColors = {
            'revenue': 'var(--primary)',
            'margin': '#ff6b35',
            'yield': '#9b59b6',
            'inventory': '#3498db',

            'data-quality': 'var(--success)'
        };

        const borderColor = categoryColors[rule.category] || 'var(--success)';

        if (rule.category === 'flowrate') {
            return `
                <div class="p-3 rounded" style="background-color: var(--background); border-left: 3px solid ${borderColor};">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="font-medium">${rule.portfolio} - ${rule.region}</div>
                            <div class="text-sm text-secondary mt-1">
                                Type: ${rule.type} | Range: ${rule.min}-${rule.max} ${rule.unit} | Optimal: ${rule.optimal} ${rule.unit}
                            </div>
                        </div>
                        <span class="badge outline text-xs" style="border-color: ${borderColor}; color: ${borderColor};">${rule.id}</span>
                    </div>
                </div>
            `;
        } else if (rule.category === 'temperature') {
            return `
                <div class="p-3 rounded" style="background-color: var(--background); border-left: 3px solid ${borderColor};">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="font-medium">${rule.portfolio} - ${rule.region}</div>
                            <div class="text-sm text-secondary mt-1">
                                Range: ${rule.min}-${rule.max}${rule.unit} | Warning: ${rule.warning}${rule.unit} | Critical: ${rule.critical}${rule.unit}
                            </div>
                        </div>
                        <span class="badge outline text-xs" style="border-color: ${borderColor}; color: ${borderColor};">${rule.id}</span>
                    </div>
                </div>
            `;
        } else if (rule.category === 'pressure') {
            const location = rule.line || `${rule.portfolio} - ${rule.region}`;
            return `
                <div class="p-3 rounded" style="background-color: var(--background); border-left: 3px solid ${borderColor};">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="font-medium">${location}</div>
                            <div class="text-sm text-secondary mt-1">
                                Baseline: ${rule.baseline} ${rule.unit} | Variance: ${rule.variance} | Range: ${rule.range} ${rule.unit}
                            </div>
                        </div>
                        <span class="badge outline text-xs" style="border-color: ${borderColor}; color: ${borderColor};">${rule.id}</span>
                    </div>
                </div>
            `;
        } else if (rule.category === 'vibration') {
            return `
                <div class="p-3 rounded" style="background-color: var(--background); border-left: 3px solid ${borderColor};">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="font-medium">${rule.portfolio} - ${rule.region}</div>
                            <div class="text-sm text-secondary mt-1">
                                Max: ${rule.max} ${rule.unit} | Warning: ${rule.warning} ${rule.unit}
                            </div>
                        </div>
                        <span class="badge outline text-xs" style="border-color: ${borderColor}; color: ${borderColor};">${rule.id}</span>
                    </div>
                </div>
            `;
        } else if (rule.category === 'power') {
            return `
                <div class="p-3 rounded" style="background-color: var(--background); border-left: 3px solid ${borderColor};">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="font-medium">${rule.portfolio} - ${rule.region}</div>
                            <div class="text-sm text-secondary mt-1">
                                Nominal: ${rule.nominal} ${rule.unit} | Variance: ${rule.variance} | Range: ${rule.range} ${rule.unit}
                            </div>
                        </div>
                        <span class="badge outline text-xs" style="border-color: ${borderColor}; color: ${borderColor};">${rule.id}</span>
                    </div>
                </div>
            `;
        } else if (rule.category === 'data-quality') {
            return `
                <div class="p-3 rounded" style="background-color: var(--background); border-left: 3px solid ${borderColor};">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="font-medium">${rule.rule}</div>
                            <div class="text-sm text-secondary mt-1">
                                Requirement: ${rule.requirement} | Scope: ${rule.scope}
                            </div>
                        </div>
                        <span class="badge outline text-xs" style="border-color: ${borderColor}; color: ${borderColor};">${rule.id}</span>
                    </div>
                </div>
            `;
        }

        return '';
    }

    // Initialize validation rules on page load
    initializeValidationRules();

    // Track if handlers are already set up
    let validationChatHandlersSetup = false;

    // Setup validation chat handlers
    function setupValidationChatHandlers() {
        if (validationChatHandlersSetup) return;
        validationChatHandlersSetup = true;

        // Handle validation suggestion button clicks
        const suggestionButtons = document.querySelectorAll('.validation-suggestion');
        suggestionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const request = btn.dataset.request;
                handleValidationRequest(request);
            });
        });

        // Handle validation chat send button
        if (validationChatSendBtn) {
            validationChatSendBtn.addEventListener('click', () => {
                const request = validationChatInput.value.trim();
                if (request) {
                    handleValidationRequest(request);
                    validationChatInput.value = '';
                }
            });
        }

        // Handle validation chat input enter key
        if (validationChatInput) {
            validationChatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const request = validationChatInput.value.trim();
                    if (request) {
                        handleValidationRequest(request);
                        validationChatInput.value = '';
                    }
                }
            });
        }
    }

    // Setup chat handlers when validation tab is shown
    const validationTabTrigger = document.querySelector('.tabs-trigger[data-tab="golden"]');
    if (validationTabTrigger) {
        validationTabTrigger.addEventListener('click', () => {
            setTimeout(setupValidationChatHandlers, 100);
        });
    }

    // Also setup on page load
    setTimeout(setupValidationChatHandlers, 100);

    function addValidationChatMessage(message, isUser = false, includeReferences = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'assistant'}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'chat-bubble';
        bubbleDiv.textContent = message;

        messageDiv.appendChild(bubbleDiv);

        // Add "See References" link for assistant messages
        if (!isUser && includeReferences) {
            const referencesLink = document.createElement('div');
            referencesLink.className = 'mt-2';
            referencesLink.innerHTML = `
                <a href="#" class="text-sm see-references-link" style="color: var(--primary); text-decoration: none; display: inline-flex; align-items: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    See References
                </a>
            `;
            bubbleDiv.appendChild(referencesLink);
        }

        validationChatMessages.appendChild(messageDiv);
        validationChatMessages.scrollTop = validationChatMessages.scrollHeight;

        // Add event listener for "See References" links
        if (!isUser && includeReferences) {
            const link = messageDiv.querySelector('.see-references-link');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showReferences(message);
            });
        }
    }

    function handleValidationRequest(request) {
        // Add user message
        addValidationChatMessage(request, true);

        // Simulate AI processing
        setTimeout(() => {
            const response = generateValidationResponse(request);
            addValidationChatMessage(response, false, true); // Include references link

            // Show results card with relevant data
            showValidationResults(request);
        }, 500);
    }

            function generateValidationResponse(request) {
        const requestLower = request.toLowerCase();

        if (requestLower.includes('out of spec') || requestLower.includes('out-of-spec') || requestLower.includes('batches')) {
            return "Last month, 3 manufacturing batches for Livestock Vaccines (EU) were out of specification for yield. Most occurred during the second week. I've included the violation records and applicable validation rules below.";
        } else if (requestLower.includes('validation failure') || requestLower.includes('supply chain')) {
            return "In the past week, there were 4 supply chain validation failures: 3 relating to minimum inventory days on hand in NA, and 1 data freshness issue. See breakdown with reference rules below.";
        } else if (requestLower.includes('data quality') && requestLower.includes('issue')) {
            return "NA region sales reporting has 2 active data quality issues: T+2 reporting delay rule violation, and 1 pending weekly inventory reconciliation. Reference validation rules are shown below.";
        } else if (requestLower.includes('inventory') && requestLower.includes('violation')) {
            return "In the last 2 weeks, there were 3 inventory compliance violations in EU. 2 were warning-level (under 30 days) and 1 was critical (under 15 days). Violations and relevant rules are detailed below.";
        }
        else if (requestLower.includes('margin') && requestLower.includes('target')) {
            return "The target gross margin for Companion Animal therapeutics is >80%. The acceptable range is 60-90%. I'll show you the detailed specifications with reference rules below.";
        } else if (requestLower.includes('yield') && requestLower.includes('threshold')) {
            return "Acceptable yield thresholds for vaccine manufacturing are 93-97% (baseline 95% ±2%). Full specifications and validation rules are shown below.";
        } else if (requestLower.includes('inventory limit') || requestLower.includes('inventory days')) {
            return "EU allows a maximum inventory of 60 days on hand, with a warning threshold at 30 days. Current compliance rate is 94%. Reference inventory rules are included below.";
        } else if (requestLower.includes('revenue recognition')) {
            return "Q3 revenue recognition requires T+2 days max reporting delay. All rules and their specifications are detailed below.";
        } else {
            return "I've analyzed your validation query. The relevant specifications, current compliance status, and reference validation rules are shown in the results below.";
        }
    }

    function showValidationResults(request) {
        const requestLower = request.toLowerCase();
        validationResultsCard.classList.remove('hidden');
        validationResultsDescription.textContent = `Results for: ${request}`;

        let resultsHTML = '';

        if (requestLower.includes('flowrate') && requestLower.includes('range')) {
            resultsHTML = `
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Portfolio</th>
                                <th>Min Target (%)</th>
                                <th>Max Target (%)</th>
                                <th>Typical Margin (%)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Companion Animal</td>
                                <td>100</td>
                                <td>500</td>
                                <td>250-400</td>
                                <td><span class="badge outline" style="border-color: var(--success); color: var(--success);">Active</span></td>
                            </tr>
                            <tr>
                                <td>Livestock</td>
                                <td>500</td>
                                <td>1000</td>
                                <td>700-900</td>
                                <td><span class="badge outline" style="border-color: var(--success); color: var(--success);">Active</span></td>
                            </tr>
                            <tr>
                                <td>Equine</td>
                                <td>25</td>
                                <td>150</td>
                                <td>50-120</td>
                                <td><span class="badge outline" style="border-color: var(--success); color: var(--success);">Active</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        } else if (requestLower.includes('out of spec') || requestLower.includes('out-of-spec')) {
            resultsHTML = `
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Portfolio</th>
                                <th>Yield (%)</th>
                                <th>Expected Range</th>
                                <th>Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="background-color: rgba(248, 81, 73, 0.1);">
                                <td>2024-12-15</td>
                                <td>EU</td>
                                <td>Livestock Vaccines</td>
                                <td>89</td>
                                <td>93-97</td>
                                <td style="color: var(--danger);">-4%</td>
                            </tr>
                            <tr style="background-color: rgba(248, 81, 73, 0.1);">
                                <td>2024-12-14</td>
                                <td>EU</td>
                                <td>Livestock Vaccines</td>
                                <td>91</td>
                                <td>93-97</td>
                                <td style="color: var(--danger);">-2%</td>
                            </tr>
                            <tr style="background-color: rgba(248, 81, 73, 0.1);">
                                <td>2024-12-12</td>
                                <td>EU</td>
                                <td>Livestock Vaccines</td>
                                <td>90</td>
                                <td>93-97</td>
                                <td style="color: var(--danger);">-3%</td>
                            </tr>
                            <tr>
                                <td colspan="6" class="text-center text-secondary">Showing 3 of 23 out-of-spec readings</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        } else if (requestLower.includes('validation failure')) {
            resultsHTML = `
                <div class="space-y-4">
                    <div class="p-4 rounded" style="background-color: var(--background); border: 1px solid var(--border);">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="font-medium" style="color: var(--danger);">Flowrate Out-of-Range (7 failures)</div>
                                <div class="text-sm text-secondary">Readings exceeded min/max thresholds</div>
                            </div>
                            <span class="badge outline" style="border-color: var(--danger); color: var(--danger);">High</span>
                        </div>
                        <div class="text-sm">Locations: Station B (4), Station A (2), Station C (1)</div>
                    </div>
                    <div class="p-4 rounded" style="background-color: var(--background); border: 1px solid var(--border);">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="font-medium" style="color: var(--warning);">Temperature Warnings (3 failures)</div>
                                <div class="text-sm text-secondary">Temperatures approaching thresholds</div>
                            </div>
                            <span class="badge outline" style="border-color: var(--warning); color: var(--warning);">Medium</span>
                        </div>
                        <div class="text-sm">Locations: Station A (3)</div>
                    </div>
                    <div class="p-4 rounded" style="background-color: var(--background); border: 1px solid var(--border);">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="font-medium" style="color: var(--warning);">Data Freshness Issues (2 failures)</div>
                                <div class="text-sm text-secondary">Sensor readings delayed beyond 5-minute threshold</div>
                            </div>
                            <span class="badge outline" style="border-color: var(--warning); color: var(--warning);">Medium</span>
                        </div>
                        <div class="text-sm">Sensors: TEMP-A4, FLOW-C2</div>
                    </div>
                </div>
            `;
        } else {
            resultsHTML = `
                <div class="text-center text-secondary py-8">
                    <p>Validation results for your query would appear here.</p>
                    <p class="text-sm mt-2">Try asking about flowrate ranges, out-of-spec readings, or validation failures.</p>
                </div>
            `;
        }

        // Always append reference validation rules
        resultsHTML += generateReferenceRulesSection(requestLower);

        validationResultsContent.innerHTML = resultsHTML;
    }

    function generateReferenceRulesSection(requestLower) {
        let relevantRules = [];

        // Determine which rules are relevant based on the query
        if (requestLower.includes('flowrate') || requestLower.includes('out of spec')) {
            relevantRules = validationRules.filter(r => r.category === 'flowrate');
        } else if (requestLower.includes('temperature') || requestLower.includes('violation')) {
            relevantRules = validationRules.filter(r => r.category === 'temperature');
        } else if (requestLower.includes('pressure')) {
            relevantRules = validationRules.filter(r => r.category === 'pressure');
        } else if (requestLower.includes('power') && requestLower.includes('high-capacity')) {
            relevantRules = validationRules.filter(r => r.category === 'power');
        } else if (requestLower.includes('station a')) {
            relevantRules = validationRules.filter(r => r.location === 'Station A');
        } else if (requestLower.includes('data quality')) {
            relevantRules = validationRules.filter(r => r.category === 'data-quality');
        } else if (requestLower.includes('validation failure')) {
            // Show mix of rules for validation failures
            relevantRules = [
                ...validationRules.filter(r => r.category === 'flowrate').slice(0, 2),
                ...validationRules.filter(r => r.category === 'temperature').slice(0, 1),
                ...validationRules.filter(r => r.category === 'data-quality').slice(0, 1)
            ];
        } else {
            // Default: show first few rules from different categories
            relevantRules = validationRules.slice(0, 4);
        }

        if (relevantRules.length === 0) return '';

        let html = `
            <div class="mt-6 pt-4" style="border-top: 1px solid var(--border);">
                <h4 class="font-medium mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; color: var(--primary);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Reference Validation Rules
                </h4>
                <div class="space-y-2">
        `;

        relevantRules.forEach(rule => {
            html += generateRuleHTML(rule);
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    function showReferences(query) {
        const queryLower = query.toLowerCase();
        let referencesHTML = '<div class="space-y-4">';

        // Generate relevant references based on query
        const references = getRelevantReferences(queryLower);

        references.forEach((ref, index) => {
            referencesHTML += `
                <div class="p-4 rounded" style="background-color: var(--background); border: 1px solid var(--border); cursor: pointer; transition: border-color 0.2s;"
                     onmouseover="this.style.borderColor='var(--primary)'"
                     onmouseout="this.style.borderColor='var(--border)'"
                     data-doc-index="${index}">
                    <div class="flex items-start gap-3">
                        <div style="color: var(--primary); flex-shrink: 0;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="font-medium" style="color: var(--primary);">
                                ${ref.title}
                            </div>
                            <p class="text-sm text-secondary mt-1">${ref.description}</p>
                            <div class="flex items-center gap-3 mt-2 text-xs text-secondary">
                                <span>${ref.type}</span>
                                <span>•</span>
                                <span>${ref.date}</span>
                                ${ref.version ? `<span>•</span><span>v${ref.version}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        referencesHTML += '</div>';
        referencesDrawerContent.innerHTML = referencesHTML;
        referencesDrawer.classList.add('open');

        // Add click handlers to reference cards
        setTimeout(() => {
            document.querySelectorAll('[data-doc-index]').forEach((card, index) => {
                card.addEventListener('click', () => {
                    openDocumentModal(references[index]);
                });
            });
        }, 100);
    }

    function openDocumentModal(document) {
        currentDocument = document;
        documentModalTitle.textContent = document.title;

        // Generate highlights based on document
        const highlights = document.highlights || generateDocumentHighlights(document);

        let bodyHTML = `
            <div class="mb-4">
                <div class="text-sm text-secondary mb-2">Document Information</div>
                <div class="flex flex-wrap gap-4 text-sm">
                    <div><strong>Type:</strong> ${document.type}</div>
                    <div><strong>Date:</strong> ${document.date}</div>
                    ${document.version ? `<div><strong>Version:</strong> ${document.version}</div>` : ''}
                </div>
            </div>

            <div class="mb-4">
                <div class="text-sm font-medium mb-3">Summary Highlights</div>
                <div class="space-y-2">
        `;

        highlights.forEach(highlight => {
            bodyHTML += `
                <div class="highlight-item">
                    <div class="font-medium text-sm mb-1">${highlight.title}</div>
                    <div class="text-sm text-secondary">${highlight.content}</div>
                </div>
            `;
        });

        bodyHTML += `
                </div>
            </div>

            <div class="p-3 rounded" style="background-color: var(--background); border: 1px solid var(--border);">
                <div class="text-sm text-secondary">${document.description}</div>
            </div>
        `;

        documentModalBody.innerHTML = bodyHTML;
        documentModal.style.display = 'flex';
    }

    function generateDocumentHighlights(document) {
        // Generate highlights based on document type and keywords
        const highlightsMap = {
            "companion-revenue-specs": [
                { title: "Companion Animal Range", content: "Target growth is >8% for core products." },
                { title: "High-Growth Opportunities", content: "New therapeutics should target >15% YoY growth." },
                { title: "Out-of-Spec Protocols", content: "Readings beyond acceptable range trigger automatic alerts. Three consecutive violations require immediate investigation." },
                { title: "Calibration Requirements", content: "Flow meters must be calibrated quarterly. Accuracy tolerance: ±2% of reading." }
            ],
            "flowrate-monitoring-sop": [
                { title: "Weekly Sales Reporting", content: "Weekly aggregation required for all commercial lines." },
                { title: "Alert Escalation", content: "Level 1: Warning at ±8% variance. Level 2: Critical at ±12% variance. Level 3: Auto-shutdown at ±20%." },
                { title: "Response Procedures", content: "Operations team must respond to Level 1 alerts within 30 minutes. Critical alerts require immediate action." }
            ],
            "temp-control-standards": [
                { title: "Operating Temperature Range", content: "Normal operation: 50-180°F. Warning thresholds: 45°F (low) and 185°F (high)." },
                { title: "Critical Shutdown Points", content: "Automatic shutdown triggered at 40°F or 195°F to prevent equipment damage." },
                { title: "Temperature Monitoring", content: "Continuous temperature monitoring via RTD sensors. Accuracy: ±0.5°F." },
                { title: "Seasonal Adjustments", content: "Winter operations may require adjusted baselines for outdoor equipment." }
            ],
            "thermal-mgmt-practices": [
                { title: "Supply Chain Reserves", content: "Strategic reserve required to maintain 30 days inventory." },
                { title: "Cooling Systems", content: "Active cooling systems must engage when temperatures exceed 170°F." },
                { title: "Preventive Maintenance", content: "Quarterly thermal imaging surveys recommended to identify hot spots before failure." }
            ],
            "pressure-variance-specs": [
                { title: "Line 1 Specifications", content: "Baseline pressure: 150 PSI. Maximum variance: ±10%. Acceptable range: 135-165 PSI." },
                { title: "Variance Monitoring", content: "Real-time pressure monitoring with 5-second refresh rate. Variance calculated against 5-minute rolling average." },
                { title: "Compliance Tracking", content: "Current compliance rate: 94%. Target: >98% readings within specification." }
            ],
            "validation-framework": [
                { title: "Validation Hierarchy", content: "Three-tier validation: L1 (Format/Type), L2 (Range/Limits), L3 (Business Rules)." },
                { title: "Failure Classification", content: "Critical: Data unusable. Major: Questionable data. Minor: Data usable with caveats." },
                { title: "Remediation Workflows", content: "Automated retry for transient failures. Manual review required for persistent issues." },
                { title: "Quality Metrics", content: "Target validation pass rate: >99.5%. Current performance tracked in quality dashboard." }
            ],
            "qa-validation-procedures": [
                { title: "Initial Validation", content: "All incoming data passes through automated validation pipeline before database insertion." },
                { title: "Error Logging", content: "All validation failures logged with timestamp, source, and failure reason." },
                { title: "Resolution Process", content: "Step 1: Identify root cause. Step 2: Implement fix. Step 3: Revalidate. Step 4: Document." }
            ],
            "data-quality-standards": [
                { title: "Data Freshness", content: "Sensor readings must be received within 5 minutes. Stale data flagged and excluded from analysis." },
                { title: "Connectivity Monitoring", content: "Sensors with >3 consecutive missed readings generate connectivity alerts." },
                { title: "Calibration Schedule", content: "All sensors require calibration every 90 days. Overdue calibration suspends sensor data usage." }
            ],
            "sensor-calibration-log": [
                { title: "Recent Calibrations", content: "45 sensors calibrated in past 30 days. 3 sensors pending calibration this week." },
                { title: "Calibration History", content: "Full calibration history available for compliance audits. Average drift: <1% between calibrations." },
                { title: "Next Actions", content: "TEMP-A4 and FLOW-C2 scheduled for calibration next Monday." }
            ],
            "epa-compliance-reqs": [
                { title: "Commercial Reporting Requirements", content: "Monthly reporting for all sales portfolios." },
                { title: "Specification Compliance", content: "All equipment must operate within EPA-defined limits. Violations must be reported within 24 hours." },
                { title: "Audit Preparation", content: "Maintain 5 years of operational data for compliance audits." }
            ],
            "iso-9001-quality-mgmt": [
                { title: "Financial Management System", content: "SOX compliance applied to revenue operations." },
                { title: "Continuous Improvement", content: "Regular review cycles to identify process improvements and reduce validation failures." },
                { title: "Documentation Standards", content: "All procedures documented according to ISO standards. Annual certification review." }
            ]
        };

        // Extract document ID from URL
        const docId = document.url.split('/').pop();
        return highlightsMap[docId] || [
            { title: "Document Summary", content: document.description },
            { title: "Key Information", content: "This document contains vital business guidelines." },
            { title: "Applicability", content: "Applies to all commercial and operational reporting." }
        ];
    }

    function downloadDocument(document) {
        // Simulate document download
        const docId = document.url.split('/').pop();
        const filename = `${docId}_${document.version || 'v1.0'}.pdf`;

        // Create a mock download (in real implementation, this would fetch actual file)
        const blob = new Blob([`${document.title}\n\n${document.description}\n\nThis is a simulated document download.`],
            { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success message
        alert(`Downloaded: ${filename}`);
    }

    function getRelevantReferences(queryLower) {
        const allReferences = [
            // Flowrate references
            {
                title: "Sales Reporting Compliance Manual",
                description: "Comprehensive guide covering revenue and margin targets including standard, high-capacity, and low-flow models.",
                url: "#/documents/companion-revenue-specs",
                type: "Technical Manual",
                date: "Updated Jan 2025",
                version: "3.2",
                keywords: ["flowrate", "range", "specification"]
            },
            {
                title: "Operating Guidelines: Revenue Recognition",
                description: "Standard operating procedures for continuous flowrate monitoring and out-of-specification detection protocols.",
                url: "#/documents/flowrate-monitoring-sop",
                type: "SOP",
                date: "Dec 2024",
                version: "2.1",
                keywords: ["flowrate", "out of spec", "monitoring"]
            },
            // Temperature references
            {
                title: "Margin Threshold Standards",
                description: "Defines supply chain optimization and inventory targets.",
                url: "#/documents/temp-control-standards",
                type: "Standard",
                date: "Nov 2024",
                version: "4.0",
                keywords: ["temperature", "range", "specification"]
            },
            {
                title: "Supply Chain Best Practices",
                description: "Industry best practices for improving manufacturing yield.",
                url: "#/documents/thermal-mgmt-practices",
                type: "Best Practice Guide",
                date: "Oct 2024",
                keywords: ["temperature", "thermal"]
            },
            // Pressure references
            {
                title: "Yield Variance Tolerances - Line-Specific",
                description: "Detailed variance tolerances for each production line, including baseline pressures and acceptable deviation ranges.",
                url: "#/documents/pressure-variance-specs",
                type: "Technical Specification",
                date: "Jan 2025",
                version: "1.5",
                keywords: ["pressure", "variance", "line"]
            },
            // Validation references
            {
                title: "Data Validation Framework v2.0",
                description: "Enterprise data validation framework defining validation rules, failure categorization, and remediation workflows.",
                url: "#/documents/validation-framework",
                type: "Framework Document",
                date: "Dec 2024",
                version: "2.0",
                keywords: ["validation", "failure", "framework"]
            },
            {
                title: "Quality Assurance Validation Procedures",
                description: "Step-by-step procedures for identifying, categorizing, and resolving validation failures across all data sources.",
                url: "#/documents/qa-validation-procedures",
                type: "Procedure",
                date: "Nov 2024",
                version: "3.1",
                keywords: ["validation", "failure", "quality"]
            },
            // Data quality references
            {
                title: "Data Quality Monitoring Standards",
                description: "Standards for sensor data quality including freshness requirements, connectivity monitoring, and calibration schedules.",
                url: "#/documents/data-quality-standards",
                type: "Standard",
                date: "Jan 2025",
                version: "2.3",
                keywords: ["data quality", "sensor", "monitoring"]
            },
            {
                title: "Sensor Calibration and Maintenance Log",
                description: "Historical calibration records and maintenance schedules for all sensor equipment across stations.",
                url: "#/documents/sensor-calibration-log",
                type: "Maintenance Log",
                date: "Updated Weekly",
                keywords: ["sensor", "calibration", "data quality"]
            },
            // Compliance references
            {
                title: "Regulatory Compliance Requirements - EPA",
                description: "Financial compliance reporting.",
                url: "#/documents/epa-compliance-reqs",
                type: "Regulatory Document",
                date: "2024",
                keywords: ["compliance", "specification", "regulatory"]
            },
            {
                title: "Industry Standard ISO 9001:2015 - Quality Management",
                description: "Quality standards for commercial data.",
                url: "#/documents/iso-9001-quality-mgmt",
                type: "ISO Standard",
                date: "2015",
                keywords: ["quality", "standard", "validation"]
            }
        ];

        // Filter references based on query keywords
        const relevantRefs = allReferences.filter(ref => {
            return ref.keywords.some(keyword => queryLower.includes(keyword));
        });

        // If we found relevant references, return them; otherwise return a default set
        if (relevantRefs.length > 0) {
            return relevantRefs.slice(0, 5); // Return up to 5 most relevant
        } else {
            // Return general validation references
            return allReferences.filter(ref =>
                ref.keywords.includes("validation") || ref.keywords.includes("quality")
            ).slice(0, 3);
        }
    }

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
        // setupQueryInterface(); // Removed in Animal Health
        // setupVisualizationPanel(); // Removed in Animal Health
        // setupValidationRules(); // Removed in Animal Health

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
        renderGoldenTableValidationRules();
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
        // Elements were removed from the HTML for the Animal Health version to simplify the view.
        // We handle any necessary logic setup here if added back later.
        console.log("Query interface simplified for this dashboard.");
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
            chartContainer.innerHTML = '<p class="text-secondary">Select a table to see visualization</p>';
            return;
        }
        chartContainer.innerHTML = `<canvas id="golden-chart"></canvas>`;
        const ctx = document.getElementById('golden-chart').getContext('2d');

        if (window.goldenChart instanceof Chart) {
            window.goldenChart.destroy();
        }

        const mockData = {
            labels: selectedGoldenTable.columns.map(c => c.name),
            datasets: [{
                label: `Data for ${selectedGoldenTable.name}`,
                data: selectedGoldenTable.columns.map(() => Math.random() * 100),
                backgroundColor: '#58A6FF',
            }]
        };

        window.goldenChart = new Chart(ctx, {
            type: type,
            data: mockData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#8B949E' } } },
                scales: {
                    y: { ticks: { color: '#8B949E' }, grid: { color: '#30363D' } },
                    x: { ticks: { color: '#8B949E' }, grid: { color: '#30363D' } }
                }
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

    function renderGoldenTableValidationRules() {
        const container = document.getElementById('golden-validation-rules-container');
        if (!selectedGoldenTable || !container) {
            return;
        }

        const rules = selectedGoldenTable.validationRules;
        const headers = Object.keys(rules[0]);

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${h.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rules.map(rule => `
                        <tr>
                            ${headers.map(h => `<td>${rule[h]}</td>`).join('')}
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

        const newTab = document.createElement('button');
        newTab.className = 'tabs-trigger';
        newTab.dataset.tab = tabId;
        newTab.textContent = tabName;
        tabsList.appendChild(newTab);

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
                <div class="card text-center"><div class="card-content"><h3 class="text-lg font-medium">Anomaly Score</h3><p class="text-3xl font-bold" style="color:var(--danger)">7.8</p><p class="text-sm text-secondary">ML Driven KPI</p></div></div>
                <div class="card text-center"><div class="card-content"><h3 class="text-lg font-medium">Data Quality</h3><p class="text-3xl font-bold" style="color:var(--success)">98%</p><p class="text-sm text-secondary">ML Driven KPI</p></div></div>
                <div class="card text-center"><div class="card-content"><h3 class="text-lg font-medium">Projected Risk</h3><p class="text-3xl font-bold" style="color:var(--warning)">Medium</p><p class="text-sm text-secondary">ML Driven KPI</p></div></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="card"><div class="card-header"><h3 class="card-title">Time Series with Outliers</h3></div><div class="card-content"><canvas id="chart1-${tabId}"></canvas></div></div>
                <div class="card"><div class="card-header"><h3 class="card-title">Distribution</h3></div><div class="card-content"><canvas id="chart2-${tabId}"></canvas></div></div>
                <div class="card"><div class="card-header"><h3 class="card-title">Correlation Matrix</h3></div><div class="card-content"><canvas id="chart3-${tabId}"></canvas></div></div>
                <div class="card"><div class="card-header"><h3 class="card-title">Category Breakdown</h3></div><div class="card-content"><canvas id="chart4-${tabId}"></canvas></div></div>
            </div>
        `;
        document.querySelector('.tabs-container').appendChild(newTabContent);
        newTab.click();
        renderDashboardCharts(tabId);
    }

    function renderDashboardCharts(tabId) {
        const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8B949E' } } }, scales: { y: { ticks: { color: '#8B949E' }, grid: { color: '#30363D' } }, x: { ticks: { color: '#8B949E' }, grid: { color: '#30363D' } } } };
        const chartColors = {
            primary: '#58A6FF',
            danger: '#F85149',
            category: ['#a5b4fc', '#c7d2fe', '#e0e7ff']
        };

        new Chart(document.getElementById(`chart1-${tabId}`).getContext('2d'), {
            type: 'line',
            data: { labels: Array.from({ length: 10 }, (_, i) => `Point ${i + 1}`), datasets: [{ label: 'Value', data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)), borderColor: chartColors.primary }, { label: 'ML Outliers', data: [null, 85, null, null, 20, null, 95, null, null, null], backgroundColor: chartColors.danger, pointRadius: 5, type: 'scatter' }] },
            options: chartOptions
        });

        new Chart(document.getElementById(`chart2-${tabId}`).getContext('2d'), {
            type: 'bar',
            data: { labels: ['<20', '20-40', '40-60', '60-80', '>80'], datasets: [{ label: 'Distribution', data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)), backgroundColor: 'rgba(88, 166, 255, 0.5)' }] },
            options: chartOptions
        });

        const chart3Ctx = document.getElementById(`chart3-${tabId}`).getContext('2d');
        chart3Ctx.fillStyle = '#161B22';
        chart3Ctx.fillRect(0, 0, 300, 200);
        chart3Ctx.fillStyle = '#8B949E';
        chart3Ctx.font = '16px Inter, sans-serif';
        chart3Ctx.fillText('Mock Correlation Matrix', 50, 100);

        new Chart(document.getElementById(`chart4-${tabId}`).getContext('2d'), {
            type: 'doughnut',
            data: { labels: ['Category A', 'Category B', 'Category C'], datasets: [{ data: [30, 50, 20], backgroundColor: chartColors.category }] },
            options: { ...chartOptions, plugins: { legend: { position: 'top', labels: { color: '#8B949E' } } } }
        });
    }

    // Render Overview Charts for the new Splashpage
    function renderOverviewCharts() {
        const revCtx = document.getElementById('overview-chart-revenue');
        if (revCtx) {
            new Chart(revCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['NA', 'EU', 'APAC', 'LATAM'],
                    datasets: [
                        { label: 'Companion Animal', data: [850, 420, 180, 90], backgroundColor: '#3b82f6' },
                        { label: 'Livestock', data: [320, 290, 150, 110], backgroundColor: '#8b5cf6' }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { stacked: true, grid: { color: '#f3f4f6' } },
                        x: { stacked: true, grid: { display: false } }
                    }
                }
            });
        }

        const supplyCtx = document.getElementById('overview-chart-supply');
        if (supplyCtx) {
            new Chart(supplyCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        { label: 'Demand Forecast', data: [100, 105, 110, 108, 115, 120], borderColor: '#10b981', tension: 0.3 },
                        { label: 'Inventory Level', data: [110, 108, 105, 95, 98, 90], borderColor: '#f59e0b', tension: 0.3, fill: true, backgroundColor: 'rgba(245, 158, 11, 0.1)' }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { grid: { color: '#f3f4f6' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        const yieldCtx = document.getElementById('mini-chart-yield');
        if (yieldCtx) {
            new Chart(yieldCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['1', '2', '3', '4', '5', '6', '7'],
                    datasets: [{ data: [96, 95.5, 95, 96, 94.8, 93, 94.2], borderColor: '#ef4444', borderWidth: 2, tension: 0.3, pointRadius: 0 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    scales: { x: { display: false }, y: { display: false, min: 90, max: 100 } }
                }
            });
        }
    }

    // Initialize overview charts after a slight delay
    setTimeout(renderOverviewCharts, 200);

});