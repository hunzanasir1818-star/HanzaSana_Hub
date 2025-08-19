import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, addDoc, deleteDoc,getDoc, updateDoc, doc  } from 'firebase/firestore';
import { firestore_db } from '../Config/FirebaseConfig'; // Import Firestore config
import nacl from 'tweetnacl';
import { getPassphrase, savePassphrase } from '../storage';
import { generateNonce} from '../generateNonce';
import naclUtil from 'tweetnacl-util';
import { Buffer } from 'buffer';
 
const supabaseUrl = 'https://pngnreibdencqqmuymjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZ25yZWliZGVuY3FxbXV5bWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNjEwNzcsImV4cCI6MjA0NzgzNzA3N30.LwZc0-osz0ab0TRINeei-udSjid9zObgsBSQ4eT4SDY'; // Update with your key
const supabase = createClient(supabaseUrl, supabaseKey);

//const CDNURL = 'https://pngnreibdencqqmuymjz.supabase.co/storage/v1/object/public/Audios/'; // Adjust the CDN URL to match the Audios bucket

const deriveEncryptionKey = async (input, passphrase = null) => {
  const encoder = new TextEncoder();

  if (!input || typeof input !== "string") {
      console.error("❌ Invalid input for key derivation:", input);
      throw new Error("Invalid input for encryption key derivation");
  }

  // ✅ If passphrase is provided, use PBKDF2 (for user-based keys)
  if (passphrase) {
      const normalizedInput = input.trim().toLowerCase();  // Normalize UserID
      const salt = await crypto.subtle.digest("SHA-256", encoder.encode(normalizedInput));

      const keyMaterial = await crypto.subtle.importKey(
          "raw",
          encoder.encode(passphrase),
          { name: "PBKDF2" },
          false,
          ["deriveKey"]
      );

      const derivedKey = await crypto.subtle.deriveKey(
          {
              name: "PBKDF2",
              salt: salt,
              iterations: 100000,
              hash: "SHA-256",
          },
          keyMaterial,
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
      );

      const keyBuffer = await crypto.subtle.exportKey("raw", derivedKey);
      return new Uint8Array(keyBuffer);
  }

  // ✅ If only `nonce` is provided, use SHA-256 (for chunk encryption)
  return crypto.subtle.digest("SHA-256", encoder.encode(input.trim()));
};

// 🎵 Encrypt Audio
const encryptAudio = async (data, userId) => {
  const passphrase = await getPassphrase();  
  console.log("🔐 Retrieved Passphrase for Encryption:", passphrase);

  if (!passphrase) {
    console.error("❌ Passphrase not found!");
    return null;
  }

  const ENCRYPTION_KEY = await deriveEncryptionKey(userId, passphrase);
  console.log("🔐 Encryption Key During Upload:", ENCRYPTION_KEY);

  const nonce = await generateNonce(userId);
  const messageUint8 = new Uint8Array(data);

  let encryptedChunks = [];
  for (let i = 0; i < messageUint8.length; i += 65536) {
    let chunk = messageUint8.slice(i, i + 65536);
    let encryptedChunk = nacl.secretbox(chunk, nonce, ENCRYPTION_KEY);
    encryptedChunks.push(Buffer.from(encryptedChunk).toString('base64'));
  }

  return { 
    encryptedChunks, 
    nonce: Buffer.from(nonce).toString('base64') 
  };
};

