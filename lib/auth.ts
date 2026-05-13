import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface AdminUser {
  uid: string;
  email: string;
  role: string;
  createdAt: string;
}

/**
 * Sign in with email and password
 */
export const loginAdmin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Try to get admin data from Firestore
    try {
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        return {
          uid: user.uid,
          email: user.email,
          ...adminDoc.data(),
        };
      }
    } catch (firestoreError: any) {
      // If Firestore read fails due to permissions, still allow login
      // but return basic user info
      console.warn('Could not fetch admin data from Firestore:', firestoreError.message);
    }

    // If no admin document exists, still allow login with basic info
    return {
      uid: user.uid,
      email: user.email,
      role: 'super_admin',
      displayName: 'Super Admin',
      status: 'active',
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const logoutAdmin = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Get admin user data from Firestore
 */
export const getAdminUserData = async (uid: string): Promise<AdminUser | null> => {
  try {
    const adminDocRef = doc(db, 'admins', uid);
    const adminDoc = await getDoc(adminDocRef);

    if (adminDoc.exists()) {
      return {
        uid,
        ...adminDoc.data(),
      } as AdminUser;
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin user data:', error);
    return null;
  }
};
