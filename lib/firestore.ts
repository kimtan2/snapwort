import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getLibrary, setLibrary } from './library';

export async function backupToFirestore(userName: string): Promise<boolean> {
  try {
    const library = await getLibrary();
    await setDoc(doc(db, 'backups', userName), {
      library,
      lastBackup: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error backing up to Firestore:', error);
    return false;
  }
}

export async function restoreFromFirestore(userName: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'backups', userName);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('No backup found for this user');
    }

    const data = docSnap.data();
    await setLibrary(data.library);
    return true;
  } catch (error) {
    console.error('Error restoring from Firestore:', error);
    return false;
  }
} 