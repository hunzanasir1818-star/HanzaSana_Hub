import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pngnreibdencqqmuymjz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZ25yZWliZGVuY3FxbXV5bWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNjEwNzcsImV4cCI6MjA0NzgzNzA3N30.LwZc0-osz0ab0TRINeei-udSjid9zObgsBSQ4eT4SDY'; // Replace with your Supabase Key
const supabase = createClient(supabaseUrl, supabaseKey);

const CDNURL = 'https://pngnreibdencqqmuymjz.supabase.co/storage/v1/object/public/Videos2/';

export default function VideosRecoveryScreen() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideosFromBucket();
  }, []);

  const fetchVideosFromBucket = async () => {
    try {
      const { data, error } = await supabase.storage.from('Videos2').list('', { limit: 100, offset: 0 });
      if (error) throw error;

      const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.flv'];
      const videosData = data.filter(video =>
        videoExtensions.some(ext => video.name.toLowerCase().endsWith(ext))
      ).map(video => ({
        id: video.name,
        name: video.name,
        url: CDNURL + video.name,
        selected: false
      }));

      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching videos:', error);
      Alert.alert('Error', 'Failed to fetch videos.');
    }
  };

  const toggleSelect = (id) => {
    setVideos(prevVideos =>
      prevVideos.map(video => video.id === id ? { ...video, selected: !video.selected } : video)
    );
  };

  const recoverSelectedVideos = async () => {
    const selectedVideos = videos.filter(video => video.selected);
    if (selectedVideos.length === 0) {
      Alert.alert('No Selection', 'Please select at least one video to recover.');
      return;
    }
  
    try {
      await Promise.all(selectedVideos.map(async (video) => {
        // Check if the video already exists in the 'Videos' bucket
        const { data: existingFiles, error: checkError } = await supabase.storage.from('Videos').list('', { limit: 100 });
        if (checkError) {
          console.error(`Error checking existing files:`, checkError);
          return;
        }
  
        const fileExists = existingFiles.some(file => file.name === video.name);
        if (fileExists) {
          console.warn(`Skipping ${video.name}, already exists in Videos bucket.`);
          return;
        }
  
        // Get signed URL for the video in 'Videos2'
        const { data: signedUrlData, error: urlError } = await supabase
        .storage
        .from('Videos2')
        .createSignedUrl(video.name, 300);
      
      if (urlError || !signedUrlData?.signedUrl) {
        console.error(`Error getting signed URL for ${video.name}:`, urlError);
        Alert.alert('Error', `Failed to generate signed URL for ${video.name}`);
        return;
      }
      
  
        // Fetch the file from the signed URL
        const response = await fetch(signedUrlData.signedUrl);
        if (!response.ok) {
          console.error(`Error fetching ${video.name} from Videos2`);
          return;
        }
  
        const blob = await response.blob();
        const contentType = response.headers.get('Content-Type') || 'video/mp4';
  
        // Upload the video to 'Videos' bucket
        const { error: uploadError } = await supabase.storage.from('Videos').upload(video.name, blob, { contentType });
        if (uploadError) {
          console.error(`Error uploading ${video.name} to Videos:`, uploadError);
          return;
        }
  
        // Delete the video from 'Videos2'
        const { error: deleteError } = await supabase.storage.from('Videos2').remove([video.name]);
        if (deleteError) {
          console.error(`Error deleting ${video.name} from Videos2:`, deleteError);
          return;
        }
      }));
  
      Alert.alert('Success', 'Selected videos recovered successfully.');
      setVideos(prevVideos => prevVideos.filter(video => !video.selected));
    } catch (error) {
      console.error('Error recovering videos:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };
  

  const renderVideo = ({ item }) => (
    <View style={styles.videoItem}>
      <TouchableOpacity onPress={() => toggleSelect(item.id)}>
        <Icon
          name={item.selected ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color={item.selected ? '#4CAF50' : '#ccc'}
        />
      </TouchableOpacity>
      <Text style={styles.videoName}>{item.name}</Text>
      <TouchableOpacity onPress={() => Alert.alert('Video URL', item.url)}>
        <Icon name="play-arrow" size={24} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Videos from Recovery</Text>
      {videos.length > 0 ? (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={renderVideo}
        />
      ) : (
        <Text style={styles.emptyText}>No videos available.</Text>
      )}

      {videos.some(video => video.selected) && (
        <TouchableOpacity style={styles.recoverButton} onPress={recoverSelectedVideos}>
          <Text style={styles.recoverButtonText}>Recover Selected Videos</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#4CAF50',
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  videoName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 8,
  },
  recoverButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  recoverButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
