export type UserRole = 'admin' | 'investigator' | 'analyst';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

export interface Investigation {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LeakIncident {
  id: string;
  title: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_records: number;
  discovered_at: string;
  investigation_id?: string;
}

export interface Activity {
  id: string;
  type: 'investigation_created' | 'leak_detected' | 'case_closed' | 'analysis_completed';
  user_id: string;
  description: string;
  timestamp: string;
  related_id?: string;
}

export interface DashboardStats {
  total_investigations: number
  total_leaks_found: number
  high_risk_cases: number
  recent_activities: Activity[]
}

export interface InvestigationTarget {
  email?: string
  username?: string
  phone?: string
  fullName?: string
  website?: string
  domain?: string
  ipAddress?: string
}

export interface SearchOptions {
  includeOsint: boolean
  includeLeakDetection: boolean
  includeDomainIntelligence: boolean
  includeSocialMedia: boolean
}

export interface InvestigationResult {
  id: string
  target: string
  type: 'email' | 'username' | 'phone' | 'domain' | 'ip' | 'website'
  status: 'pending' | 'running' | 'completed'
  risk: 'low' | 'medium' | 'high' | 'critical'
  created: string
  findings?: string[]
}
