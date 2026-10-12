import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type DayItem = {
  dayName: string;
  dayNumber: number;
  dateStr: string;
};

type Props = {
  days: DayItem[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
};

export function WeekCalendarStrip({ days, selectedDate, onSelectDate }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {days.map((d) => {
          const isSelected = d.dateStr === selectedDate;
          
          return (
            <Pressable 
              key={d.dateStr} 
              onPress={() => onSelectDate(d.dateStr)}
              style={[styles.dayItem, isSelected && styles.selectedItem]}
            >
              <Text style={[styles.dayName, isSelected && styles.selectedText]}>{d.dayName}</Text>
              <View style={[styles.numberContainer, isSelected && styles.selectedNumberContainer]}>
                <Text style={[styles.dayNumber, isSelected && styles.selectedNumber]}>{d.dayNumber}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.bgElevated,
    minWidth: 54,
  },
  selectedItem: {
    backgroundColor: colors.bgElevated,
  },
  dayName: {
    fontFamily: typography.caption.fontFamily,
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  selectedText: {
    color: colors.text,
  },
  numberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedNumberContainer: {
    backgroundColor: colors.purple,
  },
  dayNumber: {
    fontFamily: typography.subtitle.fontFamily,
    fontSize: 16,
    color: colors.text,
  },
  selectedNumber: {
    color: colors.textLight,
  },
});
