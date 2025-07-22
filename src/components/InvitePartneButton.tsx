import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const InvitePartnerButton = ({ style, position = 'bottom-right' }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleValue = new Animated.Value(1);

  const handleInvitePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Show invite options
    Alert.alert(
      '💕 Invite Your Partner',
      'Get your partner to join you on this beautiful journey! Share the app with them.',
      [
        {
          text: 'Share Link',
          onPress: () => handleShareLink(),
          style: 'default',
        },
        {
          text: 'Send Message',
          onPress: () => handleSendMessage(),
          style: 'default',
        },
        {
          text: 'Later',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleShareLink = () => {
    // For now, just show a message since app isn't in stores yet
    Alert.alert(
      '🚀 Coming Soon!',
      'The app will be available on App Store and Google Play soon! For now, you can tell your partner about this amazing app we\'re building together! 💕',
      [{ text: 'Got it! ✨', style: 'default' }]
    );
  };

  const handleSendMessage = () => {
    Alert.alert(
      '💌 Send a Sweet Message',
      'Let your partner know about this special app! You can text them: "Hey babe! I found this amazing app for couples - we should try it together! 💕"',
      [
        { text: 'Copy Message', onPress: () => copyMessage() },
        { text: 'I\'ll tell them myself! 😊', style: 'cancel' }
      ]
    );
  };

  const copyMessage = () => {
    // In a real app, you'd use Clipboard.setString()
    Alert.alert(
      '📋 Message Ready!',
      'Message copied! Now you can paste it in your favorite messaging app. 💕',
      [{ text: 'Perfect! 💕', style: 'default' }]
    );
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 30, left: 20 };
      case 'bottom-right':
        return { bottom: 30, right: 20 };
      case 'top-right':
        return { top: 100, right: 20 };
      case 'top-left':
        return { top: 100, left: 20 };
      default:
        return { bottom: 30, right: 20 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        { transform: [{ scale: scaleValue }] },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handleInvitePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons 
            name="heart-outline" 
            size={16} 
            color="#D63384" 
            style={styles.heartIcon}
          />
          <Ionicons 
            name="person-add" 
            size={18} 
            color="#D63384" 
          />
        </View>
        <Text style={styles.buttonText}>Invite Partner</Text>
        <View style={styles.pulseRing} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(214, 51, 132, 0.2)',
    minWidth: 140,
    justifyContent: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  heartIcon: {
    position: 'absolute',
    top: -8,
    right: -4,
    zIndex: 1,
  },
  buttonText: {
    color: '#D63384',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  pulseRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: 'rgba(214, 51, 132, 0.3)',
    opacity: 0.7,
  },
});

// Example usage component showing how to integrate it into screens
export const ExampleScreenWithInvite = () => {
  return (
    <View style={exampleStyles.screen}>
      <Text style={exampleStyles.title}>Your App Screen</Text>
      <Text style={exampleStyles.content}>
        This is your main content...
      </Text>
      
      {/* Add the invite button to any screen */}
      <InvitePartnerButton position="bottom-right" />
    </View>
  );
};

const exampleStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF5F8',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D63384',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
  },
});

export default InvitePartnerButton;