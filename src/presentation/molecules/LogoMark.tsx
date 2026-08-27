import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

type Props = { size?: number };

/** Molécula: marca IRAV */
export function LogoMark({ size = 96 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Image
        source={require('../../../assets/images/logo.jpeg')}
        style={{ width: size * 0.9, height: size * 0.9, borderRadius: size * 0.22 }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
