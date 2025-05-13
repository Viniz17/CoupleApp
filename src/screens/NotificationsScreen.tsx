import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

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
      timer = setInterval(() => {
        calculateTimeElapsed();
      }, 1000);
    }
    
    // Cleanup
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [specialDate, isPickingDate]); // Add dependencies so effect reruns when these change

  const calculateTimeElapsed = () => {
    const now = new Date();
    const diff = now.getTime() - specialDate.getTime(); // Time difference in milliseconds

    // Convert to readable units
    let seconds = Math.floor((diff / 1000) % 60);
    let minutes = Math.floor((diff / (1000 * 60)) % 60);
    let hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    let days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 30.44); // Approx days in a month
    
    // Calculate months including fractional months
    let months = 0;
    let years = 0;
    
    // Calculate total months first
    let totalMonths = (now.getFullYear() - specialDate.getFullYear()) * 12;
    totalMonths += now.getMonth() - specialDate.getMonth();
    
    // Adjust for day of month
    if (now.getDate() < specialDate.getDate()) {
      totalMonths--;
    }
    
    // Extract years and remaining months
    if (totalMonths >= 12) {
      years = Math.floor(totalMonths / 12);
      months = totalMonths % 12;
    } else {
      months = totalMonths;
    }

    // If negative, set to zero (in case date is in future)
    if (years < 0) years = 0;
    if (months < 0) months = 0;
    if (days < 0) days = 0;
    if (hours < 0) hours = 0;
    if (minutes < 0) minutes = 0;
    if (seconds < 0) seconds = 0;
    
    setTimeElapsed({ years, months, days, hours, minutes, seconds });
  };

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
        Since {specialDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}
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