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
  getDoc,
  orderBy,
  deleteDoc,
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

export interface DoctorSession {
  id: string;
  title: string;
  description: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  duration: string;
  price: string;
  sessionType: string;
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DoctorContent {
  id: string;
  title: string;
  description: string;
  contentType: 'article' | 'video';
  doctorId: string;
  doctorName: string;
  specialty: string;
  category: string;
  content?: string; // For articles
  videoUrl?: string; // For videos
  thumbnailUrl?: string;
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected';
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
    // Update the doctor request status
    const docRef = doc(db, 'doctorRequests', doctorId);
    const doctorRequestDoc = await getDoc(docRef);
    
    if (!doctorRequestDoc.exists()) {
      console.error('Doctor request not found');
      return false;
    }

    const doctorData = doctorRequestDoc.data();

    // Create doctor profile in doctors collection
    await addDoc(collection(db, 'doctors'), {
      ...doctorData,
      password: 'doctor123',
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update the request status
    await updateDoc(docRef, {
      status: 'approved',
      updatedAt: Timestamp.now(),
    });

    console.log('Doctor approved and profile created');
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

export async function createDoctor(doctorData: Omit<DoctorRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string | null> {
  try {
    const newDoctor = {
      ...doctorData,
      password: 'doctor123', // Default password for new doctors
      status: 'active', // Doctors created by admin are active immediately
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Creating doctor directly in doctors collection:', newDoctor);
    
    // Create doctor directly in the doctors collection (admin-created doctors)
    const docRef = await addDoc(collection(db, 'doctors'), newDoctor);
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

// ========================================
// DOCTOR SESSIONS
// ========================================

export async function getDoctorSessions(
  approvalStatus?: 'draft' | 'pending_approval' | 'approved' | 'rejected'
): Promise<DoctorSession[]> {
  try {
    const constraints: QueryConstraint[] = [];
    if (approvalStatus) {
      constraints.push(where('approvalStatus', '==', approvalStatus));
    }

    const q = query(collection(db, 'doctorSessions'), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as DoctorSession));
  } catch (error) {
    console.error('Error fetching doctor sessions:', error);
    return [];
  }
}

export async function approveDoctorSession(sessionId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'doctorSessions', sessionId);
    await updateDoc(docRef, {
      approvalStatus: 'approved',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error approving doctor session:', error);
    return false;
  }
}

export async function rejectDoctorSession(sessionId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'doctorSessions', sessionId);
    await updateDoc(docRef, {
      approvalStatus: 'rejected',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error rejecting doctor session:', error);
    return false;
  }
}

// ========================================
// DOCTOR CONTENT (Articles & Videos)
// ========================================

export async function getDoctorContent(
  approvalStatus?: 'draft' | 'pending_approval' | 'approved' | 'rejected',
  contentType?: 'article' | 'video'
): Promise<DoctorContent[]> {
  try {
    const constraints: QueryConstraint[] = [];
    if (approvalStatus) {
      constraints.push(where('approvalStatus', '==', approvalStatus));
    }
    if (contentType) {
      constraints.push(where('contentType', '==', contentType));
    }

    const q = query(collection(db, 'doctorContent'), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as DoctorContent));
  } catch (error) {
    console.error('Error fetching doctor content:', error);
    return [];
  }
}

export async function approveDoctorContent(contentId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'doctorContent', contentId);
    await updateDoc(docRef, {
      approvalStatus: 'approved',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error approving doctor content:', error);
    return false;
  }
}

export async function rejectDoctorContent(contentId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'doctorContent', contentId);
    await updateDoc(docRef, {
      approvalStatus: 'rejected',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error rejecting doctor content:', error);
    return false;
  }
}

// ========================================
// COMMUNITY MODERATION
// ========================================

export interface CommunityPost {
  id: string;
  section: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Timestamp;
  likes?: number;
  comments?: number;
  reported?: boolean;
  reportCount?: number;
}

export interface CommunityReport {
  id: string;
  postId: string;
  postContent: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description?: string;
  urgency: 'high' | 'medium' | 'low';
  moderation: 'approved' | 'rejected' | 'pending';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Get all community posts from all sections
export async function getAllCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const sections = ['period', 'pre-pregnancy', 'postpartum', 'general'];
    const allPosts: CommunityPost[] = [];

    for (const section of sections) {
      const q = query(
        collection(db, `community/${section}/posts`),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const posts = snapshot.docs
        .filter(doc => !doc.data().deleted) // Filter out deleted posts
        .map(doc => ({
          id: doc.id,
          section,
          ...doc.data(),
        } as CommunityPost));

      allPosts.push(...posts);
    }

    // Sort all posts by creation date
    allPosts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    return allPosts;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }
}

// Get community posts by section
export async function getCommunityPostsBySection(section: string): Promise<CommunityPost[]> {
  try {
    const q = query(
      collection(db, `community/${section}/posts`),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs
      .filter(doc => !doc.data().deleted) // Filter out deleted posts
      .map(doc => ({
        id: doc.id,
        section,
        ...doc.data(),
      } as CommunityPost));
  } catch (error) {
    console.error(`Error fetching posts from ${section}:`, error);
    return [];
  }
}

// Get community reports
export async function getCommunityReportsDetailed(
  moderationStatus?: 'approved' | 'rejected' | 'pending'
): Promise<CommunityReport[]> {
  try {
    const constraints: QueryConstraint[] = [];
    if (moderationStatus) {
      constraints.push(where('moderation', '==', moderationStatus));
    }

    const q = query(
      collection(db, 'communityReports'),
      ...constraints,
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as CommunityReport));
  } catch (error) {
    console.error('Error fetching community reports:', error);
    return [];
  }
}

// Approve community report (remove the post permanently)
export async function approveCommunityReport(reportId: string, postId: string, section: string): Promise<boolean> {
  try {
    // Update report status
    const reportRef = doc(db, 'communityReports', reportId);
    await updateDoc(reportRef, {
      moderation: 'approved',
      updatedAt: Timestamp.now(),
    });

    // Actually delete the reported post from Firestore
    const postRef = doc(db, `community/${section}/posts`, postId);
    await deleteDoc(postRef);

    return true;
  } catch (error) {
    console.error('Error approving community report:', error);
    return false;
  }
}

// Reject community report (keep the post)
export async function rejectCommunityReport(reportId: string): Promise<boolean> {
  try {
    const reportRef = doc(db, 'communityReports', reportId);
    await updateDoc(reportRef, {
      moderation: 'rejected',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error rejecting community report:', error);
    return false;
  }
}

// Delete community post (permanently removes from database)
export async function deleteCommunityPost(postId: string, section: string): Promise<boolean> {
  try {
    const postRef = doc(db, `community/${section}/posts`, postId);
    
    // Actually delete the document from Firestore
    await deleteDoc(postRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting community post:', error);
    return false;
  }
}
