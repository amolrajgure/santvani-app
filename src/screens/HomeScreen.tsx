import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AbhangCard } from '../components/AbhangCard';
import { SearchBar } from '../components/SearchBar';
import { SaintFilterModal } from '../components/SaintFilterModal';
import { EmptyState } from '../components/EmptyState';
import { useTheme } from '../navigation/ThemeContext';
import type { AppColors } from '../navigation/ThemeContext';
import { SAINTS } from '../constants/saints';
import type { Abhang, HomeStackParamList } from '../types';

interface Props {
  useAbhangasHook: ReturnType<typeof import('../hooks/useAbhangas').useAbhangas>;
  useFavoritesHook: ReturnType<typeof import('../hooks/useFavorites').useFavorites>;
}

export function HomeScreen({ useAbhangasHook, useFavoritesHook }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [filterVisible, setFilterVisible] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const {
    query,
    setQuery,
    selectedSaints,
    toggleSaint,
    selectAllSaints,
    visibleItems,
    loadMore,
    filteredCount,
    totalCount,
    hasMore,
  } = useAbhangasHook;

  const { isFavorite, toggleFavorite } = useFavoritesHook;

  const filterActive = selectedSaints.size < SAINTS.length;

  const handlePress = useCallback(
    (id: string) => navigation.navigate('AbhangDetail', { id }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Abhang }) => (
      <AbhangCard
        item={item}
        query={query}
        isFavorite={isFavorite(item.id)}
        onPress={() => handlePress(item.id)}
        onFavoriteToggle={() => toggleFavorite(item.id)}
      />
    ),
    [query, isFavorite, toggleFavorite, handlePress],
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Fixed header — always interactive regardless of scroll position */}
      <View style={styles.searchHeader}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          onFilterPress={() => setFilterVisible(true)}
          filterActive={filterActive}
        />
        <Text style={styles.stats}>
          {filteredCount === totalCount
            ? `एकूण ${totalCount} अभंग`
            : `${filteredCount} / ${totalCount} अभंग`}
        </Text>
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState message={query ? 'कोणताही अभंग सापडला नाही' : 'अभंग लोड होत आहे...'} />
        }
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        initialNumToRender={25}
        maxToRenderPerBatch={25}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      <SaintFilterModal
        visible={filterVisible}
        selectedSaints={selectedSaints}
        onToggle={toggleSaint}
        onSelectAll={selectAllSaints}
        onClose={() => setFilterVisible(false)}
      />
    </SafeAreaView>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.background,
    },
    searchHeader: {
      backgroundColor: C.background,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 6,
      zIndex: 1,
    },
    stats: {
      fontSize: 12,
      color: C.textMuted,
      marginTop: 6,
      marginLeft: 2,
    },
    list: {
      paddingBottom: 16,
    },
  });
}
