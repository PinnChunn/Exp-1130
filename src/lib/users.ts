import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { logUserActivity } from './firebase';
import { Instructor } from './types';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  createdAt: number;
  lastLoginAt: number;
  xp: number;
  registeredEvents: string[];
  completedEvents: string[];
  skills: string[];
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
  metadata: {
    lastEventView?: string;
    lastEventRegistration?: string;
    totalEventsCompleted: number;
    totalXPEarned: number;
  };
}

export const createUserProfile = async (user: {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
}) => {
  try {
    const userRef = doc(db, 'Member information collection', user.id);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const newUser: UserProfile = {
        ...user,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        xp: 0,
        registeredEvents: [],
        completedEvents: [],
        skills: [],
        preferences: {
          notifications: true,
          emailUpdates: true,
          language: 'en'
        },
        metadata: {
          totalEventsCompleted: 0,
          totalXPEarned: 0
        }
      };

      await setDoc(userRef, newUser);
      logUserActivity.memberRegister(user.id, {
        name: user.name,
        email: user.email
      });

      return { user: newUser, error: null };
    }

    const existingUser = userDoc.data() as UserProfile;
    const updatedData = {
      ...existingUser,
      name: user.name ?? existingUser.name,
      email: user.email ?? existingUser.email,
      avatar: user.avatar ?? existingUser.avatar,
      lastLoginAt: Date.now()
    };

    await setDoc(userRef, updatedData);
    logUserActivity.memberLogin(user.id, 'google');

    return { user: updatedData, error: null };
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return { user: null, error: 'Failed to create/update user profile' };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'Member information collection', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { user: null, error: 'User not found' };
    }

    return { user: userDoc.data() as UserProfile, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { user: null, error: 'Failed to fetch user profile' };
  }
};

// [其他函數保持不變...]
