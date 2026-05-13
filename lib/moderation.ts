import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  QueryConstraint,
  addDoc,
} from 'firebase/firestore';

// Types
export interface DoctorRequest {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  credentials: string;
  status: 'approved' | 'rejected' | 'pending';
  location: string;
  languages: string[];
  services: { name: string; price: string }[];
  bio: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SessionRequest {
  id: string;
  patientName: string;
  patientDate: string;
  patientTime: string;
  specialist: string;
  serviceType: string;
  fee: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'standard' | 'priority';
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ArticleRequest {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'pending' | 'published' | 'rejected' | 'flagged';
  submittedDate: Timestamp;
  views: number;
  flags: number;
  content: string;
  authorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Doctor Requests
export async function getDoctorRequests(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<DoctorRequest[]> {
  try {
    const constraints: QueryConstraint[] = [];
    if (status) {
      constraints.push(where('status', '==', status));
    }

    const q = query(collection(db, 'doctorRequests'), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as DoctorRequest));
  } catch (error) {
    console.error('Error fetching doctor requests:', error);
    return [];
  }
}

export async function approveDoctorRequest(doctorId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'doctorRequests', doctorId);
    await updateDoc(docRef, {
      status: 'approved',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error approving doctor request:', error);
    return false;
  }
}

export async function rejectDoctorRequest(doctorId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'doctorRequests', doctorId);
    await updateDoc(docRef, {
      status: 'rejected',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error rejecting doctor request:', error);
    return false;
  }
}

export async function createDoctor(doctorData: Omit<DoctorRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const newDoctor = {
      ...doctorData,
      status: 'approved',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'doctorRequests'), newDoctor);
    console.log('Doctor created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating doctor:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
}

// Session Requests
export async function getSessionRequests(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<SessionRequest[]> {
  try {
    const constraints: QueryConstraint[] = [];
    if (status) {
      constraints.push(where('status', '==', status));
    }

    const q = query(collection(db, 'sessionRequests'), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as SessionRequest));
  } catch (error) {
    console.error('Error fetching session requests:', error);
    return [];
  }
}

export async function approveSessionRequest(sessionId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'sessionRequests', sessionId);
    await updateDoc(docRef, {
      status: 'approved',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error approving session request:', error);
    return false;
  }
}

export async function rejectSessionRequest(sessionId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'sessionRequests', sessionId);
    await updateDoc(docRef, {
      status: 'rejected',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error rejecting session request:', error);
    return false;
  }
}

// Article Requests
export async function getArticleRequests(
  status?: 'pending' | 'published' | 'rejected' | 'flagged'
): Promise<ArticleRequest[]> {
  try {
    const constraints: QueryConstraint[] = [];
    if (status) {
      constraints.push(where('status', '==', status));
    }

    const q = query(collection(db, 'articleRequests'), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as ArticleRequest));
  } catch (error) {
    console.error('Error fetching article requests:', error);
    return [];
  }
}

export async function publishArticleRequest(articleId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'articleRequests', articleId);
    await updateDoc(docRef, {
      status: 'published',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error publishing article request:', error);
    return false;
  }
}

export async function rejectArticleRequest(articleId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'articleRequests', articleId);
    await updateDoc(docRef, {
      status: 'rejected',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error rejecting article request:', error);
    return false;
  }
}
