declare module 'react-native-background-timer' {
  export function runBackgroundTimer(callback: () => void, delay: number): void;
  export function stopBackgroundTimer(): void;
}
