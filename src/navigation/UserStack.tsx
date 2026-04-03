import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { UserAbhangsScreen } from '../screens/UserAbhangsScreen';
import { AddAbhangScreen } from '../screens/AddAbhangScreen';
import { AbhangDetailScreen } from '../screens/AbhangDetailScreen';
import { useAppContext } from './AppContext';
import { useTheme } from './ThemeContext';
import type { UserStackParamList } from '../types';

const Stack = createNativeStackNavigator<UserStackParamList>();

export function UserStack() {
  const { abhangas, favorites, userAbhangas } = useAppContext();
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
        name="UserAbhangs"
        options={{
          title: 'माझे अभंग',
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
          <UserAbhangsScreen
            useUserAbhangsHook={userAbhangas}
            useFavoritesHook={favorites}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="AddAbhang"
        options={{ title: 'नवीन अभंग' }}
      >
        {() => <AddAbhangScreen useUserAbhangsHook={userAbhangas} />}
      </Stack.Screen>
      <Stack.Screen
        name="AbhangDetail"
        options={{ title: 'अभंग' }}
      >
        {() => (
          <AbhangDetailScreen
            useAbhangasHook={abhangas}
            useFavoritesHook={favorites}
            useUserAbhangsHook={userAbhangas}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
