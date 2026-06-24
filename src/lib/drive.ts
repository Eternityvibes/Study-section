/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Handle Google sign in
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Parse Folder ID or URL
export function extractFolderId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  
  // If it matches a 25-50 char google drive ID directly
  if (/^[a-zA-Z0-9-_]{25,50}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Match standard folder link /folders/ID
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9-_]{25,50})/);
  if (folderMatch) return folderMatch[1];

  // Match open?id=ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9-_]{25,50})/);
  if (idMatch) return idMatch[1];

  return null;
}

// Search for existing backup file
export async function findBackupFile(accessToken: string, folderId: string | null): Promise<string | null> {
  let query = "name = 'university_life_tracker_backup.json' and trashed = false";
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  }
  
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to query Google Drive files: ${res.statusText}`);
  }
  
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

// Save backup to Google Drive (create or update)
export async function saveBackupToDrive(
  accessToken: string,
  folderId: string | null,
  appState: any
): Promise<{ fileId: string; isNew: boolean }> {
  // Try to find if backup already exists to overwrite it
  const existingFileId = await findBackupFile(accessToken, folderId);
  
  // We want to avoid polluting with multiple backup files, so we overwrite if it exists.
  if (existingFileId) {
    // Perform PATCH update (overwriting content)
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
    const res = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appState, null, 2),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to update backup file: ${res.statusText}`);
    }
    
    return { fileId: existingFileId, isNew: false };
  } else {
    // Perform multipart creation
    const metadata = {
      name: 'university_life_tracker_backup.json',
      mimeType: 'application/json',
      parents: folderId ? [folderId] : undefined,
    };

    const boundary = '314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const body = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(appState, null, 2) +
      closeDelim;

    const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: body,
    });

    if (!res.ok) {
      throw new Error(`Failed to create backup file: ${res.statusText}`);
    }

    const data = await res.json();
    return { fileId: data.id, isNew: true };
  }
}

// Download/Restore data from Google Drive
export async function downloadBackupFromDrive(
  accessToken: string,
  folderId: string | null
): Promise<any> {
  const existingFileId = await findBackupFile(accessToken, folderId);
  if (!existingFileId) {
    throw new Error("No backup file named 'university_life_tracker_backup.json' found in this location.");
  }

  const url = `https://www.googleapis.com/drive/v3/files/${existingFileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to download backup: ${res.statusText}`);
  }

  return await res.json();
}
