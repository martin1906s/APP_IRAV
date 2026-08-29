import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import { AppText } from '../atoms/AppText';
import { IconButton } from '../atoms/IconButton';
import { LogoMark } from '../molecules/LogoMark';

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  showLogo?: boolean;
};

export function AppHeader({
  title = 'IRAV',
  subtitle,
  onBack,
  right,
  showLogo = true,
}: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <IconButton
          name="arrow-back"
          onPress={onBack}
          size={20}
          bg={colors.surface}
          color={colors.text}
        />
      ) : showLogo ? (
        <LogoMark size={36} />
      ) : null}
      <View style={styles.text}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? (
          <AppText muted variant="body" style={styles.sub}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  text: { flex: 1 },
  sub: {
    marginTop: 4,
    fontSize: 14,
    textTransform: 'none',
    letterSpacing: 0,
  },
  right: { marginTop: 2 },
});
