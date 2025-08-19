import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function PasswordScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Top Decorative Element */}
      <View style={styles.topDecoration} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo Header */}
        <View style={styles.logoHeader}>
          <Image 
            source={require('../../assets/passwd.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
        </View>

        {/* Main Content Card */}
        <View style={styles.mainCard}>
          <Text style={styles.headerText}>
            <Text style={styles.createText}>Create </Text>
            <Text style={styles.accountText}>Account</Text>
          </Text>
          
          <Text style={styles.subText}>
            Protect your digital identity with{"\n"}bank-level security
          </Text>

          {/* Security Features */}
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
        </View>

        {/* CTA Button */}
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Password')}
        >
          <Icon name="vpn-key" size={22} color="white" />
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Auth Options */}
      <View style={styles.authOptions}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Already registered?</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('LoginPINPassword')}
        >
          <Text style={styles.loginText}>Sign In to Your Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#e0f0e0',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  scrollContainer: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 120,
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    color: '#2d3748',
    fontWeight: '700',
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  headerText: {
    marginBottom: 15,
  },
  createText: {
    fontSize: 28,
    color: '#FFC300',
    fontWeight: '800',
  },
  accountText: {
    fontSize: 28,
    color: '#4CAF50',
    fontWeight: '800',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
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
  ctaButton: {
    backgroundColor: '#FFC300',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginTop:30,
  },
  ctaText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  authOptions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#fff',
    fontSize: 14,
  },
  loginButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});