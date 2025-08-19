import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore_db } from '../Config/FirebaseConfig'; // Import Firestore Config

// Supabase Config
const supabaseUrl = 'https://pngnreibdencqqmuymjz.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZ25yZWliZGVuY3FxbXV5bWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjI2MTA3NywiZXhwIjoyMDQ3ODM3MDc3fQ.cJY_vLIyYHyCRl3_XODF5KrCp4q0qlm-q9i9d2G6cz4'; // Use your service role key for admin access
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey); // Admin client

const DataWipeScreen = () => {
  const [loading, setLoading] = useState(false);
  const [dataWiped, setDataWiped] = useState(false);

  const fetchUserMediaPaths = async (userId) => {
    try {
      const q = query(collection(firestore_db, 'users'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      let mediaPaths = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        mediaPaths.push(...(data.videoPath || []), ...(data.audioPath || []));
      });

      return mediaPaths;
    } catch (error) {
      console.error('Error fetching media paths:', error);
      return [];
    }
  };

  const deleteFilesFromSupabase = async (filePaths) => {
    if (filePaths.length === 0) return;

    const buckets = ['Audios', 'Audios2', 'Videos', 'Videos2'];
    try {
      for (const bucket of buckets) {
        const { error } = await supabaseAdmin.storage.from(bucket).remove(filePaths);
        if (error) {
          console.error(`Error deleting files from bucket ${bucket}:`, error.message);
        } else {
          console.log(`Files deleted successfully from bucket ${bucket}`);
        }
      }
    } catch (error) {
      console.error('Error deleting files:', error.message);
    }
  };

  const handleDataWipe = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found!');

      const mediaPaths = await fetchUserMediaPaths(userId);
      await deleteFilesFromSupabase(mediaPaths);

      const q = query(collection(firestore_db, 'users'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error('User document not found in Firestore!');
      }

      for (const docSnap of querySnapshot.docs) {
        const userRef = doc(firestore_db, 'users', docSnap.id);
        
        // Store deleted files in Firestore under "deletedFiles" field
        await updateDoc(userRef, {
          deletedFiles: mediaPaths, // Save deleted files before clearing paths
          videoPath: [],
          audioPath: [],
        });
      }

      setDataWiped(true);
      Alert.alert('Success', 'All data wiped successfully!');
    } catch (error) {
      console.error('Error during data wipe:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {dataWiped ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Your files have been successfully deleted!</Text>
        </View>
      ) : (
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Data Wipe</Text>
          <Text style={styles.instructions}>
            If you want to delete all your videos and audios, click "Wipe Data" below.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleDataWipe}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Deleting...' : 'Wipe Data'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
  },
  innerContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#4CAF50',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default DataWipeScreen;
 