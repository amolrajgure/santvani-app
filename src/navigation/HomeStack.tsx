import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { BrowseScreen } from '../screens/BrowseScreen';
import { AbhangDetailScreen } from '../screens/AbhangDetailScreen';
import { useAppContext } from './AppContext';
import { useTheme } from './ThemeContext';
import type { HomeStackParamList } from '../types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  const { abhangas, favorites } = useAppContext();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="Home"
        options={{ headerShown: false }}
      >
        {() => (
          <HomeScreen
            useAbhangasHook={abhangas}
            useFavoritesHook={favorites}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Browse"
        options={{ title: 'अभंग शोधा' }}
      >
        {() => (
          <BrowseScreen
            useAbhangasHook={abhangas}
            useFavoritesHook={favorites}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="AbhangDetail"
        options={{ title: 'अभंग' }}
      >
        {() => (
          <AbhangDetailScreen
            useAbhangasHook={abhangas}
            useFavoritesHook={favorites}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
