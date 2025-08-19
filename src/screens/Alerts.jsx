import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons'; // Add this import

const NotificationsScreen = ({ navigation }) => { // Add navigation prop
  const [notifications, setNotifications] = useState([]);
  const [username, setUsername] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // Add selectedCategory state

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get the current logged in username
        const currentUser = await AsyncStorage.getItem('username');
        setUsername(currentUser);
        
        // Load all notifications
        const stored = await AsyncStorage.getItem('notifications');
        const allNotifications = stored ? JSON.parse(stored) : [];
        
        // Filter notifications for current user only
        const userNotifications = allNotifications.filter(
          notification => notification.username === currentUser
        );
        
        setNotifications(userNotifications);
      } catch (e) {
        console.error('Failed to load notifications', e);
      }
    };

    loadData();
  }, []);

  const clearAllNotifications = async () => {
    try {
      // Load all notifications first
      const stored = await AsyncStorage.getItem('notifications');
      const allNotifications = stored ? JSON.parse(stored) : [];
      
      // Remove only notifications for current user
      const updatedNotifications = allNotifications.filter(
        notification => notification.username !== username
      );
      
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      setNotifications([]);
    } catch (e) {
      console.error('Failed to clear notifications', e);
    }
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationType}>{item.type}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Notifications</Text>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAllNotifications} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notifications yet.</Text>
          }
        />
      </View>
      
      {/* Bottom Navigation - moved inside main container */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('fileManagement')}>
          <Icon name="home" size={24} color={selectedCategory === 'bundle' ? '#4CAF50' : '#888'} />
          <Text style={[styles.navText, selectedCategory === 'bundle' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Alerts')}>
          <Icon name="notifications" size={24} color="#888" />
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('fileManagement')}>
          <Icon name="history" size={24} color={selectedCategory === 'Recent' ? '#4CAF50' : '#888'} />
          <Text style={[styles.navText, selectedCategory === 'recent' && styles.navTextActive]}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings" size={24} color="#888" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notificationItem: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  notificationType: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    color: '#fff',
    marginTop: 50,
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomNav: {
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

export default NotificationsScreen;