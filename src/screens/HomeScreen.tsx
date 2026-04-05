import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../navigation/ThemeContext';
import type { AppColors } from '../navigation/ThemeContext';
import { SaintDrawer } from '../components/SaintDrawer';
import { SAINTS } from '../constants/saints';
import { DAILY_ABHANG_IDS } from '../data/daily_abhangas';
import type { Abhang, HomeStackParamList } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_H = 220;

const SAINT_ICONS: Record<string, string> = {
  'संत तुकाराम': '🌼',
  'संत नामदेव': '🪷',
  'संत एकनाथ': '🌺',
  'संत ज्ञानेश्वर': '📿',
};

interface Props {
  useAbhangasHook: ReturnType<typeof import('../hooks/useAbhangas').useAbhangas>;
  useFavoritesHook: ReturnType<typeof import('../hooks/useFavorites').useFavorites>;
}

export function HomeScreen({ useAbhangasHook, useFavoritesHook }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const { mergedAbhangas, getById } = useAbhangasHook;
  const { isFavorite, toggleFavorite } = useFavoritesHook;

  // Pick daily abhangs from the curated list, rolling by day
  const dailyAbhangas = useMemo(() => {
    if (!DAILY_ABHANG_IDS.length) return [];
    const dayOffset = Math.floor(Date.now() / 86400000) % DAILY_ABHANG_IDS.length;
    // Rotate the curated list so today's abhang is first
    const rotated = [
      ...DAILY_ABHANG_IDS.slice(dayOffset),
      ...DAILY_ABHANG_IDS.slice(0, dayOffset),
    ];
    return rotated.map(id => getById(id)).filter((a): a is Abhang => a !== undefined);
  }, [getById]);

  // Favorites preview (up to 5)
  const favoriteAbhangas = useMemo(() => {
    const favs: Abhang[] = [];
    mergedAbhangas.forEach(a => {
      if (isFavorite(a.id) && favs.length < 5) favs.push(a);
    });
    return favs;
  }, [mergedAbhangas, isFavorite]);

  const handlePress = useCallback(
    (id: string) => navigation.navigate('AbhangDetail', { id }),
    [navigation],
  );

  const handleShare = useCallback(async (abhang: Abhang) => {
    try {
      await Share.share({
        message: `${abhang.title}\n\n${abhang.content}\n\n— ${abhang.saint}`,
      });
    } catch {}
  }, []);

  const handleSelectSaint = useCallback(
    (saint: string) => navigation.navigate('Browse', { saint }),
    [navigation],
  );

  const handleBrowseAll = useCallback(
    () => navigation.navigate('Browse', {}),
    [navigation],
  );

  const renderDailyCard = useCallback(
    ({ item }: { item: Abhang }) => {
      const fav = isFavorite(item.id);
      // Show first 3 lines of content
      const preview = item.content.split('\n').slice(0, 3).join('\n');
      return (
        <TouchableOpacity
          style={[styles.dailyCard, { width: SCREEN_WIDTH - 32 }]}
          onPress={() => handlePress(item.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.dailyCardContent} numberOfLines={4}>
            {preview}
          </Text>
          <Text style={styles.dailyCardSaint}>— {item.saint}</Text>
          <View style={styles.dailyCardActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => toggleFavorite(item.id)}
              hitSlop={8}
            >
              <Ionicons
                name={fav ? 'heart' : 'heart-outline'}
                size={22}
                color={fav ? colors.danger : colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleShare(item)}
              hitSlop={8}
            >
              <Ionicons name="share-outline" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [isFavorite, toggleFavorite, handlePress, handleShare, colors, styles],
  );

  const renderSaintCard = useCallback(
    (saint: string, index: number) => (
      <TouchableOpacity
        key={saint}
        style={[styles.saintCard, index % 2 === 1 && styles.saintCardRight]}
        onPress={() => handleSelectSaint(saint)}
        activeOpacity={0.8}
      >
        <Text style={styles.saintCardIcon}>{SAINT_ICONS[saint] ?? '🙏'}</Text>
        <Text style={styles.saintCardName} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>{saint}</Text>
      </TouchableOpacity>
    ),
    [handleSelectSaint, styles],
  );

  const renderFavCard = useCallback(
    (item: Abhang) => (
      <TouchableOpacity
        key={item.id}
        style={styles.favCard}
        onPress={() => handlePress(item.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.favCardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.favCardSaint}>{item.saint.replace('संत ', '')}</Text>
      </TouchableOpacity>
    ),
    [handlePress, styles],
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar — extra paddingTop handles Android status bar */}
      <View style={[styles.topBar, Platform.OS === 'android' && { paddingTop: (StatusBar.currentHeight ?? 24) + 8 }]}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} hitSlop={8} style={styles.topBarBtn}>
          <Ionicons name="menu-outline" size={26} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>दैनिक अभंग</Text>
        <TouchableOpacity
          onPress={handleBrowseAll}
          hitSlop={8}
          style={styles.topBarBtn}
        >
          <Ionicons name="search-outline" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Daily Abhang swipeable cards */}
        <FlatList
          data={dailyAbhangas}
          keyExtractor={item => item.id}
          renderItem={renderDailyCard}
          horizontal
          pagingEnabled
          snapToInterval={SCREEN_WIDTH - 32 + 12}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dailyList}
          scrollEnabled
          nestedScrollEnabled
        />

        {/* Explore Saints */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>संत निवडा</Text>
            <TouchableOpacity onPress={handleBrowseAll} hitSlop={8}>
              <Text style={styles.seeAll}>सर्व →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.saintGrid}>
            {SAINTS.map((saint, index) => renderSaintCard(saint, index))}
          </View>
        </View>

        {/* Favorites preview */}
        {favoriteAbhangas.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>आवडते अभंग</Text>
            </View>
            <View style={styles.favGrid}>
              {favoriteAbhangas.map(renderFavCard)}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Side Drawer */}
      <SaintDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectSaint={handleSelectSaint}
        onBrowseAll={handleBrowseAll}
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
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: C.background,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    topBarBtn: {
      padding: 4,
      width: 36,
      alignItems: 'center',
    },
    topBarTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: C.primaryDark,
      letterSpacing: 0.3,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    // Daily cards
    dailyList: {
      paddingHorizontal: 16,
      paddingTop: 20,
      gap: 12,
    },
    dailyCard: {
      backgroundColor: C.card,
      borderRadius: 16,
      padding: 20,
      marginRight: 12,
      minHeight: CARD_H,
      borderWidth: 1,
      borderColor: C.primaryBorder,
      shadowColor: C.primaryDark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      justifyContent: 'space-between',
    },
    dailyCardContent: {
      fontSize: 17,
      lineHeight: 28,
      color: C.text,
      fontWeight: '400',
      flex: 1,
    },
    dailyCardSaint: {
      fontSize: 13,
      color: C.primaryDark,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 4,
    },
    dailyCardActions: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 8,
    },
    actionBtn: {
      padding: 4,
    },
    // Section
    section: {
      marginTop: 28,
      paddingHorizontal: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: C.text,
      letterSpacing: 0.2,
    },
    seeAll: {
      fontSize: 13,
      color: C.primary,
      fontWeight: '600',
    },
    // Saint cards — 2-column grid
    saintGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    saintCard: {
      backgroundColor: C.surface,
      borderRadius: 14,
      paddingVertical: 18,
      paddingHorizontal: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.primaryBorder,
      flexBasis: '47%',
      flexGrow: 1,
    },
    saintCardRight: {
      // no extra style needed; flexWrap handles layout
    },
    saintCardIcon: {
      fontSize: 30,
      marginBottom: 8,
    },
    saintCardName: {
      fontSize: 12,
      fontWeight: '600',
      color: C.text,
      textAlign: 'center',
    },
    // Favorites
    favGrid: {
      gap: 10,
    },
    favCard: {
      backgroundColor: C.surface,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: C.border,
    },
    favCardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: C.text,
    },
    favCardSaint: {
      fontSize: 12,
      color: C.textMuted,
      marginTop: 2,
    },
  });
}
