document.addEventListener('DOMContentLoaded', () => {
    // State variables
    let currentBlendData = null;
    let blendChart = null;
    let rvpTrendChart = null;
    let customLimits = {
        minRVP: 7.0,
        maxRVP: 15.0,
        maxButanePct: 20,
        safetyMargin: 0.5
    };

    // DOM Elements
    const baseRVPInput = document.getElementById('base-rvp');
    const baseVolumeInput = document.getElementById('base-volume');
    const butaneRVPInput = document.getElementById('butane-rvp');
    const butaneVolumeInput = document.getElementById('butane-volume');
    const targetRVPInput = document.getElementById('target-rvp');
    const calculateBlendBtn = document.getElementById('calculate-blend-btn');
    const optimizeBlendBtn = document.getElementById('optimize-blend-btn');
    const blendResultsCard = document.getElementById('blend-results-card');
    const blendResultsContent = document.getElementById('blend-results-content');
    const blendResultsDescription = document.getElementById('blend-results-description');
    const blendChartCard = document.getElementById('blend-chart-card');
    const aiRecommendationsContainer = document.getElementById('ai-recommendations-container');
    const insightsActionButtons = document.getElementById('insights-action-buttons');
    const alertDrawer = document.getElementById('alert-drawer');
    const alertDrawerClose = document.getElementById('alert-drawer-close');
    const alertCancelBtn = document.getElementById('alert-cancel-btn');
    const bottomDrawer = document.getElementById('bottom-drawer');
    const bottomDrawerClose = document.getElementById('bottom-drawer-close');
    const bottomDrawerExport = document.getElementById('bottom-drawer-export');

    // Tabs functionality
    const tabsList = document.querySelector('.tabs-list');
    const tabsContent = {
        blending: document.getElementById('blending-tab'),
        insights: document.getElementById('insights-tab'),
        specifications: document.getElementById('specifications-tab')
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

    // Season specification setter
    window.setSeasonSpec = function(season) {
        document.querySelectorAll('#season-winter, #season-summer, #season-custom').forEach(btn => {
            btn.classList.remove('active');
        });

        if (season === 'winter') {
            targetRVPInput.value = '13.5';
            document.getElementById('season-winter').classList.add('active');
        } else if (season === 'summer') {
            targetRVPInput.value = '7.8';
            document.getElementById('season-summer').classList.add('active');
        } else {
            document.getElementById('season-custom').classList.add('active');
        }
    };

    // Calculate RVP using linear blending approximation
    function calculateBlendRVP(baseRVP, baseVolume, butaneRVP, butaneVolume) {
        const totalVolume = parseFloat(baseVolume) + parseFloat(butaneVolume);
        const baseFraction = parseFloat(baseVolume) / totalVolume;
        const butaneFraction = parseFloat(butaneVolume) / totalVolume;

        // Linear blending (approximation)
        const linearRVP = (baseRVP * baseFraction) + (butaneRVP * butaneFraction);

        // Apply correction factor for non-linear behavior at high butane percentages
        // This is a simplified correction - real-world would use vapor-liquid equilibrium data
        const butanePercent = butaneFraction * 100;
        let correctionFactor = 1.0;

        if (butanePercent > 10) {
            // Non-linearity increases with butane percentage
            correctionFactor = 1.0 + (butanePercent - 10) * 0.005;
        }

        return linearRVP * correctionFactor;
    }

    // Optimize butane volume to hit target RVP
    function optimizeButaneVolume(baseRVP, baseVolume, butaneRVP, targetRVP) {
        // Using iterative approach to account for non-linear correction
        let butaneVolume = 0;
        let calculatedRVP = baseRVP;
        let step = 100; // Start with 100 BBL steps
        let tolerance = 0.05; // 0.05 psi tolerance
        let maxIterations = 1000;
        let iteration = 0;

        while (Math.abs(calculatedRVP - targetRVP) > tolerance && iteration < maxIterations) {
            if (calculatedRVP < targetRVP) {
                butaneVolume += step;
            } else {
                butaneVolume -= step;
                step = step / 2; // Reduce step size
            }

            calculatedRVP = calculateBlendRVP(baseRVP, baseVolume, butaneRVP, butaneVolume);
            iteration++;
        }

        return Math.max(0, butaneVolume);
    }

    // Calculate blend button handler
    calculateBlendBtn.addEventListener('click', () => {
        const baseRVP = parseFloat(baseRVPInput.value);
        const baseVolume = parseFloat(baseVolumeInput.value);
        const butaneRVP = parseFloat(butaneRVPInput.value);
        const butaneVolume = parseFloat(butaneVolumeInput.value);

        if (isNaN(baseRVP) || isNaN(baseVolume) || isNaN(butaneRVP) || isNaN(butaneVolume)) {
            alert('Please fill in all fields with valid numbers');
            return;
        }

        if (baseVolume <= 0 || butaneVolume < 0) {
            alert('Volumes must be positive numbers');
            return;
        }

        const totalVolume = baseVolume + butaneVolume;
        const butanePercent = (butaneVolume / totalVolume) * 100;
        const blendedRVP = calculateBlendRVP(baseRVP, baseVolume, butaneRVP, butaneVolume);

        currentBlendData = {
            baseRVP,
            baseVolume,
            butaneRVP,
            butaneVolume,
            totalVolume,
            butanePercent,
            blendedRVP,
            targetRVP: parseFloat(targetRVPInput.value) || null,
            timestamp: new Date()
        };

        displayBlendResults();
        generateAIRecommendations();
        updateBlendChart();
    });

    // Optimize blend button handler
    optimizeBlendBtn.addEventListener('click', () => {
        const baseRVP = parseFloat(baseRVPInput.value);
        const baseVolume = parseFloat(baseVolumeInput.value);
        const butaneRVP = parseFloat(butaneRVPInput.value);
        const targetRVP = parseFloat(targetRVPInput.value);

        if (isNaN(baseRVP) || isNaN(baseVolume) || isNaN(butaneRVP) || isNaN(targetRVP)) {
            alert('Please fill in base RVP, base volume, butane RVP, and target RVP');
            return;
        }

        if (baseRVP >= targetRVP) {
            alert('Target RVP must be higher than base RVP. Cannot optimize with butane (which increases RVP).');
            return;
        }

        if (butaneRVP <= targetRVP) {
            alert('Butane RVP must be higher than target RVP for effective blending.');
            return;
        }

        const optimizedButaneVolume = optimizeButaneVolume(baseRVP, baseVolume, butaneRVP, targetRVP);
        butaneVolumeInput.value = optimizedButaneVolume.toFixed(2);

        // Automatically calculate with optimized value
        setTimeout(() => {
            calculateBlendBtn.click();
        }, 100);
    });

    // Display blend results
    function displayBlendResults() {
        if (!currentBlendData) return;

        const { baseRVP, baseVolume, butaneRVP, butaneVolume, totalVolume, butanePercent, blendedRVP, targetRVP } = currentBlendData;

        // Determine compliance status
        let complianceStatus = '';
        let complianceColor = '';

        if (targetRVP) {
            const deviation = Math.abs(blendedRVP - targetRVP);
            if (deviation <= 0.2) {
                complianceStatus = 'On Target';
                complianceColor = 'var(--success)';
            } else if (deviation <= 0.5) {
                complianceStatus = 'Within Tolerance';
                complianceColor = 'var(--warning)';
            } else {
                complianceStatus = 'Off Target';
                complianceColor = 'var(--danger)';
            }
        }

        // Check operational limits
        const butaneWarning = butanePercent > customLimits.maxButanePct;
        const rvpWarning = blendedRVP > customLimits.maxRVP || blendedRVP < customLimits.minRVP;

        blendResultsDescription.textContent = `Blend calculated at ${new Date().toLocaleTimeString()}`;

        blendResultsContent.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded" style="background-color: var(--background); border: 1px solid var(--border);">
                    <div class="text-sm text-secondary mb-1">Blended RVP</div>
                    <div class="text-2xl font-bold" style="color: ${complianceColor || 'var(--primary)'}">
                        ${blendedRVP.toFixed(2)} psi
                    </div>
                    ${targetRVP ? `<div class="text-sm mt-1" style="color: ${complianceColor}">${complianceStatus}</div>` : ''}
                </div>

                <div class="p-4 rounded" style="background-color: var(--background); border: 1px solid var(--border);">
                    <div class="text-sm text-secondary mb-1">Total Volume</div>
                    <div class="text-2xl font-bold">${totalVolume.toLocaleString()} BBL</div>
                    <div class="text-sm mt-1 text-secondary">Pipeline blend</div>
                </div>

                <div class="p-4 rounded" style="background-color: var(--background); border: 1px solid var(--border);">
                    <div class="text-sm text-secondary mb-1">Base Gasoline</div>
                    <div class="text-xl font-semibold">${baseVolume.toLocaleString()} BBL (${((baseVolume/totalVolume)*100).toFixed(1)}%)</div>
                    <div class="text-sm mt-1 text-secondary">${baseRVP} psi RVP</div>
                </div>

                <div class="p-4 rounded" style="background-color: var(--background); border: 1px solid var(--border); ${butaneWarning ? 'border-color: var(--warning);' : ''}">
                    <div class="text-sm text-secondary mb-1">Butane</div>
                    <div class="text-xl font-semibold">${butaneVolume.toLocaleString()} BBL (${butanePercent.toFixed(1)}%)</div>
                    <div class="text-sm mt-1 text-secondary">${butaneRVP} psi RVP</div>
                    ${butaneWarning ? `<div class="text-sm mt-1" style="color: var(--warning)">⚠ Exceeds ${customLimits.maxButanePct}% limit</div>` : ''}
                </div>
            </div>

            ${targetRVP ? `
                <div class="mt-4 p-3 rounded" style="background-color: var(--background); border: 1px solid var(--border);">
                    <div class="text-sm font-medium mb-2">Target vs. Actual</div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm">Target RVP: <strong>${targetRVP.toFixed(2)} psi</strong></span>
                        <span class="text-sm">Actual RVP: <strong>${blendedRVP.toFixed(2)} psi</strong></span>
                        <span class="text-sm">Deviation: <strong style="color: ${complianceColor}">${(blendedRVP - targetRVP).toFixed(2)} psi</strong></span>
                    </div>
                </div>
            ` : ''}

            ${rvpWarning ? `
                <div class="alert mt-4">
                    <div class="alert-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div>
                        <strong>RVP Out of Range:</strong> Blended RVP (${blendedRVP.toFixed(2)} psi) is outside operational limits (${customLimits.minRVP} - ${customLimits.maxRVP} psi).
                    </div>
                </div>
            ` : ''}

            <div class="mt-4 flex gap-2">
                <button class="button primary flex-1" onclick="viewDetailedAnalytics()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    View Detailed Analytics
                </button>
                <button class="button outline" onclick="exportBlendData()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export CSV
                </button>
            </div>
        `;

        blendResultsCard.classList.remove('hidden');
        blendChartCard.classList.remove('hidden');
    }

    // Generate AI recommendations
    function generateAIRecommendations() {
        if (!currentBlendData) return;

        const { baseRVP, butanePercent, blendedRVP, targetRVP, totalVolume } = currentBlendData;

        const recommendations = [];

        // Economic optimization
        const butaneCost = 0.60; // $/gallon
        const baseGasolineCost = 0.90; // $/gallon
        const bblToGallon = 42;
        const savings = (baseGasolineCost - butaneCost) * (currentBlendData.butaneVolume * bblToGallon);

        recommendations.push({
            category: 'Economic',
            priority: 'high',
            title: 'Cost Optimization',
            description: `Current blend saves approximately $${savings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} compared to pure base gasoline.`,
            details: `Butane cost advantage: $${(baseGasolineCost - butaneCost).toFixed(2)}/gal. At ${butanePercent.toFixed(1)}% butane blend, you're maximizing value while maintaining spec.`,
            actionable: butanePercent < 12,
            action: butanePercent < 12 ? 'Consider increasing butane percentage to maximize cost savings while staying within specifications.' : null
        });

        // Compliance check
        if (targetRVP) {
            const deviation = Math.abs(blendedRVP - targetRVP);
            if (deviation > 0.5) {
                recommendations.push({
                    category: 'Compliance',
                    priority: 'critical',
                    title: 'RVP Out of Specification',
                    description: `Blended RVP (${blendedRVP.toFixed(2)} psi) deviates ${deviation.toFixed(2)} psi from target (${targetRVP.toFixed(2)} psi).`,
                    details: 'This blend may not meet regulatory requirements. Adjust butane ratio to bring RVP within acceptable range.',
                    actionable: true,
                    action: 'Use "Optimize for Target" button to automatically calculate correct butane volume.'
                });
            } else if (deviation <= 0.2) {
                recommendations.push({
                    category: 'Compliance',
                    priority: 'info',
                    title: 'On-Spec Blend',
                    description: `Excellent blend accuracy. RVP within 0.2 psi of target.`,
                    details: 'Current blend meets specification requirements with minimal deviation.',
                    actionable: false
                });
            }
        }

        // Seasonal considerations
        const month = new Date().getMonth();
        const isSummer = month >= 5 && month <= 8; // June-September
        const isWinter = month >= 10 || month <= 2; // Nov-Mar

        if (isSummer && blendedRVP > 9.5) {
            recommendations.push({
                category: 'Seasonal',
                priority: 'high',
                title: 'Summer RVP Caution',
                description: `Current blend RVP (${blendedRVP.toFixed(2)} psi) may exceed summer volatility limits in many regions.`,
                details: 'EPA summer RVP limits typically range from 7.8-9.0 psi depending on classification area. Verify local requirements.',
                actionable: true,
                action: 'Reduce butane content to achieve RVP ≤ 9.0 psi for summer compliance.'
            });
        }

        if (isWinter && blendedRVP < 11.0) {
            recommendations.push({
                category: 'Seasonal',
                priority: 'medium',
                title: 'Winter Volatility Optimization',
                description: `Winter blend can accommodate higher RVP (13.5-15.0 psi) for improved cold-start performance.`,
                details: 'Current blend is conservative. Increasing butane content can reduce costs and improve cold-weather driveability.',
                actionable: true,
                action: 'Consider increasing butane to target RVP of 13.0-13.5 psi for winter operations.'
            });
        }

        // Operational safety
        if (butanePercent > 15) {
            recommendations.push({
                category: 'Safety',
                priority: 'high',
                title: 'High Butane Content',
                description: `Butane content at ${butanePercent.toFixed(1)}% requires enhanced vapor management.`,
                details: 'High butane blends increase vapor pressure in storage tanks and transfer lines. Ensure vapor recovery systems are operating at full capacity.',
                actionable: true,
                action: 'Verify vapor recovery system capacity and tank pressure relief settings before blend execution.'
            });
        }

        // Quality considerations
        if (blendedRVP > 14.5) {
            recommendations.push({
                category: 'Quality',
                priority: 'medium',
                title: 'Vapor Lock Risk',
                description: `Very high RVP (${blendedRVP.toFixed(2)} psi) may cause vapor lock in vehicle fuel systems.`,
                details: 'While within winter specifications, extreme volatility can cause operational issues in warm microclimates or in vehicle fuel pumps.',
                actionable: true,
                action: 'Monitor customer complaints and consider 13.5 psi target for general distribution.'
            });
        }

        displayAIRecommendations(recommendations);
    }

    // Display AI recommendations
    function displayAIRecommendations(recommendations) {
        if (recommendations.length === 0) {
            aiRecommendationsContainer.innerHTML = '<p class="text-secondary text-center py-8">No specific recommendations at this time. Blend appears optimal.</p>';
            return;
        }

        insightsActionButtons.style.display = 'flex';

        const priorityColors = {
            critical: 'var(--danger)',
            high: 'var(--warning)',
            medium: 'var(--primary)',
            info: 'var(--success)'
        };

        const priorityIcons = {
            critical: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
            high: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
            medium: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
            info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
        };

        let html = '<div class="space-y-4">';

        recommendations.forEach((rec, index) => {
            const color = priorityColors[rec.priority] || 'var(--primary)';
            const icon = priorityIcons[rec.priority] || priorityIcons.info;

            html += `
                <div class="p-4 rounded" style="background-color: var(--background); border: 1px solid ${color};">
                    <div class="flex items-start gap-3">
                        <div style="color: ${color}; flex-shrink: 0;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                ${icon}
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <h4 class="font-semibold">${rec.title}</h4>
                                <span class="badge outline text-xs" style="color: ${color}; border-color: ${color};">${rec.category}</span>
                            </div>
                            <p class="text-sm mb-2">${rec.description}</p>
                            <p class="text-sm text-secondary mb-3">${rec.details}</p>
                            ${rec.actionable ? `
                                <div class="flex gap-2">
                                    <button class="button outline text-sm create-alert-btn" onclick="createRecommendationAlert(${index})">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M10.5 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4.5"/><path d="M16 2l5 5"/><path d="m12 12 9-9"/></svg>
                                        ${rec.action || 'Take Action'}
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';

        aiRecommendationsContainer.innerHTML = html;

        // Store recommendations for alert creation
        window.currentRecommendations = recommendations;
    }

    // Update blend chart
    function updateBlendChart() {
        if (!currentBlendData) return;

        const ctx = document.getElementById('blend-chart');
        if (!ctx) return;

        if (blendChart) {
            blendChart.destroy();
        }

        blendChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Base Gasoline', 'Butane'],
                datasets: [{
                    data: [currentBlendData.baseVolume, currentBlendData.butaneVolume],
                    backgroundColor: ['#58A6FF', '#3FB950'],
                    borderColor: ['#58A6FF', '#3FB950'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#C9D1D9',
                            font: {
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString()} BBL (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Initialize RVP trend chart
        initializeRVPTrendChart();
    }

    // Initialize RVP trend chart
    function initializeRVPTrendChart() {
        const ctx = document.getElementById('rvp-trend-chart');
        if (!ctx) return;

        if (rvpTrendChart) {
            rvpTrendChart.destroy();
        }

        // Generate mock historical data
        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
        const winterMonths = [0, 1, 2, 3, 4, 9, 10, 11]; // Oct-Mar
        const summerMonths = [5, 6, 7, 8]; // Apr-Sep

        const rvpData = months.map((month, index) => {
            if (winterMonths.includes(index)) {
                return 12.5 + Math.random() * 2; // Winter: 12.5-14.5
            } else {
                return 7.5 + Math.random() * 1.5; // Summer: 7.5-9.0
            }
        });

        const butaneData = months.map((month, index) => {
            if (winterMonths.includes(index)) {
                return 8 + Math.random() * 6; // Winter: 8-14%
            } else {
                return 2 + Math.random() * 3; // Summer: 2-5%
            }
        });

        rvpTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Blended RVP (psi)',
                        data: rvpData,
                        borderColor: '#79B8FF',
                        backgroundColor: 'rgba(121, 184, 255, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Butane Content (%)',
                        data: butaneData,
                        borderColor: '#4AC959',
                        backgroundColor: 'rgba(74, 201, 89, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'RVP (psi)',
                            color: '#C9D1D9'
                        },
                        ticks: {
                            color: '#8B949E'
                        },
                        grid: {
                            color: '#30363D'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Butane %',
                            color: '#C9D1D9'
                        },
                        ticks: {
                            color: '#8B949E'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        ticks: {
                            color: '#8B949E'
                        },
                        grid: {
                            color: '#30363D'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#C9D1D9',
                            font: {
                                family: 'Inter'
                            }
                        }
                    }
                }
            }
        });
    }

    // Quick scenario buttons
    document.querySelectorAll('[data-scenario]').forEach(btn => {
        btn.addEventListener('click', () => {
            const scenario = btn.dataset.scenario;

            // Set default values
            baseVolumeInput.value = '10000';
            butaneRVPInput.value = '52.0';

            switch(scenario) {
                case 'winter-max':
                    baseRVPInput.value = '8.0';
                    targetRVPInput.value = '15.0';
                    window.setSeasonSpec('custom');
                    break;
                case 'winter-standard':
                    baseRVPInput.value = '8.5';
                    targetRVPInput.value = '13.0';
                    window.setSeasonSpec('winter');
                    break;
                case 'summer-max':
                    baseRVPInput.value = '6.5';
                    targetRVPInput.value = '9.0';
                    window.setSeasonSpec('custom');
                    break;
                case 'summer-standard':
                    baseRVPInput.value = '6.0';
                    targetRVPInput.value = '7.8';
                    window.setSeasonSpec('summer');
                    break;
                case 'spring-fall':
                    baseRVPInput.value = '7.5';
                    targetRVPInput.value = '11.0';
                    window.setSeasonSpec('custom');
                    break;
            }

            // Auto-optimize
            setTimeout(() => {
                optimizeBlendBtn.click();
            }, 100);
        });
    });

    // Global functions for button handlers
    window.viewDetailedAnalytics = function() {
        if (!currentBlendData) return;

        const content = `
            <div class="space-y-4">
                <h3 class="font-semibold mb-2">Detailed Blend Analytics</h3>
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Value</th>
                                <th>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Base Gasoline Volume</td><td>${currentBlendData.baseVolume.toLocaleString()}</td><td>BBL</td></tr>
                            <tr><td>Base Gasoline RVP</td><td>${currentBlendData.baseRVP.toFixed(2)}</td><td>psi</td></tr>
                            <tr><td>Butane Volume</td><td>${currentBlendData.butaneVolume.toLocaleString()}</td><td>BBL</td></tr>
                            <tr><td>Butane RVP</td><td>${currentBlendData.butaneRVP.toFixed(2)}</td><td>psi</td></tr>
                            <tr><td>Total Blend Volume</td><td>${currentBlendData.totalVolume.toLocaleString()}</td><td>BBL</td></tr>
                            <tr><td>Butane Percentage</td><td>${currentBlendData.butanePercent.toFixed(2)}</td><td>% vol</td></tr>
                            <tr><td>Calculated Blend RVP</td><td>${currentBlendData.blendedRVP.toFixed(2)}</td><td>psi</td></tr>
                            <tr><td>Target RVP</td><td>${currentBlendData.targetRVP ? currentBlendData.targetRVP.toFixed(2) : 'N/A'}</td><td>psi</td></tr>
                            <tr><td>RVP Deviation</td><td>${currentBlendData.targetRVP ? (currentBlendData.blendedRVP - currentBlendData.targetRVP).toFixed(2) : 'N/A'}</td><td>psi</td></tr>
                            <tr><td>Base Gasoline (gallons)</td><td>${(currentBlendData.baseVolume * 42).toLocaleString()}</td><td>gal</td></tr>
                            <tr><td>Butane (gallons)</td><td>${(currentBlendData.butaneVolume * 42).toLocaleString()}</td><td>gal</td></tr>
                            <tr><td>Total (gallons)</td><td>${(currentBlendData.totalVolume * 42).toLocaleString()}</td><td>gal</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        openBottomDrawer('Detailed Blend Analytics', content, { filename: 'blend_analytics' });
    };

    window.exportBlendData = function() {
        if (!currentBlendData) return;

        const csv = [
            ['Parameter', 'Value', 'Unit'],
            ['Timestamp', currentBlendData.timestamp.toISOString(), ''],
            ['Base Gasoline Volume', currentBlendData.baseVolume, 'BBL'],
            ['Base Gasoline RVP', currentBlendData.baseRVP.toFixed(2), 'psi'],
            ['Butane Volume', currentBlendData.butaneVolume, 'BBL'],
            ['Butane RVP', currentBlendData.butaneRVP.toFixed(2), 'psi'],
            ['Total Volume', currentBlendData.totalVolume, 'BBL'],
            ['Butane Percentage', currentBlendData.butanePercent.toFixed(2), '% vol'],
            ['Blended RVP', currentBlendData.blendedRVP.toFixed(2), 'psi'],
            ['Target RVP', currentBlendData.targetRVP || 'N/A', 'psi']
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `blend_data_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    window.createRecommendationAlert = function(index) {
        if (!window.currentRecommendations || !window.currentRecommendations[index]) return;

        const rec = window.currentRecommendations[index];

        document.getElementById('alert-subject').value = `Action Required: ${rec.title}`;
        document.getElementById('alert-body').value = `${rec.description}\n\n${rec.details}\n\nRecommended Action:\n${rec.action || 'Review and address this recommendation.'}`;
        document.getElementById('alert-recipients').value = 'operations@company.com, blending@company.com';

        alertDrawer.classList.add('open');
    };

    // Communication type selector
    window.selectCommType = function(type) {
        document.getElementById('comm-email').classList.remove('active');
        document.getElementById('comm-chat').classList.remove('active');

        if (type === 'email') {
            document.getElementById('comm-email').classList.add('active');
        } else {
            document.getElementById('comm-chat').classList.add('active');
        }
    };

    // Alert drawer handlers
    alertDrawerClose.addEventListener('click', () => {
        alertDrawer.classList.remove('open');
    });

    alertCancelBtn.addEventListener('click', () => {
        alertDrawer.classList.remove('open');
    });

    document.getElementById('alert-submit-btn').addEventListener('click', () => {
        alert('Alert sent successfully! (This is a demo - no actual email was sent)');
        alertDrawer.classList.remove('open');
    });

    document.getElementById('alert-draft-btn').addEventListener('click', () => {
        alert('Draft saved to Outlook! (This is a demo)');
        alertDrawer.classList.remove('open');
    });

    // Bottom drawer functions
    function openBottomDrawer(title, content, exportData = null) {
        document.getElementById('bottom-drawer-title').textContent = title;
        document.getElementById('bottom-drawer-content').innerHTML = content;
        window.currentBottomDrawerData = exportData;
        bottomDrawer.classList.add('open');
    }

    bottomDrawerClose.addEventListener('click', () => {
        bottomDrawer.classList.remove('open');
    });

    bottomDrawerExport.addEventListener('click', () => {
        if (!window.currentBottomDrawerData) return;

        const table = document.querySelector('#bottom-drawer-content table');
        if (!table) return;

        let csv = [];
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const cols = row.querySelectorAll('td, th');
            const csvRow = [];

            cols.forEach(col => {
                let text = col.textContent.trim().replace(/\s+/g, ' ');
                if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                csvRow.push(text);
            });

            csv.push(csvRow.join(','));
        });

        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        const filename = `${window.currentBottomDrawerData.filename || 'analytics'}_${new Date().toISOString().split('T')[0]}.csv`;
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    });

    // Revise blend button
    document.getElementById('revise-blend-btn')?.addEventListener('click', () => {
        // Switch back to blending tab
        document.querySelectorAll('.tabs-trigger').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-tab="blending"]').classList.add('active');

        for (const key in tabsContent) {
            tabsContent[key].classList.add('hidden');
        }
        tabsContent['blending'].classList.remove('hidden');
    });

    // Save custom limits
    document.getElementById('save-custom-limits-btn')?.addEventListener('click', () => {
        customLimits.minRVP = parseFloat(document.getElementById('min-rvp-limit').value) || 7.0;
        customLimits.maxRVP = parseFloat(document.getElementById('max-rvp-limit').value) || 15.0;
        customLimits.maxButanePct = parseFloat(document.getElementById('max-butane-pct').value) || 20;
        customLimits.safetyMargin = parseFloat(document.getElementById('safety-margin').value) || 0.5;

        alert('Custom operational limits saved successfully!');
    });

    // Initialize RVP trend chart on page load
    initializeRVPTrendChart();
});
