import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, AppState, Alert, Modal, Button } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AddAlarmModal from '../others/AddAlarmModal';
import styles from '../styles/(tabs)/index';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';

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

const createNotificationChannel = async () => {
  if (Device.osName === 'Android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Channel',
      importance: Notifications.AndroidImportance.MAX,
      sound: null, // Use the default notification sound
    });
  }
};

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const alarms: Alarm[] = await getAlarmsFromStorage();
    const now = new Date();
    alarms.forEach(async (alarm: Alarm) => {
      const alarmDate = getAlarmDate(alarm.time);
      if (alarm.isEnabled && alarmDate <= now) {
        await scheduleAlarmNotification(alarm);
      }
    });
    return BackgroundFetch.Result.NewData;
  } catch (err) {
    console.error(err);
    return BackgroundFetch.Result.Failed;
  }
});

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 15 * 60, // 15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

async function getAlarmsFromStorage(): Promise<Alarm[]> {
  try {
    const alarms = await AsyncStorage.getItem('alarms');
    return alarms ? JSON.parse(alarms) : [];
  } catch (error) {
    console.error('Error getting alarms from storage:', error);
    return [];
  }
}

async function saveAlarmsToStorage(alarms: Alarm[]): Promise<void> {
  try {
    await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
  } catch (error) {
    console.error('Error saving alarms to storage:', error);
  }
}

async function scheduleAlarmNotification(alarm: Alarm): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Alarm',
      body: 'Time to wake up!',
      sound: null, // Use the default notification sound
    },
    trigger: {
      seconds: 1, // Trigger immediately for testing
    },
    android: {
      channelId: 'default', // Use the default channel
    },
  });
}

const getAlarmDate = (time: string): Date => {
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

export default function AlarmsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [alarmModalVisible, setAlarmModalVisible] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState<Alarm | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [nextAlarmText, setNextAlarmText] = useState('No Alarms');
  const soundRef = useRef<Audio.Sound | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadAlarms = async () => {
      const storedAlarms = await getAlarmsFromStorage();
      setAlarms(storedAlarms);
      if (storedAlarms.length > 0) {
        updateNextAlarmText(storedAlarms);
        updateIntervalRef.current = setInterval(() => updateNextAlarmText(storedAlarms), 1000);
      } else {
        setNextAlarmText('No Alarms');
      }
    };
    loadAlarms();
    registerBackgroundFetchAsync();

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications not granted!');
      }
    };
    requestPermissions();

    createNotificationChannel(); // Create notification channel for default sound

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(() => {
      setAlarmModalVisible(true);
      playAlarmSound();
    });
    return () => {
      notificationListener.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: string) => {
    if (nextAppState === 'active') {
      updateNextAlarmText(alarms);
    }
  };

  const handleSaveAlarm = async (newAlarm: Alarm) => {
    const updatedAlarms = currentAlarm
      ? alarms.map((alarm) =>
          alarm.id === currentAlarm.id ? newAlarm : alarm
        )
      : [...alarms, newAlarm];
    setAlarms(updatedAlarms);
    setModalVisible(false);
    setCurrentAlarm(null);
    await saveAlarmsToStorage(updatedAlarms);
    if (newAlarm.isEnabled) {
      scheduleAlarm(newAlarm);
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    updateIntervalRef.current = setInterval(() => updateNextAlarmText(updatedAlarms), 1000);
  };

  const scheduleAlarm = async (alarm: Alarm) => {
    const alarmDate = getAlarmDate(alarm.time);
    const timeDiff = alarmDate.getTime() - new Date().getTime();

    console.log(`Scheduling alarm for ${alarm.time} which is in ${Math.round(timeDiff / 1000)} seconds`);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Alarm',
        body: 'Time to wake up!',
        sound: null, // Use the default notification sound
      },
      trigger: {
        seconds: Math.round(timeDiff / 1000),
      },
      android: {
        channelId: 'default', // Use the default channel
      },
    });
  };

  const handleDeleteAlarm = async (id: string) => {
    const updatedAlarms = alarms.filter((alarm) => alarm.id !== id);
    setAlarms(updatedAlarms);
    setModalVisible(false);
    setCurrentAlarm(null);
    await saveAlarmsToStorage(updatedAlarms);
    if (updatedAlarms.length === 0 && updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      setNextAlarmText('No Alarms');
    }
  };

  const handleToggleSwitch = async (id: string, value: boolean) => {
    const updatedAlarms = alarms.map((alarm) => {
      if (alarm.id === id) {
        const updatedAlarm = { ...alarm, isEnabled: value };
        if (value) {
          scheduleAlarm(updatedAlarm);
        }
        return updatedAlarm;
      }
      return alarm;
    });
    setAlarms(updatedAlarms);
    await saveAlarmsToStorage(updatedAlarms);
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    updateIntervalRef.current = setInterval(() => updateNextAlarmText(updatedAlarms), 1000);
  };

  const updateNextAlarmText = (alarmsList: Alarm[]) => {
    if (alarmsList.length > 0) {
      const nextAlarm = alarmsList.reduce((soonest, alarm) => {
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

  const playAlarmSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(require('../../assets/chime.mp3'), {
      shouldPlay: true,
      isLooping: true,
    });
    soundRef.current = sound;
    await sound.playAsync();
  };

  const stopAlarmSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setAlarmModalVisible(false);
  };

  const playTestSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(require('../../assets/chime.mp3'), { shouldPlay: true });
    soundRef.current = sound;
    await sound.playAsync();
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
              <Ionicons name="play" size={32} color="white" style={styles.icon} onPress={playTestSound} />
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

      <Modal
        visible={alarmModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.alarmModalContainer}>
          <View style={styles.alarmModal}>
            <Text style={styles.alarmModalText}>Alarm is ringing!</Text>
            <Button title="Stop Alarm" onPress={stopAlarmSound} />
          </View>
        </View>
      </Modal>
    </>
  );
}
