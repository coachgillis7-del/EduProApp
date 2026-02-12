
import { HistoryEntry, StoredLesson, Assessment, SpedAccommodation, InterventionGroup, TeacherSummary, ClassPeriod } from '../types';

const HISTORY_KEY = 'edupro_growth_history';
const LESSON_BANK_KEY = 'edupro_lesson_bank';
const ASSESSMENT_KEY = 'edupro_assessments';
const ACCOMMODATIONS_KEY = 'edupro_accommodations';
const INTERVENTIONS_KEY = 'edupro_interventions';
const CLASSES_KEY = 'edupro_user_classes';

const readStorageArray = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
};

export const getCampusData = (): TeacherSummary[] => {
  const teacher1History = getHistory().filter(h => h.type === 'coaching');
  const teacher1Avg = teacher1History.length ? teacher1History[0].metric : 82;
  const teacher1Planning = getHistory().filter(h => h.type === 'planning');

  return [
    {
      id: 't1',
      name: 'Teacher 1 (You)',
      grade: '1st Grade',
      subject: 'Early Literacy',
      avgMastery: teacher1Avg,
      lastIntervention: 'Blending Phonics',
      planningScore: teacher1Planning.length ? teacher1Planning[0].metric : 88,
      fidelityScore: 84
    },
    {
      id: 't2',
      name: 'S. Miller',
      grade: 'Kindergarten',
      subject: 'Math (PAX)',
      avgMastery: 74,
      lastIntervention: 'Number Recognition',
      planningScore: 92,
      fidelityScore: 78
    },
    {
      id: 't3',
      name: 'R. Garcia',
      grade: '8th Grade',
      subject: 'Science',
      avgMastery: 68,
      lastIntervention: 'Chemical Equations',
      planningScore: 76,
      fidelityScore: 65
    },
    {
      id: 't4',
      name: 'M. Chen',
      grade: '11th Grade',
      subject: 'AP English',
      avgMastery: 89,
      lastIntervention: 'Rhetorical Analysis',
      planningScore: 95,
      fidelityScore: 92
    }
  ];
};

// CLASSES
export const getUserClasses = (): ClassPeriod[] => readStorageArray<ClassPeriod>(CLASSES_KEY);

export const saveUserClasses = (classes: ClassPeriod[]) => {
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
};

// HISTORY
export const saveHistoryEntry = (entry: Omit<HistoryEntry, 'id' | 'date'>) => {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  localStorage.setItem(HISTORY_KEY, JSON.stringify([newEntry, ...history]));
  return newEntry;
};

export const getHistory = (): HistoryEntry[] => readStorageArray<HistoryEntry>(HISTORY_KEY);

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

// INTERVENTIONS
export const getInterventions = (classId?: string): InterventionGroup[] => {
  const list = readStorageArray<InterventionGroup>(INTERVENTIONS_KEY);
  return classId ? list.filter(i => i.classId === classId) : list;
};

export const saveIntervention = (intervention: InterventionGroup) => {
  const list = getInterventions();
  const index = list.findIndex(i => i.id === intervention.id);
  if (index !== -1) {
    list[index] = intervention;
  } else {
    list.push(intervention);
  }
  localStorage.setItem(INTERVENTIONS_KEY, JSON.stringify(list));
};

export const deleteIntervention = (id: string) => {
  const list = getInterventions();
  localStorage.setItem(INTERVENTIONS_KEY, JSON.stringify(list.filter(i => i.id !== id)));
};

// LESSON BANK
export const saveLessonToBank = (lesson: Omit<StoredLesson, 'id' | 'datePlanned' | 'status'>) => {
  const bank = getLessonBank();
  const newLesson: StoredLesson = {
    ...lesson,
    id: crypto.randomUUID(),
    datePlanned: new Date().toISOString(),
    status: 'planned'
  };
  localStorage.setItem(LESSON_BANK_KEY, JSON.stringify([newLesson, ...bank]));
  return newLesson;
};

export const getLessonBank = (classId?: string): StoredLesson[] => {
  const list = readStorageArray<StoredLesson>(LESSON_BANK_KEY);
  return classId ? list.filter(l => l.classId === classId) : list;
};

export const updateLessonInBank = (id: string, updates: Partial<StoredLesson>) => {
  const bank = getLessonBank();
  const index = bank.findIndex(l => l.id === id);
  if (index !== -1) {
    bank[index] = { ...bank[index], ...updates };
    localStorage.setItem(LESSON_BANK_KEY, JSON.stringify(bank));
  }
};

export const deleteLessonFromBank = (id: string) => {
  const bank = getLessonBank();
  localStorage.setItem(LESSON_BANK_KEY, JSON.stringify(bank.filter(l => l.id !== id)));
};

// ASSESSMENTS
export const saveAssessment = (assessment: Omit<Assessment, 'id' | 'date' | 'average'>) => {
  const assessments = getAssessments();
  const avg = assessment.scores.reduce((acc, curr) => acc + curr.score, 0) / (assessment.scores.length || 1);
  const newAssessment: Assessment = {
    ...assessment,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    average: avg
  };
  localStorage.setItem(ASSESSMENT_KEY, JSON.stringify([newAssessment, ...assessments]));

  saveHistoryEntry({
    type: 'assessment',
    metric: avg,
    label: `${assessment.type}: ${assessment.title}`,
    assessmentId: newAssessment.id
  });

  return newAssessment;
};

export const getAssessments = (classId?: string): Assessment[] => {
  const list = readStorageArray<Assessment>(ASSESSMENT_KEY);
  return classId ? list.filter(a => a.classId === classId) : list;
};

export const deleteAssessment = (id: string) => {
  const assessments = getAssessments();
  localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(assessments.filter(a => a.id !== id)));
};

// ACCOMMODATIONS (SPED/504)
export const getAccommodations = (classId?: string): SpedAccommodation[] => {
  const list = readStorageArray<SpedAccommodation>(ACCOMMODATIONS_KEY);
  return classId ? list.filter(a => a.classId === classId) : list;
};

export const saveAccommodation = (acc: Omit<SpedAccommodation, 'id'>) => {
  const list = getAccommodations();
  const newAcc = { ...acc, id: crypto.randomUUID() };
  localStorage.setItem(ACCOMMODATIONS_KEY, JSON.stringify([...list, newAcc]));
  return newAcc;
};

export const deleteAccommodation = (id: string) => {
  const list = getAccommodations();
  localStorage.setItem(ACCOMMODATIONS_KEY, JSON.stringify(list.filter(a => a.id !== id)));
};
