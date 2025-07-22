import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SharedCalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock events data - replace with Firebase data later
  const [events, setEvents] = useState([
    {
      id: '1',
      date: '2025-07-21',
      title: 'Date Night 💕',
      time: '7:00 PM',
      type: 'date',
      emoji: '💕',
      addedBy: 'me'
    },
    {
      id: '2',
      date: '2025-07-22',
      title: 'Movie: Inside Out 2',
      time: '8:30 PM',
      type: 'movie',
      emoji: '🎬',
      addedBy: 'partner'
    },
    {
      id: '3',
      date: '2025-07-25',
      title: 'Weekend Getaway',
      time: 'All day',
      type: 'travel',
      emoji: '✈️',
      addedBy: 'me'
    },
    {
      id: '4',
      date: '2025-07-27',
      title: 'Anniversary Dinner',
      time: '6:30 PM',
      type: 'special',
      emoji: '🎉',
      addedBy: 'partner'
    }
  ]);

  const eventTypes = {
    date: { color: '#FF69B4', emoji: '💕' },
    movie: { color: '#9C27B0', emoji: '🎬' },
    travel: { color: '#2196F3', emoji: '✈️' },
    special: { color: '#FF5722', emoji: '🎉' },
    reminder: { color: '#4CAF50', emoji: '⏰' },
    dinner: { color: '#FF9800', emoji: '🍽️' }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const handleAddEvent = () => {
    Alert.alert(
      '📅 Add New Event', 
      'Event creator will be available when Firebase is configured! ✨',
      [{ text: 'Got it! 💕' }]
    );
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderCalendarDay = (date) => {
    if (!date) {
      return <View key={Math.random()} style={styles.emptyDay} />;
    }

    const dayEvents = getEventsForDate(date);
    const isSelected = isSameDate(date, selectedDate);
    const todayClass = isToday(date);

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.calendarDay,
          isSelected && styles.selectedDay,
          todayClass && styles.todayDay
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[
          styles.dayNumber,
          isSelected && styles.selectedDayText,
          todayClass && !isSelected && styles.todayText
        ]}>
          {date.getDate()}
        </Text>
        {dayEvents.length > 0 && (
          <View style={styles.eventIndicators}>
            {dayEvents.slice(0, 2).map((event, index) => (
              <View
                key={event.id}
                style={[
                  styles.eventDot,
                  { backgroundColor: eventTypes[event.type]?.color || '#FF69B4' }
                ]}
              />
            ))}
            {dayEvents.length > 2 && (
              <Text style={styles.moreEvents}>+{dayEvents.length - 2}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEventsList = () => {
    const selectedEvents = getEventsForDate(selectedDate);
    
    if (selectedEvents.length === 0) {
      return (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsEmoji}>💝</Text>
          <Text style={styles.noEventsText}>No plans for this day</Text>
          <Text style={styles.noEventsSubtext}>Perfect time to plan something special! ✨</Text>
        </View>
      );
    }

    return selectedEvents.map((event) => (
      <View key={event.id} style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={[
            styles.eventTypeIndicator,
            { backgroundColor: eventTypes[event.type]?.color || '#FF69B4' }
          ]}>
            <Text style={styles.eventEmoji}>{event.emoji}</Text>
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventTime}>{event.time}</Text>
          </View>
          <View style={styles.eventMeta}>
            <Text style={styles.addedBy}>
              {event.addedBy === 'me' ? '👤 You' : '💕 Partner'}
            </Text>
          </View>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Our Calendar</Text>
          <Text style={styles.subtitle}>💕 Shared moments & plans 📅</Text>
        </View>
        <TouchableOpacity onPress={handleAddEvent} style={styles.addButton}>
          <Text style={styles.addButtonEmoji}>➕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#D63384" />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#D63384" />
          </TouchableOpacity>
        </View>

        {/* Days of Week Header */}
        <View style={styles.daysHeader}>
          {daysOfWeek.map((day) => (
            <Text key={day} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {getDaysInMonth(currentMonth).map(renderCalendarDay)}
        </View>

        {/* Selected Date Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsSectionTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })} ✨
          </Text>
          {renderEventsList()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8', // Same soft pink as other screens
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
    color: '#D63384', // Same pink as other screens
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6F42C1', // Same purple as other screens
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D63384',
  },
  daysHeader: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6F42C1',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  emptyDay: {
    width: (width - 30) / 7,
    height: 60,
  },
  calendarDay: {
    width: (width - 30) / 7,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  selectedDay: {
    backgroundColor: '#FFE4E6',
    borderWidth: 2,
    borderColor: '#FF69B4',
  },
  todayDay: {
    backgroundColor: 'rgba(214, 51, 132, 0.1)',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  selectedDayText: {
    color: '#D63384',
    fontWeight: '600',
  },
  todayText: {
    color: '#D63384',
    fontWeight: '600',
  },
  eventIndicators: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: 'center',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  moreEvents: {
    fontSize: 10,
    color: '#6F42C1',
    marginLeft: 2,
  },
  eventsSection: {
    margin: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D63384',
    marginBottom: 15,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.1)',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventEmoji: {
    fontSize: 18,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 14,
    color: '#6F42C1',
  },
  eventMeta: {
    alignItems: 'flex-end',
  },
  addedBy: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noEventsEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D63384',
    marginBottom: 6,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#6F42C1',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SharedCalendarScreen;