import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const imageSize = (width - 40) / 2; // 2 columns with prettier margins

const GalleryScreen = () => {
  // Mock photos for now - replace with Firebase data later
  const [photos, setPhotos] = useState([
    { id: '1', uri: 'https://picsum.photos/400/400?random=1', emoji: '📸' },
    { id: '2', uri: 'https://picsum.photos/400/400?random=2', emoji: '💕' },
    { id: '3', uri: 'https://picsum.photos/400/400?random=3', emoji: '✨' },
    { id: '4', uri: 'https://picsum.photos/400/400?random=4', emoji: '🌟' },
    { id: '5', uri: 'https://picsum.photos/400/400?random=5', emoji: '💖' },
    { id: '6', uri: 'https://picsum.photos/400/400?random=6', emoji: '🥰' },
  ]);

  const handleAddPhoto = () => {
    Alert.alert(
      '📷 Add New Photo', 
      'Capture another beautiful moment together! ✨',
      [
        { text: 'Maybe later 😊', style: 'cancel' }, 
        { text: 'Let\'s do it! 💕' }
      ]
    );
  };

  const handleLoadMore = () => {
    // TODO: Load more photos from Firebase
    // For now, add some mock photos with emojis
    const emojis = ['🌈', '🦋', '🌸', '💫', '🎀', '🌺', '💝', '🎉'];
    const newPhotos = [
      { 
        id: `${photos.length + 1}`, 
        uri: `https://picsum.photos/400/400?random=${photos.length + 1}`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      },
      { 
        id: `${photos.length + 2}`, 
        uri: `https://picsum.photos/400/400?random=${photos.length + 2}`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      },
      { 
        id: `${photos.length + 3}`, 
        uri: `https://picsum.photos/400/400?random=${photos.length + 3}`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      },
      { 
        id: `${photos.length + 4}`, 
        uri: `https://picsum.photos/400/400?random=${photos.length + 4}`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      },
    ];
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const renderPhotoGrid = () => {
    const rows = [];
    for (let i = 0; i < photos.length; i += 2) {
      rows.push(
        <View key={i} style={styles.row}>
          <View style={styles.photoContainer}>
            <Image source={{ uri: photos[i].uri }} style={styles.photo} />
            <View style={styles.photoEmoji}>
              <Text style={styles.emojiText}>{photos[i].emoji}</Text>
            </View>
          </View>
          {photos[i + 1] && (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photos[i + 1].uri }} style={styles.photo} />
              <View style={styles.photoEmoji}>
                <Text style={styles.emojiText}>{photos[i + 1].emoji}</Text>
              </View>
            </View>
          )}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Our Gallery</Text>
          <Text style={styles.subtitle}>💕 Beautiful moments captured 📸</Text>
        </View>
        <TouchableOpacity onPress={handleAddPhoto} style={styles.addButton}>
          <Text style={styles.addButtonEmoji}>📷</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.gallery}>
          {photos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📸</Text>
              <Text style={styles.emptyText}>No photos yet</Text>
              <Text style={styles.emptySubtext}>Let's start capturing beautiful moments! ✨</Text>
            </View>
          ) : (
            renderPhotoGrid()
          )}
        </View>

        {/* Load More Button at Bottom */}
        {photos.length > 0 && (
          <TouchableOpacity 
            style={styles.loadMoreButton} 
            onPress={handleLoadMore}
          >
            <Text style={styles.loadMoreText}>✨ Load More Magic ✨</Text>
            <View style={styles.sparkleContainer}>
              <Text style={styles.sparkle}>💫</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8', // Same soft pink as memories
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D63384', // Same pink as memories
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6F42C1', // Same purple as memories
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#FFE4E6',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonEmoji: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  gallery: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  photoContainer: {
    position: 'relative',
    shadowColor: '#FF69B4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  photo: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'rgba(255, 105, 180, 0.1)',
  },
  photoEmoji: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  emojiText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#D63384',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6F42C1',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 18,
    paddingHorizontal: 30,
    marginHorizontal: 20,
    marginVertical: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF69B4',
    borderStyle: 'dashed',
    shadowColor: '#FF69B4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  loadMoreText: {
    fontSize: 16,
    color: '#D63384',
    fontWeight: '600',
    marginRight: 8,
  },
  sparkleContainer: {
    marginLeft: 5,
  },
  sparkle: {
    fontSize: 16,
  },
});

export default GalleryScreen;