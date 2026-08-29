import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { AppText } from '../../atoms/AppText';
import { colors, radius, spacing } from '../../theme';
import { CHART_HEIGHT, CHART_PAD, CHART_WIDTH, chartInnerSize, niceMax, yTicks } from './chartUtils';

type Props = {
  data: Array<{ month: string; count: number }>;
};

function shortMonth(ym: string) {
  const [year, month] = ym.split('-');
  const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${names[Number(month) - 1] ?? month} '${year.slice(2)}`;
}

/** Nuevos jóvenes registrados por mes */
export function NewUsersChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.title}>
          Nuevos jóvenes
        </AppText>
        <AppText muted style={styles.empty}>
          Sin registros recientes
        </AppText>
      </View>
    );
  }

  const max = niceMax(Math.max(...data.map((d) => d.count), 1));
  const ticks = yTicks(max);
  const inner = chartInnerSize();
  const step = data.length > 1 ? inner.width / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const x = CHART_PAD.left + (data.length === 1 ? inner.width / 2 : step * index);
    const y = CHART_PAD.top + inner.height - (item.count / max) * inner.height;
    return { x, y, item };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${CHART_PAD.top + inner.height} L ${points[0].x} ${CHART_PAD.top + inner.height} Z`;

  return (
    <View style={styles.card}>
      <AppText variant="subtitle" style={styles.title}>
        Nuevos jóvenes (6 meses)
      </AppText>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {ticks.map((tick, i) => {
          const y = CHART_PAD.top + (inner.height * i) / Math.max(ticks.length - 1, 1);
          return (
            <G key={`tick-${i}-${tick}`}>
              <Line
                x1={CHART_PAD.left}
                y1={y}
                x2={CHART_PAD.left + inner.width}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
              />
              <SvgText
                x={CHART_PAD.left - 6}
                y={y + 4}
                fontSize={10}
                fill={colors.textMuted}
                textAnchor="end"
              >
                {tick}
              </SvgText>
            </G>
          );
        })}

        <Path d={areaPath} fill={colors.accentSoft} opacity={0.6} />
        <Path d={linePath} stroke={colors.accent} strokeWidth={2} fill="none" />

        {points.map((p) => (
          <G key={p.item.month}>
            <Circle cx={p.x} cy={p.y} r={4} fill={colors.accent} />
            <SvgText
              x={p.x}
              y={CHART_HEIGHT - 8}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor="middle"
            >
              {shortMonth(p.item.month)}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
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
