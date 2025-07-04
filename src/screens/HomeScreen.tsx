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
          <TimeUnit value={years} label={years === 1 ? 'year' : 'years'} />
          <TimeUnit value={months} label={months === 1 ? 'month' : 'months'} />
          <TimeUnit value={days} label={days === 1 ? 'day' : 'days'} />
          <TimeUnit value={hours} label={hours === 1 ? 'hour' : 'hours'} />
          <TimeUnit value={minutes} label={minutes === 1 ? 'minute' : 'minutes'} />
          <TimeUnit value={seconds} label={seconds === 1 ? 'second' : 'seconds'} />
        </>
      );
    } else if (months > 0) {
      return (
        <>
          <TimeUnit value={months} label={months === 1 ? 'month' : 'months'} />
          <TimeUnit value={days} label={days === 1 ? 'day' : 'days'} />
          <TimeUnit value={hours} label={hours === 1 ? 'hour' : 'hours'} />
          <TimeUnit value={minutes} label={minutes === 1 ? 'minute' : 'minutes'} />
          <TimeUnit value={seconds} label={seconds === 1 ? 'second' : 'seconds'} />
        </>
      );
    } else if (days > 0) {
      return (
        <>
          <TimeUnit value={days} label={days === 1 ? 'day' : 'days'} />
          <TimeUnit value={hours} label={hours === 1 ? 'hour' : 'hours'} />
          <TimeUnit value={minutes} label={minutes === 1 ? 'minute' : 'minutes'} />
          <TimeUnit value={seconds} label={seconds === 1 ? 'second' : 'seconds'} />
        </>
      );
    } else {
      return (
        <>
          <TimeUnit value={hours} label={hours === 1 ? 'hour' : 'hours'} />
          <TimeUnit value={minutes} label={minutes === 1 ? 'minute' : 'minutes'} />
          <TimeUnit value={seconds} label={seconds === 1 ? 'second' : 'seconds'} />
        </>
      );
    }
  };

  const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <View style={styles.timeUnitContainer}>
      <Text style={styles.timeValue}>{value}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );

  if (!isDateLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Relationship</Text>
      <Text style={styles.subtitle}>Time together</Text>
      
      <TouchableOpacity onPress={openDatePicker} style={styles.timerContainer}>
        {getTimeDisplay()}
      </TouchableOpacity>
      
      <Text style={styles.dateText}>
        Since {format(specialDate, 'MMMM d, yyyy')}
      </Text>
      
      <Text style={styles.tapHint}>Tap the timer to change date</Text>
      
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
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e91e63', 
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 30,
  },
  timerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
  },
  timeUnitContainer: {
    margin: 10,
    alignItems: 'center',
    minWidth: 70,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  timeLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
    fontStyle: 'italic',
  },
  tapHint: {
    fontSize: 12,
    color: '#adb5bd',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default HomeScreen;