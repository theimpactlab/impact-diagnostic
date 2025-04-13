export const ASSESSMENT_DOMAINS = [
  {
    id: "purpose_alignment",
    name: "Purpose Alignment",
    description: "How well the organization's purpose aligns with its social impact goals",
    questionCount: 1,
    icon: "Target",
  },
  {
    id: "purpose_statement",
    name: "Purpose Statement",
    description: "Clarity and effectiveness of the organization's purpose statement",
    questionCount: 5,
    icon: "FileText",
  },
  {
    id: "leadership_for_impact",
    name: "Leadership for Impact",
    description: "How leadership drives and supports social impact initiatives",
    questionCount: 6,
    icon: "Users",
  },
  {
    id: "theory_of_change",
    name: "Impact Focused Theory of Change",
    description: "Effectiveness of the organization's theory of change model",
    questionCount: 5,
    icon: "GitBranch",
  },
  {
    id: "measurement_framework",
    name: "Impact Measurement Framework",
    description: "Systems and processes for measuring social impact",
    questionCount: 7,
    icon: "BarChart",
  },
  {
    id: "status_of_data",
    name: "Status of Data",
    description: "Quality, accessibility, and utilization of impact data",
    questionCount: 8,
    icon: "Database",
  },
  {
    id: "systems_capabilities",
    name: "Systems Capabilities",
    description: "Technical infrastructure supporting impact measurement",
    questionCount: 5,
    icon: "Settings",
  },
  {
    id: "details",
    name: "Project Details",
    description: "Basic information about your project.",
    questionCount: 0,
  },
]

