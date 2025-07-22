import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../../firebaseConfig'; // Your Firebase config

const { width } = Dimensions.get('window');
const imageSize = (width - 40) / 2;

const GalleryScreen = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Load photos from Firebase
  useEffect(() => {
    const photosRef = collection(db, 'gallery');
    const q = query(photosRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoList = [];
      snapshot.forEach((doc) => {
        photoList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setPhotos(photoList);
      setLoading(false);
    }, (error) => {
      console.error('Error loading photos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Request camera/gallery permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert('Permissions needed', 'We need camera and gallery permissions to add photos! 📸');
      return false;
    }
    return true;
  };

  // Upload image to Firebase Storage
  const uploadImageToStorage = async (uri, filename) => {
    try {
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create storage reference
      const imageRef = ref(storage, `gallery/${filename}`);
      
      // Upload image
      await uploadBytes(imageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Save photo metadata to Firestore
  const savePhotoToFirestore = async (imageUrl, emoji) => {
    try {
      await addDoc(collection(db, 'gallery'), {
        uri: imageUrl,
        emoji: emoji,
        createdAt: serverTimestamp(),
        // Add user info when you implement auth
        // uploadedBy: user.uid,
        // uploaderName: user.displayName
      });
    } catch (error) {
      console.error('Error saving photo metadata:', error);
      throw error;
    }
  };

  // Handle adding new photo
  const handleAddPhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      '📷 Add New Photo',
      'Choose how to add your beautiful moment! ✨',
      [
        { text: 'Cancel 😊', style: 'cancel' },
        { text: 'Camera 📸', onPress: () => pickImage('camera') },
        { text: 'Gallery 🖼️', onPress: () => pickImage('gallery') }
      ]
    );
  };

  // Pick image from camera or gallery
  const pickImage = async (source) => {
    try {
      setUploading(true);
      
      let result;
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const filename = `photo_${Date.now()}.jpg`;
        
        // Upload to Firebase Storage
        const imageUrl = await uploadImageToStorage(asset.uri, filename);
        
        // Random emoji for the photo
        const emojis = ['💕', '✨', '🌟', '💖', '🥰', '📸', '🌈', '🦋', '🌸', '💫'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        // Save to Firestore
        await savePhotoToFirestore(imageUrl, randomEmoji);
        
        Alert.alert('Success! 🎉', 'Your beautiful moment has been added to our gallery! 💕');
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert('Oops! 😅', 'Something went wrong. Please try again! 💕');
    } finally {
      setUploading(false);
    }
  };

  // Handle loading more photos (pagination)
  const handleLoadMore = () => {
    // TODO: Implement pagination with Firebase
    // For now, show a cute message
    Alert.alert('✨ All caught up! ✨', 'You\'ve seen all our beautiful moments! Add more photos to keep the magic going! 💕');
  };

  // Render photo grid
  const renderPhotoGrid = () => {
    const rows = [];
    for (let i = 0; i < photos.length; i += 2) {
      rows.push(
        <View key={i} style={styles.row}>
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={() => {
              // TODO: Open full-screen view
              Alert.alert('💕 Beautiful!', 'Full-screen view coming soon! ✨');
            }}
          >
            <Image source={{ uri: photos[i].uri }} style={styles.photo} />
            <View style={styles.photoEmoji}>
              <Text style={styles.emojiText}>{photos[i].emoji}</Text>
            </View>
          </TouchableOpacity>
          {photos[i + 1] && (
            <TouchableOpacity 
              style={styles.photoContainer}
              onPress={() => {
                Alert.alert('💕 Beautiful!', 'Full-screen view coming soon! ✨');
              }}
            >
              <Image source={{ uri: photos[i + 1].uri }} style={styles.photo} />
              <View style={styles.photoEmoji}>
                <Text style={styles.emojiText}>{photos[i + 1].emoji}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return rows;
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#D63384" />
        <Text style={styles.loadingText}>✨ Loading our beautiful moments... 💕</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Our Gallery</Text>
          <Text style={styles.subtitle}>💕 Beautiful moments captured 📸</Text>
        </View>
        <TouchableOpacity 
          onPress={handleAddPhoto} 
          style={[styles.addButton, uploading && styles.addButtonDisabled]}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#D63384" />
          ) : (
            <Text style={styles.addButtonEmoji}>📷</Text>
          )}
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
              <TouchableOpacity 
                style={styles.firstPhotoButton}
                onPress={handleAddPhoto}
              >
                <Text style={styles.firstPhotoText}>Add our first photo! 💕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderPhotoGrid()
          )}
        </View>

        {photos.length > 0 && (
          <TouchableOpacity 
            style={styles.loadMoreButton} 
            onPress={handleLoadMore}
          >
            <Text style={styles.loadMoreText}>✨ All caught up! ✨</Text>
            <View style={styles.sparkleContainer}>
              <Text style={styles.sparkle}>💫</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <View style={styles.uploadingContent}>
            <ActivityIndicator size="large" color="#D63384" />
            <Text style={styles.uploadingText}>✨ Adding magic to our gallery... 💕</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#D63384',
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
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
    color: '#D63384',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6F42C1',
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
  addButtonDisabled: {
    opacity: 0.7,
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
    marginBottom: 30,
  },
  firstPhotoButton: {
    backgroundColor: '#D63384',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  firstPhotoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 245, 248, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContent: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadingText: {
    fontSize: 16,
    color: '#D63384',
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default GalleryScreen;