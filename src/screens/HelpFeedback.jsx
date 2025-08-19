import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function HelpAndFeedbackScreen() {
  const [feedback, setFeedback] = useState('');

  const handleSubmitFeedback = () => {
    if (feedback.trim() === '') {
      Alert.alert('Feedback Required', 'Please enter your feedback before submitting.');
      return;
    }
  
    // Logic to handle feedback submission (e.g., send to server or database)
  
    Alert.alert(
      'Feedback Received',
      'Thank you! Your feedback has been successfully received and will help us improve the app experience.',
      [{ text: 'OK', onPress: () => console.log('User acknowledged feedback') }]
    );
  
    setFeedback('');
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Help & Feedback</Text>
      <Text style={styles.paragraph}>
        If you need help or have any suggestions to improve our app, please let us know below.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Type your feedback here..."
        placeholderTextColor="#888"
        value={feedback}
        onChangeText={setFeedback}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmitFeedback}>
        <Text style={styles.buttonText}>Submit Feedback</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
