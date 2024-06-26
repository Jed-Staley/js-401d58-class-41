import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from '../styles/others/AddAlarmModalStyles'; // Import the styles

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const daysOfWeekFull = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const today = new Date();

interface AddAlarmModalProps {
  visible: boolean;
  onSave: (alarm: Alarm) => void;
  onClose: () => void;
  onDelete?: (id: string) => void; // Add this prop for deleting an alarm
  alarm?: Alarm | null;
}

interface Alarm {
  id: string;
  time: string;
  info: string;
  selectedDays: boolean[];
  isEnabled: boolean;
}

const getFormattedDate = (date: Date, selectedDays: boolean[]): string => {
  const dayDifference = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  let dayInTermsOfPresent: string | undefined;
  if (dayDifference === -1) dayInTermsOfPresent = 'Yesterday';
  else if (dayDifference === 0) dayInTermsOfPresent = 'Today';
  else if (dayDifference === 1) dayInTermsOfPresent = 'Tomorrow';

  const dayOfWeekAbbreviated = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthAbbreviated = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const selectedDaysAbbreviated = selectedDays
    .map((isSelected, index) => (isSelected ? daysOfWeekFull[index] : null))
    .filter((day) => day);

  if (selectedDays.every((day) => day)) {
    return 'Every day';
  }

  if (
    selectedDaysAbbreviated.length === 5 &&
    weekdays.every((weekday) => selectedDaysAbbreviated.includes(weekday))
  ) {
    return 'Every Weekday';
  }

  if (selectedDaysAbbreviated.length > 0) {
    return `Every ${selectedDaysAbbreviated.join(', ')}`;
  }

  return dayInTermsOfPresent
    ? `${dayInTermsOfPresent} - ${dayOfWeekAbbreviated}, ${monthAbbreviated} ${day}`
    : `${dayOfWeekAbbreviated}, ${monthAbbreviated} ${day}`;
};

