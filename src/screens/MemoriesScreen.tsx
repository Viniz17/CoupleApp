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
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const MemoriesScreen = () => {
  // Mock couple memories - replace with Firebase data later
  const [memories, setMemories] = useState([
    {
      id: '1',
      title: '💕 Our First Kiss',
      description: 'Under the stars at the park... you tasted like strawberries and forever 🌟',
      date: '2024-12-15',
      emoji: '💋',
      uri: 'https://picsum.photos/350/250?random=1'
    },
    {
      id: '2',
      title: '🎂 Surprise Birthday',
      description: 'You made me cry happy tears with that homemade cake shaped like our dog 😭❤️',
      date: '2024-11-22',
      emoji: '🎉',
      uri: 'https://picsum.photos/350/250?random=2'
    },
    {
      id: '3',
      title: '🏔️ Mountain Adventure',
      description: 'You carried me the last mile when I was tired. My personal superhero! 💪✨',
      date: '2024-10-08',
      emoji: '⛰️',
      uri: 'https://picsum.photos/350/250?random=3'
    },
    {
      id: '4',
      title: '🏠 Moving In Together',
      description: 'Our first morning waking up in OUR bed. Coffee tastes better with you 💕',
      date: '2024-09-01',
      emoji: '🗝️',
      uri: 'https://picsum.photos/350/250?random=4'
    }
  ]);

  const handleAddMemory = () => {
    Alert.alert(
      '✨ Add New Memory', 
      'Create a magical moment together! 💫',
      [{ text: 'Later 😊', style: 'cancel' }, { text: 'Let\'s do it! 🎉' }]
    );
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
          <View style={styles.memoryCard}>
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
          </View>
        </View>
        
        <CurvyConnector isLast={index === memories.length - 1} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Our Love Story</Text>
          <Text style={styles.subtitle}>✨ Magical Moments Together ✨</Text>
        </View>
        <TouchableOpacity onPress={handleAddMemory} style={styles.addButton}>
          <Text style={styles.addButtonEmoji}>💫</Text>
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
          </View>
        ) : (
          <View style={styles.timeline}>
            {memories.map((memory, index) => renderMemory(memory, index))}
            
            <View style={styles.journeyStart}>
              <Text style={styles.journeyText}>💕 Where our story began 💕</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8', // Soft pink background
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
    marginTop: 40,
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
  },
});

export default MemoriesScreen;