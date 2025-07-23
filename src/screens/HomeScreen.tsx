import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  differenceInYears, 
  differenceInMonths, 
  differenceInDays, 
  differenceInHours, 
  differenceInMinutes, 
  differenceInSeconds,
  format,
  subYears,
  subMonths,
  subDays,
  subHours,
  subMinutes
} from 'date-fns';
import InvitePartnerButton from '../components/InvitePartnerButton';

const SPECIAL_DATE_KEY = 'special_date';

const HomeScreen = () => {
  const [specialDate, setSpecialDate] = useState(new Date());
  const [isDateLoaded, setIsDateLoaded] = useState(false);
  
  interface TimeElapsed {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }

  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPickingDate, setIsPickingDate] = useState(false);

  const loadSavedDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem(SPECIAL_DATE_KEY);
      if (savedDate) {
        setSpecialDate(new Date(savedDate));
      }
    } catch (error) {
      console.error('Error loading saved date:', error);
    } finally {
      setIsDateLoaded(true);
    }
  };

  const saveDateToStorage = async (date: Date) => {
    try {
      await AsyncStorage.setItem(SPECIAL_DATE_KEY, date.toISOString());
    } catch (error) {
      console.error('Error saving date:', error);
    }
  };

  useEffect(() => {
    loadSavedDate();
  }, []);

  const calculateTimeElapsed = useCallback(() => {
    const now = new Date();
    
    if (specialDate > now) {
      setTimeElapsed({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const years = differenceInYears(now, specialDate);
    
    const afterYears = subYears(now, years);
    const months = differenceInMonths(afterYears, specialDate);
    
    const afterMonths = subMonths(afterYears, months);
    const days = differenceInDays(afterMonths, specialDate);
    
    const afterDays = subDays(afterMonths, days);
    const hours = differenceInHours(afterDays, specialDate);
    
    const afterHours = subHours(afterDays, hours);
    const minutes = differenceInMinutes(afterHours, specialDate);
    
    const afterMinutes = subMinutes(afterHours, minutes);
    const seconds = differenceInSeconds(afterMinutes, specialDate);
    
    setTimeElapsed({ years, months, days, hours, minutes, seconds });
  }, [specialDate]);

  useEffect(() => {
    if (!isDateLoaded) return;
    
    calculateTimeElapsed();
    
    let timer: NodeJS.Timeout | undefined;
    if (!isPickingDate) {
      timer = setInterval(calculateTimeElapsed, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [specialDate, isPickingDate, isDateLoaded, calculateTimeElapsed]);

  const openDatePicker = () => {
    setIsPickingDate(true);
    setShowDatePicker(true);
  };

  interface DateChangeEvent {
    type: string;
    nativeEvent: object;
  }

  const onDateChange = async (event: DateChangeEvent, selectedDate?: Date | undefined): Promise<void> => {
    setShowDatePicker(false);
    setIsPickingDate(false); 
    
    if (selectedDate) {
      setSpecialDate(selectedDate);
      await saveDateToStorage(selectedDate); 
    }
  };

  const getTimeDisplay = () => {
    const { years, months, days, hours, minutes, seconds } = timeElapsed;
    
    if (years > 0) {
      return (
        <>
          <TimeUnit value={years} label={years === 1 ? 'year' : 'years'} emoji="" />
          <TimeUnit value={months} label={months === 1 ? 'month' : 'months'} emoji="" />
          <TimeUnit value={days} label={days === 1 ? 'day' : 'days'} emoji="" />
          <TimeUnit value={hours} label={hours === 1 ? 'hour' : 'hours'} emoji="" />
          <TimeUnit value={minutes} label={minutes === 1 ? 'minute' : 'minutes'} emoji="" />
          <TimeUnit value={seconds} label={seconds === 1 ? 'second' : 'seconds'} emoji="" />
        </>
      );
    } else if (months > 0) {
      return (
        <>
          <TimeUnit value={months} label={months === 1 ? 'month' : 'months'} emoji="" />
          <TimeUnit value={days} label={days === 1 ? 'day' : 'days'} emoji="✨" />
          <TimeUnit value={hours} label={hours === 1 ? 'hour' : 'hours'} emoji="" />
          <TimeUnit value={minutes} label={minutes === 1 ? 'minute' : 'minutes'} emoji="" />
          <TimeUnit value={seconds} label={seconds === 1 ? 'second' : 'seconds'} emoji="" />
        </>
      );
    } else if (days > 0) {
      return (
        <>
          <TimeUnit value={days} label={days === 1 ? 'day' : 'days'} emoji="" />
          <TimeUnit value={hours} label={hours === 1 ? 'hour' : 'hours'} emoji="💫" />
          <TimeUnit value={minutes} label={minutes === 1 ? 'minute' : 'minutes'} emoji="" />
          <TimeUnit value={seconds} label={seconds === 1 ? 'second' : 'seconds'} emoji="" />
        </>
      );
    } else {
      return (
        <>
          <TimeUnit value={hours} label={hours === 1 ? 'hour' : 'hours'} emoji="💫" />
          <TimeUnit value={minutes} label={minutes === 1 ? 'minute' : 'minutes'} emoji="" />
          <TimeUnit value={seconds} label={seconds === 1 ? 'second' : 'seconds'} emoji="" />
        </>
      );
    }
  };

  const TimeUnit: React.FC<{ value: number; label: string; emoji: string }> = ({ value, label, emoji }) => (
    <View style={styles.timeUnitContainer}>
      <Text style={styles.timeValue}>{value}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );

  if (!isDateLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.loadingText}>✨ Loading our love story... 💕</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
       {/* <InvitePartnerButton position="bottom-right" style={{}} /> */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>💕 Our Love Journey 💕</Text>
        <Text style={styles.subtitle}>✨ Every moment counts ✨</Text>
      </View>
      
      <View style={styles.heartDecorations}>
        <Text style={styles.decorativeHeart}>💖</Text>
        <Text style={styles.decorativeHeart}>💕</Text>
        <Text style={styles.decorativeHeart}>💝</Text>
      </View>
      
      <View style={styles.timerContainer}>
        {getTimeDisplay()}
      </View>
      
      <TouchableOpacity onPress={openDatePicker} style={styles.dateContainer}>
        <Text style={styles.dateText}>
          Since {format(specialDate, 'MMMM d, yyyy')} 💫
        </Text>
        <Text style={styles.tapHint}>💭 Tap to change our special date</Text>
      </TouchableOpacity>
      
      <View style={styles.bottomDecorations}>
        <Text style={styles.decorativeEmoji}>🌟</Text>
        <Text style={styles.decorativeEmoji}>✨</Text>
        <Text style={styles.decorativeEmoji}>🌟</Text>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={specialDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F8', // Same soft pink as other screens
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D63384', // Same pink as other screens
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6F42C1', // Same purple as other screens
    fontStyle: 'italic',
    textAlign: 'center',
  },
  heartDecorations: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 30,
  },
  decorativeHeart: {
    fontSize: 20,
    opacity: 0.7,
  },
  timerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  timeUnitContainer: {
    margin: 12,
    alignItems: 'center',
    minWidth: 80,
    position: 'relative',
  },
  emojiCircle: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 24,
    height: 24,
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
    fontSize: 12,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D63384', // Same pink as other screens
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6F42C1', // Same purple as other screens
    marginTop: 5,
    fontWeight: '500',
  },
  dateContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  dateText: {
    fontSize: 18,
    color: '#D63384',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 13,
    color: '#6F42C1',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomDecorations: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '50%',
    marginTop: 20,
  },
  decorativeEmoji: {
    fontSize: 16,
    opacity: 0.6,
  },
  loadingText: {
    fontSize: 18,
    color: '#D63384',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default HomeScreen;