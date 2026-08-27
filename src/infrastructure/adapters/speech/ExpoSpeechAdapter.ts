import * as Speech from 'expo-speech';
import type { SpeechPort } from '../../../domain/ports/SpeechPort';

type VoicePick = {
  identifier: string;
  language: string;
  pitch: number;
};

const MALE_HINT =
  /(male|hombre|masculino|diego|juan|carlos|jorge|enrique|andres|andrés|reed|x-eed|x-esd|x-m\b|#male)/i;
const FEMALE_HINT =
  /(female|mujer|femenin|monica|mónica|paulina|penelope|penélope|sabina|lucia|lucía|sofia|sofía|x-eee|x-eef|x-esc|x-esa|x-esf|#female)/i;

function scoreVoice(name: string, identifier: string, language: string, quality: string) {
  const label = `${name} ${identifier}`;
  if (!/^es/i.test(language)) return -100;

  let score = 10;
  if (MALE_HINT.test(label)) score += 20;
  if (FEMALE_HINT.test(label)) score -= 30;
  if (/enhanced/i.test(quality)) score += 3;
  if (/es-?(es|mx|us|419)/i.test(language) || /es-?(es|mx|us)/i.test(label)) score += 2;
  return score;
}

function pickMaleSpanishVoice(
  voices: Awaited<ReturnType<typeof Speech.getAvailableVoicesAsync>>,
): VoicePick | null {
  const ranked = voices
    .map((voice) => ({
      voice,
      score: scoreVoice(voice.name, voice.identifier, voice.language, String(voice.quality ?? '')),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]?.voice;
  if (!best) return null;

  const explicitMale = MALE_HINT.test(`${best.name} ${best.identifier}`);
  return {
    identifier: best.identifier,
    language: best.language,
    // Si no hay etiqueta masculina clara, bajamos el tono para no sonar a mujer.
    pitch: explicitMale ? 0.92 : 0.72,
  };
}

/** Adaptador: TTS local inmediato con voz masculina en español. */
export class ExpoSpeechAdapter implements SpeechPort {
  private generation = 0;
  private cachedVoice: VoicePick | null | undefined;
  private voicePromise: Promise<VoicePick | null> | null = null;

  constructor() {
    // Precarga la voz para que la primera respuesta hable sin demora.
    void this.resolveVoice();
  }

  async speak(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const gen = ++this.generation;
    await Speech.stop();

    const voice = await this.resolveVoice();
    if (gen !== this.generation) return;

    await new Promise<void>((resolve) => {
      if (gen !== this.generation) {
        resolve();
        return;
      }

      Speech.speak(trimmed, {
        language: voice?.language ?? 'es-ES',
        voice: voice?.identifier,
        rate: 1,
        pitch: voice?.pitch ?? 0.72,
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: () => resolve(),
      });
    });
  }

  private resolveVoice() {
    if (this.cachedVoice !== undefined) {
      return Promise.resolve(this.cachedVoice);
    }
    if (!this.voicePromise) {
      this.voicePromise = Speech.getAvailableVoicesAsync()
        .then((voices) => {
          this.cachedVoice = pickMaleSpanishVoice(voices);
          return this.cachedVoice;
        })
        .catch(() => {
          this.cachedVoice = null;
          return null;
        });
    }
    return this.voicePromise;
  }

  async stop() {
    this.generation += 1;
    await Speech.stop();
  }
}
