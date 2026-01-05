// firebase.js - UPDATED to filter out system admin
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, update, remove } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtmyexM78vVascfmExnwTnbXjDnxh4XtQ",
  authDomain: "et-getquote.firebaseapp.com",
  databaseURL: "https://et-getquote-default-rtdb.firebaseio.com",
  projectId: "et-getquote",
  storageBucket: "et-getquote.firebasestorage.app",
  messagingSenderId: "686843981203",
  appId: "1:686843981203:web:68656bde55932b9a6acc66",
  measurementId: "G-772LRM5FDB"
};

// Initialize Firebase only once
let app;
let analytics;
let auth;
let db;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('ℹ️ Using existing Firebase app');
  }
  
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getDatabase(app);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Default Admin Credentials
export const DEFAULT_ADMIN = {
  email: "admin@exclusivetrader.com",
  password: "Admin123!"
};

// ========== USER FETCHING FUNCTIONS ==========

// Fetch all users EXCEPT system admin
export const fetchAllUsers = async () => {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      // Convert object to array with id and FILTER OUT SYSTEM ADMIN
      const usersArray = Object.entries(usersData)
        .map(([id, user]) => ({
          id,
          ...user
        }))
        // FILTER OUT SYSTEM ADMIN (admin@exclusivetrader.com)
        .filter(user => user.email !== DEFAULT_ADMIN.email);
      
      console.log('✅ Fetched users (excluding system admin):', usersArray.length);
      return usersArray;
    } else {
      console.log('ℹ️ No users found in database');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }
};

// Fetch ALL users including system admin (for admin dashboard stats)
export const fetchAllUsersWithAdmin = async () => {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      const usersArray = Object.entries(usersData).map(([id, user]) => ({
        id,
        ...user
      }));
      console.log('✅ Fetched all users (including system admin):', usersArray.length);
      return usersArray;
    } else {
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching all users:', error);
    throw error;
  }
};

// Update user data
export const updateUser = async (userId, updates) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, updates);
    console.log('✅ User updated:', userId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user:', error);
    return { success: false, error };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    await remove(userRef);
    console.log('✅ User deleted:', userId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return { success: false, error };
  }
};

// Toggle user active status
export const toggleUserStatus = async (userId, currentStatus) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
      isActive: !currentStatus,
      updatedAt: new Date().toISOString()
    });
    return { success: true, newStatus: !currentStatus };
  } catch (error) {
    console.error('❌ Error toggling user status:', error);
    return { success: false, error };
  }
};

// Get single user by ID
export const getUserById = async (userId) => {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      // Check if this is system admin
      if (userData.email === DEFAULT_ADMIN.email) {
        console.log('⚠️ System admin detected - returning null');
        return null;
      }
      return { id: userId, ...userData };
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    throw error;
  }
};

// Search users by email or name (excluding system admin)
export const searchUsers = async (searchTerm) => {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      const usersArray = Object.entries(usersData)
        .map(([id, user]) => ({
          id,
          ...user
        }))
        // FILTER OUT SYSTEM ADMIN
        .filter(user => user.email !== DEFAULT_ADMIN.email);
      
      // Filter users based on search term
      const filteredUsers = usersArray.filter(user => {
        const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const nameMatch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
        return emailMatch || nameMatch;
      });
      
      return filteredUsers;
    }
    return [];
  } catch (error) {
    console.error('❌ Error searching users:', error);
    throw error;
  }
};

// Export everything
export { app, analytics, auth, db };
export { db as quoteDatabase };
export default app;