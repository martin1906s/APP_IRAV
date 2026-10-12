import { View, Text, StyleSheet, Image } from 'react-native';
import { Card } from '../Card';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  dayNumber: number;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl?: string;
};

export function EventCard({ dayNumber, title, subtitle, description, thumbnailUrl }: Props) {
  return (
    <Card style={styles.container}>
      <View style={styles.dateBadge}>
        <Text style={styles.badgeNumber}>{dayNumber}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      </View>

      {thumbnailUrl && (
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    gap: spacing.md,
  },
  dateBadge: {
    width: 44,
    height: 48,
    backgroundColor: colors.vellumDark,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 4,
    borderColor: colors.purple,
  },
  badgeNumber: {
    fontFamily: typography.title.fontFamily,
    fontSize: 20,
    color: colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.subtitle.fontFamily,
    fontSize: 16,
    color: colors.text,
  },
  subtitle: {
    fontFamily: typography.caption.fontFamily,
    color: colors.purple,
    fontSize: 12,
    marginBottom: 4,
  },
  description: {
    fontFamily: typography.bodySmall.fontFamily,
    color: colors.textMuted,
    fontSize: 12,
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});
