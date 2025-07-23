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
  ActivityIndicator,
  TextInput,
  Modal,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../../firebaseConfig'; // Your Firebase config
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const MemoriesScreen = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDescription, setMemoryDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💕');
  const [memoryDate, setMemoryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const emojiOptions = ['💕', '💋', '🎉', '⛰️', '🗝️', '🌟', '💖', '🥰', '🌈', '🦋', '🌸', '💫', '✨', '🎂', '🏠', '📸'];

  // Load memories from Firebase
  useEffect(() => {
    const memoriesRef = collection(db, 'memories');
    const q = query(memoriesRef, orderBy('date', 'asc')); // Order by date ascending (oldest first)
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memoriesList = [];
      snapshot.forEach((doc) => {
        memoriesList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setMemories(memoriesList);
      setLoading(false);
    }, (error) => {
      console.error('Error loading memories:', error);
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
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const imageRef = ref(storage, `memories/${filename}`);
      await uploadBytes(imageRef, blob);
      
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Save memory to Firestore
  const saveMemoryToFirestore = async (imageUrl, title, description, emoji, date) => {
    try {
      await addDoc(collection(db, 'memories'), {
        title: title,
        description: description,
        date: date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD format
        emoji: emoji,
        uri: imageUrl,
        createdAt: serverTimestamp(),
        // Add user info when you implement auth
        // uploadedBy: user.uid,
        // uploaderName: user.displayName
      });
    } catch (error) {
      console.error('Error saving memory:', error);
      throw error;
    }
  };

  // Update memory in Firestore
  const updateMemoryInFirestore = async (memoryId, title, description, emoji, date, imageUrl = null) => {
    try {
      const updateData = {
        title: title,
        description: description,
        date: date.toISOString().split('T')[0],
        emoji: emoji,
        updatedAt: serverTimestamp(),
      };
      
      // Only update image if a new one was selected
      if (imageUrl) {
        updateData.uri = imageUrl;
      }
      
      await updateDoc(doc(db, 'memories', memoryId), updateData);
    } catch (error) {
      console.error('Error updating memory:', error);
      throw error;
    }
  };

  // Delete memory from Firestore
  const deleteMemoryFromFirestore = async (memoryId) => {
    try {
      await deleteDoc(doc(db, 'memories', memoryId));
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  };

  // Handle adding new memory
  const handleAddMemory = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      '✨ Add New Memory',
      'Choose how to add your magical moment! 💫',
      [
        { text: 'Cancel 😊', style: 'cancel' },
        { text: 'Camera 📸', onPress: () => pickImage('camera') },
        { text: 'Gallery 🖼️', onPress: () => pickImage('gallery') }
      ]
    );
  };

  // Handle editing a memory
  const handleEditMemory = (memory) => {
    setEditingMemory(memory);
    setIsEditing(true);
    setMemoryTitle(memory.title);
    setMemoryDescription(memory.description);
    setSelectedEmoji(memory.emoji);
    setMemoryDate(new Date(memory.date));
    setSelectedImage(memory.uri); // Show current image
    setModalVisible(true);
  };

  // Handle deleting a memory
  const handleDeleteMemory = (memory) => {
    Alert.alert(
      '💔 Delete Memory',
      `Are you sure you want to delete "${memory.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel 😊', style: 'cancel' },
        { 
          text: 'Delete 🗑️', 
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);
              await deleteMemoryFromFirestore(memory.id);
              Alert.alert('Deleted! 💔', 'The memory has been removed from our love story.');
            } catch (error) {
              console.error('Error deleting memory:', error);
              Alert.alert('Oops! 😅', 'Something went wrong. Please try again! 💕');
            } finally {
              setUploading(false);
            }
          }
        }
      ]
    );
  };

  // Show memory options (edit/delete)
  const showMemoryOptions = (memory) => {
    Alert.alert(
      '💕 Memory Options',
      `What would you like to do with "${memory.title}"?`,
      [
        { text: 'Cancel 😊', style: 'cancel' },
        { text: 'Edit ✏️', onPress: () => handleEditMemory(memory) },
        { text: 'Delete 🗑️', style: 'destructive', onPress: () => handleDeleteMemory(memory) }
      ]
    );
  };

  // Pick image from camera or gallery
  const pickImage = async (source) => {
    try {
      let result;
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        // If not editing, show the modal. If editing, just update the image
        if (!isEditing) {
          setModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Oops! 😅', 'Something went wrong. Please try again! 💕');
    }
  };

  // Submit memory (create or update)
  const submitMemory = async () => {
    if (!memoryTitle.trim() || !memoryDescription.trim()) {
      Alert.alert('Oops! 😅', 'Please fill in the title and description! 💕');
      return;
    }

    // For editing, image is optional (can keep existing image)
    if (!isEditing && !selectedImage) {
      Alert.alert('Oops! 😅', 'Please select an image! 💕');
      return;
    }

    try {
      setUploading(true);
      
      let imageUrl = null;
      
      // Only upload new image if one was selected and it's a local URI
      if (selectedImage && selectedImage.startsWith('file://')) {
        const filename = `memory_${Date.now()}.jpg`;
        imageUrl = await uploadImageToStorage(selectedImage, filename);
      }
      
      if (isEditing && editingMemory) {
        // Update existing memory
        await updateMemoryInFirestore(
          editingMemory.id, 
          memoryTitle, 
          memoryDescription, 
          selectedEmoji, 
          memoryDate,
          imageUrl // Will be null if no new image was selected
        );
        Alert.alert('Updated! 🎉', 'Your beautiful memory has been updated! 💕');
      } else {
        // Create new memory
        if (!imageUrl) {
          Alert.alert('Oops! 😅', 'Please select an image! 💕');
          return;
        }
        await saveMemoryToFirestore(imageUrl, memoryTitle, memoryDescription, selectedEmoji, memoryDate);
        Alert.alert('Success! 🎉', 'Your beautiful memory has been added to our love story! 💕');
      }
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Error saving memory:', error);
      Alert.alert('Oops! 😅', 'Something went wrong. Please try again! 💕');
    } finally {
      setUploading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setModalVisible(false);
    setSelectedImage(null);
    setMemoryTitle('');
    setMemoryDescription('');
    setSelectedEmoji('💕');
    setMemoryDate(new Date());
    setIsEditing(false);
    setEditingMemory(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDateForDisplay = (date) => {
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || memoryDate;
    setShowDatePicker(Platform.OS === 'ios');
    setMemoryDate(currentDate);
  };

  // Curvy path SVG component
  const CurvyConnector = ({ isLast }) => {
    if (isLast) return null;
    
    return (
      <View style={styles.curvyContainer}>
        <Svg width="60" height="80" style={styles.curvySvg}>
          <Path
            d="M30 10 Q45 25 30 40 Q15 55 30 70"
            stroke="#FF69B4"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="5,3"
          />
        </Svg>
        <View style={styles.sparkle}>
          <Text style={styles.sparkleEmoji}>✨</Text>
        </View>
      </View>
    );
  };

  const renderMemory = (memory, index) => {
    const isEven = index % 2 === 0;
    
    return (
      <View key={memory.id}>
        <View style={[styles.memoryContainer, isEven ? styles.memoryLeft : styles.memoryRight]}>
          <TouchableOpacity 
            style={styles.memoryCard}
            onLongPress={() => showMemoryOptions(memory)}
            activeOpacity={0.8}
          >
            <View style={styles.emojiContainer}>
              <Text style={styles.memoryEmoji}>{memory.emoji}</Text>
            </View>
            
            <Text style={styles.memoryTitle}>{memory.title}</Text>
            
            <Image source={{ uri: memory.uri }} style={styles.memoryImage} />
            
            <Text style={styles.memoryDescription}>{memory.description}</Text>
            
            <View style={styles.memoryFooter}>
              <Text style={styles.memoryDate}>{formatDate(memory.date)}</Text>
              <View style={styles.hearts}>
                <Text>💕</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        <CurvyConnector isLast={index === memories.length - 1} />
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#D63384" />
        <Text style={styles.loadingText}>✨ Loading our love story... 💕</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Our Love Story</Text>
          <Text style={styles.subtitle}>✨ Magical Moments Together ✨</Text>
        </View>
        <TouchableOpacity 
          onPress={handleAddMemory} 
          style={[styles.addButton, uploading && styles.addButtonDisabled]}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#D63384" />
          ) : (
            <Text style={styles.addButtonEmoji}>💫</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {memories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💝</Text>
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>Let's create some magic together! ✨</Text>
            <TouchableOpacity 
              style={styles.firstMemoryButton}
              onPress={handleAddMemory}
            >
              <Text style={styles.firstMemoryText}>Add our first memory! 💕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.timeline}>
            <View style={styles.journeyStart}>
              <Text style={styles.journeyText}>💕 Where our story began 💕</Text>
            </View>
            
            {memories.map((memory, index) => renderMemory(memory, index))}
          </View>
        )}
      </ScrollView>

      {/* Add Memory Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView 
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? '✏️ Edit Memory ✏️' : '✨ Create New Memory ✨'}
              </Text>
              
              {selectedImage && (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  {isEditing && (
                    <TouchableOpacity 
                      style={styles.changeImageButton}
                      onPress={() => Alert.alert(
                        '📷 Change Image',
                        'Choose a new image for this memory',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Camera 📸', onPress: () => pickImage('camera') },
                          { text: 'Gallery 🖼️', onPress: () => pickImage('gallery') }
                        ]
                      )}
                    >
                      <Text style={styles.changeImageText}>📷 Change Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              
              {!selectedImage && !isEditing && (
                <TouchableOpacity 
                  style={styles.selectImageButton}
                  onPress={() => Alert.alert(
                    '📷 Select Image',
                    'Choose an image for this memory',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Camera 📸', onPress: () => pickImage('camera') },
                      { text: 'Gallery 🖼️', onPress: () => pickImage('gallery') }
                    ]
                  )}
                >
                  <Text style={styles.selectImageText}>📷 Select Photo</Text>
                </TouchableOpacity>
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Memory title (e.g., 💕 Our First Kiss)"
                value={memoryTitle}
                onChangeText={setMemoryTitle}
                maxLength={50}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe this beautiful moment..."
                value={memoryDescription}
                onChangeText={setMemoryDescription}
                multiline
                numberOfLines={4}
                maxLength={200}
                textAlignVertical="top"
              />
              
              <Text style={styles.dateSectionTitle}>When did this happen?</Text>
              <TouchableOpacity 
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateSelectorText}>📅 {formatDateForDisplay(memoryDate)}</Text>
                <Text style={styles.dateArrow}>⌄</Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={memoryDate}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()} // Can't select future dates
                />
              )}
              
              <Text style={styles.emojiSectionTitle}>Choose an emoji:</Text>
              <View style={styles.emojiContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.emojiSelector}
                  contentContainerStyle={styles.emojiScrollContent}
                >
                  {emojiOptions.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.emojiOption,
                        selectedEmoji === emoji && styles.selectedEmojiOption
                      ]}
                      onPress={() => setSelectedEmoji(emoji)}
                    >
                      <Text style={styles.emojiOptionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={submitMemory}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {isEditing ? 'Update Memory 💕' : 'Save Memory 💕'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <View style={styles.uploadingContent}>
            <ActivityIndicator size="large" color="#D63384" />
            <Text style={styles.uploadingText}>✨ Adding magic to our love story... 💕</Text>
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
    paddingBottom: 60,
  },
  timeline: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  memoryContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  memoryLeft: {
    alignItems: 'flex-start',
  },
  memoryRight: {
    alignItems: 'flex-end',
  },
  memoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
    shadowColor: '#FF69B4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.1)',
  },
  emojiContainer: {
    position: 'absolute',
    top: -15,
    right: 15,
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  memoryEmoji: {
    fontSize: 20,
  },
  memoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
    marginTop: 10,
  },
  memoryImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
  },
  memoryDescription: {
    fontSize: 15,
    color: '#6C757D',
    lineHeight: 22,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  memoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memoryDate: {
    fontSize: 13,
    color: '#ADB5BD',
    fontWeight: '500',
  },
  hearts: {
    flexDirection: 'row',
  },
  editHint: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(214, 51, 132, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  editHintText: {
    fontSize: 10,
    color: '#D63384',
    fontWeight: '500',
  },
  curvyContainer: {
    alignItems: 'center',
    position: 'relative',
    height: 80,
  },
  curvySvg: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    top: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleEmoji: {
    fontSize: 16,
  },
  journeyStart: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  journeyText: {
    fontSize: 16,
    color: '#D63384',
    fontWeight: '500',
    textAlign: 'center',
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
  firstMemoryButton: {
    backgroundColor: '#D63384',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  firstMemoryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D63384',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(214, 51, 132, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeImageText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  selectImageButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#D63384',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectImageText: {
    color: '#D63384',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 100,
  },
  dateSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F8F9FA',
    marginBottom: 15,
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#495057',
  },
  dateArrow: {
    fontSize: 16,
    color: '#6C757D',
  },
  emojiSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  emojiContainer: {
    marginBottom: 20,
  },
  emojiSelector: {
    flexGrow: 0,
  },
  emojiScrollContent: {
    paddingHorizontal: 5,
  },
  emojiOption: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 12,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedEmojiOption: {
    borderColor: '#D63384',
    backgroundColor: '#FFE4E6',
  },
  emojiOptionText: {
    fontSize: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E9ECEF',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#D63384',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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

export default MemoriesScreen;