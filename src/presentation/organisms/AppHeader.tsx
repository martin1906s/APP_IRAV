import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import { AppText } from '../atoms/AppText';
import { LogoMark } from '../molecules/LogoMark';
import { IconButton } from '../atoms/IconButton';

type Props = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  onBack?: () => void;
};

/** Organismo: cabecera */
export function AppHeader({ title = 'IRAV', subtitle, showLogo, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <IconButton name="arrow-back" onPress={onBack} size={20} bg={colors.accentSoft} color={colors.text} />
      ) : showLogo ? (
        <LogoMark size={44} />
      ) : null}
      <View style={styles.text}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? (
          <AppText muted variant="body" style={styles.sub}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  text: { flex: 1 },
  sub: {
    marginTop: 2,
    fontSize: 14,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