const AddAlarmModal: React.FC<AddAlarmModalProps> = ({ visible, onSave, onClose, onDelete, alarm }) => {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState('AM');
  const [currentDate, setCurrentDate] = useState(today);
  const [showCircle, setShowCircle] = useState({
    hourUp: false,
    hourDown: false,
    minuteUp: false,
    minuteDown: false,
    ampmUp: false,
    ampmDown: false,
  });
  const [selectedDays, setSelectedDays] = useState(Array(daysOfWeek.length).fill(false));

  const hourInterval = useRef<NodeJS.Timeout | null>(null);
  const minuteInterval = useRef<NodeJS.Timeout | null>(null);
  const ampmInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (alarm) {
      const [hourString, minuteString, period] = alarm.time.split(/[: ]/);
      setHour(parseInt(hourString));
      setMinute(parseInt(minuteString));
      setAmpm(period as 'AM' | 'PM');
      setCurrentDate(new Date());
      setSelectedDays(alarm.selectedDays);
    }
  }, [alarm]);

  const handleHourChange = (direction: number) => {
    setHour((prevHour) => {
      let newHour = prevHour + direction;
      if (newHour > 12) newHour = 1;
      if (newHour < 1) newHour = 12;
      return newHour;
    });
  };

  const handleMinuteChange = (direction: number) => {
    setMinute((prevMinute) => {
      let newMinute = prevMinute + direction;
      if (newMinute > 59) newMinute = 0;
      if (newMinute < 0) newMinute = 59;
      return newMinute;
    });
  };

  const handleAmPmChange = () => {
    setAmpm((prevAmPm) => (prevAmPm === 'AM' ? 'PM' : 'AM'));
  };

  const toggleDay = (index: number) => {
    setSelectedDays((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const startChange = (
    changeFunction: (direction: number) => void,
    direction: number,
    intervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
    circleKey: keyof typeof showCircle
  ) => {
    changeFunction(direction);
    setShowCircle((prevState) => ({ ...prevState, [circleKey]: true }));
    intervalRef.current = setInterval(() => changeFunction(direction), 100);
  };

  const stopChange = (intervalRef: React.MutableRefObject<NodeJS.Timeout | null>, circleKey: keyof typeof showCircle) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setShowCircle((prevState) => ({ ...prevState, [circleKey]: false }));
  };

  const advanceDay = (direction: number) => {
    setCurrentDate((prevDate) => new Date(prevDate.setDate(prevDate.getDate() + direction)));
  };

  const formattedDate = getFormattedDate(currentDate, selectedDays);
  const showChevrons = !selectedDays.includes(true);

  const handleSave = () => {
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
    const info = formattedDate;
    const newAlarm: Alarm = {
      id: alarm?.id ?? generateUUID(), // Use the custom UUID generator
      time,
      info,
      selectedDays,
      isEnabled: true,
    };
    onSave(newAlarm);
  };

  const handleDelete = () => {
    if (alarm && onDelete) {
      onDelete(alarm.id);
      onClose();
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerColumn}>
            <TouchableOpacity
              onPressIn={() => startChange(handleHourChange, 1, hourInterval, 'hourUp')}
              onPressOut={() => stopChange(hourInterval, 'hourUp')}
              style={[styles.circleButton, showCircle.hourUp && styles.circleButtonVisible]}
            >
              <Ionicons name="chevron-up" size={24} color="dimgrey" />
            </TouchableOpacity>
            <Text style={styles.timeText}>{hour.toString().padStart(2, '0')}</Text>
            <TouchableOpacity
              onPressIn={() => startChange(handleHourChange, -1, hourInterval, 'hourDown')}
              onPressOut={() => stopChange(hourInterval, 'hourDown')}
              style={[styles.circleButton, showCircle.hourDown && styles.circleButtonVisible]}
            >
              <Ionicons name="chevron-down" size={24} color="dimgrey" />
            </TouchableOpacity>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timePickerColumn}>
            <TouchableOpacity
              onPressIn={() => startChange(handleMinuteChange, 1, minuteInterval, 'minuteUp')}
              onPressOut={() => stopChange(minuteInterval, 'minuteUp')}
              style={[styles.circleButton, showCircle.minuteUp && styles.circleButtonVisible]}
            >
              <Ionicons name="chevron-up" size={24} color="dimgrey" />
            </TouchableOpacity>
            <Text style={styles.timeText}>{minute.toString().padStart(2, '0')}</Text>
            <TouchableOpacity
              onPressIn={() => startChange(handleMinuteChange, -1, minuteInterval, 'minuteDown')}
              onPressOut={() => stopChange(minuteInterval, 'minuteDown')}
              style={[styles.circleButton, showCircle.minuteDown && styles.circleButtonVisible]}
            >
              <Ionicons name="chevron-down" size={24} color="dimgrey" />
            </TouchableOpacity>
          </View>
          <View style={styles.timePickerColumn}>
            <TouchableOpacity
              onPressIn={() => startChange(handleAmPmChange, 1, ampmInterval, 'ampmUp')}
              onPressOut={() => stopChange(ampmInterval, 'ampmUp')}
              style={[styles.circleButton, showCircle.ampmUp && styles.circleButtonVisible]}
            >
              <Ionicons name="chevron-up" size={24} color="dimgrey" />
            </TouchableOpacity>
            <Text style={styles.ampmText}>{ampm}</Text>
            <TouchableOpacity
              onPressIn={() => startChange(handleAmPmChange, 1, ampmInterval, 'ampmDown')}
              onPressOut={() => stopChange(ampmInterval, 'ampmDown')}
              style={[styles.circleButton, showCircle.ampmDown && styles.circleButtonVisible]}
            >
              <Ionicons name="chevron-down" size={24} color="dimgrey" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.scrollableContainer}>
          <View style={styles.blankSpace}>
            <View style={styles.dateContainer}>
              {showChevrons && (
                <TouchableOpacity onPress={() => advanceDay(-1)} style={styles.chevronButton}>
                  <Ionicons name="chevron-back" size={24} color="dimgrey" />
                </TouchableOpacity>
              )}
              <Text style={styles.todayText}>{formattedDate}</Text>
              {showChevrons && (
                <TouchableOpacity onPress={() => advanceDay(1)} style={styles.chevronButton}>
                  <Ionicons name="chevron-forward" size={24} color="dimgrey" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.daysContainer}>
              {daysOfWeek.map((day, index) => (
                <TouchableOpacity key={index} onPress={() => toggleDay(index)}>
                  <View style={[styles.dayWrapper, selectedDays[index] && styles.dayWrapperSelected]}>
                    <Text style={styles.dayText}>{day}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {alarm && (
              <View style={styles.deleteContainer}>
                <TouchableOpacity onPress={handleDelete}>
                  <Ionicons name="trash" size={32} color="red" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddAlarmModal;

const generateUUID = (): string => {
  // A simple UUID generator (not as robust as 'uuid' package, but works for demo purposes)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
    v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});
};
