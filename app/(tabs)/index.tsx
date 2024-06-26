import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Switch, ScrollView, Alert, TouchableOpacity, AppState } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AddAlarmModal from '../others/AddAlarmModal'; // Import the new component
import styles from '../styles/(tabs)/index';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';

interface Alarm {
  id: string;
  time: string;
  info: string;
  selectedDays: boolean[];
  isEnabled: boolean;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AlarmsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState<Alarm | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [nextAlarmText, setNextAlarmText] = useState('No Alarms');
  const soundRef = useRef<Audio.Sound | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (alarms.length > 0) {
      updateNextAlarmText();
      updateIntervalRef.current = setInterval(updateNextAlarmText, 1000);
    } else {
      setNextAlarmText('No Alarms');
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    }
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [alarms]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      updateNextAlarmText();
    }
  };

  const getAlarmDate = (time: string) => {
    const alarmTime = new Date();
    const [hours, minutes, period] = time.split(/[: ]/);
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    alarmTime.setHours(hour);
    alarmTime.setMinutes(parseInt(minutes));
    alarmTime.setSeconds(0);
    if (alarmTime < new Date()) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    return alarmTime;
  };

  const handleSaveAlarm = (newAlarm: Alarm) => {
    setAlarms((prevAlarms) => {
      if (currentAlarm) {
        return prevAlarms.map((alarm) =>
          alarm.id === currentAlarm.id ? newAlarm : alarm
        );
      }
      return [...prevAlarms, newAlarm];
    });
    setModalVisible(false);
    setCurrentAlarm(null);
    if (newAlarm.isEnabled) {
      scheduleAlarm(newAlarm);
    }
  };

  const scheduleAlarm = async (alarm: Alarm) => {
    const alarmDate = getAlarmDate(alarm.time);
    const timeDiff = alarmDate.getTime() - new Date().getTime();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alarm",
        body: "Time to wake up!",
        sound: true,
      },
      trigger: {
        seconds: Math.round(timeDiff / 1000),
      },
    });
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prevAlarms) => prevAlarms.filter((alarm) => alarm.id !== id));
    setModalVisible(false);
    setCurrentAlarm(null);
  };

  const playSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(require('../../assets/chime.mp3'), { shouldPlay: true, isLooping: true });
    soundRef.current = sound;
    await sound.playAsync();
  };

  const stopChime = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
    }
  };

  const handleToggleSwitch = (id: string, value: boolean) => {
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) => {
        if (alarm.id === id) {
          const updatedAlarm = { ...alarm, isEnabled: value };
          if (value) {
            scheduleAlarm(updatedAlarm);
          }
          return updatedAlarm;
        }
        return alarm;
      })
    );
  };

  const updateNextAlarmText = () => {
    if (alarms.length > 0) {
      const nextAlarm = alarms.reduce((soonest, alarm) => {
        const alarmTime = getAlarmDate(alarm.time);
        return alarmTime < soonest ? alarmTime : soonest;
      }, new Date(8640000000000000)); // Set to max date value initially

      const now = new Date();
      const timeDiff = nextAlarm.getTime() - now.getTime();
      if (timeDiff < 60000) {
        const seconds = Math.floor(timeDiff / 1000);
        setNextAlarmText(`Alarm in ${seconds} seconds`);
      } else {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        const timeParts = [];
        if (days > 0) timeParts.push(`${days} day${days > 1 ? 's' : ''}`);
        if (hours > 0) timeParts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (minutes > 0) timeParts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        setNextAlarmText(`Alarm in ${timeParts.join(', ')}`);
      }
    } else {
      setNextAlarmText('No Alarms');
    }
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#000000', dark: '#000000' }}
        headerImage={<View style={styles.headerContainer}><ThemedText style={styles.headerText}>{nextAlarmText}</ThemedText></View>}
      >
        <ThemedView style={styles.container}>
          <View style={styles.titleContainer}>
            <ThemedText type="title">Alarms</ThemedText>
            <View style={styles.iconContainer}>
              <Ionicons name="add" size={32} color="white" style={styles.icon} onPress={() => setModalVisible(true)} />
              <Ionicons name="ellipsis-vertical" size={24} color="white" style={styles.icon} />
            </View>
          </View>
          <ScrollView>
            {alarms.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => {
                setCurrentAlarm(item);
                setModalVisible(true);
              }}>
                <View style={styles.alarmItem}>
                  <View>
                    <Text style={styles.alarmTime}>{item.time}</Text>
                    <Text style={styles.alarmInfo}>{item.info}</Text>
                  </View>
                  <Switch value={item.isEnabled} onValueChange={(value) => handleToggleSwitch(item.id, value)} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      </ParallaxScrollView>

      <AddAlarmModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setCurrentAlarm(null);
        }}
        onSave={handleSaveAlarm}
        onDelete={handleDeleteAlarm}
        alarm={currentAlarm}
      />
    </>
  );
}
