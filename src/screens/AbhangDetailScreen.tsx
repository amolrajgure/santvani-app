import React, { useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FavoriteButton } from '../components/FavoriteButton';
import { useTheme } from '../navigation/ThemeContext';
import type { AppColors } from '../navigation/ThemeContext';
import type {
  HomeStackParamList,
  FavoritesStackParamList,
  UserStackParamList,
} from '../types';

type AnyStackParamList = HomeStackParamList | FavoritesStackParamList | UserStackParamList;

interface Props {
  useAbhangasHook: { getById: (id: string) => import('../types').Abhang | undefined };
  useFavoritesHook: ReturnType<typeof import('../hooks/useFavorites').useFavorites>;
  useUserAbhangsHook?: ReturnType<typeof import('../hooks/useUserAbhangas').useUserAbhangas>;
}

export function AbhangDetailScreen({
  useAbhangasHook,
  useFavoritesHook,
  useUserAbhangsHook,
}: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<AnyStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'AbhangDetail'>>();
  const { id } = route.params;
  const { colors } = useTheme();

  const abhang = useAbhangasHook.getById(id);
  const { isFavorite, toggleFavorite } = useFavoritesHook;

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleShare = async () => {
    if (!abhang) return;
    try {
      await Share.share({
        message: `${abhang.saint}\nअभंग क्र. ${abhang.title}\n\n${abhang.content}${abhang.meaning ? `\n\nअर्थ:\n${abhang.meaning}` : ''}`,
        title: `${abhang.saint} - अभंग ${abhang.title}`,
      });
    } catch (_) {
      // ignore
    }
  };

  const handleDelete = () => {
    Alert.alert('अभंग हटवा', 'हा अभंग कायमचा हटवायचा का?', [
      { text: 'नाही', style: 'cancel' },
      {
        text: 'होय, हटवा',
        style: 'destructive',
        onPress: () => {
          useUserAbhangsHook?.deleteAbhang(id);
          navigation.goBack();
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: abhang ? abhang.saint.replace('संत ', '') : 'अभंग',
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} hitSlop={8} style={styles.headerBtn}>
            <Ionicons name="share-outline" size={22} color={colors.primaryDark} />
          </TouchableOpacity>
          {abhang?.isUserAdded && useUserAbhangsHook && (
            <TouchableOpacity
              onPress={() => handleDelete()}
              hitSlop={8}
              style={styles.headerBtn}
            >
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </TouchableOpacity>
          )}
          <FavoriteButton
            isFavorite={isFavorite(id)}
            onToggle={() => toggleFavorite(id)}
          />
        </View>
      ),
    });
  }, [id, abhang, isFavorite, toggleFavorite, colors, styles]);

  if (!abhang) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>अभंग सापडला नाही</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Saint tag */}
      <View style={styles.saintTagRow}>
        <View style={styles.saintTag}>
          <Text style={styles.saintTagText}>{abhang.saint}</Text>
        </View>
        {abhang.isUserAdded && (
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>माझा अभंग</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>अभंग क्र. {abhang.title}</Text>

      {/* Content */}
      <View style={styles.contentBox}>
        {abhang.content.split('\n').map((line, i) => (
          <Text key={i} style={[styles.line, line.trim() === '' && styles.spacer]}>
            {line}
          </Text>
        ))}
      </View>

      {/* Meaning */}
      <View style={styles.meaningBox}>
        <Text style={styles.meaningLabel}>अर्थ</Text>
        {abhang.meaning ? (
          <Text style={styles.meaningText}>{abhang.meaning}</Text>
        ) : (
          <Text style={styles.meaningEmpty}>अर्थ लवकरच येईल...</Text>
        )}
      </View>
    </ScrollView>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: C.background,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    saintTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    saintTag: {
      backgroundColor: C.primaryLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.primaryBorder,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    saintTagText: {
      fontSize: 13,
      color: C.primaryDark,
      fontWeight: '600',
    },
    userBadge: {
      backgroundColor: C.userBadgeBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.userBadgeBorder,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    userBadgeText: {
      fontSize: 12,
      color: C.userBadgeText,
      fontWeight: '500',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: C.primaryDark,
      marginBottom: 14,
    },
    contentBox: {
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: C.primary,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    line: {
      fontSize: 16,
      color: C.text,
      lineHeight: 26,
    },
    spacer: {
      height: 8,
    },
    meaningBox: {
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: C.meaningBorder,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    meaningLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: C.meaningLabel,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    },
    meaningText: {
      fontSize: 15,
      color: C.text,
      lineHeight: 24,
    },
    meaningEmpty: {
      fontSize: 14,
      color: C.textFaint,
      fontStyle: 'italic',
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notFoundText: {
      color: C.textMuted,
      fontSize: 16,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerBtn: {
      padding: 4,
    },
  });
}