// 🔓 Decrypt Audio
const decryptAudio = async (fileName, nonce, userId) => {
  try {
    const passphrase = await getPassphrase();  // ✅ Retrieve stored passphrase
    console.log("🔐 Retrieved Passphrase for Decryption:", passphrase);

    if (!passphrase) {
      console.error("❌ Passphrase not found!");
      return null;
    }

    const ENCRYPTION_KEY = await deriveEncryptionKey(userId, passphrase);
    console.log("🔑 Encryption Key During Decryption:", ENCRYPTION_KEY);

    const { data, error } = await supabase.storage.from('Audios').download(fileName);
    if (error) {
      console.error("❌ Download error:", error);
      return null;
    }

    const fileText = await data.text();
    const encryptedChunks = JSON.parse(fileText);
    console.log("🔄 Encrypted Chunks:", encryptedChunks);

    const nonceUint8 = new Uint8Array(Buffer.from(nonce, 'base64'));
    let decryptedChunks = [];
    for (let chunkBase64 of encryptedChunks) {
      let encryptedChunk = new Uint8Array(Buffer.from(chunkBase64, 'base64'));
      let decryptedChunk = nacl.secretbox.open(encryptedChunk, nonceUint8, ENCRYPTION_KEY);
      if (!decryptedChunk) {
        throw new Error("Decryption failed!");
      }
      decryptedChunks.push(decryptedChunk);
    }

    console.log("✅ Audio decrypted successfully!");
    return URL.createObjectURL(new Blob(decryptedChunks, { type: 'audio/mpeg' }));
  } catch (err) {
    console.error("❌ Decryption error:", err);
    return null;
  }
};



// 📌 Audio Upload Component
export default function AudioUpload() {
  const [audios, setAudios] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
   const [isFavorite, setIsFavorite] = useState(false); // Track favorite state

  // 🔄 Fetch User ID & Passphrase on App Start
  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem('userId');
            const storedPassphrase = await AsyncStorage.getItem('passphrase');

            console.log('👤 Stored User ID:', storedUserId);
            console.log('🔑 Stored Passphrase:', storedPassphrase);

            if (!storedUserId) {
                console.warn("⚠️ No User ID found in AsyncStorage.");
                return;
            }

            if (!storedPassphrase) {
                console.warn("⚠️ No Passphrase found in AsyncStorage.");
                Alert.alert("Error", "Encryption passphrase not found. Please log in again.");
                return;
            }

            setUserId(storedUserId);
            fetchUserAudios(storedUserId, storedPassphrase); // ✅ Pass the passphrase
        } catch (error) {
            console.error("❌ Error fetching User ID or Passphrase:", error);
        }
    };

    fetchUserData();
}, []);


const fetchUserAudios = async (storedUserId, passphrase) => {
  try {
    console.log('📡 Fetching audios for user:', storedUserId);

    const q = query(collection(firestore_db, 'users'), where('userId', '==', storedUserId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("⚠️ No audios found for user.");
      setAudios([]);
      return;
    }

    // Get lists of files from both storage buckets
    const { data: audiosList, error: audiosError } = await supabase.storage.from('Audios').list();
    const { data: audios2List, error: audios2Error } = await supabase.storage.from('Audios2').list();

    if (audiosError || audios2Error) {
      console.error('❌ Error listing storage:', audiosError || audios2Error);
      throw new Error('Failed to list storage contents');
    }

    const userAudios = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        try {
          const { audioPath, audioPath2, nonce } = doc.data();

          // Validate required fields
          if (!nonce) {
            console.warn("⚠️ Missing nonce for audio entry:", doc.id);
            return null;
          }

          // Determine which path to use
          let finalPath = null;
          
          if (audioPath && checkFileExists(audioPath, audiosList)) {
            finalPath = audioPath;
          } else if (audioPath2 && checkFileExists(audioPath2, audios2List)) {
            finalPath = audioPath2;
          }

          if (!finalPath) {
            console.warn("⚠️ No valid audio path found for:", doc.id);
            return null;
          }

          // Decrypt and return audio
          const decrypted = await decryptAudio(finalPath, nonce, storedUserId, passphrase);
          return { 
            id: doc.id, 
            audioUrl: decrypted,
            fileName: finalPath.split('/').pop()
          };

        } catch (error) {
          console.error(`❌ Error processing audio ${doc.id}:`, error);
          return null;
        }
      })
    );

    setAudios(userAudios.filter(audio => audio !== null));
    
  } catch (error) {
    console.error('❌ Error fetching audios:', error);
    Alert.alert('Error', 'Failed to fetch audios. Please try again.');
  }
};

const updateAudioMetadata = async (docId, newAudioPath, newNonce, hmac) => {
  const docRef = doc(firestore_db, 'users', docId);
  await updateDoc(docRef, {
    audioPath: newAudioPath,
    nonce: newNonce,
    hmac: hmac || null
  });
  console.log('✅ Audio metadata updated in Firestore');
};


