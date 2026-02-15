export interface KPIs {
  enrollment_pct: number
  current_enrollment: number
  target_enrollment: number
  active_sites: number
  total_sites: number
  approved_countries: number
  total_countries: number
  monthly_enrollment_rate: number
  budget_spent_pct: number
  budget_spent: number
  budget_total: number
  open_risks: number
  milestones_completed: number
  total_milestones: number
  study_phase: string
  therapeutic_area: string
  indication: string
  molecule: string
  protocol: string
  sponsor: string
  status: string
}

export interface AgentAction {
  id: string
  timestamp: string
  agent_type: string
  agent_name: string
  task_type: string
  title: string
  description: string
  severity: string
  data: Record<string, any>
  human_action_required: boolean
  human_response: string | null
  confidence: number
}

export interface EnrollmentSnapshot {
  date: string
  screened: number
  screen_failed: number
  enrolled: number
  randomized: number
  completed: number
  discontinued: number
  target: number
}

export interface Milestone {
  id: string
  name: string
  category: string
  planned_date: string
  predicted_date: string | null
  actual_date: string | null
  status: string
  confidence: number
  owner_agent: string
}

export interface Site {
  id: string
  name: string
  country_code: string
  country_name: string
  city: string
  pi: {
    name: string
    institution: string
    h_index: number
    trial_experience: number
    enrollment_track_record: number
  }
  status: string
  target_enrollment: number
  current_enrollment: number
  screen_fail_rate: number
  enrollment_rate_per_month: number
  quality_score: number
  lat: number
  lon: number
}

export interface Country {
  code: string
  name: string
  region: string
  regulatory_score: number
  patient_pool_size: number
  cost_index: number
  infrastructure_score: number
  status: string
  sites_count: number
}

export interface Risk {
  id: string
  category: string
  description: string
  probability: number
  impact: string
  mitigation: string
  owner_agent: string
  status: string
}

export interface Simulation {
  id: string
  name: string
  description: string
  parameters: Record<string, any>
  outcome_enrollment_months: number
  outcome_total_cost: number
  outcome_probability_success: number
}

export interface AgentInfo {
  type: string
  name: string
  description: string
  capabilities: string[]
}

export interface AgentResponse {
  agent_type: string
  agent_name: string
  response: string
  actions_taken: AgentAction[]
  recommendations: string[]
  data: Record<string, any>
  confidence: number
}

export const AGENT_COLORS: Record<string, string> = {
  master: '#8b5cf6',
  country_site: '#06b6d4',
  feasibility_startup: '#f59e0b',
  pi_enrollment: '#10b981',
  execution: '#ef4444',
  regulatory: '#ec4899',
}

export const AGENT_ICONS: Record<string, string> = {
  master: '🎯',
  country_site: '🌍',
  feasibility_startup: '🚀',
  pi_enrollment: '👥',
  execution: '📊',
  regulatory: '📋',
}

export const AGENT_SHORT_NAMES: Record<string, string> = {
  master: 'Maestro',
  country_site: 'Atlas',
  feasibility_startup: 'Pioneer',
  pi_enrollment: 'Navigator',
  execution: 'Sentinel',
  regulatory: 'Compass',
}

export const TASK_TYPE_LABELS: Record<string, string> = {
  descriptive: 'Descriptive',
  predictive: 'Predictive',
  simulative: 'Simulative',
  optimization: 'Optimization',
  generative: 'Generative',
  agentic: 'Agentic',
}

export const SEVERITY_COLORS: Record<string, string> = {
  info: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
}
