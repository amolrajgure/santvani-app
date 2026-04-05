import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../navigation/ThemeContext';
import type { AppColors } from '../navigation/ThemeContext';
import { SAINTS } from '../constants/saints';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.72;

const SAINT_ICONS: Record<string, string> = {
  'संत तुकाराम': '🌼',
  'संत नामदेव': '🪷',
  'संत एकनाथ': '🌺',
  'संत ज्ञानेश्वर': '📿',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectSaint: (saint: string) => void;
  onBrowseAll: () => void;
}

export function SaintDrawer({ visible, onClose, onSelectSaint, onBrowseAll }: Props) {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        {/* App title area */}
        <View style={styles.drawerHeader}>
          <Text style={styles.appTitle}>संतांचे अभंग</Text>
          <Text style={styles.appSubtitle}>भक्तिरस संग्रह</Text>
        </View>

        <View style={styles.divider} />

        {/* Saints list */}
        <Text style={styles.sectionLabel}>संत निवडा</Text>
        {SAINTS.map(saint => (
          <TouchableOpacity
            key={saint}
            style={styles.saintRow}
            onPress={() => { onSelectSaint(saint); onClose(); }}
            activeOpacity={0.7}
          >
            <Text style={styles.saintIcon}>{SAINT_ICONS[saint] ?? '🙏'}</Text>
            <Text style={styles.saintName}>{saint}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {/* Browse all */}
        <TouchableOpacity
          style={styles.browseAllRow}
          onPress={() => { onBrowseAll(); onClose(); }}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={18} color={colors.primary} />
          <Text style={styles.browseAllText}>सर्व अभंग शोधा</Text>
        </TouchableOpacity>

        {/* Theme toggle */}
        <TouchableOpacity style={styles.themeRow} onPress={toggleTheme} activeOpacity={0.7}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={18}
            color={colors.textMuted}
          />
          <Text style={styles.themeText}>{isDark ? 'उजळ थीम' : 'गडद थीम'}</Text>
        </TouchableOpacity>

        {/* Contact */}
        <TouchableOpacity
          style={styles.themeRow}
          onPress={() => Linking.openURL('mailto:amolrajgure@gmail.com')}
          activeOpacity={0.7}
        >
          <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
          <Text style={styles.themeText}>संपर्क करा</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    drawer: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: DRAWER_WIDTH,
      backgroundColor: C.drawerBg,
      paddingTop: 56,
      paddingHorizontal: 0,
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 16,
    },
    drawerHeader: {
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    appTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: C.primaryDark,
      letterSpacing: 0.5,
    },
    appSubtitle: {
      fontSize: 13,
      color: C.textMuted,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: C.border,
      marginHorizontal: 20,
      marginVertical: 12,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: C.textFaint,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      paddingHorizontal: 24,
      marginBottom: 6,
    },
    saintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
      paddingHorizontal: 24,
      gap: 12,
    },
    saintIcon: {
      fontSize: 20,
    },
    saintName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: C.text,
    },
    browseAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      gap: 12,
    },
    browseAllText: {
      fontSize: 15,
      fontWeight: '600',
      color: C.primary,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      gap: 12,
      marginTop: 4,
    },
    themeText: {
      fontSize: 14,
      color: C.textMuted,
    },
  });
}
