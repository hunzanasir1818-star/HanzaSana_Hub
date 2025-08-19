import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function LoginPassword({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Background Decoration */}
      <View style={styles.backgroundDesign} />
      
      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* App Logo */}
        <Image 
          source={require('../../assets/passwd.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Welcome Header */}
        <View style={styles.headerContainer}>
        <Text>
    <Text style={styles.WelcomeText}>Welcome </Text>
    <Text style={styles.BackText}>Back</Text>
  </Text>
          <Text style={styles.greetingText}>Secure your digital life</Text>
        </View>

        {/* Password Button */}
        <TouchableOpacity 
          style={styles.passwordButton}
          onPress={() => navigation.navigate('LoginPassword')}
        >
          <View style={styles.buttonInner}>
            <Icon name="vpn-key" size={22} color="white" />
            <Text style={styles.buttonText}>Login with Password</Text>
          </View>
          <Icon name="arrow-forward" size={22} color="white" />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Alternative Options */}
        <View style={styles.securityFeatures}>
                    <View style={styles.featureBadge}>
                      <Icon name="lock" size={18} color="#4CAF50" />
                      <Text style={styles.featureText}>256-bit Encryption</Text>
                    </View>
                    <View style={styles.featureBadge}>
                      <Icon name="fingerprint" size={18} color="#4CAF50" />
                      <Text style={styles.featureText}>Hashing Password</Text>
                    </View>
                    </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Pressable onPress={() => navigation.navigate('PinPasswordScreen')}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </Pressable>
      </View>

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundDesign: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: '#e0f0e0',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
 
  greetingText: {
    fontSize: 16,
    color: '#666',
    marginTop:60,
  },
  
  WelcomeText: {
    fontSize: 28,
    color: '#FFC300',
    fontWeight: '800',
  },
  BackText: {
    fontSize: 28,
    color: '#4CAF50',
    fontWeight: '800',
  },
  passwordButton: {
    backgroundColor: '#4CAF50',
    width: '100%',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop:40,
    elevation: 5,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontWeight: '500',
  },
  alternativeOptions: {
    width: '100%',
    marginBottom: 40,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 15,
  },
  socialButtonText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    marginRight: 5,
  },
  signUpText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  decorativeGraphic: {
    position: 'absolute',
    width: 200,
    height: 350,
    bottom: 80,
    right: 0,
    opacity: 0.9,
    zIndex: -1,
  },
  securityFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    gap: 10,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f0e0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#2d3748',
    marginLeft: 8,
    fontWeight: '500',
  },
});