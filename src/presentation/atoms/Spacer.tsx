import { View } from 'react-native';
import { spacing } from '../theme';

type Props = { size?: keyof typeof spacing };

/** Átomo: espacio vertical */
export function Spacer({ size = 'md' }: Props) {
  return <View style={{ height: spacing[size] }} />;
}
