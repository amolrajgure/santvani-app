import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SAINTS } from '../constants/saints';
import { useTheme } from '../navigation/ThemeContext';
import type { AppColors } from '../navigation/ThemeContext';
import type { Abhang, UserStackParamList } from '../types';

interface Props {
  useUserAbhangsHook: ReturnType<typeof import('../hooks/useUserAbhangas').useUserAbhangas>;
}

export function AddAbhangScreen({ useUserAbhangsHook }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { addAbhang } = useUserAbhangsHook;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [saint, setSaint] = useState<string>(SAINTS[0]);
  const [customSaint, setCustomSaint] = useState('');
  const [useCustomSaint, setUseCustomSaint] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [meaning, setMeaning] = useState('');

  const handleSave = () => {
    const saintValue = useCustomSaint ? customSaint.trim() : saint;
    const titleValue = title.trim();
    const contentValue = content.trim();

    if (!titleValue) {
      Alert.alert('चूक', 'अभंगाचे नाव/क्रमांक भरा');
      return;
    }
    if (!contentValue) {
      Alert.alert('चूक', 'अभंगाचा मजकूर भरा');
      return;
    }
    if (!saintValue) {
      Alert.alert('चूक', 'संताचे नाव भरा');
      return;
    }

    const newAbhang: Abhang = {
      id: `ua-${Date.now()}`,
      saint: saintValue,
      title: titleValue,
      content: contentValue,
      meaning: meaning.trim(),
      isUserAdded: true,
      createdAt: Date.now(),
    };

    addAbhang(newAbhang);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Saint selector */}
        <Text style={styles.label}>संत</Text>
        <View style={styles.saintsRow}>
          {SAINTS.map(s => (
            <TouchableOpacity
              key={s}
              style={[
                styles.saintChip,
                !useCustomSaint && saint === s && styles.saintChipActive,
              ]}
              onPress={() => {
                setSaint(s);
                setUseCustomSaint(false);
              }}
            >
              <Text
                style={[
                  styles.saintChipText,
                  !useCustomSaint && saint === s && styles.saintChipTextActive,
                ]}
              >
                {s.replace('संत ', '')}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.saintChip, useCustomSaint && styles.saintChipActive]}
            onPress={() => setUseCustomSaint(true)}
          >
            <Text style={[styles.saintChipText, useCustomSaint && styles.saintChipTextActive]}>
              इतर
            </Text>
          </TouchableOpacity>
        </View>

        {useCustomSaint && (
          <TextInput
            style={styles.input}
            value={customSaint}
            onChangeText={setCustomSaint}
            placeholder="संताचे नाव..."
            placeholderTextColor={colors.textFaint}
          />
        )}

        {/* Title */}
        <Text style={styles.label}>अभंग क्रमांक / नाव</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="उदा. १, २३५, विशेष अभंग..."
          placeholderTextColor={colors.textFaint}
          returnKeyType="next"
        />

        {/* Content */}
        <Text style={styles.label}>अभंग मजकूर</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={content}
          onChangeText={setContent}
          placeholder="अभंगाचा संपूर्ण मजकूर येथे लिहा..."
          placeholderTextColor={colors.textFaint}
          multiline
          textAlignVertical="top"
          returnKeyType="default"
        />

        {/* Meaning */}
        <Text style={styles.label}>अर्थ (ऐच्छिक)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={meaning}
          onChangeText={setMeaning}
          placeholder="या अभंगाचा अर्थ येथे लिहा..."
          placeholderTextColor={colors.textFaint}
          multiline
          textAlignVertical="top"
          returnKeyType="default"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>अभंग जतन करा</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: C.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: C.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
      marginTop: 16,
    },
    saintsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    saintChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: C.primary,
      backgroundColor: C.card,
    },
    saintChipActive: {
      backgroundColor: C.primary,
    },
    saintChipText: {
      fontSize: 14,
      color: C.primaryDark,
    },
    saintChipTextActive: {
      color: '#fff',
      fontWeight: '600',
    },
    input: {
      backgroundColor: C.card,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: C.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: C.text,
    },
    multiline: {
      minHeight: 120,
      paddingTop: 12,
      lineHeight: 24,
    },
    saveBtn: {
      marginTop: 28,
      backgroundColor: C.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    saveBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
  });
}
