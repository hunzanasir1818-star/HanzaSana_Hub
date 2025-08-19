import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Image, ImageBackground, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore_db } from '../Config/FirebaseConfig';
import * as Crypto from 'expo-crypto';
import * as Notifications from 'expo-notifications';
import { collection, query,addDoc, where, getDocs } from 'firebase/firestore';

let AsyncStorage;
if (Platform.OS === 'web') {
  AsyncStorage = {
    getItem: async (key) => Promise.resolve(localStorage.getItem(key)),
    setItem: async (key, value) => Promise.resolve(localStorage.setItem(key, value)),
    removeItem: async (key) => Promise.resolve(localStorage.removeItem(key)),
  };
} else {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

const LoginPasswordScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const timerRef = useRef(null);

  const navigation = useNavigation();

  useEffect(() => {
    const setupNotifications = async () => {
      await Notifications.setNotificationChannelAsync('login-alerts', {
        name: 'Login Alerts',
        importance: Notifications.AndroidImportance.HIGH, // 🔥 key change here
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    };
  
    setupNotifications();
  }, []);
  
  

  useEffect(() => {
    if (isLockedOut && lockoutTimer > 0) {
      timerRef.current = setTimeout(() => {
        setLockoutTimer(prev => prev - 1);
      }, 1000);
    } else if (isLockedOut && lockoutTimer === 0) {
      setIsLockedOut(false);
      setLoginAttempts(0);
      clearTimeout(timerRef.current);
    }
  }, [lockoutTimer, isLockedOut]);

  const hashPassword = async (password) => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  };

  const triggerNotification = async (attempts, time, username) => {
    const newNotification = {
      id: Date.now().toString(),
      type: 'Login Alert',
      message: `⚠️ ${attempts} failed login attempts at ${time.toLocaleTimeString()}.`,
      username: username, // Add username to identify which user this belongs to
    };
  
    try {
      const existing = await AsyncStorage.getItem('notifications');
      const parsed = existing ? JSON.parse(existing) : [];
      parsed.unshift(newNotification);
      await AsyncStorage.setItem('notifications', JSON.stringify(parsed));
  
      await Notifications.scheduleNotificationAsync({
        content: {
          title: newNotification.type,
          body: newNotification.message,
        },
        trigger: null,
      });
    } catch (e) {
      console.error("Error storing notification:", e);
    }
  };
  
  const handleLogin = async () => {
    if (isLockedOut) {
      Alert.alert(
        'Login Temporarily Disabled',
        `⚠️ Too many failed attempts.\nPlease wait ${lockoutTimer}s before trying again.`
      );
      return;
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
  
      if (newAttempts >= 3) {
        setIsLockedOut(true);
        setLockoutTimer(30);
        const timeNow = new Date();
        await triggerNotification(newAttempts, timeNow, username); // Pass username here
        Alert.alert('Too Many Attempts', 'You are locked out for 30 seconds');
      } else {
        Alert.alert('Error', 'Incorrect Username or Password');
      }
    }
    

    if (!username || !password) {
      Alert.alert('Error', 'Username and Password cannot be empty');
      return;
    }

    try {
      const usersCollection = collection(firestore_db, 'users');
      const q = query(usersCollection, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'Username not found');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const storedPassword = userDoc.data().password;
      const userId = userDoc.id;
      const userPassphrase = userDoc.data().passphrase;

      const hashedInputPassword = await hashPassword(password);
      if (hashedInputPassword === storedPassword) {
        console.log("✅ Password matches!");

        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('passphrase', userPassphrase || "default_passphrase");

        setLoginAttempts(0); // reset on success
        navigation.navigate('fileManagement', { isSuccess: true });
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 3) {
          setIsLockedOut(true);
          setLockoutTimer(30); // lockout time in seconds
          const timeNow = new Date();
          await triggerNotification(newAttempts, timeNow);
          Alert.alert('Too Many Attempts', 'You are locked out for 30 seconds');
        } else {
          Alert.alert('Error', 'Incorrect Username or Password');
        }
      }

    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', 'Could not log in. Please try again.');
    }
  };

  return (
    <ImageBackground source={require("../../assets/woman.jpg")} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <View style={styles.topContainer}>
        <Image source={require("../../assets/passwd.png")} style={styles.itemImage} resizeMode="contain" />
        <Text style={styles.title}>
          <Text style={styles.EnterText}>Enter </Text>
          <Text style={styles.YourText}>Your </Text>
          <Text style={styles.PasswordText}>Credentials</Text>
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {isLockedOut && (
          <Text style={{ color: 'red', marginTop: 10 }}>
            Please wait {lockoutTimer}s before trying again.
          </Text>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={[styles.submitButton, isLockedOut && { backgroundColor: 'gray' }]}
  onPress={handleLogin}
  disabled={isLockedOut}
>
  <Text style={styles.submitButtonText}>
    {isLockedOut ? `Locked (${lockoutTimer}s)` : 'Login'}
  </Text>
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
    alignItems: 'center',
    padding: 20,
  },
  topContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  itemImage: {
    width: 50,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  EnterText: {
    color: '#4CAF50',
  },
  YourText: {
    color: 'black',
  },
  PasswordText: {
    color: '#FFC300',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginLeft: 10,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
    width: '60%',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LoginPasswordScreen;
