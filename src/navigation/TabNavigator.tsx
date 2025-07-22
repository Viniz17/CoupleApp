import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GalleryScreen from '../screens/GalleryScreen';
import SharedCalendarScreen from '../screens/SharedCalendarScreen';
import HomeScreen from '../screens/HomeScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import MemoriesScreen from '../screens/MemoriesScreen';

import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color }: { name: string; color: string }): React.ReactElement => {
  return <Ionicons name={name} size={24} color={color} />;
};

const TabNavigator = (): React.ReactElement => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#0c0e0f',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="images-outline" color={color} />,
        }}
      />
      <Tab.Screen
        name="Timeline"
        component={MemoriesScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="heart-outline" color={color} />,
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home-outline" color={color} />,
        }}
      />
      <Tab.Screen
        name="Vibes"
        component={RecommendationsScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="chatbubbles-outline" color={color} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={SharedCalendarScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-outline" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;