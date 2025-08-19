import React from 'react';
import { View, Text, TouchableOpacity,ImageBackground, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
//import {imag} from '../../assets/laptop.webp';
const LogoutScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('username');
      navigation.navigate('LoginPassword');
    } catch (error) {
      console.error('Error clearing session data:', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  return (
    <ImageBackground source={require("../../assets/laptop.webp")}  style={styles.container} imageStyle={{ opacity: 0.1 }}>
    <View style={styles.topContainer}>
      {/* Top Image */}
      {/*<Image
        source={require('../../assets/logout.png')}
        style={styles.image}
      />*/}

      <Text style={styles.title}>Are you sure you want to log out?</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
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
  image: {
    width: 80, // Adjust size as needed
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  logoutButtonText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default LogoutScreen;
