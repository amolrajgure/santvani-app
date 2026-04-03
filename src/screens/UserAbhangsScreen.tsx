import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AbhangCard } from '../components/AbhangCard';
import { EmptyState } from '../components/EmptyState';
import { useTheme } from '../navigation/ThemeContext';
import type { AppColors } from '../navigation/ThemeContext';
import type { Abhang, UserStackParamList } from '../types';

interface Props {
  useUserAbhangsHook: ReturnType<typeof import('../hooks/useUserAbhangas').useUserAbhangas>;
  useFavoritesHook: ReturnType<typeof import('../hooks/useFavorites').useFavorites>;
}

export function UserAbhangsScreen({ useUserAbhangsHook, useFavoritesHook }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { userAbhangas } = useUserAbhangsHook;
  const { isFavorite, toggleFavorite } = useFavoritesHook;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddAbhang', {})}
          hitSlop={8}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={26} color={colors.primaryDark} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors, styles]);

  const handlePress = useCallback(
    (id: string) => navigation.navigate('AbhangDetail', { id }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Abhang }) => (
      <AbhangCard
        item={item}
        query=""
        isFavorite={isFavorite(item.id)}
        onPress={() => handlePress(item.id)}
        onFavoriteToggle={() => toggleFavorite(item.id)}
      />
    ),
    [isFavorite, toggleFavorite, handlePress],
  );

  return (
    <SafeAreaView style={styles.safe}>
      {userAbhangas.length === 0 ? (
        <EmptyState
          message={'तुमचे स्वतःचे अभंग येथे दिसतील.\n+ बटणावर दाबा.'}
          icon="add-circle-outline"
        />
      ) : (
        <FlatList
          data={userAbhangas}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          initialNumToRender={25}
          maxToRenderPerBatch={25}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.count}>{userAbhangas.length} माझे अभंग</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.background,
    },
    list: {
      paddingBottom: 16,
    },
    count: {
      fontSize: 12,
      color: C.textMuted,
      marginLeft: 14,
      marginTop: 10,
      marginBottom: 4,
    },
    addBtn: {
      padding: 4,
      marginRight: 4,
    },
  });
}
