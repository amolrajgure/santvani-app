import React, { useCallback, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AbhangCard } from '../components/AbhangCard';
import { EmptyState } from '../components/EmptyState';
import { useTheme } from '../navigation/ThemeContext';
import type { AppColors } from '../navigation/ThemeContext';
import type { Abhang, FavoritesStackParamList } from '../types';

interface Props {
  useAbhangasHook: { mergedAbhangas: Abhang[] };
  useFavoritesHook: ReturnType<typeof import('../hooks/useFavorites').useFavorites>;
}

export function FavoritesScreen({ useAbhangasHook, useFavoritesHook }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<FavoritesStackParamList>>();
  const { mergedAbhangas } = useAbhangasHook;
  const { favorites, isFavorite, toggleFavorite } = useFavoritesHook;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const favoriteItems = useMemo(
    () => mergedAbhangas.filter(a => favorites.has(a.id)),
    [mergedAbhangas, favorites],
  );

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
      {favoriteItems.length === 0 ? (
        <EmptyState
          message={'आवडते अभंग येथे दिसतील.\nएखाद्या अभंगावर ❤️ दाबा.'}
          icon="heart-outline"
        />
      ) : (
        <FlatList
          data={favoriteItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          initialNumToRender={25}
          maxToRenderPerBatch={25}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.count}>{favoriteItems.length} आवडते अभंग</Text>
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
  });
}
