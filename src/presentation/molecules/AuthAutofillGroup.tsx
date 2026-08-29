import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  children: React.ReactNode;
};

const androidAutofillProps: Partial<ViewProps> =
  Platform.OS === 'android' ? ({ importantForAutofill: 'yes' } as ViewProps) : {};

/** Agrupa usuario/contraseña para el autofill del sistema (Google, iCloud, teclado). */
export function AuthAutofillGroup({ children, style, ...rest }: Props) {
  return (
    <View
      {...rest}
      {...androidAutofillProps}
      style={[styles.group, style]}
      accessibilityLabel="Credenciales IRAV"
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 0 },
});