// ✅ Helper function to check if file exists in storage
const checkFileExists = (path, fileList) => {
  if (!path || !fileList) return false;
  
  // Handle both string paths and array of paths
  const pathsToCheck = Array.isArray(path) ? path : [path];
  
  return pathsToCheck.some(p => {
    if (typeof p !== 'string') return false;
    const fileName = p.split('/').pop();
    return fileList.some(file => file.name === fileName);
  });
};

const deleteFileFromFirestore = async (AudioPath) => {
  try {
    const q = query(collection(firestore_db, 'users'), where('AudioPath', 'array-contains', AudioPath));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("⚠️ No matching Firestore documents found for deletion.");
      return;
    }

    const batch = writeBatch(firestore_db);
    querySnapshot.forEach((doc) => {
      const docRef = doc.ref;
      const updatedPaths = doc.data().AudioPath.filter((path) => path !== AudioPath);
      batch.update(docRef, { AudioPath: updatedPaths });
    });

    await batch.commit();
    console.log(`✅ Successfully removed ${AudiPath} from Firestore.`);
  } catch (error) {
    console.error('❌ Error deleting file from Firestore:', error);
  }
};
  // 📌 Handle Audio Selection & Upload
  const handleAudioSelect = async (event, passphrase) => {
    let userId = await AsyncStorage.getItem('userId');

    if (!userId) {
        console.error("❌ User ID is missing!");
        Alert.alert("Error", "User ID is not available. Please log in again.");
        return;
    }

    const audioFile = event.target.files[0];
    if (!audioFile) {
        console.error("❌ No file selected!");
        return;
    }

    let fileName = uuidv4() + '.mp3';
    console.log("📂 Selected Audio:", audioFile.name);

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            console.log("🔄 Reading file...");
            const { encryptedChunks, nonce, hmac } = await encryptAudio(reader.result, userId, passphrase);
            console.log("🔐 Encryption complete!");

            // 🔍 Check if file already exists in Supabase
            const { data: existingFiles, error: listError } = await supabase.storage.from('Audios').list();
            if (listError) {
                console.error("❌ Error listing bucket:", listError.message);
                return;
            }

            const isDuplicate = existingFiles?.some(file => file.name === fileName);
            if (isDuplicate) {
                fileName = uuidv4() + '.mp3'; // 🔄 Generate a new unique name
                console.log(`⚠️ Duplicate file found. New filename: ${fileName}`);
            }

            // 🚀 Upload encrypted audio
            const { data, error } = await supabase.storage
                .from('Audios')
                .upload(fileName, JSON.stringify(encryptedChunks), { contentType: 'application/json' });

            if (error) {
                console.error("❌ Upload failed:", error.message);
                return;
            }

            console.log("✅ Upload successful:", data.path);

            // 📝 Store metadata in Firestore
            const metadata = { userId, audioPath: fileName, nonce };
            if (hmac) metadata.hmac = hmac;

            await addDoc(collection(firestore_db, 'users'), metadata);
            console.log("✅ Audio metadata saved in Firestore");

        } catch (error) {
            console.error("❌ Error processing audio:", error);
        }
    };

    reader.readAsArrayBuffer(audioFile);
};


