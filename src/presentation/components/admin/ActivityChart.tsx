import { StyleSheet, View } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';
import { AppText } from '../../atoms/AppText';
import { colors, radius, spacing } from '../../theme';
import { CHART_HEIGHT, CHART_PAD, CHART_WIDTH, chartInnerSize, niceMax, yTicks } from './chartUtils';

type DayActivity = { date: string; moods: number; chats: number };

type Props = {
  data: DayActivity[];
};

function shortDate(iso: string) {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

/** Actividad diaria (ánimos + chat) últimos 7 días */
export function ActivityChart({ data }: Props) {
  const max = niceMax(Math.max(...data.map((d) => d.moods + d.chats), 1));
  const ticks = yTicks(max);
  const inner = chartInnerSize();
  const gap = 12;
  const barWidth = Math.min(28, (inner.width - gap * (data.length - 1)) / data.length);

  return (
    <View style={styles.card}>
      <AppText variant="subtitle" style={styles.title}>
        Actividad (7 días)
      </AppText>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.mint }]} />
          <AppText muted style={styles.legendText}>
            Ánimos
          </AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.sky }]} />
          <AppText muted style={styles.legendText}>
            Chat
          </AppText>
        </View>
      </View>
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

        {data.map((day, index) => {
          const total = day.moods + day.chats;
          const x = CHART_PAD.left + index * (barWidth + gap);
          const moodsH = (day.moods / max) * inner.height;
          const chatsH = (day.chats / max) * inner.height;
          const baseY = CHART_PAD.top + inner.height;

          return (
            <G key={day.date}>
              <Rect
                x={x}
                y={baseY - moodsH - chatsH}
                width={barWidth}
                height={Math.max(chatsH, day.chats > 0 ? 3 : 0)}
                rx={3}
                fill={colors.sky}
              />
              <Rect
                x={x}
                y={baseY - moodsH}
                width={barWidth}
                height={Math.max(moodsH, day.moods > 0 ? 3 : 0)}
                rx={3}
                fill={colors.mint}
              />
              <SvgText
                x={x + barWidth / 2}
                y={CHART_HEIGHT - 8}
                fontSize={9}
                fill={colors.textMuted}
                textAnchor="middle"
              >
                {shortDate(day.date)}
              </SvgText>
              {total === 0 ? (
                <SvgText
                  x={x + barWidth / 2}
                  y={baseY - 4}
                  fontSize={8}
                  fill={colors.textMuted}
                  textAnchor="middle"
                >
                  0
                </SvgText>
              ) : null}
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
    marginBottom: spacing.xs,
    textTransform: 'none',
    letterSpacing: 0,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontSize: 12,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
