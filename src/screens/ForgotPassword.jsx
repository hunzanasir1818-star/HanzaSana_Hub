import React, { useState } from 'react';
import { View, Text, TextInput, Image, Alert, TouchableOpacity, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import firebase_app from '../Config/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
//import bcrypt from 'bcryptjs';
//import {bottomImage} from "../../assets/laptop.webp"; // Add your image path here
//import {passimg} from '../../assets/passwd.png';
const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const db = getFirestore(firebase_app);

  const handleResetPassword = async () => {
    if (!usernameInput || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', usernameInput));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid Username. Only registered users can reset passwords.');
        return;
      }

      // Fetch the user document
      const userDoc = querySnapshot.docs[0];
      const userRef = doc(db, 'users', userDoc.id);

      // Hash the new password using Expo Crypto
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        newPassword
      );

      await updateDoc(userRef, { password: hashedPassword });

      Alert.alert('Password Reset Successful', 'Your password has been updated.');
      navigation.navigate('LoginPassword');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Error resetting password. Please try again.');
    }
  };

  return (
    <ImageBackground source={require("../../assets/laptop.webp")}  style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <View style={styles.topContainer}>
        <Image source={require("../../assets/passwd.png")} style={styles.itemImage} resizeMode="contain"  />
        <Text style={styles.subtitle}>
          <Text style={styles.ResetText}>Reset </Text>
          <Text style={styles.yourText}>Your</Text>
          <Text style={styles.passwordText}>Password</Text>
        </Text>
      </View>
      
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="person" size={18} color="#4CAF50" />
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={usernameInput}
            onChangeText={setUsernameInput}
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed" size={18} color="#4CAF50" />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!passwordVisible}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={21} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed" size={18} color="#4CAF50" />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!passwordVisible}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={21} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
          <Text style={styles.resetButtonText}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('LoginPassword')}>
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
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
  subtitle: {
    fontSize: 22,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemImage: {
    width: 50,
    height: 60,
    marginBottom: 10,
  },
  ResetText: {
    color: '#4CAF50',
  },
  yourText: {
    color: 'black',
  },
  passwordText: {
    marginLeft: 5,
    color: '#FFC300',
  },
  inputContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    height: 40,
    flex: 1,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: height * 0.015,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