export const DOMAIN_QUESTIONS = {
  purpose_alignment: [
    {
      id: "pa_1",
      question: "What was your team's alignment to purpose score?",
      guidance: "Please use the overall alignment score",
      options: [
        { value: 0, label: "0" },
        { value: 1, label: "1-10" },
        { value: 2, label: "11-20" },
        { value: 3, label: "21-30" },
        { value: 4, label: "31-40" },
        { value: 5, label: "41-50" },
        { value: 6, label: "51-60" },
        { value: 7, label: "61-70" },
        { value: 8, label: "71-80" },
        { value: 9, label: "81-90" },
        { value: 10, label: "91-100" },
      ],
      inverted: false,
    },
  ],
  purpose_statement: [
    {
      id: "ps_1",
      question: "To what extent is your purpose statement succinct?",
      guidance: "By succinct we anticipate this to be under 10 words and to the point",
      inverted: false,
    },
    {
      id: "ps_2",
      question: "How prevalent are common words such as support in your purpose statement?",
      guidance: "Please note this scale has been inverted for assessment purposes",
      inverted: true,
    },
    {
      id: "ps_3",
      question: "To what extent do you feel your purpose statement is unique to your organisation?",
      guidance: "",
      inverted: false,
    },
    {
      id: "ps_4",
      question: "On a scale of 0 - 10, how clear is your purpose statement?",
      guidance: "i.e. free from jargon and easy to understand",
      inverted: false,
    },
    {
      id: "ps_5",
      question: "On a scale of 0 - 10, how focussed is your purpose statement?",
      guidance:
        "i.e. does it explicitly capture what you are trying to achieve as an organisation and the method for achieving this",
      inverted: false,
    },
  ],
  leadership_for_impact: [
    {
      id: "li_1",
      question:
        "On a scale of 0 - 10, to what extent would you agree that impact is led from the top of your organisation?",
      guidance:
        "i.e. do your senior leaders regularly discuss impact and take action to improve it? Are your board and senior team aligned?",
      inverted: false,
    },
    {
      id: "li_2",
      question:
        "To what extent do you agree that people in your organisation are excited about delivering social impact?",
      guidance: "",
      inverted: false,
    },
    {
      id: "li_3",
      question:
        "To what extent would you agree work around understanding and measuring impact has been successfully undertaken in the organisation?",
      guidance: "i.e. has any historical work undertaken been successful?",
      inverted: false,
    },
    {
      id: "li_4",
      question:
        "To what extent do you feel the organisation is willing to undertake further work around understanding and measuring impact?",
      guidance: "",
      inverted: false,
    },
    {
      id: "li_5",
      question:
        "To what extent would you agree that your organisation currently has a culture of understanding and measuring impact?",
      guidance: "",
      inverted: false,
    },
    {
      id: "li_6",
      question:
        "How easy would it be to achieve buy-in from key people in your organisation to develop impact practices and measure them?",
      guidance: "",
      inverted: false,
    },
  ],
  theory_of_change: [
    {
      id: "toc_1",
      question: "On a scale of 0 - 10 how complete do you believe your theory of change is?",
      guidance: "Does it include your resources, activities, outputs, outcomes, and impact?",
      inverted: false,
    },
    {
      id: "toc_2",
      question: "To what extent is your theory of change used to drive the work of your organisation?",
      guidance: "",
      inverted: false,
    },
    {
      id: "toc_3",
      question: "To what extent do you think your organisation would be willing to revisit your theory of change?",
      guidance: "",
      inverted: false,
    },
    {
      id: "toc_4",
      question: "To what extent do you agree that your theory of change is simple and straight forward?",
      guidance: "Is it easily understood, non-confusing, one one page?",
      inverted: false,
    },
    {
      id: "toc_5",
      question:
        "To what extent would you agree that the measures in your theory of change are measures of impact and not measures of reach?",
      guidance: "",
      inverted: false,
    },
  ],
  measurement_framework: [
    {
      id: "mf_1",
      question:
        "On a scale of 0-10, Is your framework feasible, cost effective, time efficient, resource appropriate and producing good quality, and reliable data?",
      guidance: "",
      inverted: false,
    },
    {
      id: "mf_2",
      question: "To what extend do you feel you are measuring too many things?",
      guidance: "",
      inverted: true,
    },
    {
      id: "mf_3",
      question: "To what extent do you feel that you are collecting only output rather than outcome measures?",
      guidance: "",
      inverted: true,
    },
    {
      id: "mf_4",
      question: "To what extent do you believe your outcomes measures are based on validated scales?",
      guidance: "",
      inverted: false,
    },
    {
      id: "mf_5",
      question: "To what extent do you feel you can compare your organisations impact to others?",
      guidance: "",
      inverted: false,
    },
    {
      id: "mf_6",
      question:
        "To what extent are you able to use demographic measures to assess your reaching your target population?",
      guidance: "",
      inverted: false,
    },
    {
      id: "mf_7",
      question: "To what extent are you using factors to interrogate your outcome measures by characteristic?",
      guidance: "",
      inverted: false,
    },
  ],
  status_of_data: [
    {
      id: "sd_1",
      question: "To what extent do you use defined and structured data fields rather than free text?",
      guidance: "",
      inverted: false,
    },
    {
      id: "sd_2",
      question: "To what extent are you able to use your data and systems to track participants over time?",
      guidance: "do you utilse consistent unique identifiers throughout your data and systems?",
      inverted: false,
    },
    {
      id: "sd_3",
      question: "To what extent would you describe your staff as 'data savy'?",
      guidance: "",
      inverted: false,
    },
    {
      id: "sd_4",
      question: "How confident are you that you have complete and useful datasets collected from beneficairies?",
      guidance: "",
      inverted: false,
    },
    {
      id: "sd_5",
      question: "To what extent is your data quality checked and maintained regularly?",
      guidance: "Is your data clearly timestamped, the quality checked and updated regularly?",
      inverted: false,
    },
    {
      id: "sd_6",
      question: "Is data structure and format consistent over time?",
      guidance: "",
      inverted: false,
    },
    {
      id: "sd_7",
      question: "To what extent do you believe your data is being effectively collected and reported on?",
      guidance: "",
      inverted: false,
    },
    {
      id: "sd_8",
      question: "To what extent is your data capture automated and free from manual processes?",
      guidance: "",
      inverted: false,
    },
  ],
  systems_capabilities: [
    {
      id: "sc_1",
      question: "Is the number of systems being operated appropriate for the organisation?",
      guidance: "",
      inverted: false,
    },
    {
      id: "sc_2",
      question: "Are the systems modern and fit for purpose?",
      guidance: "",
      inverted: false,
    },
    {
      id: "sc_3",
      question: "Does the organisation have the appropriate personnel and support in place to run their systems?",
      guidance: "",
      inverted: false,
    },
    {
      id: "sc_4",
      question: "Is it possible for the client to customise impact relevant systems without external support services?",
      guidance: "",
      inverted: false,
    },
    {
      id: "sc_5",
      question: "If applicable, Are your systems able interact with each other?",
      guidance: "",
      inverted: false,
    },
  ],
}

export const DEFAULT_SCORE_OPTIONS = [
  { value: 0, label: "0 - Not at all" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10 - Extremely" },
]

export const getScoreColor = (score: number) => {
  if (score <= 4) {
    return "text-red-600"
  } else if (score <= 7) {
    return "text-amber-600"
  } else {
    return "text-green-600"
  }
}

export const getScoreBackgroundColor = (score: number) => {
  if (score <= 4) {
    return "rgba(232, 99, 99, 0.6)" // Red for low scores
  } else if (score <= 7) {
    return "rgba(255, 206, 86, 0.6)" // Amber for medium scores
  } else {
    return "rgba(75, 192, 192, 0.6)" // Green for high scores
  }
}
