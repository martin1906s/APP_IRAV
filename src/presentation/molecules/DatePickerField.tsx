import { StyleSheet, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../atoms/AppText';
import { colors, fonts, radius, spacing, typography } from '../theme';

type Props = {
  label?: string;
  value: string;
  onChange: (iso: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  variant?: 'boxed' | 'glass';
};

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = 'AAAA-MM-DD',
  variant = 'boxed',
}: Props) {
  const handleChange = (text: string) => {
    // Solo permitir números y guiones
    let cleaned = text.replace(/[^0-9]/g, '');
    
    // Auto-formato AAAA-MM-DD
    if (cleaned.length > 4 && cleaned.length <= 6) {
      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    } else if (cleaned.length > 6) {
      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 8);
    }

    onChange(cleaned);
  };

  const isGlass = variant === 'glass';

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="caption" style={[styles.label, isGlass && { color: 'rgba(255, 255, 255, 0.7)' }]}>
          {label}
        </AppText>
      ) : null}
      
      <View style={isGlass ? styles.triggerGlass : styles.trigger}>
        <TextInput
          style={[styles.input, isGlass && { color: '#fff' }]}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={isGlass ? 'rgba(255, 255, 255, 0.4)' : colors.textMuted}
          keyboardType="numeric"
          maxLength={10}
        />
        <Ionicons name="calendar-outline" size={20} color={isGlass ? 'rgba(255, 255, 255, 0.7)' : colors.accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  label: { color: colors.textMuted, marginBottom: spacing.xs },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  triggerGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
});
