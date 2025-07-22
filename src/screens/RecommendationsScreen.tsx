import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const RecommendationsScreen = () => {
  // Mock data - replace with Firebase data later
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'recommendation',
      category: 'book',
      emoji: '📚',
      sender: 'partner',
      timestamp: '10:15 AM',
      title: 'Me Before You',
      message: 'This book made me think of us! You\'d love it ✨'
    },
    {
      id: '2',
      type: 'idea',
      emoji: '💡',
      sender: 'me',
      timestamp: '11:30 AM',
      message: 'What if we tried that new Italian restaurant for dinner tomorrow? 🍝'
    },
    {
      id: '3',
      type: 'mood',
      emoji: '🥰',
      sender: 'me',
      timestamp: '12:20 PM',
      message: 'Missing you already...'
    },
    {
      id: '4',
      type: 'recommendation',
      category: 'movie',
      emoji: '🎬',
      sender: 'partner',
      timestamp: '1:45 PM',
      title: 'The Notebook',
      message: 'Perfect for our movie night this weekend! 💕'
    },
    {
      id: '5',
      type: 'mood',
      emoji: '😍',
      sender: 'me',
      timestamp: '2:30 PM',
      message: 'Feeling so in love today!'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('mood');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('😊');

  // Add ref for ScrollView
  const scrollViewRef = useRef(null);

  const moodEmojis = ['😍', '🥰', '😊', '😢', '😴', '🤗', '😘', '🥳', '😌', '💕', '✨', '🌟'];
  const categoryEmojis = {
    mood: '💭',
    movie: '🎬',
    book: '📚',
    series: '📺',
    idea: '💡',
    reminder: '⏰'
  };

  const categories = [
    { key: 'mood', label: 'Mood', emoji: '💭' },
    { key: 'movie', label: 'Movie', emoji: '🎬' },
    { key: 'book', label: 'Book', emoji: '📚' },
    { key: 'series', label: 'Series', emoji: '📺' },
    { key: 'idea', label: 'Idea', emoji: '💡' },
    { key: 'reminder', label: 'Reminder', emoji: '⏰' }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      Alert.alert('Oops! 😅', 'Please write something sweet! 💕');
      return;
    }

    const newMsg = {
      id: String(messages.length + 1),
      type: selectedCategory,
      emoji: selectedEmoji,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: newMessage.trim(),
      // Only add title for movie, book, and series recommendations
      ...(selectedCategory === 'movie' || selectedCategory === 'book' || selectedCategory === 'series' ? { title: 'New Recommendation' } : {})
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    setSelectedEmoji('😊');

    // Dismiss keyboard and scroll to bottom
    Keyboard.dismiss();
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Handle enter key press
  const handleKeyPress = (event) => {
    if (event.nativeEvent.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (item) => {
    const isMe = item.sender === 'me';
    
    return (
      <View key={item.id} style={[styles.messageContainer, isMe ? styles.myMessage : styles.partnerMessage]}>
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <View style={styles.emojiContainer}>
              <Text style={styles.messageEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.messageInfo}>
              <Text style={styles.messageType}>
                {item.type === 'mood' ? '💭 Mood' : 
                 item.type === 'movie' ? '🎬 Movie' :
                 item.type === 'book' ? '📚 Book' :
                 item.type === 'series' ? '📺 Series' :
                 item.type === 'idea' ? '💡 Idea' : '⏰ Reminder'}
              </Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
          </View>
          
          {item.title && (
            <Text style={styles.messageTitle}>{item.title}</Text>
          )}
          
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Daily Vibes</Text>
          <Text style={styles.subtitle}>💕 Share moods & recommendations 💫</Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        {/* Category Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.key && styles.selectedCategoryText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Emoji Selection */}
        <View style={styles.emojiSection}>
          <TouchableOpacity 
            style={styles.selectedEmojiButton}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Text style={styles.selectedEmojiText}>{selectedEmoji}</Text>
          </TouchableOpacity>
          
          {showEmojiPicker && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.emojiPicker}
            >
              {moodEmojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiOption}
                  onPress={() => {
                    setSelectedEmoji(emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text style={styles.emojiOptionText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Message Input */}
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder={
              selectedCategory === 'mood' ? 'How are you feeling? 💭' :
              selectedCategory === 'idea' ? 'Share your idea... 💡' :
              selectedCategory === 'reminder' ? 'Don\'t forget to... ⏰' :
              `Recommend a ${selectedCategory}... ${categoryEmojis[selectedCategory]}`
            }
            placeholderTextColor="#ADB5BD"
            value={newMessage}
            onChangeText={setNewMessage}
            onKeyPress={handleKeyPress}
            multiline
            maxLength={200}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendEmoji}>💕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8', // Same soft pink as other screens
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D63384', // Same pink as other screens
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6F42C1', // Same purple as other screens
    fontStyle: 'italic',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '85%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  partnerMessage: {
    alignSelf: 'flex-start',
  },
  messageContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.1)',
    minWidth: 200,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiContainer: {
    backgroundColor: '#FFE4E6',
    borderRadius: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  messageEmoji: {
    fontSize: 16,
  },
  messageInfo: {
    flex: 1,
  },
  messageType: {
    fontSize: 12,
    color: '#6F42C1',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    color: '#ADB5BD',
    marginTop: 2,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D63384',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 105, 180, 0.1)',
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesContent: {
    paddingRight: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  selectedCategory: {
    backgroundColor: '#FFE4E6',
    borderColor: '#FF69B4',
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    color: '#6F42C1',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#D63384',
    fontWeight: '600',
  },
  emojiSection: {
    marginBottom: 12,
  },
  selectedEmojiButton: {
    backgroundColor: '#FFE4E6',
    borderRadius: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  selectedEmojiText: {
    fontSize: 20,
  },
  emojiPicker: {
    marginBottom: 8,
  },
  emojiOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  emojiOptionText: {
    fontSize: 18,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 15,
    color: '#495057',
    maxHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  sendButton: {
    backgroundColor: '#FFE4E6',
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
  sendEmoji: {
    fontSize: 18,
  },
});

export default RecommendationsScreen;