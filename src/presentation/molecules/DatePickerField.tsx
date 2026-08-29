import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../atoms/AppText';
import { AppButton } from '../atoms/AppButton';
import {
  formatDateDisplay,
  formatDateISO,
  parseDateISO,
} from '../../shared/utils/dateFormat';
import { colors, fonts, radius, spacing } from '../theme';

type Props = {
  label?: string;
  value: string;
  onChange: (iso: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
};

/** Campo de fecha con calendario nativo */
export function DatePickerField({
  label,
  value,
  onChange,
  minimumDate = new Date(1900, 0, 1),
  maximumDate = new Date(),
  placeholder = 'Selecciona fecha',
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => parseDateISO(value));

  const openPicker = () => {
    setDraft(parseDateISO(value));
    setOpen(true);
  };

  const onAndroidChange = (_: DateTimePickerEvent, selected?: Date) => {
    setOpen(false);
    if (selected) onChange(formatDateISO(selected));
  };

  const confirmIOS = () => {
    onChange(formatDateISO(draft));
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Pressable style={styles.trigger} onPress={openPicker}>
        <AppText style={value ? styles.value : styles.placeholder}>
          {value ? formatDateDisplay(value) : placeholder}
        </AppText>
        <Ionicons name="calendar-outline" size={20} color={colors.accent} />
      </Pressable>

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={parseDateISO(value)}
          mode="date"
          display="calendar"
          onChange={onAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <AppText variant="subtitle" style={styles.sheetTitle}>
                Fecha de nacimiento
              </AppText>
              <DateTimePicker
                value={draft}
                mode="date"
                display="spinner"
                locale="es-EC"
                onChange={(_, selected) => {
                  if (selected) setDraft(selected);
                }}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.iosPicker}
              />
              <AppButton label="Confirmar" onPress={confirmIOS} />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  label: { color: colors.textMuted, marginBottom: spacing.xs },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  value: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.text,
    textTransform: 'none',
    letterSpacing: 0,
  },
  placeholder: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sheetTitle: { marginBottom: spacing.sm, textAlign: 'center' },
  iosPicker: { height: 200 },
});
