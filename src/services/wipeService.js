// wipeService.js
import { doc, onSnapshot, collection, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { firestore_db, supabase } from '../Config/FirebaseConfig';

// 🔹 Listen for Wipe Request in Firestore
export const monitorWipeRequest = (userId) => {
  const userRef = doc(firestore_db, 'users', userId);

  const unsubscribe = onSnapshot(userRef, async (docSnap) => {
    if (docSnap.exists() && docSnap.data().wipeRequest) {
      console.log('Wipe request detected, deleting user data...');
      await deleteUserMedia(userId);
    }
  });

  return () => unsubscribe(); // Stop listener when component unmounts
};

// 🔹 Delete User Media (Videos & Audios)
export const deleteUserMedia = async (userId) => {
  try {
    // Fetch user media paths from Firestore
    const q = query(collection(firestore_db, 'media'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const filePaths = [];
    for (const doc of querySnapshot.docs) {
      filePaths.push(doc.data().filePath);
      await deleteDoc(doc.ref); // Delete Firestore entry
    }

    // Delete files from Supabase storage
    if (filePaths.length > 0) {
      await supabase.storage.from('Videos').remove(filePaths);
      await supabase.storage.from('Audios').remove(filePaths);
    }

    console.log('User media deleted successfully');

    // Reset wipeRequest flag in Firestore
    await updateDoc(doc(firestore_db, 'users', userId), { wipeRequest: false });

  } catch (error) {
    console.error('Error deleting media:', error);
  }
};

// 🔹 Manually Trigger Wipe Request (For Testing)
export const requestDataWipe = async (userId) => {
  try {
    const userRef = doc(firestore_db, 'users', userId);
    await updateDoc(userRef, { wipeRequest: true });
    console.log('Wipe request sent');
  } catch (error) {
    console.error('Error sending wipe request:', error);
  }
};
