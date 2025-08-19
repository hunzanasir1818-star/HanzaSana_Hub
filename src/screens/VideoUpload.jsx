import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, addDoc,getDoc,updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore_db } from '../Config/FirebaseConfig'; // Import Firestore config
import Video from 'react-native-video';
//import { Video } from 'expo-av';

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { getPassphrase, savePassphrase } from '../storage';
import { generateNonce} from '../generateNonce';

import { Buffer } from 'buffer';
import { Share, Platform } from "react-native";
const supabaseUrl = 'https://pngnreibdencqqmuymjz.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZ25yZWliZGVuY3FxbXV5bWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNjEwNzcsImV4cCI6MjA0NzgzNzA3N30.LwZc0-osz0ab0TRINeei-udSjid9zObgsBSQ4eT4SDY'; // Replace with your Supabase Key
const supabase = createClient(supabaseUrl, supabaseKey);



// 🛡 Encrypt Video Function
const deriveEncryptionKey = async (userId, passphrase) => {
  const encoder = new TextEncoder();

  // ✅ Normalize userId to prevent inconsistencies
  const normalizedUserId = userId.trim().toLowerCase();  

  const salt = await crypto.subtle.digest("SHA-256", encoder.encode(normalizedUserId)); 

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
};

// 🔐 **Encrypt Video with XOR & Chunked Encryption**
const encryptVideo = async (data, userId) => {
  const passphrase = await getPassphrase();  // ✅ Now this function is available
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


// 🔓 **Decrypt Video with XOR & Chunk Restoration**
const decryptVideo = async (fileName, nonce, userId) => {
  try {
    const passphrase = await getPassphrase();  // ✅ Retrieve stored passphrase
    console.log("🔐 Retrieved Passphrase for Decryption:", passphrase);

    if (!passphrase) {
      console.error("❌ Passphrase not found!");
      return null;
    }

    const ENCRYPTION_KEY = await deriveEncryptionKey(userId, passphrase);
    console.log("🔑 Encryption Key During Decryption:", ENCRYPTION_KEY);

    const { data, error } = await supabase.storage.from('Videos').download(fileName);
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

    console.log("✅ Video decrypted successfully!");
    return URL.createObjectURL(new Blob(decryptedChunks, { type: 'video/mp4' }));
  } catch (err) {
    console.error("❌ Decryption error:", err);
    return null;
  }
};


// 📽 **Video Upload Component**
export default function VideoUpload() {
  const [videos, setVideos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
 const [isFavorite, setIsFavorite] = useState(false); // Track favorite state
  // 🔄 Fetch User ID on App Start
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
            fetchUserVideos(storedUserId, storedPassphrase); // ✅ Pass the passphrase
        } catch (error) {
            console.error("❌ Error fetching User ID or Passphrase:", error);
        }
    };

    fetchUserData();
}, []);


const fetchUserVideos = async (storedUserId, passphrase) => {
  try {
      console.log('📡 Fetching videos for user:', storedUserId);
      console.log('🔑 Using Passphrase:', passphrase);

      const q = query(collection(firestore_db, 'users'), where('userId', '==', storedUserId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          console.log("⚠️ No videos found for user.");
          setVideos([]);
          return;
      }

      console.log('🔥 Fetched Firestore Documents:', querySnapshot.docs.map(doc => doc.data()));

      const userVideos = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
              const { videoPath, nonce } = doc.data();

              if (!videoPath || !nonce) {
                  console.warn("⚠️ Skipping invalid video entry:", videoPath);
                  return null;
              }

              const { data, error } = await supabase.storage.from('Videos').list();
              if (error) {
                  console.error('❌ Error checking Supabase storage:', error);
                  return null;
              }

              // ✅ Handle both array and string cases for `videoPath`
              const fileExists = Array.isArray(videoPath)
                  ? videoPath.some((path) => typeof path === "string" && data.some(file => file.name === path.split('/').pop()))
                  : (typeof videoPath === "string" && data.some(file => file.name === videoPath.split('/').pop()));

              if (!fileExists) {
                  console.log(`🗑️ Video file ${videoPath} not found in Supabase. Removing from Firestore.`);
                  await deleteFileFromFirestore(videoPath);
                  return null;
              }

              try {
                  console.log('🔓 Decrypting video:', videoPath);
                  const decrypted = await decryptVideo(videoPath, nonce, storedUserId, passphrase);
                  return { id: doc.id, videoUrl: decrypted };
              } catch (decryptionError) {
                  console.error('❌ Decryption error:', decryptionError);
                  return null;
              }
          })
      );

      setVideos(userVideos.filter((video) => video !== null));
  } catch (error) {
      console.error('❌ Error fetching videos:', error);
      Alert.alert('Error', 'Failed to fetch videos. Please try again.');
  }
};


