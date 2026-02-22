
export enum Page {
  Planner = 'Planner',
  Analyzer = 'Analyzer',
  Coaching = 'Coaching',
  Assessments = 'Assessments',
  Insights = 'Insights',
  Intervention = 'Intervention',
  Admin = 'Campus Admin'
}

export type UserRole = 'TEACHER' | 'ADMIN' | 'DISTRICT_ADMIN';

export interface ClassPeriod {
  id: string;
  name: string; // e.g., "1st Period"
  subject: string;
  students: string[];
}

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  grade?: string;
  subjects: string[]; // Changed from single subject to array
  classes: ClassPeriod[]; // Added classes array
  campusId?: string;
  campusName?: string;
}

export interface StudentRecord {
  name: string;
  score: number;
}

export interface TeacherSummary {
  id: string;
  name: string;
  grade: string;
  subject: string;
  avgMastery: number;
  lastIntervention: string;
  planningScore: number;
  fidelityScore: number;
}

export interface CampusSummary {
  id: string;
  name: string;
  avgMastery: number;
  teacherCount: number;
  highNeedStudents: number;
}

export interface SpedAccommodation {
  id: string;
  classId: string; // Link to specific period
  studentName: string;
  needs: string; 
  accommodations: string;
}

export interface StoredLesson {
  id: string;
  focus: string;
  subject: string;
  classId: string; // Link to specific period
  content: string;
  datePlanned: string;
  status: 'planned' | 'delivered' | 'revised';
  studentNeeds?: string;
  studentTiers?: string;
  transitionStrategies?: string;
}

export interface InterventionGroup {
  id: string;
  classId: string; // Link to specific period
  skill: string;
  studentNames: string[];
  lessonPlan: string;
  tier: 2 | 3;
  status: 'suggested' | 'scheduled' | 'delivered';
}

export type AssessmentType = 'BOY' | 'Unit' | 'MOY' | 'EOY' | 'Diagnostic' | 'Benchmark';

export interface Assessment {
  id: string;
  classId: string; // Link to specific period
  title: string;
  type: AssessmentType;
  subject: string;
  date: string;
  scores: StudentRecord[];
  average: number;
  reflection?: string;
  behaviorNotes?: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  type: 'planning' | 'execution' | 'coaching' | 'alignment' | 'pacing' | 'assessment' | 'intervention';
  metric: number;
  label: string;
  details?: string;
  lessonId?: string;
  assessmentId?: string;
}
