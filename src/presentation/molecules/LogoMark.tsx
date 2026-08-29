import { Image, StyleSheet } from 'react-native';

type Props = { size?: number };

/** Marca IRAV — imagen limpia, sin marco ni resplandor */
export function LogoMark({ size = 32 }: Props) {
  return (
    <Image
      source={require('../../../assets/images/IRAV.png')}
      style={[styles.img, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: 'transparent' },
});
