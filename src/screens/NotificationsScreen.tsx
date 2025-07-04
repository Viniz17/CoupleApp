import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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

const NotificationsScreen = () => {
  // Initial date (can be overridden by user)
  const [specialDate, setSpecialDate] = useState(new Date());
  
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

  useEffect(() => {
    // Initial calculation
    calculateTimeElapsed();
    
    // Only set up the timer if we're not picking a date
    let timer: NodeJS.Timeout | undefined;
    if (!isPickingDate) {
      // Update timer every second
      timer = setInterval(calculateTimeElapsed, 1000);
    }
    
    // Cleanup function - this runs when the effect is cleaned up
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [calculateTimeElapsed, isPickingDate]); // This effect will re-run when calculateTimeElapsed or isPickingDate changes

  const calculateTimeElapsed = useCallback(() => {
    const now = new Date();
    
    // If the date is in the future, set all values to 0
    if (specialDate > now) {
      setTimeElapsed({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    // Calculate total differences using date-fns
    const years = differenceInYears(now, specialDate);
    
    // Calculate remaining months after subtracting years
    const afterYears = subYears(now, years);
    const months = differenceInMonths(afterYears, specialDate);
    
    // Calculate remaining days after subtracting years and months
    const afterMonths = subMonths(afterYears, months);
    const days = differenceInDays(afterMonths, specialDate);
    
    // Calculate remaining hours after subtracting years, months, and days
    const afterDays = subDays(afterMonths, days);
    const hours = differenceInHours(afterDays, specialDate);
    
    // Calculate remaining minutes after subtracting years, months, days, and hours
    const afterHours = subHours(afterDays, hours);
    const minutes = differenceInMinutes(afterHours, specialDate);
    
    // Calculate remaining seconds after subtracting years, months, days, hours, and minutes
    const afterMinutes = subMinutes(afterHours, minutes);
    const seconds = differenceInSeconds(afterMinutes, specialDate);
    
    setTimeElapsed({ years, months, days, hours, minutes, seconds });
  }, [specialDate]);

  // Open date picker
  const openDatePicker = () => {
    setIsPickingDate(true);
    setShowDatePicker(true);
  };

  // Handle date change
  interface DateChangeEvent {
    type: string;
    nativeEvent: object;
  }

  const onDateChange = (event: DateChangeEvent, selectedDate?: Date | undefined): void => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      setSpecialDate(selectedDate);
    }
    
    // Turn off picking mode after selection
    setIsPickingDate(false);
  };

  // Function to determine which units to show - now always including minutes and seconds
  const getTimeDisplay = () => {
    const { years, months, days, hours, minutes, seconds } = timeElapsed;
    
    // Always show all relevant time units plus minutes and seconds
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

  // Component for each time unit
  const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <View style={styles.timeUnitContainer}>
      <Text style={styles.timeValue}>{value}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );

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
          maximumDate={new Date()} // Can't select future dates
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
    color: '#e91e63', // A romantic pink color
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
    backgroundColor: 'rgba(233, 30, 99, 0.05)', // Light pink background
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

export default NotificationsScreen;