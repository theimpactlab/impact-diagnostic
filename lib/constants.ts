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
  Target: [
    { id: "t_1", question: "Does the organization have a clear target population?" },
    { id: "t_2", question: "Does the organization have a clear understanding of the needs of the target population?" },
  ],
  FileText: [
    { id: "ft_1", question: "Does the organization have a clear theory of change?" },
    { id: "ft_2", question: "Does the organization have a clear logic model?" },
  ],
  Users: [
    { id: "u_1", question: "Does the organization have a clear understanding of its stakeholders?" },
    { id: "u_2", question: "Does the organization engage stakeholders in its work?" },
  ],
  GitBranch: [
    { id: "gb_1", question: "Does the organization have a clear impact measurement framework?" },
    { id: "gb_2", question: "Does the organization have a clear data collection plan?" },
  ],
  BarChart: [
    { id: "bc_1", question: "Does the organization regularly collect data on its impact?" },
    { id: "bc_2", question: "Does the organization regularly analyze data on its impact?" },
  ],
  Database: [
    { id: "db_1", question: "Does the organization have a clear data management system?" },
    { id: "db_2", question: "Does the organization have a clear data quality control process?" },
  ],
  Settings: [
    { id: "s_1", question: "Does the organization have a clear process for using data to improve its work?" },
    { id: "s_2", question: "Does the organization have a clear process for communicating its impact to stakeholders?" },
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

export const DOMAINS = [
  {
    id: "Target",
    name: "Target Population",
    description: "Understanding and meeting the needs of the intended beneficiaries.",
    questions: DOMAIN_QUESTIONS["Target"],
  },
  {
    id: "FileText",
    name: "Theory of Change",
    description: "Articulating the causal pathways through which activities lead to outcomes.",
    questions: DOMAIN_QUESTIONS["FileText"],
  },
  {
    id: "Users",
    name: "Stakeholder Engagement",
    description: "Involving stakeholders in the design, implementation, and evaluation of programs.",
    questions: DOMAIN_QUESTIONS["Users"],
  },
  {
    id: "GitBranch",
    name: "Impact Measurement Framework",
    description: "Establishing a systematic approach to measuring and managing impact.",
    questions: DOMAIN_QUESTIONS["GitBranch"],
  },
  {
    id: "BarChart",
    name: "Data Collection & Analysis",
    description: "Gathering and interpreting data to inform decision-making.",
    questions: DOMAIN_QUESTIONS["BarChart"],
  },
  {
    id: "Database",
    name: "Data Management",
    description: "Ensuring the quality, security, and accessibility of data.",
    questions: DOMAIN_QUESTIONS["Database"],
  },
  {
    id: "Settings",
    name: "Systems Capabilities",
    description: "Building organizational capacity for effective impact measurement.",
    questions: DOMAIN_QUESTIONS["Settings"],
  },
]
