import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  timePickerColumn: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 48,
    color: 'white',
  },
  colon: {
    fontSize: 48,
    color: 'white',
    marginHorizontal: 10,
  },
  circleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginVertical: 5,
  },
  circleButtonVisible: {
    backgroundColor: '#808080',
  },
  ampmText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
  },
  scrollableContainer: {
    flex: 1,
    width: width,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  blankSpace: {
    width: '100%',
    height: height - 350,
    backgroundColor: '#333333',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  chevronButton: {
    paddingHorizontal: 10,
  },
  todayText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    flex: 1, // Ensure the text takes up the remaining space
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  dayWrapperSelected: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 15,
  },
  dayText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default styles;
