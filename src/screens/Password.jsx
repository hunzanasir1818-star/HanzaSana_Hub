//Password_Rigter code
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Image, ImageBackground,
  Alert, StyleSheet, TouchableOpacity, FlatList, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore_db } from '../Config/FirebaseConfig';
import { createClient } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

// Platform-specific AsyncStorage
let AsyncStorage;
if (Platform.OS === 'web') {
  AsyncStorage = {
    getItem: async (key) => localStorage.getItem(key),
    setItem: async (key, value) => localStorage.setItem(key, value),
    removeItem: async (key) => localStorage.removeItem(key),
  };
} else {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

const supabaseUrl = 'https://pngnreibdencqqmuymjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZ25yZWliZGVuY3FxbXV5bWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNjEwNzcsImV4cCI6MjA0NzgzNzA3N30.LwZc0-osz0ab0TRINeei-udSjid9zObgsBSQ4eT4SDY';
const supabase = createClient(supabaseUrl, supabaseKey);
const VIDEO_CDN_URL = `${supabaseUrl}/storage/v1/object/public/Videos/`;
const AUDIO_CDN_URL = `${supabaseUrl}/storage/v1/object/public/Audios/`;

const PasswordEntryScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);
  const navigation = useNavigation();

  const isValidForm = username && password.length >= 6 && password === confirmPassword;

  const hashPassword = async (password) => {
    try {
      return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
    } catch (error) {
      console.error("Hashing error:", error);
      throw new Error("Password hashing failed");
    }
  };

  const checkUsernameExists = async (username) => {
    try {
      console.log(`Checking username: ${username}`);
      const usersRef = collection(firestore_db, "users");
      const q = query(usersRef, where("username", "==", username));
      
      console.log("Executing query...");
      const querySnapshot = await getDocs(q);
      
      console.log("Query completed. Results:", {
        size: querySnapshot.size,
        docs: querySnapshot.docs.map(doc => doc.data())
      });
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking username:", error);
      throw error; // Re-throw to handle in calling function
    }
  };

  const validatePassword = async () => {
    console.log(`Starting validation on ${Platform.OS}`);
  
    try {
      // Basic validation
      if (!username.trim()) throw new Error('Username cannot be empty');
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      if (password !== confirmPassword) throw new Error('Passwords do not match');
  
      // Check username availability
      console.log('Checking username...');
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) throw new Error('Username already taken');
  
      // Create auth user first
      console.log('Creating auth user...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        `${username}@digitallocker.com`, // Fake email domain
        password
      );
      
      const userId = userCredential.user.uid;
      const hashedPassword = await hashPassword(password);
  
      // Create Firestore user document
      console.log('Creating Firestore document...');
      await setDoc(doc(firestore_db, 'users', userId), {
        userId,
        username,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        videos: [],
        audios: [],
      });
  
      // Store locally
      await AsyncStorage.multiSet([
        ['userId', userId],
        ['username', username]
      ]);
  
      console.log('Registration complete!');
      Alert.alert('Success', 'Account created successfully!', [{
        text: 'OK',
        onPress: () => navigation.navigate('LoginPINPassword', { isSuccess: true }),
      }]);
  
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = error.message;
      
      // Firebase error mapping
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Username already exists';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters';
            break;
        }
      }
      
      Alert.alert('Registration Failed', errorMessage);
    }
  };;

  const fetchUserMedia = async () => {
    try {
      const usersRef = collection(firestore_db, 'users');
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setVideos(userData.videos?.map(video => `${VIDEO_CDN_URL}${video}`) || []);
        setAudios(userData.audios?.map(audio => `${AUDIO_CDN_URL}${audio}`) || []);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  useEffect(() => {
    if (username.trim() !== '') {
      fetchUserMedia();
    }
  }, [username]);

  return (
    <ImageBackground source={require("../../assets/woman.jpg")} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <View style={styles.topContainer}>
        <Image source={require("../../assets/passwd.png")} style={styles.itemImage} resizeMode="contain" />
        <Text style={styles.title}>
          <Text style={styles.setText}>Set </Text>
          <Text style={styles.aText}>a </Text>
          <Text style={styles.passwordText}>Password</Text>
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#888"
          />
          <Icon name="person" size={24} color="#4CAF50" style={styles.icon} />
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            secureTextEntry={!passwordVisible}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            secureTextEntry={!confirmPasswordVisible}
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
            <Icon name={confirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { opacity: isValidForm ? 1 : 0.5 }]}
          onPress={validatePassword}
          disabled={!isValidForm}
        >
          <Text style={styles.submitButtonText}>Register</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.videoContainer}>
            <Text style={styles.videoText}>{item}</Text>
          </View>
        )}
      />

      <FlatList
        data={audios}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    padding: 20,
  },
  topContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  itemImage: {
    width: 50,
    height: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  setText: {
    color: '#4CAF50',
  },
  aText: {
    color: 'black',
  },
  passwordText: {
    color: '#FFC300',
  },
  inputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    width: '80%',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoContainer: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  videoText: {
    color: '#333',
    fontSize: 14,
  },
});

export default PasswordEntryScreen; 