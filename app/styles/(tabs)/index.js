import { StyleSheet } from 'react-native';

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
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  alarmTime: {
    fontSize: 24,
    color: 'white',
  },
  alarmInfo: {
    fontSize: 16,
    color: 'gray',
  },
  alarmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alarmModal: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  alarmModalText: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default styles;
