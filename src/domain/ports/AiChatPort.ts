export type AiInput =
  | { type: 'text'; text: string }
  | { type: 'audio'; uri: string; mimeType: string; base64: string };

/** Puerto: conversación con la IA */
export interface AiChatPort {
  reply(input: AiInput): Promise<string>;
  transcribe(audio: Extract<AiInput, { type: 'audio' }>): Promise<string>;
}
