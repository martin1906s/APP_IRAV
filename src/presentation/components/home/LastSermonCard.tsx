import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  title: string;
  dateStr: string;
  thumbnailUrl?: string;
  onPress: () => void;
};

export function LastSermonCard({ title, dateStr, thumbnailUrl, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.container}>
        <View style={styles.thumbnailContainer}>
          {thumbnailUrl ? (
             <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder} />
          )}
          <View style={styles.playIconContainer}>
            <Ionicons name="play" size={16} color={colors.textLight} style={{ marginLeft: 2 }} />
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.dateStr}>{dateStr}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  thumbnailContainer: {
    width: 80,
    height: 60,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.vellumDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  playIconContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.subtitle.fontFamily,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  dateStr: {
    fontFamily: typography.caption.fontFamily,
    color: colors.textMuted,
  },
});
