import type { AiChatPort, AiInput } from '../../domain/ports/AiChatPort';

/** Caso de uso: voz → texto, separado de la respuesta del chat. */
export class TranscribeAudio {
  constructor(private readonly ai: AiChatPort) {}

  execute(audio: Extract<AiInput, { type: 'audio' }>) {
    return this.ai.transcribe(audio);
  }
}
