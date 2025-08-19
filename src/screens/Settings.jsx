import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';

const AccountSettingsScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(''); // Added selectedCategory state

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'PinPasswordScreen' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Could not log out. Please try again.');
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with Brand Color */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account Settings</Text>
        </View>

        {/* App Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>App Info</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client version</Text>
            <Text style={styles.infoValue}>2.32.19</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Supported SDK</Text>
            <Text style={styles.infoValue}>52</Text>
          </View>
        </View>

        {/* Logout Button Section */}
        <View style={styles.actionSection}>
          {/* Added text above logout button */}
          <View style={styles.logoutWarning}>
            <Icon name="info" size={18} color="#555" style={styles.infoIcon} />
            <Text style={styles.warningText}>
              You'll need to login again to access your account after logging out.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={logoutLoading}
          >
            {logoutLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Icon name="exit-to-app" size={20} color="white" />
            )}
            <Text style={styles.buttonText}>
              {logoutLoading ? 'Logging Out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation - moved outside ScrollView */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('fileManagement')}
        >
          <Icon 
            name="home" 
            size={24} 
            color={selectedCategory === 'bundle' ? '#4CAF50' : '#888'} 
          />
          <Text style={[
            styles.navText, 
            selectedCategory === 'bundle' && styles.navTextActive
          ]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('Alerts')}
        >
          <Icon name="notifications" size={24} color="#888" />
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('fileManagement')}>
        
          <Icon 
            name="history" 
            size={24} 
            color={selectedCategory === 'recent' ? '#4CAF50' : '#888'} 
          />
          <Text style={[
            styles.navText, 
            selectedCategory === 'recent' && styles.navTextActive
          ]}>
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings" size={24} color="#4CAF50" />
          <Text style={[styles.navText, styles.navTextActive]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    paddingBottom: 80, // Added padding to accommodate bottom nav
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4CAF50',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 50,
  },
  logoutWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#888',
  },
  navTextActive: {
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default AccountSettingsScreen;