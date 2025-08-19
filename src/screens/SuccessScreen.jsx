import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useNavigation } from '@react-navigation/native';
//import {womanImage} from '../../assets/woman.jpg';

const SuccessScreen = ({ route }) => {
  const navigation = useNavigation();
  const { isSuccess } = route?.params ?? { isSuccess: false };


  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('LoginPassword'); // Navigate after 3 seconds
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {isSuccess ? (
        <>
          <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} fadeOut />
          <Image source={require("../../assets/woman.jpg")} style={styles.image}  resizeMode="contain" />
          <Text style={styles.successMessage}>Your account has been successfully created! 🎉</Text>
        </>
      ) : (
        <Text style={styles.failureMessage}>Account creation failed. 😢</Text>
      )}
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  successMessage: {
    fontSize: 22,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  failureMessage: {
    fontSize: 22,
    color: '#FF0000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 200,
    height: 300,
    resizeMode: 'contain',
  },
});
