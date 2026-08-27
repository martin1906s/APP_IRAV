import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ScreenShell } from '../templates/ScreenShell';
import { LogoMark } from '../molecules/LogoMark';
import { CountrySelect } from '../molecules/CountrySelect';
import { AppText } from '../atoms/AppText';
import { AppInput } from '../atoms/AppInput';
import { AppButton } from '../atoms/AppButton';
import { Spacer } from '../atoms/Spacer';
import { COUNTRIES } from '../../shared/constants/countries';
import { container } from '../../composition/container';
import { DEFAULT_PROFILE } from '../../domain/entities/UserProfile';
import { colors, fonts, spacing } from '../theme';

type Props = { onDone: () => void };

/** Primera vez: quién eres */
export function OnboardingScreen({ onDone }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('Ecuador');
  const [busy, setBusy] = useState(false);

  const ageNum = useMemo(() => Number(age), [age]);
  const valid = name.trim().length >= 2 && ageNum >= 10 && ageNum <= 99 && !!country;

  const save = async () => {
    if (!valid || busy) return;
    setBusy(true);
    const profile = {
      name: name.trim(),
      age: ageNum,
      country,
      ...DEFAULT_PROFILE,
      preferredVersionId:
        ageNum <= 13 ? 'PDT' : ageNum <= 17 ? 'NTV' : ageNum <= 25 ? 'NVI' : 'RV1960',
    };
    await container.saveProfile.execute(profile);
    container.ai.setProfile(profile);
    setBusy(false);
    onDone();
  };

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <LogoMark size={92} />
          <Spacer size="md" />
          <AppText variant="hero" style={styles.brandName}>
            IRAV
          </AppText>
          <AppText style={styles.sub}>Cuéntanos quién eres</AppText>
        </View>

        <AppText variant="caption">Nombre</AppText>
        <AppInput value={name} onChangeText={setName} placeholder="Tu nombre" autoCapitalize="words" />
        <Spacer size="sm" />

        <AppText variant="caption">Edad</AppText>
        <AppInput
          value={age}
          onChangeText={setAge}
          placeholder="Tu edad"
          keyboardType="number-pad"
          maxLength={2}
        />
        <Spacer size="sm" />

        <AppText variant="caption">País</AppText>
        <CountrySelect value={country} options={COUNTRIES} onChange={setCountry} />

        <Spacer size="xl" />
        <AppButton label="Continuar" onPress={save} disabled={!valid || busy} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  brand: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.md },
  brandName: { color: colors.accent },
  sub: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.textMuted,
  },
});
