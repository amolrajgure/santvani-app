import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../navigation/ThemeContext';
import type { AppColors } from '../navigation/ThemeContext';
import type { Abhang } from '../types';

interface Props {
  item: Abhang;
  query: string;
  isFavorite: boolean;
  onPress: () => void;
  onFavoriteToggle: () => void;
}

function highlightText(text: string, query: string, highlightBg: string): React.ReactNode {
  if (!query.trim()) return <Text>{text}</Text>;
  const q = query.trim();
  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let last = 0;
  let idx = lower.indexOf(lowerQ, last);
  while (idx !== -1) {
    if (idx > last) parts.push(<Text key={`t-${last}`}>{text.slice(last, idx)}</Text>);
    parts.push(
      <Text key={`h-${idx}`} style={{ backgroundColor: highlightBg }}>
        {text.slice(idx, idx + q.length)}
      </Text>,
    );
    last = idx + q.length;
    idx = lower.indexOf(lowerQ, last);
  }
  if (last < text.length) parts.push(<Text key={`t-${last}`}>{text.slice(last)}</Text>);
  return <>{parts}</>;
}

// Show only first 2 lines of content as preview
function getPreview(content: string): string {
  const lines = content.split('\n').filter(l => l.trim());
  return lines.slice(0, 2).join('\n');
}

export const AbhangCard = memo(function AbhangCard({
  item,
  query,
  isFavorite,
  onPress,
  onFavoriteToggle,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const preview = getPreview(item.content);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{highlightText(item.title, query, colors.highlight)}</Text>
        <View style={styles.rightRow}>
          <View style={styles.saintTag}>
            <Text style={styles.saintTagText} numberOfLines={1}>
              {item.saint.replace('संत ', '')}
            </Text>
          </View>
          {item.isUserAdded && (
            <Ionicons name="person" size={13} color={colors.primaryDark} style={styles.userIcon} />
          )}
          <TouchableOpacity onPress={onFavoriteToggle} hitSlop={8} style={styles.favBtn}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.danger : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.content} numberOfLines={3}>
        {highlightText(preview, query, colors.highlight)}
      </Text>
    </TouchableOpacity>
  );
});

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: C.card,
      borderRadius: 10,
      padding: 14,
      marginHorizontal: 12,
      marginVertical: 5,
      borderLeftWidth: 4,
      borderLeftColor: C.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: C.primaryDark,
      flex: 1,
      marginRight: 8,
    },
    rightRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    saintTag: {
      backgroundColor: C.primaryLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.primaryBorder,
      paddingHorizontal: 8,
      paddingVertical: 2,
      maxWidth: 90,
    },
    saintTagText: {
      fontSize: 11,
      color: C.primaryDark,
      fontWeight: '500',
    },
    userIcon: {
      marginLeft: 2,
    },
    favBtn: {
      padding: 2,
    },
    content: {
      fontSize: 14,
      color: C.text,
      lineHeight: 21,
    },
  });
}
