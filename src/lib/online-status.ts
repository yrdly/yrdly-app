import { ref, onValue, set, serverTimestamp } from 'firebase/database';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { database, db } from './firebase';

// Firebase Realtime Database reference for online status
const getOnlineStatusRef = (userId: string) => ref(database, `onlineStatus/${userId}`);

// Firestore reference for last seen
const getLastSeenRef = (userId: string) => doc(db, 'users', userId);

export class OnlineStatusService {
  private static instance: OnlineStatusService;
  private onlineStatusRef: any;
  private lastSeenRef: any;
  private userId: string | null = null;
  private isOnline = false;

  private constructor() {}

  static getInstance(): OnlineStatusService {
    if (!OnlineStatusService.instance) {
      OnlineStatusService.instance = new OnlineStatusService();
    }
    return OnlineStatusService.instance;
  }

  // Initialize online status tracking for a user
  initialize(userId: string) {
    this.userId = userId;
    this.onlineStatusRef = getOnlineStatusRef(userId);
    this.lastSeenRef = getLastSeenRef(userId);
    
    // Set user as online
    this.setOnlineStatus(true);
    
    // Listen for app visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Listen for page unload
    window.addEventListener('beforeunload', this.handlePageUnload.bind(this));
    
    // Listen for online/offline network changes
    window.addEventListener('online', this.handleNetworkOnline.bind(this));
    window.addEventListener('offline', this.handleNetworkOffline.bind(this));
  }

  // Set online status
  private async setOnlineStatus(isOnline: boolean) {
    if (!this.userId || !this.onlineStatusRef) return;

    try {
      await set(this.onlineStatusRef, {
        isOnline,
        lastSeen: serverTimestamp(),
        userId: this.userId
      });

      // Update last seen in Firestore
      await updateDoc(this.lastSeenRef, {
        isOnline,
        lastSeen: serverTimestamp()
      });

      this.isOnline = isOnline;
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  // Handle page visibility change
  private handleVisibilityChange() {
    if (document.hidden) {
      this.setOnlineStatus(false);
    } else {
      this.setOnlineStatus(true);
    }
  }

  // Handle page unload
  private handlePageUnload() {
    this.setOnlineStatus(false);
  }

  // Handle network coming online
  private handleNetworkOnline() {
    if (!document.hidden) {
      this.setOnlineStatus(true);
    }
  }

  // Handle network going offline
  private handleNetworkOffline() {
    this.setOnlineStatus(false);
  }

  // Get online status of a user
  static async getUserOnlineStatus(userId: string): Promise<{ isOnline: boolean; lastSeen: any }> {
    return new Promise((resolve) => {
      const statusRef = getOnlineStatusRef(userId);
      
      onValue(statusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          resolve({
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen
          });
        } else {
          resolve({
            isOnline: false,
            lastSeen: null
          });
        }
      }, { onlyOnce: true });
    });
  }

  // Listen to online status changes of a user
  static listenToUserOnlineStatus(userId: string, callback: (status: { isOnline: boolean; lastSeen: any }) => void) {
    const statusRef = getOnlineStatusRef(userId);
    
    return onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback({
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen
        });
      } else {
        callback({
          isOnline: false,
          lastSeen: null
        });
      }
    });
  }

  // Cleanup when user logs out
  cleanup() {
    if (this.userId) {
      this.setOnlineStatus(false);
      this.userId = null;
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('beforeunload', this.handlePageUnload.bind(this));
    window.removeEventListener('online', this.handleNetworkOnline.bind(this));
    window.removeEventListener('offline', this.handleNetworkOffline.bind(this));
  }
}

export const onlineStatusService = OnlineStatusService.getInstance();
