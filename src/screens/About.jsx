import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
//import {imagepss} from '../../assets/passwd.png' ;
export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Add Image at the Top */}
      <Image
         source={require( "../../assets/passwd.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.heading}>About Digital Locker</Text>
      <Text style={styles.paragraph}>
        Welcome to the Digital Locker app! This app is designed to provide you with a secure and user-friendly way to store and manage your important files, documents, and media. Whether it's personal files or work-related data, the Digital Locker ensures everything is protected and easily accessible.
      </Text>
      <Text style={styles.subHeading}>Key Features:</Text>
      <Text style={styles.feature}>• Secure file storage with encryption</Text>
      <Text style={styles.feature}>• Easy file uploads and downloads</Text>
      <Text style={styles.feature}>• Organized file management with categories</Text>
      <Text style={styles.feature}>• Access logs to monitor file activities</Text>
      <Text style={styles.feature}>• Integration with cloud services</Text>
      <Text style={styles.feature}>• Quick sharing with advanced privacy controls</Text>

      <Text style={styles.subHeading}>Developers:</Text>
      <Text style={styles.developer}>• Hanza</Text>
      <Text style={styles.developer}>• Sana</Text>

      <Text style={styles.paragraph}>
        We are passionate about making digital security and file management simpler and safer for everyone. Thank you for choosing Digital Locker. If you have any feedback or need assistance, please reach out to us through the Help & Feedback section.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    marginBottom: 12,
  },
  feature: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
  },
  developer: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 8,
  },
});
