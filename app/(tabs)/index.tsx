import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AddAlarmModal from '../others/AddAlarmModal'; // Import the new component

export default function AlarmsScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#000000', dark: '#000000' }}
        headerImage={<View style={styles.headerContainer}><ThemedText style={styles.headerText}>Alarm in 2 minutes</ThemedText></View>}
      >
        <ThemedView style={styles.container}>
          <View style={styles.titleContainer}>
            <ThemedText type="title">Alarms</ThemedText>
            <View style={styles.iconContainer}>
              <Ionicons name="add" size={32} color="white" style={styles.icon} onPress={() => setModalVisible(true)} />
              <Ionicons name="ellipsis-vertical" size={24} color="white" style={styles.icon} />
            </View>
          </View>
          {/* Additional content goes here */}
        </ThemedView>
      </ParallaxScrollView>

      <AddAlarmModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={(alarm) => console.log(alarm)} />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    height: 200,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  container: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    top: -20,
    left: -20,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -45,
  },
  icon: {
    marginLeft: 20,
  },
});
