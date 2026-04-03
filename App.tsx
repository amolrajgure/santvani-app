import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/navigation/AppContext';
import { ThemeProvider, useTheme } from './src/navigation/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppInner() {
  const { isDark } = useTheme();
  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor="transparent" translucent />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppProvider>
          <AppInner />
        </AppProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
