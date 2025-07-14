import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added AlertTitle
import { Progress } from '@/components/ui/progress';
import { Brain, Database, FileText, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

const RRRAnalysisWebApp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: '',
    businessUnit: '',
    estimatedCost: '', // Keep as string for input, parse when needed
    timeline: '',      // Keep as string for input, parse when needed
    proposedAction: '',
    mitigationCircumstances: '',
    expectedDowntime: '', // Keep as string for input, parse when needed
    improvementMetrics: '',
    // riskCategories was in original formData but unused in UI, removed for clarity.
    technicalRequirements: '',
    businessRequirements: '',
    historicalContext: ''
  });
  const [llmRecommendations, setLlmRecommendations] = useState([]);
  const [rrrScore, setRrrScore] = useState(null);
  const [loading, setLoading] = useState(false);

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
    { title: "Project Overview", icon: FileText },
    { title: "Risk Assessment", icon: AlertTriangle },
    { title: "LLM Analysis", icon: Brain },
    { title: "RRR Results", icon: TrendingUp }
  ];

  const generateLLMRecommendations = async () => {
    setLoading(true);
    // Simulate LLM processing with mock recommendations
    setTimeout(() => {
      const recommendations = [
        {
          category: "Equipment Risk Mitigation",
          suggestion: "Based on Station 47 DRA pump replacement, implement hot standby configuration to reduce downtime risk by 35%",
          confidence: 0.88,
          source: "Historical Pipeline Operations Data"
        },
        {
          category: "Operational Continuity",
          suggestion: "Schedule replacement during low-flow period (Tuesday 2-6 AM) to minimize throughput impact - reduces risk exposure by 28%",
          confidence: 0.92,
          source: "Flow Pattern Analysis"
        },
        {
          category: "Safety Protocol",
          suggestion: "Implement nitrogen purging procedure used in Station 23 overhaul - eliminated 2 high-risk scenarios",
          confidence: 0.85,
          source: "Safety Incident Database"
        },
        {
          category: "Cost Optimization",
          suggestion: "Pre-order critical gaskets and seals based on Station 31 lessons learned - avoids 15% cost overrun risk",
          confidence: 0.78,
          source: "Procurement Pattern Analysis"
        }
      ];

      setLlmRecommendations(recommendations);
      calculateRRRScore();
      setLoading(false);
    }, 2000);
  };

  const calculateRRRScore = () => {
    // Parse form data to numbers for calculation
    const estimatedCostNum = parseFloat(formData.estimatedCost) || 0;
    const expectedDowntimeNum = parseFloat(formData.expectedDowntime) || 0;

    // Mock RRR calculation based on form data and recommendations
    const baseScore = 0.7;
    const projectTypeBonus = formData.projectType === 'Equipment Replacement' ? 0.05 : 0.02;
    const costFactor = estimatedCostNum > 50000 ? -0.05 : 0.05;
    const downtimeFactor = expectedDowntimeNum > 6 ? -0.1 : 0.08;
    const mitigationBonus = formData.mitigationCircumstances ? 0.07 : 0;

    const finalScore = Math.max(0, Math.min(1, baseScore + projectTypeBonus + costFactor + downtimeFactor + mitigationBonus));
    setRrrScore(finalScore);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStep = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium mb-2">Project Name</label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label htmlFor="projectType" className="block text-sm font-medium mb-2">Project Type</label>
                <Select value={formData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
                  <SelectTrigger id="projectType">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equipment Replacement">Equipment Replacement</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Safety Upgrade">Safety Upgrade</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Emergency Repair">Emergency Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="businessUnit" className="block text-sm font-medium mb-2">Business Unit</label>
                <Select value={formData.businessUnit} onValueChange={(value) => handleInputChange('businessUnit', value)}>
                  <SelectTrigger id="businessUnit">
                    <SelectValue placeholder="Select business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pipeline Operations">Pipeline Operations</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Safety & Compliance">Safety & Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="estimatedCost" className="block text-sm font-medium mb-2">Estimated Cost ($)</label>
                <Input
                  id="estimatedCost"
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                  placeholder="Enter estimated cost"
                />
              </div>
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium mb-2">Timeline (weeks)</label>
              <Input
                id="timeline"
                type="number"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                placeholder="Enter timeline in weeks"
              />
            </div>

            <div>
              <label htmlFor="proposedAction" className="block text-sm font-medium mb-2">Proposed Action</label>
              <Textarea
                id="proposedAction"
                value={formData.proposedAction}
                onChange={(e) => handleInputChange('proposedAction', e.target.value)}
                placeholder="Describe the proposed pump replacement action (e.g., Replace DRA skid pump during scheduled maintenance window...)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="mitigationCircumstances" className="block text-sm font-medium mb-2">Mitigation Circumstances</label>
                <Textarea
                  id="mitigationCircumstances"
                  value={formData.mitigationCircumstances}
                  onChange={(e) => handleInputChange('mitigationCircumstances', e.target.value)}
                  placeholder="Describe risk mitigation measures (e.g., Hot standby pump available, bypass line operational...)"
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="expectedDowntime" className="block text-sm font-medium mb-2">Expected Downtime (hours)</label>
                <Input
                  id="expectedDowntime"
                  type="number"
                  step="0.1"
                  value={formData.expectedDowntime}
                  onChange={(e) => handleInputChange('expectedDowntime', e.target.value)}
                  placeholder="Enter expected downtime"
                />
              </div>
            </div>

            <div>
              <label htmlFor="improvementMetrics" className="block text-sm font-medium mb-2">Improvement Metrics</label>
              <Textarea
                id="improvementMetrics"
                value={formData.improvementMetrics}
                onChange={(e) => handleInputChange('improvementMetrics', e.target.value)}
                placeholder="Expected improvements (e.g., 15% efficiency increase, reduced vibration, extended MTBF...)"
                rows={2}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="technicalRequirements" className="block text-sm font-medium mb-2">Technical Requirements</label>
              <Textarea
                id="technicalRequirements"
                value={formData.technicalRequirements}
                onChange={(e) => handleInputChange('technicalRequirements', e.target.value)}
                placeholder="Describe technical requirements and constraints..."
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="businessRequirements" className="block text-sm font-medium mb-2">Business Requirements</label>
              <Textarea
                id="businessRequirements"
                value={formData.businessRequirements}
                onChange={(e) => handleInputChange('businessRequirements', e.target.value)}
                placeholder="Describe business requirements and objectives..."
                rows={4}
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">Historical Context</h3>
              <div className="grid grid-cols-1 gap-2">
                {mockHistoricalData.similarProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{project.name}</span>
                      <Badge variant="outline" className="ml-2">{project.type}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 text-right">
                      <div>RRR: {project.rrrScore} | Success: {project.successRate}%</div>
                      <div>Downtime: {project.downtime} | Cost: {project.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Brain className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-medium">AI Analysis in Progress</h3>
              <p className="text-gray-600">Processing your project data against historical patterns...</p>
            </div>

            {loading && ( // Progress bar only shows when loading
              <div className="space-y-2">
                <Progress value={50} className="mb-2" /> {/* Changed progress value to 50 */}
                <p className="text-sm text-gray-600">Analyzing structured BQ data...</p>
              </div>
            )}

            {!loading && llmRecommendations.length > 0 && ( // Recommendations show when loading is false and data is available
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  LLM Recommendations
                </h4>
                {llmRecommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{rec.category}</CardTitle>
                        <Badge variant="outline">
                          {Math.round(rec.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">{rec.suggestion}</p>
                      <p className="text-xs text-gray-500">Source: {rec.source}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">RRR Analysis Complete</h3>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {rrrScore ? (rrrScore * 100).toFixed(1) : 'N/A'}%
              </div>
              <p className="text-gray-600">Risk Reduction Ratio Score</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Project Viability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rrrScore && rrrScore > 0.7 ? 'High' : rrrScore && rrrScore > 0.5 ? 'Medium' : 'Low'}
                  </div>
                  <p className="text-sm text-gray-600">
                    {rrrScore && rrrScore > 0.7 ? 'Proceed with confidence' : 'Consider risk mitigation'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Comparable Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockHistoricalData.similarProjects.length}
                  </div>
                  <p className="text-sm text-gray-600">Similar historical projects analyzed</p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important Note</AlertTitle> {/* Added AlertTitle for better context */}
              <AlertDescription>
                This DRA pump replacement analysis is based on {mockHistoricalData.similarProjects.length} similar pipeline operations and current safety protocols. Final approval required from Pipeline Operations Manager.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Intelligent RRR Value Analysis</h1>
        <p className="text-gray-600">AI-powered risk reduction assessment for project planning</p>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="data">Data Sources</TabsTrigger>
          <TabsTrigger value="golden">Golden Tables</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>
                {currentStep === 0 && "Enter basic project information"}
                {currentStep === 1 && "Provide detailed requirements and risk factors"}
                {currentStep === 2 && "AI analysis of your project data"}
                {currentStep === 3 && "Final RRR score and recommendations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStep()}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => {
                  if (currentStep === 1) {
                    generateLLMRecommendations();
                  }
                  setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
                }}
                disabled={loading}
              >
                {currentStep === 1 ? 'Analyze with AI' : 'Next'}
              </Button>
            ) : (
              <Button onClick={() => {
                // Export/save functionality
                console.log('Exporting results...', { formData, llmRecommendations, rrrScore });
                // You might want to trigger a download or API call here.
              }}>
                Export Results
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Sources Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Structured Data (BigQuery)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>• Historical RRR reports</span>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        project_analytics.rrr_historical
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• Project success metrics</span>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        project_analytics.success_metrics
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• Cost and timeline data</span>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        project_analytics.cost_timeline
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• Risk outcome patterns</span>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        risk_management.outcome_patterns
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Unstructured Documents (SharePoint)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>• Technical specifications</span>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        /sites/Engineering/TechSpecs/
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• Business requirements</span>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        /sites/ProjectMgmt/BizReqs/
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• Post-mortem reports</span>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        /sites/PMO/PostMortems/
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• Stakeholder feedback</span>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        /sites/Feedback/Reviews/
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-medium mb-3">Recent SharePoint Documents</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <span className="font-medium">DRA_Skid_Pump_Spec_Station47_Rev3.pdf</span>
                        <div className="text-xs text-gray-500">Modified: 1 day ago | Size: 3.2MB</div>
                      </div>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        https://company.sharepoint.com/sites/PipelineEng/DRASpecs/DRA_Skid_Pump_Spec_Station47_Rev3.pdf
                      </a>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <span className="font-medium">Pump_Replacement_Procedure_v2.1.docx</span>
                        <div className="text-xs text-gray-500">Modified: 3 days ago | Size: 1.5MB</div>
                      </div>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        https://company.sharepoint.com/sites/Maintenance/PumpProcs/Pump_Replacement_Procedure_v2.1.docx
                      </a>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <span className="font-medium">Station23_Pump_Overhaul_PostMaint_Report.pdf</span>
                        <div className="text-xs text-gray-500">Modified: 2 weeks ago | Size: 2.8MB</div>
                      </div>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        https://company.sharepoint.com/sites/Operations/PostMaint/Station23_Pump_Overhaul_PostMaint_Report.pdf
                      </a>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <span className="font-medium">DRA_System_Safety_Protocol_2024.xlsx</span>
                        <div className="text-xs text-gray-500">Modified: 1 week ago | Size: 890KB</div>
                      </div>
                      <a href="#" className="text-blue-600 hover:underline text-xs">
                        https://company.sharepoint.com/sites/Safety/ComplianceDocs/DRA_System_Safety_Protocol_2024.xlsx
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  RAG system combines structured BQ data with document embeddings for contextual recommendations. Documents are automatically indexed from SharePoint with real-time updates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="golden" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Golden Tables & Knowledge Base</CardTitle>
              <CardDescription>Curated datasets for enterprise AI applications (BigQuery)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Project Patterns</h4>
                  <div className="text-sm space-y-1">
                    <div>Records: 1,247</div>
                    <div>Last Updated: Today</div>
                    <div>Quality Score: 94%</div>
                  </div>
                  <a href="#" className="text-blue-600 hover:underline text-xs">
                    golden_tables.project_patterns
                  </a>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Risk Taxonomies</h4>
                  <div className="text-sm space-y-1">
                    <div>Categories: 23</div>
                    <div>Sub-categories: 156</div>
                    <div>Validation: Complete</div>
                  </div>
                  <a href="#" className="text-blue-600 hover:underline text-xs">
                    golden_tables.risk_taxonomies
                  </a>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Success Metrics</h4>
                  <div className="text-sm space-y-1">
                    <div>KPIs: 45</div>
                    <div>Benchmarks: 12</div>
                    <div>Trends: Analyzed</div>
                  </div>
                  <a href="#" className="text-blue-600 hover:underline text-xs">
                    golden_tables.success_metrics
                  </a>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-3">Query Interface</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dateRange" className="block text-sm font-medium mb-1">Date Range</label>
                      <Select defaultValue="last_6_months">
                        <SelectTrigger id="dateRange">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last_month">Last Month</SelectItem>
                          <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                          <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                          <SelectItem value="last_year">Last Year</SelectItem>
                          <SelectItem value="all_time">All Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="projectTypeFilter" className="block text-sm font-medium mb-1">Project Type</label>
                      <Select defaultValue="all">
                        <SelectTrigger id="projectTypeFilter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="process">Process</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    Execute Query
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-white border rounded">
                <h4 className="font-medium mb-3">Sample Query Results</h4>
                <div className="text-xs bg-gray-900 text-green-400 p-3 rounded font-mono">
                  <div>SELECT project_type, AVG(rrr_score) as avg_rrr, COUNT(*) as project_count</div>
                  <div>FROM `company-bq.golden_tables.project_patterns`</div>
                  <div>WHERE created_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)</div>
                  <div>GROUP BY project_type</div>
                  <div>ORDER BY avg_rrr DESC;</div>
                </div>
                <div className="mt-3 text-sm">
                  <div className="grid grid-cols-4 gap-2 font-medium border-b pb-2">
                    <div>Project Type</div>
                    <div>Avg RRR Score</div>
                    <div>Project Count</div>
                    <div>Success Rate</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 py-1">
                    <div>Infrastructure</div>
                    <div>0.78</div>
                    <div>42</div>
                    <div>85%</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 py-1 bg-gray-50">
                    <div>Product</div>
                    <div>0.71</div>
                    <div>38</div>
                    <div>72%</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 py-1">
                    <div>Process</div>
                    <div>0.69</div>
                    <div>23</div>
                    <div>78%</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 py-1 bg-gray-50">
                    <div>Compliance</div>
                    <div>0.82</div>
                    <div>18</div>
                    <div>89%</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded">
                <h4 className="font-medium mb-2">BigQuery Connection Details</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Project ID:</strong> company-bq-analytics</div>
                  <div><strong>Dataset:</strong> golden_tables</div>
                  <div><strong>Service Account:</strong> rrr-analysis-service@company-bq.iam.gserviceaccount.com</div>
                  <div><strong>Last Sync:</strong> 2 hours ago</div>
                </div>
                <p className="text-sm mt-2">
                  These golden tables power advanced analytics, predictive modeling, and automated decision support across the enterprise.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RRRAnalysisWebApp;