# Alarm App

An alarm application built using React Native, Expo, and TypeScript. This app allows users to set and manage alarms with notifications and sound.

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/alarm-app.git
   cd alarm-app
   ```

2. **Install dependencies:**
   Make sure you have `yarn` or `npm` installed, then run:

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Install Expo CLI (if not already installed):**

   ```bash
   npm install -g expo-cli
   ```

4. **Run the application:**

   ```bash
   expo start
   ```

5. **Set up your device or emulator:**
   - For iOS: Use an iPhone simulator or the Expo Go app on a physical device.
   - For Android: Use an Android emulator or the Expo Go app on a physical device.

## Process

1. **Project Structure:**
   The project is structured with a focus on modular components. The key folders and files are:
   - `components`: Contains reusable components like `ParallaxScrollView`, `ThemedText`, and `ThemedView`.
   - `others`: Contains the `AddAlarmModal` component for adding and managing alarms.
   - `styles`: Contains styles for various components and screens.
   - `App.tsx`: The main entry point of the application.

2. **Adding an Alarm:**
   - Tap the add icon (`+`) on the main screen to open the `AddAlarmModal`.
   - Set the time, additional information, and select the days for the alarm.
   - Save the alarm to see it listed on the main screen.

3. **Managing Alarms:**
   - Toggle the switch to enable or disable an alarm.
   - Long press an alarm to drag and reorder it in the list.
   - Tap an alarm to edit or delete it using the `AddAlarmModal`.

4. **Notifications and Sounds:**
   - The app uses `expo-notifications` to schedule and handle alarm notifications.
   - The `expo-av` library is used to play alarm sounds.
   - Notifications and sounds are triggered based on the alarm time and settings.

5. **Background Tasks:**
   - Background tasks are managed using `expo-task-manager` and `expo-background-fetch`.
   - Alarms are checked and notifications are scheduled even when the app is not in the foreground.

6. **Permissions:**
   - The app requests notification permissions on launch.
   - Ensure permissions are granted for the app to function correctly.

7. **Development Notes:**
   - Use the `GestureHandlerRootView` to wrap components that use gestures, such as `DraggableFlatList`.
   - Maintain the modularity of components and ensure styles are defined in separate files for better readability and maintenance.

Feel free to explore the code and contribute to the project by creating pull requests or issues on GitHub.

## Author

Jedidiah Staley
