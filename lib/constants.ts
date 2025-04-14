export const DEFAULT_SCORE_OPTIONS = [
  { value: 1, label: "Very Poor" },
  { value: 2, label: "Poor" },
  { value: 3, label: "Fair" },
  { value: 4, label: "Good" },
  { value: 5, label: "Very Good" },
  { value: 6, label: "Excellent" },
  { value: 7, label: "Outstanding" },
  { value: 8, label: "Transformative" },
  { value: 9, label: "World-Class" },
  { value: 10, label: "Exceptional" },
]

export const DOMAIN_QUESTIONS: { [key: string]: any[] } = {
  leadership_for_impact: [
    { id: "li_1", question: "Does the organization have clear leadership for impact?" },
    { id: "li_2", question: "Is impact a priority for the leadership team?" },
    { id: "li_3", question: "Does the leadership team regularly review impact data?" },
    { id: "li_4", question: "Is there a dedicated role for impact measurement?" },
    { id: "li_5", question: "Does the organization have an impact committee or working group?" },
    { id: "li_6", question: "Is impact integrated into strategic planning?" },
  ],
  measurement_framework: [
    { id: "mf_1", question: "Does the organization have a clear impact measurement framework?" },
    { id: "mf_2", question: "Is the framework aligned with industry standards?" },
    { id: "mf_3", question: "Does the framework include both quantitative and qualitative measures?" },
    { id: "mf_4", question: "Is the framework regularly reviewed and updated?" },
    { id: "mf_5", question: "Does the framework include outcome and impact metrics?" },
    { id: "mf_6", question: "Is the framework used consistently across programs?" },
    { id: "mf_7", question: "Does the framework include indicators for all key outcomes?" },
  ],
  purpose_alignment: [{ id: "pa_1", question: "Is the organization's purpose clearly defined?" }],
  purpose_statement: [
    { id: "ps_1", question: "Does the organization have a clear purpose statement?" },
    { id: "ps_2", question: "Is the purpose statement aligned with impact goals?" },
    { id: "ps_3", question: "Is the purpose statement communicated to all stakeholders?" },
    { id: "ps_4", question: "Does the purpose statement guide decision-making?" },
    { id: "ps_5", question: "Is the purpose statement regularly reviewed?" },
  ],
  status_of_data: [
    { id: "sd_1", question: "Does the organization regularly collect impact data?" },
    { id: "sd_2", question: "Is the data collection process standardized?" },
    { id: "sd_3", question: "Is the data stored securely and accessibly?" },
    { id: "sd_4", question: "Is the data quality regularly assessed?" },
    { id: "sd_5", question: "Is the data analyzed regularly?" },
    { id: "sd_6", question: "Are insights from data used to improve programs?" },
    { id: "sd_7", question: "Is impact data shared with stakeholders?" },
    { id: "sd_8", question: "Is there a data management policy in place?" },
  ],
  systems_capabilities: [
    { id: "sc_1", question: "Does the organization have appropriate systems for impact measurement?" },
    { id: "sc_2", question: "Do staff have the necessary skills for impact measurement?" },
    { id: "sc_3", question: "Is there adequate budget for impact measurement?" },
    { id: "sc_4", question: "Are there clear processes for impact measurement?" },
    { id: "sc_5", question: "Is there a culture of learning and improvement?" },
  ],
  theory_of_change: [
    { id: "toc_1", question: "Does the organization have a clear theory of change?" },
    { id: "toc_2", question: "Is the theory of change evidence-based?" },
    { id: "toc_3", question: "Is the theory of change regularly reviewed?" },
    { id: "toc_4", question: "Does the theory of change guide program design?" },
    { id: "toc_5", question: "Is the theory of change communicated to stakeholders?" },
  ],
}

export const getScoreBackgroundColor = (score: number): string => {
  if (score >= 8) return "rgba(50, 205, 50, 0.1)" // LimeGreen
  if (score >= 6) return "rgba(173, 255, 47, 0.1)" // GreenYellow
  if (score >= 4) return "rgba(255, 215, 0, 0.1)" // Gold
  return "rgba(255, 0, 0, 0.1)" // Red
}

export const getScoreColor = (score: number): string => {
  if (score >= 8) return "text-green-600"
  if (score >= 6) return "text-lime-600"
  if (score >= 4) return "text-yellow-600"
  return "text-red-600"
}

export const ASSESSMENT_DOMAINS = [
  {
    id: "leadership_for_impact",
    name: "Leadership for Impact",
    description: "How leadership prioritizes and drives impact measurement and management.",
    questions: DOMAIN_QUESTIONS.leadership_for_impact,
    questionCount: DOMAIN_QUESTIONS.leadership_for_impact.length,
    icon: "Target",
  },
  {
    id: "theory_of_change",
    name: "Theory of Change",
    description: "Articulating the causal pathways through which activities lead to outcomes.",
    questions: DOMAIN_QUESTIONS.theory_of_change,
    questionCount: DOMAIN_QUESTIONS.theory_of_change.length,
    icon: "FileText",
  },
  {
    id: "purpose_statement",
    name: "Purpose Statement",
    description: "Clarity and alignment of organizational purpose with impact goals.",
    questions: DOMAIN_QUESTIONS.purpose_statement,
    questionCount: DOMAIN_QUESTIONS.purpose_statement.length,
    icon: "Users",
  },
  {
    id: "purpose_alignment",
    name: "Purpose Alignment",
    description: "How well the organization's activities align with its stated purpose.",
    questions: DOMAIN_QUESTIONS.purpose_alignment,
    questionCount: DOMAIN_QUESTIONS.purpose_alignment.length,
    icon: "GitBranch",
  },
  {
    id: "measurement_framework",
    name: "Measurement Framework",
    description: "Systematic approach to measuring and managing impact.",
    questions: DOMAIN_QUESTIONS.measurement_framework,
    questionCount: DOMAIN_QUESTIONS.measurement_framework.length,
    icon: "BarChart",
  },
  {
    id: "status_of_data",
    name: "Status of Data",
    description: "Quality, accessibility, and use of impact data.",
    questions: DOMAIN_QUESTIONS.status_of_data,
    questionCount: DOMAIN_QUESTIONS.status_of_data.length,
    icon: "Database",
  },
  {
    id: "systems_capabilities",
    name: "Systems Capabilities",
    description: "Organizational capacity and resources for effective impact measurement.",
    questions: DOMAIN_QUESTIONS.systems_capabilities,
    questionCount: DOMAIN_QUESTIONS.systems_capabilities.length,
    icon: "Settings",
  },
]
