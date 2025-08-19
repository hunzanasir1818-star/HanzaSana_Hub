import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
//import {recoverimg} from '../../assets/recover.png';
export default function FileRecoveryScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Top Image */}
     
      <Image source={require("../../assets/recover.png")} style={styles.image} resizeMode="contain" />
      <Text style={styles.sectionTitle}>Recover Deleted Files</Text>

      <TouchableOpacity
        style={[styles.button, styles.videoButton]}
        onPress={() => navigation.navigate('VideoRecovery')}
      >
        <Icon name="video-library" size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>Video Recovery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.audioButton]}
        onPress={() => navigation.navigate('AudioRecovery')}
      >
        <Icon name="audiotrack" size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>Audio Recovery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  image: {
    width: 130,
    height: 130,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4CAF50',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    width: '80%',
    justifyContent: 'center',
  },
  videoButton: {
    backgroundColor: '#4CAF50',
  },
  audioButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
