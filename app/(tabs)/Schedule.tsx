import React from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList } from 'react-native';

const hours = [
  '12AM', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
  '12PM', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <View>
          <View style={styles.headerRow}>
            <View style={styles.emptyHeaderCell} />
            {daysOfWeek.map((day, index) => (
              <View style={styles.headerCell} key={index}>
                <Text style={styles.headerText}>{day}</Text>
              </View>
            ))}
          </View>
          <FlatList
            data={hours}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.rowContainer}>
                <View style={styles.timeCell}>
                  <Text style={styles.timeText}>{item}</Text>
                </View>
                <View style={styles.row}>
                  {daysOfWeek.map((day, colIndex) => (
                    <View style={styles.cell} key={colIndex} />
                  ))}
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    marginTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    paddingTop: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  emptyHeaderCell: {
    height: 30,
    width: 45,
  },
  headerCell: {
    height: 30,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  headerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cell: {
    height: 45,
    width: 45,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  timeCell: {
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    transform: [{ translateY: -23 }],
  },
});
