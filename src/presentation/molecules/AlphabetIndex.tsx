import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../atoms/AppText';
import { colors, fonts } from '../theme';

type Props = {
  keys: string[];
  activeKey?: string;
  onSelect: (key: string) => void;
};

/** Barra vertical de letras/números para saltar en listas */
export function AlphabetIndex({ keys, activeKey, onSelect }: Props) {
  if (!keys.length) return null;

  return (
    <View style={styles.rail}>
      {keys.map((key) => {
        const active = key === activeKey;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            hitSlop={4}
            style={[styles.item, active && styles.itemActive]}
          >
            <AppText style={[styles.label, active && styles.labelActive]}>{key}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    zIndex: 10,
  },
  item: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  itemActive: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.accent,
  },
});
