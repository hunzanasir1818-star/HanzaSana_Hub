import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createClient } from '@supabase/supabase-js';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore_db } from '../Config/FirebaseConfig'; // Import Firestore config

const supabaseUrl = 'https://pngnreibdencqqmuymjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZ25yZWliZGVuY3FxbXV5bWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNjEwNzcsImV4cCI6MjA0NzgzNzA3N30.LwZc0-osz0ab0TRINeei-udSjid9zObgsBSQ4eT4SDY';
const supabase = createClient(supabaseUrl, supabaseKey);

const CDNURL = 'https://pngnreibdencqqmuymjz.supabase.co/storage/v1/object/public/Audios2/';

export default function AudiosRecoveryScreen() {
  const [audios, setAudios] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        fetchAudiosFromBucket();
      }
    })();
  }, []);

  const fetchAudiosFromBucket = async () => {
    try {
      const { data, error } = await supabase.storage.from('Audios2').list('', { limit: 100, offset: 0 });
      if (error) throw error;

      const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg'];
      const audiosData = data.filter(audio =>
        audioExtensions.some(ext => audio.name.toLowerCase().endsWith(ext))
      ).map(audio => ({
        id: audio.name,
        name: audio.name,
        url: CDNURL + audio.name,
        selected: false
      }));

      setAudios(audiosData);
    } catch (error) {
      console.error('Error fetching audios:', error);
      Alert.alert('Error', 'Failed to fetch audios.');
    }
  };

  const toggleSelect = (id) => {
    setAudios(prevAudios =>
      prevAudios.map(audio => audio.id === id ? { ...audio, selected: !audio.selected } : audio)
    );
  };

  const recoverSelectedAudios = async () => {
    const selectedAudios = audios.filter(audio => audio.selected);
    if (selectedAudios.length === 0) {
      Alert.alert('No Selection', 'Please select at least one audio to recover.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    try {
      const recoveredNames = [];

      await Promise.all(selectedAudios.map(async (audio) => {
        const { data: existingFile, error: checkError } = await supabase
          .storage
          .from('Audios')
          .list('', { limit: 100 });

        if (checkError) {
          console.error(`Error checking existing files:`, checkError);
          return;
        }

        const fileExists = existingFile.some(file => file.name === audio.name);
        if (fileExists) {
          console.warn(`Skipping ${audio.name}, already exists.`);
          return;
        }

        const { data: signedUrlData, error: urlError } = await supabase
          .storage
          .from('Audios2')
          .createSignedUrl(audio.name, 300);

        if (urlError || !signedUrlData?.signedUrl) {
          console.error(`Error getting URL for ${audio.name}:`, urlError);
          return;
        }

        const response = await fetch(signedUrlData.signedUrl);
        const blob = await response.blob();
        const contentType = response.headers.get('Content-Type') || 'audio/mpeg';

        const { error: uploadError } = await supabase
          .storage
          .from('Audios')
          .upload(audio.name, blob, { contentType });

        if (uploadError) {
          console.error(`Error uploading ${audio.name} to Audios:`, uploadError);
          return;
        }

        const { error: deleteError } = await supabase
          .storage
          .from('Audios2')
          .remove([audio.name]);

        if (deleteError) {
          console.error(`Error deleting ${audio.name} from Audios2:`, deleteError);
          return;
        }

        recoveredNames.push(audio.name);
      }));

      if (recoveredNames.length > 0) {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          audioPath: arrayUnion(...recoveredNames),
        });
      }

      Alert.alert('Success', 'Selected audios recovered successfully.');
      setAudios(prevAudios => prevAudios.filter(audio => !audio.selected));
    } catch (error) {
      console.error('Error recovering audios:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const renderAudio = ({ item }) => (
    <View style={styles.audioItem}>
      <TouchableOpacity onPress={() => toggleSelect(item.id)}>
        <Icon
          name={item.selected ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color={item.selected ? '#4CAF50' : '#ccc'}
        />
      </TouchableOpacity>
      <Text style={styles.audioName}>{item.name}</Text>
      <TouchableOpacity onPress={() => Alert.alert('Audio URL', item.url)}>
        <Icon name="play-arrow" size={24} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Audios from Recovery</Text>
      {audios.length > 0 ? (
        <FlatList
          data={audios}
          keyExtractor={(item) => item.id}
          renderItem={renderAudio}
        />
      ) : (
        <Text style={styles.emptyText}>No audios available.</Text>
      )}

      {audios.some(audio => audio.selected) && (
        <TouchableOpacity style={styles.recoverButton} onPress={recoverSelectedAudios}>
          <Text style={styles.recoverButtonText}>Recover Selected Audios</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#4CAF50',
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  audioName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 8,
  },
  recoverButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  recoverButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});