const handleToggleFavorite = (audioItem) => {  // Accept the item as parameter
    setIsFavorite(!isFavorite);
    console.log(`Favorite status for ${audioItem.id}: ${!isFavorite}`);
    // Add your backend logic here using audioItem
  };

  // Share audio securely with signed URL
  const handleShareAudio = async (fileName) => {
    const { data, error } = await supabase.storage.from('Audios').createSignedUrl(fileName, 3600);
    if (error) {
      Alert.alert('Error', 'Failed to generate secure link.');
      return;
    }
    Alert.alert('Secure Link', 'Share this link: ${data.signedUrl}');
  };

  const handleDeleteAudio = async (audioUrl, docId, nonce) => {
    try {
      console.log("🗑️ Attempting to delete audio:", audioUrl);
  
      // 🔹 Fetch the correct file name from Firestore
      const userDocRef = doc(firestore_db, 'users', docId);
      const userDocSnap = await getDoc(userDocRef);
  
      if (!userDocSnap.exists()) {
        console.error("❌ Error: User document not found in Firestore.");
        Alert.alert('Error', 'User document not found.');
        return;
      }
  
      const userData = userDocSnap.data();
      const audioPath = userData.audioPath;
  
      if (!audioPath) {
        console.error("❌ No audio path found in Firestore.");
        Alert.alert('Error', 'No audio path found.');
        return;
      }
  
      // Extract filename
      const fileName = audioPath.split('/').pop();
      console.log("🔍 Extracted file name from Firestore:", fileName);
  
      // 🔹 Download encrypted audio from 'Audios'
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('Audios')
        .download(fileName);
  
      if (downloadError || !fileData) {
        console.error("❌ Download Error:", downloadError);
        Alert.alert('Error', 'Failed to download file from Audios.');
        return;
      }
  
      console.log(`🔄 Re-encrypting file before uploading to Audios2`);
  
      let userId = await AsyncStorage.getItem('userId');
      const passphrase = await getPassphrase();
      const arrayBuffer = await fileData.arrayBuffer();
  
      // 🔐 Encrypt the file before uploading to Audios2
      const { encryptedChunks, newNonce } = await encryptAudio(arrayBuffer, userId, passphrase);
      
      if (!encryptedChunks) {
        console.error("❌ Encryption failed!");
        return;
      }
  
      console.log(`⬆️ Uploading re-encrypted file to Audios2`);
  
      // Upload encrypted audio as JSON
      const { error: uploadError } = await supabase.storage
        .from('Audios2')
        .upload(fileName, JSON.stringify(encryptedChunks), { contentType: 'application/json' });
  
      if (uploadError) {
        console.error("❌ Upload Error:", uploadError);
        Alert.alert('Error', 'Failed to move file to Audios2.');
        return;
      }
  
      console.log(`✅ Successfully moved ${fileName} to Audios2`);
  
      // 🔹 Update Firestore document
      await updateDoc(userDocRef, { 
        audioPath: `Audios2/${fileName}`, 
        nonce: newNonce || ""  // Prevent Firestore `undefined` issue
      });
  
      // 🔹 Remove the original file from 'Audios'
      const { error: removeError } = await supabase.storage
        .from('Audios')
        .remove([fileName]);
  
      if (removeError) {
        console.error("❌ Remove Error:", removeError);
        Alert.alert('Error', 'Failed to remove file from Audios.');
        return;
      }
  
      console.log(`✅ Deleted original file: ${fileName} from Audios`);
  
      // 🔹 Refresh the audio list
      fetchUserAudios(userId);
    } catch (error) {
      console.error("❌ Unexpected Error:", error);
      Alert.alert('Error', 'An error occurred while moving the file: ' + error.message);
    }
  };
  

  // Render user-specific audio list
  const renderAudioItem = ({ item }) => (
    <View style={styles.audioItem}>
      <Text style={styles.audioName}>{item.fileName}</Text>
      <audio controls src={item.audioUrl}></audio>
       <View style={styles.buttonsContainer}>
       <TouchableOpacity 
          style={[
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive
          ]}
          onPress={handleToggleFavorite}
        >
          <Icon 
            name={isFavorite ? "favorite" : "favorite-border"} 
            size={35} 
            color={isFavorite ? "red" : "green"} 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAudio(item.audioUrl, item.id)}>
        <Icon name="delete" size={20} color="white" />
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <label htmlFor="audioInput" style={styles.uploadButton}>
        <Icon name="audiotrack" size={24} color="white" />
        <Text style={styles.uploadButtonText}>Upload Audio</Text>
      </label>
      <input id="audioInput" type="file" accept="audio/*" style={styles.hiddenInput} onChange={handleAudioSelect} />

      <FlatList
        data={audios}
        keyExtractor={(item) => item.id}
        renderItem={renderAudioItem}
        ListEmptyComponent={<Text style={styles.noAudiosText}>No audio files uploaded yet</Text>}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 10,
  },
  hiddenInput: {
    display: 'none',
  },
  audioItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  audioName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  audioPlayer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  shareButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noAudiosText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});