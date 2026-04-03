import React, { useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../navigation/ThemeContext';
import type { AppColors } from '../navigation/ThemeContext';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFilterPress: () => void;
  filterActive?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  onFilterPress,
  filterActive = false,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onFilterPress} style={styles.filterBtn}>
        <Ionicons
          name="options-outline"
          size={22}
          color={filterActive ? colors.primaryDark : colors.textMuted}
        />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="अभंग शोधा..."
        placeholderTextColor={colors.textFaint}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.card,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: C.primary,
      paddingHorizontal: 10,
      height: 44,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
        },
        android: { elevation: 2 },
      }),
    },
    filterBtn: {
      marginRight: 6,
      padding: 2,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: C.text,
      paddingVertical: 0,
    },
    clearBtn: {
      marginLeft: 4,
    },
  });
}
