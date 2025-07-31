document.addEventListener('DOMContentLoaded', function () {
    // Alerts Drawer
    const alertsButton = document.getElementById('alerts-button');
    const alertsDrawer = document.getElementById('alerts-drawer');
    const drawerCloseButton = document.getElementById('drawer-close');

    if (alertsButton && alertsDrawer && drawerCloseButton) {
        alertsButton.addEventListener('click', () => {
            alertsDrawer.classList.add('open');
        });

        drawerCloseButton.addEventListener('click', () => {
            alertsDrawer.classList.remove('open');
        });
    }

    // Care Coordinator Dashboard
    const successRateChartCanvas = document.getElementById('successRateChart');
    if (successRateChartCanvas) {
        const ctx = successRateChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                datasets: [{
                    label: 'Success Rate',
                    data: [65, 59, 80, 81, 56, 55],
                    fill: false,
                    borderColor: 'rgb(59, 130, 246)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Medical Management & Actuarial/Financial Dashboards
    const riskStratificationChartCanvas = document.getElementById('riskStratificationChart');
    if (riskStratificationChartCanvas) {
        const ctx = riskStratificationChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Low', 'Medium', 'High'],
                datasets: [{
                    label: 'Number of Members',
                    data: [1200, 650, 350],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    const adherencePatternChartCanvas = document.getElementById('adherencePatternChart');
    if (adherencePatternChartCanvas) {
        const ctx = adherencePatternChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Adherence Rate',
                    data: [82, 84, 85, 83, 86, 88, 90, 91, 89, 92, 93, 94],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 70,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    const patientRiskDrilldownChartCanvas = document.getElementById('patientRiskDrilldownChart');
    if (patientRiskDrilldownChartCanvas) {
        const riskFilter = document.getElementById('risk-filter');
        const patientData = {
            high: {
                labels: ['PAT123', 'PAT456', 'PAT789'],
                data: [92, 88, 85]
            },
            medium: {
                labels: ['PAT234', 'PAT567', 'PAT890'],
                data: [72, 68, 65]
            },
            low: {
                labels: ['PAT345', 'PAT678', 'PAT901'],
                data: [32, 28, 25]
            }
        };

        let chart;

        function updateChart() {
            const riskLevel = riskFilter.value;
            if (chart) {
                chart.data.labels = patientData[riskLevel].labels;
                chart.data.datasets[0].data = patientData[riskLevel].data;
                chart.update();
            } else {
                const ctx = patientRiskDrilldownChartCanvas.getContext('2d');
                chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: patientData[riskLevel].labels,
                        datasets: [{
                            label: 'Risk Score',
                            data: patientData[riskLevel].data,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
            }
        }

        riskFilter.addEventListener('change', updateChart);
        updateChart();
    }

    // Provider Relations Dashboard
    const prescriptionPatternsChartCanvas = document.getElementById('prescriptionPatternsChart');
    if (prescriptionPatternsChartCanvas) {
        const ctx = prescriptionPatternsChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Primary Care', 'Cardiology', 'Endocrinology', 'Geriatrics'],
                datasets: [{
                    label: 'Prescriptions',
                    data: [300, 150, 120, 90],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    }

    const adoptionRateChartCanvas = document.getElementById('adoptionRateChart');
    if (adoptionRateChartCanvas) {
        const ctx = adoptionRateChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                    label: 'Adoption Rate',
                    data: [15, 25, 40, 60],
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Actuarial/Financial Dashboard
    const costAvoidanceByRiskChartCanvas = document.getElementById('costAvoidanceByRiskChart');
    if (costAvoidanceByRiskChartCanvas) {
        const ctx = costAvoidanceByRiskChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                datasets: [{
                    label: 'Cost Avoidance ($)',
                    data: [100000, 400000, 700000],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    const populationHealthChartCanvas = document.getElementById('populationHealthChart');
    if (populationHealthChartCanvas) {
        const ctx = populationHealthChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Diabetes', 'Hypertension', 'Heart Disease'],
                datasets: [{
                    label: 'Adherence Improvement',
                    data: [30, 45, 25],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    }
});
