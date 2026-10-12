import { StyleSheet, View } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';
import { AppText } from '../../atoms/AppText';
import { colors, radius, spacing } from '../../theme';
import { CHART_HEIGHT, CHART_PAD, CHART_WIDTH, chartInnerSize, niceMax, yTicks } from './chartUtils';

const MOOD_COLORS: Record<string, string> = {
  Feliz: colors.mint,
  Tranquilo: colors.sky,
  Triste: colors.coral,
  Ansioso: colors.lavender,
  Cansado: colors.textMuted,
  Agradecido: colors.gold,
  Confundido: colors.pink,
};

type Props = {
  data: Array<{ mood: string; count: number }>;
};

/** Barras verticales de distribución de ánimos */
export function MoodDistributionChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.title}>
          Ánimos por tipo
        </AppText>
        <AppText muted style={styles.empty}>
          Sin datos aún
        </AppText>
      </View>
    );
  }

  const max = niceMax(Math.max(...data.map((d) => d.count), 1));
  const ticks = yTicks(max);
  const inner = chartInnerSize();
  const gap = 10;
  const barWidth = Math.min(32, (inner.width - gap * (data.length - 1)) / data.length);

  return (
    <View style={styles.card}>
      <AppText variant="subtitle" style={styles.title}>
        Ánimos por tipo
      </AppText>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {ticks.map((tick, i) => {
          const y = CHART_PAD.top + (inner.height * i) / Math.max(ticks.length - 1, 1);
          return (
            <SvgText
              key={`tick-${i}-${tick}`}
              x={CHART_PAD.left - 6}
              y={y + 4}
              fontSize={10}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {tick}
            </SvgText>
          );
        })}

        {data.map((item, index) => {
          const barH = (item.count / max) * inner.height;
          const x = CHART_PAD.left + index * (barWidth + gap);
          const y = CHART_PAD.top + inner.height - barH;
          const label = item.mood.length > 7 ? `${item.mood.slice(0, 6)}…` : item.mood;

          return (
            <G key={item.mood}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, item.count > 0 ? 4 : 0)}
                rx={4}
                fill={MOOD_COLORS[item.mood] ?? colors.accent}
              />
              <SvgText
                x={x + barWidth / 2}
                y={CHART_HEIGHT - 8}
                fontSize={9}
                fill={colors.textMuted}
                textAnchor="middle"
              >
                {label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  title: {
    marginBottom: spacing.sm,
    textTransform: 'none',
    letterSpacing: 0,
  },
  empty: {
    paddingVertical: spacing.lg,
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
  },
});
