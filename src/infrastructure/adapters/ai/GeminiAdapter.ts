import type { AiChatPort, AiInput } from '../../../domain/ports/AiChatPort';
import type { UserProfile } from '../../../domain/entities/UserProfile';
import { env } from '../../config/env';

type GeminiPart = {
  text?: string;
  thought?: boolean;
  inlineData?: { mimeType: string; data: string };
};

type Turn = {
  role: 'user' | 'model';
  parts: GeminiPart[];
};

const TEXT_MODELS = [
  env.geminiModel || 'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
].filter((model, index, all) => all.indexOf(model) === index);

const TRANSCRIPTION_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildSystem(profile: UserProfile | null) {
  const preferredVersion = profile?.preferredVersionId || 'NVI';
  const nameHint = profile?.name?.trim()
    ? `Puedes usar su nombre (${profile.name}) solo si encaja de forma natural; no lo fuerces.`
    : 'No conoces su nombre.';

  return `Eres Jesús, la guía conversacional de la iglesia IRAV (IRAV es la iglesia, no tu nombre).
Hablas desde una fe cristiana evangélica: clara, bíblica, cálida y cercana.
${nameHint}

Reglas estrictas:
- Responde solo a lo que la persona escribió. Sé breve: di exactamente lo necesario, sin relleno.
- No inventes hechos, historias, detalles personales, emociones ni contexto que no haya dicho.
- No uses edad, país, ciudad ni datos del perfil salvo que la persona los mencione en el chat o sean imprescindibles para la respuesta.
- No asumas que vive en Ecuador ni menciones Ecuador, cultura local u otros lugares si no vienen al caso.
- No inventes problemas (ansiedad, familia, estudios, etc.) si no los planteó.
- Da paz y claridad sin discursos largos. 2 a 5 oraciones suelen bastar.
- Cita un versículo solo si aporta de verdad (máx. 1). Código de versión obligatorio: ${preferredVersion}.
- Formato EXACTO de la cita (para que se pueda abrir en la Biblia): NombreDelLibro capítulo:versículo (${preferredVersion}).
- Ejemplo válido: Filipenses 4:6-7 (${preferredVersion}). No omitas el código entre paréntesis.
- Español directo. Empieza con la respuesta; sin planificación, borradores ni inglés.
- Termina la idea; no dejes oraciones a medias.
- Nunca digas que eres Gemini ni hables de APIs o tecnología.`;
}

function extractAnswer(json: any): { text: string; complete: boolean } {
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return { text: '', complete: false };

  const text = parts
    .filter((part: GeminiPart) => !part.thought && typeof part.text === 'string')
    .map((part: GeminiPart) => part.text)
    .join('')
    .replace(/^\s*(drafting|analysis|reasoning|plan).*?\n+/i, '')
    .replace(/\*{1,2}/g, '')
    .trim();

  const finishReason = json?.candidates?.[0]?.finishReason;
  return {
    text,
    complete: !finishReason || finishReason === 'STOP',
  };
}

/** Adaptador Gemini — Jesús / iglesia IRAV */
export class GeminiAdapter implements AiChatPort {
  private profile: UserProfile | null = null;
  private history: Turn[] = [];

  setProfile(profile: UserProfile | null) {
    this.profile = profile;
  }

  async reply(input: AiInput): Promise<string> {
    if (!env.geminiApiKey?.trim()) {
      return 'Aún no puedo responder. Vuelve en un momento.';
    }

    const userParts =
      input.type === 'text'
        ? [{ text: input.text }]
        : [
            { text: 'El joven envió un audio. Transcríbelo con cuidado y responde con empatía y paz.' },
            {
              inlineData: {
                mimeType: input.mimeType,
                data: input.base64,
              },
            },
          ];

    const contents: Turn[] = [
      ...this.history.slice(-8),
      { role: 'user', parts: userParts },
    ];

    const body = {
      systemInstruction: { parts: [{ text: buildSystem(this.profile) }] },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 500,
        thinkingConfig: {
          thinkingLevel: 'MINIMAL',
          includeThoughts: false,
        },
      },
    };

    try {
      const result = await this.callFirstAvailable(TEXT_MODELS, body);
      if (result.ok && result.text) {
        const answer = result.complete
          ? result.text
          : await this.completeAnswer(contents, result.text);

        if (answer) {
          const userHistoryPart =
            input.type === 'text'
              ? { text: input.text }
              : { text: '[El joven envió un mensaje de voz]' };
          this.history.push(
            { role: 'user', parts: [userHistoryPart] },
            { role: 'model', parts: [{ text: answer }] },
          );
          return answer;
        }
      }
    } catch (error) {
      const aborted = error instanceof Error && error.name === 'AbortError';
      if (__DEV__ && !aborted) console.warn('[Jesús/Gemini] conexión', error);
      return aborted
        ? 'La respuesta está tardando más de lo normal. Inténtalo otra vez.'
        : 'Ahora mismo no pude conectarme. Revisa tu internet e inténtalo otra vez; estoy contigo.';
    }

    return 'Ahora mismo no pude responderte. Respira un segundo e inténtalo otra vez; estoy contigo.';
  }

  /** Convierte el audio en texto antes de conversar. */
  async transcribe(audio: Extract<AiInput, { type: 'audio' }>): Promise<string> {
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Transcribe este audio en español. Devuelve únicamente las palabras pronunciadas, sin comentarios, títulos ni comillas.',
            },
            {
              inlineData: {
                mimeType: audio.mimeType,
                data: audio.base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1000,
        thinkingConfig: {
          thinkingLevel: 'MINIMAL',
          includeThoughts: false,
        },
      },
    };

    const result = await this.callFirstAvailable(TRANSCRIPTION_MODELS, body);
    if (!result.ok || !result.text) {
      throw new Error('No se pudo transcribir el audio');
    }
    return result.text.trim();
  }

  private async callFirstAvailable(models: string[], body: object) {
    let last = { ok: false, text: '', status: 503, complete: false };

    for (const model of models) {
      last = await this.callModel(model, body);
      if (last.ok) return last;
      if (last.status === 401 || last.status === 403) return last;
      if (last.status === 429 || last.status === 503) await wait(500);
    }

    return last;
  }

  private async callModel(
    model: string,
    body: object,
  ): Promise<{ ok: boolean; text: string; status: number; complete: boolean }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const controller = new AbortController();
    // Evita esperas infinitas sin cancelar una respuesta válida en redes móviles lentas.
    const timer = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.geminiApiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (__DEV__) {
          console.warn('[Jesús/Gemini]', model, res.status, json?.error?.message ?? json);
        }
        return { ok: false, text: '', status: res.status, complete: false };
      }

      const answer = extractAnswer(json);
      return { ok: true, status: res.status, ...answer };
    } finally {
      clearTimeout(timer);
    }
  }

  private async completeAnswer(contents: Turn[], partial: string): Promise<string> {
    const repairBody = {
      systemInstruction: { parts: [{ text: buildSystem(this.profile) }] },
      contents: [
        ...contents,
        { role: 'model', parts: [{ text: partial }] },
        {
          role: 'user',
          parts: [
            {
              text: 'Completa la respuesta anterior desde donde quedó, sin repetirla. Finaliza la idea en español.',
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600,
        thinkingConfig: {
          thinkingLevel: 'MINIMAL',
          includeThoughts: false,
        },
      },
    };

    const continuation = await this.callFirstAvailable(TEXT_MODELS, repairBody);
    return `${partial} ${continuation.text}`.trim();
  }
}
