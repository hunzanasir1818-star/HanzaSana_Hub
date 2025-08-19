import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FirstScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Splashscreen'); // Replace with your main screen name
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Option 1: Text Only */}
      <Text style={styles.title}>Digital Locker</Text>
      
      {/* Option 2: If you want to use an image instead */}
      {/* <Image 
        source={require('./path-to-your-image.png')} 
        style={styles.logo} 
        resizeMode="contain"
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  }
});

export default FirstScreen;