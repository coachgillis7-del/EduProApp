
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc,
  orderBy,
  limit,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { HistoryEntry, StoredLesson, Assessment, SpedAccommodation, InterventionGroup, TeacherSummary, ClassPeriod, User } from '../types';

// Helper to get current user ID from localStorage for now, 
// but better to pass it or use auth state.
// For simplicity in this migration, we'll assume we can get it.
const getUserId = () => {
  const session = localStorage.getItem('edupro_auth_session');
  if (session) {
    return (JSON.parse(session) as User).uid;
  }
  return null;
};

export const getCampusData = async (): Promise<TeacherSummary[]> => {
  // In a real app, this would fetch from a shared campus collection
  // For now, returning mock data or fetching from a 'teachers' collection
  return [
    {
      id: 't1',
      name: 'Teacher 1 (You)',
      grade: '1st Grade',
      subject: 'Early Literacy',
      avgMastery: 82,
      lastIntervention: 'Blending Phonics',
      planningScore: 88,
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

// USER PROFILE
export const saveUserProfile = async (user: User) => {
  await setDoc(doc(db, 'users', user.uid), user);
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
};

// CLASSES
export const getUserClasses = async (): Promise<ClassPeriod[]> => {
  const uid = getUserId();
  if (!uid) return [];
  const q = query(collection(db, 'classes'), where('userId', '==', uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ClassPeriod));
};

export const saveUserClasses = async (classes: ClassPeriod[]) => {
  const uid = getUserId();
  if (!uid) return;
  // This is a bit tricky since we are saving an array. 
  // In Firestore, we might want to save them as individual docs.
  for (const cls of classes) {
    if (cls.id && !cls.id.startsWith('temp_')) {
      await setDoc(doc(db, 'classes', cls.id), { ...cls, userId: uid });
    } else {
      await addDoc(collection(db, 'classes'), { ...cls, userId: uid });
    }
  }
};

// HISTORY
export const saveHistoryEntry = async (entry: Omit<HistoryEntry, 'id' | 'date'>) => {
  const uid = getUserId();
  if (!uid) throw new Error('User not authenticated');
  
  const newEntry = {
    ...entry,
    userId: uid,
    date: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, 'history'), newEntry);
  return { ...newEntry, id: docRef.id } as HistoryEntry;
};

export const getHistory = async (): Promise<HistoryEntry[]> => {
  const uid = getUserId();
  if (!uid) return [];
  const q = query(collection(db, 'history'), where('userId', '==', uid), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HistoryEntry));
};

export const clearHistory = async () => {
  const uid = getUserId();
  if (!uid) return;
  const q = query(collection(db, 'history'), where('userId', '==', uid));
  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, 'history', d.id)));
  await Promise.all(deletePromises);
};

// INTERVENTIONS
export const getInterventions = async (classId?: string): Promise<InterventionGroup[]> => {
  const uid = getUserId();
  if (!uid) return [];
  let q = query(collection(db, 'interventions'), where('userId', '==', uid));
  if (classId) {
    q = query(q, where('classId', '==', classId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InterventionGroup));
};

export const saveIntervention = async (intervention: InterventionGroup) => {
  const uid = getUserId();
  if (!uid) return;
  if (intervention.id) {
    await setDoc(doc(db, 'interventions', intervention.id), { ...intervention, userId: uid });
  } else {
    await addDoc(collection(db, 'interventions'), { ...intervention, userId: uid });
  }
};

export const deleteIntervention = async (id: string) => {
  await deleteDoc(doc(db, 'interventions', id));
};

// LESSON BANK
export const saveLessonToBank = async (lesson: Omit<StoredLesson, 'id' | 'datePlanned' | 'status'>) => {
  const uid = getUserId();
  if (!uid) throw new Error('User not authenticated');

  const newLesson = {
    ...lesson,
    userId: uid,
    datePlanned: new Date().toISOString(),
    status: 'planned' as const
  };
  const docRef = await addDoc(collection(db, 'lessons'), newLesson);
  return { ...newLesson, id: docRef.id } as StoredLesson;
};

export const getLessonBank = async (classId?: string): Promise<StoredLesson[]> => {
  const uid = getUserId();
  if (!uid) return [];
  let q = query(collection(db, 'lessons'), where('userId', '==', uid), orderBy('datePlanned', 'desc'));
  if (classId) {
    q = query(q, where('classId', '==', classId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StoredLesson));
};

export const updateLessonInBank = async (id: string, updates: Partial<StoredLesson>) => {
  await updateDoc(doc(db, 'lessons', id), updates);
};

export const deleteLessonFromBank = async (id: string) => {
  await deleteDoc(doc(db, 'lessons', id));
};

// ASSESSMENTS
export const saveAssessment = async (assessment: Omit<Assessment, 'id' | 'date' | 'average'>) => {
  const uid = getUserId();
  if (!uid) throw new Error('User not authenticated');

  const avg = assessment.scores.reduce((acc, curr) => acc + curr.score, 0) / (assessment.scores.length || 1);
  const newAssessment = {
    ...assessment,
    userId: uid,
    date: new Date().toISOString(),
    average: avg
  };
  
  const docRef = await addDoc(collection(db, 'assessments'), newAssessment);
  
  await saveHistoryEntry({
    type: 'assessment',
    metric: avg,
    label: `${assessment.type}: ${assessment.title}`,
    assessmentId: docRef.id
  });

  return { ...newAssessment, id: docRef.id } as Assessment;
};

export const getAssessments = async (classId?: string): Promise<Assessment[]> => {
  const uid = getUserId();
  if (!uid) return [];
  let q = query(collection(db, 'assessments'), where('userId', '==', uid), orderBy('date', 'desc'));
  if (classId) {
    q = query(q, where('classId', '==', classId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Assessment));
};

export const deleteAssessment = async (id: string) => {
  await deleteDoc(doc(db, 'assessments', id));
};

// ACCOMMODATIONS (SPED/504)
export const getAccommodations = async (classId?: string): Promise<SpedAccommodation[]> => {
  const uid = getUserId();
  if (!uid) return [];
  let q = query(collection(db, 'accommodations'), where('userId', '==', uid));
  if (classId) {
    q = query(q, where('classId', '==', classId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SpedAccommodation));
};

export const saveAccommodation = async (acc: Omit<SpedAccommodation, 'id'>) => {
  const uid = getUserId();
  if (!uid) throw new Error('User not authenticated');
  const newAcc = { ...acc, userId: uid };
  const docRef = await addDoc(collection(db, 'accommodations'), newAcc);
  return { ...newAcc, id: docRef.id } as SpedAccommodation;
};

export const deleteAccommodation = async (id: string) => {
  await deleteDoc(doc(db, 'accommodations', id));
};

