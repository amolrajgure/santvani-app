import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SAINTS } from '../constants/saints';
import { useTheme } from '../navigation/ThemeContext';
import type { AppColors } from '../navigation/ThemeContext';

interface Props {
  visible: boolean;
  selectedSaints: Set<string>;
  onToggle: (saint: string) => void;
  onSelectAll: () => void;
  onClose: () => void;
}

export function SaintFilterModal({
  visible,
  selectedSaints,
  onToggle,
  onSelectAll,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const allSelected = selectedSaints.size === SAINTS.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>संत निवडा</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {SAINTS.map(saint => {
            const checked = selectedSaints.has(saint);
            return (
              <TouchableOpacity
                key={saint}
                style={styles.row}
                onPress={() => onToggle(saint)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <Text style={styles.saintName}>{saint}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.allBtn}
            onPress={allSelected ? undefined : onSelectAll}
            activeOpacity={allSelected ? 1 : 0.7}
          >
            <Text style={[styles.allBtnText, allSelected && styles.allBtnTextDisabled]}>
              सर्व निवडा
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: C.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 16,
      paddingBottom: 32,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: C.text,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: C.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    checkboxChecked: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    saintName: {
      fontSize: 16,
      color: C.text,
    },
    allBtn: {
      marginTop: 16,
      alignSelf: 'center',
    },
    allBtnText: {
      fontSize: 14,
      color: C.primaryDark,
      fontWeight: '500',
    },
    allBtnTextDisabled: {
      color: C.textFaint,
    },
  });
}