// ✅ Firestore Video Deletion Function
const deleteFileFromFirestore = async (videoPath) => {
  try {
    const q = query(collection(firestore_db, 'users'), where('videoPath', 'array-contains', videoPath));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("⚠️ No matching Firestore documents found for deletion.");
      return;
    }

    const batch = writeBatch(firestore_db);
    querySnapshot.forEach((doc) => {
      const docRef = doc.ref;
      const updatedPaths = doc.data().videoPath.filter((path) => path !== videoPath);
      batch.update(docRef, { videoPath: updatedPaths });
    });

    await batch.commit();
    console.log(`✅ Successfully removed ${videoPath} from Firestore.`);
  } catch (error) {
    console.error('❌ Error deleting file from Firestore:', error);
  }
};

const handleToggleFavorite = (videoItem) => {  // Accept the item as parameter
    setIsFavorite(!isFavorite);
    console.log(`Favorite status for ${videoItem.id}: ${!isFavorite}`);
    // Add your backend logic here using audioItem
  };

  // 📌 Handle Video Selection & Upload
const handleVideoSelect = async (event, passphrase) => {
  let userId = await AsyncStorage.getItem('userId');

  if (!userId) {
      console.error("❌ User ID is missing!");
      Alert.alert("Error", "User ID is not available. Please log in again.");
      return;
  }

  const videoFile = event.target.files[0];
  if (!videoFile) {
      console.error("❌ No file selected!");
      return;
  }

  const fileName = uuidv4() + '.mp4';
  console.log("📂 Selected Video:", videoFile.name);

  const reader = new FileReader();
  reader.onload = async () => {
      try {
          console.log("🔄 Reading file...");
          const { encryptedChunks, nonce, hmac } = await encryptVideo(reader.result, userId, passphrase);
          console.log("🔐 Encryption complete!");

          // Upload encrypted chunks
          const { data, error } = await supabase.storage
              .from('Videos')
              .upload(fileName, JSON.stringify(encryptedChunks), { contentType: 'application/json' });

          if (error) {
              console.error("❌ Upload failed:", error.message);
              return;
          }

          console.log("✅ Upload successful:", data.path);

          // Store metadata in Firestore
          const metadata = { userId, videoPath: fileName, nonce };
          if (hmac) metadata.hmac = hmac;

          await addDoc(collection(firestore_db, 'users'), metadata);
          console.log("✅ Video metadata saved in Firestore");

      } catch (error) {
          console.error("❌ Error processing video:", error);
      }
  };

  // 🔹 Use readAsArrayBuffer instead of expecting a Base64 string
  reader.readAsArrayBuffer(videoFile);
};


  // Share video securely with signed URL
  const handleShareVideo = async (fileName, userId) => {
    Alert.alert(
      "Share Video",
      "Choose how you want to share:",
      [
        {
          text: "One-Time View",
          onPress: () => shareOneTimeView(fileName, userId),
        },
        {
          text: "Via Link (5 min)",
          onPress: () => shareTemporaryLink(fileName),
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };
  
  const shareOneTimeView = async (fileName, userId) => {
    try {
      const oneTimeToken = `${userId}_${Date.now()}`;
      await setDoc(doc(firestore_db, "oneTimeLinks", oneTimeToken), {
        fileName,
        viewed: false,
        createdAt: new Date(),
      });
  
      const shareableLink = `https://your-app.com/view?token=${oneTimeToken}`;
  
      if (Platform.OS === "web") {
        navigator.clipboard.writeText(shareableLink);
        alert("One-Time Link copied to clipboard!");
      } else {
        await Share.share({ message: `View this video (One-Time Only): ${shareableLink}` });
      }
    } catch (error) {
      console.error("One-Time Link Error:", error);
      Alert.alert("Error", "Failed to generate one-time view link.");
    }
  };
  
  const shareTemporaryLink = async (fileName) => {
    try {
      const { data, error } = await supabase.storage.from("Videos").createSignedUrl(fileName, 300);
      if (error) {
        console.error("Supabase Error:", error);
        Alert.alert("Error", "Failed to generate secure link.");
        return;
      }
  
      const shareableLink = data.signedUrl;
  
      if (Platform.OS === "web") {
        navigator.clipboard.writeText(shareableLink);
        alert("Temporary Link copied to clipboard!");
      } else {
        await Share.share({ message: `View this video (Valid for 5 minutes): ${shareableLink}` });
      }
    } catch (error) {
      console.error("Temporary Link Error:", error);
      Alert.alert("Error", "Failed to create a shareable link.");
    }
  };
  
  
  const handleDeleteVideo = async (videoUrl, docId, nonce) => {
    try {
      console.log("🗑️ Attempting to delete video:", videoUrl);
  
      // 🔹 Fetch the correct file name from Firestore
      const userDocRef = doc(firestore_db, 'users', docId);
      const userDocSnap = await getDoc(userDocRef);
  
      if (!userDocSnap.exists()) {
        console.error("❌ Error: User document not found in Firestore.");
        Alert.alert('Error', 'User document not found.');
        return;
      }
  
      const userData = userDocSnap.data();
      const videoPath = userData.videoPath;
  
      if (!videoPath) {
        console.error("❌ No video path found in Firestore.");
        Alert.alert('Error', 'No video path found.');
        return;
      }
  
      // Extract filename
      const fileName = videoPath.split('/').pop();
      console.log("🔍 Extracted file name from Firestore:", fileName);
  
      // 🔹 Download encrypted video from 'Videos'
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('Videos')
        .download(fileName);
  
      if (downloadError || !fileData) {
        console.error("❌ Download Error:", downloadError);
        Alert.alert('Error', 'Failed to download file from Videos.');
        return;
      }
  
      console.log(`🔄 Re-encrypting file before uploading to Videos2`);
  
      let userId = await AsyncStorage.getItem('userId');
      const passphrase = await getPassphrase();
      const arrayBuffer = await fileData.arrayBuffer();
  
      // 🔐 Encrypt the file before uploading to Videos2
      const { encryptedChunks, newNonce } = await encryptVideo(arrayBuffer, userId, passphrase);
      
      if (!encryptedChunks) {
        console.error("❌ Encryption failed!");
        return;
      }
  
      console.log(`⬆️ Uploading re-encrypted file to Videos2`);
  
      // Upload encrypted video as JSON
      const { error: uploadError } = await supabase.storage
        .from('Videos2')
        .upload(fileName, JSON.stringify(encryptedChunks), { contentType: 'application/json' });
  
      if (uploadError) {
        console.error("❌ Upload Error:", uploadError);
        Alert.alert('Error', 'Failed to move file to Videos2.');
        return;
      }
  
      console.log(`✅ Successfully moved ${fileName} to Videos2`);
  
      // 🔹 Update Firestore document
      await updateDoc(userDocRef, { 
        videoPath: `Videos2/${fileName}`, 
        nonce: newNonce || ""  // Prevent Firestore `undefined` issue
      });
  
      // 🔹 Remove the original file from 'Videos'
      const { error: removeError } = await supabase.storage
        .from('Videos')
        .remove([fileName]);
  
      if (removeError) {
        console.error("❌ Remove Error:", removeError);
        Alert.alert('Error', 'Failed to remove file from Videos.');
        return;
      }
  
      console.log(`✅ Deleted original file: ${fileName} from Videos`);
  
      // 🔹 Refresh the video list
      fetchUserVideos(userId);
    } catch (error) {
      console.error("❌ Unexpected Error:", error);
      Alert.alert('Error', 'An error occurred while moving the file: ' + error.message);
    }
  };

  const renderVideoItem = ({ item }) => (
    <View style={styles.videoItem}>
      <Text style={styles.videoName}>{item.fileName}</Text>
      {item.videoUrl ? ( // Check if videoUrl exists
        <Video 
          source={{ uri: item.videoUrl }} 
          style={styles.videoPlayer}
          controls={true}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.noVideosText}>Video not available</Text>
      )}
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
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteVideo(item.audioUrl, item.id)}>
          <Icon name="delete" size={20} color="white" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <label htmlFor="videoInput" style={styles.uploadButton}>
        <Icon name="video-library" size={24} color="white" />
        <Text style={styles.uploadButtonText}>Upload Video</Text>
      </label>
      <input id="videoInput" type="file" accept="video/*" style={styles.hiddenInput} onChange={handleVideoSelect} />

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideoItem}
        ListEmptyComponent={<Text style={styles.noVideosText}>No video files uploaded yet</Text>}
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
  videoItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  videoName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  videoPlayer: {
    width: '100%',
    maxWidth: 400,
    height: 200,
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
  shareButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF4D4D',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noVideosText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});