import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Supabase client
const supabaseUrl = 'https://pngnreibdencqqmuymjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZ25yZWliZGVuY3FxbXV5bWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNjEwNzcsImV4cCI6MjA0NzgzNzA3N30.LwZc0-osz0ab0TRINeei-udSjid9zObgsBSQ4eT4SDY';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home({ navigation }) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('bundle');
  const [sharedMedia, setSharedMedia] = useState([]);
  const [dataWiped, setDataWiped] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const checkDataWiped = async () => {
      const wiped = await AsyncStorage.getItem('dataWiped');
      setDataWiped(wiped === 'true');
    };
    checkDataWiped();
    
    if (selectedCategory === 'recent') {
      loadSharedMedia();
    }
  }, [selectedCategory]);

  const loadSharedMedia = async () => {
    try {
      const stored = await AsyncStorage.getItem('shared_media');
      const localMedia = stored ? JSON.parse(stored) : [];
      
      if (!supabaseUrl || !supabaseKey) {
        setSharedMedia(localMedia);
        return;
      }
      
      const { data: audioFiles, error: audioError } = await supabase
        .storage
        .from('Audios')
        .list();
      
      const { data: videoFiles, error: videoError } = await supabase
        .storage
        .from('Videos')
        .list();
      
      if (audioError || videoError) {
        console.error('Error fetching files:', audioError || videoError);
        setSharedMedia(localMedia);
        return;
      }
      
      // Get signed URLs for each file
      const audioWithUrls = await Promise.all(audioFiles.map(async (file) => {
        const { data: { signedUrl } } = await supabase
          .storage
          .from('Audios')
          .createSignedUrl(file.name, 3600); // 1 hour expiry
        
        return {
          id: file.id,
          fileName: file.name,
          type: 'audio',
          date: file.created_at,
          path: signedUrl
        };
      }));
      
      const videoWithUrls = await Promise.all(videoFiles.map(async (file) => {
        const { data: { signedUrl } } = await supabase
          .storage
          .from('Videos')
          .createSignedUrl(file.name, 3600); // 1 hour expiry
        
        return {
          id: file.id,
          fileName: file.name,
          type: 'video',
          date: file.created_at,
          path: signedUrl
        };
      }));
      
      const supabaseMedia = [
        ...audioWithUrls,
        ...videoWithUrls,
        ...localMedia
      ];
      
      supabaseMedia.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSharedMedia(supabaseMedia);
    } catch (e) {
      console.error('Failed to load shared media', e);
      setSharedMedia([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSharedMedia();
    setRefreshing(false);
  };

  const featureCards = [
    {
      id: '1',
      title: 'Media Bundle',
      icon: 'collections',
      color: '#4CAF50',
      action: () => setSelectedCategory('bundle')
    },
    {
      id: '2',
      title: 'Recent Files',
      icon: 'history',
      color: '#FFC300',
      action: () => setSelectedCategory('recent')
    },
    {
      id: '3',
      title: 'Security',
      icon: 'security',
      color: '#333',
      action: () => navigation.navigate('ForgotPassword')
    },
    {
      id: '4',
      title: 'Recovery',
      icon: 'restore',
      color: '#2196F3',
      action: () => navigation.navigate('FileRecovery')
    }
  ];

  const menuItems = [
    { label: 'Trash', icon: 'delete', action: () => navigation.navigate('FileRecovery') },
    { label: 'About', icon: 'info', action: () => navigation.navigate('About') },
    { label: 'Help', icon: 'help', action: () => navigation.navigate('HelpFeedback') },
    { label: 'Settings', icon: 'settings', action: () => navigation.navigate('Settings') },
    { label: 'Logout', icon: 'exit-to-app', action: () => navigation.navigate('Logout') }
  ];

  const handleDataWipe = async () => {
    Alert.alert(
      'Confirm Wipe',
      'This will permanently delete all data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Wipe Data', 
          onPress: async () => {
            try {
              await AsyncStorage.setItem('dataWiped', 'true');
              setDataWiped(true);
              Alert.alert('Success', 'All data has been wiped');
            } catch (error) {
              Alert.alert('Error', 'Failed to wipe data');
            }
          }
        }
      ]
    );
  };

  const renderFeatureCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={item.action}
    >
      <Icon name={item.icon} size={32} color="white" />
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderRecentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentItem}
      onPress={() => {
        if (item.type === 'video') {
          navigation.navigate('VideoPlayer', { 
            videoUrl: item.path,
            videoTitle: item.fileName 
          });
        } else {
          navigation.navigate('AudioPlayer', { 
            audioUrl: item.path,
            audioTitle: item.fileName 
          });
        }
      }}
    >
      <Icon name={item.type === 'video' ? 'videocam' : 'audiotrack'} size={24} color="#4CAF50" />
      <View style={styles.recentItemTextContainer}>
        <Text style={styles.recentItemTitle}>{item.fileName}</Text>
        <Text style={styles.recentItemDate}>{new Date(item.date).toLocaleString()}</Text>
      </View>
      <Icon name="more-vert" size={24} color="#888" />
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (selectedCategory) {
      case 'bundle':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('VideoUpload')}
              >
                <View style={styles.actionButtonContent}>
                  <Icon name="videocam" size={28} color="#4CAF50" />
                  <Text style={styles.actionText}>Videos</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: '60%'}]} />
                  </View>
                  <Text style={styles.progressText}>60%</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('AudioUpload')}
              >
                <View style={styles.actionButtonContent}>
                  <Icon name="audiotrack" size={28} color="#4CAF50" />
                  <Text style={styles.actionText}>Audios</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: '45%'}]} />
                  </View>
                  <Text style={styles.progressText}>45%</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <View style={styles.actionButtonContent}>
                  <Icon name="lock" size={28} color="#4CAF50" />
                  <Text style={styles.actionText}>Password</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: '80%'}]} />
                  </View>
                  <Text style={styles.progressText}>80%</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => navigation.navigate('DataWipe')}
              >
                <View style={styles.actionButtonContent}>
                  <Icon name="delete-sweep" size={28} color="#4CAF50" />
                  <Text style={styles.actionText}>{dataWiped ? 'Wiped' : 'Wipe Data'}</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {width: '30%'}]} />
                  </View>
                  <Text style={styles.progressText}>30%</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 'recent':
        return (
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent Files</Text>
            <FlatList
              data={sharedMedia}
              renderItem={renderRecentItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.recentListContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No recent files found</Text>
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
            />
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Digital Locker</Text>
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
          <Icon name="more-vert" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {dropdownVisible && (
        <View style={styles.dropdownMenu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                item.action();
                setDropdownVisible(false);
              }}
            >
              <Icon name={item.icon} size={22} color="#4CAF50" />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Feature Cards */}
      <FlatList
        data={featureCards}
        renderItem={renderFeatureCard}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardContainer}
      />

      {/* Main Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => setSelectedCategory('bundle')}
        >
          <Icon name="home" size={24} color={selectedCategory === 'bundle' ? '#4CAF50' : '#888'} />
          <Text style={[styles.navText, selectedCategory === 'bundle' && styles.navTextActive]}>Home</Text>
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
          onPress={() => setSelectedCategory('recent')}
        >
          <Icon name="history" size={24} color={selectedCategory === 'recent' ? '#4CAF50' : '#888'} />
          <Text style={[styles.navText, selectedCategory === 'recent' && styles.navTextActive]}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings" size={24} color="#888" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4CAF50',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  cardContainer: {
    padding: 16,
  },
  card: {
    width: 150,
    height: 150,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionContainer: {
    flex: 1,
    padding: 16,
    marginBottom: 250,
  },
  recentContainer: {
    flex: 1,
    padding: 16,
    marginBottom: 130,
  },
  recentListContent: {
    paddingBottom: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  actionButtonContent: {
    alignItems: 'center',
    width: '100%',
    height:'100%',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  recentItemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  recentItemDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
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
  progressBar: {
    height: 4,
    width: '80%',
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#FFC300',
    marginTop: 4,
    fontWeight: '500',
  }
});