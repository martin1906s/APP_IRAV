import { StyleSheet, TextInputProps, View } from 'react-native';
import { AppText } from '../atoms/AppText';
import { AppInput } from '../atoms/AppInput';
import { colors, spacing } from '../theme';

type FieldKind =
  | 'text'
  | 'name'
  | 'document'
  | 'documentNumeric'
  | 'identityDocument'
  | 'loginUsername'
  | 'loginPassword'
  | 'newPassword'
  | 'password'
  | 'phone'
  | 'email'
  | 'uuid';

type Props = Omit<TextInputProps, 'secureTextEntry' | 'autoCapitalize'> & {
  label: string;
  kind?: FieldKind;
};

const FIELD_CONFIG: Record<
  FieldKind,
  Pick<
    TextInputProps,
    | 'keyboardType'
    | 'secureTextEntry'
    | 'autoCapitalize'
    | 'autoComplete'
    | 'autoCorrect'
    | 'textContentType'
    | 'importantForAutofill'
    | 'passwordRules'
  >
> = {
  text: { autoCapitalize: 'sentences', importantForAutofill: 'yes' },
  name: { autoCapitalize: 'words', autoComplete: 'name', importantForAutofill: 'yes' },
  document: {
    autoCapitalize: 'characters',
    autoComplete: 'username',
    textContentType: 'username',
    importantForAutofill: 'yes',
    autoCorrect: false,
  },
  documentNumeric: {
    keyboardType: 'number-pad',
    autoComplete: 'username',
    textContentType: 'username',
    importantForAutofill: 'yes',
    autoCorrect: false,
  },
  identityDocument: {
    autoCapitalize: 'characters',
    autoComplete: 'off',
    importantForAutofill: 'no',
    autoCorrect: false,
  },
  loginUsername: {
    autoCapitalize: 'none',
    autoComplete: 'username',
    textContentType: 'username',
    importantForAutofill: 'yes',
    autoCorrect: false,
  },
  loginPassword: {
    secureTextEntry: true,
    autoComplete: 'current-password',
    textContentType: 'password',
    importantForAutofill: 'yes',
    autoCorrect: false,
  },
  newPassword: {
    secureTextEntry: true,
    autoComplete: 'new-password',
    textContentType: 'newPassword',
    importantForAutofill: 'yes',
    autoCorrect: false,
    passwordRules: 'minlength: 6;',
  },
  password: {
    secureTextEntry: true,
    autoComplete: 'current-password',
    textContentType: 'password',
    importantForAutofill: 'yes',
    autoCorrect: false,
  },
  phone: { keyboardType: 'phone-pad', autoComplete: 'tel', importantForAutofill: 'yes' },
  email: {
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoComplete: 'email',
    importantForAutofill: 'yes',
  },
  uuid: { autoCapitalize: 'none', autoComplete: 'off', autoCorrect: false },
};

/** Campo de formulario con etiqueta y teclado adecuado */
export function FormField({ label, kind = 'text', ...inputProps }: Props) {
  const config = FIELD_CONFIG[kind];

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <AppInput
        {...config}
        {...inputProps}
        keyboardType={inputProps.keyboardType ?? config.keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xs },
  label: { color: colors.textMuted, marginBottom: spacing.xs },
});
