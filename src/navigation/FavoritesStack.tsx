import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { AbhangDetailScreen } from '../screens/AbhangDetailScreen';
import { useAppContext } from './AppContext';
import { useTheme } from './ThemeContext';
import type { FavoritesStackParamList } from '../types';

const Stack = createNativeStackNavigator<FavoritesStackParamList>();

export function FavoritesStack() {
  const { abhangas, favorites } = useAppContext();
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="Favorites"
        options={{
          title: 'आवडते',
          headerRight: () => (
            <TouchableOpacity onPress={toggleTheme} hitSlop={8} style={{ padding: 4 }}>
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={22}
                color={colors.primaryDark}
              />
            </TouchableOpacity>
          ),
        }}
      >
        {() => (
          <FavoritesScreen
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
